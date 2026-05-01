'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createQuest } from '@/lib/actions/quests'
import type { QuestType, DifficultyPreset } from '@/types/campaign'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight, Compass, Users, Globe, Bot, MapPin, Workflow, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { REGIONS } from '@/lib/data/regions'
import QuestFlowBuilder, { defaultGraph, type QuestFlowGraph } from '@/components/quests/quest-flow-builder'

const QUEST_TYPE_OPTIONS: { value: QuestType; label: string; icon: React.ReactNode; desc: string; min: number; max: number }[] = [
  { value: 'solo', label: 'Solo Quest', icon: <Compass className="w-5 h-5" />, desc: 'Just you and the narrative', min: 1, max: 1 },
  { value: 'paired', label: 'Paired Quest', icon: <Users className="w-5 h-5" />, desc: 'Cooperative for two', min: 2, max: 2 },
  { value: 'party', label: 'Party Quest', icon: <Users className="w-5 h-5" />, desc: 'Full group adventure', min: 3, max: 6 },
  { value: 'public', label: 'Public Quest', icon: <Globe className="w-5 h-5" />, desc: 'Open to all players', min: 1, max: 12 },
  { value: 'ai_guided', label: 'AI-Guided', icon: <Bot className="w-5 h-5" />, desc: 'AI narrates the adventure', min: 1, max: 4 },
]

const DIFFICULTY_OPTIONS: { value: DifficultyPreset; label: string; icon: string; desc: string }[] = [
  { value: 'story_mode', label: 'Story Mode', icon: '🟢', desc: 'Narrative-focused, the Shard reveals itself gently' },
  { value: 'standard', label: 'Standard', icon: '🟡', desc: 'Balanced challenge, the world tests those who seek' },
  { value: 'brutal', label: 'Brutal', icon: '🔴', desc: 'Resources scarce, Monsters stir, the Fray runs deep' },
  { value: 'chaos', label: 'Chaos', icon: '⚫', desc: 'Reality fractures — the Drift presses through' },
]

const NARRATOR_STYLES = ['atmospheric', 'cinematic', 'minimalist', 'verbose', 'poetic'] as const
const PACING_OPTIONS = ['slow', 'moderate', 'fast', 'frenetic'] as const

type Step = 'foundation' | 'flow'

