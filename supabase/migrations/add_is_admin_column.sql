-- Migration: Add is_admin column to profiles table
-- Run this in Supabase SQL Editor if is_admin column doesn't exist

-- Add is_admin column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Set is_admin to true for your user (replace with your actual user ID or email)
-- Option 1: By user ID
-- UPDATE public.profiles SET is_admin = TRUE WHERE id = 'your-user-uuid-here';

-- Option 2: By username
-- UPDATE public.profiles SET is_admin = TRUE WHERE username = 'your-username-here';

-- Verify the column exists and check values
SELECT id, username, role, is_admin FROM public.profiles;
