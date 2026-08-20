-- =============================================================================
-- FIYRO (ITFlow) - Job Documentation Storage
--
-- MANUAL SETUP: run this file once in the Supabase SQL Editor.
--
-- This file is intentionally NOT placed in supabase/migrations so it is never
-- applied automatically by `supabase db push`. It must be executed by hand.
--
-- What it does:
--   1. Creates a PRIVATE storage bucket named `job-documentation`.
--   2. Creates a helper function that checks whether the current authenticated
--      user is assigned to a job (vendor_id / it_support_id / leader_id on
--      public.jobs).
--   3. Creates path-based storage RLS policies so only users assigned to a job
--      can upload, read, or delete that job's documentation objects.
--
-- Object layout:  job-documentation/{jobId}/{unique-file-name}
-- The first folder segment of the object name is the job id.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Private bucket
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('job-documentation', 'job-documentation', false)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 2. Job participant check
--    Returns true when the current auth user is assigned to the job whose id
--    matches the first folder segment of the storage object name.
--    Security invoker + search_path pinning so it respects jobs RLS and cannot
--    be used for search-path hijacking.
-- -----------------------------------------------------------------------------
create or replace function public.fiyro_is_job_participant(job_id text)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.jobs j
    where j.id = job_id
      and (
        j.vendor_id::text = auth.uid()::text
        or j.it_support_id::text = auth.uid()::text
        or j.leader_id::text = auth.uid()::text
      )
  );
$$;

-- Restrict direct invocation of the helper to authenticated users only.
revoke execute on function public.fiyro_is_job_participant(text) from public, anon;
grant execute on function public.fiyro_is_job_participant(text) to authenticated;

-- -----------------------------------------------------------------------------
-- 3. Storage RLS policies (narrow, path-scoped; no global access)
-- -----------------------------------------------------------------------------
create policy "job_documentation_select"
on storage.objects for select
using (
  bucket_id = 'job-documentation'
  and public.fiyro_is_job_participant(storage.foldername(name)[1])
);

create policy "job_documentation_insert"
on storage.objects for insert
with check (
  bucket_id = 'job-documentation'
  and public.fiyro_is_job_participant(storage.foldername(name)[1])
);

create policy "job_documentation_delete"
on storage.objects for delete
using (
  bucket_id = 'job-documentation'
  and public.fiyro_is_job_participant(storage.foldername(name)[1])
);