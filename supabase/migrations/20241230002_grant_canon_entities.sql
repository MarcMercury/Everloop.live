-- Grant table-level permissions for canon_entities
-- RLS policies control row-level access, but roles still need table-level GRANT

-- Allow authenticated users to insert entities (for creating drafts)
GRANT INSERT ON public.canon_entities TO authenticated;

-- Allow authenticated users to update their own entities (RLS controls which rows)
GRANT UPDATE ON public.canon_entities TO authenticated;

-- Allow authenticated users to delete their own draft entities (RLS controls which rows)
GRANT DELETE ON public.canon_entities TO authenticated;

-- Confirm existing SELECT grant (should already exist but ensure it's there)
GRANT SELECT ON public.canon_entities TO authenticated, anon;
