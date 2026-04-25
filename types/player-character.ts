/**
 * Player Deck Types - D&D Character Management
 * Types for the live-play character companion system
 */

import { Json } from './database'

// D&D 5e Ability Score names
export type AbilityScore = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'

// D&D 5e Skill names
export type SkillName =
  | 'acrobatics' | 'animal_handling' | 'arcana' | 'athletics'
  | 'deception' | 'history' | 'insight' | 'intimidation'
  | 'investigation' | 'medicine' | 'nature' | 'perception'
  | 'performance' | 'persuasion' | 'religion' | 'sleight_of_hand'
  | 'stealth' | 'survival'

export type SkillProficiency = 'proficient' | 'expertise' | null

// D&D 5e Conditions
export type DndCondition =
  | 'blinded' | 'charmed' | 'deafened' | 'exhaustion'
  | 'frightened' | 'grappled' | 'incapacitated' | 'invisible'
  | 'paralyzed' | 'petrified' | 'poisoned' | 'prone'
  | 'restrained' | 'stunned' | 'unconscious'

// Spell details
export interface SpellEntry {
  name: string
  level: number
  school: string
  casting_time: string
  range: string
  components: string
  duration: string
  description: string
  damage?: string
  /** Save type column from MPMB sheet (e.g. 'Dex', 'Wis', or '—' for none). */
  save?: string
  /** Where the spell comes from (e.g. 'Warlock', 'Tiefling Innate', 'Tome Ritual'). */
  source?: string
  prepared: boolean
  concentration: boolean
  ritual: boolean
}

export interface CantripEntry {
  name: string
  school: string
  casting_time: string
  range: string
  components: string
  duration: string
  description: string
  damage?: string
  save?: string
  source?: string
}

export interface SpellSlot {
  max: number
  used: number
  /** Optional recharge type. Warlock Pact Magic recovers on short rest. */
  recharge?: 'short_rest' | 'long_rest'
}

export interface SpellcastingData {
  spellcasting_ability: string
  spell_save_dc: number
  spell_attack_bonus: number
  spell_slots: Record<string, SpellSlot>
  spells_known: SpellEntry[]
  cantrips: CantripEntry[]
}

// Proficiencies
export interface ProficiencyData {
  skills: Partial<Record<SkillName, SkillProficiency>>
  saving_throws: string[]
  armor_proficiencies: string[]
  weapon_proficiencies: string[]
  tool_proficiencies: string[]
  languages: string[]
}

// Features & Traits
export interface FeatureEntry {
  name: string
  source: string
  description: string
  uses_max?: number
  uses_remaining?: number
  recharge?: 'short_rest' | 'long_rest' | 'dawn' | 'none'
}

// Weapon
export interface WeaponEntry {
  name: string
  attack_bonus: number
  damage: string
  properties: string[]
  equipped: boolean
  /** e.g. 'Melee', 'Ranged', 'Melee, 20/60 ft'. */
  range?: string
  /** Damage type column (Slashing, Piercing, Fire, etc.). */
  damage_type?: string
  /** D&D 2024 weapon mastery property: Sap / Slow / Topple / Vex / etc. */
  weapon_mastery?: string
}

// Armor
export interface ArmorEntry {
  name: string
  ac: number
  type: string
  stealth_disadvantage?: boolean
  equipped: boolean
}

// Inventory item
export interface InventoryItem {
  name: string
  quantity: number
  weight?: number
  description?: string
  magical?: boolean
  attuned?: boolean
}

// Rich magic item entry (Possessions panel — name + description + attunement + charges)
export interface MagicItemEntry {
  name: string
  description?: string
  rarity?: string
  requires_attunement?: boolean
  attuned?: boolean
  charges_max?: number
  charges_remaining?: number
  recharge?: 'dawn' | 'dusk' | 'short_rest' | 'long_rest' | 'none'
}

// Ammunition tracker
export interface Ammunition {
  type: string
  quantity: number
}

// Currency
export interface Currency {
  cp: number
  sp: number
  ep: number
  gp: number
  pp: number
}

// Full inventory structure
export interface InventoryData {
  weapons: WeaponEntry[]
  armor: ArmorEntry | null
  shield: { name: string; ac_bonus: number; equipped: boolean } | null
  items: InventoryItem[]
  currency: Currency
  /** Legacy free-form attunement names (kept for back-compat). */
  attunement: string[]
  /** Rich magic items (preferred). Max 3 attuned simultaneously per RAW. */
  magic_items?: MagicItemEntry[]
  ammunition?: Ammunition[]
  encumbrance?: number
}

