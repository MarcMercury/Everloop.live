-- =====================================================
-- CAMPAIGN FORGE + QUEST SYSTEM MIGRATION
-- Two-product split: DM Studio vs Quest Portal
-- Enhanced campaign creation, roster binding, quests
-- =====================================================

-- =====================================================
-- 1. ENHANCE CAMPAIGNS TABLE
-- Add Campaign Forge settings (new columns)
-- =====================================================

-- Campaign type: the top-level product fork
ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS campaign_type TEXT NOT NULL DEFAULT 'dm_led'
        CHECK (campaign_type IN ('dm_led', 'quest'));

-- Campaign identity
ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS setting_name TEXT DEFAULT 'custom'
        CHECK (setting_name IN ('custom', 'forgotten_realms', 'everloop_world', 'other'));

ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS tone TEXT DEFAULT 'light_adventure'
        CHECK (tone IN ('light_adventure', 'dark_horror', 'political_intrigue', 'chaotic_experimental'));

-- Campaign length template
ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS campaign_length TEXT DEFAULT 'full_campaign'
        CHECK (campaign_length IN ('one_shot', 'short_arc', 'full_campaign', 'endless'));

-- Difficulty system
ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS difficulty_preset TEXT DEFAULT 'standard'
        CHECK (difficulty_preset IN ('story_mode', 'standard', 'brutal', 'chaos'));

ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS difficulty_sliders JSONB DEFAULT '{
        "combat_lethality": 50,
        "resource_scarcity": 50,
        "puzzle_complexity": 50,
        "social_consequence": 50,
        "random_event_frequency": 50
    }';

-- Ruleset configuration
ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS ruleset JSONB DEFAULT '{
        "core_rules": "dnd_5e",
        "initiative_tracking": true,
        "advantage_disadvantage": true,
        "spell_slot_tracking": true,
        "concentration_tracking": true,
        "encumbrance": false,
        "critical_rules": "standard",
        "combat_mode": "tactical_grid"
    }';

-- Progression system
ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS progression JSONB DEFAULT '{
        "leveling_style": "milestone",
        "progression_speed": "standard",
        "feats_enabled": true,
        "multiclassing_enabled": true,
        "custom_abilities_enabled": false
    }';

-- Narrative engine settings
ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS narrative_settings JSONB DEFAULT '{
        "hidden_info_level": "off",
        "event_engine_intensity": "off",
        "scene_based_mode": false
    }';

-- Idol system settings (separate from the general settings JSONB)
ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS idol_settings JSONB DEFAULT '{
        "enabled": true,
        "who_earns": "individuals",
        "when_usable": "anytime",
        "effects_allowed": ["reroll", "reveal", "shield", "shift", "immunity"]
    }';

-- World structure
ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS world_structure TEXT DEFAULT 'linear'
        CHECK (world_structure IN ('linear', 'branching', 'open_world', 'looping'));

ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS world_persistence TEXT DEFAULT 'persistent'
        CHECK (world_persistence IN ('session_reset', 'persistent', 'evolving'));

-- Immersion settings
ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS immersion JSONB DEFAULT '{
        "music": true,
        "ambient_effects": true,
        "visual_effects_intensity": "medium",
        "dice_animation": "standard"
    }';

-- Player configuration
ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS player_config JSONB DEFAULT '{
        "role_types": "standard_party",
        "knowledge_level": "shared"
    }';

-- AI assist level
ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS ai_assist_level TEXT DEFAULT 'assistant'
        CHECK (ai_assist_level IN ('off', 'assistant', 'co_dm', 'director'));

-- Character entry/approval rules
ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS character_entry_mode TEXT DEFAULT 'bring_own'
        CHECK (character_entry_mode IN ('pre_generated', 'bring_own', 'create_new', 'dm_approval'));

ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS character_rules JSONB DEFAULT '{
        "min_level": 1,
        "max_level": 20,
        "allowed_classes": [],
        "everloop_classes_allowed": false,
        "stat_generation": "any",
        "inventory_restrictions": []
    }';

-- Join system
ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE;

-- =====================================================
-- 2. UPDATE CAMPAIGN STATUS VALUES
-- draft → lobby → ready → active → paused → complete → archived
-- =====================================================

-- Drop existing check constraint and replace
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE public.campaigns
    ADD CONSTRAINT campaigns_status_check
        CHECK (status IN ('draft', 'lobby', 'ready', 'active', 'paused', 'complete', 'archived',
                          -- Keep backward compat for existing data
                          'recruiting', 'in_progress', 'completed'));

-- Update existing data to new statuses
UPDATE public.campaigns SET status = 'lobby' WHERE status = 'recruiting';
UPDATE public.campaigns SET status = 'active' WHERE status = 'in_progress';
UPDATE public.campaigns SET status = 'complete' WHERE status = 'completed';

