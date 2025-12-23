-- Story Templates Migration
-- Feature 6: Template system for quick story starts

-- Create story_templates table
CREATE TABLE IF NOT EXISTS story_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template metadata
  name TEXT NOT NULL,
  description TEXT,
  scope TEXT NOT NULL CHECK (scope IN ('tome', 'tale', 'scene')),
  
  -- Template type: system (built-in) vs user (created by users)
  template_type TEXT NOT NULL DEFAULT 'user' CHECK (template_type IN ('system', 'user')),
  
  -- Creator (null for system templates)
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Template content
  initial_content JSONB, -- TipTap JSON structure
  suggested_title TEXT,
  
  -- Structure hints
  chapter_outline JSONB, -- For Tomes: suggested chapter structure
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  genre TEXT,
  estimated_words INTEGER, -- Suggested word count
  
  -- Usage tracking
  use_count INTEGER DEFAULT 0,
  
  -- Visibility
  is_public BOOLEAN DEFAULT false, -- User templates can be shared
  is_featured BOOLEAN DEFAULT false, -- Admin-promoted templates
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying templates
CREATE INDEX idx_templates_scope ON story_templates(scope);
CREATE INDEX idx_templates_type ON story_templates(template_type);
CREATE INDEX idx_templates_public ON story_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_templates_featured ON story_templates(is_featured) WHERE is_featured = true;
CREATE INDEX idx_templates_created_by ON story_templates(created_by);

-- Enable RLS
ALTER TABLE story_templates ENABLE ROW LEVEL SECURITY;

-- Policies for story_templates
-- Everyone can view system templates and public user templates
CREATE POLICY "Anyone can view system and public templates"
  ON story_templates
  FOR SELECT
  USING (template_type = 'system' OR is_public = true OR created_by = auth.uid());

-- Users can create their own templates
CREATE POLICY "Users can create templates"
  ON story_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND 
    template_type = 'user'
  );

-- Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON story_templates
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() AND template_type = 'user')
  WITH CHECK (created_by = auth.uid() AND template_type = 'user');

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates"
  ON story_templates
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() AND template_type = 'user');

-- Admins can manage all templates (including system)
CREATE POLICY "Admins can manage all templates"
  ON story_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS template_updated_at ON story_templates;
CREATE TRIGGER template_updated_at
  BEFORE UPDATE ON story_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_template_updated_at();

-- Increment use count function
CREATE OR REPLACE FUNCTION increment_template_use_count(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE story_templates
  SET use_count = use_count + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert system templates
INSERT INTO story_templates (name, description, scope, template_type, initial_content, suggested_title, genre, tags, estimated_words, is_featured)
VALUES 
  -- Scene Templates
  (
    'The First Meeting',
    'Two characters meet for the first time. Perfect for introducing relationships.',
    'scene',
    'system',
    '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "The moment their eyes met, everything changed..."}]}, {"type": "paragraph"}, {"type": "paragraph", "content": [{"type": "text", "text": "Continue your scene here. Consider:"}]}, {"type": "bulletList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "What draws these characters together?"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "What tension exists between them?"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "How does this meeting change the Everloop?"}]}]}]}]}',
    'The First Meeting',
    'drama',
    ARRAY['character', 'relationship', 'introduction'],
    500,
    true
  ),
  (
    'The Revelation',
    'A character discovers a truth that changes everything.',
    'scene',
    'system',
    '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "The truth had been hidden for so long, but now..."}]}, {"type": "paragraph"}, {"type": "paragraph", "content": [{"type": "text", "text": "What secret is revealed? How does your character react?"}]}]}',
    'The Revelation',
    'mystery',
    ARRAY['discovery', 'secret', 'turning-point'],
    400,
    true
  ),
  (
    'The Quiet Moment',
    'A contemplative scene of reflection and introspection.',
    'scene',
    'system',
    '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "In the stillness between heartbeats, they remembered..."}]}, {"type": "paragraph"}, {"type": "paragraph", "content": [{"type": "text", "text": "Perfect for exploring a character''s inner world and memories."}]}]}',
    'The Quiet Moment',
    'literary',
    ARRAY['introspection', 'memory', 'contemplative'],
    300,
    true
  ),
  
  -- Tale Templates
  (
    'The Journey',
    'A complete story arc following a character''s transformation through travel.',
    'tale',
    'system',
    '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Part I: Departure"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Begin with why your character must leave..."}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Part II: The Road"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "What challenges do they face?"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Part III: Return"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "How have they changed?"}]}]}',
    'The Journey',
    'adventure',
    ARRAY['journey', 'transformation', 'adventure'],
    2000,
    true
  ),
  (
    'The Reckoning',
    'A tale of consequences coming due.',
    'tale',
    'system',
    '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Every action in the Everloop has consequences. Today, those consequences arrived..."}]}, {"type": "paragraph"}, {"type": "paragraph", "content": [{"type": "text", "text": "Structure your tale around:"}]}, {"type": "orderedList", "content": [{"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "The past action that set events in motion"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "The present confrontation"}]}]}, {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "The resolution and new equilibrium"}]}]}]}]}',
    'The Reckoning',
    'drama',
    ARRAY['consequences', 'confrontation', 'resolution'],
    1500,
    true
  ),
  
  -- Tome Templates
  (
    'The Chronicle',
    'An epic narrative following world-shaping events across multiple chapters.',
    'tome',
    'system',
    '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "Prologue"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Set the stage for your epic tale..."}]}, {"type": "paragraph"}, {"type": "paragraph", "content": [{"type": "text", "text": "This template suggests a structure for a longer work. Use the Chapter Manager to organize your narrative."}]}]}',
    'The Chronicle of [Era/Event]',
    'epic',
    ARRAY['epic', 'world-building', 'chronicle'],
    10000,
    true
  ),
  (
    'The Intertwined',
    'Multiple perspectives weaving together into a larger tapestry.',
    'tome',
    'system',
    '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Three souls, separated by circumstance, bound by fate..."}]}, {"type": "paragraph"}, {"type": "paragraph", "content": [{"type": "text", "text": "Consider creating chapters for each perspective, letting them converge as the story unfolds."}]}]}',
    'The Intertwined',
    'literary',
    ARRAY['multiple-pov', 'ensemble', 'literary'],
    8000,
    true
  );