// Status / Conditions for live tracking
export interface CharacterStatus {
  conditions: DndCondition[]
  concentration_spell: string | null
  /** Legacy boolean inspiration. */
  inspiration: boolean
  /** 2024 PHB Heroic Inspiration is stackable; numeric tracker. */
  inspiration_count?: number
  /** Whether the per-round reaction has been spent. */
  reaction_used?: boolean
  /** Whether the per-round bonus action has been spent. */
  bonus_action_used?: boolean
  exhaustion_level: number
  notes: string
}

// Multiclass entry
export interface MulticlassEntry {
  class: string
  subclass: string
  level: number
}

// Session note
export interface SessionNote {
  date: string
  session: number
  notes: string
}

// Senses (passive scores + special vision)
export interface SensesData {
  passive_perception?: number
  passive_investigation?: number
  passive_insight?: number
  darkvision?: number
  blindsight?: number
  tremorsense?: number
  truesight?: number
  notes?: string
}

// Multiple speeds (walk / fly / swim / climb / burrow / hover)
export interface SpeedsData {
  walk?: number
  fly?: number
  swim?: number
  climb?: number
  burrow?: number
  hover?: boolean
  encumbered?: number
  heavily_encumbered?: number
}

// Display-only AC breakdown (canonical AC stays in armor_class column)
export interface AcBreakdown {
  base?: number
  armor_bonus?: number
  shield_bonus?: number
  dex_mod?: number
  magic_bonus?: number
  misc_bonus?: number
  notes?: string
}

// Damage / condition modifier lists
export interface DamageModifiers {
  resistances: string[]
  immunities: string[]
  vulnerabilities: string[]
  condition_immunities: string[]
}

// Per-save advantage/disadvantage notes
export interface SavingThrowModifiers {
  advantages: string[]
  disadvantages: string[]
  notes?: string
}

// Feats (distinct from features/traits)
export interface FeatEntry {
  name: string
  source?: string
  level_acquired?: number
  description: string
}

// Treasure / valuables
export interface GemEntry {
  name: string
  value_gp?: number
  quantity?: number
}
export interface ArtEntry {
  name: string
  value_gp?: number
  description?: string
}
export interface TreasureData {
  gems?: GemEntry[]
  art?: ArtEntry[]
  other_holdings?: string
  total_value_gp?: number
}

// Wound / long-term injury
export interface Wound {
  description: string
  severity?: 'minor' | 'major' | 'permanent'
  healing_required?: string
  date?: string
}

// Spell source bucket (Pact Magic / Racial / Ritual Tome / Multiclass)
export interface SpellSource {
  name: string
  ability?: string
  save_dc?: number
  attack_bonus?: number
  recharge?: 'short_rest' | 'long_rest'
  spell_slots?: Record<string, SpellSlot>
  spells?: SpellEntry[]
  cantrips?: CantripEntry[]
  notes?: string
}

// Companion / Familiar / Pet
export interface CompanionEntry {
  name: string
  type: string
  hp: number
  max_hp: number
  ac: number
  speed?: number
  abilities?: string
  notes: string
}

// Full Player Character row
export interface PlayerCharacter {
  id: string
  user_id: string
  name: string
  player_name: string | null
  size: string
  gender: string | null
  pronouns: string | null
  race: string
  subrace: string | null
  class: string
  subclass: string | null
  level: number
  experience_points: number
  background: string | null
  alignment: string
  portrait_url: string | null
  token_url: string | null
  appearance: string | null
  height: string | null
  weight: string | null
  age: string | null
  eyes: string | null
  hair: string | null
  skin: string | null
  faith: string | null
  personality_traits: string | null
  ideals: string | null
  bonds: string | null
  flaws: string | null
  backstory: string | null
  allies: string | null
  enemies: string | null
  organizations: string | null
  organization_symbol_url: string | null
  lifestyle: string | null
  notes: string | null
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  max_hp: number
  current_hp: number
  temp_hp: number
  armor_class: number
  initiative_bonus: number
  speed: number
  hit_dice_total: string
  hit_dice_remaining: string
  death_save_successes: number
  death_save_failures: number
  proficiency_bonus: number
  spellcasting: SpellcastingData
  proficiencies: ProficiencyData
  features: FeatureEntry[]
  feats: FeatEntry[]
  inventory: InventoryData
  status: CharacterStatus
  multiclass: MulticlassEntry[]
  session_notes: SessionNote[]
  companions: CompanionEntry[]
  senses: SensesData
  speeds: SpeedsData
  ac_breakdown: AcBreakdown
  damage_modifiers: DamageModifiers
  saving_throw_modifiers: SavingThrowModifiers
  treasure: TreasureData
  wounds: Wound[]
  spell_sources: SpellSource[]
  theme_color: string
  is_active: boolean
  campaign_name: string | null
  dm_name: string | null
  created_at: string
  updated_at: string
}

