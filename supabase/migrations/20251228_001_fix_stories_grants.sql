-- Fix missing table grants for stories table
-- The authenticated role was missing INSERT, UPDATE, DELETE privileges

GRANT INSERT, UPDATE, DELETE ON public.stories TO authenticated;

-- Also ensure the anon role can SELECT (already exists but let's be explicit)
GRANT SELECT ON public.stories TO anon;
GRANT SELECT ON public.stories TO authenticated;
