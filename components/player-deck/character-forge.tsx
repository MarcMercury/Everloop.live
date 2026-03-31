'use client'

import { useState, useTransition, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ChevronRight, ChevronLeft, Check, Loader2,
  Swords, Shield, Heart, Sparkles, User,
  BookOpen, Backpack, Scroll, Star, Flame,
  Dices, Plus, Minus, RotateCcw, Zap, Wand2, X
} from 'lucide-react'
import type {
  PlayerCharacterInsert,
  SpellcastingData, ProficiencyData, InventoryData,
  FeatureEntry, WeaponEntry, CompanionEntry
} from '@/types/player-character'
import {
  DND_CLASSES, DND_RACES, DND_ALIGNMENTS, DND_BACKGROUNDS,
  CLASS_COLORS, abilityModifier, formatModifier,
  defaultSpellcasting, defaultProficiencies, defaultInventory
} from '@/types/player-character'
import { createPlayerCharacter } from '@/lib/actions/player-characters'
import {
  getRace, getRaceNames, getRaceAbilityBonuses,
  getClass, getClassNames, getClassFeaturesAtLevel, isSpellcaster,
  getSpellSlots, getMaxSpellLevel,
  getAvailableSpells, getCantrips, getSpellsAtLevel,
  getBackground, getBackgroundNames,
  BACKGROUNDS,
  WEAPONS as DND_WEAPONS, ARMOR as DND_ARMOR,
  EQUIPMENT_PACKS as DND_EQUIPMENT_PACKS,
} from '@/lib/data'
import type { RaceData, ClassData, BackgroundData, WeaponData, ArmorData } from '@/lib/data'

// ── CONSTANTS ──────────────────────────────────────────

const STEPS = [
  { id: 'race', label: 'Race', icon: User, description: 'Choose your origin' },
  { id: 'class', label: 'Class', icon: Swords, description: 'Pick your calling' },
  { id: 'abilities', label: 'Abilities', icon: Dices, description: 'Set your scores' },
  { id: 'description', label: 'Description', icon: BookOpen, description: 'Shape your story' },
  { id: 'equipment', label: 'Equipment', icon: Backpack, description: 'Arm yourself' },
  { id: 'spells', label: 'Spells', icon: Wand2, description: 'Choose your magic' },
  { id: 'review', label: 'Review', icon: Check, description: 'Finalize' },
] as const

type StepId = (typeof STEPS)[number]['id']

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]
const POINT_BUY_MAX = 27
const POINT_COSTS: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 }

const ABILITY_NAMES = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'] as const
const ABILITY_KEYS = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const
const ABILITY_SHORT = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const
const ABILITY_DESCRIPTIONS: Record<string, string> = {
  Strength: 'Physical power, athletics, melee attacks',
  Dexterity: 'Agility, reflexes, ranged attacks, AC',
  Constitution: 'Health, stamina, hit points',
  Intelligence: 'Memory, logic, arcane knowledge',
  Wisdom: 'Perception, intuition, divine magic',
  Charisma: 'Personality, leadership, social magic',
}

type AbilityMethod = 'standard' | 'point-buy' | 'manual'

const RACE_INFO: Record<string, { description: string; traits: string[]; speed: number }> = {
  Human: { description: 'Versatile and ambitious, humans are the most common race.', traits: ['+1 to all ability scores', 'Extra language', 'Extra skill proficiency'], speed: 30 },
  Elf: { description: 'Graceful and long-lived, elves are attuned to magic.', traits: ['+2 Dexterity', 'Darkvision 60ft', 'Fey Ancestry', 'Trance (4hr rest)'], speed: 30 },
  Dwarf: { description: 'Tough and resilient, dwarves are master artisans.', traits: ['+2 Constitution', 'Darkvision 60ft', 'Dwarven Resilience', 'Stonecunning'], speed: 25 },
  Halfling: { description: 'Small but brave, halflings are remarkably lucky.', traits: ['+2 Dexterity', 'Lucky (reroll nat 1)', 'Brave', 'Halfling Nimbleness'], speed: 25 },
  'Half-Elf': { description: 'Combining human ambition with elven grace.', traits: ['+2 Charisma, +1 to two others', 'Darkvision 60ft', 'Fey Ancestry', '2 extra skill proficiencies'], speed: 30 },
  'Half-Orc': { description: 'Fierce warriors with orcish strength and human resolve.', traits: ['+2 Strength, +1 Constitution', 'Darkvision 60ft', 'Relentless Endurance', 'Savage Attacks'], speed: 30 },
  Dragonborn: { description: 'Proud draconic warriors with a breath weapon.', traits: ['+2 Strength, +1 Charisma', 'Breath Weapon', 'Damage Resistance (by ancestry)'], speed: 30 },
  Gnome: { description: 'Tinkerers and illusionists, small but clever.', traits: ['+2 Intelligence', 'Darkvision 60ft', 'Gnome Cunning'], speed: 25 },
  Tiefling: { description: 'Infernally touched with innate magical abilities.', traits: ['+2 Charisma, +1 Intelligence', 'Darkvision 60ft', 'Hellish Resistance', 'Infernal Legacy'], speed: 30 },
  Goliath: { description: "Mountain-born giants with incredible endurance.", traits: ['+2 Strength, +1 Constitution', "Stone's Endurance", 'Powerful Build', 'Mountain Born'], speed: 30 },
  Aasimar: { description: 'Celestial-touched beings with divine power.', traits: ['+2 Charisma', 'Darkvision 60ft', 'Celestial Resistance', 'Healing Hands', 'Light Bearer'], speed: 30 },
  Tabaxi: { description: 'Cat-like wanderers driven by curiosity.', traits: ['+2 Dexterity, +1 Charisma', 'Darkvision 60ft', "Cat's Claws", 'Feline Agility'], speed: 30 },
}

const CLASS_INFO: Record<string, { description: string; hitDie: string; primaryAbility: string; saves: string; features: string[] }> = {
  Fighter: { description: 'Masters of martial combat and tactical warfare.', hitDie: 'd10', primaryAbility: 'Strength or Dexterity', saves: 'STR, CON', features: ['Fighting Style', 'Second Wind', 'Action Surge (Lv2)'] },
  Wizard: { description: 'Scholarly mages who bend reality through study.', hitDie: 'd6', primaryAbility: 'Intelligence', saves: 'INT, WIS', features: ['Spellcasting', 'Arcane Recovery', 'Arcane Tradition (Lv2)'] },
  Rogue: { description: 'Cunning tricksters and deadly assassins.', hitDie: 'd8', primaryAbility: 'Dexterity', saves: 'DEX, INT', features: ['Sneak Attack', 'Thieves\' Cant', 'Cunning Action (Lv2)'] },
  Cleric: { description: 'Divine servants who channel the power of their gods.', hitDie: 'd8', primaryAbility: 'Wisdom', saves: 'WIS, CHA', features: ['Spellcasting', 'Divine Domain', 'Channel Divinity (Lv2)'] },
  Ranger: { description: 'Wilderness warriors who hunt dangerous foes.', hitDie: 'd10', primaryAbility: 'Dexterity & Wisdom', saves: 'STR, DEX', features: ['Favored Enemy', 'Natural Explorer', 'Spellcasting (Lv2)'] },
  Paladin: { description: 'Holy warriors bound by sacred oaths.', hitDie: 'd10', primaryAbility: 'Strength & Charisma', saves: 'WIS, CHA', features: ['Divine Sense', 'Lay on Hands', 'Spellcasting (Lv2)'] },
  Barbarian: { description: 'Fierce warriors fueled by primal rage.', hitDie: 'd12', primaryAbility: 'Strength', saves: 'STR, CON', features: ['Rage', 'Unarmored Defense', 'Reckless Attack (Lv2)'] },
  Bard: { description: 'Charismatic performers wielding magic through art.', hitDie: 'd8', primaryAbility: 'Charisma', saves: 'DEX, CHA', features: ['Spellcasting', 'Bardic Inspiration', 'Jack of All Trades (Lv2)'] },
  Sorcerer: { description: 'Innate spellcasters with raw magical power.', hitDie: 'd6', primaryAbility: 'Charisma', saves: 'CON, CHA', features: ['Spellcasting', 'Sorcerous Origin', 'Font of Magic (Lv2)'] },
  Warlock: { description: 'Seekers of forbidden knowledge through pacts.', hitDie: 'd8', primaryAbility: 'Charisma', saves: 'WIS, CHA', features: ['Pact Magic', 'Eldritch Invocations (Lv2)', 'Pact Boon (Lv3)'] },
  Druid: { description: 'Nature guardians who channel primal magic.', hitDie: 'd8', primaryAbility: 'Wisdom', saves: 'INT, WIS', features: ['Spellcasting', 'Druidic', 'Wild Shape (Lv2)'] },
  Monk: { description: 'Martial artists who harness ki energy.', hitDie: 'd8', primaryAbility: 'Dexterity & Wisdom', saves: 'STR, DEX', features: ['Unarmored Defense', 'Martial Arts', 'Ki (Lv2)'] },
  Artificer: { description: 'Magical inventors who infuse objects with power.', hitDie: 'd8', primaryAbility: 'Intelligence', saves: 'CON, INT', features: ['Magical Tinkering', 'Spellcasting', 'Infuse Item (Lv2)'] },
}

