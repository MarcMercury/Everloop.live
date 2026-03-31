/**
 * D&D 5e Feats — common feats with prerequisites and effects
 * Used by Character Forge for feat selection at ASI levels (4, 8, 12, 16, 19)
 */

export interface FeatData {
  name: string
  prerequisite: string
  desc: string
  effects: string[]
}

export const FEATS: FeatData[] = [
  { name: 'Alert', prerequisite: 'None', desc: 'Always on the lookout for danger.', effects: ['+5 to initiative', "Can't be surprised while conscious", 'No advantage for hidden attackers'] },
  { name: 'Athlete', prerequisite: 'None', desc: 'Exceptional physical training.', effects: ['+1 STR or DEX', 'Standing from prone costs 5 ft', 'Climbing doesn\'t cost extra movement', 'Running long/high jump with 5 ft running start'] },
  { name: 'Actor', prerequisite: 'None', desc: 'Skilled at mimicry and dramatics.', effects: ['+1 CHA', 'Advantage on Deception/Performance checks when pretending to be someone else', 'Mimic speech or sounds of others'] },
  { name: 'Charger', prerequisite: 'None', desc: 'Powerful charges in combat.', effects: ['Dash then bonus action melee attack', '+5 damage or push target 10 ft'] },
  { name: 'Crossbow Expert', prerequisite: 'None', desc: 'Master of crossbow combat.', effects: ['Ignore loading property of crossbows', 'No disadvantage on ranged attacks within 5 ft', 'Bonus action hand crossbow attack after one-handed weapon attack'] },
  { name: 'Defensive Duelist', prerequisite: 'DEX 13+', desc: 'Parry incoming attacks.', effects: ['Reaction: add proficiency bonus to AC against one melee attack'] },
  { name: 'Dual Wielder', prerequisite: 'None', desc: 'Master of fighting with two weapons.', effects: ['+1 AC while dual wielding', 'Use non-light melee weapons for two-weapon fighting', 'Draw/stow two weapons at once'] },
  { name: 'Dungeon Delver', prerequisite: 'None', desc: 'Expert at navigating dungeons.', effects: ['Advantage on Perception/Investigation for traps and secret doors', 'Advantage on saves vs. traps', 'Resistance to trap damage', 'Search for traps at normal pace'] },
  { name: 'Durable', prerequisite: 'None', desc: 'Hardy and resilient.', effects: ['+1 CON', 'Minimum HP regained from Hit Dice = 2 × CON mod'] },
  { name: 'Elemental Adept', prerequisite: 'Spellcasting ability', desc: 'Master a damage element.', effects: ['Choose acid, cold, fire, lightning, or thunder', 'Spells ignore resistance to that type', 'Treat 1s on damage dice as 2s for that type'] },
  { name: 'Grappler', prerequisite: 'STR 13+', desc: 'Expert at grappling.', effects: ['Advantage on attacks against creatures you\'re grappling', 'Pin a creature: both restrained until grapple ends'] },
  { name: 'Great Weapon Master', prerequisite: 'None', desc: 'Devastating strikes with heavy weapons.', effects: ['On crit or reducing to 0 HP: bonus action melee attack', 'Before attacking with heavy weapon: -5 to hit, +10 damage'] },
  { name: 'Healer', prerequisite: 'None', desc: 'Able physician.', effects: ["Healer's kit to stabilize also restores 1 HP", 'Healer\'s kit: one creature regains 1d6+4+creature\'s max Hit Dice HP (1/rest)'] },
  { name: 'Heavily Armored', prerequisite: 'Medium armor proficiency', desc: 'Train with heavy armor.', effects: ['+1 STR', 'Gain proficiency with heavy armor'] },
  { name: 'Heavy Armor Master', prerequisite: 'Heavy armor proficiency', desc: 'Reduce damage in heavy armor.', effects: ['+1 STR', 'While wearing heavy armor, reduce nonmagical bludgeoning/piercing/slashing damage by 3'] },
  { name: 'Inspiring Leader', prerequisite: 'CHA 13+', desc: 'Inspire allies with stirring speeches.', effects: ['10-minute speech: up to 6 creatures gain temporary HP = your level + CHA mod'] },
  { name: 'Keen Mind', prerequisite: 'None', desc: 'Sharp memory and awareness.', effects: ['+1 INT', 'Always know which way is north', 'Always know hours until sunrise/sunset', 'Recall anything seen/heard in past month'] },
  { name: 'Lightly Armored', prerequisite: 'None', desc: 'Train with light armor.', effects: ['+1 STR or DEX', 'Gain proficiency with light armor'] },
  { name: 'Linguist', prerequisite: 'None', desc: 'Study languages and codes.', effects: ['+1 INT', 'Learn 3 languages', 'Create written ciphers'] },
  { name: 'Lucky', prerequisite: 'None', desc: 'Inexplicable luck.', effects: ['3 luck points per long rest', 'Spend 1 to reroll any d20 (attack, ability check, or save)', 'Spend 1 to force reroll of attack against you'] },
  { name: 'Mage Slayer', prerequisite: 'None', desc: 'Practiced at disrupting spellcasters.', effects: ['Reaction attack when adjacent creature casts spell', 'Advantage on saves vs. spells from adjacent creatures', 'Creatures you damage have disadvantage on concentration checks'] },
  { name: 'Magic Initiate', prerequisite: 'None', desc: 'Learn basic magic.', effects: ['Choose a class: learn 2 cantrips and one 1st-level spell', 'Cast the 1st-level spell once per long rest'] },
  { name: 'Martial Adept', prerequisite: 'None', desc: 'Learn combat maneuvers.', effects: ['Learn 2 Battle Master maneuvers', '1 superiority die (d6) per short rest'] },
  { name: 'Medium Armor Master', prerequisite: 'Medium armor proficiency', desc: 'Expert in medium armor.', effects: ['No stealth disadvantage in medium armor', 'Max DEX bonus for medium armor becomes +3 instead of +2'] },
  { name: 'Mobile', prerequisite: 'None', desc: 'Exceptionally fast and agile.', effects: ['+10 ft speed', 'Dash through difficult terrain without extra cost', 'Melee attack against a creature: no opportunity attacks from that creature'] },
  { name: 'Moderately Armored', prerequisite: 'Light armor proficiency', desc: 'Train with medium armor.', effects: ['+1 STR or DEX', 'Gain proficiency with medium armor and shields'] },
  { name: 'Mounted Combatant', prerequisite: 'None', desc: 'Dangerous foe on a mount.', effects: ['Advantage on melee attacks vs. smaller unmounted creatures', 'Force attacks targeting mount to target you instead', 'Mount takes no damage on successful DEX save (half on fail)'] },
  { name: 'Observant', prerequisite: 'None', desc: 'Quick to notice details.', effects: ['+1 INT or WIS', '+5 to passive Perception and Investigation', 'Read lips if you can see and understand the language'] },
  { name: 'Polearm Master', prerequisite: 'None', desc: 'Expert with reach weapons.', effects: ['Bonus action attack with butt end (1d4 bludgeoning)', 'Opportunity attack when creatures enter your reach'] },
  { name: 'Resilient', prerequisite: 'None', desc: 'Develop resilience in an ability.', effects: ['+1 to chosen ability score', 'Gain proficiency in saving throws of that ability'] },
  { name: 'Ritual Caster', prerequisite: 'INT or WIS 13+', desc: 'Learn ritual spells.', effects: ['Choose a class. Acquire a ritual book with two 1st-level ritual spells', 'Can add found ritual spells to book'] },
  { name: 'Savage Attacker', prerequisite: 'None', desc: 'Brutal melee strikes.', effects: ['Once per turn, reroll melee weapon damage dice and use either result'] },
  { name: 'Sentinel', prerequisite: 'None', desc: 'Master of guarding.', effects: ['Opportunity attack reduces speed to 0', 'Opportunity attack even if target Disengages', 'When creature within 5 ft attacks someone else, reaction melee attack'] },
  { name: 'Sharpshooter', prerequisite: 'None', desc: 'Master of ranged weapons.', effects: ['No disadvantage at long range', 'Ignore half and three-quarters cover', '-5 to hit, +10 damage with ranged weapons'] },
  { name: 'Shield Master', prerequisite: 'None', desc: 'Expert shield user.', effects: ['Bonus action: shove with shield after Attack action', 'Add shield AC bonus to DEX saves vs. single targets', 'On successful DEX save, no damage (instead of half)'] },
  { name: 'Skilled', prerequisite: 'None', desc: 'Quick learner.', effects: ['Gain proficiency in any combination of 3 skills or tools'] },
  { name: 'Skulker', prerequisite: 'DEX 13+', desc: 'Expert at hiding.', effects: ['Hide when lightly obscured', 'Missing a ranged attack doesn\'t reveal your position', 'Dim light doesn\'t impose disadvantage on Perception'] },
  { name: 'Spell Sniper', prerequisite: 'Spellcasting ability', desc: 'Extend spell range.', effects: ['Double the range of attack roll spells', 'Ranged spell attacks ignore half and three-quarters cover', 'Learn one cantrip requiring an attack roll'] },
  { name: 'Tavern Brawler', prerequisite: 'None', desc: 'Skilled at improvised fighting.', effects: ['+1 STR or CON', 'Proficiency with improvised weapons', 'Unarmed strike deals 1d4', 'Bonus action grapple after hitting with unarmed/improvised'] },
  { name: 'Tough', prerequisite: 'None', desc: 'Remarkably durable.', effects: ['HP maximum increases by 2 × your level (and 2 per level gained)'] },
  { name: 'War Caster', prerequisite: 'Spellcasting ability', desc: 'Maintain spells in combat.', effects: ['Advantage on concentration saves', 'Perform somatic components with hands full', 'Cast a spell as an opportunity attack'] },
  { name: 'Weapon Master', prerequisite: 'None', desc: 'Train with weapons.', effects: ['+1 STR or DEX', 'Gain proficiency with 4 weapons of your choice'] },
  // Racial / Later Feats
  { name: 'Fey Touched', prerequisite: 'None', desc: 'Fey magic influence.', effects: ['+1 INT, WIS, or CHA', 'Learn Misty Step + one 1st-level divination/enchantment spell', 'Cast each once per long rest without a slot'] },
  { name: 'Shadow Touched', prerequisite: 'None', desc: 'Shadowfell influence.', effects: ['+1 INT, WIS, or CHA', 'Learn Invisibility + one 1st-level illusion/necromancy spell', 'Cast each once per long rest without a slot'] },
  { name: 'Telekinetic', prerequisite: 'None', desc: 'Psionic telekinetic ability.', effects: ['+1 INT, WIS, or CHA', 'Learn Mage Hand (invisible)', 'Bonus action: shove creatures 5 ft with telekinetics'] },
  { name: 'Telepathic', prerequisite: 'None', desc: 'Psionic telepathic ability.', effects: ['+1 INT, WIS, or CHA', 'Telepathy within 60 ft', 'Cast Detect Thoughts once per long rest without a slot'] },
  { name: 'Crusher', prerequisite: 'None', desc: 'Expert at bludgeoning.', effects: ['+1 STR or CON', 'Move creature 5 ft on bludgeoning hit', 'Crit with bludgeoning: all attacks have advantage on target until end of next turn'] },
  { name: 'Piercer', prerequisite: 'None', desc: 'Expert at piercing.', effects: ['+1 STR or DEX', 'Reroll one piercing damage die once per turn', 'Crit with piercing: roll one additional damage die'] },
  { name: 'Slasher', prerequisite: 'None', desc: 'Expert at slashing.', effects: ['+1 STR or DEX', 'Reduce target speed by 10 ft on slashing hit', 'Crit with slashing: target has disadvantage on attack rolls until start of your next turn'] },
]

