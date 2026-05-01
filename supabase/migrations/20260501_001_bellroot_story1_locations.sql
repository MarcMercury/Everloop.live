-- =====================================================
-- BELLROOT VALE — Story 1 Location Expansion
-- Adds locations from "The Bell Tree and the Broken World"
-- that were not previously listed in the regional archive:
--   • Watcher's Hill (existing entity → assign region/coords)
--   • The Gorge (existing entity → assign region/coords)
--   • The Bound Chamber (new ruin beneath the gorge)
--   • The Hollow Vale (new landmark)
--   • The Bramble Hills (new landmark)
--   • Triumvirate Chapel (new ruin at edge of Drelmere)
--
-- All assigned to region 'bellroot' so they appear on the
-- Bellroot Vale regional map and in the archive directory.
-- =====================================================

DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM public.profiles WHERE is_admin = true LIMIT 1;
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'No admin user found in profiles table';
  END IF;

  -- ── Watcher's Hill (already exists) ──────────────────────────
  UPDATE public.canon_entities
  SET status = 'canonical',
      metadata = COALESCE(metadata, '{}'::jsonb)
        || '{"region": "bellroot", "map_x": 52, "map_z": 48, "category": "Landmarks"}'::jsonb,
      extended_lore = COALESCE(extended_lore, '{}'::jsonb)
        || '{"region": "bellroot", "category": "Landmarks"}'::jsonb,
      tags = array_cat(COALESCE(tags, '{}'), ARRAY['bellroot', 'story-1', 'landmark'])
  WHERE slug = 'watchers-hill';

  -- ── The Gorge (already exists, slug: the-gorge-drelmere) ─────
  UPDATE public.canon_entities
  SET status = 'canonical',
      metadata = COALESCE(metadata, '{}'::jsonb)
        || '{"region": "bellroot", "map_x": 44, "map_z": 50, "category": "Landmarks"}'::jsonb,
      extended_lore = COALESCE(extended_lore, '{}'::jsonb)
        || '{"region": "bellroot", "category": "Landmarks"}'::jsonb,
      tags = array_cat(COALESCE(tags, '{}'), ARRAY['bellroot', 'story-1', 'landmark'])
  WHERE slug IN ('the-gorge', 'the-gorge-drelmere');

  -- ── The Bound Chamber (new) ──────────────────────────────────
  INSERT INTO public.canon_entities (
    name, slug, type, description, status, stability_rating, created_by, tags, metadata, extended_lore
  ) VALUES (
    'The Bound Chamber',
    'the-bound-chamber',
    'location',
    'A vast subterranean cavern beneath the Drelmere Gorge where time grows heavy and the seconds press down like stone. Coal-black roots as thick as limbs climb the walls into a ceiling that fades into shadow, and beneath their bark are etched twenty-two silver spirals — the same spirals that pattern the Bell Tree''s bells. This is the chamber where Eidon the Folder unfolded into the man he had always been, and where Kerr, Mira, and Thom first read the sequence that would call the Second Shard into the world. The tunnel that leads here does not always lead back.',
    'canonical',
    0.45,
    admin_id,
    ARRAY['bellroot', 'story-1', 'ruin', 'location'],
    '{"region": "bellroot", "map_x": 43, "map_z": 51, "category": "Ruins", "created_via": "story1_location_expansion"}'::jsonb,
    '{"region": "bellroot", "category": "Ruins", "tagline": "Ruins in the Bellroot Vale"}'::jsonb
  ) ON CONFLICT (slug) DO UPDATE
    SET status = 'canonical',
        metadata = public.canon_entities.metadata
          || '{"region": "bellroot", "map_x": 43, "map_z": 51, "category": "Ruins"}'::jsonb;

  -- ── The Hollow Vale (new) ────────────────────────────────────
  INSERT INTO public.canon_entities (
    name, slug, type, description, status, stability_rating, created_by, tags, metadata, extended_lore
  ) VALUES (
    'The Hollow Vale',
    'the-hollow-vale',
    'location',
    'A wild, low-lying basin west of the family cottage where the canopy closes overhead and the streams forget their direction by midday. Kaerlin and Mira scouted the Hollow Vale on their earliest expeditions, mapping the first Fray distortions their father had marked but never reached. Locals avoid it because compasses spin slowly here, as though the threads beneath the soil have not yet decided which way is north.',
    'canonical',
    0.55,
    admin_id,
    ARRAY['bellroot', 'story-1', 'landmark', 'location'],
    '{"region": "bellroot", "map_x": 38, "map_z": 60, "category": "Landmarks", "created_via": "story1_location_expansion"}'::jsonb,
    '{"region": "bellroot", "category": "Landmarks", "tagline": "Landmark in the Bellroot Vale"}'::jsonb
  ) ON CONFLICT (slug) DO UPDATE
    SET status = 'canonical',
        metadata = public.canon_entities.metadata
          || '{"region": "bellroot", "map_x": 38, "map_z": 60, "category": "Landmarks"}'::jsonb;

  -- ── The Bramble Hills (new) ──────────────────────────────────
  INSERT INTO public.canon_entities (
    name, slug, type, description, status, stability_rating, created_by, tags, metadata, extended_lore
  ) VALUES (
    'The Bramble Hills',
    'the-bramble-hills',
    'location',
    'A thorned ridge country that once lay between Drelmere and the southern Vale, where the brambles grow thick enough to swallow paths and reroute caravans by morning. Older maps still show a four-day route through the Hills to Drelmere; current travel rarely matches what the maps promise. Hunters speak of crossing the same gully twice in a single afternoon, then arriving somewhere they had not been heading.',
    'canonical',
    0.60,
    admin_id,
    ARRAY['bellroot', 'story-1', 'landmark', 'location'],
    '{"region": "bellroot", "map_x": 54, "map_z": 56, "category": "Landmarks", "created_via": "story1_location_expansion"}'::jsonb,
    '{"region": "bellroot", "category": "Landmarks", "tagline": "Landmark in the Bellroot Vale"}'::jsonb
  ) ON CONFLICT (slug) DO UPDATE
    SET status = 'canonical',
        metadata = public.canon_entities.metadata
          || '{"region": "bellroot", "map_x": 54, "map_z": 56, "category": "Landmarks"}'::jsonb;

  -- ── Triumvirate Chapel (new) ─────────────────────────────────
  INSERT INTO public.canon_entities (
    name, slug, type, description, status, stability_rating, created_by, tags, metadata, extended_lore
  ) VALUES (
    'Triumvirate Chapel',
    'triumvirate-chapel',
    'location',
    'A moss-swallowed shrine at the edge of Drelmere bearing a cracked statue of the Triumvirate — Time, Memory, and Flesh — whose hollow eyes still face the path into town. The chapel was a place of quiet observance for the Dreamers who once gathered in Drelmere, and its cold stone is said to retain the impressions of their meditations. Now half-collapsed and shadow-veined, it is the first ruin travelers pass when entering the valley, and the last thing they remember when they leave.',
    'canonical',
    0.45,
    admin_id,
    ARRAY['bellroot', 'story-1', 'ruin', 'location'],
    '{"region": "bellroot", "map_x": 47, "map_z": 53, "category": "Ruins", "created_via": "story1_location_expansion"}'::jsonb,
    '{"region": "bellroot", "category": "Ruins", "tagline": "Ruins in the Bellroot Vale"}'::jsonb
  ) ON CONFLICT (slug) DO UPDATE
    SET status = 'canonical',
        metadata = public.canon_entities.metadata
          || '{"region": "bellroot", "map_x": 47, "map_z": 53, "category": "Ruins"}'::jsonb;

END $$;
