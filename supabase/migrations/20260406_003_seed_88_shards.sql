-- =====================================================
-- SEED ALL 88 CANONICAL SHARDS
-- Region distribution: 11 shards per region (8 regions)
-- Each shard uses the 4-layer build spec:
--   State / Location / Expression / Situation
-- =====================================================

-- Clear existing shards first (safe for initial seeding)
-- DELETE FROM public.shards;

-- =====================================================
-- I. VIRELAY COAST (Trade / Civilization / Instability)
-- =====================================================

INSERT INTO public.shards (name, shard_number, form_state, region, site_types, expressions, situations, description, state, power_level) VALUES
-- 1. Bell Tree
($$Bell Tree$$, 1, 'embedded', 'virelay_coast', ARRAY['forest', 'grove'], 
 ARRAY['memory_anchoring', 'attracts_creatures'],
 ARRAY['worshipped', 'guarded_by_monster'],
 $$A living bell-shaped tree in a coastal grove whose branches resonate with memories of those who pass beneath it. Creatures from across the region are drawn to its roots. A local cult tends to the tree, unaware of what sleeps within its sapwood.$$, 
 'dormant', 3),

-- 2. Hollow Coin
($$Hollow Coin$$, 2, 'buried', 'virelay_coast', ARRAY['market', 'city'], 
 ARRAY['memory_loss', 'false_memory'],
 ARRAY['owner_unaware', 'being_traded'],
 $$A coin that has passed through a thousand hands in the Virelay markets. Anyone who holds it forgets a small truth and replaces it with something that never happened. It circulates endlessly, unnoticed.$$, 
 'dormant', 2),

-- 3. Clock Heart
($$Clock Heart$$, 3, 'embedded', 'virelay_coast', ARRAY['city', 'structure'], 
 ARRAY['time_loop', 'desync'],
 ARRAY['hides_itself', 'linked_system'],
 $$Buried inside the central clocktower of a Virelay port city. The district surrounding it sometimes replays the same hour twice. No one has connected the temporal stutters to the tower mechanism.$$, 
 'dormant', 5),

-- 4. Gilded Mask
($$Gilded Mask$$, 4, 'bound', 'virelay_coast', ARRAY['estate', 'city'], 
 ARRAY['perspective_distortion', 'emotional_sync'],
 ARRAY['secretly_controlled', 'controlled_by_npc'],
 $$Worn by a noble who believes it is merely a family heirloom. The mask subtly synchronizes the emotions of everyone in the room with the wearer, making them unnervingly persuasive without understanding why.$$, 
 'active', 4),

-- 5. Red Ledger
($$Red Ledger$$, 5, 'buried', 'virelay_coast', ARRAY['market', 'structure'], 
 ARRAY['cause_effect_break'],
 ARRAY['being_traded', 'misinterpreted'],
 $$A trade ledger that has changed hands between merchant houses. Deals recorded in it become true regardless of whether they were honored — debts vanish, agreements rewrite themselves.$$, 
 'dormant', 3),

-- 6. Glass Window
($$Glass Window$$, 6, 'embedded', 'virelay_coast', ARRAY['estate'], 
 ARRAY['future_bleed'],
 ARRAY['hides_itself', 'feared_as_curse'],
 $$A stained-glass window in a coastal estate that sometimes shows scenes from tomorrow. The family who owns it considers it cursed and has covered it with drapes, unaware of its nature.$$, 
 'dormant', 4),

-- 7. Court Blade
($$Court Blade$$, 7, 'bound', 'virelay_coast', ARRAY['city', 'structure'], 
 ARRAY['power_amplification'],
 ARRAY['competing_factions', 'strategic_asset'],
 $$A ceremonial sword carried by a general in the Virelay war council. It amplifies the force of any command given while holding it. Multiple factions seek to claim it for their own campaigns.$$, 
 'active', 6),

-- 8. Whisper Nail
($$Whisper Nail$$, 8, 'embedded', 'virelay_coast', ARRAY['city', 'settlement'], 
 ARRAY['shared_memory'],
 ARRAY['rumor_based', 'npc_offering_info'],
 $$An iron nail driven into a wall in the Virelay slums. Anyone who presses their ear to it hears fragments of conversations from miles away. A network of informants has formed around it without understanding the source.$$, 
 'dormant', 2),

-- 9. Broken Gate
($$Broken Gate$$, 9, 'fractured', 'virelay_coast', ARRAY['city', 'structure'], 
 ARRAY['spatial_warping'],
 ARRAY['guarded_by_monster', 'dangerous_terrain'],
 $$Fragments of an ancient gate embedded in the outer wall of a Virelay city. Space bends near the gate — distances shift, doorways open to wrong rooms. A creature nests in the distortion.$$, 
 'awakening', 5),

-- 10. Choir Pillar
($$Choir Pillar$$, 10, 'embedded', 'virelay_coast', ARRAY['cathedral'], 
 ARRAY['emotional_sync'],
 ARRAY['worshipped', 'worsening_region'],
 $$A stone pillar in a Virelay cathedral that harmonizes the emotions of the congregation. Over time, the effect has deepened — worshippers now struggle to feel anything independently. A cult is forming around enforced unity.$$, 
 'awakening', 4),

-- 11. Last Witness
($$Last Witness$$, 11, 'bound', 'virelay_coast', ARRAY['city'], 
 ARRAY['memory_bleed'],
 ARRAY['npc_bound_to_it', 'npc_changing_due_to_it'],
 $$Bound to a survivor of a coastal disaster. This person remembers everything — not just their own memories, but the dying thoughts of everyone who perished. They are slowly losing their own identity.$$, 
 'active', 5);