// Insert type (for creating new characters)
export interface PlayerCharacterInsert {
  user_id: string
  name: string
  player_name?: string | null
  size?: string
  gender?: string | null
  pronouns?: string | null
  race?: string
  subrace?: string | null
  class?: string
  subclass?: string | null
  level?: number
  experience_points?: number
  background?: string | null
  alignment?: string
  portrait_url?: string | null
  token_url?: string | null
  appearance?: string | null
  height?: string | null
  weight?: string | null
  age?: string | null
  eyes?: string | null
  hair?: string | null
  skin?: string | null
  faith?: string | null
  personality_traits?: string | null
  ideals?: string | null
  bonds?: string | null
  flaws?: string | null
  backstory?: string | null
  allies?: string | null
  enemies?: string | null
  organizations?: string | null
  organization_symbol_url?: string | null
  lifestyle?: string | null
  notes?: string | null
  strength?: number
  dexterity?: number
  constitution?: number
  intelligence?: number
  wisdom?: number
  charisma?: number
  max_hp?: number
  current_hp?: number
  temp_hp?: number
  armor_class?: number
  initiative_bonus?: number
  speed?: number
  hit_dice_total?: string
  hit_dice_remaining?: string
  proficiency_bonus?: number
  spellcasting?: Json
  proficiencies?: Json
  features?: Json
  feats?: Json
  inventory?: Json
  status?: Json
  multiclass?: Json
  session_notes?: Json
  companions?: Json
  senses?: Json
  speeds?: Json
  ac_breakdown?: Json
  damage_modifiers?: Json
  saving_throw_modifiers?: Json
  treasure?: Json
  wounds?: Json
  spell_sources?: Json
  theme_color?: string
  is_active?: boolean
  campaign_name?: string | null
  dm_name?: string | null
}

// Update type (for editing characters)
export interface PlayerCharacterUpdate {
  name?: string
  player_name?: string | null
  size?: string
  gender?: string | null
  pronouns?: string | null
  race?: string
  subrace?: string | null
  class?: string
  subclass?: string | null
  level?: number
  experience_points?: number
  background?: string | null
  alignment?: string
  portrait_url?: string | null
  token_url?: string | null
  appearance?: string | null
  height?: string | null
  weight?: string | null
  age?: string | null
  eyes?: string | null
  hair?: string | null
  skin?: string | null
  faith?: string | null
  personality_traits?: string | null
  ideals?: string | null
  bonds?: string | null
  flaws?: string | null
  backstory?: string | null
  allies?: string | null
  enemies?: string | null
  organizations?: string | null
  organization_symbol_url?: string | null
  lifestyle?: string | null
  notes?: string | null
  strength?: number
  dexterity?: number
  constitution?: number
  intelligence?: number
  wisdom?: number
  charisma?: number
  max_hp?: number
  current_hp?: number
  temp_hp?: number
  armor_class?: number
  initiative_bonus?: number
  speed?: number
  hit_dice_total?: string
  hit_dice_remaining?: string
  death_save_successes?: number
  death_save_failures?: number
  proficiency_bonus?: number
  spellcasting?: Json
  proficiencies?: Json
  features?: Json
  feats?: Json
  inventory?: Json
  status?: Json
  multiclass?: Json
  session_notes?: Json
  companions?: Json
  senses?: Json
  speeds?: Json
  ac_breakdown?: Json
  damage_modifiers?: Json
  saving_throw_modifiers?: Json
  treasure?: Json
  wounds?: Json
  spell_sources?: Json
  theme_color?: string
  is_active?: boolean
  campaign_name?: string | null
  dm_name?: string | null
}

// D&D Reference Data
export const DND_CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter',
  'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer',
  'Warlock', 'Wizard', 'Artificer', 'Blood Hunter'
] as const

