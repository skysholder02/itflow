-- =============================================================================
-- FIYRO (ITFlow) - Landing Media Storage
--
-- MANUAL SETUP: run this file once in the Supabase SQL Editor.
--
-- This file is intentionally NOT placed in supabase/migrations so it is never
-- applied automatically by `supabase db push`. It must be executed by hand
-- (same convention as job-documentation-storage.sql).
--
-- What it does:
--   1. Creates a PUBLIC storage bucket named `landing-media` for landing page
--      media (company introduction video, poster, environment photos).
--   2. Grants public read access through a single permissive SELECT policy on
--      the bucket's objects. Public URLs are served from:
--        {SUPABASE_URL}/storage/v1/object/public/landing-media/<path>
--
-- Idempotent: safe to run repeatedly. An existing bucket is kept as-is except
-- that its `public` flag is asserted true. No other bucket is touched; in
-- particular the private `job-documentation` bucket is NOT modified.
--
-- Object layout:
--   company/canopus-introduction.mp4   (company introduction video)
--   company/canopuss.png               (video poster)
--   company/photos/<clean-filename>    (environment photos)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Public bucket
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('landing-media', 'landing-media', true)
on conflict (id) do update set public = true;

-- -----------------------------------------------------------------------------
-- 2. Public read policy (minimum necessary permission)
-- -----------------------------------------------------------------------------
drop policy if exists "FIYRO public read landing-media" on storage.objects;
create policy "FIYRO public read landing-media"
  on storage.objects
  for select
  using (bucket_id = 'landing-media');
