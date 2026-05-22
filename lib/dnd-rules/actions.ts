/**
 * D&D 5e Actions — assimilated from SRD-OGL_V5.1 and DnD_BasicRules_2018.
 * Used by Quest Play to validate player actions and by Quest Builder to surface
 * available actions when designing encounters.
 *
 * Source: docs/DandDcontext/extracted/SRD-OGL_V5.1.txt (OGL),
 *         DnD_BasicRules_2018.txt (Basic Rules, freely distributed).
 */

export type ActionEconomy = 'action' | 'bonus_action' | 'reaction' | 'free' | 'movement'

export type ActionCategory =
  | 'combat'
  | 'movement'
  | 'utility'
  | 'spell'
  | 'social'
  | 'improvised'

export interface ActionDefinition {
  key: string
  name: string
  economy: ActionEconomy
  category: ActionCategory
  summary: string
  rules: string[]
}

export const STANDARD_ACTIONS: ActionDefinition[] = [
  {
    key: 'attack',
    name: 'Attack',
    economy: 'action',
    category: 'combat',
    summary: 'Make one melee or ranged attack. Some classes (e.g. Fighter level 5+) gain Extra Attack.',
    rules: [
      'Choose a target within reach (melee) or range (ranged).',
      'Roll d20 + ability mod + proficiency bonus vs target AC.',
      'Natural 20 is a critical hit (roll damage dice twice).',
      'Natural 1 is an automatic miss.',
      'Ranged attacks in melee impose disadvantage unless you have a feature that says otherwise.',
    ],
  },
  {
    key: 'cast_a_spell',
    name: 'Cast a Spell',
    economy: 'action',
    category: 'spell',
    summary: 'Cast a spell with a casting time of "1 action".',
    rules: [
      'Must have the spell prepared / known and an available spell slot of appropriate level.',
      'Must satisfy components (V, S, M) unless features waive them.',
      'A spell that requires concentration replaces any other concentration spell.',
      'Bonus-action spells have their own slot — see "Bonus Action Spells" rule.',
    ],
  },
  {
    key: 'dash',
    name: 'Dash',
    economy: 'action',
    category: 'movement',
    summary: 'Gain extra movement equal to your speed for the current turn.',
    rules: [
      'Movement granted by Dash uses the same rules as normal movement.',
      'Difficult terrain still costs double.',
    ],
  },
  {
    key: 'disengage',
    name: 'Disengage',
    economy: 'action',
    category: 'movement',
    summary: 'Your movement this turn does not provoke opportunity attacks.',
    rules: [
      'Effect ends at the end of the current turn.',
      'Useful for escaping melee without taking AoO.',
    ],
  },
  {
    key: 'dodge',
    name: 'Dodge',
    economy: 'action',
    category: 'combat',
    summary: 'Until your next turn, attack rolls against you have disadvantage and you gain advantage on Dex saves.',
    rules: [
      'Lose the benefit if you are incapacitated or your speed is 0.',
      'Stacks well with cover.',
    ],
  },
  {
    key: 'help',
    name: 'Help',
    economy: 'action',
    category: 'utility',
    summary: 'Aid an ally with a task or an attack.',
    rules: [
      'When aiding an attack, the next attack roll against a target within 5 ft has advantage (must trigger before your next turn).',
      'When aiding a skill check, the ally gains advantage on the next ability check for that task within the next minute.',
    ],
  },
  {
    key: 'hide',
    name: 'Hide',
    economy: 'action',
    category: 'utility',
    summary: 'Make a Dexterity (Stealth) check to become hidden.',
    rules: [
      'You cannot hide from a creature that can see you clearly.',
      'On a successful Stealth vs. enemy passive Perception (or Wisdom (Perception) check), you are unseen.',
      'You lose Hidden status when you attack, cast a spell, or move into the open.',
    ],
  },
  {
    key: 'ready',
    name: 'Ready',
    economy: 'action',
    category: 'combat',
    summary: 'Prepare an action to trigger on a specific perceivable circumstance.',
    rules: [
      'Choose the trigger and the action (must be an action, not a multi-step plan).',
      'Holding a spell ready requires concentration; lose concentration = lose the spell and the slot.',
      'When the trigger occurs, you can use your reaction to take the readied action.',
    ],
  },
  {
    key: 'search',
    name: 'Search',
    economy: 'action',
    category: 'utility',
    summary: 'Devote your attention to finding something — make a Wisdom (Perception) or Intelligence (Investigation) check.',
    rules: [
      'DM determines which ability is appropriate to the search.',
      'In a known hiding scenario, this counters a Hide check.',
    ],
  },
  {
    key: 'use_an_object',
    name: 'Use an Object',
    economy: 'action',
    category: 'utility',
    summary: 'Interact with a second object on your turn, or use an object that requires an action.',
    rules: [
      'One free object interaction per turn (drawing a weapon, opening a door); a second requires this action.',
      'Activating a magic item (potion, wand, scroll) that demands an action uses this.',
    ],
  },
  {
    key: 'improvise',
    name: 'Improvised Action',
    economy: 'action',
    category: 'improvised',
    summary: 'Any action not on the list, adjudicated by the DM.',
    rules: [
      'DM sets the appropriate ability check / save and DC.',
      'Use sparingly; prefer the named actions when possible.',
    ],
  },
]

