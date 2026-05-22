-- =====================================================
-- Map Label Overrides — admin-editable positions for
-- the static map labels (towns, cities, villages, etc.)
-- defined in lib/data/map-labels.ts.
--
-- Static labels remain the source of truth for which
-- places exist on each region map; this table only
-- overrides their (x, z) coordinates so the Admin
-- Map Maker UI can drag-reposition them and have the
-- public Interactive Maps reflect the change.
-- =====================================================

CREATE TABLE IF NOT EXISTS map_label_overrides (
  region_id   text        NOT NULL,
  label_name  text        NOT NULL,
  x           numeric     NOT NULL CHECK (x >= 0 AND x <= 100),
  z           numeric     NOT NULL CHECK (z >= 0 AND z <= 100),
  updated_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (region_id, label_name)
);

CREATE INDEX IF NOT EXISTS map_label_overrides_region_idx
  ON map_label_overrides (region_id);

ALTER TABLE map_label_overrides ENABLE ROW LEVEL SECURITY;

-- Everyone can read overrides (they drive the public map).
DROP POLICY IF EXISTS "map_label_overrides_select_all" ON map_label_overrides;
CREATE POLICY "map_label_overrides_select_all"
  ON map_label_overrides
  FOR SELECT
  USING (true);

-- Only admins can mutate overrides.
DROP POLICY IF EXISTS "map_label_overrides_admin_write" ON map_label_overrides;
CREATE POLICY "map_label_overrides_admin_write"
  ON map_label_overrides
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

GRANT SELECT ON map_label_overrides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON map_label_overrides TO authenticated;
