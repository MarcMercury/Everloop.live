/**
 * D&D 5e Race Data — compact format for Character Forge
 */

export interface RaceTrait {
  name: string
  desc: string
}

export interface SubraceData {
  name: string
  abilityBonuses: Partial<Record<string, number>>
  traits: RaceTrait[]
}

export interface RaceData {
  name: string
  desc: string
  abilityBonuses: Partial<Record<string, number>>
  size: 'Small' | 'Medium' | 'Medium or Small'
  speed: number
  darkvision: number
  traits: RaceTrait[]
  languages: string[]
  subraces?: SubraceData[]
}

export const RACES: RaceData[] = [
  {
    name: 'Human',
    desc: 'Versatile and ambitious, the most common race in most worlds.',
    abilityBonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    size: 'Medium', speed: 30, darkvision: 0,
    traits: [
      { name: 'Resourceful', desc: 'You gain Heroic Inspiration whenever you finish a Long Rest.' },
      { name: 'Skillful', desc: 'You gain proficiency in one skill of your choice.' },
      { name: 'Versatile', desc: 'You gain an Origin feat of your choice.' },
    ],
    languages: ['Common', 'One extra'],
  },
  {
    name: 'Elf',
    desc: 'Graceful and long-lived, elves are attuned to magic and nature.',
    abilityBonuses: { dexterity: 2 },
    size: 'Medium', speed: 30, darkvision: 60,
    traits: [
      { name: 'Darkvision', desc: 'You can see in dim light within 60 feet as if bright light.' },
      { name: 'Fey Ancestry', desc: 'Advantage on saves against being Charmed. Magic cannot put you to sleep.' },
      { name: 'Keen Senses', desc: 'You have proficiency in the Perception skill.' },
      { name: 'Trance', desc: 'You meditate for 4 hours instead of sleeping 8.' },
    ],
    languages: ['Common', 'Elvish'],
    subraces: [
      { name: 'High Elf', abilityBonuses: { intelligence: 1 }, traits: [
        { name: 'Cantrip', desc: 'You know one cantrip from the Wizard spell list (INT).' },
        { name: 'Extra Language', desc: 'You know one additional language.' },
      ]},
      { name: 'Wood Elf', abilityBonuses: { wisdom: 1 }, traits: [
        { name: 'Fleet of Foot', desc: 'Your base walking speed increases to 35 feet.' },
        { name: 'Mask of the Wild', desc: 'You can attempt to hide when lightly obscured by natural phenomena.' },
      ]},
      { name: 'Drow', abilityBonuses: { charisma: 1 }, traits: [
        { name: 'Superior Darkvision', desc: 'Your darkvision extends to 120 feet.' },
        { name: 'Drow Magic', desc: 'You know the Dancing Lights cantrip. At 3rd level: Faerie Fire. At 5th: Darkness.' },
        { name: 'Sunlight Sensitivity', desc: 'Disadvantage on attack rolls and Perception checks in direct sunlight.' },
      ]},
    ],
  },
  {
    name: 'Dwarf',
    desc: 'Tough and resilient, dwarves are master artisans and warriors.',
    abilityBonuses: { constitution: 2 },
    size: 'Medium', speed: 25, darkvision: 60,
    traits: [
      { name: 'Darkvision', desc: 'You can see in dim light within 60 feet as if bright light.' },
      { name: 'Dwarven Resilience', desc: 'Advantage on saves against poison. Resistance to poison damage.' },
      { name: 'Dwarven Toughness', desc: 'Your hit point maximum increases by 1 per level.' },
      { name: 'Stonecunning', desc: 'Whenever you make a History check related to stonework, add double proficiency.' },
    ],
    languages: ['Common', 'Dwarvish'],
    subraces: [
      { name: 'Hill Dwarf', abilityBonuses: { wisdom: 1 }, traits: [
        { name: 'Dwarven Toughness', desc: 'Your hit point maximum increases by 1, and by 1 every level.' },
      ]},
      { name: 'Mountain Dwarf', abilityBonuses: { strength: 2 }, traits: [
        { name: 'Dwarven Armor Training', desc: 'You have proficiency with light and medium armor.' },
      ]},
    ],
  },
  {
    name: 'Halfling',
    desc: 'Small but brave, halflings are remarkably lucky folk.',
    abilityBonuses: { dexterity: 2 },
    size: 'Small', speed: 25, darkvision: 0,
    traits: [
      { name: 'Brave', desc: 'You have advantage on saving throws against being Frightened.' },
      { name: 'Lucky', desc: 'When you roll a 1 on a d20, you can reroll and must use the new roll.' },
      { name: 'Halfling Nimbleness', desc: 'You can move through the space of any creature one size larger.' },
      { name: 'Naturally Stealthy', desc: 'You can attempt to hide behind a creature one size larger.' },
    ],
    languages: ['Common', 'Halfling'],
    subraces: [
      { name: 'Lightfoot', abilityBonuses: { charisma: 1 }, traits: [
        { name: 'Naturally Stealthy', desc: 'You can hide behind a creature at least one size larger.' },
      ]},
      { name: 'Stout', abilityBonuses: { constitution: 1 }, traits: [
        { name: 'Stout Resilience', desc: 'Advantage on saves against poison. Resistance to poison damage.' },
      ]},
    ],
  },
  {
    name: 'Gnome',
    desc: 'Tinkerers and illusionists, gnomes are small but clever.',
    abilityBonuses: { intelligence: 2 },
    size: 'Small', speed: 25, darkvision: 60,
    traits: [
      { name: 'Darkvision', desc: '60 feet of darkvision.' },
      { name: 'Gnome Cunning', desc: 'Advantage on INT, WIS, and CHA saves against magic.' },
    ],
    languages: ['Common', 'Gnomish'],
    subraces: [
      { name: 'Rock Gnome', abilityBonuses: { constitution: 1 }, traits: [
        { name: "Artificer's Lore", desc: 'Double proficiency on History checks for magic items, alchemical objects, or technology.' },
        { name: 'Tinker', desc: 'You can build Tiny clockwork devices (AC 5, 1 HP).' },
      ]},
      { name: 'Forest Gnome', abilityBonuses: { dexterity: 1 }, traits: [
        { name: 'Natural Illusionist', desc: 'You know the Minor Illusion cantrip.' },
        { name: 'Speak with Small Beasts', desc: 'You can communicate simple ideas with Small or smaller beasts.' },
      ]},
      { name: 'Deep Gnome', abilityBonuses: { dexterity: 1 }, traits: [
        { name: 'Superior Darkvision', desc: 'Your darkvision extends to 120 feet.' },
        { name: 'Stone Camouflage', desc: 'Advantage on Stealth checks to hide in rocky terrain.' },
      ]},
    ],
  },
  {
    name: 'Half-Elf',
    desc: 'Combining human ambition with elven grace and versatility.',
    abilityBonuses: { charisma: 2 },
    size: 'Medium', speed: 30, darkvision: 60,
    traits: [
      { name: 'Darkvision', desc: '60 feet of darkvision.' },
      { name: 'Fey Ancestry', desc: 'Advantage on saves against being Charmed. Cannot be put to sleep by magic.' },
      { name: 'Skill Versatility', desc: 'You gain proficiency in two skills of your choice.' },
      { name: 'Flexible Ability', desc: '+1 to two ability scores of your choice (in addition to CHA +2).' },
    ],
    languages: ['Common', 'Elvish', 'One extra'],
  },
  {
    name: 'Half-Orc',
    desc: 'Fierce warriors with orcish strength and human resolve.',
    abilityBonuses: { strength: 2, constitution: 1 },
    size: 'Medium', speed: 30, darkvision: 60,
    traits: [
      { name: 'Darkvision', desc: '60 feet of darkvision.' },
      { name: 'Menacing', desc: 'You gain proficiency in the Intimidation skill.' },
      { name: 'Relentless Endurance', desc: 'When reduced to 0 HP but not killed, drop to 1 HP instead (1/long rest).' },
      { name: 'Savage Attacks', desc: 'On a critical hit with melee, roll one extra damage die.' },
    ],
    languages: ['Common', 'Orc'],
  },
  {
    name: 'Dragonborn',
    desc: 'Proud draconic warriors with a powerful breath weapon.',
    abilityBonuses: { strength: 2, charisma: 1 },
    size: 'Medium', speed: 30, darkvision: 0,
    traits: [
      { name: 'Breath Weapon', desc: 'Exhale destructive energy (damage type based on ancestry). 2d6 at 1st, scales with level.' },
      { name: 'Damage Resistance', desc: 'Resistance to the damage type of your draconic ancestry.' },
      { name: 'Draconic Ancestry', desc: 'Choose: Black(Acid), Blue(Lightning), Brass(Fire), Bronze(Lightning), Copper(Acid), Gold(Fire), Green(Poison), Red(Fire), Silver(Cold), White(Cold).' },
    ],
    languages: ['Common', 'Draconic'],
  },
  {
    name: 'Tiefling',
    desc: 'Infernally touched beings with innate magical abilities.',
    abilityBonuses: { charisma: 2, intelligence: 1 },
    size: 'Medium', speed: 30, darkvision: 60,
    traits: [
      { name: 'Darkvision', desc: '60 feet of darkvision.' },
      { name: 'Hellish Resistance', desc: 'Resistance to fire damage.' },
      { name: 'Infernal Legacy', desc: 'You know Thaumaturgy. At 3rd: Hellish Rebuke (1/day). At 5th: Darkness (1/day).' },
    ],
    languages: ['Common', 'Infernal'],
  },
  {
    name: 'Goliath',
    desc: 'Mountain-born with incredible endurance and competitive spirit.',
    abilityBonuses: { strength: 2, constitution: 1 },
    size: 'Medium', speed: 30, darkvision: 0,
    traits: [
      { name: "Stone's Endurance", desc: "When hit, use reaction to roll d12 + CON mod and reduce damage by that amount (1/short rest)." },
      { name: 'Powerful Build', desc: 'You count as one size larger for carrying capacity and push/drag/lift.' },
      { name: 'Mountain Born', desc: 'Acclimated to high altitude and naturally adapted to cold climates.' },
      { name: 'Natural Athlete', desc: 'You have proficiency in the Athletics skill.' },
    ],
    languages: ['Common', 'Giant'],
  },
  {
    name: 'Aasimar',
    desc: 'Celestial-touched beings bearing divine power within their souls.',
    abilityBonuses: { charisma: 2 },
    size: 'Medium', speed: 30, darkvision: 60,
    traits: [
      { name: 'Darkvision', desc: '60 feet of darkvision.' },
      { name: 'Celestial Resistance', desc: 'Resistance to necrotic and radiant damage.' },
      { name: 'Healing Hands', desc: 'As an action, touch a creature to restore HP equal to your level (1/long rest).' },
      { name: 'Light Bearer', desc: 'You know the Light cantrip. CHA is your spellcasting ability.' },
      { name: 'Celestial Revelation', desc: 'At 3rd level, choose: Necrotic Shroud, Radiant Consumption, or Radiant Soul.' },
    ],
    languages: ['Common', 'Celestial'],
  },
  {
    name: 'Tabaxi',
    desc: 'Cat-like wanderers driven by curiosity to explore the world.',
    abilityBonuses: { dexterity: 2, charisma: 1 },
    size: 'Medium', speed: 30, darkvision: 60,
    traits: [
      { name: 'Darkvision', desc: '60 feet of darkvision.' },
      { name: "Cat's Claws", desc: 'Climbing speed of 20 feet. Unarmed strikes deal 1d4 slashing.' },
      { name: "Cat's Talent", desc: 'Proficiency in Perception and Stealth.' },
      { name: 'Feline Agility', desc: 'Double your speed until end of turn (recharges when you don\'t move for a turn).' },
    ],
    languages: ['Common', 'One extra'],
  },
  {
    name: 'Firbolg',
    desc: 'Gentle forest guardians with innate connections to nature.',
    abilityBonuses: { wisdom: 2, strength: 1 },
    size: 'Medium', speed: 30, darkvision: 0,
    traits: [
      { name: 'Firbolg Magic', desc: 'You can cast Detect Magic and Disguise Self (1/short rest each).' },
      { name: 'Hidden Step', desc: 'As a bonus action, become invisible until your next turn (1/short rest).' },
      { name: 'Powerful Build', desc: 'You count as one size larger for carrying capacity.' },
      { name: 'Speech of Beast and Leaf', desc: 'You can communicate simple ideas to beasts and plants.' },
    ],
    languages: ['Common', 'Elvish', 'Giant'],
  },
  {
    name: 'Kenku',
    desc: 'Raven-like people who communicate through mimicry.',
    abilityBonuses: { dexterity: 2, wisdom: 1 },
    size: 'Medium', speed: 30, darkvision: 0,
    traits: [
      { name: 'Expert Forgery', desc: 'Advantage on checks to produce forgeries or duplicates.' },
      { name: 'Kenku Training', desc: 'Proficiency in two of: Acrobatics, Deception, Stealth, Sleight of Hand.' },
      { name: 'Mimicry', desc: 'You can mimic sounds and voices you have heard.' },
    ],
    languages: ['Common', 'Auran'],
  },
  {
    name: 'Lizardfolk',
    desc: 'Reptilian people with natural armor and primal instincts.',
    abilityBonuses: { constitution: 2, wisdom: 1 },
    size: 'Medium', speed: 30, darkvision: 0,
    traits: [
      { name: 'Bite', desc: 'Natural weapon: 1d6 + STR piercing damage.' },
      { name: 'Hold Breath', desc: 'You can hold your breath for up to 15 minutes.' },
      { name: 'Hungry Jaws', desc: 'Bonus action bite attack. On hit, gain temp HP = CON mod (1/short rest).' },
      { name: 'Natural Armor', desc: 'Your AC is 13 + DEX modifier when not wearing armor.' },
      { name: "Nature's Intuition", desc: 'Proficiency in two of: Animal Handling, Medicine, Nature, Perception, Stealth, Survival.' },
    ],
    languages: ['Common', 'Draconic'],
  },
  {
    name: 'Triton',
    desc: 'Noble guardians of the deep ocean who have come to the surface.',
    abilityBonuses: { strength: 1, constitution: 1, charisma: 1 },
    size: 'Medium', speed: 30, darkvision: 60,
    traits: [
      { name: 'Amphibious', desc: 'You can breathe air and water.' },
      { name: 'Control Air and Water', desc: 'You can cast Fog Cloud. At 3rd: Gust of Wind. At 5th: Wall of Water.' },
      { name: 'Darkvision', desc: '60 feet of darkvision.' },
      { name: 'Emissary of the Sea', desc: 'You can communicate simple ideas to beasts that breathe water.' },
      { name: 'Guardian of the Depths', desc: 'Resistance to cold damage.' },
    ],
    languages: ['Common', 'Primordial'],
  },
  {
    name: 'Goblin',
    desc: 'Small and scrappy, goblins are nimble survivors.',
    abilityBonuses: { dexterity: 2, constitution: 1 },
    size: 'Small', speed: 30, darkvision: 60,
    traits: [
      { name: 'Darkvision', desc: '60 feet of darkvision.' },
      { name: 'Fury of the Small', desc: 'Extra damage = your level on one hit per turn vs larger creatures (1/short rest).' },
      { name: 'Nimble Escape', desc: 'You can take Disengage or Hide as a bonus action.' },
    ],
    languages: ['Common', 'Goblin'],
  },
  {
    name: 'Hobgoblin',
    desc: 'Disciplined and martial, hobgoblins value strategy and honor.',
    abilityBonuses: { constitution: 2, intelligence: 1 },
    size: 'Medium', speed: 30, darkvision: 60,
    traits: [
      { name: 'Darkvision', desc: '60 feet of darkvision.' },
      { name: 'Fey Gift', desc: 'When you use the Help action, you also gain a bonus: Hospitality (temp HP), Passage (+10ft speed), or Spite (damage on next hit).' },
      { name: 'Fortune from the Many', desc: 'When you miss an attack or fail a check/save, gain a bonus = nearby allies count (1/long rest).' },
    ],
    languages: ['Common', 'Goblin'],
  },
  {
    name: 'Bugbear',
    desc: 'Large and stealthy goblinoids who strike from the shadows.',
    abilityBonuses: { strength: 2, dexterity: 1 },
    size: 'Medium', speed: 30, darkvision: 60,
    traits: [
      { name: 'Darkvision', desc: '60 feet of darkvision.' },
      { name: 'Long-Limbed', desc: 'Your reach is 5 feet greater when you make a melee attack on your turn.' },
      { name: 'Powerful Build', desc: 'You count as one size larger for carrying capacity.' },
      { name: 'Sneaky', desc: 'Proficiency in Stealth.' },
      { name: 'Surprise Attack', desc: 'Deal extra 2d6 damage to a creature you surprise.' },
    ],
    languages: ['Common', 'Goblin'],
  },
  {
    name: 'Kobold',
    desc: 'Small draconic creatures with cunning and resourcefulness.',
    abilityBonuses: { dexterity: 2 },
    size: 'Small', speed: 30, darkvision: 60,
    traits: [
      { name: 'Darkvision', desc: '60 feet of darkvision.' },
      { name: 'Draconic Cry', desc: 'As a bonus action, cry out. Allies have advantage on attacks vs enemies within 10ft of you until your next turn start (prof bonus/long rest).' },
      { name: 'Kobold Legacy', desc: 'Choose one: Craftiness (proficiency in one of Arcana/Investigation/Medicine/Sleight of Hand/Survival), Defiance (advantage on saves vs Frightened), or Draconic Sorcery (one sorcerer cantrip).' },
    ],
    languages: ['Common', 'Draconic'],
  },
  {
    name: 'Orc',
    desc: 'Strong and enduring, orcs push through any challenge.',
    abilityBonuses: { strength: 2, constitution: 1 },
    size: 'Medium', speed: 30, darkvision: 60,
    traits: [
      { name: 'Adrenaline Rush', desc: 'Dash as bonus action and gain temp HP = prof bonus (prof bonus/long rest).' },
      { name: 'Darkvision', desc: '60 feet of darkvision.' },
      { name: 'Powerful Build', desc: 'You count as one size larger for carrying capacity.' },
      { name: 'Relentless Endurance', desc: 'When reduced to 0 HP but not killed, drop to 1 HP instead (1/long rest).' },
    ],
    languages: ['Common', 'Orc'],
  },
  {
    name: 'Changeling',
    desc: 'Shapeshifters who can alter their appearance at will.',
    abilityBonuses: { charisma: 2 },
    size: 'Medium or Small', speed: 30, darkvision: 0,
    traits: [
      { name: 'Changeling Instincts', desc: 'Proficiency in two of: Deception, Insight, Intimidation, Persuasion.' },
      { name: 'Shapechanger', desc: 'As an action, change your appearance (different person, same general body type). Lasts until changed again or you die.' },
    ],
    languages: ['Common', 'Two extra'],
  },
  {
    name: 'Warforged',
    desc: 'Mechanical beings built for war, now seeking purpose.',
    abilityBonuses: { constitution: 2 },
    size: 'Medium', speed: 30, darkvision: 0,
    traits: [
      { name: 'Constructed Resilience', desc: 'Advantage on saves vs poison. Resistance to poison. Immune to disease. No need to eat, drink, or breathe.' },
      { name: 'Integrated Protection', desc: '+1 AC bonus. You can don armor by incorporating it (1 hour to don/doff).' },
      { name: "Sentry's Rest", desc: 'You don\'t sleep. You remain conscious during a long rest (6 hours of inactivity).' },
      { name: 'Specialized Design', desc: 'You gain one skill proficiency and one tool proficiency.' },
    ],
    languages: ['Common', 'One extra'],
  },
  {
    name: 'Genasi',
    desc: 'Elementally touched beings carrying the power of the inner planes.',
    abilityBonuses: { constitution: 2 },
    size: 'Medium', speed: 30, darkvision: 60,
    traits: [
      { name: 'Elemental Heritage', desc: 'Choose a subrace: Air, Earth, Fire, or Water.' },
    ],
    languages: ['Common', 'Primordial'],
    subraces: [
      { name: 'Air Genasi', abilityBonuses: { dexterity: 1 }, traits: [
        { name: 'Unending Breath', desc: 'You can hold your breath indefinitely.' },
        { name: 'Mingle with the Wind', desc: 'You can cast Levitate once per long rest (no components).' },
      ]},
      { name: 'Earth Genasi', abilityBonuses: { strength: 1 }, traits: [
        { name: 'Earth Walk', desc: 'You can move across difficult terrain made of earth or stone without extra movement.' },
        { name: 'Merge with Stone', desc: 'You can cast Pass without Trace once per long rest (no components).' },
      ]},
      { name: 'Fire Genasi', abilityBonuses: { intelligence: 1 }, traits: [
        { name: 'Fire Resistance', desc: 'Resistance to fire damage.' },
        { name: 'Reach to the Blaze', desc: 'You know Produce Flame. At 3rd level, cast Burning Hands 1/long rest.' },
      ]},
      { name: 'Water Genasi', abilityBonuses: { wisdom: 1 }, traits: [
        { name: 'Acid Resistance', desc: 'Resistance to acid damage.' },
        { name: 'Amphibious', desc: 'You can breathe air and water. Swimming speed of 30 feet.' },
        { name: 'Call to the Wave', desc: 'You know Shape Water. At 3rd level, cast Create or Destroy Water 1/long rest.' },
      ]},
    ],
  },
  {
    name: 'Tortle',
    desc: 'Nomadic turtle-folk with natural armor and a love of exploration.',
    abilityBonuses: { strength: 2, wisdom: 1 },
    size: 'Medium', speed: 30, darkvision: 0,
    traits: [
      { name: 'Claws', desc: 'Unarmed strikes deal 1d4 slashing damage.' },
      { name: 'Hold Breath', desc: 'You can hold your breath for up to 1 hour.' },
      { name: 'Natural Armor', desc: 'Your AC is 17 (you cannot wear armor, but can use a shield).' },
      { name: 'Shell Defense', desc: 'Withdraw into your shell as an action. +4 AC, advantage on STR/CON saves, but Speed 0.' },
    ],
    languages: ['Common', 'Aquan'],
  },
  {
    name: 'Aarakocra',
    desc: 'Bird-like people with the gift of flight.',
    abilityBonuses: { dexterity: 2, wisdom: 1 },
    size: 'Medium', speed: 30, darkvision: 0,
    traits: [
      { name: 'Flight', desc: 'You have a flying speed of 50 feet. Cannot fly in medium or heavy armor.' },
      { name: 'Talons', desc: 'Unarmed strikes deal 1d6 slashing damage.' },
      { name: 'Wind Caller', desc: 'You can cast Gust of Wind once per long rest (no components).' },
    ],
    languages: ['Common', 'Auran'],
  },
  {
    name: 'Satyr',
    desc: 'Fey creatures who embody joy, music, and revelry.',
    abilityBonuses: { charisma: 2, dexterity: 1 },
    size: 'Medium', speed: 35, darkvision: 0,
    traits: [
      { name: 'Fey', desc: 'Your creature type is Fey, rather than Humanoid.' },
      { name: 'Magic Resistance', desc: 'Advantage on saving throws against spells.' },
      { name: 'Mirthful Leaps', desc: 'Add 1d8 to any high or long jump distance.' },
      { name: 'Ram', desc: 'Unarmed strikes deal 1d4 bludgeoning damage.' },
      { name: 'Reveler', desc: 'Proficiency in Performance and Persuasion.' },
    ],
    languages: ['Common', 'Sylvan'],
  },
  {
    name: 'Fairy',
    desc: 'Tiny fey spirits with innate flight and magic.',
    abilityBonuses: {},
    size: 'Small', speed: 30, darkvision: 0,
    traits: [
      { name: 'Fey', desc: 'Your creature type is Fey, rather than Humanoid.' },
      { name: 'Flight', desc: 'You have a flying speed equal to your walking speed. Cannot fly in medium or heavy armor.' },
      { name: 'Fairy Magic', desc: 'You know Druidcraft. At 3rd level: Faerie Fire 1/long rest. At 5th: Enlarge/Reduce 1/long rest.' },
    ],
    languages: ['Common', 'Sylvan'],
  },
  {
    name: 'Harengon',
    desc: 'Rabbit-like folk from the Feywild with keen senses.',
    abilityBonuses: {},
    size: 'Medium or Small', speed: 30, darkvision: 0,
    traits: [
      { name: 'Hare-Trigger', desc: 'Add your proficiency bonus to initiative rolls.' },
      { name: 'Leporine Senses', desc: 'Proficiency in the Perception skill.' },
      { name: 'Lucky Footwork', desc: 'When you fail a DEX save, add 1d4 to the result (potentially turning it into a success).' },
      { name: 'Rabbit Hop', desc: "As a bonus action, jump a number of feet equal to 5 × proficiency bonus (prof bonus/long rest)." },
    ],
    languages: ['Common', 'One extra'],
  },
  {
    name: 'Owlin',
    desc: 'Owl-like folk with silent feathers and keen sight.',
    abilityBonuses: {},
    size: 'Medium or Small', speed: 30, darkvision: 120,
    traits: [
      { name: 'Darkvision', desc: '120 feet of darkvision.' },
      { name: 'Flight', desc: 'You have a flying speed equal to your walking speed. Cannot fly in medium or heavy armor.' },
      { name: 'Silent Feathers', desc: 'Proficiency in Stealth.' },
    ],
    languages: ['Common', 'One extra'],
  },
  {
    name: 'Kalashtar',
    desc: 'Psionic beings created from the union of humanity and dream spirits.',
    abilityBonuses: { wisdom: 2, charisma: 1 },
    size: 'Medium', speed: 30, darkvision: 0,
    traits: [
      { name: 'Dual Mind', desc: 'Advantage on Wisdom saving throws.' },
      { name: 'Mental Discipline', desc: 'Resistance to psychic damage.' },
      { name: 'Mind Link', desc: 'Speak telepathically to a creature within 10 × your level feet.' },
      { name: 'Severed from Dreams', desc: 'Immune to spells or effects that require you to dream.' },
    ],
    languages: ['Common', 'Quori', 'One extra'],
  },
  {
    name: 'Shifter',
    desc: 'Descendants of lycanthropes who can temporarily enhance bestial traits.',
    abilityBonuses: {},
    size: 'Medium', speed: 30, darkvision: 60,
    traits: [
      { name: 'Bestial Instincts', desc: 'Proficiency in one of: Acrobatics, Athletics, Intimidation, or Survival.' },
      { name: 'Darkvision', desc: '60 feet of darkvision.' },
      { name: 'Shifting', desc: 'As a bonus action, gain temp HP = prof bonus + 1d6 for 1 minute. Additional benefit based on subrace (prof bonus/long rest).' },
    ],
    languages: ['Common', 'One extra'],
  },
  {
    name: 'Yuan-Ti',
    desc: 'Serpentine beings blessed with resistance to magic and poison.',
    abilityBonuses: { charisma: 2, intelligence: 1 },
    size: 'Medium', speed: 30, darkvision: 60,
    traits: [
      { name: 'Darkvision', desc: '60 feet of darkvision.' },
      { name: 'Magic Resistance', desc: 'Advantage on saving throws against spells and other magical effects.' },
      { name: 'Poison Resilience', desc: 'Advantage on saves against poison. Resistance to poison damage.' },
      { name: 'Serpentine Spellcasting', desc: 'You know Poison Spray. At 3rd: Animal Friendship (snakes only). At 5th: Suggestion. 1/long rest each.' },
    ],
    languages: ['Common', 'Abyssal', 'Draconic'],
  },
  {
    name: 'Plasmoid',
    desc: 'Amorphous ooze-like beings able to reshape their bodies at will.',
    abilityBonuses: {},
    size: 'Medium or Small', speed: 30, darkvision: 60,
    traits: [
      { name: 'Amorphous', desc: 'You can squeeze through 1-inch-wide spaces.' },
      { name: 'Darkvision', desc: '60 feet of darkvision.' },
      { name: 'Hold Breath', desc: 'You can hold your breath for 1 hour.' },
      { name: 'Natural Resilience', desc: 'Resistance to acid and poison damage.' },
      { name: 'Shape Self', desc: 'As an action, reshape your body to form limbs, appendages, or extrude a pseudopod with 10ft reach.' },
    ],
    languages: ['Common', 'One extra'],
  },
]

