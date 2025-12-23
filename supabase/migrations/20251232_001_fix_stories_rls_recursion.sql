-- Fix infinite recursion in stories RLS policies
-- The is_admin_check() function queries profiles which can trigger RLS recursion

-- Drop the problematic admin policies on stories that use is_admin_check()
DROP POLICY IF EXISTS "Admins have full read access" ON stories;
DROP POLICY IF EXISTS "Admins have full update access" ON stories;
DROP POLICY IF EXISTS "Admins have full delete access" ON stories;
DROP POLICY IF EXISTS "Authenticated users can create stories" ON stories;

-- Create a SECURITY DEFINER function that bypasses RLS to check admin status
CREATE OR REPLACE FUNCTION is_admin_safe()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Recreate admin policies using the safe function (without recursion risk)
CREATE POLICY "Admins have full read access"
  ON stories FOR SELECT
  USING (is_admin_safe() = true);

CREATE POLICY "Admins have full update access"
  ON stories FOR UPDATE
  USING (is_admin_safe() = true);

CREATE POLICY "Admins have full delete access"
  ON stories FOR DELETE
  USING (is_admin_safe() = true);
