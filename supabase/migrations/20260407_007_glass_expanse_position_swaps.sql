-- Glass Expanse: swap positions of Prism City, Glass Reach, and Vell Glass
-- Prism City  (45, 50)     → Glass Reach's old position (42.15, 40.02)
-- Glass Reach (42.15, 40.02) → Vell Glass's old position (37.63, 26.64)
-- Vell Glass  (37.63, 26.64) → Prism City's old position (45, 50)

-- 1) Prism City → Glass Reach's position
UPDATE canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 42.15, "map_z": 40.02}'::jsonb
WHERE id = 'b6fab815-fea9-4444-b0d3-1af776f4bfcb';

-- 2) Glass Reach → Vell Glass's position
UPDATE canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 37.63, "map_z": 26.64}'::jsonb
WHERE id = '34dd8e58-f7a8-49c2-99d9-9c576f1c2d21';

-- 3) Vell Glass → Prism City's position
UPDATE canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 45, "map_z": 50}'::jsonb
WHERE id = '78337381-fef8-4c74-ac77-d095e56d5fde';
