/**
 * D&D 5e Equipment Data — weapons, armor, and adventuring gear
 * Used by Character Forge for equipment selection and character sheet for stats
 */

export type WeaponCategory = 'Simple Melee' | 'Simple Ranged' | 'Martial Melee' | 'Martial Ranged'

export interface WeaponData {
  name: string
  category: WeaponCategory
  damage: string
  damageType: string
  weight: number
  cost: string
  properties: string[]
}

export interface ArmorData {
  name: string
  type: 'Light' | 'Medium' | 'Heavy' | 'Shield'
  ac: number | string  // number for base AC, string for formula like "11 + DEX"
  minStr?: number
  stealthDisadv: boolean
  weight: number
  cost: string
}

export interface GearData {
  name: string
  cost: string
  weight: number
}

export const WEAPONS: WeaponData[] = [
  // Simple Melee
  { name: 'Club', category: 'Simple Melee', damage: '1d4', damageType: 'bludgeoning', weight: 2, cost: '1 sp', properties: ['Light'] },
  { name: 'Dagger', category: 'Simple Melee', damage: '1d4', damageType: 'piercing', weight: 1, cost: '2 gp', properties: ['Finesse', 'Light', 'Thrown (20/60)'] },
  { name: 'Greatclub', category: 'Simple Melee', damage: '1d8', damageType: 'bludgeoning', weight: 10, cost: '2 sp', properties: ['Two-Handed'] },
  { name: 'Handaxe', category: 'Simple Melee', damage: '1d6', damageType: 'slashing', weight: 2, cost: '5 gp', properties: ['Light', 'Thrown (20/60)'] },
  { name: 'Javelin', category: 'Simple Melee', damage: '1d6', damageType: 'piercing', weight: 2, cost: '5 sp', properties: ['Thrown (30/120)'] },
  { name: 'Light Hammer', category: 'Simple Melee', damage: '1d4', damageType: 'bludgeoning', weight: 2, cost: '2 gp', properties: ['Light', 'Thrown (20/60)'] },
  { name: 'Mace', category: 'Simple Melee', damage: '1d6', damageType: 'bludgeoning', weight: 4, cost: '5 gp', properties: [] },
  { name: 'Quarterstaff', category: 'Simple Melee', damage: '1d6', damageType: 'bludgeoning', weight: 4, cost: '2 sp', properties: ['Versatile (1d8)'] },
  { name: 'Sickle', category: 'Simple Melee', damage: '1d4', damageType: 'slashing', weight: 2, cost: '1 gp', properties: ['Light'] },
  { name: 'Spear', category: 'Simple Melee', damage: '1d6', damageType: 'piercing', weight: 3, cost: '1 gp', properties: ['Thrown (20/60)', 'Versatile (1d8)'] },

  // Simple Ranged
  { name: 'Light Crossbow', category: 'Simple Ranged', damage: '1d8', damageType: 'piercing', weight: 5, cost: '25 gp', properties: ['Ammunition (80/320)', 'Loading', 'Two-Handed'] },
  { name: 'Dart', category: 'Simple Ranged', damage: '1d4', damageType: 'piercing', weight: 0.25, cost: '5 cp', properties: ['Finesse', 'Thrown (20/60)'] },
  { name: 'Shortbow', category: 'Simple Ranged', damage: '1d6', damageType: 'piercing', weight: 2, cost: '25 gp', properties: ['Ammunition (80/320)', 'Two-Handed'] },
  { name: 'Sling', category: 'Simple Ranged', damage: '1d4', damageType: 'bludgeoning', weight: 0, cost: '1 sp', properties: ['Ammunition (30/120)'] },

  // Martial Melee
  { name: 'Battleaxe', category: 'Martial Melee', damage: '1d8', damageType: 'slashing', weight: 4, cost: '10 gp', properties: ['Versatile (1d10)'] },
  { name: 'Flail', category: 'Martial Melee', damage: '1d8', damageType: 'bludgeoning', weight: 2, cost: '10 gp', properties: [] },
  { name: 'Glaive', category: 'Martial Melee', damage: '1d10', damageType: 'slashing', weight: 6, cost: '20 gp', properties: ['Heavy', 'Reach', 'Two-Handed'] },
  { name: 'Greataxe', category: 'Martial Melee', damage: '1d12', damageType: 'slashing', weight: 7, cost: '30 gp', properties: ['Heavy', 'Two-Handed'] },
  { name: 'Greatsword', category: 'Martial Melee', damage: '2d6', damageType: 'slashing', weight: 6, cost: '50 gp', properties: ['Heavy', 'Two-Handed'] },
  { name: 'Halberd', category: 'Martial Melee', damage: '1d10', damageType: 'slashing', weight: 6, cost: '20 gp', properties: ['Heavy', 'Reach', 'Two-Handed'] },
  { name: 'Lance', category: 'Martial Melee', damage: '1d12', damageType: 'piercing', weight: 6, cost: '10 gp', properties: ['Reach', 'Special'] },
  { name: 'Longsword', category: 'Martial Melee', damage: '1d8', damageType: 'slashing', weight: 3, cost: '15 gp', properties: ['Versatile (1d10)'] },
  { name: 'Maul', category: 'Martial Melee', damage: '2d6', damageType: 'bludgeoning', weight: 10, cost: '10 gp', properties: ['Heavy', 'Two-Handed'] },
  { name: 'Morningstar', category: 'Martial Melee', damage: '1d8', damageType: 'piercing', weight: 4, cost: '15 gp', properties: [] },
  { name: 'Pike', category: 'Martial Melee', damage: '1d10', damageType: 'piercing', weight: 18, cost: '5 gp', properties: ['Heavy', 'Reach', 'Two-Handed'] },
  { name: 'Rapier', category: 'Martial Melee', damage: '1d8', damageType: 'piercing', weight: 2, cost: '25 gp', properties: ['Finesse'] },
  { name: 'Scimitar', category: 'Martial Melee', damage: '1d6', damageType: 'slashing', weight: 3, cost: '25 gp', properties: ['Finesse', 'Light'] },
  { name: 'Shortsword', category: 'Martial Melee', damage: '1d6', damageType: 'piercing', weight: 2, cost: '10 gp', properties: ['Finesse', 'Light'] },
  { name: 'Trident', category: 'Martial Melee', damage: '1d6', damageType: 'piercing', weight: 4, cost: '5 gp', properties: ['Thrown (20/60)', 'Versatile (1d8)'] },
  { name: 'War Pick', category: 'Martial Melee', damage: '1d8', damageType: 'piercing', weight: 2, cost: '5 gp', properties: [] },
  { name: 'Warhammer', category: 'Martial Melee', damage: '1d8', damageType: 'bludgeoning', weight: 2, cost: '15 gp', properties: ['Versatile (1d10)'] },
  { name: 'Whip', category: 'Martial Melee', damage: '1d4', damageType: 'slashing', weight: 3, cost: '2 gp', properties: ['Finesse', 'Reach'] },

  // Martial Ranged
  { name: 'Blowgun', category: 'Martial Ranged', damage: '1', damageType: 'piercing', weight: 1, cost: '10 gp', properties: ['Ammunition (25/100)', 'Loading'] },
  { name: 'Hand Crossbow', category: 'Martial Ranged', damage: '1d6', damageType: 'piercing', weight: 3, cost: '75 gp', properties: ['Ammunition (30/120)', 'Light', 'Loading'] },
  { name: 'Heavy Crossbow', category: 'Martial Ranged', damage: '1d10', damageType: 'piercing', weight: 18, cost: '50 gp', properties: ['Ammunition (100/400)', 'Heavy', 'Loading', 'Two-Handed'] },
  { name: 'Longbow', category: 'Martial Ranged', damage: '1d8', damageType: 'piercing', weight: 2, cost: '50 gp', properties: ['Ammunition (150/600)', 'Heavy', 'Two-Handed'] },
  { name: 'Net', category: 'Martial Ranged', damage: '—', damageType: '—', weight: 3, cost: '1 gp', properties: ['Special', 'Thrown (5/15)'] },
]

