-- =====================================================
-- COMMIT EXISTING LORE TO CANON
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Safety Check - Show what we're about to update
SELECT 
    id,
    name,
    type,
    status,
    created_by,
    created_at
FROM public.canon_entities
ORDER BY created_at;

-- =====================================================
-- Step 2: THE "MAKE OFFICIAL" UPDATE
-- This makes all entities canonical and visible
-- =====================================================

-- IMPORTANT: Replace 'YOUR_ADMIN_USER_ID' with your actual admin user ID
-- You can find it by running: SELECT id, username FROM profiles WHERE is_admin = true;

-- Uncomment and run this block after verifying Step 1:
/*
UPDATE public.canon_entities
SET 
    status = 'canonical',
    created_by = COALESCE(created_by, 'YOUR_ADMIN_USER_ID'::uuid),
    updated_at = NOW()
WHERE status IN ('draft', 'proposed');
*/

-- =====================================================
-- ALTERNATIVE: If you know your Admin ID, use this:
-- =====================================================

-- First, find your admin user ID:
SELECT id, username, is_admin FROM profiles WHERE is_admin = true;

-- Then run this (replace the UUID):
/*
UPDATE public.canon_entities
SET 
    status = 'canonical',
    created_by = COALESCE(created_by, (SELECT id FROM profiles WHERE is_admin = true LIMIT 1)),
    approved_by = (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
    updated_at = NOW()
WHERE status IN ('draft', 'proposed');
*/

-- =====================================================
-- Step 3: VERIFY THE UPDATE
-- =====================================================
/*
SELECT 
    name,
    type,
    status,
    created_by,
    approved_by,
    embedding IS NOT NULL as has_embedding
FROM public.canon_entities
ORDER BY name;
*/

-- =====================================================
-- QUICK ONE-LINER (if you're confident)
-- Makes ALL entities canonical using the first admin user
-- =====================================================
/*
UPDATE public.canon_entities
SET 
    status = 'canonical',
    created_by = COALESCE(created_by, (SELECT id FROM profiles WHERE is_admin = true LIMIT 1)),
    approved_by = (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
    updated_at = NOW();
*/
