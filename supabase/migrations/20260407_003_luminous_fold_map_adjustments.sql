-- =====================================================
-- LUMINOUS FOLD MAP ADJUSTMENTS
-- Move Central Fold SW of The Quiet Line
-- Move Order Field to Central Fold's old position
-- Swap East Order and Venn
-- Move Line Camp further west
-- Move The Even Table slightly east
-- Move Grid Station 6 slightly north
-- =====================================================

-- 1. Move Central Fold to SW of The Quiet Line (was x=53.6, z=11.3 → x=40, z=62)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 40, "map_z": 62}'::jsonb
WHERE slug = 'central-fold';

-- 2. Move Order Field to Central Fold's old position (was x=58.4, z=56.3 → x=54, z=11)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 54, "map_z": 11}'::jsonb
WHERE slug = 'order-field';

-- 3. Swap East Order and Venn
-- East Order: was x=32.8, z=21.8 → x=76, z=40 (Venn's old position)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 76, "map_z": 40}'::jsonb
WHERE slug = 'east-order';

-- Venn: was x=76.1, z=39.5 → x=33, z=22 (East Order's old position)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 33, "map_z": 22}'::jsonb
WHERE slug = 'venn';

-- 4. Move Line Camp further west (was x=54.6, z=30.7 → x=35, z=31)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 35, "map_z": 31}'::jsonb
WHERE slug = 'line-camp';

-- 5. Move The Even Table slightly east (was x=58.6, z=50.1 → x=65, z=50)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 65, "map_z": 50}'::jsonb
WHERE slug = 'the-even-table';

-- 6. Move Grid Station 6 slightly north (was x=53.4, z=44.9 → x=53, z=38)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 53, "map_z": 38}'::jsonb
WHERE slug = 'grid-station-6';
