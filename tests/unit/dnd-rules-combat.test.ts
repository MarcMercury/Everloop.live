import { describe, expect, it } from 'vitest'
import {
  applyDeathSaveRoll,
  rollAttack,
  rollDamage,
  rollSave,
  type DeathSaveState,
} from '@/lib/dnd-rules/combat'
import { longRestHitDiceRegained } from '@/lib/dnd-rules/rest'

describe('rollAttack', () => {
  it('hits when total meets AC', () => {
    expect(rollAttack({ attackBonus: 5, targetAC: 15, rolls: [10] }).hits).toBe(true)
    expect(rollAttack({ attackBonus: 5, targetAC: 16, rolls: [10] }).hits).toBe(false)
  })

  it('natural 20 always hits and is critical; natural 1 always misses', () => {
    const crit = rollAttack({ attackBonus: -5, targetAC: 30, rolls: [20] })
    expect(crit).toMatchObject({ hits: true, critical: true, fumble: false })
    const fumble = rollAttack({ attackBonus: 50, targetAC: 5, rolls: [1] })
    expect(fumble).toMatchObject({ hits: false, critical: false, fumble: true })
  })

  it('takes the higher die with advantage and the lower with disadvantage', () => {
    expect(rollAttack({ attackBonus: 0, targetAC: 10, advantage: 'advantage', rolls: [4, 17] }).chosen).toBe(17)
    expect(rollAttack({ attackBonus: 0, targetAC: 10, advantage: 'disadvantage', rolls: [4, 17] }).chosen).toBe(4)
  })
})

describe('rollSave', () => {
  it('succeeds when total meets DC', () => {
    expect(rollSave({ saveBonus: 3, dc: 13, rolls: [10] }).success).toBe(true)
    expect(rollSave({ saveBonus: 3, dc: 14, rolls: [10] }).success).toBe(false)
  })
})

describe('rollDamage', () => {
  it('doubles dice (not modifier) on a critical', () => {
    const normal = rollDamage('2d6', 3, false)
    const crit = rollDamage('2d6', 3, true)
    expect(normal.rolls).toHaveLength(2)
    expect(crit.rolls).toHaveLength(4)
    for (const r of crit.rolls) expect(r).toBeGreaterThanOrEqual(1)
    expect(crit.total).toBe(crit.rolls.reduce((a, b) => a + b, 0) + 3)
  })

  it('returns just the modifier for an unparseable formula', () => {
    expect(rollDamage('fireball', 4, false)).toEqual({ rolls: [], total: 4 })
  })
})

describe('applyDeathSaveRoll', () => {
  const fresh: DeathSaveState = { successes: 0, failures: 0, stable: false, dead: false }

  it('stabilises on three successes', () => {
    let s = fresh
    for (const roll of [10, 15, 12]) s = applyDeathSaveRoll(s, roll)
    expect(s).toMatchObject({ successes: 3, stable: true, dead: false })
  })

  it('counts a natural 1 as two failures', () => {
    const s = applyDeathSaveRoll(applyDeathSaveRoll(fresh, 1), 5)
    expect(s).toMatchObject({ failures: 3, dead: true })
  })

  it('natural 20 resets and stabilises', () => {
    const s = applyDeathSaveRoll({ ...fresh, failures: 2 }, 20)
    expect(s).toEqual({ successes: 0, failures: 0, stable: true, dead: false })
  })

  it('ignores rolls once dead or stable', () => {
    const dead = { ...fresh, failures: 3, dead: true }
    expect(applyDeathSaveRoll(dead, 20)).toBe(dead)
  })
})

describe('longRestHitDiceRegained', () => {
  it('regains half total level (minimum 1), capped at dice spent', () => {
    expect(longRestHitDiceRegained(5, 5)).toBe(2)
    expect(longRestHitDiceRegained(1, 1)).toBe(1)
    expect(longRestHitDiceRegained(10, 2)).toBe(2)
  })
})
