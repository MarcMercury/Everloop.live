-- =====================================================
-- Quest Unification — physical rename of campaign tables
-- =====================================================
-- Renames campaign* tables/columns/indexes/FK constraints to quest* names.
-- Drops thin legacy quests/quest_participants tables (operator confirmed
-- no production data to preserve).
--
-- Schema audited against live DB on 2026-05-22:
--   - regional_state has NEITHER active_quests NOR active_campaigns columns.
--   - world_events does NOT have source_campaign_id.
--   - shard_events.campaign_id and narrative_idols.campaign_id exist.
--   - No campaign-named RPC functions exist.
--   - RLS policies stay attached to the renamed tables (policy bodies
--     reference table OIDs, not names; policy names are cosmetic).

-- ---------- 1. Drop the legacy thin quest tables ----------
DROP TABLE IF EXISTS quest_participants CASCADE;
DROP TABLE IF EXISTS quests CASCADE;

-- ---------- 2. Rename tables ----------
ALTER TABLE campaigns RENAME TO quests;
ALTER TABLE campaign_players  RENAME TO quest_players;
ALTER TABLE campaign_scenes   RENAME TO quest_scenes;
ALTER TABLE campaign_sessions RENAME TO quest_sessions;
ALTER TABLE campaign_messages RENAME TO quest_messages;
ALTER TABLE campaign_dice_rolls RENAME TO quest_dice_rolls;
ALTER TABLE campaign_npcs     RENAME TO quest_npcs;

-- ---------- 3. Rename columns ----------
ALTER TABLE quest_players     RENAME COLUMN campaign_id TO quest_id;
ALTER TABLE quest_scenes      RENAME COLUMN campaign_id TO quest_id;
ALTER TABLE quest_sessions    RENAME COLUMN campaign_id TO quest_id;
ALTER TABLE quest_messages    RENAME COLUMN campaign_id TO quest_id;
ALTER TABLE quest_dice_rolls  RENAME COLUMN campaign_id TO quest_id;
ALTER TABLE quest_npcs        RENAME COLUMN campaign_id TO quest_id;
ALTER TABLE narrative_idols   RENAME COLUMN campaign_id TO quest_id;

-- ---------- 4. Rename foreign-key constraints ----------
-- PostgREST resource embedding hints reference constraint names. Code now
-- uses `quests_dm_id_fkey`, `quest_players_user_id_fkey`, etc.
ALTER TABLE quests           RENAME CONSTRAINT campaigns_dm_id_fkey                TO quests_dm_id_fkey;
ALTER TABLE quest_players    RENAME CONSTRAINT campaign_players_campaign_id_fkey   TO quest_players_quest_id_fkey;
ALTER TABLE quest_players    RENAME CONSTRAINT campaign_players_user_id_fkey       TO quest_players_user_id_fkey;
ALTER TABLE quest_players    RENAME CONSTRAINT campaign_players_character_id_fkey  TO quest_players_character_id_fkey;
ALTER TABLE quest_scenes     RENAME CONSTRAINT campaign_scenes_campaign_id_fkey    TO quest_scenes_quest_id_fkey;
ALTER TABLE quest_sessions   RENAME CONSTRAINT campaign_sessions_campaign_id_fkey  TO quest_sessions_quest_id_fkey;
ALTER TABLE quest_sessions   RENAME CONSTRAINT campaign_sessions_active_scene_id_fkey TO quest_sessions_active_scene_id_fkey;
ALTER TABLE quest_messages   RENAME CONSTRAINT campaign_messages_campaign_id_fkey  TO quest_messages_quest_id_fkey;
ALTER TABLE quest_messages   RENAME CONSTRAINT campaign_messages_session_id_fkey   TO quest_messages_session_id_fkey;
ALTER TABLE quest_messages   RENAME CONSTRAINT campaign_messages_sender_id_fkey    TO quest_messages_sender_id_fkey;
ALTER TABLE quest_dice_rolls RENAME CONSTRAINT campaign_dice_rolls_campaign_id_fkey TO quest_dice_rolls_quest_id_fkey;
ALTER TABLE quest_dice_rolls RENAME CONSTRAINT campaign_dice_rolls_session_id_fkey  TO quest_dice_rolls_session_id_fkey;
ALTER TABLE quest_dice_rolls RENAME CONSTRAINT campaign_dice_rolls_player_id_fkey   TO quest_dice_rolls_player_id_fkey;
ALTER TABLE quest_npcs       RENAME CONSTRAINT campaign_npcs_campaign_id_fkey       TO quest_npcs_quest_id_fkey;
ALTER TABLE quest_npcs       RENAME CONSTRAINT campaign_npcs_canon_entity_id_fkey   TO quest_npcs_canon_entity_id_fkey;
ALTER TABLE quest_npcs       RENAME CONSTRAINT campaign_npcs_current_scene_id_fkey  TO quest_npcs_current_scene_id_fkey;

