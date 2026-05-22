-- =====================================================
-- Lore Agent infrastructure
-- =====================================================
-- Provides:
--  1. lore_agent_runs    — audit log for every agent invocation
--  2. lore_book_references — DB-backed entity↔lore-book map
--     (replaces the file-generated lib/data/lore-book-references.ts,
--      so static lore-page edits no longer require a redeploy)
--
-- Triggered after story/entity canonization via lib/agents/lore-agent.
-- =====================================================

-- ---------- 1. Audit log ----------
CREATE TABLE IF NOT EXISTS lore_agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger TEXT NOT NULL,                  -- 'story_canonized' | 'entity_canonized' | 'manual' | 'cron'
    trigger_ref UUID,                       -- story_id or entity_id that triggered the run
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'running', -- 'running' | 'success' | 'partial' | 'error'
    summary JSONB DEFAULT '{}'::jsonb,      -- per-pass counters (references_added, related_links_added, proposals, etc.)
    error TEXT
);

CREATE INDEX IF NOT EXISTS idx_lore_agent_runs_started_at
    ON lore_agent_runs (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_lore_agent_runs_trigger
    ON lore_agent_runs (trigger, started_at DESC);

GRANT SELECT ON lore_agent_runs TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON lore_agent_runs TO service_role;

-- ---------- 2. Lore-book reference map ----------
-- Static lore-book pages (e.g. narrative-history, four-loops-of-curiosities,
-- known-wonders-of-the-everloop) live as React pages, so they have no row
-- in `stories`. This table maps canon entities → those pages.
CREATE TABLE IF NOT EXISTS lore_book_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES canon_entities(id) ON DELETE CASCADE,
    book_slug TEXT NOT NULL,           -- matches /stories/<slug>
    book_title TEXT NOT NULL,
    book_subtitle TEXT,
    book_author TEXT,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (entity_id, book_slug)
);

CREATE INDEX IF NOT EXISTS idx_lore_book_references_entity
    ON lore_book_references (entity_id);

GRANT SELECT ON lore_book_references TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON lore_book_references TO service_role;

NOTIFY pgrst, 'reload schema';
