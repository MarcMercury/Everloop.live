-- =====================================================
-- SHARD SYSTEM EXPANSION
-- Adds 4-layer build spec columns to shards table:
-- State, Location, Expression, Situation
-- Also adds missing columns from original schema
-- =====================================================

-- Add missing base columns (live DB diverged from schema.sql)
ALTER TABLE public.shards
  ADD COLUMN IF NOT EXISTS power_level INTEGER DEFAULT 1 CHECK (power_level >= 1 AND power_level <= 10),
  ADD COLUMN IF NOT EXISTS power_description TEXT,
  ADD COLUMN IF NOT EXISTS visual_description TEXT,
  ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Layer 1: Form State (what form is the shard in?)
ALTER TABLE public.shards
  ADD COLUMN IF NOT EXISTS shard_number INTEGER UNIQUE,
  ADD COLUMN IF NOT EXISTS form_state TEXT DEFAULT 'raw'
    CHECK (form_state IN ('raw', 'embedded', 'bound', 'buried', 'fractured'));

-- Layer 2: Location
ALTER TABLE public.shards
  ADD COLUMN IF NOT EXISTS region TEXT
    CHECK (region IN (
      'virelay_coast', 'deyune_steps', 'varnhalt_frontier',
      'virelay_deep_forests', 'polar_tundra', 'ocean_deep_water',
      'fray_zones', 'unknown_deep'
    )),
  ADD COLUMN IF NOT EXISTS site_types TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS location_description TEXT;

-- Layer 3: Expression (what is it doing?)
ALTER TABLE public.shards
  ADD COLUMN IF NOT EXISTS expressions TEXT[] DEFAULT '{}';

-- Layer 4: Situation (why is this a story?)
ALTER TABLE public.shards
  ADD COLUMN IF NOT EXISTS situations TEXT[] DEFAULT '{}';

-- Monster Integration
ALTER TABLE public.shards
  ADD COLUMN IF NOT EXISTS monster_link JSONB DEFAULT NULL;

-- Indexes for querying
CREATE INDEX IF NOT EXISTS idx_shards_region ON public.shards(region);
CREATE INDEX IF NOT EXISTS idx_shards_form_state ON public.shards(form_state);
CREATE INDEX IF NOT EXISTS idx_shards_shard_number ON public.shards(shard_number);
CREATE INDEX IF NOT EXISTS idx_shards_expressions ON public.shards USING gin(expressions);
CREATE INDEX IF NOT EXISTS idx_shards_situations ON public.shards USING gin(situations);

-- Grant permissions
GRANT SELECT ON public.shards TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.shards TO authenticated;
