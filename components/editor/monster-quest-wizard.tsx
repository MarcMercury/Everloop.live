'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sparkles,
  ImageIcon,
  RefreshCw,
  Check,
  Loader2,
  Save,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Download,
  X,
} from 'lucide-react'
import {
  generateEntityDescription,
  generateEntityImage,
  saveCampaignMonster,
  getUserStoryMonsters,
} from '@/lib/actions/create'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import dynamic from 'next/dynamic'
import { REGIONS, type RegionId } from '@/lib/data/regions'
import {
  ENTITY_ART_STYLE_OPTIONS,
  type EntityArtStyleId,
} from '@/lib/data/entity-art-styles'
import {
  type Ability,
  type CreatureSize,
  type CreatureType,
  type MonsterAbilityScores,
  type MonsterAction,
  type MonsterMovement,
  type MonsterRole,
  type MonsterSenses,
  type MonsterStats,
  type MonsterTrait,
  type MovementType,
  ABILITY_ORDER,
  ABILITY_LABELS,
  CREATURE_SIZES,
  CREATURE_TYPES,
  CR_TABLE,
  DAMAGE_TYPES,
  DND_CONDITIONS,
  STANDARD_ALIGNMENTS,
  STANDARD_SKILLS,
  abilityMod,
  crEntry,
  defaultAbilityScores,
  defaultSenses,
  formatMod,
  passivePerception,
} from '@/lib/dnd-rules/monsters'
import { MonsterStatBlock } from '@/components/quests/monster-stat-block'

export type { MonsterRole, MovementType }

const ThreeDPreviewPanel = dynamic(
  () => import('@/components/3d/three-d-preview-panel').then((mod) => mod.ThreeDPreviewPanel),
  { ssr: false }
)

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const ROLES: { value: MonsterRole; label: string; description: string }[] = [
  { value: 'brute', label: 'Brute', description: 'High HP, hits hard, simple and devastating' },
  { value: 'striker', label: 'Striker', description: 'Fast, high damage, low durability' },
  { value: 'tank', label: 'Tank', description: 'Hard to kill, controls space, high AC' },
  { value: 'controller', label: 'Controller', description: 'Status effects, battlefield manipulation' },
  { value: 'support', label: 'Support', description: 'Buffs/debuffs, summons, force multiplier' },
]

const CR_PRESETS: { cr: number; hp: string; ac: string; dmg: string }[] = [
  { cr: 0.25, hp: '10–20', ac: '11–13', dmg: '2–4' },
  { cr: 0.5, hp: '20–35', ac: '12–13', dmg: '4–6' },
  { cr: 1, hp: '35–50', ac: '13', dmg: '6–10' },
  { cr: 2, hp: '50–70', ac: '13–14', dmg: '10–16' },
  { cr: 3, hp: '70–100', ac: '13–14', dmg: '16–22' },
  { cr: 4, hp: '100–115', ac: '14', dmg: '22–28' },
  { cr: 5, hp: '115–130', ac: '15', dmg: '28–34' },
  { cr: 8, hp: '160–190', ac: '16', dmg: '45–52' },
  { cr: 10, hp: '210–240', ac: '17', dmg: '55–62' },
  { cr: 15, hp: '280–310', ac: '18', dmg: '80–90' },
  { cr: 20, hp: '350–400', ac: '19', dmg: '110–120' },
]

const MOVEMENT_TYPES: { value: MovementType; label: string }[] = [
  { value: 'walk', label: 'Walk' },
  { value: 'fly', label: 'Fly' },
  { value: 'climb', label: 'Climb' },
  { value: 'swim', label: 'Swim' },
  { value: 'burrow', label: 'Burrow' },
]

const STEPS = [
  'Identity & Role',
  'Combat Stats',
  'Actions & Traits',
  'Everloop Lore',
  'Art & Preview',
] as const

// ═══════════════════════════════════════════════════════════
// SELECT COMPONENT
// ═══════════════════════════════════════════════════════════

