/**
 * Adventure Design — assimilated DM-craft framework.
 *
 * Sources (all referenced under fair use / commentary):
 *   - Kelsey Dionne, "How to Write a D&D Adventure, Step by Step"
 *     (The Arcane Library, 7-step method)
 *   - Kelsey Dionne, "How to Design EPIC D&D Encounters"
 *     (Enticement / Pressure / Interaction / Consequences)
 *   - Michael E. Shea, Return of the Lazy Dungeon Master (8 prep steps)
 *   - Wolfgang Baur et al., The Complete Kobold Guide to Game Design
 *   - Wizards of the Coast, Dungeon Master's Guide; Tasha's Cauldron of
 *     Everything; Xanathar's Guide to Everything (encounter & downtime tables)
 *   - Matthew Finch / Mythmere, Tome of Adventure Design (plot-hook taxonomy)
 *   - Kevin Crawford, Worlds Without Number (sandbox tagging)
 *   - Keith Ammann, The Monsters Know What They're Doing (tactical archetypes)
 *
 * This module is data + helpers only. No I/O. Consumed by the Quest Builder
 * UI (`components/quests/quest-builder.tsx`) and the print pipeline
 * (`lib/quest-print.ts`).
 */

// ─── Kelsey Dionne — 7-Step Adventure Design ────────────────────────────────

export type AdventureStepId =
  | 'idea'
  | 'hooks'
  | 'outline'
  | 'map'
  | 'dm_writing'
  | 'layout_art'
  | 'legal'

export interface AdventureStep {
  id: AdventureStepId
  order: number
  name: string
  goal: string
  /** One-line action the writer must complete before advancing. */
  action: string
  /** Required output(s) of this step — used by the Quest Builder linter. */
  outputs: string[]
}

export const ADVENTURE_STEPS: AdventureStep[] = [
  {
    id: 'idea',
    order: 1,
    name: 'Develop an Urgent Problem',
    goal: 'Surface a problem only the characters can solve with their special skills.',
    action: 'Write one sentence: who is in danger, why now, and why only the PCs can act.',
    outputs: ['urgent_problem'],
  },
  {
    id: 'hooks',
    order: 2,
    name: 'Craft Killer Hooks',
    goal: 'Pull the players in by appealing to reward, heroism, or discovery — at least one, ideally more.',
    action: 'Stage the inciting action so it happens TO or AROUND the PCs, not off-screen.',
    outputs: ['hook_scene', 'player_appeal_tags'],
  },
  {
    id: 'outline',
    order: 3,
    name: 'Outline Hurdles to the Finale',
    goal: 'List 6–8 encounters between the hook and the final confrontation.',
    action: 'Define the final encounter (success AND failure states), then bridge with varied hurdles.',
    outputs: ['final_encounter', 'encounter_list'],
  },
  {
    id: 'map',
    order: 4,
    name: 'Design a Great Map',
    goal: 'Build a map with loops, interactive rooms, elevation, and combat-tested geometry.',
    action: 'Sketch room connections; avoid empty 30×30 boxes; verify combat rooms with a mental test run.',
    outputs: ['map_sketch', 'room_keys'],
  },
  {
    id: 'dm_writing',
    name: 'DM-Friendly Writing',
    order: 5,
    goal: 'Turn the outline into reference material a DM can read live at the table.',
    action: 'One page per room. Bullets, bolding, sensory hooks. Imagine first, design second.',
    outputs: ['room_writeups'],
  },
  {
    id: 'layout_art',
    order: 6,
    name: 'Layout & Art',
    goal: 'Make the document scannable and visually polished.',
    action: 'One encounter per page. Consistent art style. Cover uses the strongest piece.',
    outputs: ['layout', 'art_attributions'],
  },
  {
    id: 'legal',
    order: 7,
    name: 'Legal & Attribution',
    goal: 'Credit every artist and choose the correct publishing license (SRD/OGL/CC vs DMs Guild).',
    action: 'Add attributions; pick a license that matches the material you used.',
    outputs: ['attributions', 'license'],
  },
]

// ─── Kelsey Dionne — EPIC Encounter Framework ───────────────────────────────

export type EpicElement = 'enticement' | 'pressure' | 'interaction' | 'consequences'

