-- =====================================================
-- CLEAR ALL CONTENT (SAFE)
-- This script removes all data while preserving schema
-- Run this FIRST before re-inserting migrations
-- =====================================================

-- Disable triggers temporarily for faster deletion
ALTER TABLE public.canon_entities DISABLE TRIGGER ALL;
ALTER TABLE public.stories DISABLE TRIGGER ALL;
ALTER TABLE public.story_reviews DISABLE TRIGGER ALL;

-- Clear in order of foreign key dependencies

-- 1. Clear story reviews (references stories)
DELETE FROM public.story_reviews;

-- 2. Clear stories (references profiles)
DELETE FROM public.stories;

-- 3. Clear canon entities (references profiles)
DELETE FROM public.canon_entities;

-- Re-enable triggers
ALTER TABLE public.canon_entities ENABLE TRIGGER ALL;
ALTER TABLE public.stories ENABLE TRIGGER ALL;
ALTER TABLE public.story_reviews ENABLE TRIGGER ALL;

-- Verify all cleared
SELECT 'canon_entities' as table_name, COUNT(*) as row_count FROM public.canon_entities
UNION ALL
SELECT 'stories', COUNT(*) FROM public.stories
UNION ALL
SELECT 'story_reviews', COUNT(*) FROM public.story_reviews;

-- Output should show:
-- canon_entities | 0
-- stories        | 0
-- story_reviews  | 0
