-- Story Revisions Table for Living Archive (Feature 8)
-- Stores version history of stories for tracking changes over time

-- ============================================================================
-- STORY REVISIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.story_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.story_chapters(id) ON DELETE CASCADE,
  
  -- Revision metadata
  revision_number INTEGER NOT NULL DEFAULT 1,
  revision_type TEXT NOT NULL DEFAULT 'auto' CHECK (revision_type IN ('auto', 'manual', 'submit', 'publish')),
  
  -- Content snapshot
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  content_text TEXT,
  word_count INTEGER DEFAULT 0,
  
  -- Change tracking
  change_summary TEXT,
  words_added INTEGER DEFAULT 0,
  words_removed INTEGER DEFAULT 0,
  
  -- Who created this revision
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_story_revisions_story_id ON public.story_revisions(story_id);
CREATE INDEX IF NOT EXISTS idx_story_revisions_chapter_id ON public.story_revisions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_story_revisions_created_at ON public.story_revisions(created_at DESC);

-- Unique constraint: one revision number per story (or chapter)
CREATE UNIQUE INDEX IF NOT EXISTS idx_story_revisions_unique 
ON public.story_revisions(story_id, COALESCE(chapter_id, '00000000-0000-0000-0000-000000000000'::uuid), revision_number);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.story_revisions ENABLE ROW LEVEL SECURITY;

-- Users can view revisions of their own stories
CREATE POLICY "Users can view own story revisions"
ON public.story_revisions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = story_revisions.story_id 
    AND stories.author_id = auth.uid()
  )
);

-- Admins can view all revisions
CREATE POLICY "Admins can view all revisions"
ON public.story_revisions FOR SELECT
USING (public.is_admin_check() = true);

-- Users can create revisions for their own stories
CREATE POLICY "Users can create own story revisions"
ON public.story_revisions FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = story_revisions.story_id 
    AND stories.author_id = auth.uid()
  )
);

-- Users can delete revisions of their own stories (cleanup old auto-saves)
CREATE POLICY "Users can delete own story revisions"
ON public.story_revisions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = story_revisions.story_id 
    AND stories.author_id = auth.uid()
  )
);

-- ============================================================================
-- HELPER FUNCTION: Get next revision number
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_next_revision_number(
  p_story_id UUID,
  p_chapter_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(revision_number), 0) + 1
  INTO next_num
  FROM public.story_revisions
  WHERE story_id = p_story_id
    AND (
      (p_chapter_id IS NULL AND chapter_id IS NULL) OR
      (chapter_id = p_chapter_id)
    );
  
  RETURN next_num;
END;
$$;

-- ============================================================================
-- TRIGGER: Auto-update revision number on insert
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_revision_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.revision_number IS NULL OR NEW.revision_number = 1 THEN
    NEW.revision_number := public.get_next_revision_number(NEW.story_id, NEW.chapter_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_revision_number_trigger ON public.story_revisions;
CREATE TRIGGER set_revision_number_trigger
  BEFORE INSERT ON public.story_revisions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_revision_number();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.story_revisions IS 'Version history for stories - Living Archive feature';
COMMENT ON COLUMN public.story_revisions.revision_type IS 'auto: periodic save, manual: user-triggered, submit: before review submission, publish: before publishing';
COMMENT ON COLUMN public.story_revisions.change_summary IS 'Optional description of what changed in this revision';
