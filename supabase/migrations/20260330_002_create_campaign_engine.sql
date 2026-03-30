-- =====================================================
-- EVERLOOP LIVE CAMPAIGN ENGINE
-- Interactive D&D-style campaign system
-- Scene-based gameplay with events, idols, atmosphere
-- =====================================================

-- =====================================================
-- CAMPAIGNS
-- The core campaign definition
-- =====================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    cover_image_url TEXT,

    -- DM (Dungeon Master / Director)
    dm_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Game mode determines rules/mechanics
    game_mode TEXT NOT NULL DEFAULT 'classic'
        CHECK (game_mode IN ('classic', 'one_shot', 'survivor', 'mystery', 'social_deception')),

    -- Campaign status
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'recruiting', 'in_progress', 'paused', 'completed', 'archived')),

    -- Settings
    max_players INTEGER DEFAULT 6 CHECK (max_players >= 1 AND max_players <= 20),
    is_public BOOLEAN DEFAULT true,
    allow_spectators BOOLEAN DEFAULT false,

    -- Everloop world integration
    world_era TEXT DEFAULT 'current',
    fray_intensity DECIMAL(3,2) DEFAULT 0.50 CHECK (fray_intensity >= 0 AND fray_intensity <= 1),
    referenced_entities UUID[] DEFAULT '{}',
    referenced_shards UUID[] DEFAULT '{}',

    -- Campaign settings (flexible JSONB for game-mode-specific config)
    settings JSONB DEFAULT '{
        "allow_pvp": false,
        "death_rules": "standard",
        "difficulty": "normal",
        "atmosphere_enabled": true,
        "fog_of_war": true,
        "dynamic_lighting": true,
        "ai_co_dm": true,
        "idol_system": true,
        "max_idols_per_player": 3
    }',

    -- Stats
    session_count INTEGER DEFAULT 0,
    total_play_time_minutes INTEGER DEFAULT 0,

    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Everyone can see public campaigns
CREATE POLICY "Public campaigns are viewable"
    ON public.campaigns FOR SELECT
    USING (is_public = true OR dm_id = auth.uid());

-- Authenticated users can create campaigns
CREATE POLICY "Authenticated users can create campaigns"
    ON public.campaigns FOR INSERT
    WITH CHECK (auth.uid() = dm_id);

-- DMs can update their campaigns
CREATE POLICY "DMs can update own campaigns"
    ON public.campaigns FOR UPDATE
    USING (auth.uid() = dm_id);

-- DMs can delete draft campaigns
CREATE POLICY "DMs can delete draft campaigns"
    ON public.campaigns FOR DELETE
    USING (auth.uid() = dm_id AND status = 'draft');

-- Grants
GRANT SELECT ON public.campaigns TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT SELECT ON public.campaigns TO anon;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_dm ON public.campaigns(dm_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON public.campaigns(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_game_mode ON public.campaigns(game_mode);

-- =====================================================
-- CAMPAIGN PLAYERS
-- Players enrolled in a campaign with their character
-- =====================================================
CREATE TABLE IF NOT EXISTS public.campaign_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    character_id UUID REFERENCES public.player_characters(id) ON DELETE SET NULL,

    -- Player role in this campaign
    role TEXT NOT NULL DEFAULT 'player'
        CHECK (role IN ('player', 'co_dm', 'spectator')),

    -- Status
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'rejected', 'removed', 'left')),

    -- Idol tracking
    idols_held INTEGER DEFAULT 0 CHECK (idols_held >= 0),

    -- Hidden objectives (only visible to this player + DM)
    hidden_objectives JSONB DEFAULT '[]',
    secret_info JSONB DEFAULT '{}',

    -- Stats
    sessions_attended INTEGER DEFAULT 0,
    total_rolls INTEGER DEFAULT 0,
    critical_hits INTEGER DEFAULT 0,
    critical_fails INTEGER DEFAULT 0,

    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(campaign_id, user_id)
);

ALTER TABLE public.campaign_players ENABLE ROW LEVEL SECURITY;

-- Players can see other players in campaigns they belong to
CREATE POLICY "Campaign members can see players"
    ON public.campaign_players FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.campaign_players cp
            WHERE cp.campaign_id = campaign_players.campaign_id
            AND cp.user_id = auth.uid()
            AND cp.status = 'accepted'
        )
        OR EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_players.campaign_id
            AND c.dm_id = auth.uid()
        )
    );

CREATE POLICY "Users can join campaigns"
    ON public.campaign_players FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Players or DMs can update"
    ON public.campaign_players FOR UPDATE
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_players.campaign_id
            AND c.dm_id = auth.uid()
        )
    );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_players TO authenticated;