/** Lookup a race by name */
export function getRace(name: string): RaceData | undefined {
  return RACES.find(r => r.name === name)
}

/** Get all race names */
export function getRaceNames(): string[] {
  return RACES.map(r => r.name)
}

/** Get combined ability bonuses for a race + optional subrace */
export function getRaceAbilityBonuses(raceName: string, subraceName?: string): Partial<Record<string, number>> {
  const race = getRace(raceName)
  if (!race) return {}
  const bonuses = { ...race.abilityBonuses }
  if (subraceName && race.subraces) {
    const sub = race.subraces.find(s => s.name === subraceName)
    if (sub) {
      for (const [key, val] of Object.entries(sub.abilityBonuses)) {
        bonuses[key] = (bonuses[key] || 0) + (val || 0)
      }
    }
  }
  return bonuses
}

// ── RACIAL SPELLCASTING LOOKUP ──

export interface RacialSpellEntry {
  spell: string
  spellLevel: number // 0 = cantrip
  level: number // character level required
  note?: string
}

/** Racial spellcasting for races that have innate spells */
export const RACIAL_SPELLCASTING: Record<string, RacialSpellEntry[]> = {
  Tiefling: [
    { spell: 'Thaumaturgy', spellLevel: 0, level: 1 },
    { spell: 'Hellish Rebuke', spellLevel: 1, level: 3, note: '1/long rest, 2nd-level' },
    { spell: 'Darkness', spellLevel: 2, level: 5, note: '1/long rest' },
  ],
  Aasimar: [
    { spell: 'Light', spellLevel: 0, level: 1 },
  ],
  Drow: [
    { spell: 'Dancing Lights', spellLevel: 0, level: 1 },
    { spell: 'Faerie Fire', spellLevel: 1, level: 3, note: '1/long rest' },
    { spell: 'Darkness', spellLevel: 2, level: 5, note: '1/long rest' },
  ],
  'Forest Gnome': [
    { spell: 'Minor Illusion', spellLevel: 0, level: 1 },
  ],
  'High Elf': [
    { spell: '(Choose one Wizard cantrip)', spellLevel: 0, level: 1 },
  ],
  'Fire Genasi': [
    { spell: 'Produce Flame', spellLevel: 0, level: 1 },
    { spell: 'Burning Hands', spellLevel: 1, level: 3, note: '1/long rest' },
  ],
  'Water Genasi': [
    { spell: 'Shape Water', spellLevel: 0, level: 1 },
    { spell: 'Create or Destroy Water', spellLevel: 1, level: 3, note: '1/long rest' },
  ],
  'Earth Genasi': [
    { spell: 'Blade Ward', spellLevel: 0, level: 1 },
    { spell: 'Pass without Trace', spellLevel: 2, level: 3, note: '1/long rest' },
  ],
  'Air Genasi': [
    { spell: 'Shocking Grasp', spellLevel: 0, level: 1 },
    { spell: 'Feather Fall', spellLevel: 1, level: 3, note: '1/long rest' },
  ],
  Fairy: [
    { spell: 'Druidcraft', spellLevel: 0, level: 1 },
    { spell: 'Faerie Fire', spellLevel: 1, level: 3, note: '1/long rest' },
    { spell: 'Enlarge/Reduce', spellLevel: 2, level: 5, note: '1/long rest' },
  ],
  Firbolg: [
    { spell: 'Detect Magic', spellLevel: 1, level: 1, note: '1/long rest' },
    { spell: 'Disguise Self', spellLevel: 1, level: 1, note: '1/long rest' },
  ],
  Triton: [
    { spell: 'Fog Cloud', spellLevel: 1, level: 1, note: '1/long rest' },
    { spell: 'Gust of Wind', spellLevel: 2, level: 3, note: '1/long rest' },
    { spell: 'Wall of Water', spellLevel: 3, level: 5, note: '1/long rest' },
  ],
  'Yuan-Ti': [
    { spell: 'Poison Spray', spellLevel: 0, level: 1 },
    { spell: 'Animal Friendship', spellLevel: 1, level: 3, note: '1/long rest, snakes only' },
    { spell: 'Suggestion', spellLevel: 2, level: 5, note: '1/long rest' },
  ],
  Githyanki: [
    { spell: 'Mage Hand', spellLevel: 0, level: 1 },
    { spell: 'Jump', spellLevel: 1, level: 3, note: '1/long rest' },
    { spell: 'Misty Step', spellLevel: 2, level: 5, note: '1/long rest' },
  ],
  Githzerai: [
    { spell: 'Mage Hand', spellLevel: 0, level: 1 },
    { spell: 'Shield', spellLevel: 1, level: 3, note: '1/long rest' },
    { spell: 'Detect Thoughts', spellLevel: 2, level: 5, note: '1/long rest' },
  ],
}

/** Get racial spells for a given race (checks subraces too) */
export function getRacialSpells(raceName: string, level: number): RacialSpellEntry[] {
  const spells = RACIAL_SPELLCASTING[raceName] ?? []
  return spells.filter(s => s.level <= level)
}
