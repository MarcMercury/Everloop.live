-- ============================================================
-- Phase 3: Regional flavour tails for mid-tier locations
-- ============================================================
-- For every regional location whose description is still under 480 chars,
-- append a 1-2 sentence regional context paragraph naming the region macro,
-- the region capital, and the relevant cosmological forces. The linkify
-- utility will auto-wrap those names into wiki-style cross-links.
-- ============================================================

-- BELLROOT VALE
UPDATE canon_entities SET description = description || E'\n\nWithin the Bellroot Vale, this site sits in the wider network of villages, ruins, and Pattern-touched places that radiate out from Drelmere and Bellroot Crossing. The Vale''s relative stability since the Second Shard was recovered from the Bell Tree is felt here, but the Loosening and the Fray still leave their fingerprints — old paths that no longer match the new ones, names half-remembered, the occasional warm wind out of the wrong season.'
WHERE status='canonical' AND type='location' AND metadata->>'region'='bellroot'
  AND LENGTH(description) < 480
  AND slug NOT IN ('the-bellroot-vale','drelmere','bellroot-crossing','halricks-reach','east-drelmere','first-root-chamber','old-bellroot-site','the-bound-chamber');

-- VIRELAY COASTLANDS
UPDATE canon_entities SET description = description || E'\n\nAlong the Virelay Coastlands, this site is part of the lattice of harbours, bell-towers, and salt-marshes that look toward Virelay and the Underwater Well. The sea here remembers more than the maps do; the Loosening lives in the fog. House Thorne''s trade lines once stitched these settlements together — some of those routes are still walked, others have gone quiet since the Fray reached the coast.'
WHERE status='canonical' AND type='location' AND metadata->>'region'='virelay'
  AND LENGTH(description) < 480
  AND slug NOT IN ('virelay-coastlands','virelay','the-underwater-well','the-drowned-city','the-well-site');

-- DEYUNE STEPPE
UPDATE canon_entities SET description = description || E'\n\nOn the Deyune Steppe, this site is one of the points where the Long Wind, the clan-roads, and the old Karak geometries meet. Time Instability runs heavy here — distances and seasons rarely agree between settlements. The Veykar''s old reach passed through or near sites like this; some bear the Wheel''s scars in the soil, others have been letting the grass grow back over them for generations.'
WHERE status='canonical' AND type='location' AND metadata->>'region'='deyune'
  AND LENGTH(description) < 480
  AND slug NOT IN ('the-deyune-steppe','whispering-expanse','the-hall-veykar','the-wheel','old-karak-stones','the-standing-teeth');

-- VARNHALT FRONTIER
UPDATE canon_entities SET description = description || E'\n\nOn the Varnhalt Frontier, this site sits inside the patchwork of crossroad towns, mesa camps, and trade-protected routes that radiate from Old Varnhalt. The Loosening is constant here — mile markers contradict, paths loop — so settlements rely on local pacing and on the small island of stability around the Black Stone Tower in the eastern hills. The Frontier has no central authority; this place answers to whoever its trade depends on this season.'
WHERE status='canonical' AND type='location' AND metadata->>'region'='varnhalt'
  AND LENGTH(description) < 480
  AND slug NOT IN ('varnhalt-frontier','varnhalt','old-varnhalt','the-black-stone-tower','the-black-tower');

-- ASHEN SPINE
UPDATE canon_entities SET description = description || E'\n\nWithin the Ashen Spine, this site is part of the long chain of forge-towns, quarries, and iron-vein settlements that work the world''s oldest forges from Ironmark down to Old Varr. The smoke is the climate. The Fray here is physical — cracks open in the rock, tunnels appear that were not there the day before — and the Cleaved is the regional consequence. Forge guilds keep their own records, and they keep them close.'
WHERE status='canonical' AND type='location' AND metadata->>'region'='ashen'
  AND LENGTH(description) < 480
  AND slug NOT IN ('the-ashen-spine','ironmark','old-varr','rookforge','black-hammer-forge');

