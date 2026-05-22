/**
 * Quest Scene Templates.
 *
 * Pattern derived from inspecting DDEX modules (DDEX1-3, DDEX1-4, DDEX1-6,
 * DDEX1-9, DDEX1-10), Adventurers League one-shots (DRA series), the
 * Curse of Strahd intro, and the Homebrewery one-shots (Clam Island,
 * Frostglade Tundra, Goldfish Archipelago) under `docs/DandDcontext/`.
 *
 * Every well-formed published scene follows the same grammar:
 *
 *   1. Boxed read-aloud text (the GM reads to players verbatim on arrival).
 *   2. Setup / area details (terrain, light, sounds, hidden features).
 *   3. Key NPCs and creatures (with stat blocks or stat references).
 *   4. Encounter mechanics (combat, social, exploration, puzzle).
 *   5. Outcomes / branches (success path, failure path, escape clauses).
 *   6. Treasure (XP, gold, magic items, story rewards).
 *
 * The Everloop Quest Builder uses this schema to scaffold new scenes and to
 * drive the printable handout layout.
 */

export type QuestSceneTemplateKind =
  | 'narrative_arrival'
  | 'social_encounter'
  | 'combat_encounter'
  | 'exploration'
  | 'puzzle_or_trap'
  | 'rest_camp'
  | 'boss_fight'
  | 'climax_or_resolution'

export interface QuestSceneTemplate {
  kind: QuestSceneTemplateKind
  name: string
  description: string
  fields: QuestSceneField[]
}

export interface QuestSceneField {
  key: string
  label: string
  hint: string
  required: boolean
  multiline: boolean
}

const COMMON_OPENING: QuestSceneField = {
  key: 'boxed_text',
  label: 'Boxed Read-Aloud Text',
  hint: 'The narration the GM reads when the players enter this scene. Keep it sensory: what they see, hear, smell. 1–3 short paragraphs.',
  required: true,
  multiline: true,
}

const COMMON_SETUP: QuestSceneField = {
  key: 'setup',
  label: 'Setup & Area Details',
  hint: 'Terrain, light level, ambient sound, hidden features. Notes for the GM, not the players.',
  required: true,
  multiline: true,
}

const COMMON_OUTCOMES: QuestSceneField = {
  key: 'outcomes',
  label: 'Outcomes / Branches',
  hint: 'Success path, failure path, partial outcomes, and escape clauses. Reference scene IDs the players move to next.',
  required: true,
  multiline: true,
}

const COMMON_TREASURE: QuestSceneField = {
  key: 'treasure',
  label: 'Treasure & Rewards',
  hint: 'XP, gold, magic items, downtime, story rewards. Leave blank if none.',
  required: false,
  multiline: true,
}

