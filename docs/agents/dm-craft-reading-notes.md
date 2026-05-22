# DM Craft — Reading-List Gap Analysis

*Source: Sly Flourish, "A DM's Reading List" (slyflourish.com/dms_reading_list.html,
2021-01-25), plus the canonical articles & books it points to. This document
extracts the **techniques and concepts not currently encoded** in the Everloop
quest engine, and maps each one to a concrete adoption hook in the codebase.*

Scope note: the existing `lib/dnd-rules/` engine assimilates **mechanical** D&D
5e (SRD/Basic Rules/EE Companion) — actions, conditions, combat math, rest,
spellcasting, encounter XP, monster CR. It does **not** assimilate **adventure-
design craft** — how to structure a quest, how to prep without burnout, how to
keep play non-linear, how to translate genre tone into mechanics. That is the
gap this note targets.

---

## 1. Lazy DM Prep Checklist (Return of the Lazy Dungeon Master, Mike Shea)

**Concept.** Eight prep steps in priority order. Skip any you don't need; never
prep more than you must.

1. Review the characters (bonds, flags, unresolved threads).
2. Create a strong start (the *first scene* must hook in 5 minutes).
3. Outline potential scenes (5–10 bullets, not scripts).
4. Define secrets and clues (~10 facts, location-agnostic).
5. Develop fantastic locations (3 evocative details per place).
6. Outline important NPCs (name, want, secret, 1-line voice).
7. Choose relevant monsters.
8. Select magic item rewards.

**Gap in Everloop.** Quest Builder currently asks for scenes + monsters but has
no first-class field for *secrets/clues*, *NPC wants*, *location details (3-up)*,
or *strong start*. Prep is monolithic, not checklist-driven.

**Adoption hook.**
- Extend [lib/dnd-rules/scene-templates.ts](lib/dnd-rules/scene-templates.ts) with
  a `LazyPrepChecklist` constant (the 8 steps as ordered prep-task records).
- Add columns / JSONB keys on the quest row:
  `secrets_and_clues TEXT[]`, `strong_start TEXT`, `fantastic_locations JSONB`,
  `npc_wants JSONB`. (Use JSONB to avoid migration churn.)
- Quest Builder UI: render the 8 steps as collapsible accordion sections, each
  with a "skip" toggle, mirroring Shea's "prep only what you need."

---

## 2. Secrets & Clues as Location-Agnostic Facts (Lazy DM, Justin Alexander's
"Three Clue Rule")

**Concept.** Write ~10 secrets the players *could* learn. Do **not** bind them
to scenes — drop the next available secret whenever the players investigate
*anything*. Every important conclusion has at least 3 paths to it.

**Gap.** Scenes own their content; there is no "floating clue pool" the GM can
dispense ad-hoc.

**Adoption hook.**
- New table `quest_secrets` (id, quest_id, content, discovered_in_scene_id NULL,
  weight INT, tags TEXT[]).
- Quest Play UI: a "Reveal a Secret" button that surfaces the next undiscovered
  secret, optionally filtered by tag.

---

## 3. Pointcrawl (Sly Flourish, "Crawling Without Hexes")

**Concept.** Replace hex-by-hex travel with a graph of named locations (nodes)
and connections (edges) annotated with travel cost / hazard. Better for
narrative pace than hexcrawl, better for player agency than railroad.

**Gap.** Everloop map system has region polygons and labels but no
quest-scoped pointcrawl graph. Travel between scenes is implicit.

**Adoption hook.**
- New table `quest_points` (id, quest_id, x, z, label, kind ∈ {hub, danger,
  resource, mystery, locked}).
- New table `quest_point_edges` (from_id, to_id, travel_time_hours, hazard_tag,
  reveal_requirement TEXT NULL).
- See repo memory `/memories/repo/map-system-architecture.md` for the existing
  label/overrides infrastructure — pointcrawl should reuse the same coordinate
  space.

---

## 4. Xandering / Jaquaying the Dungeon (Justin Alexander, The Alexandrian)

**Concept.** A non-linear dungeon has (a) multiple entrances per level,
(b) loops, (c) elevation/verticality, (d) optional and secret paths,
(e) faction-controlled sub-zones. Measured by a *Melan diagram* — a flow graph
showing branching factor of the layout.

