'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createQuest } from '@/lib/actions/quests'
import type { QuestType, DifficultyPreset } from '@/types/campaign'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Compass, Users, Globe, Bot } from 'lucide-react'
import Link from 'next/link'

const QUEST_TYPE_OPTIONS: { value: QuestType; label: string; icon: React.ReactNode; desc: string; min: number; max: number }[] = [
  { value: 'solo', label: 'Solo Quest', icon: <Compass className="w-5 h-5" />, desc: 'Just you and the narrative', min: 1, max: 1 },
  { value: 'paired', label: 'Paired Quest', icon: <Users className="w-5 h-5" />, desc: 'Cooperative for two', min: 2, max: 2 },
  { value: 'party', label: 'Party Quest', icon: <Users className="w-5 h-5" />, desc: 'Full group adventure', min: 3, max: 6 },
  { value: 'public', label: 'Public Quest', icon: <Globe className="w-5 h-5" />, desc: 'Open to all players', min: 1, max: 12 },
  { value: 'ai_guided', label: 'AI-Guided', icon: <Bot className="w-5 h-5" />, desc: 'AI narrates the adventure', min: 1, max: 4 },
]

const DIFFICULTY_OPTIONS: { value: DifficultyPreset; label: string; icon: string; desc: string }[] = [
  { value: 'story_mode', label: 'Story Mode', icon: '🟢', desc: 'Relaxed, narrative-focused' },
  { value: 'standard', label: 'Standard', icon: '🟡', desc: 'Balanced challenge' },
  { value: 'brutal', label: 'Brutal', icon: '🔴', desc: 'Resource scarce, real danger' },
  { value: 'chaos', label: 'Chaos', icon: '⚫', desc: 'Reality bends unpredictably' },
]

const NARRATOR_STYLES = ['atmospheric', 'cinematic', 'minimalist', 'verbose', 'poetic'] as const
const PACING_OPTIONS = ['slow', 'moderate', 'fast', 'frenetic'] as const

export default function CreateQuestPage() {
  const router = useRouter()
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
  })

  function selectQuestType(qt: QuestType) {
    const opt = QUEST_TYPE_OPTIONS.find(o => o.value === qt)
    setForm(f => ({
      ...f,
      quest_type: qt,
      min_participants: opt?.min ?? 1,
      max_participants: opt?.max ?? 1,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Quest title is required')
      return
    }

    setLoading(true)
    setError(null)

    const result = await createQuest({
      title: form.title.trim(),
      description: form.description.trim() || null,
      quest_type: form.quest_type,
      difficulty: form.difficulty,
      estimated_duration: form.estimated_duration,
      min_participants: form.min_participants,
      max_participants: form.max_participants,
      everloop_overlay: form.everloop_overlay,
      ai_narrator_config: {
        style: form.narrator_style,
        pacing: form.narrator_pacing,
        detail_level: 'rich',
        character_interaction: true,
        branching_narrative: form.branching_narrative,
      },
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })

    if (result.success && result.quest) {
      router.push(`/quests/${result.quest.slug}`)
    } else {
      setError(result.error ?? 'Failed to create quest')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/quests" className="flex items-center gap-2 text-sm text-parchment-muted hover:text-parchment transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Quest Portal
      </Link>

      <h1 className="text-4xl font-serif mb-2">
        <span className="text-parchment">Create a</span>{' '}
        <span className="canon-text">Quest</span>
      </h1>
      <p className="text-parchment-muted mb-8">
        Design an Everloop experience for players. No DM required—the system guides the narrative.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
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
            <textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="A fractured memory calls to you from beyond the veil..." rows={4} className="w-full mt-1 rounded-lg bg-teal-rich/50 border border-gold/20 text-parchment placeholder:text-parchment-muted/50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/40" />
          </div>
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
            <input type="checkbox" checked={form.everloop_overlay} onChange={e => setForm(f => ({ ...f, everloop_overlay: e.target.checked }))} className="rounded border-gold/30 bg-teal-rich text-gold focus:ring-gold/40" />
            <span className="text-sm text-parchment">Everloop Overlay (narrative tags, reality shifts, shard interactions)</span>
          </label>
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

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading} className="btn-fantasy">
            {loading ? 'Creating...' : '✦ Create Quest'}
          </Button>
          <Link href="/quests" className="text-sm text-parchment-muted hover:text-parchment transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
