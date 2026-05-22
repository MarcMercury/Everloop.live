-- =====================================================
-- 20260522_003 Archive Description Enrichment
-- =====================================================
-- Expands the descriptions on key entities (factions, cosmological concepts,
-- hub characters, central artifacts, regional capitals) so that:
--   1. Connections to other entities are mentioned by name and become
--      Wikipedia-style links via lib/utils/entity-linkify.
--   2. The Shard Doctrine and Fray-as-consequence design principles are
--      reflected explicitly in the entries that anchor them.
--   3. Readers can travel the Archive from any starting point and be pulled
--      into adjacent threads.
--
-- Original short descriptions are preserved opening lines so the seeder
-- diff is meaningful, not a wholesale rewrite.
-- =====================================================

BEGIN;

-- ----- COSMOLOGY CONCEPTS -----

UPDATE canon_entities SET description =
'The age before shape — before names, maps, or time dared call itself time. There was only drift. Mountains walked like beasts, rivers unspooled into the sky, the wind forgot where it came from. The Prime Beings roamed this primal dream, formless and unbound.

The First Architects emerged during the Dawn to pin the world down, beginning the Weaving that would become the Pattern and ultimately the Everloop. To speak of the Dawn is to speak of the moment before structure existed, when reality had not yet agreed to behave. Every fracture in the Pattern — the Fray, the Loosening, the slow grinding of Hollows — is in some sense an attempt by the Dawn to return.'
WHERE slug = 'the-dawn';

UPDATE canon_entities SET description =
'The act of the First Architects creating order from the primal drift of the Dawn. They built anchors — towers that hummed, stones that pulsed, maps that bled when torn. From the Weaving came the Pattern, and from the Pattern came the Everloop.

The Weaving was not creation so much as restraint — a binding of the Prime Beings and the wider Drift into something that could be measured, named, and walked through. The First Map was its central artifact, and the Shards of the Pattern are what remained when the Weaving began to fail.'
WHERE slug = 'the-weaving';

UPDATE canon_entities SET description =
'The fundamental weave of reality that holds the world together, born from the First Map and the work of the First Architects. The Pattern is not merely the structure of reality — it is reality. Where the Pattern is strong, time runs forward, memory holds, and a place stays where it was left.

When threads of the Pattern snap, the Fray spreads: time loops, memory loss, the dissolution of places and people. The Pattern can be felt by the Dreamers, seen as light inside the Shards of the Pattern, and catalogued — partially, imperfectly — by the Vaultkeepers and the scholars of the Luminous Fold (Civilisation). It is the central concept that every other entry in the Archive ultimately answers to.'
WHERE slug = 'the-pattern';

UPDATE canon_entities SET description =
'The perfect lattice of time and space created by the First Architects — a symmetry so absolute that even memory could rest within its folds. A song sung forever. A world without ending, because ending itself had been woven out.

Time stitched into loops and cycles. Seasons held. The sun returned when it should. But the price was hidden: decay and renewal became clockwork, history repeated endlessly, and the Prime Beings were trapped beneath it. The arrival of the Fray is, depending on whom you ask, either the failure of the Everloop or the moment it finally began to breathe. The Fold waits beneath it. The Shards of the Pattern remember what it once was.'
WHERE slug = 'the-everloop';

UPDATE canon_entities SET description =
'The unraveling of the Pattern — where the world grows weak and forgets. The Fray does not tear like cloth; it forgets. You breathe the air of a Fray-touched place and begin to lose your name, memories, reasons. Days repeat, years vanish, cities blink out of sequence.

It is not a destroyer but a symptom — of time''s refusal to stay fixed, of the lie whispered into the world''s bones when the First Architects bound the Prime Beings beneath the Everloop. Where the Fray is active, the Loosening follows, Time Instability worsens, and — increasingly often — Monsters arrive. Every Monster in the Archive is, by canon, evidence that the Fray has broken reality at that place for a reason. That reason is almost always a Shard.'
WHERE slug = 'the-fray';

UPDATE canon_entities SET description =
'What exists beneath the Everloop — a place without shape or sequence, where discarded possibilities gather like dust in a closed book. Not before, not after, only between. The Fold is not evil, not alive, but it listens and sometimes answers.