export interface EpicElementSpec {
  id: EpicElement
  name: string
  why_it_matters: string
  /** Concrete prompts the builder asks the writer for this element. */
  prompts: string[]
  /** Anti-patterns the linter should flag. */
  anti_patterns: string[]
}

export const EPIC_ELEMENTS: EpicElementSpec[] = [
  {
    id: 'enticement',
    name: 'Enticement',
    why_it_matters:
      'If the players have no reason to engage, the encounter never starts. Characters chase treasure, combat, NPCs, and mystery — give them at least one.',
    prompts: [
      'What does the PC see / hear / smell on approach that pulls them in?',
      'Is there a treasure glint, an odd sound, a captive, a strange mark, or a faint outline of a secret door?',
      'If the encounter is an ambush, what bait is on the table?',
    ],
    anti_patterns: [
      'Empty 30×30 room with nothing visible to interact with',
      'Encounter content gated behind an obscure check with no prompt',
    ],
  },
  {
    id: 'pressure',
    name: 'Pressure',
    why_it_matters:
      'Pressure forces forward motion. The PLAYERS (not necessarily the characters) must be aware of the pressure for it to drive pacing.',
    prompts: [
      'What is the timer? (countdown, draining HP/resource, NPC in worsening danger, enemy reinforcing)',
      'How will the players SEE the pressure escalate each round / scene?',
      'Vary it from the previous encounter — do not reuse the same pressure type.',
    ],
    anti_patterns: [
      'No timer or worsening condition — players can rest indefinitely with no cost',
      'Pressure invisible to the players (only DM knows the clock is ticking)',
      'Same pressure mechanism used in 3+ consecutive encounters',
    ],
  },
  {
    id: 'interaction',
    name: 'Interaction',
    why_it_matters:
      'More than one or two things to DO. Rewards exploration and varied tactics. Each PC class should have a moment to shine.',
    prompts: [
      'List 4+ interactive elements (objects, terrain, NPC quirks, environmental effects).',
      'Which PC class is this encounter designed to spotlight?',
      'What alternate approaches (ambush, intimidation, deception, stealth, magic) work besides the obvious one?',
    ],
    anti_patterns: [
      'Combat that is just trading damage with no terrain or hazards',
      'NPC who only knows / says one thing (a "one-trick pony")',
      'Same single approach repeated each round ("I attack again")',
    ],
  },
  {
    id: 'consequences',
    name: 'Consequences',
    why_it_matters:
      'PC decisions must matter. If outcomes are predetermined, players are passive — and you are not playing D&D, you are reading a script.',
    prompts: [
      'What changes in the world if the PCs win? Lose? Walk away?',
      'If a PC tries something unexpected (kills the quest-giver, frees the prisoner, blows up the room), what is the honest response — not a railroad?',
      'Which downstream scene / front / clock advances as a result?',
    ],
    anti_patterns: [
      'Critical NPC cannot die ("plot armor")',
      'Outcome identical regardless of player choices',
      'Failure has no consequence — same scene replays until success',
    ],
  },
]

// ─── Hurdles-Based Design (Kelsey Dionne) ───────────────────────────────────

export type EncounterKind = 'combat' | 'social' | 'exploration' | 'puzzle' | 'trap' | 'navigation' | 'rest'

export type CharacterRole = 'fighter' | 'rogue' | 'wizard' | 'cleric' | 'ranger' | 'bard' | 'any'

export interface HurdleSlot {
  index: number
  kind: EncounterKind
  spotlight: CharacterRole
  prompt: string
}

/**
 * Generate the recommended 8-encounter rhythm Kelsey describes:
 *   navigation, trap, combat, NPC, combat, puzzle, NPC, combat (final)
 * Adjacent same-kind encounters are avoided; each broad PC role gets at
 * least one spotlight slot.
 */
