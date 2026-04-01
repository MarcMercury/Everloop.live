-- =====================================================
-- ADD STORY POINTS TO REGIONAL MAPS
-- Promotes Story 1 entities to canonical, assigns regions
-- and map coordinates so they appear as pins on regional maps.
-- =====================================================

-- =====================================================
-- BELLROOT VALE — Book 1 (Kerr, Mira, Thom)
-- =====================================================

-- Drelmere — Central town of Book 1
UPDATE public.canon_entities
SET status = 'canonical',
    metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "bellroot", "map_x": 48, "map_z": 52}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['bellroot', 'story-1'])
WHERE slug = 'drelmere';

-- Mayor Halrick Vann
UPDATE public.canon_entities
SET status = 'canonical',
    metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "bellroot", "map_x": 50, "map_z": 50}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['bellroot', 'story-1', 'drelmere'])
WHERE slug = 'halrick-vann';

-- Merra Dune
UPDATE public.canon_entities
SET status = 'canonical',
    metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "bellroot", "map_x": 46, "map_z": 54}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['bellroot', 'story-1', 'drelmere'])
WHERE slug = 'merra-dune';

-- The Bell Tree
UPDATE public.canon_entities
SET status = 'canonical',
    metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "bellroot", "map_x": 48, "map_z": 48}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['bellroot', 'story-1', 'drelmere'])
WHERE slug = 'the-bell-tree';

-- Also promote the remaining Story 1 characters/locations to canonical
UPDATE public.canon_entities
SET status = 'canonical',
    metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "bellroot"}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['bellroot', 'story-1'])
WHERE slug IN ('kaerlin', 'mira', 'thomel', 'eidon', 'watchers-hill', 'the-gorge', 'the-second-shard')
  AND status = 'proposed';

-- =====================================================
-- VIRELAY COASTLANDS — Story 2 (The Prince and The Drowned City)
-- =====================================================

-- Virelay — Major port city, temporally unstable (at former Drowned City site)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "virelay", "map_x": 35, "map_z": 55}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['virelay', 'story-2'])
WHERE slug = 'virelay';

-- House Thorne Manor — Auren's noble family domain
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "virelay", "map_x": 70, "map_z": 30}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['virelay', 'story-2'])
WHERE slug = 'house-thorne-manor';

-- The Oar and Candle (in Virelay)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "virelay", "map_x": 43, "map_z": 44}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['virelay', 'story-2'])
WHERE slug = 'the-oar-and-candle';

-- The Well of Virelay (south of Virelay)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "virelay", "map_x": 35, "map_z": 62}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['virelay', 'story-2'])
WHERE slug = 'the-well-of-virelay';

-- The Third Shard (south of the Well)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "virelay", "map_x": 35, "map_z": 67}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['virelay', 'story-2'])
WHERE slug = 'the-third-shard';

-- The Cracked Pot (at old Virelay site)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "virelay", "map_x": 45, "map_z": 40}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['virelay', 'story-2'])
WHERE slug = 'the-cracked-pot';

-- (The Drowned City and House Thorne faction removed — see 20260401_002)

-- Assign Auren Thorne to Virelay region (next to Thorne Manor)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "virelay", "map_x": 72, "map_z": 32}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['virelay', 'story-2'])
WHERE slug = 'auren-thorne';

-- =====================================================
-- VARNHALT FRONTIER — Story 3 (Rook & Myx)
-- =====================================================

-- The Black Tower of Sera (The Black Stone Tower) — Mysterious appearing structure
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "varnhalt", "map_x": 55, "map_z": 45}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['varnhalt', 'story-3'])
WHERE slug = 'the-black-tower-of-sera';

-- Rook — assign to Varnhalt
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "varnhalt", "map_x": 40, "map_z": 38}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['varnhalt', 'story-3'])
WHERE slug = 'rook';

-- Myx — assign to Varnhalt
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "varnhalt", "map_x": 42, "map_z": 38}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['varnhalt', 'story-3'])
WHERE slug = 'myx';

-- Sera — assign to Varnhalt
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "varnhalt", "map_x": 52, "map_z": 42}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['varnhalt', 'story-3'])
WHERE slug = 'sera';

-- The Fourth Shard (found in Varnhalt)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "varnhalt", "map_x": 55, "map_z": 47}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['varnhalt', 'story-3'])
WHERE slug = 'the-fourth-shard';

-- Servine creature
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "varnhalt"}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['varnhalt', 'story-3'])
WHERE slug = 'servine';
