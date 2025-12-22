-- =============================================================================
-- STORY COMMENTS MIGRATION
-- Inline comments and annotations for stories
-- =============================================================================

-- Create comment type enum
DO $$ BEGIN
  CREATE TYPE comment_type AS ENUM ('note', 'suggestion', 'question', 'issue');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create story_comments table
CREATE TABLE IF NOT EXISTS story_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES story_chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Comment content
  content TEXT NOT NULL,
  comment_type comment_type DEFAULT 'note',
  
  -- Position in text (character offsets)
  position_start INTEGER NOT NULL,
  position_end INTEGER NOT NULL,
  selected_text TEXT, -- The text that was highlighted when creating comment
  
  -- Threading support
  thread_id UUID, -- Groups related comments together
  parent_id UUID REFERENCES story_comments(id) ON DELETE CASCADE,
  
  -- State
  is_private BOOLEAN DEFAULT true, -- Private notes vs public comments
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_story ON story_comments(story_id);
CREATE INDEX IF NOT EXISTS idx_comments_chapter ON story_comments(chapter_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON story_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_thread ON story_comments(thread_id);
CREATE INDEX IF NOT EXISTS idx_comments_position ON story_comments(story_id, position_start, position_end);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comment_updated_at ON story_comments;
CREATE TRIGGER comment_updated_at
  BEFORE UPDATE ON story_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_timestamp();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;

-- Users can view their own private comments
CREATE POLICY "Users can view own comments"
  ON story_comments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view public comments on stories they have access to
CREATE POLICY "Users can view public comments on accessible stories"
  ON story_comments FOR SELECT
  USING (
    is_private = false
    AND EXISTS (
      SELECT 1 FROM stories s
      WHERE s.id = story_comments.story_id
      AND (s.author_id = auth.uid() OR s.status = 'published')
    )
  );

-- Story authors can view all comments on their stories
CREATE POLICY "Authors can view all comments on their stories"
  ON story_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories s
      WHERE s.id = story_comments.story_id
      AND s.author_id = auth.uid()
    )
  );

-- Users can create comments on their own stories or stories they can access
CREATE POLICY "Users can create comments"
  ON story_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM stories s
      WHERE s.id = story_comments.story_id
      AND (s.author_id = auth.uid() OR s.status = 'published')
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON story_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Story authors can resolve any comment on their stories
CREATE POLICY "Authors can resolve comments on their stories"
  ON story_comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stories s
      WHERE s.id = story_comments.story_id
      AND s.author_id = auth.uid()
    )
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON story_comments FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get comment count for a story
CREATE OR REPLACE FUNCTION get_story_comment_count(p_story_id UUID)
RETURNS TABLE (
  total INTEGER,
  unresolved INTEGER,
  notes INTEGER,
  suggestions INTEGER,
  questions INTEGER,
  issues INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total,
    COUNT(*) FILTER (WHERE NOT is_resolved)::INTEGER as unresolved,
    COUNT(*) FILTER (WHERE comment_type = 'note')::INTEGER as notes,
    COUNT(*) FILTER (WHERE comment_type = 'suggestion')::INTEGER as suggestions,
    COUNT(*) FILTER (WHERE comment_type = 'question')::INTEGER as questions,
    COUNT(*) FILTER (WHERE comment_type = 'issue')::INTEGER as issues
  FROM story_comments
  WHERE story_id = p_story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
