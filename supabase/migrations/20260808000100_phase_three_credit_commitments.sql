begin;

do $$
begin
  if exists (
    select 1
    from public.accounts
    where account_type = 'investment'
  ) then
    raise exception 'Existing investment accounts must be migrated manually before phase 3.';
  end if;
end
$$;

alter type public.account_type rename to account_type_legacy;

create type public.account_type as enum (
  'debit',
  'credit',
  'vr',
  'vt'
);

alter table public.accounts
  add column credit_limit_in_cents bigint,
  add column statement_due_day integer;

alter table public.accounts
  drop constraint if exists accounts_type_matches_bucket;

alter table public.accounts
  alter column account_type type public.account_type
  using (
    case
      when account_type::text in ('checking', 'cash') then 'debit'
      when account_type::text = 'credit_card' then 'credit'
      when account_type::text = 'benefit' and balance_bucket = 'meal_benefit' then 'vr'
      when account_type::text = 'benefit' and balance_bucket = 'transport_benefit' then 'vt'
      else null
    end
  )::public.account_type;

drop type public.account_type_legacy;

alter table public.accounts
  add constraint accounts_type_matches_bucket check (
    (account_type = 'vr' and balance_bucket = 'meal_benefit')
    or (account_type = 'vt' and balance_bucket = 'transport_benefit')
    or (account_type in ('debit', 'credit') and balance_bucket = 'free')
  ),
  add constraint accounts_credit_card_fields check (
    (
      account_type = 'credit'
      and credit_limit_in_cents is not null
      and credit_limit_in_cents > 0
      and statement_due_day is not null
      and statement_due_day between 1 and 31
    )
    or (
      account_type <> 'credit'
      and credit_limit_in_cents is null
      and statement_due_day is null
    )
  );

alter table public.commitments
  add column logical_group_id uuid,
  add column installment_number integer,
  add column installment_count integer;

alter table public.commitments
  add constraint commitments_installment_shape check (
    (
      logical_group_id is null
      and installment_number is null
      and installment_count is null
    )
    or (
      logical_group_id is not null
      and installment_number is not null
      and installment_count is not null
      and installment_number >= 1
      and installment_count >= 1
      and installment_number <= installment_count
    )
  );

create index commitments_logical_group_id_idx
on public.commitments (user_id, logical_group_id, installment_number)
where logical_group_id is not null;

create or replace function public.resolve_due_date(
  base_date date,
  due_day integer,
  month_offset integer default 0
)
returns date
language plpgsql
security invoker
set search_path = public
as $$
declare
  target_month_start date;
  target_month_end date;
  target_day integer;
begin
  target_month_start :=
    (date_trunc('month', base_date)::date + make_interval(months => month_offset))::date;
  target_month_end := (target_month_start + interval '1 month - 1 day')::date;
  target_day := least(
    due_day,
    extract(day from target_month_end)::integer
  );

  return make_date(
    extract(year from target_month_start)::integer,
    extract(month from target_month_start)::integer,
    target_day
  );
end;
$$;