export const DEFAULT_HURDLE_RHYTHM: HurdleSlot[] = [
  { index: 1, kind: 'navigation', spotlight: 'rogue', prompt: 'Find the trail. Tracking / Investigation lean.' },
  { index: 2, kind: 'trap', spotlight: 'wizard', prompt: 'Magical or mechanical hazard the wizard can dispel / bypass.' },
  { index: 3, kind: 'combat', spotlight: 'fighter', prompt: 'Frontline brawl. Multiple lower-CR enemies for the fighter to carve.' },
  { index: 4, kind: 'social', spotlight: 'rogue', prompt: 'Negotiation or deception with a guarded NPC.' },
  { index: 5, kind: 'puzzle', spotlight: 'wizard', prompt: 'Riddle or arcane mechanism. Intelligence / Arcana checks.' },
  { index: 6, kind: 'combat', spotlight: 'cleric', prompt: 'Undead or fiend type the cleric can turn / smite.' },
  { index: 7, kind: 'social', spotlight: 'rogue', prompt: 'Sneak past or steal from a vulnerable target.' },
  { index: 8, kind: 'combat', spotlight: 'fighter', prompt: 'Final fight. Boss + minions. Resolves the urgent problem.' },
]

// ─── Hook Appeal Taxonomy ───────────────────────────────────────────────────

export type HookAppeal = 'reward' | 'heroism' | 'discovery'

export interface HookSpec {
  appeals: HookAppeal[]
  proximity: 'to_pcs' | 'around_pcs' | 'off_screen'
  inciting_action: string
}

/** A hook scores 0..3 based on how many appeals it hits and how close the
 * inciting action is to the PCs. Quest Builder warns if score < 2. */
export function scoreHook(hook: HookSpec): number {
  let score = Math.min(hook.appeals.length, 3)
  if (hook.proximity === 'off_screen') score -= 2
  if (hook.proximity === 'around_pcs') score -= 1
  return Math.max(0, score)
}

// ─── Lazy DM 8-Step Prep Checklist (Mike Shea) ──────────────────────────────

export interface LazyPrepStep {
  order: number
  title: string
  description: string
  skippable: boolean
}

export const LAZY_PREP_CHECKLIST: LazyPrepStep[] = [
  { order: 1, title: 'Review the characters', description: 'Bonds, flags, unresolved threads.', skippable: false },
  { order: 2, title: 'Create a strong start', description: 'The first scene must hook in 5 minutes.', skippable: false },
  { order: 3, title: 'Outline potential scenes', description: '5–10 bullets, not scripts.', skippable: true },
  { order: 4, title: 'Define secrets and clues', description: '~10 location-agnostic facts the PCs can learn.', skippable: false },
  { order: 5, title: 'Develop fantastic locations', description: '3 evocative sensory details per place.', skippable: true },
  { order: 6, title: 'Outline important NPCs', description: 'Name, want, secret, 1-line voice.', skippable: true },
  { order: 7, title: 'Choose relevant monsters', description: 'Pull stat blocks; do not write new ones unless required.', skippable: true },
  { order: 8, title: 'Select magic item rewards', description: 'Tie items to the urgent problem.', skippable: true },
]

// ─── Encounter Variety Linter ───────────────────────────────────────────────

export interface EncounterDraft {
  index: number
  kind: EncounterKind
  spotlight?: CharacterRole
}

export interface LinterFinding {
  severity: 'warn' | 'error'
  code: string
  message: string
  at?: number
}

/** Validate an encounter list against published-adventure conventions:
 *  - 6–8 encounters total (Kelsey's target)
 *  - No 2+ adjacent encounters of the same kind
 *  - At least one combat, one social, one exploration/puzzle/trap
 *  - At least one spotlight for each of fighter / rogue / wizard / cleric
 */
export function lintEncounterList(list: EncounterDraft[]): LinterFinding[] {
  const out: LinterFinding[] = []

  if (list.length < 6) {
    out.push({ severity: 'warn', code: 'too_few', message: `Only ${list.length} encounters; target is 6–8 for a 4–5 hour session.` })
  }
  if (list.length > 10) {
    out.push({ severity: 'warn', code: 'too_many', message: `${list.length} encounters; risks running long.` })
  }

  for (let i = 1; i < list.length; i++) {
    if (list[i].kind === list[i - 1].kind) {
      out.push({ severity: 'warn', code: 'monotony', at: list[i].index, message: `Two ${list[i].kind} encounters back-to-back.` })
    }
  }

  const kinds = new Set(list.map((e) => e.kind))
  if (!kinds.has('combat')) out.push({ severity: 'warn', code: 'no_combat', message: 'No combat encounter in the list.' })
  if (!kinds.has('social')) out.push({ severity: 'warn', code: 'no_social', message: 'No social / NPC encounter in the list.' })
  const exploreLike: EncounterKind[] = ['exploration', 'puzzle', 'trap', 'navigation']
  if (!exploreLike.some((k) => kinds.has(k))) {
    out.push({ severity: 'warn', code: 'no_explore', message: 'No exploration / puzzle / trap / navigation encounter.' })
  }

  const spotlights = new Set(list.map((e) => e.spotlight).filter(Boolean))
  for (const role of ['fighter', 'rogue', 'wizard', 'cleric'] as CharacterRole[]) {
    if (!spotlights.has(role)) {
      out.push({ severity: 'warn', code: 'no_spotlight', message: `No encounter spotlights the ${role}.` })
    }
  }

  return out
}

