create extension if not exists pgcrypto;

create type public.balance_bucket as enum (
  'free',
  'meal_benefit',
  'transport_benefit'
);

create type public.income_source as enum (
  'salary',
  'vr',
  'vt',
  'extra_income'
);

create type public.expense_nature as enum (
  'fixed',
  'variable',
  'credit_card',
  'investment'
);

create type public.commitment_type as enum (
  'credit_card_bill',
  'installment',
  'fixed_bill',
  'reserved_amount'
);

create type public.account_type as enum (
  'checking',
  'cash',
  'credit_card',
  'investment',
  'benefit'
);

create type public.category_kind as enum (
  'income',
  'expense',
  'investment'
);

create type public.transaction_direction as enum (
  'income',
  'expense'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  account_type public.account_type not null,
  balance_bucket public.balance_bucket not null default 'free',
  initial_balance_in_cents bigint not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint accounts_initial_balance_non_negative check (initial_balance_in_cents >= 0),
  constraint accounts_name_unique_per_user unique (user_id, name)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  kind public.category_kind not null,
  expense_nature public.expense_nature,
  color text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_name_unique_per_kind unique (user_id, name, kind),
  constraint categories_expense_nature_matches_kind check (
    (kind = 'expense' and expense_nature is not null)
    or (kind in ('income', 'investment') and expense_nature is null)
  )
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid references public.accounts (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  direction public.transaction_direction not null,
  amount_in_cents bigint not null,
  description text,
  occurred_on date not null,
  balance_bucket public.balance_bucket not null,
  income_source public.income_source,
  expense_nature public.expense_nature,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint transactions_amount_positive check (amount_in_cents > 0),
  constraint transactions_income_fields check (
    (direction = 'income' and income_source is not null and expense_nature is null)
    or (direction = 'expense' and income_source is null and expense_nature is not null)
  )
);

create table public.commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid references public.accounts (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  type public.commitment_type not null,
  amount_in_cents bigint not null,
  due_on date not null,
  description text,
  settled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint commitments_amount_positive check (amount_in_cents > 0)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_amount_in_cents bigint not null,
  current_amount_in_cents bigint not null default 0,
  deadline date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint goals_amounts_valid check (
    target_amount_in_cents > 0
    and current_amount_in_cents >= 0
    and current_amount_in_cents <= target_amount_in_cents
  ),
  constraint goals_name_unique_per_user unique (user_id, name)
);

create index accounts_user_id_idx on public.accounts (user_id);
create index categories_user_id_idx on public.categories (user_id);
create index transactions_user_id_occurred_on_idx on public.transactions (user_id, occurred_on desc);
create index transactions_user_id_bucket_idx on public.transactions (user_id, balance_bucket);
create index commitments_user_id_due_on_idx on public.commitments (user_id, due_on);
create index goals_user_id_idx on public.goals (user_id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger set_accounts_updated_at
before update on public.accounts
for each row
execute function public.set_updated_at();

create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

create trigger set_transactions_updated_at
before update on public.transactions
for each row
execute function public.set_updated_at();

create trigger set_commitments_updated_at
before update on public.commitments
for each row
execute function public.set_updated_at();

create trigger set_goals_updated_at
before update on public.goals
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.commitments enable row level security;
alter table public.goals enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "accounts_manage_own"
on public.accounts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "categories_manage_own"
on public.categories
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "transactions_manage_own"
on public.transactions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "commitments_manage_own"
on public.commitments
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "goals_manage_own"
on public.goals
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
