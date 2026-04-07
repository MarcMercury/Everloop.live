-- =====================================================
-- REMOVE MERRA DUNE MAP COORDINATES
-- Merra Dune is a character, not a map location.
-- Remove her map_x / map_z so she no longer appears
-- as a pin on the Bellroot Vale regional map.
-- =====================================================

UPDATE public.canon_entities
SET metadata = metadata - 'map_x' - 'map_z'
WHERE slug = 'merra-dune';
