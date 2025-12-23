-- =============================================================================
-- WRITING STATS MIGRATION
-- Track writing sessions and aggregate stats for the dashboard
-- =============================================================================

-- Create writing_sessions table to track individual writing sessions
CREATE TABLE IF NOT EXISTS public.writing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
    
    -- Session timing
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER DEFAULT 0,
    
    -- Word tracking
    words_at_start INTEGER NOT NULL DEFAULT 0,
    words_at_end INTEGER NOT NULL DEFAULT 0,
    words_written INTEGER GENERATED ALWAYS AS (GREATEST(0, words_at_end - words_at_start)) STORED,
    
    -- Session metadata
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user ON writing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_story ON writing_sessions(story_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON writing_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON writing_sessions(user_id, is_active) WHERE is_active = true;

-- Create daily_writing_stats for aggregated daily data
CREATE TABLE IF NOT EXISTS public.daily_writing_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Aggregated stats
    total_words INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    total_duration_seconds INTEGER DEFAULT 0,
    
    -- Story breakdown (JSON for flexibility)
    stories_worked_on JSONB DEFAULT '[]'::jsonb,
    
    -- Goal tracking
    daily_goal INTEGER DEFAULT 500,
    goal_met BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One row per user per day
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_writing_stats(user_id, date DESC);

-- Create writing_goals table for user goal settings
CREATE TABLE IF NOT EXISTS public.writing_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Goal settings
    daily_word_goal INTEGER DEFAULT 500,
    weekly_word_goal INTEGER DEFAULT 3500,
    monthly_word_goal INTEGER DEFAULT 15000,
    
    -- Streak tracking
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_writing_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_daily_stats_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS daily_stats_updated_at ON daily_writing_stats;
CREATE TRIGGER daily_stats_updated_at
  BEFORE UPDATE ON daily_writing_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_stats_timestamp();

DROP TRIGGER IF EXISTS writing_goals_updated_at ON writing_goals;
CREATE TRIGGER writing_goals_updated_at
  BEFORE UPDATE ON writing_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_stats_timestamp();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE writing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_writing_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_goals ENABLE ROW LEVEL SECURITY;

-- Users can only see their own writing sessions
CREATE POLICY "Users can view own sessions"
  ON writing_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON writing_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON writing_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only see their own daily stats
CREATE POLICY "Users can view own daily stats"
  ON daily_writing_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily stats"
  ON daily_writing_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily stats"
  ON daily_writing_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can manage their own goals
CREATE POLICY "Users can view own goals"
  ON writing_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON writing_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON writing_goals FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get writing stats summary for a user
CREATE OR REPLACE FUNCTION get_writing_stats_summary(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_words BIGINT,
    total_sessions BIGINT,
    total_duration_seconds BIGINT,
    avg_words_per_day NUMERIC,
    avg_session_duration_seconds NUMERIC,
    current_streak INTEGER,
    longest_streak INTEGER,
    days_with_writing INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT
            COALESCE(SUM(d.total_words), 0) as sum_words,
            COALESCE(SUM(d.total_sessions), 0) as sum_sessions,
            COALESCE(SUM(d.total_duration_seconds), 0) as sum_duration,
            COUNT(DISTINCT d.date) as writing_days
        FROM daily_writing_stats d
        WHERE d.user_id = p_user_id
        AND d.date >= CURRENT_DATE - p_days
        AND d.total_words > 0
    ),
    goals AS (
        SELECT 
            g.current_streak,
            g.longest_streak
        FROM writing_goals g
        WHERE g.user_id = p_user_id
    )
    SELECT
        stats.sum_words::BIGINT as total_words,
        stats.sum_sessions::BIGINT as total_sessions,
        stats.sum_duration::BIGINT as total_duration_seconds,
        ROUND(stats.sum_words::NUMERIC / GREATEST(1, p_days), 2) as avg_words_per_day,
        ROUND(stats.sum_duration::NUMERIC / GREATEST(1, stats.sum_sessions), 2) as avg_session_duration_seconds,
        COALESCE(goals.current_streak, 0) as current_streak,
        COALESCE(goals.longest_streak, 0) as longest_streak,
        stats.writing_days::INTEGER as days_with_writing
    FROM stats
    LEFT JOIN goals ON true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update streak when daily stats are modified
CREATE OR REPLACE FUNCTION update_writing_streak()
RETURNS TRIGGER AS $$
DECLARE
    v_last_date DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
BEGIN
    -- Only run if words were written
    IF NEW.total_words <= 0 THEN
        RETURN NEW;
    END IF;
    
    -- Get current goals
    SELECT last_writing_date, current_streak, longest_streak
    INTO v_last_date, v_current_streak, v_longest_streak
    FROM writing_goals
    WHERE user_id = NEW.user_id;
    
    -- Create goals record if it doesn't exist
    IF NOT FOUND THEN
        INSERT INTO writing_goals (user_id, current_streak, longest_streak, last_writing_date)
        VALUES (NEW.user_id, 1, 1, NEW.date);
        RETURN NEW;
    END IF;
    
    -- Update streak
    IF v_last_date IS NULL OR NEW.date > v_last_date THEN
        IF v_last_date = NEW.date - 1 THEN
            -- Consecutive day - increment streak
            v_current_streak := v_current_streak + 1;
        ELSIF NEW.date = v_last_date THEN
            -- Same day - no change
            NULL;
        ELSE
            -- Streak broken - reset to 1
            v_current_streak := 1;
        END IF;
        
        -- Update longest streak if needed
        IF v_current_streak > v_longest_streak THEN
            v_longest_streak := v_current_streak;
        END IF;
        
        -- Update goals
        UPDATE writing_goals
        SET current_streak = v_current_streak,
            longest_streak = v_longest_streak,
            last_writing_date = NEW.date
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update streak on daily stats change
DROP TRIGGER IF EXISTS update_streak_on_daily_stats ON daily_writing_stats;
CREATE TRIGGER update_streak_on_daily_stats
  AFTER INSERT OR UPDATE ON daily_writing_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_writing_streak();
