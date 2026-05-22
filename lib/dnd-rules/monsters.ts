/**
 * D&D 5e Monster Reference — CR table, ability/skill math, stat-block types.
 * Source: SRD 5.1 + DMG.
 *
 * Used by the Campaign Monster wizard and the MonsterStatBlock renderer so a
 * monster authored in Everloop is mechanically usable at a real D&D table.
 */

// ───────────────────────────────────────────────────────────
// Vocabulary
// ───────────────────────────────────────────────────────────

export type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'

export const ABILITY_ORDER: Ability[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']

export const ABILITY_LABELS: Record<Ability, string> = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
}

export type CreatureSize =
  | 'tiny'
  | 'small'
  | 'medium'
  | 'large'
  | 'huge'
  | 'gargantuan'

export const CREATURE_SIZES: CreatureSize[] = [
  'tiny',
  'small',
  'medium',
  'large',
  'huge',
  'gargantuan',
]

export type CreatureType =
  | 'aberration'
  | 'beast'
  | 'celestial'
  | 'construct'
  | 'dragon'
  | 'elemental'
  | 'fey'
  | 'fiend'
  | 'giant'
  | 'humanoid'
  | 'monstrosity'
  | 'ooze'
  | 'plant'
  | 'undead'

export const CREATURE_TYPES: CreatureType[] = [
  'aberration',
  'beast',
  'celestial',
  'construct',
  'dragon',
  'elemental',
  'fey',
  'fiend',
  'giant',
  'humanoid',
  'monstrosity',
  'ooze',
  'plant',
  'undead',
]

export type DamageType =
  | 'acid'
  | 'bludgeoning'
  | 'cold'
  | 'fire'
  | 'force'
  | 'lightning'
  | 'necrotic'
  | 'piercing'
  | 'poison'
  | 'psychic'
  | 'radiant'
  | 'slashing'
  | 'thunder'

export const DAMAGE_TYPES: DamageType[] = [
  'acid',
  'bludgeoning',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'piercing',
  'poison',
  'psychic',
  'radiant',
  'slashing',
  'thunder',
]

export type DndConditionName =
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

export const DND_CONDITIONS: DndConditionName[] = [
  'blinded',
  'charmed',
  'deafened',
  'exhaustion',
  'frightened',
  'grappled',
  'incapacitated',
  'invisible',
  'paralyzed',
  'petrified',
  'poisoned',
  'prone',
  'restrained',
  'stunned',
  'unconscious',
]

export const STANDARD_ALIGNMENTS = [
  'lawful good',
  'neutral good',
  'chaotic good',
  'lawful neutral',
  'true neutral',
  'chaotic neutral',
  'lawful evil',
  'neutral evil',
  'chaotic evil',
  'unaligned',
  'any alignment',
] as const

export const STANDARD_SKILLS = [
  'Acrobatics',
  'Animal Handling',
  'Arcana',
  'Athletics',
  'Deception',
  'History',
  'Insight',
  'Intimidation',
  'Investigation',
  'Medicine',
  'Nature',
  'Perception',
  'Performance',
  'Persuasion',
  'Religion',
  'Sleight of Hand',
  'Stealth',
  'Survival',
] as const

// ───────────────────────────────────────────────────────────
// Challenge Rating table (DMG p.274 / SRD)
// ───────────────────────────────────────────────────────────

export interface CrEntry {
  cr: number
  label: string
  xp: number
  proficiencyBonus: number
  /** Suggested HP range for monster design. */
  suggestedHp: string
  /** Suggested AC. */
  suggestedAc: string
  /** Suggested damage per round. */
  suggestedDpr: string
  /** Suggested attack bonus. */
  suggestedAttackBonus: number
  /** Suggested save DC. */
  suggestedSaveDC: number
}

