/**
 * D&D 5e Combat Rules — assimilated from SRD 5.1 and Basic Rules 2018.
 * Provides pure helpers for the combat tracker, dice roller, and DM tools.
 */

export type Advantage = 'normal' | 'advantage' | 'disadvantage'

export interface AttackRollInput {
  attackBonus: number
  targetAC: number
  advantage?: Advantage
  /** D20 results to use deterministically (mostly for tests). */
  rolls?: [number] | [number, number]
}

export interface AttackRollResult {
  d20Rolls: number[]
  chosen: number
  total: number
  hits: boolean
  critical: boolean
  fumble: boolean
}

function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1
}

export function rollAttack({ attackBonus, targetAC, advantage = 'normal', rolls }: AttackRollInput): AttackRollResult {
  const d20Rolls: number[] =
    rolls ??
    (advantage === 'normal' ? [rollD20()] : [rollD20(), rollD20()])
  let chosen = d20Rolls[0]
  if (advantage === 'advantage') chosen = Math.max(...d20Rolls)
  if (advantage === 'disadvantage') chosen = Math.min(...d20Rolls)
  const total = chosen + attackBonus
  const critical = chosen === 20
  const fumble = chosen === 1
  return {
    d20Rolls,
    chosen,
    total,
    hits: critical ? true : fumble ? false : total >= targetAC,
    critical,
    fumble,
  }
}

/** Crits double the dice (not the modifier). */
export function rollDamage(diceFormula: string, modifier: number, critical: boolean): { rolls: number[]; total: number } {
  const match = /^(\d+)d(\d+)$/i.exec(diceFormula.trim())
  if (!match) return { rolls: [], total: modifier }
  const count = parseInt(match[1], 10) * (critical ? 2 : 1)
  const sides = parseInt(match[2], 10)
  const rolls: number[] = []
  for (let i = 0; i < count; i++) rolls.push(Math.floor(Math.random() * sides) + 1)
  const total = rolls.reduce((s, r) => s + r, 0) + modifier
  return { rolls, total }
}

export interface SaveRollInput {
  saveBonus: number
  dc: number
  advantage?: Advantage
  rolls?: [number] | [number, number]
}

export function rollSave({ saveBonus, dc, advantage = 'normal', rolls }: SaveRollInput) {
  const d20Rolls = rolls ?? (advantage === 'normal' ? [rollD20()] : [rollD20(), rollD20()])
  let chosen = d20Rolls[0]
  if (advantage === 'advantage') chosen = Math.max(...d20Rolls)
  if (advantage === 'disadvantage') chosen = Math.min(...d20Rolls)
  const total = chosen + saveBonus
  return { d20Rolls, chosen, total, success: total >= dc }
}

/** Cover rules — apply to AC and Dex saves. */
export const COVER_AC_BONUS = {
  none: 0,
  half: 2,        // +2 AC and +2 Dex saves
  three_quarters: 5, // +5 AC and +5 Dex saves
  total: Infinity, // can't be targeted directly
} as const

export type CoverLevel = keyof typeof COVER_AC_BONUS

/** Standard 5e DC scale (DMG). */
export const DIFFICULTY_DC = {
  trivial: 5,
  easy: 10,
  medium: 15,
  hard: 20,
  very_hard: 25,
  nearly_impossible: 30,
} as const
export type DifficultyDC = keyof typeof DIFFICULTY_DC

/** Standard 5e initiative: 1d20 + Dex modifier. */
export function rollInitiative(dexModifier: number): { roll: number; total: number } {
  const roll = rollD20()
  return { roll, total: roll + dexModifier }
}

/**
 * Death saves (PHB/SRD): 3 successes = stable, 3 failures = dead.
 * Nat 20 = regain 1 HP. Nat 1 counts as two failures. Damage taken while at
 * 0 HP = 1 automatic failure (2 if critical).
 */
export interface DeathSaveState {
  successes: number
  failures: number
  stable: boolean
  dead: boolean
}

export function applyDeathSaveRoll(state: DeathSaveState, d20: number): DeathSaveState {
  if (state.dead || state.stable) return state
  if (d20 === 20) return { successes: 0, failures: 0, stable: true, dead: false }
  if (d20 === 1) {
    const failures = state.failures + 2
    return { ...state, failures, dead: failures >= 3 }
  }
  if (d20 >= 10) {
    const successes = state.successes + 1
    return { ...state, successes, stable: successes >= 3 }
  }
  const failures = state.failures + 1
  return { ...state, failures, dead: failures >= 3 }
}

/** Opportunity attack trigger — see actions.ts for the action rules. */
export const OPPORTUNITY_ATTACK_RULES = [
  'Triggers when a hostile creature you can see leaves your reach using its movement.',
  'Disengage action suppresses the trigger for that turn.',
  'Teleportation and forced movement (Thunderwave push, etc.) do not provoke.',
  'The attack uses your reaction; you only get one reaction per round.',
] as const
