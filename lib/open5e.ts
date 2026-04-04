// ═══════════════════════════════════════════════════════════
// Open5E API Client - D&D 5e SRD Data
// Base URLs: https://api.open5e.com (v1 + v2)
// Free, no auth required
// ═══════════════════════════════════════════════════════════

const API_V1 = 'https://api.open5e.com/v1'
const API_V2 = 'https://api.open5e.com/v2'

// ─── Generic Fetch ──────────────────────────────────────

interface Open5EPaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

async function open5eFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 }, // Cache for 24h - SRD data is static
  })
  if (!res.ok) {
    throw new Error(`Open5E API error (${res.status}): ${await res.text()}`)
  }
  return res.json()
}

// ─── Spells (v2) ────────────────────────────────────────

export interface Open5ESpell {
  url: string
  key: string
  name: string
  level: number
  school: { name: string; key: string }
  casting_time: string
  range: string
  duration: string
  components: string[]
  requires_concentration: boolean
  ritual: boolean
  description: string
  higher_levels?: string
  classes: { name: string; key: string }[]
  document: { name: string; key: string }
}

export async function searchSpells(params: {
  search?: string
  level?: number
  school?: string
  class_key?: string
  limit?: number
}): Promise<Open5EPaginatedResponse<Open5ESpell>> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.level !== undefined) query.set('level', String(params.level))
  if (params.school) query.set('school__key', params.school)
  if (params.class_key) query.set('classes__key', params.class_key)
  query.set('limit', String(params.limit ?? 20))
  return open5eFetch(`${API_V2}/spells/?${query}`)
}

export async function getSpell(key: string): Promise<Open5ESpell> {
  return open5eFetch(`${API_V2}/spells/${key}/`)
}

// ─── Creatures / Monsters (v2) ──────────────────────────

export interface Open5ECreature {
  url: string
  key: string
  name: string
  type: { name: string; key: string }
  size: { name: string; key: string }
  alignment: string
  armor_class: number
  armor_description?: string
  hit_points: number
  hit_dice: string
  speed: Record<string, number>
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  challenge_rating_decimal: string
  challenge_rating_text: string
  experience_points: number
  actions: Open5EAction[]
  special_abilities: Open5EAbility[]
  legendary_actions: Open5EAction[]
  document: { name: string; key: string }
}

export interface Open5EAction {
  name: string
  description: string
  attack_bonus?: number
  damage_dice?: string
  damage_bonus?: number
}

export interface Open5EAbility {
  name: string
  description: string
}

export async function searchCreatures(params: {
  search?: string
  cr?: string
  type?: string
  limit?: number
  ordering?: string
}): Promise<Open5EPaginatedResponse<Open5ECreature>> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.cr) query.set('challenge_rating_decimal', params.cr)
  if (params.type) query.set('type__key', params.type)
  if (params.ordering) query.set('ordering', params.ordering)
  query.set('limit', String(params.limit ?? 20))
  return open5eFetch(`${API_V2}/creatures/?${query}`)
}

export async function getCreature(key: string): Promise<Open5ECreature> {
  return open5eFetch(`${API_V2}/creatures/${key}/`)
}

// ─── Classes (v2) ───────────────────────────────────────

export interface Open5EClass {
  url: string
  key: string
  name: string
  hit_dice: string
  document: { name: string; key: string }
}

export async function getClasses(): Promise<Open5EPaginatedResponse<Open5EClass>> {
  return open5eFetch(`${API_V2}/classes/?limit=50`)
}

export async function getClass(key: string): Promise<Open5EClass> {
  return open5eFetch(`${API_V2}/classes/${key}/`)
}

// ─── Items & Equipment (v2) ─────────────────────────────

export interface Open5EItem {
  url: string
  key: string
  name: string
  category: { name: string; key: string }
  cost?: string
  weight?: string
  description?: string
  document: { name: string; key: string }
}

export async function searchItems(params: {
  search?: string
  category?: string
  limit?: number
}): Promise<Open5EPaginatedResponse<Open5EItem>> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.category) query.set('category__key', params.category)
  query.set('limit', String(params.limit ?? 20))
  return open5eFetch(`${API_V2}/items/?${query}`)
}

// ─── Magic Items (v2) ───────────────────────────────────

export interface Open5EMagicItem {
  url: string
  key: string
  name: string
  rarity: { name: string; key: string }
  requires_attunement: boolean
  description: string
  document: { name: string; key: string }
}

