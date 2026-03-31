/**
 * D&D 5e Subclass Bonus Spells — expanded spell lists granted by subclass
 * Includes: Warlock Patron spells, Cleric Domain spells, Paladin Oath spells,
 * Sorcerer Origin spells, Ranger subclass spells, and subclass bonus cantrips
 */

export interface SubclassSpellGrant {
  /** Bonus cantrips (e.g., Celestial Warlock gets Light + Sacred Flame) */
  bonusCantrips?: string[]
  /** Expanded/bonus spell list per spell level */
  bonusSpells?: Record<number, string[]>
  /** Short description of what the subclass grants */
  note?: string
}

/**
 * SUBCLASS_SPELLS[className][subclassName] → { bonusCantrips, bonusSpells }
 */
export const SUBCLASS_SPELLS: Record<string, Record<string, SubclassSpellGrant>> = {
  // ── WARLOCK PATRON EXPANDED SPELLS ──
  Warlock: {
    'The Archfey': {
      bonusSpells: {
        1: ['Faerie Fire', 'Sleep'],
        2: ['Calm Emotions', 'Phantasmal Force'],
        3: ['Blink', 'Plant Growth'],
        4: ['Dominate Beast', 'Greater Invisibility'],
        5: ['Dominate Person', 'Seeming'],
      },
    },
    'The Celestial': {
      bonusCantrips: ['Light', 'Sacred Flame'],
      bonusSpells: {
        1: ['Cure Wounds', 'Guiding Bolt'],
        2: ['Flaming Sphere', 'Lesser Restoration'],
        3: ['Daylight', 'Revivify'],
        4: ['Guardian of Faith', 'Wall of Fire'],
        5: ['Flame Strike', 'Greater Restoration'],
      },
      note: 'Bonus cantrips do not count against cantrips known.',
    },
    'The Fathomless': {
      bonusSpells: {
        1: ['Create or Destroy Water', 'Thunderwave'],
        2: ['Gust of Wind', 'Silence'],
        3: ['Lightning Bolt', 'Sleet Storm'],
        4: ['Control Water', 'Summon Elemental'],
        5: ['Bigby\'s Hand', 'Cone of Cold'],
      },
    },
    'The Fiend': {
      bonusSpells: {
        1: ['Burning Hands', 'Command'],
        2: ['Blindness/Deafness', 'Scorching Ray'],
        3: ['Fireball', 'Stinking Cloud'],
        4: ['Fire Shield', 'Wall of Fire'],
        5: ['Flame Strike', 'Hallow'],
      },
    },
    'The Genie': {
      bonusSpells: {
        1: ['Detect Evil and Good', 'Thunderwave'],
        2: ['Phantasmal Force', 'Spike Growth'],
        3: ['Create Food and Water', 'Protection from Energy'],
        4: ['Phantasmal Killer', 'Polymorph'],
        5: ['Creation', 'Wish'],
      },
      note: 'Exact spells vary by genie kind (Dao/Djinni/Efreeti/Marid).',
    },
    'The Great Old One': {
      bonusSpells: {
        1: ['Dissonant Whispers', 'Tasha\'s Hideous Laughter'],
        2: ['Detect Thoughts', 'Phantasmal Force'],
        3: ['Clairvoyance', 'Sending'],
        4: ['Dominate Beast', 'Evard\'s Black Tentacles'],
        5: ['Dominate Person', 'Telekinesis'],
      },
    },
    'The Hexblade': {
      bonusSpells: {
        1: ['Shield', 'Wrathful Smite'],
        2: ['Blur', 'Branding Smite'],
        3: ['Blink', 'Elemental Weapon'],
        4: ['Phantasmal Killer', 'Staggering Smite'],
        5: ['Banishing Smite', 'Cone of Cold'],
      },
    },
    'The Undead': {
      bonusSpells: {
        1: ['Bane', 'False Life'],
        2: ['Blindness/Deafness', 'Phantasmal Force'],
        3: ['Phantom Steed', 'Speak with Dead'],
        4: ['Death Ward', 'Greater Invisibility'],
        5: ['Antilife Shell', 'Cloudkill'],
      },
    },
    'The Undying': {
      bonusSpells: {
        1: ['False Life', 'Ray of Sickness'],
        2: ['Blindness/Deafness', 'Silence'],
        3: ['Feign Death', 'Speak with Dead'],
        4: ['Aura of Life', 'Death Ward'],
        5: ['Contagion', 'Legend Lore'],
      },
    },
  },

  // ── CLERIC DOMAIN SPELLS ──
  Cleric: {
    'Knowledge Domain': {
      bonusSpells: {
        1: ['Command', 'Identify'],
        2: ['Augury', 'Suggestion'],
        3: ['Nondetection', 'Speak with Dead'],
        4: ['Arcane Eye', 'Confusion'],
        5: ['Legend Lore', 'Scrying'],
      },
    },
    'Life Domain': {
      bonusSpells: {
        1: ['Bless', 'Cure Wounds'],
        2: ['Lesser Restoration', 'Spiritual Weapon'],
        3: ['Beacon of Hope', 'Revivify'],
        4: ['Death Ward', 'Guardian of Faith'],
        5: ['Mass Cure Wounds', 'Raise Dead'],
      },
    },
    'Light Domain': {
      bonusCantrips: ['Light'],
      bonusSpells: {
        1: ['Burning Hands', 'Faerie Fire'],
        2: ['Flaming Sphere', 'Scorching Ray'],
        3: ['Daylight', 'Fireball'],
        4: ['Guardian of Faith', 'Wall of Fire'],
        5: ['Flame Strike', 'Scrying'],
      },
    },
    'Nature Domain': {
      bonusSpells: {
        1: ['Animal Friendship', 'Speak with Animals'],
        2: ['Barkskin', 'Spike Growth'],
        3: ['Plant Growth', 'Wind Wall'],
        4: ['Dominate Beast', 'Grasping Vine'],
        5: ['Insect Plague', 'Tree Stride'],
      },
    },
    'Tempest Domain': {
      bonusSpells: {
        1: ['Fog Cloud', 'Thunderwave'],
        2: ['Gust of Wind', 'Shatter'],
        3: ['Call Lightning', 'Sleet Storm'],
        4: ['Control Water', 'Ice Storm'],
        5: ['Destructive Wave', 'Insect Plague'],
      },
    },
    'Trickery Domain': {
      bonusSpells: {
        1: ['Charm Person', 'Disguise Self'],
        2: ['Mirror Image', 'Pass without Trace'],
        3: ['Blink', 'Dispel Magic'],
        4: ['Dimension Door', 'Polymorph'],
        5: ['Dominate Person', 'Modify Memory'],
      },
    },
    'War Domain': {
      bonusSpells: {
        1: ['Divine Favor', 'Shield of Faith'],
        2: ['Magic Weapon', 'Spiritual Weapon'],
        3: ['Crusader\'s Mantle', 'Spirit Guardians'],
        4: ['Freedom of Movement', 'Stoneskin'],
        5: ['Flame Strike', 'Hold Monster'],
      },
    },
    'Death Domain': {
      bonusCantrips: ['Chill Touch'],
      bonusSpells: {
        1: ['False Life', 'Ray of Sickness'],
        2: ['Blindness/Deafness', 'Ray of Enfeeblement'],
        3: ['Animate Dead', 'Vampiric Touch'],
        4: ['Blight', 'Death Ward'],
        5: ['Antilife Shell', 'Cloudkill'],
      },
    },
    'Forge Domain': {
      bonusSpells: {
        1: ['Identify', 'Searing Smite'],
        2: ['Heat Metal', 'Magic Weapon'],
        3: ['Elemental Weapon', 'Protection from Energy'],
        4: ['Fabricate', 'Wall of Fire'],
        5: ['Animate Objects', 'Creation'],
      },
    },
    'Grave Domain': {
      bonusCantrips: ['Spare the Dying'],
      bonusSpells: {
        1: ['Bane', 'False Life'],
        2: ['Gentle Repose', 'Ray of Enfeeblement'],
        3: ['Revivify', 'Vampiric Touch'],
        4: ['Blight', 'Death Ward'],
        5: ['Antilife Shell', 'Raise Dead'],
      },
      note: 'Spare the Dying has 30 ft range and is a bonus action.',
    },
    'Order Domain': {
      bonusSpells: {
        1: ['Command', 'Heroism'],
        2: ['Hold Person', 'Zone of Truth'],
        3: ['Mass Healing Word', 'Slow'],
        4: ['Compulsion', 'Locate Creature'],
        5: ['Commune', 'Dominate Person'],
      },
    },
    'Peace Domain': {
      bonusSpells: {
        1: ['Heroism', 'Sanctuary'],
        2: ['Aid', 'Warding Bond'],
        3: ['Beacon of Hope', 'Sending'],
        4: ['Aura of Purity', 'Otiluke\'s Resilient Sphere'],
        5: ['Greater Restoration', 'Rary\'s Telepathic Bond'],
      },
    },
    'Twilight Domain': {
      bonusSpells: {
        1: ['Faerie Fire', 'Sleep'],
        2: ['Moonbeam', 'See Invisibility'],
        3: ['Aura of Vitality', 'Leomund\'s Tiny Hut'],
        4: ['Aura of Life', 'Greater Invisibility'],
        5: ['Circle of Power', 'Mislead'],
      },
    },
  },

  // ── PALADIN OATH SPELLS ──
  Paladin: {
    'Oath of Devotion': {
      bonusSpells: {
        1: ['Protection from Evil and Good', 'Sanctuary'],
        2: ['Lesser Restoration', 'Zone of Truth'],
        3: ['Beacon of Hope', 'Dispel Magic'],
        4: ['Freedom of Movement', 'Guardian of Faith'],
        5: ['Commune', 'Flame Strike'],
      },
    },
    'Oath of the Ancients': {
      bonusSpells: {
        1: ['Ensnaring Strike', 'Speak with Animals'],
        2: ['Misty Step', 'Moonbeam'],
        3: ['Plant Growth', 'Protection from Energy'],
        4: ['Ice Storm', 'Stoneskin'],
        5: ['Commune with Nature', 'Tree Stride'],
      },
    },
    'Oath of Vengeance': {
      bonusSpells: {
        1: ['Bane', 'Hunter\'s Mark'],
        2: ['Hold Person', 'Misty Step'],
        3: ['Haste', 'Protection from Energy'],
        4: ['Banishment', 'Dimension Door'],
        5: ['Hold Monster', 'Scrying'],
      },
    },
    'Oath of Conquest': {
      bonusSpells: {
        1: ['Armor of Agathys', 'Command'],
        2: ['Hold Person', 'Spiritual Weapon'],
        3: ['Bestow Curse', 'Fear'],
        4: ['Dominate Beast', 'Stoneskin'],
        5: ['Cloudkill', 'Dominate Person'],
      },
    },
    'Oath of Redemption': {
      bonusSpells: {
        1: ['Sanctuary', 'Sleep'],
        2: ['Calm Emotions', 'Hold Person'],
        3: ['Counterspell', 'Hypnotic Pattern'],
        4: ['Otiluke\'s Resilient Sphere', 'Stoneskin'],
        5: ['Hold Monster', 'Wall of Force'],
      },
    },
    'Oath of Glory': {
      bonusSpells: {
        1: ['Guiding Bolt', 'Heroism'],
        2: ['Enhance Ability', 'Magic Weapon'],
        3: ['Haste', 'Protection from Energy'],
        4: ['Compulsion', 'Freedom of Movement'],
        5: ['Commune', 'Flame Strike'],
      },
    },
    'Oath of the Crown': {
      bonusSpells: {
        1: ['Command', 'Compelled Duel'],
        2: ['Warding Bond', 'Zone of Truth'],
        3: ['Aura of Vitality', 'Spirit Guardians'],
        4: ['Banishment', 'Guardian of Faith'],
        5: ['Circle of Power', 'Geas'],
      },
    },
    'Oath of the Watchers': {
      bonusSpells: {
        1: ['Alarm', 'Detect Magic'],
        2: ['Moonbeam', 'See Invisibility'],
        3: ['Counterspell', 'Nondetection'],
        4: ['Aura of Purity', 'Banishment'],
        5: ['Hold Monster', 'Scrying'],
      },
    },
    'Oathbreaker': {
      bonusSpells: {
        1: ['Hellish Rebuke', 'Inflict Wounds'],
        2: ['Crown of Madness', 'Darkness'],
        3: ['Animate Dead', 'Bestow Curse'],
        4: ['Blight', 'Confusion'],
        5: ['Contagion', 'Dominate Person'],
      },
    },
  },

  // ── SORCERER ORIGIN SPELLS ──
  Sorcerer: {
    'Aberrant Mind': {
      bonusCantrips: ['Mind Sliver'],
      bonusSpells: {
        1: ['Arms of Hadar', 'Dissonant Whispers'],
        2: ['Calm Emotions', 'Detect Thoughts'],
        3: ['Hunger of Hadar', 'Sending'],
        4: ['Evard\'s Black Tentacles', 'Summon Aberration'],
        5: ['Rary\'s Telepathic Bond', 'Telekinesis'],
      },
    },
    'Clockwork Soul': {
      bonusSpells: {
        1: ['Alarm', 'Protection from Evil and Good'],
        2: ['Aid', 'Lesser Restoration'],
        3: ['Dispel Magic', 'Protection from Energy'],
        4: ['Freedom of Movement', 'Summon Construct'],
        5: ['Greater Restoration', 'Wall of Force'],
      },
    },
    'Divine Soul': {
      note: 'Gains access to the entire Cleric spell list in addition to Sorcerer spells.',
    },
    'Shadow Magic': {
      bonusCantrips: ['Minor Illusion'],
      note: 'Shadow Sorcery features but no expanded spell list.',
    },
  },

  // ── RANGER SUBCLASS SPELLS ──
  Ranger: {
    'Gloom Stalker': {
      bonusSpells: {
        1: ['Disguise Self'],
        2: ['Rope Trick'],
        3: ['Fear'],
        4: ['Greater Invisibility'],
        5: ['Seeming'],
      },
    },
    'Horizon Walker': {
      bonusSpells: {
        1: ['Protection from Evil and Good'],
        2: ['Misty Step'],
        3: ['Haste'],
        4: ['Banishment'],
        5: ['Teleportation Circle'],
      },
    },
    'Monster Slayer': {
      bonusSpells: {
        1: ['Protection from Evil and Good'],
        2: ['Zone of Truth'],
        3: ['Magic Circle'],
        4: ['Banishment'],
        5: ['Hold Monster'],
      },
    },
    'Swarmkeeper': {
      bonusSpells: {
        1: ['Faerie Fire', 'Mage Hand'],
        2: ['Web'],
        3: ['Gaseous Form'],
        4: ['Arcane Eye'],
        5: ['Insect Plague'],
      },
    },
    'Fey Wanderer': {
      bonusSpells: {
        1: ['Charm Person'],
        2: ['Misty Step'],
        3: ['Dispel Magic'],
        4: ['Dimension Door'],
        5: ['Mislead'],
      },
    },
    'Drakewarden': {
      bonusSpells: {
        1: ['Thaumaturgy'],
        2: ['Dragon\'s Breath'],
        3: ['Fear'],
        4: ['Elemental Bane'],
        5: ['Summon Draconic Spirit'],
      },
    },
  },
}

/** Get subclass spell grants for a class and subclass */
export function getSubclassSpells(className: string, subclassName: string): SubclassSpellGrant | undefined {
  return SUBCLASS_SPELLS[className]?.[subclassName]
}

/** Get bonus cantrips from subclass */
export function getSubclassBonusCantrips(className: string, subclassName: string): string[] {
  return SUBCLASS_SPELLS[className]?.[subclassName]?.bonusCantrips ?? []
}

/** Get bonus spells from subclass at a given max spell level */
export function getSubclassBonusSpells(className: string, subclassName: string, maxLevel: number): Record<number, string[]> {
  const grant = SUBCLASS_SPELLS[className]?.[subclassName]
  if (!grant?.bonusSpells) return {}
  const result: Record<number, string[]> = {}
  for (const [lvl, spells] of Object.entries(grant.bonusSpells)) {
    const n = parseInt(lvl)
    if (n <= maxLevel) result[n] = spells
  }
  return result
}
