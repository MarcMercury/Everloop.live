-- =====================================================
-- Per-user rate limiting + usage log for paid AI APIs (2026-10-14 audit)
-- =====================================================
-- Used by lib/rate-limit.ts. Every allowed call to OpenAI / Gemini / Meshy /
-- ElevenLabs is logged here, which doubles as per-feature usage reporting.

CREATE TABLE IF NOT EXISTS public.api_usage_events (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bucket TEXT NOT NULL,
    feature TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_events_user_bucket_time
    ON public.api_usage_events (user_id, bucket, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_events_time
    ON public.api_usage_events (created_at DESC);

ALTER TABLE public.api_usage_events ENABLE ROW LEVEL SECURITY;

-- Users may see their own usage; admins see everything. Writes only via the RPC.
DROP POLICY IF EXISTS "Users can view own api usage" ON public.api_usage_events;
CREATE POLICY "Users can view own api usage"
    ON public.api_usage_events FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin_check());

GRANT SELECT ON public.api_usage_events TO authenticated;
GRANT ALL ON public.api_usage_events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.api_usage_events_id_seq TO service_role;

-- Atomically check-and-record one call for the current user.
-- Returns {"allowed": bool, "remaining": int, "retry_after_seconds": int}.
CREATE OR REPLACE FUNCTION public.consume_rate_limit(
    p_bucket TEXT,
    p_feature TEXT,
    p_limit INTEGER,
    p_window_seconds INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user UUID := auth.uid();
    v_window_start TIMESTAMPTZ := now() - make_interval(secs => p_window_seconds);
    v_count INTEGER;
    v_oldest TIMESTAMPTZ;
BEGIN
    IF v_user IS NULL THEN
        RETURN jsonb_build_object('allowed', false, 'remaining', 0, 'retry_after_seconds', 0);
    END IF;

    IF p_bucket NOT IN ('ai:text', 'ai:image', 'ai:3d', 'ai:audio') THEN
        RAISE EXCEPTION 'Unknown rate limit bucket: %', p_bucket;
    END IF;

    -- Clamp caller-supplied values so a client cannot grant itself a huge budget.
    p_limit := LEAST(GREATEST(p_limit, 1), 1000);
    p_window_seconds := LEAST(GREATEST(p_window_seconds, 1), 7 * 24 * 60 * 60);

    -- Serialize concurrent calls for the same user+bucket.
    PERFORM pg_advisory_xact_lock(hashtextextended(v_user::text || ':' || p_bucket, 0));

    SELECT count(*), min(created_at)
      INTO v_count, v_oldest
      FROM public.api_usage_events
     WHERE user_id = v_user
       AND bucket = p_bucket
       AND created_at > v_window_start;

    IF v_count >= p_limit THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'remaining', 0,
            'retry_after_seconds',
            GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_oldest + make_interval(secs => p_window_seconds) - now())))::INT)
        );
    END IF;

    INSERT INTO public.api_usage_events (user_id, bucket, feature)
    VALUES (v_user, p_bucket, left(p_feature, 64));

    RETURN jsonb_build_object('allowed', true, 'remaining', p_limit - v_count - 1, 'retry_after_seconds', 0);
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
