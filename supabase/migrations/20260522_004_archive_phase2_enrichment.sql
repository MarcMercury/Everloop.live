-- ============================================================
-- Phase 2: Enrich remaining archive entities + regional clusters
-- ============================================================
-- Scope:
--   1. Region assignments for remaining null-region entities
--   2. Connectivity: each regional location ↔ its region macro
--   3. Description enrichment + relationship expansion for:
--      - 8 macro region locations (the world map's spine)
--      - All remaining characters with thin descriptions
--      - All factions and concepts still under ~600 chars
--      - All creatures and monsters (with reason-for-breakage anchors)
--      - Artifacts not yet enriched
-- ============================================================

-- ------------------------------------------------------------
-- 1. REGION ASSIGNMENTS
-- ------------------------------------------------------------
-- Characters anchored to their story regions
UPDATE canon_entities SET metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('region','bellroot')
WHERE slug IN ('kaerlin','mira','thomel','alira','uncle-edran','mayor-halrick-vann','merra-dune','eidon');

UPDATE canon_entities SET metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('region','virelay')
WHERE slug IN ('auren-thorne','lord-thorne','lady-thorne','house-thorne-faction');

UPDATE canon_entities SET metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('region','deyune')
WHERE slug IN ('the-veykar','the-girl-with-the-scar','the-crippled-boy','morran','the-draethan','the-hall-veykar','the-wheel','the-deyune-steppe');

UPDATE canon_entities SET metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('region','luminous')
WHERE slug IN ('archael-viremont','the-cartographic-society-of-iterants','the-seventh-circle');

-- Monsters: anchored to regions whose breakage signature matches their form
-- (Per domain rules: monsters appear where reality broke for a reason.)
UPDATE canon_entities SET metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('region','bellroot')
WHERE slug = 'a-fever-architect-mon8k98m';
UPDATE canon_entities SET metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('region','deyune')
WHERE slug = 'birth-giant-moklvrfe';
UPDATE canon_entities SET metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('region','ashen')
WHERE slug = 'the-cleaved-mon86lvm';
UPDATE canon_entities SET metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('region','drowned')
WHERE slug = 'the-echo-mon8u4fw';
UPDATE canon_entities SET metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('region','glass')
WHERE slug = 'the-starving-silence-mon8e28l';

-- Location stragglers
UPDATE canon_entities SET metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('region','bellroot')
WHERE slug = 'the-overlook';
UPDATE canon_entities SET metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('region','virelay')
WHERE slug IN ('the-well-site','the-drowned-city');
UPDATE canon_entities SET metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('region','varnhalt')
WHERE slug IN ('varnhalt','varnhalt-frontier','thorne-manor','the-cracked-pot-tavern','the-black-tower');

-- Artifact anchor
UPDATE canon_entities SET metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('region','bellroot')
WHERE slug = 'fathers-shard';

-- ------------------------------------------------------------
-- 2. REGIONAL CONNECTIVITY: link every region location ↔ region macro
-- ------------------------------------------------------------
-- For each region: append the region-macro location id to every member's
-- related_entities, and append every member to the macro's related_entities.

WITH region_map AS (
  SELECT
    'bellroot' AS region, (SELECT id FROM canon_entities WHERE slug='the-bellroot-vale') AS macro_id UNION ALL
  SELECT 'virelay',  (SELECT id FROM canon_entities WHERE slug='virelay-coastlands') UNION ALL
  SELECT 'deyune',   (SELECT id FROM canon_entities WHERE slug='the-deyune-steppe') UNION ALL
  SELECT 'varnhalt', (SELECT id FROM canon_entities WHERE slug='varnhalt-frontier') UNION ALL
  SELECT 'ashen',    (SELECT id FROM canon_entities WHERE slug='the-ashen-spine') UNION ALL
  SELECT 'drowned',  (SELECT id FROM canon_entities WHERE slug='the-drowned-reach') UNION ALL
  SELECT 'glass',    (SELECT id FROM canon_entities WHERE slug='the-glass-expanse') UNION ALL
  SELECT 'luminous', (SELECT id FROM canon_entities WHERE slug='the-luminous-fold')
),
-- Append macro to each member
member_updates AS (
  UPDATE canon_entities ce
  SET related_entities = (
    SELECT ARRAY(SELECT DISTINCT x FROM unnest(
      COALESCE(ce.related_entities, '{}'::uuid[]) || ARRAY[rm.macro_id]
    ) AS x WHERE x <> ce.id)
  )
  FROM region_map rm
  WHERE ce.status = 'canonical'
    AND ce.type = 'location'
    AND ce.metadata->>'region' = rm.region
    AND ce.id <> rm.macro_id
    AND rm.macro_id IS NOT NULL
  RETURNING ce.id, rm.macro_id
)
-- Append all members back to the macro
UPDATE canon_entities ce
SET related_entities = (
  SELECT ARRAY(SELECT DISTINCT x FROM unnest(
    COALESCE(ce.related_entities, '{}'::uuid[]) || agg.member_ids
  ) AS x WHERE x <> ce.id)
)
FROM (
  SELECT macro_id, array_agg(id) AS member_ids
  FROM member_updates
  GROUP BY macro_id
) agg
WHERE ce.id = agg.macro_id;

-- Also link each region's resident characters/factions/monsters to the macro
WITH region_map AS (
  SELECT 'bellroot' AS region, (SELECT id FROM canon_entities WHERE slug='the-bellroot-vale') AS macro_id UNION ALL
  SELECT 'virelay',  (SELECT id FROM canon_entities WHERE slug='virelay-coastlands') UNION ALL
  SELECT 'deyune',   (SELECT id FROM canon_entities WHERE slug='the-deyune-steppe') UNION ALL
  SELECT 'varnhalt', (SELECT id FROM canon_entities WHERE slug='varnhalt-frontier') UNION ALL
  SELECT 'ashen',    (SELECT id FROM canon_entities WHERE slug='the-ashen-spine') UNION ALL
  SELECT 'drowned',  (SELECT id FROM canon_entities WHERE slug='the-drowned-reach') UNION ALL
  SELECT 'glass',    (SELECT id FROM canon_entities WHERE slug='the-glass-expanse') UNION ALL
  SELECT 'luminous', (SELECT id FROM canon_entities WHERE slug='the-luminous-fold')
),
non_loc AS (
  UPDATE canon_entities ce
  SET related_entities = (
    SELECT ARRAY(SELECT DISTINCT x FROM unnest(
      COALESCE(ce.related_entities, '{}'::uuid[]) || ARRAY[rm.macro_id]
    ) AS x WHERE x <> ce.id)
  )
  FROM region_map rm
  WHERE ce.status='canonical'
    AND ce.type IN ('character','faction','monster','creature','artifact')
    AND ce.metadata->>'region' = rm.region
    AND rm.macro_id IS NOT NULL
  RETURNING ce.id, rm.macro_id
)
UPDATE canon_entities ce
SET related_entities = (
  SELECT ARRAY(SELECT DISTINCT x FROM unnest(
    COALESCE(ce.related_entities, '{}'::uuid[]) || agg.ids
  ) AS x WHERE x <> ce.id)
)
FROM (SELECT macro_id, array_agg(id) AS ids FROM non_loc GROUP BY macro_id) agg
WHERE ce.id = agg.macro_id;

-- ------------------------------------------------------------
-- 3. DESCRIPTION ENRICHMENT — 8 MACRO REGION LOCATIONS
-- ------------------------------------------------------------

UPDATE canon_entities SET description =
'The forested heart of the Everloop''s western reach — a temperate vale of slow rivers, old-growth oak, and bell-marked clearings where the Pattern still feels close to the surface. The Vale was once the sanctuary of the Dreamers, and before the Fray its towns kept time by the resonance of buried Anchor-stones. Today it is the most stable region outside the Luminous Fold, in part because the Second Shard of the Pattern was recovered here from the Bell Tree in Drelmere. Bellroot Crossing serves as its administrative seat; Drelmere is its symbolic centre. The First Root Chamber, beneath the Old Bellroot Site, is older than any written record — Vaultkeepers believe it predates the Weaving itself. The Vale is where the siblings Kaerlin, Mira, and Thomel began their quest after their mother Alira''s death, and where Eidon the last Dreamer chose to unfold.'
WHERE slug='the-bellroot-vale';

UPDATE canon_entities SET description =
'The salt-wracked coastal region west of the Bellroot Vale, where towns cling to cliffs and cove-mouths along a fractal shoreline the maps cannot quite agree on. Virelay''s identity is built on three things: the sea, the bells that warn of fog, and the Underwater Well — the ring of carved stone beneath the harbor that pulsed with the Third Shard of the Pattern until Auren Thorne dove for it. The coast hosts the only port culture in the Everloop, and its fishing fleets keep the inland regions fed. Trade with House Thorne built the inland villas; the Drowned City offshore, visible only at the lowest tides, is older than House Thorne by an order of magnitude no one is comfortable discussing. The Loosening is felt strongly here — sailors say the same harbor is never quite the same harbor twice.'
WHERE slug='virelay-coastlands';

UPDATE canon_entities SET description =
'The vast wind-swept eastern grassland — called the Barren Reach or the Long Wind by those who live on it. No cities, no kings: only the land, the clan, and the weather. The Deyune Steppe was the Veykar''s domain. From the moving stone-and-bone camp of The Wheel he stitched together an empire by the blade and ruled it from The Hall, served by the Draethan and ultimately undone by the silent cook known only as The Girl With the Scar. Before the Veykar the Steppe was an older country still: the Karak stones at the Old Karak Stones site and the Standing Teeth predate any clan memory and align with Pattern geometries the Luminous Fold''s surveyors cannot fully resolve. Time Instability is severe here — entire seasons can pass between two settlements without agreement on how many.'
WHERE slug='the-deyune-steppe';

UPDATE canon_entities SET description =
'A rough feudal sprawl of plains, mesas, dry forests, and crossroad towns — the densest yet most decentralised civilisation in the Everloop. The Frontier has no central authority; the town of Varnhalt holds the name and a courthouse, but real power follows trade roads, market days, and the families that protect them. The region''s defining structure is the Black Stone Tower in the eastern hills — a smooth obsidian spire that repels the Fray for a measurable distance around itself. Sera built her settlement around it. Rook, his bonded Servine Myx, and the events at the Tower belong to this region. Outside the Tower''s small island of stability, the Loosening is constant: roads loop, mile markers contradict, and travellers learn early to trust their own pacing over any map drawn more than a Cycle ago.'
WHERE slug='varnhalt-frontier';

UPDATE canon_entities SET description =
'A long chain of black-rock mountains running north-to-south, threaded with iron veins, sulphur vents, and the oldest working forges in the world. The Ashen Spine''s settlements are forge-towns and quarries — Ironmark and Old Varr the largest, Rookforge and Black Hammer Forge the most respected. Smoke is the regional climate. The Spine is one of the regions where the Fray''s damage is most physical: cracks open in the rock without warning, sometimes vomiting heat that has no source, sometimes simply revealing tunnels that did not exist the day before. Vaultkeepers believe the Spine sits over a fracture-line in the First Map, and the monster known as The Cleaved is the regional consequence of that break. Forge guilds keep records that go back further than anyone outside the region is allowed to read.'
WHERE slug='the-ashen-spine';

UPDATE canon_entities SET description =
'A drowning coast — half-archipelago, half-salt-marsh — where the sea is steadily reclaiming what was once dry land. The Drowned Reach is the youngest region by recorded history and the oldest by what lies beneath its tides. The Sunken City, accessible only by deep dive at slack water, is one of the few intact pre-Weaving urban sites known to the Vaultkeepers. Tide-towns like Sunken Port, Lowwater, and New Harbor rebuild themselves on stilts every generation. The monster called The Echo haunts the deeper channels — domain rules say the Reach broke here because too many memories were drowned at once, and the Echo is what surfaces when memory tries to reassemble itself without a body. The Cartographic Society of Iterants keeps a permanent expedition based at Flood Station.'
WHERE slug='the-drowned-reach';

UPDATE canon_entities SET description =
'A high desert of fused silica and standing prism-stones — flat in places, ridged in others, scattered with shard-fields that catch the sun and throw it back as colour. The Glass Expanse is the most visually unstable region in the Everloop: light bends here in ways the Pattern cannot quite hold, and the air itself sometimes refracts a scene from a different hour. Prism City is its capital and largest settlement; Clearline, Vell Glass, and Twinmark are its working towns. Echo Ruins predates the Weaving. The monster known as The Starving Silence is the regional Fray-consequence — born where light shattered the same way too many times in the same place. The Knowledge Fragmentation Principle was first formalised by Glass Expanse philosophers a generation before the Luminous Fold accepted it.'
WHERE slug='the-glass-expanse';

UPDATE canon_entities SET description =
'The most ordered region of the Everloop and the seat of the Luminous Fold civilisation — a high plateau of measured roads, gridded settlements, and concentric institutions. The Fold''s capital, Lumina, surrounds the Grand Archive at the Central Fold, and from there the Seven Circles of Archivist scholarship and the Iterant traditions of the Dreamers radiate outward through Order Field, the Even Table, Symmetry, and the Quiet Line. The Fold''s great error and great gift is the same conviction: that reality is one thing and may be wholly described. The Cartographic Society of Iterants and the senior Archivist Archael Viremont push, quietly and from inside, against that assumption. The Loosening and Time Instability are weakest here, which is why the Fold''s clocks feel definitive — and why their definitive feel is misleading.'
WHERE slug='the-luminous-fold';

-- ------------------------------------------------------------
-- 4. CHARACTERS — REMAINING THIN DESCRIPTIONS
-- ------------------------------------------------------------

UPDATE canon_entities SET description =
'Mother of Kaerlin, Mira, and Thomel and widow of the man who first found Father''s Shard at the edge of the Overlook. Alira was a tall, strong storyteller whose voice "built a world out of words" — the kind of woman who could quiet a room of arguing villagers by beginning a tale at half-volume. After her husband''s disappearance into the Fray she kept his Shard hidden, raised her three children with her brother Uncle Edran, and spent her last years telling the children what she had learned from the Dreamers about the Pattern, the Fray, and the Shards before her death. She told the truth in fragments, the way she told stories — knowing the children would only understand the whole of it once she was gone. Her death in the Bellroot Vale is what set the siblings'' quest in motion.'
WHERE slug='alira';

UPDATE canon_entities SET description =
'Auren''s father and Lord of House Thorne — a quiet, watchful man who runs the family''s holdings from Thorne Manor with the unfussy competence of someone who has never needed to prove anything. He knows his son Auren Thorne is a brilliant heart wrapped around an exceptionally bad swordsman, and he knows it the way a parent knows the weather. He and Lady Thorne see Auren''s "escape" from the Manor on the night the Fray reaches Virelay and let him go — not because they are willing to lose him, but because they recognise that a courage like Auren''s cannot be kept indoors without being broken. House Thorne''s trade lines with the Virelay Coastlands are crumbling under the Fray''s pressure, and Lord Thorne carries that quiet weight without naming it.'
WHERE slug='lord-thorne';

UPDATE canon_entities SET description =
'Auren''s mother and Lady of House Thorne — warm, sharp, and afraid in a way she never lets her son Auren Thorne see. Lady Thorne runs the social and diplomatic life of the House and knows every family along the Virelay Coastlands by name. She watches Auren tiptoe past the guard Brennick on the night he leaves and does not call out, even though she could. She and Lord Thorne share a single look across the Winter Room as the gate closes — the look of parents who have decided that loving their son includes letting him become whatever the world is about to make of him. Her grief is private; her composure, the kind that holds an entire House together while its trade lines fail.'
WHERE slug='lady-thorne';

UPDATE canon_entities SET description =
'Heir of House Thorne and the unlikeliest hero of the Everloop''s western coast — a charming, bumbling young lord called "The Lord of Luck" for his habit of accidentally winning fights he should have lost. Auren is a brilliant heart wrapped around the worst sword arm in the Virelay Coastlands, and he knows it. When the Fray reaches the Coastlands and House Thorne''s trade lines fail, he slips past Brennick the gate-guard, stops at the Cracked Pot Tavern (knocking out a drunk by tripping into him), and rides for Virelay to do what no trained fighter has managed: dive for the Third Shard of the Pattern beneath the Underwater Well. He returns carrying the Shard, the city, and an inheritance he was not raised to want. His parents Lord Thorne and Lady Thorne watched him go and let him.'
WHERE slug='auren-thorne';

UPDATE canon_entities SET description =
'Middle of the three Bellroot siblings — a brilliant cartographer and analyst with a restless mind and her mother Alira''s sharp tongue. Mira keeps the maps. She was the first to notice that the Bell Tree''s roots in Drelmere mirrored the town''s shifted layout above ground; she was the one who cross-referenced the cave engravings against the markings on the bells; and she was the one who almost missed the answer because she over-thought it while her sister Kaerlin solved it by reading the symbols simply. Mira charts the Fray''s distortions across the Bellroot Vale with a precision the Luminous Fold''s surveyors would respect. She and her younger brother Thomel are the two halves Kaerlin steers between — analysis and compassion — and the quest needs both.'
WHERE slug='mira';

UPDATE canon_entities SET description =
'Youngest of the three Bellroot siblings — quiet, watchful, and built for the patience his sisters cannot quite reach. Thomel stayed behind in the family cottage to care for their mother Alira in her final season, and he stayed again afterwards to look after their Uncle Edran while Kaerlin and Mira moved between Drelmere and Halrick''s Reach. He is a natural tracker and a natural mediator — famously, he convinced the hermit Eidon to leave Watcher''s Hill not by argument but by an elaborate metaphor about soup, Everfern, and the proper order of folding a drawer. Thomel''s compassion is the gravity that keeps the siblings from flying apart; without him, Kaerlin''s steadiness and Mira''s sharpness would have nothing to circle around.'
WHERE slug='thomel';

UPDATE canon_entities SET description =
'The siblings'' uncle — a gruff, weather-creased man who raised Kaerlin, Mira, and Thomel alongside their mother Alira in the family cottage near the Overlook. Edran was a pragmatist by inheritance and by need: the kind of Bellroot villager who calls Fray-talk "dangerous dreaming" and means it. He spent years dismissing the warnings Alira passed down from the Dreamers, and he spent his last conversation with Kaerlin admitting he had been wrong — giving her his blessing to continue what her parents had started. Strong but not gentle, slow to praise and slower to forgive, Edran is the household''s anchor and its argument. The children loved him in spite of him, which is how he preferred it.'
WHERE slug='uncle-edran';

UPDATE canon_entities SET description =
'Mayor of Drelmere, former soldier of the Bellroot militia, and the town''s most dignified contradiction. Halrick Vann polishes his boots each morning, presides over council with a soldier''s posture, and publicly refuses to acknowledge that the Fray exists. Privately, he spent two Cycles studying the Bell Tree in his study behind locked doors and recognised — alone — that the spiral markings on its bells matched the engravings inside the cave beneath Drelmere. He gave Kaerlin the key without ever saying out loud what he had figured out. The siblings entered the cave because Halrick told them the order. He still refuses to admit the Fray exists; the Bellroot Vale is alive because of the man who refuses to admit why.'
WHERE slug='mayor-halrick-vann';

UPDATE canon_entities SET description =
'The apothecary, midwife, and practical conscience of Drelmere — silver braid, pine and herb on her clothes, hands that have delivered half the children in the Bellroot Vale and helped the other half remember their names after the Fray took them. Merra is the voice of pragmatic caution in the siblings'' circle. She is the one who introduced Kaerlin, Mira, and Thomel to Eidon, the last Dreamer; she is also the one who asked aloud whether the Fray was something to be fought at all, or something to be lived through differently. Her question is the one the siblings carry without an answer. Merra does not believe in the Pattern the way the Vaultkeepers do; she believes in keeping people alive long enough to make their own decisions.'
WHERE slug='merra-dune';

UPDATE canon_entities SET description =
'The old head cook of the Veykar before the girl rose to take his place — a stooped, sour man who sneered without smiling and turned out flawless food that tasted of nothing. Morran resented The Girl With the Scar from the moment her bread came out better than his. He resented her quietly, then loudly, then dangerously. He was called to the Veykar''s tent on a winter night and never came back; his severed hand was nailed to the Hall''s wall the next morning as a quiet message about replacement. Morran is the small, ugly hinge the Veykar saga turns on — the cook whose envy created the vacancy his successor stepped into, and whose death taught her exactly what kind of king she now served.'
WHERE slug='morran';

UPDATE canon_entities SET description =
'A young man dragged into the Veykar''s kitchens with a twisted leg — fire and wind personified, foolish and stubborn and full of whispers about escape, freedom, and the routes north of the Deyune Steppe. He carved a tiny wooden fox from kitchen scraps and gave it to the silent cook who would become The Girl With the Scar. It was the first gift she had received since the burning of her village. He was caught with a half-drawn escape map tucked into his belt, dragged to the centre of The Wheel, and executed by the Draethan in front of the kitchens he had tried to leave. His death is the moment the girl''s grief became a plan; the wooden fox sat on her shelf for every meal she cooked afterwards, including the last one she served the Veykar.'
WHERE slug='the-crippled-boy';

UPDATE canon_entities SET description =
'The conquering warlord of the Deyune Steppe — no bloodline, no inherited name, only a claim taken by the blade and made permanent by The Wheel and The Hall. The Veykar spoke of unity and enforced it through slaughter. He built roads, protected trade, and forced a hundred clans into something that looked from a distance like a state. He kept the Draethan close, trusted no one except the silent cook who served his meals, and was poisoned by her in a quiet, unhurried act of justice for every village he had erased — beginning with hers. The Veykar saga is the Everloop''s study of order purchased with cruelty: how much civilisation can be built on slaughter before the slaughter becomes the civilisation. The Steppe remembers him by silence, which was always his real language.'
WHERE slug='the-veykar';

-- ------------------------------------------------------------
-- 5. FACTIONS — THIN ONES
-- ------------------------------------------------------------

UPDATE canon_entities SET description =
'The noble House of the Virelay Coastlands — old enough to remember when the Coast had three lighthouses, young enough that everyone alive can name its current Lord and Lady. House Thorne rules from Thorne Manor with the quiet authority of a family that has never needed to wave its name around. Lord Thorne runs the holdings; Lady Thorne runs the diplomacy; their son Auren Thorne — charming, bumbling, exceptionally bad at fighting, exceptionally hard to dislike — was supposed to inherit a peaceful house. Instead he inherited the Fray. The Thornes'' trade lines with Virelay are crumbling under the Fray''s pressure, and the family''s real wealth now is the loyalty of the coastal villages they have stood by. When Auren slipped away on the night the Coastlands shook, his parents watched him go and did not stop him — which is the truest portrait of the House there is.'
WHERE slug='house-thorne-faction';

UPDATE canon_entities SET description =
'The forerunners of the Weaving — whether mortal, half-mortal, or something in between, the First Architects were the ones who pinned the world down during the Dawn. They built monuments of intent: towers that hummed, stones that pulsed, maps that bled when torn. From their hands came the First Map, and from the First Map came the Pattern that holds the Everloop together. The Vaultkeepers preserve what little is recorded of them; the Luminous Fold has classified what little remains. Two things are not in dispute: the First Architects'' work made the world stable enough to be lived in, and their work also seeded the flaw that became the Fray. Whether the flaw was an error or an intentional door has been the central argument of every scholar of the Pattern since.'
WHERE slug='the-first-architects';

UPDATE canon_entities SET description =
'Those who can see the Pattern — not merely feel it, the way Vaultkeepers do, but watch its threads fold and fray in real time. The Dreamers can sometimes move what they see. The cost is the body: the deepest Dreamers lose themselves before their minds, becoming presences trapped in moments; others keep walking but no longer agree with the time around them. Before the Fray, Drelmere in the Bellroot Vale was their sanctuary, and the Bellroot Vale was their working ground. Now the Dreamer tradition survives only in fragments — in the Luminous Fold''s Iterant order, in the Cartographic Society of Iterants, in scattered hermits, and most poignantly in Eidon, the last of the old line, who chose to unfold in the cave beneath Drelmere rather than be the last of anything.'
WHERE slug='the-dreamers';

UPDATE canon_entities SET description =
'Guardians of the gaps — those who look between the threads of the Pattern, into the Time Before the First Map was woven. The Vaultkeepers are the older counterpart to the Dreamers: where Dreamers move the weave, Vaultkeepers preserve and read it. The Luminous Fold''s Archivist tradition is the institutional descendant of this older order, and the Grand Archive in Lumina is the Vaultkeepers'' most ambitious surviving project. The Vaultkeepers once believed memory was a circle and nothing truly ended. The Fray taught them otherwise. Now their oldest members whisper of things not written in any loop — of the Prime Beings, of the Dawn, and of the parts of the world that were paved over by the Weaving rather than created by it.'
WHERE slug='the-vaultkeepers';

UPDATE canon_entities SET description =
'The Veykar''s sworn Brethren — his voice, his ears, his breath, his blood made flesh. The Draethan bore no names among the slaves of The Wheel. Their robes were cut from conquered horses, dyed with ash and pitch. Their oaths were tattooed in unbroken lines from wrist to throat to jaw. A single Draethan walking into a room could end a conversation; ten Draethan could end a town. They served as patrons for the silent kitchen-girl who would become The Girl With the Scar, recognising in her the talent that would eventually carry the Veykar''s favour and, in time, his death. The Draethan died with him, or scattered into clans that no longer admit to having been Draethan. On the Deyune Steppe, the word is still occasionally spat — and still occasionally feared.'
WHERE slug='the-draethan';

-- ------------------------------------------------------------
-- 6. CONCEPTS — THIN ONES
-- ------------------------------------------------------------

UPDATE canon_entities SET description =
'The age before shape — before names, maps, or time dared call itself time. There was only drift. Mountains walked like beasts, rivers unspooled into the sky, the wind forgot where it came from. The Prime Beings roamed this primal dream: hunger, storm, ash, birth — forces, not gods. Out of the Dawn came the First Architects, who pinned the world down through the Weaving and produced the First Map, the Pattern, and ultimately the Everloop. The Dawn is the world before the Pattern began telling it what to be. Vaultkeepers say the Fray is the Dawn returning through the cracks in the Weaving; the Luminous Fold prefers a more orderly account. Both are partly right, which is the Knowledge Fragmentation Principle in action.'
WHERE slug='the-dawn';

UPDATE canon_entities SET description =
'The act of the First Architects making order from the primal drift of the Dawn. They built anchors — towers that hummed, stones that pulsed, maps that bled when torn — and from those anchors the Pattern emerged, and from the Pattern the Everloop. The Weaving was not creation so much as restraint: it told the world what shape to keep, and the world, mostly, kept it. The Vaultkeepers were the first scholars of the Weaving; the Luminous Fold institutionalised that scholarship. Every Anchor still standing — the First Root Chamber under the Old Bellroot Site, the Karak stones on the Deyune Steppe, the Black Stone Tower on the Varnhalt Frontier, the Underwater Well off Virelay — is a working remnant of the Weaving, and every Anchor is one of the points where the Fray now leaks through.'
WHERE slug='the-weaving';

UPDATE canon_entities SET description =
'The perfect lattice of time and space made by the First Architects through the Weaving — a symmetry so absolute that even memory could rest within its folds. A song sung forever. A world without an ending, because ending itself had been woven out. Inside the Everloop, seasons returned when they should, the sun rose at the agreed hour, and decay and renewal became clockwork. The Luminous Fold treats the Everloop as the descriptive truth of reality; the Vaultkeepers know it is also a cage. The Prime Beings of the Dawn are trapped beneath it, the Dreamers can feel its threads, and the Fray is what happens when the song begins to forget itself. The Everloop is the name of both the world and the system the world is hung on — which is exactly the ambiguity the storytelling platform is built around.'
WHERE slug='the-everloop';

UPDATE canon_entities SET description =
'What exists beneath the Everloop — a place without shape or sequence, where discarded possibilities gather like dust in a closed book. Not before, not after, only between. The Fold is not evil and may not be alive in any sense the Luminous Fold''s Archivists would accept, but it listens, and it sometimes answers. Each time a Shard of the Pattern is unearthed, the Fold stirs. Each time the Fray widens, the Fold leaks. Some Vaultkeepers and most Dreamers believe the Fray is not the failure of the weave but its awakening — and that the Fold is waiting, patient as forgetting, to set the Everloop free of itself. Whether that freedom is mercy or annihilation is the question every Shard-bearer eventually has to answer for themselves.'
WHERE slug='the-fold';

UPDATE canon_entities SET description =
'A popular Everloop card game played on a spiral board with ninety cards — Score cards, Modifiers, and FRAY setups. The goal is to hold the highest Personal Score when the Table Score lands exactly on 100. Players form loops, use Modifiers to reverse, double, or share scores, and can spring FRAY traps that void entire rounds and erase opponents'' gains. Rook is a master of the game; his use of FRAY traps to empty other players'' totals is part of how he keeps himself fed in Sera''s settlement and along the Varnhalt Frontier. The card game is also a deliberate in-world miniature of the larger Pattern/Fray dynamic — order accumulated, then upended by an unstable structure that was always part of the deck.'
WHERE slug='everloop-card-game';

-- ------------------------------------------------------------
-- 7. CREATURES & MONSTERS — RELATIONSHIP ANCHORS
-- ------------------------------------------------------------

UPDATE canon_entities SET description =
'A rare species resembling a cross between a leopard and a large dog — sleek, muscular, silent, the size of a small pony. Their most distinctive trait is eyes that change colour with emotion, memory, and trust: amber at dusk, copper when wary, deep green in love. Servines do not vocalise; they communicate through presence and thought-shapes that imprint on those they bond with. They were bred and abused in fighting pits across the Varnhalt Frontier before the practice was driven underground. The bonded Servine of the con-artist Rook, named Myx, is the best-known surviving member of the species — and the proof that what was sold as a weapon was always a companion. The Cartographic Society of Iterants has petitioned the Luminous Fold to recognise the Servine as a person under Fold law; the petition has been "in review" for two Loops.'
WHERE slug='servine';

UPDATE canon_entities SET description =
'The ancient forces that roamed the world during the Dawn — not gods, but elemental presences: hunger, storm, ash, birth. They whispered through roots and rumbled beneath stone. They did not name themselves and were never named in any Pattern. When the First Architects performed the Weaving and laid the First Map across the world, the Prime Beings were pinned underneath the Pattern rather than removed from it. They did not die. The Vaultkeepers, who study the Time Before, claim the Prime Beings are still there — pressed flat beneath the Everloop, occasionally shifting when a Shard moves. Some scholars associate specific Fray-monsters with specific Primes leaking through. The Cartographic Society of Iterants treats this as a working hypothesis; the Luminous Fold treats it as heresy.'
WHERE slug='the-prime-beings';

UPDATE canon_entities SET description =
COALESCE(description, '') || E'\n\nReason for Breakage: A Fever Architect appears in the Bellroot Vale where the Pattern''s organising impulse has misfired into uncontrolled growth — typically near a partially-collapsed Anchor or an Overlook-adjacent settlement. The Vaultkeepers read it as a Prime Being of birth leaking through a Weaving-fault: the urge to build with no map to build against. Where one walks, the Vale grows wrong.'
WHERE slug='a-fever-architect-mon8k98m' AND description NOT LIKE '%Reason for Breakage%';

UPDATE canon_entities SET description =
COALESCE(description, '') || E'\n\nReason for Breakage: Birth Giants form on the Deyune Steppe over old battlefields the Veykar erased without recording — places where the Pattern was asked to forget too many bodies at once. The Cartographic Society of Iterants has charted Birth Giant sightings against the Veykar''s known atrocity sites and found the correlation closer than the Luminous Fold is comfortable acknowledging.'
WHERE slug='birth-giant-moklvrfe' AND description NOT LIKE '%Reason for Breakage%';

UPDATE canon_entities SET description =
COALESCE(description, '') || E'\n\nReason for Breakage: The Cleaved appears in the Ashen Spine where the First Map''s fault-line runs closest to the surface — typically inside or near a working forge whose hammer-rhythm has carried unbroken for generations. Vaultkeepers theorise the Cleaved is what happens when the Pattern is forced to split between two equally insistent realities: the forge''s answer, and the answer of the rock the forge is built on.'
WHERE slug='the-cleaved-mon86lvm' AND description NOT LIKE '%Reason for Breakage%';

UPDATE canon_entities SET description =
COALESCE(description, '') || E'\n\nReason for Breakage: The Echo haunts the deeper channels of the Drowned Reach, especially around the Sunken City and Drowned City sites — places where entire populations were drowned faster than memory could be carried out. Domain rule: the Echo is what surfaces when memory tries to reassemble itself without a body to live in. Where one is seen, a Shard is usually within a day''s walk.'
WHERE slug='the-echo-mon8u4fw' AND description NOT LIKE '%Reason for Breakage%';

UPDATE canon_entities SET description =
COALESCE(description, '') || E'\n\nReason for Breakage: The Starving Silence forms in the Glass Expanse where light has shattered the same way too many times in the same place — typically near Echo Ruins or an abandoned prism-grove. Its many mouths cannot speak because the Pattern broke there in a frequency the throat cannot reach. Knowledge Fragmentation Principle scholars cite the Silence as evidence that some truths are not merely incomplete but actively self-cancelling.'
WHERE slug='the-starving-silence-mon8e28l' AND description NOT LIKE '%Reason for Breakage%';

-- ------------------------------------------------------------
-- 8. ARTIFACTS — REMAINING
-- ------------------------------------------------------------

UPDATE canon_entities SET description =
'A shard of smooth black glass, etched with soft curves like veins in a leaf, faintly warm to the touch. Found by Kaerlin''s father at the edge of the Overlook during the first Bellroot Vale expedition into the Fray. He said it hummed in his hand and that he could feel the Everloop beneath it — the lattice the Pattern is hung on. He disappeared into the Fray on his second expedition, and the Shard returned to the family cottage in his pocket, the way only Shards seem able to. Alira kept it hidden until her death; Kaerlin has carried it since. Father''s Shard pulses when brought near the Bell Tree or any other Shard, recognising a sibling. It is the smallest of the recovered Shards and the most personal — the one that started everything for the three children.'
WHERE slug='fathers-shard';

UPDATE canon_entities SET description =
'A living tapestry sewn from starlight, bone, and breath by the First Architects in the closing moment of the Weaving. The First Map does not merely describe reality — it makes it. Time stitched itself into loops and cycles because the First Map said it could. The Pattern is the First Map read backwards. The Everloop is the First Map sung forward. When the Map shattered — the Vaultkeepers say it was broken from outside, the Luminous Fold says it tore from within, the Dreamers say it chose — its fragments became the Shards of the Pattern, and the breaking of the world by the Rogue Architects became the event later called the Fray. Whether the Map can be reassembled, and whether reassembling it would heal the Everloop or end it, is the gravitational centre of every story told in this world.'
WHERE slug='the-first-map';

-- ------------------------------------------------------------
-- 9. RELATIONSHIPS — final stitching for newly enriched entities
-- ------------------------------------------------------------

-- Story 4 (Veykar cluster) inter-links
UPDATE canon_entities SET related_entities = (
  SELECT ARRAY(SELECT DISTINCT x FROM unnest(
    COALESCE(related_entities,'{}'::uuid[]) || (
      SELECT array_agg(id) FROM canon_entities
      WHERE slug IN ('the-veykar','the-girl-with-the-scar','the-crippled-boy','morran','the-draethan','the-hall-veykar','the-wheel','the-deyune-steppe')
    )
  ) AS x WHERE x <> canon_entities.id)
)
WHERE slug IN ('the-veykar','the-girl-with-the-scar','the-crippled-boy','morran','the-draethan','the-hall-veykar','the-wheel');

-- House Thorne / Auren / Coastlands
UPDATE canon_entities SET related_entities = (
  SELECT ARRAY(SELECT DISTINCT x FROM unnest(
    COALESCE(related_entities,'{}'::uuid[]) || (
      SELECT array_agg(id) FROM canon_entities
      WHERE slug IN ('auren-thorne','lord-thorne','lady-thorne','house-thorne-faction','thorne-manor','the-cracked-pot-tavern','virelay','virelay-coastlands','the-underwater-well')
    )
  ) AS x WHERE x <> canon_entities.id)
)
WHERE slug IN ('auren-thorne','lord-thorne','lady-thorne','house-thorne-faction','thorne-manor');

-- Bellroot family cluster
UPDATE canon_entities SET related_entities = (
  SELECT ARRAY(SELECT DISTINCT x FROM unnest(
    COALESCE(related_entities,'{}'::uuid[]) || (
      SELECT array_agg(id) FROM canon_entities
      WHERE slug IN ('kaerlin','mira','thomel','alira','uncle-edran','fathers-shard','the-overlook','watchers-hill','drelmere')
    )
  ) AS x WHERE x <> canon_entities.id)
)
WHERE slug IN ('alira','uncle-edran','mira','thomel');

-- Monsters → their regions + the Fray + the Pattern + relevant landmarks
UPDATE canon_entities SET related_entities = (
  SELECT ARRAY(SELECT DISTINCT x FROM unnest(
    COALESCE(related_entities,'{}'::uuid[]) || (
      SELECT array_agg(id) FROM canon_entities
      WHERE slug IN ('the-fray','the-pattern','the-fold','the-bellroot-vale','the-overlook')
    )
  ) AS x WHERE x <> canon_entities.id)
)
WHERE slug='a-fever-architect-mon8k98m';

UPDATE canon_entities SET related_entities = (
  SELECT ARRAY(SELECT DISTINCT x FROM unnest(
    COALESCE(related_entities,'{}'::uuid[]) || (
      SELECT array_agg(id) FROM canon_entities
      WHERE slug IN ('the-fray','the-pattern','the-fold','the-deyune-steppe','the-veykar','the-cartographic-society-of-iterants')
    )
  ) AS x WHERE x <> canon_entities.id)
)
WHERE slug='birth-giant-moklvrfe';

UPDATE canon_entities SET related_entities = (
  SELECT ARRAY(SELECT DISTINCT x FROM unnest(
    COALESCE(related_entities,'{}'::uuid[]) || (
      SELECT array_agg(id) FROM canon_entities
      WHERE slug IN ('the-fray','the-pattern','the-fold','the-ashen-spine','ironmark','black-hammer-forge','the-first-map')
    )
  ) AS x WHERE x <> canon_entities.id)
)
WHERE slug='the-cleaved-mon86lvm';

UPDATE canon_entities SET related_entities = (
  SELECT ARRAY(SELECT DISTINCT x FROM unnest(
    COALESCE(related_entities,'{}'::uuid[]) || (
      SELECT array_agg(id) FROM canon_entities
      WHERE slug IN ('the-fray','the-pattern','the-fold','the-drowned-reach','the-sunken-city','the-drowned-city','the-shards-of-the-pattern')
    )
  ) AS x WHERE x <> canon_entities.id)
)
WHERE slug='the-echo-mon8u4fw';

UPDATE canon_entities SET related_entities = (
  SELECT ARRAY(SELECT DISTINCT x FROM unnest(
    COALESCE(related_entities,'{}'::uuid[]) || (
      SELECT array_agg(id) FROM canon_entities
      WHERE slug IN ('the-fray','the-pattern','the-fold','the-glass-expanse','echo-ruins','knowledge-fragmentation-principle')
    )
  ) AS x WHERE x <> canon_entities.id)
)
WHERE slug='the-starving-silence-mon8e28l';

-- Symmetry pass for everything updated in this migration
WITH outbound AS (
  SELECT id AS src, unnest(related_entities) AS tgt
  FROM canon_entities
  WHERE status='canonical' AND related_entities IS NOT NULL
),
inbound AS (
  SELECT tgt, array_agg(src) AS sources
  FROM outbound
  GROUP BY tgt
)
UPDATE canon_entities ce
SET related_entities = (
  SELECT ARRAY(SELECT DISTINCT x FROM unnest(
    COALESCE(ce.related_entities,'{}'::uuid[]) || inb.sources
  ) AS x WHERE x <> ce.id)
)
FROM inbound inb
WHERE ce.id = inb.tgt;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
