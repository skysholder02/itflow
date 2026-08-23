-- =============================================================================
-- STEP 5C / Migration B: RLS for vendor_extension_requests +
--                       profiles sensitive-column UPDATE hardening.
-- profiles SELECT policies are intentionally NOT modified (Q7 deferred).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- B.1 Helper: leader IT test.
-- SECURITY DEFINER so RLS policy expressions can query profiles without
-- same-table recursion. Created BEFORE any policy that references it.
-- -----------------------------------------------------------------------------
create or replace function public.fiyro_is_leaderit()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'leaderit'
  );
$$;

revoke execute on function public.fiyro_is_leaderit() from public;
revoke execute on function public.fiyro_is_leaderit() from anon;
grant execute on function public.fiyro_is_leaderit() to authenticated;
grant execute on function public.fiyro_is_leaderit() to service_role;

-- -----------------------------------------------------------------------------
-- B.2 vendor_extension_requests: direct access lockdown + read-only RLS.
-- New tables inherit broad Supabase default privileges, so they are revoked
-- explicitly. There are deliberately NO insert/update/delete policies:
-- every write goes through Migration C SECURITY DEFINER RPCs.
-- -----------------------------------------------------------------------------
revoke all privileges on table public.vendor_extension_requests from public;
revoke all privileges on table public.vendor_extension_requests from anon;
revoke all privileges on table public.vendor_extension_requests from authenticated;
grant select on table public.vendor_extension_requests to authenticated;
grant all privileges on table public.vendor_extension_requests to service_role;

alter table public.vendor_extension_requests enable row level security;

create policy ver_select_own
  on public.vendor_extension_requests
  for select
  to authenticated
  using (vendor_id = auth.uid());

create policy ver_select_leaderit
  on public.vendor_extension_requests
  for select
  to authenticated
  using (public.fiyro_is_leaderit());

-- -----------------------------------------------------------------------------
-- B.3 profiles sensitive-column hardening (Q4-adjusted).
-- Table-wide UPDATE is replaced by column-scoped self-service writes.
-- Lifecycle columns become unwritable by clients; all such mutations are
-- RPC-only. whatsapp remains self-service contact data per Q4.
-- -----------------------------------------------------------------------------
revoke update on table public.profiles from authenticated;
grant update (name, whatsapp) on table public.profiles to authenticated;

-- Legacy duplicate policy removal. Safe: "Users can update own profile"
-- (roles = authenticated) continues to govern self-updates; anon never had an
-- UPDATE grant on profiles.
drop policy if exists profiles_update_own on public.profiles;
