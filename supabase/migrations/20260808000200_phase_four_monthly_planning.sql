begin;

alter table public.monthly_plan_items
  drop constraint if exists monthly_plan_items_expense_requires_category;

alter table public.monthly_plan_items
  add constraint monthly_plan_items_expense_requires_category check (
    kind = 'income'
    or category_id is not null
  );

grant delete on table public.monthly_plan_items to authenticated;

drop policy if exists "monthly_plan_items_delete_own" on public.monthly_plan_items;
create policy "monthly_plan_items_delete_own"
on public.monthly_plan_items
for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.upsert_monthly_plan(
  p_month date,
  p_minimum_free_reserve_in_cents bigint,
  p_notes text,
  p_items jsonb
)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_items jsonb := coalesce(p_items, '[]'::jsonb);
  v_plan public.monthly_plans;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if p_month <> date_trunc('month', p_month)::date then
    raise exception 'Monthly plans require the first day of the month.';
  end if;

  if p_minimum_free_reserve_in_cents < 0 then
    raise exception 'Minimum free reserve must be non-negative.';
  end if;

  if jsonb_typeof(v_items) <> 'array' then
    raise exception 'Monthly plan items must be a JSON array.';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(v_items) as item(
      expected_on date
    )
    where item.expected_on is not null
      and date_trunc('month', item.expected_on)::date <> p_month
  ) then
    raise exception 'Monthly plan item expected_on must stay inside the selected month.';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(v_items) as item(
      kind text,
      category_id uuid
    )
    where item.kind = 'expense'
      and item.category_id is null
  ) then
    raise exception 'Expense monthly plan items require a category.';
  end if;

  insert into public.monthly_plans (
    user_id,
    month,
    minimum_free_reserve_in_cents,
    notes
  )
  values (
    v_user_id,
    p_month,
    p_minimum_free_reserve_in_cents,
    nullif(btrim(p_notes), '')
  )
  on conflict (user_id, month)
  do update
  set
    minimum_free_reserve_in_cents = excluded.minimum_free_reserve_in_cents,
    notes = excluded.notes
  returning * into v_plan;

  delete from public.monthly_plan_items
  where user_id = v_user_id
    and monthly_plan_id = v_plan.id;

  insert into public.monthly_plan_items (
    user_id,
    monthly_plan_id,
    kind,
    balance_bucket,
    category_id,
    income_source,
    expense_nature,
    amount_in_cents,
    description,
    expected_on
  )
  select
    v_user_id,
    v_plan.id,
    item.kind::public.monthly_plan_item_kind,
    item.balance_bucket::public.balance_bucket,
    item.category_id,
    item.income_source::public.income_source,
    case
      when item.kind = 'expense' then category.expense_nature
      else null
    end,
    item.amount_in_cents,
    nullif(btrim(item.description), ''),
    item.expected_on
  from jsonb_to_recordset(v_items) as item(
    amount_in_cents bigint,
    balance_bucket text,
    category_id uuid,
    description text,
    expected_on date,
    income_source text,
    kind text
  )
  left join public.categories category
    on category.id = item.category_id
   and category.user_id = v_user_id;

  return jsonb_build_object(
    'plan',
    to_jsonb(v_plan),
    'items',
    coalesce(
      (
        select jsonb_agg(to_jsonb(item) order by item.expected_on nulls first, item.created_at)
        from public.monthly_plan_items item
        where item.user_id = v_user_id
          and item.monthly_plan_id = v_plan.id
      ),
      '[]'::jsonb
    )
  );
end;
$$;

revoke all on function public.upsert_monthly_plan(date, bigint, text, jsonb) from public, anon;
grant execute on function public.upsert_monthly_plan(date, bigint, text, jsonb) to authenticated;

comment on function public.upsert_monthly_plan(date, bigint, text, jsonb) is
'Atomically rewrites the full monthly planning snapshot for the authenticated user and month.';

commit;