-- DROWNED REACH
UPDATE canon_entities SET description = description || E'\n\nIn the Drowned Reach, this site is one of the half-drowned settlements that rebuild themselves on stilts every generation around the Sunken City. The sea is steadily reclaiming the coast, and the Echo is the regional Fray-consequence that haunts the deeper channels. What the tide takes here, it usually takes for a reason — sometimes a Shard, sometimes a name, sometimes only the road that used to lead inland.'
WHERE status='canonical' AND type='location' AND metadata->>'region'='drowned'
  AND LENGTH(description) < 480
  AND slug NOT IN ('the-drowned-reach','the-sunken-city','sunken-port');

-- GLASS EXPANSE
UPDATE canon_entities SET description = description || E'\n\nOut in the Glass Expanse, this site is part of the network of prism-fields, shard-towns, and silica plateaus that surround Prism City. Light bends here in ways the Pattern cannot quite hold — the air sometimes refracts a scene from a different hour, and the Starving Silence forms where light has shattered the same way too many times in the same place. The Knowledge Fragmentation Principle was first formalised by Expanse philosophers a generation before the Luminous Fold accepted it.'
WHERE status='canonical' AND type='location' AND metadata->>'region'='glass'
  AND LENGTH(description) < 480
  AND slug NOT IN ('the-glass-expanse','prism-city','clearline','vell-glass','echo-ruins');

-- LUMINOUS FOLD
UPDATE canon_entities SET description = description || E'\n\nWithin the Luminous Fold, this site is part of the gridded, measured landscape that radiates out from Lumina and the Central Fold. The Fold''s clocks, roads, and institutions assume reality may be wholly described, and on this plateau they almost can — the Loosening and Time Instability are weakest here. The site answers, directly or indirectly, to one of the Seven Circles, and the Cartographic Society of Iterants keeps notes on every measurable thing that happens within sight of it.'
WHERE status='canonical' AND type='location' AND metadata->>'region'='luminous'
  AND LENGTH(description) < 480
  AND slug NOT IN ('the-luminous-fold','lumina','central-fold','the-even-table','symmetry','order-field');

-- ------------------------------------------------------------
-- Region capitals / hubs not yet enriched — direct rewrites
-- ------------------------------------------------------------

UPDATE canon_entities SET description =
'The largest settlement of the Varnhalt Frontier and the regional seat in everything but constitutional fact — a four-road town built around a courthouse, a permanent magistrate, and the only working bank between the Bellroot Vale and the Glass Expanse. Old Varnhalt''s authority over the Frontier is more historical than practical; the surrounding mesa camps, market towns, and protected trade routes answer to it only when the answer suits them. Its older name, Varnhalt, still appears on Luminous Fold maps. The town''s real influence is the magistrate''s docket, the bank''s ledger, and the fact that on market day every road within three days'' ride converges on its central square. The Black Stone Tower''s field of stability is two days east.'
WHERE slug='old-varnhalt';

UPDATE canon_entities SET description =
'The largest port of the Virelay Coastlands and the symbolic centre of the region — built on the harbour above the Underwater Well, where the Third Shard of the Pattern was recovered by Auren Thorne. Virelay''s harbour has been a working port for longer than any standing record reaches; the Drowned City offshore is part of the same urban continuity, drowned and rebuilt and drowned again. Bell-towers mark the fog; the salt-houses on the inner cliffs are older than House Thorne. Trade with the Bellroot Vale and the Deyune Steppe passes through this port. Since the Third Shard was lifted, the harbour''s tides have settled into a regular rhythm for the first time in three Loops.'
WHERE slug='virelay';

