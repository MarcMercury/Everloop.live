-- =====================================================
-- Add physical characteristics columns to player_characters
-- height, weight, age, eyes, hair, skin, faith
-- =====================================================

ALTER TABLE public.player_characters
  ADD COLUMN IF NOT EXISTS height TEXT,
  ADD COLUMN IF NOT EXISTS weight TEXT,
  ADD COLUMN IF NOT EXISTS age TEXT,
  ADD COLUMN IF NOT EXISTS eyes TEXT,
  ADD COLUMN IF NOT EXISTS hair TEXT,
  ADD COLUMN IF NOT EXISTS skin TEXT,
  ADD COLUMN IF NOT EXISTS faith TEXT;