**Gap.** Quest scenes are stored as an ordered list. There is no scene graph,
no concept of multiple-entry, no loop detection.

**Adoption hook.**
- Promote `quest_scenes.next_scene_id` (if present) to a join table
  `quest_scene_edges (from_scene_id, to_scene_id, condition TEXT, kind ∈
  {primary, secret, shortcut, fail, branch})`.
- Quest Builder map view: render scenes + edges as a Melan diagram; warn if the
  graph is linear (degree-1 nodes only).

---

## 5. Adventure Fronts & Dangers (Dungeon World, Sage LaTorra & Adam Koebel)

**Concept.** A *front* is an antagonist force with goals, doom moves, and
progress clocks. Each front contains *dangers* (NPCs, factions, monsters,
phenomena). Doom advances on a clock when the players don't act.

**Gap.** Everloop has world_events and shard_events but no per-quest active
antagonist clocks. Threats don't *advance* during play.

**Adoption hook.**
- New table `quest_fronts` (id, quest_id, name, agenda, doom_text, clock_segments
  INT, clock_filled INT, current_move TEXT).
- New table `quest_front_moves` (id, front_id, trigger TEXT, effect TEXT,
  sort_order INT).
- Hook into the existing `lib/combat-tracker.ts` end-of-round event to advance
  the doom clock if a configured trigger fires.

---

## 6. Soft Moves vs Hard Moves (Dungeon World)

**Concept.** When a player fails or rolls partial, the GM makes a *move*. Soft
moves foreshadow consequence ("the ice cracks under you"); hard moves deliver
it ("you fall through"). Move catalog is small, ~15 items, genre-flavored.

**Gap.** No move catalog. GM has no curated list of escalation reactions.

**Adoption hook.**
- Add `lib/dnd-rules/gm-moves.ts` with two arrays: `SOFT_MOVES`, `HARD_MOVES`,
  each item `{ id, label, when_to_use, example }`. Source the 16-item Dungeon
  World list, adapted to 5e tone (replace "deal damage" with "trigger a save",
  etc.).
- Atmosphere/Lore Chat UI: surface a "Make a Move" dropdown when the player
  fails a roll.

---

## 7. GM Intrusions (Numenera / Cypher System, Monte Cook)

**Concept.** GM may force a complication on a player; the player accepts
(gets XP, here a Shard-fragment token) or refuses (spends XP). Codifies the
"yes, but…" / "no, and…" reflex.

**Gap.** No intrusion mechanic. All complications are GM fiat with no token
exchange.

**Adoption hook.**
- New table `quest_intrusions` (id, quest_id, player_id, scene_id,
  complication TEXT, accepted BOOLEAN, token_awarded BOOLEAN).
- Tie token rewards to the existing Shard / idol economy (see
  `/memories/repo/shard-system-architecture.md`).

---

## 8. Icons & Relationships + Escalation Die (13th Age, Heinsoo & Tweet)

**Concept.**
- **One Unique Thing**: each PC declares a single setting-warping fact about
  themselves at character creation.
- **Icons**: ~13 setting-defining NPCs; each PC has positive / conflicted /
  negative relationships. Pre-session, roll one d6 per relationship; 6s = boon,
  5s = boon-with-complication. Drives organic plot hooks.
- **Escalation Die**: starts at 0, +1 per combat round, added to PC attack
  rolls. Combats end faster, late rounds feel desperate.

**Gap.** Everloop has Anchors / regions / factions which *are* effectively
icons, but PCs do not declare relationships to them, and there is no escalation
die in the combat tracker.

**Adoption hook.**
- Extend the player character schema (see `types/player-character.ts`) with:
  - `unique_thing TEXT`
  - `icon_relationships JSONB` — `[{ icon_id, value: +3..-3 }]`, sum ≤ 3.
- Pre-session API route: roll the relationship dice and return story-hook
  prompts.
- `lib/combat-tracker.ts`: add `escalationDie: number` to the tracker state,
  increment at start-of-round, expose to attack-roll helpers.

---

## 9. Beat-Based Scene Structure (Hamlet's Hit Points, Robin D. Laws)