-- Now tighten the constraint
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE public.campaigns
    ADD CONSTRAINT campaigns_status_check
        CHECK (status IN ('draft', 'lobby', 'ready', 'active', 'paused', 'complete', 'archived'));

-- =====================================================
-- 3. ENHANCE CAMPAIGN PLAYERS (ROSTER BINDING)
-- Add campaign-specific overlay fields
-- =====================================================

-- Party role within campaign
ALTER TABLE public.campaign_players
    ADD COLUMN IF NOT EXISTS party_role TEXT DEFAULT NULL
        CHECK (party_role IS NULL OR party_role IN ('tank', 'healer', 'dps', 'support', 'utility', 'custom'));

-- Campaign-specific HP overlay (separate from character base HP)
ALTER TABLE public.campaign_players
    ADD COLUMN IF NOT EXISTS campaign_hp INTEGER DEFAULT NULL;

ALTER TABLE public.campaign_players
    ADD COLUMN IF NOT EXISTS campaign_max_hp INTEGER DEFAULT NULL;

-- Campaign-specific inventory changes
ALTER TABLE public.campaign_players
    ADD COLUMN IF NOT EXISTS campaign_inventory JSONB DEFAULT '[]';

-- Secrecy flags
ALTER TABLE public.campaign_players
    ADD COLUMN IF NOT EXISTS secrecy_flags JSONB DEFAULT '{}';

-- Readiness state for lobby
ALTER TABLE public.campaign_players
    ADD COLUMN IF NOT EXISTS readiness_state TEXT DEFAULT 'not_ready'
        CHECK (readiness_state IN ('not_ready', 'ready', 'away'));

-- Character approval state
ALTER TABLE public.campaign_players
    ADD COLUMN IF NOT EXISTS approval_state TEXT DEFAULT 'pending_character'
        CHECK (approval_state IN ('pending_character', 'awaiting_approval', 'approved', 'rejected'));

-- Session attendance tracking
ALTER TABLE public.campaign_players
    ADD COLUMN IF NOT EXISTS attendance JSONB DEFAULT '[]';

-- DM private notes about this participant
ALTER TABLE public.campaign_players
    ADD COLUMN IF NOT EXISTS dm_notes TEXT;

-- Permission level
ALTER TABLE public.campaign_players
    ADD COLUMN IF NOT EXISTS permission_level TEXT DEFAULT 'full'
        CHECK (permission_level IN ('full', 'limited', 'spectator'));

-- Everloop narrative tags
ALTER TABLE public.campaign_players
    ADD COLUMN IF NOT EXISTS everloop_traits TEXT[] DEFAULT '{}';

-- =====================================================
-- 4. QUESTS TABLE (Quester Mode)
-- AI-guided / public / solo experiences
-- =====================================================

CREATE TABLE IF NOT EXISTS public.quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    cover_image_url TEXT,

    -- Quest type
    quest_type TEXT NOT NULL DEFAULT 'solo'
        CHECK (quest_type IN ('solo', 'paired', 'party', 'public', 'ai_guided')),

    -- Difficulty
    difficulty TEXT DEFAULT 'standard'
        CHECK (difficulty IN ('story_mode', 'standard', 'brutal', 'chaos')),

    -- Timing
    estimated_duration TEXT DEFAULT '1-2 hours',

    -- Players
    min_participants INTEGER DEFAULT 1 CHECK (min_participants >= 1),
    max_participants INTEGER DEFAULT 1 CHECK (max_participants >= 1),

    -- Everloop integration
    world_era TEXT DEFAULT 'current',
    everloop_overlay BOOLEAN DEFAULT true,
    referenced_entities UUID[] DEFAULT '{}',

    -- AI narrator configuration
    ai_narrator_config JSONB DEFAULT '{
        "style": "atmospheric",
        "pacing": "moderate",
        "detail_level": "rich",
        "character_interaction": true,
        "branching_narrative": true
    }',

    -- Quest content/structure
    quest_structure JSONB DEFAULT '{
        "acts": [],
        "encounters": [],
        "rewards": [],
        "branching_points": []
    }',

    -- Status
    status TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('draft', 'available', 'featured', 'in_progress', 'completed', 'archived')),

    -- Who built this quest
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_official BOOLEAN DEFAULT false,

    -- Stats
    times_played INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,

    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published quests are viewable by everyone"
    ON public.quests FOR SELECT
    USING (status IN ('available', 'featured') OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create quests"
    ON public.quests FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update own quests"
    ON public.quests FOR UPDATE
    USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete own draft quests"
    ON public.quests FOR DELETE
    USING (auth.uid() = created_by AND status = 'draft');

GRANT SELECT ON public.quests TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quests TO authenticated;
GRANT SELECT ON public.quests TO anon;

CREATE INDEX IF NOT EXISTS idx_quests_status ON public.quests(status);
CREATE INDEX IF NOT EXISTS idx_quests_type ON public.quests(quest_type);
CREATE INDEX IF NOT EXISTS idx_quests_slug ON public.quests(slug);

-- =====================================================
-- 5. QUEST PARTICIPANTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.quest_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    character_id UUID REFERENCES public.player_characters(id) ON DELETE SET NULL,

    -- Status
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'completed', 'abandoned')),

    -- Progress
    current_act INTEGER DEFAULT 1,
    progress_data JSONB DEFAULT '{}',

    -- Character state snapshot (preserved during quest)
    character_state_snapshot JSONB DEFAULT '{}',

    joined_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    UNIQUE(quest_id, user_id)
);

