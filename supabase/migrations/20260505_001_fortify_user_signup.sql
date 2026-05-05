-- =====================================================
-- FORTIFY USER SIGNUP & PROFILE FLOW (2026-05-05)
-- =====================================================
-- Goals:
--   1. Re-assert the resilient handle_new_user() trigger so it never
--      blocks an auth.users insert (signup) due to a collision or any
--      other DB error. Failed profile creation is logged but never
--      aborts user creation.
--   2. Backfill profiles for any pre-existing orphan auth.users rows.
--   3. Expose reconcile_orphan_profiles() — an admin-only function
--      callable via the service_role to repair orphans on demand.
--
-- Idempotent: safe to run multiple times.
-- =====================================================

-- ---------- handle_new_user (resilient) ----------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  new_username  TEXT;
  counter       INT := 0;
BEGIN
  -- Skip cleanly if a profile already exists for this user
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Build a base username from the best available source
  base_username := NULLIF(LOWER(REGEXP_REPLACE(
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      SPLIT_PART(NEW.email, '@', 1),
      'user'
    ),
    '[^a-zA-Z0-9_-]', '_', 'g'
  )), '');

  IF base_username IS NULL OR LENGTH(base_username) < 3 THEN
    base_username := 'user_' || SUBSTR(REPLACE(NEW.id::TEXT, '-', ''), 1, 8);
  END IF;

  new_username := base_username;

  -- Resolve collisions deterministically; cap loop for safety
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username ILIKE new_username) LOOP
    counter := counter + 1;
    new_username := base_username || '_' || counter::TEXT;
    IF counter > 1000 THEN
      new_username := base_username || '_' || SUBSTR(MD5(RANDOM()::TEXT), 1, 6);
      EXIT;
    END IF;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    new_username,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      base_username
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth signup. Log the failure for later reconciliation.
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------- reconcile_orphan_profiles (admin tool) ----------
-- Returns the number of orphan profiles created. Callable by
-- service_role only (admin API uses the service role key).
CREATE OR REPLACE FUNCTION public.reconcile_orphan_profiles()
RETURNS INT AS $$
DECLARE
  fixed INT := 0;
  rec   RECORD;
  base_username TEXT;
  new_username  TEXT;
  counter       INT;
BEGIN
  FOR rec IN
    SELECT u.id, u.email, u.raw_user_meta_data, u.last_sign_in_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE p.id IS NULL
  LOOP
    base_username := NULLIF(LOWER(REGEXP_REPLACE(
      COALESCE(
        rec.raw_user_meta_data->>'username',
        rec.raw_user_meta_data->>'name',
        rec.raw_user_meta_data->>'full_name',
        SPLIT_PART(rec.email, '@', 1),
        'user'
      ),
      '[^a-zA-Z0-9_-]', '_', 'g'
    )), '');

    IF base_username IS NULL OR LENGTH(base_username) < 3 THEN
      base_username := 'user_' || SUBSTR(REPLACE(rec.id::TEXT, '-', ''), 1, 8);
    END IF;

    new_username := base_username;
    counter := 0;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username ILIKE new_username) LOOP
      counter := counter + 1;
      new_username := base_username || '_' || counter::TEXT;
      IF counter > 1000 THEN
        new_username := base_username || '_' || SUBSTR(MD5(RANDOM()::TEXT), 1, 6);
        EXIT;
      END IF;
    END LOOP;

    BEGIN
      INSERT INTO public.profiles (id, username, display_name, avatar_url, last_sign_in_at)
      VALUES (
        rec.id,
        new_username,
        COALESCE(
          rec.raw_user_meta_data->>'display_name',
          rec.raw_user_meta_data->>'full_name',
          rec.raw_user_meta_data->>'name',
          base_username
        ),
        COALESCE(
          rec.raw_user_meta_data->>'avatar_url',
          rec.raw_user_meta_data->>'picture'
        ),
        rec.last_sign_in_at
      )
      ON CONFLICT (id) DO NOTHING;

      fixed := fixed + 1;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'reconcile_orphan_profiles failed for %: %', rec.id, SQLERRM;
    END;
  END LOOP;

  RETURN fixed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.reconcile_orphan_profiles() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reconcile_orphan_profiles() FROM anon;
REVOKE ALL ON FUNCTION public.reconcile_orphan_profiles() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_orphan_profiles() TO service_role;

-- ---------- Backfill existing orphans now ----------
SELECT public.reconcile_orphan_profiles();
