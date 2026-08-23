-- =============================================================================
-- STEP 5C / Migration C: vendor lifecycle RPCs (five functions).
-- Conventions: SECURITY DEFINER, search_path locked empty, fully qualified
-- objects. Errcodes: 42501 authorization, P0002 missing target,
-- 22023 invalid argument, P0001 illegal state / concurrency / duplicate.
-- Q2 normalization rule used everywhere:
--     expired  <=>  vendor_expiry_date::date < current_date
--     (expiry date = today is still valid today)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- C.1 fiyro_change_vendor_expiry: Active -> Active (vendor_expiry_date only).
-- -----------------------------------------------------------------------------
create or replace function public.fiyro_change_vendor_expiry(
  target_user_id    uuid,
  p_new_expiry_date date
)
returns table (out_id uuid, out_status text, out_expiry date)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id   uuid;
  v_caller_role text;
begin
  v_caller_id := auth.uid();

  if v_caller_id is null then
    raise exception 'Fiyro expiry change: caller is not authenticated'
      using errcode = '42501';
  end if;

  select p.role
    into v_caller_role
    from public.profiles p
   where p.id = v_caller_id;

  if not found then
    raise exception 'Fiyro expiry change: caller profile not found'
      using errcode = '42501';
  end if;

  if v_caller_role <> 'leaderit' then
    raise exception 'Fiyro expiry change: only Leader IT may change vendor expiry'
      using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles pr where pr.id = target_user_id
  ) then
    raise exception 'Fiyro expiry change: target account does not exist'
      using errcode = 'P0002';
  end if;

  if p_new_expiry_date is null then
    raise exception 'Fiyro expiry change: expiry date must be provided'
      using errcode = '22023';
  end if;

  if p_new_expiry_date < current_date then
    raise exception 'Fiyro expiry change: expiry date must not be earlier than today'
      using errcode = '22023';
  end if;

  update public.profiles
     set vendor_expiry_date = p_new_expiry_date
   where id = target_user_id
     and role = 'vendor'
     and status = 'Active';

  if not found then
    raise exception 'Fiyro expiry change: target must be an Active vendor account'
      using errcode = 'P0001';
  end if;

  return query
  select pr.id, pr.status, pr.vendor_expiry_date::date
    from public.profiles pr
   where pr.id = target_user_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- C.2 fiyro_reactivate_vendor_account: Expired -> Active (two fields only).
-- -----------------------------------------------------------------------------
create or replace function public.fiyro_reactivate_vendor_account(
  target_user_id    uuid,
  p_new_expiry_date date
)
returns table (out_id uuid, out_status text, out_expiry date)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id   uuid;
  v_caller_role text;
begin
  v_caller_id := auth.uid();

  if v_caller_id is null then
    raise exception 'Fiyro reactivate: caller is not authenticated'
      using errcode = '42501';
  end if;

  select p.role
    into v_caller_role
    from public.profiles p
   where p.id = v_caller_id;

  if not found then
    raise exception 'Fiyro reactivate: caller profile not found'
      using errcode = '42501';
  end if;

  if v_caller_role <> 'leaderit' then
    raise exception 'Fiyro reactivate: only Leader IT may reactivate vendor accounts'
      using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles pr where pr.id = target_user_id
  ) then
    raise exception 'Fiyro reactivate: target account does not exist'
      using errcode = 'P0002';
  end if;

  if p_new_expiry_date is null then
    raise exception 'Fiyro reactivate: new expiry date must be provided'
      using errcode = '22023';
  end if;

  if p_new_expiry_date < current_date then
    raise exception 'Fiyro reactivate: new expiry date must not be earlier than today'
      using errcode = '22023';
  end if;

  update public.profiles
     set status = 'Active',
         vendor_expiry_date = p_new_expiry_date
   where id = target_user_id
     and role = 'vendor'
     and status = 'Expired';

  if not found then
    raise exception 'Fiyro reactivate: target must be an Expired vendor account'
      using errcode = 'P0001';
  end if;

  return query
  select pr.id, pr.status, pr.vendor_expiry_date::date
    from public.profiles pr
   where pr.id = target_user_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- C.3 fiyro_request_vendor_extension: vendor self-service request.
