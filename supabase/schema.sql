-- =====================================================
-- EVERLOOP DATABASE SCHEMA
-- A Canon Engine for collaborative storytelling
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- PROFILES
-- Linked to Supabase auth.users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'writer' CHECK (role IN ('writer', 'curator', 'lorekeeper', 'admin')),
    is_admin BOOLEAN DEFAULT FALSE,
    reputation_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- CANON ENTITIES
-- Core lore elements of the Everloop universe
-- =====================================================
CREATE TYPE canon_entity_type AS ENUM (
    'character',
    'location', 
    'artifact',
    'event',
    'faction',
    'concept',
    'creature'
);

CREATE TYPE canon_status AS ENUM (
    'draft',
    'proposed',
    'canonical',
    'deprecated',
    'contested'
);

CREATE TABLE IF NOT EXISTS public.canon_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type canon_entity_type NOT NULL,
    description TEXT,
    extended_lore JSONB DEFAULT '{}',
    stability_rating DECIMAL(3,2) DEFAULT 1.00 CHECK (stability_rating >= 0 AND stability_rating <= 1),
    status canon_status DEFAULT 'draft',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    embedding vector(1536), -- For semantic search via OpenAI embeddings
    tags TEXT[] DEFAULT '{}',
    related_entities UUID[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.canon_entities ENABLE ROW LEVEL SECURITY;

-- Canon entities policies
CREATE POLICY "Canon entities are viewable by everyone"
    ON public.canon_entities FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create canon entities"
    ON public.canon_entities FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Creators can update their draft entities"
    ON public.canon_entities FOR UPDATE
    USING (auth.uid() = created_by AND status = 'draft');

-- Index for vector similarity search
CREATE INDEX IF NOT EXISTS canon_entities_embedding_idx 
    ON public.canon_entities 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- =====================================================
-- SHARDS
-- Mystical artifacts that influence the narrative
-- =====================================================
CREATE TYPE shard_state AS ENUM (
    'dormant',
    'awakening',
    'active',
    'corrupted',
    'shattered',
    'transcended'
);

CREATE TABLE IF NOT EXISTS public.shards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    power_description TEXT,
    current_holder_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    location_id UUID REFERENCES public.canon_entities(id) ON DELETE SET NULL,
    state shard_state DEFAULT 'dormant',
    power_level INTEGER DEFAULT 1 CHECK (power_level >= 1 AND power_level <= 10),
    history JSONB DEFAULT '[]', -- Array of ownership/location changes
    visual_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.shards ENABLE ROW LEVEL SECURITY;

-- Shards policies
CREATE POLICY "Shards are viewable by everyone"
    ON public.shards FOR SELECT
    USING (true);

CREATE POLICY "Only curators can modify shards"
    ON public.shards FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('curator', 'lorekeeper', 'admin')
        )
    );

-- =====================================================
-- STORIES
-- User-contributed narratives
-- =====================================================
CREATE TYPE story_canon_status AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'revision_requested',
    'approved',
    'rejected',
    'canonical'
);

CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    content JSONB NOT NULL DEFAULT '{}', -- Tiptap JSON content
    content_text TEXT, -- Plain text for search
    word_count INTEGER DEFAULT 0,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    canon_status story_canon_status DEFAULT 'draft',
    ai_review_notes JSONB DEFAULT '{}', -- AI analysis: consistency, suggestions, warnings
    ai_consistency_score DECIMAL(3,2) CHECK (ai_consistency_score >= 0 AND ai_consistency_score <= 1),
    referenced_entities UUID[] DEFAULT '{}',
    referenced_shards UUID[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    reading_time_minutes INTEGER,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Stories policies
CREATE POLICY "Published stories are viewable by everyone"
    ON public.stories FOR SELECT
    USING (is_published = true OR author_id = auth.uid());

CREATE POLICY "Authenticated users can create stories"
    ON public.stories FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own stories"
    ON public.stories FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own draft stories"
    ON public.stories FOR DELETE
    USING (auth.uid() = author_id AND canon_status = 'draft');

-- =====================================================
-- STORY REVIEWS
-- Peer and AI reviews of stories
-- =====================================================
CREATE TABLE IF NOT EXISTS public.story_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_ai_review BOOLEAN DEFAULT false,
    canon_consistency_score DECIMAL(3,2),
    quality_score DECIMAL(3,2),
    feedback TEXT,
    suggestions JSONB DEFAULT '[]',
    flagged_issues JSONB DEFAULT '[]',
    decision TEXT CHECK (decision IN ('approve', 'request_revision', 'reject', NULL)),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.story_reviews ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canon_entities_updated_at
    BEFORE UPDATE ON public.canon_entities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shards_updated_at
    BEFORE UPDATE ON public.shards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
    BEFORE UPDATE ON public.stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_canon_entities_type ON public.canon_entities(type);
CREATE INDEX IF NOT EXISTS idx_canon_entities_status ON public.canon_entities(status);
CREATE INDEX IF NOT EXISTS idx_canon_entities_slug ON public.canon_entities(slug);
CREATE INDEX IF NOT EXISTS idx_stories_author ON public.stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_canon_status ON public.stories(canon_status);
CREATE INDEX IF NOT EXISTS idx_stories_published ON public.stories(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_shards_holder ON public.shards(current_holder_id);
CREATE INDEX IF NOT EXISTS idx_shards_location ON public.shards(location_id);

-- Full text search on stories
CREATE INDEX IF NOT EXISTS idx_stories_content_search ON public.stories USING gin(to_tsvector('english', content_text));
