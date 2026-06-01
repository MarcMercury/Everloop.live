-- =====================================================
-- 20260601_002_session_media.sql
-- Live-session media: photo captures + storage bucket
-- =====================================================

CREATE TABLE IF NOT EXISTS public.session_captures (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id    uuid NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  session_id  uuid REFERENCES public.quest_sessions(id) ON DELETE CASCADE,
  scene_id    uuid REFERENCES public.quest_scenes(id) ON DELETE SET NULL,
  captured_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  image_url   text NOT NULL,
  caption     text,
  captured_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS session_captures_quest_idx   ON public.session_captures(quest_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS session_captures_session_idx ON public.session_captures(session_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS session_captures_scene_idx   ON public.session_captures(scene_id, captured_at DESC);

ALTER TABLE public.session_captures ENABLE ROW LEVEL SECURITY;

-- DMs and accepted players for the quest can read captures
DROP POLICY IF EXISTS "session_captures_read" ON public.session_captures;
CREATE POLICY "session_captures_read" ON public.session_captures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = session_captures.quest_id
        AND (
          q.dm_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.quest_players p
            WHERE p.quest_id = q.id AND p.user_id = auth.uid() AND p.status = 'accepted'
          )
        )
    )
  );

-- Only the DM of the quest can insert captures (DM is the one running the camera)
DROP POLICY IF EXISTS "session_captures_insert" ON public.session_captures;
CREATE POLICY "session_captures_insert" ON public.session_captures
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = session_captures.quest_id AND q.dm_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "session_captures_delete" ON public.session_captures;
CREATE POLICY "session_captures_delete" ON public.session_captures
  FOR DELETE
  USING (
    captured_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.quests q
      WHERE q.id = session_captures.quest_id AND q.dm_id = auth.uid()
    )
  );

GRANT SELECT ON public.session_captures TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON public.session_captures TO authenticated, service_role;

-- =====================================================
-- Storage bucket for capture JPEGs (public-read for simplicity;
-- bucket is only writable via service role from /api/sessions/captures).
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'session-captures',
  'session-captures',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Anyone can read (since bucket is public). Service role handles writes from API.
DROP POLICY IF EXISTS "session_captures_public_read" ON storage.objects;
CREATE POLICY "session_captures_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'session-captures');

NOTIFY pgrst, 'reload schema';
