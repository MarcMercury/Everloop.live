-- =====================================================
-- INSERT STORY 1 ENTITIES
-- Extracted from: Everloop - Story 1 - The Bell Tree and The Broken World.pdf
-- Run in Supabase SQL Editor
-- =====================================================

DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM profiles WHERE is_admin = true LIMIT 1;
    
    -- =====================================================
    -- CHARACTERS from Story 1
    -- =====================================================
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Kaerlin',
        'kaerlin',
        'character',
        'One of three siblings on a quest to gather the Shards. Known as "Kerr" by her family. The natural leader of the group, practical and determined. She carries a Shard with her that pulses when near the Bell Tree. Her father left the siblings maps that led them to Drelmere, and she is driven to discover what happened to him. She solved the cave entrance riddle with deceptively simple logic.',
        'canonical',
        0.9,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Mira',
        'mira',
        'character',
        'The cartographer and mapmaker among the three siblings. Analytical and scholarly, she carries weathered maps that she constantly updates as the Fray shifts the land. She is the one who realized the roots of the Bell Tree form a map, and that Drelmere''s layout had aligned to mirror something. Her obsession with logic and patterns sometimes causes her to overthink solutions.',
        'canonical',
        0.9,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Thomel',
        'thomel',
        'character',
        'The youngest of the three siblings, also called "Thom." A skilled tracker who promised his Uncle Edran he would keep his siblings safe. Practical and grounded, he notices details others miss—tracks, herbs, the freshness of prints. He successfully convinced Eidon to leave Watcher''s Hill through an elaborate metaphor about soup and Everfern herb.',
        'canonical',
        0.9,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Eidon',
        'eidon',
        'character',
        'A Folder who lived on Watcher''s Hill in Drelmere. Appeared young but was actually ancient, having been "folded" across time layers. His mind scattered across moments—remembering things that hadn''t happened while forgetting the present. Lived in a hut that was bigger inside than out, kept "drawer soup," and spoke in riddles. He knew the siblings'' father, describing him as "a man with a voice shaped like a lopsided lantern." When he entered the cave beneath Drelmere, he "unfolded" and aged rapidly, finally becoming whole before fading into the stone. His last words revealed truths about the 13 Shards and the Pattern.',
        'canonical',
        0.85,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Merra Dune',
        'merra-dune',
        'character',
        'The apothecary, midwife, and practical voice of Drelmere. She wears her silver hair in a braid, smells of pine and herbs, and has the gift of coaxing life back into the sick. When children forget their names from the Fray, she helps them remember. She once helped a farmer whose house had rotated overnight by showing him true north. Pragmatic and survival-focused, she questions whether undoing the Fray is wise, suggesting perhaps "the Fray came because something needed unmaking."',
        'canonical',
        0.9,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Halrick Vann',
        'halrick-vann',
        'character',
        'Mayor of Drelmere and former soldier. A man of routine—polishes his boots each morning, drinks tea scalding hot and unsweetened as his mother taught him. He refuses to acknowledge the supernatural events in his town, calling disappearing memories "coincidence" and failed harvests "poor seed stock." When the Bell Tree appeared, he ordered it cut down—the axes dulled after one strike, and he returned with blood beneath his eyes and a ringing in his ears. Despite his denial, he secretly studied the Bell Tree and recognized the spiral patterns on its bells, ultimately helping the siblings.',
        'canonical',
        0.9,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- =====================================================
    -- LOCATIONS from Story 1
    -- =====================================================
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Drelmere',
        'drelmere',
        'location',
        'A town in the Broken World, once a sanctuary and gathering place for Dreamers. Located in a valley with a dry riverbed and half-collapsed bell tower. The town has been affected by the Fray—children wake without memories, crops bloom early then turn to dust, buildings shift position overnight. The town square features a ruined chapel with a statue of the Triumvirate (Time, Memory, Flesh). When the Bell Tree appeared, it warped the cobblestones and the entire town''s layout shifted to align with its roots. The siblings'' father''s maps all eventually led here.',
        'canonical',
        0.8,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Watcher''s Hill',
        'watchers-hill',
        'location',
        'A hill above Drelmere where Eidon the Folder lived. Features uneven stone stairs that seem to change configuration—nine steps then three sideways ones. A crooked wooden gate at the top is engraved with symbols that rearrange themselves when not watched. The hut at the summit resembles "a mushroom that had aspirations of becoming a cottage and then gave up halfway through." The interior is impossibly larger than the exterior, with bookshelves on chairs, teacups in the fireplace, and a map pinned to the ceiling.',
        'canonical',
        0.85,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Gorge',
        'the-gorge',
        'location',
        'A deep, dry gorge outside Drelmere where the true origin point of the Bell Tree''s roots lies. Appears empty and unimpressive at first glance, but when objects are thrown into it, they produce bell-like sounds. Hidden in the gorge wall is a narrow cave entrance with iron bars and silver-veined carvings that lead to an underground cavern. The entrance riddle reads: "Together, unfold what was folded. In unity, the locked shall part. But unfold not what cannot bear its own shape." The key was the phrase "To Enter" spelled on the runes.',
        'canonical',
        0.8,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- =====================================================
    -- ARTIFACTS from Story 1
    -- =====================================================
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Bell Tree',
        'the-bell-tree',
        'artifact',
        'A mysterious manifestation that appeared suddenly in Drelmere''s town square—"It wasn''t there. And then it was." Resembles a cloaked figure carved in shadow with a trunk of torn ribbons like battle banners. Its hood droops forward over a hollow face containing absolute nothingness that "pulled at the eye like gravity." Limbs unfurl like warning arms, hung with bells of all sizes—some bright, broken, rusted, or smooth as river stones. The bells are silent until they choose to ring. Its roots pushed through flagstones "like veins through old hands" and moved slowly like breathing. Axes dulled against it; those who tried to cut it suffered. Contains 22 spiral engravings that match spiral patterns found in the underground cave. When rung in the correct sequence, it folded inward upon itself and transformed into the Second Shard.',
        'canonical',
        0.9,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Second Shard',
        'the-second-shard',
        'artifact',
        'A black shard, smooth and silent, revealed when the Bell Tree was rung in the correct sequence of 22 spirals. The Bell Tree folded inward upon itself—branches curling, roots recoiling, trunk compressing into a knot of bark and shadow—then unfolded "not back into a tree, but into a single, small object." One of the thirteen Shards of the Pattern.',
        'canonical',
        0.95,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- =====================================================
    -- CONCEPTS/CREATURES from Story 1
    -- =====================================================
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Folders',
        'folders',
        'creature',
        'Rare beings who have been "folded" across multiple time layers. Unlike Dreamers who see the Pattern, Folders are pieces of paper that "folded onto itself, then someone sneezed and threw into a wind tunnel." They remember things that haven''t happened and forget things happening now. Time is messy for them. If a Folder leaves their grounding place, they risk their parts forgetting where the rest is, going sideways, or becoming jealous of each other. When a Folder enters a place of bound time, they may "unfold"—aging rapidly to their true years but finally becoming whole again. Eidon was a Folder.',
        'canonical',
        0.85,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Triumvirate',
        'the-triumvirate',
        'concept',
        'A philosophical or religious concept in the Broken World, represented by statues depicting Time, Memory, Flesh. A cracked statue of the Triumvirate stands in a ruined chapel at the edge of Drelmere, half-swallowed by gray moss, staring with hollow eyes. The Triumvirate may represent the three fundamental aspects of existence that the Pattern attempts to hold stable.',
        'canonical',
        0.7,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The First Loop',
        'the-first-loop',
        'event',
        'The original weave forged by the Architects to hold time still. According to Eidon, "Before the Pattern, there was only Drift. Chaos without memory. Then came the Architects. They built the Pattern to hold time still. They forged the First Loop." However, something flawed got caught in the design, twisting the weave and birthing the Fray as a symptom of "time''s refusal to stay fixed."',
        'canonical',
        0.75,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;

END $$;

-- =====================================================
-- UPDATE EXISTING ENTITIES with Story 1 connections
-- (Run separately after the DO block)
-- =====================================================

-- Update The Shards description with Story 1 details (if it exists from World Guide)
UPDATE public.canon_entities 
SET description = description || E'\n\nFrom Story 1: According to Eidon, the Shards are "spines of the Pattern" and "keys to something that doesn''t yet understand it is locked." The Shards remember each other—when near one another, they pulse with warmth and familiarity, "born together, torn apart." If all Shards are gathered, the Fray will have nothing left to cling to. "It''s not a repair. It''s a remembering."'
WHERE slug = 'the-shards' 
  AND description NOT LIKE '%Story 1%';

-- Update Dreamers with Drelmere connection (if it exists from World Guide)
UPDATE public.canon_entities 
SET description = description || E'\n\nIn Drelmere, Dreamers once gathered in sanctuary, thinking the Valley was stable enough to anchor their visions. The Fray did not honor their hope—only one remained before the town''s troubles began.'
WHERE slug = 'dreamers' 
  AND description NOT LIKE '%Drelmere%';
