-- =====================================================
-- The Bell Tree and the Broken World — Re-seed full scene list
-- Builds the complete beat-by-beat scene breakdown from the
-- design document and populates the new narrative scaffold
-- (feeling / reveal / choice / sensory_anchors / pacing) added
-- in 20260522_003_quest_narrative_foundation.sql.
-- =====================================================

DO $$
DECLARE
    q_id UUID;
    echo_id UUID;
    cleaved_id UUID;
BEGIN
    SELECT id INTO q_id FROM public.quests WHERE slug = 'the-bell-tree-and-the-broken-world';
    IF q_id IS NULL THEN
        RAISE EXCEPTION 'Quest the-bell-tree-and-the-broken-world not found';
    END IF;

    SELECT id INTO echo_id FROM public.canon_entities WHERE slug = 'the-echo-mon8u4fw';
    SELECT id INTO cleaved_id FROM public.canon_entities WHERE slug = 'the-cleaved-mon86lvm';

    -- Quest hook + stakes triad (added in migration 003)
    UPDATE public.quests
    SET
      hook = 'A bell rings somewhere in the distant hills of Bellroot Vale. The villagers stop walking — and pretend they did not hear it. Drelmere is forgetting itself.',
      stakes_personal = 'The party are outsiders. The hill changes locals faster than visitors — which means they may be the only ones in the valley who can still notice what is wrong before it becomes normal to them too.',
      stakes_world = 'Bellroot Vale is unspooling. Roads no longer agree on where they go. Memories rot when no one touches them. If the Bell Tree is allowed to keep "arriving", the whole region will forget what the world is supposed to look like.',
      stakes_mystery = 'No one in Drelmere can remember when the Bell Tree appeared — or whether it has always been there. Beneath it, a fractured Shard hums in a crystalline bell. Something far away is listening for it to move.',
      updated_at = NOW()
    WHERE id = q_id;

    -- Wipe previous scenes for an idempotent re-seed
    DELETE FROM public.quest_scenes WHERE quest_id = q_id;

    INSERT INTO public.quest_scenes
      (quest_id, title, description, scene_order, scene_type, mood,
       feeling, reveal, choice, sensory_anchors, pacing,
       narration, dm_notes, linked_entities, status, atmosphere)
    VALUES

    -- 1. OPENING NARRATION ----------------------------------------------------
    (q_id, 'Opening — The Road to Drelmere',
     'Cold open. Rain. Mud. The first distant bell.', 1, 'narrative', 'melancholy',
     'Soaked, watchful, slightly small.',
     'Bellroot Vale is quieter than it should be — and the locals already know why.',
     'Players choose how to react to the first bell: speak, push on in silence, or watch the villagers.',
     ARRAY['silver lines of rain','mud on boots','one slow metallic toll','closed faces of villagers'],
     'slow',
     E'[DM]: "You are on a road en route to the town of Drelmere."\n\n[NARRATOR]\nRain falls in long silver lines across the road to Drelmere. Mud clings heavily to boots and wagon wheels alike. The farther you travel into Bellroot Vale… the quieter the world becomes.\n\n[BELL — strike ONCE. Let it fully ring out. Silence at table until it stops.]\n\n[NARRATOR]\nA bell rings somewhere in the distant hills. Not loud. Not celebratory. Just one deep metallic toll swallowed by fog. The nearby villagers stop walking. Nobody speaks. Nobody looks toward the sound. After several long seconds… they quietly continue moving.\n\nAhead, warm lanternlight flickers behind rain-streaked windows. The town of Drelmere waits. And somewhere beyond the hills… something enormous rings again.\n\n[BELL — strike ONCE.]',
     E'Setup: distribute character sheets, play order, materials. Place the physical bell and the face-down Echo / Vision / Riddle cards at table center. Wait for the table to fully settle, then nod to the Narrator. Do not heighten emotion — the DM is calm, measured, almost emotionless. The Narrator carries tension.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dim","time_of_day":"dusk","weather":"steady rain","ambient_sound":"rain + distant bell"}'::jsonb),

    -- 2. ENTERING DRELMERE ----------------------------------------------------
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
     '{"lighting":"firelight","time_of_day":"evening","weather":"steady rain"}'::jsonb),

    -- 3. THE CRACKED POT TAVERN — Silent Service ------------------------------
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
     '{"lighting":"firelight","time_of_day":"evening","weather":"steady rain"}'::jsonb),

    -- 4. GARRON'S WELCOME -----------------------------------------------------
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
     '{"lighting":"firelight","time_of_day":"evening","weather":"steady rain"}'::jsonb),

    -- 5. GARRON'S CALL TO ACTION ----------------------------------------------
    (q_id, 'Garron''s Call to Action',
     'Humor drops. Real fear shows.', 5, 'social', 'tense',
     'The friendly host becomes a frightened man.',
     'Drelmere has stopped noticing that it is being unmade.',
     'Go to the Mayor, seek Old Eidon, or attempt the Bell Tree directly (Garron warns against this).',
     ARRAY['voice lowering','rain audible through window','distant bell','his eyes on the hills'],
     'medium',
     E'[NARRATOR ACTION]\nGradually lose humor. Lower the voice. Make the fear genuine.\n\n[GARRON]: "You know what the worst part is? It''s not the disappearances. Not the things people see in the woods. Not even those damn bells."\n\n[He looks toward the window.]\n\n[BELL — strike a distant bell once.]\n\n[GARRON]: "It''s that everyone in Drelmere acts like this has always been normal. Every year the hill gets worse. More roads close. More people stop going near it. And every single time somebody talks about leaving… a few weeks pass. Then suddenly nobody remembers why they wanted to.\n\n"The Bell Tree wasn''t here when I was a boy. I think. That''s the problem. Nobody can remember when it appeared. And the longer it stays there… the less certain anything around it becomes.\n\n"You''re outsiders. That matters. The hill changes people slower if they weren''t born here. Locals don''t go near it anymore. The ones who do either don''t come back… or come back wrong.\n\n"So if you''re asking whether somebody should go find out what that thing is… yes. Before this whole valley forgets what the world''s supposed to look like."\n\n[DM]: "Garron gestures vaguely toward the hills."\n\n[GARRON]: "Talk to the mayor. Or find Old Eidon, the hermit who lives on Watcher''s Hill past the woods. Knows more than anyone if you can understand half of what he says. I wouldn''t go seeking out the Bell Tree just yet."',
     E'This is the first real lore drop. Pace it slowly. Do not let the Narrator rush. Garron is shedding the mask he wears for himself.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"firelight","time_of_day":"evening","weather":"steady rain"}'::jsonb),

    -- 6. TAVERN RESET — PLAYER CHOICE PHASE -----------------------------------
    (q_id, 'The Tavern Resets',
     'The bell strikes hard. Garron forgets the entire conversation.', 6, 'social', 'horror',
     'Quiet dread. The wrongness is now confirmed.',
     'Forgetting is not happening offstage. It is happening to people while you watch them.',
     'Speak to the Mayor, attempt the Bell Tree, or seek Old Eidon directly.',
     ARRAY['the bell, sharp','Garron''s face going blank','his greeting word-for-word','rain unchanged'],
     'fast',
     E'[BELL — strike SHARPLY.]\n\n[NARRATOR ACTION]\nInstantly reset expression. Confused. As if first noticing the players again.\n\n[GARRON]: "Hmmm… I didn''t see you come in! Welcome. You all look soaked from the rain. Warm yourselves. Pay no mind to those bells. What can I get you to drink?"\n\n[DM]: Present PLAYER CHOICE PHASE.\nPlayers may:\n  • Speak to the Mayor → directs to the Mayor scene.\n  • Try to go directly to the Bell Tree → Garron warns; if they insist, route them through the Dark Woods.\n  • Seek Old Eidon on Watcher''s Hill (requires passing through the woods).',
     E'Do not negotiate the reset. He does not remember the conversation. If players try to remind him, he is mildly amused and asks again what they want to drink. This is the first hard demonstration that the Fray here erases not memory of the supernatural — but memory of the FEAR of it.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"firelight","time_of_day":"evening","weather":"steady rain"}'::jsonb),

    -- 7. MAYOR ELRIC VALE — Office --------------------------------------------
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
     '{"lighting":"dim","time_of_day":"night","weather":"steady rain"}'::jsonb),

    -- 8. MAYOR — MODULAR ANSWERS ----------------------------------------------
    (q_id, 'Mayor''s Answers (Modular Branches)',
     'Conversation branches: Tree / Bells / Disappearances / Woods / Eidon / Press.', 8, 'social', 'mysterious',
     'Each answer is a key that does not fit the same lock twice.',
     'Reality in Bellroot Vale is editorial. The Mayor knows it. He hides it badly.',
     'Players decide which threads to follow and whether to push him.',
     ARRAY['the soft scratch of him correcting a map','distant bell','his tea going cold','his answers contradicting his maps'],
     'medium',
     E'IF PLAYERS ASK ABOUT THE BELL TREE:\n  [MAYOR]: "Nobody agrees how long it''s been there. That''s not an exaggeration. Some records mention it generations ago. Others don''t mention it at all. A woman came into this office last winter screaming the Tree had appeared overnight. Her husband swore they got married beneath it."\n\nIF PLAYERS ASK WHAT THE BELLS DO:\n  [MAYOR]: "If I knew that, I''d probably sleep better. Some people think the bells warn the town. Others think they call things… terrible things. And some people swear the bells ring differently depending on who hears them. Personally? I think the bells remember things."\n\nIF PLAYERS ASK ABOUT PEOPLE DISAPPEARING:\n  [MAYOR]: "We''ve lost many people to those woods. Not always to death or disappearance. But they come back and they''ve forgotten family members entirely. One man returned, insisting he''d lived in Drelmere his whole life. Nobody recognized him."\n\nIF PLAYERS ASK ABOUT THE WOODS:\n  [MAYOR]: "The woods change. I know how that sounds. But paths move. Distances feel wrong. The trees have signs and symbols. Weird phrases carved into them like ''Two wrongs make a right?'' Or something like that."\n\nIF PLAYERS ASK ABOUT EIDON:\n  [MAYOR]: "Ahh, Old Eidon, the old hermit. I don''t know whether he''s the wisest man in Bellroot or the craziest. Maybe both. Claims he remembers things before they happen. Claims half the world''s folded wrong. Most people think he''s insane and stop going near the hill after meeting him. If they can even get there."\n\nIF PLAYERS PRESS THE MAYOR HARD (accuse him of hiding things):\n  [MAYOR]: "Of course I''m hiding things. I''m trying to keep this town functioning. Do you know how hard it is to govern people who can''t agree where roads are anymore?"',
     E'Use only the branches the players ask about. Do not volunteer all of them. If players ask the same question twice in different ways, give a slightly different answer the second time — that itself is a clue.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dim","time_of_day":"night","weather":"steady rain"}'::jsonb),

    -- 9. MAYOR'S FINAL PUSH ---------------------------------------------------
    (q_id, 'Mayor''s Final Push',
     'A reluctant blessing toward Eidon.', 9, 'social', 'melancholy',
     'A man who already knows you might not come back.',
     'Even the Mayor — the most stubborn realist in town — defers to the hermit.',
     'Set out for the Dark Woods toward Watcher''s Hill, or attempt the Bell Tree directly.',
     ARRAY['fog at the windows','his hand on the desk','an unfinished map','the last bell of the night'],
     'slow',
     E'[MAYOR]: "If you''re truly planning to go near the Tree…"\n\n[He hesitates. Looks toward the fog outside.]\n\n[MAYOR]: "Talk to Eidon first. Whatever''s happening in Bellroot… he understands it better than the rest of us. Or he understands it less. Hard to tell the difference around here."',
     E'End the scene with the Mayor''s posture. He is the last reasonable voice the party will hear before everything stops being reasonable.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dim","time_of_day":"night","weather":"fog"}'::jsonb),

    -- 10. THE DARK WOODS — ENTRY ----------------------------------------------
    (q_id, 'The Dark Woods — Entry',
     'Wrong-feeling forest. Delayed footsteps. Whispers.', 10, 'exploration', 'horror',
     'Not haunted. Uncertain.',
     'The wrongness is not behind something. It is the world itself.',
     'Press on, listen, mark the trail.',
     ARRAY['delayed footsteps','whispers of your own voices','branches moving without wind','daylight swallowed overhead'],
     'medium',
     E'[DM]: "Players leave the Mayor and set out for The Dark Woods. The woods beyond Drelmere have paths that barely look wider than a single person. The trees grow too close together, their black branches tangling overhead tightly enough to swallow most of the remaining daylight. The deeper you walk, the quieter the world becomes."\n\n[NARRATOR]\nThe woods feel wrong immediately. Not hostile. Not haunted. Just… uncertain.\n\nSuddenly, you hear: footsteps slightly delayed, whispers of their own voices, fragments of conversations, branches moving without wind. Then: movement. Small things. Watching.',
     E'Encourage perception checks. Reward them with sensory wrongness only, no creatures yet. Build tension.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dark","time_of_day":"night","weather":"fog"}'::jsonb),

    -- 11. THE ECHO SWARM — COMBAT --------------------------------------------
    (q_id, 'The Echoes Appear',
     '22 Echoes converge on one player. Combat begins.', 11, 'combat', 'horror',
     'A swarm that wants something that is not your life.',
     'The Echoes do not kill. They attach. And the party will spread the infection themselves.',
     'How to attack what cannot be killed cleanly — let the table discover detachment.',
     ARRAY['three-dimensional charcoal smudges','scentless grey ash','jerking sideways movement','a single player going quiet'],
     'fast',
     E'[DM]: "Echoes look like charcoal-smudged forms, fraying smoke edges, broken silhouettes ranging from hounds to children. They appear as three-dimensional sketches, edges constantly blurring."\n\n[DM NOTE]: Physically weak and almost weightless. When struck, they shatter into fine, scentless grey ash.\n\n[NARRATOR]\nAt first, the shapes simply watch from between the trees. Still and barely visible against the darkness. Then one moves. Not naturally. Its body jerks sideways in short broken motions. More begin emerging from the woods surrounding the party. Not running. Not charging. Just gathering. Swarming…\n\n[DM]: "As the creatures continue closing inward, you realize something unsettling: the swarm is not surrounding the group randomly. Every single one of the creatures is slowly converging toward the same member of the party."\n\n[NARRATOR ACTION]: Place 22 Echo tokens on the table, concentrated close to one player.\n\n[DM]: "Roll for initiative."',
     E'Echoes share a collective initiative — one roll per 10 Echoes (3 rolls for 22). All Echoes move one space closer to the swarm''s current target each turn. Any successful hit destroys a single Echo. When 3+ Echoes are adjacent to a player, ONE attaches:\n  • Quietly place an Echo Attachment marker on that player''s sheet.\n  • Secretly hand them the Echo Attachment Card.\n  • Do NOT publicly announce attachment, redirect, or detachment mechanics.\n  • The rest of the swarm abandons that target and converges on another player.\n\nFalse Strike: after the attached player resolves any attack, they secretly roll the Redirect Die (4p=d6, 6p=d8, 8p=d10, 10+=d12/d20). Result matching another player''s initiative # = that ally is the actual target (they may defend normally). Any unused number = the attack hits nothing. Tell the host the original attack landed as intended — the Narrator delivers the false result as a whisper.\n\nHost Shield: attacking an attached Echo is an attack against the host. 50% damage to the host, Echo not destroyed.\n\nDetachment (let players discover): Violent Recognition (teammate shouts/shakes them — STR or Persuasion check, no damage); Resonant Overload (bells, thunder, psionic blasts, shield strikes, tuning forks — instant detach + kill, host unharmed); Reflection (mirror, polished steel, still water, magical reflection); Self-Harmed Clarity (host deliberately attacks self OR rolls own initiative # on Redirect Die — 10% rolled damage, Echo dies).',
     ARRAY[echo_id]::uuid[], 'prepared',
     '{"lighting":"dark","time_of_day":"night","weather":"fog","ambient_sound":"distorted whispers"}'::jsonb),

    -- 12. AFTER THE ECHOES — CARVINGS -----------------------------------------
    (q_id, 'The Carvings',
     'Trail markers carved into the trees. Old E. This way →', 12, 'exploration', 'mysterious',
     'Black humor in a place that should not contain it.',
     'Someone has been here before. Repeatedly. And he is mocking the woods.',
     'Follow the arrows, ignore them, or stop to read every one.',
     ARRAY['black bark','rough deep carvings','too-quiet woods','no birds'],
     'medium',
     E'[DM]: "Once the final Echo collapses into ash, the woods become quiet again almost immediately."\n\n[NARRATOR]: "Too quiet."\n\n[DM]: "The only visible path forward continues deeper between the trees. As you continue, you begin noticing carvings cut into the bark of nearby trees. Old carvings. Deeply weathered. But still readable."\n\n[NARRATOR]\nThe first carving appears on a dead black tree leaning across the path. Rough letters carved deeply into the bark:\n  OLD E. THIS WAY →\n\nAs you continue deeper into the woods, more carvings begin appearing:\n  KEEP GOING IDIOTS →\n  NO SERIOUSLY THIS WAY\n  IF YOU HIT THE SWAMP YOU''VE GONE TOO FAR\n  STAIRS ARE THE WORST PART',
     E'These carvings are by Eidon. Reward inspection rolls with extra context: most carvings are weathered to different ages — some look ancient, some look fresh, none of them are dated. He has been walking this path for longer than he should have been.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dark","time_of_day":"night"}'::jsonb),

    -- 13. THE FORK — RIDDLE PRESENTED -----------------------------------------
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
     '{"lighting":"dark","time_of_day":"night"}'::jsonb),

    -- 14. THE FORK — FIRST FAILURE --------------------------------------------
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
     '{"lighting":"dark"}'::jsonb),

    -- 15. THE FORK — SECOND FAILURE -------------------------------------------
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
     '{"lighting":"dark"}'::jsonb),

    -- 16. THE CLEAVED — BOSS BATTLE (FAIL STATE) ------------------------------
    (q_id, 'The Cleaved (Fail-State Boss)',
     'Only triggered if players change direction a third time.', 16, 'boss', 'horror',
     'A creature in agony at the sight of itself.',
     'The woods do not punish wrong answers. They produce them.',
     'Survive. Win by forcing it back together, not apart.',
     ARRAY['absolute silence','splitting fog','arcing black energy between two halves','twitching stitched corpses'],
     'fast',
     E'[DM — BOSS BATTLE]\nIf the players fail the riddle a third time by changing directions again: do not return them to the fork. Immediately call "Roll for Initiative."\n\nNarrator places: 10 Echoes and 1 boss marker labeled "The Cleaved" onto the battle map.\n\n[NARRATOR]\nThe forest becomes completely silent. No wind. No footsteps. No breathing. The fog between the trees ahead slowly begins to split apart. At first it looks like two massive figures walking side by side through the woods. Then the shape steps closer. And you realize: it is one creature.\n\nSplit completely down the middle. The two halves hover inches apart from one another, connected only by jagged strands of burning black energy arcing violently between exposed ribs and pulsing organs. Skewered between the halves are dead animals and blackened human remains burned directly into the wound like crude stitches. Several still twitch weakly.\n\nThen from behind the hideous creature, 10 Echoes appear.',
     E'Echoes use standard swarm rules. The Cleaved acts independently — see canon_entities monster_stats for full mechanics. Key abilities: Stitching Strike (grapple + Burning Stitches), Repulsion Surge (recharge 5–6), Skewer the Living at half HP, Failed Closure as a reaction to critical fails. WEAKNESS = FORCED UNITY. The creature takes the MOST damage from crushing attacks, force compression, synchronized dual strikes, magnetic/binding magic, chains/rope/vines, earth manipulation, grapples, and mirrored attacks on both halves simultaneously. Slashing, single-point piercing, fire, and chaotic splash damage are absorbed. Forcing it together hurts more than pulling it apart.',
     ARRAY[echo_id, cleaved_id]::uuid[], 'prepared',
     '{"lighting":"dark","time_of_day":"night","weather":"unnatural silence"}'::jsonb),

    -- 17. THE CLEAVED — RESOLUTION --------------------------------------------
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
     '{"lighting":"dark"}'::jsonb),

    -- 18. WATCHER'S HILL — APPROACH -------------------------------------------
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
     '{"lighting":"magical","time_of_day":"midnight"}'::jsonb),

    -- 19. EIDON'S DOOR --------------------------------------------------------
    (q_id, 'Eidon''s Door',
     'The hermit is younger than he should be, and unsurprised.', 19, 'social', 'wonder',
     'A welcome that feels rehearsed.',
     'He has been expecting them. He has always been expecting them.',
     'Enter or stay outside.',
     ARRAY['silver eyes','bare feet','no surprise on his face','a knock the players never made'],
     'medium',
     E'[NARRATOR]\nThe door opens before knock. A young man. Mid twenties. Silver eyes. Barefoot. Entirely unsurprised.\n\n[EIDON]: "Took you long enough."\n\n[He studies the players.]\n\n[EIDON]: "You smell like Echo ash."\n\n[Pause.]\n\n[EIDON]: "That means the woods still like you."\n\n[Another pause.]\n\n[EIDON]: "That''s unfortunate."\n\n[Then casually:] "Mind the third stair. It forgets where it is sometimes."',
     E'Eidon is calm but not warm. Treat the players exactly as if they were old friends who walked out for ten minutes and just came back.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"magical"}'::jsonb),

    -- 20. EIDON'S HOUSE -------------------------------------------------------
    (q_id, 'Eidon''s House',
     'Impossible geometry. Bells that hang silent.', 20, 'social', 'mysterious',
     'Sitting still inside a place that is not still.',
     'Eidon is not delivering exposition — he is remembering forward.',
     'Ask questions and pick which of his answers to believe.',
     ARRAY['endless soup','silent hanging bells','maps that contradict themselves','staircases descending impossibly far'],
     'medium',
     E'[NARRATOR]\nDescribe:\n  • impossible geometry\n  • maps contradicting themselves\n  • endless soup\n  • silent hanging bells\n  • staircases descending impossibly far\n\nUse Eidon dialogue naturally throughout the conversation:\n  • "The Bell Tree isn''t growing upward. It''s arriving."\n  • "The world''s not broken in the normal sense. Broken things stop moving."\n  • "Some memories rot if nobody touches them long enough."\n  • "I remember tomorrow being difficult."\n  • "You''re asking good questions. That usually means the dangerous part''s close."',
     E'Eidon does not answer questions directly. He answers questions the players have not asked yet. Anyone making an Insight check at high DC realizes he is responding to questions that will come later in the scene.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"magical"}'::jsonb),

    -- 21. EIDON JOINS THE PARTY -----------------------------------------------
    (q_id, 'Eidon Joins (Until the First Chamber)',
     'He walks with the party down — then stops.', 21, 'exploration', 'dark',
     'Trusted, briefly.',
     'The roots beneath the Bell Tree know him personally.',
     'Press him for more information before he leaves — or let him go.',
     ARRAY['descending steps','the smell of wet stone','his bare feet on the floor','his last warning'],
     'slow',
     E'[EIDON]\nOnly until the first chamber. Then stops.\n  "Can''t go much deeper."\n  "The roots know me too well."\n\nBefore leaving:\n  "If the bells start ringing in your own voice…"\n  [long pause]\n  "Run."',
     E'Eidon does not explain his last warning. If players push, he just looks at them and waits for the question they will not ask. The moment they do, he is gone — slipped back the way they came.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dim"}'::jsonb),

    -- 22. RIDDLE I — MEMORY GATE ----------------------------------------------
    (q_id, 'Riddle I — The Memory Gate',
     'Five bells. WHAT REMAINS WHEN MEMORY FAILS?', 22, 'puzzle', 'dark',
     'A test you cannot study for.',
     'The chamber takes from the players exactly what it asks them to consider.',
     'Which face-down card to choose.',
     ARRAY['five silent bells','an inscription','face-down cards','your own breath'],
     'medium',
     E'[NARRATOR]\nFive bells hang across the chamber. Inscription:\n\n  WHAT REMAINS WHEN MEMORY FAILS?',
     E'[DM ACTION]: Place answer cards face down. Players choose physically. Wrong answers cause CONCEPTUAL penalties — a forgotten prepared spell, a forgotten ally name (players must refer to that PC by description only for one scene), inability to heal a specific ally for one scene, temporary memory instability (disadvantage on Wisdom-based checks until next short rest). The correct card is your choice (suggested: a card depicting a scar / a habit / a smell — something the body remembers even without the mind).',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dim"}'::jsonb),

    -- 23. THE STARVING SILENCE ------------------------------------------------
    (q_id, 'The Starving Silence',
     'A creature that eats sound. The louder you are, the more you bleed.', 23, 'combat', 'horror',
     'A scream you can see but not hear.',
     'Combat is louder than survival.',
     'Whisper, signal, gesture, restrain casting.',
     ARRAY['footsteps without sound','voices vanishing mid-word','silent screaming mouths','a creature floating without sound'],
     'fast',
     E'[NARRATOR]\nDescribe:\n  • footsteps without sound\n  • voices vanishing mid-sentence\n  • silent screaming mouths\n  • a creature that floats silently between you',
     E'SOUND METER MECHANIC: place a visible d6 in front of the table. It starts at 1. Increase the meter by 1 each time the party strategizes loudly, casts a verbal spell, or shouts. The creature''s damage scales with the meter (e.g., its melee damage die equals the current meter, max 1d6+CON). Reward whispered planning, gestural casting, and players who restrain their announcements. The DM may add other thematic effects above 4 (auto-locating the loudest target, AoE pulses).',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dark","ambient_sound":"silence-pressure"}'::jsonb),

    -- 24. RIDDLE II — SPEAKING ROOTS ------------------------------------------
    (q_id, 'Riddle II — Speaking Roots',
     'Personal questions whispered to each player. Five seconds to answer.', 24, 'puzzle', 'horror',
     'Exposed.',
     'The roots are not asking to test the players — they are asking to know what to keep.',
     'Answer honestly, lie convincingly, or refuse.',
     ARRAY['roots that part like fingers','a Narrator whispering to one player at a time','a visible five-second timer','the silence of the rest of the table'],
     'medium',
     E'[NARRATOR ACTION]\nApproach players individually. Whisper personal questions. Examples:\n  • "What would you erase to remove your guilt?"\n  • "Who would you become if nobody remembered your name?"\n  • "Whose voice in your head do you most want to silence?"\n  • "What part of yourself would you sacrifice to be safe again?"',
     E'[DM ACTION]: Place a visible 5-second timer in front of the player being asked. Failure to answer (or active refusal) → roots constrict → 2d6 bludgeoning damage applied immediately. ANY honest in-character answer counts as a success, regardless of content. Lying convincingly (Deception vs. passive Insight 14) also counts. Silence and meta refusals fail.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dark"}'::jsonb),

    -- 25. THE BIRTH GIANT -----------------------------------------------------
    (q_id, 'The Birth Giant',
     'Unfinished anatomy. Not aggressive. Tragic.', 25, 'boss', 'chaotic',
     'Pity that may get the party killed.',
     'It is being made. It does not know it is alive yet.',
     'Fight it, soothe it, or escape past it.',
     ARRAY['reforming limbs','shifting faces','wet membrane sounds','a newborn-like cry when struck'],
     'fast',
     E'[NARRATOR]\nDescribe:\n  • unfinished anatomy\n  • reforming limbs\n  • shifting faces\n  • desperate instability\n\nNOT aggressive initially. Tragic. Confused.\n\nWhen struck:\n  [NARRATOR ACTION] Emit a horrifying newborn-like cry.',
     E'BIRTH GIANT MECHANIC: at initiative 0 each round, the DM PHYSICALLY shifts battlefield terrain — rearrange minis, swap map tiles, narrate doorways closing and new ones opening. Reality destabilizes around the creature. Reward players who attempt non-violent solutions: lullabies, naming it, leading it somewhere quieter, redirecting its limbs into a new growth direction. Damage scales aggressively only AFTER the first strike against it.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"magical"}'::jsonb),

    -- 26. HEART BELOW THE TREE ------------------------------------------------
    (q_id, 'The Heart Below the Tree',
     'The real Bell Tree extends endlessly downward.', 26, 'narrative', 'wonder',
     'Awe replacing fear, briefly.',
     'They have not been climbing toward the Tree. They have been descending inside it.',
     'No mechanical choice — atmosphere only.',
     ARRAY['crystalline roots pulsing','thousands of bells beneath the earth','overlapping voices','different rhythms'],
     'slow',
     E'[NARRATOR]\nYou descend into the deepest chamber. And finally see: the Bell Tree above ground is only the surface. The true structure extends endlessly downward. Crystalline roots pulse through darkness. Thousands of bells hang beneath the earth. All ringing. Different voices. Different rhythms.',
     E'No combat. No rolls. Sit with the scale of it. Let the table go quiet.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"magical","time_of_day":"midnight"}'::jsonb),

    -- 27. THE FINAL QUESTION --------------------------------------------------
    (q_id, 'The Final Question',
     'A crystalline bell. A fractured Shard inside. One question.', 27, 'event', 'wonder',
     'A decision that does not feel solvable.',
     'No answer is right. The asking is the point.',
     'Debate. Decide. Or refuse to answer.',
     ARRAY['the crystalline bell','the fractured Shard inside it','one final strike','total silence'],
     'slow',
     E'At the center: a massive crystalline bell. Inside: a fractured Shard.\n\n[BELL — strike one final time. Silence.]\n\n[NARRATOR — THE TREE]:\n  "WHAT SHOULD BE ALLOWED TO REMAIN?"\n\nNo correct answer. Allow the players to debate.',
     E'There is no mechanical resolution. Let the party argue. Reward genuine debate with narrative weight. The Tree does not respond. The silence is the response.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"magical"}'::jsonb),

    -- 28. TOUCHING THE SHARD --------------------------------------------------
    (q_id, 'The Shard',
     'Vision cards. Something far away just felt it move.', 28, 'event', 'mysterious',
     'A secret pressed into the palm.',
     'The Shard is not alone — and others now know it has moved.',
     'Which player touches it first, and what they share.',
     ARRAY['the Shard, cold and humming','a vision in the hand','a bell ringing somewhere very far away','grey ash falling from nothing'],
     'medium',
     E'When touched:\n\n[DM ACTION] Hand each player a written vision card:\n  • drowned cities\n  • black towers\n  • glass deserts\n  • impossible staircases\n  • (additional regional vision cards at DM''s discretion)\n\nThen:\n\n[BELL — strike again. Far away. Something else felt the Shard move.]',
     E'Players may share their vision aloud or keep it private. Encourage hesitation. Whatever they share now will resurface in future quests. Add this Shard to the quest''s referenced_shards if the table consents to carry it.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"magical"}'::jsonb),

    -- 29. FINAL SCENE — EIDON AT THE TREE LINE --------------------------------
    (q_id, 'Final Scene — Eidon at the Tree Line',
     'A last sentence. No farewell.', 29, 'narrative', 'melancholy',
     'A door closing softly on a much larger room.',
     'Whatever the party just did was the smallest part of the problem.',
     'There is no choice here. Let it land.',
     ARRAY['Eidon already there','his bare feet in the grass','no surprise on his face','the silence after he speaks'],
     'slow',
     E'[NARRATOR AS EIDON]\nWaiting near the tree line. Quietly:\n\n  "The Bell Tree was never the strangest part."\n\n[Long pause.]\n\n  "It''s just the first thing most people notice."',
     E'No follow-up. He does not wave. He does not leave. He simply stops being relevant.',
     ARRAY[]::uuid[], 'prepared',
     '{"lighting":"dim"}'::jsonb),

    -- 30. END OF SESSION ------------------------------------------------------
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
     '{"lighting":"dim"}'::jsonb);

    RAISE NOTICE 'Re-seeded % scenes for quest %', (SELECT COUNT(*) FROM public.quest_scenes WHERE quest_id = q_id), q_id;
END $$;
