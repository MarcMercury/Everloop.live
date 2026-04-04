// ═══════════════════════════════════════════════════════════
// Combat Tracker - In-Memory Combat State Engine
// Handles: initiative, turn order, HP, conditions, 
// concentration, spell slots, ammo, rests
// ═══════════════════════════════════════════════════════════

import type { DndCondition, SpellSlot, FeatureEntry } from '@/types/player-character'

// ─── Types ──────────────────────────────────────────────

export interface CombatantBase {
  id: string
  name: string
  initiative: number
  initiative_modifier: number
  max_hp: number
  current_hp: number
  temp_hp: number
  armor_class: number
  conditions: DndCondition[]
  concentration_spell: string | null
  is_npc: boolean
  is_visible: boolean // for DM-only tokens
}

export interface PlayerCombatant extends CombatantBase {
  is_npc: false
  user_id: string
  character_id: string
  spell_slots: Record<string, SpellSlot>
  features: FeatureEntry[]
  ammo: Record<string, { current: number; max: number }>
  death_saves: { successes: number; failures: number }
}

export interface NPCCombatant extends CombatantBase {
  is_npc: true
  creature_key?: string // Open5E creature key for stat lookups
  actions: { name: string; attack_bonus: number; damage: string }[]
  legendary_actions_remaining?: number
  legendary_actions_max?: number
}

export type Combatant = PlayerCombatant | NPCCombatant

export interface CombatState {
  id: string
  campaign_id: string
  session_id: string
  round: number
  turn_index: number
  combatants: Combatant[]
  is_active: boolean
  started_at: string
}

// ─── Initiative & Turn Order ────────────────────────────

export function rollInitiative(modifier: number): number {
  const roll = Math.floor(Math.random() * 20) + 1
  return roll + modifier
}

export function sortByInitiative(combatants: Combatant[]): Combatant[] {
  return [...combatants].sort((a, b) => {
    if (b.initiative !== a.initiative) return b.initiative - a.initiative
    // Tiebreak: higher dex modifier goes first
    return b.initiative_modifier - a.initiative_modifier
  })
}

export function rollGroupInitiative(
  combatants: Combatant[]
): Combatant[] {
  return combatants.map((c) => ({
    ...c,
    initiative: rollInitiative(c.initiative_modifier),
  }))
}

export function nextTurn(state: CombatState): CombatState {
  const activeCombatants = state.combatants.filter(
    (c) => c.current_hp > 0 || (!c.is_npc && (c as PlayerCombatant).death_saves.failures < 3)
  )
  if (activeCombatants.length === 0) {
    return { ...state, is_active: false }
  }

  let nextIndex = state.turn_index + 1
  let newRound = state.round

  if (nextIndex >= state.combatants.length) {
    nextIndex = 0
    newRound += 1
  }

  // Skip dead NPCs
  while (
    state.combatants[nextIndex]?.is_npc &&
    state.combatants[nextIndex]?.current_hp <= 0
  ) {
    nextIndex += 1
    if (nextIndex >= state.combatants.length) {
      nextIndex = 0
      newRound += 1
    }
  }

  return { ...state, turn_index: nextIndex, round: newRound }
}

// ─── HP Management (Aura/Tint style) ───────────────────

export type HPStatus = 'full' | 'healthy' | 'bloodied' | 'critical' | 'unconscious' | 'dead'

export function getHPStatus(combatant: CombatantBase): HPStatus {
  const ratio = combatant.current_hp / combatant.max_hp
  if (combatant.current_hp <= 0) {
    if (combatant.is_npc) return 'dead'
    return 'unconscious'
  }
  if (ratio >= 1) return 'full'
  if (ratio >= 0.5) return 'healthy'
  if (ratio >= 0.25) return 'bloodied'
  return 'critical'
}

export function getHPAuraColor(status: HPStatus): string {
  const colors: Record<HPStatus, string> = {
    full: '#22c55e',      // green-500
    healthy: '#84cc16',   // lime-500
    bloodied: '#f59e0b',  // amber-500
    critical: '#ef4444',  // red-500
    unconscious: '#6b7280', // gray-500
    dead: '#1f2937',      // gray-800
  }
  return colors[status]
}

export function applyDamage(
  combatant: Combatant,
  damage: number
): Combatant {
  let remaining = damage

  // Temp HP absorbs first
  if (combatant.temp_hp > 0) {
    if (combatant.temp_hp >= remaining) {
      return { ...combatant, temp_hp: combatant.temp_hp - remaining }
    }
    remaining -= combatant.temp_hp
    combatant = { ...combatant, temp_hp: 0 }
  }

  const newHp = Math.max(combatant.current_hp - remaining, 0)

  // Break concentration if damage taken
  const breakConcentration = combatant.concentration_spell !== null

  return {
    ...combatant,
    current_hp: newHp,
    concentration_spell: breakConcentration ? null : combatant.concentration_spell,
    conditions: newHp === 0 && !combatant.is_npc
      ? [...combatant.conditions.filter((c) => c !== 'unconscious'), 'unconscious']
      : combatant.conditions,
  }
}

