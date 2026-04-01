/**
 * D&D 5e Spell Details — SRD-compatible spell metadata
 * Used as fallback when character spell data has empty fields
 */

export interface SpellDetail {
  school: string
  casting_time: string
  range: string
  components: string
  duration: string
  description: string
  damage?: string
  concentration?: boolean
  ritual?: boolean
  level: number
}

/**
 * Lookup a spell's details by name (case-insensitive)
 */
export function getSpellDetail(name: string): SpellDetail | undefined {
  return SPELL_DETAILS[name] ?? Object.values(SPELL_DETAILS_CI).find(
    (_, i) => Object.keys(SPELL_DETAILS)[i]?.toLowerCase() === name.toLowerCase()
  )
}

// Internal case-insensitive index built lazily
let _ciIndex: Record<string, SpellDetail> | null = null
function get_ci(): Record<string, SpellDetail> {
  if (!_ciIndex) {
    _ciIndex = {}
    for (const [k, v] of Object.entries(SPELL_DETAILS)) {
      _ciIndex[k.toLowerCase()] = v
    }
  }
  return _ciIndex
}
const SPELL_DETAILS_CI = new Proxy({} as Record<string, SpellDetail>, {
  get(_, prop: string) { return get_ci()[prop.toLowerCase()] }
})

export function lookupSpellDetail(name: string): SpellDetail | undefined {
  return SPELL_DETAILS[name] ?? get_ci()[name.toLowerCase()]
}

