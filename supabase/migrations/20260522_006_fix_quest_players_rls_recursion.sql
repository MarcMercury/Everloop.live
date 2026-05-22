-- =====================================================
-- Fix: infinite recursion in quest_players RLS policy
-- The previous "Campaign members can see players" SELECT policy
-- referenced quest_players from within its own USING expression,
-- which causes Postgres error 42P17 ("infinite recursion detected
-- in policy for relation quest_players") whenever another policy
-- (e.g. quest_scenes, quest_sessions) checks membership.
--
-- Fix: replace the recursive sub-query with a SECURITY DEFINER
-- helper function that bypasses RLS for the membership check.
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_accepted_quest_player(p_quest_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM quest_players
    WHERE quest_id = p_quest_id
      AND user_id  = p_user_id
      AND status   = 'accepted'
  );
$$;

REVOKE ALL ON FUNCTION public.is_accepted_quest_player(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_accepted_quest_player(UUID, UUID) TO authenticated, service_role;

-- Replace the recursive policy
DROP POLICY IF EXISTS "Campaign members can see players" ON public.quest_players;

CREATE POLICY "Campaign members can see players" ON public.quest_players
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_accepted_quest_player(quest_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.quests c
      WHERE c.id = quest_players.quest_id
        AND c.dm_id = auth.uid()
    )
  );