CREATE INDEX IF NOT EXISTS idx_campaign_players_campaign ON public.campaign_players(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_players_user ON public.campaign_players(user_id);

-- =====================================================
-- CAMPAIGN SCENES
-- Scene-based gameplay (the heart of the engine)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.campaign_scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    description TEXT,
    scene_order INTEGER NOT NULL DEFAULT 0,

    -- Scene type
    scene_type TEXT NOT NULL DEFAULT 'narrative'
        CHECK (scene_type IN ('narrative', 'combat', 'exploration', 'social', 'puzzle', 'rest', 'boss', 'event')),

    -- Mood & atmosphere
    mood TEXT DEFAULT 'neutral'
        CHECK (mood IN ('tense', 'mysterious', 'peaceful', 'chaotic', 'dark', 'triumphant', 'neutral', 'horror', 'wonder', 'melancholy')),
    
    atmosphere JSONB DEFAULT '{
        "ambient_sound": null,
        "music_track": null,
        "lighting": "normal",
        "weather": null,
        "time_of_day": "day",
        "visual_filter": null
    }',

    -- Map/visual
    map_url TEXT,
    map_data JSONB DEFAULT '{}',
    fog_of_war JSONB DEFAULT '{}',

    -- Event triggers (the Event Engine)
    triggers JSONB DEFAULT '[]',
    -- Example trigger: {
    --   "id": "uuid",
    --   "type": "roll_fail" | "timer" | "hp_threshold" | "idol_used" | "custom",
    --   "condition": { ... },
    --   "effect": { "type": "spawn_npc" | "change_scene" | "narrative" | "damage" | "reveal" | ... },
    --   "fired": false,
    --   "hidden": true
    -- }

    -- NPCs present in this scene
    npcs JSONB DEFAULT '[]',

    -- DM notes (private)
    dm_notes TEXT,

    -- Narration text (read aloud)
    narration TEXT,

    -- Scene status
    status TEXT NOT NULL DEFAULT 'prepared'
        CHECK (status IN ('prepared', 'active', 'completed', 'skipped')),

    -- Linked lore
    linked_entities UUID[] DEFAULT '{}',

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.campaign_scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign members can see scenes"
    ON public.campaign_scenes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_scenes.campaign_id
            AND (
                c.dm_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.campaign_players cp
                    WHERE cp.campaign_id = c.id
                    AND cp.user_id = auth.uid()
                    AND cp.status = 'accepted'
                )
            )
        )
    );

CREATE POLICY "DMs can manage scenes"
    ON public.campaign_scenes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_scenes.campaign_id
            AND c.dm_id = auth.uid()
        )
    );

CREATE POLICY "DMs can update scenes"
    ON public.campaign_scenes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_scenes.campaign_id
            AND c.dm_id = auth.uid()
        )
    );

CREATE POLICY "DMs can delete scenes"
    ON public.campaign_scenes FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_scenes.campaign_id
            AND c.dm_id = auth.uid()
        )
    );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_scenes TO authenticated;

CREATE INDEX IF NOT EXISTS idx_campaign_scenes_campaign ON public.campaign_scenes(campaign_id);

-- =====================================================
-- CAMPAIGN SESSIONS
-- Live game sessions (a play session within a campaign)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.campaign_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    session_number INTEGER NOT NULL DEFAULT 1,
    title TEXT,

    -- Current state
    status TEXT NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'active', 'paused', 'completed')),
    
    active_scene_id UUID REFERENCES public.campaign_scenes(id) ON DELETE SET NULL,

    -- Turn tracking
    initiative_order JSONB DEFAULT '[]',
    current_turn_index INTEGER DEFAULT 0,
    round_number INTEGER DEFAULT 0,
    is_combat BOOLEAN DEFAULT false,

    -- Session-level fray intensity (can shift during play)
    fray_intensity DECIMAL(3,2) DEFAULT 0.50,

    -- Timing
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 0,

    -- Summary (post-session)
    summary TEXT,
    highlights JSONB DEFAULT '[]',

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.campaign_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign members can see sessions"
    ON public.campaign_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_sessions.campaign_id
            AND (
                c.dm_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.campaign_players cp
                    WHERE cp.campaign_id = c.id
                    AND cp.user_id = auth.uid()
                    AND cp.status = 'accepted'
                )
            )
        )
    );

CREATE POLICY "DMs can manage sessions"
    ON public.campaign_sessions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_sessions.campaign_id
            AND c.dm_id = auth.uid()
        )
    );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_sessions TO authenticated;