export const ARMOR: ArmorData[] = [
  // Light Armor
  { name: 'Padded', type: 'Light', ac: '11 + DEX', stealthDisadv: true, weight: 8, cost: '5 gp' },
  { name: 'Leather', type: 'Light', ac: '11 + DEX', stealthDisadv: false, weight: 10, cost: '10 gp' },
  { name: 'Studded Leather', type: 'Light', ac: '12 + DEX', stealthDisadv: false, weight: 13, cost: '45 gp' },

  // Medium Armor
  { name: 'Hide', type: 'Medium', ac: '12 + DEX (max 2)', stealthDisadv: false, weight: 12, cost: '10 gp' },
  { name: 'Chain Shirt', type: 'Medium', ac: '13 + DEX (max 2)', stealthDisadv: false, weight: 20, cost: '50 gp' },
  { name: 'Scale Mail', type: 'Medium', ac: '14 + DEX (max 2)', stealthDisadv: true, weight: 45, cost: '50 gp' },
  { name: 'Breastplate', type: 'Medium', ac: '14 + DEX (max 2)', stealthDisadv: false, weight: 20, cost: '400 gp' },
  { name: 'Half Plate', type: 'Medium', ac: '15 + DEX (max 2)', stealthDisadv: true, weight: 40, cost: '750 gp' },

  // Heavy Armor
  { name: 'Ring Mail', type: 'Heavy', ac: 14, stealthDisadv: true, weight: 40, cost: '30 gp' },
  { name: 'Chain Mail', type: 'Heavy', ac: 16, minStr: 13, stealthDisadv: true, weight: 55, cost: '75 gp' },
  { name: 'Splint', type: 'Heavy', ac: 17, minStr: 15, stealthDisadv: true, weight: 60, cost: '200 gp' },
  { name: 'Plate', type: 'Heavy', ac: 18, minStr: 15, stealthDisadv: true, weight: 65, cost: '1500 gp' },

  // Shield
  { name: 'Shield', type: 'Shield', ac: 2, stealthDisadv: false, weight: 6, cost: '10 gp' },
]

