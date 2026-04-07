-- =====================================================
-- FIX OVERLAPPING MAP POSITIONS
-- Resolve hash-based coordinate collisions where
-- entities with similar names end up stacked on top
-- of each other. Sets explicit coordinates for entities
-- whose hash positions overlap (distance < 8%).
-- =====================================================

-- ─── ASHEN SPINE ───────────────────────────────────────

-- Taldrin Pass (~76.2, ~26.8) and The Ash Line (~76.1, ~26.7)
-- are hash-identical (d=0.14). Keep Taldrin Pass, move The Ash Line SW.
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 68, "map_z": 35}'::jsonb
WHERE name = 'The Ash Line' AND status = 'canonical';

-- Ironmark (~42.5, ~20.7) and Old Varr (~44.0, ~22.1)
-- nearly stacked (d=2.1). Keep Ironmark, move Old Varr E.
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 42, "map_z": 15}'::jsonb
WHERE name = 'Ironmark' AND status = 'canonical';

UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 50, "map_z": 25}'::jsonb
WHERE name = 'Old Varr' AND status = 'canonical';

-- Rookforge (~86.9, ~63.0) and Varr Keep (~88.3, ~64.5)
-- nearly stacked (d=2.1). Spread apart.
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 82, "map_z": 57}'::jsonb
WHERE name = 'Rookforge' AND status = 'canonical';

UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 88, "map_z": 68}'::jsonb
WHERE name = 'Varr Keep' AND status = 'canonical';

-- ─── DEYUNE STEPS ──────────────────────────────────────

-- Valen Spur (~67.1, ~56.1) and The Long Fire (~67.7, ~51.5)
-- close (d=4.6). Move The Long Fire E.
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 74, "map_z": 50}'::jsonb
WHERE name = 'The Long Fire' AND status = 'canonical';

-- East Wind Post (~17.6, ~16.2) and Vask Hollow (~22.6, ~13.4)
-- close (d=5.7). Move Vask Hollow E.
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 28, "map_z": 18}'::jsonb
WHERE name = 'Vask Hollow' AND status = 'canonical';

-- First Camp Remains (~82.9, ~22.6) and The Standing Teeth (~87.2, ~26.9)
-- close (d=6.1). Move First Camp Remains NE.
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 88, "map_z": 16}'::jsonb
WHERE name = 'First Camp Remains' AND status = 'canonical';

-- Step Barrow Forge (~50.0, ~60.7) and Whispering Expanse (~46.8, ~66.5)
-- close (d=6.6). Move Whispering Expanse SE to clear of Thorne Reach.
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 46, "map_z": 75}'::jsonb
WHERE name = 'Whispering Expanse' AND status = 'canonical';

-- ─── VIRELAY COASTLANDS ────────────────────────────────

-- Broken Mast (33, 33) and Halven Shore (35.4, 35.4)
-- nearly stacked (d=3.4). Move Halven Shore S.
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 28, "map_z": 40}'::jsonb
WHERE name = 'Halven Shore' AND status = 'canonical';

-- Low Lantern (~66.3, ~64.1) and Cliffwatch (~68.4, ~57.4)
-- close (d=7.0). Move Cliffwatch W.
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 64, "map_z": 52}'::jsonb
WHERE name = 'Cliffwatch' AND status = 'canonical';

-- ─── GLASS EXPANSE ─────────────────────────────────────

-- Prism City (45, 50) and Split Site (~49.2, ~45.2)
-- close (d=6.4). Move Split Site NE.
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 53, "map_z": 40}'::jsonb
WHERE name = 'Split Site' AND status = 'canonical';

-- Old Prism (~77.9, ~54.0) and Drylight Camp (~70.7, ~54.5)
-- close (d=7.2). Move Old Prism E.
UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 82, "map_z": 58}'::jsonb
WHERE name = 'Old Prism' AND status = 'canonical';
