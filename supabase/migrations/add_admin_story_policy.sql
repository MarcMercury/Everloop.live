-- Add policy for admins to view all stories (for review queue)
-- Run this in Supabase SQL Editor

-- Drop the policy if it exists (for re-running)
DROP POLICY IF EXISTS "Admins can view all stories" ON public.stories;

-- Create admin view policy
CREATE POLICY "Admins can view all stories"
    ON public.stories FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Also add policy for admins to update stories (for approval workflow)
DROP POLICY IF EXISTS "Admins can update all stories" ON public.stories;

CREATE POLICY "Admins can update all stories"
    ON public.stories FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'stories';