export const EQUIPMENT_PACKS: Record<string, { name: string; items: string[] }> = {
  "Burglar's Pack": { name: "Burglar's Pack", items: ['Backpack', 'Bag of 1,000 ball bearings', 'String (10 ft)', 'Bell', 'Candles (5)', 'Crowbar', 'Hammer', 'Pitons (10)', 'Hooded lantern', 'Oil flasks (2)', 'Rations (5 days)', 'Tinderbox', 'Waterskin', 'Rope, hempen (50 ft)'] },
  "Diplomat's Pack": { name: "Diplomat's Pack", items: ['Chest', 'Cases for maps/scrolls (2)', 'Fine clothes', 'Ink bottle', 'Ink pen', 'Lamp', 'Oil flasks (2)', 'Paper sheets (5)', 'Perfume vial', 'Sealing wax', 'Soap'] },
  "Dungeoneer's Pack": { name: "Dungeoneer's Pack", items: ['Backpack', 'Crowbar', 'Hammer', 'Pitons (10)', 'Torches (10)', 'Tinderbox', 'Rations (10 days)', 'Waterskin', 'Rope, hempen (50 ft)'] },
  "Entertainer's Pack": { name: "Entertainer's Pack", items: ['Backpack', 'Bedroll', 'Costumes (2)', 'Candles (5)', 'Rations (5 days)', 'Waterskin', 'Disguise kit'] },
  "Explorer's Pack": { name: "Explorer's Pack", items: ['Backpack', 'Bedroll', 'Mess kit', 'Tinderbox', 'Torches (10)', 'Rations (10 days)', 'Waterskin', 'Rope, hempen (50 ft)'] },
  "Priest's Pack": { name: "Priest's Pack", items: ['Backpack', 'Blanket', 'Candles (10)', 'Tinderbox', 'Alms box', 'Incense blocks (2)', 'Censer', 'Vestments', 'Rations (2 days)', 'Waterskin'] },
  "Scholar's Pack": { name: "Scholar's Pack", items: ['Backpack', 'Book of lore', 'Ink bottle', 'Ink pen', 'Parchment sheets (10)', 'Bag of sand', 'Small knife'] },
}

