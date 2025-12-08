-- =====================================================
-- CANON ALIGNMENT: Vector Search Function
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Function to find canon entities similar to an input embedding
-- Uses pgvector's cosine distance operator (<=>)
CREATE OR REPLACE FUNCTION match_canon_entities(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  name text,
  type text,
  description text,
  extended_lore jsonb,
  stability_rating decimal,
  status text,
  tags text[],
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.name,
    ce.type,
    ce.description,
    ce.extended_lore,
    ce.stability_rating,
    ce.status,
    ce.tags,
    1 - (ce.embedding <=> query_embedding) AS similarity
  FROM canon_entities ce
  WHERE 
    ce.embedding IS NOT NULL
    AND ce.status IN ('canonical', 'proposed')
    AND 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION match_canon_entities(vector, float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION match_canon_entities(vector, float, int) TO anon;

-- =====================================================
-- USAGE EXAMPLE:
-- =====================================================
-- SELECT * FROM match_canon_entities(
--   '[0.1, 0.2, ...]'::vector(1536),  -- Your embedding
--   0.5,                                -- Similarity threshold (0-1)
--   5                                   -- Number of results
-- );
