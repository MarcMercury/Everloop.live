-- Add a scene illustration column (separate from the tactical map).
-- The "Generate Image" button on the scene builder stores an atmospheric
-- illustration here (character portrait, monster, riddle visual, etc.) to
-- help set the mood. The existing `map_url` remains the top-down battle map.

ALTER TABLE quest_scenes
  ADD COLUMN IF NOT EXISTS image_url TEXT;

NOTIFY pgrst, 'reload schema';
