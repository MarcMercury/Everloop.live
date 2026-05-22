/**
 * D&D 5e Conditions — assimilated from SRD-OGL_V5.1.
 * All 15 standard conditions plus Exhaustion (6 levels).
 */

export type ConditionKey =
  | 'blinded'
  | 'charmed'
  | 'deafened'
  | 'exhaustion'
  | 'frightened'
  | 'grappled'
  | 'incapacitated'
  | 'invisible'
  | 'paralyzed'
  | 'petrified'
  | 'poisoned'
  | 'prone'
  | 'restrained'
  | 'stunned'
  | 'unconscious'

export interface ConditionDefinition {
  key: ConditionKey
  name: string
  summary: string
  effects: string[]
}

export const CONDITIONS: Record<ConditionKey, ConditionDefinition> = {
  blinded: {
    key: 'blinded',
    name: 'Blinded',
    summary: "A blinded creature can't see and automatically fails ability checks that require sight.",
    effects: [
      "Attack rolls against the creature have advantage.",
      "The creature's attack rolls have disadvantage.",
    ],
  },
  charmed: {
    key: 'charmed',
    name: 'Charmed',
    summary: "A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects.",
    effects: [
      "The charmer has advantage on any ability check to interact socially with the creature.",
    ],
  },
  deafened: {
    key: 'deafened',
    name: 'Deafened',
    summary: "A deafened creature can't hear and automatically fails ability checks that require hearing.",
    effects: [],
  },
  exhaustion: {
    key: 'exhaustion',
    name: 'Exhaustion',
    summary: 'Exhaustion has six levels. Effects are cumulative. A long rest reduces exhaustion by 1, provided the creature has had food and drink.',
    effects: [
      'Level 1: Disadvantage on ability checks.',
      'Level 2: Speed halved.',
      'Level 3: Disadvantage on attack rolls and saving throws.',
      'Level 4: Hit point maximum halved.',
      'Level 5: Speed reduced to 0.',
      'Level 6: Death.',
    ],
  },
  frightened: {
    key: 'frightened',
    name: 'Frightened',
    summary: 'A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.',
    effects: [
      "The creature can't willingly move closer to the source of its fear.",
    ],
  },
  grappled: {
    key: 'grappled',
    name: 'Grappled',
    summary: "A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed.",
    effects: [
      'The condition ends if the grappler is incapacitated.',
      'The condition also ends if an effect removes the grappled creature from the reach of the grappler (e.g. Thunderwave).',
    ],
  },
  incapacitated: {
    key: 'incapacitated',
    name: 'Incapacitated',
    summary: "An incapacitated creature can't take actions or reactions.",
    effects: [],
  },
  invisible: {
    key: 'invisible',
    name: 'Invisible',
    summary: "An invisible creature is impossible to see without the aid of magic or a special sense. The creature's location can be detected by noise or tracks it leaves.",
    effects: [
      'Attack rolls against the creature have disadvantage.',
      "The creature's attack rolls have advantage.",
    ],
  },
  paralyzed: {
    key: 'paralyzed',
    name: 'Paralyzed',
    summary: "A paralyzed creature is incapacitated and can't move or speak.",
    effects: [
      'Automatically fails Strength and Dexterity saving throws.',
      'Attack rolls against the creature have advantage.',
      'Any attack that hits the creature is a critical hit if the attacker is within 5 feet.',
    ],
  },
  petrified: {
    key: 'petrified',
    name: 'Petrified',
    summary: 'A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.',
    effects: [
      'The creature is incapacitated, cannot move or speak, and is unaware of its surroundings.',
      'Attack rolls against the creature have advantage.',
      'Automatically fails Strength and Dexterity saving throws.',
      'Has resistance to all damage.',
      'Is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.',
    ],
  },
  poisoned: {
    key: 'poisoned',
    name: 'Poisoned',
    summary: 'A poisoned creature has disadvantage on attack rolls and ability checks.',
    effects: [],
  },
  prone: {
    key: 'prone',
    name: 'Prone',
    summary: 'A prone creature can only crawl (costs extra movement) unless it stands up (costs half its speed).',
    effects: [
      'The creature has disadvantage on attack rolls.',
      'An attack roll against the creature has advantage if the attacker is within 5 feet of the creature; otherwise the attack roll has disadvantage.',
    ],
  },
  restrained: {
    key: 'restrained',
    name: 'Restrained',
    summary: "A restrained creature's speed becomes 0, and it can't benefit from any bonus to its speed.",
    effects: [
      'Attack rolls against the creature have advantage.',
      "The creature's attack rolls have disadvantage.",
      'The creature has disadvantage on Dexterity saving throws.',
    ],
  },
  stunned: {
    key: 'stunned',
    name: 'Stunned',
    summary: 'A stunned creature is incapacitated, can\'t move, and can speak only falteringly.',
    effects: [
      'Automatically fails Strength and Dexterity saving throws.',
      'Attack rolls against the creature have advantage.',
    ],
  },
  unconscious: {
    key: 'unconscious',
    name: 'Unconscious',
    summary: 'An unconscious creature is incapacitated, can\'t move or speak, and is unaware of its surroundings.',
    effects: [
      'The creature drops whatever it is holding and falls prone.',
      'Automatically fails Strength and Dexterity saving throws.',
      'Attack rolls against the creature have advantage.',
      'Any attack that hits the creature is a critical hit if the attacker is within 5 feet.',
    ],
  },
}

export const CONDITION_LIST: ConditionDefinition[] = Object.values(CONDITIONS)

export function getCondition(key: ConditionKey): ConditionDefinition {
  return CONDITIONS[key]
}