/** Canonical CR → XP / proficiency / suggested defensive & offensive bands. */
export const CR_TABLE: CrEntry[] = [
  { cr: 0,    label: '0',    xp: 10,     proficiencyBonus: 2, suggestedHp: '1–6',     suggestedAc: '≤13', suggestedDpr: '0–1',   suggestedAttackBonus: 3, suggestedSaveDC: 13 },
  { cr: 0.125,label: '1/8',  xp: 25,     proficiencyBonus: 2, suggestedHp: '7–35',    suggestedAc: '13',  suggestedDpr: '2–3',   suggestedAttackBonus: 3, suggestedSaveDC: 13 },
  { cr: 0.25, label: '1/4',  xp: 50,     proficiencyBonus: 2, suggestedHp: '36–49',   suggestedAc: '13',  suggestedDpr: '4–5',   suggestedAttackBonus: 3, suggestedSaveDC: 13 },
  { cr: 0.5,  label: '1/2',  xp: 100,    proficiencyBonus: 2, suggestedHp: '50–70',   suggestedAc: '13',  suggestedDpr: '6–8',   suggestedAttackBonus: 3, suggestedSaveDC: 13 },
  { cr: 1,    label: '1',    xp: 200,    proficiencyBonus: 2, suggestedHp: '71–85',   suggestedAc: '13',  suggestedDpr: '9–14',  suggestedAttackBonus: 3, suggestedSaveDC: 13 },
  { cr: 2,    label: '2',    xp: 450,    proficiencyBonus: 2, suggestedHp: '86–100',  suggestedAc: '13',  suggestedDpr: '15–20', suggestedAttackBonus: 3, suggestedSaveDC: 13 },
  { cr: 3,    label: '3',    xp: 700,    proficiencyBonus: 2, suggestedHp: '101–115', suggestedAc: '13',  suggestedDpr: '21–26', suggestedAttackBonus: 4, suggestedSaveDC: 13 },
  { cr: 4,    label: '4',    xp: 1100,   proficiencyBonus: 2, suggestedHp: '116–130', suggestedAc: '14',  suggestedDpr: '27–32', suggestedAttackBonus: 5, suggestedSaveDC: 14 },
  { cr: 5,    label: '5',    xp: 1800,   proficiencyBonus: 3, suggestedHp: '131–145', suggestedAc: '15',  suggestedDpr: '33–38', suggestedAttackBonus: 6, suggestedSaveDC: 15 },
  { cr: 6,    label: '6',    xp: 2300,   proficiencyBonus: 3, suggestedHp: '146–160', suggestedAc: '15',  suggestedDpr: '39–44', suggestedAttackBonus: 6, suggestedSaveDC: 15 },
  { cr: 7,    label: '7',    xp: 2900,   proficiencyBonus: 3, suggestedHp: '161–175', suggestedAc: '15',  suggestedDpr: '45–50', suggestedAttackBonus: 6, suggestedSaveDC: 15 },
  { cr: 8,    label: '8',    xp: 3900,   proficiencyBonus: 3, suggestedHp: '176–190', suggestedAc: '16',  suggestedDpr: '51–56', suggestedAttackBonus: 7, suggestedSaveDC: 16 },
  { cr: 9,    label: '9',    xp: 5000,   proficiencyBonus: 4, suggestedHp: '191–205', suggestedAc: '16',  suggestedDpr: '57–62', suggestedAttackBonus: 7, suggestedSaveDC: 16 },
  { cr: 10,   label: '10',   xp: 5900,   proficiencyBonus: 4, suggestedHp: '206–220', suggestedAc: '17',  suggestedDpr: '63–68', suggestedAttackBonus: 7, suggestedSaveDC: 16 },
  { cr: 11,   label: '11',   xp: 7200,   proficiencyBonus: 4, suggestedHp: '221–235', suggestedAc: '17',  suggestedDpr: '69–74', suggestedAttackBonus: 8, suggestedSaveDC: 17 },
  { cr: 12,   label: '12',   xp: 8400,   proficiencyBonus: 4, suggestedHp: '236–250', suggestedAc: '17',  suggestedDpr: '75–80', suggestedAttackBonus: 8, suggestedSaveDC: 17 },
  { cr: 13,   label: '13',   xp: 10000,  proficiencyBonus: 5, suggestedHp: '251–265', suggestedAc: '18',  suggestedDpr: '81–86', suggestedAttackBonus: 8, suggestedSaveDC: 18 },
  { cr: 14,   label: '14',   xp: 11500,  proficiencyBonus: 5, suggestedHp: '266–280', suggestedAc: '18',  suggestedDpr: '87–92', suggestedAttackBonus: 8, suggestedSaveDC: 18 },
  { cr: 15,   label: '15',   xp: 13000,  proficiencyBonus: 5, suggestedHp: '281–295', suggestedAc: '18',  suggestedDpr: '93–98', suggestedAttackBonus: 8, suggestedSaveDC: 18 },
  { cr: 16,   label: '16',   xp: 15000,  proficiencyBonus: 5, suggestedHp: '296–310', suggestedAc: '18',  suggestedDpr: '99–104',suggestedAttackBonus: 9, suggestedSaveDC: 18 },
  { cr: 17,   label: '17',   xp: 18000,  proficiencyBonus: 6, suggestedHp: '311–325', suggestedAc: '19',  suggestedDpr: '105–110',suggestedAttackBonus: 10, suggestedSaveDC: 19 },
  { cr: 18,   label: '18',   xp: 20000,  proficiencyBonus: 6, suggestedHp: '326–340', suggestedAc: '19',  suggestedDpr: '111–116',suggestedAttackBonus: 10, suggestedSaveDC: 19 },
  { cr: 19,   label: '19',   xp: 22000,  proficiencyBonus: 6, suggestedHp: '341–355', suggestedAc: '19',  suggestedDpr: '117–122',suggestedAttackBonus: 10, suggestedSaveDC: 19 },
  { cr: 20,   label: '20',   xp: 25000,  proficiencyBonus: 6, suggestedHp: '356–400', suggestedAc: '19',  suggestedDpr: '123–140',suggestedAttackBonus: 10, suggestedSaveDC: 19 },
  { cr: 21,   label: '21',   xp: 33000,  proficiencyBonus: 7, suggestedHp: '401–445', suggestedAc: '19',  suggestedDpr: '141–158',suggestedAttackBonus: 11, suggestedSaveDC: 20 },
  { cr: 22,   label: '22',   xp: 41000,  proficiencyBonus: 7, suggestedHp: '446–490', suggestedAc: '19',  suggestedDpr: '159–176',suggestedAttackBonus: 11, suggestedSaveDC: 20 },
  { cr: 23,   label: '23',   xp: 50000,  proficiencyBonus: 7, suggestedHp: '491–535', suggestedAc: '19',  suggestedDpr: '177–194',suggestedAttackBonus: 11, suggestedSaveDC: 20 },
  { cr: 24,   label: '24',   xp: 62000,  proficiencyBonus: 7, suggestedHp: '536–580', suggestedAc: '19',  suggestedDpr: '195–212',suggestedAttackBonus: 11, suggestedSaveDC: 20 },
  { cr: 25,   label: '25',   xp: 75000,  proficiencyBonus: 8, suggestedHp: '581–625', suggestedAc: '19',  suggestedDpr: '213–230',suggestedAttackBonus: 12, suggestedSaveDC: 21 },
  { cr: 26,   label: '26',   xp: 90000,  proficiencyBonus: 8, suggestedHp: '626–670', suggestedAc: '19',  suggestedDpr: '231–248',suggestedAttackBonus: 12, suggestedSaveDC: 21 },
  { cr: 27,   label: '27',   xp: 105000, proficiencyBonus: 8, suggestedHp: '671–715', suggestedAc: '19',  suggestedDpr: '249–266',suggestedAttackBonus: 13, suggestedSaveDC: 22 },
  { cr: 28,   label: '28',   xp: 120000, proficiencyBonus: 8, suggestedHp: '716–760', suggestedAc: '19',  suggestedDpr: '267–284',suggestedAttackBonus: 13, suggestedSaveDC: 22 },
  { cr: 29,   label: '29',   xp: 135000, proficiencyBonus: 9, suggestedHp: '761–805', suggestedAc: '19',  suggestedDpr: '285–302',suggestedAttackBonus: 13, suggestedSaveDC: 22 },
  { cr: 30,   label: '30',   xp: 155000, proficiencyBonus: 9, suggestedHp: '806–850', suggestedAc: '19',  suggestedDpr: '303–320',suggestedAttackBonus: 14, suggestedSaveDC: 23 },
]

