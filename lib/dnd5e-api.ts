// ═══════════════════════════════════════════════════════════
// D&D 5e SRD API Client (dnd5eapi.co)
// Base URL: https://www.dnd5eapi.co/api/2014
// Free, no auth required - official 5e SRD data
// Complements Open5E with features, proficiencies, subclasses
// ═══════════════════════════════════════════════════════════

const API_BASE = 'https://www.dnd5eapi.co/api/2014'

interface ApiReference {
  index: string
  name: string
  url: string
}

interface DndApiListResponse {
  count: number
  results: ApiReference[]
}

async function dnd5eFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 }, // Cache for 24h
  })
  if (!res.ok) {
    throw new Error(`D&D 5e API error (${res.status}): ${await res.text()}`)
  }
  return res.json()
}

// ─── Classes & Subclasses ───────────────────────────────

export interface DndClass {
  index: string
  name: string
  hit_die: number
  proficiencies: ApiReference[]
  saving_throws: ApiReference[]
  starting_equipment: { equipment: ApiReference; quantity: number }[]
  class_levels: string // URL
  spellcasting?: {
    spellcasting_ability: ApiReference
    info: { name: string; desc: string[] }[]
  }
  subclasses: ApiReference[]
}

export async function getClass(index: string): Promise<DndClass> {
  return dnd5eFetch(`/classes/${index}`)
}

export async function listClasses(): Promise<DndApiListResponse> {
  return dnd5eFetch('/classes')
}

export interface DndClassLevel {
  level: number
  ability_score_bonuses: number
  prof_bonus: number
  features: ApiReference[]
  spellcasting?: Record<string, number>
  class_specific?: Record<string, number | string>
}

export async function getClassLevels(classIndex: string): Promise<DndClassLevel[]> {
  return dnd5eFetch(`/classes/${classIndex}/levels`)
}

export async function getClassLevel(
  classIndex: string,
  level: number
): Promise<DndClassLevel> {
  return dnd5eFetch(`/classes/${classIndex}/levels/${level}`)
}

export async function getSubclass(index: string): Promise<{
  index: string
  name: string
  class: ApiReference
  desc: string[]
  subclass_flavor: string
  subclass_levels: string
}> {
  return dnd5eFetch(`/subclasses/${index}`)
}

// ─── Features (class features, racial traits) ──────────

export interface DndFeature {
  index: string
  name: string
  class: ApiReference
  level: number
  desc: string[]
  prerequisites: { type: string; level?: number }[]
}

export async function getFeature(index: string): Promise<DndFeature> {
  return dnd5eFetch(`/features/${index}`)
}

export async function getClassFeatures(classIndex: string): Promise<DndApiListResponse> {
  return dnd5eFetch(`/classes/${classIndex}/features`)
}

// ─── Spells (with class filtering) ─────────────────────

export interface DndSpell {
  index: string
  name: string
  level: number
  school: ApiReference
  casting_time: string
  range: string
  components: string[]
  material?: string
  duration: string
  concentration: boolean
  ritual: boolean
  desc: string[]
  higher_level?: string[]
  damage?: {
    damage_type?: ApiReference
    damage_at_slot_level?: Record<string, string>
    damage_at_character_level?: Record<string, string>
  }
  heal_at_slot_level?: Record<string, string>
  classes: ApiReference[]
  subclasses: ApiReference[]
}

export async function getSpell(index: string): Promise<DndSpell> {
  return dnd5eFetch(`/spells/${index}`)
}

export async function getClassSpells(classIndex: string): Promise<DndApiListResponse> {
  return dnd5eFetch(`/classes/${classIndex}/spells`)
}

// ─── Monsters ───────────────────────────────────────────