create or replace function public.create_credit_card_purchase(
  p_account_id uuid,
  p_amount_in_cents bigint,
  p_category_id uuid,
  p_description text,
  p_installment_count integer,
  p_occurred_on date
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid;
  v_account public.accounts%rowtype;
  v_category public.categories%rowtype;
  v_transaction public.transactions%rowtype;
  v_due_day integer;
  v_first_due_on date;
  v_group_id uuid := gen_random_uuid();
  v_base_amount bigint;
  v_remainder bigint;
  v_commitment_amount bigint;
  v_commitment_type public.commitment_type;
  v_commitments jsonb := '[]'::jsonb;
  v_installment integer;
  v_commitment public.commitments%rowtype;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if p_amount_in_cents <= 0 then
    raise exception 'Amount must be positive.';
  end if;

  if p_installment_count < 1 then
    raise exception 'Installment count must be at least 1.';
  end if;

  select *
  into v_account
  from public.accounts
  where id = p_account_id
    and user_id = v_user_id;

  if not found then
    raise exception 'Credit account not found.';
  end if;

  if v_account.account_type <> 'credit' then
    raise exception 'The selected account is not a credit account.';
  end if;

  select *
  into v_category
  from public.categories
  where id = p_category_id
    and user_id = v_user_id;

  if not found then
    raise exception 'Expense category not found.';
  end if;

  if v_category.kind <> 'expense' then
    raise exception 'Credit card purchases require an expense category.';
  end if;

  insert into public.transactions (
    user_id,
    account_id,
    category_id,
    direction,
    amount_in_cents,
    description,
    occurred_on,
    balance_bucket,
    income_source,
    expense_nature
  )
  values (
    v_user_id,
    v_account.id,
    v_category.id,
    'expense',
    p_amount_in_cents,
    nullif(btrim(p_description), ''),
    p_occurred_on,
    'free',
    null,
    'credit_card'
  )
  returning *
  into v_transaction;

  v_due_day := v_account.statement_due_day;
  v_first_due_on := public.resolve_due_date(
    p_occurred_on,
    v_due_day,
    case
      when extract(day from p_occurred_on)::integer <= v_due_day then 0
      else 1
    end
  );
  v_base_amount := p_amount_in_cents / p_installment_count;
  v_remainder := p_amount_in_cents % p_installment_count;
  v_commitment_type := case when p_installment_count = 1 then 'credit_card_bill' else 'installment' end;

  for v_installment in 1..p_installment_count loop
    v_commitment_amount := v_base_amount + case when v_installment <= v_remainder then 1 else 0 end;

    insert into public.commitments (
      user_id,
      account_id,
      category_id,
      type,
      amount_in_cents,
      due_on,
      description,
      balance_bucket,
      source_transaction_id,
      logical_group_id,
      installment_number,
      installment_count
    )
    values (
      v_user_id,
      v_account.id,
      v_category.id,
      v_commitment_type,
      v_commitment_amount,
      public.resolve_due_date(v_first_due_on, v_due_day, v_installment - 1),
      nullif(btrim(p_description), ''),
      'free',
      v_transaction.id,
      v_group_id,
      v_installment,
      p_installment_count
    )
    returning *
    into v_commitment;

    v_commitments := v_commitments || to_jsonb(v_commitment);
  end loop;

  return jsonb_build_object(
    'transaction', to_jsonb(v_transaction),
    'commitments', v_commitments
  );
end;
$$;

create or replace function public.pay_commitments(
  p_commitment_ids uuid[],
  p_paying_account_id uuid,
  p_description text,
  p_occurred_on date
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid;
  v_paying_account public.accounts%rowtype;
  v_total_amount bigint;
  v_selected_count integer;
  v_payment_transaction public.transactions%rowtype;
  v_commitments jsonb;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if coalesce(array_length(p_commitment_ids, 1), 0) = 0 then
    raise exception 'At least one commitment must be selected.';
  end if;

  select *
  into v_paying_account
  from public.accounts
  where id = p_paying_account_id
    and user_id = v_user_id;

  if not found then
    raise exception 'Paying account not found.';
  end if;

  if v_paying_account.account_type = 'credit' or v_paying_account.balance_bucket <> 'free' then
    raise exception 'Credit card payments must use a free-bucket non-credit account.';
  end if;

  select
    count(*),
    coalesce(sum(amount_in_cents), 0)
  into v_selected_count, v_total_amount
  from public.commitments
  where user_id = v_user_id
    and id = any(p_commitment_ids)
    and settled_at is null;

  if v_selected_count <> array_length(p_commitment_ids, 1) then
    raise exception 'One or more commitments are invalid or already settled.';
  end if;

  insert into public.transactions (
    user_id,
    account_id,
    category_id,
    direction,
    amount_in_cents,
    description,
    occurred_on,
    balance_bucket,
    income_source,
    expense_nature
  )
  values (
    v_user_id,
    v_paying_account.id,
    null,
    'expense',
    v_total_amount,
    nullif(btrim(p_description), ''),
    p_occurred_on,
    v_paying_account.balance_bucket,
    null,
    'fixed'
  )
  returning *
  into v_payment_transaction;

  update public.commitments
  set
    settled_at = timezone('utc', now()),
    settlement_transaction_id = v_payment_transaction.id
  where user_id = v_user_id
    and id = any(p_commitment_ids)
    and settled_at is null;

  select coalesce(jsonb_agg(to_jsonb(commitment_row) order by commitment_row.due_on, commitment_row.created_at), '[]'::jsonb)
  into v_commitments
  from (
    select *
    from public.commitments
    where user_id = v_user_id
      and id = any(p_commitment_ids)
  ) as commitment_row;

  return jsonb_build_object(
    'transaction', to_jsonb(v_payment_transaction),
    'commitments', v_commitments
  );
end;
$$;

grant execute on function public.resolve_due_date(date, integer, integer) to authenticated;
grant execute on function public.create_credit_card_purchase(uuid, bigint, uuid, text, integer, date) to authenticated;
grant execute on function public.pay_commitments(uuid[], uuid, text, date) to authenticated;

commit;