UPDATE canon_entities SET description =
'The capital of the Luminous Fold and the densest concentration of measurement, scholarship, and structured time in the Everloop. Lumina is laid out in seven concentric Circles around the Grand Archive at the Central Fold, and from there the Archivist tradition radiates outward through Order Field, the Even Table, Symmetry, the Quiet Line, and Venn. The Fold''s clocks are calibrated here; the Seven Circles meet here; the Cartographic Society of Iterants maintains its central library in the city''s outer ring. The senior Archivist Archael Viremont keeps his working study three stories above the Sixth Circle''s reading room. Lumina is the Everloop''s argument for legibility — and the place where that argument is most quietly contested.'
WHERE slug='lumina';

UPDATE canon_entities SET description =
'The largest forge-town of the Ashen Spine — a smoke-stained settlement built around a working forge complex whose hammer-rhythm has, by guild record, never stopped for more than a single shift in eleven Loops. Ironmark supplies iron, steel, and finished work to every region west of the Glass Expanse; its forge guilds are the closest thing the Spine has to a government. The Cleaved has appeared inside the town''s outer forges three times in living memory. The guilds keep records of every crack in the rock, every tunnel that opens overnight, and every apprentice who has gone quiet mid-conversation since the Fray reached the Spine — they keep those records in a vault no Luminous Fold Archivist has been allowed to read.'
WHERE slug='ironmark';

UPDATE canon_entities SET description =
'The largest standing settlement of the Drowned Reach — a port built on stilts and second-floor walkways above a city that drowned three Loops ago and refused to be abandoned. Sunken Port is where most surface trade with the Drowned Reach passes; deep dives to the Sunken City and the Drowned City typically launch from its outer pier. Lowwater, Floodmark, and Salt Line are its working satellites. The Cartographic Society of Iterants keeps a permanent expedition at Flood Station nearby. The Echo has been sighted in the city''s sub-canals more often than the port''s council prefers to admit; deep divers say the canals remember.'
WHERE slug='sunken-port';

UPDATE canon_entities SET description =
'The largest settlement of the Glass Expanse and the closest thing the region has to a capital — a city of light-warped streets where the local architecture is built to compensate for the Pattern''s refraction. Prism City''s ruling council is drawn from the prism-grove guilds and a rotating Iterant chair appointed by the Cartographic Society of Iterants. The Knowledge Fragmentation Principle has been taught in its philosophical academy for two Loops longer than the Luminous Fold''s formal acceptance of it. The Starving Silence has not been sighted within the city limits, but the outer prism-fields are another matter — Clearline, Echo Ruins, and Vell Glass have all reported incidents.'
WHERE slug='prism-city';

UPDATE canon_entities SET description =
'The administrative seat of the Deyune Steppe in everything except formal title — the largest semi-permanent settlement at the Steppe''s western edge, where the Long Wind meets the trade-roads from the Bellroot Vale. Whispering Expanse holds the only standing market on the Steppe and the only court of arbitration most clan-leaders will recognise. The Karak stones near the Old Karak Stones site and the Standing Teeth lie within a few days'' ride. The Veykar''s old roads still converge here; the Wheel passed through this country in its final Cycles. Time Instability is severe — the market day''s length is set by a bell-system the local elders calibrate by negotiation rather than by clock.'
WHERE slug='whispering-expanse';

UPDATE canon_entities SET description =
'The chamber at the heart of the Old Bellroot Site beneath the Bellroot Vale — a vaulted room of root-grown stone older than any written record of the Weaving. Vaultkeepers believe the First Root Chamber predates the First Architects'' work and that the Architects built around it rather than constructing it themselves. The chamber''s walls bear engravings whose spiral geometry matches the markings on the bells of the Bell Tree and the symbols inside the cave beneath Drelmere. Kaerlin, Mira, and Thomel descended into the chamber after solving the Bell Tree puzzle; Eidon unfolded into the stone here. It is the place the Bellroot Vale''s deepest stability seems to begin.'
WHERE slug='first-root-chamber';

