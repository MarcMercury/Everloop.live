-- Fix RLS recursion between stories and story_collaborators
-- The recursion happens because:
-- 1. stories SELECT checks story_collaborators
-- 2. story_collaborators SELECT checks stories
-- Solution: Remove the story owner check from story_collaborators (they already have access via stories)

-- Drop the recursive policies on story_collaborators
DROP POLICY IF EXISTS "Authors can manage collaborators" ON story_collaborators;
DROP POLICY IF EXISTS "Story owners can view all collaborators" ON story_collaborators;

-- Create non-recursive replacement policies
-- Users can view collaborators if they are a collaborator on that story
CREATE POLICY "Users can view story collaborators"
  ON story_collaborators FOR SELECT
  USING (
    -- User is the collaborator
    user_id = auth.uid()
    -- OR user is in the collaborators list for this story (self-referential but not recursive to stories)
    OR EXISTS (
      SELECT 1 FROM story_collaborators sc
      WHERE sc.story_id = story_collaborators.story_id
      AND sc.user_id = auth.uid()
    )
  );

-- For INSERT/UPDATE/DELETE, we use a SECURITY DEFINER function to check story ownership
CREATE OR REPLACE FUNCTION is_story_author(p_story_id UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM stories 
    WHERE id = p_story_id 
    AND author_id = auth.uid()
  );
$$;

-- Authors can manage collaborators using the safe function
CREATE POLICY "Authors can manage collaborators"
  ON story_collaborators FOR ALL
  USING (is_story_author(story_id));

-- Also fix the stories "Collaborators can view" policy to be simpler
DROP POLICY IF EXISTS "Collaborators can view shared stories" ON stories;
DROP POLICY IF EXISTS "Collaborators can update stories" ON stories;

-- Create non-recursive collaborator policies using a safe function
CREATE OR REPLACE FUNCTION is_story_collaborator(p_story_id UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM story_collaborators
    WHERE story_id = p_story_id
    AND user_id = auth.uid()
    AND is_active = true
    AND accepted_at IS NOT NULL
  );
$$;

CREATE OR REPLACE FUNCTION can_edit_story(p_story_id UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM story_collaborators
    WHERE story_id = p_story_id
    AND user_id = auth.uid()
    AND role IN ('editor', 'co_author')
    AND is_active = true
    AND accepted_at IS NOT NULL
  );
$$;

-- Recreate collaborator access policies using safe functions
CREATE POLICY "Collaborators can view shared stories"
  ON stories FOR SELECT
  USING (is_story_collaborator(id));

CREATE POLICY "Collaborators can update stories"
  ON stories FOR UPDATE
  USING (can_edit_story(id));
