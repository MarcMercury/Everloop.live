-- =====================================================
-- 20260522_002 Archive Connectivity: Wikipedia-Style Cross-Links
-- =====================================================
-- Wires up `related_entities` (UUID[]) across the canonical archive so the
-- explore pages surface the same connective tissue the descriptions already
-- imply. Also fills in `metadata->>'region'` for characters / factions /
-- artifacts that belong unambiguously to one region per the canon stories.
--
-- Strategy:
--   * `related_entities` is set via `array_agg(id)` from a slug list. Each
--     slug list is the OUTBOUND set for that entity. We then do a second
--     pass to make every relationship symmetric (so A→B also produces B→A
--     without us having to type both directions).
--   * Region assignment uses JSONB `||` merge so we don't clobber any other
--     metadata keys.
--   * Tags get the region appended idempotently via array_append + DISTINCT.
-- =====================================================

BEGIN;

-- -----------------------------------------------------
-- 1) RELATED ENTITIES — outbound sets per hub entity
-- -----------------------------------------------------

-- ----- Bellroot Vale: Three Siblings + Bell Tree saga (Story 1) -----

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'mira','thomel','alira','uncle-edran','fathers-shard','the-bell-tree',
    'drelmere','first-root-chamber','eidon','the-shards-of-the-pattern',
    'mayor-halrick-vann','the-fray','the-pattern'
  )
) WHERE slug = 'kaerlin';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'kaerlin','thomel','alira','uncle-edran','drelmere','old-bellroot-site',
    'the-bell-tree','the-fray','first-root-chamber'
  )
) WHERE slug = 'mira';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'kaerlin','mira','alira','uncle-edran','drelmere','eidon'
  )
) WHERE slug = 'thomel';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'kaerlin','mira','thomel','uncle-edran','fathers-shard','the-fray',
    'the-pattern','drelmere'
  )
) WHERE slug = 'alira';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'kaerlin','mira','thomel','alira','drelmere'
  )
) WHERE slug = 'uncle-edran';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'drelmere','the-bell-tree','first-root-chamber','the-shards-of-the-pattern',
    'kaerlin','halricks-reach'
  )
) WHERE slug = 'mayor-halrick-vann';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'drelmere','eidon','the-dreamers','kaerlin','mira'
  )
) WHERE slug = 'merra-dune';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'drelmere','first-root-chamber','the-dreamers','the-shards-of-the-pattern',
    'the-fold','the-pattern','thomel','merra-dune'
  )
) WHERE slug = 'eidon';

-- ----- House Thorne (Story 2: Virelay) -----

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'lord-thorne','lady-thorne','house-thorne-faction','the-fray',
    'the-shards-of-the-pattern'
  )
) WHERE slug = 'auren-thorne';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'auren-thorne','lady-thorne','house-thorne-faction'
  )
) WHERE slug = 'lord-thorne';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'auren-thorne','lord-thorne','house-thorne-faction'
  )
) WHERE slug = 'lady-thorne';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'lord-thorne','lady-thorne','auren-thorne','the-fray'
  )
) WHERE slug = 'house-thorne-faction';

-- ----- Rook & Myx (Story 3) -----

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'myx','sera','servine','the-fray','the-shards-of-the-pattern'
  )
) WHERE slug = 'rook';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'rook','sera','servine','the-fray'
  )
) WHERE slug = 'myx';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'rook','myx','the-fray','the-shards-of-the-pattern'
  )
) WHERE slug = 'sera';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'myx','rook'
  )
) WHERE slug = 'servine';

-- ----- The Veykar saga (Story 4) -----

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-draethan','the-girl-with-the-scar','the-crippled-boy','morran'
  )
) WHERE slug = 'the-veykar';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-veykar','the-girl-with-the-scar','the-crippled-boy','morran'
  )
) WHERE slug = 'the-draethan';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-veykar','the-draethan','the-crippled-boy','morran'
  )
) WHERE slug = 'the-girl-with-the-scar';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-veykar','the-draethan','the-girl-with-the-scar'
  )
) WHERE slug = 'the-crippled-boy';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-veykar','the-draethan','the-girl-with-the-scar'
  )
) WHERE slug = 'morran';

