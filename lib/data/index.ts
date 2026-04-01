/**
 * D&D 5e SRD Data Library — Central re-export
 * Import everything from 'lib/data/dnd' for convenience
 */

// Races
export { RACES, getRace, getRaceNames, getRaceAbilityBonuses, RACIAL_SPELLCASTING, getRacialSpells } from './races'
export type { RaceData, SubraceData, RaceTrait, RacialSpellEntry } from './races'

// Classes
export { CLASSES, getClass, getClassNames, isSpellcaster, getClassFeaturesAtLevel } from './classes'
export type { ClassData, ClassFeature, SubclassOption, SkillChoice, ClassSpellcasting } from './classes'

// Spell Slots
export { FULL_CASTER_SLOTS, HALF_CASTER_SLOTS, ARTIFICER_SLOTS, THIRD_CASTER_SLOTS, WARLOCK_PACT_SLOTS, getSpellSlots, getMaxSpellLevel } from './spell-slots'

// Spell Lists
export { CLASS_SPELLS, getAvailableSpells, getCantrips, getSpellsAtLevel, isSpellAvailable, getAllCantrips, getAllSpellsAtLevel } from './spell-lists'

// Spell Details (descriptions, metadata)
export { SPELL_DETAILS, lookupSpellDetail } from './spell-details'
export type { SpellDetail } from './spell-details'

// Equipment
export { WEAPONS, ARMOR, EQUIPMENT_PACKS, CLASS_STARTING_EQUIPMENT, getWeaponsByCategory, getArmorByType, canUseWeapon, canUseArmor } from './equipment'
export type { WeaponData, ArmorData, GearData, WeaponCategory } from './equipment'

// Backgrounds
export { BACKGROUNDS, getBackground, getBackgroundNames, getBackgroundSkills } from './backgrounds'
export type { BackgroundData } from './backgrounds'

// Feats
export { FEATS, getFeat, getFeatNames, getFeatsNoPrereq, meetsFeatPrereq } from './feats'
export type { FeatData } from './feats'

// Invocations (Warlock)
export { INVOCATIONS, getAvailableInvocations, getInvocationCount, getInvocation } from './invocations'
export type { InvocationData } from './invocations'

// Subclass Bonus Spells
export { SUBCLASS_SPELLS, getSubclassSpells, getSubclassBonusCantrips, getSubclassBonusSpells } from './subclass-spells'
export type { SubclassSpellGrant } from './subclass-spells'

// Fighting Styles & Battle Master Maneuvers
export { FIGHTING_STYLES, getFightingStyles, MANEUVERS, getManeuverCount, getSuperiorityDie } from './fighting-styles'
export type { FightingStyleData, ManeuverData } from './fighting-styles'
