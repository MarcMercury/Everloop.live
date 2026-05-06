-- =====================================================
-- LORE TIME-UNIT CANON FIX
-- Updates Luminous Fold civilisation entry to match the
-- canonical world metrics defined in lib/world/metrics.ts:
--   1 Cycle = 30 Days   (NOT "day")
--   1 Loop  = 10 Cycles (NOT "year")
-- Idempotent: pure UPDATE on a known slug.
-- =====================================================

UPDATE public.canon_entities
SET
    description = 'The most ordered civilisation in the Everloop — a society built upon the conviction that reality may be measured, catalogued, and ultimately understood through structured systems. The Fold runs on Seconds, Minutes, Hours, Days, Cycles (30 Days), and Loops (10 Cycles), and its institutions assume that those measurements describe a universal truth. Two great offices uphold the order: the Archivists (Vaultkeepers), who record and preserve structure, and the Iterants (Dreamers), whose controlled manipulation of probability is treated as a technical discipline rather than an art. The Fold''s philosophy holds that order is constructed, not discovered. Its limitation, slowly revealed by Archael Viremont''s journals, is that it mistakes consistency for truth.',
    extended_lore = jsonb_set(
        jsonb_set(
            COALESCE(extended_lore, '{}'::jsonb),
            '{time_system,cycle}',
            '"30 Days"'::jsonb,
            true
        ),
        '{time_system,loop}',
        '"10 Cycles"'::jsonb,
        true
    )
WHERE slug = 'the-luminous-fold-civilisation';
