/**
 * D&D 5e Rest Rules — SRD 5.1 / Basic Rules 2018.
 */

export interface ShortRestResult {
  hitDiceSpent: number
  hpRegained: number
  featuresRestored: string[]
}

/**
 * Short rest: at least 1 hour. Players may spend hit dice to recover HP.
 * Some class features recharge on short rest (Warlock slots, Fighter Second
 * Wind, etc.). The DM tracks which.
 */
export const SHORT_REST_RULES = [
  'A short rest is a period of at least 1 hour of light activity (eating, drinking, reading, tending wounds).',
  'A character can spend one or more Hit Dice; each spent die regains hp equal to the die roll + Con modifier.',
  'Features that say "regains its use after a short rest" recharge.',
  'A character cannot benefit from more than one rest in a row without intervening activity.',
] as const

/**
 * Long rest: at least 8 hours (most of it sleep, up to 2 hours light activity).
 * Full HP, half max Hit Dice recovered (minimum 1), spell slots restored,
 * exhaustion reduced by 1 (with food and drink).
 */
export const LONG_REST_RULES = [
  'A long rest is a period of at least 8 hours, at least 6 hours of which must be sleep.',
  'On completion: HP fully restored; lost Hit Dice regained up to half the character\'s total (minimum 1).',
  'All expended spell slots restored.',
  'One level of exhaustion removed (provided the character has had some food and drink).',
  'A character must have at least 1 hp at the start of the rest to gain benefits.',
  'A character cannot benefit from more than one long rest in a 24-hour period.',
] as const

export function longRestHitDiceRegained(totalLevel: number, currentSpent: number): number {
  const regenerated = Math.max(1, Math.floor(totalLevel / 2))
  return Math.min(currentSpent, regenerated)
}