export const SPELL_DETAILS: Record<string, SpellDetail> = {
  // ── CANTRIPS ──────────────────────────────────
  'Acid Splash': {
    level: 0, school: 'Conjuration', casting_time: '1 action', range: '60 feet',
    components: 'V, S', duration: 'Instantaneous', damage: '1d6 acid',
    description: 'You hurl a bubble of acid. Choose one or two creatures within range. If two, they must be within 5 feet of each other. A target must succeed on a DEX save or take 1d6 acid damage. Scales at 5th (2d6), 11th (3d6), 17th (4d6).',
  },
  'Blade Ward': {
    level: 0, school: 'Abjuration', casting_time: '1 action', range: 'Self',
    components: 'V, S', duration: '1 round',
    description: 'You gain resistance to bludgeoning, piercing, and slashing damage from weapon attacks until the end of your next turn.',
  },
  'Booming Blade': {
    level: 0, school: 'Evocation', casting_time: '1 action', range: 'Self (5-foot radius)',
    components: 'S, M (a melee weapon worth at least 1 sp)', duration: '1 round', damage: 'weapon + 1d8 thunder',
    description: 'You brandish the weapon and make a melee attack. On hit, the target suffers the weapon attack and becomes sheathed in booming energy. If it willingly moves before your next turn, it takes 1d8 thunder damage. Scales at 5th, 11th, 17th.',
  },
  'Chill Touch': {
    level: 0, school: 'Necromancy', casting_time: '1 action', range: '120 feet',
    components: 'V, S', duration: '1 round', damage: '1d8 necrotic',
    description: 'A ghostly skeletal hand strikes a creature. Make a ranged spell attack. On hit: 1d8 necrotic damage and the target can\'t regain HP until your next turn. Undead also have disadvantage on attacks against you. Scales at 5th (2d8), 11th (3d8), 17th (4d8).',
  },
  'Control Flames': {
    level: 0, school: 'Transmutation', casting_time: '1 action', range: '60 feet',
    components: 'S', duration: 'Instantaneous or 1 hour',
    description: 'You choose a nonmagical flame you can see within range that fits within a 5-foot cube. You can expand it 5 feet, extinguish it, double/halve its light, or cause simple shapes to appear in it for 1 hour.',
  },
  'Create Bonfire': {
    level: 0, school: 'Conjuration', casting_time: '1 action', range: '60 feet',
    components: 'V, S', duration: 'Concentration, up to 1 minute', damage: '1d8 fire',
    concentration: true,
    description: 'You create a bonfire on ground you can see within range. A creature in the space must succeed on a DEX save or take 1d8 fire damage. A creature entering or ending its turn there must also save. Scales at 5th (2d8), 11th (3d8), 17th (4d8).',
  },
  'Dancing Lights': {
    level: 0, school: 'Evocation', casting_time: '1 action', range: '120 feet',
    components: 'V, S, M (a bit of phosphorus or wychwood, or a glowworm)', duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'You create up to four torch-sized lights within range that appear as torches, lanterns, or glowing orbs that hover. Each sheds dim light in a 10-foot radius. You can move them up to 60 feet as a bonus action.',
  },
  'Druidcraft': {
    level: 0, school: 'Transmutation', casting_time: '1 action', range: '30 feet',
    components: 'V, S', duration: 'Instantaneous',
    description: 'You create a tiny, harmless sensory effect that predicts the weather, make a flower blossom or a seed sprout, create a harmless sensory effect (like leaves rustling), or instantly light or snuff out a candle, torch, or small campfire.',
  },
  'Eldritch Blast': {
    level: 0, school: 'Evocation', casting_time: '1 action', range: '120 feet',
    components: 'V, S', duration: 'Instantaneous', damage: '1d10 force',
    description: 'A beam of crackling energy streaks toward a creature. Make a ranged spell attack. On hit: 1d10 force damage. At 5th level (2 beams), 11th (3 beams), 17th (4 beams). Each beam can target the same or different creatures.',
  },
  'Fire Bolt': {
    level: 0, school: 'Evocation', casting_time: '1 action', range: '120 feet',
    components: 'V, S', duration: 'Instantaneous', damage: '1d10 fire',
    description: 'You hurl a mote of fire at a creature or object. Make a ranged spell attack. On hit: 1d10 fire damage. A flammable object hit ignites if it isn\'t being worn or carried. Scales at 5th (2d10), 11th (3d10), 17th (4d10).',
  },
  'Friends': {
    level: 0, school: 'Enchantment', casting_time: '1 action', range: 'Self',
    components: 'S, M (a small amount of makeup)', duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'You have advantage on all CHA checks directed at one creature that isn\'t hostile toward you. When the spell ends, the creature realizes you used magic on it and becomes hostile.',
  },
  'Frostbite': {
    level: 0, school: 'Evocation', casting_time: '1 action', range: '60 feet',
    components: 'V, S', duration: 'Instantaneous', damage: '1d6 cold',
    description: 'You cause numbing frost to form on one creature. It must make a CON save. On failure: 1d6 cold damage and disadvantage on its next weapon attack roll before the end of its next turn. Scales at 5th (2d6), 11th (3d6), 17th (4d6).',
  },
  'Green-Flame Blade': {
    level: 0, school: 'Evocation', casting_time: '1 action', range: 'Self (5-foot radius)',
    components: 'S, M (a melee weapon worth at least 1 sp)', duration: 'Instantaneous', damage: 'weapon + fire',
    description: 'You brandish the weapon and make a melee attack. On hit, green fire leaps to a different creature within 5 feet of the target, dealing fire damage equal to your spellcasting modifier. Damage scales at 5th, 11th, 17th levels.',
  },
  'Guidance': {
    level: 0, school: 'Divination', casting_time: '1 action', range: 'Touch',
    components: 'V, S', duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice. It can roll the die before or after making the check.',
  },
  'Gust': {
    level: 0, school: 'Transmutation', casting_time: '1 action', range: '30 feet',
    components: 'V, S', duration: 'Instantaneous',
    description: 'You seize the air and compel it to create one of these effects: push a Medium or smaller creature 5 feet (STR save to resist), push an unattended object 10 feet, or create a harmless sensory effect using air.',
  },
  'Infestation': {
    level: 0, school: 'Conjuration', casting_time: '1 action', range: '30 feet',
    components: 'V, S, M (a living flea)', duration: 'Instantaneous', damage: '1d6 poison',
    description: 'You cause a cloud of mites, fleas, and parasites to appear on a creature. Target must succeed on a CON save or take 1d6 poison damage and move 5 feet in a random direction. Scales at 5th (2d6), 11th (3d6), 17th (4d6).',
  },
  'Light': {
    level: 0, school: 'Evocation', casting_time: '1 action', range: 'Touch',
    components: 'V, M (a firefly or phosphorescent moss)', duration: '1 hour',
    description: 'You touch one object no larger than 10 feet in any dimension. It sheds bright light in a 20-foot radius and dim light for an additional 20 feet. The light can be colored. Covering it with something opaque blocks the light.',
  },
  'Lightning Lure': {
    level: 0, school: 'Evocation', casting_time: '1 action', range: 'Self (15-foot radius)',
    components: 'V', duration: 'Instantaneous', damage: '1d8 lightning',
    description: 'You create a lash of lightning that strikes a creature within 15 feet. It must succeed on a STR save or be pulled up to 10 feet toward you and take 1d8 lightning damage if within 5 feet of you. Scales at 5th, 11th, 17th.',
  },
  'Mage Hand': {
    level: 0, school: 'Conjuration', casting_time: '1 action', range: '30 feet',
    components: 'V, S', duration: '1 minute',
    description: 'A spectral, floating hand appears at a point you choose within range. It can manipulate objects, open unlocked doors/containers, stow/retrieve items, or pour out a vial. It can\'t attack, activate magic items, or carry more than 10 pounds.',
  },
  'Magic Stone': {
    level: 0, school: 'Transmutation', casting_time: '1 bonus action', range: 'Touch',
    components: 'V, S', duration: '1 minute', damage: '1d6 + mod bludgeoning',
    description: 'You touch 1-3 pebbles and imbue them with magic. You or someone else can make a ranged spell attack (60 ft) with one, using your spellcasting ability. On hit: 1d6 + your spellcasting modifier bludgeoning damage.',
  },
  'Mending': {
    level: 0, school: 'Transmutation', casting_time: '1 minute', range: 'Touch',
    components: 'V, S, M (two lodestones)', duration: 'Instantaneous',
    description: 'This spell repairs a single break or tear in an object you touch, such as a broken chain link, two halves of a broken key, a torn cloak, or a leaking wineskin. The break can be no larger than 1 foot in any dimension.',
  },
  'Message': {
    level: 0, school: 'Transmutation', casting_time: '1 action', range: '120 feet',
    components: 'V, S, M (a short piece of copper wire)', duration: '1 round',
    description: 'You point your finger toward a creature within range and whisper a message. The target (and only the target) hears the message and can reply in a whisper that only you can hear. You can cast through solid objects if you\'re familiar with the target.',
  },
  'Mind Sliver': {
    level: 0, school: 'Enchantment', casting_time: '1 action', range: '60 feet',
    components: 'V', duration: '1 round', damage: '1d6 psychic',
    description: 'You drive a disorienting spike of psychic energy into the mind of a creature. Target must succeed on an INT save or take 1d6 psychic damage and subtract 1d4 from the next saving throw it makes before the end of your next turn. Scales at 5th, 11th, 17th.',
  },
  'Minor Illusion': {
    level: 0, school: 'Illusion', casting_time: '1 action', range: '30 feet',
    components: 'S, M (a bit of fleece)', duration: '1 minute',
    description: 'You create a sound or an image of an object within range that lasts for the duration. The illusion also ends if you dismiss it or cast this spell again. A creature can use its action to make an Investigation check to determine it\'s an illusion.',
  },
  'Mold Earth': {
    level: 0, school: 'Transmutation', casting_time: '1 action', range: '30 feet',
    components: 'S', duration: 'Instantaneous or 1 hour',
    description: 'You choose a portion of dirt or stone no larger than 5 feet on a side. You can excavate it and move it 5 feet, cause shapes/colors/words to appear, or change its terrain difficulty for 1 hour. Max two non-instantaneous effects at once.',
  },
  'Poison Spray': {
    level: 0, school: 'Conjuration', casting_time: '1 action', range: '10 feet',
    components: 'V, S', duration: 'Instantaneous', damage: '1d12 poison',
    description: 'You project a puff of noxious gas from your palm. Target must succeed on a CON save or take 1d12 poison damage. Scales at 5th (2d12), 11th (3d12), 17th (4d12).',
  },
  'Prestidigitation': {
    level: 0, school: 'Transmutation', casting_time: '1 action', range: '10 feet',
    components: 'V, S', duration: 'Up to 1 hour',
    description: 'A minor magical trick. You can create a harmless sensory effect, light/snuff a small flame, clean/soil a small object, chill/warm/flavor material, make a color/mark/symbol appear for 1 hour, or create a trinket that fits in your hand (lasts until end of your next turn).',
  },
  'Produce Flame': {
    level: 0, school: 'Conjuration', casting_time: '1 action', range: 'Self',
    components: 'V, S', duration: '10 minutes', damage: '1d8 fire',
    description: 'A flickering flame appears in your hand, shedding bright light in a 10-foot radius and dim light for 10 more feet. You can hurl the flame as a ranged spell attack (30 ft). On hit: 1d8 fire damage. Scales at 5th, 11th, 17th.',
  },
  'Ray of Frost': {
    level: 0, school: 'Evocation', casting_time: '1 action', range: '60 feet',
    components: 'V, S', duration: 'Instantaneous', damage: '1d8 cold',
    description: 'A frigid beam of blue-white light streaks toward a creature. Make a ranged spell attack. On hit: 1d8 cold damage and its speed is reduced by 10 feet until your next turn. Scales at 5th (2d8), 11th (3d8), 17th (4d8).',
  },
  'Resistance': {
    level: 0, school: 'Abjuration', casting_time: '1 action', range: 'Touch',
    components: 'V, S, M (a miniature cloak)', duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one saving throw of its choice. It can roll the die before or after making the save.',
  },
  'Sacred Flame': {
    level: 0, school: 'Evocation', casting_time: '1 action', range: '60 feet',
    components: 'V, S', duration: 'Instantaneous', damage: '1d8 radiant',
    description: 'Flame-like radiance descends on a creature you can see. Target must succeed on a DEX save or take 1d8 radiant damage. The target gains no benefit from cover for this save. Scales at 5th (2d8), 11th (3d8), 17th (4d8).',
  },
  'Shape Water': {
    level: 0, school: 'Transmutation', casting_time: '1 action', range: '30 feet',
    components: 'S', duration: 'Instantaneous or 1 hour',
    description: 'You choose an area of water within range that fits in a 5-foot cube. You can move/flow it 5 feet, form it into simple shapes/animate for 1 hour, change its color/opacity for 1 hour, or freeze it (no creatures inside). Max two effects active.',
  },
  'Shillelagh': {
    level: 0, school: 'Transmutation', casting_time: '1 bonus action', range: 'Touch',
    components: 'V, S, M (mistletoe, a shamrock leaf, and a club or quarterstaff)', duration: '1 minute', damage: '1d8 bludgeoning',
    description: 'The wood of a club or quarterstaff you hold is imbued with nature\'s power. For the duration, you use your spellcasting ability instead of STR for attack/damage rolls, the weapon\'s damage die becomes 1d8, and it counts as magical.',
  },
  'Shocking Grasp': {
    level: 0, school: 'Evocation', casting_time: '1 action', range: 'Touch',
    components: 'V, S', duration: 'Instantaneous', damage: '1d8 lightning',
    description: 'Lightning springs from your hand. Make a melee spell attack (advantage if target wears metal armor). On hit: 1d8 lightning damage and the target can\'t take reactions until the start of its next turn. Scales at 5th, 11th, 17th.',
  },
  'Spare the Dying': {
    level: 0, school: 'Necromancy', casting_time: '1 action', range: 'Touch',
    components: 'V, S', duration: 'Instantaneous',
    description: 'You touch a living creature that has 0 hit points. The creature becomes stable. This spell has no effect on undead or constructs.',
  },
  'Sword Burst': {
    level: 0, school: 'Conjuration', casting_time: '1 action', range: 'Self (5-foot radius)',
    components: 'V', duration: 'Instantaneous', damage: '1d6 force',
    description: 'You create a momentary circle of spectral blades that sweep around you. Each creature within 5 feet must succeed on a DEX save or take 1d6 force damage. Scales at 5th (2d6), 11th (3d6), 17th (4d6).',
  },
  'Thaumaturgy': {
    level: 0, school: 'Transmutation', casting_time: '1 action', range: '30 feet',
    components: 'V', duration: 'Up to 1 minute',
    description: 'You manifest a minor wonder, a sign of supernatural power. You can boom your voice, cause flames to flicker/change color, cause tremors, create an instant sound, make a door/window fly open or slam shut, or alter your eye appearance.',
  },
  'Thorn Whip': {
    level: 0, school: 'Transmutation', casting_time: '1 action', range: '30 feet',
    components: 'V, S, M (the stem of a plant with thorns)', duration: 'Instantaneous', damage: '1d6 piercing',
    description: 'You create a long, vine-like whip covered in thorns. Make a melee spell attack. On hit: 1d6 piercing damage and if the creature is Large or smaller, you pull it up to 10 feet closer. Scales at 5th, 11th, 17th.',
  },
  'Thunderclap': {
    level: 0, school: 'Evocation', casting_time: '1 action', range: 'Self (5-foot radius)',
    components: 'S', duration: 'Instantaneous', damage: '1d6 thunder',
    description: 'You create a burst of thunderous sound. Each creature within range (other than you) must succeed on a CON save or take 1d6 thunder damage. The sound can be heard 100 feet away. Scales at 5th, 11th, 17th.',
  },
  'Toll the Dead': {
    level: 0, school: 'Necromancy', casting_time: '1 action', range: '60 feet',
    components: 'V, S', duration: 'Instantaneous', damage: '1d8/1d12 necrotic',
    description: 'You point at a creature and a dolorous bell sound fills the air. Target makes a WIS save. On failure: 1d8 necrotic damage, or 1d12 if it\'s already missing HP. Scales at 5th, 11th, 17th.',
  },
  'True Strike': {
    level: 0, school: 'Divination', casting_time: '1 action', range: '30 feet',
    components: 'S', duration: 'Concentration, up to 1 round',
    concentration: true,
    description: 'You extend your hand and point a finger at a target in range. You gain advantage on your first attack roll against the target on your next turn, provided this spell hasn\'t ended.',
  },
  'Vicious Mockery': {
    level: 0, school: 'Enchantment', casting_time: '1 action', range: '60 feet',
    components: 'V', duration: 'Instantaneous', damage: '1d4 psychic',
    description: 'You unleash a string of insults laced with subtle enchantments. Target must succeed on a WIS save or take 1d4 psychic damage and have disadvantage on the next attack roll it makes before the end of its next turn. Scales at 5th, 11th, 17th.',
  },
  'Word of Radiance': {
    level: 0, school: 'Evocation', casting_time: '1 action', range: '5 feet',
    components: 'V, M (a holy symbol)', duration: 'Instantaneous', damage: '1d6 radiant',
    description: 'You utter a divine word and burning radiance erupts from you. Each creature of your choice within 5 feet must succeed on a CON save or take 1d6 radiant damage. Scales at 5th, 11th, 17th.',
  },

  // ── LEVEL 1 SPELLS ────────────────────────────
  'Absorb Elements': {
    level: 1, school: 'Abjuration', casting_time: '1 reaction', range: 'Self',
    components: 'S', duration: '1 round',
    description: 'When you take acid, cold, fire, lightning, or thunder damage, you gain resistance to that damage type until the start of your next turn. The first melee attack you make on your next turn deals an extra 1d6 of that element.',
  },
  'Alarm': {
    level: 1, school: 'Abjuration', casting_time: '1 minute', range: '30 feet',
    components: 'V, S, M (a tiny bell and silver wire)', duration: '8 hours',
    ritual: true,
    description: 'You set an alarm against unwanted intrusion. Choose a door, window, or area within range no larger than a 20-foot cube. Until the spell ends, an alarm alerts you whenever a creature touches or enters the warded area.',
  },
  'Animal Friendship': {
    level: 1, school: 'Enchantment', casting_time: '1 action', range: '30 feet',
    components: 'V, S, M (a morsel of food)', duration: '24 hours',
    description: 'You convince a beast that you mean it no harm. Choose a beast you can see within range. It must succeed on a WIS save or be charmed by you for the duration. If you or your companions harm the target, the spell ends.',
  },
  'Armor of Agathys': {
    level: 1, school: 'Abjuration', casting_time: '1 action', range: 'Self',
    components: 'V, S, M (a cup of water)', duration: '1 hour',
    description: 'A protective magical force surrounds you. You gain 5 temporary HP for the duration. If a creature hits you with a melee attack while you have these temp HP, it takes 5 cold damage. At higher levels: +5 temp HP and +5 cold damage per slot level above 1st.',
  },
  'Arms of Hadar': {
    level: 1, school: 'Conjuration', casting_time: '1 action', range: 'Self (10-foot radius)',
    components: 'V, S', duration: 'Instantaneous', damage: '2d6 necrotic',
    description: 'You invoke the power of Hadar. Tendrils of dark energy erupt from you. Each creature within 10 feet must make a STR save. On failure: 2d6 necrotic damage and it can\'t take reactions until its next turn. Half damage on success.',
  },
  'Bane': {
    level: 1, school: 'Enchantment', casting_time: '1 action', range: '30 feet',
    components: 'V, S, M (a drop of blood)', duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'Up to three creatures must make CHA saves. On failure, whenever a target makes an attack roll or saving throw, it must roll a d4 and subtract the number from the roll. At higher levels: one additional creature per slot above 1st.',
  },
  'Bless': {
    level: 1, school: 'Enchantment', casting_time: '1 action', range: '30 feet',
    components: 'V, S, M (a sprinkling of holy water)', duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'You bless up to three creatures. Whenever a target makes an attack roll or saving throw, it can roll a d4 and add the number to the roll. At higher levels: one additional creature per slot above 1st.',
  },
  'Burning Hands': {
    level: 1, school: 'Evocation', casting_time: '1 action', range: 'Self (15-foot cone)',
    components: 'V, S', duration: 'Instantaneous', damage: '3d6 fire',
    description: 'A thin sheet of flames shoots from your fingertips. Each creature in a 15-foot cone must make a DEX save. On failure: 3d6 fire damage. Half on success. Ignites flammable objects. +1d6 per slot above 1st.',
  },
  'Cause Fear': {
    level: 1, school: 'Necromancy', casting_time: '1 action', range: '60 feet',
    components: 'V', duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'You awaken the sense of mortality in a creature. Target must succeed on a WIS save or become frightened of you until the spell ends. The frightened target can repeat the save at the end of each of its turns.',
  },
  'Charm Person': {
    level: 1, school: 'Enchantment', casting_time: '1 action', range: '30 feet',
    components: 'V, S', duration: '1 hour',
    description: 'You attempt to charm a humanoid. It must make a WIS save (advantage if you\'re fighting it). If it fails, it is charmed by you and regards you as a friendly acquaintance. The charmed creature knows it was charmed when the spell ends.',
  },
  'Chromatic Orb': {
    level: 1, school: 'Evocation', casting_time: '1 action', range: '90 feet',
    components: 'V, S, M (a diamond worth at least 50 gp)', duration: 'Instantaneous', damage: '3d8',
    description: 'You hurl a 4-inch-diameter sphere of energy. Choose acid, cold, fire, lightning, poison, or thunder. Make a ranged spell attack. On hit: 3d8 damage of the chosen type. +1d8 per slot above 1st.',
  },
  'Command': {
    level: 1, school: 'Enchantment', casting_time: '1 action', range: '60 feet',
    components: 'V', duration: '1 round',
    description: 'You speak a one-word command to a creature. It must succeed on a WIS save or follow the command on its next turn. Common commands: Approach, Drop, Flee, Grovel, Halt. No effect on undead or if the command is directly harmful.',
  },
  'Comprehend Languages': {
    level: 1, school: 'Divination', casting_time: '1 action', range: 'Self',
    components: 'V, S, M (a pinch of soot and salt)', duration: '1 hour',
    ritual: true,
    description: 'For the duration, you understand the literal meaning of any spoken language that you hear. You also understand any written language that you see, but you must be touching the surface on which the words are written.',
  },
  'Cure Wounds': {
    level: 1, school: 'Evocation', casting_time: '1 action', range: 'Touch',
    components: 'V, S', duration: 'Instantaneous',
    description: 'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. No effect on undead or constructs. +1d8 per slot above 1st.',
  },
  'Detect Magic': {
    level: 1, school: 'Divination', casting_time: '1 action', range: 'Self',
    components: 'V, S', duration: 'Concentration, up to 10 minutes',
    concentration: true, ritual: true,
    description: 'For the duration, you sense the presence of magic within 30 feet of you. If you sense magic, you can use your action to see a faint aura around any visible creature or object that bears magic and learn its school of magic.',
  },
  'Disguise Self': {
    level: 1, school: 'Illusion', casting_time: '1 action', range: 'Self',
    components: 'V, S', duration: '1 hour',
    description: 'You make yourself — including clothing, armor, weapons, and belongings — look different until the spell ends. You can seem 1 foot shorter/taller and appear thin, fat, or in between. You can\'t change your body type. A creature can discern the illusion with an Investigation check.',
  },
  'Divine Favor': {
    level: 1, school: 'Evocation', casting_time: '1 bonus action', range: 'Self',
    components: 'V, S', duration: 'Concentration, up to 1 minute', damage: '+1d4 radiant',
    concentration: true,
    description: 'Your prayer empowers you with divine radiance. Until the spell ends, your weapon attacks deal an extra 1d4 radiant damage on a hit.',
  },
  'Expeditious Retreat': {
    level: 1, school: 'Transmutation', casting_time: '1 bonus action', range: 'Self',
    components: 'V, S', duration: 'Concentration, up to 10 minutes',
    concentration: true,
    description: 'This spell allows you to move at an incredible pace. When you cast this spell, and then as a bonus action on each of your turns until the spell ends, you can take the Dash action.',
  },
  'Faerie Fire': {
    level: 1, school: 'Evocation', casting_time: '1 action', range: '60 feet',
    components: 'V', duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'Each object in a 20-foot cube glows blue, green, or violet (your choice). Each creature in the area must succeed on a DEX save or be outlined in light. An affected creature/object sheds dim light in a 10-foot radius, and attack rolls against it have advantage.',
  },
  'False Life': {
    level: 1, school: 'Necromancy', casting_time: '1 action', range: 'Self',
    components: 'V, S, M (a small amount of alcohol or distilled spirits)', duration: '1 hour',
    description: 'Bolstering yourself with a necromantic facsimile of life, you gain 1d4 + 4 temporary hit points for the duration. +5 temp HP per slot above 1st.',
  },
  'Feather Fall': {
    level: 1, school: 'Transmutation', casting_time: '1 reaction', range: '60 feet',
    components: 'V, M (a small feather or piece of down)', duration: '1 minute',
    description: 'Choose up to five falling creatures within range. A falling creature\'s rate of descent slows to 60 feet per round. If the creature lands before the spell ends, it takes no falling damage and can land on its feet.',
  },
  'Find Familiar': {
    level: 1, school: 'Conjuration', casting_time: '1 hour', range: '10 feet',
    components: 'V, S, M (10 gp worth of charcoal, incense, and herbs consumed)', duration: 'Instantaneous',
    ritual: true,
    description: 'You gain the service of a familiar, a spirit that takes an animal form you choose (bat, cat, hawk, frog, owl, etc.). It acts independently but obeys your commands. You can communicate telepathically and see through its eyes.',
  },
  'Fog Cloud': {
    level: 1, school: 'Conjuration', casting_time: '1 action', range: '120 feet',
    components: 'V, S', duration: 'Concentration, up to 1 hour',
    concentration: true,
    description: 'You create a 20-foot-radius sphere of fog centered on a point within range. The sphere spreads around corners, and its area is heavily obscured. +20 feet radius per slot above 1st.',
  },
  'Goodberry': {
    level: 1, school: 'Transmutation', casting_time: '1 action', range: 'Touch',
    components: 'V, S, M (a sprig of mistletoe)', duration: 'Instantaneous',
    description: 'Up to ten berries appear in your hand, infused with magic for the duration. A creature can use its action to eat one berry. Eating a berry restores 1 hit point and provides enough nourishment for one day. Berries lose potency after 24 hours.',
  },
  'Grease': {
    level: 1, school: 'Conjuration', casting_time: '1 action', range: '60 feet',
    components: 'V, S, M (a bit of pork rind or butter)', duration: '1 minute',
    description: 'Slick grease covers the ground in a 10-foot square centered on a point within range. The area becomes difficult terrain. When a creature enters or starts its turn there, it must succeed on a DEX save or fall prone.',
  },
  'Guiding Bolt': {
    level: 1, school: 'Evocation', casting_time: '1 action', range: '120 feet',
    components: 'V, S', duration: '1 round', damage: '4d6 radiant',
    description: 'A flash of light streaks toward a creature. Make a ranged spell attack. On hit: 4d6 radiant damage and the next attack roll against the target before the end of your next turn has advantage. +1d6 per slot above 1st.',
  },
  'Healing Word': {
    level: 1, school: 'Evocation', casting_time: '1 bonus action', range: '60 feet',
    components: 'V', duration: 'Instantaneous',
    description: 'A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier. No effect on undead or constructs. +1d4 per slot above 1st.',
  },
  'Hellish Rebuke': {
    level: 1, school: 'Evocation', casting_time: '1 reaction', range: '60 feet',
    components: 'V, S', duration: 'Instantaneous', damage: '2d10 fire',
    description: 'You point your finger at the creature that damaged you, and it is momentarily surrounded by hellish flames. It must make a DEX save, taking 2d10 fire damage on a failure or half on a success. +1d10 per slot above 1st.',
  },
  'Heroism': {
    level: 1, school: 'Enchantment', casting_time: '1 action', range: 'Touch',
    components: 'V, S', duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'A willing creature you touch is imbued with bravery. Until the spell ends, the creature is immune to being frightened and gains temporary hit points equal to your spellcasting modifier at the start of each of its turns.',
  },
  'Hex': {
    level: 1, school: 'Enchantment', casting_time: '1 bonus action', range: '90 feet',
    components: 'V, S, M (the petrified eye of a newt)', duration: 'Concentration, up to 1 hour', damage: '+1d6 necrotic',
    concentration: true,
    description: 'You place a curse on a creature. Until the spell ends, you deal an extra 1d6 necrotic damage whenever you hit the target with an attack. Also, choose one ability — the target has disadvantage on checks with that ability.',
  },
  'Hunter\'s Mark': {
    level: 1, school: 'Divination', casting_time: '1 bonus action', range: '90 feet',
    components: 'V', duration: 'Concentration, up to 1 hour', damage: '+1d6',
    concentration: true,
    description: 'You choose a creature you can see within range and mystically mark it as your quarry. Until the spell ends, you deal an extra 1d6 damage whenever you hit the target with a weapon attack, and you have advantage on any Perception or Survival check to find it.',
  },
  'Identify': {
    level: 1, school: 'Divination', casting_time: '1 minute', range: 'Touch',
    components: 'V, S, M (a pearl worth at least 100 gp and an owl feather)', duration: 'Instantaneous',
    ritual: true,
    description: 'You choose one object that you must touch throughout the casting. If it is a magic item, you learn its properties and how to use them, whether it requires attunement, and how many charges it has, if any.',
  },
  'Inflict Wounds': {
    level: 1, school: 'Necromancy', casting_time: '1 action', range: 'Touch',
    components: 'V, S', duration: 'Instantaneous', damage: '3d10 necrotic',
    description: 'Make a melee spell attack against a creature you can reach. On hit, the target takes 3d10 necrotic damage. +1d10 per slot above 1st.',
  },
  'Jump': {
    level: 1, school: 'Transmutation', casting_time: '1 action', range: 'Touch',
    components: 'V, S, M (a grasshopper\'s hind leg)', duration: '1 minute',
    description: 'You touch a creature. The creature\'s jump distance is tripled until the spell ends.',
  },
  'Longstrider': {
    level: 1, school: 'Transmutation', casting_time: '1 action', range: 'Touch',
    components: 'V, S, M (a pinch of dirt)', duration: '1 hour',
    description: 'You touch a creature. The target\'s speed increases by 10 feet until the spell ends. At higher levels: one additional creature per slot above 1st.',
  },
  'Mage Armor': {
    level: 1, school: 'Abjuration', casting_time: '1 action', range: 'Touch',
    components: 'V, S, M (a piece of cured leather)', duration: '8 hours',
    description: 'You touch a willing creature who isn\'t wearing armor, and a protective magical force surrounds it. The target\'s base AC becomes 13 + its DEX modifier. The spell ends if the target dons armor or you dismiss it.',
  },
  'Magic Missile': {
    level: 1, school: 'Evocation', casting_time: '1 action', range: '120 feet',
    components: 'V, S', duration: 'Instantaneous', damage: '3×1d4+1 force',
    description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range, dealing 1d4 + 1 force damage. You can direct them at one creature or several. +1 dart per slot above 1st.',
  },
  'Protection from Evil and Good': {
    level: 1, school: 'Abjuration', casting_time: '1 action', range: 'Touch',
    components: 'V, S, M (holy water or powdered silver and iron)', duration: 'Concentration, up to 10 minutes',
    concentration: true,
    description: 'Until the spell ends, one willing creature you touch is protected against aberrations, celestials, elementals, fey, fiends, and undead. Those types have disadvantage on attack rolls against the target and can\'t charm, frighten, or possess it.',
  },
  'Ray of Sickness': {
    level: 1, school: 'Necromancy', casting_time: '1 action', range: '60 feet',
    components: 'V, S', duration: 'Instantaneous', damage: '2d8 poison',
    description: 'A ray of sickening greenish energy lashes out. Make a ranged spell attack. On hit: 2d8 poison damage and the target must make a CON save or also be poisoned until the end of your next turn. +1d8 per slot above 1st.',
  },
  'Shield': {
    level: 1, school: 'Abjuration', casting_time: '1 reaction', range: 'Self',
    components: 'V, S', duration: '1 round',
    description: 'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.',
  },
  'Shield of Faith': {
    level: 1, school: 'Abjuration', casting_time: '1 bonus action', range: '60 feet',
    components: 'V, S, M (a small parchment with a bit of holy text)', duration: 'Concentration, up to 10 minutes',
    concentration: true,
    description: 'A shimmering field appears and surrounds a creature of your choice within range, granting it a +2 bonus to AC for the duration.',
  },
  'Silent Image': {
    level: 1, school: 'Illusion', casting_time: '1 action', range: '60 feet',
    components: 'V, S, M (a bit of fleece)', duration: 'Concentration, up to 10 minutes',
    concentration: true,
    description: 'You create the image of an object, creature, or other visible phenomenon that is no larger than a 15-foot cube. The image appears at a spot within range. It seems real but is merely visual — no sound, smell, or other sensory effects.',
  },
  'Sleep': {
    level: 1, school: 'Enchantment', casting_time: '1 action', range: '90 feet',
    components: 'V, S, M (a pinch of fine sand, rose petals, or a cricket)', duration: '1 minute',
    description: 'You send creatures into a magical slumber. Roll 5d8; the total is the pool of hit points of creatures this spell can affect. Creatures within 20 feet of a point are affected in ascending order of HP. +2d8 per slot above 1st.',
  },
  'Speak with Animals': {
    level: 1, school: 'Divination', casting_time: '1 action', range: 'Self',
    components: 'V, S', duration: '10 minutes',
    ritual: true,
    description: 'You gain the ability to comprehend and verbally communicate with beasts for the duration. The knowledge and awareness of many beasts is limited by their intelligence, but they can at minimum give you information about nearby locations and monsters.',
  },
  'Thunderwave': {
    level: 1, school: 'Evocation', casting_time: '1 action', range: 'Self (15-foot cube)',
    components: 'V, S', duration: 'Instantaneous', damage: '2d8 thunder',
    description: 'A wave of thunderous force sweeps out from you. Each creature in a 15-foot cube originating from you must make a CON save. On failure: 2d8 thunder damage and pushed 10 feet away. Half damage and no push on success. +1d8 per slot above 1st.',
  },
  'Witch Bolt': {
    level: 1, school: 'Evocation', casting_time: '1 action', range: '30 feet',
    components: 'V, S, M (a twig from a tree struck by lightning)', duration: 'Concentration, up to 1 minute', damage: '1d12 lightning',
    concentration: true,
    description: 'A beam of crackling blue energy lances toward a creature. Make a ranged spell attack. On hit: 1d12 lightning damage. On each of your turns, you can use your action to deal 1d12 lightning damage automatically. +1d12 initial per slot above 1st.',
  },

  // ── LEVEL 2 SPELLS ────────────────────────────
  'Aid': {
    level: 2, school: 'Abjuration', casting_time: '1 action', range: '30 feet',
    components: 'V, S, M (a tiny strip of white cloth)', duration: '8 hours',
    description: 'Your spell bolsters your allies with toughness and resolve. Choose up to three creatures within range. Each target\'s hit point maximum and current hit points increase by 5 for the duration. +5 HP per slot above 2nd.',
  },
  'Darkness': {
    level: 2, school: 'Evocation', casting_time: '1 action', range: '60 feet',
    components: 'V, M (bat fur and a drop of pitch or piece of coal)', duration: 'Concentration, up to 10 minutes',
    concentration: true,
    description: 'Magical darkness spreads from a point you choose in a 15-foot-radius sphere. Darkvision can\'t see through it, and nonmagical light can\'t illuminate it. If cast on an object, covering the object blocks the darkness.',
  },
  'Hold Person': {
    level: 2, school: 'Enchantment', casting_time: '1 action', range: '60 feet',
    components: 'V, S, M (a small, straight piece of iron)', duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'Choose a humanoid within range. It must succeed on a WIS save or be paralyzed. At the end of each turn, the target can make another save. +1 target per slot above 2nd.',
  },
  'Invisibility': {
    level: 2, school: 'Illusion', casting_time: '1 action', range: 'Touch',
    components: 'V, S, M (an eyelash encased in gum arabic)', duration: 'Concentration, up to 1 hour',
    concentration: true,
    description: 'A creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target\'s person. The spell ends if the target attacks or casts a spell. +1 target per slot above 2nd.',
  },
  'Lesser Restoration': {
    level: 2, school: 'Abjuration', casting_time: '1 action', range: 'Touch',
    components: 'V, S', duration: 'Instantaneous',
    description: 'You touch a creature and can end either one disease or one condition afflicting it. The condition can be blinded, deafened, paralyzed, or poisoned.',
  },
  'Misty Step': {
    level: 2, school: 'Conjuration', casting_time: '1 bonus action', range: 'Self',
    components: 'V', duration: 'Instantaneous',
    description: 'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.',
  },
  'Mirror Image': {
    level: 2, school: 'Illusion', casting_time: '1 action', range: 'Self',
    components: 'V, S', duration: '1 minute',
    description: 'Three illusory duplicates of yourself appear. Each time a creature targets you with an attack, roll a d20 to see whether the attack targets a duplicate instead. A duplicate\'s AC is 10 + your DEX modifier. A duplicate is destroyed if hit.',
  },
  'Scorching Ray': {
    level: 2, school: 'Evocation', casting_time: '1 action', range: '120 feet',
    components: 'V, S', duration: 'Instantaneous', damage: '3×2d6 fire',
    description: 'You create three rays of fire and hurl them at targets within range. You can hurl them at one target or several. Make a ranged spell attack for each ray. On hit: 2d6 fire damage. +1 ray per slot above 2nd.',
  },
  'Shatter': {
    level: 2, school: 'Evocation', casting_time: '1 action', range: '60 feet',
    components: 'V, S, M (a chip of mica)', duration: 'Instantaneous', damage: '3d8 thunder',
    description: 'A sudden loud ringing noise erupts from a point of your choice within range. Each creature in a 10-foot-radius sphere must make a CON save. On failure: 3d8 thunder damage. Half on success. A creature made of inorganic material has disadvantage. +1d8 per slot above 2nd.',
  },
  'Spiritual Weapon': {
    level: 2, school: 'Evocation', casting_time: '1 bonus action', range: '60 feet',
    components: 'V, S', duration: '1 minute', damage: '1d8 + mod force',
    description: 'You create a floating, spectral weapon within range. You can make a melee spell attack against a creature within 5 feet of the weapon. On hit: force damage equals 1d8 + your spellcasting modifier. As a bonus action, you can move the weapon up to 20 feet and attack again.',
  },
  'Suggestion': {
    level: 2, school: 'Enchantment', casting_time: '1 action', range: '30 feet',
    components: 'V, M (a snake\'s tongue and a honeycomb)', duration: 'Concentration, up to 8 hours',
    concentration: true,
    description: 'You suggest a course of activity (limited to a sentence or two) and magically influence a creature you can see. The creature must make a WIS save. On failure, it pursues the suggested course of action. The suggestion must sound reasonable.',
  },
  'Web': {
    level: 2, school: 'Conjuration', casting_time: '1 action', range: '60 feet',
    components: 'V, S, M (a bit of spiderweb)', duration: 'Concentration, up to 1 hour',
    concentration: true,
    description: 'You conjure a mass of thick, sticky webbing in a 20-foot cube. The webs are difficult terrain and lightly obscure the area. A creature that starts its turn in the webs or enters them must make a DEX save or be restrained.',
  },

  // ── LEVEL 3 SPELLS ────────────────────────────
  'Counterspell': {
    level: 3, school: 'Abjuration', casting_time: '1 reaction', range: '60 feet',
    components: 'S', duration: 'Instantaneous',
    description: 'You attempt to interrupt a creature in the process of casting a spell. If the creature is casting a spell of 3rd level or lower, the spell fails. If it is casting a spell of 4th level or higher, make an ability check (DC 10 + spell level) to counter it.',
  },
  'Dispel Magic': {
    level: 3, school: 'Abjuration', casting_time: '1 action', range: '120 feet',
    components: 'V, S', duration: 'Instantaneous',
    description: 'Choose one creature, object, or magical effect within range. Any spell of 3rd level or lower on the target ends. For each spell of 4th level or higher, make an ability check (DC 10 + spell level) to end it.',
  },
  'Fireball': {
    level: 3, school: 'Evocation', casting_time: '1 action', range: '150 feet',
    components: 'V, S, M (a tiny ball of bat guano and sulfur)', duration: 'Instantaneous', damage: '8d6 fire',
    description: 'A bright streak flashes from your pointing finger to a point you choose and blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere must make a DEX save. On failure: 8d6 fire damage. Half on success. +1d6 per slot above 3rd.',
  },
  'Fly': {
    level: 3, school: 'Transmutation', casting_time: '1 action', range: 'Touch',
    components: 'V, S, M (a wing feather from any bird)', duration: 'Concentration, up to 10 minutes',
    concentration: true,
    description: 'You touch a willing creature. The target gains a flying speed of 60 feet for the duration. When the spell ends, the target falls if still aloft. +1 target per slot above 3rd.',
  },
  'Haste': {
    level: 3, school: 'Transmutation', casting_time: '1 action', range: '30 feet',
    components: 'V, S, M (a shaving of licorice root)', duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'Choose a willing creature. Its speed is doubled, it gains +2 to AC, advantage on DEX saves, and an additional action each turn (Attack (one weapon only), Dash, Disengage, Hide, or Use an Object). When the spell ends, the target can\'t move or take actions until after its next turn.',
  },
  'Hunger of Hadar': {
    level: 3, school: 'Conjuration', casting_time: '1 action', range: '150 feet',
    components: 'V, S, M (a pickled octopus tentacle)', duration: 'Concentration, up to 1 minute', damage: '2d6 cold + 2d6 acid',
    concentration: true,
    description: 'You open a gateway to a dark between-stars void in a 20-foot-radius sphere. The area is difficult terrain, pitch black, and creatures starting their turn there take 2d6 cold damage. Creatures ending their turn must make a DEX save or take 2d6 acid damage.',
  },
  'Hypnotic Pattern': {
    level: 3, school: 'Illusion', casting_time: '1 action', range: '120 feet',
    components: 'S, M (a glowing stick of incense or crystal vial)', duration: 'Concentration, up to 1 minute',
    concentration: true,
    description: 'You create a twisting pattern of colors in a 30-foot cube. Each creature that can see the pattern must make a WIS save. On failure, the creature becomes charmed, incapacitated, and has speed 0. The effect ends if the creature takes damage or someone shakes it awake.',
  },
  'Lightning Bolt': {
    level: 3, school: 'Evocation', casting_time: '1 action', range: 'Self (100-foot line)',
    components: 'V, S, M (a bit of fur and a rod of amber, crystal, or glass)', duration: 'Instantaneous', damage: '8d6 lightning',
    description: 'A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you. Each creature in the line must make a DEX save. On failure: 8d6 lightning damage. Half on success. +1d6 per slot above 3rd.',
  },
  'Revivify': {
    level: 3, school: 'Necromancy', casting_time: '1 action', range: 'Touch',
    components: 'V, S, M (diamonds worth 300 gp, consumed)', duration: 'Instantaneous',
    description: 'You touch a creature that has died within the last minute. That creature returns to life with 1 hit point. This spell can\'t return to life a creature that has died of old age, nor can it restore any missing body parts.',
  },
  'Spirit Guardians': {
    level: 3, school: 'Conjuration', casting_time: '1 action', range: 'Self (15-foot radius)',
    components: 'V, S, M (a holy symbol)', duration: 'Concentration, up to 10 minutes', damage: '3d8 radiant/necrotic',
    concentration: true,
    description: 'You call forth spirits to protect you. They flit around you to a distance of 15 feet. The area is difficult terrain for enemies. When a hostile creature enters the area or starts its turn there, it must make a WIS save or take 3d8 damage (radiant or necrotic). Half on success.',
  },
  'Vampiric Touch': {
    level: 3, school: 'Necromancy', casting_time: '1 action', range: 'Self',
    components: 'V, S', duration: 'Concentration, up to 1 minute', damage: '3d6 necrotic',
    concentration: true,
    description: 'The touch of your shadow-wreathed hand can siphon life force. Make a melee spell attack. On hit: 3d6 necrotic damage and you regain HP equal to half the damage dealt. You can make the attack again on each of your turns as an action.',
  },
}
