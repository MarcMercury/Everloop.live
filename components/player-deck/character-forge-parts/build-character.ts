import type {
  PlayerCharacterInsert, FeatureEntry, FeatEntry, SkillName, SpellEntry,
} from '@/types/player-character'
import {
  abilityModifier, defaultSpellcasting, defaultProficiencies,
} from '@/types/player-character'
import {
  getRaceAbilityBonuses, getClass, getClassFeaturesAtLevel, getSpellSlots, getBackground,
  getAvailableInvocations, getSubclassBonusCantrips, getFightingStyles, MANEUVERS,
  getRacialSpells, lookupSpellDetail, getFeat,
} from '@/lib/data'
import type { ForgeCharacterState } from './types'

/** Assemble the insert payload for a newly forged character from the forge state. */
export function buildCharacterInsert(
  state: ForgeCharacterState,
  derived: { hitDieNum: number; baseAC: number; speed: number },
): Omit<PlayerCharacterInsert, 'user_id'> {
  const {
    name, race, subrace, charClass, subclass, level, background, alignment,
    portraitUrl, campaignName, dmName, finalAbilities,
    personality, ideals, bonds, flaws, backstory, appearance,
    height, weight, age, eyes, hair, skin, faith,
    weapons, armorName, armorAC, shieldEquipped, startingGold, items,
    selectedCantrips, selectedSpells, fightingStyle, pactBoon,
    selectedInvocations, tomeCantrips, selectedManeuvers, selectedSkills, selectedFeats,
  } = state
  const { hitDieNum, baseAC, speed } = derived
  const classData = getClass(charClass)

  const profBonus = level <= 4 ? 2 : level <= 8 ? 3 : level <= 12 ? 4 : level <= 16 ? 5 : 6
  const initBonus = abilityModifier(finalAbilities[1])

  // Auto-populate proficiencies from class + background data
  const profData = defaultProficiencies()
  if (classData) {
    profData.armor_proficiencies = classData.armorProfs
    profData.weapon_proficiencies = classData.weaponProfs
    profData.tool_proficiencies = classData.toolProfs
    profData.saving_throws = classData.savingThrows
  }
  const bgData = getBackground(background)
  if (bgData) {
    // Add background skill proficiencies
    for (const skill of bgData.skillProfs) {
      const key = skill.toLowerCase().replace(/ /g, '_') as SkillName
      profData.skills[key] = 'proficient'
    }
    profData.tool_proficiencies = [...profData.tool_proficiencies, ...bgData.toolProfs]
  }

  // Add chosen class skill proficiencies
  for (const skill of selectedSkills) {
    const key = skill.toLowerCase().replace(/ /g, '_') as SkillName
    profData.skills[key] = 'proficient'
  }

  // Build feats list from chosen feats
  const featList: FeatEntry[] = selectedFeats.map(name => {
    const f = getFeat(name)
    return {
      name,
      source: 'Feat',
      level_acquired: level,
      description: f ? `${f.desc} ${f.effects.join('; ')}` : '',
    }
  })

  // Auto-populate features from class data
  const featureList: FeatureEntry[] = classData
    ? getClassFeaturesAtLevel(charClass, level).map(f => ({
        name: f.name,
        source: charClass,
        description: f.desc,
        uses_max: f.uses,
        uses_remaining: f.uses,
      }))
    : []

  // Add fighting style as a feature
  if (fightingStyle) {
    featureList.push({
      name: `Fighting Style: ${fightingStyle}`,
      source: charClass,
      description: getFightingStyles(charClass).find(fs => fs.name === fightingStyle)?.desc || '',
    })
  }

  // Add pact boon as a feature
  if (pactBoon) {
    featureList.push({
      name: pactBoon,
      source: 'Warlock',
      description: pactBoon === 'Pact of the Tome' ? 'Gain 3 cantrips from any class.' : pactBoon === 'Pact of the Blade' ? 'Conjure a pact weapon.' : pactBoon === 'Pact of the Chain' ? 'Gain an improved familiar.' : 'Gain a talisman that aids ability checks.',
    })
  }

  // Add invocations as features
  for (const invName of selectedInvocations) {
    const inv = getAvailableInvocations(level, pactBoon || undefined).find(i => i.name === invName)
    featureList.push({
      name: `Invocation: ${invName}`,
      source: 'Warlock',
      description: inv?.desc || '',
    })
  }

  // Add maneuvers as features
  for (const manName of selectedManeuvers) {
    const man = MANEUVERS.find(m => m.name === manName)
    featureList.push({
      name: `Maneuver: ${manName}`,
      source: 'Battle Master',
      description: man?.desc || '',
    })
  }

  // Auto-populate spellcasting from class data
  const spellData = defaultSpellcasting()
  if (classData?.spellcasting) {
    spellData.spellcasting_ability = classData.spellcasting.ability
    const slots = getSpellSlots(charClass, level, subclass || undefined)
    if (slots.length > 0) {
      const slotEntries: Record<string, { max: number; used: number }> = {}
      slots.forEach((s, i) => {
        if (s > 0) slotEntries[String(i + 1)] = { max: s, used: 0 }
      })
      spellData.spell_slots = slotEntries
    }

    // Wire selected cantrips
    spellData.cantrips = selectedCantrips.map(name => {
      const d = lookupSpellDetail(name)
      return {
        name,
        school: d?.school || '',
        casting_time: d?.casting_time || '1 action',
        range: d?.range || '',
        components: d?.components || '',
        duration: d?.duration || '',
        description: d?.description || '',
        damage: d?.damage,
      }
    })

    // Add Pact of the Tome bonus cantrips
    if (pactBoon === 'Pact of the Tome') {
      for (const name of tomeCantrips) {
        const d = lookupSpellDetail(name)
        spellData.cantrips.push({
          name,
          school: d?.school || '',
          casting_time: d?.casting_time || '1 action',
          range: d?.range || '',
          components: d?.components || '',
          duration: d?.duration || '',
          description: d?.description || '(Pact of the Tome)',
          damage: d?.damage,
        })
      }
    }

    // Add subclass bonus cantrips
    if (subclass) {
      const bonusCantrips = getSubclassBonusCantrips(charClass, subclass)
      for (const name of bonusCantrips) {
        if (!spellData.cantrips.some(c => c.name === name)) {
          const d = lookupSpellDetail(name)
          spellData.cantrips.push({
            name,
            school: d?.school || '',
            casting_time: d?.casting_time || '1 action',
            range: d?.range || '',
            components: d?.components || '',
            duration: d?.duration || '',
            description: d?.description || `(${subclass} bonus)`,
            damage: d?.damage,
          })
        }
      }
    }

    // Add racial cantrips
    const racialSpellsForCreate = getRacialSpells(race, level)
    for (const rs of racialSpellsForCreate) {
      if (rs.spellLevel === 0) {
        if (!spellData.cantrips.some(c => c.name === rs.spell)) {
          const d = lookupSpellDetail(rs.spell)
          spellData.cantrips.push({
            name: rs.spell,
            school: d?.school || '',
            casting_time: d?.casting_time || '1 action',
            range: d?.range || '',
            components: d?.components || '',
            duration: d?.duration || '',
            description: d?.description || `(${race} racial)`,
            damage: d?.damage,
          })
        }
      }
    }

    // Wire selected spells
    const allSpells: SpellEntry[] = []
    for (const [lvlStr, spellNames] of Object.entries(selectedSpells)) {
      for (const spellName of spellNames) {
        const d = lookupSpellDetail(spellName)
        allSpells.push({
          name: spellName,
          level: parseInt(lvlStr),
          school: d?.school || '',
          casting_time: d?.casting_time || '1 action',
          range: d?.range || '',
          components: d?.components || '',
          duration: d?.duration || '',
          description: d?.description || '',
          prepared: classData.spellcasting.type === 'prepared',
          concentration: d?.concentration ?? false,
          ritual: d?.ritual ?? false,
        })
      }
    }
    spellData.spells_known = allSpells
  }

  // Apply racial ability bonuses
  const racialBonuses = getRaceAbilityBonuses(race, subrace || undefined)
  const adjustedAbilities = [...finalAbilities]
  const abilityMap: Record<string, number> = { strength: 0, dexterity: 1, constitution: 2, intelligence: 3, wisdom: 4, charisma: 5 }
  if (racialBonuses) {
    for (const [key, bonus] of Object.entries(racialBonuses)) {
      if (key in abilityMap && bonus !== undefined) adjustedAbilities[abilityMap[key]] += bonus
    }
  }

  const finalConMod = abilityModifier(adjustedAbilities[2])
  const finalMaxHp = hitDieNum + finalConMod

  return {
    name: name.trim(),
    race,
    subrace: subrace || null,
    class: charClass,
    subclass: subclass || null,
    level,
    experience_points: 0,
    background: background || null,
    alignment,
    portrait_url: portraitUrl || null,
    campaign_name: campaignName || null,
    dm_name: dmName || null,
    is_active: true,
    strength: adjustedAbilities[0],
    dexterity: adjustedAbilities[1],
    constitution: adjustedAbilities[2],
    intelligence: adjustedAbilities[3],
    wisdom: adjustedAbilities[4],
    charisma: adjustedAbilities[5],
    max_hp: finalMaxHp,
    current_hp: finalMaxHp,
    armor_class: baseAC,
    initiative_bonus: initBonus,
    speed,
    hit_dice_total: `${level}d${hitDieNum}`,
    hit_dice_remaining: `${level}d${hitDieNum}`,
    proficiency_bonus: profBonus,
    personality_traits: personality || null,
    ideals: ideals || null,
    bonds: bonds || null,
    flaws: flaws || null,
    backstory: backstory || null,
    appearance: appearance || null,
    height: height || null,
    weight: weight || null,
    age: age || null,
    eyes: eyes || null,
    hair: hair || null,
    skin: skin || null,
    faith: faith || null,
    spellcasting: JSON.parse(JSON.stringify(spellData)),
    proficiencies: JSON.parse(JSON.stringify(profData)),
    features: JSON.parse(JSON.stringify(featureList)),
    feats: JSON.parse(JSON.stringify(featList)),
    inventory: JSON.parse(JSON.stringify({
      weapons,
      armor: armorName ? { name: armorName, base_ac: armorAC, type: 'medium' } : null,
      shield: shieldEquipped,
      items,
      currency: { cp: 0, sp: 0, ep: 0, gp: startingGold, pp: 0 },
      attunement: [],
    })),
    companions: JSON.parse(JSON.stringify([])),
  }
}
