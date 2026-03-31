/**
 * D&D 5e Class Data — compact format for Character Forge
 * Includes hit dice, proficiencies, features by level, subclass options, and spellcasting info
 */

export interface ClassFeature {
  level: number
  name: string
  desc: string
  uses?: number
  recharge?: 'short' | 'long' | 'none'
}

export interface SubclassOption {
  name: string
  desc: string
}

export interface SkillChoice {
  count: number
  from: string[]
}

export interface ClassSpellcasting {
  ability: 'intelligence' | 'wisdom' | 'charisma'
  type: 'prepared' | 'known' | 'pact'
  cantripsKnown: number[]   // index 0=lv1, 19=lv20
  spellsKnown?: number[]    // for 'known' casters (bard, sorcerer, ranger, warlock)
}

export interface ClassData {
  name: string
  desc: string
  hitDie: number
  primaryAbility: string
  savingThrows: string[]
  armorProfs: string[]
  weaponProfs: string[]
  toolProfs: string[]
  skillChoice: SkillChoice
  startingHP: string
  spellcasting?: ClassSpellcasting
  features: ClassFeature[]
  subclassLevel: number
  subclassName: string
  subclasses: SubclassOption[]
}

const ALL_SKILLS = ['Acrobatics','Animal Handling','Arcana','Athletics','Deception','History','Insight','Intimidation','Investigation','Medicine','Nature','Perception','Performance','Persuasion','Religion','Sleight of Hand','Stealth','Survival']

