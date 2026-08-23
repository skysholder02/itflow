-- =============================================================================
-- STEP 5D.9 / Migration E: fiyro_restore_archived_vendor_account (G1 backend).
-- Archived -> Active restore for vendor accounts, Leader IT only.
-- Conventions match the STEP 5C lifecycle RPCs: SECURITY DEFINER, search_path
-- locked empty, fully qualified objects, server-side authorization only.
-- Q2 normalization rule used across lifecycle RPCs remains untouched:
--     expired  <=>  vendor_expiry_date::date < current_date
-- Errcodes: 42501 authorization, P0002 missing target,
--           22023 invalid argument, P0001 illegal state / concurrency.
-- Strict transition: Archived -> Active only. PendingApproval / Active /
-- Expired sources are rejected. On success only status and vendor_expiry_date
-- are written. Rejection history (reject_reason, whatsapp contact) is
-- intentionally preserved: restoring an account does not erase its past.
-- =============================================================================

create or replace function public.fiyro_restore_archived_vendor_account(
  target_user_id    uuid,
  p_new_expiry_date date
)
returns table (out_id uuid, out_status text, out_expiry date)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id     uuid;
  v_caller_role   text;
  v_target_role   text;
  v_target_status text;
begin
  v_caller_id := auth.uid();

  if v_caller_id is null then
    raise exception 'Fiyro restore archived: caller is not authenticated'
      using errcode = '42501';
  end if;

  select p.role
    into v_caller_role
    from public.profiles p
   where p.id = v_caller_id;

  if not found then
    raise exception 'Fiyro restore archived: caller profile not found'
      using errcode = '42501';
  end if;

  if v_caller_role <> 'leaderit' then
    raise exception 'Fiyro restore archived: only Leader IT may restore vendor accounts'
      using errcode = '42501';
  end if;

  if target_user_id is null then
    raise exception 'Fiyro restore archived: target user must be provided'
      using errcode = '22023';
  end if;

  if p_new_expiry_date is null then
    raise exception 'Fiyro restore archived: new expiry date must be provided'
      using errcode = '22023';
  end if;

  if p_new_expiry_date < current_date then
    raise exception 'Fiyro restore archived: new expiry date must not be earlier than today'
      using errcode = '22023';
  end if;

  select pr.role, pr.status
    into v_target_role, v_target_status
    from public.profiles pr
   where pr.id = target_user_id;

  if not found then
    raise exception 'Fiyro restore archived: target account does not exist'
      using errcode = 'P0002';
  end if;

  if v_target_role <> 'vendor' then
    raise exception 'Fiyro restore archived: target is not a vendor account'
      using errcode = 'P0001';
  end if;

  -- Strict transition guard: ONLY an Archived vendor may be restored.
  if v_target_status <> 'Archived' then
    raise exception
      'Fiyro restore archived: target must be an Archived vendor account (current status: %)',
      v_target_status
      using errcode = 'P0001';
  end if;

  update public.profiles
     set status = 'Active',
         vendor_expiry_date = p_new_expiry_date
   where id = target_user_id
     and role = 'vendor'
     and status = 'Archived';

  if not found then
    raise exception 'Fiyro restore archived: vendor changed concurrently'
      using errcode = 'P0001';
  end if;

  return query
  select pr.id, pr.status, pr.vendor_expiry_date::date
    from public.profiles pr
   where pr.id = target_user_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- EXECUTE privilege hardening, identical to STEP 5C Migration D conventions:
-- no PUBLIC, no anonymous access; authenticated + service_role only.
-- -----------------------------------------------------------------------------
revoke execute on function public.fiyro_restore_archived_vendor_account(uuid, date)
  from public;
revoke execute on function public.fiyro_restore_archived_vendor_account(uuid, date)
  from anon;
grant execute on function public.fiyro_restore_archived_vendor_account(uuid, date)
  to authenticated;
grant execute on function public.fiyro_restore_archived_vendor_account(uuid, date)
  to service_role;
