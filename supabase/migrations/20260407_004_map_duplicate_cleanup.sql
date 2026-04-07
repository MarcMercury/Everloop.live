-- =====================================================
-- MAP DUPLICATE CLEANUP
-- Fix stacked/duplicate pins caused by position migrations
-- that moved entities but left behind ghost data.
-- =====================================================

-- 1. The Drowned City — was deleted in 20260401_002 but re-created by
--    archive seeder with region: virelay. Remove region and coords so
--    it no longer appears as a map pin (keep the entity for lore).
UPDATE public.canon_entities
SET metadata = metadata - 'region' - 'map_x' - 'map_z',
    extended_lore = COALESCE(extended_lore, '{}'::jsonb) - 'region'
WHERE slug = 'the-drowned-city';

-- 2. Merra Dune — character, not a map location. Coords were removed in
--    20260407_001 but region was left behind, causing a hash-position pin.
UPDATE public.canon_entities
SET metadata = metadata - 'region'
WHERE slug = 'merra-dune';

-- 3. Father's Shard — artifact with region but no coords. Should not
--    appear as a standalone map pin (it's a story artifact).
UPDATE public.canon_entities
SET metadata = metadata - 'region'
WHERE slug = 'fathers-shard';

-- 4. The Underwater Well — has explicit coords (15, 52) from story data
--    but no region. Assign to virelay so it properly appears on the map.
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "virelay"}'::jsonb
WHERE slug = 'the-underwater-well';

-- 5. Auren Thorne — should have no region (removed in 20260407_001).
--    Also strip extended_lore.region if present from seeder.
UPDATE public.canon_entities
SET metadata = metadata - 'region' - 'map_x' - 'map_z',
    extended_lore = COALESCE(extended_lore, '{}'::jsonb) - 'region'
WHERE slug = 'auren-thorne';

-- 6. The Well Site — already has hidden_from_map but also strip region
--    from extended_lore to prevent any future fallback matching.
UPDATE public.canon_entities
SET extended_lore = COALESCE(extended_lore, '{}'::jsonb) - 'region'
WHERE slug = 'the-well-site';

-- 7. The Third Shard — was removed from Virelay map in 20260407_001.
--    Also clear extended_lore.region if present.
UPDATE public.canon_entities
SET extended_lore = COALESCE(extended_lore, '{}'::jsonb) - 'region'
WHERE slug = 'the-third-shard';

-- 8. The Well of Virelay — was removed from map in 20260407_001.
--    Also clear extended_lore.region if present.
UPDATE public.canon_entities
SET extended_lore = COALESCE(extended_lore, '{}'::jsonb) - 'region'
WHERE slug = 'the-well-of-virelay';
