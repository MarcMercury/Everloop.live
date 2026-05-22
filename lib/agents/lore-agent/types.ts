/**
 * Lore Agent — types & shared helpers
 *
 * The Lore Agent runs after canonization to keep the Archive's connective
 * tissue current. Each pass returns a structured summary that the
 * orchestrator persists to `lore_agent_runs.summary`.
 */

export type LoreAgentTrigger =
  | 'story_canonized'
  | 'entity_canonized'
  | 'manual'
  | 'cron'

export interface LoreAgentContext {
  trigger: LoreAgentTrigger
  /** ID of the story or entity that triggered the run (if any). */
  triggerRef?: string
  /** Run ID, populated once the run row is created. */
  runId?: string
}

export interface PassResult {
  pass: string
  ok: boolean
  /** Free-form counters: e.g. { references_added: 3, stories_updated: 1 }. */
  counters: Record<string, number>
  /** Optional debug/info notes surfaced in the admin UI. */
  notes?: string[]
  error?: string
}

export interface LoreAgentRunSummary {
  trigger: LoreAgentTrigger
  triggerRef?: string
  passes: PassResult[]
  totals: Record<string, number>
}

export function emptyCounters(): Record<string, number> {
  return {}
}

export function mergeTotals(passes: PassResult[]): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const p of passes) {
    for (const [k, v] of Object.entries(p.counters)) {
      totals[k] = (totals[k] ?? 0) + v
    }
  }
  return totals
}