/** Look up CR data; falls back to CR 1 if not found. */
export function crEntry(cr: number): CrEntry {
  return CR_TABLE.find((c) => c.cr === cr) ?? CR_TABLE[4]
}

/** XP value for a given CR. */
export function xpForCR(cr: number): number {
  return crEntry(cr).xp
}

/** Proficiency bonus for a given CR. */
export function proficiencyBonusForCR(cr: number): number {
  return crEntry(cr).proficiencyBonus
}

// ───────────────────────────────────────────────────────────
// Ability score math
// ───────────────────────────────────────────────────────────

/** D&D 5e ability score → modifier ((score - 10) / 2, rounded down). */
export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2)
}

/** Format a modifier with a leading sign: 3 → "+3", -1 → "-1", 0 → "+0". */
export function formatMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

/** Passive Perception = 10 + Perception modifier (WIS mod + Perception proficiency bonus, if any). */
export function passivePerception(perceptionBonus: number): number {
  return 10 + perceptionBonus
}

/** Hit Dice die size by creature size. */
export function hitDieForSize(size: CreatureSize): number {
  switch (size) {
    case 'tiny':
      return 4
    case 'small':
      return 6
    case 'medium':
      return 8
    case 'large':
      return 10
    case 'huge':
      return 12
    case 'gargantuan':
      return 20
  }
}

