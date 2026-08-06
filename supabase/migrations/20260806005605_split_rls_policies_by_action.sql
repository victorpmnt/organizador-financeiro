begin;

-- Split generic FOR ALL policies into explicit action-based policies.
-- This keeps RLS aligned with the decision to avoid DELETE for authenticated users.

drop policy if exists "accounts_manage_own" on public.accounts;
create policy "accounts_select_own"
on public.accounts
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "accounts_insert_own"
on public.accounts
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "accounts_update_own"
on public.accounts
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "categories_manage_own" on public.categories;
create policy "categories_select_own"
on public.categories
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "categories_insert_own"
on public.categories
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "categories_update_own"
on public.categories
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "transactions_manage_own" on public.transactions;
create policy "transactions_select_own"
on public.transactions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "transactions_insert_own"
on public.transactions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "transactions_update_own"
on public.transactions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "commitments_manage_own" on public.commitments;
create policy "commitments_select_own"
on public.commitments
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "commitments_insert_own"
on public.commitments
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "commitments_update_own"
on public.commitments
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "goals_manage_own" on public.goals;
create policy "goals_select_own"
on public.goals
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "goals_insert_own"
on public.goals
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "goals_update_own"
on public.goals
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "monthly_plans_manage_own" on public.monthly_plans;
create policy "monthly_plans_select_own"
on public.monthly_plans
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "monthly_plans_insert_own"
on public.monthly_plans
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "monthly_plans_update_own"
on public.monthly_plans
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "monthly_plan_items_manage_own" on public.monthly_plan_items;
create policy "monthly_plan_items_select_own"
on public.monthly_plan_items
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "monthly_plan_items_insert_own"
on public.monthly_plan_items
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "monthly_plan_items_update_own"
on public.monthly_plan_items
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

commit;
