/**
 * D&D 5e Spell Lists — spell names organized by class and spell level
 * Used by Character Forge to show available spells during character creation
 * Format: CLASS_SPELLS[className][spellLevel] where 0 = cantrips
 */

export const CLASS_SPELLS: Record<string, Record<number, string[]>> = {
  Bard: {
    0: ['Blade Ward', 'Dancing Lights', 'Friends', 'Light', 'Mage Hand', 'Mending', 'Message', 'Minor Illusion', 'Prestidigitation', 'Thunderclap', 'True Strike', 'Vicious Mockery'],
    1: ['Animal Friendship', 'Bane', 'Charm Person', 'Comprehend Languages', 'Cure Wounds', 'Detect Magic', 'Disguise Self', 'Dissonant Whispers', 'Earth Tremor', 'Faerie Fire', 'Feather Fall', 'Healing Word', 'Heroism', 'Identify', 'Illusory Script', 'Longstrider', 'Silent Image', 'Sleep', 'Speak with Animals', 'Tasha\'s Hideous Laughter', 'Thunderwave', 'Unseen Servant'],
    2: ['Animal Messenger', 'Blindness/Deafness', 'Calm Emotions', 'Cloud of Daggers', 'Crown of Madness', 'Detect Thoughts', 'Enhance Ability', 'Enthrall', 'Heat Metal', 'Hold Person', 'Invisibility', 'Knock', 'Lesser Restoration', 'Locate Animals or Plants', 'Locate Object', 'Magic Mouth', 'Phantasmal Force', 'Pyrotechnics', 'See Invisibility', 'Shatter', 'Silence', 'Skywrite', 'Suggestion', 'Warding Wind', 'Zone of Truth'],
    3: ['Bestow Curse', 'Clairvoyance', 'Dispel Magic', 'Fear', 'Feign Death', 'Glyph of Warding', 'Hypnotic Pattern', 'Leomund\'s Tiny Hut', 'Major Image', 'Nondetection', 'Plant Growth', 'Sending', 'Speak with Dead', 'Speak with Plants', 'Stinking Cloud', 'Tongues'],
    4: ['Compulsion', 'Confusion', 'Dimension Door', 'Freedom of Movement', 'Greater Invisibility', 'Hallucinatory Terrain', 'Locate Creature', 'Polymorph'],
    5: ['Animate Objects', 'Awaken', 'Dominate Person', 'Dream', 'Geas', 'Greater Restoration', 'Hold Monster', 'Legend Lore', 'Mass Cure Wounds', 'Mislead', 'Modify Memory', 'Planar Binding', 'Raise Dead', 'Scrying', 'Seeming', 'Teleportation Circle'],
    6: ['Eyebite', 'Find the Path', 'Guards and Wards', 'Mass Suggestion', 'Otto\'s Irresistible Dance', 'Programmed Illusion', 'True Seeing'],
    7: ['Etherealness', 'Forcecage', 'Mirage Arcane', 'Mordenkainen\'s Magnificent Mansion', 'Mordenkainen\'s Sword', 'Project Image', 'Regenerate', 'Resurrection', 'Symbol', 'Teleport'],
    8: ['Dominate Monster', 'Feeblemind', 'Glibness', 'Mind Blank', 'Power Word Stun'],
    9: ['Foresight', 'Power Word Heal', 'Power Word Kill', 'True Polymorph'],
  },
  Cleric: {
    0: ['Guidance', 'Light', 'Mending', 'Resistance', 'Sacred Flame', 'Spare the Dying', 'Thaumaturgy', 'Toll the Dead', 'Word of Radiance'],
    1: ['Bane', 'Bless', 'Command', 'Create or Destroy Water', 'Cure Wounds', 'Detect Evil and Good', 'Detect Magic', 'Detect Poison and Disease', 'Guiding Bolt', 'Healing Word', 'Inflict Wounds', 'Protection from Evil and Good', 'Purify Food and Drink', 'Sanctuary', 'Shield of Faith'],
    2: ['Aid', 'Augury', 'Blindness/Deafness', 'Calm Emotions', 'Continual Flame', 'Enhance Ability', 'Find Traps', 'Gentle Repose', 'Hold Person', 'Lesser Restoration', 'Locate Object', 'Prayer of Healing', 'Protection from Poison', 'Silence', 'Spiritual Weapon', 'Warding Bond', 'Zone of Truth'],
    3: ['Animate Dead', 'Beacon of Hope', 'Bestow Curse', 'Clairvoyance', 'Create Food and Water', 'Daylight', 'Dispel Magic', 'Feign Death', 'Glyph of Warding', 'Magic Circle', 'Mass Healing Word', 'Meld into Stone', 'Protection from Energy', 'Remove Curse', 'Revivify', 'Sending', 'Speak with Dead', 'Spirit Guardians', 'Tongues', 'Water Walk'],
    4: ['Banishment', 'Control Water', 'Death Ward', 'Divination', 'Freedom of Movement', 'Guardian of Faith', 'Locate Creature', 'Stone Shape'],
    5: ['Commune', 'Contagion', 'Dispel Evil and Good', 'Flame Strike', 'Geas', 'Greater Restoration', 'Hallow', 'Insect Plague', 'Legend Lore', 'Mass Cure Wounds', 'Planar Binding', 'Raise Dead', 'Scrying'],
    6: ['Blade Barrier', 'Create Undead', 'Find the Path', 'Forbiddance', 'Harm', 'Heal', 'Heroes\' Feast', 'Planar Ally', 'True Seeing', 'Word of Recall'],
    7: ['Conjure Celestial', 'Divine Word', 'Etherealness', 'Fire Storm', 'Plane Shift', 'Regenerate', 'Resurrection', 'Symbol', 'Temple of the Gods'],
    8: ['Antimagic Field', 'Control Weather', 'Earthquake', 'Holy Aura'],
    9: ['Astral Projection', 'Gate', 'Mass Heal', 'True Resurrection'],
  },
  Druid: {
    0: ['Control Flames', 'Create Bonfire', 'Druidcraft', 'Frostbite', 'Guidance', 'Gust', 'Infestation', 'Magic Stone', 'Mending', 'Mold Earth', 'Poison Spray', 'Produce Flame', 'Resistance', 'Shape Water', 'Shillelagh', 'Thorn Whip', 'Thunderclap'],
    1: ['Absorb Elements', 'Animal Friendship', 'Beast Bond', 'Charm Person', 'Create or Destroy Water', 'Cure Wounds', 'Detect Magic', 'Detect Poison and Disease', 'Earth Tremor', 'Entangle', 'Faerie Fire', 'Fog Cloud', 'Goodberry', 'Healing Word', 'Ice Knife', 'Jump', 'Longstrider', 'Purify Food and Drink', 'Snare', 'Speak with Animals', 'Thunderwave'],
    2: ['Animal Messenger', 'Barkskin', 'Beast Sense', 'Darkvision', 'Dust Devil', 'Earthbind', 'Enhance Ability', 'Find Traps', 'Flame Blade', 'Flaming Sphere', 'Gust of Wind', 'Heat Metal', 'Hold Person', 'Lesser Restoration', 'Locate Animals or Plants', 'Locate Object', 'Moonbeam', 'Pass without Trace', 'Protection from Poison', 'Skywrite', 'Spike Growth', 'Warding Wind'],
    3: ['Call Lightning', 'Conjure Animals', 'Daylight', 'Dispel Magic', 'Erupting Earth', 'Feign Death', 'Flame Arrows', 'Meld into Stone', 'Plant Growth', 'Protection from Energy', 'Sleet Storm', 'Speak with Plants', 'Tidal Wave', 'Wall of Water', 'Water Breathing', 'Water Walk', 'Wind Wall'],
    4: ['Blight', 'Confusion', 'Conjure Minor Elementals', 'Conjure Woodland Beings', 'Control Water', 'Dominate Beast', 'Freedom of Movement', 'Giant Insect', 'Grasping Vine', 'Guardian of Nature', 'Hallucinatory Terrain', 'Ice Storm', 'Locate Creature', 'Polymorph', 'Stone Shape', 'Stoneskin', 'Wall of Fire'],
    5: ['Antilife Shell', 'Awaken', 'Commune with Nature', 'Conjure Elemental', 'Contagion', 'Geas', 'Greater Restoration', 'Insect Plague', 'Maelstrom', 'Mass Cure Wounds', 'Planar Binding', 'Reincarnate', 'Scrying', 'Transmute Rock', 'Tree Stride', 'Wall of Stone'],
    6: ['Bones of the Earth', 'Conjure Fey', 'Druid Grove', 'Find the Path', 'Heal', 'Heroes\' Feast', 'Move Earth', 'Primordial Ward', 'Sunbeam', 'Transport via Plants', 'Wall of Thorns', 'Wind Walk'],
    7: ['Fire Storm', 'Mirage Arcane', 'Plane Shift', 'Regenerate', 'Reverse Gravity', 'Whirlwind'],
    8: ['Animal Shapes', 'Antipathy/Sympathy', 'Control Weather', 'Earthquake', 'Feeblemind', 'Sunburst', 'Tsunami'],
    9: ['Foresight', 'Shapechange', 'Storm of Vengeance', 'True Resurrection'],
  },
  Paladin: {
    1: ['Bless', 'Command', 'Compelled Duel', 'Cure Wounds', 'Detect Evil and Good', 'Detect Magic', 'Detect Poison and Disease', 'Divine Favor', 'Heroism', 'Protection from Evil and Good', 'Purify Food and Drink', 'Searing Smite', 'Shield of Faith', 'Thunderous Smite', 'Wrathful Smite'],
    2: ['Aid', 'Branding Smite', 'Find Steed', 'Lesser Restoration', 'Locate Object', 'Magic Weapon', 'Protection from Poison', 'Zone of Truth'],
    3: ['Aura of Vitality', 'Blinding Smite', 'Create Food and Water', 'Crusader\'s Mantle', 'Daylight', 'Dispel Magic', 'Elemental Weapon', 'Magic Circle', 'Remove Curse', 'Revivify', 'Spirit Shroud'],
    4: ['Aura of Life', 'Aura of Purity', 'Banishment', 'Death Ward', 'Find Greater Steed', 'Locate Creature', 'Staggering Smite'],
    5: ['Banishing Smite', 'Circle of Power', 'Destructive Wave', 'Dispel Evil and Good', 'Geas', 'Holy Weapon', 'Raise Dead', 'Summon Celestial'],
  },
  Ranger: {
    1: ['Absorb Elements', 'Alarm', 'Animal Friendship', 'Beast Bond', 'Cure Wounds', 'Detect Magic', 'Detect Poison and Disease', 'Ensnaring Strike', 'Fog Cloud', 'Goodberry', 'Hail of Thorns', 'Hunter\'s Mark', 'Jump', 'Longstrider', 'Snare', 'Speak with Animals'],
    2: ['Animal Messenger', 'Barkskin', 'Beast Sense', 'Cordon of Arrows', 'Darkvision', 'Find Traps', 'Lesser Restoration', 'Locate Animals or Plants', 'Locate Object', 'Pass without Trace', 'Protection from Poison', 'Silence', 'Spike Growth'],
    3: ['Conjure Animals', 'Conjure Barrage', 'Daylight', 'Flame Arrows', 'Lightning Arrow', 'Nondetection', 'Plant Growth', 'Protection from Energy', 'Speak with Plants', 'Water Breathing', 'Water Walk', 'Wind Wall'],
    4: ['Conjure Woodland Beings', 'Freedom of Movement', 'Grasping Vine', 'Guardian of Nature', 'Locate Creature', 'Stoneskin'],
    5: ['Commune with Nature', 'Conjure Volley', 'Greater Restoration', 'Steel Wind Strike', 'Swift Quiver', 'Tree Stride'],
  },
  Sorcerer: {
    0: ['Acid Splash', 'Blade Ward', 'Chill Touch', 'Control Flames', 'Create Bonfire', 'Dancing Lights', 'Fire Bolt', 'Friends', 'Frostbite', 'Gust', 'Infestation', 'Light', 'Mage Hand', 'Mending', 'Message', 'Minor Illusion', 'Mold Earth', 'Poison Spray', 'Prestidigitation', 'Ray of Frost', 'Shape Water', 'Shocking Grasp', 'Sword Burst', 'Thunderclap', 'True Strike'],
    1: ['Absorb Elements', 'Burning Hands', 'Catapult', 'Chaos Bolt', 'Charm Person', 'Chromatic Orb', 'Color Spray', 'Comprehend Languages', 'Detect Magic', 'Disguise Self', 'Earth Tremor', 'Expeditious Retreat', 'False Life', 'Feather Fall', 'Fog Cloud', 'Ice Knife', 'Jump', 'Mage Armor', 'Magic Missile', 'Ray of Sickness', 'Shield', 'Silent Image', 'Sleep', 'Thunderwave', 'Witch Bolt'],
    2: ['Aganazzar\'s Scorcher', 'Alter Self', 'Blindness/Deafness', 'Blur', 'Cloud of Daggers', 'Crown of Madness', 'Darkness', 'Darkvision', 'Detect Thoughts', 'Dragon\'s Breath', 'Dust Devil', 'Earthbind', 'Enhance Ability', 'Enlarge/Reduce', 'Gust of Wind', 'Hold Person', 'Invisibility', 'Knock', 'Levitate', 'Maximilian\'s Earthen Grasp', 'Mirror Image', 'Misty Step', 'Phantasmal Force', 'Pyrotechnics', 'Scorching Ray', 'See Invisibility', 'Shatter', 'Snilloc\'s Snowball Swarm', 'Spider Climb', 'Suggestion', 'Warding Wind', 'Web'],
    3: ['Blink', 'Clairvoyance', 'Counterspell', 'Daylight', 'Dispel Magic', 'Erupting Earth', 'Fear', 'Fireball', 'Flame Arrows', 'Fly', 'Gaseous Form', 'Haste', 'Hypnotic Pattern', 'Lightning Bolt', 'Major Image', 'Melf\'s Minute Meteors', 'Protection from Energy', 'Sleet Storm', 'Slow', 'Stinking Cloud', 'Tidal Wave', 'Tongues', 'Wall of Water', 'Water Breathing', 'Water Walk'],
    4: ['Banishment', 'Blight', 'Confusion', 'Dimension Door', 'Dominate Beast', 'Greater Invisibility', 'Ice Storm', 'Polymorph', 'Stoneskin', 'Storm Sphere', 'Vitriolic Sphere', 'Wall of Fire', 'Watery Sphere'],
    5: ['Animate Objects', 'Cloudkill', 'Cone of Cold', 'Control Winds', 'Creation', 'Dominate Person', 'Hold Monster', 'Immolation', 'Insect Plague', 'Seeming', 'Telekinesis', 'Teleportation Circle', 'Wall of Stone'],
    6: ['Arcane Gate', 'Chain Lightning', 'Circle of Death', 'Disintegrate', 'Eyebite', 'Globe of Invulnerability', 'Investiture of Flame', 'Investiture of Ice', 'Investiture of Stone', 'Investiture of Wind', 'Mass Suggestion', 'Mental Prison', 'Move Earth', 'Scatter', 'Sunbeam', 'True Seeing'],
    7: ['Crown of Stars', 'Delayed Blast Fireball', 'Etherealness', 'Finger of Death', 'Fire Storm', 'Plane Shift', 'Power Word Pain', 'Prismatic Spray', 'Reverse Gravity', 'Teleport', 'Whirlwind'],
    8: ['Abi-Dalzim\'s Horrid Wilting', 'Dominate Monster', 'Earthquake', 'Incendiary Cloud', 'Power Word Stun', 'Sunburst'],
    9: ['Gate', 'Meteor Swarm', 'Power Word Kill', 'Time Stop', 'Wish'],
  },
  Warlock: {
    0: ['Blade Ward', 'Booming Blade', 'Chill Touch', 'Create Bonfire', 'Eldritch Blast', 'Friends', 'Frostbite', 'Green-Flame Blade', 'Infestation', 'Lightning Lure', 'Mage Hand', 'Magic Stone', 'Minor Illusion', 'Poison Spray', 'Prestidigitation', 'Sword Burst', 'Thunderclap', 'Toll the Dead', 'True Strike'],
    1: ['Armor of Agathys', 'Arms of Hadar', 'Cause Fear', 'Charm Person', 'Comprehend Languages', 'Expeditious Retreat', 'Hellish Rebuke', 'Hex', 'Illusory Script', 'Protection from Evil and Good', 'Unseen Servant', 'Witch Bolt'],
    2: ['Cloud of Daggers', 'Crown of Madness', 'Darkness', 'Earthbind', 'Enthrall', 'Hold Person', 'Invisibility', 'Mind Spike', 'Mirror Image', 'Misty Step', 'Ray of Enfeeblement', 'Shadow Blade', 'Shatter', 'Spider Climb', 'Suggestion'],
    3: ['Counterspell', 'Dispel Magic', 'Enemies Abound', 'Fear', 'Fly', 'Gaseous Form', 'Hunger of Hadar', 'Hypnotic Pattern', 'Magic Circle', 'Major Image', 'Remove Curse', 'Summon Lesser Demons', 'Thunder Step', 'Tongues', 'Vampiric Touch'],
    4: ['Banishment', 'Blight', 'Dimension Door', 'Elemental Bane', 'Hallucinatory Terrain', 'Shadow of Moil', 'Sickening Radiance', 'Summon Greater Demon'],
    5: ['Contact Other Plane', 'Danse Macabre', 'Dream', 'Enervation', 'Far Step', 'Hold Monster', 'Infernal Calling', 'Negative Energy Flood', 'Scrying', 'Synaptic Static', 'Wall of Light'],
    6: ['Arcane Gate', 'Circle of Death', 'Conjure Fey', 'Create Undead', 'Eyebite', 'Flesh to Stone', 'Investiture of Flame', 'Investiture of Ice', 'Investiture of Stone', 'Investiture of Wind', 'Mass Suggestion', 'Mental Prison', 'Scatter', 'Soul Cage', 'True Seeing'],
    7: ['Crown of Stars', 'Etherealness', 'Finger of Death', 'Forcecage', 'Plane Shift', 'Power Word Pain'],
    8: ['Demiplane', 'Dominate Monster', 'Feeblemind', 'Glibness', 'Maddening Darkness', 'Power Word Stun'],
    9: ['Astral Projection', 'Blade of Disaster', 'Foresight', 'Gate', 'Imprisonment', 'Power Word Kill', 'Psychic Scream', 'True Polymorph'],
  },
  Wizard: {
    0: ['Acid Splash', 'Blade Ward', 'Booming Blade', 'Chill Touch', 'Control Flames', 'Create Bonfire', 'Dancing Lights', 'Fire Bolt', 'Friends', 'Frostbite', 'Green-Flame Blade', 'Gust', 'Infestation', 'Light', 'Lightning Lure', 'Mage Hand', 'Mending', 'Message', 'Mind Sliver', 'Minor Illusion', 'Mold Earth', 'Poison Spray', 'Prestidigitation', 'Ray of Frost', 'Shape Water', 'Shocking Grasp', 'Sword Burst', 'Thunderclap', 'Toll the Dead', 'True Strike'],
    1: ['Absorb Elements', 'Alarm', 'Burning Hands', 'Catapult', 'Cause Fear', 'Charm Person', 'Chromatic Orb', 'Color Spray', 'Comprehend Languages', 'Detect Magic', 'Disguise Self', 'Expeditious Retreat', 'False Life', 'Feather Fall', 'Find Familiar', 'Fog Cloud', 'Grease', 'Ice Knife', 'Identify', 'Illusory Script', 'Jump', 'Longstrider', 'Mage Armor', 'Magic Missile', 'Protection from Evil and Good', 'Ray of Sickness', 'Shield', 'Silent Image', 'Sleep', 'Snare', 'Tasha\'s Hideous Laughter', 'Tenser\'s Floating Disk', 'Thunderwave', 'Unseen Servant', 'Witch Bolt'],
    2: ['Aganazzar\'s Scorcher', 'Alter Self', 'Arcane Lock', 'Blindness/Deafness', 'Blur', 'Cloud of Daggers', 'Continual Flame', 'Crown of Madness', 'Darkness', 'Darkvision', 'Detect Thoughts', 'Dragon\'s Breath', 'Dust Devil', 'Earthbind', 'Enlarge/Reduce', 'Flaming Sphere', 'Gentle Repose', 'Gust of Wind', 'Hold Person', 'Invisibility', 'Knock', 'Levitate', 'Locate Object', 'Magic Mouth', 'Magic Weapon', 'Maximilian\'s Earthen Grasp', 'Melf\'s Acid Arrow', 'Mind Spike', 'Mirror Image', 'Misty Step', 'Nystul\'s Magic Aura', 'Phantasmal Force', 'Pyrotechnics', 'Ray of Enfeeblement', 'Rope Trick', 'Scorching Ray', 'See Invisibility', 'Shadow Blade', 'Shatter', 'Skywrite', 'Snilloc\'s Snowball Swarm', 'Spider Climb', 'Suggestion', 'Warding Wind', 'Web'],
    3: ['Animate Dead', 'Bestow Curse', 'Blink', 'Clairvoyance', 'Counterspell', 'Dispel Magic', 'Erupting Earth', 'Fear', 'Feign Death', 'Fireball', 'Flame Arrows', 'Fly', 'Gaseous Form', 'Glyph of Warding', 'Haste', 'Hypnotic Pattern', 'Leomund\'s Tiny Hut', 'Lightning Bolt', 'Magic Circle', 'Major Image', 'Melf\'s Minute Meteors', 'Nondetection', 'Phantom Steed', 'Protection from Energy', 'Remove Curse', 'Sending', 'Sleet Storm', 'Slow', 'Stinking Cloud', 'Tidal Wave', 'Tiny Servant', 'Tongues', 'Vampiric Touch', 'Wall of Water', 'Water Breathing'],
    4: ['Arcane Eye', 'Banishment', 'Blight', 'Confusion', 'Conjure Minor Elementals', 'Control Water', 'Dimension Door', 'Elemental Bane', 'Evard\'s Black Tentacles', 'Fabricate', 'Fire Shield', 'Greater Invisibility', 'Hallucinatory Terrain', 'Ice Storm', 'Leomund\'s Secret Chest', 'Locate Creature', 'Mordenkainen\'s Faithful Hound', 'Mordenkainen\'s Private Sanctum', 'Otiluke\'s Resilient Sphere', 'Phantasmal Killer', 'Polymorph', 'Sickening Radiance', 'Stone Shape', 'Stoneskin', 'Storm Sphere', 'Vitriolic Sphere', 'Wall of Fire', 'Watery Sphere'],
    5: ['Animate Objects', 'Bigby\'s Hand', 'Cloudkill', 'Cone of Cold', 'Conjure Elemental', 'Contact Other Plane', 'Control Winds', 'Creation', 'Danse Macabre', 'Dawn', 'Dominate Person', 'Dream', 'Enervation', 'Far Step', 'Geas', 'Hold Monster', 'Immolation', 'Legend Lore', 'Mislead', 'Modify Memory', 'Negative Energy Flood', 'Passwall', 'Planar Binding', 'Rary\'s Telepathic Bond', 'Scrying', 'Seeming', 'Steel Wind Strike', 'Synaptic Static', 'Telekinesis', 'Teleportation Circle', 'Wall of Force', 'Wall of Stone'],
    6: ['Arcane Gate', 'Chain Lightning', 'Circle of Death', 'Contingency', 'Create Undead', 'Disintegrate', 'Drawmij\'s Instant Summons', 'Eyebite', 'Flesh to Stone', 'Globe of Invulnerability', 'Guards and Wards', 'Investiture of Flame', 'Investiture of Ice', 'Investiture of Stone', 'Investiture of Wind', 'Magic Jar', 'Mass Suggestion', 'Mental Prison', 'Move Earth', 'Otiluke\'s Freezing Sphere', 'Otto\'s Irresistible Dance', 'Programmed Illusion', 'Scatter', 'Soul Cage', 'Sunbeam', 'Tenser\'s Transformation', 'True Seeing', 'Wall of Ice'],
    7: ['Crown of Stars', 'Delayed Blast Fireball', 'Etherealness', 'Finger of Death', 'Forcecage', 'Mirage Arcane', 'Mordenkainen\'s Magnificent Mansion', 'Mordenkainen\'s Sword', 'Plane Shift', 'Power Word Pain', 'Prismatic Spray', 'Project Image', 'Reverse Gravity', 'Sequester', 'Simulacrum', 'Symbol', 'Teleport', 'Whirlwind'],
    8: ['Abi-Dalzim\'s Horrid Wilting', 'Antimagic Field', 'Antipathy/Sympathy', 'Clone', 'Control Weather', 'Demiplane', 'Dominate Monster', 'Feeblemind', 'Illusory Dragon', 'Incendiary Cloud', 'Maddening Darkness', 'Maze', 'Mighty Fortress', 'Mind Blank', 'Power Word Stun', 'Sunburst', 'Telepathy', 'Trap the Soul'],
    9: ['Astral Projection', 'Blade of Disaster', 'Foresight', 'Gate', 'Imprisonment', 'Mass Polymorph', 'Meteor Swarm', 'Power Word Kill', 'Prismatic Wall', 'Psychic Scream', 'Shapechange', 'Time Stop', 'True Polymorph', 'Wish'],
  },
  Artificer: {
    0: ['Acid Splash', 'Create Bonfire', 'Dancing Lights', 'Fire Bolt', 'Frostbite', 'Guidance', 'Light', 'Mage Hand', 'Magic Stone', 'Mending', 'Message', 'Poison Spray', 'Prestidigitation', 'Ray of Frost', 'Resistance', 'Shocking Grasp', 'Spare the Dying', 'Thorn Whip', 'Thunderclap'],
    1: ['Absorb Elements', 'Alarm', 'Catapult', 'Cure Wounds', 'Detect Magic', 'Disguise Self', 'Expeditious Retreat', 'Faerie Fire', 'False Life', 'Feather Fall', 'Grease', 'Identify', 'Jump', 'Longstrider', 'Purify Food and Drink', 'Sanctuary', 'Snare', 'Tasha\'s Caustic Brew'],
    2: ['Aid', 'Alter Self', 'Arcane Lock', 'Blur', 'Continual Flame', 'Darkvision', 'Enhance Ability', 'Enlarge/Reduce', 'Heat Metal', 'Invisibility', 'Lesser Restoration', 'Levitate', 'Magic Mouth', 'Magic Weapon', 'Protection from Poison', 'Pyrotechnics', 'Rope Trick', 'See Invisibility', 'Skywrite', 'Spider Climb', 'Web'],
    3: ['Blink', 'Catnap', 'Create Food and Water', 'Dispel Magic', 'Elemental Weapon', 'Flame Arrows', 'Fly', 'Glyph of Warding', 'Haste', 'Intellect Fortress', 'Protection from Energy', 'Revivify', 'Tiny Servant', 'Water Breathing', 'Water Walk'],
    4: ['Arcane Eye', 'Elemental Bane', 'Fabricate', 'Freedom of Movement', 'Leomund\'s Secret Chest', 'Mordenkainen\'s Faithful Hound', 'Mordenkainen\'s Private Sanctum', 'Otiluke\'s Resilient Sphere', 'Stone Shape', 'Stoneskin'],
    5: ['Animate Objects', 'Bigby\'s Hand', 'Creation', 'Greater Restoration', 'Skill Empowerment', 'Transmute Rock', 'Wall of Stone'],
  },
}