/** Class starting equipment suggestions */
export const CLASS_STARTING_EQUIPMENT: Record<string, string[][]> = {
  Barbarian: [['Greataxe', 'OR any martial melee weapon'], ['Two handaxes', 'OR any simple weapon'], ["Explorer's Pack"], ['Four javelins']],
  Bard: [['Rapier', 'OR longsword', 'OR any simple weapon'], ["Diplomat's Pack", "OR Entertainer's Pack"], ['Lute', 'OR any musical instrument'], ['Leather armor', 'Dagger']],
  Cleric: [['Mace', 'OR warhammer (if proficient)'], ['Scale mail', 'OR leather armor', 'OR chain mail (if proficient)'], ['Light crossbow + 20 bolts', 'OR any simple weapon'], ["Priest's Pack", "OR Explorer's Pack"], ['Shield', 'Holy symbol']],
  Druid: [['Wooden shield', 'OR any simple weapon'], ['Scimitar', 'OR any simple melee weapon'], ['Leather armor', "Explorer's Pack", 'Druidic focus']],
  Fighter: [['Chain mail', 'OR leather armor + longbow + 20 arrows'], ['Martial weapon + shield', 'OR two martial weapons'], ['Light crossbow + 20 bolts', 'OR two handaxes'], ["Dungeoneer's Pack", "OR Explorer's Pack"]],
  Monk: [['Shortsword', 'OR any simple weapon'], ["Dungeoneer's Pack", "OR Explorer's Pack"], ['10 darts']],
  Paladin: [['Martial weapon + shield', 'OR two martial weapons'], ['Five javelins', 'OR any simple melee weapon'], ["Priest's Pack", "OR Explorer's Pack"], ['Chain mail', 'Holy symbol']],
  Ranger: [['Scale mail', 'OR leather armor'], ['Two shortswords', 'OR two simple melee weapons'], ["Dungeoneer's Pack", "OR Explorer's Pack"], ['Longbow + 20 arrows']],
  Rogue: [['Rapier', 'OR shortsword'], ['Shortbow + 20 arrows', 'OR shortsword'], ["Burglar's Pack", "OR Dungeoneer's Pack", "OR Explorer's Pack"], ['Leather armor', 'Two daggers', "Thieves' tools"]],
  Sorcerer: [['Light crossbow + 20 bolts', 'OR any simple weapon'], ['Component pouch', 'OR arcane focus'], ["Dungeoneer's Pack", "OR Explorer's Pack"], ['Two daggers']],
  Warlock: [['Light crossbow + 20 bolts', 'OR any simple weapon'], ['Component pouch', 'OR arcane focus'], ["Scholar's Pack", "OR Dungeoneer's Pack"], ['Leather armor', 'Any simple weapon', 'Two daggers']],
  Wizard: [['Quarterstaff', 'OR dagger'], ['Component pouch', 'OR arcane focus'], ["Scholar's Pack", "OR Explorer's Pack"], ['Spellbook']],
  Artificer: [['Any two simple weapons'], ['Light crossbow + 20 bolts'], ['Studded leather armor', "Thieves' tools", "Dungeoneer's Pack"]],
}

/** Get weapons by category */
export function getWeaponsByCategory(category: WeaponCategory): WeaponData[] {
  return WEAPONS.filter(w => w.category === category)
}

/** Get armor by type */
export function getArmorByType(type: ArmorData['type']): ArmorData[] {
  return ARMOR.filter(a => a.type === type)
}

/** Check if a character can use a weapon based on class proficiencies */
export function canUseWeapon(weapon: WeaponData, proficiencies: string[]): boolean {
  if (proficiencies.includes(weapon.name)) return true
  if (weapon.category.startsWith('Simple') && proficiencies.includes('Simple')) return true
  if (weapon.category.startsWith('Martial') && proficiencies.includes('Martial')) return true
  return false
}

/** Check if a character can use armor based on class proficiencies */
export function canUseArmor(armor: ArmorData, proficiencies: string[]): boolean {
  return proficiencies.includes(armor.type) || proficiencies.includes(armor.name)
}
