-- =============================================================================
-- Migration: 20260820010000_create_auth_profile_trigger
-- FIYRO (ITFlow) - Step 3: Supabase Auth -> profiles synchronization foundation.
--
-- Creates a PostgreSQL function + trigger so that whenever a new row is
-- inserted into auth.users, a matching row is automatically created in
-- public.profiles (auth.users.id = public.profiles.id).
--
-- This migration does NOT:
--   - modify auth.users data (only attaches an AFTER INSERT trigger)
--   - modify the Step 2 profiles schema
--   - create demo accounts or migrate existing users
--   - connect the React app to Supabase Auth
--
-- The existing updated_at mechanism from Step 2
-- (public.set_updated_at + profiles_set_updated_at) is reused; no duplicate
-- trigger is created here.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Profile creation function
-- -----------------------------------------------------------------------------
-- SECURITY DECISION:
-- The function runs with SECURITY DEFINER (owner = postgres) so the trigger
-- can write to public.profiles even though normal users have no INSERT policy
-- (RLS is enabled). As the table owner, postgres bypasses RLS on profiles.
-- `set search_path = public` prevents search-path hijacking.
-- EXECUTE is revoked from PUBLIC and granted only to the auth trigger role
-- (supabase_auth_admin) and service_role, so clients cannot invoke this
-- function directly to forge arbitrary profiles.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta           jsonb := new.raw_user_meta_data;
  v_name         text;
  v_role         text;
  v_worker_count integer;
  v_expiry_date  timestamptz;
begin
  -- name: prefer metadata, otherwise fall back to the email local-part.
  v_name := coalesce(
    nullif(meta ->> 'name', ''),
    split_part(new.email, '@', 1),
    'New User'
  );

  -- role: accept only the four allowed application roles; anything missing or
  -- invalid falls back to the default 'karyawan'.
  if meta ->> 'role' in ('karyawan', 'itsupport', 'leaderit', 'vendor') then
    v_role := meta ->> 'role';
  else
    v_role := 'karyawan';
  end if;

  -- vendor_worker_count / vendor_expiry_date are user-supplied text; cast them
  -- safely so malformed metadata never aborts profile creation.
  begin
    v_worker_count := nullif(meta ->> 'vendor_worker_count', '')::integer;
  exception
    when others then
      v_worker_count := null;
  end;

  begin
    v_expiry_date := nullif(meta ->> 'vendor_expiry_date', '')::timestamptz;
  exception
    when others then
      v_expiry_date := null;
  end;

  insert into public.profiles (
    id,
    email,
    name,
    role,
    department,
    status,
    reject_reason,
    whatsapp,
    vendor_company,
    vendor_pic,
    vendor_phone,
    vendor_worker_count,
    vendor_expiry_date
  )
  values (
    new.id,
    new.email,
    v_name,
    v_role,
    nullif(meta ->> 'department', ''),
    'PendingApproval',
    null,
    nullif(meta ->> 'whatsapp', ''),
    case when v_role = 'vendor' then nullif(meta ->> 'vendor_company', '') else null end,
    case when v_role = 'vendor' then nullif(meta ->> 'vendor_pic', '') else null end,
    case when v_role = 'vendor' then nullif(meta ->> 'vendor_phone', '') else null end,
    case when v_role = 'vendor' then v_worker_count else null end,
    case when v_role = 'vendor' then v_expiry_date else null end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. Trigger on auth.users
-- -----------------------------------------------------------------------------
-- Drop first only if this same trigger already exists (idempotent re-run).
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 3. Function execution privileges
-- -----------------------------------------------------------------------------
revoke execute on function public.handle_new_user() from public;
grant execute on function public.handle_new_user() to supabase_auth_admin, service_role;