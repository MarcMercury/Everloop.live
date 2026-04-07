-- Move Virelay Coast locations: Kelport, Coris Reach, Darnis Bay

-- Kelport: (35, 62) → (55, 58)  [+20 right, -4 up]
UPDATE canon_entities
SET metadata = COALESCE(metadata, '{}') || '{"map_x": 55, "map_z": 58}'
WHERE name = 'Kelport' AND status = 'canonical';

-- Coris Reach: (hash ~84.37, ~84.38) → (86.37, 79.38)  [+2 right, -5 up]
UPDATE canon_entities
SET metadata = COALESCE(metadata, '{}') || '{"map_x": 86.37, "map_z": 79.38}'
WHERE name = 'Coris Reach' AND status = 'canonical';

-- Darnis Bay: (hash ~75.79, ~75.80) → (72.79, 67.80)  [-3 left, -8 up]
UPDATE canon_entities
SET metadata = COALESCE(metadata, '{}') || '{"map_x": 72.79, "map_z": 67.80}'
WHERE name = 'Darnis Bay' AND status = 'canonical';