-- Identity comes exclusively from auth.uid(). Order:
--   authenticate -> load/lock caller profile -> validate reason ->
--   validate requested_days -> eligibility check on locked row ->
--   Q2 normalization (Active + past expiry -> Expired) ->
--   INSERT (partial unique index is the authoritative duplicate guard) ->
--   deterministic return.
-- -----------------------------------------------------------------------------
create or replace function public.fiyro_request_vendor_extension(
  p_reason         text,
  p_requested_days integer
)
returns table (
  out_request_id     uuid,
  out_status         text,
  out_requested_days integer,
  out_requested_at   timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id uuid;
  v_role      text;
  v_status    text;
  v_expiry    timestamptz;
begin
  v_caller_id := auth.uid();

  if v_caller_id is null then
    raise exception 'Fiyro extension request: caller is not authenticated'
      using errcode = '42501';
  end if;

  select p.role, p.status, p.vendor_expiry_date
    into v_role, v_status, v_expiry
    from public.profiles p
   where p.id = v_caller_id
     for update;

  if not found then
    raise exception 'Fiyro extension request: caller profile not found'
      using errcode = '42501';
  end if;

  if v_role <> 'vendor' then
    raise exception 'Fiyro extension request: only vendors may request extensions'
      using errcode = '42501';
  end if;

  if p_reason is null or btrim(p_reason) = '' then
    raise exception 'Fiyro extension request: reason must not be blank'
      using errcode = '22023';
  end if;

  if char_length(btrim(p_reason)) > 1000 then
    raise exception 'Fiyro extension request: reason must not exceed 1000 characters'
      using errcode = '22023';
  end if;

  if p_requested_days is null
     or p_requested_days < 1
     or p_requested_days > 365 then
    raise exception 'Fiyro extension request: requested_days must be between 1 and 365'
      using errcode = '22023';
  end if;

  -- Eligibility (row already locked above).
  if v_status <> 'Expired' then
    if v_status = 'Active'
       and v_expiry is not null
       and v_expiry::date < current_date then

      update public.profiles
         set status = 'Expired'
       where id = v_caller_id
         and role = 'vendor'
         and status = 'Active'
         and vendor_expiry_date::date < current_date;

      if not found then
        raise exception 'Fiyro extension request: concurrent profile change detected'
          using errcode = 'P0001';
      end if;
    else
      raise exception
        'Fiyro extension request: account must be expired (current status: %)',
        v_status
        using errcode = 'P0001';
    end if;
  end if;

  begin
    insert into public.vendor_extension_requests (vendor_id, reason, requested_days)
    values (v_caller_id, btrim(p_reason), p_requested_days);
  exception
    when unique_violation then
      raise exception 'Fiyro extension request: a Pending request already exists'
        using errcode = 'P0001';
  end;

  return query
  select r.id, r.status, r.requested_days, r.requested_at
    from public.vendor_extension_requests r
   where r.vendor_id = v_caller_id
     and r.status = 'Pending';
end;
$$;

-- -----------------------------------------------------------------------------
-- C.4 fiyro_approve_vendor_extension: Pending -> Approved AND
-- Expired -> Active, atomically. Server-side expiry calculation only:
-- base = MAX(existing expiry date, current date); new = base + requested_days.
-- -----------------------------------------------------------------------------
create or replace function public.fiyro_approve_vendor_extension(
  p_request_id uuid
)
returns table (out_vendor_id uuid, out_request_status text, out_new_expiry date)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id     uuid;
  v_caller_role   text;
  v_vendor_id     uuid;
  v_req_status    text;
  v_days          integer;
  v_vendor_role   text;
  v_vendor_status text;
  v_expiry        timestamptz;
  v_new_expiry    date;
begin
  v_caller_id := auth.uid();

  if v_caller_id is null then
    raise exception 'Fiyro approve ext: caller is not authenticated'
      using errcode = '42501';
  end if;

  select p.role
    into v_caller_role
    from public.profiles p
   where p.id = v_caller_id;

  if not found then
    raise exception 'Fiyro approve ext: caller profile not found'
      using errcode = '42501';
  end if;

  if v_caller_role <> 'leaderit' then
    raise exception 'Fiyro approve ext: only Leader IT may decide requests'
      using errcode = '42501';
  end if;

  -- Lock the request row first: serializes concurrent leader decisions.
  select r.vendor_id, r.requested_days, r.status
    into v_vendor_id, v_days, v_req_status
    from public.vendor_extension_requests r
   where r.id = p_request_id
     for update;

  if not found then
    raise exception 'Fiyro approve ext: request does not exist'
      using errcode = 'P0002';
  end if;

  if v_req_status <> 'Pending' then
    raise exception 'Fiyro approve ext: request is not Pending (current status: %)',
      v_req_status
      using errcode = 'P0001';
  end if;

  -- Lock the vendor profile row.
  select pr.role, pr.status, pr.vendor_expiry_date
    into v_vendor_role, v_vendor_status, v_expiry
    from public.profiles pr
   where pr.id = v_vendor_id
     for update;

  if not found then
    raise exception 'Fiyro approve ext: vendor account does not exist'
      using errcode = 'P0002';
  end if;

  if v_vendor_role <> 'vendor' then
    raise exception 'Fiyro approve ext: target is not a vendor'
      using errcode = 'P0001';
  end if;

  -- Q2 normalization on the approval path (same single rule).
  if v_vendor_status <> 'Expired' then
    if v_vendor_status = 'Active'
       and v_expiry is not null
       and v_expiry::date < current_date then

      update public.profiles
         set status = 'Expired'
       where id = v_vendor_id
         and role = 'vendor'
         and status = 'Active'
         and vendor_expiry_date::date < current_date;

      if not found then
        raise exception 'Fiyro approve ext: concurrent profile change detected'
          using errcode = 'P0001';
      end if;

      v_vendor_status := 'Expired';
    else
      raise exception 'Fiyro approve ext: vendor must be expired (current status: %)',
        v_vendor_status
        using errcode = 'P0001';
    end if;
  end if;

  -- Server-side expiry math ONLY; no client-supplied expiry exists.
  v_new_expiry :=
    greatest(coalesce(v_expiry::date, current_date), current_date) + v_days;

  update public.vendor_extension_requests
     set status = 'Approved',
         decided_at = now(),
         decided_by = v_caller_id
   where id = p_request_id
     and status = 'Pending';

  if not found then
    raise exception 'Fiyro approve ext: request changed concurrently'
      using errcode = 'P0001';
  end if;

  update public.profiles
     set status = 'Active',
         vendor_expiry_date = v_new_expiry
   where id = v_vendor_id
     and role = 'vendor'
     and status = 'Expired';

  if not found then
    raise exception 'Fiyro approve ext: vendor changed concurrently'
      using errcode = 'P0001';
  end if;

  return query
  select v_vendor_id, 'Approved'::text, v_new_expiry;
end;
$$;

-- -----------------------------------------------------------------------------
-- C.5 fiyro_reject_vendor_extension: Pending -> Rejected.
-- Vendor row untouched: remains Expired.
-- -----------------------------------------------------------------------------
create or replace function public.fiyro_reject_vendor_extension(
  p_request_id      uuid,
  p_reject_reason   text,
  p_reject_whatsapp text
)
returns table (out_request_id uuid, out_request_status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id   uuid;
  v_caller_role text;
  v_req_status  text;
begin
  v_caller_id := auth.uid();

  if v_caller_id is null then
    raise exception 'Fiyro reject ext: caller is not authenticated'
      using errcode = '42501';
  end if;

  select p.role
    into v_caller_role
    from public.profiles p
   where p.id = v_caller_id;

  if not found then
    raise exception 'Fiyro reject ext: caller profile not found'
      using errcode = '42501';
  end if;

  if v_caller_role <> 'leaderit' then
    raise exception 'Fiyro reject ext: only Leader IT may decide requests'
      using errcode = '42501';
  end if;

  if p_reject_reason is null or btrim(p_reject_reason) = '' then
    raise exception 'Fiyro reject ext: rejection reason must not be blank'
      using errcode = '22023';
  end if;

  if p_reject_whatsapp is null or btrim(p_reject_whatsapp) = '' then
    raise exception 'Fiyro reject ext: WhatsApp contact must not be blank'
      using errcode = '22023';
  end if;

  select r.status
    into v_req_status
    from public.vendor_extension_requests r
   where r.id = p_request_id
     for update;

  if not found then
    raise exception 'Fiyro reject ext: request does not exist'
      using errcode = 'P0002';
  end if;

  if v_req_status <> 'Pending' then
    raise exception 'Fiyro reject ext: request is not Pending (current status: %)',
      v_req_status
      using errcode = 'P0001';
  end if;

  update public.vendor_extension_requests
     set status = 'Rejected',
         reject_reason = btrim(p_reject_reason),
         reject_whatsapp = btrim(p_reject_whatsapp),
         decided_at = now(),
         decided_by = v_caller_id
   where id = p_request_id
     and status = 'Pending';

  if not found then
    raise exception 'Fiyro reject ext: request changed concurrently'
      using errcode = 'P0001';
  end if;

  return query
  select p_request_id, 'Rejected'::text;
end;
$$;
