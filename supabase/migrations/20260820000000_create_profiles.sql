-- =============================================================================
-- Migration: 20260820000000_create_profiles
-- FIYRO (ITFlow) - Step 2: initial PostgreSQL schema for user profiles.
--
-- This migration creates a 1:1 application profile for every Supabase Auth
-- user (auth.users -> public.profiles). It does NOT:
--   - modify auth.users
--   - create or migrate application users
--   - seed demo accounts
--   - implement the full role-based RLS system (later step)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. profiles table
-- -----------------------------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  -- Email is kept unique at the application layer. auth.users already enforces
  -- uniqueness, but profiles.email may be populated from other sources during
  -- migration, so the constraint keeps the application schema consistent/safe.
  email               text not null unique,
  name                text not null,
  role                text not null check (role in ('karyawan', 'itsupport', 'leaderit', 'vendor')),
  department          text,
  status              text not null default 'PendingApproval'
                      check (status in ('Active', 'PendingApproval', 'Expired', 'Archived')),
  reject_reason       text,
  whatsapp            text,
  -- Basic vendor profile fields (full vendor tables come in a later step).
  vendor_company      text,
  vendor_pic          text,
  vendor_phone        text,
  vendor_worker_count integer check (vendor_worker_count is null or vendor_worker_count >= 0),
  vendor_expiry_date  timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Common query indexes (role/status lookups for dashboards and approvals).
create index profiles_role_idx   on public.profiles (role);
create index profiles_status_idx on public.profiles (status);

-- -----------------------------------------------------------------------------
-- 2. Automatic updated_at mechanism
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. Row Level Security (minimal safe baseline)
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- TEMPORARY baseline policies. These are intentionally minimal so profile data
-- is never publicly exposed once auth is wired in. They will be REPLACED by the
-- full role-based RLS design in a later step after all major tables exist.
-- No insert policy exists yet: profile creation will be handled in the auth
-- integration step (e.g. trigger on auth.users or application code).

-- Allow an authenticated user to read only their own profile.
create policy profiles_select_own
on public.profiles for select
using (auth.uid() = id);

-- Allow an authenticated user to update only their own profile.
create policy profiles_update_own
on public.profiles for update
using (auth.uid() = id);