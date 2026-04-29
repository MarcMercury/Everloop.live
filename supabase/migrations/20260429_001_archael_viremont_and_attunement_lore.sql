-- =====================================================
-- ARCHAEL VIREMONT + ATTUNEMENT / LOOSENING LORE
-- New canon entities sourced from the field journals
-- of Senior Archivist Archael Viremont of the Luminous Fold.
-- Idempotent: ON CONFLICT (slug) DO NOTHING.
-- =====================================================

DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM profiles WHERE is_admin = true LIMIT 1;

    -- ─────────────────────────────────────────────
    -- CHARACTER: Archael Viremont
    -- ─────────────────────────────────────────────
    INSERT INTO public.canon_entities (
        name, slug, type, description, status, stability_rating,
        tags, extended_lore, created_by
    ) VALUES (
        'Archael Viremont',
        'archael-viremont',
        'character',
        'Senior Archivist of the Luminous Fold and the most travelled Vaultkeeper of his generation. Archael was raised in the rigid tradition of the Fold — that reality may be measured, catalogued, and ultimately understood through structured systems. His field journals, addressed to a future self he no longer trusts to remember, record his slow unmaking. With each region surveyed beyond the Fold, his certainty thins: the Pattern, he writes, is not a single language but many dialects that no longer agree. By the final entries, his hand is unsteady and his classifications collapse into questions. He is the bridge between the Fold''s ordered understanding and the fragmented realities of the wider Everloop — and he is the warning that bridges, in this world, are never permanent.',
        'canonical',
        0.70,
        ARRAY['archivist', 'vaultkeeper', 'luminous-fold', 'scholar', 'traveller'],
        jsonb_build_object(
            'role', 'Senior Archivist of the Luminous Fold',
            'affiliation', 'the-luminous-fold',
            'arc', 'Begins with rigid belief in structured knowledge → ends recognising the limits of classification',
            'traits', ARRAY['analytical', 'method-driven', 'increasingly uncertain'],
            'narrative_function', 'Bridge between ordered understanding (Fold) and fragmented realities (Everloop)',
            'notable_detail', 'Writes letters to his own future self and family — a Vaultkeeper''s dread of cognitive drift made habit'
        ),
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;

    -- ─────────────────────────────────────────────
    -- FACTION: The Luminous Fold (the civilisation)
    -- Distinct from the location 'The Fold'.
    -- ─────────────────────────────────────────────
    INSERT INTO public.canon_entities (
        name, slug, type, description, status, stability_rating,
        tags, extended_lore, created_by
    ) VALUES (
        'The Luminous Fold (Civilisation)',
        'the-luminous-fold-civilisation',
        'faction',
        'The most ordered civilisation in the Everloop — a society built upon the conviction that reality may be measured, catalogued, and ultimately understood through structured systems. The Fold runs on Seconds, Minutes, Hours, Cycles (days), and Loops (years), and its institutions assume that those measurements describe a universal truth. Two great offices uphold the order: the Archivists (Vaultkeepers), who record and preserve structure, and the Iterants (Dreamers), whose controlled manipulation of probability is treated as a technical discipline rather than an art. The Fold''s philosophy holds that order is constructed, not discovered. Its limitation, slowly revealed by Archael Viremont''s journals, is that it mistakes consistency for truth.',
        'canonical',
        0.85,
        ARRAY['civilisation', 'institution', 'luminous-fold', 'vaultkeepers', 'dreamers'],
        jsonb_build_object(
            'region', 'luminous',
            'time_system', jsonb_build_object(
                'second_minute_hour', 'standard',
                'cycle', 'day',
                'loop', 'year'
            ),
            'roles', jsonb_build_object(
                'archivists', 'Vaultkeepers — record and preserve structure',
                'iterants', 'Dreamers — controlled manipulation of probability'
            ),
            'philosophy', 'Order is constructed, not discovered',
            'limitation', 'Mistakes consistency for truth'
        ),
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;

    -- ─────────────────────────────────────────────
    -- CONCEPT: The Attunement System
    -- ─────────────────────────────────────────────
    INSERT INTO public.canon_entities (
        name, slug, type, description, status, stability_rating,
        tags, extended_lore, created_by
    ) VALUES (
        'The Attunement System',
        'the-attunement-system',
        'concept',
        'The shared structure beneath every region of the Everloop: two fundamental human attunements that recur regardless of culture or geography. Vaultkeepers perceive, preserve, and interpret the Pattern. Dreamers influence, alter, and persuade outcomes within it. Every region names them differently — Pathkeepers and Windshapers in the Deyune Steps, Tidewatchers and Current-Speakers along the Virelay coast, Rootwardens and Weave-Tenders in the Bellroot Vale — but the function is the same. The Luminous Fold treats this recurrence as proof of a universal constant. Other regions disagree: they accept the pairing without ever assuming it is the only shape attunement could take.',
        'canonical',
        0.85,
        ARRAY['attunement', 'vaultkeeper', 'dreamer', 'pattern', 'universal'],
        jsonb_build_object(
            'pairs', jsonb_build_object(
                'vaultkeeper', 'perceive / preserve / interpret',
                'dreamer', 'influence / alter outcomes'
            ),
            'regional_names', jsonb_build_object(
                'luminous_fold', jsonb_build_object('vaultkeeper', 'Archivists', 'dreamer', 'Iterants'),
                'deyune_steps', jsonb_build_object('vaultkeeper', 'Pathkeepers', 'dreamer', 'Windshapers'),
                'ashen_spine', jsonb_build_object('vaultkeeper', 'Ember Scribes', 'dreamer', 'Flamecallers'),
                'varnhalt_frontier', jsonb_build_object('vaultkeeper', 'Ledger-Seers', 'dreamer', 'Chancebinders'),
                'virelay_coastlands', jsonb_build_object('vaultkeeper', 'Tidewatchers', 'dreamer', 'Current-Speakers'),
                'bellroot_vale', jsonb_build_object('vaultkeeper', 'Rootwardens', 'dreamer', 'Weave-Tenders'),
                'drowned_reach', jsonb_build_object('vaultkeeper', 'Depthwardens', 'dreamer', 'Undertides'),
                'glass_expanse', jsonb_build_object('vaultkeeper', 'Refractionists', 'dreamer', 'Lightbreakers')
            )
        ),
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;

    -- ─────────────────────────────────────────────
    -- CONCEPT: Time Instability
    -- ─────────────────────────────────────────────
    INSERT INTO public.canon_entities (
        name, slug, type, description, status, stability_rating,
        tags, extended_lore, created_by
    ) VALUES (
        'Time Instability',
        'time-instability',
        'concept',
        'Outside the Luminous Fold, time is not a shared standard. Some regions disagree on the length of a Cycle. Some ignore the unit altogether. Others measure duration through environment or movement — a tide''s return, a herd''s arrival, the cooling of a vent. The Luminous Fold''s clocks describe the Fold and only the Fold. As Archael Viremont eventually concluded: "We do not all inhabit the same Loop, even when we share the same hour."',
        'canonical',
        0.75,
        ARRAY['time', 'instability', 'pattern', 'loops', 'cycles'],
        jsonb_build_object(
            'key_insight', 'We do not all inhabit the same Loop, even when we share the same hour.',
            'regional_behaviour', ARRAY[
                'Disagreement on Cycles',
                'Time ignored as a measure',
                'Time inferred from environment or movement'
            ]
        ),
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;

    -- ─────────────────────────────────────────────
    -- CONCEPT: The Loosening (spatial instability)
    -- ─────────────────────────────────────────────
    INSERT INTO public.canon_entities (
        name, slug, type, description, status, stability_rating,
        tags, extended_lore, created_by
    ) VALUES (
        'The Loosening',
        'the-loosening',
        'concept',
        'A spatial instability felt most strongly between regions, where direction stops behaving like direction. Travellers report paths that do not retrace, distances that contradict themselves, and compasses that drift even when the sky is clear. The Luminous Fold''s surveyors first catalogued the effect as measurement error; later journals (notably Archael Viremont''s) treat it as an early manifestation of the same weakening that produces Hollows and the Fray. Where the Pattern grows uncertain about where one region ends and another begins, the Loosening fills the seam.',
        'canonical',
        0.75,
        ARRAY['space', 'instability', 'fray', 'hollows', 'travel'],
        jsonb_build_object(
            'effects', ARRAY[
                'Direction fails',
                'Paths do not retrace',
                'Distance behaves inconsistently'
            ],
            'related', ARRAY['the-hollows', 'the-fray', 'the-pattern'],
            'interpretation', 'Likely an early manifestation of Drift instability — precursor to Hollows / Fray'
        ),
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;

    -- ─────────────────────────────────────────────
    -- CONCEPT: Knowledge Fragmentation Principle
    -- ─────────────────────────────────────────────
    INSERT INTO public.canon_entities (
        name, slug, type, description, status, stability_rating,
        tags, extended_lore, created_by
    ) VALUES (
        'The Knowledge Fragmentation Principle',
        'knowledge-fragmentation-principle',
        'concept',
        'No region of the Everloop — not even the Luminous Fold — holds total truth. Each region preserves an understanding that is valid but incomplete, shaped by the climate, instabilities, and rhythms it lives within. The principle, slowly accepted by the Fold''s more honest Archivists, is that reality is distributed rather than centralised: any account of the world that erases the others is, by definition, a forgery. It is the philosophical companion to the Attunement System and the antidote to the Fold''s old conviction that the universe could be filed.',
        'canonical',
        0.80,
        ARRAY['knowledge', 'truth', 'distributed', 'pattern', 'philosophy'],
        jsonb_build_object(
            'core_theme', 'Reality is distributed, not centralised',
            'corollary', 'Each region holds valid but incomplete understanding'
        ),
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;

END $$;

-- Verify
SELECT name, type, status FROM public.canon_entities
WHERE slug IN (
    'archael-viremont',
    'the-luminous-fold-civilisation',
    'the-attunement-system',
    'time-instability',
    'the-loosening',
    'knowledge-fragmentation-principle'
)
ORDER BY type, name;