export const QUEST_SCENE_TEMPLATES: QuestSceneTemplate[] = [
  {
    kind: 'narrative_arrival',
    name: 'Narrative Arrival',
    description: 'Players enter a new location. Sets atmosphere and seeds hooks.',
    fields: [
      COMMON_OPENING,
      COMMON_SETUP,
      { key: 'hooks', label: 'Hooks & Clues', hint: 'Threads pointing to the next scene or the larger plot.', required: false, multiline: true },
    ],
  },
  {
    kind: 'social_encounter',
    name: 'Social Encounter',
    description: 'Dialogue-driven scene with one or more NPCs. May involve Persuasion, Deception, Intimidation, or Insight checks.',
    fields: [
      COMMON_OPENING,
      COMMON_SETUP,
      { key: 'npcs', label: 'Key NPCs', hint: 'For each: name, role, demeanor, secret(s), key dialogue beats.', required: true, multiline: true },
      { key: 'dcs', label: 'Suggested DCs', hint: 'e.g. Persuasion DC 14 to convince. Insight DC 12 to read deception. Reference lib/dnd-rules/combat.ts DIFFICULTY_DC.', required: false, multiline: true },
      COMMON_OUTCOMES,
      COMMON_TREASURE,
    ],
  },
  {
    kind: 'combat_encounter',
    name: 'Combat Encounter',
    description: 'A fight. Use the encounter assessor (lib/dnd-rules/encounters.ts) to validate difficulty.',
    fields: [
      COMMON_OPENING,
      COMMON_SETUP,
      { key: 'monsters', label: 'Monsters', hint: 'Name, CR, count, starting positions. Stat block reference (Open5E, custom).', required: true, multiline: true },
      { key: 'tactics', label: 'Tactics', hint: 'How the monsters fight. Reactions to PC actions. Morale/retreat triggers.', required: true, multiline: true },
      { key: 'terrain', label: 'Terrain Features', hint: 'Cover, difficult terrain, hazards, light sources.', required: false, multiline: true },
      COMMON_OUTCOMES,
      COMMON_TREASURE,
    ],
  },
  {
    kind: 'exploration',
    name: 'Exploration',
    description: 'Travel, navigation, or environmental challenge.',
    fields: [
      COMMON_OPENING,
      COMMON_SETUP,
      { key: 'discoveries', label: 'Discoveries', hint: 'What players can find — tracks, clues, lairs, shortcuts.', required: true, multiline: true },
      { key: 'random_events', label: 'Random Events / Encounters', hint: 'Optional table the GM can roll on.', required: false, multiline: true },
      COMMON_OUTCOMES,
      COMMON_TREASURE,
    ],
  },
  {
    kind: 'puzzle_or_trap',
    name: 'Puzzle / Trap',
    description: 'A challenge solved without direct combat. Usually a check, riddle, or rigged mechanism.',
    fields: [
      COMMON_OPENING,
      COMMON_SETUP,
      { key: 'mechanism', label: 'Mechanism', hint: 'How the puzzle/trap works mechanically (Investigation DC, Perception to spot, Disable, save DC, damage on trigger).', required: true, multiline: true },
      { key: 'solution', label: 'Solution(s)', hint: 'The intended solution and any creative alternatives to allow.', required: true, multiline: true },
      COMMON_OUTCOMES,
      COMMON_TREASURE,
    ],
  },
  {
    kind: 'rest_camp',
    name: 'Rest / Camp',
    description: 'A breather. Short or long rest opportunity, optional roleplay or random event.',
    fields: [
      COMMON_OPENING,
      { key: 'rest_type', label: 'Rest Type', hint: 'short_rest | long_rest | brief_pause', required: true, multiline: false },
      { key: 'interruption', label: 'Possible Interruption', hint: 'Roll-table or fixed event that may interrupt the rest.', required: false, multiline: true },
      COMMON_OUTCOMES,
    ],
  },
  {
    kind: 'boss_fight',
    name: 'Boss Fight',
    description: 'The pivotal encounter. Often a named villain with legendary or lair actions.',
    fields: [
      COMMON_OPENING,
      COMMON_SETUP,
      { key: 'boss', label: 'Boss Stat Block', hint: 'Full block: HP, AC, abilities, lair actions, legendary actions. Phases if applicable.', required: true, multiline: true },
      { key: 'minions', label: 'Minions / Allies', hint: 'Supporting creatures. Use the encounter assessor.', required: false, multiline: true },
      { key: 'lair_actions', label: 'Lair Actions', hint: 'Initiative count 20 (losing ties). Reference SRD lair actions or invent custom.', required: false, multiline: true },
      { key: 'phases', label: 'Phase Transitions', hint: 'HP thresholds that change the boss\u2019s behavior (e.g. at half HP, summons reinforcements).', required: false, multiline: true },
      COMMON_OUTCOMES,
      COMMON_TREASURE,
    ],
  },
  {
    kind: 'climax_or_resolution',
    name: 'Climax / Resolution',
    description: 'Where the quest converges. Resolves the central question and seeds future quests.',
    fields: [
      COMMON_OPENING,
      { key: 'resolution', label: 'Resolution', hint: 'How the quest ends. List the possible endings (full success, partial, failure, twist).', required: true, multiline: true },
      { key: 'world_impact', label: 'World Impact', hint: 'How the Everloop world changes. Shards moved, NPCs revealed, regions destabilized. Feeds shard_events / world_events.', required: false, multiline: true },
      COMMON_TREASURE,
    ],
  },
]

export function getSceneTemplate(kind: QuestSceneTemplateKind): QuestSceneTemplate | undefined {
  return QUEST_SCENE_TEMPLATES.find((t) => t.kind === kind)
}
