-- =====================================================
-- WORLD STATE & CONVERGENCE TRACKING
-- Tracks Shard discoveries, regional instability,
-- and the slow pull toward convergence.
-- =====================================================

-- =====================================================
-- REGIONAL INSTABILITY STATE
-- Tracks Fray intensity and stability per region
-- =====================================================
CREATE TABLE IF NOT EXISTS public.regional_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id TEXT NOT NULL UNIQUE,
    region_name TEXT NOT NULL,
    fray_intensity DECIMAL(4,3) DEFAULT 0.100 CHECK (fray_intensity >= 0 AND fray_intensity <= 1),
    stability_index DECIMAL(4,3) DEFAULT 0.800 CHECK (stability_index >= 0 AND stability_index <= 1),
    shards_known INTEGER DEFAULT 0,
    shards_gathered INTEGER DEFAULT 0,
    hollow_count INTEGER DEFAULT 0,
    drift_breach_count INTEGER DEFAULT 0,
    active_campaigns INTEGER DEFAULT 0,
    active_quests INTEGER DEFAULT 0,
    canonical_stories INTEGER DEFAULT 0,
    last_shard_event TIMESTAMPTZ,
    last_fray_event TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.regional_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Regional state viewable by everyone"
    ON public.regional_state FOR SELECT USING (true);

CREATE POLICY "Only admins can update regional state"
    ON public.regional_state FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('lorekeeper', 'admin')));

-- Seed initial regional state for all 8 regions
INSERT INTO public.regional_state (region_id, region_name, fray_intensity, stability_index) VALUES
    ('bellroot', 'The Bellroot Vale', 0.120, 0.850),
    ('luminous', 'The Luminous Fold', 0.050, 0.950),
    ('ashen', 'The Ashen Spine', 0.300, 0.600),
    ('drowned', 'The Drowned Reach', 0.250, 0.650),
    ('glass', 'The Glass Expanse', 0.180, 0.750),
    ('virelay', 'The Virelay Coastlands', 0.150, 0.800),
    ('varnhalt', 'The Varnhalt Frontier', 0.220, 0.700),
    ('deyune', 'The Deyune Steps', 0.080, 0.900)
ON CONFLICT (region_id) DO NOTHING;

-- =====================================================
-- SHARD EVENTS LOG
-- Records when Shards are found, moved, or used
-- =====================================================
CREATE TABLE IF NOT EXISTS public.shard_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shard_id UUID REFERENCES public.shards(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('found', 'revealed', 'moved', 'misunderstood', 'used', 'corrupted', 'united')),
    region_id TEXT,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    campaign_id UUID,
    quest_id UUID,
    story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
    description TEXT,
    world_impact TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shard_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shard events viewable by everyone"
    ON public.shard_events FOR SELECT USING (true);

CREATE POLICY "Only elevated roles can record shard events"
    ON public.shard_events FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('curator', 'lorekeeper', 'admin')));

-- =====================================================
-- WORLD EVENTS LOG
-- Significant narrative events that affect the world
-- =====================================================
CREATE TABLE IF NOT EXISTS public.world_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('fray_surge', 'hollow_formed', 'drift_breach', 'convergence_pulse', 'shard_resonance', 'monster_emergence', 'region_shift', 'narrative_milestone')),
    severity TEXT DEFAULT 'minor' CHECK (severity IN ('minor', 'moderate', 'major', 'catastrophic')),
    region_id TEXT,
    source_campaign_id UUID,
    source_quest_id UUID,
    source_story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
    affected_entities UUID[] DEFAULT '{}',
    affected_shards UUID[] DEFAULT '{}',
    world_state_changes JSONB DEFAULT '{}',
    is_visible BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.world_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visible world events viewable by everyone"
    ON public.world_events FOR SELECT USING (is_visible = true);

CREATE POLICY "Only elevated roles can create world events"
    ON public.world_events FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('curator', 'lorekeeper', 'admin')));

-- =====================================================
-- ENTITY USAGE TRACKING VIEW
-- Cross-references entities with stories, campaigns, quests
-- =====================================================

-- Add region_id to campaigns if not present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'regions') THEN
        ALTER TABLE public.campaigns ADD COLUMN regions TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add region_id to quests if not present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quests' AND column_name = 'regions') THEN
        ALTER TABLE public.quests ADD COLUMN regions TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add region to stories if not present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'regions') THEN
        ALTER TABLE public.stories ADD COLUMN regions TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- =====================================================
-- CONVERGENCE STATE FUNCTION
-- Calculate global convergence percentage
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_convergence_state()
RETURNS JSONB AS $$
DECLARE
    total_shards INTEGER;
    gathered_shards INTEGER;
    avg_fray DECIMAL;
    avg_stability DECIMAL;
    result JSONB;
BEGIN
    SELECT COALESCE(COUNT(*), 0) INTO total_shards FROM public.shards;
    SELECT COALESCE(COUNT(*), 0) INTO gathered_shards FROM public.shards WHERE state IN ('active', 'transcended');
    SELECT COALESCE(AVG(fray_intensity), 0) INTO avg_fray FROM public.regional_state;
    SELECT COALESCE(AVG(stability_index), 0.5) INTO avg_stability FROM public.regional_state;
    
    result := jsonb_build_object(
        'total_shards', total_shards,
        'gathered_shards', gathered_shards,
        'convergence_percentage', CASE WHEN total_shards > 0 THEN ROUND((gathered_shards::DECIMAL / total_shards) * 100, 1) ELSE 0 END,
        'global_fray_intensity', ROUND(avg_fray::NUMERIC, 3),
        'global_stability', ROUND(avg_stability::NUMERIC, 3),
        'world_phase', CASE
            WHEN total_shards = 0 THEN 'dormant'
            WHEN gathered_shards::DECIMAL / GREATEST(total_shards, 1) >= 0.8 THEN 'convergence_imminent'
            WHEN gathered_shards::DECIMAL / GREATEST(total_shards, 1) >= 0.5 THEN 'awakening'
            WHEN gathered_shards::DECIMAL / GREATEST(total_shards, 1) >= 0.2 THEN 'stirring'
            ELSE 'scattered'
        END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_shard_events_shard ON public.shard_events(shard_id);
CREATE INDEX IF NOT EXISTS idx_shard_events_region ON public.shard_events(region_id);
CREATE INDEX IF NOT EXISTS idx_shard_events_type ON public.shard_events(event_type);
CREATE INDEX IF NOT EXISTS idx_world_events_region ON public.world_events(region_id);
CREATE INDEX IF NOT EXISTS idx_world_events_type ON public.world_events(event_type);
CREATE INDEX IF NOT EXISTS idx_regional_state_region ON public.regional_state(region_id);
