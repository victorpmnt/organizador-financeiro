-- Tighten the initial schema around bucket ownership, deferred credit expenses,
-- commitment settlement, and tenant-safe relationships.

begin;

alter table public.accounts
add constraint accounts_id_user_id_unique unique (id, user_id);

alter table public.categories
add constraint categories_id_user_id_unique unique (id, user_id);

alter table public.transactions
add constraint transactions_id_user_id_unique unique (id, user_id);

alter table public.accounts
add constraint accounts_type_matches_bucket check (
  (account_type = 'benefit' and balance_bucket in ('meal_benefit', 'transport_benefit'))
  or (account_type <> 'benefit' and balance_bucket = 'free')
);

alter table public.transactions
add column affects_balance boolean generated always as (
  direction = 'income'
  or expense_nature is distinct from 'credit_card'::public.expense_nature
) stored;

alter table public.transactions
add constraint transactions_income_source_matches_bucket check (
  direction = 'expense'
  or (income_source in ('salary', 'extra_income') and balance_bucket = 'free')
  or (income_source = 'vr' and balance_bucket = 'meal_benefit')
  or (income_source = 'vt' and balance_bucket = 'transport_benefit')
);

alter table public.transactions
add constraint transactions_deferred_expense_uses_free_bucket check (
  expense_nature <> 'credit_card'
  or balance_bucket = 'free'
);

alter table public.transactions
add constraint transactions_account_belongs_to_user
foreign key (account_id, user_id)
references public.accounts (id, user_id)
on delete set null (account_id);

alter table public.transactions
add constraint transactions_category_belongs_to_user
foreign key (category_id, user_id)
references public.categories (id, user_id)
on delete set null (category_id);

alter table public.commitments
add column balance_bucket public.balance_bucket not null default 'free',
add column source_transaction_id uuid,
add column settlement_transaction_id uuid;

alter table public.commitments
add constraint commitments_restricted_types_use_free_bucket check (
  type not in ('credit_card_bill', 'installment', 'fixed_bill')
  or balance_bucket = 'free'
);

alter table public.commitments
add constraint commitments_settlement_is_complete check (
  (settled_at is null and settlement_transaction_id is null)
  or (settled_at is not null and settlement_transaction_id is not null)
);

alter table public.commitments
add constraint commitments_account_belongs_to_user
foreign key (account_id, user_id)
references public.accounts (id, user_id)
on delete set null (account_id);

alter table public.commitments
add constraint commitments_category_belongs_to_user
foreign key (category_id, user_id)
references public.categories (id, user_id)
on delete set null (category_id);

alter table public.commitments
add constraint commitments_source_transaction_belongs_to_user
foreign key (source_transaction_id, user_id)
references public.transactions (id, user_id)
on delete restrict;

alter table public.commitments
add constraint commitments_settlement_transaction_belongs_to_user
foreign key (settlement_transaction_id, user_id)
references public.transactions (id, user_id)
on delete restrict;

create index transactions_user_id_affects_balance_idx
on public.transactions (user_id, affects_balance, occurred_on desc);

create index commitments_user_id_bucket_due_on_idx
on public.commitments (user_id, balance_bucket, due_on)
where settled_at is null;

create index commitments_source_transaction_id_idx
on public.commitments (source_transaction_id)
where source_transaction_id is not null;

create index commitments_settlement_transaction_id_idx
on public.commitments (settlement_transaction_id)
where settlement_transaction_id is not null;

comment on column public.transactions.affects_balance is
'Derived flag: credit-card purchases are expenses but do not move cash until their commitment is settled.';

comment on column public.commitments.source_transaction_id is
'Optional expense that originated this future commitment, such as a credit-card purchase.';

comment on column public.commitments.settlement_transaction_id is
'Confirmed expense transaction that paid this commitment and reduced its balance bucket.';

commit;