UPDATE canon_entities SET description =
'The ruined original site of the Bellroot Vale''s first settlement — abandoned generations before the current Bellroot Crossing was founded, when the residents reportedly woke one morning and found the village had moved sideways through the forest in their sleep. The Old Bellroot Site sits above the First Root Chamber, and most Vaultkeeper accounts treat the chamber as the site''s real reason for existing — the village was built where it was because something deeper than the village needed a roof. The ruins are now overgrown but never quite reclaimed; the forest stops short of the foundation stones, which the Vale''s residents take as either a warning or a courtesy.'
WHERE slug='old-bellroot-site';

UPDATE canon_entities SET description =
'The cave chamber beneath Drelmere where the Bell Tree''s spiral led, and where Eidon the last Dreamer unfolded into his true age before fading into the stone. The Bound Chamber is older than the town above it. Its engravings match the spiral markings on the Bell Tree''s bells and the geometry of the First Root Chamber across the Bellroot Vale. Kaerlin, Mira, and Thomel entered the chamber after Mayor Halrick Vann gave them the bell-ringing sequence; the Second Shard of the Pattern was recovered from within. The chamber still hums faintly to those carrying Shards. Vaultkeepers consider it one of the most intact Anchor-points outside the Luminous Fold.'
WHERE slug='the-bound-chamber';

UPDATE canon_entities SET description =
'The depression in the seafloor beneath Virelay''s harbour where a perfect ring of carved Anchor-stone once pulsed with a gravity that pulled at something deeper than the body. The Well Site was the seat of the Third Shard of the Pattern. Fishing lines across the entire harbour drifted toward it; sailors described a hum that travelled up through the boat''s wood. Auren Thorne dove for the Shard here in the closing scene of his quest for the Virelay Coastlands. With the Shard removed, the Well''s pull has gone quiet — but the ring of carved stone is still there, and the Cartographic Society of Iterants has logged at least two reports of the hum returning briefly during the deepest tides.'
WHERE slug='the-well-site';

UPDATE canon_entities SET description =
'An entire urban district submerged just offshore from the Virelay Coastlands — visible only at the extreme low tides that come once or twice a Cycle. Rooftops, bell-towers, and market-squares all preserved beneath the waterline, fish moving through doorways like wind through an open house. No one knows when the Drowned City sank or what it was called; Marrow Bay''s bone-fishermen recover artefacts from it that the Luminous Fold has been classifying for three Loops without resolution. Vaultkeepers believe it is older than House Thorne by an order of magnitude they prefer not to discuss in public. The Echo has been sighted in its sunken streets.'
WHERE slug='the-drowned-city';

UPDATE canon_entities SET description =
'The submerged city offshore of the Drowned Reach — older, larger, and more intact than the Drowned City to the south. The Sunken City was a working metropolis before the Reach''s coastline began its long collapse, and most of its streets, plazas, and civic buildings are still navigable to a trained deep-diver at slack water. Vaultkeepers consider it one of the few intact pre-Weaving urban sites known. The Cartographic Society of Iterants keeps a permanent recovery expedition based at Flood Station. The Echo haunts the inner districts; Vaultkeeper theory says the Echo is what the Sunken City''s drowned population becomes when its memory tries to reassemble without bodies.'
WHERE slug='the-sunken-city';

UPDATE canon_entities SET description =
'The fortified obsidian spire on the eastern Varnhalt Frontier — smooth, seamless, casting neither light nor shadow. The Black Stone Tower repels the Fray for a measurable distance around itself, creating an island of stability that local geography slowly reorganises itself around. Sera built her settlement here and exploited the Tower''s field to bind a population of dependent followers; Rook and his bonded Servine Myx broke that arrangement, the Tower cracked open, and the third Shard of the Pattern was recovered from inside. The structure still stands and still repels the Fray, though more weakly than before. Vaultkeepers consider it the last intact Rogue Architect work outside the deep Glass Expanse.'
WHERE slug='the-black-tower';