const HIT_DIE_MAP: Record<string, number> = {
  'd6': 6, 'd8': 8, 'd10': 10, 'd12': 12,
}

// ── MAIN COMPONENT ─────────────────────────────────────

export function CharacterForge() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(0)
  const currentStep = STEPS[step]

  // ── Character State ──
  const [name, setName] = useState('')
  const [race, setRace] = useState('Human')
  const [subrace, setSubrace] = useState('')
  const [charClass, setCharClass] = useState('Fighter')
  const [subclass, setSubclass] = useState('')
  const [level, setLevel] = useState(1)
  const [background, setBackground] = useState('')
  const [alignment, setAlignment] = useState('True Neutral')
  const [portraitUrl, setPortraitUrl] = useState('')
  const [campaignName, setCampaignName] = useState('')
  const [dmName, setDmName] = useState('')

  // Ability scores
  const [abilityMethod, setAbilityMethod] = useState<AbilityMethod>('standard')
  const [abilities, setAbilities] = useState<number[]>([15, 14, 13, 12, 10, 8])
  const [standardAssignment, setStandardAssignment] = useState<(number | null)[]>([null, null, null, null, null, null])

  // Description
  const [personality, setPersonality] = useState('')
  const [ideals, setIdeals] = useState('')
  const [bonds, setBonds] = useState('')
  const [flaws, setFlaws] = useState('')
  const [backstory, setBackstory] = useState('')
  const [appearance, setAppearance] = useState('')

  // Equipment
  const [weapons, setWeapons] = useState<WeaponEntry[]>([])
  const [armorName, setArmorName] = useState('')
  const [armorAC, setArmorAC] = useState(10)
  const [shieldEquipped, setShieldEquipped] = useState(false)
  const [startingGold, setStartingGold] = useState(0)
  const [items, setItems] = useState<{ name: string; quantity: number }[]>([])

  // Spells
  const [selectedCantrips, setSelectedCantrips] = useState<string[]>([])
  const [selectedSpells, setSelectedSpells] = useState<Record<number, string[]>>({}) // level → spell names

  // ── Derived Values ──
  const classInfo = CLASS_INFO[charClass]
  const raceInfo = RACE_INFO[race]
  const classData = getClass(charClass)
  const raceData = getRace(race)
  const hitDieNum = classData?.hitDie || (classInfo ? HIT_DIE_MAP[classInfo.hitDie] || 10 : 10)
  const speed = raceData?.speed || raceInfo?.speed || 30

  const finalAbilities = useMemo(() => {
    if (abilityMethod === 'standard') {
      return standardAssignment.map(v => v ?? 10)
    }
    return abilities
  }, [abilityMethod, abilities, standardAssignment])

  const conMod = abilityModifier(finalAbilities[2])
  const dexMod = abilityModifier(finalAbilities[1])
  const maxHp = hitDieNum + conMod
  const baseAC = shieldEquipped ? (armorAC || 10 + dexMod) + 2 : (armorAC || 10 + dexMod)

  const pointBuyTotal = useMemo(() => {
    if (abilityMethod !== 'point-buy') return 0
    return abilities.reduce((sum, score) => sum + (POINT_COSTS[score] ?? 0), 0)
  }, [abilityMethod, abilities])

  const progress = ((step + 1) / STEPS.length) * 100

  // ── Validation ──
  const canProceed = useMemo(() => {
    switch (currentStep.id) {
      case 'race': return !!race
      case 'class': return !!charClass
      case 'abilities': {
        if (abilityMethod === 'standard') {
          const used = standardAssignment.filter(v => v !== null)
          return used.length === 6 && new Set(used).size === 6
        }
        if (abilityMethod === 'point-buy') return pointBuyTotal <= POINT_BUY_MAX
        return true
      }
      case 'description': return !!name.trim()
      case 'equipment': return true
      case 'spells': return true
      case 'review': return !!name.trim() && !!race && !!charClass
      default: return true
    }
  }, [currentStep.id, race, charClass, abilityMethod, standardAssignment, pointBuyTotal, name])

  // ── Handlers ──
  function nextStep() { if (step < STEPS.length - 1 && canProceed) setStep(step + 1) }
  function prevStep() { if (step > 0) setStep(step - 1) }
  function goToStep(i: number) { if (i <= step) setStep(i) }

  function setAbilityScore(index: number, value: number) {
    setAbilities(prev => {
      const next = [...prev]
      next[index] = Math.max(3, Math.min(20, value))
      return next
    })
  }

  function assignStandardScore(abilityIndex: number, score: number | null) {
    setStandardAssignment(prev => {
      const next = [...prev]
      // Clear this score from any other ability
      if (score !== null) {
        for (let i = 0; i < next.length; i++) {
          if (next[i] === score) next[i] = null
        }
      }
      next[abilityIndex] = score
      return next
    })
  }

  function handleCreate() {
    if (!canProceed || isPending) return

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
        const key = skill.toLowerCase().replace(/ /g, '_') as import('@/types/player-character').SkillName
        profData.skills[key] = 'proficient'
      }
      profData.tool_proficiencies = [...profData.tool_proficiencies, ...bgData.toolProfs]
    }

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
      spellData.cantrips = selectedCantrips.map(name => ({
        name,
        school: '',
        casting_time: '1 action',
        range: '',
        components: '',
        duration: '',
        description: '',
      }))

      // Wire selected spells
      const allSpells: import('@/types/player-character').SpellEntry[] = []
      for (const [lvlStr, spellNames] of Object.entries(selectedSpells)) {
        for (const spellName of spellNames) {
          allSpells.push({
            name: spellName,
            level: parseInt(lvlStr),
            school: '',
            casting_time: '1 action',
            range: '',
            components: '',
            duration: '',
            description: '',
            prepared: classData.spellcasting.type === 'prepared',
            concentration: false,
            ritual: false,
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

    const data: Omit<PlayerCharacterInsert, 'user_id'> = {
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
      spellcasting: JSON.parse(JSON.stringify(spellData)),
      proficiencies: JSON.parse(JSON.stringify(profData)),
      features: JSON.parse(JSON.stringify(featureList)),
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

    startTransition(async () => {
      const result = await createPlayerCharacter(data)
      if (result.success && result.character) {
        router.push(`/player-deck/${result.character.id}`)
      }
    })
  }

  return (
    <div className="min-h-screen pb-24">
      {/* ── Progress Bar ── */}
      <div className="sticky top-0 z-30 bg-charcoal/95 backdrop-blur-sm border-b border-gold-500/10 py-3 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-serif text-gold-500">
              Character Forge
            </h2>
            <span className="text-xs text-parchment-muted">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />

          {/* Step indicators */}
          <div className="flex items-center justify-between mt-3 overflow-x-auto gap-1">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const isActive = i === step
              const isCompleted = i < step
              const isClickable = i <= step
              return (
                <button
                  key={s.id}
                  onClick={() => goToStep(i)}
                  disabled={!isClickable}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gold-500/20 text-gold-500 font-medium'
                      : isCompleted
                      ? 'text-emerald-400 cursor-pointer hover:bg-emerald-500/10'
                      : 'text-parchment-muted/40 cursor-default'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Step Content ── */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-serif text-parchment">
            {currentStep.description}
          </h1>
          <p className="text-sm text-parchment-muted mt-1">
            {stepSubtitle(currentStep.id)}
          </p>
        </div>

        {currentStep.id === 'race' && (
          <StepRace
            race={race}
            setRace={setRace}
            subrace={subrace}
            setSubrace={setSubrace}
          />
        )}
        {currentStep.id === 'class' && (
          <StepClass
            charClass={charClass}
            setCharClass={setCharClass}
            subclass={subclass}
            setSubclass={setSubclass}
            level={level}
            setLevel={setLevel}
          />
        )}
        {currentStep.id === 'abilities' && (
          <StepAbilities
            method={abilityMethod}
            setMethod={setAbilityMethod}
            abilities={abilities}
            setAbilityScore={setAbilityScore}
            standardAssignment={standardAssignment}
            assignStandardScore={assignStandardScore}
            pointBuyTotal={pointBuyTotal}
          />
        )}
        {currentStep.id === 'description' && (
          <StepDescription
            name={name} setName={setName}
            background={background} setBackground={setBackground}
            alignment={alignment} setAlignment={setAlignment}
            portraitUrl={portraitUrl} setPortraitUrl={setPortraitUrl}
            personality={personality} setPersonality={setPersonality}
            ideals={ideals} setIdeals={setIdeals}
            bonds={bonds} setBonds={setBonds}
            flaws={flaws} setFlaws={setFlaws}
            backstory={backstory} setBackstory={setBackstory}
            appearance={appearance} setAppearance={setAppearance}
            campaignName={campaignName} setCampaignName={setCampaignName}
            dmName={dmName} setDmName={setDmName}
          />
        )}
        {currentStep.id === 'equipment' && (
          <StepEquipment
            weapons={weapons} setWeapons={setWeapons}
            armorName={armorName} setArmorName={setArmorName}
            armorAC={armorAC} setArmorAC={setArmorAC}
            shieldEquipped={shieldEquipped} setShieldEquipped={setShieldEquipped}
            startingGold={startingGold} setStartingGold={setStartingGold}
            items={items} setItems={setItems}
            charClass={charClass}
          />
        )}
        {currentStep.id === 'spells' && (
          <StepSpells
            charClass={charClass}
            level={level}
            selectedCantrips={selectedCantrips}
            setSelectedCantrips={setSelectedCantrips}
            selectedSpells={selectedSpells}
            setSelectedSpells={setSelectedSpells}
          />
        )}
        {currentStep.id === 'review' && (
          <StepReview
            name={name} race={race} subrace={subrace}
            charClass={charClass} subclass={subclass} level={level}
            abilities={finalAbilities}
            background={background} alignment={alignment}
            maxHp={maxHp} baseAC={baseAC} speed={speed}
            classInfo={classInfo}
            weapons={weapons}
            portraitUrl={portraitUrl}
          />
        )}
      </div>

      {/* ── Bottom Navigation ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-charcoal/95 backdrop-blur-sm border-t border-gold-500/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 0}
            className="text-parchment-muted hover:text-parchment gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="text-xs text-parchment-muted hidden sm:block">
            {name ? (
              <span className="text-parchment font-serif">{name}</span>
            ) : (
              'Unnamed Adventurer'
            )}
            {race && charClass ? ` — ${race} ${charClass}` : ''}
          </div>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed}
              className="btn-fantasy gap-1"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={!canProceed || isPending}
              className="btn-fantasy gap-2"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Flame className="w-4 h-4" />
              )}
              Forge Character
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── STEP HELPERS ───────────────────────────────────────

function stepSubtitle(id: StepId): string {
  switch (id) {
    case 'race': return 'Your race defines your origin, innate traits, and base abilities.'
    case 'class': return 'Your class determines your combat style, skills, and progression.'
    case 'abilities': return 'Ability scores shape everything your character can do.'
    case 'description': return 'Name your character and define their personality and story.'
    case 'equipment': return 'Choose your starting weapons, armor, and gear.'
    case 'spells': return 'Select your cantrips and spells from your class list.'
    case 'review': return 'Review your character before forging them into existence.'
    default: return ''
  }
}

// ── STEP: RACE ─────────────────────────────────────────

function StepRace({
  race, setRace, subrace, setSubrace,
}: {
  race: string; setRace: (v: string) => void
  subrace: string; setSubrace: (v: string) => void
}) {
  const raceData = getRace(race)
  const raceInfo = RACE_INFO[race]
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Race selection grid */}
      <div className="space-y-4 md:col-span-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {DND_RACES.map(r => {
            const rd = getRace(r)
            const info = RACE_INFO[r]
            const isSelected = race === r
            const displayTrait = rd ? `+${Object.entries(rd.abilityBonuses).map(([k,v]) => `${v} ${k.slice(0,3).toUpperCase()}`).join(', ')}` : info?.traits[0]
            return (
              <button
                key={r}
                onClick={() => { setRace(r); setSubrace('') }}
                className={`text-left p-3 rounded-lg border transition-all touch-target-lg ${
                  isSelected
                    ? 'border-gold-500/50 bg-gold-500/10 shadow-lg shadow-gold-500/5'
                    : 'border-gold-500/10 bg-teal-rich/50 hover:border-gold-500/25 hover:bg-teal-rich'
                }`}
              >
                <div className={`text-sm font-serif ${isSelected ? 'text-gold-500' : 'text-parchment'}`}>
                  {r}
                </div>
                {displayTrait && (
                  <div className="text-[10px] text-parchment-muted mt-0.5 line-clamp-2">
                    {displayTrait}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Race Info Panel */}
      {(raceData || raceInfo) && (
        <Card className="md:col-span-2 p-5 bg-teal-rich/60 border-gold-500/15">
          <h3 className="font-serif text-lg text-parchment mb-2">{race}</h3>
          <p className="text-sm text-parchment-muted mb-4">{raceData?.desc || raceInfo?.description}</p>
          <div className="space-y-2">
            <h4 className="text-xs text-gold-500 uppercase tracking-wider font-medium">Racial Traits</h4>
            <div className="flex flex-wrap gap-2">
              {raceData ? (
                <>
                  {Object.entries(raceData.abilityBonuses).map(([key, val]) => (
                    <Badge key={key} variant="outline" className="border-emerald-500/30 text-emerald-400">
                      +{val} {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Badge>
                  ))}
                  {raceData.traits.map((trait, i) => (
                    <Badge key={i} variant="outline" className="border-gold-500/20 text-parchment-muted" title={trait.desc}>
                      {trait.name}
                    </Badge>
                  ))}
                </>
              ) : raceInfo?.traits.map((trait, i) => (
                <Badge key={i} variant="outline" className="border-gold-500/20 text-parchment-muted">
                  {trait}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-parchment-muted">
              <span>Speed: <strong className="text-parchment">{raceData?.speed || raceInfo?.speed || 30} ft</strong></span>
              <span>Size: <strong className="text-parchment">{raceData?.size || 'Medium'}</strong></span>
              {raceData && raceData.darkvision > 0 && (
                <span>Darkvision: <strong className="text-parchment">{raceData.darkvision} ft</strong></span>
              )}
            </div>
          </div>

          {/* Subrace dropdown or input */}
          <div className="mt-4 pt-4 border-t border-gold-500/10">
            <Label className="text-parchment-muted text-xs">Subrace</Label>
            {raceData?.subraces && raceData.subraces.length > 0 ? (
              <select
                value={subrace}
                onChange={e => setSubrace(e.target.value)}
                className="w-full h-10 mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm px-3"
              >
                <option value="">None</option>
                {raceData.subraces.map(sr => (
                  <option key={sr.name} value={sr.name}>{sr.name}</option>
                ))}
              </select>
            ) : (
              <Input
                value={subrace}
                onChange={e => setSubrace(e.target.value)}
                placeholder="e.g. High Elf, Hill Dwarf, Lightfoot..."
                className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
              />
            )}
            {subrace && raceData?.subraces?.find(sr => sr.name === subrace) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(raceData.subraces.find(sr => sr.name === subrace)!.abilityBonuses).map(([key, val]) => (
                  <Badge key={key} variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
                    +{val} {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Badge>
                ))}
                {raceData.subraces.find(sr => sr.name === subrace)!.traits.map((t, i) => (
                  <Badge key={i} variant="outline" className="border-gold-500/20 text-parchment-muted text-[10px]" title={t.desc}>
                    {t.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

// ── STEP: CLASS ────────────────────────────────────────

function StepClass({
  charClass, setCharClass, subclass, setSubclass, level, setLevel,
}: {
  charClass: string; setCharClass: (v: string) => void
  subclass: string; setSubclass: (v: string) => void
  level: number; setLevel: (v: number) => void
}) {
  const cd = getClass(charClass)
  return (
    <div className="space-y-6">
      {/* Class grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {DND_CLASSES.map(c => {
          const info = CLASS_INFO[c]
          const cData = getClass(c)
          const color = CLASS_COLORS[c] || '#d4a84b'
          const isSelected = charClass === c
          return (
            <button
              key={c}
              onClick={() => { setCharClass(c); setSubclass('') }}
              className={`text-left p-3 rounded-lg border transition-all touch-target-lg ${
                isSelected
                  ? 'border-gold-500/50 bg-gold-500/10 shadow-lg shadow-gold-500/5'
                  : 'border-gold-500/10 bg-teal-rich/50 hover:border-gold-500/25 hover:bg-teal-rich'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className={`text-sm font-serif ${isSelected ? 'text-gold-500' : 'text-parchment'}`}>
                  {c}
                </span>
              </div>
              <div className="text-[10px] text-parchment-muted mt-0.5">
                Hit Die: d{cData?.hitDie || info?.hitDie || '?'} | {cData?.primaryAbility || info?.primaryAbility || '?'}
              </div>
            </button>
          )
        })}
      </div>

      {/* Class Info Panel */}
      {(cd || CLASS_INFO[charClass]) && (
        <Card className="p-5 bg-teal-rich/60 border-gold-500/15">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-lg text-parchment">{charClass}</h3>
              <p className="text-sm text-parchment-muted mt-1">{cd?.desc || CLASS_INFO[charClass]?.description}</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: `${CLASS_COLORS[charClass]}20`, color: CLASS_COLORS[charClass] }}
            >
              d{cd?.hitDie || '?'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <span className="text-xs text-gold-500 uppercase tracking-wider">Primary Ability</span>
              <p className="text-sm text-parchment mt-0.5">{cd?.primaryAbility || CLASS_INFO[charClass]?.primaryAbility}</p>
            </div>
            <div>
              <span className="text-xs text-gold-500 uppercase tracking-wider">Saving Throws</span>
              <p className="text-sm text-parchment mt-0.5">{cd?.savingThrows.join(', ') || CLASS_INFO[charClass]?.saves}</p>
            </div>
          </div>

          {/* Proficiencies */}
          {cd && (
            <div className="mt-4">
              <span className="text-xs text-gold-500 uppercase tracking-wider">Proficiencies</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {cd.armorProfs.map(p => (
                  <Badge key={p} variant="outline" className="border-blue-500/20 text-blue-300 text-[10px]">{p} Armor</Badge>
                ))}
                {cd.weaponProfs.map(p => (
                  <Badge key={p} variant="outline" className="border-red-500/20 text-red-300 text-[10px]">{p} Weapons</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <span className="text-xs text-gold-500 uppercase tracking-wider">Key Features</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {cd ? (
                getClassFeaturesAtLevel(charClass, Math.max(level, 3)).slice(0, 5).map((f, i) => (
                  <Badge key={i} variant="outline" className="border-gold-500/20 text-parchment-muted" title={f.desc}>
                    {f.name} {f.level > 1 ? `(Lv${f.level})` : ''}
                  </Badge>
                ))
              ) : CLASS_INFO[charClass]?.features.map((f, i) => (
                <Badge key={i} variant="outline" className="border-gold-500/20 text-parchment-muted">
                  {f}
                </Badge>
              ))}
            </div>
          </div>

          {/* Spellcasting badge */}
          {cd?.spellcasting && (
            <div className="mt-3 flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Sparkles className="w-3 h-3 mr-1" /> Spellcaster — {cd.spellcasting.ability.charAt(0).toUpperCase() + cd.spellcasting.ability.slice(1)}
              </Badge>
              <span className="text-[10px] text-parchment-muted">
                {cd.spellcasting.type === 'prepared' ? 'Prepares spells daily' : cd.spellcasting.type === 'known' ? 'Learns fixed spells' : 'Pact Magic'}
              </span>
            </div>
          )}

          {/* Subclass + Level */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gold-500/10">
            <div>
              <Label className="text-parchment-muted text-xs">{cd?.subclassName || 'Subclass'} {cd ? `(at Lv${cd.subclassLevel})` : ''}</Label>
              {cd && cd.subclasses.length > 0 ? (
                <select
                  value={subclass}
                  onChange={e => setSubclass(e.target.value)}
                  className="w-full h-10 mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm px-3"
                >
                  <option value="">Select {cd.subclassName}...</option>
                  {cd.subclasses.map(sc => (
                    <option key={sc.name} value={sc.name}>{sc.name}</option>
                  ))}
                </select>
              ) : (
                <Input
                  value={subclass}
                  onChange={e => setSubclass(e.target.value)}
                  placeholder="e.g. Battle Master, Evocation..."
                  className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
                />
              )}
              {subclass && cd?.subclasses.find(sc => sc.name === subclass) && (
                <p className="text-[10px] text-parchment-muted mt-1">
                  {cd.subclasses.find(sc => sc.name === subclass)!.desc}
                </p>
              )}
            </div>
            <div>
              <Label className="text-parchment-muted text-xs">Starting Level</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setLevel(Math.max(1, level - 1))}
                  className="text-parchment-muted h-9 w-9 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number" min={1} max={20}
                  value={level}
                  onChange={e => setLevel(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                  className="bg-charcoal-950 border-gold-500/10 text-parchment text-center w-16"
                />
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setLevel(Math.min(20, level + 1))}
                  className="text-parchment-muted h-9 w-9 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// ── STEP: ABILITIES ────────────────────────────────────

function StepAbilities({
  method, setMethod, abilities, setAbilityScore,
  standardAssignment, assignStandardScore, pointBuyTotal,
}: {
  method: AbilityMethod; setMethod: (v: AbilityMethod) => void
  abilities: number[]; setAbilityScore: (i: number, v: number) => void
  standardAssignment: (number | null)[]; assignStandardScore: (i: number, v: number | null) => void
  pointBuyTotal: number
}) {
  const usedStandard = new Set(standardAssignment.filter(v => v !== null))

  return (
    <div className="space-y-6">
      {/* Method Selection */}
      <div className="flex flex-wrap gap-3">
        {[
          { id: 'standard' as const, label: 'Standard Array', desc: '15, 14, 13, 12, 10, 8' },
          { id: 'point-buy' as const, label: 'Point Buy', desc: '27 points to spend' },
          { id: 'manual' as const, label: 'Manual Entry', desc: 'Type your scores' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`flex-1 min-w-[140px] p-3 rounded-lg border transition-all text-left touch-target-lg ${
              method === m.id
                ? 'border-gold-500/50 bg-gold-500/10'
                : 'border-gold-500/10 bg-teal-rich/50 hover:border-gold-500/25'
            }`}
          >
            <div className={`text-sm font-medium ${method === m.id ? 'text-gold-500' : 'text-parchment'}`}>
              {m.label}
            </div>
            <div className="text-[10px] text-parchment-muted">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* Point Buy Budget */}
      {method === 'point-buy' && (
        <Card className="p-3 bg-teal-rich/60 border-gold-500/15 flex items-center justify-between">
          <span className="text-sm text-parchment-muted">Points spent:</span>
          <span className={`text-lg font-mono font-bold ${pointBuyTotal > POINT_BUY_MAX ? 'text-red-400' : 'text-gold-500'}`}>
            {pointBuyTotal} / {POINT_BUY_MAX}
          </span>
        </Card>
      )}

      {/* Ability Score Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ABILITY_NAMES.map((name, i) => (
          <Card
            key={name}
            className="p-4 bg-teal-rich/60 border-gold-500/15 text-center"
          >
            <div className="text-xs text-gold-500 uppercase tracking-wider font-medium mb-1">
              {ABILITY_SHORT[i]}
            </div>
            <div className="text-[10px] text-parchment-muted mb-3">
              {ABILITY_DESCRIPTIONS[name]}
            </div>

            {method === 'standard' ? (
              /* Standard Array: dropdown assignment */
              <div>
                <select
                  value={standardAssignment[i] ?? ''}
                  onChange={e => assignStandardScore(i, e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full h-10 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-center text-lg font-mono appearance-none cursor-pointer"
                >
                  <option value="">—</option>
                  {STANDARD_ARRAY.map(score => (
                    <option
                      key={score}
                      value={score}
                      disabled={usedStandard.has(score) && standardAssignment[i] !== score}
                    >
                      {score}
                    </option>
                  ))}
                </select>
                {standardAssignment[i] !== null && (
                  <div className="text-sm text-parchment-muted mt-1 font-mono">
                    Mod: {formatModifier(abilityModifier(standardAssignment[i]!))}
                  </div>
                )}
              </div>
            ) : method === 'point-buy' ? (
              /* Point Buy: +/- buttons */
              <div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setAbilityScore(i, abilities[i] - 1)}
                    disabled={abilities[i] <= 8}
                    className="w-8 h-8 p-0 text-parchment-muted"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-2xl font-mono font-bold text-parchment w-8 text-center">
                    {abilities[i]}
                  </span>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setAbilityScore(i, abilities[i] + 1)}
                    disabled={abilities[i] >= 15}
                    className="w-8 h-8 p-0 text-parchment-muted"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="text-[10px] text-parchment-muted mt-1">
                  Cost: {POINT_COSTS[abilities[i]] ?? '?'} pts
                </div>
                <div className="text-sm text-parchment-muted font-mono">
                  Mod: {formatModifier(abilityModifier(abilities[i]))}
                </div>
              </div>
            ) : (
              /* Manual Entry */
              <div>
                <Input
                  type="number" min={1} max={30}
                  value={abilities[i]}
                  onChange={e => setAbilityScore(i, parseInt(e.target.value) || 10)}
                  className="bg-charcoal-950 border-gold-500/10 text-parchment text-center text-xl font-mono h-12"
                />
                <div className="text-sm text-parchment-muted mt-1 font-mono">
                  Mod: {formatModifier(abilityModifier(abilities[i]))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── STEP: DESCRIPTION ──────────────────────────────────

function StepDescription({
  name, setName, background, setBackground, alignment, setAlignment,
  portraitUrl, setPortraitUrl,
  personality, setPersonality, ideals, setIdeals, bonds, setBonds, flaws, setFlaws,
  backstory, setBackstory, appearance, setAppearance,
  campaignName, setCampaignName, dmName, setDmName,
}: {
  name: string; setName: (v: string) => void
  background: string; setBackground: (v: string) => void
  alignment: string; setAlignment: (v: string) => void
  portraitUrl: string; setPortraitUrl: (v: string) => void
  personality: string; setPersonality: (v: string) => void
  ideals: string; setIdeals: (v: string) => void
  bonds: string; setBonds: (v: string) => void
  flaws: string; setFlaws: (v: string) => void
  backstory: string; setBackstory: (v: string) => void
  appearance: string; setAppearance: (v: string) => void
  campaignName: string; setCampaignName: (v: string) => void
  dmName: string; setDmName: (v: string) => void
}) {
  return (
    <div className="space-y-6">
      {/* Identity */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-4">
        <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
          <User className="w-4 h-4" /> Identity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label className="text-parchment text-sm">Character Name *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="What shall this hero be called?"
              className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment text-lg font-serif"
              autoFocus
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Background</Label>
            <select
              value={background}
              onChange={e => setBackground(e.target.value)}
              className="w-full h-10 mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm px-3"
            >
              <option value="">Select background...</option>
              {DND_BACKGROUNDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            {background && (() => {
              const bg = getBackground(background)
              return bg ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {bg.skillProfs.map(s => (
                    <Badge key={s} variant="outline" className="border-emerald-500/20 text-emerald-400 text-[10px]">{s}</Badge>
                  ))}
                  {bg.toolProfs.map(t => (
                    <Badge key={t} variant="outline" className="border-blue-500/20 text-blue-300 text-[10px]">{t}</Badge>
                  ))}
                  <Badge variant="outline" className="border-gold-500/20 text-gold-500 text-[10px]">{bg.feature}</Badge>
                </div>
              ) : null
            })()}
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Alignment</Label>
            <select
              value={alignment}
              onChange={e => setAlignment(e.target.value)}
              className="w-full h-10 mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm px-3"
            >
              {DND_ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label className="text-parchment-muted text-xs">Portrait URL (optional)</Label>
            <Input
              value={portraitUrl}
              onChange={e => setPortraitUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
            />
          </div>
        </div>
      </Card>

      {/* Personality */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-4">
        <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Personality & Story
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-parchment-muted text-xs">Personality Traits</Label>
            <textarea
              value={personality}
              onChange={e => setPersonality(e.target.value)}
              placeholder="How does your character act?"
              className="w-full mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm p-3 h-20 resize-none"
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Ideals</Label>
            <textarea
              value={ideals}
              onChange={e => setIdeals(e.target.value)}
              placeholder="What drives your character?"
              className="w-full mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm p-3 h-20 resize-none"
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Bonds</Label>
            <textarea
              value={bonds}
              onChange={e => setBonds(e.target.value)}
              placeholder="Who or what matters most?"
              className="w-full mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm p-3 h-20 resize-none"
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Flaws</Label>
            <textarea
              value={flaws}
              onChange={e => setFlaws(e.target.value)}
              placeholder="What's your weakness?"
              className="w-full mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm p-3 h-20 resize-none"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-parchment-muted text-xs">Appearance</Label>
            <textarea
              value={appearance}
              onChange={e => setAppearance(e.target.value)}
              placeholder="Describe your character's appearance..."
              className="w-full mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm p-3 h-20 resize-none"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-parchment-muted text-xs">Backstory</Label>
            <textarea
              value={backstory}
              onChange={e => setBackstory(e.target.value)}
              placeholder="Where did your character come from? What shapes them?"
              className="w-full mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm p-3 h-28 resize-none"
            />
          </div>
        </div>
      </Card>

      {/* Campaign Info */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-4">
        <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
          <Scroll className="w-4 h-4" /> Campaign Info (optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-parchment-muted text-xs">Campaign Name</Label>
            <Input
              value={campaignName}
              onChange={e => setCampaignName(e.target.value)}
              placeholder="e.g. Curse of Strahd"
              className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">DM Name</Label>
            <Input
              value={dmName}
              onChange={e => setDmName(e.target.value)}
              placeholder="Your Dungeon Master"
              className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

// ── STEP: EQUIPMENT ────────────────────────────────────

// Collect all unique item names from equipment packs for the items dropdown
const ALL_GEAR_ITEMS = Array.from(new Set(
  Object.values(DND_EQUIPMENT_PACKS).flatMap(p => p.items)
)).sort().concat([
  'Arcane Focus', 'Component Pouch', 'Druidic Focus', 'Holy Symbol',
  'Spellbook', "Thieves' Tools", 'Healer\'s Kit', 'Poisoner\'s Kit',
  'Herbalism Kit', 'Navigator\'s Tools', 'Disguise Kit', 'Forgery Kit',
  'Gaming Set', 'Musical Instrument', 'Smith\'s Tools', 'Brewer\'s Supplies',
  'Calligrapher\'s Supplies', 'Carpenter\'s Tools', 'Cartographer\'s Tools',
  'Cobbler\'s Tools', 'Cook\'s Utensils', 'Glassblower\'s Tools',
  'Jeweler\'s Tools', 'Leatherworker\'s Tools', 'Mason\'s Tools',
  'Painter\'s Supplies', 'Potter\'s Tools', 'Tinker\'s Tools',
  'Weaver\'s Tools', 'Woodcarver\'s Tools',
  'Arrows (20)', 'Crossbow Bolts (20)', 'Sling Bullets (20)',
  'Blowgun Needles (50)', 'Torch', 'Rope, Hempen (50 ft)',
  'Rope, Silk (50 ft)', 'Chain (10 ft)', 'Grappling Hook',
  'Manacles', 'Mirror, Steel', 'Oil Flask', 'Potion of Healing',
  'Rations (1 day)', 'Waterskin', 'Bedroll', 'Tent',
  'Lamp', 'Lantern, Hooded', 'Lantern, Bullseye', 'Candle',
  'Tinderbox', 'Holy Water', 'Alchemist\'s Fire', 'Acid Vial',
  'Antitoxin', 'Ball Bearings (bag of 1000)', 'Caltrops (bag of 20)',
  'Climber\'s Kit', 'Crowbar', 'Hammer', 'Piton',
  'Shovel', 'Mess Kit', 'Backpack', 'Chest',
  'Quiver', 'Spyglass', 'Signet Ring',
]).sort()

function StepEquipment({
  weapons, setWeapons, armorName, setArmorName, armorAC, setArmorAC,
  shieldEquipped, setShieldEquipped, startingGold, setStartingGold,
  items, setItems, charClass,
}: {
  weapons: WeaponEntry[]; setWeapons: (v: WeaponEntry[]) => void
  armorName: string; setArmorName: (v: string) => void
  armorAC: number; setArmorAC: (v: number) => void
  shieldEquipped: boolean; setShieldEquipped: (v: boolean) => void
  startingGold: number; setStartingGold: (v: number) => void
  items: { name: string; quantity: number }[]; setItems: (v: { name: string; quantity: number }[]) => void
  charClass: string
}) {
  function selectWeapon(weaponName: string) {
    const wpn = DND_WEAPONS.find(w => w.name === weaponName)
    if (!wpn) return
    setWeapons([...weapons, {
      name: wpn.name,
      attack_bonus: 0,
      damage: wpn.damage,
      properties: wpn.properties,
      equipped: true,
    }])
  }
  function removeWeapon(i: number) {
    setWeapons(weapons.filter((_, j) => j !== i))
  }
  function selectArmor(armorNameVal: string) {
    const arm = DND_ARMOR.find(a => a.name === armorNameVal)
    if (!arm) {
      setArmorName('')
      setArmorAC(10)
      return
    }
    setArmorName(arm.name)
    // For numeric AC, use directly; for string formula, extract first number
    if (typeof arm.ac === 'number') {
      setArmorAC(arm.ac)
    } else {
      const match = arm.ac.match(/(\d+)/)
      setArmorAC(match ? parseInt(match[1]) : 10)
    }
  }
  function addItem(itemName: string) {
    if (!itemName) return
    const existing = items.findIndex(it => it.name === itemName)
    if (existing >= 0) {
      const next = [...items]
      next[existing] = { ...next[existing], quantity: next[existing].quantity + 1 }
      setItems(next)
    } else {
      setItems([...items, { name: itemName, quantity: 1 }])
    }
  }
  function removeItem(i: number) {
    setItems(items.filter((_, j) => j !== i))
  }

  // D&D Beyond-style starter packs (unchanged)
  const EQUIPMENT_PACKS: Record<string, {
    label: string; weapons: WeaponEntry[]; armor: string; armorAC: number;
    shield: boolean; gold: number; items: { name: string; quantity: number }[]
  }> = {
    fighter_melee: {
      label: '⚔️ Fighter (Melee)',
      weapons: [
        { name: 'Longsword', attack_bonus: 0, damage: '1d8', properties: ['Versatile (1d10)'], equipped: true },
        { name: 'Handaxe', attack_bonus: 0, damage: '1d6', properties: ['Light', 'Thrown (20/60)'], equipped: true },
      ],
      armor: 'Chain Mail', armorAC: 16, shield: true, gold: 10,
      items: [{ name: 'Explorer\'s Pack', quantity: 1 }, { name: 'Javelin', quantity: 4 }],
    },
    fighter_ranged: {
      label: '🏹 Fighter (Ranged)',
      weapons: [
        { name: 'Longbow', attack_bonus: 0, damage: '1d8', properties: ['Ammunition (150/600)', 'Heavy', 'Two-Handed'], equipped: true },
        { name: 'Shortsword', attack_bonus: 0, damage: '1d6', properties: ['Finesse', 'Light'], equipped: true },
      ],
      armor: 'Leather', armorAC: 11, shield: false, gold: 10,
      items: [{ name: 'Explorer\'s Pack', quantity: 1 }, { name: 'Arrows (20)', quantity: 1 }],
    },
    rogue: {
      label: '🗡️ Rogue',
      weapons: [
        { name: 'Rapier', attack_bonus: 0, damage: '1d8', properties: ['Finesse'], equipped: true },
        { name: 'Shortbow', attack_bonus: 0, damage: '1d6', properties: ['Ammunition (80/320)', 'Two-Handed'], equipped: true },
        { name: 'Dagger', attack_bonus: 0, damage: '1d4', properties: ['Finesse', 'Light', 'Thrown (20/60)'], equipped: true },
      ],
      armor: 'Leather', armorAC: 11, shield: false, gold: 15,
      items: [{ name: 'Burglar\'s Pack', quantity: 1 }, { name: "Thieves' Tools", quantity: 1 }, { name: 'Arrows (20)', quantity: 1 }],
    },
    wizard: {
      label: '🔮 Wizard',
      weapons: [
        { name: 'Quarterstaff', attack_bonus: 0, damage: '1d6', properties: ['Versatile (1d8)'], equipped: true },
      ],
      armor: 'None', armorAC: 10, shield: false, gold: 10,
      items: [{ name: 'Scholar\'s Pack', quantity: 1 }, { name: 'Spellbook', quantity: 1 }, { name: 'Component Pouch', quantity: 1 }, { name: 'Arcane Focus', quantity: 1 }],
    },
    cleric: {
      label: '✝️ Cleric',
      weapons: [
        { name: 'Mace', attack_bonus: 0, damage: '1d6', properties: [], equipped: true },
        { name: 'Light Crossbow', attack_bonus: 0, damage: '1d8', properties: ['Ammunition (80/320)', 'Loading', 'Two-Handed'], equipped: true },
      ],
      armor: 'Scale Mail', armorAC: 14, shield: true, gold: 10,
      items: [{ name: 'Priest\'s Pack', quantity: 1 }, { name: 'Holy Symbol', quantity: 1 }, { name: 'Crossbow Bolts (20)', quantity: 1 }],
    },
    ranger: {
      label: '🌿 Ranger',
      weapons: [
        { name: 'Longbow', attack_bonus: 0, damage: '1d8', properties: ['Ammunition (150/600)', 'Heavy', 'Two-Handed'], equipped: true },
        { name: 'Shortsword', attack_bonus: 0, damage: '1d6', properties: ['Finesse', 'Light'], equipped: true },
        { name: 'Shortsword', attack_bonus: 0, damage: '1d6', properties: ['Finesse', 'Light'], equipped: true },
      ],
      armor: 'Scale Mail', armorAC: 14, shield: false, gold: 10,
      items: [{ name: 'Explorer\'s Pack', quantity: 1 }, { name: 'Arrows (20)', quantity: 1 }],
    },
    barbarian: {
      label: '🪓 Barbarian',
      weapons: [
        { name: 'Greataxe', attack_bonus: 0, damage: '1d12', properties: ['Heavy', 'Two-Handed'], equipped: true },
        { name: 'Javelin', attack_bonus: 0, damage: '1d6', properties: ['Thrown (30/120)'], equipped: true },
      ],
      armor: 'None (Unarmored Defense)', armorAC: 10, shield: false, gold: 10,
      items: [{ name: 'Explorer\'s Pack', quantity: 1 }, { name: 'Javelin', quantity: 4 }],
    },
    bard: {
      label: '🎵 Bard',
      weapons: [
        { name: 'Rapier', attack_bonus: 0, damage: '1d8', properties: ['Finesse'], equipped: true },
        { name: 'Dagger', attack_bonus: 0, damage: '1d4', properties: ['Finesse', 'Light', 'Thrown (20/60)'], equipped: true },
      ],
      armor: 'Leather', armorAC: 11, shield: false, gold: 15,
      items: [{ name: 'Entertainer\'s Pack', quantity: 1 }, { name: 'Musical Instrument', quantity: 1 }],
    },
    paladin: {
      label: '⚜️ Paladin',
      weapons: [
        { name: 'Longsword', attack_bonus: 0, damage: '1d8', properties: ['Versatile (1d10)'], equipped: true },
        { name: 'Javelin', attack_bonus: 0, damage: '1d6', properties: ['Thrown (30/120)'], equipped: true },
      ],
      armor: 'Chain Mail', armorAC: 16, shield: true, gold: 10,
      items: [{ name: 'Priest\'s Pack', quantity: 1 }, { name: 'Holy Symbol', quantity: 1 }, { name: 'Javelin', quantity: 5 }],
    },
  }

  function applyPack(packKey: string) {
    const pack = EQUIPMENT_PACKS[packKey]
    if (!pack) return
    setWeapons(pack.weapons)
    setArmorName(pack.armor)
    setArmorAC(pack.armorAC)
    setShieldEquipped(pack.shield)
    setStartingGold(pack.gold)
    setItems(pack.items)
  }

  const weaponCategories = ['Simple Melee', 'Simple Ranged', 'Martial Melee', 'Martial Ranged'] as const
  const armorTypes = ['Light', 'Medium', 'Heavy'] as const

  return (
    <div className="space-y-6">
      {/* Quick-start equipment packs */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
        <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Quick Start Packs
        </h3>
        <p className="text-xs text-parchment-muted">
          Choose a pack to auto-fill. You can customise everything after.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(EQUIPMENT_PACKS).map(([key, pack]) => (
            <button
              key={key}
              onClick={() => applyPack(key)}
              className="p-3 rounded-lg border border-gold-500/10 bg-charcoal-900/50 hover:border-gold-500/30 hover:bg-gold-500/5 transition-all text-left"
            >
              <span className="text-sm text-parchment">{pack.label}</span>
              <div className="text-[10px] text-parchment-muted mt-0.5">
                {pack.weapons.map(w => w.name).join(', ')}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Weapons — dropdown selector */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
            <Swords className="w-4 h-4" /> Weapons
          </h3>
        </div>
        <div>
          <Label className="text-parchment-muted text-xs">Add Weapon</Label>
          <select
            value=""
            onChange={e => { if (e.target.value) selectWeapon(e.target.value) }}
            className="w-full h-10 mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm px-3"
          >
            <option value="">Select a weapon...</option>
            {weaponCategories.map(cat => (
              <optgroup key={cat} label={cat}>
                {DND_WEAPONS.filter(w => w.category === cat).map(w => (
                  <option key={w.name} value={w.name}>
                    {w.name} — {w.damage} {w.damageType} ({w.cost})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {weapons.length === 0 && (
          <p className="text-sm text-parchment-muted italic">No weapons added. Select from the dropdown above.</p>
        )}
        {weapons.map((w, i) => {
          const wpnData = DND_WEAPONS.find(dw => dw.name === w.name)
          return (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-charcoal-900/50 border border-gold-500/10">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-parchment font-medium">{w.name}</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-xs text-red-300 font-mono">{w.damage} {wpnData?.damageType || ''}</span>
                  {w.properties.map((p, pi) => (
                    <Badge key={pi} variant="outline" className="border-gold-500/15 text-parchment-muted text-[10px]">{p}</Badge>
                  ))}
                  {wpnData && <span className="text-[10px] text-parchment-muted/50">{wpnData.cost} · {wpnData.weight} lb</span>}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeWeapon(i)} className="text-red-400 h-8 w-8 p-0 flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )
        })}
      </Card>

      {/* Armor — dropdown selector */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-4">
        <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Armor & Defense
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label className="text-parchment-muted text-xs">Armor</Label>
            <select
              value={armorName}
              onChange={e => selectArmor(e.target.value)}
              className="w-full h-10 mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm px-3"
            >
              <option value="">None (AC 10 + DEX)</option>
              {armorTypes.map(type => (
                <optgroup key={type} label={`${type} Armor`}>
                  {DND_ARMOR.filter(a => a.type === type).map(a => (
                    <option key={a.name} value={a.name}>
                      {a.name} — AC {a.ac}{a.stealthDisadv ? ' (Stealth Disadv.)' : ''} ({a.cost})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {armorName && (() => {
              const arm = DND_ARMOR.find(a => a.name === armorName)
              return arm ? (
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <Badge variant="outline" className="border-blue-500/20 text-blue-300">AC {arm.ac}</Badge>
                  <Badge variant="outline" className="border-gold-500/15 text-parchment-muted">{arm.type}</Badge>
                  {arm.minStr && <Badge variant="outline" className="border-red-500/20 text-red-300">STR {arm.minStr}+</Badge>}
                  {arm.stealthDisadv && <Badge variant="outline" className="border-amber-500/20 text-amber-300">Stealth Disadv.</Badge>}
                  <span className="text-parchment-muted/50">{arm.cost} · {arm.weight} lb</span>
                </div>
              ) : null
            })()}
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShieldEquipped(!shieldEquipped)}
              className={`w-full h-10 flex items-center justify-center gap-2 rounded-md border transition-all ${
                shieldEquipped
                  ? 'border-gold-500/50 bg-gold-500/15 text-gold-500'
                  : 'border-gold-500/10 bg-charcoal-950 text-parchment-muted'
              }`}
            >
              <Shield className="w-4 h-4" />
              Shield (+2 AC)
            </button>
          </div>
        </div>
      </Card>

      {/* Gear & Gold — dropdown selector */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
            <Backpack className="w-4 h-4" /> Gear & Gold
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-parchment-muted text-xs">Add Equipment Pack</Label>
            <select
              value=""
              onChange={e => {
                if (!e.target.value) return
                const pack = DND_EQUIPMENT_PACKS[e.target.value]
                if (pack) {
                  const newItems = pack.items.map(name => ({ name, quantity: 1 }))
                  setItems([...items, ...newItems])
                }
              }}
              className="w-full h-10 mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm px-3"
            >
              <option value="">Select a pack...</option>
              {Object.entries(DND_EQUIPMENT_PACKS).map(([key, pack]) => (
                <option key={key} value={key}>{pack.name} ({pack.items.length} items)</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Add Individual Item</Label>
            <select
              value=""
              onChange={e => { if (e.target.value) addItem(e.target.value) }}
              className="w-full h-10 mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm px-3"
            >
              <option value="">Select an item...</option>
              {ALL_GEAR_ITEMS.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="w-32">
          <Label className="text-parchment-muted text-xs">Starting Gold (GP)</Label>
          <Input
            type="number" min={0}
            value={startingGold}
            onChange={e => setStartingGold(parseInt(e.target.value) || 0)}
            className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment text-center font-mono"
          />
        </div>
        {items.length > 0 && (
          <div className="space-y-1">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-charcoal-900/40 border border-gold-500/5">
                <span className="flex-1 text-sm text-parchment">{item.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const next = [...items]
                      next[i] = { ...next[i], quantity: Math.max(1, next[i].quantity - 1) }
                      setItems(next)
                    }}
                    className="w-6 h-6 flex items-center justify-center text-parchment-muted hover:text-parchment rounded"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs text-parchment font-mono w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => {
                      const next = [...items]
                      next[i] = { ...next[i], quantity: next[i].quantity + 1 }
                      setItems(next)
                    }}
                    className="w-6 h-6 flex items-center justify-center text-parchment-muted hover:text-parchment rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeItem(i)} className="text-red-400 h-7 w-7 p-0">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

// ── STEP: SPELLS ───────────────────────────────────────

function StepSpells({
  charClass, level,
  selectedCantrips, setSelectedCantrips,
  selectedSpells, setSelectedSpells,
}: {
  charClass: string
  level: number
  selectedCantrips: string[]
  setSelectedCantrips: (v: string[]) => void
  selectedSpells: Record<number, string[]>
  setSelectedSpells: (v: Record<number, string[]>) => void
}) {
  const classData = getClass(charClass)
  const isCaster = isSpellcaster(charClass)
  const maxSpellLevel = isCaster ? getMaxSpellLevel(charClass, level) : 0
  const cantrips = isCaster ? getCantrips(charClass) : []
  const maxCantrips = classData?.spellcasting?.cantripsKnown[level - 1] ?? 0
  const maxSpellsKnown = classData?.spellcasting?.spellsKnown?.[level - 1]
  const casterType = classData?.spellcasting?.type || 'prepared'

  const totalSelectedSpells = Object.values(selectedSpells).reduce((sum, arr) => sum + arr.length, 0)

  function toggleCantrip(name: string) {
    if (selectedCantrips.includes(name)) {
      setSelectedCantrips(selectedCantrips.filter(c => c !== name))
    } else if (selectedCantrips.length < maxCantrips) {
      setSelectedCantrips([...selectedCantrips, name])
    }
  }

  function toggleSpell(spellLevel: number, name: string) {
    const current = selectedSpells[spellLevel] || []
    if (current.includes(name)) {
      setSelectedSpells({
        ...selectedSpells,
        [spellLevel]: current.filter(s => s !== name),
      })
    } else {
      // For 'known' and 'pact' casters, enforce max spells
      if ((casterType === 'known' || casterType === 'pact') && maxSpellsKnown !== undefined && totalSelectedSpells >= maxSpellsKnown) {
        return // Can't add more
      }
      setSelectedSpells({
        ...selectedSpells,
        [spellLevel]: [...current, name],
      })
    }
  }

  if (!isCaster) {
    return (
      <div className="space-y-6">
        <Card className="p-8 bg-teal-rich/60 border-gold-500/15 text-center">
          <Swords className="w-12 h-12 text-parchment-muted/30 mx-auto mb-4" />
          <h3 className="text-lg font-serif text-parchment mb-2">No Spellcasting</h3>
          <p className="text-sm text-parchment-muted">
            {charClass}s don&apos;t use spells. Your power comes from martial prowess!
          </p>
          <p className="text-xs text-parchment-muted/60 mt-2">
            Click Continue to proceed to the review step.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Spellcasting Summary */}
      <Card className="p-4 bg-purple-500/10 border-purple-500/20">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Wand2 className="w-3 h-3 mr-1" /> {charClass} — {classData?.spellcasting?.ability}
          </Badge>
          <span className="text-xs text-parchment-muted">
            {casterType === 'prepared' ? 'Prepares spells daily from full list' : casterType === 'known' ? 'Learns a fixed number of spells' : 'Pact Magic'}
          </span>
        </div>
        <div className="flex gap-4 mt-3 text-xs text-parchment-muted">
          <span>Cantrips: <strong className="text-parchment">{selectedCantrips.length}/{maxCantrips}</strong></span>
          {maxSpellsKnown !== undefined && (
            <span>Spells Known: <strong className="text-parchment">{totalSelectedSpells}/{maxSpellsKnown}</strong></span>
          )}
          <span>Max Spell Level: <strong className="text-parchment">{maxSpellLevel > 0 ? maxSpellLevel : '—'}</strong></span>
        </div>
      </Card>

      {/* Cantrips */}
      {maxCantrips > 0 && cantrips.length > 0 && (
        <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
              <Star className="w-4 h-4" /> Cantrips
            </h3>
            <span className="text-xs text-parchment-muted">
              {selectedCantrips.length} / {maxCantrips} selected
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {cantrips.map(name => {
              const isSelected = selectedCantrips.includes(name)
              const isDisabled = !isSelected && selectedCantrips.length >= maxCantrips
              return (
                <button
                  key={name}
                  onClick={() => toggleCantrip(name)}
                  disabled={isDisabled}
                  className={`p-2.5 rounded-lg border text-left text-sm transition-all ${
                    isSelected
                      ? 'border-purple-500/50 bg-purple-500/15 text-purple-200'
                      : isDisabled
                      ? 'border-gold-500/5 bg-charcoal-900/30 text-parchment-muted/30 cursor-not-allowed'
                      : 'border-gold-500/10 bg-charcoal-900/50 text-parchment hover:border-purple-500/25 hover:bg-purple-500/5'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {isSelected && <Check className="w-3 h-3 text-purple-400 flex-shrink-0" />}
                    {name}
                  </span>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* Spells by Level */}
      {Array.from({ length: maxSpellLevel }, (_, i) => i + 1).map(spellLevel => {
        const spellsAtLevel = getSpellsAtLevel(charClass, spellLevel)
        if (spellsAtLevel.length === 0) return null
        const selected = selectedSpells[spellLevel] || []
        const atLimit = (casterType === 'known' || casterType === 'pact') && maxSpellsKnown !== undefined && totalSelectedSpells >= maxSpellsKnown

        return (
          <Card key={spellLevel} className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
                <Wand2 className="w-4 h-4" /> Level {spellLevel} Spells
              </h3>
              <span className="text-xs text-parchment-muted">
                {selected.length} selected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {spellsAtLevel.map(name => {
                const isSelected = selected.includes(name)
                const isDisabled = !isSelected && atLimit
                return (
                  <button
                    key={name}
                    onClick={() => toggleSpell(spellLevel, name)}
                    disabled={isDisabled}
                    className={`p-2.5 rounded-lg border text-left text-sm transition-all ${
                      isSelected
                        ? 'border-purple-500/50 bg-purple-500/15 text-purple-200'
                        : isDisabled
                        ? 'border-gold-500/5 bg-charcoal-900/30 text-parchment-muted/30 cursor-not-allowed'
                        : 'border-gold-500/10 bg-charcoal-900/50 text-parchment hover:border-purple-500/25 hover:bg-purple-500/5'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {isSelected && <Check className="w-3 h-3 text-purple-400 flex-shrink-0" />}
                      {name}
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// ── STEP: REVIEW ───────────────────────────────────────

function StepReview({
  name, race, subrace, charClass, subclass, level,
  abilities, background, alignment, maxHp, baseAC, speed,
  classInfo, weapons, portraitUrl,
}: {
  name: string; race: string; subrace: string
  charClass: string; subclass: string; level: number
  abilities: number[]; background: string; alignment: string
  maxHp: number; baseAC: number; speed: number
  classInfo: { hitDie: string; primaryAbility: string } | undefined
  weapons: WeaponEntry[]
  portraitUrl: string
}) {
  const classColor = CLASS_COLORS[charClass] || '#d4a84b'
  const profBonus = level <= 4 ? 2 : level <= 8 ? 3 : level <= 12 ? 4 : level <= 16 ? 5 : 6

  return (
    <div className="space-y-6">
      {/* Character Card Preview */}
      <Card className="overflow-hidden border-gold-500/20 bg-gradient-to-br from-teal-rich/80 to-charcoal-900/80">
        <div className="h-1.5" style={{ backgroundColor: classColor }} />
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Portrait */}
            <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 border border-gold-500/20">
              {portraitUrl ? (
                <img src={portraitUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${classColor}25 0%, ${classColor}08 100%)` }}
                >
                  <span className="text-4xl font-serif" style={{ color: classColor }}>
                    {name ? name.charAt(0) : '?'}
                  </span>
                </div>
              )}
            </div>

            {/* Name & Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-serif text-parchment">
                {name || 'Unnamed Hero'}
              </h2>
              <p className="text-sm text-parchment-muted">
                Level {level} {race}{subrace ? ` (${subrace})` : ''} {charClass}{subclass ? ` — ${subclass}` : ''}
              </p>
              {background && <p className="text-xs text-parchment-muted/60 mt-0.5">{background} • {alignment}</p>}

              {/* Core stats */}
              <div className="flex gap-4 mt-4">
                <div className="text-center">
                  <div className="text-xs text-red-400">HP</div>
                  <div className="text-xl font-mono font-bold text-parchment">{maxHp}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-blue-400">AC</div>
                  <div className="text-xl font-mono font-bold text-parchment">{baseAC}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-emerald-400">Speed</div>
                  <div className="text-xl font-mono font-bold text-parchment">{speed}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gold-500">Prof</div>
                  <div className="text-xl font-mono font-bold text-parchment">+{profBonus}</div>
                </div>
                {classInfo && (
                  <div className="text-center">
                    <div className="text-xs text-amber-400">Hit Die</div>
                    <div className="text-xl font-mono font-bold text-parchment">{classInfo.hitDie}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Ability Scores Summary */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15">
        <h3 className="text-sm font-serif text-gold-500 mb-3">Ability Scores</h3>
        <div className="grid grid-cols-6 gap-2">
          {ABILITY_SHORT.map((label, i) => (
            <div key={label} className="text-center">
              <div className="text-[10px] text-gold-500/60 uppercase">{label}</div>
              <div className="text-lg font-mono font-bold text-parchment">{abilities[i]}</div>
              <div className="text-xs text-parchment-muted font-mono">
                {formatModifier(abilityModifier(abilities[i]))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Equipment Summary */}
      {weapons.length > 0 && (
        <Card className="p-5 bg-teal-rich/60 border-gold-500/15">
          <h3 className="text-sm font-serif text-gold-500 mb-3">Equipment</h3>
          <div className="space-y-1">
            {weapons.map((w, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-parchment">{w.name || 'Unnamed weapon'}</span>
                <span className="text-parchment-muted font-mono">
                  {w.damage ? `${formatModifier(w.attack_bonus)} / ${w.damage}` : '—'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Ready message */}
      <div className="text-center py-4">
        <Flame className="w-8 h-8 text-gold-500 mx-auto mb-2 float" />
        <p className="text-sm text-parchment-muted">
          Your character is ready. Click <strong className="text-gold-500">Forge Character</strong> to bring them to life.
        </p>
      </div>
    </div>
  )
}