Each time a Shard of the Pattern is unearthed, the Fold stirs. The Cartographic Society of Iterants treats the Fold as a second terrain that runs parallel to the world the Pattern describes — chartable in theory, hostile to certainty in practice. Some say the Fray is not a failure of the weave but its awakening, and that the Fold waits to set the world free from the Everloop''s repetition.'
WHERE slug = 'the-fold';

UPDATE canon_entities SET description =
'A living tapestry sewn from starlight, bone, and breath by the First Architects. It did not merely describe reality — it made it. Time stitched itself into loops and cycles because of it; the Everloop is, in a sense, the First Map''s afterimage.

Its shattering scattered the Shards of the Pattern across every region and caused the Fray. To find a piece of the First Map is to find a Shard; to read it whole would be to remember the world as the First Architects intended. The Vaultkeepers consider the First Map their original charge, even though none of them have seen it intact.'
WHERE slug = 'the-first-map';

UPDATE canon_entities SET description =
'Broken pieces of the First Map — each a spine of the Pattern and an anchor of reality. They hum with forgotten power and remember each other when brought near; Eidon has said there are "eight, or thirteen, or one shattered eight ways."

Shards behave like gravity, not objectives. They pull toward one another slowly, indirectly, across regions — and people, factions, and entire towns rearrange themselves around that pull without realising it. Three Shards are known to have been recovered so far: one inside the Bell Tree at Drelmere, one in the underwater well at Virelay, and one in the Black Tower. Father''s Shard is a fourth, carried since the Fray''s onset by Kaerlin. No one in the Archive knows what will happen when all the Shards of a region are reunited, much less all the Shards of every region. That unknown is the gravitational centre of every story.'
WHERE slug = 'the-shards-of-the-pattern';

UPDATE canon_entities SET description =
'The shared structure beneath every region of the Everloop: two fundamental human attunements that recur regardless of culture or geography. Vaultkeepers perceive, preserve, and interpret the Pattern. Dreamers influence, alter, and persuade outcomes within it.

Every region names them differently — Archivists and Iterants in the Luminous Fold (Civilisation), Pathkeepers and Windshapers in the Deyune Steps, Tidewatchers and Current-Speakers along the Virelay coast, Rootwardens and Weave-Tenders in the Bellroot Vale, Ember Scribes and Flamecallers on the Ashen Spine, Ledger-Seers and Chancebinders in the Varnhalt Frontier, Depthwardens and Undertides in the Drowned Reach, Refractionists and Lightbreakers across the Glass Expanse. The function is identical; only the names change. Archael Viremont''s field journals are the canonical source for the recurrence, and the Knowledge Fragmentation Principle is the philosophical companion that prevents any one region from claiming sole ownership of the truth.'
WHERE slug = 'the-attunement-system';

UPDATE canon_entities SET description =
'No region of the Everloop — not even the Luminous Fold (Civilisation) — holds total truth. Each region preserves an understanding that is valid but incomplete, shaped by the climate, instabilities, and rhythms it lives within.

The principle, slowly accepted by the Fold''s more honest Archivists, is that reality is distributed rather than centralised: any account of the world that erases the others is, by definition, a forgery. It is the philosophical companion to the Attunement System and the antidote to the Fold''s structural certainty; Archael Viremont''s late journals treat it as the lesson the Vaultkeeper tradition was always meant to arrive at. The Loosening and Time Instability are the two phenomena that demonstrate the principle most plainly: every region is right about itself and wrong about the rest.'
WHERE slug = 'knowledge-fragmentation-principle';

UPDATE canon_entities SET description =
'A spatial instability felt most strongly between regions, where direction stops behaving like direction. Travellers report paths that do not retrace, distances that contradict themselves, and compasses that drift even when the sky is clear.

The Luminous Fold (Civilisation)''s surveyors first catalogued the effect as measurement error; later journals — notably Archael Viremont''s — treat it as an early manifestation of the same weakening that produces Hollows and the Fray. The Cartographic Society of Iterants holds that the Loosening is not a flaw but a feature of a world whose Pattern has begun to disagree with itself. Where the Loosening is active, Time Instability is rarely far behind.'
WHERE slug = 'the-loosening';

