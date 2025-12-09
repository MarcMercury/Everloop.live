-- Create a function to check if the current user is an admin
-- This uses SECURITY DEFINER to bypass RLS and check the is_admin column directly

CREATE OR REPLACE FUNCTION public.is_admin_check()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND is_admin = true
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_check() TO authenticated;

-- Also create a version that returns the admin status for a given user id
-- Useful for checking other users (admins only)
CREATE OR REPLACE FUNCTION public.get_user_admin_status(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- First check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RETURN NULL; -- Non-admins can't check others
  END IF;
  
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_id 
    AND is_admin = true
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_admin_status(UUID) TO authenticated;