// ─── EPIC Encounter Linter ──────────────────────────────────────────────────

export interface EpicEncounterDraft {
  enticement?: string
  pressure?: string
  interactions: string[]
  consequences?: { success?: string; failure?: string; walk_away?: string }
}

export function lintEpic(draft: EpicEncounterDraft): LinterFinding[] {
  const out: LinterFinding[] = []
  if (!draft.enticement?.trim()) {
    out.push({ severity: 'error', code: 'no_enticement', message: 'No reason for PCs to engage. Add a sensory hook on approach.' })
  }
  if (!draft.pressure?.trim()) {
    out.push({ severity: 'warn', code: 'no_pressure', message: 'No timer, resource drain, or worsening condition. PCs can rest indefinitely.' })
  }
  if (draft.interactions.length < 3) {
    out.push({ severity: 'warn', code: 'thin_interaction', message: `Only ${draft.interactions.length} interactive element(s). Aim for 4+.` })
  }
  if (!draft.consequences?.success || !draft.consequences?.failure) {
    out.push({ severity: 'error', code: 'no_consequences', message: 'Both success AND failure outcomes must be defined.' })
  }
  return out
}

// ─── Sandbox Tags (Worlds Without Number) ───────────────────────────────────

/** Two-word tags Crawford uses to seed sandbox locations. The Quest Builder
 * can roll two tags on a location to spark conflict / theme. */
export const SANDBOX_TAGS = [
  'Abandoned Fortress', 'Ancient Curse', 'Bandit Lord', 'Blood Feud', 'Broken Mirror',
  'Buried Secret', 'Burning Library', 'Cult of Hunger', 'Dead God', 'Dying Bloodline',
  'Failed Experiment', 'Feuding Houses', 'Forbidden Knowledge', 'Forgotten Shrine',
  'Frozen Court', 'Haunted Garrison', 'Heretic Priest', 'Hollow Throne', 'Iron Pact',
  'Lost Heir', 'Mad Architect', 'Misremembered History', 'Moon-Touched', 'Open Wound',
  'Pilgrim Road', 'Plague of Echoes', 'Rebel Prince', 'Refugee Tide', 'Resurgent Past',
  'Rival Guild', 'Sacred Beast', 'Salted Earth', 'Sealed Vault', 'Severed Pact',
  'Shadow Trade', 'Silent Witness', 'Slow Apocalypse', 'Sleeping Power', 'Stolen Child',
  'Sunken Heirloom', 'Thirsty Stone', 'Twin Prophets', 'Unfinished Ritual',
  'Vanishing Roads', 'Whispering Wind', 'Wounded Land',
] as const

export function rollSandboxTags(rng: () => number = Math.random, count = 2): string[] {
  const pool = [...SANDBOX_TAGS]
  const picks: string[] = []
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(rng() * pool.length)
    picks.push(pool.splice(idx, 1)[0])
  }
  return picks
}

// ─── Monster Tactical Archetypes (Keith Ammann) ─────────────────────────────

export type MonsterTactic =
  | 'ambush_predator'   // stealth, surprise round, retreat if outnumbered
  | 'pack_hunter'       // flanking, focus fire, retreat below 50% pack HP
  | 'brute'             // charge nearest, fight to death below 25%
  | 'caster_artillery'  // stays at range, prioritizes squishy targets, dispels buffs
  | 'skirmisher'        // hit-and-run, dash + disengage, kites
  | 'guardian'          // holds position, intercepts movement past it
  | 'social_predator'   // talks first, lies, breaks word, ambushes once trust is gained
  | 'mindless'          // attacks nearest, no morale, no retreat

