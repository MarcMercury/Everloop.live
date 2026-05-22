'use client'

import { useEffect, useState } from 'react'
import { Shield, EyeOff, Loader2, RefreshCw } from 'lucide-react'
import { getQuestSafetySummary } from '@/lib/actions/quests'

interface Props {
  questId: string
  totalPlayers: number
}

type Summary = {
  lines: string[]
  veils: string[]
  tones: Record<'light' | 'mixed' | 'dark', number>
  pending: number
  completed: number
}

export function SafetySummaryCard({ questId, totalPlayers }: Props) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)

  async function load() {
    setLoading(true)
    setError(null)
    const res = await getQuestSafetySummary(questId)
    if (res.success && res.data) {
      setSummary(res.data)
    } else {
      setError(res.error ?? 'Failed to load safety summary')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questId])

  const dominantTone =
    summary &&
    (Object.entries(summary.tones) as ['light' | 'mixed' | 'dark', number][])
      .sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="rounded-lg border border-rose-400/20 bg-rose-950/10 p-3">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-300" />
          <span className="text-sm font-serif text-parchment">Safety Summary</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-parchment-muted">
          {summary && (
            <span>
              {summary.completed}/{totalPlayers} ready
            </span>
          )}
          <span className="text-gold/60">{expanded ? '−' : '+'}</span>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-parchment-muted">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading…
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          {summary && !loading && (
            <>
              {summary.pending > 0 && (
                <div className="text-[11px] text-amber-300/90 bg-amber-950/20 border border-amber-400/20 rounded px-2 py-1">
                  {summary.pending} player{summary.pending === 1 ? '' : 's'} haven&apos;t completed Session Zero yet.
                </div>
              )}

              {dominantTone && dominantTone[1] > 0 && (
                <div className="text-[11px] text-parchment-muted">
                  Table tone leans{' '}
                  <span className="capitalize text-parchment font-medium">{dominantTone[0]}</span>
                  {' '}({summary.tones.light}L · {summary.tones.mixed}M · {summary.tones.dark}D)
                </div>
              )}

              <div>
                <div className="text-[10px] uppercase tracking-wider text-rose-300/80 mb-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Lines (hard noes)
                </div>
                {summary.lines.length === 0 ? (
                  <p className="text-xs text-parchment-muted/70 italic">None reported.</p>
                ) : (
                  <ul className="space-y-1">
                    {summary.lines.map((l, i) => (
                      <li key={i} className="text-xs text-parchment/90 bg-rose-950/20 border border-rose-400/15 rounded px-2 py-1">
                        {l}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider text-amber-300/80 mb-1 flex items-center gap-1">
                  <EyeOff className="w-3 h-3" /> Veils (fade-to-black)
                </div>
                {summary.veils.length === 0 ? (
                  <p className="text-xs text-parchment-muted/70 italic">None reported.</p>
                ) : (
                  <ul className="space-y-1">
                    {summary.veils.map((v, i) => (
                      <li key={i} className="text-xs text-parchment/90 bg-amber-950/20 border border-amber-400/15 rounded px-2 py-1">
                        {v}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                onClick={load}
                className="text-[11px] text-parchment-muted hover:text-parchment inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