**Concept.** Every scene is one of two beats:
- **Procedural** (overcome an obstacle): Up or Down.
- **Dramatic** (resolve an emotional question): Up or Down.

Plus seven sub-types (Gratification, Anticipation, Bringdown, etc.). Pacing
target: alternate Up/Down to avoid monotony.

**Gap.** Scene templates in [lib/dnd-rules/scene-templates.ts](lib/dnd-rules/scene-templates.ts) categorize by *content* (combat, social, puzzle) but not by *beat valence*.

**Adoption hook.**
- Add `beat_kind ∈ {procedural, dramatic}` and `beat_valence ∈ {up, down}` to
  each scene template + scene row.
- Quest Builder linter: warn if 3+ consecutive scenes share the same valence.

---

## 10. Player Types (Robin's Laws of Good Game Mastering)

**Concept.** Seven player archetypes: Power Gamer, Butt-Kicker, Tactician,
Specialist, Method Actor, Storyteller, Casual Gamer. Effective DMs serve at
least one beat per type per session.

**Gap.** Player Deck stores characters but not player preferences.

**Adoption hook.**
- Add `play_style TEXT[]` (multi-select) to the profiles table.
- Quest Builder analysis pass: given the joined party's play_styles, report
  which archetypes are under-served by the current scene list.

---

## 11. Yam-Shaped Adventure Design (Sly Flourish)

**Concept.** Narrow start → sandbox middle → narrow climax. Most published
WotC modules follow this (Phandelver, Icespire Peak, Curse of Strahd, Tomb of
Annihilation). Avoids "open world paralysis" while preserving agency.

**Gap.** No structural shape validation in Quest Builder.

**Adoption hook.**
- Add `quest.shape ∈ {linear, yam, sandbox, funnel, branch}` enum on the
  quest row.
- For `shape = 'yam'`, the builder UI groups scenes into three buckets:
  *Opening* (1–2 scenes), *Middle* (3–8 scenes, presented as a node graph),
  *Climax* (1–2 scenes).

---

## 12. Doom Clocks, Miseries, Omens (Mörk Borg)

**Concept.**
- **Miseries**: setting-wide doomsday counters (7 prophecies; when all 7 fire,
  the world ends).
- **Omens**: per-player luck tokens, spent for re-rolls or auto-success on
  small things.
- **Calendar of Nechrubel**: each day, roll to advance a misery.

**Gap.** Everloop has the Fray / Shards mythology that *should* feed exactly
this kind of doomsday counter — but no mechanical counter exists.

**Adoption hook.**
- Extend `world_state` (see `/memories/repo/world-state-system.md`) with a
  `fray_omens JSONB` array — each entry `{ id, prophecy_text, fulfilled_at }`.
- Quests can advance / forestall individual omens via `world_events`.
- Player Deck: each PC carries 1–3 *omen tokens* spendable mid-quest.

---

## 13. Oracle Tables + Vows (Ironsworn, Shawn Tomkin)

**Concept.**
- Players make *Vows* (rank-tiered objectives) and progress them by completing
  *bonds*-relevant scenes.
- Solo / GM-less play is supported by *Oracle tables* — d100 lookups for
  "Action + Theme", "Region + Descriptor", "Plot Twist", etc.
- Move-based resolution (Strong Hit / Weak Hit / Miss).

**Gap.** No vow mechanic; no oracle generation for solo Quest play. Everloop
already has AI lore-chat which could *be* the oracle.

**Adoption hook.**
- New table `quest_vows` (id, quest_id, player_id, text, rank ∈ {troublesome,
  dangerous, formidable, extreme, epic}, progress INT, fulfilled BOOLEAN).
- Vows count toward existing XP / Shard rewards.
- AI lore-chat: expose `/oracle action`, `/oracle theme`, `/oracle twist`
  slash-commands that return Ironsworn-style two-word seeds.

---

## 14. Fronts of Faction Play / Aspects & Compels (Fate Condensed)

**Concept.** Every character, scene, and NPC has *aspects* — short evocative
phrases ("In Over Her Head", "The Bell Still Tolls"). Compels: GM offers a Fate
point for following an aspect's trouble; invokes: player spends a Fate point to
get +2 / re-roll when an aspect helps.

