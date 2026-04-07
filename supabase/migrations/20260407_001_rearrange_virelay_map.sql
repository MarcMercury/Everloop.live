-- =====================================================
-- REARRANGE VIRELAY COASTLANDS MAP
-- Remove Auren Thorne, Shards of the Pattern marker,
-- The Well Site, and The Well of Virelay.
-- Reposition Kelport, Harbor Post 3, Old Harbor, Tide Gate,
-- The Salt House, and Broken Mast.
-- =====================================================

-- 1. Remove Auren Thorne from the map (clear region/map coords and virelay tag)
UPDATE public.canon_entities
SET metadata = metadata - 'map_x' - 'map_z' - 'region',
    tags = array_remove(tags, 'virelay')
WHERE slug = 'auren-thorne';

-- 2. Remove "Shards of the Pattern" purple marker (The Third Shard)
UPDATE public.canon_entities
SET metadata = metadata - 'map_x' - 'map_z' - 'region'
WHERE slug = 'the-third-shard';

-- 3. Remove The Well Site from the map (clear coords, region, tags)
UPDATE public.canon_entities
SET metadata = (COALESCE(metadata, '{}'::jsonb) - 'map_x' - 'map_z' - 'region') || '{"hidden_from_map": true}'::jsonb,
    extended_lore = COALESCE(extended_lore, '{}'::jsonb) - 'region',
    tags = array_remove(tags, 'virelay')
WHERE slug = 'the-well-site';

-- 4. Remove The Well of Virelay from the map
UPDATE public.canon_entities
SET metadata = metadata - 'map_x' - 'map_z' - 'region'
WHERE slug = 'the-well-of-virelay';

-- 5. Move Kelport to where The Well of Virelay was (35, 62)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 35, "map_z": 62}'::jsonb
WHERE slug = 'kelport';

-- 6. Move Harbor Post 3 to Kelport's original hash position (78, 78)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 78, "map_z": 78}'::jsonb
WHERE slug = 'harbor-post-3';

-- 7. Move Old Harbor to where Auren Thorne was (72, 32)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 72, "map_z": 32}'::jsonb
WHERE slug = 'old-harbor';

-- 8. Move Tide Gate to where The Drowned City is (43, 84)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 43, "map_z": 84}'::jsonb
WHERE slug = 'tide-gate';

-- 9. Move The Salt House to where The Third Shard was (35, 67)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 35, "map_z": 67}'::jsonb
WHERE slug = 'the-salt-house';

-- 10. Move Broken Mast to just SE of Lowtide (~26, 27 → 33, 33)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 33, "map_z": 33}'::jsonb
WHERE slug = 'broken-mast';
