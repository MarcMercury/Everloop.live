# 2026-06-01 — Bell Tree DM Module Sync + Live-Play Mechanics

## Goal

Sync the existing seeded quest **"The Bell Tree and the Broken World"**
with the latest version edited outside the app
(`docs/DandDcontext/Bell Tree DM Module.pdf`), and extend the Quest Builder
itself so it understands the new live-play mechanics introduced by that module.

## What changed

### 1. Database migration
`supabase/migrations/20260601_001_bell_tree_dm_module_sync.sql`

- **`canon_entities` (`the-starving-silence-mon8e28l`)** — installed full D&D 5e
  stat block in `extended_lore.monster_stats`: CR 8, 150 HP, AC 16,
  Obsidian Slam / Shard Lash / Silent Scream, plus the new
  **Sound Meter**, **Feed on Sound**, **Impossible Silence**, and
  **Quiet** weakness traits straight from the PDF.
- **`quests.metadata.liveplay`** — populated quest-level live-play config:
  `bell_sequence` (5-note), `sound_meter`, `redirect_die` (auto-scaled by
  player count), `npc_reset_triggers`, `hidden_mechanics`, `scene_callbacks`,
  `narrator_dm_battle_concept`.
- **`quest_scenes`** — DELETE + INSERT of all 30 scenes for the quest, with
  per-scene `metadata.live_play` blocks (bell setup, sound meter, redirect
  die, presentation, callback wiring, escalation strikes, hidden mechanics).
  Removed the old Speaking Roots / Birth Giant scenes (no longer in the
  module); added Eidon's 11-slide cosmology presentation, the Gorge Descent,
  Echo Battle #2, the reshaped Memory Gate (5-bell callback puzzle), the
  Chamber of Silence approach, and the final-question callback to
  Mayor's Note #1.
- Ends with `NOTIFY pgrst, 'reload schema';` per
  `/memories/supabase-grants.md`.

### 2. Type system — `types/quest.ts`
New interfaces (all stored in JSONB, not new columns):
- `BellSequenceConfig`, `SoundMeterConfig`, `RedirectDieConfig`
- `NpcResetTrigger`, `HiddenMechanicDoc`, `SceneCallback`
- `EscalationFailureConfig`, `ScenePresentation`
- `LivePlayConfig` — quest-level, stored at `quests.metadata.liveplay`
- `SceneLivePlay` — scene-level, stored at `quest_scenes.metadata.live_play`

Also added `metadata?: Json` to `QuestSceneInsert` and `QuestSceneUpdate`
so the Quest Builder can persist live-play config through the existing
`createScene` / `updateScene` server actions without API changes.

### 3. UI — Quest Builder
- **`app/quests/[slug]/page.tsx`** — new **Live-Play Briefing** panel
  (only renders if `metadata.liveplay` exists). Shows required props,
  bell sequence, sound meter, redirect die table, NPC reset cues,
  scene callbacks, hidden mechanics (DM-only block), and the
  narrator/DM battle concept. Every scene row in the scene list now
  shows compact icon badges for: bell intro, sound meter, redirect die,
  presentation, callback, hidden mechanic, n-strike escalation.
- **`app/quests/[slug]/scenes/scene-builder-client.tsx`** — new
  collapsible **Live-Play Mechanics** section in the New Scene form.
  Lets the DM toggle hidden mechanics / bell intro / sound meter /
  redirect die, configure escalation-failure strikes + per-strike +
  final-strike consequences, add an NPC presentation (slide count +
  titles), define an NPC reset trigger, list required props,
  and wire callback source/setup slug links. On save it persists to
  the scene's `metadata.live_play` block.

## Verification

Ran a one-off SQL probe (via Supabase Management API) confirming:
- 30 scenes present, ordered correctly
- `quests.metadata.liveplay` has all 10 expected keys
- `the-starving-silence-mon8e28l.extended_lore.monster_stats` returns
  CR 8 / 150 HP / Sound Meter traits

`get_errors` reports clean across all three modified TS files.

## Pitfalls / decisions

- **Why JSONB instead of new columns**: live-play features are evolving and
  some are quest-specific. Putting them under `metadata.liveplay` /
  `metadata.live_play` keeps the schema stable and matches the project's
  existing pattern (e.g. `narrative_settings.narrator_config`).
- **Scene callbacks use slugs, not UUIDs**: `quest_scenes` doesn't have a
  unique slug column, so callbacks live in `metadata.slug` for each scene
  and references in `metadata.live_play.callback_source` /
  `callback_setup` are slug-based. This survives reseeding.
- **Delete-then-insert for scenes**: the existing seed had 17 scenes that
  no longer matched the module; an UPSERT by title/order would have left
  orphaned old scenes. Full replacement is safe here because no live
  sessions reference this quest yet (DM-only build).
