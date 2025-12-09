-- =====================================================
-- INSERT STORIES 2, 3, 4 ENTITIES
-- Extracted from Everloop Story PDFs
-- Run in Supabase SQL Editor
-- =====================================================

DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM profiles WHERE is_admin = true LIMIT 1;
    
    -- =====================================================
    -- STORY 2: THE PRINCE AND THE DROWNING CITY
    -- =====================================================
    
    -- CHARACTERS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Auren Thorne',
        'auren-thorne',
        'character',
        'The young lord of House Thorne, also known as "The Lord of Luck." Despite being an exceptionally poor fighter who mistakes his own fumbling for tactical genius, Auren possesses genuine compassion for his people and scholarly knowledge of the Fray. He left home against his parents'' wishes to save the coastal town of Virelay. His greatest strength is his unwavering belief and genuine kindness, which led him to dive into the heart of a Fray-corrupted sea to retrieve a Shard. He survived by reaching a drowned room with a hearth containing the Third Shard.',
        'canonical',
        0.9,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Lord Thorne',
        'lord-thorne',
        'character',
        'Father of Auren Thorne, Lord of House Thorne. A loving father who, along with Lady Thorne, secretly planned to prevent Auren from traveling to Virelay, knowing his son''s genuine compassion but lacking combat ability. The Thornes oversee lands affected by trade disruptions from the Fray''s spreading influence.',
        'canonical',
        0.85,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Lady Thorne',
        'lady-thorne',
        'character',
        'Mother of Auren Thorne, Lady of House Thorne. Together with Lord Thorne, she recognized both Auren''s generous heart and his complete lack of combat prowess, leading them to plan to keep him safely home rather than let him journey to the Fray-touched town of Virelay.',
        'canonical',
        0.85,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- LOCATIONS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Virelay',
        'virelay',
        'location',
        'A coastal harbor town severely affected by the Fray. Buildings appear and disappear without warning, streets rearrange themselves, people vanish from memory only to return as if they never left. The town''s reality is in constant flux—inns gain and lose rooms, vendors are forgotten between days, and time stutters in unpredictable loops. At the center of this chaos, fishermen always cast their lines at the same spot offshore, the only constant in a town that forgets itself between heartbeats. Beneath these waters lay a Well—an ancient stone circle on the seafloor that served as the anchor point for the Fray''s influence. When Auren retrieved the Shard from beneath the sea, Virelay began to stabilize.',
        'canonical',
        0.75,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'House Thorne Manor',
        'house-thorne-manor',
        'location',
        'The ancestral home of House Thorne, featuring the Winter Room where the hearth is always full and curtains never open. The manor includes extensive grounds with gardens, training courtyards, and is staffed by servants who have watched Auren grow up. Located in lands connected by trade routes to Virelay.',
        'canonical',
        0.9,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Cracked Pot',
        'the-cracked-pot',
        'location',
        'A small tavern in a village between House Thorne and Virelay. Known for its slightly leaning walls, mismatched shutters, and welcoming atmosphere. A sign above the hearth reads: "NO SWORDS, NO SHOUTING, NO WEEPING—UNLESS IT''S A BEAUTIFUL SONG." Here Auren accidentally knocked out a drunk by "tactical descent" (falling on him), beginning his reputation for improbable victories.',
        'canonical',
        0.85,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Oar and Candle',
        'the-oar-and-candle',
        'location',
        'An inn in Virelay that exemplifies the town''s Fray-touched instability. Rooms appear and disappear, the lobby shifts between renovation states, and guests may be registered for rooms that don''t exist—or exist only sometimes. Auren claimed the lobby couch as his "room" after the building refused to acknowledge consistent reality.',
        'canonical',
        0.7,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- ARTIFACTS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Third Shard',
        'the-third-shard',
        'artifact',
        'A Shard retrieved by Auren Thorne from beneath the waters of Virelay. Found in a drowned room at the bottom of a Well—an ancient stone circle on the seafloor where all the fishing lines converged. The Shard sat within a hearth that burned underwater, shaped like obsidian but glowing red-gold and pulsing as if breathing. When Auren grasped it, he experienced a vision of a city crumbling and rebuilding, a thousand bells ringing, and the Pattern itself. As he took it, the room flooded and the Well collapsed. The Shard cooled to smooth, silent black, and Virelay''s reality stabilized.',
        'canonical',
        0.9,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Well of Virelay',
        'the-well-of-virelay',
        'artifact',
        'A perfect ring of ancient carved stone embedded in the seafloor beneath Virelay''s harbor, rimmed with glowing algae that pulsed like veins. All the fishing trap lines converged above it. The Well was not a hole but a "wound"—a gravity that called not to the body but to something beneath it. When Auren entered and removed the Shard within, the Well collapsed and its influence over Virelay ended.',
        'canonical',
        0.85,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- CONCEPTS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Scholars',
        'the-scholars',
        'faction',
        'Those who study the Shards and the Pattern. The Scholars believe the Shards were safeguards—anchors placed by the First Architects throughout the world as points of return should the weave falter. They question why a perfect loop would require safeguards, wondering what flaw the Architects saw in their own design.',
        'canonical',
        0.8,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- =====================================================
    -- STORY 3: THE BALLAD OF ROOK AND MYX
    -- =====================================================
    
    -- CHARACTERS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Rook',
        'rook',
        'character',
        'A wandering con artist and storyteller who travels with his Servine companion Myx. Abandoned by his mother at age five—left behind a butcher''s tent with a note reading "Take him somewhere kind"—after a cruel "Protector" taxed their village into desperation. This shaped his deep distrust of those who build power on fear and servitude. Rook uses stories and persuasion rather than violence, telling tales to the people to counter tyrants. He entered the interior of a Fray-corrupted black tower, solved its puzzle of ancient glyphs, and retrieved a Shard by pulling a miniature tower from its roots.',
        'canonical',
        0.9,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Myx',
        'myx',
        'character',
        'A Servine—a creature with shifting eye colors that reflect emotion and state: amber, green, violet, gold, or storm-dark. Born in fighting pits, torn from his mother before his eyes opened, beaten into violence and starved into obedience. The smallest of five, he refused to snarl even when tortured. After being thrown out as "too soft," he survived street life and was eventually befriended by young Rook with a tossed bone and the words "You''ve got good eyes. Better than mine." Servines absorb emotions, truths, and pulses of the world; this makes them fiercely loyal but vulnerable to betrayal. Myx walked into the deepest Fray to draw its chaos into a black tower, cracking it open. He communicates with Rook through telepathic impressions.',
        'canonical',
        0.9,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Sera',
        'sera',
        'character',
        'A young woman who discovered a cracked black tower and exploited its Fray-dampening effect to build power over a village. She positioned herself at the tower''s center where reality was stable, making people serve her in exchange for proximity to peace. Though she became a tyrant—threatening to have people "dragged into the square and broken"—she was ultimately motivated by fear of returning to being "nothing." After Rook exposed her manipulation and the villagers turned on her, she helped devise a plan to destroy the tower and contributed crucial knowledge about the bell tree legend.',
        'canonical',
        0.85,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- CREATURES
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Servine',
        'servine',
        'creature',
        'A species of intelligent, telepathic creatures with fur and shifting eye colors that reflect their emotional and mental state. Servines hold things—emotions, pulses of the world, truths people don''t want to speak aloud—absorbing them into their eyes and bodies. This makes them deeply loyal companions but also vulnerable to emotional harm. Some are bred in fighting pits and beaten into violence, but their natural temperament tends toward gentleness. Servines can communicate telepathically with those they''re bonded to. A Servine''s roar can freeze an entire mob. Their eyes shift through colors including amber, green, violet, gold, and storm-dark black ringed with gold.',
        'canonical',
        0.85,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- LOCATIONS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Black Tower of Sera',
        'the-black-tower-of-sera',
        'location',
        'A lean, looming obsidian spire that appeared in a Fray-touched region, humming faintly at its base where a thin fracture glowed like dying embers. The tower repelled the Fray—the closer to it, the more stable reality became. Sera exploited this to build a small tyranny. When Myx walked into the deepest Fray and returned, he cracked the tower open, revealing an entrance. Inside was infinite void where Rook floated without gravity, surrounded by ancient glyphs that required solving. At the heart was a chamber with a miniature replica of the tower, its roots writhing into the floor. When Rook pulled it free, the tower collapsed and became a Shard.',
        'canonical',
        0.8,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- ARTIFACTS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Fourth Shard',
        'the-fourth-shard',
        'artifact',
        'A Shard obtained by Rook when he entered the Black Tower and pulled a miniature replica of the tower from its roots. The shard burned his hand as it absorbed the tower''s void, fusing to his palm before cooling to smooth, slick black. When the tower collapsed, the Fray''s influence over the region ended. Rook described it as "the kind of thing that breaks the world. Or maybe puts it back together."',
        'canonical',
        0.9,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- GAMES/CONCEPTS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Everloop (Game)',
        'everloop-game',
        'concept',
        'A game played with coins, referenced by Rook and Myx as something they played together to stay warm in their early days. The game shares its name with the eternal cycle of the Pattern itself, suggesting it may have deeper cultural or mystical significance.',
        'canonical',
        0.7,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- =====================================================
    -- STORY 4: IN SERVICE OF THE VEYKAR
    -- =====================================================
    
    -- CHARACTERS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Nyra',
        'nyra',
        'character',
        'A survivor who rose from conquered slave to personal cook of the Veykar, ultimately becoming his assassin. Taken at age five when her village was destroyed, she bore a scar on her left brow and was notable for never crying—not in the brutal kitchen pits, not during years of servitude, not even when the boy she cared for was executed. She chose silence as armor, developing exceptional observational skills and culinary mastery. Over years, she became the Veykar''s confidant, teaching him subtlety through food and earning his trust. She poisoned him not for the boy''s death, but for "the price the world has paid for your dream." After speaking her name for the first time in years, she vanished and was never seen again.',
        'canonical',
        0.9,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Veykar',
        'the-veykar',
        'character',
        'A self-made conqueror who unified the eastern steppes through brutal efficiency. He had no bloodline worth boasting, only fire and will—enough to "burn a map into the grass with only the soles of his boots." He called his work "Uniting"; others called it slaughter. His philosophy was simple: serve, bend, contribute—or be forgotten. He raised pikes instead of temples, carved laws in flesh. Yet he also brought roads, protected trade, and punished raiders. His tent was decorated with the preserved hands of those who failed him. Over time, Nyra became his only true confidant, the one he asked for advice. He was poisoned by her and died face-first on the stone, "like a log toppled in the forest."',
        'canonical',
        0.9,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Crippled Boy',
        'the-crippled-boy',
        'character',
        'A young dreamer who arrived in the Veykar''s kitchens with a twisted leg and unbroken spirit. He spoke constantly of escape, freedom, and green places "where no banner flies." He carved small tokens from bone and wood, giving Nyra a tiny fox "with one leg curled under." He whispered of rebellion and the old gods. His words and dreams cracked something in Nyra''s armor of silence. When he was caught with a half-drawn escape map, the Draethan took him. Nyra confirmed his treasonous words, and he was executed—but his memory planted the seed that would eventually destroy the Veykar.',
        'canonical',
        0.85,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'Morran',
        'morran',
        'character',
        'The old master cook who served the Veykar before Nyra''s rise. Older than the knives he used, he walked with a stoop and sneered without smiling. His dishes were flawless but uninspired—always the same three things: cured stag back, spiced marrow stew, and fire-roasted root clusters. He resented Nyra''s growing skill but couldn''t harm her under the Draethan''s protection. He was eventually called into the Veykar''s tent and never returned; his preserved hand hung among the trophies on the tent wall.',
        'canonical',
        0.8,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- FACTIONS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Draethan',
        'the-draethan',
        'faction',
        'The Veykar''s sworn Brethren—his voice, ears, breath, and blood made flesh. They bore no names among slaves, only rankless presence. Their robes were cut from the hides of conquest horses, dyed with ash and pitch. Their oaths were tattooed from wrist to throat to jaw. One Draethan alone could end a conversation by entering a room. Ten could end a town. They watched everything, killed precisely, and became Nyra''s patrons after recognizing her skill. They protected her from others and brought her to the Veykar''s attention.',
        'canonical',
        0.85,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    -- LOCATIONS
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Deyune Steppe',
        'the-deyune-steppe',
        'location',
        'The vast eastern expanse of the world, beyond border stones and merchant routes, beyond the maps in western war rooms. Also called the Barren Reach or the Long Wind. The wind here is "older than language," carrying dust of bones and ash across wide-backed hills. The land bends for no man—it belongs to the sky, the animals, and those born of both. People live simply here not from lack of ambition but from understanding the cost of taming what never asked to be ruled. Clans rise and fall like tides. There are no cities, no kings—only land, clan, and weather. This is where the Veykar rose to power.',
        'canonical',
        0.85,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Wheel',
        'the-wheel',
        'location',
        'The Veykar''s moving camp, a living machine that shifted as needed but was always organized in concentric rings. Outermost: pits, latrines, stables, butcher grounds. Next: soldiers'' quarters of hide tents and bone stakes. Closer in: command tents, archives, the Draethan''s quarters. At the center: the Hall (the great kitchen) and above it, the Veykar''s tent. When the conquests were complete, the Wheel stopped turning and became the foundation of a permanent city, stone rising where once there was only brush and wind.',
        'canonical',
        0.85,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO public.canon_entities (name, slug, type, description, status, stability_rating, created_by)
    VALUES (
        'The Hall',
        'the-hall',
        'location',
        'The vast kitchen pavilion at the heart of the Veykar''s Wheel—half sunken into rock, half built upon it. Not a kitchen of comfort but of empire: fire pits and smoke channels, long troughs of chopped wood, iron grates turning raw slaughter into ceremony. Food here was politics: scraps for common soldiers, better cuts for officers, precise artistry for the Draethan, and sculpted masterpieces for the Veykar. The Hall was the engine of empire, the central artery, the final filter—what left here was not just food but offering.',
        'canonical',
        0.85,
        admin_id
    ) ON CONFLICT (slug) DO NOTHING;