export default function CreateQuestPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('foundation')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    quest_type: 'solo' as QuestType,
    difficulty: 'standard' as DifficultyPreset,
    estimated_duration: '1-2 hours',
    min_participants: 1,
    max_participants: 1,
    everloop_overlay: true,
    narrator_style: 'atmospheric' as string,
    narrator_pacing: 'moderate' as string,
    branching_narrative: true,
    tags: '',
    regions: [] as string[],
    location_ids: [] as string[],
    publish_now: true,
  })

  const [graph, setGraph] = useState<QuestFlowGraph>(() => defaultGraph())

  const [locations, setLocations] = useState<Array<{id: string; name: string; type: string; tags: string[]}>>([])
  useEffect(() => {
    fetch('/api/map/locations')
      .then(r => r.json())
      .then(data => {
        if (data.locations) {
          setLocations(data.locations.filter((loc: { type: string }) => loc.type === 'location'))
        }
      })
      .catch(() => {})
  }, [])

  function getLocationRegion(tags: string[]): string | null {
    const regionIds = REGIONS.map(r => r.id) as string[]
    return tags.find(t => regionIds.includes(t)) ?? null
  }

  function selectQuestType(qt: QuestType) {
    const opt = QUEST_TYPE_OPTIONS.find(o => o.value === qt)
    setForm(f => ({
      ...f,
      quest_type: qt,
      min_participants: opt?.min ?? 1,
      max_participants: opt?.max ?? 1,
    }))
  }

  function handleAdvance(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Quest title is required')
      return
    }
    setError(null)
    setStep('flow')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleCreate() {
    setLoading(true)
    setError(null)

    const quest_structure = {
      acts: [],
      encounters: graph.nodes
        .filter(n => n.data.kind === 'encounter')
        .map(n => ({ id: n.id, label: n.data.label, monsters: n.data.monsters ?? '' })),
      rewards: graph.nodes
        .filter(n => n.data.kind === 'reward')
        .map(n => ({ id: n.id, label: n.data.label, reward: n.data.reward ?? '' })),
      branching_points: graph.nodes
        .filter(n => n.data.kind === 'choice')
        .map(n => ({ id: n.id, label: n.data.label, outcomes: n.data.outcomes ?? '' })),
      flow: {
        nodes: graph.nodes.map(n => ({
          id: n.id,
          kind: n.data.kind,
          position: n.position,
          data: n.data,
        })),
        edges: graph.edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle ?? null,
          targetHandle: e.targetHandle ?? null,
        })),
      },
    }

    const result = await createQuest({
      title: form.title.trim(),
      description: form.description.trim() || null,
      quest_type: form.quest_type,
      difficulty: form.difficulty,
      estimated_duration: form.estimated_duration,
      min_participants: form.min_participants,
      max_participants: form.max_participants,
      everloop_overlay: true,
      ai_narrator_config: {
        style: form.narrator_style,
        pacing: form.narrator_pacing,
        detail_level: 'rich',
        character_interaction: true,
        branching_narrative: form.branching_narrative,
      },
      tags: [
        ...form.tags.split(',').map(t => t.trim()).filter(Boolean),
        ...form.regions.map(r => `region:${r}`),
      ],
      referenced_entities: form.location_ids,
      metadata: { regions: form.regions, location_ids: form.location_ids },
      quest_structure,
      status: form.publish_now ? 'available' : 'draft',
    })

    if (result.success && result.quest) {
      router.push(`/quests/${result.quest.slug}`)
    } else {
      setError(result.error ?? 'Failed to create quest')
      setLoading(false)
    }
  }

  const StepHeader = (
    <div className="mb-8">
      <Link href="/quests" className="flex items-center gap-2 text-sm text-parchment-muted hover:text-parchment transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Quest Portal
      </Link>

      <h1 className="text-4xl font-serif mb-2">
        <span className="text-parchment">Create a</span>{' '}
        <span className="canon-text">Quest</span>
      </h1>
      <p className="text-parchment-muted mb-6">
        Design an Everloop experience for players. Every quest in the Everloop ultimately bends toward a Shard — what hidden force shapes yours?
      </p>

      <div className="flex items-center gap-2 text-xs">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
          step === 'foundation' ? 'border-gold/60 bg-gold/10 text-gold' : 'border-gold/30 text-parchment-muted'
        }`}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>1. Foundation</span>
        </div>
        <div className="flex-1 h-px bg-gold/20 max-w-[60px]" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
          step === 'flow' ? 'border-gold/60 bg-gold/10 text-gold' : 'border-gold/30 text-parchment-muted'
        }`}>
          <Workflow className="w-3.5 h-3.5" />
          <span>2. Quest Flow</span>
        </div>
      </div>
    </div>
  )

  if (step === 'flow') {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        {StepHeader}

        <div className="mb-6">
          <h2 className="text-2xl font-serif text-parchment mb-1">
            Design <span className="text-gold">{form.title || 'your quest'}</span>
          </h2>
          <p className="text-sm text-parchment-muted max-w-3xl">
            Lay out the quest as a flow of beats. Drag from the palette, then connect each beat from
            its lower handle to the next beat&apos;s upper handle. Branches that fork from a Choice
            should rejoin the main thread before the Goal — every path needs a way back to the heart of the quest.
          </p>
        </div>

        <QuestFlowBuilder initial={graph} onChange={setGraph} />

        {/* Publish toggle */}
        <div className="mt-6 p-4 rounded-lg border border-gold/20 bg-teal-rich/30 flex items-start gap-3">
          <input
            id="publish_now"
            type="checkbox"
            checked={form.publish_now}
            onChange={e => setForm(f => ({ ...f, publish_now: e.target.checked }))}
            className="mt-1 rounded border-gold/30 bg-teal-rich text-gold focus:ring-gold/40"
          />
          <label htmlFor="publish_now" className="flex-1 cursor-pointer">
            <div className="text-sm text-parchment font-medium">
              {form.publish_now ? 'Publish now — quest is immediately playable' : 'Save as draft — only you can see it'}
            </div>
            <div className="text-xs text-parchment-muted mt-0.5">
              {form.publish_now
                ? 'Other players will be able to find and join this quest from the Quest Portal.'
                : 'You can refine the flow later and publish from the quest detail page when ready.'}
            </div>
          </label>
        </div>

        {error && (
          <div className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => setStep('foundation')}
            className="flex items-center gap-2 text-sm text-parchment-muted hover:text-parchment transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Foundation
          </button>
          <div className="flex items-center gap-3">
            <Link href="/quests" className="text-sm text-parchment-muted hover:text-parchment transition-colors">
              Cancel
            </Link>
            <Button onClick={handleCreate} disabled={loading} className="btn-fantasy">
              {loading ? 'Weaving the Loop...' : '✦ Create Quest'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {StepHeader}

      <form onSubmit={handleAdvance} className="space-y-8">
        {/* Quest Type */}
        <div>
          <Label className="text-parchment mb-3 block text-lg font-serif">Quest Type</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {QUEST_TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => selectQuestType(opt.value)}
                className={`story-card text-left p-4 transition-all ${
                  form.quest_type === opt.value ? 'border-gold/60 shadow-lg shadow-gold/10' : 'hover:border-gold/30'
                }`}
              >
                <div className="flex items-center gap-2 text-gold mb-2">{opt.icon}</div>
                <span className="text-sm font-serif text-parchment">{opt.label}</span>
                <p className="text-xs text-parchment-muted mt-1">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-parchment">Quest Title</Label>
            <Input id="title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="The Dreamer's Labyrinth..." className="mt-1 bg-teal-rich/50 border-gold/20 text-parchment placeholder:text-parchment-muted/50" />
          </div>
          <div>
            <Label htmlFor="description" className="text-parchment">Description</Label>
            <textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What pulls players into this quest? A fractured memory, a missing scholar, a ruin that should have collapsed long ago... something beneath the surface is holding this story together." rows={4} className="w-full mt-1 rounded-lg bg-teal-rich/50 border border-gold/20 text-parchment placeholder:text-parchment-muted/50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/40" />
          </div>
        </div>

        {/* Regions */}
        <div>
          <Label className="text-parchment mb-3 block text-lg font-serif">Regions</Label>
          <p className="text-xs text-parchment-muted mb-3">Where in the Everloop does this quest take place? Every region holds Shards in unknown numbers — choose where the instability runs deepest.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {REGIONS.map(region => (
              <button
                key={region.id}
                type="button"
                onClick={() => setForm(f => ({
                  ...f,
                  regions: f.regions.includes(region.id)
                    ? f.regions.filter(r => r !== region.id)
                    : [...f.regions, region.id]
                }))}
                className={`story-card text-left p-3 transition-all ${
                  form.regions.includes(region.id) ? 'border-gold/60 shadow-lg shadow-gold/10' : 'hover:border-gold/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: region.color }} />
                  <span className="text-sm text-parchment font-medium">{region.name}</span>
                </div>
                <p className="text-xs text-parchment-muted line-clamp-2">{region.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div>
          <Label className="text-parchment mb-3 block text-lg font-serif">Locations</Label>
          <p className="text-xs text-parchment-muted mb-3">
            Select canonical locations. {form.regions.length > 0 ? 'Showing locations in selected regions.' : 'Select regions above to filter.'}
          </p>
          {(() => {
            const filtered = locations.filter(loc => {
              if (form.regions.length === 0) return true
              const locRegion = getLocationRegion(loc.tags)
              return locRegion && form.regions.includes(locRegion)
            })
            if (filtered.length === 0) return (
              <p className="text-sm text-parchment-muted/60 italic">No canonical locations found{form.regions.length > 0 ? ' in selected regions' : ''}. Locations grow as writers publish canon stories.</p>
            )
            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {filtered.map(loc => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      location_ids: f.location_ids.includes(loc.id)
                        ? f.location_ids.filter(id => id !== loc.id)
                        : [...f.location_ids, loc.id]
                    }))}
                    className={`text-left p-3 rounded-lg border transition-all text-sm ${
                      form.location_ids.includes(loc.id)
                        ? 'border-gold/60 bg-gold/10 text-gold'
                        : 'border-gold/10 bg-teal-rich/30 text-parchment-muted hover:border-gold/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{loc.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )
          })()}
        </div>

        {/* Difficulty */}
        <div>
          <Label className="text-parchment mb-3 block text-lg font-serif">Difficulty</Label>
          <div className="grid grid-cols-2 gap-3">
            {DIFFICULTY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, difficulty: opt.value }))}
                className={`story-card text-left p-4 transition-all ${
                  form.difficulty === opt.value ? 'border-gold/60 shadow-lg shadow-gold/10' : 'hover:border-gold/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{opt.icon}</span>
                  <span className="font-serif text-parchment">{opt.label}</span>
                </div>
                <p className="text-xs text-parchment-muted">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="estimated_duration" className="text-parchment">Estimated Duration</Label>
            <Input id="estimated_duration" value={form.estimated_duration} onChange={e => setForm(f => ({ ...f, estimated_duration: e.target.value }))} placeholder="1-2 hours" className="mt-1 bg-teal-rich/50 border-gold/20 text-parchment" />
          </div>
          <div>
            <Label htmlFor="max_participants" className="text-parchment">Max Participants</Label>
            <Input id="max_participants" type="number" min={form.min_participants} max={20} value={form.max_participants} onChange={e => setForm(f => ({ ...f, max_participants: parseInt(e.target.value) || 1 }))} className="mt-1 bg-teal-rich/50 border-gold/20 text-parchment" />
          </div>
        </div>

        {/* AI Narrator Config */}
        <div className="space-y-4">
          <Label className="text-parchment mb-2 block text-lg font-serif">AI Narrator Settings</Label>
          <div>
            <Label className="text-parchment text-sm mb-2 block">Narrator Style</Label>
            <div className="flex flex-wrap gap-2">
              {NARRATOR_STYLES.map(style => (
                <button key={style} type="button" onClick={() => setForm(f => ({ ...f, narrator_style: style }))} className={`px-3 py-1.5 rounded-full text-xs transition-all border ${form.narrator_style === style ? 'border-gold/60 bg-gold/10 text-gold' : 'border-gold/10 text-parchment-muted hover:border-gold/30'}`}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-parchment text-sm mb-2 block">Pacing</Label>
            <div className="flex flex-wrap gap-2">
              {PACING_OPTIONS.map(pace => (
                <button key={pace} type="button" onClick={() => setForm(f => ({ ...f, narrator_pacing: pace }))} className={`px-3 py-1.5 rounded-full text-xs transition-all border ${form.narrator_pacing === pace ? 'border-gold/60 bg-gold/10 text-gold' : 'border-gold/10 text-parchment-muted hover:border-gold/30'}`}>
                  {pace.charAt(0).toUpperCase() + pace.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.branching_narrative} onChange={e => setForm(f => ({ ...f, branching_narrative: e.target.checked }))} className="rounded border-gold/30 bg-teal-rich text-gold focus:ring-gold/40" />
            <span className="text-sm text-parchment">Branching Narrative (player choices create story forks)</span>
          </label>
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="tags" className="text-parchment">Tags (comma-separated)</Label>
          <Input id="tags" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="mystery, horror, short, beginner-friendly" className="mt-1 bg-teal-rich/50 border-gold/20 text-parchment placeholder:text-parchment-muted/50" />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link href="/quests" className="text-sm text-parchment-muted hover:text-parchment transition-colors">
            Cancel
          </Link>
          <Button type="submit" className="btn-fantasy flex items-center gap-2">
            Continue to Quest Flow
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
