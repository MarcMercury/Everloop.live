/**
 * Pass 1 — Reference backfill.
 *
 * Scans story `content_text` for word-boundary mentions of every canonical
 * entity name and merges any new matches into `stories.referenced_entities`.
 * Also runs on `quests.description` (no other narrative text column exists
 * on quests today; this can be widened later).
 *
 * Idempotent: existing references are preserved; only net-new ids are added.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { PassResult } from '../types'

const STOPWORDS = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'at'])

function escRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

interface EntityRow {
  id: string
  name: string
}

interface StoryRow {
  id: string
  content_text: string | null
  referenced_entities: string[] | null
}

interface QuestRow {
  id: string
  description: string | null
  referenced_entities: string[] | null
}

export async function runReferenceBackfill(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: SupabaseClient<any, 'public', any>
): Promise<PassResult> {
  const counters: Record<string, number> = {
    stories_scanned: 0,
    stories_updated: 0,
    story_references_added: 0,
    quests_scanned: 0,
    quests_updated: 0,
    quest_references_added: 0,
  }

  try {
    const { data: entitiesRaw, error: eErr } = await admin
      .from('canon_entities')
      .select('id, name')
      .eq('status', 'canonical')
    if (eErr) throw eErr
    const entities = (entitiesRaw ?? []) as EntityRow[]

    const patterns = entities
      .filter((e) => e.name && e.name.length >= 3 && !STOPWORDS.has(e.name.toLowerCase()))
      .map((e) => ({ id: e.id, re: new RegExp(`\\b${escRegex(e.name)}\\b`, 'i') }))

    // Stories
    const { data: storiesRaw, error: sErr } = await admin
      .from('stories')
      .select('id, content_text, referenced_entities')
      .in('canon_status', ['canonical', 'approved'])
    if (sErr) throw sErr
    const stories = (storiesRaw ?? []) as StoryRow[]

    for (const s of stories) {
      counters.stories_scanned++
      const text = s.content_text ?? ''
      if (!text.trim()) continue
      const existing = new Set(s.referenced_entities ?? [])
      const added: string[] = []
      for (const p of patterns) {
        if (!existing.has(p.id) && p.re.test(text)) {
          existing.add(p.id)
          added.push(p.id)
        }
      }
      if (added.length) {
        const { error: uErr } = await admin
          .from('stories')
          .update({ referenced_entities: [...existing] })
          .eq('id', s.id)
        if (uErr) throw uErr
        counters.stories_updated++
        counters.story_references_added += added.length
      }
    }

    // Quests (best-effort — only scan if `description` exists on the schema)
    const { data: questsRaw, error: qErr } = await admin
      .from('quests')
      .select('id, description, referenced_entities')
    if (!qErr && questsRaw) {
      const quests = questsRaw as QuestRow[]
      for (const q of quests) {
        counters.quests_scanned++
        const text = q.description ?? ''
        if (!text.trim()) continue
        const existing = new Set(q.referenced_entities ?? [])
        const added: string[] = []
        for (const p of patterns) {
          if (!existing.has(p.id) && p.re.test(text)) {
            existing.add(p.id)
            added.push(p.id)
          }
        }
        if (added.length) {
          const { error: uErr } = await admin
            .from('quests')
            .update({ referenced_entities: [...existing] })
            .eq('id', q.id)
          if (!uErr) {
            counters.quests_updated++
            counters.quest_references_added += added.length
          }
        }
      }
    }

    return { pass: 'reference-backfill', ok: true, counters }
  } catch (e) {
    return {
      pass: 'reference-backfill',
      ok: false,
      counters,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}