CREATE INDEX IF NOT EXISTS idx_campaign_sessions_campaign ON public.campaign_sessions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sessions_status ON public.campaign_sessions(status);

-- =====================================================
-- CAMPAIGN MESSAGES
-- Chat, narration, whispers, system messages
-- =====================================================
CREATE TABLE IF NOT EXISTS public.campaign_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.campaign_sessions(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Message type
    message_type TEXT NOT NULL DEFAULT 'chat'
        CHECK (message_type IN (
            'chat',           -- Public player chat
            'whisper',        -- Private DM-to-player or player-to-DM
            'narration',      -- DM narration (read-aloud text)
            'system',         -- System events (joins, leaves, scene changes)
            'roll',           -- Dice roll results
            'ai_narration',   -- AI co-DM generated narration
            'event',          -- Triggered event notification
            'idol'            -- Idol usage notification
        )),

    content TEXT NOT NULL,

    -- For whispers: who can see this
    visible_to UUID[] DEFAULT '{}',

    -- For rolls: the roll data
    roll_data JSONB,

    -- For events/idols: reference data
    reference_data JSONB,

    -- Character name (cached for display)
    character_name TEXT,

    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.campaign_messages ENABLE ROW LEVEL SECURITY;

-- Messages visible to campaign members (whisper filtering done in app layer)
CREATE POLICY "Campaign members can see messages"
    ON public.campaign_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_messages.campaign_id
            AND (
                c.dm_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.campaign_players cp
                    WHERE cp.campaign_id = c.id
                    AND cp.user_id = auth.uid()
                    AND cp.status = 'accepted'
                )
            )
        )
    );

CREATE POLICY "Campaign members can send messages"
    ON public.campaign_messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_messages.campaign_id
            AND (
                c.dm_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.campaign_players cp
                    WHERE cp.campaign_id = c.id
                    AND cp.user_id = auth.uid()
                    AND cp.status = 'accepted'
                )
            )
        )
    );

GRANT SELECT, INSERT ON public.campaign_messages TO authenticated;

CREATE INDEX IF NOT EXISTS idx_campaign_messages_session ON public.campaign_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_campaign_messages_campaign ON public.campaign_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_messages_created ON public.campaign_messages(created_at);

-- =====================================================
-- CAMPAIGN DICE ROLLS
-- Detailed roll history with full mechanics
-- =====================================================
CREATE TABLE IF NOT EXISTS public.campaign_dice_rolls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.campaign_sessions(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    character_name TEXT,

    -- Roll details
    roll_type TEXT NOT NULL DEFAULT 'ability_check'
        CHECK (roll_type IN (
            'ability_check', 'saving_throw', 'attack', 'damage',
            'initiative', 'death_save', 'skill_check', 'custom'
        )),

    -- The actual dice
    dice_formula TEXT NOT NULL,  -- e.g. "1d20+5", "2d6+3", "1d20"
    dice_results INTEGER[] DEFAULT '{}',  -- individual die results
    modifier INTEGER DEFAULT 0,
    total INTEGER NOT NULL,

    -- Context
    ability TEXT,  -- str, dex, con, int, wis, cha
    skill TEXT,
    dc INTEGER,  -- difficulty class if applicable

    -- Outcome
    is_critical_hit BOOLEAN DEFAULT false,
    is_critical_fail BOOLEAN DEFAULT false,
    is_success BOOLEAN,
    is_secret BOOLEAN DEFAULT false,  -- DM secret roll

    -- Advantage/disadvantage
    advantage_type TEXT DEFAULT 'normal'
        CHECK (advantage_type IN ('normal', 'advantage', 'disadvantage')),

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.campaign_dice_rolls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign members can see rolls"
    ON public.campaign_dice_rolls FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_dice_rolls.campaign_id
            AND (
                c.dm_id = auth.uid()
                OR (
                    campaign_dice_rolls.is_secret = false
                    AND EXISTS (
                        SELECT 1 FROM public.campaign_players cp
                        WHERE cp.campaign_id = c.id
                        AND cp.user_id = auth.uid()
                        AND cp.status = 'accepted'
                    )
                )
            )
        )
    );

CREATE POLICY "Campaign members can roll"
    ON public.campaign_dice_rolls FOR INSERT
    WITH CHECK (
        auth.uid() = player_id
        OR EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_dice_rolls.campaign_id
            AND c.dm_id = auth.uid()
        )
    );

GRANT SELECT, INSERT ON public.campaign_dice_rolls TO authenticated;

CREATE INDEX IF NOT EXISTS idx_dice_rolls_session ON public.campaign_dice_rolls(session_id);

