'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Plus, Minus, Swords, Sparkles, AlertTriangle, Flame, Trash2 } from 'lucide-react'
import { assessEncounter, type EncounterAssessment } from '@/lib/dnd-rules/encounters'
import { startCombat, type Combatant } from '@/lib/actions/combat'
import type { Quest, QuestPlayer, QuestSession } from '@/types/quest'

interface SearchHit {
  key: string
  name: string
  type: string
  cr: string
  hp: number
  ac: number
  dexMod: number
  xp: number
}

interface EncounterRow {
  key: string
  name: string
  type: string
  cr: string
  hp: number
  ac: number
  dexMod: number
  xp: number
  count: number
}

const DRIFT_TYPES = new Set(['aberration', 'fiend', 'undead'])

interface Props {
  quest: Quest
  players: QuestPlayer[]
  session: QuestSession | null
}

export function EncounterBuilderClient({ quest, players, session }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [searching, setSearching] = useState(false)
  const [encounter, setEncounter] = useState<EncounterRow[]>([])
  const [, startTransition] = useTransition()

  const partyLevels = useMemo(() => {
    return players
      .map((p) => (p.character as unknown as { level?: number } | null)?.level)
      .filter((l): l is number => typeof l === 'number' && l > 0)
  }, [players])

  const assessment: EncounterAssessment = useMemo(() => {
    return assessEncounter(
      { levels: partyLevels.length ? partyLevels : [1] },
      encounter.map((m) => ({ xp: m.xp, count: m.count })),
    )
  }, [partyLevels, encounter])

  const frayHigh = (quest.fray_intensity ?? 0) > 0.6
  const driftMonsterCount = encounter
    .filter((m) => DRIFT_TYPES.has(m.type.toLowerCase()))
    .reduce((s, m) => s + m.count, 0)
  const totalMonsters = encounter.reduce((s, m) => s + m.count, 0)

  async function runSearch() {
    if (!query.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`/api/library/creatures?q=${encodeURIComponent(query.trim())}&limit=20`)
      const json = await res.json()
      const results: SearchHit[] = (json.results ?? []).map((c: {
        key: string
        name: string
        type?: { name?: string }
        challenge_rating_text?: string
        hit_points?: number
        armor_class?: number
        dexterity?: number
        experience_points?: number
      }) => ({
        key: c.key,
        name: c.name,
        type: c.type?.name ?? '—',
        cr: c.challenge_rating_text ?? '?',
        hp: c.hit_points ?? 10,
        ac: c.armor_class ?? 10,
        dexMod: Math.floor(((c.dexterity ?? 10) - 10) / 2),
        xp: c.experience_points ?? 0,
      }))
      setHits(results)
    } catch {
      setHits([])
    } finally {
      setSearching(false)
    }
  }

  function add(hit: SearchHit) {
    setEncounter((prev) => {
      const existing = prev.find((r) => r.key === hit.key)
      if (existing) return prev.map((r) => (r.key === hit.key ? { ...r, count: r.count + 1 } : r))
      return [...prev, { ...hit, count: 1 }]
    })
  }

  function remove(key: string) {
    setEncounter((prev) =>
      prev
        .map((r) => (r.key === key ? { ...r, count: r.count - 1 } : r))
        .filter((r) => r.count > 0),
    )
  }

  function clear(key: string) {
    setEncounter((prev) => prev.filter((r) => r.key !== key))
  }

  async function launch() {
    if (!session) {
      alert('Start a session from the DM panel first.')
      return
    }
    if (encounter.length === 0) return

    const pcs: Combatant[] = players
      .map((p) => {
        const ch = p.character as unknown as {
          id?: string
          name?: string
          level?: number
          max_hp?: number
          armor_class?: number
          dexterity?: number
        } | null
        if (!ch?.id) return null
        return {
          id: ch.id,
          name: ch.name ?? 'Adventurer',
          initiative: 0,
          dexMod: Math.floor(((ch.dexterity ?? 10) - 10) / 2),
          hp: ch.max_hp ?? 10,
          maxHp: ch.max_hp ?? 10,
          ac: ch.armor_class ?? 10,
          conditions: [],
          isPC: true,
          characterId: ch.id,
        } satisfies Combatant
      })
      .filter((c): c is Combatant => c != null)

    const monsters: Combatant[] = encounter.flatMap((m) =>
      Array.from({ length: m.count }, (_, i) => ({
        id: crypto.randomUUID(),
        name: m.count > 1 ? `${m.name} ${i + 1}` : m.name,
        initiative: 0,
        dexMod: m.dexMod,
        hp: m.hp,
        maxHp: m.hp,
        ac: m.ac,
        conditions: [],
        isPC: false,
        monsterKey: m.key,
        seq: i + 1,
      })),
    )

    startTransition(async () => {
      try {
        await startCombat({ sessionId: session.id, combatants: [...pcs, ...monsters] })
        router.push(`/quests/${quest.slug}/dm`)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to start combat')
      }
    })
  }

  useEffect(() => {
    // Auto-search on mount with empty (popular monsters).
    runSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const diffColor =
    assessment.difficulty === 'trivial' ? 'text-slate-400' :
    assessment.difficulty === 'easy' ? 'text-emerald-400' :
    assessment.difficulty === 'medium' ? 'text-amber-400' :
    assessment.difficulty === 'hard' ? 'text-orange-400' :
    assessment.difficulty === 'deadly' ? 'text-rose-400' : 'text-rose-600'

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link href={`/quests/${quest.slug}/dm`} className="text-xs text-parchment-muted hover:text-gold">
            ← Back to DM panel
          </Link>
          <h1 className="text-2xl md:text-3xl font-serif text-parchment mt-1">Encounter Builder</h1>
          <p className="text-sm text-parchment-muted">
            Party: {partyLevels.length} PCs · avg level {partyLevels.length ? (partyLevels.reduce((a, b) => a + b, 0) / partyLevels.length).toFixed(1) : '—'}
          </p>
        </div>
        {frayHigh && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-rose-500/10 border border-rose-500/30 max-w-sm">
            <Flame className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <div className="text-xs text-rose-200">
              <strong>Drift-fractured ({Math.round((quest.fray_intensity ?? 0) * 100)}%):</strong>{' '}
              reality is bleeding here. Favor aberrations, fiends, and undead — they crossed first.
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Search */}
        <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
          <h2 className="font-serif text-parchment mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-gold" /> Search Monsters
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              placeholder="goblin, dragon, beholder..."
              className="flex-1 bg-charcoal-900 border border-gold/15 rounded px-3 py-2 text-sm text-parchment"
            />
            <Button onClick={runSearch} disabled={searching} size="sm">
              {searching ? '…' : 'Search'}
            </Button>
          </div>

          <div className="space-y-1 max-h-[28rem] overflow-y-auto pr-1">
            {hits.map((h) => {
              const isDrift = DRIFT_TYPES.has(h.type.toLowerCase())
              return (
                <button
                  key={h.key}
                  onClick={() => add(h)}
                  className={`w-full flex items-center gap-2 p-2 rounded-md border text-left transition-colors ${
                    isDrift && frayHigh
                      ? 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'
                      : 'bg-charcoal-900/30 border-gold/5 hover:bg-charcoal-900/60 hover:border-gold/20'
                  }`}
                >
                  <span className="text-xs font-mono w-10 text-parchment-muted">CR {h.cr}</span>
                  <span className="flex-1 text-sm text-parchment truncate">{h.name}</span>
                  <span className="text-[10px] text-parchment-muted/60 capitalize w-20 truncate">{h.type}</span>
                  <span className="text-xs font-mono text-parchment-muted w-12 text-right">{h.xp} xp</span>
                  <Plus className="w-3.5 h-3.5 text-emerald-300" />
                </button>
              )
            })}
            {!searching && hits.length === 0 && (
              <p className="text-xs text-parchment-muted text-center py-6">No monsters found.</p>
            )}
          </div>
        </Card>

        {/* Encounter */}
        <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-parchment flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" /> Your Encounter
            </h2>
            <div className="text-right">
              <div className={`text-lg font-bold capitalize ${diffColor}`}>{assessment.difficulty.replace('_', ' ')}</div>
              <div className="text-[10px] font-mono text-parchment-muted">
                {assessment.adjustedXp} XP (raw {assessment.rawXp})
              </div>
            </div>
          </div>

          {/* Thresholds */}
          <div className="grid grid-cols-4 gap-1 mb-3 text-center text-[10px]">
            {(['easy', 'medium', 'hard', 'deadly'] as const).map((k) => (
              <div key={k} className="bg-charcoal-900/50 rounded px-1.5 py-1 border border-gold/5">
                <div className="uppercase text-parchment-muted/60">{k}</div>
                <div className="font-mono text-parchment-muted">{assessment.partyThresholds[k]}</div>
              </div>
            ))}
          </div>

          {frayHigh && totalMonsters > 0 && driftMonsterCount < totalMonsters / 2 && (
            <div className="flex items-start gap-2 px-3 py-2 mb-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                Fray is high but only {driftMonsterCount}/{totalMonsters} of your picks feel like Drift-spawn. Consider adding aberrations, fiends, or undead.
              </span>
            </div>
          )}

          <div className="space-y-1.5 mb-4 max-h-72 overflow-y-auto pr-1">
            {encounter.length === 0 && (
              <p className="text-xs text-parchment-muted text-center py-6">Add monsters from the search.</p>
            )}
            {encounter.map((r) => (
              <div key={r.key} className="flex items-center gap-2 p-2 rounded-md bg-charcoal-900/40 border border-gold/5">
                <span className="text-xs font-mono w-9 text-parchment-muted">CR {r.cr}</span>
                <span className="flex-1 text-sm text-parchment truncate">{r.name}</span>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => remove(r.key)}>
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-6 text-center font-mono text-sm text-parchment">{r.count}</span>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => add(r)}>
                  <Plus className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-rose-300" onClick={() => clear(r.key)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            onClick={launch}
            disabled={encounter.length === 0 || !session}
            className="w-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-100"
          >
            <Swords className="w-4 h-4 mr-2" />
            {session ? 'Start Combat (rolls initiative)' : 'No active session — start one first'}
          </Button>
        </Card>
      </div>
    </div>
  )
}