**Gap.** Character sheets have stats but no aspects or evocative tags.

**Adoption hook.**
- Add `aspects TEXT[]` to `player_characters` and `canon_entities` (location +
  character kinds). Cap at 5.
- Tie Fate-point economy to the existing Shard fragment token (so we don't
  proliferate currencies).

---

## 15. Encounter Density & Branching (MT Black, "Anatomy of an Adventure")

**Concept.** Published one-shots target ~5–7 encounters per 4-hour session
(mix: 2 combat, 2 social, 1 exploration, 1–2 wildcards). Branch points every
2 scenes minimum. "Failure = forward" (a bad outcome still advances the plot).

**Gap.** Encounter density isn't surfaced or validated.

**Adoption hook.**
- Quest Builder linter pass:
  - Count scenes by `kind`; warn if combat > 50% or social = 0.
  - Compute longest linear chain in the scene-edge graph; warn if > 2.
  - Flag scenes whose only outcome is "GM decides" — every scene needs at
    least one success branch and one failure branch.

---

## 16. The False Hydra (Goblin Punch, Arnold K.)

**Concept.** A long-necked horror whose song erases its existence from
memory. Players notice empty chairs, gaps in routine, half-remembered names.
Pure environmental dread — no fight unless the song is broken.

**Why it matters for Everloop.** Per `AGENT.md` §1, monsters in Everloop are
fragments of the Drift leaking through fractured reality. The False Hydra is
the *exact* design pattern for "monster as consequence" — its threat is the
hole it leaves in the Pattern, not its stat block.

**Adoption hook.**
- Add a `monster_class ∈ {drift_leak, broken_combination, pattern_wound,
  conventional}` field on canon `creature` entities.
- For `drift_leak` monsters, the Quest Builder requires a `reality_break`
  field — *what about local reality broke to let this in?* — surfaced in the
  print pipeline as a boxed sidebar.

---

## 17. Random-Table Density (Dungeon Alphabet, Dungeon Dozen, Tome of
Adventure Design)

**Concept.** Veteran adventure designers cite curated random tables (d20–d100)
as the single highest-yield prep tool. Categories: dungeon dressing, weird
NPCs, treasure quirks, magical effects, weather, rumors, oddities.

**Gap.** Everloop has AI-generated text but no deterministic random tables.
AI output isn't seeded by mechanical constraints.

**Adoption hook.**
- New table `random_tables` (id, name, category, dice ∈ {d6, d20, d100}).
- New table `random_table_entries` (table_id, roll_value, content TEXT).
- Seed with: "100 oddities in an Everloop archive", "20 broken-reality omens",
  "20 NPC quirks for Bellroot", etc. Generate via AI, store deterministically.
- Atmosphere Engine pulls from these tables when a scene loads, instead of
  re-rolling AI text each time.

---

## 18. Print-Ready Modules (DDEX/Homebrewery grammar — already partially
adopted)

The existing [lib/quest-print.ts](lib/quest-print.ts) and
[lib/dnd-rules/scene-templates.ts](lib/dnd-rules/scene-templates.ts) cover the
DDEX scene grammar. Remaining gap from the reading list:

- **Stat block sidebars**: scenes that reference a creature should auto-embed
  a Homebrewery-style stat block, not just a name.
- **Boxed treasure tables**: itemized rolls, not prose.
- **Cover-page metadata**: APL (Average Party Level), expected duration,
  content warnings — all surfaced in the print pipeline header.

---

## Prioritization (recommended next 3 features)

| Rank | Feature | Cost | Yield |
|------|---------|------|-------|
| 1 | Secrets & Clues pool (§2) + Lazy Prep checklist (§1) | Small (1 table, builder accordion) | High — directly improves every quest |
| 2 | Scene-graph + Xandering linter (§4) + Beat-valence (§9) | Medium (schema migration, graph render) | High — kills linearity & monotony |
| 3 | Fronts + Doom Clocks (§5) + Miseries (§12) | Medium (2 tables, combat-tracker hook) | High — gives the Fray mechanical teeth |

Everything else can layer on incrementally.

---

## 19. Kelsey Dionne — 7-Step Adventure Design (The Arcane Library)