END $$;

-- =====================================================
-- UPDATE EXISTING ENTITIES WITH CROSS-STORY CONNECTIONS
-- =====================================================

-- Update The Shards with information from Stories 2-4
UPDATE public.canon_entities 
SET description = description || E'\n\nThe Shards manifest differently: in Virelay, a Shard sat within an underwater hearth, burning beneath the waves. In a Fray-touched village, a Shard was revealed when a black tower collapsed inward after being exposed to concentrated Fray energy. Each Shard''s retrieval stabilizes local reality—the Fray loses its grip when a Shard is removed from its anchor point.'
WHERE slug = 'the-shards' 
  AND description NOT LIKE '%Virelay%';

-- Update The Fray with story-specific manifestations
UPDATE public.canon_entities 
SET description = description || E'\n\nThe Fray manifests differently in each region: In Virelay, it caused buildings to appear and disappear, people to be forgotten between days, and time to stutter in loops. In the Borderlands, a black tower rose that repelled the Fray at its center, making proximity to it valuable currency. The Fray twists memory, bends pain into new shapes, makes old wounds fresh—and can break even the strongest minds.'
WHERE slug = 'the-fray' 
  AND description NOT LIKE '%Virelay%';

-- Link Dreamers to the mention in Story 3 about the bell tree legend
UPDATE public.canon_entities 
SET description = description || E'\n\nLegends speak of a town in the Borderlands where a black tree with bells on every branch appeared, pulling the Fray to it like a whirlpool. The people found a way to make the tree collapse on itself through pressure and cracks—and when it fell, the Fray disappeared and time returned to normal. Similar structures—black towers and bell trees—have appeared in other Fray-touched regions.'
WHERE slug = 'dreamers' 
  AND description NOT LIKE '%Borderlands%';