-- =====================================================
-- II. DEYUNE STEPS (Mountains / Stone / Permanence)
-- =====================================================

INSERT INTO public.shards (name, shard_number, form_state, region, site_types, expressions, situations, description, state, power_level) VALUES
-- 12. Black Obelisk
($$Black Obelisk$$, 12, 'embedded', 'deyune_steps', ARRAY['ridge', 'structure'], 
 ARRAY['over_stabilization'],
 ARRAY['competing_factions', 'active_battle'],
 $$A pillar of black stone on a high ridge. Everything around it is locked in place — wind stops, rain freezes mid-fall, birds hang suspended in flight. Two factions fight for control of this zone of absolute stillness.$$, 
 'active', 7),

-- 13. Warden's Spine
($$Warden''s Spine$$, 13, 'embedded', 'deyune_steps', ARRAY['ruin', 'mountain'], 
 ARRAY['decay_resistance'],
 ARRAY['guarded_by_monster', 'dangerous_terrain'],
 $$A crystalline spine embedded in an ancient ruin that refuses to erode. Nothing within its radius decays — corpses do not rot, food does not spoil, wounds do not heal. A creature guards the site, itself immune to death.$$, 
 'dormant', 5),

-- 14. Split Stone
($$Split Stone$$, 14, 'fractured', 'deyune_steps', ARRAY['hills'], 
 ARRAY['duplication'],
 ARRAY['multi_step_discovery', 'splitting'],
 $$A boulder split into three pieces scattered across the Deyune hills. Each piece duplicates small objects placed upon it. Finding all three requires following a trail of doubled items through mountain settlements.$$, 
 'dormant', 4),

-- 15. Sky Thread
($$Sky Thread$$, 15, 'raw', 'deyune_steps', ARRAY['cliff'], 
 ARRAY['gravity_shift'],
 ARRAY['hard_traversal', 'dangerous_terrain'],
 $$A visible thread of light stretching between two cliff faces. Gravity reverses near it — stones fall upward, water flows to the sky. Reaching it requires climbing paths where up and down trade places without warning.$$, 
 'awakening', 6),

-- 16. Wind Spine
($$Wind Spine$$, 16, 'embedded', 'deyune_steps', ARRAY['ridge'], 
 ARRAY['environmental_rearrangement'],
 ARRAY['natural_hazards', 'changing_map'],
 $$A bone-like protrusion from a mountain ridge that rearranges the terrain around it when the wind shifts. Trails disappear, cliffs appear, valleys reshape themselves over days.$$, 
 'active', 5),

-- 17. Three Pillars
($$Three Pillars$$, 17, 'fractured', 'deyune_steps', ARRAY['structure', 'mountain'], 
 ARRAY['stabilization'],
 ARRAY['puzzle_mechanism', 'linked_system'],
 $$Three stone pillars in a triangle formation, each on a different peak. When all three are activated, the valley between them becomes perfectly stable — no Fray, no distortion, nothing changes. The activation mechanism is a puzzle lost to time.$$, 
 'dormant', 7),

-- 18. Shattered Spine
($$Shattered Spine$$, 18, 'fractured', 'deyune_steps', ARRAY['mountain', 'wilderness'], 
 ARRAY['unstable_surges'],
 ARRAY['worsening_region', 'spreading_damage'],
 $$Fragments of a massive shard scattered across a mountain pass. Each piece emits unstable energy surges that destabilize the terrain. The region is slowly becoming impassable.$$, 
 'corrupted', 5),

-- 19. Stone Walker
($$Stone Walker$$, 19, 'bound', 'deyune_steps', ARRAY['wilderness', 'mountain'], 
 ARRAY['environmental_rearrangement'],
 ARRAY['npc_bound_to_it', 'moving_location'],
 $$Bound to a wanderer who reshapes the terrain with every step. Paths appear behind them and vanish ahead. They cannot stop moving without the landscape consuming itself around them.$$, 
 'active', 4),

-- 20. Iron Saint
($$Iron Saint$$, 20, 'bound', 'deyune_steps', ARRAY['monastery'], 
 ARRAY['over_stabilization'],
 ARRAY['removing_harms_region', 'no_correct_answer'],
 $$A monk in a mountain monastery whose meditation has over-stabilized the entire region. Nothing changes within miles — no seasons, no aging, no growth. Removing the shard would shatter the calm, but leaving it starves the land.$$, 
 'active', 6),

-- 21. Buried Crown
($$Buried Crown$$, 21, 'buried', 'deyune_steps', ARRAY['ruin', 'underground'], 
 ARRAY['power_amplification'],
 ARRAY['historical_puzzle', 'clue_chain'],
 $$A crown buried deep in a collapsed mountain kingdom. It amplifies authority — anyone who wears it is obeyed without question. Historical records across several ruins point to its location.$$, 
 'dormant', 7),

-- 22. Silent Core
($$Silent Core$$, 22, 'buried', 'deyune_steps', ARRAY['underground', 'mountain'], 
 ARRAY['stabilization'],
 ARRAY['hides_itself', 'rumor_based'],
 $$Deep within the stone of the Deyune Steps, a perfectly spherical void pulses with stabilizing energy. Local miners speak of a place where picks do not break and tunnels never collapse, but no one can find the source.$$, 
 'dormant', 3);