**Concept.** A repeatable, friction-minimized pipeline:

1. **Develop an urgent problem** only the PCs can solve.
2. **Killer hooks** — the inciting event happens TO/AROUND the PCs (not off-screen) and appeals to *reward*, *heroism*, or *discovery* (≥2 ideally).
3. **Outline hurdles** — define the final encounter first (both success AND failure states), then bridge with 6–8 varied encounters.
4. **Design a great map** — loops, interactive rooms, elevation; mental-test combat rooms before locking them in.
5. **DM-friendly writing** — bullets, bolding, sensory hooks, one page per room.
6. **Layout & art** — one encounter per page; consistent style; strongest art on the cover.
7. **Legal & attribution** — SRD/OGL/CC vs DMs Guild routing; credit every artist.

**Gap in Everloop.** Quest Builder has no explicit step-pipeline UI. Writers aren't guided through this order; nothing forces final-encounter-first.

**Adoption (LANDED).** New module [lib/dnd-rules/adventure-design.ts](lib/dnd-rules/adventure-design.ts) exports `ADVENTURE_STEPS` with `outputs[]` per step. The Builder can render this as a 7-step wizard and gate progression on each step's outputs being populated. Re-exported via [lib/dnd-rules/index.ts](lib/dnd-rules/index.ts).

---

## 20. Kelsey Dionne — EPIC Encounter Framework

**Concept.** Every encounter needs all four:
- **E**nticement — a sensory reason to engage (treasure glint, weird sound, captive, faint secret door).
- **P**ressure — a timer or worsening condition the PLAYERS can see, not just the characters.
- **I**nteraction — 4+ things to do; spotlight a class; reward alternate approaches.
- **C**onsequences — real success / failure / walk-away outcomes; no plot armor.

**Gap.** Scene templates capture *content type* but never ask "what is the timer?" or "what's the enticement on approach?"

**Adoption (LANDED).** `EPIC_ELEMENTS` table with prompts + anti-patterns per element. `lintEpic(draft)` returns errors for missing enticement / undefined consequences and warnings for no pressure or thin interaction. Builder can block "publish" if any scene has an EPIC error.

---

## 21. Hurdles-Based Design + Encounter-Variety Linter

**Concept (Kelsey).** Imagine you're playing your own adventure. Where does the PC hit a roadblock? That's the next hurdle. Target 6–8 hurdles; rotate combat / social / exploration; spotlight every class.

**Adoption (LANDED).** `DEFAULT_HURDLE_RHYTHM` — Kelsey's exact 8-slot reference rhythm. `lintEncounterList(list)` flags:
- Monotony (back-to-back same kind)
- Missing kinds (no combat / no social / no exploration-like)
- Missing class spotlights (fighter / rogue / wizard / cleric)
- Too few (< 6) or too many (> 10) encounters

---

## 22. Hook Appeal Taxonomy

**Concept.** A hook earns its slot by appealing to **reward**, **heroism**, or **discovery** — ideally ≥ 2 — and by placing the inciting action *on* or *next to* the PCs.

**Adoption (LANDED).** `HookSpec` type + `scoreHook()` returns 0–3. Builder warns if `< 2`. Stored as `quest.hook = { appeals[], proximity, inciting_action }`.

---

## 23. Worlds Without Number — Sandbox Tags (Kevin Crawford)

**Concept.** Two short evocative phrases per location act as conflict seeds. They surface "what's wrong here" without prescribing a plot.

**Adoption (LANDED).** `SANDBOX_TAGS` — 45 curated two-word seeds (Hollow Throne, Salted Earth, Twin Prophets, Sleeping Power, …). `rollSandboxTags(rng, count)` is deterministic when given a seeded RNG. Map admin can roll 2 tags per region/location, store on `canon_entities.lore_tags`.

---

## 24. The Monsters Know What They're Doing — Tactical Archetypes (Keith Ammann)

**Concept.** Monsters are not statistically neutral damage sponges. Each behaves to its biology and ecology: ambush predators flee on failed surprise; brutes ignore retreat; artillery casters target spellcasters first; pack hunters break morale at 50% pack remaining.