UPDATE canon_entities SET description =
'Outside the Luminous Fold (Civilisation), time is not a shared standard. Some regions disagree on the length of a Cycle. Some ignore the unit altogether. Others measure duration through environment or movement — a tide''s return, a herd''s arrival, the cooling of a vent.

The Fold''s clocks describe the Fold and only the Fold. As Archael Viremont eventually concluded, "We do not all inhabit the same Loop, even when we share the same hour." Time Instability is the temporal twin of the Loosening, and both are downstream symptoms of the Fray.'
WHERE slug = 'time-instability';

-- ----- FACTIONS -----

UPDATE canon_entities SET description =
'Whether mortal or something in between, the First Architects were the ones who pinned the world down during the Dawn. They built monuments of intent — towers that hummed, stones that pulsed, maps that bled when torn. They forged the First Map and from it wove the Pattern; the Everloop is their signature.

But they trapped something in their design — the Prime Beings, the wider Drift, possibly themselves — and the Weaving seeded a flaw. Their creation began to Fray, and the Shards of the Pattern are what is left of their original work. Every faction in the Archive that studies or fears the Pattern (the Vaultkeepers, the Dreamers, the Luminous Fold) is, knowingly or not, working with their inheritance.'
WHERE slug = 'the-first-architects';

UPDATE canon_entities SET description =
'Guardians of the gaps — those who looked between the threads of the Pattern, peering into the Time Before. Keepers of memory. They once believed everything could be remembered, that history was a circle, that nothing truly ended.

Now they whisper of things not written in any loop — things from before the First Map, things from beneath the Fold. Across regions they wear different names but answer to the same calling; the Luminous Fold (Civilisation) institutionalised them as Archivists, the Seventh Circle being their innermost rank. The Shards of the Pattern are, in their oldest doctrine, fragments of memory that must not be reunited until the world is ready.'
WHERE slug = 'the-vaultkeepers';

UPDATE canon_entities SET description =
'Those who can see the Pattern — not just feel it — and sometimes move its threads. Dreamers see how time folds and frays, glimpse futures and pasts, and in rare moments influence outcomes the Vaultkeepers can only catalogue.

But the cost is terrible: some lose their bodies before their minds, becoming ghosts trapped in moments. Others lose their minds but keep walking. Drelmere was once their sanctuary, and Eidon is the last Dreamer to remain there. Every region carries a Dreamer tradition under its own name — Iterants, Windshapers, Current-Speakers, Weave-Tenders, Flamecallers, Chancebinders, Undertides, Lightbreakers — and the Attunement System recognises them as one of the two universal human attunements alongside the Vaultkeepers.'
WHERE slug = 'the-dreamers';

UPDATE canon_entities SET description =
'A noble house led by Lord Thorne and Lady Thorne, parents of Auren Thorne. House Thorne sits at the intersection of the Bellroot Vale and the Virelay coast, and its trade lines have been crumbling for cycles as the Fray erodes the routes between them.

They care deeply for their people and their son. They quietly attempt to protect Auren from his own courage, knowing he is, by his own father''s admission, an "exceptionally bad fighter" despite his brilliant mind and generous heart. When Auren slips out of the manor to dive for a Shard of the Pattern beneath the drowning city, his parents share a knowing look and let him go.'
WHERE slug = 'house-thorne-faction';

UPDATE canon_entities SET description =
'The most ordered civilisation in the Everloop — a society built upon the conviction that reality may be measured, catalogued, and ultimately understood through structured systems. The Fold runs on Seconds, Minutes, Hours, Days, Cycles (30 Days), and Loops (10 Cycles), and its institutions assume that those measurements describe a universal truth.

Two great offices uphold the order: the Archivists (a regional name for the Vaultkeepers), who record and preserve structure, and the Iterants (a regional name for the Dreamers), whose controlled manipulations are studied as much as feared. The Seventh Circle is the innermost scholastic body of the Archivist tradition; the Cartographic Society of Iterants is its heretical counterpart, the Iterant guild that maps probability as terrain. The Fold''s capital is Lumina, its centre Central Fold, and its most travelled Archivist of the modern era is Archael Viremont — whose late writings established the Knowledge Fragmentation Principle and quietly undid the Fold''s claim to universal truth.'
WHERE slug = 'the-luminous-fold-civilisation';

