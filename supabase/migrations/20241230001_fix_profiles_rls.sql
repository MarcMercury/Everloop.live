-- Fix RLS policies for profiles table
-- Ensure users can update their own profile

-- Drop existing policy if it exists (to recreate with correct definition)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate the update policy
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Also ensure the insert policy exists
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
