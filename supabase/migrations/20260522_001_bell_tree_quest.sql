-- =====================================================
-- The Bell Tree and the Broken World — Live-Play Quest
-- Adds combat mechanics to The Echo + The Cleaved entities,
-- and seeds the quest (with scenes) owned by MarcMercury.
-- =====================================================

DO $$
DECLARE
    creator_id UUID;
    bellroot_id UUID;
    new_quest_id UUID;
    echo_id UUID;
    cleaved_id UUID;
BEGIN
    SELECT id INTO creator_id FROM public.profiles WHERE username = 'MarcMercury' LIMIT 1;
    IF creator_id IS NULL THEN
        RAISE EXCEPTION 'Could not find creator profile MarcMercury';
    END IF;

    SELECT id INTO echo_id FROM public.canon_entities WHERE slug = 'the-echo-mon8u4fw' LIMIT 1;
    SELECT id INTO cleaved_id FROM public.canon_entities WHERE slug = 'the-cleaved-mon86lvm' LIMIT 1;

    -- =====================================================
    -- 1) Battle mechanics: The Echo (swarm member)
    -- =====================================================
    IF echo_id IS NOT NULL THEN
        UPDATE public.canon_entities
        SET extended_lore = COALESCE(extended_lore, '{}'::jsonb) || jsonb_build_object(
            'monster_stats', jsonb_build_object(
                'size', 'small',
                'creatureType', 'aberration',
                'subtype', 'drift fragment, swarm member',
                'alignment', 'unaligned',
                'role', 'controller',
                'cr', 0.125,
                'xp', 25,
                'proficiencyBonus', 2,
                'hp', 1,
                'hitDice', '1 (any hit destroys it)',
                'ac', 12,
                'acSource', 'shifting incorporeal form',
                'movements', jsonb_build_array(
                    jsonb_build_object('type', 'walk', 'speed', 30),
                    jsonb_build_object('type', 'fly', 'speed', 20, 'note', 'hover')
                ),
                'abilities', jsonb_build_object('STR', 4, 'DEX', 14, 'CON', 8, 'INT', 6, 'WIS', 10, 'CHA', 14),
                'savingThrows', jsonb_build_object(),
                'skills', jsonb_build_array(jsonb_build_object('name', 'Stealth', 'bonus', 4)),
                'damageVulnerabilities', jsonb_build_array('thunder', 'psychic', 'force'),
                'damageResistances', jsonb_build_array('slashing', 'piercing'),
                'damageImmunities', jsonb_build_array('poison', 'cold'),
                'conditionImmunities', jsonb_build_array('charmed', 'frightened', 'poisoned', 'exhaustion'),
                'senses', jsonb_build_object('darkvision', 60, 'passivePerception', 10),
                'languages', jsonb_build_array('understands the languages of its target but cannot speak'),
                'damagePerRound', 'None directly. Attachment-based threat.',
                'multiattack', 'The swarm does not attack individually. It converges collectively toward a single target.',
                'traits', jsonb_build_array(
                    jsonb_build_object('name', 'Collective Initiative', 'description', 'Echoes share a single initiative for the entire swarm. Roll one initiative per 10 Echoes present (round up). 22 Echoes = 3 initiative entries shared across the swarm.'),
                    jsonb_build_object('name', 'Singular Focus', 'description', 'On its turn, every Echo in the swarm moves one space closer to the swarm''s current target. Echoes never split their focus across multiple players.'),
                    jsonb_build_object('name', 'Shatter on Contact', 'description', 'Any successful weapon attack or damaging spell destroys a single Echo. It collapses into fine, scentless grey ash.'),
                    jsonb_build_object('name', 'Attachment', 'description', 'When three or more Echoes occupy spaces adjacent to a single creature, ONE Echo immediately attaches to that creature as a host. The remaining swarm abandons that target and converges toward another.'),
                    jsonb_build_object('name', 'Host Possession (Attached Only)', 'description', 'An attached Echo partially phases into the host''s shoulders and upper back. The host takes no direct damage and believes they are acting normally. The host hears whispers, experiences delayed thoughts, subtle disorientation, and missing time.'),
                    jsonb_build_object('name', 'False Strike (Attached Only)', 'description', 'After the host resolves any attack, they secretly roll the Redirect Die — a die one size larger than the player count (4p=d6, 6p=d8, 8p=d10, 10+=d12/d20). If the result matches another player''s initiative number, the attack instead strikes that player (who may defend normally). Any other result strikes nothing. The host is told the attack succeeded as intended.'),
                    jsonb_build_object('name', 'Host Shield', 'description', 'Attacking an attached Echo is treated as an attack against the host. Successful attacks deal 50% damage to the host and do NOT destroy the Echo. The Echo only dies via detachment.')
                ),
                'actions', jsonb_build_array(
                    jsonb_build_object('name', 'Converge', 'description', 'The Echo (or full swarm on its shared turn) moves up to its speed toward the swarm''s current target. No attack roll.', 'actionType', 'action', 'targets', 'swarm target')
                ),
                'bonusActions', jsonb_build_array(),
                'reactions', jsonb_build_array(),
                'legendaryActions', jsonb_build_object('count', 0, 'description', '', 'actions', jsonb_build_array()),
                'tactics', 'Echoes do not kill — they attach. The swarm chooses one host at a time, converges, attaches one Echo, then redirects the rest of the swarm to the next host. Spreading panic and friendly fire is the goal.',
                'weaknesses', jsonb_build_array(
                    'Violent Recognition: a teammate may grab the host, shout into their face, and physically shake them (STR, Persuasion, or roleplay-driven check). On success the Echo destabilizes and dies instantly. The host takes no damage.',
                    'Resonant Overload: bells, thunder, psionic blasts, tuning forks, shield strikes, or any focused sonic/psychic resonance instantly detaches and destroys the Echo without harming the host.',
                    'Reflection: forcing the host to clearly see themselves in a mirror, polished steel, still water, or magical reflection destabilizes the Echo immediately.',
                    'Self-Harmed Clarity: the host deliberately attacks themselves (or rolls their own initiative number on a False Strike). They take only 10% rolled damage, and the Echo immediately detaches and dies. Deliberate self-targeted certainty creates a paradox the Echo cannot survive.'
                ),
                'regionId', 'bellroot',
                'isOneOff', false,
                'whatBrokeHere', 'The Fray''s fracture in Bellroot Vale, anchored by the Bell Tree, leaks unfinished thoughts and discarded intentions out of the Drift.',
                'whatLeakedThrough', 'Low-mass cognitive residue — half-formed thoughts, forgotten names, fragments of dreams that never resolved.',
                'drawnTo', 'Living minds capable of finishing a thought. They converge on whichever party member feels the most certain of themselves.'
            )
        )
        WHERE id = echo_id;
        RAISE NOTICE 'Updated The Echo monster_stats';
    END IF;

    -- =====================================================
    -- 2) Battle mechanics: The Cleaved (mid-level boss)
    -- =====================================================
    IF cleaved_id IS NOT NULL THEN
        UPDATE public.canon_entities
        SET extended_lore = COALESCE(extended_lore, '{}'::jsonb) || jsonb_build_object(
            'monster_stats', jsonb_build_object(
                'size', 'large',
                'creatureType', 'aberration',
                'subtype', 'drift-cleft horror',
                'alignment', 'chaotic neutral',
                'role', 'brute',
                'cr', 6,
                'xp', 2300,
                'proficiencyBonus', 3,
                'hp', 126,
                'hitDice', '12d10 + 60',
                'ac', 15,
                'acSource', 'flayed plating of stitched bone and bark',
                'movements', jsonb_build_array(
                    jsonb_build_object('type', 'walk', 'speed', 30)
                ),
                'abilities', jsonb_build_object('STR', 20, 'DEX', 10, 'CON', 20, 'INT', 6, 'WIS', 12, 'CHA', 8),
                'savingThrows', jsonb_build_object('STR', 8, 'CON', 8),
                'skills', jsonb_build_array(
                    jsonb_build_object('name', 'Athletics', 'bonus', 8),
                    jsonb_build_object('name', 'Perception', 'bonus', 4)
                ),
                'damageVulnerabilities', jsonb_build_array('bludgeoning', 'force'),
                'damageResistances', jsonb_build_array('slashing', 'piercing', 'fire'),
                'damageImmunities', jsonb_build_array('necrotic'),
                'conditionImmunities', jsonb_build_array('charmed', 'frightened', 'exhaustion'),
                'senses', jsonb_build_object('darkvision', 60, 'truesight', 10, 'passivePerception', 14),
                'languages', jsonb_build_array('understands Common and Deep Speech; cannot speak coherently'),
                'damagePerRound', '~32 (Stitching Strike + escalating burn) — designed for a 4–8 player party of mid-level adventurers.',
                'multiattack', 'The Cleaved makes one Stitching Strike and may use Repulsion Surge if recharged.',
                'traits', jsonb_build_array(
                    jsonb_build_object('name', 'Split Anatomy', 'description', 'The Cleaved exists as two halves hovering inches apart, connected by arcing Drift energy. It does not view living creatures as prey — it views them as missing pieces to stitch itself whole again.'),
                    jsonb_build_object('name', 'Unstable Anatomy', 'description', 'When forced apart (e.g., the halves are pushed away from each other), the Cleaved''s speed drops by 10 ft but its melee damage increases by 1d8 until the start of its next turn. When forced together, it instead suffers catastrophic destabilization (see Forced Unity weakness).'),
                    jsonb_build_object('name', 'Burning Stitches', 'description', 'At the start of the Cleaved''s turn, every creature restrained by Stitching Strike takes 2d6 fire damage. This damage increases by 1d6 each subsequent round the creature remains restrained.'),
                    jsonb_build_object('name', 'Drift-Cleft', 'description', 'The Cleaved cannot heal itself. Damage dealt by crushing, compressing, binding, or synchronized dual strikes ignores its resistances.')
                ),
                'actions', jsonb_build_array(
                    jsonb_build_object(
                        'name', 'Stitching Strike',
                        'description', 'Melee grapple attack against one creature within 10 ft. On a hit the target is restrained between the Cleaved''s two halves, taking 2d8 + 5 bludgeoning damage. While restrained the target suffers Burning Stitches at the start of each of the Cleaved''s turns. The target may escape with a successful Athletics or Acrobatics check (DC 16) at the end of its turn.',
                        'actionType', 'action',
                        'attackBonus', 8,
                        'reach', 10,
                        'damage', '2d8 + 5 bludgeoning + Burning Stitches',
                        'targets', 'one creature'
                    ),
                    jsonb_build_object(
                        'name', 'Repulsion Surge',
                        'description', 'A violent force pulse erupts outward from the split. Each creature within 15 ft must make a DC 15 Dexterity saving throw or be hurled 20 ft backward and take 4d6 force damage (half on save). Restrained targets automatically fail.',
                        'actionType', 'action',
                        'recharge', '5-6',
                        'saveAbility', 'DEX',
                        'saveDC', 15,
                        'damage', '4d6 force',
                        'targets', 'each creature in 15 ft radius',
                        'saveEffect', 'half damage, no displacement'
                    ),
                    jsonb_build_object(
                        'name', 'Skewer the Living',
                        'description', 'If a creature is restrained by Stitching Strike when the Cleaved is reduced to half HP, the Cleaved attempts to embed the creature between its halves as a "stitch." The target must succeed on a DC 16 Constitution save or be impaled, taking 6d6 piercing damage and gaining the unconscious condition. The Cleaved regains 15 HP.',
                        'actionType', 'action',
                        'recharge', 'after first use per encounter',
                        'saveAbility', 'CON',
                        'saveDC', 16,
                        'damage', '6d6 piercing',
                        'saveEffect', 'half damage, no impalement'
                    )
                ),
                'bonusActions', jsonb_build_array(),
                'reactions', jsonb_build_array(
                    jsonb_build_object(
                        'name', 'Failed Closure',
                        'description', 'When a player rolls a critical failure within 15 ft of the Cleaved, the creature reflexively lunges toward them and makes one Stitching Strike against them as a reaction.',
                        'actionType', 'reaction'
                    )
                ),
                'legendaryActions', jsonb_build_object('count', 0, 'description', '', 'actions', jsonb_build_array()),
                'tactics', 'The Cleaved is not a hunter — it is a desperate, dying thing trying to make itself whole. It pursues the largest available body or the most physically present player and tries to grapple them between its halves. It avoids targets that have used Reflection or Resonance against its Echoes earlier in the session.',
                'weaknesses', jsonb_build_array(
                    'Forced Unity: when the two halves are physically forced together (grapples, binding magic, chains, vines, earth manipulation, magnetic effects, or synchronized dual strikes that hit both halves the same round), the creature takes the MAXIMUM damage of any attack that turn and is stunned until the end of its next turn.',
                    'Mirrored Attacks: an attack that strikes both halves simultaneously (e.g., a piercing line through both, twin strike from a pair of allies, a thrown chain) ignores resistances and deals double the rolled damage.',
                    'Crushing / Compressive damage: bludgeoning damage and force compression ignore the Cleaved''s resistances and treat it as vulnerable.',
                    'Single-point destruction: slashing, single-point piercing, fire, and chaotic splash damage are absorbed into its instability. The Cleaved soaks uncontrolled destruction.'
                ),
                'regionId', 'bellroot',
                'isOneOff', true,
                'whatBrokeHere', 'A Drift wound near the Bell Tree split a living thing down its centerline and refused to let either half die.',
                'whatLeakedThrough', 'Raw, dividing Drift energy that simultaneously repels and demands wholeness.',
                'drawnTo', 'Anything whole. It is drawn to undivided minds and intact bodies as potential stitches.'
            )
        )
        WHERE id = cleaved_id;
        RAISE NOTICE 'Updated The Cleaved monster_stats';
    END IF;

    -- =====================================================
    -- 3) Insert the Quest — owned by MarcMercury
    -- =====================================================
    new_quest_id := gen_random_uuid();

    INSERT INTO public.quests (
        id, title, slug, description, dm_id, campaign_type, game_mode, status,
        max_players, is_public, allow_spectators, world_era, fray_intensity,
        referenced_entities, settings,
        setting_name, tone, campaign_length, difficulty_preset, difficulty_sliders,
        ruleset, progression, narrative_settings, idol_settings,
        world_structure, world_persistence, immersion, player_config,
        ai_assist_level, character_entry_mode, character_rules, tags, metadata
    ) VALUES (
        new_quest_id,
        'The Bell Tree and the Broken World',
        'the-bell-tree-and-the-broken-world',
        'A Live-Play one-shot for 4–8 players, a Narrator, and a DM. Rain falls in long silver lines across the road to Drelmere. A bell rings somewhere in the distant hills. The townsfolk stop walking — and pretend nothing happened. Storytelling is split from reality: the Narrator embodies atmosphere, NPCs, and tension. The DM remains the impartial law of the world.',
        creator_id,
        'quest',
        'one_shot',
        'draft',
        8,
        true,
        true,
        'broken',
        0.75,
        ARRAY[echo_id, cleaved_id]::uuid[],
        jsonb_build_object(
            'allow_pvp', false,
            'death_rules', 'narrative',
            'difficulty', 'hard',
            'atmosphere_enabled', true,
            'fog_of_war', true,
            'dynamic_lighting', true,
            'ai_co_dm', false,
            'idol_system', true,
            'max_idols_per_player', 2
        ),
        'everloop_world',
        'dark_horror',
        'one_shot',
        'brutal',
        jsonb_build_object(
            'combat_lethality', 70,
            'resource_scarcity', 55,
            'puzzle_complexity', 80,
            'social_consequence', 75,
            'random_event_frequency', 60
        ),
        jsonb_build_object(
            'core_rules', 'everloop_overlay',
            'initiative_tracking', true,
            'advantage_disadvantage', true,
            'spell_slot_tracking', true,
            'concentration_tracking', true,
            'encumbrance', false,
            'critical_rules', 'cinematic',
            'combat_mode', 'hybrid'
        ),
        jsonb_build_object(
            'leveling_style', 'milestone',
            'progression_speed', 'standard',
            'feats_enabled', true,
            'multiclassing_enabled', true,
            'custom_abilities_enabled', false
        ),
        jsonb_build_object(
            'hidden_info_level', 'heavy',
            'event_engine_intensity', 'active',
            'scene_based_mode', true,
            'narration_style', 'narrator_and_dm',
            'narrator_config', jsonb_build_object(
                'bell_ritual', true,
                'embodiment', true,
                'private_whispers', true,
                'dm_neutral_arbiter', true
            )
        ),
        jsonb_build_object(
            'enabled', true,
            'who_earns', 'individuals',
            'when_usable', 'anytime',
            'effects_allowed', jsonb_build_array('reroll', 'reveal', 'shield', 'shift', 'immunity')
        ),
        'linear',
        'session_reset',
        jsonb_build_object(
            'music', true,
            'ambient_effects', true,
            'visual_effects_intensity', 'high',
            'dice_animation', 'cinematic'
        ),
        jsonb_build_object(
            'role_types', 'standard_party',
            'knowledge_level', 'partial'
        ),
        'off',
        'bring_own',
        jsonb_build_object(
            'min_level', 4,
            'max_level', 7,
            'allowed_classes', jsonb_build_array(),
            'everloop_classes_allowed', true,
            'stat_generation', 'any',
            'inventory_restrictions', jsonb_build_array()
        ),
        ARRAY['region:bellroot', 'live-play', 'narrator-and-dm', 'horror', 'one-shot']::text[],
        jsonb_build_object(
            'regions', jsonb_build_array('bellroot'),
            'location_names', jsonb_build_array('Drelmere', 'The Cracked Pot Tavern', 'Mayor''s Office', 'The Dark Woods', 'Watcher''s Hill', 'The Bell Tree'),
            'liveplay', jsonb_build_object(
                'narrator_present', true,
                'dm_present', true,
                'required_table_props', jsonb_build_array('physical bell', 'candles or dim lighting', 'play order sheet', 'Echo Attachment index cards', 'written riddle cards', 'battle maps', 'distorted ambient audio')
            )
        )
    )
    ON CONFLICT (slug) DO UPDATE SET
        dm_id = EXCLUDED.dm_id,
        description = EXCLUDED.description,
        narrative_settings = EXCLUDED.narrative_settings,
        metadata = EXCLUDED.metadata,
        referenced_entities = EXCLUDED.referenced_entities,
        updated_at = NOW()
    RETURNING id INTO new_quest_id;

    -- Clear any previously seeded scenes so re-runs are idempotent.
    DELETE FROM public.quest_scenes WHERE quest_id = new_quest_id;

    -- =====================================================
    -- 4) Quest scenes
    -- =====================================================
    INSERT INTO public.quest_scenes (quest_id, title, description, scene_order, scene_type, mood, narration, dm_notes, linked_entities, status, atmosphere)
    VALUES
    (new_quest_id, 'The Road to Drelmere', 'Opening narration. Rain on the road. The first distant bell.', 1, 'narrative', 'melancholy',
     E'Rain falls in long silver lines across the road to Drelmere. Mud clings heavily to boots and wagon wheels alike. The farther you travel into Bellroot Vale… the quieter the world becomes.\n\n[BELL — one slow toll, let it fully ring out]\n\nA bell rings somewhere in the distant hills. Not loud. Not celebratory. Just one deep metallic toll swallowed by fog. The nearby villagers stop walking. Nobody speaks. Nobody looks toward the sound. After several long seconds… they quietly continue moving.\n\nAhead, warm lanternlight flickers behind rain-streaked windows. The town of Drelmere waits. And somewhere beyond the hills… something enormous rings again.',
     E'You are on the road en route to Drelmere. Strike the bell ONCE at the indicated cue and again at the end of the scene. Wait for silence at the table both times before continuing.',
     ARRAY[]::uuid[], 'prepared', '{"lighting":"dim","time_of_day":"dusk","weather":"steady rain"}'::jsonb),

    (new_quest_id, 'Entering Drelmere', 'Atmosphere of a town pretending everything is normal.', 2, 'exploration', 'mysterious',
     E'As your group enters town, curtains quietly close nearby. Children playing in the muddy street are immediately ushered indoors when a distant bell rings somewhere high in the hills. Nobody reacts dramatically to the sound. That somehow makes it worse.\n\nAnd as the rain continues falling over Drelmere, the entire town feels like a place pretending very hard that everything is normal.',
     E'DRELMERE — central town of Bellroot Vale, once a sanctuary for those called Dreamers. Aging settlement on muddy crossroads. Stone foundations sinking unevenly into the earth.',
     ARRAY[]::uuid[], 'prepared', '{"lighting":"firelight","time_of_day":"evening","weather":"steady rain"}'::jsonb),

    (new_quest_id, 'The Cracked Pot Tavern — Garron Pike', 'Empty tavern. Garron pretends to serve no one until he notices the party.', 3, 'social', 'mysterious',
     E'Warm amber light spills from the windows. But the closer you get… the quieter the tavern feels. No laughter. No music. No conversation. Inside: lanterns burn low, smoke curls through old rafters. Despite clearly being open… the tavern is empty.\n\nOnly one man behind the counter. He does not acknowledge you immediately. He pretends to serve invisible patrons. Slides imaginary drinks. Listens to empty chairs. Laughs softly to nobody. Then suddenly freezes. Notices you. Slowly drags back an untouched imaginary mug.\n\n"Hmmm… I didn''t see you all come in. Welcome. You all look soaked from the rain. Warm yourselves. Pay no mind to those bells. What can I get you to drink?"',
     E'GARRON PIKE — late fifties, broad shouldered, two fingers missing from one hand, eyes permanently tired. Narrator glances at empty chairs, pauses as though hearing responses, steps around invisible people, refills imaginary mugs — never explains. Strike bell lightly outside dialogue. After enough player questioning, Garron''s humor drops and he delivers the call to action (talk to the Mayor or Old Eidon; do NOT seek the Bell Tree yet). End the scene by striking the bell sharply — Garron resets and greets the party again as if for the first time.',
     ARRAY[]::uuid[], 'prepared', '{"lighting":"firelight","time_of_day":"evening","weather":"steady rain"}'::jsonb),

    (new_quest_id, 'Mayor Elric Vale', 'A cluttered office of contradicting maps.', 4, 'social', 'tense',
     E'The mayor''s office sits near the eastern edge of Drelmere overlooking the fog-covered roads leading toward the hills. Unlike the rest of the town, several bells hang around the exterior windows instead of above the doorway.\n\nInside, the office feels cluttered in the way desperate places become cluttered. Maps cover nearly every wall. Different handwriting. Different routes. Different geography. Entire roads have been crossed out and redrawn repeatedly. Several maps contradict each other entirely. One map shows the Bell Tree north of Drelmere. Another places it west. One road appears on some maps and is missing from others.\n\n"Ah… yes. You''re the outsiders Garron mentioned." He glances toward one of the maps on the wall. Frowns. Moves it slightly. "Sorry… I keep thinking that road used to be farther east. Or maybe it still is. How can I help you?"',
     E'Modular conversation. Branches: the Bell Tree (no one agrees how long it''s been there), the bells (warn? call things? remember things?), disappearances (people come back forgetting family), the woods (paths move, carved signs like "Two wrongs make a right?"), Eidon (the hermit on Watcher''s Hill — wisest or craziest). If pressed hard, the Mayor admits to hiding things: "Of course I''m hiding things. I''m trying to keep this town functioning." Push toward Eidon.',
     ARRAY[]::uuid[], 'prepared', '{"lighting":"dim","time_of_day":"night","weather":"steady rain"}'::jsonb),

    (new_quest_id, 'The Dark Woods — Echo Swarm', 'The party enters the wrong-feeling woods and is converged on by 22 Echoes.', 5, 'combat', 'horror',
     E'The woods beyond Drelmere have paths barely wider than a single person. Trees grow too close together, black branches tangling overhead tightly enough to swallow most of the remaining daylight.\n\nThe woods feel wrong immediately. Not hostile. Not haunted. Just… uncertain. Footsteps slightly delayed. Whispers of your own voices. Fragments of conversations. Branches moving without wind. Then: movement. Small things. Watching.\n\nAt first the shapes simply watch from between the trees. Still and barely visible against the darkness. Then one moves. Not naturally. Its body jerks sideways in short broken motions. More begin emerging from the woods. Not running. Not charging. Gathering. Swarming.\n\nAnd you realize: every single one of the creatures is slowly converging toward the same member of the party.',
     E'Place 22 Echo tokens on the table, concentrated near one player. Echoes share collective initiative — 1 roll per 10 Echoes (= 3 rolls). On the swarm turn, ALL Echoes move one space toward the current target. When 3+ are adjacent to a player, ONE attaches: silently hand that player the Echo Attachment Card and the Redirect Die (size = playercount + 2). The rest of the swarm immediately picks a NEW target. Do NOT publicly announce attachment, redirect, or detachment mechanics. Let the table discover them: Violent Recognition, Resonant Overload, Reflection, Self-Harmed Clarity.',
     ARRAY[echo_id]::uuid[], 'prepared', '{"lighting":"dark","time_of_day":"night","weather":"fog"}'::jsonb),

    (new_quest_id, 'The Carvings and The Fork', 'Riddle path. The first choice always fails.', 6, 'puzzle', 'mysterious',
     E'Once the final Echo collapses into ash, the woods become quiet again almost immediately. Too quiet. The only visible path forward continues deeper between the trees.\n\nAs you continue, carvings begin appearing on the bark of nearby trees. Old. Deeply weathered. But still readable. OLD E. THIS WAY →. KEEP GOING IDIOTS →. NO SERIOUSLY THIS WAY. IF YOU HIT THE SWAMP YOU''VE GONE TOO FAR. STAIRS ARE THE WORST PART.\n\nEventually the woods open into a fork in the path. A massive dead tree stands between the two roads, its bark covered in hundreds of carved arrows. Carved deep into the center:\n\n  THE FIRST PATH IS NEVER RIGHT.\n  CORRECTING YOURSELF IS NOT RIGHT.\n  BEING WRONG TWICE IS RIGHT.\n  THREE TIMES NOT RIGHT AND CERTAIN DEATH AWAITS.\n  CHOOSE YOUR PATH AND WALK.',
     E'Solution: the FIRST choice always loops back to the fork. Changing direction counts as "correcting yourself" and also loops (Strike Two). The correct answer is to choose the SAME direction twice. Examples: Right → loop → Right AGAIN = success. Or Left → loop → Left AGAIN = success. If the party changes direction a third time, do NOT return them — call for initiative for The Cleaved encounter.',
     ARRAY[]::uuid[], 'prepared', '{"lighting":"dark","time_of_day":"night","weather":"fog"}'::jsonb),

    (new_quest_id, 'The Cleaved (Optional Boss)', 'Triggered only if the party fails the riddle by changing direction a third time.', 7, 'boss', 'horror',
     E'The forest becomes completely silent. No wind. No footsteps. No breathing. The fog between the trees ahead slowly begins to split apart. At first it looks like two massive figures walking side by side through the woods. Then the shape steps closer. And you realize: it is one creature.\n\nSplit completely down the middle. The two halves hover inches apart from one another, connected only by jagged strands of burning black energy arcing violently between exposed ribs and pulsing organs. Skewered between the halves are dead animals and blackened human remains burned directly into the wound like crude stitches. Several still twitch weakly.\n\nThen from behind the hideous creature, 10 Echoes appear.',
     E'Place 10 Echo markers and 1 Cleaved marker on the battle map. Echoes use standard swarm mechanics. The Cleaved acts independently — Stitching Strike (grapple + escalating burn), Repulsion Surge (recharge 5–6), Skewer the Living at half HP, Failed Closure as a reaction to critical fails. Weakness: forced unity. Bludgeoning, force compression, synchronized dual strikes, mirrored attacks on both halves, binding magic, chains/vines, earth manipulation, and grappling the halves together all bypass resistances. Slashing, single-point piercing, fire, and splash damage are absorbed. On defeat use the closing narration: the halves finally fuse for a fraction of a second — relief, not pain — then disintegrate into grey ash. Any remaining Echoes unravel into smoke.',
     ARRAY[echo_id, cleaved_id]::uuid[], 'prepared', '{"lighting":"dark","time_of_day":"night","weather":"unnatural silence"}'::jsonb),

    (new_quest_id, 'Watcher''s Hill — Old Eidon', 'A hermit who is younger than he should be, and barefoot.', 8, 'social', 'wonder',
     E'Uneven stairs. Shifting stones. Paths subtly changing. A crooked gate at the top. Symbols rearrange when unobserved. The gate opens on its own.\n\nThe door opens before you knock. A young man — mid twenties. Silver eyes. Barefoot. Entirely unsurprised.\n\n"Took you long enough." He studies you. "You smell like Echo ash. That means the woods still like you." Pause. "That''s unfortunate." Then casually: "Mind the third stair. It forgets where it is sometimes."',
     E'Eidon''s house: impossible geometry, maps contradicting themselves, endless soup, silent hanging bells, staircases descending impossibly far. Use his lines naturally: "The Bell Tree isn''t growing upward. It''s arriving." / "The world''s not broken in the normal sense. Broken things stop moving." / "Some memories rot if nobody touches them long enough." / "I remember tomorrow being difficult." Eidon joins the party only until the first chamber, then stops: "Can''t go much deeper. The roots know me too well." Before leaving: "If the bells start ringing in your own voice… run."',
     ARRAY[]::uuid[], 'prepared', '{"lighting":"magical","time_of_day":"midnight","weather":"none"}'::jsonb),

    (new_quest_id, 'Riddle I — Memory Gate', 'Five bells across a chamber. WHAT REMAINS WHEN MEMORY FAILS?', 9, 'puzzle', 'dark',
     E'Five bells hang across the chamber. Inscribed above them: WHAT REMAINS WHEN MEMORY FAILS?',
     E'Place answer cards face down. Players choose physically. Wrong answers cause conceptual penalties — a forgotten spell, the player forgets an ally''s name at the table for the next scene, a healer temporarily loses one cure, etc. Use mechanical consequences that mirror conceptual loss.',
     ARRAY[]::uuid[], 'prepared', '{"lighting":"dim"}'::jsonb),

    (new_quest_id, 'The Starving Silence', 'A creature that punishes sound.', 10, 'combat', 'horror',
     E'Footsteps without sound. Voices vanishing mid-sentence. Silent screaming mouths. The creature floats silently between you.',
     E'Sound Meter Mechanic: place a visible d6, starts at 1. Every time the party strategizes loudly, casts a verbal spell, or shouts, increase the meter by 1. The creature''s damage scales with the Sound Meter (e.g., damage die equals the current meter value, capped at 1d6). Reward whispered strategy, gestural spellcasting, and player restraint.',
     ARRAY[]::uuid[], 'prepared', '{"lighting":"dark"}'::jsonb),

    (new_quest_id, 'Riddle II — Speaking Roots', 'Personal questions whispered to each player. Failure = constriction.', 11, 'puzzle', 'horror',
     E'The roots part. Then they speak. Quietly. To each of you. One at a time.',
     E'Narrator approaches players individually and whispers personal questions ("What would you erase to remove your guilt?" / "Who would you become if nobody remembered your name?"). DM displays a visible 5-second timer. On failure to answer (or refusal), roots constrict the player — 2d6 bludgeoning damage applied immediately. Honest, in-character answers always count as a pass regardless of content.',
     ARRAY[]::uuid[], 'prepared', '{"lighting":"dark"}'::jsonb),

    (new_quest_id, 'The Birth Giant', 'Unfinished anatomy. Not aggressive. Tragic.', 12, 'boss', 'chaotic',
     E'Unfinished anatomy. Reforming limbs. Shifting faces. Desperate instability. It is not aggressive at first. It is tragic. Confused. When struck, it emits a horrifying newborn-like cry.',
     E'At initiative 0 every round, the DM physically shifts battlefield terrain — rearrange minis, swap map tiles, narrate doorways closing and new ones opening. Reality destabilizes around the creature. Reward players who try non-violent resolutions (it is not actually hostile until provoked).',
     ARRAY[]::uuid[], 'prepared', '{"lighting":"magical"}'::jsonb),

    (new_quest_id, 'The Heart Below the Tree', 'The true Bell Tree extends endlessly downward.', 13, 'narrative', 'wonder',
     E'You descend into the deepest chamber. And finally see: the Bell Tree above ground is only the surface. The true structure extends endlessly downward. Crystalline roots pulse through darkness. Thousands of bells hang beneath the earth. All ringing. Different voices. Different rhythms.',
     E'No combat. Let the table sit with the scale of it. Atmosphere only.',
     ARRAY[]::uuid[], 'prepared', '{"lighting":"magical","time_of_day":"midnight"}'::jsonb),

    (new_quest_id, 'The Final Question and the Shard', 'WHAT SHOULD BE ALLOWED TO REMAIN?', 14, 'event', 'wonder',
     E'At the center: a massive crystalline bell. Inside: a fractured Shard.\n\n[BELL — one final strike. Silence.]\n\n"WHAT SHOULD BE ALLOWED TO REMAIN?"\n\nThere is no correct answer. Let the players debate.\n\nWhen touched, the Shard hands each player a vision: drowned cities, black towers, glass deserts, impossible staircases.\n\n[BELL — once more, far away. Something else felt the Shard move.]',
     E'Hand players written vision cards when they touch the Shard. The Shard is one of the thirteen — link to the existing "The Second Shard" canon entity. No lore dump. No explanation. After Eidon''s final line at the tree line — "The Bell Tree was never the strangest part. It''s just the first thing most people notice." — end the session immediately. Let silence linger.',
     ARRAY[]::uuid[], 'prepared', '{"lighting":"magical"}'::jsonb);

    RAISE NOTICE 'Seeded quest "The Bell Tree and the Broken World" (id %) with % scenes', new_quest_id, 14;
END $$;
