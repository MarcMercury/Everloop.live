-- =====================================================
-- Map Label Overrides — grant service_role + reload PostgREST
-- The original migration (20260522_002) granted to anon/authenticated
-- but forgot service_role. Without this, the admin Supabase client
-- (which the Map Maker uses) gets 403 permission denied even though
-- it bypasses RLS.
-- =====================================================

GRANT ALL ON map_label_overrides TO service_role;

-- Refresh PostgREST so the new grant is picked up immediately.
NOTIFY pgrst, 'reload schema';
