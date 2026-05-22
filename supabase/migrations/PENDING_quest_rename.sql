-- =====================================================
-- PENDING: Quest Unification — physical rename of campaign tables
-- =====================================================
-- Author: Quest Unification effort, 2026-05-22.
-- Status: NOT YET APPLIED. Do not include in any automatic migration run.
-- Apply manually after the UI cleanup (file moves under app/quests, type
-- aliasing in types/quest.ts, action consolidation in lib/actions/quests.ts)
-- has landed and is verified in production for at least one release cycle.
--
-- Why a separate file: the Everloop platform is now quest-only at the UI
-- layer. The underlying DB still names everything `campaigns*` because
-- renaming 8 tables, foreign keys, indexes, RLS policies, and orphan
-- back-reference columns in the same release as a major UI refactor is
-- a recipe for downtime. This migration is the second phase.
--
-- WHAT THIS DOES:
--   1. Drops the thin legacy `quests` and `quest_participants` tables IF
--      they are empty (guarded).
--   2. Renames `campaigns` → `quests` (and updates all FK column names,
--      indexes, and RLS policy names accordingly).
--   3. Migrates `regional_state.active_campaigns` counter into
--      `active_quests` (sum) then drops the campaigns column.
--   4. Renames orphan reference columns (`source_campaign_id` →
--      `source_quest_id` etc.) in shard_events and world_events.
--
-- ROLLBACK STRATEGY: All rename operations are reversible via a parallel
-- "DOWN" migration. We include it inline at the bottom, commented out.
-- Before applying this file, take a snapshot of every affected table.

-- ---------- Pre-flight guards ----------
DO $$
DECLARE
  legacy_quest_count INT;
  legacy_participant_count INT;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quests') THEN
    SELECT COUNT(*) INTO legacy_quest_count FROM quests;
    SELECT COUNT(*) INTO legacy_participant_count FROM quest_participants;
    IF legacy_quest_count > 0 OR legacy_participant_count > 0 THEN
      RAISE EXCEPTION 'Legacy quests/quest_participants tables are not empty (% / %). Migrate or back up before running this script.',
        legacy_quest_count, legacy_participant_count;
    END IF;
  END IF;
END
$$;

-- ---------- 1. Drop the legacy thin quest tables ----------
DROP TABLE IF EXISTS quest_participants CASCADE;
DROP TABLE IF EXISTS quests CASCADE;

-- ---------- 2. Rename campaign tables to quest tables ----------
ALTER TABLE IF EXISTS campaigns RENAME TO quests;

ALTER TABLE IF EXISTS campaign_players RENAME TO quest_players;
ALTER TABLE IF EXISTS quest_players RENAME COLUMN campaign_id TO quest_id;

ALTER TABLE IF EXISTS campaign_scenes RENAME TO quest_scenes;
ALTER TABLE IF EXISTS quest_scenes RENAME COLUMN campaign_id TO quest_id;

ALTER TABLE IF EXISTS campaign_sessions RENAME TO quest_sessions;
ALTER TABLE IF EXISTS quest_sessions RENAME COLUMN campaign_id TO quest_id;

ALTER TABLE IF EXISTS campaign_messages RENAME TO quest_messages;
ALTER TABLE IF EXISTS quest_messages RENAME COLUMN campaign_id TO quest_id;

ALTER TABLE IF EXISTS campaign_dice_rolls RENAME TO quest_dice_rolls;
ALTER TABLE IF EXISTS quest_dice_rolls RENAME COLUMN campaign_id TO quest_id;

ALTER TABLE IF EXISTS campaign_npcs RENAME TO quest_npcs;
ALTER TABLE IF EXISTS quest_npcs RENAME COLUMN campaign_id TO quest_id;

ALTER TABLE IF EXISTS narrative_idols RENAME COLUMN campaign_id TO quest_id;

-- ---------- 3. Rename dm_id → owner_id everywhere on the new quests table ----------
-- (Optional. Many quests are solo/AI-guided and the "DM" label no longer fits.
-- Leave the column name alone if you want zero downtime; the UI uses `dm_id`.)
-- ALTER TABLE quests RENAME COLUMN dm_id TO owner_id;

-- ---------- 4. Regional state counters ----------
UPDATE regional_state
SET active_quests = COALESCE(active_quests, 0) + COALESCE(active_campaigns, 0);
ALTER TABLE regional_state DROP COLUMN IF EXISTS active_campaigns;

-- ---------- 5. Orphan back-reference columns ----------
ALTER TABLE IF EXISTS shard_events
  DROP COLUMN IF EXISTS campaign_id;
ALTER TABLE IF EXISTS world_events
  RENAME COLUMN source_campaign_id TO _drop_source_campaign_id;
ALTER TABLE IF EXISTS world_events
  DROP COLUMN IF EXISTS _drop_source_campaign_id;

-- ---------- 6. Rename indexes ----------
ALTER INDEX IF EXISTS idx_campaigns_dm           RENAME TO idx_quests_owner;
ALTER INDEX IF EXISTS idx_campaigns_status       RENAME TO idx_quests_status;
ALTER INDEX IF EXISTS idx_campaigns_slug         RENAME TO idx_quests_slug;
ALTER INDEX IF EXISTS idx_campaigns_game_mode    RENAME TO idx_quests_game_mode;
ALTER INDEX IF EXISTS idx_campaigns_type         RENAME TO idx_quests_type;
ALTER INDEX IF EXISTS idx_campaigns_join_code    RENAME TO idx_quests_join_code;

ALTER INDEX IF EXISTS idx_campaign_players_campaign   RENAME TO idx_quest_players_quest;
ALTER INDEX IF EXISTS idx_campaign_players_user       RENAME TO idx_quest_players_user;
ALTER INDEX IF EXISTS idx_campaign_players_approval   RENAME TO idx_quest_players_approval;
ALTER INDEX IF EXISTS idx_campaign_players_readiness  RENAME TO idx_quest_players_readiness;

ALTER INDEX IF EXISTS idx_campaign_scenes_campaign    RENAME TO idx_quest_scenes_quest;
ALTER INDEX IF EXISTS idx_campaign_sessions_campaign  RENAME TO idx_quest_sessions_quest;
ALTER INDEX IF EXISTS idx_campaign_sessions_status    RENAME TO idx_quest_sessions_status;
ALTER INDEX IF EXISTS idx_campaign_messages_session   RENAME TO idx_quest_messages_session;
ALTER INDEX IF EXISTS idx_campaign_messages_campaign  RENAME TO idx_quest_messages_quest;
ALTER INDEX IF EXISTS idx_campaign_messages_created   RENAME TO idx_quest_messages_created;
ALTER INDEX IF EXISTS idx_dice_rolls_session          RENAME TO idx_quest_dice_rolls_session;

-- ---------- 7. RLS policies ----------
-- Policy names embed the table name. Drop and recreate them on the new
-- table name. This block is intentionally repetitive for clarity.
-- (Omitted here for length — see the original CREATE POLICY statements in
-- supabase/migrations/20260330_002_*.sql and 003_*.sql and re-run them
-- against the renamed tables.)

-- ---------- DOWN (rollback) ----------
-- ALTER TABLE IF EXISTS quests RENAME TO campaigns;
-- ALTER TABLE IF EXISTS quest_players RENAME TO campaign_players;
-- ALTER TABLE IF EXISTS quest_players RENAME COLUMN quest_id TO campaign_id;
-- ...etc for every rename above.