-- ----- Luminous Fold scholarly cluster -----

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-luminous-fold-civilisation','the-seventh-circle','the-vaultkeepers',
    'the-cartographic-society-of-iterants','the-attunement-system',
    'knowledge-fragmentation-principle','the-loosening','time-instability',
    'the-pattern','lumina'
  )
) WHERE slug = 'archael-viremont';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'archael-viremont','the-seventh-circle','the-vaultkeepers',
    'the-cartographic-society-of-iterants','the-attunement-system',
    'knowledge-fragmentation-principle','the-loosening','time-instability',
    'lumina','central-fold'
  )
) WHERE slug = 'the-luminous-fold-civilisation';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-luminous-fold-civilisation','archael-viremont','the-vaultkeepers',
    'the-attunement-system','knowledge-fragmentation-principle'
  )
) WHERE slug = 'the-seventh-circle';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-luminous-fold-civilisation','archael-viremont','the-dreamers',
    'the-attunement-system','knowledge-fragmentation-principle','the-loosening'
  )
) WHERE slug = 'the-cartographic-society-of-iterants';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-vaultkeepers','the-dreamers','the-luminous-fold-civilisation',
    'knowledge-fragmentation-principle','archael-viremont','the-pattern'
  )
) WHERE slug = 'the-attunement-system';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-attunement-system','the-luminous-fold-civilisation','archael-viremont',
    'the-loosening','time-instability','the-cartographic-society-of-iterants'
  )
) WHERE slug = 'knowledge-fragmentation-principle';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-fray','the-pattern','knowledge-fragmentation-principle',
    'archael-viremont','the-cartographic-society-of-iterants'
  )
) WHERE slug = 'the-loosening';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'archael-viremont','the-luminous-fold-civilisation','the-loosening',
    'knowledge-fragmentation-principle','the-attunement-system'
  )
) WHERE slug = 'time-instability';

-- ----- Cosmology concepts/artifacts -----

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-first-architects','the-prime-beings','the-weaving','the-pattern',
    'the-everloop'
  )
) WHERE slug = 'the-dawn';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-first-architects','the-dawn','the-pattern','the-everloop','the-fray',
    'the-shards-of-the-pattern','the-first-map'
  )
) WHERE slug = 'the-weaving';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-first-map','the-weaving','the-first-architects','the-fray',
    'the-everloop','the-dreamers','the-vaultkeepers','the-shards-of-the-pattern'
  )
) WHERE slug = 'the-pattern';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-pattern','the-weaving','the-first-architects','the-fray','the-dawn',
    'the-fold','the-shards-of-the-pattern'
  )
) WHERE slug = 'the-everloop';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-pattern','the-everloop','the-first-architects','the-fold',
    'the-shards-of-the-pattern','the-loosening','time-instability'
  )
) WHERE slug = 'the-fray';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-everloop','the-fray','the-shards-of-the-pattern','the-pattern'
  )
) WHERE slug = 'the-fold';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-pattern','the-everloop','the-fray','the-first-architects',
    'the-shards-of-the-pattern','the-weaving'
  )
) WHERE slug = 'the-first-map';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-first-map','the-pattern','the-fray','the-fold','the-bell-tree',
    'fathers-shard','the-first-architects'
  )
) WHERE slug = 'the-shards-of-the-pattern';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-dawn','the-weaving','the-pattern','the-first-map','the-fray',
    'the-prime-beings'
  )
) WHERE slug = 'the-first-architects';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-dawn','the-first-architects','the-weaving'
  )
) WHERE slug = 'the-prime-beings';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-pattern','the-fray','the-attunement-system','the-vaultkeepers',
    'eidon','drelmere'
  )
) WHERE slug = 'the-dreamers';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-pattern','the-first-map','the-dreamers','the-attunement-system',
    'the-shards-of-the-pattern'
  )
) WHERE slug = 'the-vaultkeepers';

-- ----- Artifacts -----

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'kaerlin','alira','the-bell-tree','the-shards-of-the-pattern','the-pattern'
  )
) WHERE slug = 'fathers-shard';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'drelmere','first-root-chamber','the-shards-of-the-pattern','fathers-shard',
    'mayor-halrick-vann','kaerlin','mira','thomel','eidon','the-fray',
    'the-pattern'
  )
) WHERE slug = 'the-bell-tree';

