begin;

create schema if not exists app_private;

revoke all on schema app_private from public, anon, authenticated;

create or replace function app_private.set_profile_email_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  auth_email text;
begin
  select u.email
  into auth_email
  from auth.users as u
  where u.id = new.id;

  if auth_email is null then
    raise exception 'profiles.email must mirror auth.users.email for user %', new.id;
  end if;

  new.email := auth_email;
  return new;
end;
$$;

create or replace function app_private.sync_profile_email_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

revoke execute on function app_private.set_profile_email_from_auth_user() from public, anon, authenticated, service_role;
revoke execute on function app_private.sync_profile_email_from_auth_user() from public, anon, authenticated, service_role;

update public.profiles as p
set email = u.email
from auth.users as u
where u.id = p.id
  and p.email is distinct from u.email;

drop trigger if exists set_profiles_email_from_auth_user on public.profiles;
create trigger set_profiles_email_from_auth_user
before insert or update on public.profiles
for each row
execute function app_private.set_profile_email_from_auth_user();

drop trigger if exists sync_profile_email_from_auth_user on auth.users;
create trigger sync_profile_email_from_auth_user
after insert or update of email on auth.users
for each row
execute function app_private.sync_profile_email_from_auth_user();

commit;
