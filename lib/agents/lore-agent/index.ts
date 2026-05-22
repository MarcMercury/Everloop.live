/**
 * Lore Agent — orchestrator.
 *
 * Runs after canonization (story or entity) to keep the Archive's connective
 * tissue current. Each invocation creates a row in `lore_agent_runs`, runs
 * the passes in order, and updates the row with a summary.
 *
 * Triggered from:
 *   - lib/actions/admin.ts → approveStory()       (trigger='story_canonized')
 *   - lib/actions/admin.ts → canonizeEntity()     (trigger='entity_canonized')
 *   - app/api/admin/lore-agent/route.ts           (trigger='manual')
 *
 * Failures in individual passes are recorded but do not abort downstream
 * passes — the goal is to make progress even when one pass has a bug.
 */

import { createAdminClient } from '@/lib/supabase/server'
import type { LoreAgentTrigger, PassResult } from './types'
import { mergeTotals } from './types'
import { runReferenceBackfill } from './passes/reference-backfill'
import { runLoreBookScan } from './passes/lore-book-scan'
import { runCoOccurrenceLinking } from './passes/co-occurrence'
import { runEntityDiscovery } from './passes/entity-discovery'

export interface RunLoreAgentInput {
  trigger: LoreAgentTrigger
  triggerRef?: string
  /** When set, entity-discovery (Pass 4) focuses on this story. */
  triggerStoryId?: string
}

export interface RunLoreAgentResult {
  ok: boolean
  runId?: string
  passes: PassResult[]
  totals: Record<string, number>
  error?: string
}

export async function runLoreAgent(input: RunLoreAgentInput): Promise<RunLoreAgentResult> {
  const admin = createAdminClient()
  if (!admin) {
    return {
      ok: false,
      passes: [],
      totals: {},
      error: 'Admin client not available (SUPABASE_SERVICE_ROLE_KEY missing)',
    }
  }

  // Open audit row.
  let runId: string | undefined
  {
    const { data, error } = await admin
      .from('lore_agent_runs')
      .insert({
        trigger: input.trigger,
        trigger_ref: input.triggerRef ?? null,
        status: 'running',
      } as never)
      .select('id')
      .maybeSingle()
    if (error) {
      console.error('[lore-agent] could not open audit row:', error.message)
    } else if (data) {
      runId = (data as { id: string }).id
    }
  }

  const passes: PassResult[] = []
  passes.push(await runReferenceBackfill(admin))
  passes.push(await runLoreBookScan(admin))
  passes.push(await runCoOccurrenceLinking(admin))
  passes.push(
    await runEntityDiscovery(admin, { triggerStoryId: input.triggerStoryId })
  )

  const totals = mergeTotals(passes)
  const allOk = passes.every((p) => p.ok)
  const status = allOk ? 'success' : 'partial'

  if (runId) {
    await admin
      .from('lore_agent_runs')
      .update({
        finished_at: new Date().toISOString(),
        status,
        summary: { passes, totals },
      } as never)
      .eq('id', runId)
  }

  return { ok: allOk, runId, passes, totals }
}
