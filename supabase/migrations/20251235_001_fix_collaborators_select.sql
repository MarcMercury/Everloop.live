-- Fix collaborators fetch - ensure story authors can view all collaborators
-- The ALL policy might not be working correctly for SELECT operations

-- Drop and recreate the policy more explicitly
DROP POLICY IF EXISTS "Authors can manage collaborators" ON story_collaborators;
DROP POLICY IF EXISTS "Users can view story collaborators" ON story_collaborators;

-- Separate policies for better control
-- Authors can SELECT all collaborators on their stories
CREATE POLICY "Authors can view story collaborators"
  ON story_collaborators FOR SELECT
  USING (is_story_author(story_id));

-- Authors can INSERT collaborators to their stories  
CREATE POLICY "Authors can add collaborators"
  ON story_collaborators FOR INSERT
  WITH CHECK (is_story_author(story_id));

-- Authors can UPDATE collaborators on their stories
CREATE POLICY "Authors can update collaborators"
  ON story_collaborators FOR UPDATE
  USING (is_story_author(story_id));

-- Authors can DELETE collaborators from their stories
CREATE POLICY "Authors can remove collaborators"
  ON story_collaborators FOR DELETE
  USING (is_story_author(story_id));

-- Collaborators can view other collaborators on same story
CREATE POLICY "Collaborators can view co-collaborators"
  ON story_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM story_collaborators sc
      WHERE sc.story_id = story_collaborators.story_id
      AND sc.user_id = auth.uid()
      AND sc.is_active = true
    )
  );
