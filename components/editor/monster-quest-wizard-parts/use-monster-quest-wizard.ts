'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  generateEntityDescription,
  generateEntityImage,
  saveQuestMonster,
  getUserStoryMonsters,
} from '@/lib/actions/create'
import type { RegionId } from '@/lib/data/regions'
import type { EntityArtStyleId } from '@/lib/data/entity-art-styles'
import {
  type Ability,
  type CreatureSize,
  type CreatureType,
  type MonsterAbilityScores,
  type MonsterAction,
  type MonsterMovement,
  type MonsterRole,
  type MonsterSenses,
  type MonsterTrait,
  defaultAbilityScores,
  defaultSenses,
} from '@/lib/dnd-rules/monsters'
import { blankAction, buildMonsterStats } from './helpers'
import type { StoryMonsterSummary } from './types'

/**
 * All state, handlers, and navigation gating for the Monster Quest wizard.
 * Step components receive the returned object as their `wizard` prop.
 */
export function useMonsterQuestWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  // Identity
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')

  // Role & Region
  const [role, setRole] = useState<MonsterRole>('brute')
  const [regionId, setRegionId] = useState<RegionId>('bellroot')
  const [isOneOff, setIsOneOff] = useState(false)

  // Stats
  const [cr, setCr] = useState(1)
  const [hp, setHp] = useState(40)
  const [ac, setAc] = useState(13)
  const [damagePerRound, setDamagePerRound] = useState('8')

  // Movement
  const [movements, setMovements] = useState<MonsterMovement[]>([{ type: 'walk', speed: 30 }])

  // Identity (canonical 5e fields) — no UI edits these yet, so setters are omitted.
  const [size] = useState<CreatureSize>('medium')
  const [creatureType] = useState<CreatureType>('aberration')
  const [subtype] = useState('')
  const [alignment] = useState<string>('unaligned')

  // Defenses
  const [hitDice, setHitDice] = useState('')
  const [acSource, setAcSource] = useState('')

  // Ability scores & proficiencies
  const [abilities, setAbilities] = useState<MonsterAbilityScores>(defaultAbilityScores())
  const [savingThrows, setSavingThrows] = useState<Partial<Record<Ability, number>>>({})
  const [skills, setSkills] = useState<Array<{ name: string; bonus: number }>>([])

  // Damage / condition handling
  const [damageVulnerabilities, setDamageVulnerabilities] = useState<string[]>([])
  const [damageResistances, setDamageResistances] = useState<string[]>([])
  const [damageImmunities, setDamageImmunities] = useState<string[]>([])
  const [conditionImmunities, setConditionImmunities] = useState<string[]>([])

  // Senses & languages
  const [senses, setSenses] = useState<MonsterSenses>(defaultSenses())
  const [languages, setLanguages] = useState<string[]>([])
  const [telepathy, setTelepathy] = useState<number | undefined>(undefined)

  // Combat behavior
  const [multiattack, setMultiattack] = useState('')
  const [bonusActions, setBonusActions] = useState<MonsterAction[]>([])
  const [reactions, setReactions] = useState<MonsterAction[]>([])
  const [hasLegendary, setHasLegendary] = useState(false)
  const [legendaryActions, setLegendaryActions] = useState<{
    count: number
    description?: string
    actions: MonsterAction[]
  }>({ count: 3, actions: [] })
  const [tactics, setTactics] = useState('')

  // Actions
  const [actions, setActions] = useState<MonsterAction[]>([
    { name: '', description: '', damage: '', actionType: 'action' },
  ])

  // Traits & Weaknesses
  const [traits, setTraits] = useState<MonsterTrait[]>([{ name: '', description: '' }])
  const [weaknesses, setWeaknesses] = useState<string[]>([''])

  // Everloop
  const [whatBrokeHere, setWhatBrokeHere] = useState('')
  const [whatLeakedThrough, setWhatLeakedThrough] = useState('')
  const [drawnTo, setDrawnTo] = useState('')

  // Image & 3D
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [artStyle, setArtStyle] = useState<EntityArtStyleId>('dark-fantasy')
  const [imageCustomDetails, setImageCustomDetails] = useState('')

  // UI state
  const [isGeneratingText, setIsGeneratingText] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load-from-Story-Monster
  const [sourceEntityId, setSourceEntityId] = useState<string | null>(null)
  const [sourceEntityName, setSourceEntityName] = useState<string | null>(null)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [loadList, setLoadList] = useState<StoryMonsterSummary[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [loadListError, setLoadListError] = useState<string | null>(null)

  const getMonsterStats = () =>
    buildMonsterStats({
      size,
      creatureType,
      subtype,
      alignment,
      role,
      cr,
      hp,
      hitDice,
      ac,
      acSource,
      movements,
      abilities,
      savingThrows,
      skills,
      damageVulnerabilities,
      damageResistances,
      damageImmunities,
      conditionImmunities,
      senses,
      languages,
      telepathy,
      damagePerRound,
      multiattack,
      traits,
      actions,
      bonusActions,
      reactions,
      hasLegendary,
      legendaryActions,
      tactics,
      weaknesses,
      regionId,
      isOneOff,
      whatBrokeHere,
      whatLeakedThrough,
      drawnTo,
    })

  // ─────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────

  const handleExpandDescription = async () => {
    if (!name.trim()) {
      setError('Please enter a name first')
      return
    }
    setError(null)
    setIsGeneratingText(true)
    try {
      const result = await generateEntityDescription({
        name,
        tagline,
        type: 'monster',
        existingDescription: description || undefined,
      })
      if (result.success && result.description) {
        setDescription(result.description)
      } else {
        setError(result.error || 'Failed to generate description')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsGeneratingText(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!name.trim() || !description.trim()) {
      setError('Please enter a name and description first')
      return
    }
    setError(null)
    setIsGeneratingImage(true)
    try {
      const result = await generateEntityImage({
        name,
        type: 'monster',
        description,
        style: artStyle,
        customDetails: imageCustomDetails.trim() || undefined,
      })
      if (result.success && result.imageUrl) {
        setImageUrl(result.imageUrl)
      } else {
        setError(result.error || 'Failed to generate image')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim() || !tagline.trim() || !description.trim()) {
      setError('Please fill in name, tagline, and description')
      return
    }
    if (!whatBrokeHere.trim() || !whatLeakedThrough.trim() || !drawnTo.trim()) {
      setError('Please fill in all Everloop lore fields')
      return
    }

    setError(null)
    setIsSaving(true)

    try {
      const result = await saveQuestMonster({
        name,
        tagline,
        description,
        imageUrl: imageUrl || undefined,
        sourceEntityId: sourceEntityId || undefined,
        monsterStats: getMonsterStats(),
      })

      if (result.success) {
        router.push('/roster')
      } else {
        setError(result.error || 'Failed to save monster')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // ─────────────────────────────────────────────────────────
  // Load from Story Monster
  // ─────────────────────────────────────────────────────────

  const openLoadModal = async () => {
    setShowLoadModal(true)
    setLoadListError(null)
    setIsLoadingList(true)
    try {
      const result = await getUserStoryMonsters()
      if (result.success && result.monsters) {
        setLoadList(result.monsters)
      } else {
        setLoadListError(result.error || 'Failed to load monsters')
      }
    } catch {
      setLoadListError('An error occurred. Please try again.')
    } finally {
      setIsLoadingList(false)
    }
  }

  const loadStoryMonster = (m: Omit<StoryMonsterSummary, 'createdAt'>) => {
    setSourceEntityId(m.id)
    setSourceEntityName(m.name)
    setName(m.name)
    setTagline(m.tagline || '')
    setDescription(m.description || '')
    setImageUrl(m.imageUrl || null)
    setShowLoadModal(false)
    setError(null)
  }

  const clearLoadedSource = () => {
    setSourceEntityId(null)
    setSourceEntityName(null)
  }

  // ─────────────────────────────────────────────────────────
  // Dynamic list helpers
  // ─────────────────────────────────────────────────────────

  const addMovement = () =>
    setMovements((prev) => [...prev, { type: 'walk', speed: 30 }])
  const removeMovement = (i: number) =>
    setMovements((prev) => prev.filter((_, idx) => idx !== i))
  const updateMovement = (i: number, m: Partial<MonsterMovement>) =>
    setMovements((prev) => prev.map((mv, idx) => (idx === i ? { ...mv, ...m } : mv)))

  const addAction = () =>
    setActions((prev) => [...prev, { name: '', description: '', damage: '', actionType: 'action' }])
  const removeAction = (i: number) =>
    setActions((prev) => prev.filter((_, idx) => idx !== i))
  const updateAction = (i: number, a: Partial<MonsterAction>) =>
    setActions((prev) => prev.map((act, idx) => (idx === i ? { ...act, ...a } : act)))

  const addTrait = () => setTraits((prev) => [...prev, { name: '', description: '' }])
  const removeTrait = (i: number) => setTraits((prev) => prev.filter((_, idx) => idx !== i))
  const updateTrait = (i: number, patch: Partial<MonsterTrait>) =>
    setTraits((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)))

  const addBonusAction = () => setBonusActions((prev) => [...prev, blankAction('bonus_action')])
  const removeBonusAction = (i: number) =>
    setBonusActions((prev) => prev.filter((_, idx) => idx !== i))
  const updateBonusAction = (i: number, a: Partial<MonsterAction>) =>
    setBonusActions((prev) => prev.map((act, idx) => (idx === i ? { ...act, ...a } : act)))

  const addReaction = () => setReactions((prev) => [...prev, blankAction('reaction')])
  const removeReaction = (i: number) =>
    setReactions((prev) => prev.filter((_, idx) => idx !== i))
  const updateReaction = (i: number, a: Partial<MonsterAction>) =>
    setReactions((prev) => prev.map((act, idx) => (idx === i ? { ...act, ...a } : act)))

  const addLegendaryAction = () =>
    setLegendaryActions((prev) => ({ ...prev, actions: [...prev.actions, blankAction('legendary')] }))
  const removeLegendaryAction = (i: number) =>
    setLegendaryActions((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, idx) => idx !== i),
    }))
  const updateLegendaryAction = (i: number, a: Partial<MonsterAction>) =>
    setLegendaryActions((prev) => ({
      ...prev,
      actions: prev.actions.map((act, idx) => (idx === i ? { ...act, ...a } : act)),
    }))

  const addSkill = () =>
    setSkills((prev) => [...prev, { name: 'Perception', bonus: 0 }])
  const removeSkill = (i: number) =>
    setSkills((prev) => prev.filter((_, idx) => idx !== i))
  const updateSkill = (i: number, patch: Partial<{ name: string; bonus: number }>) =>
    setSkills((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  const addWeakness = () => setWeaknesses((prev) => [...prev, ''])
  const removeWeakness = (i: number) =>
    setWeaknesses((prev) => prev.filter((_, idx) => idx !== i))
  const updateWeakness = (i: number, v: string) =>
    setWeaknesses((prev) => prev.map((w, idx) => (idx === i ? v : w)))

  // ─────────────────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────────────────

  const canAdvance = () => {
    switch (step) {
      case 0:
        return name.trim() && tagline.trim() && role
      case 1:
        return cr > 0 && hp > 0 && ac > 0
      case 2:
        // Abilities & Senses — abilities default to valid scores, nothing to gate.
        return true
      case 3:
        // Defenses — all damage/condition handling is optional.
        return true
      case 4:
        return actions.some((a) => a.name.trim())
      case 5:
        return whatBrokeHere.trim() && whatLeakedThrough.trim() && drawnTo.trim()
      default:
        return true
    }
  }

  return {
    step,
    setStep,
    name,
    setName,
    tagline,
    setTagline,
    description,
    setDescription,
    role,
    setRole,
    regionId,
    setRegionId,
    isOneOff,
    setIsOneOff,
    cr,
    setCr,
    hp,
    setHp,
    ac,
    setAc,
    damagePerRound,
    setDamagePerRound,
    movements,
    setMovements,
    size,
    creatureType,
    subtype,
    alignment,
    hitDice,
    setHitDice,
    acSource,
    setAcSource,
    abilities,
    setAbilities,
    savingThrows,
    setSavingThrows,
    skills,
    setSkills,
    damageVulnerabilities,
    setDamageVulnerabilities,
    damageResistances,
    setDamageResistances,
    damageImmunities,
    setDamageImmunities,
    conditionImmunities,
    setConditionImmunities,
    senses,
    setSenses,
    languages,
    setLanguages,
    telepathy,
    setTelepathy,
    multiattack,
    setMultiattack,
    bonusActions,
    setBonusActions,
    reactions,
    setReactions,
    hasLegendary,
    setHasLegendary,
    legendaryActions,
    setLegendaryActions,
    tactics,
    setTactics,
    actions,
    setActions,
    traits,
    setTraits,
    weaknesses,
    setWeaknesses,
    whatBrokeHere,
    setWhatBrokeHere,
    whatLeakedThrough,
    setWhatLeakedThrough,
    drawnTo,
    setDrawnTo,
    imageUrl,
    setImageUrl,
    modelUrl,
    setModelUrl,
    artStyle,
    setArtStyle,
    imageCustomDetails,
    setImageCustomDetails,
    isGeneratingText,
    setIsGeneratingText,
    isGeneratingImage,
    setIsGeneratingImage,
    isSaving,
    setIsSaving,
    error,
    setError,
    sourceEntityId,
    setSourceEntityId,
    sourceEntityName,
    setSourceEntityName,
    showLoadModal,
    setShowLoadModal,
    loadList,
    setLoadList,
    isLoadingList,
    setIsLoadingList,
    loadListError,
    setLoadListError,
    getMonsterStats,
    handleExpandDescription,
    handleGenerateImage,
    handleSave,
    openLoadModal,
    loadStoryMonster,
    clearLoadedSource,
    addMovement,
    removeMovement,
    updateMovement,
    addAction,
    removeAction,
    updateAction,
    addTrait,
    removeTrait,
    updateTrait,
    addBonusAction,
    removeBonusAction,
    updateBonusAction,
    addReaction,
    removeReaction,
    updateReaction,
    addLegendaryAction,
    removeLegendaryAction,
    updateLegendaryAction,
    addSkill,
    removeSkill,
    updateSkill,
    addWeakness,
    removeWeakness,
    updateWeakness,
    canAdvance,
  }
}
