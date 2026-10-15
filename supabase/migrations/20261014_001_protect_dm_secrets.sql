-- =====================================================
-- Protect DM-only fields from players (2026-10-14 audit)
-- =====================================================
-- RLS is row-level only: any accepted player who can see a quest_scenes /
-- quest_npcs row could previously `select=*` and read `dm_notes` / `secrets`
-- with the public anon key.
--
-- Fix: replace table-level SELECT with column-level SELECT on every column
-- EXCEPT the DM-only ones, and expose those through a SECURITY DEFINER RPC
-- that only answers the quest's DM.
--
-- DEPLOY ORDER: ship the application code first (it uses explicit column
-- lists and falls back gracefully when this RPC is missing), then apply this
-- migration. Applying it before the code ships breaks `select('*')` queries.
--
-- NOTE: future `ALTER TABLE ... ADD COLUMN` on these tables must also run
-- `GRANT SELECT (new_column) ON <table> TO anon, authenticated;`.

DO $$
DECLARE
  cols TEXT;
BEGIN
  -- quest_scenes: everything but dm_notes
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
    INTO cols
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'quest_scenes'
     AND column_name <> 'dm_notes';

  EXECUTE 'REVOKE SELECT ON public.quest_scenes FROM anon, authenticated';
  EXECUTE format('GRANT SELECT (%s) ON public.quest_scenes TO anon, authenticated', cols);

  -- quest_npcs: everything but secrets
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
    INTO cols
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'quest_npcs'
     AND column_name <> 'secrets';

  EXECUTE 'REVOKE SELECT ON public.quest_npcs FROM anon, authenticated';
  EXECUTE format('GRANT SELECT (%s) ON public.quest_npcs TO anon, authenticated', cols);
END $$;

-- DM-only accessor. Returns {"scenes": {id: dm_notes}, "npcs": {id: secrets}}
-- or NULL when the caller is not the quest's DM.
CREATE OR REPLACE FUNCTION public.get_quest_dm_secrets(p_quest_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.quests q
     WHERE q.id = p_quest_id
       AND q.dm_id = auth.uid()
  ) THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'scenes', COALESCE(
      (SELECT jsonb_object_agg(s.id, s.dm_notes)
         FROM public.quest_scenes s
        WHERE s.quest_id = p_quest_id),
      '{}'::jsonb),
    'npcs', COALESCE(
      (SELECT jsonb_object_agg(n.id, n.secrets)
         FROM public.quest_npcs n
        WHERE n.quest_id = p_quest_id),
      '{}'::jsonb)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_quest_dm_secrets(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_quest_dm_secrets(UUID) TO authenticated;