-- ----- Hub Locations -----

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-bell-tree','first-root-chamber','old-bellroot-site','east-drelmere',
    'bellroot-crossing','kaerlin','mira','thomel','alira','mayor-halrick-vann',
    'merra-dune','eidon','the-dreamers','the-fray'
  )
) WHERE slug = 'drelmere';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'drelmere','south-vale-cluster','halricks-reach','rootfall','tallpine'
  )
) WHERE slug = 'bellroot-crossing';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'drelmere','bellroot-crossing','mayor-halrick-vann','clearline','glass-reach'
  )
) WHERE slug = 'halricks-reach';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'drelmere'
  )
) WHERE slug = 'east-drelmere';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'drelmere','the-bell-tree','eidon','kaerlin','the-shards-of-the-pattern'
  )
) WHERE slug = 'first-root-chamber';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'drelmere','bellroot-crossing'
  )
) WHERE slug = 'old-bellroot-site';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'the-luminous-fold-civilisation','archael-viremont','central-fold',
    'the-attunement-system','axis-watch','symmetry'
  )
) WHERE slug = 'lumina';

UPDATE canon_entities SET related_entities = (
  SELECT array_agg(id) FROM canon_entities WHERE slug IN (
    'lumina','the-luminous-fold-civilisation','symmetry','axis-watch'
  )
) WHERE slug = 'central-fold';

-- -----------------------------------------------------
-- 2) SYMMETRY PASS — for every A→B, append A back into B
-- -----------------------------------------------------
-- This makes the graph undirected without us having to hand-type both
-- sides above. It runs once and is idempotent thanks to the DISTINCT.

WITH edges AS (
  SELECT a.id AS a_id, unnest(a.related_entities) AS b_id
  FROM canon_entities a
  WHERE a.related_entities IS NOT NULL
    AND array_length(a.related_entities, 1) > 0
),
incoming AS (
  SELECT b_id, array_agg(DISTINCT a_id) AS sources
  FROM edges
  GROUP BY b_id
)
UPDATE canon_entities ce
SET related_entities = (
  SELECT array_agg(DISTINCT x)
  FROM unnest(COALESCE(ce.related_entities, ARRAY[]::uuid[]) || i.sources) AS x
  WHERE x <> ce.id  -- never point an entity at itself
)
FROM incoming i
WHERE i.b_id = ce.id;

-- -----------------------------------------------------
-- 3) REGION ASSIGNMENT — characters / factions / artifacts
-- -----------------------------------------------------
-- Sets metadata.region so the entity appears in the right region context
-- (e.g. roster filtering, future map sidebars). We don't set map_x/map_z
-- because these aren't location-pinned — only their region is known.

-- Bellroot Vale (Story 1)
UPDATE canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('region', 'bellroot')
WHERE slug IN (
  'kaerlin','mira','thomel','alira','uncle-edran','mayor-halrick-vann',
  'merra-dune','eidon','fathers-shard'
)
AND (metadata->>'region' IS NULL OR metadata->>'region' = '');

-- House Thorne — Story 2 sees Auren travel to Virelay, but the family seat is
-- treated as a Bellroot-adjacent noble house in the canon doc set. If a later
-- migration repositions them, this is the only place to change.
UPDATE canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('region', 'virelay')
WHERE slug IN ('auren-thorne','lord-thorne','lady-thorne','house-thorne-faction')
AND (metadata->>'region' IS NULL OR metadata->>'region' = '');

-- The Veykar saga (eastern steppe → Deyune)
UPDATE canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('region', 'deyune')
WHERE slug IN (
  'the-veykar','the-draethan','the-girl-with-the-scar','the-crippled-boy','morran'
)
AND (metadata->>'region' IS NULL OR metadata->>'region' = '');

-- Luminous Fold scholarly cluster
UPDATE canon_entities
SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('region', 'luminous')
WHERE slug IN (
  'archael-viremont','the-seventh-circle','the-cartographic-society-of-iterants',
  'the-attunement-system','knowledge-fragmentation-principle','the-loosening',
  'time-instability'
)
AND (metadata->>'region' IS NULL OR metadata->>'region' = '');

-- -----------------------------------------------------
-- 4) PostgREST: reload schema so changes are visible
-- -----------------------------------------------------
NOTIFY pgrst, 'reload schema';

COMMIT;
