-- =====================================================
-- FIX VELL GLASS OVERLAP (GLASS EXPANSE)
-- Vell Glass has explicit (45, 50) — identical to
-- Prism City. Move to NE quadrant of the map.
-- =====================================================

UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 72, "map_z": 28}'::jsonb
WHERE name = 'Vell Glass' AND status = 'canonical';