export const DND_RACES = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome',
  'Half-Elf', 'Half-Orc', 'Tiefling', 'Dragonborn',
  'Aasimar', 'Goliath', 'Tabaxi', 'Firbolg', 'Kenku',
  'Lizardfolk', 'Triton', 'Goblin', 'Hobgoblin', 'Bugbear',
  'Kobold', 'Orc', 'Yuan-Ti', 'Changeling', 'Kalashtar',
  'Shifter', 'Warforged', 'Genasi', 'Tortle', 'Aarakocra',
  'Satyr', 'Fairy', 'Harengon', 'Owlin', 'Plasmoid',
  'Autognome', 'Hadozee', 'Thri-kreen'
] as const

export const DND_ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
] as const

export const DND_BACKGROUNDS = [
  'Acolyte', 'Charlatan', 'Criminal', 'Entertainer', 'Folk Hero',
  'Guild Artisan', 'Hermit', 'Noble', 'Outlander', 'Sage',
  'Sailor', 'Soldier', 'Urchin', 'Custom'
] as const

export const DND_SIZES = [
  'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'
] as const

export const DND_LIFESTYLES = [
  'Wretched', 'Squalid', 'Poor', 'Modest', 'Comfortable', 'Wealthy', 'Aristocratic'
] as const

/** Standard D&D 5e damage types (used for resistances / immunities / vulnerabilities). */
export const DND_DAMAGE_TYPES = [
  'Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic',
  'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder',
  'Nonmagical Bludgeoning/Piercing/Slashing'
] as const

/** D&D 2024 weapon mastery properties. */
export const WEAPON_MASTERY_PROPERTIES = [
  'Cleave', 'Graze', 'Nick', 'Push', 'Sap', 'Slow', 'Topple', 'Vex'
] as const

export const DND_CONDITIONS: DndCondition[] = [
  'blinded', 'charmed', 'deafened', 'exhaustion',
  'frightened', 'grappled', 'incapacitated', 'invisible',
  'paralyzed', 'petrified', 'poisoned', 'prone',
  'restrained', 'stunned', 'unconscious'
]

export interface ConditionEffect {
  description: string
  attackModifier?: 'advantage' | 'disadvantage'
  cantAct?: boolean
  speedZero?: boolean
}

export const CONDITION_EFFECTS: Record<DndCondition, ConditionEffect> = {
  blinded: {
    description: 'Disadvantage on attack rolls. Attacks against you have advantage.',
    attackModifier: 'disadvantage',
  },
  charmed: {
    description: 'Can\'t attack the charmer. Charmer has advantage on social checks against you.',
  },
  deafened: {
    description: 'Can\'t hear. Auto-fail any check that requires hearing.',
  },
  exhaustion: {
    description: 'Cumulative effects based on exhaustion level (see level tracker).',
  },
  frightened: {
    description: 'Disadvantage on ability checks and attack rolls while source of fear is in sight.',
    attackModifier: 'disadvantage',
  },
  grappled: {
    description: 'Speed becomes 0. Can\'t benefit from speed bonuses.',
    speedZero: true,
  },
  incapacitated: {
    description: 'Can\'t take actions or reactions.',
    cantAct: true,
  },
  invisible: {
    description: 'Advantage on attack rolls. Attacks against you have disadvantage.',
    attackModifier: 'advantage',
  },
  paralyzed: {
    description: 'Incapacitated. Auto-fail STR/DEX saves. Attacks against you have advantage, melee hits auto-crit.',
    cantAct: true,
  },
  petrified: {
    description: 'Incapacitated. Auto-fail STR/DEX saves. Resistance to all damage.',
    cantAct: true,
  },
  poisoned: {
    description: 'Disadvantage on attack rolls and ability checks.',
    attackModifier: 'disadvantage',
  },
  prone: {
    description: 'Disadvantage on attack rolls. Melee attacks against you have advantage, ranged have disadvantage.',
    attackModifier: 'disadvantage',
  },
  restrained: {
    description: 'Speed 0. Disadvantage on attack rolls and DEX saves. Attacks against you have advantage.',
    attackModifier: 'disadvantage',
    speedZero: true,
  },
  stunned: {
    description: 'Incapacitated. Auto-fail STR/DEX saves. Attacks against you have advantage.',
    cantAct: true,
  },
  unconscious: {
    description: 'Incapacitated. Drop held items. Auto-fail STR/DEX saves. Attacks have advantage, melee auto-crit.',
    cantAct: true,
  },
}