function Select({
  value,
  onChange,
  children,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment focus:outline-none focus:ring-2 focus:ring-gold/30 ${className}`}
    >
      {children}
    </select>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function MonsterQuestWizard() {
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

  // Identity (canonical 5e fields)
  const [size, setSize] = useState<CreatureSize>('medium')
  const [creatureType, setCreatureType] = useState<CreatureType>('aberration')
  const [subtype, setSubtype] = useState('')
  const [alignment, setAlignment] = useState<string>('unaligned')

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
  const [loadList, setLoadList] = useState<
    Array<{
      id: string
      name: string
      tagline: string
      description: string | null
      imageUrl: string | null
      createdAt: string
    }>
  >([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [loadListError, setLoadListError] = useState<string | null>(null)

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
      const entry = crEntry(cr)
      const cleanActions = actions.filter((a) => a.name.trim())
      const cleanBonusActions = bonusActions.filter((a) => a.name.trim())
      const cleanReactions = reactions.filter((a) => a.name.trim())
      const cleanTraits = traits.filter((t) => t.name.trim() || t.description.trim())
      const cleanWeaknesses = weaknesses.filter((w) => w.trim())
      const cleanLanguages = languages.filter((l) => l.trim())

      const result = await saveCampaignMonster({
        name,
        tagline,
        description,
        imageUrl: imageUrl || undefined,
        sourceEntityId: sourceEntityId || undefined,
        monsterStats: {
          size,
          creatureType,
          subtype: subtype.trim() || undefined,
          alignment,
          role,
          cr,
          xp: entry.xp,
          proficiencyBonus: entry.proficiencyBonus,
          hp,
          hitDice: hitDice.trim() || undefined,
          ac,
          acSource: acSource.trim() || undefined,
          movements,
          abilities,
          savingThrows,
          skills,
          damageVulnerabilities,
          damageResistances,
          damageImmunities,
          conditionImmunities,
          senses,
          languages: cleanLanguages,
          telepathy,
          damagePerRound,
          multiattack: multiattack.trim() || undefined,
          traits: cleanTraits,
          actions: cleanActions,
          bonusActions: cleanBonusActions,
          reactions: cleanReactions,
          legendaryActions: hasLegendary
            ? {
                count: legendaryActions.count,
                description: legendaryActions.description,
                actions: legendaryActions.actions.filter((a) => a.name.trim()),
              }
            : { count: 0, actions: [] },
          tactics: tactics.trim() || undefined,
          weaknesses: cleanWeaknesses,
          regionId,
          isOneOff,
          whatBrokeHere,
          whatLeakedThrough,
          drawnTo,
        },
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

  const loadStoryMonster = (m: {
    id: string
    name: string
    tagline: string
    description: string | null
    imageUrl: string | null
  }) => {
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

  const blankAction = (kind: MonsterAction['actionType']): MonsterAction => ({
    name: '',
    description: '',
    damage: '',
    actionType: kind,
  })

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

  const toggleInList = (list: string[], item: string): string[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item]

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
        return actions.some((a) => a.name.trim())
      case 3:
        return whatBrokeHere.trim() && whatLeakedThrough.trim() && drawnTo.trim()
      default:
        return true
    }
  }

  // ═══════════════════════════════════════════════════════════
  // STEP RENDERERS
  // ═══════════════════════════════════════════════════════════

  const renderStep0 = () => (
    <div className="space-y-6">
      {/* Load from Story Monster */}
      {sourceEntityId ? (
        <div className="flex items-start gap-3 p-3 rounded-lg border border-gold/40 bg-gold/5">
          <Download className="w-4 h-4 text-gold mt-0.5 shrink-0" />
          <div className="flex-1 text-xs">
            <div className="text-parchment">
              Converting Story Monster:{' '}
              <span className="text-gold font-medium">{sourceEntityName}</span>
            </div>
            <div className="text-parchment-muted mt-0.5">
              Saving will upgrade this entity in place — adding stats and Everloop lore. The
              original entry will not be duplicated.
            </div>
          </div>
          <button
            type="button"
            onClick={clearLoadedSource}
            className="text-parchment-muted hover:text-red-400 transition-colors"
            aria-label="Cancel conversion"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-gold/30 bg-teal-deep/20">
          <div className="text-xs text-parchment-muted">
            Have a Story Monster you want to upgrade with full combat stats?
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={openLoadModal}
          >
            <Download className="w-3.5 h-3.5" />
            Load Story Monster
          </Button>
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label className="text-parchment">
          Name <span className="text-red-400">*</span>
        </Label>
        <Input
          placeholder="The Unraveling, Hollowmaw, The Stitched Tide..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-teal-deep/50"
        />
        <p className="text-xs text-parchment-muted">
          Monsters are named by survivors who witnessed them — or by the silence they leave behind.
        </p>
      </div>

      {/* Tagline */}
      <div className="space-y-2">
        <Label className="text-parchment">
          Tagline <span className="text-red-400">*</span>
        </Label>
        <Input
          placeholder="It arrived when the ground forgot how to be still..."
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="bg-teal-deep/50"
        />
        <p className="text-xs text-gold/60 italic">
          What would someone whisper to warn others this thing was near?
        </p>
      </div>

      {/* Role */}
      <div className="space-y-3">
        <Label className="text-parchment">
          Combat Role <span className="text-red-400">*</span>
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`text-left p-3 rounded-lg border transition-all ${
                role === r.value
                  ? 'border-red-500/60 bg-red-500/10'
                  : 'border-gold/20 bg-teal-deep/30 hover:border-gold/40'
              }`}
            >
              <div className="text-sm font-medium text-parchment">{r.label}</div>
              <div className="text-xs text-parchment-muted">{r.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Region */}
      <div className="space-y-2">
        <Label className="text-parchment">
          Region <span className="text-red-400">*</span>
        </Label>
        <Select value={regionId} onChange={(v) => setRegionId(v as RegionId)}>
          {REGIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {r.sub}
            </option>
          ))}
        </Select>
        <p className="text-xs text-parchment-muted">
          Where in the Everloop does this monster exist? It can only appear in campaigns and quests set in this
          region.
        </p>
      </div>

      {/* One-off flag */}
      <div className="flex items-start gap-3 p-3 rounded-lg border border-gold/20 bg-teal-deep/20">
        <input
          type="checkbox"
          id="is-one-off"
          checked={isOneOff}
          onChange={(e) => setIsOneOff(e.target.checked)}
          className="mt-1 accent-red-500"
        />
        <label htmlFor="is-one-off" className="cursor-pointer">
          <div className="text-sm font-medium text-parchment">One-Off Monster</div>
          <div className="text-xs text-parchment-muted">
            This monster is unique — it cannot be freely added to custom quests. It exists only once in
            the Everloop.
          </div>
        </label>
      </div>
    </div>
  )

  const renderStep1 = () => {
    const entry = crEntry(cr)
    return (
      <div className="space-y-6">
        {/* Challenge Rating */}
        <div className="space-y-2">
          <Label className="text-parchment">
            Challenge Rating (CR) <span className="text-red-400">*</span>
          </Label>
          <Select value={String(cr)} onChange={(v) => setCr(Number(v))}>
            {CR_TABLE.map((p) => (
              <option key={p.cr} value={p.cr}>
                CR {p.cr} — XP {p.xp.toLocaleString()} | PB +{p.proficiencyBonus} | HP ~{p.suggestedHp} | AC ~{p.suggestedAc} | DPR ~{p.suggestedDpr}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded bg-teal-deep/30 text-center">
              <div className="text-parchment-muted">XP</div>
              <div className="text-gold font-medium">{entry.xp.toLocaleString()}</div>
            </div>
            <div className="p-2 rounded bg-teal-deep/30 text-center">
              <div className="text-parchment-muted">Proficiency</div>
              <div className="text-gold font-medium">+{entry.proficiencyBonus}</div>
            </div>
            <div className="p-2 rounded bg-teal-deep/30 text-center">
              <div className="text-parchment-muted">Atk Bonus / Save DC</div>
              <div className="text-gold font-medium">+{entry.suggestedAttackBonus} / {entry.suggestedSaveDC}</div>
            </div>
          </div>
          <p className="text-xs text-parchment-muted">
            CR = a fair fight for a party of 4 at that level. Proficiency and XP are derived per SRD.
          </p>
        </div>

        {/* HP + Hit Dice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-parchment">
              Hit Points <span className="text-red-400">*</span>
            </Label>
            <Input
              type="number"
              min={1}
              value={hp}
              onChange={(e) => setHp(Number(e.target.value))}
              className="bg-teal-deep/50"
            />
            <p className="text-xs text-gold/60">Suggested: ~{entry.suggestedHp} HP</p>
          </div>
          <div className="space-y-2">
            <Label className="text-parchment">Hit Dice <span className="text-parchment-muted/60">(optional)</span></Label>
            <Input
              placeholder="e.g. 8d10 + 24"
              value={hitDice}
              onChange={(e) => setHitDice(e.target.value)}
              className="bg-teal-deep/50"
            />
            <p className="text-xs text-parchment-muted">Dice formula for HP rolls.</p>
          </div>
        </div>

        {/* AC + Source */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-parchment">
              Armor Class <span className="text-red-400">*</span>
            </Label>
            <Input
              type="number"
              min={1}
              value={ac}
              onChange={(e) => setAc(Number(e.target.value))}
              className="bg-teal-deep/50"
            />
            <p className="text-xs text-gold/60">Suggested: ~{entry.suggestedAc} AC</p>
          </div>
          <div className="space-y-2">
            <Label className="text-parchment">AC Source <span className="text-parchment-muted/60">(optional)</span></Label>
            <Input
              placeholder="natural armor, chitin, drift-warp..."
              value={acSource}
              onChange={(e) => setAcSource(e.target.value)}
              className="bg-teal-deep/50"
            />
          </div>
        </div>

        {/* Damage per Round */}
        <div className="space-y-2">
          <Label className="text-parchment">
            Damage Output per Round <span className="text-red-400">*</span>
          </Label>
          <Input
            placeholder="e.g. 2d8+4 or 18"
            value={damagePerRound}
            onChange={(e) => setDamagePerRound(e.target.value)}
            className="bg-teal-deep/50"
          />
          <p className="text-xs text-gold/60">Suggested for CR {cr}: ~{entry.suggestedDpr} damage/round</p>
        </div>

        {/* Movement */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-parchment">Movement Speeds</Label>
            <Button type="button" variant="ghost" size="sm" onClick={addMovement} className="text-gold gap-1">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
          {movements.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <Select
                value={m.type}
                onChange={(v) => updateMovement(i, { type: v as MovementType })}
                className="w-32"
              >
                {MOVEMENT_TYPES.map((mt) => (
                  <option key={mt.value} value={mt.value}>
                    {mt.label}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                min={0}
                step={5}
                value={m.speed}
                onChange={(e) => updateMovement(i, { speed: Number(e.target.value) })}
                className="bg-teal-deep/50 w-24"
              />
              <span className="text-xs text-parchment-muted">ft.</span>
              {movements.length > 1 && (
                <button type="button" onClick={() => removeMovement(i)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────
  // STEP 2 — Ability Scores & Proficiencies
  // ─────────────────────────────────────────────────────────
  const renderStepAbilities = () => {
    const wisMod = abilityMod(abilities.WIS)
    const perceptionBonus = skills.find((s) => s.name === 'Perception')?.bonus ?? wisMod
    const computedPP = passivePerception(perceptionBonus)
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-parchment">Ability Scores</Label>
          <p className="text-xs text-parchment-muted">
            Standard 5e abilities. Modifier is auto-derived as floor((score − 10) / 2).
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ABILITY_ORDER.map((ab) => (
              <div key={ab} className="p-2 rounded-lg border border-gold/20 bg-teal-deep/30">
                <div className="text-xs text-gold/70 mb-1">{ABILITY_LABELS[ab]} ({ab})</div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={abilities[ab]}
                    onChange={(e) =>
                      setAbilities((prev) => ({ ...prev, [ab]: Number(e.target.value) || 10 }))
                    }
                    className="bg-teal-deep/50"
                  />
                  <span className="text-sm text-parchment font-mono w-10 text-center">
                    {formatMod(abilityMod(abilities[ab]))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Saving throw proficiencies */}
        <div className="space-y-2">
          <Label className="text-parchment">Saving Throw Proficiencies</Label>
          <p className="text-xs text-parchment-muted">
            Click an ability to grant proficiency. Bonus = ability mod + proficiency bonus (+{crEntry(cr).proficiencyBonus}).
          </p>
          <div className="flex flex-wrap gap-2">
            {ABILITY_ORDER.map((ab) => {
              const isProf = savingThrows[ab] !== undefined
              const bonus = abilityMod(abilities[ab]) + crEntry(cr).proficiencyBonus
              return (
                <button
                  key={ab}
                  type="button"
                  onClick={() =>
                    setSavingThrows((prev) => {
                      const next = { ...prev }
                      if (isProf) delete next[ab]
                      else next[ab] = bonus
                      return next
                    })
                  }
                  className={`px-3 py-1.5 rounded-md border text-xs transition-all ${
                    isProf
                      ? 'border-gold/60 bg-gold/10 text-gold'
                      : 'border-gold/20 bg-teal-deep/30 text-parchment-muted hover:border-gold/40'
                  }`}
                >
                  {ab} {isProf && `(${formatMod(bonus)})`}
                </button>
              )
            })}
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-parchment">Skill Bonuses</Label>
            <Button type="button" variant="ghost" size="sm" onClick={addSkill} className="text-gold gap-1">
              <Plus className="w-3 h-3" /> Add Skill
            </Button>
          </div>
          {skills.length === 0 && (
            <p className="text-xs text-parchment-muted italic">
              Add Perception, Stealth, Athletics, etc. with their final bonus (mod + proficiency).
            </p>
          )}
          {skills.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <Select
                value={s.name}
                onChange={(v) => updateSkill(i, { name: v })}
                className="flex-1"
              >
                {STANDARD_SKILLS.map((sk) => (
                  <option key={sk} value={sk}>
                    {sk}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                value={s.bonus}
                onChange={(e) => updateSkill(i, { bonus: Number(e.target.value) })}
                className="bg-teal-deep/50 w-20"
              />
              <button type="button" onClick={() => removeSkill(i)} className="text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Senses */}
        <div className="space-y-3">
          <Label className="text-parchment">Senses</Label>
          <p className="text-xs text-parchment-muted">
            Leave 0 if the monster doesn&apos;t have that sense. Passive Perception auto-derives from Perception
            (or WIS mod) but can be overridden.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-parchment-muted text-xs">Darkvision (ft.)</Label>
              <Input
                type="number"
                min={0}
                step={5}
                value={senses.darkvision ?? 0}
                onChange={(e) =>
                  setSenses((prev) => ({ ...prev, darkvision: Number(e.target.value) || 0 }))
                }
                className="bg-teal-deep/50"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-parchment-muted text-xs">Blindsight (ft.)</Label>
              <Input
                type="number"
                min={0}
                step={5}
                value={senses.blindsight ?? 0}
                onChange={(e) =>
                  setSenses((prev) => ({ ...prev, blindsight: Number(e.target.value) || 0 }))
                }
                className="bg-teal-deep/50"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-parchment-muted text-xs">Tremorsense (ft.)</Label>
              <Input
                type="number"
                min={0}
                step={5}
                value={senses.tremorsense ?? 0}
                onChange={(e) =>
                  setSenses((prev) => ({ ...prev, tremorsense: Number(e.target.value) || 0 }))
                }
                className="bg-teal-deep/50"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-parchment-muted text-xs">Truesight (ft.)</Label>
              <Input
                type="number"
                min={0}
                step={5}
                value={senses.truesight ?? 0}
                onChange={(e) =>
                  setSenses((prev) => ({ ...prev, truesight: Number(e.target.value) || 0 }))
                }
                className="bg-teal-deep/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-xs text-parchment-muted">
              <input
                type="checkbox"
                className="accent-gold"
                checked={!!senses.blindsightBlindBeyond}
                onChange={(e) =>
                  setSenses((prev) => ({ ...prev, blindsightBlindBeyond: e.target.checked }))
                }
              />
              Blind beyond blindsight radius
            </label>
            <div className="space-y-1">
              <Label className="text-parchment-muted text-xs">Passive Perception</Label>
              <Input
                type="number"
                min={1}
                value={senses.passivePerception || computedPP}
                onChange={(e) =>
                  setSenses((prev) => ({ ...prev, passivePerception: Number(e.target.value) }))
                }
                className="bg-teal-deep/50"
              />
              <p className="text-xs text-gold/60">Auto: {computedPP}</p>
            </div>
          </div>
        </div>

        {/* Languages + Telepathy */}
        <div className="space-y-2">
          <Label className="text-parchment">Languages</Label>
          <Input
            placeholder="Common, Abyssal, — (none), or 'understands Common but can't speak'"
            value={languages.join(', ')}
            onChange={(e) =>
              setLanguages(
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            className="bg-teal-deep/50"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-parchment-muted text-xs">Telepathy range (ft.) <span className="text-parchment-muted/60">(optional)</span></Label>
              <Input
                type="number"
                min={0}
                step={30}
                value={telepathy ?? 0}
                onChange={(e) => {
                  const n = Number(e.target.value)
                  setTelepathy(n > 0 ? n : undefined)
                }}
                className="bg-teal-deep/50"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────
  // STEP 3 — Defenses (vuln / res / imm / cond imm)
  // ─────────────────────────────────────────────────────────
  const renderStepDefenses = () => {
    const ChipGroup = ({
      label,
      values,
      setValues,
      options,
      helper,
    }: {
      label: string
      values: string[]
      setValues: (v: string[]) => void
      options: readonly string[]
      helper?: string
    }) => (
      <div className="space-y-2">
        <Label className="text-parchment">{label}</Label>
        {helper && <p className="text-xs text-parchment-muted">{helper}</p>}
        <div className="flex flex-wrap gap-1.5">
          {options.map((opt) => {
            const on = values.includes(opt)
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setValues(toggleInList(values, opt))}
                className={`px-2.5 py-1 rounded-md border text-xs capitalize transition-all ${
                  on
                    ? 'border-red-500/60 bg-red-500/10 text-red-300'
                    : 'border-gold/20 bg-teal-deep/30 text-parchment-muted hover:border-gold/40'
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    )

    return (
      <div className="space-y-6">
        <div className="p-3 rounded-lg border border-gold/20 bg-teal-deep/20 text-xs text-parchment-muted">
          Pick the damage types this creature takes <em>extra</em> from, shrugs off, or
          completely ignores — plus the conditions it can&apos;t suffer. These appear in every
          encounter as <span className="text-gold">tactical levers</span> for players.
        </div>

        <ChipGroup
          label="Damage Vulnerabilities"
          helper="Double damage from these types."
          values={damageVulnerabilities}
          setValues={setDamageVulnerabilities}
          options={DAMAGE_TYPES}
        />
        <ChipGroup
          label="Damage Resistances"
          helper="Half damage from these types."
          values={damageResistances}
          setValues={setDamageResistances}
          options={DAMAGE_TYPES}
        />
        <ChipGroup
          label="Damage Immunities"
          helper="Zero damage from these types."
          values={damageImmunities}
          setValues={setDamageImmunities}
          options={DAMAGE_TYPES}
        />
        <ChipGroup
          label="Condition Immunities"
          helper="Cannot suffer these conditions."
          values={conditionImmunities}
          setValues={setConditionImmunities}
          options={DND_CONDITIONS}
        />
      </div>
    )
  }

  const renderStep2 = () => {
    const attackBonus = crEntry(cr).suggestedAttackBonus
    const saveDC = crEntry(cr).suggestedSaveDC
    const renderActionEditor = (
      a: MonsterAction,
      i: number,
      label: string,
      onUpdate: (i: number, patch: Partial<MonsterAction>) => void,
      onRemove: (i: number) => void,
      canRemove: boolean,
      kind: 'action' | 'bonus' | 'reaction' | 'legendary'
    ) => (
      <Card key={`${kind}-${i}`} className="border-gold/20">
        <CardContent className="pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-parchment font-medium">{label}</span>
            {canRemove && (
              <button type="button" onClick={() => onRemove(i)} className="text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <Input
            placeholder="Attack name (e.g. Bite, Tail Sweep, Drift Howl)"
            value={a.name}
            onChange={(e) => onUpdate(i, { name: e.target.value })}
            className="bg-teal-deep/50"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <Label className="text-parchment-muted text-[10px] uppercase">To-Hit / Save</Label>
              <Input
                placeholder={`+${attackBonus} to hit  or  DC ${saveDC}`}
                value={a.attackBonus !== undefined ? `+${a.attackBonus}` : a.saveDC !== undefined ? `DC ${a.saveDC}` : ''}
                onChange={(e) => {
                  const v = e.target.value.trim()
                  if (v.toLowerCase().startsWith('dc')) {
                    const n = parseInt(v.replace(/[^0-9]/g, ''), 10)
                    onUpdate(i, { saveDC: isNaN(n) ? undefined : n, attackBonus: undefined })
                  } else if (v.startsWith('+') || v.startsWith('-')) {
                    const n = parseInt(v, 10)
                    onUpdate(i, { attackBonus: isNaN(n) ? undefined : n, saveDC: undefined })
                  } else {
                    onUpdate(i, { attackBonus: undefined, saveDC: undefined })
                  }
                }}
                className="bg-teal-deep/50"
              />
            </div>
            <div>
              <Label className="text-parchment-muted text-[10px] uppercase">Reach / Range</Label>
              <Input
                placeholder="5 ft. or 30/120 ft."
                value={a.reach !== undefined ? `${a.reach} ft.` : ''}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10)
                  onUpdate(i, { reach: isNaN(n) ? undefined : n })
                }}
                className="bg-teal-deep/50"
              />
            </div>
            <div>
              <Label className="text-parchment-muted text-[10px] uppercase">Targets</Label>
              <Input
                placeholder="one creature, 15-ft cone"
                value={a.targets || ''}
                onChange={(e) => onUpdate(i, { targets: e.target.value })}
                className="bg-teal-deep/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Damage (e.g. 2d8+4 slashing)"
              value={a.damage || ''}
              onChange={(e) => onUpdate(i, { damage: e.target.value })}
              className="bg-teal-deep/50"
            />
            <Input
              placeholder="Recharge (e.g. 5-6, short rest)"
              value={a.recharge || ''}
              onChange={(e) => onUpdate(i, { recharge: e.target.value })}
              className="bg-teal-deep/50"
            />
          </div>
          {a.saveDC !== undefined && (
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={a.saveAbility || 'DEX'}
                onChange={(v) => onUpdate(i, { saveAbility: v as Ability })}
              >
                {ABILITY_ORDER.map((ab) => (
                  <option key={ab} value={ab}>
                    {ABILITY_LABELS[ab]} save
                  </option>
                ))}
              </Select>
              <Input
                placeholder="Effect on save (e.g. half damage)"
                value={a.saveEffect || ''}
                onChange={(e) => onUpdate(i, { saveEffect: e.target.value })}
                className="bg-teal-deep/50"
              />
            </div>
          )}
          {kind === 'legendary' && (
            <div className="flex items-center gap-2">
              <Label className="text-parchment-muted text-xs">Cost (legendary points):</Label>
              <Input
                type="number"
                min={1}
                max={3}
                value={a.legendaryCost || 1}
                onChange={(e) => onUpdate(i, { legendaryCost: Number(e.target.value) || 1 })}
                className="bg-teal-deep/50 w-20"
              />
            </div>
          )}
          <textarea
            placeholder="Full mechanical description (what does it do, on hit, on save, conditions imposed)"
            value={a.description}
            onChange={(e) => onUpdate(i, { description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment placeholder:text-parchment-muted/50 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none text-sm"
          />
        </CardContent>
      </Card>
    )

    return (
      <div className="space-y-6">
        {/* Multiattack */}
        <div className="space-y-2">
          <Label className="text-parchment">Multiattack <span className="text-parchment-muted/60">(optional)</span></Label>
          <Input
            placeholder='e.g. "The monster makes three attacks: two with its claws and one with its bite."'
            value={multiattack}
            onChange={(e) => setMultiattack(e.target.value)}
            className="bg-teal-deep/50"
          />
          <p className="text-xs text-parchment-muted">
            Describe how many attacks the creature gets per turn and which combinations.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-parchment">
              Actions <span className="text-red-400">*</span>
            </Label>
            <Button type="button" variant="ghost" size="sm" onClick={addAction} className="text-gold gap-1">
              <Plus className="w-3 h-3" /> Add Action
            </Button>
          </div>
          <p className="text-xs text-parchment-muted">
            Suggested attack bonus +{attackBonus}, save DC {saveDC}. Use the &quot;To-Hit / Save&quot; field
            to set either (type <code>+5</code> for attack or <code>DC 14</code> for a save).
          </p>
          {actions.map((a, i) =>
            renderActionEditor(
              a,
              i,
              i === 0 ? 'Basic Attack' : `Action ${i + 1}`,
              updateAction,
              removeAction,
              actions.length > 1,
              'action'
            )
          )}
        </div>

        {/* Bonus Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-parchment">Bonus Actions</Label>
            <Button type="button" variant="ghost" size="sm" onClick={addBonusAction} className="text-gold gap-1">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
          {bonusActions.map((a, i) =>
            renderActionEditor(a, i, `Bonus ${i + 1}`, updateBonusAction, removeBonusAction, true, 'bonus')
          )}
        </div>

        {/* Reactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-parchment">Reactions</Label>
            <Button type="button" variant="ghost" size="sm" onClick={addReaction} className="text-gold gap-1">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
          {reactions.map((a, i) =>
            renderActionEditor(a, i, `Reaction ${i + 1}`, updateReaction, removeReaction, true, 'reaction')
          )}
        </div>

        {/* Legendary Actions (CR 5+) */}
        {cr >= 5 && (
          <div className="space-y-3 p-3 rounded-lg border border-gold/30 bg-gold/5">
            <div className="flex items-center justify-between">
              <Label className="text-gold">Legendary Actions <span className="text-parchment-muted/60 text-xs">(boss creatures)</span></Label>
              <label className="flex items-center gap-2 text-xs text-parchment">
                <input
                  type="checkbox"
                  className="accent-gold"
                  checked={hasLegendary}
                  onChange={(e) => setHasLegendary(e.target.checked)}
                />
                Enable
              </label>
            </div>
            {hasLegendary && (
              <>
                <div className="grid grid-cols-3 gap-2 items-end">
                  <div>
                    <Label className="text-parchment-muted text-xs">Points / round</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={legendaryActions.count}
                      onChange={(e) =>
                        setLegendaryActions((prev) => ({ ...prev, count: Number(e.target.value) || 3 }))
                      }
                      className="bg-teal-deep/50"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-parchment-muted text-xs">Description</Label>
                    <Input
                      placeholder="Can take 3 legendary actions, one at a time, at the end of another creature's turn..."
                      value={legendaryActions.description || ''}
                      onChange={(e) =>
                        setLegendaryActions((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="bg-teal-deep/50"
                    />
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={addLegendaryAction} className="text-gold gap-1">
                  <Plus className="w-3 h-3" /> Add Legendary Action
                </Button>
                {legendaryActions.actions.map((a, i) =>
                  renderActionEditor(
                    a,
                    i,
                    `Legendary ${i + 1}`,
                    updateLegendaryAction,
                    removeLegendaryAction,
                    true,
                    'legendary'
                  )
                )}
              </>
            )}
          </div>
        )}

        {/* Passive Traits — structured */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-parchment">Passive Traits</Label>
            <Button type="button" variant="ghost" size="sm" onClick={addTrait} className="text-gold gap-1">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
          <p className="text-xs text-parchment-muted">
            Always-on features: regeneration, magic resistance, drift aura, pack tactics. Each has a name + description.
          </p>
          {traits.map((t, i) => (
            <Card key={i} className="border-gold/20">
              <CardContent className="pt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Trait name (e.g. Magic Resistance)"
                    value={t.name}
                    onChange={(e) => updateTrait(i, { name: e.target.value })}
                    className="bg-teal-deep/50 flex-1"
                  />
                  {traits.length > 1 && (
                    <button type="button" onClick={() => removeTrait(i)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <textarea
                  placeholder="Description (mechanics + when it triggers)"
                  value={t.description}
                  onChange={(e) => updateTrait(i, { description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment placeholder:text-parchment-muted/50 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none text-sm"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tactics */}
        <div className="space-y-2">
          <Label className="text-parchment">Tactics <span className="text-parchment-muted/60">(DM notes)</span></Label>
          <textarea
            placeholder="How does it fight? Does it open with breath weapon, retreat at half HP, target spellcasters first, summon allies?"
            value={tactics}
            onChange={(e) => setTactics(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment placeholder:text-parchment-muted/50 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none"
          />
          <p className="text-xs text-gold/60 italic">These appear in the DM stat block during quests.</p>
        </div>

        {/* Weaknesses */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-parchment">
              Weaknesses / Counterplay <span className="text-red-400">*</span>
            </Label>
            <Button type="button" variant="ghost" size="sm" onClick={addWeakness} className="text-gold gap-1">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
          <p className="text-xs text-parchment-muted">
            How do players beat it? Without weaknesses, fights feel unfair.
          </p>
          {weaknesses.map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="e.g. Slow, Vulnerable to radiant, Predictable pattern"
                value={w}
                onChange={(e) => updateWeakness(i, e.target.value)}
                className="bg-teal-deep/50 flex-1"
              />
              {weaknesses.length > 1 && (
                <button type="button" onClick={() => removeWeakness(i)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
        <p className="text-sm text-parchment mb-1 font-medium">
          Every monster exists because something broke.
        </p>
        <p className="text-xs text-parchment-muted">
          Monsters are consequences, not random encounters. They tie to the Fray, a Shard, or
          fractured reality. Answer these to ground this horror in the Everloop.
        </p>
      </div>

      {/* What broke here? */}
      <div className="space-y-2">
        <Label className="text-parchment">
          What broke here? <span className="text-red-400">*</span>
        </Label>
        <textarea
          placeholder="An ancient Shard was disturbed during excavation, causing reality to split along its fault lines..."
          value={whatBrokeHere}
          onChange={(e) => setWhatBrokeHere(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment placeholder:text-parchment-muted/50 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none"
        />
        <p className="text-xs text-parchment-muted">
          What event, location, or force in the Fray allowed this monster to exist?
        </p>
      </div>

      {/* What leaked through? */}
      <div className="space-y-2">
        <Label className="text-parchment">
          What leaked through? <span className="text-red-400">*</span>
        </Label>
        <textarea
          placeholder="Pure Drift matter, formless and hungry — it took shape from the fear of the first witnesses..."
          value={whatLeakedThrough}
          onChange={(e) => setWhatLeakedThrough(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment placeholder:text-parchment-muted/50 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none"
        />
        <p className="text-xs text-parchment-muted">
          Was it raw Drift, corrupted local reality, or something shaped from memory?
        </p>
      </div>

      {/* Drawn to */}
      <div className="space-y-2">
        <Label className="text-parchment">
          What is it drawn to? <span className="text-red-400">*</span>
        </Label>
        <textarea
          placeholder="The Shard beneath the ruined temple — it circles the area, never straying far..."
          value={drawnTo}
          onChange={(e) => setDrawnTo(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment placeholder:text-parchment-muted/50 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none"
        />
        <p className="text-xs text-parchment-muted">
          Is it drawn to a Shard, a place, a person, or instability itself?
        </p>
      </div>

      {/* Description (full narrative) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-parchment">
            Full Description <span className="text-red-400">*</span>
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleExpandDescription}
            disabled={isGeneratingText || !name.trim()}
            className="text-gold hover:text-gold/80 gap-1"
          >
            {isGeneratingText ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {description ? 'Expand' : 'Generate'} with AI
          </Button>
        </div>
        <textarea
          placeholder={`Describe what entered through the crack. The Fray connection, its nature, its form, behavior, and why it is monstrous...`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          className="w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment placeholder:text-parchment-muted/50 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none"
        />
      </div>
    </div>
  )

  const renderStep4 = () => {
    const entry = crEntry(cr)
    const previewStats: MonsterStats = {
      size,
      creatureType,
      subtype: subtype.trim() || undefined,
      alignment,
      role,
      cr,
      xp: entry.xp,
      proficiencyBonus: entry.proficiencyBonus,
      hp,
      hitDice: hitDice.trim() || undefined,
      ac,
      acSource: acSource.trim() || undefined,
      movements,
      abilities,
      savingThrows,
      skills,
      damageVulnerabilities,
      damageResistances,
      damageImmunities,
      conditionImmunities,
      senses,
      languages: languages.filter((l) => l.trim()),
      telepathy,
      damagePerRound,
      multiattack: multiattack.trim() || undefined,
      traits: traits.filter((t) => t.name.trim() || t.description.trim()),
      actions: actions.filter((a) => a.name.trim()),
      bonusActions: bonusActions.filter((a) => a.name.trim()),
      reactions: reactions.filter((a) => a.name.trim()),
      legendaryActions: hasLegendary
        ? {
            count: legendaryActions.count,
            description: legendaryActions.description,
            actions: legendaryActions.actions.filter((a) => a.name.trim()),
          }
        : { count: 0, actions: [] },
      tactics: tactics.trim() || undefined,
      weaknesses: weaknesses.filter((w) => w.trim()),
      regionId,
      isOneOff,
      whatBrokeHere,
      whatLeakedThrough,
      drawnTo,
    }
    return (
    <div className="space-y-6">
      {/* Stat Summary Card */}
      <Card className="border-red-500/20">
        <CardContent className="pt-4">
          <h3 className="text-lg font-serif text-parchment mb-3">{name || 'Unnamed Monster'}</h3>
          <p className="text-sm text-gold/70 italic mb-4">{tagline}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="p-2 bg-teal-deep/30 rounded text-center">
              <div className="text-parchment-muted text-xs">Role</div>
              <div className="text-parchment font-medium capitalize">{role}</div>
            </div>
            <div className="p-2 bg-teal-deep/30 rounded text-center">
              <div className="text-parchment-muted text-xs">CR</div>
              <div className="text-parchment font-medium">{cr}</div>
            </div>
            <div className="p-2 bg-teal-deep/30 rounded text-center">
              <div className="text-parchment-muted text-xs">HP</div>
              <div className="text-parchment font-medium">{hp}</div>
            </div>
            <div className="p-2 bg-teal-deep/30 rounded text-center">
              <div className="text-parchment-muted text-xs">AC</div>
              <div className="text-parchment font-medium">{ac}</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-parchment-muted">
            <span className="text-gold/60">Region:</span>{' '}
            {REGIONS.find((r) => r.id === regionId)?.name}
            {isOneOff && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px]">
                ONE-OFF
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Concept Art */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-parchment">Concept Art</Label>
              {!imageUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !name.trim() || !description.trim()}
                  className="text-gold hover:text-gold/80 gap-1"
                >
                  {isGeneratingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                  Generate Art
                </Button>
              )}
            </div>

            {/* Style Picker */}
            <div className="space-y-2">
              <Label className="text-parchment-muted text-xs">Art Style</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ENTITY_ART_STYLE_OPTIONS.map((style) => {
                  const selected = artStyle === style.id
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setArtStyle(style.id as EntityArtStyleId)}
                      disabled={isGeneratingImage}
                      className={`relative p-2.5 rounded-lg border text-left transition-all ${
                        selected
                          ? 'border-gold/50 bg-gold/10 ring-1 ring-gold/30'
                          : 'border-gold/10 bg-teal-deep/40 hover:border-gold/25'
                      }`}
                    >
                      {selected && (
                        <div className="absolute top-1.5 right-1.5">
                          <Check className="w-3.5 h-3.5 text-gold" />
                        </div>
                      )}
                      <div className="text-base mb-0.5">{style.preview}</div>
                      <div className="text-parchment text-xs font-medium">{style.label}</div>
                      <div className="text-parchment-muted text-[10px]">{style.description}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Optional refinement */}
            <div className="space-y-1">
              <Label className="text-parchment-muted text-xs">
                Extra Details <span className="text-parchment-muted/60">(optional)</span>
              </Label>
              <textarea
                value={imageCustomDetails}
                onChange={(e) => setImageCustomDetails(e.target.value)}
                placeholder="e.g. crouched mid-stalk, glowing crimson sigils on its hide, fog rolling from its joints"
                disabled={isGeneratingImage}
                className="w-full bg-teal-deep/50 border border-gold/10 rounded-md text-parchment text-sm p-2.5 h-16 resize-none placeholder:text-parchment-muted/40"
              />
              <p className="text-parchment-muted/60 text-[10px]">
                The description above is the source of truth for what the creature looks like.
                Use this field only to nudge pose, mood, or framing.
              </p>
            </div>

            <div className="aspect-square rounded-lg border border-gold/20 bg-teal-deep/30 overflow-hidden relative">
              {isGeneratingImage ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
                  <p className="text-parchment-muted text-sm">Generating concept art...</p>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name || 'Monster concept art'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-parchment-muted/30 mb-4" />
                  <p className="text-parchment-muted/60 text-sm text-center px-8">
                    Complete lore and description, then generate this horror&apos;s visual design
                  </p>
                </div>
              )}
            </div>

            {imageUrl && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="flex-1 gap-1"
                >
                  <RefreshCw className={`w-4 h-4 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                  disabled
                >
                  <Check className="w-4 h-4" />
                  Kept
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3D Model */}
      <ThreeDPreviewPanel
        mode={imageUrl ? 'image-to-3d' : 'text-to-3d'}
        input={imageUrl || description}
        existingModelUrl={modelUrl}
        onModelGenerated={(glbUrl) => setModelUrl(glbUrl)}
        label="3D Monster Model"
        buttonLabel={imageUrl ? 'Convert to 3D Model' : 'Generate 3D from Description'}
        meshyOptions={{ enable_pbr: true }}
      />

      {/* Full D&D 5e Stat Block Preview */}
      <Card className="border-gold/30">
        <CardContent className="pt-4">
          <div className="text-xs uppercase tracking-wider text-gold/70 mb-3">
            Stat Block Preview — this is what DMs and players will see in quests
          </div>
          <MonsterStatBlock stats={previewStats} name={name || 'Unnamed Monster'} />
        </CardContent>
      </Card>
    </div>
  )
  }

  const stepRenderers = [
    renderStep0,
    renderStep1,
    renderStepAbilities,
    renderStepDefenses,
    renderStep2,
    renderStep3,
    renderStep4,
  ]

  // ═══════════════════════════════════════════════════════════
  // LAYOUT
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => i <= step && setStep(i)}
              className={`text-xs transition-colors ${
                i === step
                  ? 'text-red-400 font-medium'
                  : i < step
                    ? 'text-gold/60 cursor-pointer hover:text-gold'
                    : 'text-parchment-muted/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="h-1 bg-teal-deep/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <Card className="border-gold/20">
        <CardContent className="pt-6">{stepRenderers[step]()}</CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step === 0 ? (
          <Link href="/create/monster" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        ) : (
          <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
        )}

        {step < STEPS.length - 1 ? (
          <Button
            className="flex-1 gap-2"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            className="flex-1 gap-2"
            onClick={handleSave}
            disabled={isSaving || !name.trim() || !tagline.trim() || !description.trim()}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save to Roster
          </Button>
        )}
      </div>

      {/* Load Story Monster Modal */}
      <Dialog open={showLoadModal} onOpenChange={setShowLoadModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Load a Story Monster</DialogTitle>
            <DialogDescription>
              Pick one of your Story Monsters to convert. Its name, tagline, description, and image
              will be loaded — saving will upgrade that entity with full combat stats instead of
              creating a duplicate.
            </DialogDescription>
          </DialogHeader>

          {isLoadingList ? (
            <div className="flex items-center justify-center py-8 text-parchment-muted">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading…
            </div>
          ) : loadListError ? (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {loadListError}
            </div>
          ) : loadList.length === 0 ? (
            <div className="text-center py-8 text-parchment-muted text-sm">
              You don&apos;t have any Story Monsters yet.{' '}
              <Link href="/create/monster/story" className="text-gold hover:underline">
                Create one first
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-2">
              {loadList.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => loadStoryMonster(m)}
                  className="w-full text-left flex gap-3 p-3 rounded-lg border border-gold/20 bg-teal-deep/30 hover:border-gold/60 hover:bg-teal-deep/50 transition-all"
                >
                  {m.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.imageUrl}
                      alt={m.name}
                      className="w-16 h-16 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-teal-deep/50 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-6 h-6 text-parchment-muted" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-parchment font-medium truncate">{m.name}</div>
                    {m.tagline && (
                      <div className="text-xs text-gold/70 italic truncate">{m.tagline}</div>
                    )}
                    {m.description && (
                      <div className="text-xs text-parchment-muted mt-1 line-clamp-2">
                        {m.description}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
