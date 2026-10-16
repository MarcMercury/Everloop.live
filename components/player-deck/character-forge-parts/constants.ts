import { Check, Swords, User, BookOpen, Backpack, Dices, Wand2 } from 'lucide-react'

export const STEPS = [
  { id: 'race', label: 'Race', icon: User, description: 'Choose your origin' },
  { id: 'class', label: 'Class', icon: Swords, description: 'Pick your calling' },
  { id: 'abilities', label: 'Abilities', icon: Dices, description: 'Set your scores' },
  { id: 'description', label: 'Description', icon: BookOpen, description: 'Shape your story' },
  { id: 'equipment', label: 'Equipment', icon: Backpack, description: 'Arm yourself' },
  { id: 'spells', label: 'Spells', icon: Wand2, description: 'Choose your magic' },
  { id: 'review', label: 'Review', icon: Check, description: 'Finalize' },
] as const

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]
export const POINT_BUY_MAX = 27
export const POINT_COSTS: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 }

export const ABILITY_NAMES = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'] as const
export const ABILITY_SHORT = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const
export const ABILITY_DESCRIPTIONS: Record<string, string> = {
  Strength: 'Physical power, athletics, melee attacks',
  Dexterity: 'Agility, reflexes, ranged attacks, AC',
  Constitution: 'Health, stamina, hit points',
  Intelligence: 'Memory, logic, arcane knowledge',
  Wisdom: 'Perception, intuition, divine magic',
  Charisma: 'Personality, leadership, social magic',
}


export const RACE_INFO: Record<string, { description: string; traits: string[]; speed: number }> = {
  Human: { description: 'Versatile and ambitious, humans are the most common race.', traits: ['+1 to all ability scores', 'Extra language', 'Extra skill proficiency'], speed: 30 },
  Elf: { description: 'Graceful and long-lived, elves are attuned to magic.', traits: ['+2 Dexterity', 'Darkvision 60ft', 'Fey Ancestry', 'Trance (4hr rest)'], speed: 30 },
  Dwarf: { description: 'Tough and resilient, dwarves are master artisans.', traits: ['+2 Constitution', 'Darkvision 60ft', 'Dwarven Resilience', 'Stonecunning'], speed: 25 },
  Halfling: { description: 'Small but brave, halflings are remarkably lucky.', traits: ['+2 Dexterity', 'Lucky (reroll nat 1)', 'Brave', 'Halfling Nimbleness'], speed: 25 },
  'Half-Elf': { description: 'Combining human ambition with elven grace.', traits: ['+2 Charisma, +1 to two others', 'Darkvision 60ft', 'Fey Ancestry', '2 extra skill proficiencies'], speed: 30 },
  'Half-Orc': { description: 'Fierce warriors with orcish strength and human resolve.', traits: ['+2 Strength, +1 Constitution', 'Darkvision 60ft', 'Relentless Endurance', 'Savage Attacks'], speed: 30 },
  Dragonborn: { description: 'Proud draconic warriors with a breath weapon.', traits: ['+2 Strength, +1 Charisma', 'Breath Weapon', 'Damage Resistance (by ancestry)'], speed: 30 },
  Gnome: { description: 'Tinkerers and illusionists, small but clever.', traits: ['+2 Intelligence', 'Darkvision 60ft', 'Gnome Cunning'], speed: 25 },
  Tiefling: { description: 'Infernally touched with innate magical abilities.', traits: ['+2 Charisma, +1 Intelligence', 'Darkvision 60ft', 'Hellish Resistance', 'Infernal Legacy'], speed: 30 },
  Goliath: { description: "Mountain-born giants with incredible endurance.", traits: ['+2 Strength, +1 Constitution', "Stone's Endurance", 'Powerful Build', 'Mountain Born'], speed: 30 },
  Aasimar: { description: 'Celestial-touched beings with divine power.', traits: ['+2 Charisma', 'Darkvision 60ft', 'Celestial Resistance', 'Healing Hands', 'Light Bearer'], speed: 30 },
  Tabaxi: { description: 'Cat-like wanderers driven by curiosity.', traits: ['+2 Dexterity, +1 Charisma', 'Darkvision 60ft', "Cat's Claws", 'Feline Agility'], speed: 30 },
}