// Compute net attack roll modifier from active conditions
// Returns 'advantage', 'disadvantage', or undefined (normal)
export function conditionAttackModifier(
  conditions: DndCondition[]
): 'advantage' | 'disadvantage' | undefined {
  let hasAdv = false
  let hasDisadv = false
  for (const c of conditions) {
    const effect = CONDITION_EFFECTS[c]
    if (effect.attackModifier === 'advantage') hasAdv = true
    if (effect.attackModifier === 'disadvantage') hasDisadv = true
  }
  // D&D 5e: any number of advantages + any number of disadvantages cancel out
  if (hasAdv && hasDisadv) return undefined
  if (hasAdv) return 'advantage'
  if (hasDisadv) return 'disadvantage'
  return undefined
}

export const SKILL_ABILITY_MAP: Record<SkillName, AbilityScore> = {
  acrobatics: 'dexterity',
  animal_handling: 'wisdom',
  arcana: 'intelligence',
  athletics: 'strength',
  deception: 'charisma',
  history: 'intelligence',
  insight: 'wisdom',
  intimidation: 'charisma',
  investigation: 'intelligence',
  medicine: 'wisdom',
  nature: 'intelligence',
  perception: 'wisdom',
  performance: 'charisma',
  persuasion: 'charisma',
  religion: 'intelligence',
  sleight_of_hand: 'dexterity',
  stealth: 'dexterity',
  survival: 'wisdom',
}

// Helper to compute ability modifier
export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

// Helper to format modifier as string (+2, -1, etc)
export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

// Helper to get HP percentage for health bars
export function hpPercentage(current: number, max: number): number {
  if (max <= 0) return 0
  return Math.max(0, Math.min(100, (current / max) * 100))
}

// HP color based on percentage
export function hpColor(percentage: number): string {
  if (percentage > 50) return 'bg-emerald-500'
  if (percentage > 25) return 'bg-amber-500'
  return 'bg-red-500'
}

// Class color mapping for tiles
export const CLASS_COLORS: Record<string, string> = {
  'Barbarian': '#e74c3c',
  'Bard': '#ab47bc',
  'Cleric': '#f9a825',
  'Druid': '#4caf50',
  'Fighter': '#795548',
  'Monk': '#00bcd4',
  'Paladin': '#fdd835',
  'Ranger': '#388e3c',
  'Rogue': '#455a64',
  'Sorcerer': '#e91e63',
  'Warlock': '#7c4dff',
  'Wizard': '#2196f3',
  'Artificer': '#ff9800',
  'Blood Hunter': '#b71c1c',
}

// Default empty character data constructors
export function defaultSpellcasting(): SpellcastingData {
  return {
    spellcasting_ability: '',
    spell_save_dc: 0,
    spell_attack_bonus: 0,
    spell_slots: {},
    spells_known: [],
    cantrips: [],
  }
}

export function defaultProficiencies(): ProficiencyData {
  return {
    skills: {},
    saving_throws: [],
    armor_proficiencies: [],
    weapon_proficiencies: [],
    tool_proficiencies: [],
    languages: ['Common'],
  }
}

export function defaultInventory(): InventoryData {
  return {
    weapons: [],
    armor: null,
    shield: null,
    items: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    attunement: [],
  }
}

export function defaultStatus(): CharacterStatus {
  return {
    conditions: [],
    concentration_spell: null,
    inspiration: false,
    inspiration_count: 0,
    reaction_used: false,
    bonus_action_used: false,
    exhaustion_level: 0,
    notes: '',
  }
}

export function defaultSenses(): SensesData {
  return {
    passive_perception: 10,
    passive_investigation: 10,
    passive_insight: 10,
    darkvision: 0,
    blindsight: 0,
    tremorsense: 0,
    truesight: 0,
  }
}

export function defaultSpeeds(): SpeedsData {
  return { walk: 30, fly: 0, swim: 0, climb: 0, burrow: 0, hover: false }
}

export function defaultAcBreakdown(): AcBreakdown {
  return { base: 10, armor_bonus: 0, shield_bonus: 0, dex_mod: 0, magic_bonus: 0, misc_bonus: 0 }
}

export function defaultDamageModifiers(): DamageModifiers {
  return { resistances: [], immunities: [], vulnerabilities: [], condition_immunities: [] }
}

export function defaultSavingThrowModifiers(): SavingThrowModifiers {
  return { advantages: [], disadvantages: [], notes: '' }
}

export function defaultTreasure(): TreasureData {
  return { gems: [], art: [], other_holdings: '', total_value_gp: 0 }
}
