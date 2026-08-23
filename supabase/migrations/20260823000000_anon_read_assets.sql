-- =============================================================================
-- Migration: 20260823000000_anon_read_assets
-- FIYRO (ITFlow) - STEP 6.2: QR guest scan fix.
--
-- Allows unauthenticated visitors to read asset rows so a guest scanning an
-- asset QR code can load the public /assets/:id page (AssetDetailPage with
-- publicView). The app runs as the `anon` role whenever no session exists,
-- and RLS previously granted SELECT only to `authenticated`.
--
-- Scope is deliberately minimal:
--   - SELECT privilege + one permissive SELECT policy on public.assets only.
--   - public.asset_histories intentionally stays authenticated-only; the
--     public page renders an empty timeline gracefully when it receives [].
--
-- No existing policy is modified or dropped.
-- =============================================================================

grant select on public.assets to anon;

create policy "FIYRO anon read assets"
  on public.assets
  for select
  to anon
  using (true);
