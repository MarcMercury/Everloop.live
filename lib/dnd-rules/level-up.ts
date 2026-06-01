/**
 * Level-up rules helper. Self-contained because no existing module covers it.
 */

/** D&D 5e proficiency bonus by character level (1..20). */
export function proficiencyBonusForLevel(level: number): number {
  if (level >= 17) return 6
  if (level >= 13) return 5
  if (level >= 9) return 4
  if (level >= 5) return 3
  return 2
}

/** Class hit die (number of sides) — covers all 13 standard 2014/2024 classes. */
export const CLASS_HIT_DIE: Record<string, number> = {
  Artificer: 8,
  Barbarian: 12,
  Bard: 8,
  Cleric: 8,
  Druid: 8,
  Fighter: 10,
  Monk: 8,
  Paladin: 10,
  Ranger: 10,
  Rogue: 8,
  Sorcerer: 6,
  Warlock: 8,
  Wizard: 6,
}

export function hitDieForClass(className: string): number {
  return CLASS_HIT_DIE[className] ?? 8
}

/** ASI/feat levels per class. Standard 4/8/12/16/19; Fighter adds 6,14; Rogue adds 10. */
export function isAsiLevel(className: string, newLevel: number): boolean {
  const base = [4, 8, 12, 16, 19]
  const extras: Record<string, number[]> = { Fighter: [6, 14], Rogue: [10] }
  const all = [...base, ...(extras[className] ?? [])]
  return all.includes(newLevel)
}

/** Average HP gained on level-up (PHB rule: hit_die/2 + 1, rounded up). */
export function averageHpGain(hitDie: number, conMod: number): number {
  return Math.floor(hitDie / 2) + 1 + conMod
}

/** Roll HP gained on level-up. */
export function rollHpGain(hitDie: number, conMod: number): { roll: number; total: number } {
  const roll = Math.floor(Math.random() * hitDie) + 1
  return { roll, total: Math.max(1, roll + conMod) }
}