/** Lookup a feat by name */
export function getFeat(name: string): FeatData | undefined {
  return FEATS.find(f => f.name === name)
}

/** Get all feat names */
export function getFeatNames(): string[] {
  return FEATS.map(f => f.name)
}

/** Get feats that have no prerequisites */
export function getFeatsNoPrereq(): FeatData[] {
  return FEATS.filter(f => f.prerequisite === 'None')
}

/** Check if a character meets a feat's prerequisite (simplified check) */
export function meetsFeatPrereq(feat: FeatData, abilities: Record<string, number>, proficiencies: string[]): boolean {
  if (feat.prerequisite === 'None') return true
  if (feat.prerequisite === 'Spellcasting ability') return true // handled by class
  const match = feat.prerequisite.match(/(STR|DEX|CON|INT|WIS|CHA)\s+(\d+)\+/)
  if (match) {
    const abilityMap: Record<string, string> = { STR: 'strength', DEX: 'dexterity', CON: 'constitution', INT: 'intelligence', WIS: 'wisdom', CHA: 'charisma' }
    return (abilities[abilityMap[match[1]]] ?? 0) >= parseInt(match[2])
  }
  if (feat.prerequisite.includes('proficiency')) {
    return proficiencies.some(p => feat.prerequisite.toLowerCase().includes(p.toLowerCase()))
  }
  return true
}