export interface DndMonster {
  index: string
  name: string
  type: string
  subtype?: string
  alignment: string
  armor_class: { type: string; value: number }[]
  hit_points: number
  hit_dice: string
  hit_points_roll: string
  speed: Record<string, string>
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  proficiencies: { value: number; proficiency: ApiReference }[]
  damage_vulnerabilities: string[]
  damage_resistances: string[]
  damage_immunities: string[]
  condition_immunities: ApiReference[]
  senses: Record<string, string>
  languages: string
  challenge_rating: number
  xp: number
  special_abilities?: { name: string; desc: string; usage?: { type: string; times?: number } }[]
  actions?: {
    name: string
    desc: string
    attack_bonus?: number
    damage?: { damage_type: ApiReference; damage_dice: string }[]
    usage?: { type: string; times?: number; dice?: string; min_value?: number }
  }[]
  legendary_actions?: { name: string; desc: string }[]
}

export async function getMonster(index: string): Promise<DndMonster> {
  return dnd5eFetch(`/monsters/${index}`)
}

export async function listMonsters(params?: {
  challenge_rating?: number[]
}): Promise<DndApiListResponse> {
  const query = new URLSearchParams()
  if (params?.challenge_rating?.length) {
    query.set('challenge_rating', params.challenge_rating.join(','))
  }
  const qs = query.toString()
  return dnd5eFetch(`/monsters${qs ? `?${qs}` : ''}`)
}

// ─── Equipment ──────────────────────────────────────────

export interface DndEquipment {
  index: string
  name: string
  equipment_category: ApiReference
  cost: { quantity: number; unit: string }
  weight?: number
  desc?: string[]
  weapon_category?: string
  weapon_range?: string
  damage?: { damage_dice: string; damage_type: ApiReference }
  range?: { normal: number; long?: number }
  properties?: ApiReference[]
  armor_category?: string
  armor_class?: { base: number; dex_bonus: boolean; max_bonus?: number }
  str_minimum?: number
  stealth_disadvantage?: boolean
}

export async function getEquipment(index: string): Promise<DndEquipment> {
  return dnd5eFetch(`/equipment/${index}`)
}

export async function listEquipmentByCategory(
  category: string
): Promise<DndApiListResponse> {
  return dnd5eFetch(`/equipment-categories/${category}`)
}

// ─── Magic Items ────────────────────────────────────────

export interface DndMagicItem {
  index: string
  name: string
  equipment_category: ApiReference
  rarity: { name: string }
  desc: string[]
  variants: ApiReference[]
}

export async function getMagicItem(index: string): Promise<DndMagicItem> {
  return dnd5eFetch(`/magic-items/${index}`)
}

// ─── Conditions ─────────────────────────────────────────

export interface DndCondition {
  index: string
  name: string
  desc: string[]
}

export async function getCondition(index: string): Promise<DndCondition> {
  return dnd5eFetch(`/conditions/${index}`)
}

export async function listConditions(): Promise<DndApiListResponse> {
  return dnd5eFetch('/conditions')
}

// ─── Skills ─────────────────────────────────────────────

export interface DndSkill {
  index: string
  name: string
  desc: string[]
  ability_score: ApiReference
}

export async function getSkill(index: string): Promise<DndSkill> {
  return dnd5eFetch(`/skills/${index}`)
}

// ─── Proficiencies ──────────────────────────────────────

export async function getClassProficiencies(
  classIndex: string
): Promise<DndApiListResponse> {
  return dnd5eFetch(`/classes/${classIndex}/proficiencies`)
}

// ─── Rules ──────────────────────────────────────────────

export async function getRule(index: string): Promise<{
  index: string
  name: string
  desc: string
  subsections: ApiReference[]
}> {
  return dnd5eFetch(`/rules/${index}`)
}

export async function getRuleSection(index: string): Promise<{
  index: string
  name: string
  desc: string
}> {
  return dnd5eFetch(`/rule-sections/${index}`)
}

// ─── Traits (Racial Traits) ────────────────────────────

export async function getTrait(index: string): Promise<{
  index: string
  name: string
  desc: string[]
  races: ApiReference[]
  subraces: ApiReference[]
  proficiencies: ApiReference[]
}> {
  return dnd5eFetch(`/traits/${index}`)
}
