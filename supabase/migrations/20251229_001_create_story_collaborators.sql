-- Feature 9: Collaborative Mode
-- Creates story_collaborators table for multi-author collaboration

-- ============================================================================
-- Collaborator Roles Enum
-- ============================================================================

CREATE TYPE collaborator_role AS ENUM ('viewer', 'commenter', 'editor', 'co_author');

-- ============================================================================
-- Story Collaborators Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.story_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role collaborator_role NOT NULL DEFAULT 'viewer',
  
  -- Invitation tracking
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique collaborator per story
  CONSTRAINT unique_story_collaborator UNIQUE (story_id, user_id)
);

-- ============================================================================
-- Pending Invitations Table (for email invites)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.story_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  
  -- Email for users not yet registered
  email TEXT NOT NULL,
  
  -- Role they'll get when they accept
  role collaborator_role NOT NULL DEFAULT 'viewer',
  
  -- Invitation details
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  
  -- Token for accepting (secure link)
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  
  -- Ensure unique pending invite per email per story
  CONSTRAINT unique_story_invitation UNIQUE (story_id, email)
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX idx_collaborators_story ON public.story_collaborators(story_id);
CREATE INDEX idx_collaborators_user ON public.story_collaborators(user_id);
CREATE INDEX idx_collaborators_active ON public.story_collaborators(story_id, is_active) WHERE is_active = true;

CREATE INDEX idx_invitations_story ON public.story_invitations(story_id);
CREATE INDEX idx_invitations_email ON public.story_invitations(email);
CREATE INDEX idx_invitations_token ON public.story_invitations(token);
CREATE INDEX idx_invitations_pending ON public.story_invitations(story_id, status) WHERE status = 'pending';

-- ============================================================================
-- Updated At Trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_collaborator_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_collaborator_updated_at
  BEFORE UPDATE ON public.story_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION update_collaborator_updated_at();

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Check if user has at least a specific role on a story
CREATE OR REPLACE FUNCTION has_story_access(story_uuid UUID, min_role collaborator_role DEFAULT 'viewer')
RETURNS BOOLEAN AS $$
DECLARE
  role_order INTEGER;
  user_role_order INTEGER;
BEGIN
  -- Map roles to numeric order for comparison
  SELECT CASE min_role
    WHEN 'viewer' THEN 1
    WHEN 'commenter' THEN 2
    WHEN 'editor' THEN 3
    WHEN 'co_author' THEN 4
  END INTO role_order;
  
  -- Check if user is the author (full access)
  IF EXISTS (
    SELECT 1 FROM public.stories 
    WHERE id = story_uuid AND author_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;
  
  -- Check collaborator role
  SELECT CASE c.role
    WHEN 'viewer' THEN 1
    WHEN 'commenter' THEN 2
    WHEN 'editor' THEN 3
    WHEN 'co_author' THEN 4
  END INTO user_role_order
  FROM public.story_collaborators c
  WHERE c.story_id = story_uuid 
    AND c.user_id = auth.uid()
    AND c.is_active = true
    AND c.accepted_at IS NOT NULL;
  
  RETURN COALESCE(user_role_order >= role_order, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's role on a story
CREATE OR REPLACE FUNCTION get_story_role(story_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check if user is the author
  IF EXISTS (
    SELECT 1 FROM public.stories 
    WHERE id = story_uuid AND author_id = auth.uid()
  ) THEN
    RETURN 'owner';
  END IF;
  
  -- Get collaborator role
  SELECT c.role::TEXT INTO user_role
  FROM public.story_collaborators c
  WHERE c.story_id = story_uuid 
    AND c.user_id = auth.uid()
    AND c.is_active = true
    AND c.accepted_at IS NOT NULL;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS Policies for story_collaborators
-- ============================================================================

ALTER TABLE public.story_collaborators ENABLE ROW LEVEL SECURITY;

-- Authors can manage collaborators on their stories
CREATE POLICY "Authors can manage collaborators"
  ON public.story_collaborators
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.stories 
      WHERE id = story_id AND author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stories 
      WHERE id = story_id AND author_id = auth.uid()
    )
  );

-- Co-authors can view collaborators (but not modify)
CREATE POLICY "Co-authors can view collaborators"
  ON public.story_collaborators
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.story_collaborators c
      WHERE c.story_id = story_collaborators.story_id
        AND c.user_id = auth.uid()
        AND c.role = 'co_author'
        AND c.is_active = true
        AND c.accepted_at IS NOT NULL
    )
  );

-- Users can view their own collaborations
CREATE POLICY "Users can view own collaborations"
  ON public.story_collaborators
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own collaboration (accept/decline)
CREATE POLICY "Users can update own collaboration"
  ON public.story_collaborators
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- RLS Policies for story_invitations
-- ============================================================================

ALTER TABLE public.story_invitations ENABLE ROW LEVEL SECURITY;

-- Authors can manage invitations
CREATE POLICY "Authors can manage invitations"
  ON public.story_invitations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.stories 
      WHERE id = story_id AND author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stories 
      WHERE id = story_id AND author_id = auth.uid()
    )
  );

-- Users can view invitations sent to their email
CREATE POLICY "Users can view own invitations"
  ON public.story_invitations
  FOR SELECT
  USING (
    email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- Update Stories RLS to include collaborators
-- ============================================================================

-- Drop existing select policies to replace with collaborator-aware versions
DROP POLICY IF EXISTS "Users can view own stories" ON public.stories;
DROP POLICY IF EXISTS "Collaborators can view stories" ON public.stories;

-- Users can view their own stories OR stories they collaborate on
CREATE POLICY "Users can view own or collaborated stories"
  ON public.stories
  FOR SELECT
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.story_collaborators c
      WHERE c.story_id = stories.id
        AND c.user_id = auth.uid()
        AND c.is_active = true
        AND c.accepted_at IS NOT NULL
    )
  );

-- Editors and co-authors can update stories
DROP POLICY IF EXISTS "Collaborators can update stories" ON public.stories;

CREATE POLICY "Collaborators can update stories"
  ON public.stories
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.story_collaborators c
      WHERE c.story_id = stories.id
        AND c.user_id = auth.uid()
        AND c.role IN ('editor', 'co_author')
        AND c.is_active = true
        AND c.accepted_at IS NOT NULL
    )
  );

-- ============================================================================
-- Table Grants
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_collaborators TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_invitations TO authenticated;
