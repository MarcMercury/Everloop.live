import type { RegionId } from '@/lib/data/regions'
import {
  type Ability,
  type CreatureSize,
  type CreatureType,
  type MonsterAbilityScores,
  type MonsterAction,
  type MonsterMovement,
  type MonsterRole,
  type MonsterSenses,
  type MonsterStats,
  type MonsterTrait,
  crEntry,
} from '@/lib/dnd-rules/monsters'

export const toggleInList = (list: string[], item: string): string[] =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item]

export const blankAction = (kind: MonsterAction['actionType']): MonsterAction => ({
  name: '',
  description: '',
  damage: '',
  actionType: kind,
})

/** Raw wizard form values needed to assemble a {@link MonsterStats} payload. */
export interface MonsterStatsDraft {
  size: CreatureSize
  creatureType: CreatureType
  subtype: string
  alignment: string
  role: MonsterRole
  cr: number
  hp: number
  hitDice: string
  ac: number
  acSource: string
  movements: MonsterMovement[]
  abilities: MonsterAbilityScores
  savingThrows: Partial<Record<Ability, number>>
  skills: Array<{ name: string; bonus: number }>
  damageVulnerabilities: string[]
  damageResistances: string[]
  damageImmunities: string[]
  conditionImmunities: string[]
  senses: MonsterSenses
  languages: string[]
  telepathy: number | undefined
  damagePerRound: string
  multiattack: string
  traits: MonsterTrait[]
  actions: MonsterAction[]
  bonusActions: MonsterAction[]
  reactions: MonsterAction[]
  hasLegendary: boolean
  legendaryActions: { count: number; description?: string; actions: MonsterAction[] }
  tactics: string
  weaknesses: string[]
  regionId: RegionId
  isOneOff: boolean
  whatBrokeHere: string
  whatLeakedThrough: string
  drawnTo: string
}

/**
 * Builds the cleaned stat block shared by the save payload and the live
 * preview: trims optional strings and drops empty list entries.
 */
export function buildMonsterStats(d: MonsterStatsDraft): MonsterStats {
  const entry = crEntry(d.cr)
  return {
    size: d.size,
    creatureType: d.creatureType,
    subtype: d.subtype.trim() || undefined,
    alignment: d.alignment,
    role: d.role,
    cr: d.cr,
    xp: entry.xp,
    proficiencyBonus: entry.proficiencyBonus,
    hp: d.hp,
    hitDice: d.hitDice.trim() || undefined,
    ac: d.ac,
    acSource: d.acSource.trim() || undefined,
    movements: d.movements,
    abilities: d.abilities,
    savingThrows: d.savingThrows,
    skills: d.skills,
    damageVulnerabilities: d.damageVulnerabilities,
    damageResistances: d.damageResistances,
    damageImmunities: d.damageImmunities,
    conditionImmunities: d.conditionImmunities,
    senses: d.senses,
    languages: d.languages.filter((l) => l.trim()),
    telepathy: d.telepathy,
    damagePerRound: d.damagePerRound,
    multiattack: d.multiattack.trim() || undefined,
    traits: d.traits.filter((t) => t.name.trim() || t.description.trim()),
    actions: d.actions.filter((a) => a.name.trim()),
    bonusActions: d.bonusActions.filter((a) => a.name.trim()),
    reactions: d.reactions.filter((a) => a.name.trim()),
    legendaryActions: d.hasLegendary
      ? {
          count: d.legendaryActions.count,
          description: d.legendaryActions.description,
          actions: d.legendaryActions.actions.filter((a) => a.name.trim()),
        }
      : { count: 0, actions: [] },
    tactics: d.tactics.trim() || undefined,
    weaknesses: d.weaknesses.filter((w) => w.trim()),
    regionId: d.regionId,
    isOneOff: d.isOneOff,
    whatBrokeHere: d.whatBrokeHere,
    whatLeakedThrough: d.whatLeakedThrough,
    drawnTo: d.drawnTo,
  }
}
