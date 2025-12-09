-- Add scope column to stories table
-- Scope defines the type/length of story: tome (novel), tale (short story), scene (vignette)

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'tale'
CHECK (scope IN ('tome', 'tale', 'scene'));

-- Add comment for documentation
COMMENT ON COLUMN public.stories.scope IS 'Story scope: tome (novel/multi-chapter), tale (short story), scene (vignette/moment)';
