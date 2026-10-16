import { describe, expect, it } from 'vitest'
import {
  addCondition,
  applyDamage,
  applyHealing,
  concentrationSaveDC,
  expendSpellSlot,
  getHPStatus,
  longRest,
  nextTurn,
  removeCondition,
  type CombatState,
  type NPCCombatant,
  type PlayerCombatant,
} from '@/lib/combat-tracker'

function pc(overrides: Partial<PlayerCombatant> = {}): PlayerCombatant {
  return {
    id: 'pc', name: 'Rook', initiative: 15, initiative_modifier: 2,
    max_hp: 20, current_hp: 20, temp_hp: 0, armor_class: 14,
    conditions: [], concentration_spell: null, is_npc: false, is_visible: true,
    user_id: 'u1', character_id: 'c1', spell_slots: { '1': { max: 2, used: 0 } },
    features: [], ammo: {}, death_saves: { successes: 0, failures: 0 },
    ...overrides,
  }
}

function npc(id: string, overrides: Partial<NPCCombatant> = {}): NPCCombatant {
  return {
    id, name: id, initiative: 10, initiative_modifier: 0,
    max_hp: 10, current_hp: 10, temp_hp: 0, armor_class: 12,
    conditions: [], concentration_spell: null, is_npc: true, is_visible: true,
    actions: [], ...overrides,
  }
}

describe('applyDamage', () => {
  it('drains temp HP before real HP', () => {
    expect(applyDamage(pc({ temp_hp: 5 }), 3)).toMatchObject({ temp_hp: 2, current_hp: 20 })
    expect(applyDamage(pc({ temp_hp: 5 }), 8)).toMatchObject({ temp_hp: 0, current_hp: 17 })
  })

  it('never drops below 0 and makes PCs unconscious', () => {
    const downed = applyDamage(pc(), 50)
    expect(downed.current_hp).toBe(0)
    expect(downed.conditions).toContain('unconscious')
    expect(applyDamage(npc('g'), 50).conditions).not.toContain('unconscious')
  })
})

describe('applyHealing', () => {
  it('caps at max HP and wakes an unconscious PC', () => {
    const healed = applyHealing(pc({ current_hp: 0, conditions: ['unconscious'] }), 30)
    expect(healed.current_hp).toBe(20)
    expect(healed.conditions).not.toContain('unconscious')
  })
})

describe('getHPStatus', () => {
  it('maps HP ratio to aura status', () => {
    expect(getHPStatus(pc())).toBe('full')
    expect(getHPStatus(pc({ current_hp: 10 }))).toBe('healthy')
    expect(getHPStatus(pc({ current_hp: 5 }))).toBe('bloodied')
    expect(getHPStatus(pc({ current_hp: 4 }))).toBe('critical')
    expect(getHPStatus(pc({ current_hp: 0 }))).toBe('unconscious')
    expect(getHPStatus(npc('g', { current_hp: 0 }))).toBe('dead')
  })
})

describe('conditions', () => {
  it('adds idempotently and removes', () => {
    const once = addCondition(pc(), 'prone')
    expect(addCondition(once, 'prone').conditions).toEqual(['prone'])
    expect(removeCondition(once, 'prone').conditions).toEqual([])
  })
})

describe('concentrationSaveDC', () => {
  it('is 10 or half the damage, whichever is higher', () => {
    expect(concentrationSaveDC(8)).toBe(10)
    expect(concentrationSaveDC(30)).toBe(15)
  })
})

describe('spell slots and rests', () => {
  it('expends slots and throws when none remain', () => {
    const once = expendSpellSlot(pc(), '1')
    const twice = expendSpellSlot(once, '1')
    expect(twice.spell_slots['1'].used).toBe(2)
    expect(() => expendSpellSlot(twice, '1')).toThrow(/No 1 spell slots/)
  })

  it('long rest restores HP, slots, and death saves', () => {
    const rested = longRest(pc({
      current_hp: 3, temp_hp: 4, spell_slots: { '1': { max: 2, used: 2 } },
      death_saves: { successes: 1, failures: 2 }, conditions: ['unconscious', 'poisoned'],
    }))
    expect(rested).toMatchObject({ current_hp: 20, temp_hp: 0, death_saves: { successes: 0, failures: 0 } })
    expect(rested.spell_slots['1'].used).toBe(0)
    expect(rested.conditions).toEqual(['poisoned'])
  })
})

describe('nextTurn', () => {
  const base: CombatState = {
    id: 'c', quest_id: 'q', session_id: 's', round: 1, turn_index: 0,
    combatants: [pc(), npc('a'), npc('b')], is_active: true, started_at: '',
  }

  it('advances and wraps into the next round', () => {
    expect(nextTurn(base).turn_index).toBe(1)
    expect(nextTurn({ ...base, turn_index: 2 })).toMatchObject({ turn_index: 0, round: 2 })
  })

  it('skips dead NPCs', () => {
    const state = { ...base, combatants: [pc(), npc('a', { current_hp: 0 }), npc('b')] }
    expect(nextTurn(state).turn_index).toBe(2)
  })

  it('ends combat when nobody is left standing', () => {
    const state = {
      ...base,
      combatants: [npc('a', { current_hp: 0 }), npc('b', { current_hp: 0 })],
    }
    expect(nextTurn(state).is_active).toBe(false)
  })
})
