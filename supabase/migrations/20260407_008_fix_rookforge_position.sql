-- =====================================================
-- FIX ROOKFORGE / RED BARREL HOUSE OVERLAP (ASHEN)
-- The 007 migration moved Rookforge to (82, 57) which
-- is 4.8 units from Red Barrel House's hash position
-- (84.1, 52.7). Adjust Rookforge to clear it.
-- =====================================================

UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 76, "map_z": 56}'::jsonb
WHERE name = 'Rookforge' AND status = 'canonical';
