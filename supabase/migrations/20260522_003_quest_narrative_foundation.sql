-- Quest Narrative Foundation
-- Additive schema for: Stakes triad, scene narration scaffold, session-zero safety,
-- heart anchors, NPC motivation-first fields, world cogs, reflection loop, tone-aware messages.
-- All columns nullable / defaulted; safe to ship behind UI flags.

-- =====================================================
-- QUESTS: Hook + Stakes Triad
-- =====================================================
ALTER TABLE quests
  ADD COLUMN IF NOT EXISTS hook TEXT,
  ADD COLUMN IF NOT EXISTS stakes_personal TEXT,
  ADD COLUMN IF NOT EXISTS stakes_world TEXT,
  ADD COLUMN IF NOT EXISTS stakes_mystery TEXT;

-- =====================================================
-- QUEST_SCENES: Narration scaffold (Feeling / Reveal / Choice + Sensory + Pacing)
-- =====================================================
ALTER TABLE quest_scenes
  ADD COLUMN IF NOT EXISTS feeling TEXT,
  ADD COLUMN IF NOT EXISTS reveal TEXT,
  ADD COLUMN IF NOT EXISTS choice TEXT,
  ADD COLUMN IF NOT EXISTS sensory_anchors TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pacing TEXT;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'quest_scenes_pacing_check'
  ) THEN
    ALTER TABLE quest_scenes
      ADD CONSTRAINT quest_scenes_pacing_check
      CHECK (pacing IS NULL OR pacing IN ('slow','medium','fast'));
  END IF;
END $$;

-- =====================================================
-- QUEST_MESSAGES: Tone-aware delivery
-- =====================================================
ALTER TABLE quest_messages
  ADD COLUMN IF NOT EXISTS tone TEXT;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'quest_messages_tone_check'
  ) THEN
    ALTER TABLE quest_messages
      ADD CONSTRAINT quest_messages_tone_check
      CHECK (tone IS NULL OR tone IN ('hushed','steady','urgent','grim','wondrous'));
  END IF;
END $$;

-- =====================================================
-- QUEST_SESSIONS: Quill (handoff), Spotlight reflection
-- =====================================================
ALTER TABLE quest_sessions
  ADD COLUMN IF NOT EXISTS quill_holder UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS spotlight_player_ids UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS surprise_moment TEXT,
  ADD COLUMN IF NOT EXISTS party_lesson TEXT;

-- =====================================================
-- QUEST_NPCS: Motivation-first + lore grounding
-- =====================================================
ALTER TABLE quest_npcs
  ADD COLUMN IF NOT EXISTS wants TEXT,
  ADD COLUMN IF NOT EXISTS wont TEXT,
  ADD COLUMN IF NOT EXISTS quirk TEXT,
  ADD COLUMN IF NOT EXISTS voice_note TEXT,
  ADD COLUMN IF NOT EXISTS why_here TEXT,
  ADD COLUMN IF NOT EXISTS shard_ref INTEGER REFERENCES shards(id) ON DELETE SET NULL;

-- =====================================================
-- QUEST_PLAYERS: Session Zero safety + heart anchors + player wishes
-- =====================================================
ALTER TABLE quest_players
  ADD COLUMN IF NOT EXISTS lines_text TEXT,
  ADD COLUMN IF NOT EXISTS veils_text TEXT,
  ADD COLUMN IF NOT EXISTS tone_preference TEXT,
  ADD COLUMN IF NOT EXISTS session_zero_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS heart_anchors JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS player_wish TEXT;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'quest_players_tone_pref_check'
  ) THEN
    ALTER TABLE quest_players
      ADD CONSTRAINT quest_players_tone_pref_check
      CHECK (tone_preference IS NULL OR tone_preference IN ('light','mixed','dark'));
  END IF;
END $$;

-- =====================================================
-- WORLD_COGS: The living world background gears
-- =====================================================
CREATE TABLE IF NOT EXISTS world_cogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  faction TEXT NOT NULL,
  goal TEXT NOT NULL,
  tempo TEXT NOT NULL DEFAULT 'steady' CHECK (tempo IN ('crawl','steady','rushing')),
  current_state TEXT,
  next_beat TEXT,
  visible_to_players BOOLEAN NOT NULL DEFAULT false,
  shard_ref INTEGER REFERENCES shards(id) ON DELETE SET NULL,
  fray_ref UUID REFERENCES canon_entities(id) ON DELETE SET NULL,
  last_advanced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS world_cogs_quest_id_idx ON world_cogs(quest_id);
CREATE INDEX IF NOT EXISTS world_cogs_visible_idx ON world_cogs(quest_id, visible_to_players);

ALTER TABLE world_cogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "world_cogs_dm_full_access" ON world_cogs;
CREATE POLICY "world_cogs_dm_full_access" ON world_cogs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quests q
      WHERE q.id = world_cogs.quest_id
        AND q.dm_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "world_cogs_players_visible" ON world_cogs;
CREATE POLICY "world_cogs_players_visible" ON world_cogs
  FOR SELECT USING (
    visible_to_players = true
    AND EXISTS (
      SELECT 1 FROM quest_players qp
      WHERE qp.quest_id = world_cogs.quest_id
        AND qp.user_id = auth.uid()
        AND qp.status = 'accepted'
    )
  );

-- updated_at trigger
CREATE OR REPLACE FUNCTION world_cogs_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS world_cogs_updated_at ON world_cogs;
CREATE TRIGGER world_cogs_updated_at
  BEFORE UPDATE ON world_cogs
  FOR EACH ROW EXECUTE FUNCTION world_cogs_set_updated_at();
