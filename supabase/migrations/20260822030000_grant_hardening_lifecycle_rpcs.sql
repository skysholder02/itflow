-- =============================================================================
-- STEP 5C / Migration D: EXECUTE privilege hardening for the five new
-- lifecycle RPCs created in Migration C. Core package only.
-- Principle: no PUBLIC, no anonymous access; authenticated + service_role only.
-- =============================================================================

revoke execute on function public.fiyro_change_vendor_expiry(uuid, date)
  from public;
revoke execute on function public.fiyro_change_vendor_expiry(uuid, date)
  from anon;
grant execute on function public.fiyro_change_vendor_expiry(uuid, date)
  to authenticated;
grant execute on function public.fiyro_change_vendor_expiry(uuid, date)
  to service_role;

revoke execute on function public.fiyro_reactivate_vendor_account(uuid, date)
  from public;
revoke execute on function public.fiyro_reactivate_vendor_account(uuid, date)
  from anon;
grant execute on function public.fiyro_reactivate_vendor_account(uuid, date)
  to authenticated;
grant execute on function public.fiyro_reactivate_vendor_account(uuid, date)
  to service_role;

revoke execute on function public.fiyro_request_vendor_extension(text, integer)
  from public;
revoke execute on function public.fiyro_request_vendor_extension(text, integer)
  from anon;
grant execute on function public.fiyro_request_vendor_extension(text, integer)
  to authenticated;
grant execute on function public.fiyro_request_vendor_extension(text, integer)
  to service_role;

revoke execute on function public.fiyro_approve_vendor_extension(uuid)
  from public;
revoke execute on function public.fiyro_approve_vendor_extension(uuid)
  from anon;
grant execute on function public.fiyro_approve_vendor_extension(uuid)
  to authenticated;
grant execute on function public.fiyro_approve_vendor_extension(uuid)
  to service_role;

revoke execute on function public.fiyro_reject_vendor_extension(uuid, text, text)
  from public;
revoke execute on function public.fiyro_reject_vendor_extension(uuid, text, text)
  from anon;
grant execute on function public.fiyro_reject_vendor_extension(uuid, text, text)
  to authenticated;
grant execute on function public.fiyro_reject_vendor_extension(uuid, text, text)
  to service_role;