-- ---------- 5. Rename indexes ----------
ALTER INDEX IF EXISTS campaigns_pkey                   RENAME TO quests_pkey;
ALTER INDEX IF EXISTS campaigns_slug_key               RENAME TO quests_slug_key;
ALTER INDEX IF EXISTS campaigns_join_code_key          RENAME TO quests_join_code_key;
ALTER INDEX IF EXISTS idx_campaigns_dm                 RENAME TO idx_quests_owner;
ALTER INDEX IF EXISTS idx_campaigns_status             RENAME TO idx_quests_status;
ALTER INDEX IF EXISTS idx_campaigns_slug               RENAME TO idx_quests_slug;
ALTER INDEX IF EXISTS idx_campaigns_game_mode          RENAME TO idx_quests_game_mode;
ALTER INDEX IF EXISTS idx_campaigns_type               RENAME TO idx_quests_type;
ALTER INDEX IF EXISTS idx_campaigns_join_code          RENAME TO idx_quests_join_code;

ALTER INDEX IF EXISTS campaign_players_pkey                   RENAME TO quest_players_pkey;
ALTER INDEX IF EXISTS campaign_players_campaign_id_user_id_key RENAME TO quest_players_quest_id_user_id_key;
ALTER INDEX IF EXISTS idx_campaign_players_campaign           RENAME TO idx_quest_players_quest;
ALTER INDEX IF EXISTS idx_campaign_players_user               RENAME TO idx_quest_players_user;
ALTER INDEX IF EXISTS idx_campaign_players_approval           RENAME TO idx_quest_players_approval;
ALTER INDEX IF EXISTS idx_campaign_players_readiness          RENAME TO idx_quest_players_readiness;

ALTER INDEX IF EXISTS campaign_scenes_pkey         RENAME TO quest_scenes_pkey;
ALTER INDEX IF EXISTS idx_campaign_scenes_campaign RENAME TO idx_quest_scenes_quest;

ALTER INDEX IF EXISTS campaign_sessions_pkey         RENAME TO quest_sessions_pkey;
ALTER INDEX IF EXISTS idx_campaign_sessions_campaign RENAME TO idx_quest_sessions_quest;
ALTER INDEX IF EXISTS idx_campaign_sessions_status   RENAME TO idx_quest_sessions_status;

ALTER INDEX IF EXISTS campaign_messages_pkey         RENAME TO quest_messages_pkey;
ALTER INDEX IF EXISTS idx_campaign_messages_session  RENAME TO idx_quest_messages_session;
ALTER INDEX IF EXISTS idx_campaign_messages_campaign RENAME TO idx_quest_messages_quest;
ALTER INDEX IF EXISTS idx_campaign_messages_created  RENAME TO idx_quest_messages_created;

ALTER INDEX IF EXISTS campaign_dice_rolls_pkey RENAME TO quest_dice_rolls_pkey;
ALTER INDEX IF EXISTS idx_dice_rolls_session   RENAME TO idx_quest_dice_rolls_session;

ALTER INDEX IF EXISTS campaign_npcs_pkey         RENAME TO quest_npcs_pkey;
ALTER INDEX IF EXISTS idx_campaign_npcs_campaign RENAME TO idx_quest_npcs_quest;

-- ---------- 6. Drop the orphan back-reference column on shard_events ----------
ALTER TABLE shard_events DROP COLUMN IF EXISTS campaign_id;
