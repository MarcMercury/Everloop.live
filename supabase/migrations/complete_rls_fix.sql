-- =====================================================
-- EVERLOOP RLS FIX - "God Mode" for Admins
-- Run this ENTIRE script in Supabase SQL Editor
-- =====================================================

-- STEP 1: Create the is_admin_check function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_admin_check()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 2: Fix STORIES table RLS policies
-- Drop ALL existing policies on stories
DROP POLICY IF EXISTS "Published stories are viewable by everyone" ON public.stories;
DROP POLICY IF EXISTS "Authenticated users can create stories" ON public.stories;
DROP POLICY IF EXISTS "Authors can update own stories" ON public.stories;
DROP POLICY IF EXISTS "Authors can delete own draft stories" ON public.stories;
DROP POLICY IF EXISTS "Admins can view all stories" ON public.stories;
DROP POLICY IF EXISTS "Admins can update all stories" ON public.stories;
DROP POLICY IF EXISTS "Authenticated users can view all stories" ON public.stories;

-- Create NEW robust policies for stories
-- Policy 1: Public can view published/canonical stories
CREATE POLICY "Public can view canonical stories"
ON public.stories FOR SELECT
USING (
  canon_status = 'canonical' OR is_published = true
);

-- Policy 2: Users can view their own stories (any status)
CREATE POLICY "Users can view own stories"
ON public.stories FOR SELECT
USING (
  auth.uid() = author_id
);

-- Policy 3: ADMINS CAN VIEW ALL STORIES (THE FIX)
CREATE POLICY "Admins have full read access"
ON public.stories FOR SELECT
USING (
  public.is_admin_check() = true
);

-- Policy 4: Users can create stories
CREATE POLICY "Authenticated users can create stories"
ON public.stories FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
);

-- Policy 5: Users can update their own stories
CREATE POLICY "Users can update own stories"
ON public.stories FOR UPDATE
USING (
  auth.uid() = author_id
);

-- Policy 6: ADMINS CAN UPDATE ALL STORIES
CREATE POLICY "Admins have full update access"
ON public.stories FOR UPDATE
USING (
  public.is_admin_check() = true
);

-- Policy 7: Users can delete their own draft stories
CREATE POLICY "Users can delete own drafts"
ON public.stories FOR DELETE
USING (
  auth.uid() = author_id AND canon_status = 'draft'
);

-- Policy 8: ADMINS CAN DELETE ANY STORY
CREATE POLICY "Admins have full delete access"
ON public.stories FOR DELETE
USING (
  public.is_admin_check() = true
);

-- STEP 3: Fix CANON_ENTITIES table RLS policies
-- Drop ALL existing policies on canon_entities
DROP POLICY IF EXISTS "Canon entities are viewable by everyone" ON public.canon_entities;
DROP POLICY IF EXISTS "Authenticated users can create canon entities" ON public.canon_entities;
DROP POLICY IF EXISTS "Creators can update their draft entities" ON public.canon_entities;
DROP POLICY IF EXISTS "All users can view canon entities" ON public.canon_entities;
DROP POLICY IF EXISTS "Authenticated users can update canon entities" ON public.canon_entities;

-- Create NEW robust policies for canon_entities
-- Policy 1: Public can view canonical/proposed entities
CREATE POLICY "Public can view canonical entities"
ON public.canon_entities FOR SELECT
USING (
  status IN ('canonical', 'proposed')
);

-- Policy 2: Users can view their own entities (any status)
CREATE POLICY "Users can view own entities"
ON public.canon_entities FOR SELECT
USING (
  auth.uid() = created_by
);

-- Policy 3: ADMINS CAN VIEW ALL ENTITIES (THE FIX)
CREATE POLICY "Admins have full entity read access"
ON public.canon_entities FOR SELECT
USING (
  public.is_admin_check() = true
);

-- Policy 4: Users can create entities
CREATE POLICY "Authenticated users can create entities"
ON public.canon_entities FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
);

-- Policy 5: Users can update their own draft entities
CREATE POLICY "Users can update own draft entities"
ON public.canon_entities FOR UPDATE
USING (
  auth.uid() = created_by AND status = 'draft'
);

-- Policy 6: ADMINS CAN UPDATE ALL ENTITIES
CREATE POLICY "Admins have full entity update access"
ON public.canon_entities FOR UPDATE
USING (
  public.is_admin_check() = true
);

-- Policy 7: ADMINS CAN DELETE ENTITIES
CREATE POLICY "Admins have full entity delete access"
ON public.canon_entities FOR DELETE
USING (
  public.is_admin_check() = true
);

-- STEP 4: Ensure table defaults are correct
-- Stories table: default author_id to current user
ALTER TABLE public.stories 
ALTER COLUMN author_id SET DEFAULT auth.uid();

ALTER TABLE public.stories 
ALTER COLUMN canon_status SET DEFAULT 'draft';

ALTER TABLE public.stories 
ALTER COLUMN created_at SET DEFAULT now();

-- Canon entities table: default created_by to current user  
ALTER TABLE public.canon_entities
ALTER COLUMN created_by SET DEFAULT auth.uid();

ALTER TABLE public.canon_entities
ALTER COLUMN status SET DEFAULT 'proposed';

ALTER TABLE public.canon_entities
ALTER COLUMN created_at SET DEFAULT now();

-- STEP 5: Verification queries
-- Check if you are recognized as admin
SELECT 
  id,
  username,
  is_admin,
  public.is_admin_check() as "function_returns"
FROM public.profiles 
WHERE id = auth.uid();

-- Count all stories (should work if you're admin)
SELECT 
  canon_status,
  COUNT(*) as count
FROM public.stories
GROUP BY canon_status;

-- Count all entities (should work if you're admin)
SELECT 
  status,
  COUNT(*) as count
FROM public.canon_entities
GROUP BY status;

-- List all policies to verify
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename IN ('stories', 'canon_entities')
ORDER BY tablename, cmd;
