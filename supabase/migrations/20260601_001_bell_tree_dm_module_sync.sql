-- =====================================================
-- The Bell Tree and the Broken World — DM Module Sync
-- Brings the in-app quest in line with the latest DM Module
-- (docs/DandDcontext/extracted/Bell Tree DM Module.pdf).
--
-- Changes:
--   1. Adds full monster_stats for The Starving Silence
--      (mid-level / final boss for Bellroot Vale).
--   2. Reshapes the quest scene list to match the module:
--        - Mayor scene now exposes the four canonical
--          Mayor's Notes (callback setup for the Heart).
--        - Eidon now delivers The Presentation (Drift / Fold /
--          Pattern / Anchors / Shards) and the "lowest point"
--          clue.
--        - Adds Echo Battle #2, The Gorge descent, and
--          Chamber of Silence as discrete scenes.
--        - Memory Gate now uses the 5-bell sequence callback
--          with four escalation failures (crushing roots).
--        - Final Question now asks "WHAT AM I?" with the
--          Mayor's-note answer "THE TREE IS REAL AND THE
--          TREE IS NOTHING".
--        - Removes Speaking Roots and The Birth Giant
--          (not present in the new module).
--   3. Adds quest-level metadata.liveplay block declaring
--      Bell Sequence, Sound Meter, Redirect Die, NPC reset
--      cues, and scene callbacks so the Quest Builder UI can
--      surface them.
-- =====================================================

DO $$
DECLARE
    q_id UUID;
    echo_id UUID;
    cleaved_id UUID;
    silence_id UUID;
