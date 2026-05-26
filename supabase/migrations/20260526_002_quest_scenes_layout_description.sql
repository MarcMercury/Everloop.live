-- Add a dedicated layout-description column to quest scenes.
-- This is a separate, layout-oriented text block (geometry, scale, exits,
-- terrain, cover, hazards, lighting) used EXCLUSIVELY as the prompt input
-- for the "Generate Map" action. Keeping it separate from `description`
-- (player-facing summary) and `narration` (read-aloud) lets the DM iterate
-- on the map without disturbing the scene's story text.

ALTER TABLE quest_scenes
  ADD COLUMN IF NOT EXISTS layout_description TEXT;

NOTIFY pgrst, 'reload schema';
