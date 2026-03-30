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
}

export interface SpellSlot {
  max: number
  used: number
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
  attunement: string[]
  encumbrance?: number
}

// Status / Conditions for live tracking
export interface CharacterStatus {
  conditions: DndCondition[]
  concentration_spell: string | null
  inspiration: boolean
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
  personality_traits: string | null
  ideals: string | null
  bonds: string | null
  flaws: string | null
  backstory: string | null
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
  inventory: InventoryData
  status: CharacterStatus
  multiclass: MulticlassEntry[]
  session_notes: SessionNote[]
  companions: CompanionEntry[]
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
  personality_traits?: string | null
  ideals?: string | null
  bonds?: string | null
  flaws?: string | null
  backstory?: string | null
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
  inventory?: Json
  status?: Json
  multiclass?: Json
  session_notes?: Json
  companions?: Json
  theme_color?: string
  is_active?: boolean
  campaign_name?: string | null
  dm_name?: string | null
}

// Update type (for editing characters)
export interface PlayerCharacterUpdate {
  name?: string
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
  personality_traits?: string | null
  ideals?: string | null
  bonds?: string | null
  flaws?: string | null
  backstory?: string | null
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
  inventory?: Json
  status?: Json
  multiclass?: Json
  session_notes?: Json
  companions?: Json
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

export const DND_CONDITIONS: DndCondition[] = [
  'blinded', 'charmed', 'deafened', 'exhaustion',
  'frightened', 'grappled', 'incapacitated', 'invisible',
  'paralyzed', 'petrified', 'poisoned', 'prone',
  'restrained', 'stunned', 'unconscious'
]

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
    exhaustion_level: 0,
    notes: '',
  }
}
