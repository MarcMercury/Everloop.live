/**
 * D&D 5e Fighting Styles + Battle Master Maneuvers
 */

export interface FightingStyleData {
  name: string
  desc: string
  classes: string[] // Which classes can pick this
}

export const FIGHTING_STYLES: FightingStyleData[] = [
  { name: 'Archery', desc: '+2 bonus to attack rolls with ranged weapons.', classes: ['Fighter', 'Ranger'] },
  { name: 'Blind Fighting', desc: 'You have blindsight with a range of 10 feet.', classes: ['Fighter', 'Ranger', 'Paladin'] },
  { name: 'Defense', desc: '+1 bonus to AC while wearing armor.', classes: ['Fighter', 'Ranger', 'Paladin'] },
  { name: 'Dueling', desc: '+2 bonus to damage rolls when wielding a melee weapon in one hand and no other weapons.', classes: ['Fighter', 'Ranger', 'Paladin'] },
  { name: 'Great Weapon Fighting', desc: 'Reroll 1 or 2 on damage dice with two-handed/versatile melee weapons.', classes: ['Fighter', 'Paladin'] },
  { name: 'Interception', desc: 'Reduce damage to a creature within 5 ft by 1d10 + proficiency (reaction, requires shield or weapon).', classes: ['Fighter', 'Paladin'] },
  { name: 'Protection', desc: 'Impose disadvantage on attack roll against a creature within 5 ft (reaction, requires shield).', classes: ['Fighter', 'Paladin'] },
  { name: 'Superior Technique', desc: 'Learn one Battle Master maneuver, gain one superiority die (d6).', classes: ['Fighter'] },
  { name: 'Thrown Weapon Fighting', desc: '+2 bonus to damage with thrown weapons; draw a thrown weapon as part of the attack.', classes: ['Fighter', 'Ranger'] },
  { name: 'Two-Weapon Fighting', desc: 'Add ability modifier to damage of the second attack with two-weapon fighting.', classes: ['Fighter', 'Ranger'] },
  { name: 'Unarmed Fighting', desc: 'Unarmed strikes deal 1d6+STR (or 1d8 if both hands free). Grappled creatures take 1d4 at start of your turn.', classes: ['Fighter'] },
  { name: 'Close Quarters Shooter', desc: 'No disadvantage on ranged attacks within 5 ft. +1 to ranged attack rolls. Ignore half/three-quarters cover within 30 ft.', classes: ['Fighter', 'Ranger'] },
  { name: 'Mariner', desc: '+1 AC when not wearing heavy armor or using a shield. Swimming/climbing speed equal to walking speed.', classes: ['Fighter', 'Ranger', 'Paladin'] },
  { name: 'Blessed Warrior', desc: 'Learn two Cleric cantrips. They count as Paladin spells.', classes: ['Paladin'] },
  { name: 'Druidic Warrior', desc: 'Learn two Druid cantrips. They count as Ranger spells.', classes: ['Ranger'] },
]

/** Get fighting styles available to a specific class */
export function getFightingStyles(className: string): FightingStyleData[] {
  return FIGHTING_STYLES.filter((s) => s.classes.includes(className))
}

// ── BATTLE MASTER MANEUVERS ──

export interface ManeuverData {
  name: string
  desc: string
}

export const MANEUVERS: ManeuverData[] = [
  { name: 'Ambush', desc: 'Add superiority die to Stealth or initiative roll.' },
  { name: 'Bait and Switch', desc: 'Swap places with a willing creature within 5 ft; one of you gains AC bonus equal to superiority die.' },
  { name: 'Brace', desc: 'When a creature enters your reach, make one weapon attack (reaction). Add superiority die to damage.' },
  { name: 'Commander\'s Strike', desc: 'Forgo one attack; ally uses reaction to attack, adding superiority die to damage.' },
  { name: 'Commanding Presence', desc: 'Add superiority die to Intimidation, Performance, or Persuasion check.' },
  { name: 'Disarming Attack', desc: 'Add superiority die to damage. Target must make STR save or drop one held item.' },
  { name: 'Distracting Strike', desc: 'Add superiority die to damage. Next ally attack has advantage against the target.' },
  { name: 'Evasive Footwork', desc: 'Add superiority die to AC while moving.' },
  { name: 'Feinting Attack', desc: 'Bonus action: gain advantage on next attack. Add superiority die to damage.' },
  { name: 'Goading Attack', desc: 'Add superiority die to damage. Target has disadvantage on attacks against others (WIS save).' },
  { name: 'Grappling Strike', desc: 'After hitting, add superiority die to Athletics check to grapple the target.' },
  { name: 'Lunging Attack', desc: '+5 ft reach on this attack. Add superiority die to damage.' },
  { name: 'Maneuvering Attack', desc: 'Add superiority die to damage. Ally can move half speed without provoking opportunity attacks.' },
  { name: 'Menacing Attack', desc: 'Add superiority die to damage. Target is frightened until end of your next turn (WIS save).' },
  { name: 'Parry', desc: 'Reduce melee damage taken by superiority die + DEX modifier (reaction).' },
  { name: 'Precision Attack', desc: 'Add superiority die to attack roll (before or after, but before knowing hit/miss).' },
  { name: 'Pushing Attack', desc: 'Add superiority die to damage. Push Large or smaller target up to 15 ft (STR save).' },
  { name: 'Quick Toss', desc: 'Bonus action: make one thrown weapon attack. Add superiority die to damage.' },
  { name: 'Rally', desc: 'Bonus action: ally gains temp HP equal to superiority die + CHA modifier.' },
  { name: 'Riposte', desc: 'When creature misses you, make weapon attack as reaction. Add superiority die to damage.' },
  { name: 'Sweeping Attack', desc: 'On hit, deal superiority die damage to another creature within 5 ft of original target.' },
  { name: 'Tactical Assessment', desc: 'Add superiority die to Investigation, History, or Insight check.' },
  { name: 'Trip Attack', desc: 'Add superiority die to damage. Target must make STR save or be knocked prone.' },
]

/** Get number of maneuvers Battle Master knows at a given level */
export function getManeuverCount(level: number): number {
  if (level >= 15) return 9
  if (level >= 10) return 7
  if (level >= 7) return 5
  if (level >= 3) return 3
  return 0
}

/** Get superiority die size at a given level */
export function getSuperiorityDie(level: number): string {
  if (level >= 18) return 'd12'
  if (level >= 10) return 'd10'
  return 'd8'
}