-- =====================================================
-- III. VARNHALT FRONTIER (Ruins / Expansion / Conflict)
-- =====================================================

INSERT INTO public.shards (name, shard_number, form_state, region, site_types, expressions, situations, description, state, power_level) VALUES
-- 23. Marble Child
($$Marble Child$$, 23, 'bound', 'varnhalt_frontier', ARRAY['settlement'], 
 ARRAY['time_slow'],
 ARRAY['removing_harms_region', 'no_correct_answer'],
 $$A child in a frontier settlement who has not aged in fifty years. The town has built itself around protecting them. Removing the child would age them to death — but the shard is slowly freezing the entire settlement in time.$$, 
 'active', 5),

-- 24. Archive Spine
($$Archive Spine$$, 24, 'embedded', 'varnhalt_frontier', ARRAY['library', 'structure'], 
 ARRAY['memory_anchoring'],
 ARRAY['studied_incorrectly', 'npc_offering_info'],
 $$A crystal spine embedded in the foundation of a frontier library. It preserves every memory of everyone who enters — scholars exploit it for research, but it also records lies, fears, and secrets without distinction.$$, 
 'active', 4),

-- 25. Hunter's Eye
($$Hunter''s Eye$$, 25, 'bound', 'varnhalt_frontier', ARRAY['wilderness'], 
 ARRAY['delayed_perception'],
 ARRAY['npc_bound_to_it', 'npc_changing_due_to_it'],
 $$Bound to a tracker in the frontier. They see everything — but thirty seconds delayed. They perceive the past overlaid on the present, making them both an extraordinary tracker and increasingly unstable.$$, 
 'active', 3),

-- 26. War Singer
($$War Singer$$, 26, 'bound', 'varnhalt_frontier', ARRAY['settlement', 'wilderness'], 
 ARRAY['emotional_sync', 'aggression_trigger'],
 ARRAY['controlled_by_faction', 'escalating_tension'],
 $$Bound to a soldier whose voice synchronizes the battle rage of everyone who hears it. A militia has formed around this person, using their voice as a weapon. The effect spreads further with each battle.$$, 
 'active', 6),

-- 27. Living Archive
($$Living Archive$$, 27, 'bound', 'varnhalt_frontier', ARRAY['settlement', 'library'], 
 ARRAY['memory_overload', 'identity_drift'],
 ARRAY['npc_bound_to_it', 'risk_of_loss'],
 $$A scholar who absorbs the memories of everyone they touch. They know everything, but their own identity is drowning under the weight of a thousand lives. They are close to losing themselves entirely.$$, 
 'corrupted', 5),

-- 28. Glass Root
($$Glass Root$$, 28, 'embedded', 'varnhalt_frontier', ARRAY['underground', 'ruin'], 
 ARRAY['time_slow'],
 ARRAY['dangerous_terrain', 'natural_hazards'],
 $$Translucent root-like tendrils spreading through underground tunnels. Time moves at half speed inside the root network. Explorers enter and emerge hours later believing only minutes have passed.$$, 
 'dormant', 4),

-- 29. Forgotten Gate
($$Forgotten Gate$$, 29, 'buried', 'varnhalt_frontier', ARRAY['ruin'], 
 ARRAY['spatial_warping'],
 ARRAY['historical_puzzle', 'hides_itself'],
 $$An ancient archway buried in frontier ruins that teleports anyone who passes through to a random location within the region. It has been bricked over many times, but the bricks always disappear.$$, 
 'dormant', 5),

-- 30. Echo Pair
($$Echo Pair$$, 30, 'fractured', 'varnhalt_frontier', ARRAY['settlement', 'ruin'], 
 ARRAY['temporal_echoes'],
 ARRAY['multi_step_discovery', 'linked_system'],
 $$Two identical objects — a key and a lock — that exist in separate locations. Events that happen to one echo in the other with a delay. Finding both reveals they are halves of the same shard.$$, 
 'dormant', 3),

-- 31. Broken Path
($$Broken Path$$, 31, 'fractured', 'varnhalt_frontier', ARRAY['wilderness', 'ruin'], 
 ARRAY['spatial_warping'],
 ARRAY['changing_map', 'splitting'],
 $$Fragments of a shard scattered along an old trade route. Each fragment creates a teleport jump — travelers skip sections of the path without realizing it. The route is becoming increasingly unstable.$$, 
 'awakening', 4),

-- 32. Deep Mirror
($$Deep Mirror$$, 32, 'buried', 'varnhalt_frontier', ARRAY['cavern', 'underground'], 
 ARRAY['shared_memory'],
 ARRAY['puzzle_mechanism', 'clue_chain'],
 $$A pool in a deep cavern that reflects not your face but your memories. To retrieve the shard at the bottom, you must face the memory the pool chooses to show you — and it always chooses the one you hide from.$$, 
 'dormant', 5),

-- 33. Court Blade Fragment
($$Court Blade Fragment$$, 33, 'fractured', 'varnhalt_frontier', ARRAY['wilderness', 'settlement'], 
 ARRAY['power_amplification', 'unstable_surges'],
 ARRAY['active_battle', 'competing_factions'],
 $$A fragment of a larger shard scattered in a war zone. It amplifies the power of whoever holds it, but the amplification surges unpredictably. Multiple groups are fighting to collect the pieces.$$, 
 'awakening', 5);