-- =====================================================
-- NARRATIVE IDOLS
-- The signature mechanic - players earn and use idols
-- to influence narrative, rules, and outcomes
-- =====================================================
CREATE TABLE IF NOT EXISTS public.narrative_idols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    holder_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Idol identity
    name TEXT NOT NULL,
    description TEXT,
    visual TEXT,  -- visual description for UI display
    
    -- Idol power
    idol_type TEXT NOT NULL DEFAULT 'minor'
        CHECK (idol_type IN ('minor', 'major', 'legendary')),

    power TEXT NOT NULL,
    -- Powers can include:
    -- "reroll" - Force any reroll
    -- "reveal" - Reveal a hidden secret or trigger
    -- "override" - Override one DM decision
    -- "shield" - Prevent one negative outcome
    -- "shift" - Change the active scene's mood/atmosphere
    -- "summon" - Bring in an NPC ally
    -- "fracture" - Cause a Fray event (reality tear)
    -- "immunity" - Skip one combat round / event
    -- "custom" - DM-defined unique power

    -- Status
    status TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'held', 'used', 'destroyed', 'corrupted')),

    -- History
    earned_by UUID REFERENCES public.profiles(id),
    earned_in_session UUID REFERENCES public.campaign_sessions(id),
    used_in_session UUID REFERENCES public.campaign_sessions(id),
    earned_reason TEXT,
    used_effect TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.narrative_idols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign members can see idols"
    ON public.narrative_idols FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = narrative_idols.campaign_id
            AND (
                c.dm_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.campaign_players cp
                    WHERE cp.campaign_id = c.id
                    AND cp.user_id = auth.uid()
                    AND cp.status = 'accepted'
                )
            )
        )
    );

CREATE POLICY "DMs can manage idols"
    ON public.narrative_idols FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = narrative_idols.campaign_id
            AND c.dm_id = auth.uid()
        )
    );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.narrative_idols TO authenticated;

CREATE INDEX IF NOT EXISTS idx_narrative_idols_campaign ON public.narrative_idols(campaign_id);
CREATE INDEX IF NOT EXISTS idx_narrative_idols_holder ON public.narrative_idols(holder_id);

-- =====================================================
-- CAMPAIGN NPCS
-- NPCs generated from canon entities or custom
-- =====================================================
CREATE TABLE IF NOT EXISTS public.campaign_npcs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    
    -- Link to canon entity (optional)
    canon_entity_id UUID REFERENCES public.canon_entities(id) ON DELETE SET NULL,

    name TEXT NOT NULL,
    description TEXT,
    portrait_url TEXT,
    
    -- NPC stats (simplified)
    npc_type TEXT DEFAULT 'ally'
        CHECK (npc_type IN ('ally', 'enemy', 'neutral', 'merchant', 'quest_giver', 'boss', 'mysterious')),
    
    -- Combat stats (if needed)
    stats JSONB DEFAULT '{
        "hp": 10,
        "max_hp": 10,
        "ac": 10,
        "attack_bonus": 0,
        "damage": "1d4",
        "abilities": []
    }',

    -- Personality for AI dialogue
    personality TEXT,
    voice_style TEXT,
    motivations TEXT,
    secrets TEXT,  -- DM-only, hidden from players

    -- Status in campaign
    is_alive BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    current_scene_id UUID REFERENCES public.campaign_scenes(id) ON DELETE SET NULL,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.campaign_npcs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign members can see visible NPCs"
    ON public.campaign_npcs FOR SELECT
    USING (
        (is_visible = true AND EXISTS (
            SELECT 1 FROM public.campaign_players cp
            WHERE cp.campaign_id = campaign_npcs.campaign_id
            AND cp.user_id = auth.uid()
            AND cp.status = 'accepted'
        ))
        OR EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_npcs.campaign_id
            AND c.dm_id = auth.uid()
        )
    );

CREATE POLICY "DMs can manage NPCs"
    ON public.campaign_npcs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_npcs.campaign_id
            AND c.dm_id = auth.uid()
        )
    );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_npcs TO authenticated;

CREATE INDEX IF NOT EXISTS idx_campaign_npcs_campaign ON public.campaign_npcs(campaign_id);

-- =====================================================
-- UPDATE TRIGGERS
-- =====================================================
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_players_updated_at
    BEFORE UPDATE ON public.campaign_players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_scenes_updated_at
    BEFORE UPDATE ON public.campaign_scenes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_sessions_updated_at
    BEFORE UPDATE ON public.campaign_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_narrative_idols_updated_at
    BEFORE UPDATE ON public.narrative_idols
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_npcs_updated_at
    BEFORE UPDATE ON public.campaign_npcs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
