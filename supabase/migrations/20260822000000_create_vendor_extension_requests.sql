-- =============================================================================
-- STEP 5C / Migration A: vendor extension requests (schema only)
-- FIYRO (ITFlow). RLS: Migration B. Lifecycle RPCs: Migration C.
-- Decisions: Q3 validation at DB level, Q8 decided_by ON DELETE SET NULL,
--            Q5 no notifications, Q6 no timeline/audit tables, Q9 no cancel RPC.
-- =============================================================================

create table public.vendor_extension_requests (
  id              uuid primary key default gen_random_uuid(),
  vendor_id       uuid not null references public.profiles(id) on delete cascade,
  reason          text not null,
  requested_days  integer not null,
  status          text not null default 'Pending',
  reject_reason   text,
  reject_whatsapp text,
  requested_at    timestamptz not null default now(),
  decided_at      timestamptz,
  decided_by      uuid references public.profiles(id) on delete set null,

  constraint ver_status_valid check (
    status in ('Pending', 'Approved', 'Rejected')
  ),
  constraint ver_requested_days_range check (
    requested_days between 1 and 365
  ),
  constraint ver_reason_not_blank check (
    btrim(reason) <> ''
  ),
  constraint ver_reason_max_length check (
    char_length(btrim(reason)) <= 1000
  ),
  constraint ver_pending_is_clean check (
    status <> 'Pending'
    or (
      reject_reason   is null
      and reject_whatsapp is null
      and decided_at  is null
      and decided_by  is null
    )
  ),
  constraint ver_rejected_is_complete check (
    status <> 'Rejected'
    or (
      reject_reason   is not null and btrim(reject_reason)     <> ''
      and reject_whatsapp is not null and btrim(reject_whatsapp) <> ''
      and decided_at  is not null
      and decided_by  is not null
    )
  ),
  constraint ver_approved_has_decider check (
    status <> 'Approved'
    or (decided_at is not null and decided_by is not null)
  )
);

comment on table public.vendor_extension_requests is
  'FIYRO vendor account-extension requests. Writes occur only through fiyro_*_vendor_extension SECURITY DEFINER RPCs.';

create unique index ux_vendor_ext_req_one_pending_per_vendor
  on public.vendor_extension_requests (vendor_id)
  where status = 'Pending';

create index vendor_ext_req_vendor_idx
  on public.vendor_extension_requests (vendor_id);

create index vendor_ext_req_status_idx
  on public.vendor_extension_requests (status);
