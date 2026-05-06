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

const ThreeDPreviewPanel = dynamic(
  () => import('@/components/3d/three-d-preview-panel').then((mod) => mod.ThreeDPreviewPanel),
  { ssr: false }
)

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export type MonsterRole = 'brute' | 'striker' | 'tank' | 'controller' | 'support'
export type MovementType = 'walk' | 'fly' | 'climb' | 'swim' | 'burrow'

export interface MonsterAction {
  name: string
  description: string
  damage?: string
  actionType: 'action' | 'bonus_action' | 'reaction' | 'legendary'
}

export interface MonsterMovement {
  type: MovementType
  speed: number
}

export interface MonsterStats {
  role: MonsterRole
  cr: number
  hp: number
  ac: number
  damagePerRound: string
  movements: MonsterMovement[]
  actions: MonsterAction[]
  traits: string[]
  weaknesses: string[]
  regionId: RegionId
  isOneOff: boolean
  // Everloop-specific
  whatBrokeHere: string
  whatLeakedThrough: string
  drawnTo: string
}

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

export function MonsterCampaignWizard() {
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

  // Actions
  const [actions, setActions] = useState<MonsterAction[]>([
    { name: '', description: '', damage: '', actionType: 'action' },
  ])

  // Traits & Weaknesses
  const [traits, setTraits] = useState<string[]>([''])
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
      const cleanActions = actions.filter((a) => a.name.trim())
      const cleanTraits = traits.filter((t) => t.trim())
      const cleanWeaknesses = weaknesses.filter((w) => w.trim())

      const result = await saveCampaignMonster({
        name,
        tagline,
        description,
        imageUrl: imageUrl || undefined,
        sourceEntityId: sourceEntityId || undefined,
        monsterStats: {
          role,
          cr,
          hp,
          ac,
          damagePerRound,
          movements,
          actions: cleanActions,
          traits: cleanTraits,
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

  const addTrait = () => setTraits((prev) => [...prev, ''])
  const removeTrait = (i: number) => setTraits((prev) => prev.filter((_, idx) => idx !== i))
  const updateTrait = (i: number, v: string) =>
    setTraits((prev) => prev.map((t, idx) => (idx === i ? v : t)))

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
    const preset = CR_PRESETS.find((p) => p.cr === cr)
    return (
      <div className="space-y-6">
        {/* Challenge Rating */}
        <div className="space-y-2">
          <Label className="text-parchment">
            Challenge Rating (CR) <span className="text-red-400">*</span>
          </Label>
          <Select value={String(cr)} onChange={(v) => setCr(Number(v))}>
            {CR_PRESETS.map((p) => (
              <option key={p.cr} value={p.cr}>
                CR {p.cr} — HP {p.hp} | AC {p.ac} | DMG/Round {p.dmg}
              </option>
            ))}
          </Select>
          <p className="text-xs text-parchment-muted">
            CR = a fair fight for a party of 4 at that level. This is your balance anchor.
          </p>
        </div>

        {/* HP */}
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
          {preset && (
            <p className="text-xs text-gold/60">
              Suggested for CR {cr}: {preset.hp} HP
            </p>
          )}
          <p className="text-xs text-parchment-muted">
            Low HP → quick, dangerous fights. High HP → drawn-out encounters.
          </p>
        </div>

        {/* AC */}
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
          {preset && (
            <p className="text-xs text-gold/60">
              Suggested for CR {cr}: {preset.ac} AC
            </p>
          )}
          <p className="text-xs text-parchment-muted">
            High AC → frustrating, precise fight. Low AC → players hit often, more action.
          </p>
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
          {preset && (
            <p className="text-xs text-gold/60">
              Suggested for CR {cr}: {preset.dmg} damage/round
            </p>
          )}
          <p className="text-xs text-parchment-muted">
            Think in damage per round, not per attack. Too low → boring. Too high → unfair.
          </p>
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

  const renderStep2 = () => (
    <div className="space-y-6">
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
          Every monster needs a basic attack and 1-3 signature abilities. This is what players remember.
        </p>

        {actions.map((a, i) => (
          <Card key={i} className="border-gold/20">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-parchment font-medium">
                  {i === 0 ? 'Basic Attack' : `Action ${i + 1}`}
                </span>
                {actions.length > 1 && (
                  <button type="button" onClick={() => removeAction(i)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Attack name"
                  value={a.name}
                  onChange={(e) => updateAction(i, { name: e.target.value })}
                  className="bg-teal-deep/50"
                />
                <Select
                  value={a.actionType}
                  onChange={(v) => updateAction(i, { actionType: v as MonsterAction['actionType'] })}
                >
                  <option value="action">Action</option>
                  <option value="bonus_action">Bonus Action</option>
                  <option value="reaction">Reaction</option>
                  <option value="legendary">Legendary Action</option>
                </Select>
              </div>
              <Input
                placeholder="Damage (e.g. 2d8+4 slashing)"
                value={a.damage || ''}
                onChange={(e) => updateAction(i, { damage: e.target.value })}
                className="bg-teal-deep/50"
              />
              <textarea
                placeholder="What does this action do? Describe mechanics and flavor."
                value={a.description}
                onChange={(e) => updateAction(i, { description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment placeholder:text-parchment-muted/50 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none text-sm"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Traits */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-parchment">Passive Traits</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addTrait} className="text-gold gap-1">
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
        <p className="text-xs text-parchment-muted">
          Always-on features: damage resistances, immunities, special rules. Keep minimal but meaningful.
        </p>
        {traits.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              placeholder="e.g. Resistance to fire, Can't be knocked prone"
              value={t}
              onChange={(e) => updateTrait(i, e.target.value)}
              className="bg-teal-deep/50 flex-1"
            />
            {traits.length > 1 && (
              <button type="button" onClick={() => removeTrait(i)} className="text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
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

  const renderStep4 = () => (
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
    </div>
  )

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4]

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