export const CLASSES: ClassData[] = [
  {
    name: 'Barbarian', desc: 'Fierce warriors fueled by primal rage.', hitDie: 12,
    primaryAbility: 'Strength', savingThrows: ['STR', 'CON'],
    armorProfs: ['Light', 'Medium', 'Shields'], weaponProfs: ['Simple', 'Martial'], toolProfs: [],
    skillChoice: { count: 2, from: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'] },
    startingHP: '12 + CON modifier',
    subclassLevel: 3, subclassName: 'Primal Path',
    subclasses: [
      { name: 'Path of the Berserker', desc: 'Channel rage into violent fury.' },
      { name: 'Path of the Totem Warrior', desc: 'Attune to the spirit of an animal.' },
      { name: 'Path of the Ancestral Guardian', desc: 'Call upon ancestral spirits to protect allies.' },
      { name: 'Path of the Storm Herald', desc: 'Channel natural storms through your rage.' },
      { name: 'Path of the Zealot', desc: 'Rage fueled by divine power.' },
      { name: 'Path of the Beast', desc: 'Transform your body with bestial rage.' },
      { name: 'Path of Wild Magic', desc: 'Rage causes surges of wild magic.' },
    ],
    features: [
      { level: 1, name: 'Rage', desc: 'Bonus damage, resistance to bludgeoning/piercing/slashing. Adv on STR checks/saves. 2 uses at lv1.', uses: 2, recharge: 'long' },
      { level: 1, name: 'Unarmored Defense', desc: 'AC = 10 + DEX mod + CON mod when not wearing armor.' },
      { level: 2, name: 'Reckless Attack', desc: 'Advantage on STR melee attacks this turn, but attacks against you have advantage.' },
      { level: 2, name: 'Danger Sense', desc: 'Advantage on DEX saving throws against effects you can see.' },
      { level: 3, name: 'Primal Path', desc: 'Choose your subclass path.' },
      { level: 5, name: 'Extra Attack', desc: 'Attack twice when you take the Attack action.' },
      { level: 5, name: 'Fast Movement', desc: '+10 feet to speed when not wearing heavy armor.' },
      { level: 7, name: 'Feral Instinct', desc: 'Advantage on initiative. If surprised, act normally if you rage first.' },
      { level: 9, name: 'Brutal Critical', desc: 'Roll one additional weapon damage die on a critical hit.' },
      { level: 11, name: 'Relentless Rage', desc: 'If you drop to 0 HP while raging, make a DC 10 CON save to drop to 1 HP instead.' },
      { level: 15, name: 'Persistent Rage', desc: 'Your rage only ends early if you choose to end it or fall unconscious.' },
      { level: 18, name: 'Indomitable Might', desc: 'If your STR check total is less than your STR score, use that score instead.' },
      { level: 20, name: 'Primal Champion', desc: '+4 to Strength and Constitution (max 24).' },
    ],
  },
  {
    name: 'Bard', desc: 'Charismatic performers wielding magic through art.', hitDie: 8,
    primaryAbility: 'Charisma', savingThrows: ['DEX', 'CHA'],
    armorProfs: ['Light'], weaponProfs: ['Simple', 'Hand Crossbows', 'Longswords', 'Rapiers', 'Shortswords'], toolProfs: ['Three musical instruments'],
    skillChoice: { count: 3, from: ALL_SKILLS },
    startingHP: '8 + CON modifier',
    spellcasting: { ability: 'charisma', type: 'known', cantripsKnown: [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4], spellsKnown: [4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22] },
    subclassLevel: 3, subclassName: 'Bard College',
    subclasses: [
      { name: 'College of Lore', desc: 'Pursue beauty and truth through knowledge.' },
      { name: 'College of Valor', desc: 'Inspire others through deeds of combat.' },
      { name: 'College of Glamour', desc: 'Weave fey magic into your performance.' },
      { name: 'College of Swords', desc: 'Entertain through daring feats of weapon prowess.' },
      { name: 'College of Whispers', desc: 'Use words as weapons, dealing psychic damage.' },
      { name: 'College of Eloquence', desc: 'Master the art of oratory and persuasion.' },
      { name: 'College of Creation', desc: 'Bring ideas to life through creative magic.' },
    ],
    features: [
      { level: 1, name: 'Spellcasting', desc: 'CHA-based spellcasting. Known spells from Bard spell list.' },
      { level: 1, name: 'Bardic Inspiration', desc: 'Give a d6 inspiration die to an ally (CHA mod/long rest). Die scales: d8 at 5, d10 at 10, d12 at 15.' },
      { level: 2, name: 'Jack of All Trades', desc: 'Add half your proficiency bonus to any ability check that doesn\'t already include it.' },
      { level: 2, name: 'Song of Rest', desc: 'During short rest, allies who spend Hit Dice regain extra 1d6 HP.' },
      { level: 3, name: 'Bard College', desc: 'Choose your subclass.' },
      { level: 3, name: 'Expertise', desc: 'Double proficiency bonus for two skill proficiencies.' },
      { level: 5, name: 'Font of Inspiration', desc: 'Bardic Inspiration recharges on a short rest.' },
      { level: 6, name: 'Countercharm', desc: 'Allies within 30ft have advantage on saves vs being charmed or frightened.' },
      { level: 10, name: 'Magical Secrets', desc: 'Learn two spells from any class spell list.' },
      { level: 20, name: 'Superior Inspiration', desc: 'If you have no Bardic Inspiration dice when you roll initiative, regain one.' },
    ],
  },
  {
    name: 'Cleric', desc: 'Divine servants channeling the power of their gods.', hitDie: 8,
    primaryAbility: 'Wisdom', savingThrows: ['WIS', 'CHA'],
    armorProfs: ['Light', 'Medium', 'Shields'], weaponProfs: ['Simple'], toolProfs: [],
    skillChoice: { count: 2, from: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'] },
    startingHP: '8 + CON modifier',
    spellcasting: { ability: 'wisdom', type: 'prepared', cantripsKnown: [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5] },
    subclassLevel: 1, subclassName: 'Divine Domain',
    subclasses: [
      { name: 'Life Domain', desc: 'Focus on healing and restoring the injured.' },
      { name: 'Light Domain', desc: 'Wield the power of fire and radiance.' },
      { name: 'Tempest Domain', desc: 'Command storms, lightning, and thunder.' },
      { name: 'Knowledge Domain', desc: 'Seek and share knowledge.' },
      { name: 'War Domain', desc: 'Inspire valor and smite enemies.' },
      { name: 'Trickery Domain', desc: 'Use deception and illusions.' },
      { name: 'Nature Domain', desc: 'Commune with nature\'s power.' },
      { name: 'Forge Domain', desc: 'Master of creation and smithing.' },
      { name: 'Grave Domain', desc: 'Guard the boundary between life and death.' },
      { name: 'Order Domain', desc: 'Enforce law and obedience.' },
      { name: 'Peace Domain', desc: 'Foster bonds and unity.' },
      { name: 'Twilight Domain', desc: 'Provide comfort in the encroaching darkness.' },
    ],
    features: [
      { level: 1, name: 'Spellcasting', desc: 'WIS-based prepared spellcasting from the full Cleric spell list.' },
      { level: 1, name: 'Divine Domain', desc: 'Choose your domain, granting domain spells and features.' },
      { level: 2, name: 'Channel Divinity', desc: 'Channel divine energy: Turn Undead + domain feature. 1 use/short rest (2 at 6, 3 at 18).' },
      { level: 5, name: 'Destroy Undead', desc: 'Undead of CR 1/2 or lower are destroyed by Turn Undead. Threshold increases with level.' },
      { level: 10, name: 'Divine Intervention', desc: 'Call upon your deity for aid. % chance = your cleric level. Guaranteed at 20.' },
    ],
  },
  {
    name: 'Druid', desc: 'Nature guardians who channel primal magic.', hitDie: 8,
    primaryAbility: 'Wisdom', savingThrows: ['INT', 'WIS'],
    armorProfs: ['Light', 'Medium', 'Shields (non-metal)'], weaponProfs: ['Clubs', 'Daggers', 'Darts', 'Javelins', 'Maces', 'Quarterstaffs', 'Scimitars', 'Sickles', 'Slings', 'Spears'], toolProfs: ['Herbalism kit'],
    skillChoice: { count: 2, from: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'] },
    startingHP: '8 + CON modifier',
    spellcasting: { ability: 'wisdom', type: 'prepared', cantripsKnown: [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4] },
    subclassLevel: 2, subclassName: 'Druid Circle',
    subclasses: [
      { name: 'Circle of the Land', desc: 'Draw power from a particular biome.' },
      { name: 'Circle of the Moon', desc: 'Master of Wild Shape combat forms.' },
      { name: 'Circle of Dreams', desc: 'Draw on Feywild magic to heal and protect.' },
      { name: 'Circle of the Shepherd', desc: 'Commune with nature spirits to aid allies.' },
      { name: 'Circle of Spores', desc: 'Wield the power of decay and fungi.' },
      { name: 'Circle of Stars', desc: 'Harness the power of starlight.' },
      { name: 'Circle of Wildfire', desc: 'Understand the destructive and creative power of fire.' },
    ],
    features: [
      { level: 1, name: 'Spellcasting', desc: 'WIS-based prepared spellcasting from the full Druid spell list.' },
      { level: 1, name: 'Druidic', desc: 'You know Druidic, the secret language of druids.' },
      { level: 2, name: 'Wild Shape', desc: 'Transform into beasts you have seen. 2 uses/short rest. Max CR scales with level.' },
      { level: 2, name: 'Druid Circle', desc: 'Choose your subclass.' },
      { level: 18, name: 'Timeless Body', desc: 'You age 1 year for every 10 years that pass.' },
      { level: 18, name: 'Beast Spells', desc: 'You can cast spells while in Wild Shape.' },
      { level: 20, name: 'Archdruid', desc: 'You can use Wild Shape an unlimited number of times.' },
    ],
  },
  {
    name: 'Fighter', desc: 'Masters of martial combat and tactical warfare.', hitDie: 10,
    primaryAbility: 'Strength or Dexterity', savingThrows: ['STR', 'CON'],
    armorProfs: ['Light', 'Medium', 'Heavy', 'Shields'], weaponProfs: ['Simple', 'Martial'], toolProfs: [],
    skillChoice: { count: 2, from: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'] },
    startingHP: '10 + CON modifier',
    subclassLevel: 3, subclassName: 'Martial Archetype',
    subclasses: [
      { name: 'Champion', desc: 'Improved critical hits and athletic prowess.' },
      { name: 'Battle Master', desc: 'Tactical superiority through combat maneuvers.' },
      { name: 'Eldritch Knight', desc: 'Blend martial skill with arcane magic.' },
      { name: 'Arcane Archer', desc: 'Imbue arrows with powerful magic.' },
      { name: 'Cavalier', desc: 'Mounted combat specialist and protector.' },
      { name: 'Samurai', desc: 'Unyielding fighting spirit and determination.' },
      { name: 'Psi Warrior', desc: 'Augment physical might with psionic power.' },
      { name: 'Rune Knight', desc: 'Enhance abilities with ancient giant runes.' },
      { name: 'Echo Knight', desc: 'Manifest echoes of yourself from alternate timelines.' },
    ],
    features: [
      { level: 1, name: 'Fighting Style', desc: 'Choose one: Archery (+2 ranged), Defense (+1 AC), Dueling (+2 damage), Great Weapon Fighting, Protection, Two-Weapon Fighting.' },
      { level: 1, name: 'Second Wind', desc: 'Bonus action: regain 1d10 + fighter level HP. 1 use/short rest.', uses: 1, recharge: 'short' },
      { level: 2, name: 'Action Surge', desc: 'Take one additional action on your turn. 1 use/short rest (2 at 17).', uses: 1, recharge: 'short' },
      { level: 3, name: 'Martial Archetype', desc: 'Choose your subclass.' },
      { level: 5, name: 'Extra Attack', desc: 'Attack twice when you take the Attack action (3 at 11, 4 at 20).' },
      { level: 9, name: 'Indomitable', desc: 'Reroll a failed saving throw. 1 use/long rest (2 at 13, 3 at 17).', uses: 1, recharge: 'long' },
    ],
  },
  {
    name: 'Monk', desc: 'Martial artists who harness ki energy.', hitDie: 8,
    primaryAbility: 'Dexterity & Wisdom', savingThrows: ['STR', 'DEX'],
    armorProfs: [], weaponProfs: ['Simple', 'Shortswords'], toolProfs: ['One artisan tool or musical instrument'],
    skillChoice: { count: 2, from: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'] },
    startingHP: '8 + CON modifier',
    subclassLevel: 3, subclassName: 'Monastic Tradition',
    subclasses: [
      { name: 'Way of the Open Hand', desc: 'Master of unarmed martial combat.' },
      { name: 'Way of Shadow', desc: 'Follow the path of darkness and stealth through ki.' },
      { name: 'Way of the Four Elements', desc: 'Harness the elements through ki.' },
      { name: 'Way of the Drunken Master', desc: 'Erratic, unpredictable fighting style.' },
      { name: 'Way of the Kensei', desc: 'Extend ki into weapons you wield.' },
      { name: 'Way of the Sun Soul', desc: 'Channel ki into searing bolts of radiant energy.' },
      { name: 'Way of Mercy', desc: 'Use ki to mend wounds and inflict harm.' },
      { name: 'Way of the Astral Self', desc: 'Manifest spectral astral arms and visage.' },
    ],
    features: [
      { level: 1, name: 'Unarmored Defense', desc: 'AC = 10 + DEX mod + WIS mod when not wearing armor.' },
      { level: 1, name: 'Martial Arts', desc: 'Use DEX for unarmed/monk weapons. Bonus action unarmed strike. Damage: d4 (scales to d10 at 17).' },
      { level: 2, name: 'Ki', desc: 'Ki points = monk level. Flurry of Blows, Patient Defense, Step of the Wind.' },
      { level: 2, name: 'Unarmored Movement', desc: '+10 ft speed (scales to +30 at 18).' },
      { level: 3, name: 'Monastic Tradition', desc: 'Choose your subclass.' },
      { level: 3, name: 'Deflect Missiles', desc: 'Reduce ranged weapon damage by 1d10 + DEX mod + monk level. If reduced to 0, catch and throw it back.' },
      { level: 4, name: 'Slow Fall', desc: 'Reduce falling damage by 5 × monk level.' },
      { level: 5, name: 'Extra Attack', desc: 'Attack twice when you take the Attack action.' },
      { level: 5, name: 'Stunning Strike', desc: 'Spend 1 ki when you hit. Target must make CON save or be Stunned.' },
      { level: 7, name: 'Evasion', desc: 'On DEX saves: no damage on success, half on failure.' },
      { level: 7, name: 'Stillness of Mind', desc: 'Use your action to end one charmed or frightened effect on yourself.' },
      { level: 10, name: 'Purity of Body', desc: 'Immune to disease and poison.' },
      { level: 13, name: 'Tongue of the Sun and Moon', desc: 'Understand all spoken languages. Any creature can understand you.' },
      { level: 14, name: 'Diamond Soul', desc: 'Proficiency in all saving throws. Spend 1 ki to reroll a failed save.' },
      { level: 15, name: 'Timeless Body', desc: 'You suffer none of the frailty of old age.' },
      { level: 18, name: 'Empty Body', desc: 'Spend 4 ki to become invisible for 1 minute.' },
      { level: 20, name: 'Perfect Self', desc: 'If you have no ki when rolling initiative, regain 4 ki.' },
    ],
  },
  {
    name: 'Paladin', desc: 'Holy warriors bound by sacred oaths.', hitDie: 10,
    primaryAbility: 'Strength & Charisma', savingThrows: ['WIS', 'CHA'],
    armorProfs: ['Light', 'Medium', 'Heavy', 'Shields'], weaponProfs: ['Simple', 'Martial'], toolProfs: [],
    skillChoice: { count: 2, from: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'] },
    startingHP: '10 + CON modifier',
    spellcasting: { ability: 'charisma', type: 'prepared', cantripsKnown: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
    subclassLevel: 3, subclassName: 'Sacred Oath',
    subclasses: [
      { name: 'Oath of Devotion', desc: 'Uphold the ideals of justice and virtue.' },
      { name: 'Oath of the Ancients', desc: 'Protect the light against darkness.' },
      { name: 'Oath of Vengeance', desc: 'Punish those who commit grievous sins.' },
      { name: 'Oath of Conquest', desc: 'Rule with an iron fist through strength.' },
      { name: 'Oath of Redemption', desc: 'Seek to redeem the wicked, not destroy them.' },
      { name: 'Oath of Glory', desc: 'Train relentlessly to achieve legendary feats.' },
      { name: 'Oath of the Watchers', desc: 'Guard against extraplanar threats.' },
      { name: 'Oathbreaker', desc: 'A paladin who has broken their sacred oath.' },
    ],
    features: [
      { level: 1, name: 'Divine Sense', desc: 'Detect celestials, fiends, and undead within 60 feet. CHA mod + 1 uses/long rest.' },
      { level: 1, name: 'Lay on Hands', desc: 'Pool of HP = paladin level × 5. Touch to heal or cure disease/poison (5 HP per).' },
      { level: 2, name: 'Fighting Style', desc: 'Choose one: Defense, Dueling, Great Weapon Fighting, Protection.' },
      { level: 2, name: 'Spellcasting', desc: 'CHA-based prepared spellcasting. Prepare CHA mod + half paladin level spells.' },
      { level: 2, name: 'Divine Smite', desc: 'Expend spell slot on hit for extra 2d8 radiant damage (+1d8 per slot above 1st, +1d8 vs undead/fiend).' },
      { level: 3, name: 'Sacred Oath', desc: 'Choose your subclass oath.' },
      { level: 3, name: 'Channel Divinity', desc: 'Gain oath-specific Channel Divinity options. 1 use/short rest.' },
      { level: 5, name: 'Extra Attack', desc: 'Attack twice when you take the Attack action.' },
      { level: 6, name: 'Aura of Protection', desc: 'You and allies within 10 feet add your CHA mod to saving throws.' },
      { level: 10, name: 'Aura of Courage', desc: 'You and allies within 10 feet can\'t be frightened.' },
      { level: 11, name: 'Improved Divine Smite', desc: 'All melee weapon attacks deal extra 1d8 radiant damage.' },
      { level: 14, name: 'Cleansing Touch', desc: 'End one spell on yourself or a willing creature by touch. CHA mod uses/long rest.' },
    ],
  },
  {
    name: 'Ranger', desc: 'Wilderness warriors who hunt dangerous foes.', hitDie: 10,
    primaryAbility: 'Dexterity & Wisdom', savingThrows: ['STR', 'DEX'],
    armorProfs: ['Light', 'Medium', 'Shields'], weaponProfs: ['Simple', 'Martial'], toolProfs: [],
    skillChoice: { count: 3, from: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'] },
    startingHP: '10 + CON modifier',
    spellcasting: { ability: 'wisdom', type: 'known', cantripsKnown: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], spellsKnown: [0,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11] },
    subclassLevel: 3, subclassName: 'Ranger Archetype',
    subclasses: [
      { name: 'Hunter', desc: 'Accept the challenge of protecting the world from dangerous foes.' },
      { name: 'Beast Master', desc: 'Form a mystical bond with a beast companion.' },
      { name: 'Gloom Stalker', desc: 'Ambush predator in the darkest places.' },
      { name: 'Horizon Walker', desc: 'Guard the world against extraplanar threats.' },
      { name: 'Monster Slayer', desc: 'Specialize in hunting specific deadly creatures.' },
      { name: 'Fey Wanderer', desc: 'Walk the twilight between the Feywild and the Material Plane.' },
      { name: 'Swarmkeeper', desc: 'Command a swarm of nature spirits.' },
      { name: 'Drakewarden', desc: 'Bond with a draconic spirit companion.' },
    ],
    features: [
      { level: 1, name: 'Favored Enemy', desc: 'Choose a favored enemy type. Advantage on Survival checks to track and INT checks to recall info about them.' },
      { level: 1, name: 'Natural Explorer', desc: 'Choose a favored terrain. Benefits when traveling and foraging in that terrain.' },
      { level: 2, name: 'Spellcasting', desc: 'WIS-based known spellcasting from the Ranger spell list.' },
      { level: 2, name: 'Fighting Style', desc: 'Choose: Archery, Defense, Dueling, Two-Weapon Fighting.' },
      { level: 3, name: 'Ranger Archetype', desc: 'Choose your subclass.' },
      { level: 3, name: "Primeval Awareness", desc: 'Spend a spell slot to sense favored enemies within 1 mile (6 in favored terrain).' },
      { level: 5, name: 'Extra Attack', desc: 'Attack twice when you take the Attack action.' },
      { level: 8, name: "Land's Stride", desc: 'Moving through nonmagical difficult terrain costs no extra movement.' },
      { level: 10, name: 'Hide in Plain Sight', desc: 'Camouflage yourself to gain +10 to Stealth checks while motionless.' },
      { level: 14, name: 'Vanish', desc: 'You can use Hide as a bonus action. You can\'t be tracked by nonmagical means.' },
      { level: 18, name: 'Feral Senses', desc: 'No disadvantage on attacks against creatures you can\'t see within 30 feet.' },
      { level: 20, name: 'Foe Slayer', desc: 'Add WIS mod to attack or damage roll against a favored enemy (1/turn).' },
    ],
  },
  {
    name: 'Rogue', desc: 'Cunning tricksters and deadly precision strikers.', hitDie: 8,
    primaryAbility: 'Dexterity', savingThrows: ['DEX', 'INT'],
    armorProfs: ['Light'], weaponProfs: ['Simple', 'Hand Crossbows', 'Longswords', 'Rapiers', 'Shortswords'], toolProfs: ["Thieves' tools"],
    skillChoice: { count: 4, from: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'] },
    startingHP: '8 + CON modifier',
    subclassLevel: 3, subclassName: 'Roguish Archetype',
    subclasses: [
      { name: 'Thief', desc: 'Master of stealth and stealing.' },
      { name: 'Assassin', desc: 'Master of poison and disguise for deadly ambushes.' },
      { name: 'Arcane Trickster', desc: 'Enhance roguish abilities with arcane spells.' },
      { name: 'Mastermind', desc: 'Master of intrigue and manipulation.' },
      { name: 'Swashbuckler', desc: 'Daring duelist with flair and charm.' },
      { name: 'Scout', desc: 'Skilled skirmisher and explorer.' },
      { name: 'Inquisitive', desc: 'Root out secrets and unravel mysteries.' },
      { name: 'Phantom', desc: 'Walk the line between life and death.' },
      { name: 'Soulknife', desc: 'Strike with psionic blades of energy.' },
    ],
    features: [
      { level: 1, name: 'Expertise', desc: 'Double proficiency bonus for two skill proficiencies (two more at 6th level).' },
      { level: 1, name: 'Sneak Attack', desc: '1d6 extra damage 1/turn with finesse/ranged weapon when you have advantage or ally is adjacent. Scales every 2 levels.' },
      { level: 1, name: "Thieves' Cant", desc: 'You know the secret rogue language for hidden messages.' },
      { level: 2, name: 'Cunning Action', desc: 'Dash, Disengage, or Hide as a bonus action.' },
      { level: 3, name: 'Roguish Archetype', desc: 'Choose your subclass.' },
      { level: 5, name: 'Uncanny Dodge', desc: 'When an attacker you can see hits you, halve the damage (reaction).' },
      { level: 7, name: 'Evasion', desc: 'On DEX saves: no damage on success, half on failure.' },
      { level: 11, name: 'Reliable Talent', desc: 'Treat any d20 roll of 9 or lower as a 10 for proficient skills.' },
      { level: 14, name: 'Blindsense', desc: 'If you can hear, you are aware of any hidden or invisible creature within 10 feet of you.' },
      { level: 15, name: 'Slippery Mind', desc: 'You gain proficiency in Wisdom saving throws.' },
      { level: 18, name: 'Elusive', desc: 'No attack roll has advantage against you while you aren\'t incapacitated.' },
      { level: 20, name: 'Stroke of Luck', desc: 'Turn a miss into a hit, or a failed ability check into a 20 (1/short rest).', uses: 1, recharge: 'short' },
    ],
  },
  {
    name: 'Sorcerer', desc: 'Innate spellcasters with raw magical power.', hitDie: 6,
    primaryAbility: 'Charisma', savingThrows: ['CON', 'CHA'],
    armorProfs: [], weaponProfs: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light Crossbows'], toolProfs: [],
    skillChoice: { count: 2, from: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'] },
    startingHP: '6 + CON modifier',
    spellcasting: { ability: 'charisma', type: 'known', cantripsKnown: [4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6], spellsKnown: [2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15] },
    subclassLevel: 1, subclassName: 'Sorcerous Origin',
    subclasses: [
      { name: 'Draconic Bloodline', desc: 'Your innate magic comes from draconic heritage.' },
      { name: 'Wild Magic', desc: 'Your magic is fueled by chaotic, unpredictable forces.' },
      { name: 'Divine Soul', desc: 'Touched by divine power, accessing cleric spells.' },
      { name: 'Shadow Magic', desc: 'Draw power from the Shadowfell.' },
      { name: 'Storm Sorcery', desc: 'Harness the power of storms.' },
      { name: 'Aberrant Mind', desc: 'Psionic power from an alien influence.' },
      { name: 'Clockwork Soul', desc: 'Power from the plane of absolute order (Mechanus).' },
    ],
    features: [
      { level: 1, name: 'Spellcasting', desc: 'CHA-based known spellcasting from the Sorcerer spell list.' },
      { level: 1, name: 'Sorcerous Origin', desc: 'Choose your subclass origin.' },
      { level: 2, name: 'Font of Magic', desc: 'Sorcery points = sorcerer level. Convert between sorcery points and spell slots.' },
      { level: 3, name: 'Metamagic', desc: 'Choose 2 options (more at higher levels): Careful, Distant, Empowered, Extended, Heightened, Quickened, Subtle, Twinned Spell.' },
      { level: 20, name: 'Sorcerous Restoration', desc: 'Regain 4 sorcery points on a short rest.' },
    ],
  },
  {
    name: 'Warlock', desc: 'Seekers of forbidden knowledge through otherworldly pacts.', hitDie: 8,
    primaryAbility: 'Charisma', savingThrows: ['WIS', 'CHA'],
    armorProfs: ['Light'], weaponProfs: ['Simple'], toolProfs: [],
    skillChoice: { count: 2, from: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'] },
    startingHP: '8 + CON modifier',
    spellcasting: { ability: 'charisma', type: 'pact', cantripsKnown: [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4], spellsKnown: [2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15] },
    subclassLevel: 1, subclassName: 'Otherworldly Patron',
    subclasses: [
      { name: 'The Archfey', desc: 'Pact with a powerful fey being.' },
      { name: 'The Fiend', desc: 'Pact with a fiendish entity.' },
      { name: 'The Great Old One', desc: 'Pact with an alien, unknowable entity.' },
      { name: 'The Celestial', desc: 'Pact with a being of the Upper Planes.' },
      { name: 'The Hexblade', desc: 'Pact with a mysterious entity from the Shadowfell.' },
      { name: 'The Fathomless', desc: 'Pact with an entity from the ocean depths.' },
      { name: 'The Genie', desc: 'Pact with a noble genie.' },
      { name: 'The Undead', desc: 'Pact with a powerful undead entity.' },
    ],
    features: [
      { level: 1, name: 'Pact Magic', desc: 'CHA-based spellcasting. Slots recharge on short rest. All slots are same level (up to 5th).' },
      { level: 1, name: 'Otherworldly Patron', desc: 'Choose your subclass patron.' },
      { level: 2, name: 'Eldritch Invocations', desc: 'Choose 2 invocations (more at higher levels). Customize your warlock abilities.' },
      { level: 3, name: 'Pact Boon', desc: 'Choose: Pact of the Chain (familiar), Pact of the Blade (weapon), Pact of the Tome (cantrips), Pact of the Talisman.' },
      { level: 11, name: 'Mystic Arcanum (6th)', desc: 'Choose a 6th-level spell. Cast it 1/long rest without a spell slot. (7th at 13, 8th at 15, 9th at 17).' },
      { level: 20, name: 'Eldritch Master', desc: 'Spend 1 minute to regain all Pact Magic spell slots (1/long rest).', uses: 1, recharge: 'long' },
    ],
  },
  {
    name: 'Wizard', desc: 'Scholarly mages who bend reality through study.', hitDie: 6,
    primaryAbility: 'Intelligence', savingThrows: ['INT', 'WIS'],
    armorProfs: [], weaponProfs: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs', 'Light Crossbows'], toolProfs: [],
    skillChoice: { count: 2, from: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'] },
    startingHP: '6 + CON modifier',
    spellcasting: { ability: 'intelligence', type: 'prepared', cantripsKnown: [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5] },
    subclassLevel: 2, subclassName: 'Arcane Tradition',
    subclasses: [
      { name: 'School of Abjuration', desc: 'Specialize in protective magic.' },
      { name: 'School of Conjuration', desc: 'Summon creatures and create objects.' },
      { name: 'School of Divination', desc: 'Uncover secrets and foresee the future.' },
      { name: 'School of Enchantment', desc: 'Influence and control minds.' },
      { name: 'School of Evocation', desc: 'Harness raw elemental energy for destruction.' },
      { name: 'School of Illusion', desc: 'Create and manipulate illusions.' },
      { name: 'School of Necromancy', desc: 'Manipulate the forces of life and death.' },
      { name: 'School of Transmutation', desc: 'Alter the physical properties of matter.' },
      { name: 'Bladesinging', desc: 'Merge swordplay with arcane magic.' },
      { name: 'War Magic', desc: 'Blend arcane defense with combat tactics.' },
      { name: 'Chronurgy Magic', desc: 'Manipulate the flow of time.' },
      { name: 'Graviturgy Magic', desc: 'Control the forces of gravity.' },
      { name: 'Order of Scribes', desc: 'Master the art of the written spell.' },
    ],
    features: [
      { level: 1, name: 'Spellcasting', desc: 'INT-based prepared spellcasting. Prepare INT mod + wizard level spells from your spellbook.' },
      { level: 1, name: 'Arcane Recovery', desc: 'Once per day during short rest, recover spell slots (total levels = half wizard level, rounded up).', uses: 1, recharge: 'long' },
      { level: 2, name: 'Arcane Tradition', desc: 'Choose your subclass school.' },
      { level: 18, name: 'Spell Mastery', desc: 'Choose one 1st-level and one 2nd-level spell. Cast them at their lowest level without expending a slot.' },
      { level: 20, name: 'Signature Spells', desc: 'Choose two 3rd-level spells. Always prepared, cast each once at 3rd level without a slot (short rest recharge).' },
    ],
  },
  {
    name: 'Artificer', desc: 'Magical inventors who infuse objects with power.', hitDie: 8,
    primaryAbility: 'Intelligence', savingThrows: ['CON', 'INT'],
    armorProfs: ['Light', 'Medium', 'Shields'], weaponProfs: ['Simple'], toolProfs: ["Thieves' tools", 'Tinker\'s tools', 'One artisan tool'],
    skillChoice: { count: 2, from: ['Arcana', 'History', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Sleight of Hand'] },
    startingHP: '8 + CON modifier',
    spellcasting: { ability: 'intelligence', type: 'prepared', cantripsKnown: [2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3] },
    subclassLevel: 3, subclassName: 'Artificer Specialist',
    subclasses: [
      { name: 'Alchemist', desc: 'Brew magical elixirs and potions.' },
      { name: 'Armorer', desc: 'Modify armor into a powerful arcane suit.' },
      { name: 'Artillerist', desc: 'Create magical cannons and explosives.' },
      { name: 'Battle Smith', desc: 'Protect allies with a steel defender companion.' },
    ],
    features: [
      { level: 1, name: 'Magical Tinkering', desc: 'Imbue tiny nonmagical objects with minor magical properties.' },
      { level: 1, name: 'Spellcasting', desc: 'INT-based prepared spellcasting. Requires tools as a focus.' },
      { level: 2, name: 'Infuse Item', desc: 'Imbue mundane items with magical infusions. 2 infusions at 2nd level (scales).' },
      { level: 3, name: 'Artificer Specialist', desc: 'Choose your subclass.' },
      { level: 3, name: 'The Right Tool for the Job', desc: "Spend 1 hour to create one set of artisan's tools." },
      { level: 6, name: 'Tool Expertise', desc: 'Double proficiency bonus for all tool checks.' },
      { level: 7, name: 'Flash of Genius', desc: 'When you or an ally within 30ft makes a check or save, add your INT mod (INT mod/long rest).' },
      { level: 10, name: 'Magic Item Adept', desc: 'Attune to up to 4 magic items. Craft common/uncommon items faster and cheaper.' },
      { level: 11, name: 'Spell-Storing Item', desc: 'Store a 1st or 2nd level spell in an object. Anyone can cast it (2 × INT mod uses).' },
      { level: 14, name: 'Magic Item Savant', desc: 'Attune to up to 5 magic items. Ignore class/race/spell/level requirements for attuning.' },
      { level: 18, name: 'Magic Item Master', desc: 'Attune to up to 6 magic items.' },
      { level: 20, name: 'Soul of Artifice', desc: '+1 to all saving throws per magic item you\'re attuned to.' },
    ],
  },
]

/** Lookup a class by name */
export function getClass(name: string): ClassData | undefined {
  return CLASSES.find(c => c.name === name)
}

/** Get class names */
export function getClassNames(): string[] {
  return CLASSES.map(c => c.name)
}

/** Check if a class is a spellcaster */
export function isSpellcaster(className: string): boolean {
  const c = getClass(className)
  return !!c?.spellcasting
}

/** Get features available at a given level */
export function getClassFeaturesAtLevel(className: string, level: number): ClassFeature[] {
  const c = getClass(className)
  if (!c) return []
  return c.features.filter(f => f.level <= level)
}