export function applyHealing(
  combatant: Combatant,
  healing: number
): Combatant {
  const newHp = Math.min(combatant.current_hp + healing, combatant.max_hp)
  return {
    ...combatant,
    current_hp: newHp,
    conditions:
      combatant.current_hp === 0 && newHp > 0
        ? combatant.conditions.filter((c) => c !== 'unconscious')
        : combatant.conditions,
  }
}

// ─── Concentration Tracking ─────────────────────────────

export function concentrationSaveDC(damageTaken: number): number {
  return Math.max(10, Math.floor(damageTaken / 2))
}

export function rollConcentrationSave(
  constitutionMod: number,
  proficiencyBonus: number,
  proficientInConSaves: boolean,
  damageTaken: number
): { roll: number; total: number; dc: number; success: boolean } {
  const dc = concentrationSaveDC(damageTaken)
  const roll = Math.floor(Math.random() * 20) + 1
  const bonus = constitutionMod + (proficientInConSaves ? proficiencyBonus : 0)
  const total = roll + bonus
  return { roll, total, dc, success: total >= dc }
}

// ─── Condition Management (StatusInfo style) ────────────

export const CONDITION_EFFECTS: Record<DndCondition, string> = {
  blinded: 'Cannot see. Auto-fail sight checks. Attack rolls have disadvantage. Attacks against have advantage.',
  charmed: 'Cannot attack charmer. Charmer has advantage on social checks.',
  deafened: 'Cannot hear. Auto-fail hearing checks.',
  exhaustion: 'Cumulative penalties. Level 6 = death.',
  frightened: 'Disadvantage on checks/attacks while source visible. Cannot willingly move closer.',
  grappled: 'Speed becomes 0. Ends if grappler incapacitated or forced apart.',
  incapacitated: 'Cannot take actions or reactions.',
  invisible: 'Impossible to see without magic. Advantage on attacks. Attacks against have disadvantage.',
  paralyzed: 'Incapacitated, cannot move or speak. Auto-fail STR/DEX saves. Attacks have advantage, melee crits.',
  petrified: 'Transformed to stone. Weight x10. Incapacitated. Resistance to all damage.',
  poisoned: 'Disadvantage on attack rolls and ability checks.',
  prone: 'Disadvantage on attacks. Melee attacks against have advantage. Ranged attacks have disadvantage.',
  restrained: 'Speed 0. Attacks have disadvantage. Disadvantage on DEX saves. Attacks against have advantage.',
  stunned: 'Incapacitated, cannot move, can only speak falteringly. Auto-fail STR/DEX saves.',
  unconscious: 'Incapacitated, cannot move or speak. Unaware of surroundings. Drop items. Fall prone.',
}

export function addCondition(
  combatant: Combatant,
  condition: DndCondition
): Combatant {
  if (combatant.conditions.includes(condition)) return combatant
  return { ...combatant, conditions: [...combatant.conditions, condition] }
}

export function removeCondition(
  combatant: Combatant,
  condition: DndCondition
): Combatant {
  return {
    ...combatant,
    conditions: combatant.conditions.filter((c) => c !== condition),
  }
}

// ─── Spell Slot Tracking ────────────────────────────────

export function useSpellSlot(
  combatant: PlayerCombatant,
  level: string
): PlayerCombatant {
  const slot = combatant.spell_slots[level]
  if (!slot || slot.used >= slot.max) {
    throw new Error(`No ${level} spell slots remaining`)
  }
  return {
    ...combatant,
    spell_slots: {
      ...combatant.spell_slots,
      [level]: { ...slot, used: slot.used + 1 },
    },
  }
}

export function recoverSpellSlot(
  combatant: PlayerCombatant,
  level: string,
  count = 1
): PlayerCombatant {
  const slot = combatant.spell_slots[level]
  if (!slot) return combatant
  return {
    ...combatant,
    spell_slots: {
      ...combatant.spell_slots,
      [level]: { ...slot, used: Math.max(0, slot.used - count) },
    },
  }
}

// ─── Ammo / Resource Tracking ───────────────────────────

export function useAmmo(
  combatant: PlayerCombatant,
  ammoType: string,
  count = 1
): PlayerCombatant {
  const ammo = combatant.ammo[ammoType]
  if (!ammo || ammo.current < count) {
    throw new Error(`Not enough ${ammoType} (have ${ammo?.current ?? 0}, need ${count})`)
  }
  return {
    ...combatant,
    ammo: {
      ...combatant.ammo,
      [ammoType]: { ...ammo, current: ammo.current - count },
    },
  }
}

