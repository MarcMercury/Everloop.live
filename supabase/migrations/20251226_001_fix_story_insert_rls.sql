-- Fix story INSERT RLS policy to use auth.uid() instead of auth.role()
-- The auth.role() check may fail in some Supabase configurations

-- Drop the old policy
DROP POLICY IF EXISTS "Authenticated users can create stories" ON public.stories;

-- Create the new policy with auth.uid() check
CREATE POLICY "Authenticated users can create stories"
ON public.stories FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Also ensure the author_id is set correctly
-- The policy should check that author_id equals the current user
DROP POLICY IF EXISTS "Users create own stories" ON public.stories;

CREATE POLICY "Users create own stories"
ON public.stories FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND author_id = auth.uid()
);
