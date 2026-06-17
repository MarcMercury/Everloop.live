-- =====================================================
-- THE ECHOING VOID — Drift-Born Major Boss
-- Adds a new canonical Monster to the Everloop Archive.
--
-- The Echoing Void is what happens when an Echo stops
-- attaching to others and instead attaches to itself
-- forever — a voice cycling back into itself until nothing
-- remains but smoke, ash, and unresolved will.
--
-- Style/format mirrors The Cleaved and The Starving Silence:
--   • atmospheric prose description (+ "Reason for Breakage" tail)
--   • full D&D 5e monster_stats stat block in extended_lore
--   • everloop_lore binding (what broke / leaked / drawn to)
--
-- Mechanics use the SIMPLIFIED boss rules:
--   Repeat yourself = the boss gets stronger (Loop Charges).
--   Change tactics  = the boss gets weaker  (Break the Loop).
-- =====================================================

DO $$
DECLARE
  admin_id UUID;
  void_id  UUID;
BEGIN
  SELECT id INTO admin_id FROM public.profiles WHERE is_admin = true LIMIT 1;
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'No admin user found in profiles table';
  END IF;

  -- ── Insert the base canon entity (idempotent on slug) ───────
  INSERT INTO public.canon_entities (
    name, slug, type, description, status, stability_rating, created_by, tags, metadata, extended_lore
  ) VALUES (
    'The Echoing Void',
    'the-echoing-void',
    'monster',
    $desc$A towering humanoid absence made of smoke, ash, and compressed emotional residue — a Drift-born horror formed when an Echo stops reaching for others and instead folds inward, attaching to itself forever. It is not a ghost, not a shadow, not a person. It is the shape left behind when identity collapses into recursion: a voice cycling back into itself endlessly, each repetition more distorted than the last, until there is no original voice left — only the loop.

Its body is constantly forming and unforming, as though dozens of versions of the same figure are trying to occupy the same space a heartbeat apart from one another. Its arms stretch too long when reaching. Its movements happen half a moment before and after they actually occur. Its chest is a dark hollow where sound bends inward, and its face is never stable — sometimes it wears the face of the last person who spoke, sometimes the face of someone the watcher most regrets, sometimes nothing at all but a deep trembling void that repeats the last words spoken near it. When struck, the wound does not bleed; it releases voices.

It does not roar. It repeats. And every repetition is slightly worse. The air around it carries whispered fragments in stolen voices — "Again." "You already said that." "You meant something else." "Try again." "No, not that way." "You did this before." — until the listener can no longer tell which words are their own. To stand against it is to be trapped inside a conversation that keeps restarting, where every loop remembers what hurt you the last time.

Reason for Breakage: The Echoing Void forms wherever the Drift wound runs deep enough that thought, emotion, intent, and regret stop being separate things — looped rooms, ruined temples, ash-filled hollows, and broken memory spaces where reality replays itself incorrectly. Vaultkeepers theorise it is the terminal state of an Echo that found no host but its own grief: the Pattern forced to describe a self that only points back at itself, recursion without resolution, a mouth left over after the speaker is gone.$desc$,
    'canonical',
    0.20,
    admin_id,
    ARRAY['monster', 'drift-born', 'boss', 'echo', 'recursion'],
    jsonb_build_object(
      'region', 'drift',
      'category', 'Monsters',
      'created_via', 'echoing_void_seed',
      'monster_purpose', 'campaign',
      'is_one_off', false
    ),
    jsonb_build_object(
      'tagline', 'A voice that folded inward until nothing remained but the loop.',
      'is_user_created', false,
      'region_id', 'drift',
      'is_one_off', false,
      'everloop_lore', jsonb_build_object(
        'what_broke_here', 'A Drift wound deep enough that thought, emotion, intent, and regret stopped being separate things and began to fold inward, repeating until the original was lost.',
        'what_leaked_through', 'An Echo with no host but itself — recursion without resolution, a self that only points back at itself.',
        'drawn_to', 'Repetition. Hesitation. Spoken words, repeated actions, unresolved choices, and grief that keeps circling the same wound.'
      ),
      'monster_stats', jsonb_build_object(
        'size', 'large',
        'creatureType', 'aberration',
        'subtype', 'drift-born recursion',
        'alignment', 'unaligned',
        'role', 'major boss',
        'cr', 10,
        'xp', 5900,
        'proficiencyBonus', 4,
        'hp', 195,
        'hitDice', '17d10 + 102',
        'ac', 16,
        'acSource', 'shifting smoke and overlapping afterimages',
        'movements', jsonb_build_array(
          jsonb_build_object('type', 'fly', 'speed', 30, 'note', 'hover; cannot be knocked prone; its body forms and unforms as it drifts')
        ),
        'abilities', jsonb_build_object('STR', 8, 'DEX', 14, 'CON', 22, 'INT', 12, 'WIS', 20, 'CHA', 14),
        'savingThrows', jsonb_build_object('CON', 10, 'WIS', 9),
        'skills', jsonb_build_array(
          jsonb_build_object('name', 'Perception', 'bonus', 9),
          jsonb_build_object('name', 'Insight', 'bonus', 9)
        ),
        'damageVulnerabilities', jsonb_build_array('thunder', 'radiant'),
        'damageResistances', jsonb_build_array('psychic', 'necrotic'),
        'damageImmunities', jsonb_build_array(),
        'conditionImmunities', jsonb_build_array('charmed', 'frightened', 'exhaustion'),
        'senses', jsonb_build_object('darkvision', 60, 'truesight', 30, 'passivePerception', 19),
        'languages', jsonb_build_array('understands all languages spoken near it but only repeats them back, distorted'),
        'damagePerRound', '~30–40 psychic — designed as a Major Boss encounter for a 4–8 player mid-to-high level party. The real pressure is the Loop economy, not raw damage.',
        'multiattack', 'On its turn the Echoing Void takes ONE boss action: Smoke Strike, Echo Pull, Summon Echoes, or Repeat After Me.',
        'traits', jsonb_build_array(
          jsonb_build_object(
            'name', 'The Loop (Core Mechanic)',
            'description', 'The Void feeds on repetition. Whenever a creature takes the SAME TYPE of action two turns in a row (attack, cast a spell, heal, dash/move away, hide/defend, use an item, or help/interact), the Void gains 1 Loop Charge. When the Void reaches 3 Loop Charges it immediately releases a Loop Burst (see Actions/effects), then resets to 0. Simply put: if the party keeps doing the same thing, the boss punishes them.'
          ),
          jsonb_build_object(
            'name', 'Loop Burst',
            'description', 'When the Void reaches 3 Loop Charges, every player makes a DC 16 Wisdom save. On a failure: 4d8 psychic damage, and the creature loses one of its movement, bonus action, or reaction (player''s choice) until the end of its next turn. On a success: half damage and no other effect. Loop Charges then reset to 0.'
          ),
          jsonb_build_object(
            'name', 'Break the Loop (Weakness)',
            'description', 'When a creature uses a DIFFERENT action type than it used last turn, it disrupts the recursion. Once per turn, the first creature to do so removes 1 Loop Charge from the Void. Change tactics and the boss gets weaker; repeat yourself and it gets stronger.'
          ),
          jsonb_build_object(
            'name', 'Attached Echo',
            'description', 'While an Echo is attached to a player (see Summon Echoes), that player takes no immediate damage, but on their turn — after they choose an action — they roll a d6: 1–3 the action works normally; 4–5 the action targets the nearest creature instead; 6 the action targets the player themselves or simply fizzles. An attached Echo remains until removed. REMOVING IT: (1) Snap Them Out of It — an ally uses an action to shake, slap, or shout the host''s name and makes a DC 14 Wisdom, Medicine, or Persuasion check; on success the Echo is destroyed. (2) Hurt the Host — an ally attacks the attached Echo; the host takes half the damage and the Echo is destroyed. (3) Self-Clarity — the host uses their action to forcefully break the connection, takes 1d6 psychic damage, and the Echo is destroyed.'
          ),
          jsonb_build_object(
            'name', 'Recursive Phases',
            'description', 'PHASE 1 (100%–66% HP): the Void uses only Smoke Strike, Repeat After Me, and the Loop economy — no Echoes yet. PHASE 2 (65%–33% HP): when it drops below 66%, it immediately summons 4 Echoes and unlocks Echo Pull and Summon Echoes. PHASE 3 (32%–0 HP): the Void becomes unstable — at the start of each round it gains 1 Loop Charge automatically, and Echoes now attach when only 2 reach a player instead of 3.'
          )
        ),
        'actions', jsonb_build_array(
          jsonb_build_object(
            'name', 'Smoke Strike',
            'description', 'A reaching arm of smoke and ash lashes out at one creature. On a hit deal 3d8 psychic or necrotic damage (DM''s choice). If the target failed a Wisdom save against the Void last round, this attack deals an extra 2d8 damage.',
            'actionType', 'action',
            'attackBonus', 9,
            'reach', 15,
            'damage', '3d8 psychic or necrotic (+2d8 if target failed a WIS save last round)',
            'targets', 'one creature'
          ),
          jsonb_build_object(
            'name', 'Echo Pull',
            'description', 'The hollow in the Void''s chest bends inward and drags a creature toward it. The target makes a DC 16 Strength or Wisdom save (target''s choice). On a failure the creature is pulled up to 20 ft toward the Void and takes 3d6 psychic damage. On a success it is not moved and takes half damage. Used to break formations and drag players into the Echoes. (Phase 2+.)',
            'actionType', 'action',
            'saveAbility', 'WIS',
            'saveDC', 16,
            'damage', '3d6 psychic',
            'targets', 'one creature',
            'saveEffect', 'not pulled, half damage'
          ),
          jsonb_build_object(
            'name', 'Summon Echoes',
            'description', 'The Void sheds pieces of itself, creating 4 small Echoes. Echoes are weak swarm creatures that each die in one hit and try to surround the players. If 3 Echoes reach the same player (only 2 in Phase 3), one of them attaches (see Attached Echo). (Phase 2+; the Void also summons 4 Echoes automatically when Phase 2 begins.)',
            'actionType', 'action',
            'targets', 'creates 4 Echoes'
          ),
          jsonb_build_object(
            'name', 'Repeat After Me',
            'description', 'The Void''s signature control move. It targets one player, who must make a DC 16 Wisdom save. On a failure, on that player''s next turn they must choose: repeat the SAME action type they used last turn, OR take 2d8 psychic damage to break the loop and act normally.',
            'actionType', 'action',
            'saveAbility', 'WIS',
            'saveDC', 16,
            'damage', '2d8 psychic (only if they break the loop)',
            'targets', 'one creature'
          )
        ),
        'bonusActions', jsonb_build_array(),
        'reactions', jsonb_build_array(),
        'legendaryActions', jsonb_build_object('count', 0, 'description', 'The Echoing Void takes a single boss action on its turn rather than legendary actions — keep the action economy simple and let the Loop mechanic carry the pressure.', 'actions', jsonb_build_array()),
        'tactics', 'The Echoing Void does not hunt bodies — it hunts patterns. It uses Repeat After Me to lock a player into a predictable loop, then waits for the Loop Charges to build toward a Loop Burst. In Phase 2 it uses Echo Pull to drag isolated or formation-anchored players into its summoned Echoes. It pressures the player who keeps repeating the same action and ignores anyone who keeps changing tactics — because they are actively weakening it. It is most dangerous when the party panics and everyone defaults to attacking every round.',
        'weaknesses', jsonb_build_array(
          'Thunder and radiant damage tear through its recursion — it is vulnerable to both, especially effects tied to sound, bells, light, or truth.',
          'Break the Loop: any creature that uses a different action type than it used last turn removes 1 Loop Charge from the Void (once per turn). Varying tactics directly starves it.',
          'Striking after breaking a loop: an attack made on the same turn a creature breaks out of Repeat After Me or an Attached Echo lands with extra force — the DM may grant +1d4 damage or advantage on that attack.',
          'It is resistant to repeated attacks, fear, charm, and illusions built on false identity. Predictability feeds it; only interruption — silence, reflection, true naming, honesty, and unexpected action — actually hurts it.'
        ),
        'regionId', 'drift',
        'isOneOff', false,
        'whatBrokeHere', 'A Drift wound deep enough that thought, emotion, intent, and regret stopped being separate things and began to fold inward, repeating until the original was lost.',
        'whatLeakedThrough', 'An Echo with no host but itself — recursion without resolution, a self that only points back at itself.',
        'drawnTo', 'Repetition, hesitation, spoken words, repeated actions, unresolved choices, and grief that keeps circling the same wound.'
      )
    )
  )
  ON CONFLICT (slug) DO UPDATE
    SET status        = 'canonical',
        description   = EXCLUDED.description,
        extended_lore = public.canon_entities.extended_lore || EXCLUDED.extended_lore,
        metadata      = public.canon_entities.metadata || EXCLUDED.metadata,
        tags          = EXCLUDED.tags,
        updated_at    = NOW()
  RETURNING id INTO void_id;

  RAISE NOTICE 'Seeded The Echoing Void (id: %)', void_id;
END $$;

-- Refresh PostgREST schema cache so the new row is immediately visible.
NOTIFY pgrst, 'reload schema';
