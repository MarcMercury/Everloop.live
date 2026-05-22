/**
 * D&D 5e Spellcasting — SRD 5.1.
 *
 * This file encodes the structural rules around spellcasting (components,
 * concentration, slot economy, ritual casting). Individual spell data lives
 * elsewhere (Open5E API + custom Everloop overlays).
 */

export type SpellComponent = 'V' | 'S' | 'M'

export interface SpellCastContext {
  hasFreeHand: boolean       // for Somatic / Material without focus
  canSpeak: boolean          // for Verbal
  hasFocusOrPouch: boolean   // substitutes Material with no cost listed
  consumedMaterialAvailable: boolean // for spells with costly consumed materials
}

export function canSatisfyComponents(
  components: SpellComponent[],
  hasCostlyConsumed: boolean,
  ctx: SpellCastContext,
): { ok: true } | { ok: false; reason: string } {
  if (components.includes('V') && !ctx.canSpeak) return { ok: false, reason: 'Cannot speak — V component unmet.' }
  if (components.includes('S') && !ctx.hasFreeHand) return { ok: false, reason: 'No free hand — S component unmet.' }
  if (components.includes('M')) {
    if (hasCostlyConsumed && !ctx.consumedMaterialAvailable) {
      return { ok: false, reason: 'Required consumed material unavailable.' }
    }
    if (!hasCostlyConsumed && !ctx.hasFreeHand && !ctx.hasFocusOrPouch) {
      return { ok: false, reason: 'No focus, component pouch, or free hand — M component unmet.' }
    }
  }
  return { ok: true }
}

/**
 * Standard 5e spell slot progression for full casters (Wizard / Cleric / Druid
 * / Bard / Sorcerer). Half-casters and pact magic use their own tables.
 */
export const FULL_CASTER_SLOTS: Record<number, number[]> = {
  1:  [2],
  2:  [3],
  3:  [4, 2],
  4:  [4, 3],
  5:  [4, 3, 2],
  6:  [4, 3, 3],
  7:  [4, 3, 3, 1],
  8:  [4, 3, 3, 2],
  9:  [4, 3, 3, 3, 1],
  10: [4, 3, 3, 3, 2],
  11: [4, 3, 3, 3, 2, 1],
  12: [4, 3, 3, 3, 2, 1],
  13: [4, 3, 3, 3, 2, 1, 1],
  14: [4, 3, 3, 3, 2, 1, 1],
  15: [4, 3, 3, 3, 2, 1, 1, 1],
  16: [4, 3, 3, 3, 2, 1, 1, 1],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
}

export const CONCENTRATION_RULES = [
  'You can only concentrate on one spell at a time. Casting another concentration spell ends the first.',
  'Taking damage forces a Constitution save: DC 10 or half the damage taken (whichever is higher).',
  'Being incapacitated or killed ends concentration.',
  'Some environmental effects (heavy waves while at sea, etc.) require a save as the DM dictates.',
] as const

export const RITUAL_CASTING_RULES = [
  'Ritual spells take 10 minutes longer than the listed casting time.',
  'Casting a spell as a ritual does not expend a spell slot.',
  'You must have the ritual tag on the spell AND a class feature that allows ritual casting.',
] as const

export const BONUS_ACTION_SPELL_RULE =
  'If you cast a spell using a bonus action, you can only cast a cantrip with a casting time of 1 action on the same turn.'
