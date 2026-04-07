-- Halven Shore: (~47.35, ~47.36) → (35.35, 35.36)  [-12 left, -12 up]
UPDATE canon_entities
SET metadata = COALESCE(metadata, '{}') || '{"map_x": 35.35, "map_z": 35.36}'
WHERE name = 'Halven Shore' AND status = 'canonical';
