/**
 * D&D 5e quick-reference data for live play.
 * Every entry is a short plain-language description (player-facing, not RAW verbatim)
 * suitable for showing in a popover when a player taps an element on their sheet.
 */

import type { SkillName, DndCondition } from '@/types/player-character'

// ─────────────────────────────────────────────────────────────────────────────
// SKILLS — what each skill does + when to use it
// ─────────────────────────────────────────────────────────────────────────────

export interface SkillInfo {
  name: string
  ability: string
  description: string
  examples: string[]
}

export const SKILL_INFO: Record<SkillName, SkillInfo> = {
  acrobatics: {
    name: 'Acrobatics',
    ability: 'Dexterity',
    description: 'Stay on your feet in tricky situations or pull off acrobatic stunts.',
    examples: ['Balance on a narrow ledge', 'Tumble past an enemy', 'Stay upright on icy ground', 'Escape a grapple (vs grappler\'s Athletics)'],
  },
  animal_handling: {
    name: 'Animal Handling',
    ability: 'Wisdom',
    description: 'Calm, command, or read the intentions of an animal.',
    examples: ['Calm a spooked horse', 'Train or handle a mount', 'Sense an animal\'s mood', 'Avoid being attacked by a wild beast'],
  },
  arcana: {
    name: 'Arcana',
    ability: 'Intelligence',
    description: 'Recall lore about spells, magical traditions, planes, and arcane symbols.',
    examples: ['Identify a spell being cast', 'Recognize an arcane sigil', 'Recall lore about a planar creature', 'Understand magical writing'],
  },
  athletics: {
    name: 'Athletics',
    ability: 'Strength',
    description: 'Climb, jump, swim, or grapple — anything that takes raw physical effort.',
    examples: ['Climb a sheer wall', 'Long jump a gap', 'Swim against a current', 'Grapple or shove an enemy'],
  },
  deception: {
    name: 'Deception',
    ability: 'Charisma',
    description: 'Convincingly lie, mislead, or hide your true intentions.',
    examples: ['Talk your way past a guard', 'Bluff in a card game', 'Disguise your motives', 'Pass off a forged letter'],
  },
  history: {
    name: 'History',
    ability: 'Intelligence',
    description: 'Recall historical lore — wars, kingdoms, ancient civilizations, lost technologies.',
    examples: ['Identify an old battle site', 'Recall a kingdom\'s rulers', 'Recognize a heraldic crest', 'Know the origin of a relic'],
  },
  insight: {
    name: 'Insight',
    ability: 'Wisdom',
    description: 'Read body language and tone to spot lies or sense someone\'s true intent.',
    examples: ['Tell if someone is lying', 'Predict a creature\'s next move', 'Sense ulterior motives', 'Gauge a leader\'s sincerity'],
  },
  intimidation: {
    name: 'Intimidation',
    ability: 'Charisma',
    description: 'Influence someone through threats, hostile presence, or violence.',
    examples: ['Threaten a prisoner for info', 'Stare down a bandit', 'Cow a crowd', 'Coerce cooperation'],
  },
  investigation: {
    name: 'Investigation',
    ability: 'Intelligence',
    description: 'Search a scene for clues and reason out their meaning.',
    examples: ['Find a hidden door', 'Search a room for clues', 'Deduce a trap\'s mechanism', 'Decipher a coded letter'],
  },
  medicine: {
    name: 'Medicine',
    ability: 'Wisdom',
    description: 'Stabilize the dying, diagnose illnesses, treat wounds without magic.',
    examples: ['Stabilize a dying ally (DC 10)', 'Diagnose a disease', 'Determine cause of death', 'Treat a poison'],
  },
  nature: {
    name: 'Nature',
    ability: 'Intelligence',
    description: 'Recall lore about terrain, plants, animals, weather, and natural cycles.',
    examples: ['Identify a plant or beast', 'Predict the weather', 'Track natural cycles', 'Find safe forage'],
  },
  perception: {
    name: 'Perception',
    ability: 'Wisdom',
    description: 'Spot, hear, or otherwise notice something. The DM may use your passive score.',
    examples: ['Spot a hidden enemy', 'Overhear a conversation', 'Notice a trap', 'See a clue out of place'],
  },
  performance: {
    name: 'Performance',
    ability: 'Charisma',
    description: 'Entertain through music, dance, acting, storytelling, or oratory.',
    examples: ['Play music in a tavern', 'Recite a poem at court', 'Distract with an act', 'Earn coin as a busker'],
  },
  persuasion: {
    name: 'Persuasion',
    ability: 'Charisma',
    description: 'Influence others through tact, social grace, or honest appeal.',
    examples: ['Negotiate a price', 'Convince a noble', 'Ask for a favor', 'Defuse a hostile encounter'],
  },
  religion: {
    name: 'Religion',
    ability: 'Intelligence',
    description: 'Recall lore about deities, rites, holy symbols, and the practices of cults.',
    examples: ['Identify a holy symbol', 'Recall a deity\'s tenets', 'Recognize a ritual', 'Know the hierarchy of a faith'],
  },
  sleight_of_hand: {
    name: 'Sleight of Hand',
    ability: 'Dexterity',
    description: 'Subtle handwork — palming, planting, picking pockets.',
    examples: ['Pick a pocket', 'Plant something on someone', 'Conceal a weapon', 'Cheat at cards'],
  },
  stealth: {
    name: 'Stealth',
    ability: 'Dexterity',
    description: 'Move silently and stay out of sight.',
    examples: ['Sneak past a guard', 'Hide in shadow', 'Move silently across a floor', 'Tail someone unnoticed'],
  },
  survival: {
    name: 'Survival',
    ability: 'Wisdom',
    description: 'Track creatures, navigate wilds, hunt, forage, predict weather.',
    examples: ['Track a creature', 'Navigate the wilds', 'Find food and water', 'Read weather signs'],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// ABILITY SCORES — what each is used for
// ─────────────────────────────────────────────────────────────────────────────

export const ABILITY_INFO: Record<string, { name: string; description: string; usedFor: string[] }> = {
  strength: {
    name: 'Strength',
    description: 'Raw physical power — lifting, pushing, melee force.',
    usedFor: ['Athletics checks', 'Melee attacks (most weapons)', 'STR saves vs being moved or restrained', 'Carrying capacity'],
  },
  dexterity: {
    name: 'Dexterity',
    description: 'Agility, reflexes, balance, and steady hands.',
    usedFor: ['Acrobatics, Sleight of Hand, Stealth', 'Ranged & finesse attacks', 'Initiative', 'Armor Class', 'DEX saves vs traps & area effects'],
  },
  constitution: {
    name: 'Constitution',
    description: 'Health, stamina, and vital force.',
    usedFor: ['Hit points (per level)', 'Concentration saves to maintain spells', 'CON saves vs poison, disease, exhaustion'],
  },
  intelligence: {
    name: 'Intelligence',
    description: 'Reasoning, memory, and analytical thinking.',
    usedFor: ['Arcana, History, Investigation, Nature, Religion', 'Wizard spellcasting', 'INT saves vs mind-altering effects'],
  },
  wisdom: {
    name: 'Wisdom',
    description: 'Awareness, intuition, and force of will.',
    usedFor: ['Animal Handling, Insight, Medicine, Perception, Survival', 'Cleric/Druid/Ranger spellcasting', 'WIS saves vs charm & illusion'],
  },
  charisma: {
    name: 'Charisma',
    description: 'Force of personality, persuasiveness, leadership.',
    usedFor: ['Deception, Intimidation, Performance, Persuasion', 'Bard/Sorcerer/Warlock/Paladin spellcasting', 'CHA saves vs banishment & possession'],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// WEAPON PROPERTIES
// ─────────────────────────────────────────────────────────────────────────────

export const WEAPON_PROPERTY_INFO: Record<string, string> = {
  ammunition: 'Requires ammunition (arrows, bolts, etc.). Drawing ammunition is part of the attack. Half ammo can be recovered after a fight.',
  finesse: 'You may use Strength OR Dexterity for the attack and damage roll. Use whichever is higher.',
  heavy: 'Small creatures have disadvantage on attacks with this weapon.',
  light: 'Can be used for two-weapon fighting (bonus action attack with off-hand weapon).',
  loading: 'Limited to one attack per action / bonus action / reaction, regardless of how many attacks you can normally make.',
  range: 'Has a normal and long range. Disadvantage at long range; can\'t attack beyond it.',
  reach: 'Adds 5 feet to your reach when attacking, so 10 ft total for medium creatures.',
  special: 'Has special rules listed in the weapon\'s description (often unique).',
  thrown: 'Can be thrown to make a ranged attack. Use the same modifier as the melee attack (STR, or DEX if Finesse).',
  'two-handed': 'Requires two hands to wield.',
  versatile: 'Can be used one- or two-handed. Two-handed deals the higher damage die in parentheses.',
  // Weapon Mastery (2024)
  cleave: 'On a melee hit, deal damage to a second creature within 5 ft of the first.',
  graze: 'On a miss with a melee weapon attack, the target still takes damage equal to your ability mod.',
  nick: 'When you make the off-hand attack with this weapon, you can do it as part of the Attack action (no bonus action needed).',
  push: 'On a hit, push a Large or smaller creature 10 ft away from you.',
  sap: 'On a hit, the target has disadvantage on its next attack roll before the start of your next turn.',
  slow: 'On a hit, reduce the target\'s speed by 10 ft until the start of your next turn.',
  topple: 'On a hit, the target must succeed on a CON save (DC 8 + STR mod + prof) or be knocked Prone.',
  vex: 'On a hit, you have advantage on your next attack roll against that creature before the end of your next turn.',
}

/** Match a property string (case-insensitive, ignoring parens/numbers) to its info. */
export function lookupWeaponProperty(prop: string): string | null {
  if (!prop) return null
  // Strip "(1d8)", "(20/60)", trim
  const key = prop.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim()
  return WEAPON_PROPERTY_INFO[key] || null
}

// ─────────────────────────────────────────────────────────────────────────────
// STANDARD ACTIONS — full rules text for combat actions
// ─────────────────────────────────────────────────────────────────────────────

export interface ActionInfo {
  name: string
  type: 'Action' | 'Bonus Action' | 'Reaction' | 'Other'
  description: string
  rules: string[]
}

export const STANDARD_ACTIONS: Record<string, ActionInfo> = {
  Attack: {
    name: 'Attack',
    type: 'Action',
    description: 'Make one melee or ranged attack.',
    rules: [
      'Roll d20 + ability mod + proficiency (if proficient).',
      'On a hit, roll the weapon\'s damage + ability mod.',
      'A natural 20 is a critical hit — double the damage dice.',
      'Some classes (Fighter, etc.) get extra attacks at higher levels.',
    ],
  },
  Dash: {
    name: 'Dash',
    type: 'Action',
    description: 'Gain extra movement equal to your speed for the turn.',
    rules: [
      'You can move up to twice your speed this turn.',
      'Difficult terrain still costs double.',
      'Can be used multiple times per turn (e.g. with bonus-action Dash from Cunning Action).',
    ],
  },
  Dodge: {
    name: 'Dodge',
    type: 'Action',
    description: 'Focus on avoiding attacks until your next turn.',
    rules: [
      'Until your next turn, attacks against you have disadvantage (if you can see the attacker).',
      'You make DEX saves with advantage.',
      'You lose this benefit if Incapacitated or your speed drops to 0.',
    ],
  },
  Disengage: {
    name: 'Disengage',
    type: 'Action',
    description: 'Move without provoking opportunity attacks.',
    rules: [
      'Your movement this turn doesn\'t trigger opportunity attacks.',
      'Useful for getting out of melee with multiple enemies.',
    ],
  },
  Help: {
    name: 'Help',
    type: 'Action',
    description: 'Assist an ally with a task or distract an enemy.',
    rules: [
      'You can grant an ally advantage on their next ability check (if you could plausibly help with the task).',
      'OR distract an enemy: the next attack against that enemy by your ally before your next turn has advantage.',
      'Both you and the ally must be within 5 ft of the target/task.',
    ],
  },
  Hide: {
    name: 'Hide',
    type: 'Action',
    description: 'Make a Stealth check to become hidden.',
    rules: [
      'Roll Stealth (DEX). DM compares to enemies\' passive Perception or active rolls.',
      'You need cover or obscurement — you can\'t hide in plain sight.',
      'Hidden = unseen attackers gain advantage; attackers against you have disadvantage.',
      'You\'re no longer hidden the moment you attack, cast a spell, or are spotted.',
    ],
  },
  Ready: {
    name: 'Ready',
    type: 'Action',
    description: 'Prepare an action with a trigger to fire as a reaction.',
    rules: [
      'Choose a perceivable trigger (e.g. "when the door opens").',
      'Choose an action OR a single weapon attack to ready.',
      'When the trigger occurs (before your next turn), you may use your reaction to act.',
      'Readying a spell costs the spell slot up front; if not triggered, the slot is wasted.',
    ],
  },
  Search: {
    name: 'Search',
    type: 'Action',
    description: 'Devote your action to finding something.',
    rules: [
      'Make a Wisdom (Perception) or Intelligence (Investigation) check, depending on what you\'re looking for.',
      'DM sets DC based on what\'s hidden.',
    ],
  },
  'Use Object': {
    name: 'Use an Object',
    type: 'Action',
    description: 'Interact with an object that requires your full attention.',
    rules: [
      'Drawing/sheathing one weapon, opening a door, or picking up an item is FREE — not Use Object.',
      'Use Object covers things like lighting a torch, drinking a potion, lowering a drawbridge, or operating a complex device.',
    ],
  },
  Grapple: {
    name: 'Grapple',
    type: 'Action',
    description: 'Restrain a creature in melee — replaces one attack of the Attack action.',
    rules: [
      'Replaces one attack: you must have one free hand and the target within reach.',
      'Make an Athletics check (STR) contested by the target\'s Athletics OR Acrobatics.',
      'On success, the target is Grappled (speed 0). They can break free with a contested check on their turn.',
    ],
  },
  Shove: {
    name: 'Shove',
    type: 'Action',
    description: 'Push a creature 5 ft or knock them prone — replaces one attack.',
    rules: [
      'Replaces one attack: target must be no more than one size larger than you.',
      'Athletics (STR) contested by target\'s Athletics OR Acrobatics.',
      'On success, choose: push 5 ft away, OR knock prone.',
    ],
  },
  'Two-Weapon Fighting': {
    name: 'Two-Weapon Fighting',
    type: 'Bonus Action',
    description: 'Make an off-hand attack after attacking with a Light melee weapon.',
    rules: [
      'When you take the Attack action and attack with a light melee weapon, you can use a bonus action to attack with a different light melee weapon in your other hand.',
      'You don\'t add your ability modifier to the bonus attack\'s damage (unless it\'s negative, or a feature says you do).',
    ],
  },
  'Opportunity Attack': {
    name: 'Opportunity Attack',
    type: 'Reaction',
    description: 'Attack a creature that leaves your reach.',
    rules: [
      'When a hostile creature you can see leaves your reach, you can use your reaction to make ONE melee attack against it.',
      'Doesn\'t trigger if they teleport, are moved involuntarily, or take the Disengage action.',
    ],
  },
  Inspiration: {
    name: 'Inspiration',
    type: 'Other',
    description: 'Spend Inspiration to reroll a d20 (attack roll, save, or check).',
    rules: [
      'You may spend Inspiration AFTER seeing a d20 roll but BEFORE the outcome is announced.',
      'Reroll the d20 — you must take the new roll.',
      'You earn Inspiration through good roleplay (DM\'s call) or class features.',
    ],
  },
  'Death Saving Throw': {
    name: 'Death Saving Throw',
    type: 'Other',
    description: 'Roll a d20 at start of turn while at 0 HP.',
    rules: [
      'On 10 or higher: success. Three successes = stable (still unconscious at 0 HP).',
      'On 9 or lower: failure. Three failures = dead.',
      'Natural 20: regain 1 HP and become conscious.',
      'Natural 1: counts as TWO failures.',
      'Taking damage at 0 HP = 1 failure (or 2 if from a crit). Damage equal to your max HP = instant death.',
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// CONDITIONS — extended descriptions (concatenates with CONDITION_EFFECTS)
// ─────────────────────────────────────────────────────────────────────────────

export const CONDITION_INFO: Record<DndCondition, string[]> = {
  blinded: [
    'A blinded creature can\'t see and automatically fails ability checks that require sight.',
    'Attack rolls against the creature have advantage.',
    'The creature\'s attack rolls have disadvantage.',
  ],
  charmed: [
    'A charmed creature can\'t attack the charmer or target them with harmful abilities or magical effects.',
    'The charmer has advantage on any ability check to interact socially with the creature.',
  ],
  deafened: [
    'A deafened creature can\'t hear and automatically fails any ability check that requires hearing.',
  ],
  exhaustion: [
    'Level 1: Disadvantage on ability checks.',
    'Level 2: Speed halved.',
    'Level 3: Disadvantage on attack rolls and saving throws.',
    'Level 4: Hit point maximum halved.',
    'Level 5: Speed reduced to 0.',
    'Level 6: Death.',
    'A long rest reduces exhaustion by 1.',
  ],
  frightened: [
    'A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.',
    'The creature can\'t willingly move closer to the source of its fear.',
  ],
  grappled: [
    'A grappled creature\'s speed becomes 0, and it can\'t benefit from any bonus to its speed.',
    'The condition ends if the grappler is incapacitated.',
    'The condition ends if an effect removes the grappled creature from the reach of the grappler.',
  ],
  incapacitated: [
    'An incapacitated creature can\'t take actions or reactions.',
  ],
  invisible: [
    'An invisible creature is impossible to see without magic or special senses. The creature\'s location can be detected by noise or tracks.',
    'Attack rolls against the creature have disadvantage.',
    'The creature\'s attack rolls have advantage.',
  ],
  paralyzed: [
    'A paralyzed creature is incapacitated and can\'t move or speak.',
    'The creature automatically fails Strength and Dexterity saving throws.',
    'Attack rolls against the creature have advantage.',
    'Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.',
  ],
  petrified: [
    'A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone).',
    'Its weight increases by a factor of ten, and it ceases aging.',
    'The creature is incapacitated, can\'t move or speak, and is unaware of its surroundings.',
    'Attack rolls have advantage; auto-fail STR/DEX saves; resistance to all damage; immune to poison and disease.',
  ],
  poisoned: [
    'A poisoned creature has disadvantage on attack rolls and ability checks.',
  ],
  prone: [
    'A prone creature\'s only movement option is to crawl, unless it stands up (costs half its movement).',
    'The creature has disadvantage on attack rolls.',
    'Attack rolls against the creature have advantage if the attacker is within 5 feet, otherwise disadvantage.',
  ],
  restrained: [
    'A restrained creature\'s speed becomes 0, and it can\'t benefit from any bonus to its speed.',
    'Attack rolls against the creature have advantage.',
    'The creature\'s attack rolls have disadvantage.',
    'The creature has disadvantage on Dexterity saving throws.',
  ],
  stunned: [
    'A stunned creature is incapacitated, can\'t move, and can speak only falteringly.',
    'The creature automatically fails Strength and Dexterity saving throws.',
    'Attack rolls against the creature have advantage.',
  ],
  unconscious: [
    'An unconscious creature is incapacitated, can\'t move or speak, and is unaware of its surroundings.',
    'The creature drops whatever it\'s holding and falls prone.',
    'It automatically fails Strength and Dexterity saving throws.',
    'Attack rolls against the creature have advantage.',
    'Any attack that hits is a critical hit if the attacker is within 5 feet.',
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// DAMAGE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export const DAMAGE_TYPE_INFO: Record<string, string> = {
  acid: 'Corrosive damage from acidic substances. Often bypasses armor.',
  bludgeoning: 'Blunt-force damage from clubs, falls, or constriction.',
  cold: 'Freezing damage. Can slow or numb. Many monsters resist or are vulnerable.',
  fire: 'Burning damage. Often ignites flammable objects or creatures.',
  force: 'Pure magical energy. Almost nothing resists Force damage.',
  lightning: 'Electrical damage. Often arcs through water or metal.',
  necrotic: 'Withering, life-draining damage. Undead are typically immune; celestials often resist.',
  piercing: 'Puncture damage from arrows, spears, daggers, fangs.',
  poison: 'Toxic damage. Many monsters are immune (constructs, undead, oozes).',
  psychic: 'Mental damage. Many beasts and constructs are immune.',
  radiant: 'Holy energy. Undead and fiends often vulnerable; common from clerics & paladins.',
  slashing: 'Cutting damage from swords, axes, claws.',
  thunder: 'Concussive sonic damage. Audible across great distance.',
}

// ─────────────────────────────────────────────────────────────────────────────
// ARMOR TYPES
// ─────────────────────────────────────────────────────────────────────────────

export const ARMOR_TYPE_INFO: Record<string, string> = {
  light: 'Light armor: AC = base + your full DEX modifier. No DEX limit. Examples: Padded, Leather, Studded Leather.',
  medium: 'Medium armor: AC = base + DEX modifier (max +2). Stealth disadvantage on most. Examples: Hide, Chain Shirt, Scale Mail, Breastplate, Half Plate.',
  heavy: 'Heavy armor: AC = base (no DEX). Often requires minimum STR; gives stealth disadvantage. Examples: Ring Mail, Chain Mail, Splint, Plate.',
  shield: 'Shield: +2 AC while wielded in one hand. Most casters can\'t cast somatic spells while holding one (unless it\'s a free hand spell focus).',
}

// ─────────────────────────────────────────────────────────────────────────────
// MAGIC ITEM RARITY
// ─────────────────────────────────────────────────────────────────────────────

export const RARITY_INFO: Record<string, string> = {
  common: 'Common (50–100 gp). Minor magical items — quivers that resize arrows, candles that never burn out.',
  uncommon: 'Uncommon (101–500 gp). Reliable adventuring magic — Bag of Holding, +1 weapon, Cloak of Protection.',
  rare: 'Rare (501–5,000 gp). Powerful, often a campaign milestone — +2 weapons, Wand of Fireballs.',
  'very rare': 'Very Rare (5,001–50,000 gp). Battle-changing items — +3 weapons, Staff of Power.',
  legendary: 'Legendary (50,001+ gp). Items of legend — Holy Avenger, Vorpal Sword.',
  artifact: 'Artifact: unique, world-shaping items. Cannot be created or destroyed by ordinary means.',
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMON GEAR — quick description fallbacks (when an item has no description set)
// ─────────────────────────────────────────────────────────────────────────────

export const COMMON_GEAR_INFO: Record<string, string> = {
  'healing potion': 'Drink as an action (or admin to another creature). Regain 2d4+2 HP. Bonus action with the proper feat.',
  'potion of healing': 'Drink as an action (or admin to another creature). Regain 2d4+2 HP.',
  rope: '50 ft of hempen rope. 2 HP, AC 11, can be burst with a DC 17 STR check.',
  'silk rope': '50 ft of silk rope. Lighter and stronger than hemp. DC 17 STR to burst.',
  rations: 'One day\'s travel rations (dried food). A creature can go 3 + CON mod days without food before exhaustion.',
  torch: 'Lights a 20 ft radius for 1 hour. Can be used as an improvised weapon (1d4 fire on hit).',
  lantern: 'Hooded: 30 ft bright + 30 ft dim. Bullseye: 60 ft bright + 60 ft dim cone. Burns 1 oil flask = 6 hours.',
  'thieves\' tools': 'Used to pick locks (DEX) and disable traps (DEX or INT). Proficiency adds your bonus.',
  'climber\'s kit': 'Lets you anchor yourself to a wall. Can\'t fall more than 25 ft from anchor; can\'t climb more than 25 ft from it.',
  'holy symbol': 'A divine focus for clerics and paladins. Used to cast spells with material components (in place of components costing nothing).',
  'arcane focus': 'A crystal, orb, rod, staff, or wand used as a spell focus by sorcerers, warlocks, and wizards.',
  'component pouch': 'Holds the material components for spellcasting (those without listed gp cost).',
  'spellbook': 'Wizard\'s book of spells. Required to prepare wizard spells. Holds up to 100 spells (in 1st-level form).',
  'bedroll': 'Required to take a long rest in the wilderness without exhaustion penalties.',
  'caltrops': 'Scatter in a 5-ft square. Creatures moving through must DC 15 DEX save or take 1 damage and have speed reduced to 0 until next turn.',
  'ball bearings': 'Scatter in a 10-ft square. Creatures moving through must DC 10 DEX save or fall prone.',
  'oil flask': 'Pour or throw (range 20 ft). Lit oil burns for 2 rounds, dealing 5 fire damage to creatures inside the area.',
  'acid flask': 'Improvised thrown (range 20 ft). On hit, target takes 2d6 acid damage.',
  'alchemist\'s fire': 'Improvised thrown (range 20 ft). On hit, target takes 1d4 fire damage at start of each turn until they use an action to extinguish (DC 10).',
  'holy water': 'Improvised thrown (range 20 ft). On hit, fiends and undead take 2d6 radiant damage.',
  'crowbar': 'Advantage on Strength checks where the leverage of a crowbar would help (forcing open doors, prying boards, etc.).',
  'manacles': 'Restrain a Small or Medium creature. DC 20 Sleight of Hand to slip; DC 20 STR to break.',
  'mirror': 'Useful for looking around corners, signaling with sunlight, etc.',
  'tinderbox': 'Light a torch (or similar) as an action. Lighting anything else takes a minute.',
}

export function lookupGearInfo(name: string): string | null {
  if (!name) return null
  const key = name.toLowerCase().trim()
  if (COMMON_GEAR_INFO[key]) return COMMON_GEAR_INFO[key]
  // partial match (e.g. "Potion of Healing (Greater)")
  for (const [k, v] of Object.entries(COMMON_GEAR_INFO)) {
    if (key.includes(k)) return v
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGES
// ─────────────────────────────────────────────────────────────────────────────

export const LANGUAGE_INFO: Record<string, string> = {
  common: 'The trade tongue. Most humans, half-elves, half-orcs, and many others speak it.',
  dwarvish: 'Spoken by dwarves; full of hard consonants and guttural sounds. Used in mountain holds and clan-records.',
  elvish: 'Fluid and musical. Spoken by elves; written script is also used for many magical scrolls.',
  giant: 'Spoken by giants and ogres. Has hierarchies of dialects (storm, cloud, fire, frost, hill, stone).',
  gnomish: 'Spoken by gnomes; technical and inventive vocabulary, often used in tinker-marks.',
  goblin: 'Spoken by goblinoids (goblins, hobgoblins, bugbears).',
  halfling: 'Spoken by halflings — rarely written, mostly oral folklore.',
  orc: 'Spoken by orcs; harsh and direct.',
  abyssal: 'Demonic tongue from the Abyss. Twisted form of Celestial.',
  celestial: 'Spoken by celestials and good-aligned outsiders. Often inscribed on holy texts.',
  draconic: 'Ancient language of dragons. Used by sorcerers, kobolds, and in arcane writing.',
  'deep speech': 'Language of aboleths and aberrations. Native to the Far Realm.',
  infernal: 'Spoken by devils. Strict, contractual, used in pacts.',
  primordial: 'Spoken by elementals (Aquan, Auran, Ignan, Terran are dialects).',
  sylvan: 'Spoken by fey creatures of the Feywild — dryads, satyrs, sprites.',
  undercommon: 'Trade tongue of the Underdark. Used by drow, duergar, svirfneblin.',
  thieves: 'Thieves\' Cant: a secret mix of jargon, slang, and signs known by rogues.',
  druidic: 'Secret druid language. Cannot be taught to non-druids; betrayal is a grave offense.',
}

export function lookupLanguageInfo(name: string): string | null {
  if (!name) return null
  const key = name.toLowerCase().trim()
  if (LANGUAGE_INFO[key]) return LANGUAGE_INFO[key]
  for (const [k, v] of Object.entries(LANGUAGE_INFO)) {
    if (key.includes(k)) return v
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSIVE SCORES
// ─────────────────────────────────────────────────────────────────────────────

export const PASSIVE_INFO = {
  perception: 'The DM uses your passive Perception to determine if you notice things without rolling. = 10 + your Perception modifier.',
  investigation: 'Used for noticing details about the environment without rolling. = 10 + your Investigation modifier.',
  insight: 'Used to passively gauge intent or sincerity. = 10 + your Insight modifier.',
}
