-- =====================================================
-- STORY CHAPTERS
-- Chapters for Tome-type stories
-- =====================================================

-- Create the story_chapters table
CREATE TABLE IF NOT EXISTS public.story_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Chapter',
    content JSONB NOT NULL DEFAULT '{}',
    content_text TEXT,
    word_count INTEGER DEFAULT 0,
    word_target INTEGER DEFAULT 0,
    summary TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'complete', 'revision')),
    chapter_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS story_chapters_story_id_idx ON public.story_chapters(story_id);
CREATE INDEX IF NOT EXISTS story_chapters_order_idx ON public.story_chapters(story_id, chapter_order);

-- Enable RLS
ALTER TABLE public.story_chapters ENABLE ROW LEVEL SECURITY;

-- Chapters are viewable if the parent story is viewable
CREATE POLICY "Chapters viewable with story"
    ON public.story_chapters FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.stories 
            WHERE stories.id = story_chapters.story_id 
            AND (stories.is_published = true OR stories.author_id = auth.uid())
        )
    );

-- Only story author can insert chapters
CREATE POLICY "Authors can create chapters"
    ON public.story_chapters FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.stories 
            WHERE stories.id = story_chapters.story_id 
            AND stories.author_id = auth.uid()
        )
    );

-- Only story author can update chapters
CREATE POLICY "Authors can update chapters"
    ON public.story_chapters FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.stories 
            WHERE stories.id = story_chapters.story_id 
            AND stories.author_id = auth.uid()
        )
    );

-- Only story author can delete chapters
CREATE POLICY "Authors can delete chapters"
    ON public.story_chapters FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.stories 
            WHERE stories.id = story_chapters.story_id 
            AND stories.author_id = auth.uid()
        )
    );

-- Function to update chapter order after deletion
CREATE OR REPLACE FUNCTION reorder_chapters_after_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.story_chapters 
    SET chapter_order = chapter_order - 1
    WHERE story_id = OLD.story_id 
    AND chapter_order > OLD.chapter_order;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain chapter order
CREATE TRIGGER trigger_reorder_chapters
    AFTER DELETE ON public.story_chapters
    FOR EACH ROW
    EXECUTE FUNCTION reorder_chapters_after_delete();

-- Add comment for documentation
COMMENT ON TABLE public.story_chapters IS 'Chapters for Tome-type stories with drag-and-drop ordering';
