-- Temporarily add policies to allow authenticated users to read all data
-- Run this in Supabase SQL Editor

-- For stories - allow any authenticated user to read all stories
DROP POLICY IF EXISTS "Authenticated users can view all stories" ON public.stories;
CREATE POLICY "Authenticated users can view all stories"
    ON public.stories FOR SELECT
    USING (auth.role() = 'authenticated');

-- For canon_entities - this should already allow everyone, but let's be explicit
DROP POLICY IF EXISTS "All users can view canon entities" ON public.canon_entities;
CREATE POLICY "All users can view canon entities"
    ON public.canon_entities FOR SELECT
    USING (true);

-- Add update policy for canon_entities for authenticated users
DROP POLICY IF EXISTS "Authenticated users can update canon entities" ON public.canon_entities;
CREATE POLICY "Authenticated users can update canon entities"
    ON public.canon_entities FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Verify
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('stories', 'canon_entities')
ORDER BY tablename, cmd;
