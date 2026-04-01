-- =====================================================
-- MOVE VIRELAY MAP LABELS
-- Reorganize pin positions on the Virelay Coastlands map.
-- Remove The Drowned City and duplicate House Thorne faction.
-- =====================================================

-- 1. Remove The Drowned City entity
DELETE FROM public.canon_entities WHERE slug = 'the-drowned-city';

-- 2. Remove duplicate House Thorne faction (the further-north one at 72,28)
DELETE FROM public.canon_entities WHERE slug = 'house-thorne';

-- 3. Move Virelay to where The Drowned City was (35, 55)
UPDATE public.canon_entities
SET metadata = jsonb_set(
      jsonb_set(metadata, '{map_x}', '35'),
      '{map_z}', '55'
    )
WHERE slug = 'virelay';

-- 4. Move The Well of Virelay south of new Virelay site (35, 62)
UPDATE public.canon_entities
SET metadata = jsonb_set(
      jsonb_set(metadata, '{map_x}', '35'),
      '{map_z}', '62'
    )
WHERE slug = 'the-well-of-virelay';

-- 5. Move The Cracked Pot to where Virelay was (45, 40)
UPDATE public.canon_entities
SET metadata = jsonb_set(
      jsonb_set(metadata, '{map_x}', '45'),
      '{map_z}', '40'
    )
WHERE slug = 'the-cracked-pot';

-- 6. Move The Third Shard just south of the new Well site (35, 67)
UPDATE public.canon_entities
SET metadata = jsonb_set(
      jsonb_set(metadata, '{map_x}', '35'),
      '{map_z}', '67'
    )
WHERE slug = 'the-third-shard';

-- 7. Move Auren Thorne next to House Thorne Manor (72, 32)
UPDATE public.canon_entities
SET metadata = jsonb_set(
      jsonb_set(metadata, '{map_x}', '72'),
      '{map_z}', '32'
    )
WHERE slug = 'auren-thorne';
