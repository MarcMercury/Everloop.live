/**
 * D&D 5e Spell Slot Tables — covers full, half, third casters and Warlock pact magic
 * Index: [classLevel - 1][spellLevel - 1] = number of slots
 * Example: FULL_CASTER_SLOTS[4][2] = 3rd-level slots for a 5th-level full caster = 3
 */

/** Full casters: Bard, Cleric, Druid, Sorcerer, Wizard */
export const FULL_CASTER_SLOTS: number[][] = [
  /* Lv 1  */ [2],
  /* Lv 2  */ [3],
  /* Lv 3  */ [4, 2],
  /* Lv 4  */ [4, 3],
  /* Lv 5  */ [4, 3, 2],
  /* Lv 6  */ [4, 3, 3],
  /* Lv 7  */ [4, 3, 3, 1],
  /* Lv 8  */ [4, 3, 3, 2],
  /* Lv 9  */ [4, 3, 3, 3, 1],
  /* Lv 10 */ [4, 3, 3, 3, 2],
  /* Lv 11 */ [4, 3, 3, 3, 2, 1],
  /* Lv 12 */ [4, 3, 3, 3, 2, 1],
  /* Lv 13 */ [4, 3, 3, 3, 2, 1, 1],
  /* Lv 14 */ [4, 3, 3, 3, 2, 1, 1],
  /* Lv 15 */ [4, 3, 3, 3, 2, 1, 1, 1],
  /* Lv 16 */ [4, 3, 3, 3, 2, 1, 1, 1],
  /* Lv 17 */ [4, 3, 3, 3, 2, 1, 1, 1, 1],
  /* Lv 18 */ [4, 3, 3, 3, 3, 1, 1, 1, 1],
  /* Lv 19 */ [4, 3, 3, 3, 3, 2, 1, 1, 1],
  /* Lv 20 */ [4, 3, 3, 3, 3, 2, 2, 1, 1],
]

/** Half casters: Paladin, Ranger (start casting at level 2), Artificer (starts at level 1 with half progression) */
export const HALF_CASTER_SLOTS: number[][] = [
  /* Lv 1  */ [],
  /* Lv 2  */ [2],
  /* Lv 3  */ [3],
  /* Lv 4  */ [3],
  /* Lv 5  */ [4, 2],
  /* Lv 6  */ [4, 2],
  /* Lv 7  */ [4, 3],
  /* Lv 8  */ [4, 3],
  /* Lv 9  */ [4, 3, 2],
  /* Lv 10 */ [4, 3, 2],
  /* Lv 11 */ [4, 3, 3],
  /* Lv 12 */ [4, 3, 3],
  /* Lv 13 */ [4, 3, 3, 1],
  /* Lv 14 */ [4, 3, 3, 1],
  /* Lv 15 */ [4, 3, 3, 2],
  /* Lv 16 */ [4, 3, 3, 2],
  /* Lv 17 */ [4, 3, 3, 3, 1],
  /* Lv 18 */ [4, 3, 3, 3, 1],
  /* Lv 19 */ [4, 3, 3, 3, 2],
  /* Lv 20 */ [4, 3, 3, 3, 2],
]

/** Artificer spell slots (half caster, but rounds UP instead of down — gets slots at level 1) */
export const ARTIFICER_SLOTS: number[][] = [
  /* Lv 1  */ [2],
  /* Lv 2  */ [2],
  /* Lv 3  */ [3],
  /* Lv 4  */ [3],
  /* Lv 5  */ [4, 2],
  /* Lv 6  */ [4, 2],
  /* Lv 7  */ [4, 3],
  /* Lv 8  */ [4, 3],
  /* Lv 9  */ [4, 3, 2],
  /* Lv 10 */ [4, 3, 2],
  /* Lv 11 */ [4, 3, 3],
  /* Lv 12 */ [4, 3, 3],
  /* Lv 13 */ [4, 3, 3, 1],
  /* Lv 14 */ [4, 3, 3, 1],
  /* Lv 15 */ [4, 3, 3, 2],
  /* Lv 16 */ [4, 3, 3, 2],
  /* Lv 17 */ [4, 3, 3, 3, 1],
  /* Lv 18 */ [4, 3, 3, 3, 1],
  /* Lv 19 */ [4, 3, 3, 3, 2],
  /* Lv 20 */ [4, 3, 3, 3, 2],
]