-- =====================================================
-- IV. VIRELAY DEEP FORESTS (Growth / Mutation / Nature)
-- =====================================================

INSERT INTO public.shards (name, shard_number, form_state, region, site_types, expressions, situations, description, state, power_level) VALUES
-- 34. Root Crown
($$Root Crown$$, 34, 'embedded', 'virelay_deep_forests', ARRAY['forest'], 
 ARRAY['accelerated_growth', 'attracts_creatures'],
 ARRAY['worsening_region', 'spreading_damage'],
 $$Embedded in the root system of an ancient tree. Growth accelerates wildly around it — vines crawl in real time, trees mature in days. The forest is expanding, consuming farmland and settlements at the edge.$$, 
 'active', 6),

-- 35. Collapse Root
($$Collapse Root$$, 35, 'embedded', 'virelay_deep_forests', ARRAY['forest'], 
 ARRAY['environmental_rearrangement'],
 ARRAY['spreading_damage', 'area_collapsing'],
 $$A root system that constantly rearranges the forest floor. Paths loop, clearings vanish, landmarks shift. The deeper you go, the more the forest rewrites itself behind you.$$, 
 'active', 5),

-- 36. Divided Root
($$Divided Root$$, 36, 'fractured', 'virelay_deep_forests', ARRAY['forest'], 
 ARRAY['selective_stability'],
 ARRAY['competing_factions', 'region_divided'],
 $$Split across two halves of a forest, each piece creating a different ecosystem. One side thrives in eternal summer, the other in permanent winter. The creatures of each side war at the border.$$, 
 'active', 5),

-- 37. Sealed Root
($$Sealed Root$$, 37, 'buried', 'virelay_deep_forests', ARRAY['forest', 'underground'], 
 ARRAY['selective_stability'],
 ARRAY['ritual_bound', 'historical_puzzle'],
 $$Deep beneath the forest floor, sealed by an ancient ritual. It controls growth within a wide radius — trees grow to exact heights, flowers bloom on schedule. Breaking the seal would unleash uncontrolled growth.$$, 
 'dormant', 4),

-- 38. Flesh Root
($$Flesh Root$$, 38, 'embedded', 'virelay_deep_forests', ARRAY['forest', 'wilderness'], 
 ARRAY['mutation', 'hybridization'],
 ARRAY['monster_emergence', 'breach_forming'],
 $$Fused into the body of a massive creature — half tree, half animal. Other creatures near it begin to mutate, merging plant and animal characteristics. A Fray breach is forming at its core.$$, 
 'corrupted', 6),

-- 39. Black Orchard Core
($$Black Orchard Core$$, 39, 'embedded', 'virelay_deep_forests', ARRAY['grove', 'forest'], 
 ARRAY['mutation', 'behavioral_distortion'],
 ARRAY['controlled_by_faction', 'strategic_asset'],
 $$At the center of an orchard where the fruit changes whoever eats it — enhanced senses, altered appearance, shifted behavior. A faction harvests and sells the fruit, controlling the territory jealously.$$, 
 'active', 5),

-- 40. Bone Field Core
($$Bone Field Core$$, 40, 'embedded', 'virelay_deep_forests', ARRAY['plains', 'forest'], 
 ARRAY['permanent_imprint', 'attracts_creatures'],
 ARRAY['guarded_by_monster', 'monster_emergence'],
 $$Embedded in the earth at the edge of the forest where bones of ancient creatures surface in patterns. Monsters are drawn here, adding their remains to the field. Something beneath remembers every death.$$, 
 'awakening', 5),

-- 41. Hive Core
($$Hive Core$$, 41, 'embedded', 'virelay_deep_forests', ARRAY['forest', 'wilderness'], 
 ARRAY['behavioral_distortion', 'emotional_sync'],
 ARRAY['worsening_region', 'monster_emergence'],
 $$Inside a massive insect swarm that moves as one intelligence. The swarm synchronizes the behavior of creatures within its territory, creating an expanding zone of collective consciousness. It is growing.$$, 
 'active', 5),

-- 42. Devour Stone
($$Devour Stone$$, 42, 'raw', 'virelay_deep_forests', ARRAY['forest', 'wilderness'], 
 ARRAY['accelerated_growth', 'power_drain'],
 ARRAY['dangerous_terrain', 'worsening_region'],
 $$An exposed shard in a predator-rich zone. It feeds on the life energy of anything that dies nearby, converting death into explosive growth. The cycle of death-and-growth is accelerating into a feeding loop.$$, 
 'active', 6),

-- 43. Shadow Spine
($$Shadow Spine$$, 43, 'raw', 'virelay_deep_forests', ARRAY['forest'], 
 ARRAY['invisibility_zones', 'blind_spots'],
 ARRAY['dangerous_terrain', 'npc_hunting_it'],
 $$An exposed shard that bends light around itself, creating zones of absolute darkness. Predators have learned to hunt in the shadow zones. A tracker is searching for it, believing it holds the key to something deeper.$$, 
 'awakening', 4),

-- 44. Crawling Anchor
($$Crawling Anchor$$, 44, 'bound', 'virelay_deep_forests', ARRAY['forest', 'wilderness'], 
 ARRAY['moves_slowly', 'environmental_rearrangement'],
 ARRAY['moving_location', 'causing_migration'],
 $$Bound to a massive creature that migrates through the deep forest. Where it walks, the forest rearranges itself. Its migration path causes waves of displacement — animals flee, plants uproot, settlements relocate.$$, 
 'active', 5);

