-- Fix RLS for story_entities and story_reviews tables

-- Enable RLS on story_entities
ALTER TABLE IF EXISTS story_entities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view story entities" ON story_entities;
DROP POLICY IF EXISTS "Authors can manage story entities" ON story_entities;
DROP POLICY IF EXISTS "Admins can manage all story entities" ON story_entities;

-- Story entities are readable by everyone (they link stories to canon entities)
CREATE POLICY "Anyone can view story entities"
  ON story_entities FOR SELECT
  USING (true);

-- Authors can manage their story's entities
CREATE POLICY "Authors can manage story entities"
  ON story_entities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stories s
      WHERE s.id = story_entities.story_id
      AND s.author_id = auth.uid()
    )
  );

-- Admins can manage all story entities
CREATE POLICY "Admins can manage all story entities"
  ON story_entities FOR ALL
  USING (is_admin_safe() = true);

-- Story reviews - drop existing then create
DROP POLICY IF EXISTS "Admins can view reviews" ON story_reviews;
DROP POLICY IF EXISTS "Admins can insert reviews" ON story_reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON story_reviews;
DROP POLICY IF EXISTS "Authors can view own story reviews" ON story_reviews;

-- Only admins can manage reviews
CREATE POLICY "Admins can view reviews"
  ON story_reviews FOR SELECT
  USING (is_admin_safe() = true);

CREATE POLICY "Admins can insert reviews"
  ON story_reviews FOR INSERT
  WITH CHECK (is_admin_safe() = true);

CREATE POLICY "Admins can update reviews"
  ON story_reviews FOR UPDATE
  USING (is_admin_safe() = true);

-- Authors can view reviews of their own stories
CREATE POLICY "Authors can view own story reviews"
  ON story_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stories s
      WHERE s.id = story_reviews.story_id
      AND s.author_id = auth.uid()
    )
  );