export const CLASS_INFO: Record<string, { description: string; hitDie: string; primaryAbility: string; saves: string; features: string[] }> = {
  Fighter: { description: 'Masters of martial combat and tactical warfare.', hitDie: 'd10', primaryAbility: 'Strength or Dexterity', saves: 'STR, CON', features: ['Fighting Style', 'Second Wind', 'Action Surge (Lv2)'] },
  Wizard: { description: 'Scholarly mages who bend reality through study.', hitDie: 'd6', primaryAbility: 'Intelligence', saves: 'INT, WIS', features: ['Spellcasting', 'Arcane Recovery', 'Arcane Tradition (Lv2)'] },
  Rogue: { description: 'Cunning tricksters and deadly assassins.', hitDie: 'd8', primaryAbility: 'Dexterity', saves: 'DEX, INT', features: ['Sneak Attack', 'Thieves\' Cant', 'Cunning Action (Lv2)'] },
  Cleric: { description: 'Divine servants who channel the power of their gods.', hitDie: 'd8', primaryAbility: 'Wisdom', saves: 'WIS, CHA', features: ['Spellcasting', 'Divine Domain', 'Channel Divinity (Lv2)'] },
  Ranger: { description: 'Wilderness warriors who hunt dangerous foes.', hitDie: 'd10', primaryAbility: 'Dexterity & Wisdom', saves: 'STR, DEX', features: ['Favored Enemy', 'Natural Explorer', 'Spellcasting (Lv2)'] },
  Paladin: { description: 'Holy warriors bound by sacred oaths.', hitDie: 'd10', primaryAbility: 'Strength & Charisma', saves: 'WIS, CHA', features: ['Divine Sense', 'Lay on Hands', 'Spellcasting (Lv2)'] },
  Barbarian: { description: 'Fierce warriors fueled by primal rage.', hitDie: 'd12', primaryAbility: 'Strength', saves: 'STR, CON', features: ['Rage', 'Unarmored Defense', 'Reckless Attack (Lv2)'] },
  Bard: { description: 'Charismatic performers wielding magic through art.', hitDie: 'd8', primaryAbility: 'Charisma', saves: 'DEX, CHA', features: ['Spellcasting', 'Bardic Inspiration', 'Jack of All Trades (Lv2)'] },
  Sorcerer: { description: 'Innate spellcasters with raw magical power.', hitDie: 'd6', primaryAbility: 'Charisma', saves: 'CON, CHA', features: ['Spellcasting', 'Sorcerous Origin', 'Font of Magic (Lv2)'] },
  Warlock: { description: 'Seekers of forbidden knowledge through pacts.', hitDie: 'd8', primaryAbility: 'Charisma', saves: 'WIS, CHA', features: ['Pact Magic', 'Eldritch Invocations (Lv2)', 'Pact Boon (Lv3)'] },
  Druid: { description: 'Nature guardians who channel primal magic.', hitDie: 'd8', primaryAbility: 'Wisdom', saves: 'INT, WIS', features: ['Spellcasting', 'Druidic', 'Wild Shape (Lv2)'] },
  Monk: { description: 'Martial artists who harness ki energy.', hitDie: 'd8', primaryAbility: 'Dexterity & Wisdom', saves: 'STR, DEX', features: ['Unarmored Defense', 'Martial Arts', 'Ki (Lv2)'] },
  Artificer: { description: 'Magical inventors who infuse objects with power.', hitDie: 'd8', primaryAbility: 'Intelligence', saves: 'CON, INT', features: ['Magical Tinkering', 'Spellcasting', 'Infuse Item (Lv2)'] },
}

export const HIT_DIE_MAP: Record<string, number> = {
  'd6': 6, 'd8': 8, 'd10': 10, 'd12': 12,
}

/** Display-name keyed skill reference for study popovers in the forge. */
export const SKILL_STUDY: Record<string, { ability: string; desc: string }> = {
  'Acrobatics': { ability: 'Dexterity', desc: 'Stay on your feet in tricky situations — balancing, tumbling, diving, and other acrobatic stunts.' },
  'Animal Handling': { ability: 'Wisdom', desc: 'Calm, control, or read the intentions of a domesticated animal, or keep a mount under control.' },
  'Arcana': { ability: 'Intelligence', desc: 'Recall lore about spells, magic items, eldritch symbols, magical traditions, and the planes.' },
  'Athletics': { ability: 'Strength', desc: 'Climbing, jumping, swimming, grappling, and other feats of physical exertion.' },
  'Deception': { ability: 'Charisma', desc: 'Convincingly hide the truth through words or actions — lies, disguises, and misdirection.' },
  'History': { ability: 'Intelligence', desc: 'Recall lore about historical events, legendary people, ancient kingdoms, wars, and civilizations.' },
  'Insight': { ability: 'Wisdom', desc: 'Determine the true intentions of a creature — detecting lies or predicting its next move.' },
  'Intimidation': { ability: 'Charisma', desc: 'Influence someone through overt threats, hostile actions, or menacing presence.' },
  'Investigation': { ability: 'Intelligence', desc: 'Look for clues and make deductions — finding hidden objects, traps, or weak points.' },
  'Medicine': { ability: 'Wisdom', desc: 'Stabilize a dying companion or diagnose an illness.' },
  'Nature': { ability: 'Intelligence', desc: 'Recall lore about terrain, plants, animals, the weather, and natural cycles.' },
  'Perception': { ability: 'Wisdom', desc: 'Spot, hear, or otherwise detect the presence of something using your senses.' },
  'Performance': { ability: 'Charisma', desc: 'Delight an audience with music, dance, acting, storytelling, or other entertainment.' },
  'Persuasion': { ability: 'Charisma', desc: 'Influence someone with tact, social grace, or good nature — friendly negotiation and etiquette.' },
  'Religion': { ability: 'Intelligence', desc: 'Recall lore about deities, rites, prayers, religious hierarchies, holy symbols, and cults.' },
  'Sleight of Hand': { ability: 'Dexterity', desc: 'Perform an act of legerdemain or manual trickery — planting an object, picking a pocket, or concealing a weapon.' },
  'Stealth': { ability: 'Dexterity', desc: 'Conceal yourself from enemies, slip past guards, or sneak up on someone unnoticed.' },
  'Survival': { ability: 'Wisdom', desc: 'Follow tracks, hunt game, navigate the wilderness, and avoid natural hazards.' },
}