BEGIN
    SELECT id INTO q_id FROM public.quests
     WHERE slug = 'the-bell-tree-and-the-broken-world';
    IF q_id IS NULL THEN
        RAISE EXCEPTION 'Quest the-bell-tree-and-the-broken-world not found';
    END IF;

    SELECT id INTO echo_id     FROM public.canon_entities WHERE slug = 'the-echo-mon8u4fw';
    SELECT id INTO cleaved_id  FROM public.canon_entities WHERE slug = 'the-cleaved-mon86lvm';
    SELECT id INTO silence_id  FROM public.canon_entities WHERE slug = 'the-starving-silence-mon8e28l';

    -- =====================================================
    -- 1) The Starving Silence — full monster_stats
    -- =====================================================
    IF silence_id IS NOT NULL THEN
        UPDATE public.canon_entities
        SET extended_lore = COALESCE(extended_lore, '{}'::jsonb) || jsonb_build_object(
            'monster_stats', jsonb_build_object(
                'size', 'large',
                'creatureType', 'aberration',
                'subtype', 'drift-cleft sound-eater',
                'alignment', 'unaligned',
                'role', 'final boss',
                'cr', 8,
                'xp', 3900,
                'proficiencyBonus', 3,
                'hp', 150,
                'hitDice', '12d10 + 84',
                'ac', 16,
                'acSource', 'fractured obsidian plating',
                'movements', jsonb_build_array(
                    jsonb_build_object('type', 'fly', 'speed', 30, 'note', 'hover; cannot be knocked prone; ignores difficult terrain; vertical movement')
                ),
                'abilities', jsonb_build_object('STR', 18, 'DEX', 12, 'CON', 22, 'INT', 6, 'WIS', 14, 'CHA', 10),
                'savingThrows', jsonb_build_object('CON', 9, 'WIS', 5),
                'skills', jsonb_build_array(
                    jsonb_build_object('name', 'Perception', 'bonus', 5)
                ),
                'damageVulnerabilities', jsonb_build_array(),
                'damageResistances', jsonb_build_array('slashing', 'piercing', 'bludgeoning'),
                'damageImmunities', jsonb_build_array('psychic', 'thunder'),
                'conditionImmunities', jsonb_build_array('charmed', 'frightened', 'deafened', 'exhaustion'),
                'senses', jsonb_build_object('darkvision', 60, 'tremorsense', 30, 'passivePerception', 15),
                'languages', jsonb_build_array('understands all spoken languages but cannot speak'),
                'damagePerRound', 'Scales with the Sound Meter — designed as a Hard / Deadly encounter for a 4–8 player mid-level party.',
                'multiattack', 'The Starving Silence makes one Obsidian Slam or Shard Lash, then may use Silent Scream if recharged.',
                'traits', jsonb_build_array(
                    jsonb_build_object(
                        'name', 'Sound Meter',
                        'description', 'A visible mechanic. The Sound Meter starts at 1 and rises by 1 each time the party shouts, casts a verbal spell, conducts loud table strategy mid-combat, or uses a sound-based ability. Max 6. Sound Meter bonus damage: 1=+0, 2=+2, 3=+4, 4=+6, 5=+8, 6=+10. The bonus damage applies to ALL of the creature''s attacks.'
                    ),
                    jsonb_build_object(
                        'name', 'Feed on Sound',
                        'description', 'Each time the Sound Meter increases, the Starving Silence regains 5 HP and immediately gains the new Sound Meter bonus damage.'
                    ),
                    jsonb_build_object(
                        'name', 'Impossible Silence',
                        'description', 'All sound within 30 ft of the creature is muted and distorted. Players speaking within this aura instinctively lower their voices. The creature always knows the location of any creature that makes noise.'
                    )
                ),
                'actions', jsonb_build_array(
                    jsonb_build_object(
                        'name', 'Obsidian Slam',
                        'description', 'The creature drops from above like a falling boulder. On hit deal 3d8 bludgeoning damage + Sound Meter bonus damage. If the target is pushed into a wall or obstacle, add an additional 1d8 bludgeoning damage.',
                        'actionType', 'action',
                        'attackBonus', 8,
                        'reach', 5,
                        'damage', '3d8 bludgeoning + Sound Meter bonus',
                        'targets', 'one creature'
                    ),
                    jsonb_build_object(
                        'name', 'Shard Lash',
                        'description', 'A jagged shard tears free from the creature''s body and launches across the battlefield. On hit deal 2d10 slashing damage + Sound Meter bonus damage. On a critical hit the target begins Bleeding (1d6 damage at the start of each turn until healed or stabilized).',
                        'actionType', 'action',
                        'attackBonus', 7,
                        'range', 60,
                        'damage', '2d10 slashing + Sound Meter bonus',
                        'targets', 'one creature'
                    ),
                    jsonb_build_object(
                        'name', 'Silent Scream',
                        'description', 'Every mouth opens simultaneously. No sound emerges. The pressure alone tears through the battlefield. 30-foot cone. DC 15 CON save; failure 4d10 psychic damage + Sound Meter bonus damage, success half. Cannot be used while Vulnerable.',
                        'actionType', 'action',
                        'recharge', 'every 3 rounds',
                        'saveAbility', 'CON',
                        'saveDC', 15,
                        'damage', '4d10 psychic + Sound Meter bonus',
                        'targets', '30 ft cone',
                        'saveEffect', 'half damage'
                    )
                ),
                'bonusActions', jsonb_build_array(),
                'reactions', jsonb_build_array(),
                'legendaryActions', jsonb_build_object('count', 0, 'description', '', 'actions', jsonb_build_array()),
                'tactics', 'The Starving Silence is not malicious — it is desperate. It pursues the loudest creature, drinks the noise, and grows. It will use Silent Scream the moment the Sound Meter passes 3 and there are at least two targets in cone range.',
                'weaknesses', jsonb_build_array(
                    'Quiet: if the party intentionally reduces the Sound Meter to 0 through silence magic, environmental solutions, or coordinated whispered-only play, the creature becomes Vulnerable for one full round. While Vulnerable: all damage against it is doubled, Silent Scream cannot be used, and AC drops from 16 to 12.',
                    'Restraint Wins: the entire encounter rewards player restraint — gestural casting, silent strategy, whispered targets, hand signals, and pre-arranged battle codes effectively starve the creature.'
                ),
                'regionId', 'bellroot',
                'isOneOff', false,
                'whatBrokeHere', 'The Drift fracture beneath Bellroot Vale collapsed in a frequency the human throat cannot reach. Sound there does not propagate cleanly anymore — it is eaten.',
                'whatLeakedThrough', 'Centuries of unexpressed pain compressed into matter. The creature is a wound that wants to vocalise and physically cannot.',
                'drawnTo', 'Sound. Verbal spellcasting. Loud strategy. Shouted names. Bells.'
            )
        )
        WHERE id = silence_id;
        RAISE NOTICE 'Updated The Starving Silence monster_stats';
    ELSE
        RAISE NOTICE 'The Starving Silence canon entity not found; skipping stat-block update.';
    END IF;

    -- =====================================================
    -- 2) Quest metadata — Live-Play declarations (Bell Sequence,
    --    Sound Meter, Redirect Die, NPC reset cues, callbacks)
    -- =====================================================
    UPDATE public.quests
    SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
            'liveplay', jsonb_build_object(
                'narrator_present', true,
                'dm_present', true,
                'required_table_props', jsonb_build_array(
                    'physical bell',
                    'candles or dim lighting',
                    'play order / initiative sheet',
                    'Echo Attachment index cards',
                    'written riddle cards',
                    'battle maps (physical preferred)',
                    'distorted ambient music + sound effects',
                    'vision cards for the Shard reveal',
                    'a projection surface or laptop for Eidon''s Presentation'
                ),
                'bell_sequence', jsonb_build_object(
                    'enabled', true,
                    'note_count', 5,
                    'rule', 'The bell ALWAYS rings 5 times in the same specific sequence of notes whenever the bell mechanic is invoked. Everyone freezes. The Narrator freezes. Silence is held until the last note dies.',
                    'becomes_answer_in', 'memory-gate',
                    'reused_in_scenes', jsonb_build_array('opening-road-to-drelmere', 'garrons-call-to-action', 'tavern-resets', 'memory-gate', 'final-question')
                ),
                'sound_meter', jsonb_build_object(
                    'enabled', true,
                    'starts_at', 1,
                    'max', 6,
                    'increases_on', jsonb_build_array('player shouts', 'verbal spell', 'loud table strategy in combat', 'sound-based ability'),
                    'used_in_scenes', jsonb_build_array('the-starving-silence'),
                    'visible_to_players', true
                ),
                'redirect_die', jsonb_build_object(
                    'enabled', true,
                    'auto_scale_by_player_count', true,
                    'table', jsonb_build_object('4-5', 'd6', '6-7', 'd8', '8-9', 'd10', '10-11', 'd12', '12+', 'd20'),
                    'used_in_scenes', jsonb_build_array('the-echoes-appear')
                ),
                'npc_reset_triggers', jsonb_build_array(
                    jsonb_build_object('npc', 'Garron Pike', 'cue', 'sharp bell strike', 'effect', 'Garron forgets the entire conversation and greets the party as if for the first time.')
                ),
                'hidden_mechanics', jsonb_build_array(
                    jsonb_build_object('scene', 'the-echoes-appear', 'mechanic', 'Echo attachment, Redirect Die, Host Shield, four detachment methods'),
                    jsonb_build_object('scene', 'the-fork', 'mechanic', '"Same direction twice = success" — first choice and any reversal both fail.'),
                    jsonb_build_object('scene', 'memory-gate', 'mechanic', 'The five bells are answered by repeating the bell sequence heard since session start.'),
                    jsonb_build_object('scene', 'the-starving-silence', 'mechanic', 'Sound Meter feeds the boss; party must whisper / signal to win.'),
                    jsonb_build_object('scene', 'final-question', 'mechanic', 'Answer is hidden in the Mayor''s personal notes: "THE TREE IS REAL AND THE TREE IS NOTHING".')
                ),
                'scene_callbacks', jsonb_build_array(
                    jsonb_build_object('from_scene', 'mayor-modular-answers', 'to_scene', 'final-question', 'payload', 'Mayor''s Notes are the answer to "WHAT AM I?"'),
                    jsonb_build_object('from_scene', 'opening-road-to-drelmere', 'to_scene', 'memory-gate', 'payload', 'The recurring 5-note bell sequence is the chamber''s answer.'),
                    jsonb_build_object('from_scene', 'eidons-presentation', 'to_scene', 'the-gorge-descent', 'payload', 'Eidon''s "go where trees begin, not where they end — Drelmere''s lowest point" directs the party to the gorge, not the hill.')
                ),
                'narrator_dm_battle_concept', 'During combat the Narrator declares what the enemies attempt; the DM determines what succeeds. The Narrator plays adversary; the DM plays neutral law of the world.'
            )
        ),
        updated_at = NOW()
    WHERE id = q_id;

    -- Add the Starving Silence to referenced entities (idempotent)
    IF silence_id IS NOT NULL THEN
        UPDATE public.quests
        SET referenced_entities = (
            SELECT ARRAY(
                SELECT DISTINCT unnest(
                    COALESCE(referenced_entities, ARRAY[]::uuid[]) || ARRAY[silence_id]::uuid[]
                )
            )
        )
        WHERE id = q_id;
    END IF;

    -- =====================================================
    -- 3) Re-seed scenes to match the new module
    -- =====================================================
    DELETE FROM public.quest_scenes WHERE quest_id = q_id;

    INSERT INTO public.quest_scenes
      (quest_id, title, description, scene_order, scene_type, mood,
       feeling, reveal, choice, sensory_anchors, pacing,
       narration, dm_notes, linked_entities, status, atmosphere, metadata)
    VALUES

    -- 1. OPENING NARRATION ---------------------------------------------------
    (q_id, 'Opening — The Road to Drelmere',
     'Cold open. Rain. Mud. The first distant bell.', 1, 'narrative', 'melancholy',
     'Soaked, watchful, slightly small.',
     'Bellroot Vale is quieter than it should be — and the locals already know why.',
     'Players choose how to react to the first bell: speak, push on in silence, or watch the villagers.',
     ARRAY['silver lines of rain','mud on boots','one slow metallic toll','closed faces of villagers'],
     'slow',
     E'[DM]: "You are on a road en route to the town of Drelmere."\n\n[NARRATOR]\nRain falls in long silver lines across the road to Drelmere. Mud clings heavily to boots and wagon wheels alike. The farther you travel into Bellroot Vale… the quieter the world becomes.\n\n[BELL — strike the full 5-note sequence. Let it fully ring out. Silence at table until it stops.]\n\n[NARRATOR]\nA bell rings somewhere in the distant hills. Not loud. Not celebratory. Just one deep metallic toll swallowed by fog. The nearby villagers stop walking. Nobody speaks. Nobody looks toward the sound. After several long seconds… they quietly continue moving.\n\nAhead, warm lanternlight flickers behind rain-streaked windows. The town of Drelmere waits. And somewhere beyond the hills… something enormous rings again.\n\n[BELL — repeat the same 5-note sequence.]',
     E'Setup: distribute character sheets, play order, materials. Place the physical bell and the face-down Echo / Vision / Riddle cards at table center. Wait for the table to fully settle, then nod to the Narrator. Do not heighten emotion — the DM is calm, measured, almost emotionless. The Narrator carries tension. IMPORTANT: from this moment forward, whenever the bell rings it rings 5 times in the SAME specific sequence of notes. Players should not be told this — they should notice. The sequence is the answer to the Memory Gate riddle later in the session.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dim","time_of_day":"dusk","weather":"steady rain","ambient_sound":"rain + distant bell"}'::jsonb,
     jsonb_build_object('slug','opening-road-to-drelmere','live_play', jsonb_build_object('bell_sequence_introduced', true, 'props_required', jsonb_build_array('physical bell','dim lighting')))),

    -- 2. ENTERING DRELMERE ---------------------------------------------------
    (q_id, 'Entering Drelmere',
     'A town pretending very hard that everything is normal.', 2, 'exploration', 'mysterious',
     'Watched. Unwelcome but not refused.',
     'The locals do not flee the bells — they ignore them. That is worse.',
     'Players choose where to go in town. The tavern, the Mayor''s office, the woods, or wander.',
     ARRAY['curtains closing','children pulled indoors','rain still falling','crooked sinking foundations'],
     'medium',
     E'[DM]: "DRELMERE — the central town of Bellroot Vale, once a sanctuary for those called Dreamers. A large, aging settlement built along muddy crossroads beneath the hills of Bellroot Vale. Stone foundations sink unevenly into the earth beneath crooked wooden buildings darkened by constant rain and age."\n\n[NARRATOR]\nAs your group enters town, curtains quietly close nearby. Children playing in the muddy street are immediately ushered indoors when a distant bell rings somewhere high in the hills. Nobody reacts dramatically to the sound. That somehow makes it worse.\n\nAnd as the rain continues falling over Drelmere, the entire town feels like a place pretending very hard that everything is normal.',
     E'No combat. Use this scene to seed the central wrongness: every NPC the players spot is performing routine. Reward perception checks with small wrongnesses — a man holding a key to a door that no longer exists, a child counting to a number that does not arrive, two women having the same conversation 30 ft apart.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"firelight","time_of_day":"evening","weather":"steady rain"}'::jsonb,
     jsonb_build_object('slug','entering-drelmere')),

    -- 3. THE CRACKED POT TAVERN — SILENT SERVICE -----------------------------
    (q_id, 'The Cracked Pot Tavern — Silent Service',
     'Garron Pike serves invisible patrons until he notices the party.', 3, 'social', 'mysterious',
     'A room that is fuller than it looks.',
     'Garron is not pretending for them. He is pretending for the empty chairs.',
     'Speak to Garron, sit and listen, or leave.',
     ARRAY['low lanterns','rafter smoke','no music','imaginary mugs sliding across the bar'],
     'slow',
     E'[DM]: "You arrive at The Cracked Pot Tavern."\n\nWarm amber light spills from the windows. But the closer you get… the quieter the tavern feels. No laughter. No music. No conversation. Inside, lanterns burn low, smoke curls through old rafters. And despite clearly being open… the tavern is empty. No patrons. No servers.\n\nOnly one man behind the counter.\n\n[DM]: "GARRON PIKE — late fifties. Broad shouldered. Two fingers missing from one hand. Eyes permanently tired."\n\n[NARRATOR ACTION]\nDo NOT acknowledge the players immediately. Pretend to serve invisible patrons. Slide imaginary drinks. Listen to empty chairs. Laugh softly to nobody. Then suddenly freeze. Notice the party. Slowly drag back an untouched imaginary mug.',
     E'Hold the silence. Let the players speak first if they want. The Narrator should glance at empty chairs, pause as though hearing replies, step around invisible patrons, refill imaginary mugs. Never explain.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"firelight","time_of_day":"evening","weather":"steady rain"}'::jsonb,
     jsonb_build_object('slug','cracked-pot-tavern')),

    -- 4. GARRON'S WELCOME ----------------------------------------------------
    (q_id, 'Garron''s Welcome',
     'First contact. Bell strike outside dialogue.', 4, 'social', 'neutral',
     'A warm voice over a cold room.',
     'Garron knows about the bells, and he refuses to dignify them.',
     'Order drinks, ask questions, or press him.',
     ARRAY['rain still hammering the roof','distant bell over dialogue','smell of stale ale','crackling hearth'],
     'medium',
     E'[GARRON]: "Hmmm… I didn''t see you all come in."\n\n[BELL — strike lightly, outside dialogue.]\n\n[GARRON]: "Welcome. You all look soaked from the rain. Warm yourselves. Pay no mind to those bells. What can I get you to drink?"\n\n[DM]: Players are free to interact. Encourage discussion with Garron.\n\nLines to drop in naturally during conversation:\n  • "People who go looking for answers in Bellroot usually stop liking the answers they find."\n  • "Funny thing about the hill."\n  • "People come back remembering different roads."\n  • "Tree wasn''t always there. At least… I don''t think it was."',
     E'Encourage roleplay. Do not push for the call to action yet — Garron only opens up after enough questioning. Strike the bell once mid-scene at your discretion to keep the table on edge.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"firelight","time_of_day":"evening","weather":"steady rain"}'::jsonb,
     jsonb_build_object('slug','garrons-welcome')),

    -- 5. GARRON'S CALL TO ACTION ---------------------------------------------
    (q_id, 'Garron''s Call to Action',
     'Humor drops. Real fear shows.', 5, 'social', 'tense',
     'The friendly host becomes a frightened man.',
     'Drelmere has stopped noticing that it is being unmade.',
     'Go to the Mayor, seek Old Eidon, or attempt the Bell Tree directly (Garron warns against this).',
     ARRAY['voice lowering','rain audible through window','distant bell','his eyes on the hills'],
     'medium',
     E'[NARRATOR ACTION]\nGradually lose humor. Lower the voice. Make the fear genuine.\n\n[GARRON]: "You know what the worst part is? It''s not the disappearances. Not the things people see in the woods. Not even those damn bells."\n\n[BELL — strike a distant bell once.]\n\n[GARRON]: "It''s that everyone in Drelmere acts like this has always been normal. Every year it gets worse. More roads close. More people stop going near it. And every single time somebody talks about leaving… a few weeks pass. Then suddenly nobody remembers why they wanted to.\n\n"The longer that thing stays there… the less certain anything around it becomes.\n\n"You''re outsiders. That matters. The hill changes people slower if they weren''t born here. Locals don''t go near it anymore. The ones who do either don''t come back… or come back wrong.\n\n"So if you''re asking whether somebody should go find out what that thing is… yes. Before this whole valley forgets what the world''s supposed to look like. Help us rid the land of this cursed thing."\n\n[DM]: "Garron gestures vaguely toward the hills."\n\n[GARRON]: "Talk to the mayor. Or find Old Eidon, the old hermit who lives on Watcher''s Hill past the woods. He knows more than anyone if you can understand anything he says. I wouldn''t go seeking out the Bell Tree just yet."',
     E'This is the first real lore drop. Pace it slowly. Do not let the Narrator rush. Garron is shedding the mask he wears for himself.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"firelight","time_of_day":"evening","weather":"steady rain"}'::jsonb,
     jsonb_build_object('slug','garrons-call-to-action')),

    -- 6. TAVERN RESET — PLAYER CHOICE PHASE ----------------------------------
    (q_id, 'The Tavern Resets',
     'The bell strikes sharply. Garron forgets the entire conversation.', 6, 'social', 'horror',
     'Quiet dread. The wrongness is now confirmed.',
     'Forgetting is not happening offstage. It is happening to people while you watch them.',
     'Speak to the Mayor, attempt the Bell Tree, or seek Old Eidon directly.',
     ARRAY['the bell, sharp','Garron''s face going blank','his greeting word-for-word','rain unchanged'],
     'fast',
     E'[BELL — strike SHARPLY.]\n\n[NARRATOR ACTION]\nInstantly reset expression. Confused. As if first noticing the players again.\n\n[GARRON]: "Hmmm… I didn''t see you come in! Welcome. You all look soaked from the rain. Warm yourselves. Pay no mind to those bells. What can I get you to drink?"\n\n[DM]: Present PLAYER CHOICE PHASE.\nPlayers may:\n  • Speak to the Mayor → routes to the Mayor scene.\n  • Seek Old Eidon on Watcher''s Hill → routes through the Dark Woods.\n  • Try to go directly to the Bell Tree → Garron warns; if they insist, route them through the Dark Woods.',
     E'Do not negotiate the reset. He does not remember the conversation. If players try to remind him, he is mildly amused and asks again what they want to drink. This is the first hard demonstration that the Fray here erases not memory of the supernatural — but memory of the FEAR of it.\n\nNPC RESET (live-play mechanic): Garron forgets the conversation on the sharp bell strike. This is the canonical example of the NPC Reset cue used elsewhere in this quest.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"firelight","time_of_day":"evening","weather":"steady rain"}'::jsonb,
     jsonb_build_object('slug','tavern-resets','live_play', jsonb_build_object('npc_reset', jsonb_build_object('npc','Garron Pike','cue','sharp bell strike','effect','Garron forgets the conversation and greets the party again as if for the first time.')))),

    -- 7. MAYOR ELRIC VALE — OFFICE -------------------------------------------
    (q_id, 'Mayor Elric Vale — Office of Maps',
     'A cluttered office. The maps disagree with themselves.', 7, 'social', 'tense',
     'A man holding a town together with his hands shaking.',
     'The town''s geography is no longer stable enough to govern.',
     'Open with which question to ask first (Tree / Bells / Disappearances / Woods / Eidon / press him).',
     ARRAY['maps that contradict','bells hanging on the windows','scattered names and dates','sound of his pen tapping'],
     'slow',
     E'[DM]: "You arrive at the home and office of Mayor Elric Vale. The building sits near the eastern edge of Drelmere overlooking the fog-covered roads leading toward the hills. Unlike the rest of the town, several bells hang around the exterior windows instead of above the doorway."\n\n[NARRATOR]\nInside, the office feels cluttered in the way desperate places become cluttered. Maps cover nearly every wall. Different handwriting. Different routes. Different geography. Entire roads have been crossed out and redrawn repeatedly. Several maps contradict each other entirely. One map shows the Bell Tree north of Drelmere. Another places it west. One road appears on some maps and is missing from others. Stacks of notes cover the desk: names, locations, dates, warnings.\n\n[MAYOR]: "Ah… yes. You''re the outsiders Garron mentioned."\n\n[He glances toward one of the maps on the wall. Frowns. Moves it slightly.]\n\n[MAYOR]: "Sorry… I keep thinking that road used to be farther east. Or maybe it still is. How can I help you?"',
     E'The Mayor is well-meaning, exhausted, and not in denial — he is in triage. Play him as competent but losing. Encourage roleplay and let players steer the conversation. The next scene holds his modular answers.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dim","time_of_day":"night","weather":"steady rain"}'::jsonb,
     jsonb_build_object('slug','mayor-office')),

    -- 8. MAYOR — MODULAR ANSWERS + THE 4 NOTES (CALLBACK SETUP) -------------
    (q_id, 'Mayor''s Answers + The Four Notes',
     'Modular conversation branches. The Mayor''s personal notes are visible on the desk — and one of them is the answer to the final riddle.', 8, 'social', 'mysterious',
     'Each answer is a key that does not fit the same lock twice.',
     'Reality in Bellroot Vale is editorial. The Mayor knows it. He hides it badly. And his desk holds the answer to a question the players have not been asked yet.',
     'Players decide which threads to follow, whether to press him, and whether to read his personal notes.',
     ARRAY['the soft scratch of him correcting a map','distant bell','his tea going cold','his four hand-written notes pinned to the corkboard'],
     'medium',
     E'MODULAR BRANCHES (run only what the players ask):\n\nIF PLAYERS ASK ABOUT THE BELL TREE:\n  [MAYOR]: "Nobody agrees how long it''s been there. That''s not an exaggeration. Some records mention it generations ago. Others don''t mention it at all. One farmer claimed the bells rang in his dead brother''s voice. One woman heard her own voice calling from the hills."\n\nIF PLAYERS ASK WHAT THE BELLS DO:\n  [MAYOR]: "If I knew that, I''d probably sleep better. Personally? I think the bells remember things. There are nights where every bell in Drelmere rings at once. Nobody leaves their homes when that happens. Not anymore."\n\nIF PLAYERS ASK ABOUT PEOPLE DISAPPEARING:\n  [MAYOR]: "We''ve lost many people to those woods. Not always to death. Sometimes they come back. But wrong. One man returned insisting he''d lived in Drelmere his entire life — nobody recognized him. A mother once forgot she had children. A week later she remembered them again. But forgot her husband instead."\n\nIF PLAYERS ASK ABOUT CREATURES IN THE WOODS:\n  [MAYOR]: "Small things mostly. Smoke-shaped. Fast. They gather in groups. People say they cling to travelers. Make them confused. Violent. One hunter stabbed his own brother during an attack. Swore he thought he was aiming somewhere else."\n\nIF PLAYERS ASK ABOUT THE WOODS:\n  [MAYOR]: "The woods change. Paths move. Distances feel wrong. The trees have carvings now. Arrows. Phrases. Warnings. Most of them don''t make sense. One path had the words: ''Two wrongs make a right.'' Another simply said: ''Don''t trust the second choice.'' The woods seem to punish certainty."\n\nIF PLAYERS ASK ABOUT EIDON:\n  [MAYOR]: "Ahh, Old Eidon. The hermit on Watcher''s Hill. I don''t know whether he''s the wisest man in Bellroot or the craziest. Maybe both. Claims half the world''s folded wrong. Most people stop going near the hill after meeting him. If they can even get there."\n\nIF PLAYERS PRESS THE MAYOR HARD:\n  [MAYOR]: "Of course I''m hiding things. I''m trying to keep this town functioning. Do you know how hard it is to govern people who can''t agree where roads are anymore?"\n\nOPTIONAL DISCOVERY — THE MAYOR''S MAPS & NOTES:\n  • A topographic map of Drelmere labelled with elevation — Watcher''s Hill and Bell Tree Hill marked as high points; the GORGE marked clearly as the lowest point.\n  • Four hand-written personal notes pinned over the desk:\n      1. THE TREE IS REAL AND THE TREE IS NOTHING\n      2. TRUST THE BELLS LESS THAN THE SILENCE\n      3. DO NOT FOLLOW A PATH JUST BECAUSE IT CHANGED\n      4. REMEMBER WHO YOU ARE',
     E'CRITICAL CALLBACK SETUP. The four Mayor''s Notes must be made visible (read aloud by Narrator, handed out as physical prop cards, or written on the table). At least the first note ("THE TREE IS REAL AND THE TREE IS NOTHING") must be encountered — it is the only valid answer to the final "WHAT AM I?" question at the Heart of the Tree. If the players never read the notes during this scene, mention them again as Eidon gestures at "things people write down because they cannot keep them inside any longer."',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dim","time_of_day":"night","weather":"steady rain"}'::jsonb,
     jsonb_build_object('slug','mayor-modular-answers','live_play', jsonb_build_object('callback_setup', jsonb_build_array('final-question'), 'props_required', jsonb_build_array('Mayor''s Notes card x4','elevation map of Drelmere')))),

    -- 9. MAYOR'S FINAL PUSH --------------------------------------------------
    (q_id, 'Mayor''s Final Push',
     'A reluctant blessing toward Eidon — plus two final warnings.', 9, 'social', 'melancholy',
     'A man who already knows you might not come back.',
     'Even the Mayor — the most stubborn realist in town — defers to the hermit.',
     'Set out for the Dark Woods toward Watcher''s Hill, or attempt the Bell Tree directly.',
     ARRAY['fog at the windows','his hand on the desk','an unfinished map','the last bell of the night'],
     'slow',
     E'[MAYOR]: "If you''re truly planning to go near the Tree… talk to Eidon first. Whatever''s happening in Bellroot… he understands it better than the rest of us. Or he understands it less. Hard to tell the difference around here."\n\n[He hesitates. Looks toward the fog outside.]\n\n[MAYOR]: "If the woods begin repeating themselves… pay attention to what changed. Not what stayed the same. And if something in those woods starts whispering your own thoughts back at you… do not answer it."',
     E'End the scene with the Mayor''s posture. He is the last reasonable voice the party will hear before everything stops being reasonable.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dim","time_of_day":"night","weather":"fog"}'::jsonb,
     jsonb_build_object('slug','mayor-final-push')),

    -- 10. THE DARK WOODS — ENTRY ---------------------------------------------
    (q_id, 'The Dark Woods — Entry',
     'Wrong-feeling forest. Delayed footsteps. Whispers.', 10, 'exploration', 'horror',
     'Not haunted. Uncertain.',
     'The wrongness is not behind something. It is the world itself.',
     'Press on, listen, mark the trail.',
     ARRAY['delayed footsteps','whispers of your own voices','branches moving without wind','daylight swallowed overhead'],
     'medium',
     E'[DM]: "Players leave the Mayor and set out for The Dark Woods. The woods beyond Drelmere have paths that barely look wider than a single person. The trees grow too close together, their black branches tangling overhead tightly enough to swallow most of the remaining daylight. The deeper you walk, the quieter the world becomes."\n\n[NARRATOR]\nThe woods feel wrong immediately. Not hostile. Not haunted. Just… uncertain.\n\nSuddenly, you hear: footsteps slightly delayed, whispers of your own voices, fragments of conversations, branches moving without wind. Then: movement. Small things. Watching.',
     E'Encourage perception checks. Reward them with sensory wrongness only, no creatures yet. Build tension.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dark","time_of_day":"night","weather":"fog"}'::jsonb,
     jsonb_build_object('slug','dark-woods-entry')),

    -- 11. THE ECHO SWARM — COMBAT --------------------------------------------
    (q_id, 'The Echoes Appear',
     '22 Echoes converge on one player. Combat begins.', 11, 'combat', 'horror',
     'A swarm that wants something that is not your life.',
     'The Echoes do not kill. They attach. And the party will spread the infection themselves.',
     'How to attack what cannot be killed cleanly — let the table discover detachment.',
     ARRAY['three-dimensional charcoal smudges','scentless grey ash','jerking sideways movement','a single player going quiet'],
     'fast',
     E'[DM]: "Echoes look like charcoal-smudged forms, fraying smoke edges, broken silhouettes ranging from hounds to children. They appear as three-dimensional sketches, edges constantly blurring."\n\n[DM NOTE]: Physically weak and almost weightless. When struck, they shatter into fine, scentless grey ash.\n\n[NARRATOR]\nAt first, the shapes simply watch from between the trees. Still and barely visible against the darkness. Then one moves. Not naturally. Its body jerks sideways in short broken motions. More begin emerging from the woods surrounding the party. Not running. Not charging. Just gathering. Swarming…\n\n[DM]: "As the creatures continue closing inward, you realize something unsettling: the swarm is not surrounding the group randomly. Every single one of the creatures is slowly converging toward the same member of the party."\n\n[NARRATOR ACTION]: Place 22 Echo tokens on the table, concentrated close to one player.\n\n[DM]: "Roll for initiative."',
     E'Echoes share a collective initiative — one roll per 10 Echoes (3 rolls for 22). All Echoes move one space closer to the swarm''s current target each turn. Any successful hit destroys a single Echo. When 3+ Echoes are adjacent to a player, ONE attaches:\n  • Quietly place an Echo Attachment marker on that player''s sheet.\n  • Secretly hand them the Echo Attachment Card.\n  • Do NOT publicly announce attachment, redirect, or detachment mechanics.\n  • The rest of the swarm abandons that target and converges on another player.\n\nRedirect Die (auto-scale by player count): 4–5p=d6, 6–7p=d8, 8–9p=d10, 10–11p=d12, 12+p=d20. After the attached player resolves any attack, they secretly roll the Redirect Die. Result matching another player''s initiative # = that ally is the actual target (they may defend normally). Any unused number = the attack hits nothing. Tell the host the original attack landed as intended — the Narrator delivers the false result as a whisper.\n\nHost Shield: attacking an attached Echo is an attack against the host. 50% damage to the host, Echo not destroyed.\n\nDetachment (LET PLAYERS DISCOVER):\n  1. Violent Recognition — teammate grabs and shouts at the host (STR or Persuasion, no damage).\n  2. Resonant Overload — bells, thunder, psionic blasts, shield strikes, tuning forks (instant detach + kill, host unharmed).\n  3. Reflection — mirror, polished steel, still water, magical reflection.\n  4. Self-Harmed Clarity — host deliberately attacks self OR rolls own initiative # on Redirect Die (10% rolled damage, Echo dies).',
     ARRAY[echo_id]::uuid[], 'prepared',
     '{"lighting":"dark","time_of_day":"night","weather":"fog","ambient_sound":"distorted whispers"}'::jsonb,
     jsonb_build_object('slug','the-echoes-appear','live_play', jsonb_build_object('hidden_mechanics', true, 'redirect_die', jsonb_build_object('auto_scale_by_player_count', true), 'props_required', jsonb_build_array('Echo Attachment cards','Redirect Die')))),

    -- 12. AFTER THE ECHOES — CARVINGS -----------------------------------------
    (q_id, 'The Carvings',
     'Trail markers carved into the trees. OLD E. THIS WAY →', 12, 'exploration', 'mysterious',
     'Black humor in a place that should not contain it.',
     'Someone has been here before. Repeatedly. And he is mocking the woods.',
     'Follow the arrows, ignore them, or stop to read every one.',
     ARRAY['black bark','rough deep carvings','too-quiet woods','no birds'],
     'medium',
     E'[DM]: "Once the final Echo collapses into ash, the woods become quiet again almost immediately."\n\n[NARRATOR]: "Too quiet."\n\n[DM]: "The only visible path forward continues deeper between the trees. As you continue, you begin noticing carvings cut into the bark of nearby trees. Old carvings. Deeply weathered. But still readable."\n\n[NARRATOR]\nThe first carving appears on a dead black tree leaning across the path. Rough letters carved deeply into the bark:\n  OLD E. THIS WAY →\n\nAs you continue deeper into the woods, more carvings begin appearing:\n  KEEP GOING IDIOTS →\n  NO SERIOUSLY THIS WAY\n  IF YOU HIT THE SWAMP YOU''VE GONE TOO FAR\n  STAIRS ARE THE WORST PART',
     E'These carvings are by Eidon. Reward inspection rolls with extra context: most carvings are weathered to different ages — some look ancient, some look fresh, none of them are dated. He has been walking this path for longer than he should have been.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dark","time_of_day":"night"}'::jsonb,
     jsonb_build_object('slug','the-carvings')),

    -- 13. THE FORK — RIDDLE PRESENTED ----------------------------------------
    (q_id, 'The Fork',
     'A dead tree between two paths, covered in carved arrows.', 13, 'puzzle', 'mysterious',
     'A test that resents being a test.',
     'The riddle is true in a way the players will not believe until they have failed it twice.',
     'Pick a direction (Left or Right).',
     ARRAY['hundreds of arrows','deep central inscription','the silence of decision','one path looking slightly more correct than the other'],
     'slow',
     E'[DM]: "Eventually the woods open into a fork in the path. A massive dead tree stands between the two roads, its bark covered in hundreds of carved arrows."\n\n[NARRATOR]: Near the center of the trunk, carved deep into the tree:\n\n  THE FIRST PATH IS NEVER RIGHT.\n  CORRECTING YOURSELF IS NOT RIGHT.\n  BEING WRONG TWICE IS RIGHT.\n  THREE TIMES NOT RIGHT AND CERTAIN DEATH AWAITS.\n  CHOOSE YOUR PATH AND WALK.',
     E'SOLUTION: the FIRST choice always loops back. Changing direction counts as "correcting yourself" — also wrong. The actual answer is to repeat the same direction twice. (Right → loop → Right AGAIN = success. Or Left → loop → Left AGAIN = success.) Changing a third time triggers the Cleaved encounter. Do not telegraph the solution.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dark","time_of_day":"night"}'::jsonb,
     jsonb_build_object('slug','the-fork','live_play', jsonb_build_object('hidden_mechanics', true, 'escalation_failure', jsonb_build_object('strikes', 3, 'on_third_strike', 'Roll initiative for The Cleaved (boss encounter).')))),

    -- 14. THE FORK — FIRST FAILURE -------------------------------------------
    (q_id, 'The Fork — First Failure (Strike One)',
     'Whichever path they chose, they loop back.', 14, 'puzzle', 'mysterious',
     'A small, cold realization.',
     'The forest is keeping score.',
     'Choose again — the same direction or the other.',
     ARRAY['five short steps','the same fork','fresh carvings under the riddle','the word STRIKE ONE'],
     'medium',
     E'[NARRATOR]\nYou walk down the path to the {insert choice}.\n\nThe party walks five steps down the path and immediately arrives… at the exact same fork in the road. Only now: fresh carvings appear beneath the riddle.\n\n  THE FIRST PATH IS NEVER RIGHT.\n  CORRECTING YOURSELF IS NOT RIGHT.\n  BEING WRONG TWICE IS RIGHT.\n  THREE TIMES NOT RIGHT AND CERTAIN DEATH AWAITS.\n  CHOOSE YOUR PATH AND WALK.\n\n  STRIKE ONE',
     E'No mechanical penalty yet. Just the strike count. Let the table debate.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dark"}'::jsonb,
     jsonb_build_object('slug','the-fork-strike-one')),

    -- 15. THE FORK — SECOND FAILURE ------------------------------------------
    (q_id, 'The Fork — Second Failure (Strike Two)',
     'If players SWITCH direction, they fail again.', 15, 'puzzle', 'tense',
     'Confusion sharpening into fear.',
     'Changing direction was the wrong instinct.',
     'Commit — same direction one more time (success) — or switch a third time (Cleaved encounter).',
     ARRAY['STRIKE TWO carved deep','the riddle, identical','quieter wind','a smell of ash from the previous fight'],
     'medium',
     E'IF THE PLAYERS SWITCH DIRECTIONS:\n\n[NARRATOR]\nYou walk down the path to the {insert choice}.\n\nThe party walks five steps down the path and immediately arrives… at the exact same fork in the road. Only now: fresh carvings appear beneath the riddle.\n\n  THE FIRST PATH IS NEVER RIGHT.\n  CORRECTING YOURSELF IS NOT RIGHT.\n  BEING WRONG TWICE IS RIGHT.\n  THREE TIMES NOT RIGHT AND CERTAIN DEATH AWAITS.\n  CHOOSE YOUR PATH AND WALK.\n\n  STRIKE TWO\n\nIF THE PLAYERS REPEAT THE SAME DIRECTION AS THEIR FIRST ATTEMPT:\n  [DM]: "You continue down the road and arrive at Watcher''s Hill."',
     E'If the party stays on the same direction as their first choice, they pass. If they switch again (a "third path"), do NOT loop them — go directly to The Cleaved scene.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dark"}'::jsonb,
     jsonb_build_object('slug','the-fork-strike-two')),

    -- 16. THE CLEAVED — BOSS BATTLE (FAIL STATE) -----------------------------
    (q_id, 'The Cleaved (Fail-State Boss)',
     'Only triggered if players change direction a third time.', 16, 'boss', 'horror',
     'A creature in agony at the sight of itself.',
     'The woods do not punish wrong answers. They produce them.',
     'Survive. Win by forcing it back together, not apart.',
     ARRAY['absolute silence','splitting fog','arcing black energy between two halves','twitching stitched corpses'],
     'fast',
     E'[DM — BOSS BATTLE]\nIf the players fail the riddle a third time by changing directions again: do not return them to the fork. Immediately call "Roll for Initiative."\n\nNarrator places: 10 Echoes and 1 boss marker labeled "The Cleaved" onto the battle map.\n\n[NARRATOR]\nThe forest becomes completely silent. No wind. No footsteps. No breathing. The fog between the trees ahead slowly begins to split apart. At first it looks like two massive figures walking side by side through the woods. Then the shape steps closer. And you realize: it is one creature.\n\nSplit completely down the middle. The two halves hover inches apart from one another, connected only by jagged strands of burning black energy arcing violently between exposed ribs and pulsing organs. Skewered between the halves are dead animals and blackened human remains burned directly into the wound like crude stitches. Several still twitch weakly.\n\nThen from behind the hideous creature, 10 Echoes appear.',
     E'Echoes use standard swarm rules. The Cleaved acts independently — see canon_entities monster_stats for full mechanics. Key abilities: Stitching Strike (grapple + Burning Stitches), Repulsion Surge / Burst, Skewer the Living / Desperate Embrace, Endless Separation (1d6 force every round to creatures within 10 ft), Agonized Existence (free attack against nearest creature when struck for 20+). WEAKNESS = FORCED UNITY. Crushing, force compression, synchronized dual strikes, magnetic/binding magic, chains/rope/vines, earth manipulation, grapples, and mirrored attacks on both halves simultaneously bypass resistances. Slashing, single-point piercing, fire, and chaotic splash damage are absorbed. Forcing it together hurts more than pulling it apart. Players may also target THE GAP between halves with disadvantage for doubled damage.',
     ARRAY[echo_id, cleaved_id]::uuid[], 'prepared',
     '{"lighting":"dark","time_of_day":"night","weather":"unnatural silence"}'::jsonb,
     jsonb_build_object('slug','the-cleaved')),

    -- 17. THE CLEAVED — RESOLUTION -------------------------------------------
    (q_id, 'The Cleaved — Resolution',
     'On defeat, the creature finally fuses for a single moment.', 17, 'narrative', 'melancholy',
     'Pity replacing fear.',
     'It did not want to kill them. It wanted to be whole.',
     'Continue toward Watcher''s Hill.',
     ARRAY['black energy flickering','stitched corpses tearing free','the moment the halves touch','grey ash scattering'],
     'slow',
     E'[NARRATOR]\nFor the first time since the battle began… The Cleaved stops moving forward. The black energy arcing between its halves flickers violently. Its massive body trembles. One half collapses to a knee. Then the other. The creature desperately strains inward toward itself. Trying to reconnect. Trying to become whole.\n\nThe exposed ribs and organs suspended between the halves begin pulling toward one another as the unstable energy binding them starts to fail. The stitched corpses embedded across its body suddenly tear free one by one and collapse into ash around it. The creature reaches toward itself. Not toward the players. Toward itself. Closer. Closer.\n\nThe energy between them screams. Then — for one brief impossible moment — the two sides touch.\n\nAnd in this moment you think you see something in the creature''s split grotesque face… Not rage. Not pain. Relief.\n\nThen the entire body collapses inward on itself. The two halves finally fuse together for only a fraction of a second before violently disintegrating into a storm of fine grey ash that scatters through the silent forest.\n\nAny remaining Echoes stop moving and, one by one, simply unravel into smoke and disappear. The forest is silent.\n\n[DM]: "You continue down the road and arrive at Watcher''s Hill."',
     E'This scene only runs if the party defeats The Cleaved. If they fail, run a TPK or capture sequence according to your table''s rules.',
     ARRAY[cleaved_id]::uuid[], 'prepared',
     '{"lighting":"dark"}'::jsonb,
     jsonb_build_object('slug','the-cleaved-resolution')),

    -- 18. WATCHER'S HILL — APPROACH ------------------------------------------
    (q_id, 'Watcher''s Hill — Approach',
     'Stairs that forget themselves. A gate that opens before you knock.', 18, 'exploration', 'wonder',
     'Reality wearing its seams on the outside.',
     'Eidon does not live in geography. He lives in concession.',
     'Climb carefully, observe the symbols, knock — or wait.',
     ARRAY['uneven stairs','symbols rearranging when unobserved','a crooked gate','the gate opening on its own'],
     'slow',
     E'[NARRATOR]\nDescribe:\n  • uneven stairs\n  • shifting stones\n  • paths subtly changing\n  • a crooked gate at the top\n  • symbols that rearrange when unobserved\n  • the gate opening on its own',
     E'Reward perception. Anyone looking at the symbols directly sees stable shapes. Anyone using peripheral vision or looking away sees them rearranging. This is the first scene where the world stops trying to hide its strangeness.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"magical","time_of_day":"midnight"}'::jsonb,
     jsonb_build_object('slug','watchers-hill-approach')),

    -- 19. EIDON'S DOOR -------------------------------------------------------
    (q_id, 'Eidon''s Door',
     'The hermit is younger than he should be, and unsurprised.', 19, 'social', 'wonder',
     'A welcome that feels rehearsed.',
     'He has been expecting them. He has always been expecting them.',
     'Enter or stay outside.',
     ARRAY['silver eyes','bare feet','no surprise on his face','a knock the players never made'],
     'medium',
     E'[NARRATOR]\nThe door opens before knock. A young man. Mid twenties. Silver eyes. Barefoot. Entirely unsurprised.\n\n[EIDON]: "Took you long enough."\n\n[He studies the players.]\n\n[EIDON]: "You smell like Echo ash."\n\n[Pause.]\n\n[EIDON]: "That means the woods still like you."\n\n[Another pause.]\n\n[EIDON]: "That''s unfortunate. Come in. Mind the third stair. It''s been complaining all morning."',
     E'Eidon is calm but not warm. Treat the players exactly as if they were old friends who walked out for ten minutes and just came back.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"magical"}'::jsonb,
     jsonb_build_object('slug','eidons-door')),

    -- 20. EIDON'S PRESENTATION (NEW) -----------------------------------------
    (q_id, 'Eidon''s Presentation — The Everloop: Why Everything Is Mostly Fine, Except When It Isn''t',
     'A whimsical PowerPoint that delivers the cosmology of the entire Everloop (Drift / Fold / Architects / Pattern / Anchors / Shards) and reveals that the Bell Tree is itself a Shard.',
     20, 'event', 'wonder',
     'Laughing while being told the world is broken.',
     'The Bell Tree is not NEAR a Shard — the Tree IS a Shard. Possibly. Or the Shard grew the Tree to explain itself.',
     'Listen, take notes, ask follow-up questions, or be a nuisance during slides.',
     ARRAY['a wall projecting impossible slides','Eidon in cracked spectacles','him gesturing past the players at an invisible audience','soup that never empties'],
     'medium',
     E'[DM ACTION]\nAn impossible projection / lantern / crystal lens activates. A title slide appears on the wall:\n\n  THE EVERLOOP: WHY EVERYTHING IS MOSTLY FINE, EXCEPT WHEN IT ISN''T\n\n[EIDON]: "Slide one. You are Here!"\n\n[SLIDE 1 — Eidon standing in front of the slide; silhouettes of the players with arrows pointing at their heads.]\n\n[EIDON]: "But if we zoom out…"\n\n[SLIDE 2 — extreme zoom-in of Eidon''s nose.]\n\n[EIDON]: "I said ZOOM OUT. It''s so hard to get good help these days."\n\n[SLIDE 3 — The whole Everloop universe pictured as layers.]\n\n[EIDON]: "You''re really here, waaaaaaay over here. We have where it all starts: THE DRIFT.\n\nBefore things stayed things, everything was here, becoming everything else. Mountains. Feelings. Teeth. Weather. Regret. Swirling around like chaotic soup. Very messy. Terrible place for furniture.\n\nThis next part is THE FOLD. At the edge of all that not-staying, something hesitated. And in that hesitation… things began to remain. Briefly. Which is how all good disasters begin. This allowed for what we call THE FIRST ARCHITECTS to appear."\n\n[SLIDE 4 — vacation photo of Eidon in a speedo holding a bowl of soup on a beach.]\n\n[EIDON]: "Damn, vacation photos must have gotten mixed up in there!"\n\n[SLIDE 5 — Eidon in a speedo wearing skis holding a bowl of soup.]\n\n[EIDON]: "What can I say, I love soup."\n\n[SLIDE 6 — image of a First Architect.]\n\n[EIDON]: "The First Architects were not gods, not even beings — just hesitating intention that existed long enough to build upon itself. And eventually became something that itself could have intention.\n\nThey needed a good place to put the furniture. So they made the FIRST MAP — not a real map, but a way for one moment to lead to the next."\n\n[SLIDE 7 — The Pattern.]\n\n[EIDON]: "Then they built a place for these rules of existence to grow and stick. This is THE PATTERN. An intricate weaving of intent. Infinite threads of existence cast out into the Fold. But they soon learned the Pattern needed weight. So the First Architects fixed themselves into it. They became the things that helped the world remember how to stay. They made themselves into great ANCHORS."\n\n[SLIDE 8 — The Everloop Map.]\n\n[EIDON]: "And upon all this intent and order, something beautiful flourished. THE EVERLOOP."\n\n[He points at the players.]\n\n[EIDON]: "Important bit. Look attentive."\n\n[SLIDE 8b — "Ya done fucked up kid".]\n\n[EIDON]: "Over time parts of the Pattern loosened, forming HOLLOWS — areas where things stop working as expected. And some very well intentioned and clever people thought it would be nice to fix it. And ended up… shattering the Anchors."\n\n[SLIDE 9 — SHARDS.]\n\n[EIDON]: "Shattered into SHARDS. When an Anchor breaks, the pieces still remember what they used to hold. Each piece still has weight. Each piece still pulls. Each piece makes the world around it behave… intensely."\n\n[SLIDE 10 — THE BELL TREE.]\n\n[EIDON]: "And now we arrive at your local botanical nightmare. The Bell Tree is not near a Shard. It IS a Shard. Or it grew around one. Or the Shard grew a Tree to explain itself."\n\n[He looks off to the invisible audience.]\n\n[EIDON]: "Yes, I know that''s less clear. Reality rarely consults me."\n\n[Back to the players.]\n\n[EIDON]: "The bells. The monsters. The woods changing. The paths repeating. All of it is because something broken is trying very hard to hold too much.\n\nIf you want to stop the Tree, don''t just cut it down. That would be heroically stupid. The Tree is the shape of the problem. Not the source. You need to reach the heart beneath it. There will be a bell. There will be a question. There is always a question.\n\nWhen you reach the heart… do not answer what it asks first. Answer what it needs. And if the bells start ringing in your own voice… do not be flattered."\n\n[DM ACTION]: The presentation ends. The room returns to normal. Eidon removes the glasses.',
     E'PROPS: this scene benefits enormously from a real slideshow — a laptop, projector, or printed slide cards on the table. Even paper slides slid across the bar work. The cosmology drop is the central lore payload of the entire session: Drift → Fold → First Architects → Pattern → Anchors → Hollows → Shards → The Bell Tree IS a Shard. Encourage Eidon dialogue with the invisible audience — it should feel like he is reading from a future the players have not arrived at yet.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"magical"}'::jsonb,
     jsonb_build_object('slug','eidons-presentation','live_play', jsonb_build_object('presentation', jsonb_build_object('enabled', true, 'slide_count', 11, 'titles', jsonb_build_array('You Are Here','Zoom Out','The Everloop Layers (Drift/Fold/Pattern)','Vacation Photo (joke)','Soup + Skis (joke)','First Architect','The Pattern','The Everloop Map','Ya Done Fucked Up Kid','Shards','The Bell Tree')), 'props_required', jsonb_build_array('projection surface OR printed slide cards','cracked spectacles for Eidon')))),

    -- 21. EIDON'S CLOSING + LOWEST-POINT CLUE --------------------------------
    (q_id, 'Eidon''s Closing — Drelmere''s Lowest Point',
     'After the presentation: the real clue. The Tree is not where the tree is.', 21, 'social', 'wonder',
     'A door cracked open on a much larger room.',
     'The Tree on the hill is a decoy. The true Tree lives beneath Drelmere''s lowest point — the gorge.',
     'Go up to the hill anyway (waste time), or head straight for the gorge.',
     ARRAY['his bare feet on the floor','no surprise on his face','endless soup','the slideshow lantern cooling'],
     'medium',
     E'[NARRATOR — EIDON]: "There. Educational. Probably accurate. Now go find the Tree before it destroys everything around us. Chop chop."\n\n[DM]: Players are free to ask questions, debate, or leave.\n\n[NARRATOR — EIDON]: Final clue, delivered casually as the party leaves:\n  "Everyone who looks for the Tree starts by looking in the wrong place. I mean, it''s clearly on the hill — it''s a giant tree, for gods'' sakes. It''s just not where the Tree is.\n\n  If you want to find the Tree, go where trees BEGIN, not where they end. Seek out Drelmere''s lowest point. That''s a good start."',
     E'IMPORTANT CALLBACK: this is the redirect that sends the party to the Gorge instead of the visible Bell Tree on the hill. If the party visits the hill first, allow them to study it — but nothing supernatural happens. Eventually they hear ringing off in the distance, coming from below. Route them to Echo Battle #2 → The Gorge.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"magical"}'::jsonb,
     jsonb_build_object('slug','eidons-lowest-point-clue','live_play', jsonb_build_object('callback_setup', jsonb_build_array('the-gorge-descent')))),

    -- 22. ECHO BATTLE #2 (NEW) -----------------------------------------------
    (q_id, 'Echo Battle #2 — Confirmation',
     'A short, fast 10-Echo skirmish on the way down. The players already know the rules.', 22, 'combat', 'tense',
     'Mastery, briefly.',
     'They know how the Echoes work now. The forest knows that they know.',
     'Detach quickly, conserve resources, push toward the gorge.',
     ARRAY['fewer creatures than last time','no narration of attachment mechanics','a bell ringing somewhere far below','ash settling fast'],
     'fast',
     E'[DM]: After leaving Eidon (and, if they detoured, after wasting time on the hill), the party hears a bell ringing — much louder than before. Coming from below.\n\n[NARRATOR ACTION]: Place 10 Echo markers on the table.\n\n[DM]: "Roll for initiative."',
     E'PURPOSE: reinforce Echo mechanics, show off player mastery, build confidence before the Gorge / Memory Gate. Run this fast. Do NOT re-explain attachment, Redirect Die, detachment, or Host Shield — the players already know. Reward creative play with quicker resolution. As soon as the last Echo collapses, the ground vibrates and a bell rings far below the party.',
     ARRAY[echo_id]::uuid[], 'prepared',
     '{"lighting":"dark","time_of_day":"night","weather":"fog"}'::jsonb,
     jsonb_build_object('slug','echo-battle-two')),

    -- 23. THE GORGE — DESCENT (NEW) ------------------------------------------
    (q_id, 'The Gorge — Descent',
     'A massive splitting of the earth. Roots cover every surface. No combat.', 23, 'exploration', 'wonder',
     'Awe, plus the weight of having descended too far to turn back.',
     'The Bell Tree was never growing UP. It was growing DOWN. The party is now inside it.',
     'Climb, rope, glide, or spell their way down. Creative traversal rewarded.',
     ARRAY['~80 ft across','~200 ft deep','roots thicker than buildings','hundreds of bells hanging silent','a single opening at the center'],
     'slow',
     E'[DM]: "The woods abruptly end. Ahead lies a massive gorge splitting the earth. Perhaps 80 feet across. 200 feet deep. Roots cover nearly every surface. Some thicker than buildings. All descending downward."\n\n[NARRATOR]: "At the bottom of the gorge, the roots twist together into a massive circular wall. Almost a door. Almost. Hundreds of bells hang within the roots. None move. None ring. A single opening waits at the center."',
     E'No creatures here. Allow climbing, rope solutions, magical descent, creative traversal. This scene is pure tension and scale — the players should understand they have crossed from the surface world into the structure of the Tree itself. If a player wishes to ring a bell on the way down, the bell does NOT make sound. Note this without commentary.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dim","time_of_day":"midnight"}'::jsonb,
     jsonb_build_object('slug','the-gorge-descent')),

    -- 24. THE MEMORY GATE — 5-BELL SEQUENCE PUZZLE (RESHAPED) ----------------
    (q_id, 'The Memory Gate',
     'Five bells overhead. The roots seal the door. Ring the bells in the sequence you have been hearing all session, or be crushed.', 24, 'puzzle', 'dark',
     'A test you can only pass if you have been paying attention since the first scene.',
     'The bells are not asking what the answer is. They are asking whether the players HEARD it.',
     'Choose a sequence to ring. Wrong sequences contract the chamber and damage the party.',
     ARRAY['five hanging bells','five distinct notes ringing on their own','words appearing on the stone floor','roots advancing inch by inch'],
     'medium',
     E'[DM]: "At the bottom of the gorge, enormous roots twist together into what appears to be a living doorway. Beyond it lies a circular stone chamber. Five bells hang from roots overhead. As the final party member enters the chamber, roots surge across the entrance behind them, sealing the only exit. The roots do not stop growing. Slowly, they continue pushing inward from every wall."\n\n[NARRATOR]: "As the roots seal the chamber behind you, the five bells overhead begin ringing. Five distinct notes from five distinct bells. Immediately something feels familiar."\n\n[BELL — strike the full 5-note quest sequence (the same one rung in the opening scene).]\n\n[NARRATOR]: "As the final bell falls silent, words begin appearing across the stone floor beneath your feet."\n\n  NOTHING NEW OPENS THIS DOOR.\n  THE ANSWER WAS GIVEN BEFORE THE QUESTION.\n  YOU HAVE ALREADY HEARD IT.\n  REMEMBER.',
     E'CALLBACK PUZZLE. The correct solution is to ring the five physical bells in the same sequence the table has been hearing since the opening scene (and at every bell strike since). If you have been ringing the bell consistently with the same 5-note pattern, the table will almost always solve this organically. Place 5 numbered or symbolised bell markers on the table. Do not explain the puzzle.\n\nEACH FAILURE: the chamber contracts; new inscriptions appear; all players take escalating crushing damage as the roots push inward.\n  • First failure → minor crushing damage; roots advance several feet. Inscription: "YOU HAVE HEARD IT. BUT YOU DID NOT LISTEN."\n  • Second failure → additional crushing damage; players have noticeably less room to move.\n  • Third failure → significant crushing damage; roots reach the outer edge of the central platform; movement becomes restricted. The bells overhead begin ringing softly on their own — repeat the sequence so the table can clearly hear it.\n  • Fourth failure → catastrophic. The chamber enters final collapse. Inscription: "YOU WERE TOLD. YOU WERE SHOWN. REMEMBER." One more failure = TPK.\n\nSUCCESS: all five bells answer together. The roots freeze. The grinding stops. Then the roots withdraw from the far wall, revealing a passage deeper beneath Bellroot Vale. Somewhere beyond the darkness ahead, another bell rings in response.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dim","time_of_day":"midnight"}'::jsonb,
     jsonb_build_object('slug','memory-gate','live_play', jsonb_build_object('hidden_mechanics', true, 'escalation_failure', jsonb_build_object('strikes', 4, 'damage_each_strike', 'escalating crushing damage to all PCs', 'on_final_strike', 'TPK — chamber collapses'), 'callback_source', 'opening-road-to-drelmere', 'props_required', jsonb_build_array('5 numbered bell markers','the physical session bell')))),

    -- 25. THE CHAMBER OF SILENCE (NEW) ---------------------------------------
    (q_id, 'The Chamber of Silence',
     'A vast cavern where sound dies. Approach to the Starving Silence.', 25, 'exploration', 'horror',
     'Footsteps without sound. Voices vanishing mid-sentence.',
     'The deeper they go, the less sound survives. Something ahead is the cause.',
     'Speak (and feed it) or stay silent (and pass).',
     ARRAY['weakening footsteps','clothing rustle fading almost immediately','suspended above a black chasm: something enormous','dozens of human mouths frozen mid-scream'],
     'slow',
     E'[DM]: "The passage beyond the Memory Gate descends deep beneath Bellroot Vale. Eventually the roots give way to a vast cavern. No bells ring here."\n\n[NARRATOR]: "The silence feels wrong. The sound of your own footsteps seems weaker than it should. The rustle of clothing fades almost immediately. The deeper you travel, the less sound survives.\n\nAhead, suspended above a black chasm, floats something enormous. At first it appears to be a cluster of black crystal. Then it turns. And dozens of human mouths become visible across its surface. Every mouth is open. Every mouth is screaming. None make a sound."',
     E'NO COMBAT YET. This is the tonal lead-in to the Starving Silence. Players who speak loudly here should be subtly warned by the world (their words swallowed, a Narrator whisper "your voice is being taken"). Anyone who instinctively whispers passes through this scene rewarded — note who at the table whispered, they will have an advantage in the next encounter.',
     ARRAY[silence_id]::uuid[], 'prepared',
     '{"lighting":"dark","ambient_sound":"silence-pressure"}'::jsonb,
     jsonb_build_object('slug','chamber-of-silence')),

    -- 26. THE STARVING SILENCE — BOSS BATTLE ---------------------------------
    (q_id, 'Boss Battle — The Starving Silence',
     'A creature that eats sound. The louder you are, the more you bleed.', 26, 'boss', 'horror',
     'A scream you can see but not hear.',
     'Combat is louder than survival. Whispered coordination wins this fight.',
     'Whisper, signal, gesture, restrain casting — or shout and feed the boss.',
     ARRAY['the Sound Meter die at the center of the table','footsteps without sound','silent screaming mouths','a creature that floats silently between you'],
     'fast',
     E'[DM]: "Roll initiative."\n\n[NARRATOR]: "The creature shudders as though desperately trying to speak. It cannot. It never can."\n\nSee canon_entities monster_stats for the full stat block: HP 150, AC 16, Multiattack (Obsidian Slam + Shard Lash, then Silent Scream if recharged), 3 attacks scaling with the Sound Meter, Feed on Sound (heals 5 + gains bonus damage as the meter rises), Impossible Silence aura (30 ft).',
     E'SOUND METER MECHANIC: place a visible d6 in front of the table. It starts at 1.\n  +1 each time the party SHOUTS\n  +1 each time a player casts a VERBAL spell\n  +1 each time loud TABLE STRATEGY occurs mid-combat\n  +1 each time a sound-based ability is used\nMaximum 6.\n\nBONUS DAMAGE BY METER: 1=+0, 2=+2, 3=+4, 4=+6, 5=+8, 6=+10. Applies to ALL of the boss''s attacks.\n\nMETER 3–4: bonus damage + extended attack range.\nMETER 5–6: maximum damage + additional attacks + Silent Scream affects a larger area.\n\nFEED ON SOUND: each time the meter rises, the boss regains 5 HP and immediately uses the new bonus.\n\nWEAKNESS — QUIET: if the party intentionally reduces the Sound Meter to 0 through silence magic, environmental solutions, or coordinated whispered-only play, the boss is VULNERABLE for one full round (double damage, no Silent Scream, AC drops 16 → 12).\n\nGOAL: get the players to communicate and attack in coordination WITHOUT SPEAKING AT ALL.\n\nDEATH SEQUENCE: cracks spread across the obsidian. The mouths open and close uncontrollably. For the first time you HEAR it — a single deafening cry, then collapse into silence. Real silence. Natural silence.',
     ARRAY[silence_id]::uuid[], 'prepared',
     '{"lighting":"dark","ambient_sound":"silence-pressure"}'::jsonb,
     jsonb_build_object('slug','the-starving-silence','live_play', jsonb_build_object('sound_meter', jsonb_build_object('enabled', true, 'starts_at', 1, 'max', 6, 'bonus_damage_table', jsonb_build_object('1','+0','2','+2','3','+4','4','+6','5','+8','6','+10')), 'props_required', jsonb_build_array('visible d6 for the Sound Meter')))),

    -- 27. THE HEART BELOW THE TREE -------------------------------------------
    (q_id, 'The Heart Below the Tree',
     'The real Bell Tree extends endlessly downward. No combat — atmosphere only.', 27, 'narrative', 'wonder',
     'Awe replacing fear, briefly.',
     'They have not been climbing toward the Tree. They have been descending inside it.',
     'No mechanical choice — let the table sit with the scale.',
     ARRAY['roots larger than castles','thousands of bells beneath the earth','every bell ringing in a different voice','a monument of root, crystal, and bell fused together'],
     'slow',
     E'[DM]: "Beyond the battlefield lies one final chamber. You descend into the deepest point beneath Bellroot Vale."\n\n[NARRATOR]: "The Bell Tree above was only the surface. The true structure extends endlessly downward. Roots larger than castles descend through darkness. Thousands of bells hang beneath the earth. Every bell rings in a different voice.\n\nAt the center stands the Tree itself. Not a tree. A monument of roots, crystal, and bells fused together into a single impossible structure."',
     E'No combat. No rolls. Let the table go quiet. This is the breath before the final question.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"magical","time_of_day":"midnight"}'::jsonb,
     jsonb_build_object('slug','heart-below-tree')),

    -- 28. THE FINAL QUESTION — "WHAT AM I?" (RESHAPED) ----------------------
    (q_id, 'The Final Question — "WHAT AM I?"',
     'Every bell falls silent. The Tree asks one question. The answer is hidden in the Mayor''s note.', 28, 'event', 'wonder',
     'A puzzle that feels unsolvable until the table remembers what it has been holding the whole time.',
     'The Tree already knows what it is. It is asking the WRONG question — and only the Mayor''s note answers correctly.',
     'Debate the answer. Speak it aloud. Or refuse.',
     ARRAY['every bell falling silent','a single voice emerging from the Tree','the Mayor''s words coming back','total silence around the table'],
     'slow',
     E'[DM]: "As the players approach, every bell falls silent."\n\n[NARRATOR]: "A single voice emerges from the Tree. The Tree asks:"\n\n  WHAT AM I?\n\n[DM]: Allow debate. Do not rush. Do not provide hints immediately.',
     E'CALLBACK PUZZLE. Players will naturally attempt: Tree. Bell Tree. Shard. Anchor. Monster. ALL incorrect. The Tree already knows what it is — the Tree is asking the wrong question. The answer is hidden in the Mayor''s personal note from earlier in the session:\n\n  THE TREE IS REAL AND THE TREE IS NOTHING\n\nAny answer that paraphrases this note (e.g., "you are real and you are nothing," "you are both real and not," "you are nothing — and that is real") counts as correct.\n\nIf the party never saw the Mayor''s notes during the office scene, allow Eidon''s warning ("answer what it needs, not what it asks") to redirect them. If still stuck, allow an Insight or History check to recall a line they overheard in town.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"magical"}'::jsonb,
     jsonb_build_object('slug','final-question','live_play', jsonb_build_object('hidden_mechanics', true, 'callback_source', 'mayor-modular-answers'))),

    -- 29. RESOLUTION + THE SHARD ---------------------------------------------
    (q_id, 'The Bell Tree Collapses — The Shard',
     'The Tree folds inward. A single Shard remains. Something far away just felt it move.', 29, 'event', 'mysterious',
     'A secret pressed into the palm.',
     'The Shard is not alone — and others now know it has moved.',
     'Which player picks up the Shard, and what they choose to share.',
     ARRAY['bells disappearing','branches folding inward','the Earth shaking','a single object the size of a pinecone'],
     'medium',
     E'[NARRATOR]: "The bells begin ringing together in harmony. The entire structure becomes still — but only for a moment. Then the Bell Tree begins collapsing inward.\n\nThe bells disappear first. Then the branches. Then the roots. The ground and Earth shake all around you. Everything folds inward toward a single point. The impossible structure shrinks. Compresses. Until only a single object remains.\n\nA Shard. No larger than a pinecone."\n\n[DM ACTION]: Hand the players the Shard (or place a physical prop on the table).\n\n[NARRATOR]: "As the Shard settles into the hands of the party, every bell in Bellroot Vale rings simultaneously. Far away. Something answers. Something else just noticed the Shard moved. And somewhere in the Everloop… another bell begins to ring."\n\n[BELL — strike once more, far away.]\n\n[DM ACTION]: Hand each player a written VISION CARD when they touch the Shard:\n  • drowned cities\n  • black towers\n  • glass deserts\n  • impossible staircases\n  • (additional regional vision cards at DM''s discretion)',
     E'Players may share their vision aloud or keep it private. Encourage hesitation. Whatever they share now will resurface in future quests. Add this Shard to the quest''s referenced_shards if the table consents to carry it.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"magical"}'::jsonb,
     jsonb_build_object('slug','the-shard','live_play', jsonb_build_object('props_required', jsonb_build_array('physical Shard prop','vision cards')))),

    -- 30. END OF SESSION -----------------------------------------------------
    (q_id, 'End of Session',
     'No cleanup. No epilogue. Silence.', 30, 'narrative', 'melancholy',
     'The table holding its breath.',
     'The story is over. The world is not.',
     'No choice. End immediately. Let silence linger.',
     ARRAY['the bell, untouched','candles still burning','rain still falling somewhere in everyone''s head','no one moving first'],
     'slow',
     E'END SESSION.\n\nNO:\n  • lore dump\n  • explanation\n  • cleanup dialogue\n\nEnd immediately. Let silence linger.',
     E'Do NOT debrief at the table. Save reflection for the post-session Spotlight (quest_sessions.surprise_moment / party_lesson). Pack up in silence. The next session begins with the first sound someone makes — not before.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dim"}'::jsonb,
     jsonb_build_object('slug','end-of-session'));

    RAISE NOTICE 'Re-seeded % scenes for quest % (Bell Tree DM Module sync complete).',
                 (SELECT COUNT(*) FROM public.quest_scenes WHERE quest_id = q_id),
                 q_id;
END $$;

-- Make sure PostgREST picks up any cached schema details for the updated rows.
NOTIFY pgrst, 'reload schema';