UPDATE canon_entities SET description =
'The innermost scholastic order of the Luminous Fold (Civilisation)''s Archivist tradition. The Grand Archive at the heart of the Fold is organised in seven concentric Circles, each a deeper tier of categorical mastery: the First teaches Cataloguing; the Second, Comparative Pattern; the Third, Mensuration; the Fourth, Iterant Calculus; the Fifth, Boundary Cases; the Sixth, Concordant Variance.

The Seventh is granted no fixed discipline. Its Fellows are those who have exhausted the six and may originate new categories of inquiry; Archael Viremont is the only living Fellow whose journals have been released outside the Circle. The Seventh Circle is the Vaultkeeper tradition at its highest pitch — and, increasingly, the place where the Knowledge Fragmentation Principle is being quietly debated.'
WHERE slug = 'the-seventh-circle';

UPDATE canon_entities SET description =
'A surveying guild of the Luminous Fold (Civilisation), drawn from the Iterant (Dreamer) tradition rather than the Archivist one. The Society holds — quietly, for its claim borders on heresy within the Fold — that probability and geography are the same instrument viewed from two distances.

To alter an outcome is to alter the terrain that outcome rests on, and to chart terrain truthfully is to fix probability in place. Its members travel the unstable rim of the Fold''s influence and produce the Concordant Atlases that the Seventh Circle officially distrusts and unofficially relies on. The Loosening is the Society''s native subject, and Archael Viremont has corresponded with several of its senior cartographers — much to the Archivists'' displeasure.'
WHERE slug = 'the-cartographic-society-of-iterants';

UPDATE canon_entities SET description =
'The Veykar''s sworn Brethren — his voice, ears, breath, and blood made flesh. They bore no names among slaves. Their robes were cut from conquered horses'' hides, dyed with ash and pitch. Their oaths were tattooed from wrist to throat to jaw.

One Draethan alone could end a conversation by walking into the room. Ten could end a town. They served as the patrons of The Girl With the Scar, recognising her talent in the kitchens while ordering the execution of The Crippled Boy. They are the operational machinery by which The Veykar held the eastern steppe — and the witnesses who looked away when his cook finally poisoned him.'
WHERE slug = 'the-draethan';

-- ----- HUB CHARACTERS -----

UPDATE canon_entities SET description =
'The eldest of three siblings, a determined and steady leader with dark hair braided down her back. Called "Kerr" by Mira and Thomel. She carries Father''s Shard — a piece of black glass that hums when brought near other Shards of the Pattern — and leads the quest to understand the Fray after Alira''s death.

Practical and bold, she solves the ancient riddle to enter First Root Chamber beneath Drelmere by thinking simply where others overthink. Her decision to ring the Bell Tree''s bells in the spiral sequence Mayor Halrick Vann had quietly worked out is the moment the Second Shard is recovered for the world.'
WHERE slug = 'kaerlin';

UPDATE canon_entities SET description =
'The middle sibling, a brilliant cartographer and analyst, sister to Kaerlin and Thomel. Restless and sharp-minded, she maps the Fray''s distortions around Drelmere and discovers that the Bell Tree''s roots mirror the town''s shifted layout — the first hint that whatever sleeps beneath First Root Chamber is shaping the surface above.

Her maps and intellect guide the siblings, though she sometimes overthinks puzzles that have simple solutions; Kaerlin''s instinct and Thomel''s patience complete what her analysis alone cannot.'
WHERE slug = 'mira';

UPDATE canon_entities SET description =
'The youngest sibling, called "Thom" by family. Quiet, observant, and deeply compassionate. He stayed behind in Drelmere to care for Alira while Kaerlin and Mira explored the edge of the Fray.

A natural tracker and mediator, he famously convinced the hermit Eidon to leave Watcher''s Hill through an elaborate metaphor about soup and Everfern — proof that gentleness solves what argument cannot. Of all the siblings, he is the one Uncle Edran trusts most with the quiet work.'
WHERE slug = 'thomel';

UPDATE canon_entities SET description =
'Mother of Kaerlin, Mira, and Thomel. A tall, strong storyteller of Drelmere whose voice "built a world out of words." She kept her husband''s Shard — Father''s Shard, now carried by Kaerlin — after his disappearance at the edge of the Overlook during his first expedition into the Fray.