-- =====================================================
-- V. POLAR / TUNDRA REGION
-- =====================================================

INSERT INTO public.shards (name, shard_number, form_state, region, site_types, expressions, situations, description, state, power_level) VALUES
-- 45. Frost Lung
($$Frost Lung$$, 45, 'embedded', 'polar_tundra', ARRAY['ice_field'], 
 ARRAY['time_slow', 'dead_zones'],
 ARRAY['dangerous_terrain', 'worsening_region'],
 $$Embedded in a vast ice field. Time slows to a crawl within its radius — breaths take minutes, heartbeats space seconds apart. The zone is expanding, and travelers caught at its edge freeze in slow motion.$$, 
 'active', 6),

-- 46. Storm Rib
($$Storm Rib$$, 46, 'embedded', 'polar_tundra', ARRAY['coast', 'ice_field'], 
 ARRAY['weather_control', 'local_storms'],
 ARRAY['natural_hazards', 'dangerous_terrain'],
 $$A curved bone-like shard jutting from an icy coast. Storms spiral around it endlessly — approaching requires navigating a permanent hurricane. The storms have worsened over decades.$$, 
 'active', 5),

-- 47. Twin Flames
($$Twin Flames$$, 47, 'fractured', 'polar_tundra', ARRAY['volcanic', 'ice_field'], 
 ARRAY['energy_conversion', 'unstable_surges'],
 ARRAY['hard_traversal', 'splitting'],
 $$Two shards in a volcanic ice field — one burning, one frozen. Each converts the energy of those nearby into its opposite. Finding both requires traversing zones of extreme heat and cold simultaneously.$$, 
 'awakening', 6),

-- 48. Black Lung
($$Black Lung$$, 48, 'buried', 'polar_tundra', ARRAY['cavern', 'underground'], 
 ARRAY['auditory_distortion', 'suppression_field'],
 ARRAY['hard_traversal', 'natural_hazards'],
 $$Deep in ice caverns, this shard suppresses all sound and most energy in its vicinity. Navigating toward it means operating in total silence, total darkness, and near-total cold.$$, 
 'dormant', 4),

-- 49. Silent King
($$Silent King$$, 49, 'bound', 'polar_tundra', ARRAY['ruin', 'city'], 
 ARRAY['stabilization', 'over_stabilization'],
 ARRAY['removing_harms_region', 'no_correct_answer'],
 $$Bound to a ruler frozen in a throne in an abandoned polar city. Their presence keeps the surrounding region from collapsing into the Fray. Removing them would save the ruler but doom the region.$$, 
 'active', 7),

-- 50. Oracle Bone
($$Oracle Bone$$, 50, 'bound', 'polar_tundra', ARRAY['settlement', 'wilderness'], 
 ARRAY['future_bleed', 'false_signals'],
 ARRAY['npc_bound_to_it', 'npc_changing_due_to_it'],
 $$Bound to a seer in a tundra settlement. They see the future but cannot distinguish true visions from false ones. Their predictions shape the community, but some are terrifyingly wrong.$$, 
 'active', 5),

-- 51. Return Node
($$Return Node$$, 51, 'embedded', 'polar_tundra', ARRAY['wilderness', 'structure'], 
 ARRAY['time_loop', 'compulsion_loops'],
 ARRAY['worsening_region', 'reality_breaking'],
 $$A marker in the tundra that resets everything within its radius to a previous state every seven days. Travelers find themselves walking paths they already walked, fighting battles they already won.$$, 
 'active', 6),

-- 52. Loop Stone
($$Loop Stone$$, 52, 'embedded', 'polar_tundra', ARRAY['valley'], 
 ARRAY['time_loop'],
 ARRAY['puzzle_mechanism', 'time_restricted_access'],
 $$A stone in a frozen valley that traps anyone who touches it in a temporal loop. The only way to break the loop is to take a different action each cycle — but the loop is subtle, and most never realize they are repeating.$$, 
 'dormant', 4),

-- 53. Mirror Basin
($$Mirror Basin$$, 53, 'embedded', 'polar_tundra', ARRAY['ice_field'], 
 ARRAY['shared_memory', 'visual_doubling'],
 ARRAY['historical_puzzle', 'rumor_based'],
 $$A frozen pool that reflects not the sky but the memories of the land. Those who gaze into it see the tundra as it was before the Fray — a lush, green valley. The reflection sometimes shows paths to hidden things.$$, 
 'dormant', 3),

-- 54. Echo Spine
($$Echo Spine$$, 54, 'fractured', 'polar_tundra', ARRAY['ruin', 'ice_field'], 
 ARRAY['temporal_echoes'],
 ARRAY['multi_step_discovery', 'clue_chain'],
 $$Fragments of a spine-like shard scattered across ice ruins. Each piece replays a moment from the past when activated — together they tell a story that reveals the location of a deeper shard.$$, 
 'dormant', 4),

-- 55. Pulse Node
($$Pulse Node$$, 55, 'raw', 'polar_tundra', ARRAY['rift', 'ice_field'], 
 ARRAY['resonance_field', 'unstable_surges'],
 ARRAY['breach_forming', 'worsening_region'],
 $$An exposed shard at the edge of an ice rift. It pulses with resonant energy that grows stronger with each cycle. A Fray breach is forming around it, and the pulses are attracting things from the Drift.$$, 
 'awakening', 6);

-- =====================================================
-- VI. OCEAN / DEEP WATER
-- =====================================================

