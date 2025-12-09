-- =====================================================
-- CLEAR ALL CONTENT (SAFE)
-- This script removes all data while preserving schema
-- Run this FIRST before re-inserting migrations
-- =====================================================

-- Clear in order of foreign key dependencies
-- (Delete child tables before parent tables)

-- 1. Clear shards first (references canon_entities)
DELETE FROM public.shards;

-- 2. Clear story reviews (references stories)
DELETE FROM public.story_reviews;

-- 3. Clear stories (references profiles)
DELETE FROM public.stories;

-- 4. Clear canon entities (referenced by shards, now safe)
DELETE FROM public.canon_entities;

-- Verify all cleared
SELECT 'shards' as table_name, COUNT(*) as row_count FROM public.shards
UNION ALL
SELECT 'canon_entities', COUNT(*) FROM public.canon_entities
UNION ALL
SELECT 'stories', COUNT(*) FROM public.stories
UNION ALL
SELECT 'story_reviews', COUNT(*) FROM public.story_reviews;

-- Output should show all tables with 0 rows