Before her death she told her children the truth about the Fray, the Pattern, and the work the First Architects left unfinished — passing the family''s long quiet vigil over the Shards of the Pattern down to a generation old enough to act on it.'
WHERE slug = 'alira';

UPDATE canon_entities SET description =
'The siblings'' uncle — a gruff, protective man of Drelmere who raised Kaerlin, Mira, and Thomel alongside Alira. A former pragmatist who dismissed talk of the Fray as dangerous dreaming, he ultimately gave his blessing for the siblings to continue their parents'' quest.

Strong but not gentle, he is the household''s last argument against the road — and once he relents, the road begins.'
WHERE slug = 'uncle-edran';

UPDATE canon_entities SET description =
'A Dreamer who calls himself a "Folder" — a man folded across time, appearing young despite being ancient. Eccentric and whimsical, he speaks in riddles about drawer soup and time as origami.

The last Dreamer remaining in Drelmere after the rest of the sanctuary scattered or unravelled, Eidon reveals the crucial knowledge about the Shards of the Pattern, the First Map, and the Fold to Kaerlin and her siblings before unfolding completely in First Root Chamber beneath the town, returning to his true aged form and fading into the stone. His parting words inform every later understanding the Archive holds about how Shards behave — and why no one knows what happens when they are reunited.'
WHERE slug = 'eidon';

UPDATE canon_entities SET description =
'Mayor of Drelmere — a former soldier turned town leader who polishes his boots each morning and refuses to acknowledge the Fray in public. Despite his denial, he secretly studied the Bell Tree at the centre of town and recognised that the spiral markings on its bells matched the engravings inside First Root Chamber.

Mayor Halrick Vann is the reason Kaerlin knew the order in which the bells had to be rung — the act that compressed the Bell Tree into the second known Shard of the Pattern. He is also the namesake of Halrick''s Reach, the trading town that grew along the eastern routes he first mapped between Bellroot and the Glass Expanse.'
WHERE slug = 'mayor-halrick-vann';

UPDATE canon_entities SET description =
'The apothecary, midwife, and practical voice of Drelmere. Wears her hair in a silver braid, smells of pine and herbs. She helps children recover lost names — a quiet, common consequence of the Fray''s touch on the town.

She introduces Kaerlin and Mira to Eidon, the last Dreamer, and is one of the few voices that openly questions whether the Fray should be fought at all, or simply learned from. Her caution has saved more lives in Drelmere than any sword.'
WHERE slug = 'merra-dune';

UPDATE canon_entities SET description =
'The young lord of House Thorne — son of Lord Thorne and Lady Thorne, charming, bumbling, and exceptionally bad at fighting but brilliant in heart and courage. Called "The Lord of Luck" for his tendency to accidentally triumph.

He escapes his parents'' manor to save the drowning Virelay coast, dives beneath the sea to find a Shard of the Pattern, and emerges as an unlikely hero. His compassion and belief drive him where skill cannot — and the Shard he recovers is the second of the three currently known to the Archive.'
WHERE slug = 'auren-thorne';

UPDATE canon_entities SET description =
'Auren Thorne''s father, Lord of House Thorne. A quiet man who sees his son''s potential even through his clumsiness. He and Lady Thorne share knowing looks as they let Auren leave the manor for Virelay, understanding that some journeys must be taken despite the danger.

His silence is not absence — it is the careful weighing of a father who has decided to trust his son with the world.'
WHERE slug = 'lord-thorne';

UPDATE canon_entities SET description =
'Auren Thorne''s mother, Lady of House Thorne. Warm and worried, she loves her son deeply but knows his limitations as a fighter. She and Lord Thorne quietly watch Auren''s "escape" without stopping him, trusting his heart even as they fear for his safety.

Hers is the courage of letting go — the quieter half of every hero''s story.'
WHERE slug = 'lady-thorne';

UPDATE canon_entities SET description =
'A conquering warlord of the eastern steppe — the Deyune Steps — who forged an empire through fire and will. No bloodline, no old name — only a claim seized by the blade. He spoke of unity but enforced it through slaughter.