INSERT INTO public.shards (name, shard_number, form_state, region, site_types, expressions, situations, description, state, power_level) VALUES
-- 56. Deep Anchor
($$Deep Anchor$$, 56, 'buried', 'ocean_deep_water', ARRAY['ocean', 'abyss'], 
 ARRAY['stabilization'],
 ARRAY['hard_traversal', 'rumor_based'],
 $$Resting on the ocean floor, this shard stabilizes the waters above it — currents are calm, tides are predictable, storms never form overhead. Sailors have noticed the pattern but cannot explain the zone of peace.$$, 
 'dormant', 5),

-- 57. Sunken Spine
($$Sunken Spine$$, 57, 'buried', 'ocean_deep_water', ARRAY['ocean', 'abyss'], 
 ARRAY['permanent_imprint'],
 ARRAY['hard_traversal', 'historical_puzzle'],
 $$A spine-like structure at extreme depth, surrounded by the preserved wrecks of every ship that ever sank in this region. The shard imprints and preserves. Reaching it requires navigating a graveyard of perfectly intact vessels.$$, 
 'dormant', 4),

-- 58. Hollow Reef
($$Hollow Reef$$, 58, 'fractured', 'ocean_deep_water', ARRAY['reef', 'ocean'], 
 ARRAY['memory_bleed', 'temporal_echoes'],
 ARRAY['found_accidentally', 'multi_step_discovery'],
 $$Fragments embedded in a living reef. Divers near the reef experience sudden memories that are not their own — fragments of drowned sailors, ancient swimmers, creatures long dead. The memories form a map if assembled.$$, 
 'dormant', 3),

-- 59. Tide Crown
($$Tide Crown$$, 59, 'embedded', 'ocean_deep_water', ARRAY['reef', 'ocean'], 
 ARRAY['weather_control'],
 ARRAY['controlled_by_npc', 'strategic_asset'],
 $$Embedded in a reef system, this shard controls local currents and tides. A coastal settlement has unknowingly built their fishing schedule around its rhythms. A sea lord has discovered its influence and seeks to weaponize the tides.$$, 
 'active', 5),

-- 60. Maw Core
($$Maw Core$$, 60, 'raw', 'ocean_deep_water', ARRAY['abyss', 'ocean'], 
 ARRAY['mutation', 'attracts_creatures'],
 ARRAY['guarded_by_monster', 'monster_emergence'],
 $$An exposed shard in the deep abyss, surrounded by creatures warped beyond recognition. It mutates anything that approaches. The largest creature has built a lair around it, feeding on the mutations.$$, 
 'corrupted', 7),

-- 61. Bone Heart
($$Bone Heart$$, 61, 'embedded', 'ocean_deep_water', ARRAY['ocean'], 
 ARRAY['regenerative_looping'],
 ARRAY['guarded_by_monster', 'npc_hunting_it'],
 $$Embedded in the ribcage of a massive sea creature that cannot die. It regenerates endlessly, trapped in a loop of dying and reviving. Hunters seek the creature for its bone, not realizing the shard keeps it alive.$$, 
 'active', 5),

-- 62. Eye Cluster
($$Eye Cluster$$, 62, 'raw', 'ocean_deep_water', ARRAY['abyss'], 
 ARRAY['perspective_distortion', 'visual_doubling'],
 ARRAY['dangerous_terrain', 'hard_traversal'],
 $$A cluster of eye-shaped shard fragments in the deep water. They distort vision — divers see multiple versions of reality overlapping. Navigation becomes impossible as every direction appears equally valid and equally wrong.$$, 
 'awakening', 4),

-- 63. Fray Maw Node
($$Fray Maw Node$$, 63, 'raw', 'ocean_deep_water', ARRAY['rift', 'ocean'], 
 ARRAY['mutation', 'resonance_field'],
 ARRAY['breach_forming', 'monster_emergence'],
 $$An exposed shard at an ocean rift where the Fray cuts deepest. Drift creatures pour through in waves. The shard resonates with each breach, amplifying the next. A Fray maw is forming — a permanent opening.$$, 
 'corrupted', 8),

-- 64. Pulse Titan Core
($$Pulse Titan Core$$, 64, 'embedded', 'ocean_deep_water', ARRAY['ocean'], 
 ARRAY['resonance_field', 'power_amplification'],
 ARRAY['guarded_by_monster', 'causing_migration'],
 $$Embedded inside a leviathan that generates shockwaves as it swims. Coastal communities track its migration by the tremors. The creature is drawn along shard lines, its path mapping the Pattern beneath the sea.$$, 
 'active', 7),

-- 65. Split Horizon
($$Split Horizon$$, 65, 'raw', 'ocean_deep_water', ARRAY['ocean'], 
 ARRAY['perspective_distortion', 'directional_confusion'],
 ARRAY['hard_traversal', 'mislocated'],
 $$An exposed shard on the open sea where the horizon splits — sailors see two skies, two seas, two horizons. Ships that sail through the split can end up in either version. No one knows which is real.$$, 
 'awakening', 5),

-- 66. Deep Mirror Fragment
($$Deep Mirror Fragment$$, 66, 'buried', 'ocean_deep_water', ARRAY['trench', 'ocean'], 
 ARRAY['shared_memory'],
 ARRAY['historical_puzzle', 'hard_traversal'],
 $$At the bottom of the deepest trench, a mirror-smooth shard reflects not light but memory. It holds the collective memory of everything the ocean has consumed. Reaching it means descending to a place where pressure kills.$$, 
 'dormant', 6);

