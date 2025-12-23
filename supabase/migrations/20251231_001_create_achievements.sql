-- Feature 12: Achievement System
-- Created: 2025-12-23

-- Achievement definitions table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  category TEXT NOT NULL DEFAULT 'writing',
  tier TEXT NOT NULL DEFAULT 'bronze', -- bronze, silver, gold, platinum
  requirement_type TEXT NOT NULL, -- word_count, story_count, streak_days, canon_approved, etc.
  requirement_value INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  is_secret BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User achievements (unlocked achievements)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- Achievement progress tracking
CREATE TABLE IF NOT EXISTS public.achievement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  current_value INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_notified ON public.user_achievements(user_id, notified) WHERE notified = false;
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user ON public.achievement_progress(user_id);

-- RLS Policies
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_progress ENABLE ROW LEVEL SECURITY;

-- Achievements are readable by everyone
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  USING (true);

-- Users can view their own unlocked achievements
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert user achievements (via service role)
CREATE POLICY "System can grant achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update notification status
CREATE POLICY "Users can update notification status"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own progress
CREATE POLICY "Users can view own progress"
  ON public.achievement_progress FOR SELECT
  USING (auth.uid() = user_id);

-- System can manage progress
CREATE POLICY "System can manage progress"
  ON public.achievement_progress FOR ALL
  USING (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO public.achievements (slug, name, description, icon, category, tier, requirement_type, requirement_value, points) VALUES
-- Word count milestones
('first_words', 'First Words', 'Write your first 100 words', '✍️', 'writing', 'bronze', 'total_words', 100, 10),
('wordsmith', 'Wordsmith', 'Write 1,000 words total', '📝', 'writing', 'bronze', 'total_words', 1000, 25),
('storyteller', 'Storyteller', 'Write 5,000 words total', '📖', 'writing', 'silver', 'total_words', 5000, 50),
('novelist', 'Novelist', 'Write 25,000 words total', '📚', 'writing', 'gold', 'total_words', 25000, 100),
('epic_author', 'Epic Author', 'Write 50,000 words total', '🏛️', 'writing', 'platinum', 'total_words', 50000, 200),
('legendary_scribe', 'Legendary Scribe', 'Write 100,000 words total', '👑', 'writing', 'platinum', 'total_words', 100000, 500),

-- Story milestones
('first_draft', 'First Draft', 'Complete your first story draft', '📄', 'stories', 'bronze', 'story_count', 1, 25),
('prolific_writer', 'Prolific Writer', 'Write 5 stories', '📑', 'stories', 'silver', 'story_count', 5, 75),
('master_chronicler', 'Master Chronicler', 'Write 10 stories', '📜', 'stories', 'gold', 'story_count', 10, 150),

-- Canon achievements
('canon_contributor', 'Canon Contributor', 'Have a story approved as canonical', '⭐', 'canon', 'gold', 'canon_approved', 1, 100),
('lorekeeper', 'Lorekeeper', 'Have 3 canonical stories', '🌟', 'canon', 'platinum', 'canon_approved', 3, 250),

-- Streak achievements
('consistent_writer', 'Consistent Writer', 'Write for 3 days in a row', '🔥', 'streaks', 'bronze', 'streak_days', 3, 30),
('dedicated_author', 'Dedicated Author', 'Write for 7 days in a row', '💪', 'streaks', 'silver', 'streak_days', 7, 75),
('unstoppable', 'Unstoppable', 'Write for 30 days in a row', '⚡', 'streaks', 'gold', 'streak_days', 30, 200),

-- Session achievements
('night_owl', 'Night Owl', 'Write between midnight and 4am', '🦉', 'special', 'bronze', 'night_session', 1, 15),
('early_bird', 'Early Bird', 'Write between 5am and 7am', '🐦', 'special', 'bronze', 'morning_session', 1, 15),
('marathon_writer', 'Marathon Writer', 'Write for 2 hours in one session', '🏃', 'special', 'silver', 'session_duration', 120, 50),

-- Entity achievements  
('world_builder', 'World Builder', 'Reference 10 canon entities in your stories', '🌍', 'lore', 'silver', 'entities_linked', 10, 50),
('lore_master', 'Lore Master', 'Reference 50 canon entities', '🗺️', 'lore', 'gold', 'entities_linked', 50, 150)

ON CONFLICT (slug) DO NOTHING;

-- Function to check and grant achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS TABLE(achievement_id UUID, achievement_name TEXT, achievement_icon TEXT) AS $$
DECLARE
  v_total_words INTEGER;
  v_story_count INTEGER;
  v_canon_count INTEGER;
  v_streak_days INTEGER;
  v_achievement RECORD;
BEGIN
  -- Get user stats
  SELECT COALESCE(SUM(word_count), 0) INTO v_total_words
  FROM stories WHERE author_id = p_user_id;
  
  SELECT COUNT(*) INTO v_story_count
  FROM stories WHERE author_id = p_user_id;
  
  SELECT COUNT(*) INTO v_canon_count
  FROM stories WHERE author_id = p_user_id AND canon_status = 'canonical';
  
  -- Calculate streak (simplified - counts consecutive days with writing sessions)
  SELECT COUNT(DISTINCT DATE(created_at)) INTO v_streak_days
  FROM writing_sessions 
  WHERE user_id = p_user_id 
    AND created_at >= CURRENT_DATE - INTERVAL '30 days';
  
  -- Check each achievement
  FOR v_achievement IN 
    SELECT a.* FROM achievements a
    WHERE NOT EXISTS (
      SELECT 1 FROM user_achievements ua 
      WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
    )
  LOOP
    -- Check if requirement is met
    IF (v_achievement.requirement_type = 'total_words' AND v_total_words >= v_achievement.requirement_value)
       OR (v_achievement.requirement_type = 'story_count' AND v_story_count >= v_achievement.requirement_value)
       OR (v_achievement.requirement_type = 'canon_approved' AND v_canon_count >= v_achievement.requirement_value)
    THEN
      -- Grant achievement
      INSERT INTO user_achievements (user_id, achievement_id, notified)
      VALUES (p_user_id, v_achievement.id, false)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
      
      -- Update progress
      INSERT INTO achievement_progress (user_id, achievement_id, current_value)
      VALUES (p_user_id, v_achievement.id, v_achievement.requirement_value)
      ON CONFLICT (user_id, achievement_id) 
      DO UPDATE SET current_value = v_achievement.requirement_value, updated_at = now();
      
      -- Return newly granted achievement
      achievement_id := v_achievement.id;
      achievement_name := v_achievement.name;
      achievement_icon := v_achievement.icon;
      RETURN NEXT;
    ELSE
      -- Update progress for unearned achievements
      INSERT INTO achievement_progress (user_id, achievement_id, current_value)
      VALUES (
        p_user_id, 
        v_achievement.id,
        CASE v_achievement.requirement_type
          WHEN 'total_words' THEN v_total_words
          WHEN 'story_count' THEN v_story_count
          WHEN 'canon_approved' THEN v_canon_count
          ELSE 0
        END
      )
      ON CONFLICT (user_id, achievement_id) 
      DO UPDATE SET 
        current_value = EXCLUDED.current_value,
        updated_at = now();
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
