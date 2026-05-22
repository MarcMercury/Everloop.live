# Quest Unification — 2026-05-22

**Goal:** Collapse the Campaign + Quest split into a single, quest-based playing arena.
Every play construct is a **Quest**: independent, individually playable, no rolling-up to campaigns.

## User Decisions (locked)

1. **PDF ingestion:** Extract ALL PDFs in `docs/DandDcontext/` to text. Done via
   `pdftotext -layout` → `docs/DandDcontext/extracted/*.txt` (23 files).
2. **Merge strategy:** Hard merge. Campaign UI/routes are to be deleted; Quest is the
   sole user-facing construct.
3. **First-pass deliverables (all five):**
   - Unified Quest data model + Quest Builder UI
   - Rules/actions assimilation (combat, conditions, spellcasting hooks, rest)
   - Printable Quest PDF export
   - Map generation hook in the Quest Builder
   - Nav/route cleanup (campaigns → quests)

## Architecture Decision: alias-not-rename for DB tables

The campaign tables already encode 95% of what a "fat quest" needs (scenes, sessions,
dice rolls, NPCs, idols, messages, atmosphere, triggers). The current `quests` /
`quest_participants` tables are thin shells.

**Decision:** Do NOT rename `campaigns` → `quests` at the DB layer in this pass.
Renaming 8 tables + foreign keys + RLS policies + indexes mid-flight is high-risk
and irreversible without downtime. Instead:

- DB tables keep `campaigns*` naming internally.
- All **user-facing UI, routes, and labels** become Quest.
- The thin `quests` / `quest_participants` tables are deprecated (kept for shard
  back-refs via `shard_events.quest_id`, `world_events.source_quest_id`).
- A future migration (planned in `supabase/migrations/PENDING_quest_rename.sql`)
  can do the physical rename once the UI churn settles.

## What shipped this turn

### New: D&D rules engine — `lib/dnd-rules/`
Pure data + helpers derived from SRD 5.1, Basic Rules 2018, and EE Player's Companion.
Used by Quest Builder + Quest Play to validate actions, look up conditions, compute
encounter difficulty, etc.

- `actions.ts` — Attack, Dash, Disengage, Dodge, Help, Hide, Ready, Search,
  Use an Object, Cast a Spell, Improvised; bonus actions, reactions, opportunity attack.
- `conditions.ts` — all 15 conditions with effects.
- `combat.ts` — initiative, attack rolls, damage, crits, saves, advantage rules,
  cover, opportunity attacks.
- `rest.ts` — short rest / long rest mechanics.
- `spellcasting.ts` — slots, components (V/S/M), concentration, ritual, counterspell.
- `encounters.ts` — XP thresholds by level/difficulty, encounter math, monster CR table.
- `scene-templates.ts` — DDEX/Homebrewery structural patterns: boxed text → setup →
  encounter → outcomes/branches.
- `index.ts` — barrel.

### New: Quest print pipeline
- `lib/quest-print.ts` — converts a quest (campaign row + scenes + npcs + idols)
  into printable HTML matching DDEX/Homebrewery layout: cover, table of contents,
  boxed read-aloud text, scene cards, stat blocks, treasure tables.
- `app/api/quests/[id]/print/route.ts` — `GET` returns print-ready HTML; browser
  print-to-PDF produces the playable handout. PDF generation via Puppeteer is a
  follow-up if/when needed.

### New: Map generation hook
- `app/api/quests/[id]/map/route.ts` — `POST` triggers map generation for a quest
  scene via existing image/Meshy pipeline. Returns map URL stored on the scene.

### New: Unified Quest Builder entry
- `components/quests/quest-builder.tsx` — composed page that absorbs the campaign
  forge settings (length, tone, difficulty sliders, idol system, immersion,
  character rules), plus scene flow + print/map buttons.
- `app/quests/build/page.tsx` — landing for "Create a Quest" that uses the absorbed
  builder.

### Nav + redirect
- `components/navbar.tsx` — removed `/campaigns` link from the Play dropdown.
  Quests becomes the only play-construct entry. Player Deck and Player's Guide remain.
- `next.config.mjs` — permanent redirects from `/campaigns` and `/campaigns/...` to
  `/quests` and `/quests/...` so existing campaign URLs continue to resolve while
  the underlying `app/campaigns/*` directory is being decommissioned.

## What is NOT done (follow-up tasks)

These are mechanical-but-risky moves that need their own focused pass to keep the
build green. They are tracked here for the next agent.

1. **Physical file move** `app/campaigns/**` → `app/quests/**` (mirror DM, play,
   scenes pages). Each moved file has Campaign-labeled UI text that must be
   relabeled to Quest. Imports of `Campaign`-named types stay (types are aliased
   in `types/quest.ts` — see below). This is ~7 page files.
2. **Component move** `components/campaign/**` → `components/quests/**`. Update all
   import paths (atmosphere-engine, dice-roller, lore-chat, campaign-flow-builder).
3. **`types/quest.ts`** — barrel re-export of `types/campaign.ts` with Quest-named
   aliases (`Quest = Campaign`, `QuestScene = CampaignScene`, etc.). Once consumers
   are migrated, mark `types/campaign.ts` as deprecated.
4. **`lib/actions/quests.ts`** — absorb every function from `lib/actions/campaigns.ts`
   under quest-named exports (`createQuest`, `joinQuest`, `startQuestSession`, …).
   Old `lib/actions/campaigns.ts` becomes re-exports for back-compat then deleted.
5. **Dashboard / Roster / cross-references** — replace `campaign`/`campaignCount`
   surfaces with `quest`/`questCount`. Backed by same DB but UI label changes.
6. **Apply** `supabase/migrations/PENDING_quest_rename.sql` once UI is green:
   renames `campaigns` → `quests_v2`, etc., or drops the thin `quests` table and
   renames `campaigns` → `quests`. Decide at apply time.
7. **Monster wizard** — `components/editor/monster-campaign-wizard.tsx` →
   `monster-quest-wizard.tsx`; route `app/create/monster/campaign/page.tsx` →
   `app/create/monster/quest/page.tsx`.

## Pitfalls observed

- `shard_events.campaign_id` and `world_events.source_campaign_id` are **orphan**
  columns (no FK constraint). They store strings of campaign UUIDs. After table
  rename they'll dangle. Leave them for now; the rename migration handles them.
- `regional_state.active_campaigns` counter is independent of `active_quests`. The
  future rename should `UPDATE regional_state SET active_quests = active_quests +
  active_campaigns` then drop `active_campaigns`.
- `MonsterCampaignWizard` is the only non-trivial Campaign reference outside the
  `campaigns` UI tree.
- Curse of Strahd intro, DDEX modules, and the Homebrewery one-shots use a common
  scene grammar: **boxed read-aloud text → setup → key NPCs/stats → outcomes /
  branches → treasure**. That grammar is now encoded in `scene-templates.ts`.

## Pitfalls to avoid in follow-up

- Do NOT rename DB tables and move files in the same commit. Land file moves first
  with redirects in place, validate, then do the DB rename in isolation.
- The campaign create page (`app/campaigns/create/page.tsx`) is large. The new
  Quest Builder must not regress its features (flow chart, monster picker, idol
  config). Diff the two before deleting the old.
