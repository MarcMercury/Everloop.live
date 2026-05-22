import { createAdminClient } from '@/lib/supabase/server'
import { RunLoreAgentButton } from './run-button'
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface RunRow {
  id: string
  trigger: string
  trigger_ref: string | null
  started_at: string
  finished_at: string | null
  status: string
  summary: { totals?: Record<string, number>; passes?: Array<{ pass: string; ok: boolean; counters: Record<string, number>; error?: string; notes?: string[] }> } | null
  error: string | null
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { Icon: typeof Clock; color: string; label: string }> = {
    running: { Icon: Clock, color: 'text-amber-400', label: 'Running' },
    success: { Icon: CheckCircle2, color: 'text-emerald-400', label: 'Success' },
    partial: { Icon: AlertTriangle, color: 'text-amber-400', label: 'Partial' },
    error:   { Icon: XCircle, color: 'text-red-400', label: 'Error' },
  }
  const { Icon, color, label } = map[status] ?? map.error
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

function fmt(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleString()
}

export default async function LoreAgentAdminPage() {
  const admin = createAdminClient()
  let runs: RunRow[] = []
  let proposedCount = 0

  if (admin) {
    const { data: runRows } = await admin
      .from('lore_agent_runs')
      .select('id, trigger, trigger_ref, started_at, finished_at, status, summary, error')
      .order('started_at', { ascending: false })
      .limit(20)
    runs = (runRows ?? []) as RunRow[]

    const { count } = await admin
      .from('canon_entities')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'proposed')
    proposedCount = count ?? 0
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-serif text-parchment">Lore Agent</h1>
        </div>
        <p className="text-parchment-muted max-w-3xl">
          The Lore Agent runs automatically after each canonization (story or entity).
          It backfills entity references, scans static lore-book pages, infers
          related-entity links from co-occurrence, and (when enabled) proposes
          new entities for Lorekeeper review.
        </p>
        <RunLoreAgentButton />
        {proposedCount > 0 && (
          <p className="text-sm text-amber-300">
            {proposedCount} proposed entit{proposedCount === 1 ? 'y' : 'ies'} awaiting review in{' '}
            <a href="/admin/entities" className="underline hover:text-amber-200">/admin/entities</a>.
          </p>
        )}
      </header>

      <section>
        <h2 className="text-lg font-serif text-parchment mb-4">Recent Runs</h2>
        {runs.length === 0 ? (
          <p className="text-parchment-muted italic">No runs yet.</p>
        ) : (
          <div className="space-y-3">
            {runs.map((r) => {
              const totals = r.summary?.totals ?? {}
              const passes = r.summary?.passes ?? []
              return (
                <details
                  key={r.id}
                  className="rounded-lg border border-gold/15 bg-teal-rich/40"
                >
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <StatusBadge status={r.status} />
                      <span className="text-sm text-parchment">{r.trigger}</span>
                      <span className="text-xs text-parchment-muted">{fmt(r.started_at)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-parchment-muted">
                      {Object.entries(totals).slice(0, 4).map(([k, v]) => (
                        <span key={k}>{k.replace(/_/g, ' ')}: <span className="text-parchment">{v}</span></span>
                      ))}
                    </div>
                  </summary>
                  <div className="px-4 pb-4 space-y-3 border-t border-gold/10">
                    {r.error && (
                      <p className="text-sm text-red-300">Error: {r.error}</p>
                    )}
                    {passes.map((p) => (
                      <div key={p.pass} className="text-sm">
                        <div className="flex items-center gap-2">
                          {p.ok ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                          )}
                          <span className="text-parchment font-medium">{p.pass}</span>
                        </div>
                        <div className="ml-5 text-xs text-parchment-muted flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                          {Object.entries(p.counters).map(([k, v]) => (
                            <span key={k}>{k.replace(/_/g, ' ')}: <span className="text-parchment">{v}</span></span>
                          ))}
                        </div>
                        {p.notes && p.notes.length > 0 && (
                          <ul className="ml-5 mt-1 text-xs text-parchment-muted list-disc list-inside">
                            {p.notes.map((n, i) => (<li key={i}>{n}</li>))}
                          </ul>
                        )}
                        {p.error && (
                          <p className="ml-5 mt-1 text-xs text-red-300">{p.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
