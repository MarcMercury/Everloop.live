-- Fix infinite recursion in story_collaborators RLS policies
-- The "Co-authors can view collaborators" policy was self-referencing

-- Drop the problematic policy
DROP POLICY IF EXISTS "Co-authors can view collaborators" ON public.story_collaborators;

-- Also simplify the stories policies that reference story_collaborators
-- to avoid circular dependencies on INSERT

-- The issue is: when inserting a story, the SELECT policies on stories
-- try to check story_collaborators, which then tries to check stories

-- Fix: Make the collaborator check only apply to UPDATE/SELECT, not affect INSERT path

-- Drop and recreate the stories SELECT policy without collaborator check during insert context
DROP POLICY IF EXISTS "Users can view own or collaborated stories" ON public.stories;

-- Simpler policy: users can view their own stories
CREATE POLICY "Users can view own stories"
  ON public.stories
  FOR SELECT
  USING (author_id = auth.uid());

-- Separate policy for collaborators viewing stories (won't cause recursion for INSERT)
CREATE POLICY "Collaborators can view shared stories"
  ON public.stories
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.story_collaborators c
      WHERE c.story_id = stories.id
        AND c.user_id = auth.uid()
        AND c.is_active = true
        AND c.accepted_at IS NOT NULL
    )
  );

-- For story_collaborators: simpler policies that don't self-reference
-- Users can view collaborations they're part of (either as collaborator or story owner)
-- Already have "Users can view own collaborations" which is fine

-- Add policy for story owners to view all collaborators on their stories
CREATE POLICY "Story owners can view all collaborators"
  ON public.story_collaborators
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories s
      WHERE s.id = story_collaborators.story_id
        AND s.author_id = auth.uid()
    )
  );
