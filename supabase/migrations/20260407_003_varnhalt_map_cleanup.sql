-- =====================================================
-- VARNHALT FRONTIER MAP CLEANUP
-- Remove Rook, Myx, Sera, and Servine pins from the
-- Varnhalt Frontier regional map. Remove any "Varnhalt
-- Frontier" location dot. Move Varnhalt town to the
-- former Servine position (handled in map-labels.ts).
-- =====================================================

-- Remove Rook from the Varnhalt map
UPDATE public.canon_entities
SET metadata = metadata - 'region' - 'map_x' - 'map_z',
    tags = array_remove(tags, 'varnhalt')
WHERE slug = 'rook';

-- Remove Myx from the Varnhalt map
UPDATE public.canon_entities
SET metadata = metadata - 'region' - 'map_x' - 'map_z',
    tags = array_remove(tags, 'varnhalt')
WHERE slug = 'myx';

-- Remove Sera from the Varnhalt map
UPDATE public.canon_entities
SET metadata = metadata - 'region' - 'map_x' - 'map_z',
    tags = array_remove(tags, 'varnhalt')
WHERE slug = 'sera';

-- Remove Servine from the Varnhalt map
UPDATE public.canon_entities
SET metadata = metadata - 'region' - 'map_x' - 'map_z',
    tags = array_remove(tags, 'varnhalt')
WHERE slug = 'servine';

-- Remove any "Varnhalt Frontier" entity from the map (if one exists)
UPDATE public.canon_entities
SET metadata = metadata - 'region' - 'map_x' - 'map_z'
WHERE slug = 'varnhalt-frontier'
   OR slug = 'the-varnhalt-frontier';
