/**
 * Hydrate a `monster_stats` JSONB blob (snake_case from DB) into a typed
 * `MonsterStats` object. Handles both the new full schema and legacy minimal
 * monsters (pre-2025-01) by filling sensible defaults so the stat-block
 * renderer can run unconditionally.
 */

import {
  defaultAbilityScores,
  defaultLegendary,
  defaultSenses,
  crEntry,
  type MonsterStats,
  type MonsterAction,
  type MonsterTrait,
  type CreatureSize,
  type CreatureType,
} from './monsters'

type Raw = Record<string, unknown>

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

function hydrateAction(raw: unknown): MonsterAction {
  const r = (raw ?? {}) as Raw
  return {
    name: asString(r.name),
    description: asString(r.description),
    actionType: (asString(r.actionType ?? r.action_type, 'action') as MonsterAction['actionType']),
    damage: asString(r.damage) || undefined,
    attackBonus: typeof r.attackBonus === 'number' ? (r.attackBonus as number) : undefined,
    reach: typeof r.reach === 'number' ? (r.reach as number) : undefined,
    rangeNormal: typeof r.rangeNormal === 'number' ? (r.rangeNormal as number) : undefined,
    rangeLong: typeof r.rangeLong === 'number' ? (r.rangeLong as number) : undefined,
    targets: asString(r.targets) || undefined,
    saveAbility: (r.saveAbility as MonsterAction['saveAbility']) || undefined,
    saveDC: typeof r.saveDC === 'number' ? (r.saveDC as number) : undefined,
    saveEffect: asString(r.saveEffect) || undefined,
    recharge: asString(r.recharge) || undefined,
    legendaryCost:
      typeof r.legendaryCost === 'number' ? (r.legendaryCost as number) : undefined,
  }
}

function hydrateTrait(raw: unknown): MonsterTrait {
  // Legacy: traits were plain strings.
  if (typeof raw === 'string') {
    return { name: raw, description: '' }
  }
  const r = (raw ?? {}) as Raw
  return { name: asString(r.name), description: asString(r.description) }
}

/**
 * Convert a `monster_stats` JSONB blob (snake_case) into a typed
 * `MonsterStats` ready for the renderer. Returns null if `raw` is falsy.
 */
export function hydrateMonsterStats(raw: unknown): MonsterStats | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Raw

  const cr = asNumber(r.cr, 1)
  const entry = crEntry(cr)

  const stats: MonsterStats = {
    size: (asString(r.size, 'medium') as CreatureSize),
    creatureType: (asString(r.creature_type ?? r.creatureType, 'monstrosity') as CreatureType),
    subtype: asString(r.subtype) || undefined,
    alignment: asString(r.alignment, 'unaligned'),
    role: (asString(r.role, 'brute') as MonsterStats['role']),
    cr,
    xp: asNumber(r.xp, entry.xp),
    proficiencyBonus: asNumber(r.proficiency_bonus ?? r.proficiencyBonus, entry.proficiencyBonus),
    hp: asNumber(r.hp, 1),
    hitDice: asString(r.hit_dice ?? r.hitDice) || undefined,
    ac: asNumber(r.ac, 10),
    acSource: asString(r.ac_source ?? r.acSource) || undefined,
    damagePerRound: asString(r.damage_per_round ?? r.damagePerRound, '—'),
    movements: asArray<{ type: string; speed: number; note?: string }>(r.movements).map((m) => ({
      type: (m.type as MonsterStats['movements'][number]['type']) ?? 'walk',
      speed: asNumber(m.speed, 0),
      note: m.note,
    })),
    abilities: (r.abilities as MonsterStats['abilities']) ?? defaultAbilityScores(),
    savingThrows: (r.saving_throws ?? r.savingThrows ?? {}) as MonsterStats['savingThrows'],
    skills: asArray<{ name: string; bonus: number }>(r.skills),
    damageVulnerabilities: asArray<string>(r.damage_vulnerabilities ?? r.damageVulnerabilities),
    damageResistances: asArray<string>(r.damage_resistances ?? r.damageResistances),
    damageImmunities: asArray<string>(r.damage_immunities ?? r.damageImmunities),
    conditionImmunities: asArray<string>(r.condition_immunities ?? r.conditionImmunities),
    senses: (r.senses as MonsterStats['senses']) ?? defaultSenses(),
    languages: asArray<string>(r.languages),
    telepathy: typeof r.telepathy === 'number' ? (r.telepathy as number) : undefined,
    multiattack: asString(r.multiattack) || undefined,
    traits: asArray<unknown>(r.traits).map(hydrateTrait),
    actions: asArray<unknown>(r.actions).map(hydrateAction),
    bonusActions: asArray<unknown>(r.bonus_actions ?? r.bonusActions).map(hydrateAction),
    reactions: asArray<unknown>(r.reactions).map(hydrateAction),
    legendaryActions: (() => {
      const la = (r.legendary_actions ?? r.legendaryActions) as Raw | undefined
      if (!la) return defaultLegendary()
      return {
        count: asNumber(la.count, 0),
        description: asString(la.description) || undefined,
        actions: asArray<unknown>(la.actions).map(hydrateAction),
      }
    })(),
    lairActions: (() => {
      const la = (r.lair_actions ?? r.lairActions) as Raw | undefined
      if (!la) return undefined
      return {
        description: asString(la.description) || undefined,
        actions: asArray<unknown>(la.actions).map(hydrateAction),
      }
    })(),
    tactics: asString(r.tactics) || undefined,
    weaknesses: asArray<string>(r.weaknesses),
    regionId: asString(r.region_id ?? r.regionId, 'bellroot'),
    isOneOff: Boolean(r.is_one_off ?? r.isOneOff),
    whatBrokeHere: asString(r.what_broke_here ?? r.whatBrokeHere),
    whatLeakedThrough: asString(r.what_leaked_through ?? r.whatLeakedThrough),
    drawnTo: asString(r.drawn_to ?? r.drawnTo),
  }

  return stats
}
