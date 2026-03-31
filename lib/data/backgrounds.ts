/**
 * D&D 5e Backgrounds — skills, tools, languages, equipment, and features
 * Used by Character Forge for background selection
 */

export interface BackgroundData {
  name: string
  skillProfs: string[]
  toolProfs: string[]
  languages: number // number of extra languages to choose
  equipment: string[]
  feature: string
  featureDesc: string
  gold: number
}

export const BACKGROUNDS: BackgroundData[] = [
  { name: 'Acolyte', skillProfs: ['Insight', 'Religion'], toolProfs: [], languages: 2, equipment: ['Holy symbol', 'Prayer book or wheel', 'Incense sticks (5)', 'Vestments', 'Common clothes'], feature: 'Shelter of the Faithful', featureDesc: 'You and your companions can receive free healing at temples of your faith.', gold: 15 },
  { name: 'Charlatan', skillProfs: ['Deception', 'Sleight of Hand'], toolProfs: ['Disguise kit', 'Forgery kit'], languages: 0, equipment: ['Fine clothes', 'Disguise kit', 'Con tools of your choice'], feature: 'False Identity', featureDesc: 'You have a second identity with documentation, established acquaintances, and disguises.', gold: 15 },
  { name: 'Criminal', skillProfs: ['Deception', 'Stealth'], toolProfs: ['Gaming set', "Thieves' tools"], languages: 0, equipment: ['Crowbar', 'Dark common clothes with hood'], feature: 'Criminal Contact', featureDesc: 'You have a reliable contact who acts as a liaison for a network of criminals.', gold: 15 },
  { name: 'Entertainer', skillProfs: ['Acrobatics', 'Performance'], toolProfs: ['Disguise kit', 'One musical instrument'], languages: 0, equipment: ['Musical instrument', "Favor of an admirer", 'Costume'], feature: 'By Popular Demand', featureDesc: 'You can find a place to perform in most settlements, receiving free lodging and food.', gold: 15 },
  { name: 'Folk Hero', skillProfs: ['Animal Handling', 'Survival'], toolProfs: ['One artisan tool', 'Vehicles (land)'], languages: 0, equipment: ["Artisan's tools", 'Shovel', 'Iron pot', 'Common clothes'], feature: 'Rustic Hospitality', featureDesc: 'Common folk will shelter you and shield you from the law if needed.', gold: 10 },
  { name: 'Guild Artisan', skillProfs: ['Insight', 'Persuasion'], toolProfs: ['One artisan tool'], languages: 1, equipment: ["Artisan's tools", 'Letter of introduction from guild', "Traveler's clothes"], feature: 'Guild Membership', featureDesc: 'Your guild provides lodging, food, and a powerful social network.', gold: 15 },
  { name: 'Hermit', skillProfs: ['Medicine', 'Religion'], toolProfs: ['Herbalism kit'], languages: 1, equipment: ['Scroll case with notes', 'Winter blanket', 'Common clothes', 'Herbalism kit'], feature: 'Discovery', featureDesc: 'You have discovered a unique and powerful truth during your seclusion.', gold: 5 },
  { name: 'Noble', skillProfs: ['History', 'Persuasion'], toolProfs: ['One gaming set'], languages: 1, equipment: ['Fine clothes', 'Signet ring', 'Scroll of pedigree'], feature: 'Position of Privilege', featureDesc: 'People assume the best of you due to your noble birth.', gold: 25 },
  { name: 'Outlander', skillProfs: ['Athletics', 'Survival'], toolProfs: ['One musical instrument'], languages: 1, equipment: ['Staff', 'Hunting trap', 'Animal trophy', "Traveler's clothes"], feature: 'Wanderer', featureDesc: 'You have an excellent memory for maps and geography, and can always find food and fresh water.', gold: 10 },
  { name: 'Sage', skillProfs: ['Arcana', 'History'], toolProfs: [], languages: 2, equipment: ['Ink bottle', 'Quill', 'Small knife', 'Letter from dead colleague', 'Common clothes'], feature: 'Researcher', featureDesc: 'When you don\'t know information, you usually know where to find it.', gold: 10 },
  { name: 'Sailor', skillProfs: ['Athletics', 'Perception'], toolProfs: ["Navigator's tools", 'Vehicles (water)'], languages: 0, equipment: ['Belaying pin (club)', 'Silk rope (50 ft)', 'Lucky charm', 'Common clothes'], feature: 'Ship\'s Passage', featureDesc: 'You can secure free passage on a ship for yourself and companions.', gold: 10 },
  { name: 'Soldier', skillProfs: ['Athletics', 'Intimidation'], toolProfs: ['One gaming set', 'Vehicles (land)'], languages: 0, equipment: ['Insignia of rank', 'Trophy from a fallen enemy', 'Bone dice set', 'Common clothes'], feature: 'Military Rank', featureDesc: 'Soldiers loyal to your former military organization still recognize your authority.', gold: 10 },
  { name: 'Urchin', skillProfs: ['Sleight of Hand', 'Stealth'], toolProfs: ['Disguise kit', "Thieves' tools"], languages: 0, equipment: ['Small knife', 'Map of your home city', 'Pet mouse', 'Token from parents', 'Common clothes'], feature: 'City Secrets', featureDesc: 'You know the secret patterns and flow of cities and can travel twice as fast through them.', gold: 10 },
  { name: 'Haunted One', skillProfs: ['Choose two from: Arcana, Investigation, Religion, Survival'], toolProfs: [], languages: 1, equipment: ["Monster hunter's pack", 'Common clothes', 'Trinket of special significance'], feature: 'Heart of Darkness', featureDesc: 'Commoners do their utmost to help you, sensing the darkness that haunts you.', gold: 0 },
  { name: 'Far Traveler', skillProfs: ['Insight', 'Perception'], toolProfs: ['One gaming set or musical instrument'], languages: 1, equipment: ["Traveler's clothes", 'Musical instrument or gaming set', 'Maps of your homeland'], feature: 'All Eyes on You', featureDesc: 'Your accent, mannerisms, and appearance mark you as foreign, drawing curious attention.', gold: 15 },
  { name: 'City Watch', skillProfs: ['Athletics', 'Insight'], toolProfs: [], languages: 2, equipment: ['Uniform', 'Horn', 'Manacles'], feature: "Watcher's Eye", featureDesc: 'You can easily find the local watch outpost and criminal dens in any settlement.', gold: 10 },
]

/** Lookup a background by name */
export function getBackground(name: string): BackgroundData | undefined {
  return BACKGROUNDS.find(b => b.name === name)
}

/** Get all background names */
export function getBackgroundNames(): string[] {
  return BACKGROUNDS.map(b => b.name)
}

/** Get all skill proficiencies granted by a background */
export function getBackgroundSkills(name: string): string[] {
  return getBackground(name)?.skillProfs ?? []
}