export interface MonsterTacticSpec {
  id: MonsterTactic
  priorities: string[]
  morale_break: string
}

export const MONSTER_TACTICS: Record<MonsterTactic, MonsterTacticSpec> = {
  ambush_predator: {
    id: 'ambush_predator',
    priorities: ['Open with surprise round from stealth', 'Focus the weakest target', 'Withdraw if first strike fails'],
    morale_break: 'Retreats below 50% HP or if surprise is lost',
  },
  pack_hunter: {
    id: 'pack_hunter',
    priorities: ['Flank when possible', 'Concentrate attacks on one PC', 'Howl/signal for reinforcements'],
    morale_break: 'Flees below 50% pack remaining',
  },
  brute: {
    id: 'brute',
    priorities: ['Charge the nearest PC', 'Smash terrain to expose enemies', 'Ignore tactical retreat'],
    morale_break: 'Fights to death; routs only on commander loss',
  },
  caster_artillery: {
    id: 'caster_artillery',
    priorities: ['Stay 60+ ft from melee', 'Open with area control', 'Counterspell / dispel PC buffs', 'Target spellcasters first'],
    morale_break: 'Withdraws below 25% HP; teleports if able',
  },
  skirmisher: {
    id: 'skirmisher',
    priorities: ['Dash + attack, then Disengage', 'Never end turn adjacent to multiple PCs', 'Bait into difficult terrain'],
    morale_break: 'Disengages below 33% HP',
  },
  guardian: {
    id: 'guardian',
    priorities: ['Hold the threshold', 'Opportunity attack everyone passing', 'Sound an alarm if breached'],
    morale_break: 'Fights to death within zone; never pursues',
  },
  social_predator: {
    id: 'social_predator',
    priorities: ['Parlay first', 'Promise what cannot be delivered', 'Strike when trust is highest'],
    morale_break: 'Flees and plots revenge below 50% HP',
  },
  mindless: {
    id: 'mindless',
    priorities: ['Attack nearest living thing', 'No tactics, no retreat'],
    morale_break: 'None — fights until destroyed',
  },
}

// ─── Plot Hook Taxonomy (Tome of Adventure Design, abridged) ────────────────

export type PlotHookKind =
  | 'theft'
  | 'rescue'
  | 'investigation'
  | 'escort'
  | 'destruction'
  | 'recovery'
  | 'infiltration'
  | 'survival'
  | 'diplomacy'
  | 'exorcism'
  | 'discovery'
  | 'vengeance'

export interface PlotHook {
  kind: PlotHookKind
  /** Bare template — fill the placeholders to seed an adventure. */
  template: string
}

export const PLOT_HOOKS: PlotHook[] = [
  { kind: 'theft', template: 'A {thief_archetype} stole {valued_object} from {owner}; the trail leads into {dangerous_place}.' },
  { kind: 'rescue', template: '{captive} was taken by {captor} into {dangerous_place}; ransom expires in {time_pressure}.' },
  { kind: 'investigation', template: '{victim} was found {state_of_corpse} in {ordinary_place}. The only clue: {anomaly}.' },
  { kind: 'escort', template: 'Escort {fragile_target} through {hostile_route} before {deadline} — {complication} en route.' },
  { kind: 'destruction', template: 'Destroy {forbidden_thing} before {antagonist} can complete {ritual_or_plan}.' },
  { kind: 'recovery', template: 'Retrieve {lost_artifact} from {ruined_place}; the previous expedition never returned.' },
  { kind: 'infiltration', template: 'Get inside {guarded_stronghold} and {objective} without alerting {garrison}.' },
  { kind: 'survival', template: 'Trapped in {hostile_environment}; escape before {resource} runs out, while {threat} closes in.' },
  { kind: 'diplomacy', template: 'Broker peace between {faction_a} and {faction_b} before {breaking_point} — both sides hide secrets.' },
  { kind: 'exorcism', template: '{place_or_person} is haunted by {entity}; the binding requires {ritual_components} found in {dangerous_place}.' },
  { kind: 'discovery', template: '{phenomenon} appeared in {ordinary_place}. Nobody knows what it is. Several have already {fate}.' },
  { kind: 'vengeance', template: '{victim_or_kin} demands the head of {antagonist}, who shelters in {dangerous_place} guarded by {protectors}.' },
]