/** Third casters: Eldritch Knight (Fighter), Arcane Trickster (Rogue) — start casting at level 3 */
export const THIRD_CASTER_SLOTS: number[][] = [
  /* Lv 1  */ [],
  /* Lv 2  */ [],
  /* Lv 3  */ [2],
  /* Lv 4  */ [3],
  /* Lv 5  */ [3],
  /* Lv 6  */ [3],
  /* Lv 7  */ [4, 2],
  /* Lv 8  */ [4, 2],
  /* Lv 9  */ [4, 2],
  /* Lv 10 */ [4, 3],
  /* Lv 11 */ [4, 3],
  /* Lv 12 */ [4, 3],
  /* Lv 13 */ [4, 3, 2],
  /* Lv 14 */ [4, 3, 2],
  /* Lv 15 */ [4, 3, 2],
  /* Lv 16 */ [4, 3, 3],
  /* Lv 17 */ [4, 3, 3],
  /* Lv 18 */ [4, 3, 3],
  /* Lv 19 */ [4, 3, 3, 1],
  /* Lv 20 */ [4, 3, 3, 1],
]

/** Warlock Pact Magic — slots per level, all slots are same level */
export const WARLOCK_PACT_SLOTS: { slots: number; level: number }[] = [
  /* Lv 1  */ { slots: 1, level: 1 },
  /* Lv 2  */ { slots: 2, level: 1 },
  /* Lv 3  */ { slots: 2, level: 2 },
  /* Lv 4  */ { slots: 2, level: 2 },
  /* Lv 5  */ { slots: 2, level: 3 },
  /* Lv 6  */ { slots: 2, level: 3 },
  /* Lv 7  */ { slots: 2, level: 4 },
  /* Lv 8  */ { slots: 2, level: 4 },
  /* Lv 9  */ { slots: 2, level: 5 },
  /* Lv 10 */ { slots: 2, level: 5 },
  /* Lv 11 */ { slots: 3, level: 5 },
  /* Lv 12 */ { slots: 3, level: 5 },
  /* Lv 13 */ { slots: 3, level: 5 },
  /* Lv 14 */ { slots: 3, level: 5 },
  /* Lv 15 */ { slots: 3, level: 5 },
  /* Lv 16 */ { slots: 3, level: 5 },
  /* Lv 17 */ { slots: 4, level: 5 },
  /* Lv 18 */ { slots: 4, level: 5 },
  /* Lv 19 */ { slots: 4, level: 5 },
  /* Lv 20 */ { slots: 4, level: 5 },
]

type CasterType = 'full' | 'half' | 'third' | 'pact' | 'artificer'

const CLASS_CASTER_TYPE: Record<string, CasterType> = {
  Bard: 'full', Cleric: 'full', Druid: 'full', Sorcerer: 'full', Wizard: 'full',
  Paladin: 'half', Ranger: 'half',
  Artificer: 'artificer',
  Warlock: 'pact',
  // Fighter (Eldritch Knight) and Rogue (Arcane Trickster) are subclass-dependent
}

/** Get spell slots for a class at a given level. Returns array of slots per spell level (index 0 = 1st, etc.) */
export function getSpellSlots(className: string, classLevel: number, subclass?: string): number[] {
  const idx = Math.max(0, Math.min(19, classLevel - 1))

  // Check for third-caster subclasses
  if (className === 'Fighter' && subclass === 'Eldritch Knight') return THIRD_CASTER_SLOTS[idx]
  if (className === 'Rogue' && subclass === 'Arcane Trickster') return THIRD_CASTER_SLOTS[idx]

  const type = CLASS_CASTER_TYPE[className]
  if (!type) return []

  switch (type) {
    case 'full': return FULL_CASTER_SLOTS[idx]
    case 'half': return HALF_CASTER_SLOTS[idx]
    case 'artificer': return ARTIFICER_SLOTS[idx]
    case 'pact': {
      const pact = WARLOCK_PACT_SLOTS[idx]
      const result: number[] = Array(pact.level).fill(0)
      result[pact.level - 1] = pact.slots
      return result
    }
    case 'third': return THIRD_CASTER_SLOTS[idx]
    default: return []
  }
}

/** Get max spell level castable at a given class level */
export function getMaxSpellLevel(className: string, classLevel: number, subclass?: string): number {
  const slots = getSpellSlots(className, classLevel, subclass)
  for (let i = slots.length - 1; i >= 0; i--) {
    if (slots[i] > 0) return i + 1
  }
  return 0
}