He built roads, enforced order, and protected trade — but at the cost of freedom and countless lives. His sworn Brethren, The Draethan, were his voice and reach. He grew to trust only the mute cook who served him — The Girl With the Scar — and was ultimately poisoned by her in a quiet act of justice for her family, for The Crippled Boy, and for every village he flattened to build his roads.'
WHERE slug = 'the-veykar';

UPDATE canon_entities SET description =
'A nameless girl taken from her destroyed village at age five, with a gash across her left brow. She endured years in The Veykar''s hellish kitchens without ever crying, transforming her suffering into mastery of fire and food.

She rose from the pits to cook for The Draethan, then The Veykar himself — becoming his most trusted advisor through silence and skill. Morran was the cook she replaced; The Crippled Boy was the one true friend she lost on the way. She ultimately poisoned The Veykar in vengeance for her family and all his victims.'
WHERE slug = 'the-girl-with-the-scar';

UPDATE canon_entities SET description =
'A charming con artist and card sharp, born Alarook but known only as Rook. Orphaned at five, raised in the streets, he survives by his wits, lies, and the ability to read people. His bond with Myx — a Servine he met as a starving boy in an alley — is the one true thing in his life.

He infiltrates Sera''s settlement, exposes her tyranny, and enters her Fray-repelling tower to retrieve the third Shard of the Pattern known to the Archive. He possesses the rare gift of seeing through facades — including his own. Master of the Everloop (Card Game), he uses FRAY traps to empty his opponents'' gains.'
WHERE slug = 'rook';

UPDATE canon_entities SET description =
'A Servine — a rare creature resembling a cross between a leopard and a large dog, with eyes that change colour based on emotion and trust. Myx was bred in fighting pits, abused and starved, until he shared a bone with a starving boy named Rook in an alley.

Despite appearing fearsome, Servines are deeply loyal and affectionate. Myx communicates through presence and thought-shapes rather than words. His harrowing run through the Fray cracked open Sera''s tower and made Rook''s retrieval of the third Shard of the Pattern possible.'
WHERE slug = 'myx';

UPDATE canon_entities SET description =
'A young woman who discovered an ancient tower''s Fray-repelling properties and used them to build a settlement of dependent followers. Barefoot on cushions, she rules through offering stability in a Fray-warped world — but her "safety" is really control.

After Rook exposes her, she breaks down and ultimately helps destroy the tower, revealing the vulnerability beneath her tyranny. The Shard of the Pattern at the tower''s heart had been what kept the Fray at bay; her settlement existed because she happened to be standing nearest to it.'
WHERE slug = 'sera';

UPDATE canon_entities SET description =
'Senior Archivist of the Luminous Fold (Civilisation) and the most travelled Vaultkeeper of his generation. Archael Viremont was raised in the rigid tradition of the Fold — that reality may be measured, catalogued, and ultimately understood through structured systems.

His field journals, addressed to a future self he no longer trusts to remember, record his slow unmaking. With each region surveyed beyond the Fold, his certainty thins: the Pattern, he writes, is not a single language but many dialects that no longer agree. He is the canonical source for the Attunement System table, the Loosening, Time Instability, and — most uncomfortably for his colleagues in the Seventh Circle — the Knowledge Fragmentation Principle. His correspondence with the Cartographic Society of Iterants is the closest the Fold has come to admitting it does not own the truth.'
WHERE slug = 'archael-viremont';

-- ----- KEY ARTIFACTS -----

UPDATE canon_entities SET description =
'A manifestation that appeared in Drelmere''s town square overnight — twisted limbs like cloaked arms, a hollow where a face should be, bells swaying in windless air. It rose from the earth like a cloaked figure carved in shadow, and the town came to understand only slowly that it was not a thing but a Shard of the Pattern wearing the shape of a tree.

Its bells, when rung in the correct spiral sequence — a sequence Mayor Halrick Vann quietly worked out from the engravings inside First Root Chamber — caused the entire tree to fold inward and compress into the second Shard known to the modern Archive. It held echoes, regrets, and moments lost to the Fray; Kaerlin was the one who, on Mayor Vann''s coded guidance, finally rang it.'
WHERE slug = 'the-bell-tree';

