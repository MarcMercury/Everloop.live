-- Move Coris Reach: 4 north, 1 west
-- Current: (86.37, 79.38) → New: (85.37, 75.38)

UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 85.37, "map_z": 75.38}'::jsonb
WHERE name = 'Coris Reach' AND status = 'canonical';

-- Move Vell Glass: 4 units south of Prism City
-- Prism City is at (42.15, 40.02), so Vell Glass → (42.15, 44.02)

UPDATE public.canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"map_x": 42.15, "map_z": 44.02}'::jsonb
WHERE name = 'Vell Glass' AND status = 'canonical';
