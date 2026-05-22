-- =====================================================
-- LUMINOUS FOLD — INTERNAL SCHOLARLY ORDERS
-- Two factions referenced in the field-journal frontmatter
-- of Senior Archivist Archael Viremont:
--   • Fellow of the Seventh Circle
--   • Honorary Member of the Cartographic Society of Iterants
-- Both are institutions of the Luminous Fold (civilisation) —
-- one belonging to the Archivist (Vaultkeeper) tradition, the
-- other to the Iterant (Dreamer) tradition.
-- Idempotent: ON CONFLICT (slug) DO NOTHING.
-- =====================================================

DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM profiles WHERE is_admin = true LIMIT 1;

    -- ─────────────────────────────────────────────
    -- FACTION: The Seventh Circle
    -- An inner scholastic order within the Fold's
    -- Archivist (Vaultkeeper) tradition.
    -- ─────────────────────────────────────────────
    INSERT INTO public.canon_entities (
        name, slug, type, description, status, stability_rating,
        tags, extended_lore, created_by
    ) VALUES (
        'The Seventh Circle',
        'the-seventh-circle',
        'faction',
        'The innermost scholastic order of the Luminous Fold''s Archivist tradition. The Grand Archive at the heart of the Fold is organised in seven concentric Circles, each a deeper tier of categorical mastery: the First teaches Cataloguing; the Second, Comparative Pattern; the Third, Mensuration; the Fourth, Iterant Calculus; the Fifth, Boundary Cases; the Sixth, Concordant Variance. The Seventh is granted no fixed discipline — its Fellows are those who have exhausted the six and may originate new categories. To wear the seventh sash is to be permitted, by the Concord, to define what the Fold has not yet thought to define. In practice the Circle is small, slow-moving, and quietly factional; admissions are weighed across whole Loops, and most Fellows die without ever proposing a new category in earnest. Archael Viremont''s elevation was unusual: he was admitted for his journals of beyond-Fold travel rather than for refinement of any existing classification, and the Circle has yet to decide whether his entries constitute a new category or the failure of one.',
        'canonical',
        0.80,
        ARRAY['institution', 'scholastic-order', 'luminous-fold', 'archivists', 'vaultkeepers'],
        jsonb_build_object(
            'region', 'luminous',
            'parent_faction', 'the-luminous-fold-civilisation',
            'tradition', 'Archivist (Vaultkeeper)',
            'seat', 'The Grand Archive of the Luminous Fold',
            'structure', 'Seven nested Circles; the Seventh is the only one without a fixed discipline',
            'lower_circles', jsonb_build_object(
                'first', 'Cataloguing',
                'second', 'Comparative Pattern',
                'third', 'Mensuration',
                'fourth', 'Iterant Calculus',
                'fifth', 'Boundary Cases',
                'sixth', 'Concordant Variance'
            ),
            'privilege', 'Fellows may propose new categories of classification — a power held nowhere else in the Fold',
            'rank_title', 'Fellow of the Seventh Circle',
            'history', 'Constituted following the Third Concordance, when the Archive was reorganised from a flat catalogue into a tiered scholastic order. The Seventh was added last, against significant internal objection, as a release valve for phenomena the existing six Circles could not absorb.',
            'limitation', 'Decisions move at Loop-scale; most Fellows never originate a category in their lifetime',
            'notable_fellow', 'Archael Viremont — admitted for field journals rather than refinement; status unresolved'
        ),
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;

    -- ─────────────────────────────────────────────
    -- FACTION: The Cartographic Society of Iterants
    -- A specialist guild within the Fold's Iterant
    -- (Dreamer) tradition.
    -- ─────────────────────────────────────────────
    INSERT INTO public.canon_entities (
        name, slug, type, description, status, stability_rating,
        tags, extended_lore, created_by
    ) VALUES (
        'The Cartographic Society of Iterants',
        'the-cartographic-society-of-iterants',
        'faction',
        'A surveying guild of the Luminous Fold, drawn from the Iterant (Dreamer) tradition rather than the Archivist one. The Society holds — quietly, for its claim borders on heresy within the Fold — that probability and geography are the same instrument viewed from two distances: to alter an outcome is to alter the terrain that outcome rests on, and to chart terrain truthfully is to fix probability in place. Its members travel the unstable rim of the Fold''s influence and produce the Concordant Atlases, the bound volumes the Fold uses to define the edges of agreed reality. Where Archivists preserve what is, Iterants of the Society negotiate what may be allowed to remain. Their maps are reviewed Loop by Loop; settlements, paths, and minor landmarks shift between editions, and the older editions are not destroyed but sealed, so that the divergence itself becomes part of the record. Honorary Membership is conferred — rarely — upon non-Iterant scholars whose field work has contributed route-traces or boundary observations to a forthcoming Atlas.',
        'canonical',
        0.78,
        ARRAY['institution', 'guild', 'luminous-fold', 'iterants', 'dreamers', 'cartography'],
        jsonb_build_object(
            'region', 'luminous',
            'parent_faction', 'the-luminous-fold-civilisation',
            'tradition', 'Iterant (Dreamer)',
            'seat', 'The Chart-House, outer ring of the Luminous Fold',
            'doctrine', 'Probability and geography are the same instrument at two distances',
            'work_product', 'The Concordant Atlases — the volumes by which the Fold defines the edges of agreed reality',
            'practice', 'Editions are revised Loop by Loop; superseded editions are sealed rather than destroyed, so divergence is preserved as evidence',
            'rank_title', 'Iterant of the Society',
            'honorary_title', 'Honorary Member of the Cartographic Society of Iterants',
            'history', 'Founded by Iterants who refused the Fold''s separation of probability-work from terrain-work. The Society was tolerated rather than chartered for its first several Loops; its formal recognition followed the loss of the Outer Mensuration Survey, when no Archivist expedition returned and only an Iterant route-trace survived.',
            'tension', 'Its doctrine implies the Fold''s borders are negotiated, not fixed — a position the Archivist establishment has never publicly conceded',
            'notable_honorary_member', 'Archael Viremont — for the route-traces and boundary observations appended to his journals'
        ),
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;

END $$;