/** Get available spells for a class at a given max spell level (0 = cantrips only) */
export function getAvailableSpells(className: string, maxLevel: number): Record<number, string[]> {
  const classSpells = CLASS_SPELLS[className]
  if (!classSpells) return {}
  const result: Record<number, string[]> = {}
  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    if (classSpells[lvl]) result[lvl] = classSpells[lvl]
  }
  return result
}

/** Get cantrips for a class */
export function getCantrips(className: string): string[] {
  return CLASS_SPELLS[className]?.[0] ?? []
}

/** Get all spell names for a class at a specific spell level */
export function getSpellsAtLevel(className: string, spellLevel: number): string[] {
  return CLASS_SPELLS[className]?.[spellLevel] ?? []
}

/** Check if a spell is available to a class */
export function isSpellAvailable(spellName: string, className: string): boolean {
  const classSpells = CLASS_SPELLS[className]
  if (!classSpells) return false
  return Object.values(classSpells).some(spells => spells.includes(spellName))
}

/** Get a deduplicated, sorted list of ALL cantrips from every class */
export function getAllCantrips(): string[] {
  const set = new Set<string>()
  for (const classSpells of Object.values(CLASS_SPELLS)) {
    for (const name of classSpells[0] ?? []) set.add(name)
  }
  return Array.from(set).sort()
}

/** Get ALL spells from every class at a specific spell level (deduplicated, sorted) */
export function getAllSpellsAtLevel(spellLevel: number): string[] {
  const set = new Set<string>()
  for (const classSpells of Object.values(CLASS_SPELLS)) {
    for (const name of classSpells[spellLevel] ?? []) set.add(name)
  }
  return Array.from(set).sort()
}