**Adoption (LANDED).** `MonsterTactic` enum + `MONSTER_TACTICS` registry with `priorities[]` and `morale_break` per archetype: `ambush_predator`, `pack_hunter`, `brute`, `caster_artillery`, `skirmisher`, `guardian`, `social_predator`, `mindless`. Add `tactic: MonsterTactic` column to `canon_entities` (creature kind) — included in the printed stat block sidebar so the DM has a 3-line tactics card per monster.

---

## 25. Tome of Adventure Design — Plot Hook Taxonomy (Matt Finch / Mythmere)

**Concept.** Most adventures fit one of ~12 hook archetypes. Naming the archetype gives the writer a template and the reader a genre expectation.

**Adoption (LANDED).** `PlotHookKind` enum (theft, rescue, investigation, escort, destruction, recovery, infiltration, survival, diplomacy, exorcism, discovery, vengeance) + `PLOT_HOOKS` with one fill-in-the-blank template per kind. Quest Builder hook step: dropdown of hook kinds → template auto-populates `inciting_action`.

---

## 26. Official 5E Resources — DMG / Tasha's / Xanathar's

**Contributions.**
- **DMG** — world-building checklists, faction worksheets, multiverse setup.
- **Tasha's** — encounter builder by group makeup, group patrons, session zero framework, puzzle templates.
- **Xanathar's** — random encounter tables by terrain, downtime activities (training, crafting, carousing), name & location generators.

**Gap.** None of these tables are stored deterministically — all flavor is AI-improvised on demand.

**Adoption hook (NOT landed; follow-up).** Seed `random_tables` (proposed in §17) with: `xanathar_terrain_encounter_{arctic..urban}` (d100 each), `xanathar_downtime_activity` (d20), `tasha_session_zero_prompts` (d12), `dmg_faction_goals` (d20), `dmg_faction_quirks` (d20). Mechanical surfaces, not lore — slots under §17's table infrastructure.

---

## 27. The Complete Kobold Guide to Game Design

**Concept.** Anthology of industry essays on pacing, plot structure, NPC motivation, and the *zoom-in/zoom-out* rhythm (alternate close detail with wide-shot world context).

**Adoption hook (NOT landed; follow-up).** "Zoom toggle" in Quest Builder: every scene tagged `zoom ∈ {wide, close}`. Linter warns if 3+ consecutive scenes share zoom level (mirrors the beat-valence linter in §9 but on the spatial axis).

## Sources cited

- Sly Flourish, "A DM's Reading List", 2021-01-25
- Mike Shea, *Return of the Lazy Dungeon Master* (Slyflourish.com)
- Justin Alexander, "Xandering the Dungeon" (thealexandrian.net/wordpress/13085)
- Justin Alexander, "The Three Clue Rule"
- Sage LaTorra & Adam Koebel, *Dungeon World* (fronts, moves)
- Robin D. Laws, *Hamlet's Hit Points*; *Robin's Laws of Good Game Mastering*
- Monte Cook, *Numenera Discovery* (GM intrusions)
- Heinsoo, Tweet, *13th Age* (icons, One Unique Thing, escalation die)
- Pelle Nilsson & Johan Nohr, *Mörk Borg* (miseries, omens)
- Shawn Tomkin, *Ironsworn* (vows, oracles)
- Evil Hat, *Fate Condensed* (aspects, compels)
- Arnold K., "The False Hydra" (goblinpunch.blogspot.com, 2014-04)
- MT Black, "Anatomy of an Adventure"
- *Tome of Adventure Design*; *Dungeon Alphabet*; *The Dungeon Dozen*
- Kelsey Dionne, "How to Write a D&D Adventure, Step by Step" (The Arcane Library)
- Kelsey Dionne, "How to Design EPIC D&D Encounters" (The Arcane Library)
- Wizards of the Coast, *Dungeon Master's Guide*; *Tasha's Cauldron of Everything*; *Xanathar's Guide to Everything*
- Wolfgang Baur et al., *The Complete Kobold Guide to Game Design*
- Kevin Crawford, *Worlds Without Number* (sandbox tags)
- Keith Ammann, *The Monsters Know What They're Doing* (tactical archetypes)

All material referenced under fair use / commentary; no verbatim text copied.
