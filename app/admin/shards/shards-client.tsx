'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createShard, updateShard, deleteShard } from '@/lib/actions/shards'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Diamond,
  MapPin,
  Zap,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type {
  ShardRecord,
  ShardFormState,
  ShardRegion,
  ShardExpression,
  ShardSituation,
  ShardSiteType,
  ShardInsert,
  ShardUpdate,
} from '@/types/shard'
import {
  SHARD_REGION_LABELS,
  EXPRESSION_CATEGORIES,
  SITUATION_CATEGORIES,
  formatEnumLabel,
} from '@/types/shard'

interface ShardsClientProps {
  shards: ShardRecord[]
}

const FORM_STATES: ShardFormState[] = ['raw', 'embedded', 'bound', 'buried', 'fractured']

const FORM_STATE_COLORS: Record<ShardFormState, string> = {
  raw: 'bg-red-500/20 text-red-300 border-red-500/30',
  embedded: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  bound: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  buried: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  fractured: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

const STATE_COLORS: Record<string, string> = {
  dormant: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  awakening: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  active: 'bg-green-500/20 text-green-300 border-green-500/30',
  corrupted: 'bg-red-500/20 text-red-300 border-red-500/30',
  shattered: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  transcended: 'bg-gold/20 text-gold border-gold/30',
}

const REGIONS: ShardRegion[] = [
  'virelay_coast',
  'deyune_steps',
  'varnhalt_frontier',
  'virelay_deep_forests',
  'polar_tundra',
  'ocean_deep_water',
  'fray_zones',
  'unknown_deep',
]

const SITE_TYPES: ShardSiteType[] = [
  'city', 'ruin', 'forest', 'mountain', 'underground', 'ocean',
  'structure', 'fray_zone', 'wilderness', 'coast', 'ice_field',
  'volcanic', 'cavern', 'reef', 'abyss', 'plains', 'grove',
  'swamp', 'settlement', 'monastery', 'library', 'market',
  'estate', 'cathedral', 'cliff', 'ridge', 'hills', 'valley',
  'trench', 'rift', 'vault',
]

interface ShardFormData {
  name: string
  shard_number: number
  description: string
  power_description: string
  visual_description: string
  form_state: ShardFormState
  region: ShardRegion
  site_types: ShardSiteType[]
  location_description: string
  expressions: ShardExpression[]
  situations: ShardSituation[]
  state: 'dormant' | 'awakening' | 'active' | 'corrupted' | 'shattered' | 'transcended'
  power_level: number
}

const DEFAULT_FORM: ShardFormData = {
  name: '',
  shard_number: 1,
  description: '',
  power_description: '',
  visual_description: '',
  form_state: 'raw',
  region: 'virelay_coast',
  site_types: [],
  location_description: '',
  expressions: [],
  situations: [],
  state: 'dormant',
  power_level: 1,
}

export function ShardsClient({ shards }: ShardsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [formFilter, setFormFilter] = useState<string>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editingShard, setEditingShard] = useState<ShardRecord | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ShardFormData>(DEFAULT_FORM)

  // Filters
  const filtered = shards.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRegion = regionFilter === 'all' || s.region === regionFilter
    const matchesForm = formFilter === 'all' || s.form_state === formFilter
    return matchesSearch && matchesRegion && matchesForm
  })

  // Stats
  const regionCounts: Record<string, number> = {}
  for (const s of shards) {
    const r = s.region || 'unknown'
    regionCounts[r] = (regionCounts[r] || 0) + 1
  }

  function openCreate() {
    setEditingShard(null)
    const nextNumber = shards.length ? Math.max(...shards.map(s => s.shard_number || 0)) + 1 : 1
    setFormData({ ...DEFAULT_FORM, shard_number: nextNumber })
    setShowCreate(true)
    setError(null)
  }

  function openEdit(shard: ShardRecord) {
    setEditingShard(shard)
    setFormData({
      name: shard.name,
      shard_number: shard.shard_number || 0,
      description: shard.description || '',
      power_description: shard.power_description || '',
      visual_description: shard.visual_description || '',
      form_state: shard.form_state || 'raw',
      region: shard.region || 'virelay_coast',
      site_types: shard.site_types || [],
      location_description: shard.location_description || '',
      expressions: shard.expressions || [],
      situations: shard.situations || [],
      state: shard.state || 'dormant',
      power_level: shard.power_level || 1,
    })
    setShowCreate(true)
    setError(null)
  }

  function closeForm() {
    setShowCreate(false)
    setEditingShard(null)
    setError(null)
  }

  function handleSubmit() {
    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    startTransition(async () => {
      try {
        if (editingShard) {
          const update: ShardUpdate = {
            name: formData.name,
            shard_number: formData.shard_number,
            description: formData.description || null,
            power_description: formData.power_description || null,
            visual_description: formData.visual_description || null,
            form_state: formData.form_state,
            region: formData.region,
            site_types: formData.site_types,
            location_description: formData.location_description || null,
            expressions: formData.expressions,
            situations: formData.situations,
            state: formData.state,
            power_level: formData.power_level,
          }
          const result = await updateShard(editingShard.id, update)
          if (result.error) {
            setError(result.error)
            return
          }
        } else {
          const insert: ShardInsert = {
            name: formData.name,
            shard_number: formData.shard_number,
            description: formData.description || null,
            power_description: formData.power_description || null,
            visual_description: formData.visual_description || null,
            form_state: formData.form_state,
            region: formData.region,
            site_types: formData.site_types,
            location_description: formData.location_description || null,
            expressions: formData.expressions,
            situations: formData.situations,
            state: formData.state,
            power_level: formData.power_level,
          }
          const result = await createShard(insert)
          if (result.error) {
            setError(result.error)
            return
          }
        }
        closeForm()
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    })
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete shard "${name}"? This cannot be undone.`)) return

    startTransition(async () => {
      const result = await deleteShard(id)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  function toggleArrayItem<T extends string>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {REGIONS.map(r => (
          <button
            key={r}
            onClick={() => setRegionFilter(regionFilter === r ? 'all' : r)}
            className={`p-3 rounded-lg border text-center transition-colors ${
              regionFilter === r
                ? 'border-gold/50 bg-gold/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <div className="text-2xl font-bold text-gold">{regionCounts[r] || 0}</div>
            <div className="text-xs text-parchment-muted truncate">{SHARD_REGION_LABELS[r]}</div>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-muted" />
          <Input
            placeholder="Search shards..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>

        <select
          value={formFilter}
          onChange={e => setFormFilter(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-parchment"
        >
          <option value="all">All Forms</option>
          {FORM_STATES.map(f => (
            <option key={f} value={f}>{formatEnumLabel(f)}</option>
          ))}
        </select>

        <Button onClick={openCreate} className="bg-gold/20 text-gold hover:bg-gold/30 border border-gold/30">
          <Plus className="w-4 h-4 mr-2" />
          Create Shard
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#1a1a2e] border border-white/10 rounded-xl p-6 my-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif text-parchment">
                {editingShard ? `Edit: ${editingShard.name}` : 'Create New Shard'}
              </h2>
              <button onClick={closeForm} className="text-parchment-muted hover:text-parchment">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Layer 1: Identity */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gold flex items-center gap-2">
                <Diamond className="w-4 h-4" /> Identity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-parchment-muted mb-1 block">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="Bell Tree"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <label className="text-xs text-parchment-muted mb-1 block">Shard # *</label>
                  <Input
                    type="number"
                    value={formData.shard_number}
                    onChange={e => setFormData(p => ({ ...p, shard_number: parseInt(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-parchment-muted mb-1 block">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-parchment resize-none"
                  placeholder="A living bell-shaped tree in a coastal grove, its branches hum with resonant memory..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-parchment-muted mb-1 block">Power Description</label>
                  <textarea
                    value={formData.power_description}
                    onChange={e => setFormData(p => ({ ...p, power_description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-parchment resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-parchment-muted mb-1 block">Visual Description</label>
                  <textarea
                    value={formData.visual_description}
                    onChange={e => setFormData(p => ({ ...p, visual_description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-parchment resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Layer 1: State */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gold flex items-center gap-2">
                <Diamond className="w-4 h-4" /> Layer 1 &mdash; State
              </h3>
              <div className="flex flex-wrap gap-2">
                {FORM_STATES.map(f => (
                  <button
                    key={f}
                    onClick={() => setFormData(p => ({ ...p, form_state: f }))}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                      formData.form_state === f
                        ? FORM_STATE_COLORS[f]
                        : 'border-white/10 text-parchment-muted hover:border-white/20'
                    }`}
                  >
                    {formatEnumLabel(f)}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs text-parchment-muted mb-1 block">Narrative State</label>
                  <select
                    value={formData.state}
                    onChange={e => setFormData(p => ({ ...p, state: e.target.value as ShardFormData['state'] }))}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-sm text-parchment"
                  >
                    {['dormant', 'awakening', 'active', 'corrupted', 'shattered', 'transcended'].map(s => (
                      <option key={s} value={s}>{formatEnumLabel(s)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-parchment-muted mb-1 block">Power Level (1-10)</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.power_level}
                    onChange={e => setFormData(p => ({ ...p, power_level: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)) }))}
                    className="w-20 bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </div>

            {/* Layer 2: Location */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gold flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Layer 2 &mdash; Location
              </h3>
              <div>
                <label className="text-xs text-parchment-muted mb-1 block">Region *</label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map(r => (
                    <button
                      key={r}
                      onClick={() => setFormData(p => ({ ...p, region: r }))}
                      className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                        formData.region === r
                          ? 'border-gold/50 bg-gold/10 text-gold'
                          : 'border-white/10 text-parchment-muted hover:border-white/20'
                      }`}
                    >
                      {SHARD_REGION_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-parchment-muted mb-1 block">Site Types (pick 1-2)</label>
                <div className="flex flex-wrap gap-1.5">
                  {SITE_TYPES.map(s => (
                    <button
                      key={s}
                      onClick={() => setFormData(p => ({ ...p, site_types: toggleArrayItem(p.site_types, s) }))}
                      className={`px-2 py-1 rounded text-xs border transition-colors ${
                        formData.site_types.includes(s)
                          ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                          : 'border-white/10 text-parchment-muted hover:border-white/20'
                      }`}
                    >
                      {formatEnumLabel(s)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-parchment-muted mb-1 block">Location Notes</label>
                <Input
                  value={formData.location_description}
                  onChange={e => setFormData(p => ({ ...p, location_description: e.target.value }))}
                  placeholder="Coastal forest grove near the Bellroot edge..."
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            {/* Layer 3: Expression */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gold flex items-center gap-2">
                <Zap className="w-4 h-4" /> Layer 3 &mdash; Expression (pick 1-2)
              </h3>
              {Object.entries(EXPRESSION_CATEGORIES).map(([cat, exprs]) => (
                <div key={cat}>
                  <div className="text-xs text-parchment-muted mb-1">{formatEnumLabel(cat)}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {exprs.map(e => (
                      <button
                        key={e}
                        onClick={() => setFormData(p => ({ ...p, expressions: toggleArrayItem(p.expressions, e) }))}
                        className={`px-2 py-1 rounded text-xs border transition-colors ${
                          formData.expressions.includes(e)
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                            : 'border-white/10 text-parchment-muted hover:border-white/20'
                        }`}
                      >
                        {formatEnumLabel(e)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Layer 4: Situation */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gold flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Layer 4 &mdash; Situation (pick 1-2)
              </h3>
              {Object.entries(SITUATION_CATEGORIES).map(([cat, sits]) => (
                <div key={cat}>
                  <div className="text-xs text-parchment-muted mb-1">{formatEnumLabel(cat)}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {sits.map(s => (
                      <button
                        key={s}
                        onClick={() => setFormData(p => ({ ...p, situations: toggleArrayItem(p.situations, s) }))}
                        className={`px-2 py-1 rounded text-xs border transition-colors ${
                          formData.situations.includes(s)
                            ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                            : 'border-white/10 text-parchment-muted hover:border-white/20'
                        }`}
                      >
                        {formatEnumLabel(s)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3 ml-auto">
                <Button variant="outline" onClick={closeForm} className="border-white/10">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="bg-gold/20 text-gold hover:bg-gold/30 border border-gold/30"
                >
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingShard ? 'Update Shard' : 'Create Shard'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shard List */}
      <div className="text-sm text-parchment-muted mb-2">
        {filtered.length} shard{filtered.length !== 1 ? 's' : ''}
        {regionFilter !== 'all' && ` in ${SHARD_REGION_LABELS[regionFilter as ShardRegion]}`}
        {formFilter !== 'all' && ` (${formatEnumLabel(formFilter)})`}
      </div>

      <div className="space-y-2">
        {filtered.map(shard => {
          const isExpanded = expandedId === shard.id

          return (
            <div
              key={shard.id}
              className="border border-white/10 rounded-lg bg-white/5 overflow-hidden"
            >
              {/* Row */}
              <div
                className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white/5"
                onClick={() => setExpandedId(isExpanded ? null : shard.id)}
              >
                <span className="text-xs text-parchment-muted w-8 text-right font-mono">
                  #{shard.shard_number || '?'}
                </span>
                <Diamond className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="font-medium text-parchment flex-1">{shard.name}</span>

                {shard.form_state && (
                  <Badge variant="outline" className={`text-xs ${FORM_STATE_COLORS[shard.form_state] || ''}`}>
                    {formatEnumLabel(shard.form_state)}
                  </Badge>
                )}
                {shard.state && (
                  <Badge variant="outline" className={`text-xs ${STATE_COLORS[shard.state] || ''}`}>
                    {formatEnumLabel(shard.state)}
                  </Badge>
                )}
                {shard.region && (
                  <span className="text-xs text-parchment-muted hidden lg:inline">
                    {SHARD_REGION_LABELS[shard.region]}
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={e => { e.stopPropagation(); openEdit(shard) }}
                    className="p-1.5 rounded hover:bg-white/10 text-parchment-muted hover:text-parchment"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(shard.id, shard.name) }}
                    className="p-1.5 rounded hover:bg-red-500/10 text-parchment-muted hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-parchment-muted" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-parchment-muted" />
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-3 text-sm">
                  {shard.description && (
                    <p className="text-parchment-muted">{shard.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gold mb-1">Form State</div>
                      <div className="text-parchment">{formatEnumLabel(shard.form_state || 'raw')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gold mb-1">Region</div>
                      <div className="text-parchment">{SHARD_REGION_LABELS[shard.region] || 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gold mb-1">Power Level</div>
                      <div className="text-parchment">{shard.power_level}/10</div>
                    </div>
                    <div>
                      <div className="text-xs text-gold mb-1">Narrative State</div>
                      <div className="text-parchment">{formatEnumLabel(shard.state || 'dormant')}</div>
                    </div>
                  </div>

                  {shard.site_types?.length > 0 && (
                    <div>
                      <div className="text-xs text-gold mb-1">Site Types</div>
                      <div className="flex flex-wrap gap-1">
                        {shard.site_types.map(s => (
                          <Badge key={s} variant="outline" className="text-xs border-cyan-500/30 text-cyan-300">
                            {formatEnumLabel(s)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {shard.expressions?.length > 0 && (
                    <div>
                      <div className="text-xs text-gold mb-1">Expressions</div>
                      <div className="flex flex-wrap gap-1">
                        {shard.expressions.map(e => (
                          <Badge key={e} variant="outline" className="text-xs border-emerald-500/30 text-emerald-300">
                            {formatEnumLabel(e)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {shard.situations?.length > 0 && (
                    <div>
                      <div className="text-xs text-gold mb-1">Situations</div>
                      <div className="flex flex-wrap gap-1">
                        {shard.situations.map(s => (
                          <Badge key={s} variant="outline" className="text-xs border-amber-500/30 text-amber-300">
                            {formatEnumLabel(s)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {shard.power_description && (
                    <div>
                      <div className="text-xs text-gold mb-1">Power</div>
                      <p className="text-parchment-muted">{shard.power_description}</p>
                    </div>
                  )}

                  {shard.location_description && (
                    <div>
                      <div className="text-xs text-gold mb-1">Location Notes</div>
                      <p className="text-parchment-muted">{shard.location_description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-parchment-muted">
          <Diamond className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No shards found. {shards.length === 0 ? 'Create or seed shards to get started.' : 'Try adjusting filters.'}</p>
        </div>
      )}
    </div>
  )
}
