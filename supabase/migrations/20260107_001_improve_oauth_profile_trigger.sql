-- =====================================================
-- IMPROVED PROFILE TRIGGER FOR OAUTH USERS
-- Handles Google OAuth metadata better
-- =====================================================

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Improved function to handle both email/password and OAuth signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_username TEXT;
  base_username TEXT;
  counter INT := 0;
BEGIN
  -- Generate base username from various sources
  base_username := COALESCE(
    -- Try explicit username from signup form
    NEW.raw_user_meta_data->>'username',
    -- Try Google's name
    LOWER(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data->>'name', ''), '[^a-zA-Z0-9]', '_', 'g')),
    -- Try full_name (Google/OAuth)
    LOWER(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), '[^a-zA-Z0-9]', '_', 'g')),
    -- Fallback to email prefix
    LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-zA-Z0-9]', '_', 'g'))
  );
  
  -- Ensure minimum length
  IF LENGTH(base_username) < 3 THEN
    base_username := 'user_' || base_username;
  END IF;
  
  -- Try the base username first
  new_username := base_username;
  
  -- Check for uniqueness and append suffix if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) LOOP
    counter := counter + 1;
    new_username := base_username || '_' || counter::TEXT;
    
    -- Safety limit
    IF counter > 1000 THEN
      new_username := base_username || '_' || EXTRACT(EPOCH FROM NOW())::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  -- Insert the profile
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
      NEW.raw_user_meta_data->>'picture'  -- Google OAuth uses 'picture'
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists (race condition), ignore
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
