/**
 * D&D 5e SRD Data Library — Central re-export
 * Import everything from 'lib/data/dnd' for convenience
 */

// Races
export { RACES, getRace, getRaceNames, getRaceAbilityBonuses } from './races'
export type { RaceData, SubraceData, RaceTrait } from './races'

// Classes
export { CLASSES, getClass, getClassNames, isSpellcaster, getClassFeaturesAtLevel } from './classes'
export type { ClassData, ClassFeature, SubclassOption, SkillChoice, ClassSpellcasting } from './classes'

// Spell Slots
export { FULL_CASTER_SLOTS, HALF_CASTER_SLOTS, ARTIFICER_SLOTS, THIRD_CASTER_SLOTS, WARLOCK_PACT_SLOTS, getSpellSlots, getMaxSpellLevel } from './spell-slots'

// Spell Lists
export { CLASS_SPELLS, getAvailableSpells, getCantrips, getSpellsAtLevel, isSpellAvailable } from './spell-lists'

// Equipment
export { WEAPONS, ARMOR, EQUIPMENT_PACKS, CLASS_STARTING_EQUIPMENT, getWeaponsByCategory, getArmorByType, canUseWeapon, canUseArmor } from './equipment'
export type { WeaponData, ArmorData, GearData, WeaponCategory } from './equipment'

// Backgrounds
export { BACKGROUNDS, getBackground, getBackgroundNames, getBackgroundSkills } from './backgrounds'
export type { BackgroundData } from './backgrounds'

// Feats
export { FEATS, getFeat, getFeatNames, getFeatsNoPrereq, meetsFeatPrereq } from './feats'
export type { FeatData } from './feats'
