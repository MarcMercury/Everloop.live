-- Glass Expanse map adjustments:
-- 1. Remove Father's Shard from Glass Expanse by assigning it to bellroot (its actual region)
-- 2. Move The Second Face further west
-- 3. Move Prism City south and east
-- 4. Move Mirror Post east

-- 1) Father's Shard — set region to bellroot so it stops appearing in Glass Expanse
--    (it was matching via description containing "glass")
UPDATE canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"region": "bellroot"}'::jsonb
WHERE id = '0bfe2139-fa25-45ae-bd56-94a2fbe5c70e';

-- 2) The Second Face — move west (x: 55.4 → 30)
UPDATE canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 30, "map_z": 73.7}'::jsonb
WHERE id = '37265575-a369-4741-9c8c-d0bcd916072a';

-- 3) Prism City — move south and east (x: 16.2 → 45, z: 12.2 → 50)
UPDATE canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 45, "map_z": 50}'::jsonb
WHERE id = 'b6fab815-fea9-4444-b0d3-1af776f4bfcb';

-- 4) Mirror Post — move east (x: 12.9 → 42, keep z)
UPDATE canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 42, "map_z": 10.8}'::jsonb
WHERE id = 'fda2208b-5b3e-4699-9a4b-fc8930705e0f';