export function recoverAmmo(
  combatant: PlayerCombatant,
  ammoType: string,
  count: number
): PlayerCombatant {
  const ammo = combatant.ammo[ammoType]
  if (!ammo) return combatant
  return {
    ...combatant,
    ammo: {
      ...combatant.ammo,
      [ammoType]: { ...ammo, current: Math.min(ammo.current + count, ammo.max) },
    },
  }
}

// ─── Feature Uses (Channel Divinity, etc.) ──────────────

export function useFeature(
  combatant: PlayerCombatant,
  featureName: string
): PlayerCombatant {
  const features = combatant.features.map((f) => {
    if (f.name !== featureName) return f
    if (f.uses_max === undefined || f.uses_remaining === undefined) return f
    if (f.uses_remaining <= 0) {
      throw new Error(`${featureName} has no uses remaining`)
    }
    return { ...f, uses_remaining: f.uses_remaining - 1 }
  })
  return { ...combatant, features }
}

// ─── Short Rest ─────────────────────────────────────────

export function shortRest(combatant: PlayerCombatant): PlayerCombatant {
  // Recover hit dice (up to half total, rounded down) - actual HP recovery is player choice
  // Recover short-rest features
  const features = combatant.features.map((f) => {
    if (f.recharge === 'short_rest' && f.uses_max !== undefined) {
      return { ...f, uses_remaining: f.uses_max }
    }
    return f
  })

  return {
    ...combatant,
    features,
    // Concentration drops during rest
    concentration_spell: null,
    conditions: combatant.conditions.filter(
      (c) => c !== 'frightened' && c !== 'charmed'
    ),
  }
}

// ─── Long Rest ──────────────────────────────────────────

export function longRest(combatant: PlayerCombatant): PlayerCombatant {
  // Recover all HP
  // Recover all spell slots
  // Recover all features
  // Recover half hit dice (rounded down, minimum 1)
  // Reduce exhaustion by 1

  const spell_slots: Record<string, SpellSlot> = {}
  for (const [level, slot] of Object.entries(combatant.spell_slots)) {
    spell_slots[level] = { max: slot.max, used: 0 }
  }

  const features = combatant.features.map((f) => {
    if (f.uses_max !== undefined) {
      return { ...f, uses_remaining: f.uses_max }
    }
    return f
  })

  // Exhaustion is tracked via exhaustion_level in CharacterStatus, not as a condition
  // Clear remaining conditions that end on long rest
  const conditions = combatant.conditions.filter(
    (c) => c !== 'unconscious' && c !== 'frightened' && c !== 'charmed'
  )

  return {
    ...combatant,
    current_hp: combatant.max_hp,
    temp_hp: 0,
    spell_slots,
    features,
    conditions,
    concentration_spell: null,
    death_saves: { successes: 0, failures: 0 },
  }
}

// ─── Token Autopopulate (from Open5E/dnd5eapi data) ────

export function createNPCFromCreatureData(data: {
  key?: string
  name: string
  armor_class: number
  hit_points: number
  hit_dice: string
  dexterity: number
  actions?: { name: string; attack_bonus?: number; damage_dice?: string }[]
  legendary_actions?: { name: string }[]
}): NPCCombatant {
  const dexMod = Math.floor((data.dexterity - 10) / 2)

  // Roll HP from hit dice
  const hdMatch = data.hit_dice.match(/^(\d+)d(\d+)/)
  let rolledHp = data.hit_points // fallback to average
  if (hdMatch) {
    const [, count, die] = hdMatch
    rolledHp = 0
    for (let i = 0; i < Number(count); i++) {
      rolledHp += Math.floor(Math.random() * Number(die)) + 1
    }
  }

  return {
    id: crypto.randomUUID(),
    name: data.name,
    initiative: 0,
    initiative_modifier: dexMod,
    max_hp: rolledHp,
    current_hp: rolledHp,
    temp_hp: 0,
    armor_class: data.armor_class,
    conditions: [],
    concentration_spell: null,
    is_npc: true,
    is_visible: true,
    creature_key: data.key,
    actions: (data.actions ?? []).map((a) => ({
      name: a.name,
      attack_bonus: a.attack_bonus ?? 0,
      damage: a.damage_dice ?? '0',
    })),
    legendary_actions_remaining: data.legendary_actions?.length,
    legendary_actions_max: data.legendary_actions?.length,
  }
}

// ─── Token Lock System ──────────────────────────────────

const lockedTokens = new Set<string>()

export function lockToken(combatantId: string): void {
  lockedTokens.add(combatantId)
}

export function unlockToken(combatantId: string): void {
  lockedTokens.delete(combatantId)
}

export function isTokenLocked(combatantId: string): boolean {
  return lockedTokens.has(combatantId)
}

export function toggleTokenLock(combatantId: string): boolean {
  if (lockedTokens.has(combatantId)) {
    lockedTokens.delete(combatantId)
    return false
  }
  lockedTokens.add(combatantId)
  return true
}