export async function searchMagicItems(params: {
  search?: string
  rarity?: string
  limit?: number
}): Promise<Open5EPaginatedResponse<Open5EMagicItem>> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.rarity) query.set('rarity__key', params.rarity)
  query.set('limit', String(params.limit ?? 20))
  return open5eFetch(`${API_V2}/magicitems/?${query}`)
}

// ─── Weapons (v2) ───────────────────────────────────────

export interface Open5EWeapon {
  url: string
  key: string
  name: string
  category: string
  cost?: string
  weight?: string
  damage_dice?: string
  damage_type?: { name: string; key: string }
  properties: { name: string; key: string }[]
  document: { name: string; key: string }
}

export async function searchWeapons(params: {
  search?: string
  limit?: number
}): Promise<Open5EPaginatedResponse<Open5EWeapon>> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  query.set('limit', String(params.limit ?? 50))
  return open5eFetch(`${API_V2}/weapons/?${query}`)
}

// ─── Armor (v2) ─────────────────────────────────────────

export interface Open5EArmor {
  url: string
  key: string
  name: string
  category: string
  cost?: string
  weight?: string
  base_ac: number
  plus_dex_mod: boolean
  plus_con_mod: boolean
  plus_wis_mod: boolean
  plus_flat_mod?: number
  stealth_disadvantage: boolean
  strength_requirement?: number
  document: { name: string; key: string }
}

export async function searchArmor(params: {
  search?: string
  limit?: number
}): Promise<Open5EPaginatedResponse<Open5EArmor>> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  query.set('limit', String(params.limit ?? 50))
  return open5eFetch(`${API_V2}/armor/?${query}`)
}

// ─── Conditions (v2) ────────────────────────────────────

export interface Open5ECondition {
  url: string
  key: string
  name: string
  description: string
  document: { name: string; key: string }
}

export async function getConditions(): Promise<Open5EPaginatedResponse<Open5ECondition>> {
  return open5eFetch(`${API_V2}/conditions/?limit=50`)
}

// ─── Backgrounds (v2) ───────────────────────────────────

export interface Open5EBackground {
  url: string
  key: string
  name: string
  description?: string
  document: { name: string; key: string }
}

export async function searchBackgrounds(params: {
  search?: string
  limit?: number
}): Promise<Open5EPaginatedResponse<Open5EBackground>> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  query.set('limit', String(params.limit ?? 50))
  return open5eFetch(`${API_V2}/backgrounds/?${query}`)
}

// ─── Feats (v2) ─────────────────────────────────────────

export interface Open5EFeat {
  url: string
  key: string
  name: string
  description: string
  prerequisite?: string
  document: { name: string; key: string }
}

export async function searchFeats(params: {
  search?: string
  limit?: number
}): Promise<Open5EPaginatedResponse<Open5EFeat>> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  query.set('limit', String(params.limit ?? 50))
  return open5eFetch(`${API_V2}/feats/?${query}`)
}

// ─── Species / Races (v2) ───────────────────────────────

export interface Open5ESpecies {
  url: string
  key: string
  name: string
  description?: string
  speed: Record<string, number>
  document: { name: string; key: string }
}

export async function searchSpecies(params: {
  search?: string
  limit?: number
}): Promise<Open5EPaginatedResponse<Open5ESpecies>> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  query.set('limit', String(params.limit ?? 50))
  return open5eFetch(`${API_V2}/species/?${query}`)
}

// ─── Rules & Sections (v1) ──────────────────────────────

export interface Open5ERule {
  name: string
  slug: string
  desc: string
  document__slug: string
}

export async function searchRules(params: {
  search?: string
  limit?: number
}): Promise<Open5EPaginatedResponse<Open5ERule>> {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  query.set('limit', String(params.limit ?? 20))
  return open5eFetch(`${API_V1}/sections/?${query}`)
}

// ─── Full-text Global Search (v1) ───────────────────────

export interface Open5ESearchResult {
  name: string
  slug: string
  route: string
  document_slug: string
  highlighted: string
}

export async function globalSearch(
  text: string,
  limit = 20
): Promise<Open5EPaginatedResponse<Open5ESearchResult>> {
  const query = new URLSearchParams({ text, limit: String(limit) })
  return open5eFetch(`${API_V1}/search/?${query}`)
}
