'use client'

/**
 * Inline encounter difficulty calculator for the Scene Builder.
 *
 * Wraps `assessEncounter` + `crToXp` from lib/dnd-rules/encounters.ts so the GM
 * can validate combat/boss scenes against the expected party without leaving
 * the builder.
 */

import { useMemo, useState } from 'react'
import { Plus, Trash2, Swords } from 'lucide-react'
import { assessEncounter, crToXp, CR_XP_TABLE } from '@/lib/dnd-rules/encounters'

interface MonsterRow {
  id: string
  cr: string
  count: number
}

const DIFFICULTY_COLOR: Record<string, string> = {
  trivial: 'text-parchment-muted',
  easy: 'text-emerald-300',
  medium: 'text-sky-300',
  hard: 'text-amber-300',
  deadly: 'text-rose-400',
  tpk_likely: 'text-rose-500 font-semibold',
}

const CR_OPTIONS = Object.keys(CR_XP_TABLE)

export function EncounterDifficulty() {
  const [partyText, setPartyText] = useState('3,3,3,3')
  const [monsters, setMonsters] = useState<MonsterRow[]>([
    { id: 'm1', cr: '1', count: 1 },
  ])

  const levels = useMemo(
    () =>
      partyText
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n) && n >= 1 && n <= 20),
    [partyText],
  )

  const assessment = useMemo(() => {
    if (levels.length === 0 || monsters.length === 0) return null
    return assessEncounter(
      { levels },
      monsters.map((m) => ({ xp: crToXp(m.cr), count: Math.max(1, m.count) })),
    )
  }, [levels, monsters])

  function addMonster() {
    setMonsters((prev) => [
      ...prev,
      { id: `m${Date.now()}`, cr: '1/4', count: 1 },
    ])
  }

  function updateMonster(id: string, patch: Partial<MonsterRow>) {
    setMonsters((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }

  function removeMonster(id: string) {
    setMonsters((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
      <div className="flex items-center gap-2 mb-3">
        <Swords className="w-4 h-4 text-rose-300" />
        <span className="text-sm font-serif text-parchment">Encounter Difficulty</span>
        <span className="text-[10px] text-parchment-muted">SRD / DMG p.82</span>
      </div>

      <label className="text-xs text-parchment-muted block mb-1">
        Party Levels (comma-separated)
      </label>
      <input
        value={partyText}
        onChange={(e) => setPartyText(e.target.value)}
        placeholder="3,3,3,3"
        className="w-full mb-3 rounded bg-teal-rich/50 border border-gold/20 text-parchment text-sm p-2 focus:outline-none focus:ring-2 focus:ring-gold/40"
      />

      <div className="space-y-2 mb-2">
        {monsters.map((m) => (
          <div key={m.id} className="flex items-center gap-2">
            <select
              value={m.cr}
              onChange={(e) => updateMonster(m.id, { cr: e.target.value })}
              className="rounded bg-teal-rich/50 border border-gold/20 text-parchment text-xs p-1.5 focus:outline-none"
            >
              {CR_OPTIONS.map((cr) => (
                <option key={cr} value={cr}>
                  CR {cr} ({CR_XP_TABLE[cr]} xp)
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={m.count}
              onChange={(e) =>
                updateMonster(m.id, { count: Math.max(1, parseInt(e.target.value, 10) || 1) })
              }
              className="w-16 rounded bg-teal-rich/50 border border-gold/20 text-parchment text-xs p-1.5 focus:outline-none"
            />
            <span className="text-xs text-parchment-muted">×</span>
            <button
              type="button"
              onClick={() => removeMonster(m.id)}
              className="ml-auto text-parchment-muted hover:text-rose-400"
              title="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addMonster}
        className="inline-flex items-center gap-1 text-xs text-parchment-muted hover:text-parchment"
      >
        <Plus className="w-3 h-3" /> Add monster
      </button>

      {assessment && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="col-span-2 flex items-center justify-between p-2 rounded bg-teal-deep/40 border border-gold/10">
            <span className="text-parchment-muted">Verdict</span>
            <span className={`uppercase tracking-wide ${DIFFICULTY_COLOR[assessment.difficulty] ?? ''}`}>
              {assessment.difficulty.replace('_', ' ')}
            </span>
          </div>
          <div className="p-2 rounded bg-teal-deep/30 border border-gold/5">
            <div className="text-[10px] text-parchment-muted">Raw XP</div>
            <div className="text-parchment">{assessment.rawXp.toLocaleString()}</div>
          </div>
          <div className="p-2 rounded bg-teal-deep/30 border border-gold/5">
            <div className="text-[10px] text-parchment-muted">Adjusted XP</div>
            <div className="text-parchment">{assessment.adjustedXp.toLocaleString()}</div>
          </div>
          <div className="col-span-2 grid grid-cols-4 gap-1 text-[10px]">
            {(['easy', 'medium', 'hard', 'deadly'] as const).map((d) => (
              <div key={d} className="p-1.5 rounded bg-teal-deep/30 border border-gold/5 text-center">
                <div className={`uppercase ${DIFFICULTY_COLOR[d]}`}>{d}</div>
                <div className="text-parchment-muted">
                  {assessment.partyThresholds[d].toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
