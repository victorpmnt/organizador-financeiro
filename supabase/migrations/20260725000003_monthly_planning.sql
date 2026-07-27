-- Monthly planning stores expectations only. Confirmed money movement remains
-- exclusively in transactions, and future obligations remain in commitments.

begin;

create type public.monthly_plan_item_kind as enum (
  'income',
  'expense'
);

create table public.monthly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month date not null,
  minimum_free_reserve_in_cents bigint not null default 0,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint monthly_plans_month_is_first_day check (
    month = date_trunc('month', month)::date
  ),
  constraint monthly_plans_minimum_reserve_non_negative check (
    minimum_free_reserve_in_cents >= 0
  ),
  constraint monthly_plans_user_month_unique unique (user_id, month),
  constraint monthly_plans_id_user_id_unique unique (id, user_id)
);

create table public.monthly_plan_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  monthly_plan_id uuid not null,
  kind public.monthly_plan_item_kind not null,
  balance_bucket public.balance_bucket not null,
  category_id uuid,
  income_source public.income_source,
  expense_nature public.expense_nature,
  amount_in_cents bigint not null,
  description text,
  expected_on date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint monthly_plan_items_amount_positive check (amount_in_cents > 0),
  constraint monthly_plan_items_fields_match_kind check (
    (
      kind = 'income'
      and income_source is not null
      and expense_nature is null
    )
    or (
      kind = 'expense'
      and income_source is null
      and expense_nature is not null
    )
  ),
  constraint monthly_plan_items_income_source_matches_bucket check (
    kind = 'expense'
    or (income_source in ('salary', 'extra_income') and balance_bucket = 'free')
    or (income_source = 'vr' and balance_bucket = 'meal_benefit')
    or (income_source = 'vt' and balance_bucket = 'transport_benefit')
  ),
  constraint monthly_plan_items_credit_uses_free_bucket check (
    expense_nature <> 'credit_card'
    or balance_bucket = 'free'
  ),
  constraint monthly_plan_items_plan_belongs_to_user
    foreign key (monthly_plan_id, user_id)
    references public.monthly_plans (id, user_id)
    on delete cascade,
  constraint monthly_plan_items_category_belongs_to_user
    foreign key (category_id, user_id)
    references public.categories (id, user_id)
    on delete set null (category_id)
);

create index monthly_plans_user_id_month_idx
on public.monthly_plans (user_id, month desc);

create index monthly_plan_items_plan_id_idx
on public.monthly_plan_items (monthly_plan_id);

create index monthly_plan_items_user_bucket_idx
on public.monthly_plan_items (user_id, balance_bucket);

create trigger set_monthly_plans_updated_at
before update on public.monthly_plans
for each row
execute function public.set_updated_at();

create trigger set_monthly_plan_items_updated_at
before update on public.monthly_plan_items
for each row
execute function public.set_updated_at();

alter table public.monthly_plans enable row level security;
alter table public.monthly_plan_items enable row level security;

create policy "monthly_plans_manage_own"
on public.monthly_plans
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "monthly_plan_items_manage_own"
on public.monthly_plan_items
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

comment on table public.monthly_plans is
'One planning context per user and month. It does not represent confirmed money.';

comment on table public.monthly_plan_items is
'Expected income and expense lines used to compare planned and actual values.';

comment on column public.monthly_plans.minimum_free_reserve_in_cents is
'Safety reserve deducted when calculating the safe credit limit for this month.';

commit;
