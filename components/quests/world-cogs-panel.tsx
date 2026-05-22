'use client'

import { useEffect, useState, useTransition } from 'react'
import { Plus, Eye, EyeOff, Trash2, ChevronRight, Loader2, Cog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  listWorldCogs,
  createWorldCog,
  updateWorldCog,
  deleteWorldCog,
  advanceWorldCog,
} from '@/lib/actions/quests'
import type { WorldCog, CogTempo } from '@/types/quest'

const TEMPO_STYLES: Record<CogTempo, { label: string; color: string; bg: string }> = {
  crawl:   { label: 'Crawl',   color: 'text-slate-300',  bg: 'bg-slate-500/10 border-slate-400/30' },
  steady:  { label: 'Steady',  color: 'text-gold',       bg: 'bg-gold/10 border-gold/30' },
  rushing: { label: 'Rushing', color: 'text-orange-300', bg: 'bg-orange-500/10 border-orange-400/30' },
}

const TEMPO_ORDER: CogTempo[] = ['crawl', 'steady', 'rushing']

export function WorldCogsPanel({ questId }: { questId: string }) {
  const [cogs, setCogs] = useState<WorldCog[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [pending, startTransition] = useTransition()

  // new-cog form state
  const [faction, setFaction] = useState('')
  const [goal, setGoal] = useState('')
  const [tempo, setTempo] = useState<CogTempo>('steady')
  const [nextBeat, setNextBeat] = useState('')
  const [visible, setVisible] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await listWorldCogs(questId)
    if (res.success && res.data) setCogs(res.data as WorldCog[])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questId])

  const resetForm = () => {
    setFaction(''); setGoal(''); setTempo('steady'); setNextBeat(''); setVisible(false); setAdding(false)
  }

  const handleCreate = () => {
    if (!faction.trim() || !goal.trim()) return
    startTransition(async () => {
      const res = await createWorldCog({
        quest_id: questId,
        faction,
        goal,
        tempo,
        next_beat: nextBeat || null,
        visible_to_players: visible,
      })
      if (res.success) {
        resetForm()
        load()
      }
    })
  }

  const handleToggleVisible = (cog: WorldCog) => {
    startTransition(async () => {
      const res = await updateWorldCog(cog.id, { visible_to_players: !cog.visible_to_players })
      if (res.success) {
        setCogs(prev => prev.map(c => c.id === cog.id ? { ...c, visible_to_players: !c.visible_to_players } : c))
      }
    })
  }

  const handleTempo = (cog: WorldCog, next: CogTempo) => {
    startTransition(async () => {
      const res = await updateWorldCog(cog.id, { tempo: next })
      if (res.success) {
        setCogs(prev => prev.map(c => c.id === cog.id ? { ...c, tempo: next } : c))
      }
    })
  }

  const handleAdvance = (cog: WorldCog) => {
    const newBeat = window.prompt(`Advance "${cog.faction}". What is the NEW next beat?`, '')
    startTransition(async () => {
      const res = await advanceWorldCog(cog.id, newBeat?.trim() || null)
      if (res.success) load()
    })
  }

  const handleDelete = (cog: WorldCog) => {
    if (!window.confirm(`Delete the cog "${cog.faction}"? This cannot be undone.`)) return
    startTransition(async () => {
      const res = await deleteWorldCog(cog.id)
      if (res.success) setCogs(prev => prev.filter(c => c.id !== cog.id))
    })
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-serif text-parchment flex items-center gap-2">
          <Cog className="w-4 h-4 text-gold" /> World Cogs
        </h3>
        <button
          onClick={() => setAdding(v => !v)}
          className="text-xs text-gold hover:text-gold/80 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> {adding ? 'Cancel' : 'New cog'}
        </button>
      </div>
      <p className="text-[11px] text-parchment-muted italic">
        Offscreen plots that turn whether players see them or not. Light a fuse, then advance the tempo.
      </p>

      {adding && (
        <div className="p-3 rounded-lg bg-teal-rich/40 border border-gold/20 space-y-2">
          <Input
            value={faction}
            onChange={e => setFaction(e.target.value)}
            placeholder="Faction / actor (e.g. The Hollow Choir)"
            className="bg-teal-deep/60 border-gold/20 text-parchment text-sm"
          />
          <Input
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="Goal (e.g. seize the Drowned Shard)"
            className="bg-teal-deep/60 border-gold/20 text-parchment text-sm"
          />
          <Input
            value={nextBeat}
            onChange={e => setNextBeat(e.target.value)}
            placeholder="Next beat (optional)"
            className="bg-teal-deep/60 border-gold/20 text-parchment text-sm"
          />
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider text-parchment-muted mr-1">Tempo</span>
            {TEMPO_ORDER.map(t => (
              <button
                key={t}
                onClick={() => setTempo(t)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                  tempo === t ? `${TEMPO_STYLES[t].bg} ${TEMPO_STYLES[t].color}` : 'border-gold/10 text-parchment-muted hover:border-gold/30'
                }`}
              >
                {TEMPO_STYLES[t].label}
              </button>
            ))}
            <label className="flex items-center gap-1 ml-auto text-[11px] text-parchment-muted cursor-pointer">
              <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} className="accent-gold" />
              Visible to players
            </label>
          </div>
          <Button
            onClick={handleCreate}
            disabled={pending || !faction.trim() || !goal.trim()}
            className="w-full btn-fantasy text-xs"
          >
            {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Create cog'}
          </Button>
        </div>
      )}

      {loading && (
        <div className="text-xs text-parchment-muted flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading cogs...
        </div>
      )}

      {!loading && cogs.length === 0 && !adding && (
        <div className="text-xs text-parchment-muted italic">
          No cogs yet. Add a faction, give them a goal, and the world starts breathing.
        </div>
      )}

      {cogs.map(cog => {
        const tempoStyle = TEMPO_STYLES[cog.tempo]
        return (
          <div
            key={cog.id}
            className={`p-3 rounded-lg border ${tempoStyle.bg} relative group`}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-parchment font-medium truncate">{cog.faction}</div>
                <div className="text-xs text-parchment-muted italic line-clamp-2">{cog.goal}</div>
              </div>
              <button
                onClick={() => handleToggleVisible(cog)}
                title={cog.visible_to_players ? 'Visible to players — click to hide' : 'Hidden — click to reveal to players'}
                className={`shrink-0 ${cog.visible_to_players ? 'text-gold' : 'text-parchment-muted hover:text-parchment'}`}
              >
                {cog.visible_to_players ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            {cog.current_state && (
              <div className="mt-1 text-[11px] text-parchment-dark">
                <span className="text-parchment-muted">Now:</span> {cog.current_state}
              </div>
            )}
            {cog.next_beat && (
              <div className="mt-0.5 text-[11px] text-parchment-dark">
                <span className="text-parchment-muted">Next:</span> {cog.next_beat}
              </div>
            )}

            <div className="flex items-center gap-1 mt-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider text-parchment-muted mr-1">Tempo</span>
              {TEMPO_ORDER.map(t => (
                <button
                  key={t}
                  onClick={() => handleTempo(cog, t)}
                  disabled={pending}
                  className={`text-[10px] px-1.5 py-0.5 rounded border transition-all ${
                    cog.tempo === t
                      ? `${TEMPO_STYLES[t].bg} ${TEMPO_STYLES[t].color}`
                      : 'border-gold/10 text-parchment-muted hover:border-gold/30'
                  }`}
                >
                  {TEMPO_STYLES[t].label}
                </button>
              ))}
              <button
                onClick={() => handleAdvance(cog)}
                disabled={pending}
                className="ml-auto text-[10px] text-gold hover:text-gold/80 flex items-center gap-1"
                title="Promote Next → Now, set a new Next"
              >
                <ChevronRight className="w-3 h-3" /> Advance
              </button>
              <button
                onClick={() => handleDelete(cog)}
                disabled={pending}
                className="text-[10px] text-rose-400/70 hover:text-rose-300"
                title="Delete cog"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