-- Mirror version (varnhalt-region tower) — same artefact, locational record
UPDATE canon_entities SET description =
'The Varnhalt Frontier''s own record of the Black Stone Tower — the obsidian spire in the region''s eastern hills that repels the Fray, anchors Sera''s former settlement, and was opened from the inside when Rook and Myx broke through to recover the third Shard of the Pattern. The Tower is the Frontier''s single most stable structure and its single most contested one: every faction with an interest in stability has, at some point, tried to claim the ground around it. None has held the claim for long.'
WHERE slug='the-black-stone-tower';

UPDATE canon_entities SET description =
'The advancing edge of the Fray itself — not a fixed place but a moving line, where the world grows thin and the air begins to feel different. People who linger at the Overlook lose names, memories, reasons. Every winter the Overlook creeps closer to the Bellroot Vale. The siblings'' family cottage stands within a day''s walk of the current line; their father vanished into the Overlook on his second expedition, and Father''s Shard came back without him. Kaerlin, Mira, and Thomel grew up under its slow approach. The Overlook is the Fray made visible — the place where the Pattern''s erosion is no longer theoretical.'
WHERE slug='the-overlook';

UPDATE canon_entities SET description =
'The ancestral seat of House Thorne — a long-galleried manor of pale stone and dark wood set above the inland approach to the Virelay Coastlands. Thorne Manor''s Winter Room is famous on the coast: the hearth is always full, and the family''s closest allies are received there. The gardens, the training courtyard, and the front gate (guarded by the comfortably bored Brennick) are the parts most visitors see; the working library and the small Anchor-stone in the back garden are the parts that are not on the tour. Auren Thorne made his "escape" from the Manor on the night the Fray reached the Coastlands. Lord Thorne and Lady Thorne watched him go from the Winter Room and did not call out.'
WHERE slug='thorne-manor';

UPDATE canon_entities SET description =
'The slightly leaning roadhouse between the Thorne lands and Virelay where Auren stopped on his way to the coast. Mismatched shutters, golden warmth, and a hand-lettered sign over the bar that reads: "NO SWORDS, NO SHOUTING, NO WEEPING — UNLESS IT''S A BEAUTIFUL SONG." Auren accidentally knocked out a drunk by tripping into him on the way to the hearth, which the regulars still tell as the most polite assault on record. The Cracked Pot is one of the small, named places that hold the Virelay Coastlands together without ever making it onto a Luminous Fold map.'
WHERE slug='the-cracked-pot-tavern';

UPDATE canon_entities SET description =
'The vast stone-and-bone pavilion at the centre of The Wheel — the Veykar''s mobile camp on the Deyune Steppe. Half-sunken into rock, lined with fire-pits and smoke channels, the Hall transformed raw slaughter into something that could pass, by lamplight, for civilisation. The hierarchy of food and the hierarchy of power were the same hierarchy here. The Draethan ate at the inner tables; the kitchen-girl who would become The Girl With the Scar served from the outer ones. The Hall is where the Veykar took most of his meals, where Morran''s severed hand was nailed to the wall, and where the Veykar himself was finally poisoned. The site is still locatable on the Steppe by a circle of fire-blackened stone the grass has not reclaimed.'
WHERE slug='the-hall-veykar';

UPDATE canon_entities SET description =
'The Veykar''s moving military camp — a city of hide tents and bone stakes organised in concentric rings on the Deyune Steppe. Outermost: pits, latrines, stables, butcher-grounds, slave-pens, kitchens. Middle: soldiers'' quarters and minor offices. Inner: command tents, the archives, the Draethan''s quarters, and The Hall. The Wheel moved on the Veykar''s command and stopped on it; entire seasons of the Steppe''s history are recorded as "when the Wheel was at Karak" or "after the Wheel left Telmar." When the Veykar died, the Wheel scattered. The fire-circles of its old encampments are still findable in the Steppe''s grass, and the Cartographic Society of Iterants has been quietly mapping them for two Loops.'
WHERE slug='the-wheel';

-- Reload PostgREST cache
NOTIFY pgrst, 'reload schema';
