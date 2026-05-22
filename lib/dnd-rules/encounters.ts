/**
 * D&D 5e Encounter Building — XP thresholds and difficulty math.
 * Source: SRD 5.1 / DMG.
 *
 * Used by Quest Builder to validate encounter scaling against the expected
 * party.
 */

export type EncounterDifficulty = 'easy' | 'medium' | 'hard' | 'deadly'

/** XP threshold per character per difficulty, indexed by character level. */
export const XP_THRESHOLDS_BY_LEVEL: Record<number, Record<EncounterDifficulty, number>> = {
  1:  { easy: 25,    medium: 50,    hard: 75,    deadly: 100 },
  2:  { easy: 50,    medium: 100,   hard: 150,   deadly: 200 },
  3:  { easy: 75,    medium: 150,   hard: 225,   deadly: 400 },
  4:  { easy: 125,   medium: 250,   hard: 375,   deadly: 500 },
  5:  { easy: 250,   medium: 500,   hard: 750,   deadly: 1100 },
  6:  { easy: 300,   medium: 600,   hard: 900,   deadly: 1400 },
  7:  { easy: 350,   medium: 750,   hard: 1100,  deadly: 1700 },
  8:  { easy: 450,   medium: 900,   hard: 1400,  deadly: 2100 },
  9:  { easy: 550,   medium: 1100,  hard: 1600,  deadly: 2400 },
  10: { easy: 600,   medium: 1200,  hard: 1900,  deadly: 2800 },
  11: { easy: 800,   medium: 1600,  hard: 2400,  deadly: 3600 },
  12: { easy: 1000,  medium: 2000,  hard: 3000,  deadly: 4500 },
  13: { easy: 1100,  medium: 2200,  hard: 3400,  deadly: 5100 },
  14: { easy: 1250,  medium: 2500,  hard: 3800,  deadly: 5700 },
  15: { easy: 1400,  medium: 2800,  hard: 4300,  deadly: 6400 },
  16: { easy: 1600,  medium: 3200,  hard: 4800,  deadly: 7200 },
  17: { easy: 2000,  medium: 3900,  hard: 5900,  deadly: 8800 },
  18: { easy: 2100,  medium: 4200,  hard: 6300,  deadly: 9500 },
  19: { easy: 2400,  medium: 4900,  hard: 7300,  deadly: 10900 },
  20: { easy: 2800,  medium: 5700,  hard: 8500,  deadly: 12700 },
}

/** Encounter multiplier based on monster count (DMG p82). */
export function encounterMultiplier(monsterCount: number, partySize: number): number {
  let base: number
  if (monsterCount === 1) base = 1
  else if (monsterCount === 2) base = 1.5
  else if (monsterCount <= 6) base = 2
  else if (monsterCount <= 10) base = 2.5
  else if (monsterCount <= 14) base = 3
  else base = 4
  // Small party (1-2 PCs) shifts multiplier up one row; large party (6+) shifts down.
  if (partySize < 3) {
    if (base === 1) return 1.5
    if (base === 1.5) return 2
    if (base === 2) return 2.5
    if (base === 2.5) return 3
    if (base === 3) return 4
    return 5
  }
  if (partySize >= 6) {
    if (base === 1) return 0.5
    if (base === 1.5) return 1
    if (base === 2) return 1.5
    if (base === 2.5) return 2
    if (base === 3) return 2.5
    return 3
  }
  return base
}

export interface PartyComposition {
  /** Character levels — array length = party size. */
  levels: number[]
}

export interface EncounterMonster {
  /** XP value of the monster from its CR. */
  xp: number
  count: number
}

export interface EncounterAssessment {
  partyThresholds: Record<EncounterDifficulty, number>
  rawXp: number
  adjustedXp: number
  difficulty: EncounterDifficulty | 'trivial' | 'tpk_likely'
}

export function assessEncounter(
  party: PartyComposition,
  monsters: EncounterMonster[],
): EncounterAssessment {
  const partyThresholds: Record<EncounterDifficulty, number> = {
    easy: 0, medium: 0, hard: 0, deadly: 0,
  }
  for (const lvl of party.levels) {
    const t = XP_THRESHOLDS_BY_LEVEL[Math.min(20, Math.max(1, lvl))]
    partyThresholds.easy += t.easy
    partyThresholds.medium += t.medium
    partyThresholds.hard += t.hard
    partyThresholds.deadly += t.deadly
  }
  const totalMonsters = monsters.reduce((s, m) => s + m.count, 0)
  const rawXp = monsters.reduce((s, m) => s + m.xp * m.count, 0)
  const multiplier = encounterMultiplier(totalMonsters, party.levels.length)
  const adjustedXp = Math.round(rawXp * multiplier)

  let difficulty: EncounterAssessment['difficulty']
  if (adjustedXp < partyThresholds.easy) difficulty = 'trivial'
  else if (adjustedXp < partyThresholds.medium) difficulty = 'easy'
  else if (adjustedXp < partyThresholds.hard) difficulty = 'medium'
  else if (adjustedXp < partyThresholds.deadly) difficulty = 'hard'
  else if (adjustedXp < partyThresholds.deadly * 1.5) difficulty = 'deadly'
  else difficulty = 'tpk_likely'

  return { partyThresholds, rawXp, adjustedXp, difficulty }
}

/** Standard CR → XP table (SRD/DMG). */
export const CR_XP_TABLE: Record<string, number> = {
  '0': 10,
  '1/8': 25,
  '1/4': 50,
  '1/2': 100,
  '1': 200,
  '2': 450,
  '3': 700,
  '4': 1100,
  '5': 1800,
  '6': 2300,
  '7': 2900,
  '8': 3900,
  '9': 5000,
  '10': 5900,
  '11': 7200,
  '12': 8400,
  '13': 10000,
  '14': 11500,
  '15': 13000,
  '16': 15000,
  '17': 18000,
  '18': 20000,
  '19': 22000,
  '20': 25000,
  '21': 33000,
  '22': 41000,
  '23': 50000,
  '24': 62000,
  '25': 75000,
  '26': 90000,
  '27': 105000,
  '28': 120000,
  '29': 135000,
  '30': 155000,
}

export function crToXp(cr: string | number): number {
  return CR_XP_TABLE[String(cr)] ?? 0
}