-- =====================================================
-- VII. FRAY ZONES (Active Collapse Regions)
-- =====================================================

INSERT INTO public.shards (name, shard_number, form_state, region, site_types, expressions, situations, description, state, power_level) VALUES
-- 67. Rift Core
($$Rift Core$$, 67, 'raw', 'fray_zones', ARRAY['fray_zone', 'rift'], 
 ARRAY['mutation', 'attracts_creatures'],
 ARRAY['breach_forming', 'monster_emergence'],
 $$At the heart of an active rift, this shard pulses as monsters spawn around it. Each pulse births something new from the Drift. The rift is widening, and the shard seems to be the mechanism forcing it open.$$, 
 'corrupted', 8),

-- 68. Drift Heart
($$Drift Heart$$, 68, 'raw', 'fray_zones', ARRAY['fray_zone', 'rift'], 
 ARRAY['mutation', 'phasing'],
 ARRAY['reality_breaking', 'area_collapsing'],
 $$Deep within a Fray zone where reality itself phases in and out. The shard is pure Drift given solidity — touching it means phasing partly out of existence. The area around it is collapsing into the Drift.$$, 
 'corrupted', 9),

-- 69. Fold Scar Node
($$Fold Scar Node$$, 69, 'embedded', 'fray_zones', ARRAY['fray_zone', 'ruin'], 
 ARRAY['phasing', 'spatial_warping'],
 ARRAY['active_fray', 'dangerous_terrain'],
 $$Embedded in a scar in reality where the Fold is visible. Objects and people phase between the Everloop and the Fold unpredictably. The terrain warps — buildings exist in two states simultaneously.$$, 
 'active', 7),

-- 70. Fracture Tower Core
($$Fracture Tower Core$$, 70, 'embedded', 'fray_zones', ARRAY['ruin', 'structure'], 
 ARRAY['unstable_surges', 'environmental_rearrangement'],
 ARRAY['worsening_region', 'area_collapsing'],
 $$Inside a ruined tower at the center of a Fray zone. The tower exists in multiple states — sometimes whole, sometimes shattered, sometimes not there at all. Energy surges from the core rearrange the surrounding ruins.$$, 
 'corrupted', 7),

-- 71. Pulse Node Prime
($$Pulse Node Prime$$, 71, 'raw', 'fray_zones', ARRAY['rift', 'fray_zone'], 
 ARRAY['resonance_field', 'calls_other_shards'],
 ARRAY['pulling_others', 'worsening_region'],
 $$A massive exposed shard at a rift that sends resonance pulses across the region. Other shards vibrate in response. It is actively pulling distant shards toward itself — the Convergence is strongest here.$$, 
 'active', 9),

-- 72. Collapse Engine
($$Collapse Engine$$, 72, 'embedded', 'fray_zones', ARRAY['structure', 'ruin'], 
 ARRAY['power_drain', 'dead_zones'],
 ARRAY['worsening_region', 'spreading_damage'],
 $$Embedded in a structure that seems to be a machine of unknown origin. It drains energy from everything it touches — light, heat, life. The dead zone around it grows by meters every day.$$, 
 'corrupted', 7),

-- 73. Broken Anchor Core
($$Broken Anchor Core$$, 73, 'fractured', 'fray_zones', ARRAY['fray_zone', 'ruin'], 
 ARRAY['unstable_surges', 'spatial_warping'],
 ARRAY['splitting', 'worsening_region'],
 $$Fragments of what was once an Anchor — one of the original pillars the First Architects drove into reality. Each fragment destabilizes the space around it. They are slowly drifting apart, and each drift worsens the Fray.$$, 
 'shattered', 8),

-- 74. Mirror Twins
($$Mirror Twins$$, 74, 'fractured', 'fray_zones', ARRAY['fray_zone'], 
 ARRAY['duplication', 'visual_doubling'],
 ARRAY['reality_breaking', 'no_correct_answer'],
 $$Two identical shards that exist in the same space but in different realities. Taking one destroys the other — but both realities need theirs. There is no correct choice; every action creates loss.$$, 
 'active', 7),

-- 75. Hidden Axis
($$Hidden Axis$$, 75, 'buried', 'fray_zones', ARRAY['fray_zone', 'underground'], 
 ARRAY['stabilization'],
 ARRAY['hides_itself', 'requires_npc_info'],
 $$A shard so deeply hidden that the Fray flows around it without touching it. It stabilizes a tiny pocket of reality in the worst zone. Only one NPC knows it exists, and they guard the knowledge to protect the last safe space.$$, 
 'dormant', 6),

-- 76. Binding Axis
($$Binding Axis$$, 76, 'embedded', 'fray_zones', ARRAY['structure', 'fray_zone'], 
 ARRAY['calls_other_shards', 'resonance_field'],
 ARRAY['linked_system', 'leads_to_another_shard'],
 $$Embedded in a structure at a Fray intersection. It links to other shards through resonance — activating it reveals the locations of nearby shards. But each revelation draws the Fray closer to those shards.$$, 
 'active', 8),

-- 77. Prime Fragment
($$Prime Fragment$$, 77, 'raw', 'fray_zones', ARRAY['fray_zone', 'rift'], 
 ARRAY['spatial_warping', 'perspective_distortion'],
 ARRAY['reality_breaking', 'near_collision'],
 $$An impossibly large shard fragment at the deepest point of the Fray. Space around it is compressed — the horizon bends inward, gravity pulls toward it from all directions. It warps everything in extreme distortion.$$, 
 'active', 10);

