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

-- Virelay — Major port city, temporally unstable
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "virelay", "map_x": 45, "map_z": 40}'::jsonb,
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

-- The Well of Virelay
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "virelay", "map_x": 40, "map_z": 50}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['virelay', 'story-2'])
WHERE slug = 'the-well-of-virelay';

-- The Third Shard (found in Virelay)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "virelay", "map_x": 40, "map_z": 52}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['virelay', 'story-2'])
WHERE slug = 'the-third-shard';

-- The Cracked Pot (between House Thorne and Virelay)
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "virelay", "map_x": 58, "map_z": 35}'::jsonb,
    tags = array_cat(COALESCE(tags, '{}'), ARRAY['virelay', 'story-2'])
WHERE slug = 'the-cracked-pot';

-- NEW: The Drowned City — the flickering, time-fractured version of Virelay
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM profiles WHERE is_admin = true LIMIT 1;

    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by, metadata, tags)
    VALUES (
        'The Drowned City',
        'the-drowned-city',
        'location',
        'The flickering, time-fractured version of Virelay that exists beneath the waves. A ghostly mirror of the port city above, submerged and caught in an endless loop of destruction and rebirth. Buildings shimmer between states of ruin and splendor, streets flood and drain with impossible tides, and the echoes of lives never lived drift through drowned corridors. At its heart lay the Well—an ancient stone circle on the seafloor where all of Virelay''s temporal instability originated.',
        'canonical',
        0.6,
        admin_id,
        '{"region": "virelay", "map_x": 35, "map_z": 55}'::jsonb,
        ARRAY['virelay', 'story-2', 'fray-touched']
    ) ON CONFLICT (slug) DO NOTHING;

    -- NEW: House Thorne — Auren's noble family as a faction
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by, metadata, tags)
    VALUES (
        'House Thorne',
        'house-thorne',
        'faction',
        'The noble house that oversees the Virelay Coastlands and surrounding territories. Led by Lord and Lady Thorne, the house has long served as a stabilizing presence along the fractured shore. Their lands are connected by trade routes to the port city of Virelay, and when the Fray began disrupting coastal trade and unraveling reality in Virelay, it was their son Auren—the "Lord of Luck"—who defied his parents'' protective wishes and journeyed to save the town. House Thorne is known for its quiet authority, scholarly traditions, and genuine concern for its people.',
        'canonical',
        0.85,
        admin_id,
        '{"region": "virelay", "map_x": 72, "map_z": 28}'::jsonb,
        ARRAY['virelay', 'story-2']
    ) ON CONFLICT (slug) DO NOTHING;
END $$;

-- Assign Auren Thorne to Virelay region
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "virelay", "map_x": 47, "map_z": 42}'::jsonb,
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