// ───────────────────────────────────────────────────────────
// Stat block types — saved into canon_entities.extended_lore.monster_stats
// ───────────────────────────────────────────────────────────

export type MonsterRole =
  | 'brute'
  | 'striker'
  | 'tank'
  | 'controller'
  | 'support'

export type MovementType = 'walk' | 'fly' | 'climb' | 'swim' | 'burrow'

export interface MonsterMovement {
  type: MovementType
  speed: number
  /** e.g. "hover" for flying. */
  note?: string
}

export type MonsterActionType =
  | 'action'
  | 'bonus_action'
  | 'reaction'
  | 'legendary'
  | 'lair'

export interface MonsterAction {
  name: string
  description: string
  actionType: MonsterActionType
  /** Free-text damage string, e.g. "2d6 + 4 slashing". */
  damage?: string
  /** Structured combat fields — optional but power the stat-block renderer. */
  attackBonus?: number
  reach?: number
  rangeNormal?: number
  rangeLong?: number
  /** e.g. "one target", "each creature in a 15-foot cone". */
  targets?: string
  /** Save-based attack ability. */
  saveAbility?: Ability
  saveDC?: number
  /** e.g. "half damage on success". */
  saveEffect?: string
  /** e.g. "5–6" (recharge on d6), or "long rest". */
  recharge?: string
  /** Legendary action cost (default 1). */
  legendaryCost?: number
}

export interface MonsterTrait {
  name: string
  description: string
}

export interface MonsterAbilityScores {
  STR: number
  DEX: number
  CON: number
  INT: number
  WIS: number
  CHA: number
}

export interface MonsterSenses {
  darkvision?: number
  blindsight?: number
  blindsightBlindBeyond?: boolean
  tremorsense?: number
  truesight?: number
  /** Defaults to 10 + WIS mod + Perception proficiency. */
  passivePerception: number
}

export interface MonsterStats {
  // ─── Identity ─────────────────────────────────────────
  size: CreatureSize
  creatureType: CreatureType
  /** e.g. "shapechanger", "demon", "lawful good humanoid (any race)". */
  subtype?: string
  alignment: string
  role: MonsterRole

  // ─── Challenge & Derived ──────────────────────────────
  cr: number
  /** Derived from CR — cached for the stat block. */
  xp: number
  /** Derived from CR — cached. */
  proficiencyBonus: number

  // ─── Defenses ─────────────────────────────────────────
  hp: number
  hitDice?: string
  ac: number
  acSource?: string

  // ─── Movement ─────────────────────────────────────────
  movements: MonsterMovement[]

  // ─── Ability Scores & Proficiencies ───────────────────
  abilities: MonsterAbilityScores
  savingThrows: Partial<Record<Ability, number>>
  skills: Array<{ name: string; bonus: number }>

  // ─── Damage / Condition Handling ──────────────────────
  damageVulnerabilities: string[]
  damageResistances: string[]
  damageImmunities: string[]
  conditionImmunities: string[]

  // ─── Senses & Languages ───────────────────────────────
  senses: MonsterSenses
  languages: string[]
  /** Telepathy range in feet, if any. */
  telepathy?: number

  // ─── Combat Behavior ──────────────────────────────────
  /** Free-text DPR budget — design anchor for balance. */
  damagePerRound: string
  /** Multiattack summary, e.g. "The monster makes two claw attacks." */
  multiattack?: string
  traits: MonsterTrait[]
  actions: MonsterAction[]
  bonusActions: MonsterAction[]
  reactions: MonsterAction[]
  legendaryActions: {
    /** Total legendary actions per round (default 3). */
    count: number
    description?: string
    actions: MonsterAction[]
  }
  lairActions?: {
    description?: string
    actions: MonsterAction[]
  }

  // ─── DM Cues ──────────────────────────────────────────
  /** How does this thing fight? Target priority, retreat triggers, etc. */
  tactics?: string
  weaknesses: string[]

  // ─── Everloop Binding ─────────────────────────────────
  regionId: string
  isOneOff: boolean
  whatBrokeHere: string
  whatLeakedThrough: string
  drawnTo: string
}

// ───────────────────────────────────────────────────────────
// Defaults — used when initializing a new monster or rendering
// legacy monsters that pre-date the full stat block.
// ───────────────────────────────────────────────────────────

export function defaultAbilityScores(): MonsterAbilityScores {
  return { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 }
}

export function defaultSenses(wisScore = 10, perceptionBonus = 0): MonsterSenses {
  return {
    passivePerception: 10 + abilityMod(wisScore) + perceptionBonus,
  }
}

export function defaultLegendary(): MonsterStats['legendaryActions'] {
  return { count: 3, description: '', actions: [] }
}
