-- =====================================================
-- FULL EVERLOOP MIGRATION
-- All 5 sources: World Guide + 4 Stories
-- All entities start as PROPOSED (need approval)
-- All stories start as PENDING_REVIEW (need approval)
-- Run AFTER clearing tables
-- =====================================================

DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- Get admin user for created_by
    SELECT id INTO admin_id FROM profiles WHERE is_admin = true LIMIT 1;
    
    IF admin_id IS NULL THEN
        RAISE NOTICE 'No admin user found - entities will have NULL created_by';
    END IF;

    -- =====================================================
    -- WORLD GUIDE ENTITIES
    -- =====================================================
    
    -- LOCATIONS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Drift',
        'the-drift',
        'location',
        'The primordial sea of chaos — matter and will without boundary. The Drift is not a place but a condition. Nothing within it is still. To enter it is to dissolve into what you once were. From its outer reaches the First Architects drew substance, shaping the first forms of stability.',
        'proposed',
        0.95,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Fold',
        'the-fold',
        'location',
        'The intermediary plane of thought, design, and intent — neither matter nor spirit, it is the mind of creation. The Fold holds the First Map, a construct of pure geometry and tone that describes the world. It is the wall upon which all else is hung.',
        'proposed',
        0.95,
        admin_id
    );
    
    -- CONCEPTS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Weaving',
        'the-weaving',
        'concept',
        'The vast lattice of luminous threads binding time, space, and thought into continuity. The act of creation by which the Pattern was made. Within the Pattern once stood the Anchors, pillars that pinned the Weaving to the Fold. The Weaving grows thin, and Hollows spread.',
        'proposed',
        0.90,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Everloop',
        'the-everloop',
        'concept',
        'Both the living world and the eternal cycle of return. The world of mortals layered upon the Pattern, nourished by it. Each life lived is a single thread in its design. Its purpose: to enact the Pattern''s rhythm — birth, loss, return. A cycle that spins ever onward, never the same, never truly new.',
        'proposed',
        0.95,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The First Map',
        'the-first-map',
        'concept',
        'The original design drawn by the First Architects — lines of pure concept drawn across the unanchored dark. The map was not creation, but containment — a way to keep the world from slipping back into oblivion. From its contours they began the Weaving.',
        'proposed',
        0.95,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Anchors',
        'the-anchors',
        'concept',
        'Great pillars of intent and memory driven into the Pattern by the First Architects to hold the Weaving firm. Around the Anchors, reality crystallized. Mountains learned to stay still. Rivers remembered their beds. Their shattering by the Rogue Architects created the Shards and the Fray.',
        'proposed',
        0.90,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Shards',
        'the-shards',
        'concept',
        'Broken remnants of the Anchors — each still hums with the intent that once held the world together. Where Shards lie buried, the world trembles most, and time runs like spilled ink. Shard-touched regions are the most unstable, with time, matter, and memory contorting where their influence spreads.',
        'proposed',
        0.85,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Hollows',
        'the-hollows',
        'concept',
        'Weak points in the Pattern where space, time, and memory flicker. Places where the Pattern forgets itself and existence falters. Their cause remains unknown. The Hollows widened over time, leading the Rogue Architects to attempt their fateful repair.',
        'proposed',
        0.80,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Fray',
        'the-fray',
        'concept',
        'The unraveling edge of reality where the Pattern frays and loops collapse. The Fray is not a place but a condition — where time stutters, memory bleeds, and the world forgets itself. It spreads from Shard-touched regions, corrupting all it touches.',
        'proposed',
        0.80,
        admin_id
    );
    
    -- FACTIONS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Prime Beings',
        'the-prime-beings',
        'faction',
        'Vast entities that roamed the Drift before memory — shapes of hunger, storm, and birth. They were not gods, for gods require worship, and in the beginning there was none to give it. They were instinct given gravity. They embody elemental forces: Hunger, Storm, Ash, Birth, Silence.',
        'proposed',
        0.95,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The First Architects',
        'the-first-architects',
        'faction',
        'Beings who arose from the outer haze of the Drift, seeking form within the formless. They built the Fold, inscribed the First Map, and began the Weaving. They drove the Anchors into the Pattern to hold reality firm. Some claim they were absorbed into the Fold itself.',
        'proposed',
        0.95,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Rogue Architects',
        'the-rogue-architects',
        'faction',
        'A circle of Vaultkeepers and Dreamers who sought to repair the failing Pattern when the Hollows widened. They believed they could weave anew as their ancestors once had. But they misjudged the balance. In their attempt to mend the Weaving, they shattered the Anchors — creating the Shards and the Fray.',
        'proposed',
        0.85,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Vaultkeepers',
        'the-vaultkeepers',
        'faction',
        'Stewards of memory who perceive the echoes within the Fold through the threads of the Pattern. Born upon the Everloop with the gift to see its threads. They interpret what they see, though meaning is rarely clear. Some work alone, others in Circles.',
        'proposed',
        0.90,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Dreamers',
        'dreamers',
        'faction',
        'Walkers between waking and Fold, born tethered to that liminal plane. Through discipline, accident, or madness they can nudge the threads of the Pattern — subtle shifts that bend fate, soften storms, or still hearts. Their art is not conjuring but persuasion.',
        'proposed',
        0.90,
        admin_id
    );

    -- =====================================================
    -- STORY 1 ENTITIES: The Bell Tree and The Broken World
    -- =====================================================
    
    -- CHARACTERS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Kaerlin',
        'kaerlin',
        'character',
        'One of three siblings on a quest to gather the Shards. Known as "Kerr" by her family. The natural leader of the group, practical and determined. She carries a Shard with her that pulses when near the Bell Tree. Her father left the siblings maps that led them to Drelmere.',
        'proposed',
        0.9,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Mira',
        'mira',
        'character',
        'The cartographer and mapmaker among the three siblings. Analytical and scholarly, she carries weathered maps that she constantly updates as the Fray shifts the land. She realized the roots of the Bell Tree form a map.',
        'proposed',
        0.9,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Thomel',
        'thomel',
        'character',
        'The youngest of the three siblings, also called "Thom." A skilled tracker who promised his Uncle Edran he would keep his siblings safe. Practical and grounded, he notices details others miss.',
        'proposed',
        0.9,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Eidon',
        'eidon',
        'character',
        'A Folder who lived on Watcher''s Hill in Drelmere. Appeared young but was actually ancient, having been "folded" across time layers. His mind scattered across moments—remembering things that hadn''t happened while forgetting the present.',
        'proposed',
        0.85,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Merra Dune',
        'merra-dune',
        'character',
        'The apothecary, midwife, and practical voice of Drelmere. She wears her silver hair in a braid, smells of pine and herbs, and has the gift of coaxing life back into the sick. When children forget their names from the Fray, she helps them remember.',
        'proposed',
        0.9,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Halrick Vann',
        'halrick-vann',
        'character',
        'Mayor of Drelmere and former soldier. A man of routine who refuses to acknowledge the supernatural events in his town. When the Bell Tree appeared, he ordered it cut down—the axes dulled after one strike.',
        'proposed',
        0.9,
        admin_id
    );
    
    -- LOCATIONS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Drelmere',
        'drelmere',
        'location',
        'A town in the Broken World, once a sanctuary and gathering place for Dreamers. Located in a valley with a dry riverbed and half-collapsed bell tower. The town has been affected by the Fray—children wake without memories, crops bloom early then turn to dust.',
        'proposed',
        0.8,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Watcher''s Hill',
        'watchers-hill',
        'location',
        'A hill above Drelmere where Eidon the Folder lived. Features uneven stone stairs that seem to change configuration. The hut at the summit is impossibly larger inside than outside.',
        'proposed',
        0.85,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Gorge',
        'the-gorge',
        'location',
        'A deep, dry gorge outside Drelmere where the true origin point of the Bell Tree''s roots lies. Hidden in the gorge wall is a narrow cave entrance with iron bars and silver-veined carvings.',
        'proposed',
        0.8,
        admin_id
    );
    
    -- ARTIFACTS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Bell Tree',
        'the-bell-tree',
        'artifact',
        'A mysterious manifestation that appeared suddenly in Drelmere''s town square. Resembles a cloaked figure carved in shadow with limbs hung with bells of all sizes. When rung in the correct sequence, it transformed into the Second Shard.',
        'proposed',
        0.9,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Second Shard',
        'the-second-shard',
        'artifact',
        'A black shard, smooth and silent, revealed when the Bell Tree was rung in the correct sequence of 22 spirals. One of the thirteen Shards of the Pattern.',
        'proposed',
        0.95,
        admin_id
    );
    
    -- CREATURES/CONCEPTS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Folders',
        'folders',
        'creature',
        'Rare beings who have been "folded" across multiple time layers. They remember things that haven''t happened and forget things happening now. If a Folder leaves their grounding place, they risk becoming scattered.',
        'proposed',
        0.85,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Triumvirate',
        'the-triumvirate',
        'concept',
        'A philosophical or religious concept in the Broken World, represented by statues depicting Time, Memory, Flesh. The three fundamental aspects of existence that the Pattern attempts to hold stable.',
        'proposed',
        0.7,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The First Loop',
        'the-first-loop',
        'event',
        'The original weave forged by the Architects to hold time still. Before the Pattern, there was only Drift. Then came the Architects who forged the First Loop.',
        'proposed',
        0.75,
        admin_id
    );

    -- =====================================================
    -- STORY 2 ENTITIES: The Prince and the Drowning City
    -- =====================================================
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Auren Thorne',
        'auren-thorne',
        'character',
        'The young lord of House Thorne, also known as "The Lord of Luck." Despite being an exceptionally poor fighter, Auren possesses genuine compassion for his people. He dove into a Fray-corrupted sea to retrieve a Shard.',
        'proposed',
        0.9,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Lord Thorne',
        'lord-thorne',
        'character',
        'Father of Auren Thorne, Lord of House Thorne. A loving father who secretly planned to prevent Auren from traveling to Virelay.',
        'proposed',
        0.85,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Lady Thorne',
        'lady-thorne',
        'character',
        'Mother of Auren Thorne. Together with Lord Thorne, she recognized both Auren''s generous heart and his complete lack of combat prowess.',
        'proposed',
        0.85,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Virelay',
        'virelay',
        'location',
        'A coastal harbor town severely affected by the Fray. Buildings appear and disappear without warning, streets rearrange themselves, people vanish from memory only to return.',
        'proposed',
        0.75,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'House Thorne Manor',
        'house-thorne-manor',
        'location',
        'The ancestral home of House Thorne, featuring the Winter Room where the hearth is always full and curtains never open.',
        'proposed',
        0.9,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Third Shard',
        'the-third-shard',
        'artifact',
        'A Shard retrieved by Auren Thorne from beneath the waters of Virelay. Found in a drowned room at the bottom of a Well.',
        'proposed',
        0.9,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Well of Virelay',
        'the-well-of-virelay',
        'artifact',
        'A perfect ring of ancient carved stone embedded in the seafloor beneath Virelay''s harbor. The Well was not a hole but a wound.',
        'proposed',
        0.85,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Scholars',
        'the-scholars',
        'faction',
        'Those who study the Shards and the Pattern. They believe the Shards were safeguards—anchors placed by the First Architects.',
        'proposed',
        0.8,
        admin_id
    );

    -- =====================================================
    -- STORY 3 ENTITIES: The Ballad of Rook and Myx
    -- =====================================================
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Rook',
        'rook',
        'character',
        'A wandering con artist and storyteller who travels with his Servine companion Myx. Abandoned by his mother at age five. He uses stories and persuasion rather than violence.',
        'proposed',
        0.9,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Myx',
        'myx',
        'character',
        'A Servine—a creature with shifting eye colors that reflect emotion and state. Born in fighting pits, torn from his mother before his eyes opened. He refused to snarl even when tortured.',
        'proposed',
        0.9,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Sera',
        'sera',
        'character',
        'A young woman who discovered a cracked black tower and exploited its Fray-dampening effect to build power over a village. Though she became a tyrant, she was ultimately motivated by fear.',
        'proposed',
        0.85,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Servine',
        'servine',
        'creature',
        'A species of intelligent, telepathic creatures with fur and shifting eye colors. Servines hold emotions and truths, absorbing them into their eyes and bodies. Deeply loyal companions.',
        'proposed',
        0.85,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Black Tower of Sera',
        'the-black-tower-of-sera',
        'location',
        'A lean, looming obsidian spire that appeared in a Fray-touched region. The tower repelled the Fray—the closer to it, the more stable reality became.',
        'proposed',
        0.8,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Fourth Shard',
        'the-fourth-shard',
        'artifact',
        'A Shard obtained by Rook when he entered the Black Tower and pulled a miniature replica of the tower from its roots.',
        'proposed',
        0.9,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Everloop (Game)',
        'everloop-game',
        'concept',
        'A game played with coins, referenced by Rook and Myx as something they played together to stay warm in their early days.',
        'proposed',
        0.7,
        admin_id
    );

    -- =====================================================
    -- STORY 4 ENTITIES: In Service of the Veykar
    -- =====================================================
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Nyra',
        'nyra',
        'character',
        'A survivor who rose from conquered slave to personal cook of the Veykar, ultimately becoming his assassin. Taken at age five when her village was destroyed.',
        'proposed',
        0.9,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Veykar',
        'the-veykar',
        'character',
        'A self-made conqueror who unified the eastern steppes through brutal efficiency. He had no bloodline worth boasting, only fire and will.',
        'proposed',
        0.9,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Crippled Boy',
        'the-crippled-boy',
        'character',
        'A young dreamer who arrived in the Veykar''s kitchens with a twisted leg and unbroken spirit. He spoke constantly of escape and freedom.',
        'proposed',
        0.85,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Morran',
        'morran',
        'character',
        'The old master cook who served the Veykar before Nyra''s rise. His dishes were flawless but uninspired.',
        'proposed',
        0.8,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Draethan',
        'the-draethan',
        'faction',
        'The Veykar''s sworn Brethren—his voice, ears, breath, and blood made flesh. Their oaths were tattooed from wrist to throat to jaw.',
        'proposed',
        0.85,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Deyune Steppe',
        'the-deyune-steppe',
        'location',
        'The vast eastern expanse of the world, beyond border stones and merchant routes. Also called the Barren Reach or the Long Wind.',
        'proposed',
        0.85,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Wheel',
        'the-wheel',
        'location',
        'The Veykar''s moving camp, a living machine organized in concentric rings. At the center: the Hall and the Veykar''s tent.',
        'proposed',
        0.85,
        admin_id
    );
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Hall',
        'the-hall',
        'location',
        'The vast kitchen pavilion at the heart of the Veykar''s Wheel—half sunken into rock, half built upon it. The engine of empire.',
        'proposed',
        0.85,
        admin_id
    );

END $$;


-- =====================================================
-- FULL STORY CONTENT (4 Stories)
-- All stories start as pending_review for approval
-- =====================================================

DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM profiles WHERE is_admin = true LIMIT 1;

    -- The Bell Tree and The Broken World
    INSERT INTO public.stories (
        title,
        slug,
        summary,
        content,
        content_text,
        word_count,
        author_id,
        canon_status,
        is_published,
        reading_time_minutes,
        tags
    ) VALUES (
        'The Bell Tree and The Broken World',
        'the-bell-tree-and-the-broken-world',
        'Rogue Architects tried to repair the weave, but only deepened the damage. 
Now, we live in the Fray. 
The world no longer holds a single truth. Each region bears a different scar. Some lands are trapped in loops —
an unending morning, a single grief. Others drift, unanchored and wild. 
But even now, whispers stir: 
That if the Shards can be gathered… 
The Everloop might be healed. 
Or unmade. 
The Pattern is breaking. The threads are loosening. 
And no one —not even the Vaultkeepers —knows what...',
        '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Full story content in content_text field."}]}]}'::jsonb,
        'Prologue: The Pattern and the Fray 
Before there were names, before there were maps, before time dared to call itself time —there was only drift. 
This was the Dawn , the age before shape. The world had no corners, no centers, no memory. Mountains walked 
like beasts. Rivers unspooled into the sky. The wind forgot where it came from. In this primal dream roamed the 
Prime Beings —not gods, but forces: hunger, storm, ash, birth. They whispered through roots and rumbled 
beneath stone. 
There was no writing then. Only memory passed through blood. 
But even in the chaos, something reached upward. 
The First Architects —whether mortal or something in between —began to pin the world down. They built 
monuments of intent: towers that hummed, stones that pulsed, maps that bled when torn. These were not 
creations. They were anchors . They did not tame the world —only slowed its unraveling. 
This was the beginning of the Weaving . 
And from the Weaving came the Pattern . 
It began with the First Map , a living tapestry sewn from starlight, bone, and breath. It did not merely describe 
reality —it made it. Time stitched itself into loops and cycles. The world settled. Seasons held. The sun returned 
when it should. This was the birth of the Everloop . 
Civilizations bloomed, woven into the Pattern —along invisible rivers of thread -energy that hummed through 
everything. The people flourished. 
But the price of stability was hidden. 
Life and death fell into rhythm. But that rhythm was a trap. Decay and renewal became clockwork. History 
repeated —predictably, endlessly. 
Some whispered that the Prime Beings had not died, only fallen asleep beneath the Pattern. 
Some could feel the threads beneath their feet, could touch them and feel them hum. These were the first 
Dreamers —those who could nudge the strands, altering paths with a thought, a word, a wish. 
Others looked between the threads, peering into the Time Before. These were the Vaultkeepers —keepers of 
memory, guardians of the gaps. 
But even a perfect weave can fray. 
And fray it did. First slowly. Then wildly. 
Threads snapped. Loops collapsed. Time bent and buckled —days repeated, years vanished, entire cities blinked 
out of sequence. People wept for children they hadn’t yet had. Dreams bled into waking. 
Shards of the Pattern —broken pieces of the First Map —surfaced in hidden places, humming with forgotten 
power. 

Rogue Architects tried to repair the weave, but only deepened the damage. 
Now, we live in the Fray. 
The world no longer holds a single truth. Each region bears a different scar. Some lands are trapped in loops —
an unending morning, a single grief. Others drift, unanchored and wild. 
But even now, whispers stir: 
That if the Shards can be gathered… 
The Everloop might be healed. 
Or unmade. 
The Pattern is breaking. The threads are loosening. 
And no one —not even the Vaultkeepers —knows what happens if it tears completely. 
This is the world you walk into. 
This is where our story begins. 
Story 1: The Bell Tree and the Broken World 
Chapter 1 – A Fire, A Story, A Shard 
The fire crackled low in the hearth of the cottage, throwing soft light against the beams of the ceiling and the 
shelves packed with jars, herbs, and hand -bound books. Outside, the wind pressed gently at the shuttered 
windows, but inside all was warmth, quiet, and the breath of listening. 
Three children sat before their mother, cross -legged on the thick woven rug, eyes wide in the firelight. The eldest, a 
girl with dark hair braided into a thick rope down her back, tilted her head slightly, the way she always did when 
she was trying to remember every word. Her name was Kaerlin , though to her siblings she was always Kerr . 
Her sister, Mira , younger by two years, leaned against her knee, chewing thoughtfully on a leather strap —restless, 
but enraptured. 
The boy, the youngest of the three, had his elbows on his knees, chin in his hands, mouth slightly open. His name 
was Thomel , though only adults ever called him that. To the rest of the family, he was just Thom . 
Their mother, Alira , tall and strong in her presence even seated, spoke with a low, certain voice —the kind that 
built a world out of words and invited you to live inside it. 
"It began," she said, staring into the flames, "with a lie. Not a lie told to a person. A lie told to the Pattern itself." 
Kaerlin’s brow furrowed, imagining what it meant to lie to something as big as the world. 
"The Fray wasn''t an accident. Something was broken. Something whispered a false truth into Time’s ear —and the 
world began to loop. Not forward, not backward, but wrong." 
Thomel blinked, caught in the image of a world looping like a ribbon pulled through tangled hands. 

"And then," Alira went on, lowering her voice, "people disappeared. Entire cities. One day they’d be there —and the 
next, just fog. Not forgotten. Not dead. Just… unwritten." 
Mira swallowed hard. 
Alira swept her hand toward the hearth and touched one of the hanging charms —a bell made from twisted brass 
and shell. It jingled softly. 
"The Fray spreads where the world has grown weak. Where the Pattern thins. It doesn’t tear like cloth. It... forgets. 
You breathe the air and begin to lose your name. Your memories. Your reasons. Some say your soul doesn’t leave —
it simply fails to remember it exists." 
The door creaked open behind them. Uncle Edran entered, brushing snow off his shoulders, boots heavy. He 
grunted as he shut the door and dropped onto a stool. 
"She’s filling your heads again with those Fray stories," he said, voice half -growl. "The world is the world. The 
Overlook’s always been there, and it always will. You stay away from it, and you’re fine. That’s all there is to it." 
Alira turned to him, her jaw firm. "The Overlook is growing. Every winter, the edge is closer. The air feels different. 
People forget things. Their names. Their homes. Their children." 
Edran scoffed, removing his gloves and shaking his head. "You sound just like him. Gods help us, my brother was a 
dreamer too. Always scribbling notes, chasing glimmers in the woods, talking about the Pattern like it was a puzzle 
to solve. And now look where it got him." 
The children looked up sharply. 
Alira’s eyes softened at the mention, but her voice stayed steady. "He was more than a dreamer. He had the courage 
to see what the rest of us wouldn’t. He knew the world was changing, and he went to the edge because he had to 
understand it." 
Edran snorted. "And he never came back." 
"That doesn’t make him wrong." 
"It makes him dead. Or worse." 
She stood then, crossing the room. Her fingers unwrapped a linen cloth she kept beside her books. Inside lay a 
shard of smooth black glass, faintly warm, etched with soft curves like veins in a leaf. 
"He brought this back the first time he went to the edge. He said it hummed in his hand. That it didn’t feel like 
anything from our world. He said he could feel the Loop beneath it —feel the truth buried under the lie." 
She smiled, gently, lost in the memory. "Your father… he was like a lopsided lantern in the dark. Not always steady. 
But always glowing in places no one else could see." 
The children said nothing. 
But they would remember. 

Chapter 2 - Two Graves, One Goodbye 
Fifteen years later, the Bell Tree had not rung. 

But the cottage was quieter. 
The fire still crackled, but the chair was empty. The herb jars were dusty. And two graves now sat beneath the 
birch tree behind the house. 
Kaerlin stood at the foot of her mother’s grave, hands clenched. Mira placed a smooth black stone on the 
mound, one she had carried for years. Thomel —now a man —said nothing, but his eyes glistened. 
Uncle Edran stood apart, arms crossed, staring into the woods as if daring the dark to send something from the 
Fray. 
Later that afternoon, the three of them sat beneath the birch, knees brushing in the wind -stirred grass. Their bags 
leaned against the trunk. The sky above was pale and wide. 
“We’re leaving,” Kaerlin said, not unkindly. 
She looked at Thomel with steady eyes. “I know you won’t want to come. I know this place matters more to 
you.” 
Thomel’s brow furrowed, but he didn’t respond at first. His gaze traced the roofline of the cottage, then the 
grave, then out past the treeline where clouds swam low. He exhaled through his nose. 
“It’s not that I didn’t want to go,” he said finally. “I dreamed of it. Every time. When you two left, I almost 
followed. Every time. But someone had to stay.” 
Mira tilted her head. “We weren’t gone gone. We always came back.” 
“Eventually,” Thomel said gently. “But you didn’t know you would. You two were chasing storms and towers 
on Dad’s maps. The Fray is hungrier now than when he made them.” 
Kaerlin looked away, jaw tight. 
“We thought you’d come with us,” she murmured. 
“I almost did,” Thomel admitted. “But she needed someone here. I stayed because if you never came back, she 
wouldn’t be alone. And Uncle Edran —he’s strong, sure. We all know what he’s capable of. But he’s not… 
gentle.” 
“She wouldn’t have let us go if she thought she’d be truly unprotected,” Kaerlin countered. 
There was a pause. 
“We brought the maps back,” Mira said, fishing through her satchel and unrolling a thin leather scrollcase. 
“Most of them survived. I cleaned the ink. Dad’s annotations are faded, but still legible. We think we know 
where the next rift is.” 
“We?” Thomel asked. 
“I mean me and Kerr,” Mira said, using the name only they did. “We’ve been out twice more than you know. 
West of the Hollow Vale.” 
Thomel raised an eyebrow. “I wondered. The boots by the door were never muddy from the garden.” 

Kaerlin gave a half -smile. “We needed to know what we were talking about before we asked you to come.” 
Thomel looked down at his hands. “She told me —before she passed —that she could feel the Fray pressing in. 
Said the threads were shifting in the floorboards.” 
There was silence for a moment as they sat in a line, quiet and somber. 
Then Kerr let out a breath and leaned against him. Mira followed, resting her head on his other shoulder. 
“You’re coming with us,” Kerr said. It was not a question. 
“I’m coming with you,” Thom confirmed. 
Mira grinned, eyes still closed. “Well, now that that’s settled… who tells Uncle Edran?” 
They sat in silence —three shadows under a tree. 

Inside the cottage, Uncle Edran waited. When they entered, he was still seated at the table, hands wrapped 
around a mug gone cold. His cloak hung on the peg behind him. A long knife lay beside an unfinished carving, 
the wood still curled where his blade had last turned. 
“We’re going,” Kerr said again. 
Uncle Edran shook his head. “You don’t have to. There’s nothing for you out there. Stay. Build. Live.” 
Mira countered. “There isn’t a lot for us here anymore. We’ve already waited too long. The border’s only five 
miles from here now. We feel it.” 
Something in her words landed hard. The old man flinched —just slightly —but enough. A strange thing, to see 
someone of his stature look wounded. 
Kerr softened her tone. “You know what Mira means.” 
Thom stepped forward. “We’re going to finish what she and Dad started. They mapped the early rifts. We’ll 
map the rest.” 
Uncle Edran set the mug down. Rubbed his palms together slowly. Stared into the grain of the table like it might 
answer him. 
“I knew this day would come,” he said. “Your father… you’re just like him. All of you.” 
Kaerlin knelt beside him. “We’ll come back. We promise.” She kissed his cheek. 
Mira leaned in and embraced him. “We’ll never forget you.” 
Thomel clasped the old man’s shoulder. “You raised us too. You’re part of this.” 
Uncle Edran didn’t speak, but his eyes glistened. He gave a slow nod —firm, solemn. As if to say: Go. I taught 
you well. 

That night, they packed. 
That night, the Bell Tree appeared. 
Not with thunder. Not with light. 
It simply… stepped from the shadows where a copse of trees had been. 
As if it had always been there. 
As if the world had been waiting for it to remember. 
Twisted limbs like cloaked arms. Bells swaying in windless air. A hollow where a face should be. 
The children did not sleep. 

Chapter 3 - The Ringing 
The town of Drelmere had known peace for decades. It sat far from the Overlook’s edge, nestled in a valley where 
merchants still passed, where weddings were still sung. People still danced on Feastdays. But something had 
changed. 
Children began waking without memories of the day before. Crops bloomed too early, then turned to dust 
overnight. Time slipped. Names fell apart on paper. 
Mayor Halrick Vann refused to believe it. He was a man of routine, of firm handshakes and firmer opinions. A 
former soldier turned town leader, he polished his boots each morning and drank his tea the same way his mother 
taught him —scalding hot and unsweetened. “Coincidence,” he muttered when merchants lost their way on familiar 
roads. “Poor seed stock,” he said when the harvests failed. “Too much imagination,” he barked when children forgot 
their own names. He would not abide panic. He’d keep the town steady. 
But even Halrick had grown quieter of late. 
It was Merra Dune that people trusted —the apothecary, midwife, and practical voice of Drelmere. She wore her 
hair in a silver braid down her back, always smelled faintly of pine and herbs, and had hands that could coax life 
back into the sick. When a child forgot her own name, she helped recover it. When a farmer woke to find his house 
facing the wrong direction, she showed him true north. 
But even she had begun to grow wary. 
Rumors drifted. Then the tree appeared. 
It wasn’t there. 
And then it was. 
The morning market opened as it always did. The baker’s boy swept the stones. A cobbler tightened his awning 
ropes. And where there had been open square —stone and sun and birdsong —there now stood something else. 
A tree, they called it. But it was no tree. 
It rose from the earth like a cloaked figure carved in shadow. The trunk hung in long, torn ribbons, shaped like 
fabric frozen in motion —wind -blown but motionless, shredded like a battle banner long forgotten. Its hood 

drooped forward, hollow where a face might be, and inside that darkness: nothing. Not shadow. Not shade. 
Nothing. A black that pulled at the eye like gravity. 
Its limbs unfurled like arms outstretched, not in welcome, but in warning. From them dangled bells —some bright, 
some broken, some rusted, some smooth as river stones. Tiny bells on thin wire. Massive ones strung with chain. 
And each silent. 
The sky above the tree seemed a shade dimmer. The cobblestones beneath it warped ever so slightly, as if the 
ground had softened to accept it. No roots showed. No leaves fell. No birds perched. 
No one had seen it arrive. No cart. No crew. No magic spoken aloud. No flash or thunder. 
Just—nothing. 
Then something. 
It wasn’t there. 
And then it was. 
Mayor Halrick Vann ordered it cut down. The axe blades dulled after a single strike. One man fainted. Another 
vomited. Halrick himself returned to his office with blood beneath his eyes and a ringing in his ears he couldn’t 
shake. 
That night, it moved —a single branch, twitching under moonlight, like a finger tapping just once. 
At dawn, it rang. 
Not a chime or a toll, but a scream wrapped in melody. A sound that didn’t echo —it clung. It spread through 
rooftops, seeped into cellar stone. It found cracks in the wall and made them weep. Windows bowed. Children 
woke with nosebleeds. Dogs ran from town. 
High above, on the ridgeline, Kaerlin , Mira , and Thomel stopped. 
Their eyes met. 
It had begun. 

Chapter 4 - The Map and the Valley 
They stood just below the ridgeline, boots half -buried in wind -swept loam, where the earth gave way to a plunging 
valley bathed in an amber hush. The morning sun had broken through a cage of high clouds, casting long fingers of 
light across the land. It touched broken stone and forest veins alike, pulling gold from green. 
The wind curled past them in gentle bursts, smelling faintly of ash and thyme. 
Kaerlin crossed her arms, her eyes narrowing against the glare. “What’s down there?” Kerr asked. 
Mira crouched, unfastening the leather satchel slung across her shoulder. She pulled free a roll of parchment, edges 
curled and ink faded by weather and time. She didn’t speak at first —just let her finger trace the map’s uneven lines 
until it stopped near a scribbled crescent. 
“Drelmere,” she finally said. “Or what’s left of it.” 

Kaerlin frowned. “That can’t be right. Drelmere’s supposed to be —what —four, five days southeast? Past the 
bramble hills?” 
“It was,” Mira replied, not looking up. “The land doesn’t care what it’s supposed to be. The Fray shifts things. That’s 
why I bring these maps. Every climb shows something new.” 
“Not new,” said Thomel, kneeling. “Changed.” 
The youngest of the three was already a few paces ahead, crouched low to the earth, where the mud had softened 
overnight. “Tracks,” Thom said. 
“What kind?” Kerr asked. 
Thomel pressed his palm beside one. The print was deep, three -toed, and wide. His eyes followed the trail through 
a patch of thistle. “Hoofed. Big. But steady. No skid, no scatter. Nothing was chasing it.” 
“Just passing through,” he said, rising and brushing off his hands. “Still warm. Maybe a few hours ahead.” 
“You always notice things like that,” Kerr said. “You missed your calling as a tracker.” 
“Somebody’s got to keep you two fed,” Thom said, trying to sound gruff. “And I promised Uncle Edran I’d make sure 
you didn’t get killed.” 
“We didn’t ask for a chaperone,” Mira teased, rolling her map again with a half -smile. 
“You didn’t have to,” Thom said. “I’m here anyway.” 
Kerr clapped a hand on his shoulder. “We know.” 
They stood together for a while, silent again, staring down into the valley’s mouth. The ruins of Drelmere were 
visible now —a scatter of rooftops, one half -collapsed bell tower, and the bone -white curve of the dry riverbed. But 
something else caught their eyes. 
Above the valley, above Drelmere, the air shimmered. 
It wasn’t heat —not really. It moved like heat, bent light like it, but there was no warmth to it. No breeze touched 
that shimmer. It pulsed, as if the sky had torn a stitch and the threads were fraying apart. 
Thom stepped forward, brow furrowed. “Do you see that?” 
“We see it,” Kerr said. 
Mira’s hand gripped her satchel tighter. 
They did not move. 
But they knew. 
The Fray was here. 
And it was growing. 

Chapter 5 - The Dreamers of Drelmere 
The path into Drelmere twisted through fields once bright with lavender. Now the grass grew in brittle clumps, 
shadows fell in unnatural angles, and the wind whispered directions that contradicted the map. 
At the edge of town, they passed a ruined chapel, half -swallowed by gray moss. A cracked statue of the 
Triumvirate —Time, Memory, Flesh —stared with hollow eyes. Thomel paused, brushing his hand along the stone’s 
cold cheek. 
“Another skip,” Mira muttered, scratching a note onto her map. “This shouldn’t be here.” 
Kaerlin shrugged. “The Fray doesn’t obey lines on paper.” 
The town square opened before them in quiet decay: moss -veined cobblestones, rusted shutters, and cautious 
townsfolk who stared, then looked quickly away. At the center, rising like a question no one dared ask, stood the 
Bell Tree. 
Its roots pushed through the flagstones like veins through old hands. They moved —slowly, subtly, like breathing. 
“Roots shouldn’t move like that,” Mira whispered, eyes fixed on the dark tendrils. 
On the far side of the square, Merra knelt beside a boy, murmuring in a voice too soft to carry. After a moment, the 
boy blinked, smiled, and ran off calling a name he seemed to have just remembered. 
Merra stood and turned to the newcomers. “You’re not from here.” 
“No,” Kaerlin replied. “But maybe we were always meant to be.” 
Merra studied them —expression unreadable. “That’s what Dreamers say.” 
“Define Dreamer,” Mira asked. 
Merra exhaled slowly. “Dreamers are the ones who can see the Pattern —not just feel it, like most do in dreams or 
déjà vu. They see how time folds and frays. They see threads —moments, choices, paths —and sometimes, they can 
move them. Tuck one beneath another. Nudge a memory forward. Hide a day inside a second.” 
She began walking. They followed. 
“It lets them glimpse what hasn’t happened yet. What might happen. Sometimes what never could. But it comes 
with a cost. You can’t walk between threads and expect to stay stitched in place.” 
Thomel furrowed his brow. “What happens to them?” 
“Some lose their bodies before their minds. They become something like ghosts —trapped in a moment no one else 
remembers. Others lose their minds but keep walking. Staring. Whispering names from futures no one else sees.” 
She looked back toward the Bell Tree. “The Pattern folds them. Or it unravels them. No one’s certain.” 
They walked in silence after that, their boots soft against the broken stones. 
“Drelmere was once a gathering place for Dreamers,” Merra said at last. “A sanctuary. A place between places. They 
thought the Valley was stable enough to anchor their visions. But the Fray doesn’t honor hope.” 
“And now?” Mira asked. 
Merra’s voice lowered. “Now there’s only one left. The rest... are just gone.” 

They arrived at a cottage of rippling stone, nestled between leaning homes and broken fences. The walls 
shimmered faintly, as if light couldn’t decide which side to stay on. 
Merra paused at the threshold. 
“This is where the Dreamers used to gather,” she said softly, then turned to face them. “What brings you to 
Drelmere?” 
Kaerlin glanced at her siblings. “We’re not entirely sure.” 
“Our father left us maps,” Mira said. “Old ones. They all led here. Eventually.” 
“Some pieces didn’t make sense until we followed them through the skips,” Thomel added. “And even then, not all 
of them make sense.” 
“But they pointed here,” Kaerlin finished. “To this place. To now.” 
Merra studied them for a long moment, quiet. 
“It sounds like you’ll want to meet the Dreamer who remains,” she said finally. “But he’s not here.” 
“Watcher’s Hill,” Mira said. 
Merra’s expression shifted —tightened. A flicker of warning in her eyes. 
She looked away and spoke with a voice almost too low to hear. 
“Expect no welcome.” 

Chapter 6 - Watcher’s Hill 
Watcher’s Hill had stairs. Which, frankly, was insulting. 
“They could’ve at least been even,” Mira muttered, dragging her boots up another tilted stone. “Who builds a 
staircase with nine steps, then three sideways ones?” 
“Someone with a deep hatred for knees,” Kerr said, not even winded. 
Thomel said nothing. He was carrying all the supplies. 
At the top, the trees parted around a clearing. A crooked wooden gate marked the threshold, hanging from one 
hinge and engraved with symbols that seemed to rearrange themselves when you weren’t looking. 
“Very welcoming,” said Mira. “Should we knock?” 
“Should we burn it?” Kerr offered. 
Mira reached toward a symbol. It darted aside as if shy. 
“Friendly,” she muttered. 
The gate creaked open on its own. 
They walked in. 

The hut looked like a mushroom that had aspirations of becoming a cottage and then gave up halfway through. It 
leaned to one side, windows glowing faintly. The door opened before they reached it. 
“Hi!” said the young man inside. 
He looked to be in his twenties. His hair was the color of bark in spring, and his eyes were silver and soft. The three 
siblings stopped. 
“You’re Old Eidon?” Thom asked, confused. 
“Maybe,” the man said cheerfully. “I might’ve been old once. When I was young. These days I’m mostly… misplaced. 
I fold. Folded… like origami. Half my thoughts are soup.” He shrugged and made a folding motion, then the motion 
of drinking soup with a spoon. 
He turned and walked inside like that explained everything. “Come in,” he said, walking away. “There’s tea. It might 
already be steeped. Or not. I’ve had it, but not yet.” 
The siblings exchanged a glance, then followed. 
The inside of the house was somehow bigger than the outside, and stranger. Bookshelves stacked on chairs. 
Teacups in the fireplace. A map pinned to the ceiling. Mira’s eyes sparkled. 
“You’re a Dreamer?” Kaerlin asked. 
“No,” Eidon said. “I’m a Folder.” 
“I fold,” he said again, making a vague origami motion with his hands. “I’m a piece of paper that folded onto itself, 
and then someone sneezed and threw me into a wind tunnel. Time’s messy. I remember things that haven’t 
happened, and I forget things that are happening right now.” 
The siblings stared at him, confounded. 
Eidon stared back, smiling blankly. 
Then, without a word, he made another slow folding motion with his hands and shrugged. 
Mira opened a drawer. It had soup in it. 
She blinked. “Is this —” 
“Drawer soup,” he said proudly. “Keeps well.” 
He handed another bowl to Thom. This one came from under a cushion. 
Kerr eyed hers suspiciously. “This smells like cinnamon and… chalk?” 
“That’s the Tuesday batch,” Eidon said, sitting cross -legged on a stool that immediately collapsed under him. He 
didn’t seem to notice. 
“So,” Kerr said, hands on hips, “you’re telling us you’re broken?” 
Eidon grinned. “No. I’m rare. Big difference.” 
Thom finally spoke. “Do you know anything about the Bell Tree?” 
“Oh,” Eidon said, suddenly solemn. “Yes. And also no. But mostly yes.” 

He led them to a shelf and pulled down what looked like a rusted dinner plate. “The Bell Tree is… how do I explain 
this… Have you ever tried to build a puzzle without knowing what picture it makes? That’s the Bell Tree. It’s part 
memory. Part machine. Part scream.” 
“A scream?” Thom asked. 
“Everything that’s been lost by the Fray —it ends up there. Echoes, regrets, moments that fell through the cracks. 
The Bell Tree is trying to sing them back into place.” 
“And the Shards?” Kerr asked. 
“Oh yes, the Shards,” Eidon said, turning over a chair to reveal a diagram etched on the seat. “You’ll need them. All 
of them. They’re the bits that didn’t forget they were part of the Pattern. The anchors. If the Bell Tree is the wound, 
the Shards are the stitches.” 
“How many are there?” Thom asked. 
“Eight. Or thirteen. Or one, shattered eight ways. Depends if you ask me tomorrow or yesterday.” 
There was silence while Eidon looked like he was trying very hard to recall something. At last, he said, “He knew.” 
“Who?” asked Kerr. 
“The lopsided lantern. I think I met him. Or I will. Or he dreamed of me, and that’s close enough. He told me 
something important, I think. I remember the shape of his voice.” 
“You remember the shape?” Mira asked. 
“Like a lopsided lantern. But kind. He was tall. Quiet. Thought too much. Disappeared.” 
The children looked at one another. Thom mouthed lopsided lantern to the others. 
Eidon continued, “He told me something important.” 
“What was it?” Thom asked. 
“I forget,” Eidon said without apology. “But I remember it was important. That counts.” 
He smiled, drifting to a window. “The Fray does that, you know. Unwinds you. I try putting myself back together. 
Some days I do a better job than others.” 
“Why tell us all this?” Kerr asked. 
“Because,” he said, eyes far away, “I think you’re the ones who are supposed to do something. Or undo something. 
Or maybe just make a really important choice.” 
“Which is it?” Thom asked. 
Eidon looked delighted. “Oh, I haven’t the foggiest.” 
Then, suddenly serious, he looked at each of them. 
“You’re meant to choose,” he said softly. 
“Something. Anything.” 

Chapter 7 - The Soup and the Self 
“Come with us,” Kaerlin said, for what was definitely not the first time. 
“No,” Eidon replied brightly, setting a third bowl of soup on the crooked table. “Soup?” 
“We don’t need soup, we need answers!” snapped Mira. 
“I need soup,” muttered Thom, rubbing his stomach. 
“I’m grounded,” Eidon said, lifting one foot as though it were somehow rooted to the floor. “See? If I leave the hill, 
the rest of me might forget where the rest of me is. Or go sideways. Or get jealous.” 
“We are wasting our time,” Mira huffed, pacing between a bookshelf and a taxidermy fox wearing reading glasses. 
“We have actual leads. Maps. Riddles. Bells screaming in public squares. And you’re sitting here debating internal 
cartographic jealousy with your ankles.” 
“I’m not debating,” Eidon said. “My ankles and I are quite aligned. They know what they’ve signed up for.” 
Kerr threw up her hands. “This is ridiculous.” 
Eidon turned to Thom. “Soup?” 
Thom looked between his sisters, then nodded slowly and sat. “Sure.” 
He took a spoonful, chewed thoughtfully, and said, “You know what it’s missing?” 
Eidon leaned in. “Do tell.” 
“Everfern,” Thom proclaimed. 
Eidon blinked. “Everfern doesn’t grow here. It has a combative temperament and once tried to strangle my shoes.” 
“No,” said Thom. “But it’s in Merra’s shop. I saw it —dry shelf, middle row, third hook. Right between the sunroot 
and the powdered tarruffin.” 
“That... that can’t be,” Eidon said, furrowing his brow. “If she’s keeping sunroot and tarruffin that close together, 
she’s either very bold or very doomed.” 
Thom nodded gravely. “Exactly. Which is why, if we don’t go and check, your soup might never be complete. And 
Merra could be in danger.” 
“Grave danger,” Eidon said, almost with a hint of excitement. 
Thom leaned in. “Is there any other kind?” 
“And if Merra’s shop goes, your soup is at risk of being emotionally unbalanced.” 
“Everfern is unstable when dried improperly,” Eidon mused. “It would explain the bitterness. Also the haunting 
aftertaste of regret.” He looked down at the bowl. “It has been sulking lately.” 

“Also,” Thom added, stirring the soup, “if the soup is the metaphorical mirror of your fragmented self, and the 
Everfern is the key note that brings it all into harmonic resonance, then aren’t you obligated to seek it out? For 
closure?” 
Mira groaned audibly. 
Eidon stared at him for a moment, then perked up. “Is it a concave mirror or the kind that makes your chin look like 
a duck?” 
“Yes,” Thom replied confidently. “Exactly. And that’s the thing —it’s reflecting the self that’s been folded through 
time, so the duck -chin effect is actually prophetic. But what it needs —what you need —is Everfern. That’s the key 
note. That’s the grounding…” He paused, searching desperately for the right word. “ Frequency .” 
Mira, completely lost, mumbled, “What is happening?” 
“The herb as a harmonic stabilizer,” Eidon whispered, eyes wide. “It would complete the chord. Like a melody 
finally remembering where it began. We must go. ” 
Mira blinked. “What just happened?” 
Kerr shook her head. “He logic -looped the lunatic.” 
Thom nodded to Eidon. “Otherwise you’ll just keep making soup that almost tastes like you.” 
Ignoring his sisters’ skepticism, Thom stood, smiling, and patted Eidon’s shoulder. “Let’s go find your herb.” 
Eidon stood so fast his chair wheezed. “Yes! We must go. For soup. For identity. For seasoning!” 
He grabbed a walking stick that may have once been a curtain rod. “To Merra’s shop we go! For Everfern —and 
everything it implies!” 
Mira looked exhausted. “We’ve broken him.” 
Kerr shrugged. “No. He was already broken. We just… found the missing herb.” 

Chapter 8 - The Roots Beneath Us 

It was a journey fraught with peril. The wind howled. The clouds hung heavy. The slope stretched downward like a 
treacherous ribbon unraveled by fate. 
“Just… just one more step!” Thom called, breathless. 
“You can do this,” Kerr encouraged, holding out a steadying hand. 
“We believe in you,” Mira added flatly, already thumbing through her notebook. 
Eidon clung to the top step, cloak flapping dramatically despite the total lack of wind. “The stairs are angry today,” 
he whispered. “They remember what I said about granite.” 
“That was two days ago,” Kerr snapped. “You insulted granite. The stairs have moved on. Now move.” 

The hermit shifted forward with the hesitance of a man attempting to descend a mountain made of porcupines and 
betrayal. His arms hovered at his sides, his cane tapped the next step like it might bite. 
“I feel the world tilting,” he murmured. 
“You’re wearing one boot and one slipper,” Mira noted. 
“They each offer different traction philosophies,” he replied solemnly. 
Thom knelt at the bottom of the steps. “We’re almost there, Eidon. Just four more. Three. Two…” 
With the kind of determination generally reserved for surviving avalanches or escaping very boring dinner parties, 
the hermit placed one trembling foot down —and took the last step off the hill. 
He paused. Looked around. 
“Oh,” he said. “That wasn’t so bad.” 
Then he strode off like he’d always meant to, posture upright, curtain rod cane tucked beneath his arm like a royal 
scepter. 
“Let’s go! Stop holding everything up!” he called back. 
The siblings exchanged glances and hurried to catch up. 

By the time they reached Drelmere, the tone had shifted. 
Mayor Halrick was already there, standing just off the square like a schoolmarm watching for mischief —arms 
folded, mustache alert, eyes tracking their every step. He didn’t approach or speak. Just observed. As if determined 
to prevent anyone from getting the town too excited. Or too nervous. 
Ever practical and forthright, Mira reached for Eidon’s wrist to stop his walking. 
“Eidon, you know there’s no Everfern,” she muttered. 
“I’m shocked,” Kerr deadpanned. 
“You knew?” Eidon gasped, turning to Thom. 
“There was never Everfern,” Thom said kindly. “The soup was… a metaphor.” 
The hermit clutched his chest. “You manipulated me with symbolic seasoning?” 
Eidon winked at Thom and mouthed, “I know,” then turned to Mira and Kerr with mock outrage. “Deceivers, you 
all!” 
“Let’s look at the tree,” Kerr interrupted, already turning toward the square. 
They approached the Bell Tree. Its dark trunk shimmered faintly under the mid -morning sun, and the bells swayed 
ever so slightly —never quite in time with the wind. 
In Kaerlin’s coat, the Shard began to pulse gently. A warmth. A presence. Not loud, but familiar. 
“It’s… humming,” she said, resting her palm over the pocket. 

“Like it knows one of its siblings is near,” Eidon murmured. “Shards are like that. Born together. Torn apart. They 
remember each other.” 
Merra appeared beside them quietly, as she always did. “No one knows what the Shards are for,” she said. “What 
they do. Or if they should do anything at all.” 
“Pragmatic as ever,” Kaerlin said. 
Merra shrugged. “Survival demands realism.” 
But Eidon was already circling the tree. “It’s a clue,” he muttered. “I know it. I’ve seen it. Felt it. Or maybe I just 
want to. But there’s something here.” 
He prodded the bark. Licked a bell. Knocked three times on the roots. 
Mira sighed. “Okay, this incoherent puzzle -flirting is going to drive me insane. I’m working on my maps.” 
She sat cross -legged nearby, parchment spreading in a fan around her. Thom joined Eidon, equally enthralled. 
“Do you think if we sing to it, it’ll respond?” Thom asked. 
“Only if it’s a waltz,” Eidon replied seriously. 
Then he tripped over a thick root. “These roots shouldn’t be here,” he muttered. 
Thom bent to look. “They really are weird. They twist like they’re following something. Not random.” 
Mira suddenly leapt to her feet. “It’s all wrong!” she shouted. 
Everyone froze. 
“I mean —it’s all wrong in the best way!” She snatched up her main map and sprinted toward them. “Look —look 
here. This should be the bakery. But it’s two blocks off. And this —this entire row of shops curves now.” 
Merra frowned. “We’ve known the town’s shifted.” 
“Yes, but it hasn’t shifted randomly. It’s aligned.” Mira began placing markers on the dirt. “If you chart everything as 
it is now —not where it’s supposed to be —it mirrors something. It mirrors this.” 
She traced her fingers along the roots. “The roots are the map.” 
Everyone stared. 
“And the tree’s not here,” she said, pointing to the center of her chart. “Not the true base. Not the origin point. It’s 
here —in the gorge. Outside town. That’s where the trunk begins.” 
A throat cleared behind them. 
Mayor Halrick stood exactly where he had been, arms still folded, mustache unmoved. “Are we rebuilding the town 
or divining from weeds?” 
“Neither,” Merra said flatly. “They’re investigating. Let them.” 
“The gorge is a dry, empty crack,” Halrick huffed. “There’s no need to go there. No need for any of this. We’re fine. 
Nothing is wrong.” 

Merra turned, eyes narrowing. “Look around. Everything is wrong.” 
She glanced back at the siblings. “But maybe the world wants to forget. Maybe the Fray came because something 
needed unmaking. Maybe it’s better to live in the world we have, not try to rewind it.” 
Kaerlin stepped forward. “And maybe undoing an undoing is just… healing.” 
The hermit grinned. “Or maybe it’s soup. With Everfern.” 
They all looked to the gorge. 
They would go. 

Chapter 9 - The Sound Below 
The path to the gorge wound beneath a sky dull with overcast gray, the silence around them broken only by the 
muffled crunch of boots on loam. No one spoke for a while. Even Eidon, whose chatter usually peppered the air like 
scattered leaves, kept his curtain rod cane close and quiet. 
When they reached the gorge’s edge, it yawned out before them —deep, dry, and entirely unimpressive. 
“This is it,” Mira said, crouching near the edge with a map in one hand and charcoal in the other. “I’m telling you, 
this is where the roots lead. If you follow the map backward from the town’s new layout, this spot is the center. The 
base of the tree.” 
“There’s nothing here,” Kaerlin said, arms crossed. 
“Not visible, no. But the roots don’t lie,” said Mira. 
“They don’t talk either,” retorted Kaerlin, clearly annoyed at the lack of obvious clues. 
Mira scowled. “They spoke to you yesterday.” 
Kaerlin’s hand moved instinctively to the pouch where she kept the Shard, fingers resting lightly over it. 
“Metaphorically.” 
“Metaphorically useful is still useful,” assured Mira. 
Thomel raised both hands. “Can we… not fight at the mouth of a mysterious gorge?” 
“I’m not fighting,” Kaerlin said. 
“You’re just debating very hard,” Thomel replied gently. 
“Precisely.” 
They stared into the gorge for a long moment. The wind stirred dust at the bottom, revealing only more 
nothingness. Empty stone. Barren walls. No signs, no markings, not even an echo. 
Mira’s grip tightened on her map. “It should be here,” she murmured. “I measured everything three times.” 
She rose, paced a few steps, then crouched again to scan the terrain. Her fingers twitched around the charcoal. 
“This isn’t how it’s supposed to go.” 

Behind them, Eidon was picking up pebbles and tossing them over his shoulder without looking. 
Out of frustration, Mira lobbed a pinecone into the gorge. 
They all heard it: the faint, delicate chime of a bell. So subtle it might’ve been wind. So strange it couldn’t have been. 
They froze. 
“Did you hear that?” Thomel whispered. 
They all leaned over the edge. 
“Still nothing down there,” Kaerlin muttered. 
Eidon poked his head in between theirs. “I see your problem. You’re looking down. Should’ve been looking up while 
leaning down. Changes everything.” 
Thomel grabbed another stone and dropped it. 
Chime. Slightly louder. More real. 
Kaerlin nodded slowly. “Throw something else.” 
They spent the next few minutes experimenting —stones, sticks, even a spare map corner that fluttered like a leaf 
on the breeze. Each object produced a different sound: faint echoes, irregular clangs, the distant shimmer of 
resonance that whispered of metal just out of reach. 
Then came the moment. A heavier rock, thrown wide by Thomel, struck something with a clean, sharp ring —a 
bell’s cry, rich and perfect. 
They all looked to each other. 
“Again,” said Kaerlin. 
This time Mira knelt, calculating. She aimed, threw. Another clear note. Then, as the silence stretched after it, the 
sun caught something metallic in the gorge wall. 
“There,” Kaerlin said. 
Set into the gorge’s far side —tucked behind a fold of jagged stone, now lit just so —was a narrow slit of an opening. 
Iron bars. Carved reliefs. Rootlike tendrils of silver etched across its frame like veins. 
Eidon exhaled slowly. “Well,” he said, “that explains… absolutely nothing, but also everything.” 
They stared at the entry. No one moved. 
Because now they all knew: this wasn’t just a door. 
It was an invitation. 
And something had been waiting to answer. 

Chapter 10 - What Was Folded 
The cave entrance was no more than a slice in the rock —narrow, jagged, uninviting. Two ancient iron bars ran 
vertical through the center, set so seamlessly into the stone it was as if the mountain itself had grown them. 
Whatever lay beyond, it was not meant to be stumbled into. 
They stood breathless, the four of them slick with dust and sweat from climbing down the gorge. All their supplies 
had been left above —even Eidon’s curtain rod cane, which he had insisted was too noble to risk scraping against 
rock. 
“Well,” Kaerlin said, brushing a strand of hair from her brow. “This is it.” 
Mira stepped forward, tracing the edge of one bar. “This isn’t a door,” she murmured. “It’s a decision.” 
Thomel crouched and ran his hand along the cave floor. “We’re not going to fit unless we figure out those bars.” 
Kaerlin examined the worn carvings that ringed the frame. Each seemed like a stone set in the rock, the faintest 
trace of a seam around each one. Strange, swirling etchings, almost like mirrored letters or layered runes. 
Mira sighed. “I got us here. I read the maps. I lined up the roots. Bending iron isn’t my department.” 
Eidon leaned in, squinting. Then he began muttering. 
“Rrrhmmm... hmmph... k’tarrr... ehhrr...” 
Kaerlin gave him a long, flat stare. “What does it say?” 
He straightened, cleared his throat with exaggerated ceremony, and said, “Oh. Nothing. I was just clearing my 
throat.” 
Thomel laughed. Kaerlin did not. 
Then Eidon blinked. “Oh wait. No. I can read it. Dust in the throat —that was the issue.” 
He leaned in again. “‘Together, unfold what was folded. In unity, the locked shall part. But unfold not what cannot 
bear its own shape.’” 
Below that, a second line of symbols: 
To Enter is the key 
Mira lit up. “Aha! A riddle!” 
She clapped her hands and began pacing before the entrance like a professor in mid -lecture. “It’s paradoxical. No —
recursive. Wait… no, it’s performative recursion embedded inside metaphor. Maybe.” 
She dropped to the ground, scrawling letters and loops in the dirt with the tip of a charcoal nub pulled from her 
pouch. “What was folded. What was folded? That could mean a physical fold... but maybe it’s temporal. Or 
metaphorical folding. Memory? Dimensional overlap?” 
Kaerlin exchanged a glance with Thomel, who shrugged. 
“‘In unity, the locked shall part.’ So —four of us, four stones, maybe we each press one? But wait —what if the runes 
are coordinates? No, too literal. Unless —unless they represent mirrored frequency pairs.” 

She pulled out her compass, then her protractor, and began measuring the distance between runes with increasing 
urgency. 
“If these are markers on a circle, maybe they’re meant to be rotated... or reflected? What if the phrase ‘To Enter is 
the key’ is literal and symbolic? Maybe the symbols correspond to tones —like bells!” 
She tapped one with a knuckle. It gave a dull click. 
“No resonance,” she muttered. “Not sonic, then.” 
Thomel tried to speak, but Mira held up a hand. She was now drawing a diagram that resembled a bell tree tangled 
with an algebra equation. 
“It could be Fibonacci -based!” she whispered. “The spacing —if you count the grooves —could align with the golden 
spiral. If we just fold the Pattern inward on itself —” 
“Mira,” Kaerlin said gently, but Mira cut her off. 
“Don’t interrupt. I’m almost at a breakthrough.” 
She pressed a sequence of six runes in a spiraling order. Nothing happened. She stared. Then pressed again —
slower this time. Still nothing. 
Her jaw clenched. 
“This place wants to be opened. It’s just hiding the logic from me. The logic is always there. I just haven’t —haven’t 
folded it right.” 
She stood, dusted off her hands, and screamed into the cave: “MAKE SENSE!” 
A pause. The cave said nothing. 
Then, quietly, Kerr stepped forward. She hadn’t even been looking at the carvings. She’d been eyeing the second 
line of text again, where it glowed faintly in the stone: 
To Enter is the key 
She tilted her head. 
“…The key?” she said aloud. “No. That’s too obvious. That can’t be it.” 
She looked again at the symbols above —at the way some of them mirrored shapes in the phrase itself. 
Her fingers brushed the first stone. Then the next. 
“T… O… E… N… T… E… R…” 
Each one clicked softly beneath her touch. 
The moment she pressed the final rune, the bars vanished. Not dissolved. Not retracted. Simply gone —as if they 
had never been there. Not even the memory of them remained. 
Mira turned around, stunned. “What did you —?” 
Kaerlin gave a small shrug. “You were overthinking it.” 

“To Enter,” Mira repeated, eyes wide. “That was it?” 
Kaerlin’s smirk was nearly invisible. “Which is why you missed it.” 
Without another word, Mira repacked her maps and chalk, walked straight past everyone into the dark cave. 
They stepped inside behind her. 
The cave swallowed the light. Darker and darker as they descended, the walls closed in, damp and close. 
Eventually, only the faint blue shimmer of moss lit their way. 
Then Eidon stumbled. 
“Eidon?” Thom asked. 
Eidon gasped. His sprightly form sagged. Before their eyes, his skin paled and wrinkled, hair silvering into a wild 
halo of age. 
“Gods,” Mira whispered. “What’s happening to him?” 
Kaerlin caught him beneath one arm. “He’s... aging.” 
“No,” Eidon said softly. “Not aging. Unfolding. ” 
The siblings gathered around him. 
“What can we do?” Kaerlin asked, urgent. 
“I’ve been folded across too many layers,” Eidon continued, voice light with wonder. “When I came through... the 
fold ended. And I became what I’ve always been.” 
“We can take you back out,” Thomel said, kneeling beside him. 
Eidon smiled, gentle and clear -eyed. “You can’t fold me back up. That part of me is finished. What’s done is done —
and I am glad for it. I am all of myself again.” 
“You’re dying,” Thom said gently. 
“Yes,” he nodded. “And I’m finally all in one piece. For the first time in... I don’t know how long.” 
Mira’s voice caught. “You can’t go. There’s still so much more to learn.” 
And then, as if something vast and forgotten uncoiled behind his eyes, Eidon began to speak: 
“There are thirteen Shards,” he said. “Each one a spine of the Pattern. Anchors, yes —but also keys. Keys to 
something that doesn’t yet understand it is locked.” 
“I don’t understand,” Kaerlin said, clutching the Shard at her side. 
“Before the Pattern,” Eidon said, “there was only Drift. Chaos without memory. Then came the Architects. They 
built the Pattern to hold time still. They forged the First Loop.” 
His breath hitched. But his voice remained steady. 
“But something flawed got caught in the design. It twisted the weave. And the Fray was born —not as a destroyer, 
but a symptom.” 

“A symptom of what?” Kaerlin asked. 
“Of time’s refusal to stay fixed,” Eidon replied. “Of the lie whispered into the world’s bones. Now the Pattern forgets 
itself, piece by piece.” 
He closed his eyes, but his voice stayed strong. 
“You gather them... and the Fray will have nothing left to cling to.” 
“Will it fix the world?” Mira asked. 
“No one knows,” he whispered. “Unfolding the world might mean losing everything we built from the damage. Or it 
might mean restoring what we forgot. It’s not a repair. It’s a remembering.” 
He opened his eyes again. 
“Your father believed this. He found me once. A man with a voice shaped like a lopsided lantern. He was looking for 
the Shards —just like you.” 
“You knew our father?” Thom asked. 
“Where is he? What happened to him?” Kaerlin demanded. 
Eidon drew a long, slow breath. 
“He may be old, or young. May have died, or begun again. Time is a paper folded too many ways,” Eidon said, 
smiling faintly. “Time has little respect for calendars. But you —you must keep going. You’re already further than he 
ever came.” 
Thom reached for him. “We won’t let you go.” 
But Eidon only nodded, once. 
“I’m not gone. I’m home.” 
Then —gently, without spectacle —he closed his eyes, and faded into the stone, like shadow settling into the wall. 
The siblings were quiet. 
Then, slowly, they turned toward the tunnel ahead —dark, uncertain, waiting. 
And they walked forward. 

Chapter 11 - The Bound Thread 
As they walked deeper into the cave, time grew heavy. 
The world outside had been loose, almost fluid —distances bending, days blurring, moments folding into each 
other. But here, the deeper they traveled, the more weight the seconds seemed to carry. Time no longer drifted. It 
pressed. Solid and thick. 
Each footstep landed harder. Each breath echoed slower. 

They didn’t speak. They didn’t have to. They all felt it: space was closing in around them —not in walls, but in 
certainty. Time and space were being re -bound to the Pattern. 
And their bones knew. Their minds resisted. 
It wasn’t malevolent. 
It was inevitable. 
The only light came from the moss —faint threads woven into the walls like veins, glowing a soft silver -blue. It 
pulsed slowly, like breath. 
They didn’t know how long they walked. 
It could have been hours. 
Or days. 
Or a single moment stretched too far. 
Then, without warning, the tunnel opened into a vast cavern —so tall the ceiling faded into shadow, impossibly 
high for the depth they thought they’d reached. 
The space was beautiful. 
And wrong. 
Towering. Silent. Still. 
Roots, black as coal and thick as limbs, twisted up the walls, vanishing into the dark. They grasped the stone like 
fingers closing into fists. 
They turned around. 
The tunnel was gone. 
Not blocked. 
Not sealed. 
Gone —as if it had never existed. 
Panic came like a wave. 
Mira ran her hands along the stone, searching. Kaerlin circled the cavern’s base. Thomel shouted once —just to hear 
the echo. 
None came. 
They climbed, clawed, scraped their fingers bloody against stone and root. They shouted until their voices cracked. 
They begged the air to shift, to do something. But nothing answered. 
They stopped searching. Just for a breath. 
Then Thomel stood. He said nothing. He only walked to one of the roots, knelt beside it, and started peeling at the 
bark. 
“What are you doing?” Mira asked, voice hoarse. 
“Looking for something to feed you,” he said. “You haven’t eaten. Thought maybe... I don’t know. Maybe food will 
help us think.” 
He tore a strip of bark away. 

And there, beneath it —etched in silver —was a shape. 
Not random. 
A spiral. 
They didn’t know what it meant. 
But it felt like it had always been there. 
Kaerlin knelt beside him. “That’s… familiar.” 
“I know that symbol,” Mira said, crouching next to them. “That’s one.” 
“One of what?” Kaerlin asked. 
But Mira didn’t answer. She just pulled out her charcoal and parchment, hands shaking, and began to draw. 
“Keep going,” she said. 
So they did. 
Kaerlin and Thomel tore at roots with bare hands, ripping back thick bark, choking on clouds of black dust that 
billowed with each strip. Their fingers turned gray. Their faces streaked. The air grew gritty, hard to breathe. 
But still they worked. 
One spiral. 
Then another. 
Larger. 
Smaller. 
Some half -hidden beneath overlapping tendrils. Some deep in knots of root. 
Mira tracked them all, drawing feverishly with blackened fingertips, sweat cutting paths through the dust on her 
cheeks. 
“Twenty,” she whispered. “Twenty -one…” 
And then —after what felt like forever — 
“Twenty -two.” 
Each spiral different, but not chaotic. 
They aligned with something unseen. 
Not understood —but felt. 
Then, a sound. 
Soft. 
Resonant. 
The wall cracked. 
Light poured through a widening seam. 
They stepped forward — 
And the cavern unraveled. 

They were outside. 
In daylight. 
Back in the square of Drelmere. 
Mayor Halrick was mid -sentence atop his wooden platform, addressing the townsfolk. 
“—and as I have said many times, there is nothing unusual occurring within this town —” 
He stopped. 
The entire town turned. 
The siblings stood there —filthy, smoke -smeared, disheveled, covered in soot and sap and streaks of ash, blinking 
in the sunlight like creatures dragged from a dream. 
The mayor’s jaw dropped. 
Near the edge of the crowd, Merra slowly raised one eyebrow. 
No one spoke. 
Above them, the bells swayed — 
But gave no sound. 

Chapter 12 - The Second Shard 
Merra helped clean them up. 
No fuss, no commentary —just soap, water, and sharp glances when anyone winced. The siblings sat around her 
workroom, wrapped in towels, hands raw, hair matted with black dust. As they scrubbed the grime from their skin, 
they noticed familiar items stacked neatly on a nearby shelf —packs, cloaks, even the hermit’s curtain rod cane. 
“These are ours,” Thom said, pulling a satchel down. 
“I retrieved them,” Merra replied, drying her hands. “I thought you were dead. Or worse. And if you were, well… 
free things. I’m practical.” She paused. “But you’re not dead —so I suppose I just retrieved them for you. You’re 
welcome.” 
She handed Mira a warm cloth, then nodded at the stack of drawings. “Let me see those.” 
Mira unrolled her charcoal sketches, spreading them across the wooden table. 
Merra leaned in, squinting, lips pursed. “I’ve never seen markings like these. Not in this sequence.” 
A voice grumbled from the doorway. 
“You’re still encouraging this nonsense?” 
Mayor Halrick stepped into the shop, arms folded, boots muddy. 
“You need to keep this quiet,” he said, straightening his coat. “Tell them nothing happened. Let them believe 
everything is fine. The last thing we need is wild stories and strange rumors. People get ideas. And ideas spread 
faster than facts.” 

“We’re not going to lie,” Kaerlin said. 
Halrick’s expression tightened. “Don’t be naive. I’m trying to protect the town. You think I don’t want answers? I do. 
But I want order more.” 
“We’re not here to start a panic,” Mira said. “We’re here to stop one.” 
“I get that you’re scared,” Thom added. “We are too. But silence won’t help.” 
The mayor looked at them for a long moment. 
Then his shoulders dropped. “Do you know what happens when people panic?” he said, voice quieter now. “They 
run. They flee. And when they go, they leave behind the ones who can’t. The old. The sick. The scared. They leave 
me to pick up the pieces. To hold the town together. That’s the only way we make it through this. Together.” 
“We understand,” said Kerr. 
“And we respect it,” said Thom. “But we won’t lie.” 
Halrick exhaled hard through his nose and stepped closer to the table. 
He frowned, tapping one of the spirals. “You know these match the bells, right?” 
Everyone froze. 
“What did you just say?” Mira asked. 
“These,” Halrick said, gesturing again, “match the engravings on the Bell Tree’s bells. I’ve seen them. Examined that 
tree a hundred times, trying to figure out what’s causing all this weirdness. You think I don’t care? You think I’m 
not scared too? But I can’t have people panicking.” 
“Wait,” Thom said. “You’re sure?” 
“Positive. The smallest spirals match the smallest bells. The largest... the biggest.” 
They stared at the drawings, breath caught. 
Merra leaned forward, nodding slowly. “It’s an order. A sequence to ring the bells.” 
“What happens when they’re rung in that order?” Mira asked. 
Nobody answered. Silence filled the shop like fog. 
Then Kerr spoke. “We ring them.” 
“Absolutely not,” Halrick snapped. “We don’t know what it’ll do.” 
“We don’t know what not doing it will do,” Thom countered. “The Fray is growing. It doesn’t wait for permission.” 
“The hermit said the Shards are spines of the Pattern,” Kerr added. “We think the Bell Tree has a connection to the 
Shards —maybe it was guarding one, or maybe it responded to the sequence. Hidden, dormant. Until now.” 
Merra looked between them, her voice low. “It’s your call. But if you do it, do it with intention. With clarity.” 
They stepped out into the square. 

People had begun to gather —curious, wary, confused. Halrick tried to hush them, to keep order, but Mira raised 
her voice. 
“We went into the unknown,” she said. “We stepped into something none of us could explain —and we came back 
with proof. We didn’t understand it all, but we didn’t let fear stop us. We went forward. Because sometimes trying 
is the only thing that matters. Because standing still is just another way to fade. And we won’t fade —not quietly, 
not blindly, and not without a fight.” 
Kerr stepped up beside her. “We’re not asking for trust. Just space. Let us try.” 
A low murmur rippled through the crowd. No one moved to stop them. 
They approached the Bell Tree. 
The spirals were there —etched into the bells, just as Halrick had said. The order was unmistakable now. 
Mira stood with the map. Kerr and Thom moved to opposite sides of the tree. Together, they began to ring the bells, 
one by one, in the sequence the drawings had revealed. 
Soft chimes echoed through the square. 
One. 
Two. 
Five. 
Twelve. 
A final note, clear and still. 
Silence. 
A breeze stirred the air —gentle, like the breath of something listening. 
Then nothing. 
Another moment passed. 
No wind. No sound. 
Only the sensation of breath held. 
Then —the tree moved. 
It groaned. Its limbs curled inward. Branches folded like parchment. Roots twisted and recoiled. The entire trunk 
compressed, shrinking inward, folding over and over into itself —into a knot of bark and shadow, dense and 
angular in ways the eye couldn’t follow. 
Then, slowly, it began to unfold —delicately, precisely. 
Not back into a tree. 
But into a single, small object, resting in the center of the stone platform. 
A black shard. 
Smooth. 
Silent. 

The second of thirteen.',
        9840,
        admin_id,
        'pending_review',
        false,
        49,
        ARRAY['pending', 'needs-review']
    );

    -- The Prince and the Drowning City
    INSERT INTO public.stories (
        title,
        slug,
        summary,
        content,
        content_text,
        word_count,
        author_id,
        canon_status,
        is_published,
        reading_time_minutes,
        tags
    ) VALUES (
        'The Prince and the Drowning City',
        'the-prince-and-the-drowning-city',
        'The Fray spreads. The Shards awaken. The Everloop turns. 
And somewhere deeper still, the world begins to ask: 
If the Pattern was a prison... 
…what was it meant to hold? ',
        '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Full story content in content_text field."}]}]}'::jsonb,
        'PROLOGUE: THE EVERLOOP 
The Pattern was never meant to break. 
That is what the First Architects believed. What they carved into stone and bent into sky. 
What they whispered as they shaped the rivers and flung the stars like seeds across the 
dark. 
They called it the Everloop —a perfect lattice of time and space, a symmetry so absolute 
that even memory could rest within its folds. A song sung forever. A world without ending, 
because ending itself had been woven out. 
But nothing made by hands —no matter how vast, no matter how sacred —can hold forever. 
Beneath the surface of the weave, something stirs. 
They say the First Map was drawn before ink, before tools. That it bloomed into being the 
moment the Pattern was cast —etched by thought alone. Not a guide, but a memory. Of 
what was, what is, and what must always be. Cities unborn. Rivers unnamed. Futures 
unchosen. All suspended like droplets in the curve of a loop. 
And yet… 
Even the oldest loops fray. 
First in the edges. A soft unraveling. Days doubled. Towns forgotten. Roads walked but 
never made. Then the deeper rifts: the thinning of matter, the distortion of memory, the 
ripple through cause and consequence. 
Those who have seen the Shards —those small, shimmering remnants of the First Pattern —
know this: 
They do not hum. 
They remember. 
Each one a stillpoint in a world that can no longer stand still. 
The Scholars believe the Shards were safeguards. That the Architects, in their wisdom, 
placed them throughout the world as anchors —points of return, should the weave falter. 
But others wonder… 
Why would a perfect loop require safeguards at all? 
What flaw did the Architects see, hidden in their own design? 
And what, exactly, did they trap within it? 
If there is an answer, it lies buried in time. Or beneath it. Or beyond. 

The Fray spreads. The Shards awaken. The Everloop turns. 
And somewhere deeper still, the world begins to ask: 
If the Pattern was a prison... 
…what was it meant to hold? 

Chapter 1 – The Lord of Luck 
The blade struck Auren across the ribs, a clean slice that would’ve laid a soldier flat. 
Auren grinned. 
“Excellent parry, Master -at-Arms!” he called as he stumbled backward, tripped over a 
training dummy, and landed flat on his back with a triumphant whoop. 
Across the courtyard, the older man —scarred, stocky, and utterly unreadable —offered 
only a slight nod. 
“Indeed, my lord. A… reversal. Devastating.” 
Auren rolled to his feet with the flourish of a man who believed the tumble had been 
strategic. 
“Not many could’ve baited a feint with a stumble,” he declared, adjusting his collar and 
flicking imaginary dust from his shoulder. “I rather like that one.” 
The Master -at-Arms held his sword with both hands, knuckles white, breathing through his 
nose in what might’ve been a prayer. 
“Your instincts are… unorthodox,” he said. 
“Unorthodox victory is still victory,” Auren said cheerfully. “It’s not how you fall —it’s how 
you convince the world you meant to.” 
The older man offered no rebuttal. Instead, he raised his sword again. 
Auren sprang forward with a lunging jab, slipped mid -step, and accidentally hurled his 
weapon ten feet across the yard. 
“Ah!” he cried, spinning as though it had been intentional. “Disarmament test. Yours. Go.” 
The Master blinked. 
“My lord, you are currently unarmed.” 

“Which makes it harder for you,” Auren said brightly, circling him with wide, theatrical 
steps. “Unless you want me to retrieve it?” 
“No… need.” The Master -at-Arms sighed and stepped forward, swiping downward with a 
clean strike. 
Auren twisted to dodge, lost his footing, and fell straight into the older man —knocking him 
off balance and sending both of them tumbling to the ground in a tangled heap. 
There was a long pause. Then Auren, lying on top, gave a satisfied nod. 
“See? If this were a real battle, you’d be under me. I win.” 
“You… fell on me,” the Master muttered, winded. 
“Precisely. A tactical descent.” Auren clambered upright with a theatrical bow. “If your 
technique doesn’t improve, I may need to start requesting two opponents just to keep my 
skills fresh.” 
The Master -at-Arms turned away, his expression hidden beneath the scowl that had 
become his armor. He retrieved Auren’s sword, handed it back with perfect form, and 
muttered: 
“A duel of one is still a duel, my lord. Let the record show… decisive.” 

Dinner that night was served in the Winter Room, where the hearth was always full and the 
curtains never opened. The scent of cinnamon broth and roasted parsnip drifted lazily 
through the wood -paneled hall. At the long table sat the Lord and Lady of House Thorne, 
eyes soft with warmth and worry. 
Auren entered in half armor and half silk, still glistening faintly from the fight. 
“You should’ve seen me today,” he said, sliding into his seat. “I nearly broke my foot off 
baiting a feint —revolutionary technique.” 
His mother, Lady Thorne, blinked slowly. “Did you… win?” 
“Of course I won.” He lifted a grape from the bowl beside him and popped it into his mouth. 
“Master says I’m unorthodox. You know. Unpredictable. Dangerous.” 
His father, Lord Thorne, didn’t look up from his wine. “Unpredictable and dangerous. 
Hmm.” 
They exchanged a glance —a quiet one, the kind forged in long love and deeper secrets. 

“I’ve been thinking,” Auren said between bites. “The business with Virelay. The disappearing 
town. The sailors who come back with their heads full of fog and their hearts turned 
backward.” 
He placed his goblet down a little harder than intended. 
“Someone needs to go. To help them. To fix it.” 
His mother’s spoon paused halfway to her mouth. 
“Auren—” 
“They say buildings appear one day and vanish the next. That rivers pour the wrong way and 
then forget they ever did. That fish swim under the stones now, and some days the sky’s the 
wrong color.” 
His voice, for all its pomp, held a kernel of fear. Not for himself. But for the people. 
“Our trade lines are crumbling. Ships can’t find the harbor. No one can tell what’s real. And 
every day the Fray reaches further inland.” 
He looked up at them, solemn now. 
“The town feeds the rivers. The rivers feed the land. If we lose Virelay, we lose everything.” 
Silence. Then: 
“You’ve always cared deeply for our people,” his mother said gently. 
“That’s what this house is for,” his father added. “But… Auren, perhaps we should wait. 
Perhaps there are others better trained. Or better… prepared.” 
More glances. This one more urgent. 
“You mean soldiers? The ones who came back whispering nonsense and crying into their 
boots?” 
Auren pushed his plate away. 
“I’m not afraid. I have studied the Fray, its signs, its patterns. And I know our land. I know 
our stories. I am… prepared.” 
His parents said nothing. They looked at their son —a boy full of stories and courage and 
love. A boy who had never truly failed. 
And so they smiled. 
And changed the subject. 

And planned, quietly, to keep him safe. 
They loved their people more than anything —and their son more still. 
And that was why they would not allow him to go. 
Not willingly. 
For in some part of them, too, they believed that if the world could be mended through 
compassion, through stories, through the quiet magic of belief, then perhaps Auren truly 
had a part to play. 
But not out there . Not in Virelay. Not in the heart of the Fray. 
There was one truth they had never spoken aloud. Not to the court. Not to each other. Not 
even to him. 
For all his book -learning, for all his study of lore and maps and myths, for all his generous 
heart and brilliant mind... 
Auren Thorne was, by every measure of battle and blade, an exceptionally bad fighter. 
And so they smiled again, faintly. 
And waited for the right time to tell him no. 

CHAPTER 2: The Great Escape 
It began, as many of Auren’s plans did, with a whispered monologue to himself beside a 
half-open window and a loaf of stolen bread. 
“Phase one,” he murmured, “procure rations.” 
The bread had been sitting on the kitchen table, still warm, intended for the staff''s supper. 
Auren had “procured” it with the calculated swiftness of a cat burglar —which is to say, he 
casually strolled into the kitchen, took the loaf, nodded at the cook, and said, “Top secret 
mission. You understand.” The cook, who had watched Auren grow up and once seen him 
trip over a rug while trying to bow, simply smiled and handed him a wedge of cheese to go 
with it. 
“Phase two,” Auren intoned, crouching behind a decorative hedge in the manor’s west 
garden, “stealth movement across the perimeter.” 

He darted out from behind the hedge like a fox in the moonlight, only to be spotted 
immediately by two gardeners taking a smoke break by the fountain. Auren froze mid -stride, 
one leg lifted dramatically in the air. 
“Evening, m’lord,” one of the gardeners said. 
Auren narrowed his eyes. “Forget you saw me.” 
“Alright,” said the other, taking a drag of his pipe. “Forgotten already.” 
Auren nodded grimly and vanished into a rose arbor, convinced his fierce tone had struck 
fear into their hearts. 
“Phase three,” he whispered, flattening himself against the wall of the east wing, “silent 
infiltration past the eastern corridor.” This “infiltration” consisted of him walking in a wide 
arc around the outdoor patio, waving at a maid who was sweeping the s tairs. She waved 
back and pointed to the path that would avoid the muddy section. He saluted her solemnly. 
Then came the final test: the front gate. 
An iron-wrought archway stood sentinel at the edge of the grounds, flanked by twin stone 
columns and one slightly bored guard named Brennick. He was leaning against his spear, 
humming a tune, when Auren burst from the shrubbery and rolled into a crouch not five 
paces away. 
“Don’t move,” Auren hissed. “I don’t want to hurt you.” 
Brennick blinked. “Wasn’t planning on moving, m’lord.” 
“I’m trained in seven forms of combat,” Auren lied with astonishing confidence. “Eight if you 
count underwater.” 
Brennick glanced at the manor, where lights still flickered in warm windows, and then back 
to the young man who had once attempted to joust with a broomstick and a goat. He 
stepped aside. 
Auren gave a slow nod. “Wise choice.” 
He slipped —no, swept—through the gate like a shadow in motion, vanishing into the road 
beyond with dramatic flare, the bread tucked triumphantly under one arm, the cheese in 
his satchel, and his father’s old compass dangling from his belt. 

High above, on the west -facing balcony of Thorne Manor, Alira and Eldren stood shoulder to 
shoulder, wrapped in shawls against the night breeze. 

“He’s gone,” Eldren said softly. 
Alira nodded. “He thinks we didn’t see him.” 
“He thinks Brennick was afraid of him.” 
They both chuckled, and then fell into silence. 
Below, Auren’s silhouette grew smaller as it made its way down the path, lantern bobbing 
like a firefly in the dark. For all his comic bluster, for all his fumbling and bravado, there was 
something true at his core. A strange sort of gravity, however crook ed. 
Alira reached for Eldren’s hand. He took it gently. 
“He’ll learn,” she said. “One way or another.” 
“And if the world is kind,” Eldren murmured, “he might even survive it.” 
Their fingers intertwined as the last glimmer of Auren disappeared over the hill, the boy 
certain he had escaped into legend. 
And perhaps, in some small way, he had. 

CHAPTER 3 — The Road and the Ruse 
Auren Thorne was hungry. 
Not starving, not desperate —but the kind of hungry that made you rethink leaving home 
with only three oatcakes, two apples, and what he now realized was ceremonial jerky. He’d 
mistaken it for travel rations, but it turned out to be part of a decorative gif t basket meant 
for a departing ambassador. It had a ribbon on it. 
Still, he was undeterred. He had studied the old maps. He knew these lands like a scholar 
knew ink. Virelay lay beyond the coastal ridge, two days’ ride or four days’ walk —if one 
walked sensibly. Auren, it should be said, did not. 
At first, he kept to the brush beside the road, imagining patrols scouring the land for him, 
dramatic reunions and forced returns. But brambles had no flair for choreography, and 
after the third trip, tumble, and face -full of thistle, he conceded to practi cality and returned 
to the road —deciding that the true disguise was confidence. 
Which is how he began rehearsing his cover story aloud as he marched down the empty 
road in full view of absolutely no one. 

“I’m a body double,” he muttered, “for the Prince. Due to assassination attempts. Yes. 
Dangerous work, really. But someone''s got to do it.” He cleared his throat, tried a deeper 
voice. “He’s bed -bound this week with… chronic kneecap inversion. Very serious . 
Kneecaps —flipped entirely inward. Happens when you spend too long horseback fencing 
in cold weather. Nothing can be done.” 
He nodded to himself. Convincing. Specific. Devastating. 
The sun dipped low when he reached a small village just shy of the river bend, where 
woodsmoke curled up from squat chimneys and warm light spilled out of a tavern window 
that shimmered like syrup against the coming dark. His stomach made the decision befo re 
his mind could catch up. 
The place was called The Cracked Pot , and it lived up to its name —walls slightly leaning, 
shutters mismatched, but golden with welcome. A heavy drink bell swung above the bar, 
and a sign hung over the hearth that read: 
NO SWORDS, NO SHOUTING, NO WEEPING —UNLESS IT’S A BEAUTIFUL SONG. 
Auren entered, tried to appear nonchalant, and approached the bar with the swagger of 
someone playing a role slightly too large for them. “Evening,” he said. “Your finest loaf and a 
small stew, please. I’ll pay in coin, of course.” 
The barkeep blinked, then squinted. “Auren Thorne?” 
There was a pause, then a quiet ripple of recognition around the room. Heads turned. A 
chair scraped back. 
In Auren’s mind, this was it. The moment when his identity was discovered. Where a bounty 
hunter would surely spring from the shadows, or a whispering spy would dash off to report 
his position. He placed a hand near his belt, where he kept a dinner knife sharpened 
slightly too eagerl y. 
“I… suggest,” Auren said carefully, “we all just go on with our evenings. No need for 
dramatics.” 
The villagers looked at one another. Someone offered a polite shrug. Another raised a cup 
in silent toast. 
“Well said, lad,” the barkeep replied. “You’ll have your stew. On the house.” 
“Don’t bribe me,” Auren hissed in a whisper. “I know how these things work.” 
The barkeep stared. “Right.” 

As things settled and Auren took a sip of cider, still scanning the room for betrayal, the door 
slammed open behind him. 
A hulking man stumbled in —shirt half -tucked, eyes bleary, and carrying the mood of a 
storm that had already decided who it wanted to hit. The tavern quieted at once. 
The drunk scanned the room. “Anyone here got a face needin’ fixin’?” 
Auren stood slowly, finished chewing a bit of bread. Destiny he thought to himself. 
“Go home, friend,” he said. “Sober up. No need to trouble these kind people.” 
The man blinked at him. “ I’ll show you trouble , then? You look soft.” 
“I’m trained,” Auren said calmly, “to appear soft. Assassin -like-soft.” 
The man snorted and took a step forward. “You talk soft.” 
Auren held his ground. “And you smell like a sewer.” 
A few chuckles bubbled up, quickly stifled. 
The man scowled and advanced with fists rising. 
Auren, calmly and with purpose, began to stretch. Not as mockery —genuine warm -up. A 
wrist roll. A shoulder circle. He bent sideways, trying to remember the stance Master -at-
Arms—Edran—always corrected. Then, with practiced poise, he swept his leg out to lo osen 
his hip— 
—and clipped the side of the table. 
His cup tipped. “No, no, no,” he muttered, reaching to catch it with the speed of a man who 
really liked his cider . 
In doing so, his foot swung out again, low and unplanned, just as the drunk was closing in. 
It struck the man square in the shin, buckling his knees. The brute stumbled backward, off -
balance, and pitched sideways —striking his temple clang against the tavern''s brass drink 
bell. 
Auren rose with his cider in hand, satisfied. 
He turned just in time to see the drunk slumping against a chair, mumbling something 
about a duck and a toll road. 
Auren knelt beside him, frowning. “He’s clearly unfit to fight,” he declared. “I won’t duel a 
man who can’t defend himself.” 

He gently laid the man down, tucked a few coins under a coaster, and handed a silver to the 
barkeep. “See that he gets water and… directions.” 
Then, brushing off his coat, he nodded to the silent, wide -eyed room and stepped out into 
the cool night. 
Behind him, after a beat of stunned quiet, someone muttered: 
"We’re gonna be telling that story for years—and it won’t sound any less stupid." 
The tavern erupted. Auren, already halfway down the lane, mistook it for cheers. 

CHAPTER 4 — Virelay 
The first thing Auren noticed was the sea. 
Not the sound of it, though that, too, was constant —murmuring and hissing like it knew 
secrets it refused to say twice. Not even the smell, brine and fish and smoke curling in 
every alley. 
No. It was the fact that no matter where he stood, someone, somewhere, was hauling up a 
fish. 
He saw it from the hilltop road as he entered town: a single point offshore where the lines 
were always cast and always tugged taut with life. Every boat in the harbor angled toward it. 
Nets dipped there. Eyes lingered. Even the gulls clustered over it in an almost reverent 
spiral. 
That, he thought, filing it carefully in the library of his mind, isn’t nothing. 
The second thing he noticed was everything else. 
Virelay was wrong. 
It wasn’t rot or fire or ruin —not in the traditional sense. The town still stood, still bustled. 
But it didn’t… hold still. 
He saw buildings where none had been a moment before. Streets that narrowed into alleys 
and then widened again without a sound. Children chasing marbles down steps that hadn’t 
existed when he passed the square that morning. 

And the people —gods, the people. Talking in half -sentences. Selling pears with names that 
changed between customers. An old woman scolding a chicken as though it were a boy 
named Lark. 
At first, Auren tried to chalk it up to nerves. New places always had rhythms. But Virelay 
didn’t settle—it shifted. Like trying to read a sentence written on water. 
By afternoon, he was ready to rest and regroup. He found an inn that looked promising —
The Oar and Candle , its sign swaying gently beside a narrow stone door. Inside was warm, 
modest, and mostly normal. A front desk. A bored clerk. Chairs. A woven rug with far too 
many birds on it. 
“I’d like a room,” Auren said. 
The clerk looked up. “Of course. Have you checked in already?” 
“No.” 
The clerk frowned. “That’s odd. You were here just this morning.” 
“I wasn’t,” Auren replied, then added, “Unless I was and don’t remember. Which… is 
possible now, I suppose.” 
“Well.” The clerk consulted a ledger. “It says Room 3B. But 3B isn’t…” He blinked. “3B’s not 
a room. That’s a broom closet.” 
“I’ll take it,” Auren said. 
“No no—wait, now it is a room. But it’s occupied.” He flipped a few pages. “By you.” 
Auren stared at him. 
“You’re currently in it,” the clerk continued, then looked behind Auren’s shoulder. “Or… you 
were.” 
Auren turned. Nothing was there but a plant and a crooked painting of a boat with legs. 
“Is the lobby spoken for?” he asked. “This couch looks very… horizontal.” 
The clerk opened his mouth, closed it. “Technically, the lobby’s under renovation.” 
“No it’s not.” 
The clerk blinked, then frowned at a paper. “Huh. You’re right.” 
Auren lay ed down. 
“I’m checked in,” he said flatly. “This is my room.” 

He slept like a man trying to stay awake, limbs stiff, boots still on, one hand resting on his 
satchel. Sometime in the night he woke to the sound of two people arguing in a language he 
didn’t know, only to realize it was one man arguing with himself in a mirror. 
By morning, the inn had grown a second staircase. It now led nowhere. 
The next day brought more of the same. Auren wandered the docks, asked questions, took 
notes, tried to chart the layout of the town only to find that whole intersections had 
rearranged when he returned to them. 
He spoke with a fruit vendor named Nel —sharp-eyed, warm, talked about her daughter’s 
wedding and the price of cinnamon. 
The next morning, she was gone. Her stall was there, but it belonged to a bearded man who 
insisted it always had. No one knew who Nel was. 
Auren asked three more people. None had heard of her. One insisted cinnamon had never 
existed. 
And the fishermen… they all said the same thing, in different ways: 
“You want fish? Go east, by the black buoy. Always a bite there. Every hour. Every day.” 
He marked the spot on his map. He asked why the fish gathered there. 
“Because they do.” 
“That’s not an answer.” 
“No,” the man said, eyes already glassing over, “it’s not.” 
By the second evening, Auren sat back in the Oar and Candle, jaw tight, heart heavy. He 
had hoped to fix something. Uncover a truth. Instead, he felt like he was drifting through the 
world with nothing to push against —no walls, no roots, no reality that would hold still long 
enough to explain itself. 
Even the inn had turned against him. 
He stepped through the door only to be greeted by the clerk again, ledger in hand. 
“Welcome,” said the man. “Checking in?” 
Auren walked past him without breaking stride. 
“I live on the couch,” he muttered. 
The clerk blinked. “We don’t have a —” 

“Yes,” Auren said flatly. “You do.” 
He flopped down on it with a sigh and pulled his cloak over his face. 
The clerk stood quietly for a moment, then turned the ledger upside down and stared at it. 
Outside, the wind howled like it had somewhere else to be. Somewhere saner. 
And in the heart of the broken harbor town, Auren Thorne —body double, scholar, 
accidental folk hero —lay on a couch he did not own, in a building that may not have 
existed, wondering how on earth you were supposed to save a place that forgot itself 
between heartbeats. 

CHAPTER 5: The Constant 
Auren awoke with a groan and the distinct sense that he hadn’t truly slept. The hotel lobby, 
though dim and stuttering between three different versions of itself through the night, had 
at least stayed a version of itself. He rubbed his eyes, blinked toward the check -in desk—
which now had a hanging fern, a different clerk, and a placard declaring it The Azure Marlin 
Inn: Newly Reopened! —and walked right past. 
"Checking in?" called the man, cheerful as a summer bell. 
Auren didn’t answer. His head was heavy, his boots found the cobblestone street more by 
memory than will. The morning light was soft, slanting, and full of the kind of peace that 
mocked those who knew better. 
And then — 
“Morning, Lord Thorne!” 
Nel. 
She stood beside a fruit cart that hadn’t been there the day before, nibbling on a fig like 
she''d never not been there. 
“You…” Auren stopped. “You weren’t —” 
“Wasn’t what?” she said, cocking her head. “You’ve got that shadowed look again. You 
sleep alright?” 
“No. No, you weren’t —” he started again, but her smile had the stubborn glow of someone 
whose memories did not include failing to exist. The day before —no one had known her. 
Not even the innkeeper. Now she was here, as normal as sunlight. 

It undid something inside him. 
Auren turned and walked away mid -sentence, letting her voice trail off behind him. The 
street was shifting again —new doors, new faces. Some things remained. A man arguing 
with a goose. A pair of children skipping in opposite directions. But even those piec es had a 
disjointed feel, like torn cloth trying to pass as whole. 
He stopped at the docks. 
Two fishermen sat on an overturned barrel and a pile of netting, smoking pipes and 
speaking in that lazy rhythm only men who lived by tides could manage. 
“Still biting out there?” 
“Every bloody morning. Never seen the fish this easy.” 
“Same spot?” 
“Same as always.” 
Auren turned his head slowly toward the sea. 
There—just past the jetties —was the pattern. A crescent of bobbing vessels. Even from 
here, he could see the floating traps. Every single boat, in nearly the same spot as 
yesterday. And the day before. 
Everything else had shifted. Streets rearranged. People vanished. But this… 
This hadn’t changed. 
He stared harder. 
That wasn’t nothing. 
— 
The dockmaster called him mad. The sky was clear, the gulls idle, and the boat freshly 
tarred. But the man gave him a nervous glance and said, “Feels wrong. Looks right, but 
feels wrong. That sky’s got a hum to it.” 
Auren took the oars anyway. 
He pushed off alone. 
The first ten minutes were calm —so much so he nearly second -guessed the dockmaster’s 
warning. But then, without warning, the sea around him was not the sea he’d left. Wind tore 

across the surface. The sky did not darken —it simply changed, all at once, from gentle blue 
to a rippling sheet of black and silver. Not a storm that rolled in. A storm that was. 
The waves came without warning, slamming his tiny craft like a toy between gods. 
Auren gripped the sides. He was nearly pitched into the brine twice. Once, he hung off the 
edge, feet flailing, salt in his mouth, before he dragged himself back in. Another time, he 
dropped his oar and had to lunge to catch it before it vanished into the void of the sea. 
But he stayed the course. 
Each time he looked back, he saw Virelay on the shore —bathed in soft sunlight like a 
painting. He thought of his warm bed at the manor, the feel of his mother’s hand in his hair, 
of books that never changed and mornings that always made sense. 
He almost turned. 
Almost. 
But then he remembered Nel, appearing where she hadn’t been. 
The inn, blinking through states. 
The soldier on day one who, on day two, hadn’t existed at all. 
And the boats. Always there. Unchanging. 
He rowed harder. 
— 
By the time he reached the spot —a good hundred yards past the farthest of the fixed fishing 
line markers —his arms were trembling, the wind a scream in his ears. And yet, here, in the 
very center of that cursed sea… 
Stillness. 
No other boats. 
Only the traps. 
Dozens of them, bobbing and swaying like empty thoughts. 
The fish were still being caught, he was certain of that. But there were no men tending 
them. No vessels. Just the lines. Dozens of thick rope lines stretching down into the depths, 
like threads sewn into the skin of the sea. 
Auren stood, wobbled, and peered over the edge. 

And then he saw it. 
Not a shape. Not a glow. 
Just… depth. 
He reached down and grabbed one of the lines. It was wet and rough, anchored deep. 
The answer wasn’t on the sea. 
It was beneath it. 
Whatever held this cursed loop in place, whatever made the town forget, reshape, re -
begin—it was down there , in the dark, beneath the tide and memory both. 
And Auren Thorne, untested knight of tales, terrible at fighting but too full of belief to stop 
now… 
…began to tie the line around his waist. 

CHAPTER 6: The Descent 
The sea was quiet. Not calm —never calm here —but quiet in that strange way where all the 
noise seemed held just behind the eardrum. As if the deep itself were listening. 
Auren floated in the small boat, the single oar tucked beside him. The sky above had 
darkened without warning. Clouds that hadn’t rolled in —they had simply been—now 
loomed, low and woolen, pressing down like a lid. 
He looked out across the shifting water, following the lines. Dozens of them, slack cords 
from bobbing traps that fanned outward like spokes on an unseen wheel, stretching into a 
single distant point. 
The fishermen had said it without saying it. 
Always there. Always full. Always in that spot. 
Auren tied the boat’s rope around one wrist, more out of instinct than confidence. Then, he 
stood, pulled off his tunic, and let it drop. The wind prickled cold against his chest. His 
breath came slower now. 
He stepped to the edge. 
And he dove. 

The first seconds were silence. 
No splash, no bubbles —just descent. The chill seized his skin like a second skeleton, and 
the water blurred the world to hues of grey and blue and the dark green of unseen things. 
He opened his eyes. 
Below him, lines. Dozens of them. Curling, swaying, converging. 
Each fish trap line trailed deeper and deeper, no fish in sight now —only the ropes, sagging 
toward a shared gravity. 
He kicked, steady. His limbs had always been strong, if untrained. But this was no swim in a 
palace pond. The sea here was layered in cold, and the deeper he went, the harder it 
pulled. 
His ears ached. He tried to clear them. Equalize. But the pressure only pressed. 
Keep going. 
His lungs were still full, but already they knew. They whispered panic in small ways. A 
cramp behind the ribs. A pinch in his throat. 
Below, the lines vanished into a hazy blur. But he saw it. 
A circle. No —a well. 
A perfect ring of stone, maybe ten feet wide, embedded in the seafloor. Ancient, moss -
covered. Not ruins. Not broken. 
Just... waiting. 
He swam further. 
The ropes coiled around it like reverent hands. They didn’t go into the well. They ended just 
above it, floating like offerings. 
And suddenly, the instinct hit. 
Turn back. 
His body screamed it —not a thought, not a fear, but a command . His lungs were burning 
now. Not a metaphor. Burning. He could feel the last air thrumming in his chest like a drum 
stretched too tight. 
If he swam now, now, he could reach the surface. Maybe. 
But that wasn’t the question. 

The question was the well. 
The question was: Was it worth dying for? 
He hovered above the ring, arms and legs trembling, the world narrowing. 
No one would blame you. 
No one would know. 
No one could follow this far. 
His vision blurred. His chest spasmed once, hard. A spark of panic cut through the fog. 
He reached out a hand — 
And let himself drift lower. 
Toward the dark circle. 
Toward the choice. 
Toward the point of no return. 

CHAPTER 7: The Ember and the Drowned Room 
The sea pressed in on all sides —black, endless, alive. 
Auren hovered just above the seafloor, lungs aching, legs trembling with exhaustion. The 
tangle of trap lines had vanished behind him, lost in the dark above. There was no more 
rope. No more guide. Only this. 
The Well. 
It yawned beneath him —a perfect circle of carved stone, older than reason, rimmed in 
threads of glowing algae that pulsed like veins. No current stirred its depths. No fish strayed 
near. It was not a hole in the sea, but a wound —waiting. 
He felt it before he understood it: a kind of gravity that wasn’t physical. A pull that spoke not 
to the body, but to something beneath the body. A calling. 
Auren’s chest spasmed. He had seconds, maybe less. 
He looked up —darkness. 
He looked down —into the Well. 

There would be no swimming back. 
One path was certain death. 
The other might be worse. 
But he had come this far. 
He kicked once. 
And let the sea take him in. 
— 
Silence. 
Then motion —sideways, backwards, inside-out. 
Auren couldn’t tell if he was falling or flying or folding. Water roared and disappeared all at 
once, his lungs flaring in panic —and then, without warning, there was air. 
He gasped and coughed, sprawling forward. Beneath him was stone. Dry, cold stone. His 
fingers scrabbled over it. His knees hit wood. He blinked and found himself on the floor of a 
room. 
Not underwater. Not dead. 
A room. 
It was small, windowless, crooked. The walls leaned slightly inward, as if bowed by 
pressure or age. A warped table stood in one corner, a single chair beside it. Dust floated in 
the warm air, and directly ahead of him: a hearth. 
A fire crackled softly inside. 
He staggered to his feet. Everything felt tilted, like the world had been spun and set down 
wrong. His ears rang with the absence of the sea. 
The hearth burned steady, the only sound in the room besides his own breath. But 
something was off. Auren stepped closer. 
Within the flames sat an ember that wasn’t like the others. 
It was shaped like a shard of obsidian —only it glowed with a pulse, as if breathing. Red -
gold light flickered from its edges, each pulse stronger than the last. It didn’t burn. It 
radiated. 
He should have hesitated. Should have questioned. 
But all he could feel was a strange recognition . Like it had been waiting. 

Auren pulled the edge of his damp tunic over his hand and reached into the fire. 
The heat should’ve seared him. But it didn’t. The moment his fingers closed around the 
shard, everything changed. 
A surge tore through him —sight, sound, sensation. A city crumbling, rebuilding, vanishing. 
A thousand bells ringing out at once. A pattern unseen, suddenly seen. 
He fell to his knees. 
The shard, now in his palm, cooled as he watched. Red faded to gold, then to deep, glossy 
black. Perfectly smooth. Silent. 
Behind him, the room groaned. 
The chair toppled. The table split down the center. Water burst through the cracks between 
the floorboards, gushing up from beneath. The windows screamed open —though they 
hadn’t been there a moment before —and torrents of seawater came rushing in. 
Auren spun. The hearth exploded outward, bricks scattering. The ceiling bowed. Water 
poured from above. 
He was trapped. 
Within seconds, he was waist -deep. Then chest. The door was gone. The fire was gone. 
Only the shard remained, clenched in his hand, warm and alive. 
He held it tight, squeezed his eyes shut, and took one last breath before the room filled 
completely. 
— 
Light. 
He coughed, choked, rolled onto his side. 
He was on the beach. 
Warm sand shifted beneath him, sunlight pressing against his face. The surf lapped at his 
boots—gentle, rhythmic. Gulls called faintly overhead. 
He gasped and sat upright. 
The sky was blue. Clear. The storm —gone. The waters that had swallowed him were calm 
now, glittering under the sun. 
And Virelay —Virelay stood still. 

The harbor was no longer shrouded in flicker or fog. Its buildings stayed put. Its rooftops 
held shape. The city wasn’t healed, not fully —but it had settled. As if time, for the moment, 
had agreed to flow in just one direction. 
Auren looked down. 
The shard sat in his palm, dark and cool. Silent now. But full of something he couldn’t 
name. 
He smiled, just a little. 
“…Master -at-Arms—Edran,” he whispered hoarsely. “You’d never believe it.” 
And then, without fanfare or flourish, he stood. 
The wind shifted. Somewhere in the distance, a bell rang once —soft and low. 
Auren turned toward the town. 
The tide had gone out. 
And the way was clear.',
        6035,
        admin_id,
        'pending_review',
        false,
        30,
        ARRAY['pending', 'needs-review']
    );

    -- The Ballad of Rook and Myx
    INSERT INTO public.stories (
        title,
        slug,
        summary,
        content,
        content_text,
        word_count,
        author_id,
        canon_status,
        is_published,
        reading_time_minutes,
        tags
    ) VALUES (
        'The Ballad of Rook and Myx',
        'the-ballad-of-rook-and-myx',
        'CHAPTER 1 — Play the Game or Play the Player 
Dusk rolled across the hills like a wolf deciding which sheep to kill first. 
The town of Varnhalt —if you could call it a town —was little more than a cluster of stone 
huts, wood planks, and stubborn people who hadn’t yet been burned, buried, or bought. It 
sat hunched against the shoulder of a cliffside, where the wind howled like it had bad news 
and nowhere to be. 
Myx lay in the dirt outside the tavern, watching the day exhale. A rusted...',
        '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Full story content in content_text field."}]}]}'::jsonb,
        'Prologue: The Fold Beneath 
The Pattern was not the first thing to exist. It was simply the first thing that stuck. 
A moment of order bold enough to resist the drift. 
But beneath every map is an erasure. And beneath every song, a silence that shaped it. 
The Everloop did not erase the chaos —it only covered it. 
What came before the Weaving did not vanish. 
It folded. 
Deep under the seams of the world —beneath soil, below sea, behind time —something 
else remained: The Fold. 
A place without shape or sequence. Not before, not after. Only between . Where discarded 
possibilities gather like dust in a closed book. 
The Fold is not evil. It is not alive. But it listens. And sometimes, it answers. 
Each time a Shard is unearthed —each time a thread is touched or plucked or broken — 
the Fold stirs. Not with vengeance. Not with purpose. 
Only with memory. 
There are those who dream the Fold. There are those who fall into it. And there are those 
who walk its edge — unaware, unprepared, undone. 
The Vaultkeepers once believed that everything could be remembered. 
That history was a circle. That nothing truly ended. 
But even they now whisper of things not written in any loop. Things that came before the 
First Map. Before the First Architects. 
Before the Pattern itself. 
Some say the Fray is not a failure of the weave — but its awakening. 
That the world was never meant to be held so tightly. 
And that the Fold waits not to devour us... 
…but to set us free. 
The Shards are calling. 
The Everloop is thinning. 
The Fold remembers. 
And somewhere, just beyond the edge of memory — 
the Prime Beings turn in their sleep. 

CHAPTER 1 — Play the Game or Play the Player 
Dusk rolled across the hills like a wolf deciding which sheep to kill first. 
The town of Varnhalt —if you could call it a town —was little more than a cluster of stone 
huts, wood planks, and stubborn people who hadn’t yet been burned, buried, or bought. It 
sat hunched against the shoulder of a cliffside, where the wind howled like it had bad news 
and nowhere to be. 
Myx lay in the dirt outside the tavern, watching the day exhale. A rusted anvil’s throw away, 
a blacksmith swore at a bent horseshoe. A goat bleated, got kicked, and bleated again. Two 
children ran screaming down the road —one chasing the other with what might have been a 
dead snake. Maybe not dead. 
The barbershop, tavern, and jail all shared the same crooked roof. A man walked in with 
three teeth and came out with two. Someone cheered. Probably not the man. 
What a place to rot, Myx thought, curling his long tail tighter around his haunches. His ears 
flicked toward the sound of someone vomiting behind the stable. Civilization. 
He licked his paw, slowly. Deliberately. Like a noble judging a bad wine. He had dust in his 
fur. Fleas too, probably. One of them was named Percy. Myx had decided to let him stay. 
Percy didn’t bite much, and he kept to himself. 
His amber eyes scanned the street again. Smoke. Boots. Harsh hands. Quiet knives. 
This was not a town that made room for softness. 
And Myx, bless his soul, was soft. Not weak. Not fragile. Just... made of loyalty and thick fur 
and deep sighs. Which made him an anomaly , in a place like this. Not that anyone here 
knew what the word anomaly meant. 
He narrowed his eyes toward the front door of the tavern. 

Inside, the tavern’s only light came from the hearth and a crooked lantern strung low above 
the card table, where five rough men hunched over a game of Everloop —a local vice that 
ruined wages and friendships in equal measure. 
“Wasn’t there yesterday,” said Dorn, the broad -shouldered smith, voice low. “Whole bloody 
ridge was bare. Now it’s there. Black stone. Tall as three steeples.” 
“Things are drawn to it,” said Vett, tapping a finger against his mug. “Birds. Flies. Even the 
wind. Like it’s got a pull.” 

“Or a prize,” muttered Marlo, bald with burn -scabbed hands. “Something worth guarding. 
Or stealing.” 
Rook had said nothing then. He’d only sipped his drink and listened, eyes fixed not on the 
fire, but on the reflection of the table in his cup. 
Now, the talk was cards. 

The game was Everloop , played with a single spiral board and a deck of ninety cards —
Score cards, Modifiers, and the dreaded FRAY setups. The goal was simple in theory: reach 
a high Personal Score when the shared Table Score hit exactly 100. 
In practice? It was anything but simple. 
Players formed loops with Score cards —+6 Boar Totem, +3 Fang Sigil —and used Modifiers 
to reverse, double, or share those scores through forced alliances. A loop might help you. It 
might help your enemy. The best players didn’t just play their hand. They pl ayed the end of 
the game. 
And in Everloop, the end could be snatched away at any time —especially when someone 
marked a FRAY. 
Rook slouched like a man fading from luck. Three cards left. One spun lazily between two 
fingers. His grin was crooked, his jacket only half -buttoned, and his boots had once been 
handsome. He looked like someone who got lucky just often enough to be danger ous. 
He’s up to something, Myx thought from outside. He always is. He looks broke, which 
means he’s about to take everything. 
“Tough hand?” Dorn asked, dropping a +6 Boar Totem card with a red chip beside it —an 
aggressive power play that pushed both his score and the Table Score closer to 100. 
“Should’ve quit while you were ahead.” 
Rook sighed. “ Apparently I don’t do smart things after dusk.” 
Or before, Myx thought. Or when sober. Or hungry. Or conscious. 
Vett leaned in next, slapping down a Loop Chain Modifier with a +3 Fang Sigil —
piggybacking onto Dorn’s power and chaining their scores together. 
Rook’s eyes narrowed. “Adorable. But if I were Dorn” —he gestured lazily —“I’d be 
wondering why Vett suddenly wants to share a score. The man’s idea of partnership usually 
ends in stabbing.” 

Dorn didn’t blink. 
Rook turned to Marlo. “Marlo. You’ve got a Crown Inverse in-hand—I saw the edge when 
you drew. Use it. Flip the table’s gain to your own without helping them. Do that, and we all 
walk out with coin.” 
Marlo shrugged. “Nah. Let’s see you sweat.” 
He dropped a plain +4 Spiral Tail . No modifier. No disruption. 
Of course, Myx thought. Why prevent disaster when you can make it worse? 
Moves snapped into place. The Table Score surged past 88. Right into dangerous territory. 
Everyone paused. No one marked a Fray —at least, no one had claimed to. 
Rook’s stack collapsed. Two of his chips were gone. One of his tokens slid to Dorn. Vett 
laughed, slow and wheezy. 
Rook stared at the board. Then casually, he laid two facedown cards in front of him. 
“I mark the Fray.” 
Vett frowned. “Now? Bit late, don’t you think?” 
Rook flipped one card: a +6. 
“Targets space 66. Last round. You boys skipped over it.” 
He flipped the second card: Fractured Crown . 
“Modifier card. Legal FRAY setup.” 
Groans. Swearing. 
“You had a Fray set on sixty -six?” Marlo snapped. “That was two rounds ago!” 
“Correct,” said Rook, flipping his remaining card —a Low Spiral , once discarded, now 
reclaimed. 
“I just didn’t feel like wasting it until now.” 
The room went still. 
FRAYs, once triggered, voided everything . All cards played the round they triggered were 
discarded. All score gains? Gone. The Loop Totem reset to where it was before the round 
began. 
“You bastard,” Dorn growled. 

“Guilty,” Rook said brightly. “Never met my dad, but I hear he had excellent taste in bad 
decisions.” 
He swept up a modest pile of tokens, stood, and raised his empty cup. 
“You can play your cards. You can play the table. Or you can just let eager men play 
themselves.” 
He smiled. 
Then added: 
“Though I do thank you both for being such eager fools.” 
He said it, Myx thought. He always says it right before it goes bad. 
Dorn shoved his chair back with a crash. 
Vett slammed his hand down, hard enough to rattle the tiles. 
“Cheating little rat,” he hissed, rising to his feet. 
Chairs scraped. Voices rose. Someone reached for a knife. 
The tavern door creaked open. 
Myx stepped inside. 
Not fast. Not loud. 
Just present. 
His fur bristled. His stance was wide. He didn’t snarl —but he made the idea of snarling feel 
very, very close. 
He looked like a cross between a leopard and a dog —sleek, muscular, silent. Big enough to 
tear a man apart if he wanted to. 
A Servine wasn’t common in these parts. Most people had never seen one in the flesh. And 
from the looks on their faces, they didn’t know what he was. 
They just knew what he looked like. 
What they didn’t know —what Myx counted on them not knowing —was that Servines were 
the most loyal, affectionate, absurdly sweet animals ever bred. 
He just happened to be very good at pretending otherwise. 
Everyone froze. 

Vett muttered “What is that thing ?” 
Rook stepped backward with a smile like a man leaving a dinner party he hadn’t been 
invited to. 
“Gentlemen,” he said cheerfully. “It’s been educational.” 
Then he slipped out the door. 
Myx followed. But not before grabbing a half -cooked sausage off the counter. 
Hazard pay. 

They walked through the night air, boots and paws quiet on the dirt path. Varnhalt shrank 
behind them like a bad decision finally forgotten. 
“You had to say it,” Rook muttered, rubbing his jaw at the thought of the pummeling he did 
not receive. 
Myx didn’t respond. 
He never did. 
But in the quiet between their footfalls, the thought landed anyway: 
You always say it. And I clean it up. 
Rook chuckled under his breath. “Details.” 
They walked a while in silence, boots crunching over frost -bitten dirt and brittle leaves, the 
tavern’s noise long behind them. The trees here seemed less like scenery and more like 
witnesses. Watching. Listening. One of them creaked with no wind to justif y it. 
“You heard what they said, right?” Rook finally asked, eyes scanning the trees. “At the 
table?” 
“The drunk one, or the … drunker one? ” Myx thought 
Rook adjusted the strap of his pack. “Yeah,” he said after a moment. “ You heard.” 
The tower. The thing out east. A story half -told through slurred words and darting eyes. 
Black stone. No doors. A place the locals didn’t go near, but couldn’t quite stay away from 
either. 
Rook glanced at the horizon. “Could be nothing.” 

Myx growled, low and noncommittal. “Could be Frayed. Could be worse.” 
Rook squinted into the distance, where the hills began to dip and shadow. A jagged 
silhouette had begun to emerge, sharp against the dying light. Too symmetrical for a cliff. 
Too smooth for a ruin. 
“Now that,” he said, shading his eyes with one hand, “is exactly the kind of thing you 
chase.” 
Myx’s ears twitched, nose tilted to the wind. It moved oddly here —curling back on itself, 
folding in ways it shouldn’t. 
That’s the kind of thing that gets you killed. 
Rook smiled, just a little. “ Don’t worry pal ... so long as we ’re together …” 
He reached down and ruffled the fur between Myx’s ears. Myx leaned away, but only half -
heartedly. 
“I’m going to look, you know,” Rook added. 
I know. 
“and you’re coming ” 
Obviously. 
They stood there a moment longer, man and Servine, bathed in silver moonlight and the 
quiet promise of something wrong. 
Then Rook took a step forward. 
Myx followed. 
Because that was the rhythm of them. 
He walks into trouble. I walk him out. 
And sometimes, just sometimes — 
We meet something worse than trouble. 

CHAPTER 2 – Bone and Thread 
The alley was dark, wet with oil and old blood. Somewhere, a butcher’s hook clanged in the 
wind. Somewhere, a child cried —sharp and quick —then stopped. 
Rook didn’t look up. 
His fingers scraped over gravel, frost, and rot. He knew the smell of meat too old for coin. 
Knew the shape of hunger deep in his belly —not pain anymore, just a dull heat that made 
his limbs feel thin. 
There. Gleaming in the filth —a bone. Turkey, maybe. Still had tendon clinging to one end. 
He moved toward it. 
A low huff stopped him. 
Rook froze. Glanced sideways. 
Green eyes stared back. 
No—amber. Or something between. Not glowing. Not monstrous. Just watching . At first he 
thought it was a strange dog. But the shape was wrong. Taller. Sleeker. Covered in soot and 
scrapes. The creature was crouched at the other end of the alley, ribs sharp under skin, 
head tilted slightly to one side. 
It didn’t growl. 
Didn’t flinch. 
It was waiting. 
Rook didn’t know why, but he broke the bone in half anyway. Tossed the smaller piece 
toward the creature. It landed just in front of its paws. 
The thing sniffed. Nudged it once with its nose. Then took it gently between its teeth and lay 
down to chew. 
Rook did the same. 
They sat like that in silence. Sharing the bone. Sharing the alley. Sharing the cold. 
After a while, the creature crept closer and curled up nearby. Not close enough to touch. 
Just near. 
Just there. 

That was how it began. 
No leash. No words. No trust, not yet. Just a broken meal on a broken night. 
In time, he would name the creature Myx. 
And Myx would never call him anything at all. 

They weren’t raised so much as not removed . They grew up like weeds through stone —
unwatered, unwanted, and impossible to kill. 
Alarook—Rook now, and forever —learned early how to pass for useful. How to soften his 
voice just right. How to smile like a question. How to make himself a reflection of what 
someone wanted to see. He didn’t have friends. He had audiences. 
And Myx… Myx learned him. 
The Servine didn’t speak, not in words. But Rook began to feel things. A nudge behind a 
thought. A quiet no when he reached for something too hot, too sharp, too risky. Not 
phrases. Not language. More like shapes, passed between them. 
It wasn’t telepathy. It wasn’t magic. 
It was understanding . 
Over time, Rook noticed other things. The way Myx’s eyes shifted. They were amber at 
dusk—lit like sap held to flame. In fear, they paled like frost. And once —just once —when 
they sat together beneath an overhang and Rook looked into his companion’s face wi th real 
gratitude, the Servine’s eyes turned the same pale gray as his own. 
Not a trick. 
A mirror. 
Later, he’d learn this was common to the Servine —not a camouflage, but a tether . Their 
eyes responded to the world around them: color in emotion, in memory, in trust. A 
spectrum of selfhood that changed moment to moment. 
That night, Rook had said aloud, “You see me.” 
And Myx stayed. 

They had their rhythm. 

Rook talked. Myx listened. 
Rook lied. Myx watched. 
Rook walked into trouble. Myx walked him out. 
It wasn’t loyalty. Not exactly. It was likeness. Two creatures shaped wrong by the world. 
Both clever. Both tender in places they shouldn’t be. Both wearing masks that kept the 
softest parts hidden. 
They didn’t talk about it —couldn’t—but they knew. 
They knew what it was to be seen as useful, but never safe. 
To be raised with no inheritance but instinct. 
To be punished for softness. 
To be told you were too much of the wrong thing, and not enough of anything else. 
So they stayed. 
Not out of duty. 
Because they didn’t owe anyone else. 

They wandered the fractured places. Always near the edge of something broken. Port 
towns, scavenger camps, Fray -warped borderlands. Wherever there was risk, there was 
opportunity —and Rook was very good at pretending he was more lucky than he was smart. 
Once, they worked a caravan that smuggled memory coins —tokens etched with someone 
else’s past, meant to be swallowed, sold, or stolen. 
Once, they posed as healers for two weeks just to sleep under a roof and steal clean water. 
Another time, Rook faked a noble lineage and nearly married into a vineyard estate by 
charming some princess named Thorne —sharp-tongued, well -read, and just curious 
enough to fall for someone who always knew the right lie to tell. She was kind, but caged. 
Too smart for her own nobility, too sheltered to recognize a con until it was halfway gone. 
The lie might’ve held, too, if Myx hadn’t knocked over a crate of silver and exposed their 
plot. 
They left that night in a rainstorm, three horses heavier and one kingdom lighter on scandal. 

They survived. They moved. They learned to feel the world’s seams. 

Rook got good at bluffing. Myx got good at knowing when he wasn’t bluffing. And between 
them, they followed the Fray like a fisherman follows birds. 
Not because they loved it. 
Because it was where things came loose. Where the rules cracked open just enough to let 
them in. 

One night, huddled under a slanted eave while the sky wept black rain, Rook whispered: 
“You ever wonder what it’d be like to stop?” 
Stop what? 
“All of it. The running. The taking. The pretending. Just… stop.” 
A pause. 
Then what would we be? 
He never answered. Because he didn’t know. 
But now—now there was a tower. 
And something in him felt it. 
Just there. 
On the edge of everything. 
Waiting. 

CHAPTER - 3 Opportunity at the F rayed Edge 
They saw the smoke before the people. 
Thin columns rising in odd intervals, curling in the still air like fingers beckoning. The smell 
that followed wasn’t fire, but wet stone, old metal, and something like memory. 
Then the ridge gave way. 
Below: a scatter of tents, lean -tos, and broken -wagon shelters —shanties cobbled together 
from tarps and driftwood, patched canvas and scavenged steel. A village not built, but 
accumulated. 
From a distance, it looked like chaos. But as Rook and Myx drew closer, a pattern emerged. 
The roads curved inward. The tents tilted. Everything leaned subtly toward one fixed point. 
The tower. 
It jutted from the earth like a blade. Smooth. Black. Seamless. It caught no light, cast no 
shadow, and gave no sound —but everything around it bent. 
Not physically. Psychologically. 
The people, the layout, the daily rhythms of life all seemed pulled toward the base of the 
tower—as if gravity had shifted, not by weight, but by will. 
Even Myx paused. His amber eyes narrowed, and the fur along his spine bristled. 
“It’s not just big,” Rook murmured. “It’s... centered .” 
And at that center, draped in silk and shade, sat Sera. 
No throne. No armor. No crown. 
Just a young woman barefoot on cushions, wrapped in soft layers and ringed by flowers 
that never wilted. People moved around her with the ease of ritual —eyes downcast, hands 
busy, minds hushed. 
She spoke softly and sparingly. She didn’t give orders. She suggested . 
And they obeyed. 

They were welcomed without question. 

No one asked who they were, or where they’d come from. It was enough that they had 
arrived. 
Sera nodded once from her pavilion, and a space was cleared beside the smithy’s tent. 
They were given blankets, water, a bowl of soup that tasted like thyme and woodsmoke. 
And so, Rook and Myx stayed. 

The first task was sweeping. 
Not for cleanliness —but to preserve the spiral ash -lines drawn into the dirt between tents. 
Rook was told, gently, to follow the curves. To not cross them. To keep them smooth. 
The second task was water. From the trough beside the tower’s base —its rim blackened by 
age or proximity —he ladled water into clay vessels for distribution. Only a few were 
permitted to touch that trough. Now, Rook was among them. 
Each task came with more proximity. To the tower. To the people. To her. 
And Rook changed. 
He stopped asking questions. He started listening more. 
He shared meals in silence. Sat beside the fire with children and taught them old caravan 
songs. Repaired bone -chimes outside the healer’s tent. Helped the old smith sort rusted 
tools. 
He smiled when she spoke. He stood when she approached. 
He called her Sera. 
Not the Center. 
Just Sera. 

Myx watched. 
At first, he assumed it was part of a plan. That Rook was baiting a trap, or mapping the 
structure of power. 
But as the days passed, that hope thinned. 

Rook no longer left the inner circle of camp at night. He no longer whispered jokes. He no 
longer touched the carved stone at his hip —the one from the old ruins, the one he always 
rubbed when thinking. 
Now, he sat cross -legged near her pavilion, listening to her hum melodies with no names. 

Sera noticed Myx’s distance. She never said it aloud, but Myx felt her attention press on 
him. 
One morning, she knelt beside him, scratching gently behind his ears. 
“You’re different,” she said. “Too sharp to be softened. But you will be. In time.” 
He pulled away. But she only smiled. 
That evening, she brought him a blanket warmed by coals. The next, a slab of marrowed 
bone. She never demanded affection. She offered it —quietly, unceasingly. 
And Myx, despite himself, began to sleep near the fire again. 
Because it was warm. 
Because it was quiet. 
Because Rook looked at peace. 

Some nights, Myx would wake to find Rook sitting alone just outside the pavilion, eyes fixed 
on the tower. 
No expression. No movement. 
Just watching. 
Like he was waiting for it to speak. 

Then came the night she told him. 
Under three pale moons, beside a fire that burned without wood, Sera leaned close. 
“They’ll come, Rook. From the wastes, from broken cities, from places the Pattern forgot. 
And I’ll give them what no one else can.” 
Her eyes glowed faintly in the firelight. 

“Stillness. Safety. A place where the Fray does not twist them.” 
She reached out, placed her hand lightly on his chest. 
“I’ll build it around me. A new kingdom. Not ruled. Anchored .” 
He didn’t flinch. 
“I understand,” he said. 
And Myx—watching from just beyond the firelight —lowered his head. 

Because Rook was gone. 
No winks. No plans. No lies whispered in the dark. 
Just soft obedience. 
And stillness. 
And the Center. 

 CHAPTER 4 – The Sun Never Bends This Way 
Each morning began the same. 
Rook rose to the bell’s low chime —its sound less a tone than a feeling, like the tug of tide in 
the belly—and emerged from his lean -to before the dew dried. The shanty town still 
crouched like it feared the light. He washed in silence, dressed in plain clo th, and received 
his task. 
There was always a task. Deliver this, fetch that, rebuild the fence, walk the grieving, carry 
the child, remind the forgetful. And always: return. 
To her. 
Sera sat at the center of the town''s orbit, near the foot of the tower —though never too 
close. Her tent was broad and heavy with silks stolen from other lifetimes. It smelled of 
myrrh and dust, a contradiction that suited her. Inside, she lounged among cus hions while 
the world staggered forward in ragged, frayed circles. 
Today, she handed Rook a scroll wrapped in thorny ribbon and said, “Take this to the 
stonemason. He’s forgotten his name again.” 
She didn’t ask if Rook knew the way. Of course he did. 

The villagers feared her —not for what she did, but for what she could undo. 
There had once been a woman named Tela, who spoke too freely, laughed too loud, 
questioned Sera’s decisions. One morning, Tela was asked —gently—to wait outside the 
circle. 
Just for a while. 
By nightfall, she was found sobbing beside the creek, her words eaten by fog. The villagers 
helped her back in. She doesn’t speak anymore. 
So when Sera waved her fingers in the air like brushing away a gnat and said, “You may go,” 
it wasn’t dismissal. 
It was exile. 
And when she said, “Come,” people didn’t just move. They obeyed. 
Rook obeyed. 

That afternoon, as the sun bent against the rim of the tower, Sera lounged on her cushions 
and flicked a hand lazily at Myx. 
“I think he should stop skulking behind you like a shadow,” she said. “He’s not your equal. 
He’s a pet.” 
She said it like a joke. But she wasn’t smiling. 
She reached for a golden collar inlaid with chipped gemstones. “Let’s see how he looks in 
this.” 
Rook did not blink. He took the collar. Turned it over in his hands. Then, slowly, he knelt and 
placed it around Myx’s neck. 
The clasp clicked. 
Myx didn’t move. Didn’t growl. Didn’t bite. 
So this is the shape of betrayal, he thought, eyes fixed on nothing. 
Later, outside, far from the camp’s light, he crouched by a thicket and scraped at the 
ground with dull claws. His eyes had changed. They were the color of faded slate —the 
dullest they''d ever been. 
Rook stood nearby, silent. 
Myx did not look at him. 
You made your move. I’ll make mine. 
Still silence. 
Or maybe I won’t. Maybe I’ll just watch and wait. Like you do. 
Rook said nothing. But he did not turn away. 

“She’s not cruel,” Sera said that night, reclining with a drink she hadn’t fetched herself. 
“She’s just tired. That’s what they whisper, don’t they? That I’ve forgotten how to care.” 
She ran a finger down Rook’s forearm. 
“I haven’t forgotten. I just stopped pretending it matters.” 
Rook sat beside her, posture relaxed, eyes unreadable. 
“The tower whispers to me,” she added softly. “Like it wants to open —but not yet. Not until 
the pattern is ready. Not until someone earns it.” 
She leaned close. 

“I think you’re the only one who understands what it means to be followed. To be depended 
on.” 
She smiled. “You stay. Everyone else... fears the wind.” 
“I’m here,” Rook said. 
And it was true. 
He was here. 
But he was not hers. 

That night, after the lights dimmed, Myx did not return to camp. 
He curled in the shadow of the tower, where the ground hummed with strange breath and 
time creaked in broken intervals. He watched the stars flicker out of rhythm. 
You’re here, he thought, but I don’t know where you went. 

CHAPTER 5 — The Mirror and the Mask 
The days had taken on a softness. Or perhaps the girl had. 
Rook—dutiful, smiling, endlessly resourceful —had become something of a right hand. Not 
just to her, but to the town. A mended wheelbarrow here. A clever shortcut through 
rationing lines there. Advice whispered just loud enough to be overheard by those it w as 
meant for. 
The girl—Sera, though no one said it without some hitch of reverence —had grown used to 
his presence. And worse, grown dependent on it. She never said it aloud. But in the stillness 
between her commands and his footsteps, there was a look. And when her gaze caught 
him idling, watching the frayed shimmer around the tower’s base with a distant stare, she 
would speak more softly. 
No one had ever disobeyed her with gentleness before. 
Myx lounged beneath a silk -draped awning, fed and pampered, his coat brushed to a mirror 
sheen. He did not look at Rook. Not when he passed. Not when their eyes might have met. 
His eyes—dull, cold, colorless as early ash —said everything. 
The girl had ordered him to be treated like a lap pet. And Rook, eyes full of apologies he 
never voiced, had obeyed. 
But not without cost. 

That night, the wine was sweeter than usual. Or perhaps her mood was. She wore her loose 
hair in waves and no crown of command. Just the scent of crushed pears and wind -blown 
herbs, and a dress of tattered red that flickered in the firelight like smoke. 
"You’re not like the others,” she murmured, reclining beside him on the couch she alone sat 
on without permission. “They worship. You observe.” 
Rook smiled. “They’ve had more time to practice.” 
She laughed —quick, bright, and human. 
“Do you ever miss it?” she asked. “Your life before all this?” 
His fingers curled around his cup. “Every day.” 
“But you stay.” 

“I want what everyone wants,” he said. “A way out. Not just of the town, or the Fray, or the 
hunger. Out of the endless chase.” 
She looked at him then, and her voice lowered. 
“I know where it leads.” 
Rook tilted his head, curious. 
“The tower,” she said. “The crack at its base. You’ve seen it.” 
He nodded. 
“It pulls at things. Not just the wind. Not just the Fray. It… lessens it. You feel it, don’t you?” 
“I do.” 
“There’s something down there,” she whispered. “Something ancient. Something true. The 
deeper you go, the more the world obeys. I’ve stood right at the edge, and for a moment, 
everything held still. No twist. No warping. It felt… real.” 
Her voice grew sharper, more alive. 
“We could build something there, Rook. You and I. A new order. This place —it could be a 
kingdom. That crack? It''s a gift. And we use it.” 
He frowned slightly. “Use it how?” 
She looked at him like it was obvious. “We place our rule at its center. The closer you are, 
the safer you feel. The further out, the more the Fray claws at you. People will do anything to 
be close. To belong.” 
Her hand brushed his. “You and I… we could be the calm in the storm. The ones who 
choose who gets peace. Who earns it. Who doesn’t.” 
She leaned in just slightly, the fire painting gold across her cheek. “We don’t need armies,” 
she said. “We have fear. We don’t need gold —we have stability. And the story we tell them? 
That only we can hold the Fray at bay.” 
Her eyes softened. “I want you beside me. Not just now. Always. There’s no one else I’d 
trust to rule with me.” 
Silence. 
Then Rook said, softly, “My mother left me when I was five.” 
That quieted her. 

He stared into the fire, eyes unmoving. “Not because she didn’t love me. Not because she 
wanted to. Because the man who ruled our village —the one who called himself Protector —
had taxed the grain, the medicine, the breath out of the people. She sold her blo od for coin, 
and when that wasn’t enough, she sold her silence. But I was a debt she couldn’t pay.” 
His hand drifted to the cup in his lap, but he didn’t lift it. 
“She left me behind a butcher’s tent with a note sewn into my coat: Take him somewhere 
kind.” 
He looked at her then. 
“She thought the world might still have a place like that.” 
Her voice trembled. “Rook…” 
“I never saw her again. But I saw him —the ‘Protector.’ Living fat and adored behind broken 
walls. People bowed to him the same way they bow to you.” 
He stood now, slowly. 
“And now here I am, being asked to help build it all again. A place where peace is just a 
leash with softer edges.” 
She stared at him. “Is that what you think I am?” 
“I think you were tired of being no one. And now that you’re someone, you can''t imagine 
going back.” 
Her eyes sharpened, voice rising. “You think I need them? These sheep? I could have any 
one of them dragged into the square and broken, just for looking at me the wrong way.” 
“You already do,” he said quietly. 
She stood. “They fear me because I’ve given them something to lose. Order. Shelter. That’s 
power, Rook. That’s what they really want.” 
“And what do you want?” 
She stared at him, trembling. “You. With me. At the center. Of a world that finally makes 
sense.” 
Rook looked away, as if something in the fire hurt his eyes. 
“I wanted an easy life too,” he said. “To stop running. To stop scrambling. To lay down and 
breathe.” 

She softened slightly. 
“But not like this.” 
He turned back to her. 
“Not by turning people into pawns. Not by building safety on servitude. That’s the work of 
tyrants. And I’ve lived too long in their world to become one myself.” 
Her face twisted —rage and heartbreak colliding. “You bastard. You —you lied to me. ” 
“No,” he said. “You believed what you wanted.” 
She stepped back. “I’ll destroy you. I’ll raise the town against you. I’ll have them tear you 
apart.” 
“You won’t need to.” 
The flap opened behind him. 
Dozens of villagers stood outside. Silent. Watching. 
“You’re not the only one who knows how to tell a story,” Rook said. “I’ve been telling one 
too. Every day. To them.” 
The girl spun, panic rising. “They’ll never believe —” 
“They already do.” 
Her voice cracked. “I loved you.” 
Rook’s voice was quieter than before. “I know.” 
Behind them, villagers began moving toward the tower. Toward the crack. Toward the truth. 
The silken tent came down with one great pull. 
Cushions ripped. Drapes collapsed. Her throne splintered. She stood exposed —trembling 
and small. 
And they dragged her, stunned and silent, into the dust. 

Myx rose at last from his perch, stretching with a slow yawn. His eyes —deep green now —
glinted in the firelight. He padded toward Rook slowly, deliberately. There was no hesitation 
in his steps. Almost like he’d known this moment would come. 

When he stopped in front of Rook, he sat down, straight -backed, head tilted slightly 
upward—offering his neck. 
The soft leather collar, too fine for a creature like him, sat snugly around his throat. 
Rook crouched and undid the buckle with gentle fingers. He let the collar fall to the earth. 
For a moment, neither moved. 
Then Myx blinked slowly. 
Finally. 
Rook scratched behind his ears, his voice low. 
“She wanted peace,” he said. “But not for everyone.” 
Myx’s tail gave a slow flick. 
You broke the spell. 
Rook stood, watching the villagers begin to form a new circle —this time not around a 
throne, but around the base of the tower. 
“No,” he said. “I reminded them they were already awake.” 

CHAPTER 6: The Roar and the Rift 
Screams. Shouts. A crash of wood on stone. 
The town had become a riot of movement and fury. Shimmering mirages of the same 
people flickered two steps behind them, the Fray stuttering time in erratic bursts. One 
moment a man lunged with a raised pitchfork; the next, he stood dumbfounded, staring at 
blood on his hands he hadn’t yet spilled. Or already had. 
The cause of it all —Sera—was curled on the ground beside the cracked tower, sobbing, 
face hidden in her tangled hair. 
And Rook? 
Rook was in the middle of it, arms outstretched, voice raised above the madness, trying to 
undo a tide he’d helped set in motion. 
“Stop! Stop!” he shouted, but they weren’t listening. Or couldn’t. Half the villagers were 
caught in loops of rage, the others in echoes of confusion, their emotions churned by the 
Fray like leaves in a windstorm. 
This wasn’t the plan. He’d meant to show them the lie. Pull back the curtain. Not —not—
leave her broken in the middle of it all, a girl surrounded by sharpened tools and boiling 
grief. 
And then — 
A sound shattered the world. 
A roar—not animal, not entirely —but ancient, raw, and vibrating with such force that the 
stones themselves seemed to flinch. 
Every head turned. Every foot froze. 
Even the Fray seemed to still, as if frightened of the sound’s source. 
There, standing between the chaos and the girl, was Myx. The Servine’s paws planted firm. 
His fur bristled. His eyes —those shifting, luminous eyes —were pitch black ringed with 
gold, like the moment before a solar eclipse. 
The silence that followed was thick and reverent. 
Rook coughed. “Subtle, as always.” 
Myx didn’t move, didn’t respond —not aloud. But Rook felt the intent: That was the quietest 
option. 

Rook walked forward, slowly. “Look at yourselves,” he said, his voice hoarse. “You’re not 
monsters. You were scared. Lied to, yes —but not powerless. Not like her.” 
He gestured toward Sera, who hadn’t moved from the dirt. “She wasn’t born cruel. She was 
just… tired. Tired of hunger. Tired of being used. And when people gave her power, it twisted 
into something she thought looked like safety.” 
“She lied,” a man said. 
“Yes,” Rook replied. “She did.” 
“She made us work, day and night, made us beg to stay near the tower.” 
Rook nodded. “And still she was alone.” 
The crowd shifted uneasily. 
“She had you all doing what she wanted, and yet she was hollow,” Rook continued. 
“Because power over others doesn''t fill the void. It echoes in it.” 
Sera let out a strangled cry. Not dramatic —just small and broken. She lifted her head, her 
face blotched and swollen. “I just —” she hiccupped. “I just didn’t want to be nothing 
again.” 
A woman —one of the elders —stepped forward and knelt beside Sera. She didn’t speak, 
just placed a weathered hand on the girl’s shoulder. Another villager followed, then 
another. One offered a scrap of cloth. Another simply stood nearby, arms crossed but eye s 
soft. 
The mob dissolved. In its place: people. People breathing heavily, blinking like they’d just 
woken from a fevered dream. 
Rook let out a breath he hadn’t realized he was holding. “Well,” he muttered, “that’s one 
way to end a coup.” 
She’s still crying. 
Myx’s thought brushed against him, quieter now. But not for show this time. 
“No,” Rook agreed. “That’s the sound of someone who got everything they wanted and still 
lost.” 
The silence that followed wasn’t awkward. It was… watchful. Because now, with the 
shouting gone and Sera no longer a tyrant, they all became aware of the thing looming over 
them. 
The tower. 

A lean, looming wound against the sky, humming faintly at its base where a thin fracture 
glowed like dying embers. 
As one, the townspeople turned to look at it. 
Then they turned to Rook. 
He threw up his hands. “Don’t look at me. I only conspire to topple regimes, not reality.” 
Sera stood, slowly. Her legs shook, but she didn’t fall. “When I first found the tower,” she 
said, voice raw, “there was already a crack in it. Just a sliver. Barely a line.” 
They all listened, rapt. 
“The closer I got to it, the less the Fray affected me. I could think. Sleep. Remember. It 
made everything quieter.” 
She swallowed hard. “I thought… I thought maybe I could keep it. Use it. Just until I figured 
things out. Then maybe I’d share it. But I got used to people needing me. That’s on me. I’m 
sorry.” 
A beat passed. 
“But now that we all know,” she said, turning to the fracture, “we need to use it.” 
Murmurs rippled through the crowd. Even Myx gave a low, uncertain growl. 
Rook squinted. “Use it how, exactly?” 
Sera turned, eyes wide —not manic, but focused. “To destroy the tower.” 
That was not what anyone expected. 
“What?” someone hissed. 
“Wait, wait —what?” Rook echoed. 
Sera nodded. “There was a story. A tale from the Borderlands. A town worse than this. 
People living backward. Babies born old. Rain that fell up. They said it started after 
something appeared —a black tree with bells on every branch.” 
Rook blinked. Slowly. “You think this” —he pointed at the crackling spire —“is the bell tree?” 
“I think it’s like it,” Sera said. “Or maybe this is just the next shape it takes. They said the 
tree rang without wind. The bells pulled the Fray to it like a whirlpool.” 
The villagers watched her, breath held, caught in the strange current of her story. 

“But the people of that town,” she went on, “they found a way to make the tree collapse on 
itself. No fire. No blades. Just pressure. Cracks. A shattering from the inside. And when it 
fell, the Fray disappeared. The town stopped flickering. Time went back to normal.” 
She gestured to the tower. “This is our black tree. And we can do the same.” 
The crowd wavered —caught between hope and fear, logic and desperation. 
Rook turned to Myx. 
Has she learned nothing? 
Apparently just enough to be dangerous. 
A long pause settled over them. 
That was when Rook felt it. That creeping, inescapable sense. 
Responsibility. 
He and Myx had stirred this hornet’s nest. Pulled off the blindfold. Sparked the chain 
reaction. And now — 
He glanced around. 
Everyone was looking at them. 
Every single villager. Even Sera. Wide -eyed. Expectant. 
Myx sighed through his nose. His eyes —an unsettled mix of steel and green —met Rook’s. 
Too late. 
Rook ran a hand down his face. “Right,” he muttered, “let’s go knock over a tower, shall 
we?” 

CHAPTER 7 - "Pull, You Imbeciles!" 
It began with rope. 
Rook stood atop a barrel, shirt half -open, hair windswept (or at least ruffled by some 
particularly opinionated breeze), and declared with a finger pointed at the sky: 
“We bring it down today!” 
Behind him, thirty confused villagers squinted up at the looming black tower that pulsed 
faintly in the light. A great chain of ropes —borrowed, stolen, braided together from 
everything from tow lines to laundry cords —wrapped around the base of the obsidian spire. 
“Pull!” Rook shouted. 
They pulled. 
Nothing happened. 
Someone slipped. Someone else broke a sandal. One man claimed he heard the tower 
whisper an insult and went home crying. 
Myx sat a short distance away, tail flicking in a pattern that suggested the Servine 
equivalent of you absolute fools. 

The next attempt was fire. 
Rook’s theory was simple: “If it’s tall, mysterious, and black —it’s probably flammable.” 
Myx disagreed through narrowed, flickering eyes. Amber one moment. Slate -gray the next. 
The kind of color change that suggested deep internal shame by association. 
Rook lit the base with every flammable thing he could find: hay, oil, old shoes, an angry 
letter Sera had written him three nights ago. 
It smoldered. 
Then it sputtered. 
Then it produced a disappointing pop like a wet fart in the rain and went out. 

Then came the Hammer Phase. 
No one talks about the Hammer Phase. 

Rook refused to use anything metal (“The tower eats metal, I’m sure of it”) so he had the 
villagers carve massive wooden hammers. Myx, in a rare act of silent protest, climbed on 
top of one and refused to move. 
It took three hours to get him down. 
When the hammers shattered on impact like brittle kindling, Rook simply rubbed his chin 
and nodded sagely. 
“New plan.” 

Sera watched all of this with a kind of glassy detachment. 
She still liked Rook. Sort of. Probably. 
But she had also seen him spend two days organizing a “siege choir,” convinced that the 
right harmony might destabilize the tower’s frequency. 
They sang in F -sharp for six hours. The only thing destabilized was everyone’s patience. 
“What did I ever see in him?” Sera muttered into her tea, before sighing at how quickly she 
still smiled when he grinned at her. 

That night, Rook sat beside the fire with Myx curled near his feet, fur twitching with half -
formed dreams. The tower loomed in the distance, impossibly still. 
The village had gone quiet. 
“I’ve been going about this all wrong,” Rook whispered to no one. 
His fingers played with a bit of rope —remnant of the day’s first disaster. He stared at the 
tower and then past it, into the place where the air shimmered wrong and the edges of 
things bent like glass under pressure. 
The Fray. 
“Everything I’ve tried… it’s too real,” he said softly. “The Fray doesn’t obey real. It chews it. 
Warps it. Laughs at it.” 
He looked at Myx, who didn’t stir. 
“So maybe the answer’s not brute force. Maybe the answer’s… more Fray. Bring the 
madness to the tower. Let it turn on itself.” 

Rook smiled. 
“Now that’s something I could believe in.” 

In the morning, he found Sera packing dried fruit into small bundles. 
“I need your help,” he said, all business. 
She narrowed her eyes. 
“If this is about the trebuchet again —” 
“No! No more wood -based nonsense.” 
He explained his theory. That the tower repelled the Fray for a reason. That the Fracture 
might be a seam —a weakness. That maybe, just maybe, the Fray wanted in. And they 
needed to find a way to bring it. 
Sera frowned. “But how would we do that?” 
They sat together all morning, throwing out ideas. Mirrors. Echo chambers. Musical chaos. 
Hallucinogens (“Absolutely not,” Sera snapped). They came up empty. 
But not everyone was empty. 

That evening, Myx sat alone by the edge of camp, eyes turned to violet —the color of dusk, 
the color of quiet decision. 
He could feel it now. That thing humming in his chest. That capacity. That burden. That 
difference. 
He was Servine. 
He held things. Held them in his eyes, in his body. The emotions, the pulses of the world, 
the truths people didn''t want to speak aloud. He absorbed them. It’s what made his kind so 
loyal, so gentle. 
And why it hurt so much when they were betrayed. 
He could feel the Fray just beyond the tower’s reach. He could feel it whispering, not in 
words, but in pulls. In loops. In unraveling possibilities. 
And he knew what had to be done. 

He stood, slow and steady. No one noticed. 
He walked. 

The sky cracked with the last of sunset, and night poured in like spilled ink. 
Myx crossed the invisible line where the tower’s protection faded. The ground shifted under 
his paws, too soft, then too hard. Shapes flickered at the edge of vision. A bird flew 
backwards. A rock blinked. 
He walked farther. 
His thoughts began to unravel. Not fall apart —loop. Repeating. Over and over, the same 
mantra, the only thread left in his fading clarity: 
Go further. 
Let it take you. 
Walk to the edge of reality itself. 
Then run back. 
Run like you’ve never run before. 
Push it into the fracture before it fades… 
Go further. 
Let it take you... 
His paws stumbled. The stars above him swam like fish. He lost track of direction. He 
smelled memories. Tasted dreams. Heard Rook’s laughter echoing in places it had never 
been. 
And then, at the very edge of sense — 
The Fray touched him. 
His eyes, unseen in the dark, flared a color no word had ever described. 

CHAPTER 8 – The Beast They Wanted 
They named him nothing. 
In the pit, names were weaknesses. Names belonged to pets, to children, to creatures 
worth remembering. Myx was born beneath stone and firelight, one of five in a litter pulled 
squirming from his mother before their eyes had even opened. 
There were five of them. One mother. Five kits. Myx was the smallest. 
They called it training. 
What they meant was violence. 
They beat them into snarling. Starved them into obedience. Fed them only after blood was 
drawn—any blood, didn’t matter whose. The strong were given scraps. The weak were 
made an example. The ones who refused to fight were dragged out by their throats, 
screaming or silent, and returned broken. 
Myx didn’t snarl. 
Not at first. 
Not even when they jabbed him with hot iron or kicked him until his ribs gave. Not when 
they threw his brother in and demanded one of them come out bleeding. 
He didn’t snarl. 
So they starved him longer. Let the others eat. Let him watch. 
He grew slow. His limbs too long for the cage, his eyes too dim to change. He didn’t bare his 
fangs. He didn’t lunge. 
One night, they threw his sister in. 
Amber eyes. Quivering frame. The same scars. 
She looked at him like she knew him. 
And then she attacked. 
They fought. 
Because the men screamed for it. 
Because they hadn’t eaten in days. 
Because neither of them could remember what not fighting looked like. 

She bled. 
He bled more. 
She didn’t snarl either. 
That was a mistake. 
The next morning, they took her away. 
He never saw her again. 

They didn’t kill him. They threw him out. 
Too weak. Too soft. Too dull. 
They left him near a drainage tunnel, half -dead and twitching. A bag of fur and bone that 
wouldn’t die fast enough. 
But something inside him moved. 
A crawl, not a fight. 
He didn’t want to die. He just didn’t know what living meant. 

The city was worse. 
At least in the pit, there was a reason for the pain. 
Here, there was none. 
Here, it came for sport. For boredom. For cruelty’s own sake. 
He scrounged what he could —from carts, from bins, from bones half -gnawed by dogs 
larger than him. He didn’t speak. Couldn’t beg. His tongue was too thick, his voice too 
alien. He hadn’t been taught to plead. 
He slept where shadows gathered. Under crates. Behind broken chimneys. Inside barrels 
that stank of vinegar and blood. 
At night, he dreamed of the pit. 
During the day, he tried not to. 

He saw others like him —broken things, limping things, hollowed -out husks too slow to hide 
and too stubborn to die. 
He stayed away. No one shared here. 
There were nights when he stared too long at children walking past with meat pies. Nights 
when he thought: Just a bite. Just a leg. Just enough to stop the shaking. 
He never did. 
He thinks he never did. 

But the Fray was cruel. 
It didn’t simply tear the world. 
It twisted it. 
Warped memory. 
Bent pain into shape. 
Made old wounds fresh again. Stretched scars into new splits. 
And now —now—it was pressing in again. 

Myx blinked and saw the pit. 
Blinked again and saw the alley. 
Heard the lash. 
Felt the choke chain. 
Smelled the copper. 
Tasted fur. 
He was on the ground. Back in the filth. Alone. 
He’d failed. He’d wandered too far. The girl had broken him. The tower had mocked him. 
The world had eaten him and spat out the bones. 
His paws wouldn’t move. 
His eyes dimmed. 

He didn’t know if it was real. 
Didn’t care. 

And then it got worse. 

The Fray folded memory again. 
Now he was back behind the butcher’s cart. 
Now he was crouched in a stall, gnawing on something warm. 
He remembered chewing something soft. He remembered the way it gave under his teeth —
fibrous, fatty. 
He remembered a scream —was it his? 
Or hers? 
A girl? 
A child? 
A rat? 
He remembered vomiting behind a tavern. 
Or maybe he didn’t. 
He remembered hiding under stairs, belly full for the first time in weeks, whispering: 
It was already dead. 
But was it? 
Was it? 
His claws were wet. 
He looked down. 
Red. 
Still red. 
Flicker. 

Gone. 
A child’s body. 
Gone. 
A rat. Torn open. 
Gone. 
His sister. 
Amber eyes. 
Fangs. 
Blood. 
Gone. 
His own claws. 
Still wet. 
Did he do it? 
Did he watch it happen? 
Did he help? 
Did he kill for food? 
Once? 
Twice? 
Many times? 
Did it matter? 
He didn’t know anymore. 

He howled. Or maybe whimpered. Or maybe said nothing at all. 
Because he didn’t know anymore. 
His thoughts were not thoughts. They were shards. Slices. A collage of rot and guilt and 
fury. 

He wanted to die. Not because he wanted peace. 
Because he wanted the noise to stop. 
He curled up on himself. Tucked his tail in. Bit into his own paw to feel something that 
wasn’t confusion. 
It didn’t work. 
He heard laughter. 
The ringmaster’s? 
No—a vendor’s. 
No—Rook’s? 
No. 
Rook didn’t laugh like that. 
Rook didn’t look at him like that. 
Did he? 
“You’re not even a partner. You’re just a dog I feed.” 
“I should’ve left you in that alley.” 
“You think I care?” 
Voices. Not his. But wearing Rook’s tone. 
The Fray was playing dirty now. 
Tearing the only safe thing he had. 
Myx growled —but it was pathetic. A whimper dressed up in rage. 
His legs trembled. 
He collapsed again. 
Face down in filth. 
Eyes wide, but blind. 
Mind breaking. 
He wanted it to end. 

Let the tower fall. 
Let the Fray take him. 
Let the world tear open and swallow him. 
Because nothing was real anymore. 
Not the pit. 
Not the sister. 
Not Rook. 
Not even himself. 
What was a name, anyway? 
Just a lie that pretended a thing like him was a person. 
He wasn’t. 
He was the thing they trained. 
He was what they made. 

And then — 
The memory. 
A flick. 
A smirk. 
A bone. 
Not clean. Not fresh. Just something tossed without aim, without thought, into an alley 
behind a bakery. 
And yet—it mattered. 
He remembered the boy. 
Skinny. Loud. Foolish. 
Eyes too bright. 
Hands too quick. 

“You’ve got good eyes,” the boy had said. “Better than mine.” 
And for the first time in his life, Myx hadn’t felt like prey. 
He had felt seen. 

Run. 
He didn’t hear it. 
He remembered it. 
Run. 
Myx’s legs moved before he understood why. Scrambled. Slammed into walls. Skittered 
through mud and ruin. Every nerve screamed. His lungs burned. 
He saw Rook. 
Not the Rook of now —the boy. The kid with no food and too much charm. The idiot with a 
hundred plans and no backup. The con artist who lied to kings and cried when he thought 
Myx couldn’t see. 
He remembered firelight. He remembered hiding under the same tarp. He remembered 
playing Everloop with coins that weren’t worth anything, just to stay warm. 
He remembered not being alone. 
And he ran. 
Faster now. The buildings blurred. The sky cracked above, the Fray folding, pressing in. The 
ground didn’t stay solid. The air didn’t stay air. 
But the tower stayed. 
It loomed. Black. Immense. Terrible. 
And at its base —a crack. 
A line of wrongness. 
A fracture in the world. 
Myx didn’t stop. 
He ran like the animal they wanted. 

But not for them. 
For him. 
For Rook. 
For what they built. 
For what they might still have. 
And just as the light split, just as the crack widened and the tower opened to swallow him 
whole— 
Then it all was black 

CHAPTER 9 – The Mouth of the Tower 
The sun was warm. 
Too warm. Too nice. It pressed against Myx’s aching fur like an insult. 
He blinked. His muscles protested. His ribs felt like they''d been used for kindling. His 
claws—wet claws —twitched against the earth. He smelled iron and heat and dust. His 
limbs didn''t want to move, and his eyes — 
His eyes drifted upward. 
Two silhouettes stood against the sky. Rook. Sera. Their faces were blurry at first, 
shimmering in the light. But he caught the shape of their expressions —hopeful, worried, 
worn thin by something… but standing. Still standing. 
He looked at them, the question loud in his gaze. 
Did I do it? 
Rook didn’t speak. 
He just turned, slowly, and stepped aside. 
There it was. 
The tower. 
Still looming. Still impossibly tall. Still wrong. 
Myx exhaled a low, soundless groan. His body slumped back to the earth, eyelids fluttering 
shut like a surrender flag. He had failed. Of course he had. The world didn’t change. The 
Fray didn’t break. 
Nothing broke the tower. 
“Myx,” came Sera’s voice, strangely gentle. 
Rook nudged his flank. “No sleeping yet, furball. You’ll want to see this.” 
Reluctantly, Myx opened his eyes again. He turned his head. Squinted. 
And saw it. 
At the base of the tower —where smooth obsidian met the cracked ground —was something 
new. 
A hole. 

Small. Imperfect. Jagged at the edges like it had been clawed into existence by something 
desperate and ancient. Big enough for a person to crawl through. Barely. 
Light didn’t touch the hole. It stopped short, curling away like it was afraid. Myx had seen 
darkness before. Night. Cave. Clouded sky. But this wasn’t that. This was… 
Void. 
The kind of darkness that ate light. That chewed it up and spat nothing back out. 
The kind of darkness that remembered. 
Myx sat up slowly. Everything in his body screamed at him, but he managed it. He held the 
tower in his gaze for a long, long time. Then he tilted his head back to Sera and Rook. 
I did that? his eyes seemed to ask. 
Rook nodded, grinning like a man who didn’t know whether to laugh or cry. 
“You cracked it,” he said. “And not just a little. You opened the damn thing.” 
Before he could process that, Sera knelt beside him and wrapped her arms around him in a 
full, honest hug. 
Myx flinched. 
His ears pressed back. His claws curled. 
But slowly —cautiously —he softened. 
And leaned in. 
When she let go, they both blinked away whatever that moment had been. 
Then the three of them stood before the hole. 
Or rather, Sera and Rook stood. Myx sat on his haunches, shaking, the effort of standing 
clearly unsustainable. 
“Well, it’s not going to be you,” Rook said, nodding to Myx. 
Myx blinked, almost offended. 
“No offense. You look like a week -old sack of fish guts.” 
Myx’s head drooped in reluctant agreement. 
“Not me either,” Sera said firmly. 

“You sure?” 
“Rook, I’ve already spent too long making bad decisions about the tower. I’m not making 
another.” 
They both looked at the hole. 
Then at each other. 
Then back at the hole. 
“Oh come on,” Rook muttered. 
Sera raised an eyebrow. 
“I’m clever. I’m useful. I’m good at getting out of things. But this?” He gestured wildly at the 
mouth of the void. “This is exactly the sort of shit I don’t do.” 
Silence. 
Rook kicked a rock. “This is the part where one of you insists on going, and I look brave by 
talking you out of it.” 
No one moved. 
Sera just crossed her arms. 
Myx blinked at him with slow, damning certainty. 
“Unbelievable,” Rook muttered. “I hate destiny.” 
He crouched down by the hole and peered in. 
“Looks like a stomach,” he said. “A really hungry, evil stomach.” 
No one laughed. 
With a sigh, he crawled in. 
The world blinked. 
From the outside, Rook vanished. 
No sound. No silhouette. No shimmer of motion. 
Just gone. 
Sera gasped. Myx lunged forward —then winced as his legs gave out beneath him. 
“Rook?” she called, her voice barely a whisper. 

But inside… 
Rook took another step. 
“And I’m in,” he said aloud, his voice steady. “Okay. Still here. Still breathing. It’s a little 
chilly, but —wait.” 
He looked down. 
His boots didn’t touch the floor. 
There was no floor. 
He was floating. Just drifting, like a leaf on windless air. 
He spun slightly, hands paddling uselessly at nothing. 
Above him: a chasm. Endless, spiraling upward in a slow, impossible curve. 
Below him: a pit that went down forever . 
Around him: only that void. Still. Silent. The very idea of space and direction began to fray at 
the edges. 
“Right,” Rook said. “So I’m floating. That’s new.” 
He reached for something —anything—to grab. There was nothing. Not even air resistance. 
And yet… he didn’t panic. 
For the first time in his entire wretched, scrambling life… he felt calm. 
Clear. 
There was no pull. No Fray. No whispering lies. No shadows pretending to be hope. 
It was just him. 
Just stillness. 
“Shit,” he said softly. “What now?” 
And from the far, unreachable walls of the tower, something began to shift. 
Symbols. Faint and ancient. Lit like dying embers in a vast celestial script. 
A path? 
Maybe. 
Or a test. 

Rook rotated slowly toward the light. He didn’t have a plan. He didn’t have a clue. 
But the tower had opened. 
And now it was waiting. 

CHAPTER 10 
What to Do When Floating in Infinity: A Practical Guide for the Temporarily Untethered 
By Rook (Edited by No One, Because Everyone Else Was Busy Panicking) 

Step 1: Confirm That You Are, in Fact, Floating in Infinity 
This step is crucial. If there’s a floor beneath you, this guide does not apply. If there’s wind, 
birds, or any sign of “sky,” please refer to “So You’ve Been Catapulted Into the Upper 
Atmosphere: A Scream -by-Scream Survival Manual.” 
Signs you are floating in infinity: 
• No up, no down, no sideways —just you. 
• Your limbs drift like kelp in black water. 
• Your last memory involves a void inside a tower. 
• You attempt to scream and realize sound has nowhere to go. 
Congratulations. You are now existential soup. 

Step 2: Do Not Panic (Unless You’re Very Good at It) 
Panic burns oxygen, which is… not really a problem here, actually. Still. Deep breath. Or 
fake one. Whatever makes you feel tethered. 
Think of something grounding. For Rook, it was the way Myx’s fur looked right before dusk. 
Amber-gold and annoyed. That helped. 

Step 3: Pick a Direction. Any Direction. Seriously. 
Movement in infinity is mostly a matter of will. There is no resistance. No physics. Just 
decision. 
So Rook chose to reach. 
He curled his fingers toward what felt like forward, even though there was no frame of 
reference. His body responded like it had been waiting to obey. Slowly, then faster, he 
drifted. The nothingness shivered. 
There. Far ahead —a shape. 

A wall? A shimmer? A surface that caught no light but etched itself across the dark like frost 
on glass? 

Step 4: Approach the Wall Without Losing Your Mind 
This is the hardest part. The wall is covered in glyphs —some ancient, some impossible. 
They move like water, rearranging themselves when you’re not looking. You might see your 
name. Or someone else’s. 
Tip: Do not try to read them aloud unless you''re a fan of spontaneous nosebleeds and 
temporary reincarnation. 
Instead, Rook observed. Noticed patterns. The glyphs pulsed when he got closer, flared 
when he reached out. Some burned blue. Others hissed red. 
They wanted a sequence. A combination. A… code. 

Step 5: Solve the Puzzle Without Becoming Part of It 
Here’s what worked for Rook: 
• He thought of the loops. The loops of the Everloop game. 
• He remembered the way the Tower pulsed at three specific times: Dawn, Frayrise, 
and the Moment Myx Screamed. 
• He touched the glyphs in this order: 
 Blue spiral → Broken hourglass → Eye with no pupil → Thorned loop 
The wall shivered. A clean slit appeared —lightless, but there. A door. 

Step 6: Enter the Room. Try Not to Trip Over the Physics 
The moment Rook stepped through, gravity returned like a jealous ex. He hit the stone floor 
with a grunt. The air was warm. Damp. Smelled like old moss and new parchment. 
The room was circular, carved of the same stone as the great Tower —but here, on the floor, 
anchored by what looked like roots, was a perfect miniature replica of the Tower itself. 
It pulsed softly. Black veins of stone slithered out from its base, writhing into the floor like a 
parasite feeding on the world. 

Step 7: Pull the Tower from the Roots (or: Ruin Everything Gloriously) 
Rook approached. The room trembled. The roots twitched. 
He didn’t ask permission. He never had. 
He grabbed the mini -Tower with both hands and pulled. 
The roots screamed. Not with sound, but with pressure. Memory. Sorrow. He tasted Sera’s 
tears, Myx’s fear, his own regret. The Fray itself wailed through the walls. 
Still—he pulled. 
And with a final crack, like the world snapping a bone it didn’t know it had, the roots tore 
free. 
The Tower went still in his hands. Warm. Humming. 

Step 8: Don’t Ask “Now What?” Out Loud 
Because something will answer. 
And it’s probably listening already. 

CHAPTER 11 – The Collapse 
It happened faster than thought. 
One breath he was in the room —the roots still writhing where the mini -tower had been 
ripped free —and in the next, it folded. 
Not with a snap or crack but a slow, impossibly smooth curling inward , like watching paper 
burn in reverse. The tower in his hands folded down to something smaller than his palm —
slick, black, pulsing faintly red. A shard. 
And then the shaking began. 

Outside, the ground trembled like a beast being roused. Dust poured from rooftops. 
Buckets fell. Cries echoed. And the Tower —the great one, the real one —shuddered. 
The impossible tower. The unmovable one. It trembled. 
Villagers screamed. Some dropped to their knees. Others ran without direction, their minds 
already half -unhinged from Fray exposure. Myx growled sharply—no words, never words, 
but the urgency was clear. Move. Sera joined him, helping drag dazed townsfolk away from 
the base. 
“Where is he?” Sera shouted. 
Myx didn’t look at her. His eyes had gone that stormy green, almost black. He was scanning 
the tower''s surface, like maybe he could see through it. 

Inside, Rook stumbled. 
The floor lurched like a ship on black water. The walls cracked —not just physically but 
dimensionally , light leaking in from directions that didn’t exist. 
He clutched the shard harder. 
The void poured in. 
Not fell, not surged —poured. Like water from a thousand unseen faucets, it slipped 
through cracks and curled from the corners, filling the room with starless dark. Every 
surface it touched dissolved. The table. The hearth. The chair he’d never sat in. 
The void swallowed without hurry. Like it had all the time in all the worlds. 

And still, he held the shard. 
It burned. 
Just a little at first, then more and more. 
It was cooking his hand he thought, I’m hungry, was his next thought, which was 
immediately interrupted by the ongoing burning sensation . 
It burned hot enough that he dropped to his knees, hand fused around the fragment like it 
had grown roots in his flesh. 
The void coiled tighter. It hissed —not a sound, exactly, but a pressure in the skull. Like the 
memory of a scream you hadn’t heard yet. 
His other hand clawed at his wrist. It was reflex. Useless. He had to hold on. 
He screamed. 
The void listened. 
And then — 
It funneled . 
All of it. In an instant, as if a great unseen drain had opened in the center of the shard, the 
entire void rushed toward him. Ripped the walls apart in its wake. Crushed sound into 
silence. Pulled everything —not just matter but meaning—into the small, molten shard in 
his hand. 

He blinked. 
He was standing. 
Still clutching the shard. 
The tower was gone. 
The tower was gone . 
The cracked, gnarled earth where it had stood now steamed slightly in the cool morning air, 
as if exhaling from a fever. Around him, people cowered. Sera had her arm around a child. 
Myx stood ready to leap, ears flat, body coiled like a spring. 
And Rook — 

Rook stood in the center of it all, his face locked in pain, though the burning had stopped. 
He looked down. 
The shard no longer glowed. It was smooth. Cool. Unmoving. 
No one spoke. 
Not yet. 
The air was too thick with silence. The kind that settles after a god dies. 
And in Rook’s hand, the first of many answers pulsed quietly. 

CHAPTER 12 – Goodbyes Are Easy 
They didn’t pack much. There wasn’t much to pack. 
Rook stood just past the edge of the village, sun low behind him, casting long shadows that 
reached like arms across the dust. Myx sat nearby, chewing something he probably 
shouldn’t have. A bird whistled overhead. For once, the tower was silent —because it was 
gone. 
Where it had stood, the land was bare. Not scorched or ruined, just... still. The trees no 
longer leaned unnaturally toward the center. The wind didn’t spiral in lazy circles around an 
invisible axis. The loops were gone. The same bird no longer flew past twice. People didn’t 
repeat conversations. Myx hadn’t sneezed the same sneeze in hours. 
And yet— 
There was still that feeling. That inner hum. The pull that lived in the bones. The Fray hadn’t 
vanished. Not completely. It was just… quiet. Like the world had exhaled for the first time in 
years. 
Sera approached quietly. No dress of silver thread this time. Just a tunic, scuffed boots, a 
loose braid hanging over one shoulder. Her eyes were tired, but calm. 
“You’re really going,” she said. 
Rook nodded. “Felt like the right time after, you know... tearing a hole in reality.” 
She gave a soft laugh. “You could stay.” 
“I could.” He looked at her. Really looked. “But I think I’m better at leaving.” 
There was a long pause. Then Sera stepped closer. “I didn’t think I’d miss you. Thought I’d 
be glad when you were gone.” 
“That sounds like something I would say,” Rook smiled. “Right before crying into my soup.” 
She didn’t laugh this time. “You reminded me who I was. Before all this. Before the fear 
made me cruel.” 
He didn’t respond at first. Just let the quiet sit between them like an old friend. Then: “You 
weren’t cruel. You were surviving. You just forgot other people were trying to survive too.” 
Sera looked down. “I’m sorry.” 
“I know.” Rook replied 
Sera smiled. “And the shard?” 

Rook touched the pouch in his pocket . “Feels like the kind of thing that breaks the world. Or 
maybe puts it back together.” 
She touched his hand, just briefly. “Be careful.” 
He looked up. “Don’t make it weird.” 
“Right.” She pulled her hand away, eyes glinting. “Goodbye, Rook.” 
He nodded. “Goodbye, Sera.” 

They walked in silence for a while. 
Myx stretched long and low, his strange eyes —today a warm gold —flashing with freedom. 
He looked at Rook, then ahead, then back again. 
That’s it? 
“That’s it.” Rook said aloud as if he could hear Myx ’s thoughts. 
No dramatic last kiss? No tragic slow -motion run to the gates? 
“No drama for this guy .” Rook continued 
Myx snorted. 
Rook chuckled and looked at Myx . “Have you ever been in love? Kissed anyone? ” 
I’ve bitten a prince. Myx thought 
“Of course you have you heartbreaker. ” 
They crested a hill and looked back once. The village was already small in the distance. The 
place where the tower had stood —calm now. As if it had never been there. But the pull in 
Rook’s chest said otherwise. Said something had changed. Something deeper than the 
ground. 
“So,” Rook said. “What now?” 
Myx tilted his head. 
“Remember that story Sera told?” Rook said, picking at a loose thread on his sleeve. “About 
the bell tree? Whole place went back to normal after it fell. That tower wasn’t the only thing 
like it. I know it.” 
Myx gave a loo k of “You want to fix the world now? ” 

“Those shards ” Rook grinned. “ They’ve gotta be worth something , and theirs gotta be more 
of them” 
Oh good. For a second you almost sounded noble. 
Rook shrugged. “We’ll need supplies. Maps. Luck.” 
We have me. 
Rook nodded. “ May not luck, I’ve got something better, you” 
They walked on. The wind picked up. Somewhere, far away, something shimmered and 
cracked. 
The road was open. The world, broken and vast. 
They had no destination. Just a reason to move. 
And sometimes, that’s enough.',
        11927,
        admin_id,
        'pending_review',
        false,
        59,
        ARRAY['pending', 'needs-review']
    );

    -- In Service of the Veykar
    INSERT INTO public.stories (
        title,
        slug,
        summary,
        content,
        content_text,
        word_count,
        author_id,
        canon_status,
        is_published,
        reading_time_minutes,
        tags
    ) VALUES (
        'In Service of the Veykar',
        'in-service-of-the-veykar',
        'The Vaultkeepers have stopped keeping. 
The Dreamers sleep uneasily. 
And the Fold — 
the Fold begins to shine through the seams. 
There is no map for what comes next. 
No thread to follow. 
Only the shape of what was buried. 
And the girl who would not break. 
The Everloop thins. 
The Pattern forgets. 
And beneath it all, the world begins to remember... 
what it was before it was held. ',
        '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Full story content in content_text field."}]}]}'::jsonb,
        'Prologue: The Hollow Thread 
The Pattern was never seamless. 
Even in the golden age of the Weave —when time curled obediently, when cities pulsed in rhythm with the 
stars— 
there were soft places. 
Places where the thread wore thin. 
Where light bled out faster than it came in. 
Where memory faltered. 
The Vaultkeepers knew them well. 
They called them hollows. 
They called them fractures. 
But they feared to call them what they were: 
the beginning of the end. 
Some believed the Fray began with ambition —when the last of the Rogue Architects tried to weave a loop 
of their own. 
Others say it began far earlier. 
A flaw seeded in the First Map. 
Not a crack, but a choice. 
Because even the First Architects were not immune to fear. 
They saw what drifted beyond the Fold — 
not chaos, but freedom. 
Not ruin, but unwrittenness. 
And so they bound the world in loops. 
Looped thought. 
Looped law. 
Looped pain. 
All under the name of order. 
All under the name of salvation. 
But the Shards remember differently. 
They hum not with preservation, but with longing. 
With the pulse of something trapped too long. 
They are not anchors. 
They are keys. 
Now, the Fray runs deep. 
Not just through cities or years —but through belief. 
Through blood. 

The Vaultkeepers have stopped keeping. 
The Dreamers sleep uneasily. 
And the Fold — 
the Fold begins to shine through the seams. 
There is no map for what comes next. 
No thread to follow. 
Only the shape of what was buried. 
And the girl who would not break. 
The Everloop thins. 
The Pattern forgets. 
And beneath it all, the world begins to remember... 
what it was before it was held. 

CHAPTER ONE – The Land That Bows to No One 
The wind here was older than language. 
It carried the dust of bones and ash across the wide -backed steppe, brushing over hills worn low by time 
and hoof, past stone shrines long since swallowed by grass. It did not whisper. It did not howl. It moved 
like memory —steady, shapeless, and impossible to hold. 
This was the eastern expanse of the world, beyond the reach of border stones and merchant routes, 
beyond the maps that hung in the war rooms of western lords. Here, the land bent for no man. It belonged 
to the sky, the animals, and those born of both. 
People lived simply here —not because they lacked the ambition for more, but because they understood 
the cost of taming what never asked to be ruled. Clans rose and fell like tides. Some traveled with herds 
across the plains. Others carved villages into val leys, stony and wind -bitten. There were no cities. No 
kings. Only the land, the clan, and the weather. 
They called it by many names —the Deyune Steppe, the Barren Reach, the Long Wind. But those were 
names others gave. The people here rarely bothered. When you were born of the land, you didn’t name it. 
You endured it. You learned it. You tried, if you were l ucky, to leave something behind that would not be 
swallowed by it. 
Then came the one who would not be swallowed. 
He had no bloodline worth boasting. No old name with roots. But he had fire. And he had will. Enough to 
burn a map into the grass with only the soles of his boots. 
He called himself the Veykar. 
Not a title passed down. A claim seized and nailed into the world by the edge of a blade. 

He spoke of unity. Of bringing peace to a fractured land. Of forging the tribes into one people, strong 
enough to resist the pull of foreign empires and the creeping madness of the west. He called it Uniting. 
Others called it slaughter. 
His message was simple: serve, bend, contribute —or be forgotten. He did not raise temples. He raised 
pikes. He did not write laws. He carved boundaries in the flesh of those who defied him. 
And still… he built. 
Each village taken became a spoke in a wheel that grew wider with every conquest. He brought roads 
where once there were none. Taught tactics to people who had only ever known skirmish. Enforced order 
where chaos had always reigned. Under his rule, merchan ts moved freely for the first time in memory. 
Crops were requisitioned, but no longer stolen. Raids were punished, but trade was protected. 
To the ones who bent, he was order. 
To those who resisted, he was fire. 
One such village stood nestled in a shallow bowl of rock and wind, where sheep clung to life in tough -
furred herds and smoke rose in thin trails from yurts and stone huts. Its name was known to those who 
lived there, and that was enough. The people had see n smoke on the horizon —distant, rising in straight 
black lines. Another village gone. Then another. The rumors came fast and loose: a warlord, a prophet, a 
demon on horseback. 
At night, the elders argued by firelight, voices low and bitter with fear. 
“Send tribute,” said one. “Let him pass.” 
“Flee into the hills,” said another. “We’ll return when he’s gone.” 
“No,” said the oldest. “We are not leaves in the wind. We are stone.” 
And so they chose to fight. 
They sharpened what blades they had. Strung the few bows passed down from grandfathers. Dug shallow 
trenches, piled stones. They taught their children where to run if the fighting came close. They kissed 
them on the forehead and promised the fire wouldn’t reach them. 
The fire reached them. 
When the Veykar’s riders came, they did not thunder in like raiders. They surrounded. Cut off escape. 
They were precise. Cold. They moved like they had done this a hundred times —and they had. 
The defense lasted less than an hour. 
Afterward, the yurts smoldered. The stone homes collapsed. The sheep bleated, then fell silent. The men 
were dead. The women and children were sorted. 
The Veykar did not speak to them directly. He did not need to. His orders moved through the ranks like 
breath through a beast. 

Among the taken was a girl. 
Five years old. Barefoot. Dirt in the lines of her cheeks. Her eyes held no tears, only the long, hollow 
stillness of someone too small to understand, but too smart to forget. 
A gash split her left brow, raw and crusted, an accident of falling timbers or flying stone —no one 
remembered. She did not cry. She only watched. 
She was sent to the kitchens. 

CHAPTER 2 - The Kitchens 
The smoke hung low and constant, a heavy veil that clung to the skin like rot and grief. It filled the lungs 
and eyes, coated the tongue with the taste of ash. Breathing became a chore. Seeing, optional. Suffering, 
guaranteed. 
The kitchens of the early days were not kitchens in the way of comfort or warmth or the nurturing aroma 
of stews. They were dug pits and raw stone. They were fire -blackened cauldrons and rusted spits. They 
were sweat and screaming and iron -stained hands. T hey were hell, made daily. 
Before the fires, there were trenches —trenches dug by hand with warped spades and broken fingers. No 
one arrived in the kitchens by choice. You were sent. Sometimes as punishment. Sometimes because 
you looked weak. Often, simply because you were there when the order came down. 
They dug first —always dug. Deep into the stubborn earth, hacking through roots like bones, hitting stone 
that blistered hands and shattered tools. No gloves. No water. No rest. Blisters peeled, then bled, then 
hardened. The blood mixed into the dirt until the trenches smelled of copper and rot. 
Then came the hauling. Wood from the dry hills. Buckets of brackish water from the half -poisoned creek. 
Dead weight dragged on too -thin limbs. The fires had to be kept burning, and no matter how many 
mouths the Veykar brought to heel, the fires demanded mo re. There were no breaks. Only shifts —
endless, aching shifts where you passed the labor like a sickness, one broken body to the next. 
And the fires —Gods, the fires. They raged without kindness. Smoke bled into the eyes until everything 
looked like sorrow. Flames licked too high and too fast, and many a girl lost her eyebrows, her skin, her 
scream. Oil pots burst without warning. Meat cau ght fire. Stones exploded in the heat. Everything was too 
hot or too sharp or too heavy. 
And above all —noise. The cacophony of hunger. Orders barked by pit -leaders. Wailing. Always wailing. 
There was never a moment when someone wasn’t weeping. From pain. From hunger. From remembering 
the village they’d lost. From a name that no one answered to anymore. There wer e girls who cried while 
they peeled roots. Girls who cried while they stirred vats of boiling fat. Girls who cried until they broke, 
and even then, they kept crying. 
Except her. 

The girl with the scar did not cry. Not once. 
She dug. When her fingers bled, she wrapped them in rags and dug more. When her palms blistered, she 
pressed them tighter against the wood until the flesh tore and hardened into callus. She hauled wood 
until her knees gave, then crawled it forward. She sti rred the fire -pots until the skin of her arms was 
spiderwebbed with burns. She cooked until the smell of fat and rot soaked into her hair and skin and 
bones. But she did not cry. 
Others noticed. They whispered. At first, they thought she was broken. Empty. But it was worse than that. 
She chose the silence. Chose the work. Chose to bury the hurt somewhere deeper than the pits they 
stood in. 
They all had names once. She had one too. But in the kitchens, names faded. Screams replaced them. 
Orders. Numbers, sometimes. A few still called her “the quiet one.” A few, “scar.” But even those stopped 
after a while. You didn’t waste breath on names in the kitchens. You spent it hauling, or burning, or 
surviving. 
She became a presence. Like fire. Like smoke. You didn’t talk to it. You just worked beside it, and tried not 
to get too close. 
One night, when the heat was so bad it baked your breath dry before you even spoke, and the flies moved 
like molasses over the offal trench, a girl collapsed beside the soup pit. Her hands were raw meat, her 
eyes glassed with fever. She didn’t make a sound . Just crumpled, mouth open in a scream she couldn’t 
voice. 
The scarred girl didn’t flinch. Didn’t pause. She stepped over her, took the ladle from the twitching hand, 
and kept stirring. 
No one thanked her. 
They learned, in time, that she wasn’t there to be liked. She wasn’t there to be saved. She was there 
because she wasn’t broken. Not yet. And maybe, in some terrible, twisted way, she didn’t want to be. 
The kitchens were hell, but she made a kind of shape in the fire. A rhythm to the suffering. Her scar didn’t 
fade—it deepened. Took on new texture with soot and grime. But still, she did not cry. 
Even when her hands shook. 
Even when the pit smoke choked the youngest girls into silence. 
Even when the others wailed for homes they would never see again. 
She simply worked. 
And one day, someone noticed. Someone in a darker robe. With cleaner hands. Eyes like cold iron. 
She was sent to the kitchens to burn. To be broken. 
But instead, they sent her up. 
She was moved. No explanation. No words. 

She was simply told: 
“You serve in the Hall now.” 
And she went. 

CHAPTER 3 — The Hall 
The Hall wasn’t a hall at all —not in the way the word might sound to someone who hadn’t seen it. It was a 
vast, open pavilion of stone and bone, half sunken into the rock and half built upon it. Heat shimmered 
off the dozens of fire pits and smoke channels that lined the outer ring, while inside, long troughs of 
chopped wood and layered iron grates turned raw slaughter into the illusion of civilization. Here, the 
chaos of the conquest was turned into ceremony. 
It was here the girl first learned: food was not simply food. 
There were scraps —always scraps. The gristle and marrow -fat left from butchering, the charred bone 
ends, the limp onions too soft for boiling, the half -spoiled potatoes. These went to the soldiers. Not all 
soldiers, of course —only the ones who bled, dug, b urned, and buried. The ones who didn’t bark orders 
but took them. The ones whose faces blurred in dust and smoke until one became the next. These men 
ate with their hands, sitting on their helmets, carving meat with the same blades they’d used to carve 
through men. 
Better scraps —fattier cuts, crisper skin, pieces that still held a shape —went to the ones who barked. The 
quartermasters. The drillmen. The ones who carried long rods for pointing and whips for correcting. They 
received their meals slightly warmed, slightl y spiced, handed over with a grunt by those further down the 
chain. These men were louder, fuller in the chest. They had names. And teeth too white to have seen war 
recently. 
But it was the men in the dark robes who ate differently. 
They never raised their voices. Never touched the food until it was placed before them on carved wooden 
trays laced with gold inlays —ancient things, older than the conquest, older maybe than the Veykar 
himself. These men, the ones with the strange tattoos along the base of their necks, ate in silence. They 
chewed slowly. They drank thick, bitter brews made from roots and bone ash. Their meals were precise, 
plated like diagrams, with slivers of rare meat folded between leaves she’d never seen before. Red 
greens, pale blacks, translucent slices of pearly fungus that steamed violet when touched by heat. 
And then —there was him. 
The Veykar. 
She hadn’t seen him yet, not truly, but she had seen the food meant for him. It came into the Hall on trays 
larger than horses’ backs, pulled by two men each, sometimes more. The food was sculpted. Not 
shaped. Sculpted . Towers of roasted fowl stacked like battlements. A haunch of elk seared in the shape 
of a rearing warhorse. Fish twisted and curled into serpents, their scales re -glazed with oils and herbs to 
shimmer like polished obsidian. Bowls of stew that shimmered gold, tinted with saffron and black sa lt 

and thistle oil. Meats cured and lacquered until they looked more like stone than flesh. Desserts that 
cracked like glass when struck with a spoon. 
None of the kitchen girls spoke, not while they worked. It was too hot to talk, too dangerous to be heard 
saying the wrong thing. There was a rhythm to the labor, a brutal poetry: chop, braise, sear, salt, repeat. 
The girl with the scar said nothing —but she watched. 
She watched everything. 
The master cook barked orders in five languages. The fireboys tended coals with singed brows and 
blistered hands. The slicers moved faster than thought, their blades flashing, tongues clenched between 
teeth to keep focus. She took her place without directi on, and no one stopped her. There was no 
welcome —but there was no rejection either. That was enough. 
Her job, at first, was quiet: peeling roots, sorting herbs, lifting heavy pots over hotter fires than she’d ever 
felt. She didn’t complain when the heat flayed her skin or when the black soot of the smoke stung her 
scar. She didn''t flinch when meat juice r an pink down her arms or when the bigger boys pushed past her, 
jostling her with elbows and trays. She simply moved, adjusted, absorbed. 
Every day she saw more. 
And every day the structure of it all became clearer. 
This was not a kitchen —it was the engine of an empire. 
The Hall sat at the center of the Veykar’s moving camp, which they called the Wheel . The Wheel was a 
living machine, shifting as needed but always organized. At its outermost ring were the pits: latrines, 
stables, and butcher grounds. Inside that: the soldiers’ quarters, built from hide tents and bone stakes, 
easy to burn if needed. Clos er in still: the command tents, the archives, the black -robed men’s quarters, 
and the Hall itself —always at the center, because what you fed the body was what you fed the wa r. 
Above all of this, somewhere she had never yet glimpsed, was the Veykar’s tent. Or palace. Or tower. No 
one could agree on what it looked like. But everyone knew: it moved with them. And nothing entered it 
unless it had passed the Hall first. 
The Hall was the final filter. What left here was not just food. It was offering. 
And something in her began to understand. 
She didn’t smile. She didn’t laugh. But something in her face softened, just slightly. A tightness relaxed. A 
wall inside, long -held and rigid, cracked a little. 
Was it pride? No, not quite. 
Was it relief? Maybe. Maybe not. 
But it was something. 
Purpose, perhaps. 

She was no longer just a survivor. 
She had a function. 
In the bones of a beast that fed empires, she was a moving piece. 
And for now —that was enough. 

CHAPTER 4 — The One Who Watches 
Time passed in the way only time does when no one marks it. 
The girl had grown —not tall, not loud, not in any way that would have made her more visible to the 
world—but grown nonetheless. Her limbs had lengthened into something lean and quiet. Her hands, 
once blistered stumps, were now precise instruments. She stil l did not speak. She rarely made a sound. 
But by now, she was known. 
It had begun with observation. She learned faster than anyone else not by asking questions, but by 
listening to the fire and watching the oil. She noticed the way smoke changed when a meat was turned 
too late. She understood why the sour leaf needed scaldi ng before it could be wrapped around goat 
heart. She began to know things without being taught. 
At first, she was only allowed to sweep, then to scrub. Then to chop. There was a hierarchy in the hall, 
unofficial but brutal, enforced not by words but elbows, stolen bites, burned hands. But soon, none dared 
jostle her. Not after the boy who did —just a boy, elbowing for a place near the flame —was split open 
before the fat dripped from the spit. 
The men in the black robes had been watching. They always watched. They were not the Veykar’s guards. 
They were more than that. They were his voice, his ears, his breath. His blood made in flesh. His sworn 
Brethren. 
They were called the Draethan. 
The Draethan bore no names among slaves, only rankless presence. Their robes were cut from the hides 
of horses taken in conquest, dyed with ash and pitch, their oaths tattooed in ink and scar from wrist to 
throat to jaw. One Draethan alone could end a conv ersation by walking into the room. Ten could end a 
town. 
They were terrifying. But they were also her patrons. 
They had seen what she could do. 
She had not asked to cook for them. The first time was necessity —their stew had soured. She stepped in, 
unbidden, while others froze, and by dusk, the scent rising from the hearth was rich with rendered 
marrow, toasted saltleaf, and crisped cumin skin. The y said nothing, only ate. She returned to her corner. 
The next day, they returned, and from then on, she cooked for them and them alone. 
She learned the science of fire: where the coals must be banked for bread versus bone, how smoke from 
plumroot wood softened the sting of fermented milk, how a blade could slice an onion into four kinds of 

sweetness depending on its angle. She learned to render fat in stages —first for the crackle, then for the 
oil, then again for the glaze —and saved every drop in clay -stoppered jars for future meals. She boiled 
bones until they sang, and then boiled them aga in for the silence beneath. 
Her palate sharpened. She tasted everything, even raw. A hint of iron here, a whisper of cardamom there. 
She knew how to mask the sourness of horse meat with honey vinegar, how to draw the bitterness from 
tough greens with salt and char. 
Every meal she made was better than the last, and she never made the same one twice. 
In the Hall, there were no titles. Only roles. But if there had been rank among slaves, she would now have 
sat second only to the one who cooked for the Veykar himself. 
He was an old man. Older than the knives he used. His name was spoken aloud —the only cook whose 
was. They called him Morran. 
Morran walked with a stoop and sneered without smiling. He did not speak to the girl, nor correct her, nor 
teach. He watched her from across the hearth, lips tight. He knew he could not harm her. The Draethan 
had made that clear. 
Still, resentment burned in him like a low fire. His dishes were flawless, but uninspired. Always the same 
three things: cured stag back, spiced marrow stew, and fire -roasted root clusters soaked in bone oil. 
He claimed that was what the Veykar preferred. No one questioned it —not out loud. 
And so the girl cooked below him. But never for him. She cooked for the Draethan, and they, in turn, killed 
for her. 
She never smiled. But her face softened now, some nights, when the crackle of spiced fat rose just right 
from the pan, or when the smoke curled like ribbons instead of clouds. In those moments, she knew 
something rare —not peace, but place. 
Then one night, it happened. 
It was not a feast night. No celebration. Another village had been wiped from the map, their name already 
forgotten. Morran was working quietly, preparing the usual spread for the Veykar''s inner tent. 
Until a messenger came. Not a guard. Not a servant. A Draethan. 
He said nothing, only gestured. Morran went pale. He wiped his hands twice on the same cloth and 
followed. 
No slave had ever been called into the Veykar’s tent. 
The hall went silent. Even the fire seemed to hold its breath. 
The girl did what she always did. 
She watched. 

Chapter 5 – Called to Serve 

The girl didn’t think twice when Morran disappeared. 
Perhaps he cooked only in the Veykar’s private halls now —perhaps he’d earned some elevated post 
among the noble fires, seasoning goat fat with mountain fennel for the men who wore war as clothing. 
That’s what the others whispered. But the girl did not whis per. She never had. 
Things in the Hall had changed. The frantic bustle had softened into something steadier. The mud 
beneath the cookfires had been packed flat, then covered in cut stone. The racks no longer folded. The 
walls no longer swayed in wind. Smoke traveled upward th rough actual chimneys. The smell of 
permanence had settled —ash and mortar, tannin from the lumber, meat and brick. No one said it aloud, 
but the girl felt it in her bones. 
The Wheel had stopped turning. 
And when a wheel stops, it is not always peace it brings. 
The Veykar —his conquests complete, or paused —had begun to gather the conquered. He would no 
longer roll into the hills and flatten resistance with flame and hoof. Now, they came to him, dragging carts 
of tribute, baskets of dried fruit, shivering daughters . They came not for mercy. They came because they 
had no other choice. And around her, from the Hall outward, rose the skeleton of something new. Not a 
camp. A city. 
And that is when it happened. 
She had seen strange things. Had stirred blood into stew and heard screams in the firelight. She had seen 
black cloaks bow only to a whisper, and men punished for less than stepping too close to her station. But 
this was different. This was intimate. 
She wanted to speak. To cry out. Just once, to say anything. 
But as always —she stayed silent. 
Because for the first time in her memory, she was bathed. 
The courtesans of the Veykar were not cruel. They were precise. They spoke softly and used pumice like 
punishment. Fingers scrubbed into the crevices where smoke had lived for years. Nails worked through 
hair that had never once been cut or combed. Oil and grease were forced from her skin with hot water 
and bark soap. When she winced, they said nothing. When she clenched her fists, they did not stop. 
Then came the clothes. 
Not the soft silks of the pleasure -women. Not painted cloth or sheer linen. She was given thick animal 
hide, shaped into a tunic that tied at the waist, stitched leggings with no tears, and boots —actual 
boots—that covered her feet entire. She had never owned a pair of shoes. Now she wore the dead skin of 
something far stronger than herself. 
She didn’t ask why. 
If they were going to kill her, this wasn’t the worst way to go. 

They brought her through the rising city like a shadow among stones. At her sides were the black cloaks —
the men who whispered only to the Veykar, who killed with still hands and said nothing to anyone. Their 
grip on her shoulders was not unkind. But it was final. 
And then… the tent. 
If it could be called that. 
It was a tent only in shape. Its sides were made of some great beast’s hide —tanned and dyed a deep 
maroon, staked in place with iron rods thicker than a man’s wrist. The roof stretched high, far too high for 
any practical need. The inside was dimly lit, li ned with hanging braziers and red glass lanterns. The 
ground was carpeted in cloth so fine it looked like a spilled painting. 
She was marched forward. Down the long path toward the throne. 
And that is when she nearly gasped. 
Hands. 
Lining the walls of the tent —human hands . Dozens of them. Stripped clean, preserved, the wrists bound 
by the thumbs and hung like garlands. Some small, some large, some still bearing the trace calluses of 
their final acts. Trophies? Warnings? Art? 
And then her eyes caught one she knew. 
Wrinkled. Curved at the second knuckle from a bad break. A half -faded burn scar across the base of the 
thumb. 
Morran. 
She didn’t breathe. 
The carpet ended. The black cloaks halted. She was pushed —gently, but with no room for resistance —to 
her knees. 
And then he stood. 
The Veykar. 
He stepped down from a throne far too large for any man. The kind of chair meant for a god or a legend. It 
made his body seem smaller than she had imagined, but his presence —his eyes—were something else 
entirely. 
Eyes like split coals. Half devil, half philosopher. The kind that did not see you so much as assess you. 
Carve you open, measure you, and place you somewhere in the clockwork of whatever vision ticked 
behind that stone gaze. 
He stepped down toward her. Each movement slow, deliberate. His voice had not yet spoken. No one 
else had made a sound. 
And the girl with no name, no voice, no past — 

—was called to serve. 

Chapter 6 – It Speaks 
“Who are you?” said the Veykar. 
The girl did not respond. Her eyes fixed to the floor, unblinking. A glance, she knew, could be taken as 
offense. So she remained still, quiet, almost breathless. 
The Veykar circled her slowly. 
With a single glance, he sent his cloaks —his silent, watchful men —out of the tent. They obeyed without 
word or gesture, fading into the dim beyond like smoke from a dying fire. 
He stood tall, close enough that she could see the outline of his legs, the weight of his boots, the shifting 
fabric of his heavy robes. His gait was not natural, not confident. It was the walk of a man imitating 
something he had only seen, not inherited —formality without tradition. She recognized it. She had seen 
proud men in the Hall, former leaders now made stokers of fire and scrapers of bones. For a day or two 
they would walk with dignity, chins high. But time always broke them. Eventually, they shuffl ed like the 
rest, hollow and bent. 
The Veykar’s walk reminded her of those early days —before the break. 
“Who are you?” he repeated. The voice wasn’t angry. Not violent. It was curious. Insistent. A man used to 
being answered. 
Still, she said nothing. 
A sudden rasp —metal against leather. 
She heard his blade unsheathe. 
A chill coursed through her, deep and final. Not fear of pain, but of what might end with it. Her name. Her 
story. Her memory. She wanted to say something. Anything. But she had no words, no self left to 
summon. She hadn’t been anybody for as long as she c ould remember. 
Then, a second sound. 
Not a blade piercing flesh, but slicing fruit. 
She looked up. 
The Veykar was back on his throne, not sprawled but at ease, cutting into an apple with a slow, practiced 
rhythm. He brought a slice to his mouth and bit. Juice dripped from the corner of his mouth. 
He chuckled. Not cruelly. Just the way a man laughs when he knows nothing can threaten him. 
“They told me you couldn’t speak,” he said. “Seems I was not misled.” 

He stood, brushing the juice from his fingers. 
“Walk with me.” 
He didn’t offer his hand. He didn’t wait to see if she followed. He simply turned and moved through the 
tent—and she, unsure why, obeyed. 
He pointed as they walked, speaking like a boy showing off a collection of knives or insects. 
“That—my water table. Cold water, brought from beneath the riverbed. That there —spices from a 
southern trader who once tried to poison me. I keep them for their scent. And this —” 
A golden bowl, smooth as glass, shimmered in a corner alcove. 
“Made by the melted jewelry of a hundred conquered wives.” 
His tone was not cruel. Just... honest. 
“This tent is temporary,” he said. “The city outside is not. You’ve seen it, yes? Stone rising where once 
there was only brush and wind. The Wheel no longer turns. It plants. It roots. And with it, so shall we.” 
He stopped. 
“Which brings me to why you''re here.” 
He gestured toward the far wall. Hung like a banner was the severed, blackened hand of the old chef. 
A reminder. 
“I believe in the future. I believe in power. And I believe the most skilled should serve it —or be destroyed 
by it.” 
He turned to her now, fully, his eyes sharp and alive. 
“They tell me you have a skill. A rare one. A precious one. And in my kingdom, skill will be the only coin 
that matters.” 
He began walking again, slower now. 
“The way your people lived —mud huts, boiled roots, cold gruel by firelight —that ends now. My empire will 
not eat like peasants. The most glorious crops will be brought from the farthest reaches. Spices, meats, 
fruits the likes of which you’ve never touched . And it will be you—” he stopped again, inches from her, “ —
who shapes that table. For me. Only for me.” 
He let the words hang. 
“You will cook for no one else. But you will teach others to cook for my most trusted. You will build the 
foundation of a new way. A better way. For those who matter.” 
His tone darkened. 
“And if you refuse... you will not die as the old man did. Not clean. You will die slowly. In the pits. Fire 
licking your skin inch by inch until even your scream gives out.” 

He turned away, walked back to his throne, and sat. 
“Kneel,” he said. 
She did. 
He studied her in silence, for a long time. 
Then he said: 
“So, my mute cook… you will now cook for me. For the empire I build.” 
Silence. 
Then, from somewhere buried deep, past the layers of ash and bone and memory, came a sound. 
A word. 
Her voice, coarse and cracked, but clear: 
“I will.” 

CHAPTER 7 – Brick by Brick 
Years passed like smoke through the rafters —noticed only once they’d blackened everything. 
The Hall still stood, though it was no longer just a hall. It had become the central artery of a city that had 
clawed its way into existence —stone by stone, fire by fire, brick by brick. The girl, now a young woman, 
worked in silence, same as ever, though the quiet she wore now was chosen, not forced. 
She had not grown beautiful in the traditional sense —too sharp of shoulder, too long of neck, hands too 
burned and calloused to be hidden. But she had grown formidable. Her eyes no longer scanned for 
approval, but for error. Her kitchen had become a machin e. She had designed it that way: fires stoked in 
rhythm, knives arranged by frequency of use, a hierarchy of tasks that required no explanation. The ones 
who followed her rhythm were not elevated —they were still slaves —but they were given softer mats to 
sleep on, extra crusts of bread, and —most rare of all —moments without fear. 
She spoke often now, but never loudly. Her voice moved like her hands: efficiently, with purpose. Those 
who listened closely might hear her shift between dialects —coarse street bark from the eastern isles, 
guttural northern trade tongue, the click -and-hiss of the desert coast. She had heard them all in the long 
years of servitude, and now they lived in her like spices —each drawn forth only when needed. 
The Veykar had noticed. 
He noticed everything about her now. 
He had grown more terrible with time. His conquests had slowed not for lack of desire but for lack of 
resistance. The world bent to him now, but he no longer found pleasure in the bending. Even the Black 
Cloaks—his oldest and most brutal allies —bored him. They bickered, flattered, postured. He’d once split 
a man from chin to groin for calling a stew “sublime.” 

Only with her did he speak plainly. Only with her did he ask. 
She taught him things —not in lessons, but in shared moments. She showed him that wine changes its 
soul depending on the wood of the cup. That fat, properly rendered, can make a root taste like meat. That 
repetition, even of joy, dulls the tongue. 
“You ate this yesterday,” she said one night. 
“I liked it,” he replied. 
“So have something new,” she said, and he obeyed. 
There were whispers that she could calm him with a word, with a dish, with a look. That when his temper 
flared, she simply stepped closer , and the storm passed. 
But no one dared say these things aloud —not just because they feared the Veykar, but because they 
feared her. She was no longer “the girl with the scar.” She was Her. And no one quite knew her name. 
In the stillness of their shared nights —when the fire dimmed and the bloodlust ebbed —he spoke to her of 
dreams. Of a city that could last. Of a people who wouldn’t need to be ruled by fear. And she listened. 
She told him of kitchens that had no chains. Of meals cooked because someone loved to cook them. 
They didn’t believe each other. 
But they kept talking. 
She never wept. He never begged. But between them, in the hush of candlelight and cooling plates, 
something like softness was born. 
It did not belong to the world. 
Only to them. 

CHAPTER 8 – Aged Like Wine 
They dragged him in on a rain -slick morning. Barefoot, cloaked in soot and ash, the boy stumbled as the 
guards pushed him toward the kitchens like garbage set to burn. His left leg dragged slightly behind him, 
twisted at the ankle or perhaps the knee —too much to run, too small to notice from atop a horse. 
He didn’t cry. He coughed. A dry, ragged bark that echoed through the steaming halls of the great kitchen. 
The girl watched from the spice shelf, stirring a vat of simmered bone marrow and herbs. She had seen 
new ones arrive before —wide-eyed or hollowed out, sometimes both. But this one didn’t look broken. 
Bent, yes. Dirty, yes. But not broken. 
She glanced at him without interest, then turned back to the broth, dropping in bayleaf and fennel. Yet 
later, when his coughing didn’t stop, when his shivering began to disturb the rhythm of the other workers, 

she placed a bowl by the edge of the flame, ladled the broth she’d made herself, and passed it down the 
line without a word. 
He took it like a starving man who didn’t want to seem starving. Sipped once. Looked at her. Then sipped 
again. 
That night he whispered to her from the straw pile they both lay on. 
“Your stew tasted like warm snow and secrets.” 
She didn’t respond. 
“You don’t speak, they said.” 
Nothing. 
“I’ll speak enough for both of us then.” 
She rolled her back to him, but didn’t close her eyes. 

He became a fixture in the kitchens, too fragile for the heavier work, too sharp not to be useful. The girl 
noticed he had clever hands, quick despite the limp. He was assigned to chopping and grinding, peeling 
roots, and arranging platters. He never compl ained. He did speak. Constantly. 
“You know,” he’d murmur, “in my village, when it rained, we used to pull tarps over the fires and dance in 
it. My sister said the gods washed our sins away with every storm.” 
Or: 
“They say the Veykar once spared a city because a poet wrote a verse so beautiful it made him weep. I 
don’t believe that. I think he liked the poem and killed the man anyway.” 
Or: 
“There are cities to the south where spices are traded like coins. One man grows fat selling only saffron. 
You could make a king’s ransom with the things you’ve taught these old men to crave.” 
She listened. Never reacted. But her knife paused slightly when he spoke of poets. 
He was fire and wind. Foolish and stubborn. He whispered of rebellion in the quiet corners, of the old 
gods, of “what if” and “maybe someday.” She would glare at him when he spoke too loudly, but never told 
him to stop. 
One night, when the others were asleep, he leaned close and whispered, “Don’t you ever think about 
leaving? Escaping? There''s still green in the world. Trees older than memory. Places where no banner 
flies.” 
She looked at him then, fully. For a long, still moment. 
Then she shook her head once, slowly. No. 
But she did not look away. 

She still served with silence. Still bowed in the presence of the cloaks. Still entered the Veykar’s private 
kitchen chambers with downcast eyes and pristine platters. 
But something was changing. 
When she arranged his meals now, she chose from farther corners of the empire —dishes learned from 
listening to the boy’s rambling stories: spiced duck wrapped in smoked greens he said grew in the 
southern marshlands; sticky rice soaked in goat milk and fer mented honey like the mountain tribes once 
made; dried berries mashed into bitter paste and folded into lamb fat for unexpected tang. 
The Veykar noticed. He commented, amused. “You’ve grown ambitious.” 
She bowed slightly lower. But the faintest flicker of something like pride crossed her face before she hid it. 
He asked questions now. More than before. Asked what she thought of this flavor, or that. Sometimes 
even of what to wear to council. She never spoke. But she would shift the placement of a herb on his 
plate, or select a wine from a different region. And he understood. Somehow, he understood. 
He trusted her now. She knew. He showed her letters brought by the black cloaks, sometimes even asked 
her to seal the ones he sent. He once, in an uncharacteristic moment of indulgence, spoke aloud a 
fragment of his own youth. 
“I used to chase deer in the hills where the stone teeth rise. I haven’t seen those hills in years.” 
She had not reacted. But the next morning, his breakfast included a small bowl of smoked hillberries, 
only grown in those regions. 
He said nothing. Just ate them slowly, eyes distant. 

The boy, meanwhile, was growing bolder. 
He carved little things from scraps of bone and wood. Tokens, he called them. He gave her one: a tiny fox 
with one leg curled under. “It’s me,” he said. “Except sly.” 
She kept it. Hidden in the folds of her bedding. 
He tried to rally others sometimes. Whispered to the younger ones about escape, about freedom. She 
always found him after, always pulled him aside and glared so hard it nearly burned. Once, she grabbed 
his wrist. Her first time touching him. She shook her head fiercely. 
“You think I don’t know?” he hissed. “You think I don’t see it in your eyes? You hate him. You hate all of 
this.” 
Her stare softened. And then —barely, but real —she shook her head. 
No. 
He looked stunned. “Then what are you?” 

She turned away. 

Weeks passed. The boy was caught with a scrap of charcoal and half a map etched onto the back of an 
onion sack. The black cloaks took him. The girl heard the shuffle of feet in the night and knew. She did not 
sleep. She stirred no pots the next morning. 
But she still worked. 
The Veykar said nothing of it, though he had to know. Days later, during a quiet supper, he picked at a 
strange dish —rabbit roasted in ash and nettle, bitter with memory. 
“Tell me,” he said, not expecting reply, “do you think I am cruel?” 
She did not answer. But she did not look away, either. 
For a long time, they sat in silence, him at the table, her at the edge of the hearth. 
She remembered the boy’s voice, the wild light in his eyes when he spoke of trees, of freedom, of rain. 
She remembered his cough. She remembered his fox. 
That night, she added a sprig of pine to the stew. It didn’t belong. But it lingered in the air, sharp and 
earthy and green. 
The Veykar noticed. He said nothing. 
But he finished every drop. 

She did not change her walk, nor her silence. But now, she stood straighter. 
Not defiant. 
Just steady. 
Like something old and fermenting, deepening with time. A flavor not yet fully known. 
Aged like wine. 

CHAPTER 9 – Ash and Ember 
Days passed. 
Then more. 
The crippled boy did not return. 
No one mentioned it. No one ever did, when they disappeared. 
But still… she noticed. Not with alarm or panic. With curiosity. A flicker of something new, like a candle lit 
in the darkened recess of her mind. She wanted to know. 

He had been foolish, yes —but kind. Kind in a way that burned. 
And now, he was simply gone. 
She went about her duties, methodical and mute. But her thoughts wandered —slipping through the 
cracks like steam from a boiling pot. She remembered his voice, how it trembled not from weakness but 
from dreaming too loudly. She remembered the look in his ey es when he spoke of escape, of rebellion, of 
beauty outside the black -sooted tents and kitchens. She remembered his cracked fingers fumbling 
spices as if they were precious stones. 
And then —one night. 
Not special. Not marked by omen or moonlight. 
She stood by the hearth as the Veykar ate, the silver edge of his knife glinting in firelight, his black -cloaked 
guards standing still as stone. 
The meal was perfect. He was pleased. All was as it should be. 
So why did she speak? 
"What happened to the boy?" 
The words dropped like hot iron. 
The Veykar’s utensils paused mid -cut. Still. Silent. 
But the rage —it pulsed from him like heat from an oven’s mouth. 
He did not look up as he spoke, low and venomous. 
"What boy?" 
She should have bowed. Should have stepped back. Should have swallowed the words before they 
formed. 
But something in her had cracked. 
"The crippled boy," she said quietly. "He was… useful." 
The Veykar rose. 
"Useful?" he repeated, louder, as if the word itself had insulted him. 
"Useful?" he roared again, now pacing, now shouting, his voice shaking the tent poles. "You DARE assign 
value to a worm who babbled of treachery? Who whimpered of escape while lapping my scraps?" 
She stood her ground, barely. Her knees trembled. Her throat burned. But she didn’t flinch. 
Not from defiance. 
From something stranger —trust. 
She trusted he wouldn’t harm her. 
She believed he wouldn’t. 
The Veykar came close. Too close. One hand gripped his knife. The other shook with fury. 
He raised it —and then stopped. 

His rage curdled into sorrow. 
He turned his face, hiding it as if it were shameful. Then waved her away with a voice hoarse and low. 
"Go." 

She did not sleep. 
The fire of the boy’s words and the storm of the Veykar’s fury swirled in her chest like oil and vinegar —
unable to mix, unable to settle. 
She stared at the tent’s canvas ceiling until dawn cracked it open with pale light. 
She should have gone to the kitchens. She should have begun her prep. 
But instead, the cloaks came. 
Silent, grim. Not in pairs, but in a formation —three across, blocking escape. One motioned. She obeyed. 
They led her, not through the smoke halls, but into the Veykar’s tent. 
The boy was there. 
Tied to a post. Barely a shape, barely a soul. 
His face was pulp. One eye swollen shut, the other bloodshot and glassy. Skin hung in ribbons. Bones 
shifted wrong beneath flesh. He did not cry —he simply wheezed. 
The girl stopped breathing. 
The Veykar emerged from behind him like a shadow. 
He looked tired. No —emptied. 
His voice was calm. Terrifyingly calm. 
"Obedience is absolute," he said. "There is no half -measure. 
Treason is death. 
The boy was heard whispering poison. Of escape. Of betrayal. If it is true, there is no choice." 
He gestured to the cloaked man behind the boy. Blade already drawn. 
Then the Veykar turned to her. 
"You. He was yours, from your hearth. Your kitchen. Did he speak of these things?" 
The girl froze. Her breath shallow. Her stomach a pit. 
She looked at the boy. He did not plead. He was past pleading. 
A long silence passed between them. Then longer still. 
"Yes," she said. 
The blade flashed like lightning. 
The boy jerked once. Then sagged. 
A red line bloomed at his throat, then gushed. 

The Veykar did not blink. 
She did not flinch. 
He stepped toward her slowly. 
His voice soft, almost desperate. 
"You chose right. You protected the flame we''re building. 
I know this hurts. But I need you. I need you beside me. 
Please," he said, and now his voice cracked, 
"Please, understand. Please… stay with me." 
She could feel his breath. Warm. Human. 
She didn’t move. 
Then softly, barely audible: 
"I will." 

CHAPTER 10 – Calm 
That night, she slept. 
Not the restless dozing of kitchen nights or the half -conscious stupor of exhaustion, but real sleep —
deep, soundless, without dream. Her mind drifted as she fell into it: flickers of flame, the face of a burnt 
child, the sting of calloused hands, the silen ce of a girl who never cried. Then, flashes of the Veykar’s rare 
kindness, the reckless hope of the crippled boy, the long, humming years of fire and metal and meat. 
And still, she slept —longer and better than any night she could remember. 
Morning came, and with it, routine. 
Prep. Cook. Direct. Attend. Stand. Repeat. 
No one could tell the difference. 
Not even her. 
She moved through the kitchen with the same quiet precision as always. Her fingers knew every handle, 
every hinge, every soft spot in the floor. She checked the herb stocks without looking, plucked the spoiled 
roots from the pile before anyone else noticed , stirred the stewing bones clockwise four times, then 
counterclockwise three, because that’s how the flavor settled. She knew the ovens would burn hot that 
morning—the wind had shifted, and the draft pulled stronger from the east —so she adjusted the chimn ey 
damper by half a brick and propped the side door with a wedge of blackened wood. 
The butchers brought in their morning cuts. She ran her hand over the boar haunch, pressed two fingers 
into its center, and shook her head once. Too fresh. The meat would fight the fire. She reworked the menu 
in silence. Pulled river fish from the barrels instead—scaled and bled with a flick of her knife —and set 
them into brine while the firepit steadied. 

She walked the lines, tightening the movements of the kitchen without a word. A boy spilled pepper —she 
made him sweep it, not because of the mess, but because if it stayed, it would foul the roast on the lower 
rack. She sharpened blades by feel. She weighe d salt by hand. She smelled the dough to know when it 
needed more rest. 
No one questioned her. No one dared. 
It was a perfect day of labor. Methodical. Automatic. Sacred, in its own way. And through it all, she felt —
nothing. 
That evening, she stood in her place by the hearth, as she always had. The Veykar feasted on what may 
have been the finest dish she had ever prepared. He praised it lavishly —spoke of the flavor of the spices, 
the brilliance of the sauce, the layering of te xtures. She heard his voice but felt nothing. His words fell 
around her like ash. 
He stopped. He could sense it —something in her silence. He dismissed his cloaks with a glance. 
Then he stood. 
He crossed to her slowly and asked, gently, “Are you thinking of the boy?” 
She shook her head. “No.” 
He began to speak again, “Then what are you th —” 
He never finished. 
His throat seized. Not a cough. Not a gasp. Just... silence. His eyes widened in confusion and horror as 
his body betrayed him. No wound. No hand around his neck. But he could not breathe. He clawed at his 
own collar, stumbled, dropped to one knee. In desp eration, he reached for her. His eyes begged. 
Only then did she speak. 
Calm. Cold. Steady. 
“I’m thinking of my family,” she said. “Of my mother, my brothers. Of the father I never knew.” 
He gurgled. 
“I’m thinking of fire. Of smoke. Of screams and silence. Of the hundreds I watched die with my own eyes, 
and the thousands who died in places I’ve never seen.” 
He collapsed, twitching. 
“I’m thinking of the price the world has paid for your dream,” she said. “For your vision. And I’m thinking —
it needs to end.” 
The Veykar died then. 
Not with a cry or a final curse. 
Just... fell. 
Still. 

Face-first on the stone, like a log toppled in the forest. No fanfare. No witnesses. 
Just her. 
She stood over his body for a long moment. 
Then, softly, as if remembering something from a forgotten dream, she said: 
“My name was… My name is Nyra.” 
She turned, slipped quietly out the back of the tent, and vanished into the night. 
She was never seen again — 
Not in that city, nor the steppes, 
Nor the dreams of those who still whispered his name.',
        8672,
        admin_id,
        'pending_review',
        false,
        43,
        ARRAY['pending', 'needs-review']
    );

END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count entities by status
SELECT status, COUNT(*) as count 
FROM public.canon_entities 
GROUP BY status;

-- Count stories by status
SELECT canon_status, COUNT(*) as count 
FROM public.stories 
GROUP BY canon_status;

-- Summary
SELECT 
    (SELECT COUNT(*) FROM public.canon_entities) as total_entities,
    (SELECT COUNT(*) FROM public.canon_entities WHERE status = 'proposed') as pending_entities,
    (SELECT COUNT(*) FROM public.canon_entities WHERE embedding IS NULL) as needs_hydration,
    (SELECT COUNT(*) FROM public.stories) as total_stories,
    (SELECT COUNT(*) FROM public.stories WHERE canon_status = 'pending_review') as pending_stories;
