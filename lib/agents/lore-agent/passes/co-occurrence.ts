/**
 * Pass 3 — Co-occurrence → related_entities.
 *
 * For every pair of entities that co-occur in `referenced_entities` across
 * canonical stories and quests, count how many distinct canonical works
 * mention both. If the count meets `MIN_COOCCURRENCES` and the link is not
 * yet recorded in `canon_entities.related_entities`, merge it in.
 *
 * Conservative: only adds links, never removes. Bidirectional — both rows
 * are updated so the graph stays consistent.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { PassResult } from '../types'

const MIN_COOCCURRENCES = 2

interface RefRow {
  referenced_entities: string[] | null
}

interface EntityGraphRow {
  id: string
  related_entities: string[] | null
}

export async function runCoOccurrenceLinking(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: SupabaseClient<any, 'public', any>
): Promise<PassResult> {
  const counters: Record<string, number> = {
    works_scanned: 0,
    pairs_considered: 0,
    links_added: 0,
    entities_updated: 0,
  }

  try {
    const { data: storiesRaw } = await admin
      .from('stories')
      .select('referenced_entities')
      .eq('canon_status', 'canonical')
    const { data: questsRaw } = await admin
      .from('quests')
      .select('referenced_entities')

    const works: RefRow[] = [
      ...((storiesRaw ?? []) as RefRow[]),
      ...((questsRaw ?? []) as RefRow[]),
    ]

    // pairKey "a|b" (a<b) -> Set of distinct works it appears in
    const pairCounts = new Map<string, number>()
    for (const w of works) {
      const ids = (w.referenced_entities ?? []).filter(Boolean)
      if (ids.length < 2) continue
      counters.works_scanned++
      const unique = Array.from(new Set(ids)).sort()
      for (let i = 0; i < unique.length; i++) {
        for (let j = i + 1; j < unique.length; j++) {
          const key = `${unique[i]}|${unique[j]}`
          pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1)
        }
      }
    }

    // Filter pairs meeting the threshold
    const promotedPairs: [string, string][] = []
    for (const [key, count] of pairCounts) {
      counters.pairs_considered++
      if (count >= MIN_COOCCURRENCES) {
        const [a, b] = key.split('|')
        promotedPairs.push([a, b])
      }
    }
    if (promotedPairs.length === 0) {
      return { pass: 'co-occurrence', ok: true, counters }
    }

    // Build adjacency additions per entity, fetching current related_entities once
    const allIds = Array.from(new Set(promotedPairs.flat()))
    const { data: entRaw, error: entErr } = await admin
      .from('canon_entities')
      .select('id, related_entities')
      .in('id', allIds)
    if (entErr) throw entErr
    const ents = (entRaw ?? []) as EntityGraphRow[]
    const currentMap = new Map<string, Set<string>>()
    for (const e of ents) currentMap.set(e.id, new Set(e.related_entities ?? []))

    for (const [a, b] of promotedPairs) {
      const aSet = currentMap.get(a)
      const bSet = currentMap.get(b)
      if (!aSet || !bSet) continue
      if (!aSet.has(b)) {
        aSet.add(b)
        counters.links_added++
      }
      if (!bSet.has(a)) {
        bSet.add(a)
        counters.links_added++
      }
    }

    // Write back any entities whose set changed
    for (const e of ents) {
      const desired = currentMap.get(e.id)
      if (!desired) continue
      const before = new Set(e.related_entities ?? [])
      const changed =
        desired.size !== before.size ||
        [...desired].some((id) => !before.has(id))
      if (!changed) continue
      const { error: uErr } = await admin
        .from('canon_entities')
        .update({ related_entities: [...desired] })
        .eq('id', e.id)
      if (uErr) throw uErr
      counters.entities_updated++
    }

    return { pass: 'co-occurrence', ok: true, counters }
  } catch (e) {
    return {
      pass: 'co-occurrence',
      ok: false,
      counters,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}
