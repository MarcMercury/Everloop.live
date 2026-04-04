-- Add last_sign_in_at to profiles table
-- Supabase Auth's last_sign_in_at doesn't update reliably on session refresh,
-- so we track it ourselves on each actual sign-in event.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- Backfill from Supabase Auth for existing users
UPDATE public.profiles p
SET last_sign_in_at = u.last_sign_in_at
FROM auth.users u
WHERE p.id = u.id AND u.last_sign_in_at IS NOT NULL;