UPDATE canon_entities SET description =
'A shard of smooth black glass etched with soft curves like veins in a leaf, faintly warm. Found by Alira''s husband — the siblings'' father — at the edge of the Overlook during his first expedition into the Fray. He said it hummed in his hand and that he could feel the Loop beneath it.

It pulses when brought near the Bell Tree, recognising a "sibling" Shard of the Pattern. After their father''s disappearance Alira kept it; after Alira''s death Kaerlin carries it. Father''s Shard is, by the Archive''s present count, the oldest Shard in private hands.'
WHERE slug = 'fathers-shard';

-- ----- HUB LOCATIONS -----

UPDATE canon_entities SET description =
'The central town of the Bellroot Vale and the site of the Bell Tree''s first manifestation. Drelmere was once a sanctuary of the Dreamers, and the Fray''s touch here was deeply personal — time stuttered, memories bled between people, and the town forgot itself in cycles.

Since the Second Shard was recovered from the Bell Tree, Drelmere has stabilised, but its residents still pause mid-sentence sometimes, listening to something no one else can hear. Eidon was the last Dreamer to remain here. Kaerlin, Mira, Thomel, Alira, Uncle Edran, Mayor Halrick Vann, and Merra Dune all walk its streets. East Drelmere serves as its overflow district; First Root Chamber sleeps beneath it; Old Bellroot Site is the older town the Fray dissolved into the ground before this one took its place.'
WHERE slug = 'drelmere';

UPDATE canon_entities SET description =
'The Vale''s largest settlement, built at the confluence of three rivers where the forest opens into a broad meadow. Bellroot Crossing serves as the Bellroot Vale''s administrative and commercial centre, managing trade between the forest villages and the outside world.

South Vale Cluster to the south handles agricultural production; Bellroot Crossing handles everything else. Drelmere — older, smaller, stranger — sits a half-day''s walk to the north, and the road between them is the busiest in the Vale. Halrick''s Reach is the Crossing''s eastern gateway out toward the Glass Expanse.'
WHERE slug = 'bellroot-crossing';

UPDATE canon_entities SET description =
'A fortified trading town on the Bellroot Vale''s eastern border, named for Mayor Halrick Vann, the explorer who first mapped the routes between Bellroot and the Glass Expanse before he settled in Drelmere.

Halrick''s Reach is the Vale''s gateway to the wider world — caravans bound for Clearline and Glass Reach in the Expanse depart from its eastern gate, and Bellroot Crossing routes much of its outward trade through it.'
WHERE slug = 'halricks-reach';

UPDATE canon_entities SET description =
'Originally a camp for workers supporting Drelmere during the worst of the Fray disturbances, East Drelmere grew into a permanent settlement as the main town''s instability drove residents to seek more predictable ground.

It lacks Drelmere''s history but compensates with practical infrastructure — better roads, a functioning market, and walls that stay where they''re built. The relationship between the two settlements is one of quiet codependence: Drelmere holds the Bell Tree''s memory; East Drelmere holds the bakery, the dock, and the children.'
WHERE slug = 'east-drelmere';

UPDATE canon_entities SET description =
'The cave system beneath Drelmere where the Bell Tree''s roots terminate — and where Eidon, the last Dreamer of the town, unfolds completely back into his true aged form before fading into the stone.

The engravings on its walls match the spiral markings on the Bell Tree''s bells; Mayor Halrick Vann was the first to recognise the correspondence, and Kaerlin was the first to solve the riddle that opened it. First Root Chamber is where the second known Shard of the Pattern compressed itself into a form small enough to carry.'
WHERE slug = 'first-root-chamber';

UPDATE canon_entities SET description =
'The capital of the Luminous Fold (Civilisation) and the seat of the Archivist tradition. Lumina is the city that the Fold''s own measurements describe most accurately — clocks here agree with one another, distances here retrace, and the air does not forget your name.

Central Fold lies at its heart; Axis Watch and Symmetry are the nearest of its named districts. Archael Viremont keeps a residence here between expeditions, and the Seventh Circle meets in the deepest ring of the Grand Archive at its centre.'
WHERE slug = 'lumina';

-- -----------------------------------------------------
-- 4) Reload PostgREST so the updated descriptions are
--    served immediately.
-- -----------------------------------------------------
NOTIFY pgrst, 'reload schema';

COMMIT;