-- =====================================================
-- VIII. UNKNOWN / DEEP REGIONS
-- =====================================================

INSERT INTO public.shards (name, shard_number, form_state, region, site_types, expressions, situations, description, state, power_level) VALUES
-- 78. Silent Whole
($$Silent Whole$$, 78, 'buried', 'unknown_deep', ARRAY['vault'], 
 ARRAY['suppression_field'],
 ARRAY['hides_itself', 'rumor_based'],
 $$A shard whose existence is only whispered about. It is said to suppress all other shard effects in its presence — a null zone. If it exists, it could be the key to controlling the Convergence, or stopping it entirely.$$, 
 'dormant', 8),

-- 79. Final Thread
($$Final Thread$$, 79, 'raw', 'unknown_deep', ARRAY['vault', 'rift'], 
 ARRAY['time_drift'],
 ARRAY['hides_itself', 'clue_chain'],
 $$A thread-thin shard that exists between moments. It can only be perceived in the space between one heartbeat and the next. Finding it requires following clues across multiple regions to a location that exists outside normal time.$$, 
 'dormant', 9),

-- 80. Convergence Stone
($$Convergence Stone$$, 80, 'embedded', 'unknown_deep', ARRAY['structure'], 
 ARRAY['calls_other_shards', 'moves_slowly'],
 ARRAY['pulling_others', 'causing_migration'],
 $$A shard that is actively pulling all other shards toward itself. It moves slowly, drifting between regions over years. Where it passes, shards in the area shift position. It is the clearest sign that the Convergence is real.$$, 
 'active', 9),

-- 81. Balance Core
($$Balance Core$$, 81, 'buried', 'unknown_deep', ARRAY['underground'], 
 ARRAY['stabilization', 'selective_stability'],
 ARRAY['hides_itself', 'requires_npc_info'],
 $$A shard that perfectly balances stability and instability in its area — neither growing nor shrinking, neither stable nor chaotic. It represents what reality might look like if the Fray were healed. Only legends mention it.$$, 
 'dormant', 7),

-- 82. Vault Core
($$Vault Core$$, 82, 'buried', 'unknown_deep', ARRAY['vault', 'underground'], 
 ARRAY['suppression_field'],
 ARRAY['historical_puzzle', 'puzzle_mechanism'],
 $$Sealed inside a vault built by the First Architects specifically to contain it. The vault suppresses everything — shard effects, Fray influence, even thought. Opening it requires solving a puzzle designed by minds that no longer exist.$$, 
 'dormant', 8),

-- 83. Hidden Crown Fragment
($$Hidden Crown Fragment$$, 83, 'buried', 'unknown_deep', ARRAY['vault'], 
 ARRAY['power_amplification'],
 ARRAY['clue_chain', 'leads_to_another_shard'],
 $$A fragment of a crown that may be the same shard as the Buried Crown of Deyune. If so, uniting them would create something far more powerful. Clues in multiple regions suggest the fragments are connected.$$, 
 'dormant', 7),

-- 84. Deep Thread Node
($$Deep Thread Node$$, 84, 'raw', 'unknown_deep', ARRAY['rift'], 
 ARRAY['time_drift', 'temporal_echoes'],
 ARRAY['hard_traversal', 'reality_breaking'],
 $$A node in a place where time itself has frayed. Past, present, and future coexist in the same space. Navigating it means moving through all three simultaneously, with no way to know which timeline you are in.$$, 
 'awakening', 8),

-- 85. Lost Axis
($$Lost Axis$$, 85, 'buried', 'unknown_deep', ARRAY['vault'], 
 ARRAY['stabilization'],
 ARRAY['hides_itself', 'mislocated'],
 $$A shard that may not exist at all — or may exist in multiple places simultaneously. Reports of its location contradict each other. Each location shows signs of a shard having been there, but none contain it.$$, 
 'dormant', 6),

-- 86. Returning Spine
($$Returning Spine$$, 86, 'embedded', 'unknown_deep', ARRAY['structure'], 
 ARRAY['time_loop', 'regenerative_looping'],
 ARRAY['puzzle_mechanism', 'time_restricted_access'],
 $$A shard embedded in a structure that resets itself every dawn. Anything taken from it returns at sunrise. The only way to permanently remove it is to find a window in the reset cycle — but the window shrinks each time.$$, 
 'active', 6),

-- 87. Fractured Whole
($$Fractured Whole$$, 87, 'fractured', 'unknown_deep', ARRAY['vault', 'rift'], 
 ARRAY['calls_other_shards', 'splits_recombines'],
 ARRAY['near_collision', 'leads_to_another_shard'],
 $$Multiple shards that are fragments of one original whole. They drift apart and snap back together on a centuries-long cycle. When they unite briefly, the resulting energy pulse can be felt across regions.$$, 
 'awakening', 9),

-- 88. Unnamed Core
($$Unnamed Core$$, 88, 'buried', 'unknown_deep', ARRAY['vault'], 
 ARRAY['suppression_field', 'stabilization'],
 ARRAY['hides_itself', 'rumor_based'],
 $$No one has ever named this shard because no one who has found it remembers finding it. It suppresses not just effects but memory of its own existence. It is the most hidden thing in the Everloop — and may be the most important.$$, 
 'dormant', 10);
