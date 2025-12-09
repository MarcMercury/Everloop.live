-- =====================================================
-- INSERT WORLD GUIDE ENTITIES
-- Extracted from: EVERLOOP - A Guide to the Broken World.pdf
-- Run in Supabase SQL Editor
-- =====================================================

-- Get admin user ID for created_by
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM profiles WHERE is_admin = true LIMIT 1;
    
    -- Insert new entities (skip if slug already exists)
    
    -- LOCATIONS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Drift',
        'the-drift',
        'location',
        'The primordial sea of chaos — matter and will without boundary. The Drift is not a place but a condition. Nothing within it is still. To enter it is to dissolve into what you once were. From its outer reaches the First Architects drew substance, shaping the first forms of stability.',
        'canonical',
        0.95,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Fold',
        'the-fold',
        'location',
        'The intermediary plane of thought, design, and intent — neither matter nor spirit, it is the mind of creation. The Fold holds the First Map, a construct of pure geometry and tone that describes the world. It is the wall upon which all else is hung.',
        'canonical',
        0.95,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- CONCEPTS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Weaving',
        'the-weaving',
        'concept',
        'The vast lattice of luminous threads binding time, space, and thought into continuity. The act of creation by which the Pattern was made. Within the Pattern once stood the Anchors, pillars that pinned the Weaving to the Fold. The Weaving grows thin, and Hollows spread.',
        'canonical',
        0.90,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Everloop',
        'the-everloop',
        'concept',
        'Both the living world and the eternal cycle of return. The world of mortals layered upon the Pattern, nourished by it. Each life lived is a single thread in its design. Its purpose: to enact the Pattern''s rhythm — birth, loss, return. A cycle that spins ever onward, never the same, never truly new.',
        'canonical',
        0.95,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The First Map',
        'the-first-map',
        'concept',
        'The original design drawn by the First Architects — lines of pure concept drawn across the unanchored dark. The map was not creation, but containment — a way to keep the world from slipping back into oblivion. From its contours they began the Weaving.',
        'canonical',
        0.95,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Anchors',
        'the-anchors',
        'concept',
        'Great pillars of intent and memory driven into the Pattern by the First Architects to hold the Weaving firm. Around the Anchors, reality crystallized. Mountains learned to stay still. Rivers remembered their beds. Their shattering by the Rogue Architects created the Shards and the Fray.',
        'canonical',
        0.90,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Shards',
        'the-shards',
        'concept',
        'Broken remnants of the Anchors — each still hums with the intent that once held the world together. Where Shards lie buried, the world trembles most, and time runs like spilled ink. Shard-touched regions are the most unstable, with time, matter, and memory contorting where their influence spreads.',
        'canonical',
        0.85,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Hollows',
        'the-hollows',
        'concept',
        'Weak points in the Pattern where space, time, and memory flicker. Places where the Pattern forgets itself and existence falters. Their cause remains unknown. The Hollows widened over time, leading the Rogue Architects to attempt their fateful repair.',
        'canonical',
        0.80,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- FACTIONS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Prime Beings',
        'the-prime-beings',
        'faction',
        'Vast entities that roamed the Drift before memory — shapes of hunger, storm, and birth. They were not gods, for gods require worship, and in the beginning there was none to give it. They were instinct given gravity. They embody elemental forces: Hunger, Storm, Ash, Birth, Silence. Their fates remain unknown since the Dawn.',
        'canonical',
        0.95,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The First Architects',
        'the-first-architects',
        'faction',
        'Beings who arose from the outer haze of the Drift, seeking form within the formless. They built the Fold, inscribed the First Map, and began the Weaving. They drove the Anchors into the Pattern to hold reality firm. Some claim they were absorbed into the Fold itself. Their fate is unknown.',
        'canonical',
        0.95,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Rogue Architects',
        'the-rogue-architects',
        'faction',
        'A circle of Vaultkeepers and Dreamers who sought to repair the failing Pattern when the Hollows widened. They believed they could weave anew as their ancestors once had. But they misjudged the balance. In their attempt to mend the Weaving, they shattered the Anchors — creating the Shards and the Fray.',
        'canonical',
        0.85,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Vaultkeepers',
        'the-vaultkeepers',
        'faction',
        'Stewards of memory who perceive the echoes within the Fold through the threads of the Pattern. Born upon the Everloop with the gift to see its threads. They interpret what they see, though meaning is rarely clear. Some work alone, others in Circles — guilds devoted to different methods of interpretation.',
        'canonical',
        0.90,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Dreamers',
        'the-dreamers',
        'faction',
        'Walkers between waking and Fold, born tethered to that liminal plane. Through discipline, accident, or madness they can nudge the threads of the Pattern — subtle shifts that bend fate, soften storms, or still hearts. Their art is not conjuring but persuasion, coaxing reality to move by the smallest breath.',
        'canonical',
        0.90,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;

END $$;

-- Verify the inserts
SELECT name, type, status FROM public.canon_entities ORDER BY type, name;