export const BONUS_ACTIONS: ActionDefinition[] = [
  {
    key: 'two_weapon_fighting',
    name: 'Off-hand Attack',
    economy: 'bonus_action',
    category: 'combat',
    summary: 'After taking the Attack action with a light melee weapon, attack with another light melee weapon held in the other hand.',
    rules: [
      'Do not add your ability modifier to the damage of the off-hand attack unless it is negative.',
      'Both weapons must have the light property (e.g. shortsword, scimitar).',
    ],
  },
  {
    key: 'class_bonus_action',
    name: 'Class Bonus Action',
    economy: 'bonus_action',
    category: 'combat',
    summary: 'Class- or feature-specific bonus actions (Rogue Cunning Action, Monk Martial Arts, etc.).',
    rules: ['See the relevant class feature for exact rules.'],
  },
  {
    key: 'bonus_action_spell',
    name: 'Bonus Action Spell',
    economy: 'bonus_action',
    category: 'spell',
    summary: 'Cast a spell with casting time "1 bonus action".',
    rules: [
      'If you cast a bonus action spell, the only other spell you can cast on the same turn is a cantrip with casting time of 1 action.',
    ],
  },
]

export const REACTIONS: ActionDefinition[] = [
  {
    key: 'opportunity_attack',
    name: 'Opportunity Attack',
    economy: 'reaction',
    category: 'combat',
    summary: 'When a hostile creature leaves your reach, make one melee attack against it.',
    rules: [
      'Triggers when the creature moves out of your reach using its movement.',
      'Disengage suppresses this trigger.',
      'Teleportation and forced movement do not trigger AoO.',
    ],
  },
  {
    key: 'readied_action',
    name: 'Triggered Readied Action',
    economy: 'reaction',
    category: 'combat',
    summary: 'Execute the action you previously readied when its trigger occurs.',
    rules: ['You can only have one readied action at a time; using your reaction otherwise loses the readied effect.'],
  },
  {
    key: 'counterspell',
    name: 'Counterspell-style Reaction',
    economy: 'reaction',
    category: 'spell',
    summary: 'Spells with a reaction casting time (Counterspell, Shield, Hellish Rebuke, etc.).',
    rules: ['See individual spell. Most reaction spells specify their trigger explicitly.'],
  },
]

export const ALL_ACTIONS: ActionDefinition[] = [
  ...STANDARD_ACTIONS,
  ...BONUS_ACTIONS,
  ...REACTIONS,
]

export function getAction(key: string): ActionDefinition | undefined {
  return ALL_ACTIONS.find((a) => a.key === key)
}
