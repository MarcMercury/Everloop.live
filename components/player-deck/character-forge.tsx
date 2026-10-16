'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { WeaponEntry } from '@/types/player-character'
import { abilityModifier } from '@/types/player-character'
import { createPlayerCharacter } from '@/lib/actions/player-characters'
import { getRace, getClass } from '@/lib/data'
import {
  STEPS, POINT_BUY_MAX, POINT_COSTS, RACE_INFO, CLASS_INFO, HIT_DIE_MAP,
} from './character-forge-parts/constants'
import type { AbilityMethod, ForgeItem } from './character-forge-parts/types'
import { stepSubtitle } from './character-forge-parts/utils'
import { buildCharacterInsert } from './character-forge-parts/build-character'
import { ForgeProgressHeader, ForgeBottomNav } from './character-forge-parts/forge-chrome'
import { StepRace } from './character-forge-parts/step-race'
import { StepClass } from './character-forge-parts/step-class'
import { StepAbilities } from './character-forge-parts/step-abilities'
import { StepDescription } from './character-forge-parts/step-description'
import { StepEquipment } from './character-forge-parts/step-equipment'
import { StepSpells } from './character-forge-parts/step-spells'
import { StepReview } from './character-forge-parts/step-review'

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
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [eyes, setEyes] = useState('')
  const [hair, setHair] = useState('')
  const [skin, setSkin] = useState('')
  const [faith, setFaith] = useState('')

  // Equipment
  const [weapons, setWeapons] = useState<WeaponEntry[]>([])
  const [armorName, setArmorName] = useState('')
  const [armorAC, setArmorAC] = useState(10)
  const [shieldEquipped, setShieldEquipped] = useState(false)
  const [startingGold, setStartingGold] = useState(0)
  const [items, setItems] = useState<ForgeItem[]>([])

  // Spells
  const [selectedCantrips, setSelectedCantrips] = useState<string[]>([])
  const [selectedSpells, setSelectedSpells] = useState<Record<number, string[]>>({}) // level → spell names

  // Class features
  const [fightingStyle, setFightingStyle] = useState('')
  const [pactBoon, setPactBoon] = useState('')
  const [selectedInvocations, setSelectedInvocations] = useState<string[]>([])
  const [tomeCantrips, setTomeCantrips] = useState<string[]>([]) // Pact of Tome: 3 cantrips from any class
  const [selectedManeuvers, setSelectedManeuvers] = useState<string[]>([]) // Battle Master

  // Skill proficiencies (chosen from class skill list) + feats (ASI-level choices)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedFeats, setSelectedFeats] = useState<string[]>([])

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

    const data = buildCharacterInsert({
      name, race, subrace, charClass, subclass, level, background, alignment,
      portraitUrl, campaignName, dmName, finalAbilities,
      personality, ideals, bonds, flaws, backstory, appearance,
      height, weight, age, eyes, hair, skin, faith,
      weapons, armorName, armorAC, shieldEquipped, startingGold, items,
      selectedCantrips, selectedSpells, fightingStyle, pactBoon,
      selectedInvocations, tomeCantrips, selectedManeuvers, selectedSkills, selectedFeats,
    }, { hitDieNum, baseAC, speed })

    startTransition(async () => {
      const result = await createPlayerCharacter(data)
      if (result.success && result.character) {
        router.push(`/player-deck/${result.character.id}`)
      }
    })
  }

  return (
    <div className="min-h-screen pb-24">
      <ForgeProgressHeader step={step} goToStep={goToStep} />

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
            fightingStyle={fightingStyle}
            setFightingStyle={setFightingStyle}
            pactBoon={pactBoon}
            setPactBoon={setPactBoon}
            selectedManeuvers={selectedManeuvers}
            setSelectedManeuvers={setSelectedManeuvers}
            selectedSkills={selectedSkills}
            setSelectedSkills={setSelectedSkills}
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
            charClass={charClass}
            level={level}
            finalAbilities={finalAbilities}
            selectedFeats={selectedFeats}
            setSelectedFeats={setSelectedFeats}
          />
        )}
        {currentStep.id === 'description' && (
          <StepDescription
            name={name} setName={setName}
            race={race} charClass={charClass} subclass={subclass}
            background={background} setBackground={setBackground}
            alignment={alignment} setAlignment={setAlignment}
            portraitUrl={portraitUrl} setPortraitUrl={setPortraitUrl}
            personality={personality} setPersonality={setPersonality}
            ideals={ideals} setIdeals={setIdeals}
            bonds={bonds} setBonds={setBonds}
            flaws={flaws} setFlaws={setFlaws}
            backstory={backstory} setBackstory={setBackstory}
            appearance={appearance} setAppearance={setAppearance}
            height={height} setHeight={setHeight}
            weight={weight} setWeight={setWeight}
            age={age} setAge={setAge}
            eyes={eyes} setEyes={setEyes}
            hair={hair} setHair={setHair}
            skin={skin} setSkin={setSkin}
            faith={faith} setFaith={setFaith}
            campaignName={campaignName} setCampaignName={setCampaignName}
            dmName={dmName} setDmName={setDmName}
          />
        )}
        {currentStep.id === 'equipment' && (
          <StepEquipment
            weapons={weapons} setWeapons={setWeapons}
            armorName={armorName} setArmorName={setArmorName}
            setArmorAC={setArmorAC}
            shieldEquipped={shieldEquipped} setShieldEquipped={setShieldEquipped}
            startingGold={startingGold} setStartingGold={setStartingGold}
            items={items} setItems={setItems}
          />
        )}
        {currentStep.id === 'spells' && (
          <StepSpells
            charClass={charClass}
            subclass={subclass}
            race={race}
            level={level}
            pactBoon={pactBoon}
            selectedCantrips={selectedCantrips}
            setSelectedCantrips={setSelectedCantrips}
            selectedSpells={selectedSpells}
            setSelectedSpells={setSelectedSpells}
            selectedInvocations={selectedInvocations}
            setSelectedInvocations={setSelectedInvocations}
            tomeCantrips={tomeCantrips}
            setTomeCantrips={setTomeCantrips}
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

      <ForgeBottomNav
        step={step}
        name={name}
        race={race}
        charClass={charClass}
        canProceed={canProceed}
        isPending={isPending}
        onBack={prevStep}
        onNext={nextStep}
        onCreate={handleCreate}
      />
    </div>
  )
}
