/**
 * D&D 5e Eldritch Invocations — complete catalog
 * Used by Character Forge for Warlock invocation selection
 */

export interface InvocationData {
  name: string
  desc: string
  prerequisite?: string          // readable prerequisite text
  minLevel?: number              // minimum warlock level
  pactRequired?: 'chain' | 'blade' | 'tome' | 'talisman'
  spellRequired?: string         // e.g. 'Eldritch Blast'
  spellGranted?: string          // spell granted at will or 1/day
  atWill?: boolean               // can cast the granted spell at will
}

export const INVOCATIONS: InvocationData[] = [
  // No prerequisites
  { name: 'Agonizing Blast', desc: 'Add CHA modifier to Eldritch Blast damage.', spellRequired: 'Eldritch Blast' },
  { name: 'Armor of Shadows', desc: 'Cast Mage Armor on yourself at will, without a spell slot.', spellGranted: 'Mage Armor', atWill: true },
  { name: 'Beast Speech', desc: 'Cast Speak with Animals at will, without a spell slot.', spellGranted: 'Speak with Animals', atWill: true },
  { name: 'Beguiling Influence', desc: 'Gain proficiency in Deception and Persuasion.' },
  { name: 'Devil\'s Sight', desc: 'See normally in darkness (magical and nonmagical) to 120 ft.' },
  { name: 'Eldritch Mind', desc: 'Advantage on Constitution saving throws to maintain concentration.' },
  { name: 'Eldritch Sight', desc: 'Cast Detect Magic at will, without a spell slot.', spellGranted: 'Detect Magic', atWill: true },
  { name: 'Eldritch Spear', desc: 'Eldritch Blast range becomes 300 ft.', spellRequired: 'Eldritch Blast' },
  { name: 'Eyes of the Rune Keeper', desc: 'Read all writing.' },
  { name: 'Fiendish Vigor', desc: 'Cast False Life on yourself at will as a 1st-level spell.', spellGranted: 'False Life', atWill: true },
  { name: 'Gaze of Two Minds', desc: 'Use action to touch a willing humanoid and perceive through their senses.' },
  { name: 'Grasp of Hadar', desc: 'Once per turn when Eldritch Blast hits, pull creature 10 ft closer.', spellRequired: 'Eldritch Blast' },
  { name: 'Lance of Lethargy', desc: 'Once per turn when Eldritch Blast hits, reduce speed by 10 ft until end of your next turn.', spellRequired: 'Eldritch Blast' },
  { name: 'Mask of Many Faces', desc: 'Cast Disguise Self at will, without a spell slot.', spellGranted: 'Disguise Self', atWill: true },
  { name: 'Misty Visions', desc: 'Cast Silent Image at will, without a spell slot.', spellGranted: 'Silent Image', atWill: true },
  { name: 'Repelling Blast', desc: 'When Eldritch Blast hits, push creature 10 ft away.', spellRequired: 'Eldritch Blast' },
  { name: 'Thief of Five Fates', desc: 'Cast Bane once using a warlock spell slot. Regain after long rest.', spellGranted: 'Bane' },

  // Level 5+
  { name: 'Mire the Mind', desc: 'Cast Slow once using a warlock spell slot.', minLevel: 5, spellGranted: 'Slow' },
  { name: 'One with Shadows', desc: 'In dim light or darkness, use action to become invisible until you move or act.', minLevel: 5 },
  { name: 'Sign of Ill Omen', desc: 'Cast Bestow Curse once using a warlock spell slot.', minLevel: 5, spellGranted: 'Bestow Curse' },
  { name: 'Tomb of Levistus', desc: 'As a reaction when you take damage, gain 10 temp HP per warlock level. Encased in ice until end of your next turn.', minLevel: 5 },
  { name: 'Undying Servitude', desc: 'Cast Animate Dead once without a spell slot. Regain after long rest.', minLevel: 5, spellGranted: 'Animate Dead' },

  // Level 7+
  { name: 'Bewitching Whispers', desc: 'Cast Compulsion once using a warlock spell slot.', minLevel: 7, spellGranted: 'Compulsion' },
  { name: 'Dreadful Word', desc: 'Cast Confusion once using a warlock spell slot.', minLevel: 7, spellGranted: 'Confusion' },
  { name: 'Ghostly Gaze', desc: 'See through solid objects to 30 ft, gaining darkvision. Lasts 1 minute. 1/short rest.', minLevel: 7 },
  { name: 'Sculptor of Flesh', desc: 'Cast Polymorph once using a warlock spell slot.', minLevel: 7, spellGranted: 'Polymorph' },
  { name: 'Trickster\'s Escape', desc: 'Cast Freedom of Movement once without a spell slot. 1/long rest.', minLevel: 7, spellGranted: 'Freedom of Movement' },
  { name: 'Relentless Hex', desc: 'Teleport up to 30 ft to an unoccupied space adjacent to target cursed by your Hex or warlock feature.', minLevel: 7 },

  // Level 9+
  { name: 'Ascendant Step', desc: 'Cast Levitate on yourself at will, without a spell slot.', minLevel: 9, spellGranted: 'Levitate', atWill: true },
  { name: 'Minions of Chaos', desc: 'Cast Conjure Elemental once using a warlock spell slot.', minLevel: 9, spellGranted: 'Conjure Elemental' },
  { name: 'Otherworldly Leap', desc: 'Cast Jump on yourself at will, without a spell slot.', minLevel: 9, spellGranted: 'Jump', atWill: true },
  { name: 'Whispers of the Grave', desc: 'Cast Speak with Dead at will, without a spell slot.', minLevel: 9, spellGranted: 'Speak with Dead', atWill: true },

  // Level 12+
  { name: 'Lifedrinker', desc: 'Extra necrotic damage equal to CHA modifier with pact weapon attacks.', minLevel: 12, pactRequired: 'blade' },
  { name: 'Bond of the Talisman', desc: 'Talisman bearer can teleport to each other. Uses equal to proficiency bonus per long rest.', minLevel: 12, pactRequired: 'talisman' },

  // Level 15+
  { name: 'Chains of Carceri', desc: 'Cast Hold Monster at will on celestials, fiends, and elementals, without a spell slot.', minLevel: 15, pactRequired: 'chain' },
  { name: 'Master of Myriad Forms', desc: 'Cast Alter Self at will, without a spell slot.', minLevel: 15, spellGranted: 'Alter Self', atWill: true },
  { name: 'Visions of Distant Realms', desc: 'Cast Arcane Eye at will, without a spell slot.', minLevel: 15, spellGranted: 'Arcane Eye', atWill: true },
  { name: 'Witch Sight', desc: 'See the true form of any shapechanger or creature concealed by illusion or transmutation magic within 30 ft.', minLevel: 15 },
  { name: 'Shroud of Shadow', desc: 'Cast Invisibility at will, without a spell slot.', minLevel: 15, spellGranted: 'Invisibility', atWill: true },

  // Pact of the Blade
  { name: 'Improved Pact Weapon', desc: 'Pact weapon can be a shortbow, longbow, light crossbow, or heavy crossbow. +1 to attack and damage. Can use as spellcasting focus.', pactRequired: 'blade' },
  { name: 'Thirsting Blade', desc: 'Attack with pact weapon twice instead of once when you take the Attack action.', minLevel: 5, pactRequired: 'blade' },
  { name: 'Eldritch Smite', desc: 'Once per turn when you hit with pact weapon, expend a spell slot to deal extra 1d8 + 1d8/SL force damage and knock Large or smaller prone.', minLevel: 5, pactRequired: 'blade' },

  // Pact of the Chain
  { name: 'Gift of the Ever-Living Ones', desc: 'While familiar is within 100 ft, maximize any Hit Die you roll to regain HP.', pactRequired: 'chain' },
  { name: 'Investment of the Chain Master', desc: 'Familiar gains flying or swimming speed of 40 ft, attacks use your spell attack bonus, and its save DC equals your spell save DC.', pactRequired: 'chain' },
  { name: 'Voice of the Chain Master', desc: 'Communicate telepathically with familiar and perceive through its senses regardless of distance (same plane).', pactRequired: 'chain' },

  // Pact of the Tome
  { name: 'Aspect of the Moon', desc: 'You don\'t need to sleep and can\'t be forced to sleep. You can take a long rest by doing light activity for 8 hours.', pactRequired: 'tome' },
  { name: 'Book of Ancient Secrets', desc: 'Add two 1st-level ritual spells to Book of Shadows. Can transcribe found ritual spells. Cast these as rituals only.', pactRequired: 'tome' },
  { name: 'Far Scribe', desc: 'Add creatures\' names (up to proficiency bonus) to Book of Shadows. Cast Sending targeting those creatures without a spell slot.', minLevel: 5, pactRequired: 'tome' },
  { name: 'Gift of the Protectors', desc: 'Creatures (up to proficiency bonus) write names in Book of Shadows. When one drops to 0 HP, they instead drop to 1 HP. 1/long rest per creature.', minLevel: 9, pactRequired: 'tome' },

  // Pact of the Talisman
  { name: 'Protection of the Talisman', desc: 'When talisman bearer fails a saving throw, add a d4 to the roll. Uses equal to proficiency bonus per long rest.', minLevel: 7, pactRequired: 'talisman' },
  { name: 'Rebuke of the Talisman', desc: 'When talisman bearer is hit, use reaction to deal psychic damage equal to proficiency bonus and push 10 ft.', pactRequired: 'talisman' },
]

/** Get invocations available at a given level and pact boon */
export function getAvailableInvocations(level: number, pactBoon?: string): InvocationData[] {
  return INVOCATIONS.filter(inv => {
    if (inv.minLevel && level < inv.minLevel) return false
    if (inv.pactRequired && inv.pactRequired !== pactBoon) return false
    return true
  })
}

/** How many invocations known at a given warlock level */
export function getInvocationCount(level: number): number {
  if (level < 2) return 0
  if (level < 5) return 2
  if (level < 7) return 3
  if (level < 9) return 4
  if (level < 12) return 5
  if (level < 15) return 6
  if (level < 18) return 7
  return 8
}

/** Get invocation by name */
export function getInvocation(name: string): InvocationData | undefined {
  return INVOCATIONS.find(i => i.name === name)
}