ALTER TABLE public.quest_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can see own quest data"
    ON public.quest_participants FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can join quests"
    ON public.quest_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
    ON public.quest_participants FOR UPDATE
    USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.quest_participants TO authenticated;

CREATE INDEX IF NOT EXISTS idx_quest_participants_quest ON public.quest_participants(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_participants_user ON public.quest_participants(user_id);

-- =====================================================
-- 6. EVERLOOP NARRATIVE TAGS TABLE
-- Predefined narrative traits for character-campaign interaction
-- =====================================================

CREATE TABLE IF NOT EXISTS public.everloop_narrative_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general'
        CHECK (category IN ('perception', 'destiny', 'corruption', 'memory', 'power', 'general')),
    campaign_effects JSONB DEFAULT '{}',
    -- e.g. {"custom_visions": true, "secret_lore": true, "alternate_perceptions": true}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.everloop_narrative_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Narrative tags are viewable by everyone"
    ON public.everloop_narrative_tags FOR SELECT
    USING (true);

GRANT SELECT ON public.everloop_narrative_tags TO authenticated;
GRANT SELECT ON public.everloop_narrative_tags TO anon;

-- Seed default narrative tags
INSERT INTO public.everloop_narrative_tags (tag_name, display_name, description, category, campaign_effects) VALUES
    ('memory_fractured', 'Memory-Fractured', 'Your memories shift between loops. You recall things that haven''t happened yet—or never will.', 'memory', '{"custom_visions": true, "unreliable_recall": true}'),
    ('dream_sensitive', 'Dream-Sensitive', 'The boundary between waking and dreaming is thin for you. You perceive echoes of the Dreaming.', 'perception', '{"dream_visions": true, "alternate_perceptions": true}'),
    ('shard_touched', 'Shard-Touched', 'A shard of the Everloop has marked you. Its power flows through you—but at what cost?', 'power', '{"shard_resonance": true, "unstable_reality": true}'),
    ('oathbound', 'Oathbound', 'You are bound by a sacred oath to forces beyond mortal understanding. Breaking it would shatter you.', 'destiny', '{"oath_compulsion": true, "divine_perception": true}'),
    ('fold_marked', 'Fold-Marked', 'You bear the mark of a reality fold. Doors open for you that others cannot see.', 'perception', '{"hidden_passages": true, "fold_detection": true}'),
    ('void_whispered', 'Void-Whispered', 'The Void speaks to you in moments of silence. Its truths are terrible and beautiful.', 'corruption', '{"void_knowledge": true, "sanity_risk": true}'),
    ('loop_aware', 'Loop-Aware', 'You sense when the Loop resets. You feel the seams of reality pulling apart and knitting back.', 'memory', '{"loop_detection": true, "deja_vu": true}'),
    ('fray_born', 'Fray-Born', 'You were born from a tear in reality itself. Chaos is your native state.', 'power', '{"fray_affinity": true, "chaos_resistance": true}'),
    ('pattern_reader', 'Pattern-Reader', 'You can read the underlying pattern of reality—the mathematical truth beneath the story.', 'perception', '{"pattern_sight": true, "prophecy": true}'),
    ('echo_walker', 'Echo-Walker', 'You can step into echoes of past events, walking through moments that have already passed.', 'memory', '{"echo_travel": true, "past_perception": true}')
ON CONFLICT (tag_name) DO NOTHING;

-- =====================================================
-- 7. GENERATE JOIN CODE FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generate 6-char alphanumeric code
        code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
        -- Check uniqueness
        SELECT count(*) INTO exists_count FROM public.campaigns WHERE join_code = code;
        EXIT WHEN exists_count = 0;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. UPDATE TRIGGERS
-- =====================================================

CREATE TRIGGER update_quests_updated_at
    BEFORE UPDATE ON public.quests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. INDEXES FOR NEW COLUMNS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_campaigns_type ON public.campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_join_code ON public.campaigns(join_code) WHERE join_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_players_approval ON public.campaign_players(approval_state);
CREATE INDEX IF NOT EXISTS idx_campaign_players_readiness ON public.campaign_players(readiness_state);
