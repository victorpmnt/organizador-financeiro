begin;

-- Public schema objects must be exposed intentionally.
-- Grants decide whether a role can reach an object via the Data API.
-- RLS then decides which rows the role may access.

alter default privileges for role postgres in schema public
revoke select, insert, update, delete on tables from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
revoke usage, select on sequences from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
revoke execute on functions from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
revoke execute on functions from public;

-- Reset current exposure for Data API roles on business tables.
revoke all on table public.profiles from anon, authenticated, service_role;
revoke all on table public.accounts from anon, authenticated, service_role;
revoke all on table public.categories from anon, authenticated, service_role;
revoke all on table public.transactions from anon, authenticated, service_role;
revoke all on table public.commitments from anon, authenticated, service_role;
revoke all on table public.goals from anon, authenticated, service_role;
revoke all on table public.monthly_plans from anon, authenticated, service_role;
revoke all on table public.monthly_plan_items from anon, authenticated, service_role;

-- No client role should call this trigger helper directly.
revoke execute on function public.set_updated_at() from public, anon, authenticated, service_role;

-- Authenticated users may operate only on the product tables required by the app.
grant select, insert, update on table public.profiles to authenticated;

grant select, insert, update on table public.accounts to authenticated;
grant select, insert, update on table public.categories to authenticated;
grant select, insert, update on table public.transactions to authenticated;
grant select, insert, update on table public.commitments to authenticated;
grant select, insert, update on table public.goals to authenticated;
grant select, insert, update on table public.monthly_plans to authenticated;
grant select, insert, update on table public.monthly_plan_items to authenticated;

-- Service role remains explicitly allowed for backend and operational use.
grant select, insert, update, delete on table public.profiles to service_role;
grant select, insert, update, delete on table public.accounts to service_role;
grant select, insert, update, delete on table public.categories to service_role;
grant select, insert, update, delete on table public.transactions to service_role;
grant select, insert, update, delete on table public.commitments to service_role;
grant select, insert, update, delete on table public.goals to service_role;
grant select, insert, update, delete on table public.monthly_plans to service_role;
grant select, insert, update, delete on table public.monthly_plan_items to service_role;

commit;
