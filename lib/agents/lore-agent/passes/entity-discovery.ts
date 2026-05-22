/**
 * Pass 4 — Entity discovery (feature-flagged OFF by default).
 *
 * Uses GPT-4o-mini to extract proper-noun candidates from recently
 * canonized stories that do not match any existing canonical entity name,
 * and inserts them into `canon_entities` with status='proposed' so a
 * Lorekeeper can review them in /admin/entities.
 *
 * Never canonizes anything itself. Gated by env var:
 *     LORE_AGENT_DISCOVERY=1
 * Requires OPENAI_API_KEY.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { PassResult } from '../types'

interface EntityNameRow {
  id: string
  name: string
}

interface StoryRow {
  id: string
  title: string
  content_text: string | null
}

interface DiscoveryCandidate {
  name: string
  type: 'character' | 'location' | 'artifact' | 'event' | 'faction' | 'concept' | 'creature' | 'monster'
  reason: string
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function runEntityDiscovery(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: SupabaseClient<any, 'public', any>,
  opts: { triggerStoryId?: string } = {}
): Promise<PassResult> {
  const counters: Record<string, number> = {
    stories_scanned: 0,
    candidates_returned: 0,
    proposals_inserted: 0,
    proposals_skipped_duplicate: 0,
  }
  const notes: string[] = []

  if (process.env.LORE_AGENT_DISCOVERY !== '1') {
    notes.push('discovery disabled (set LORE_AGENT_DISCOVERY=1 to enable)')
    return { pass: 'entity-discovery', ok: true, counters, notes }
  }
  if (!process.env.OPENAI_API_KEY) {
    return {
      pass: 'entity-discovery',
      ok: false,
      counters,
      error: 'OPENAI_API_KEY is not set',
    }
  }

  try {
    // Load known canonical & proposed names so we can dedupe.
    const { data: knownRaw } = await admin
      .from('canon_entities')
      .select('id, name')
      .in('status', ['canonical', 'proposed', 'draft'])
    const known = new Set(
      ((knownRaw ?? []) as EntityNameRow[]).map((e) => e.name.toLowerCase())
    )

    // Pick the trigger story if provided; otherwise the most recent
    // canonical story.
    let query = admin
      .from('stories')
      .select('id, title, content_text')
      .eq('canon_status', 'canonical')
      .order('published_at', { ascending: false })
      .limit(1)
    if (opts.triggerStoryId) {
      query = admin
        .from('stories')
        .select('id, title, content_text')
        .eq('id', opts.triggerStoryId)
    }
    const { data: storyRows, error: sErr } = await query
    if (sErr) throw sErr
    const stories = (storyRows ?? []) as StoryRow[]
    if (stories.length === 0) {
      notes.push('no story available to scan')
      return { pass: 'entity-discovery', ok: true, counters, notes }
    }

    for (const story of stories) {
      counters.stories_scanned++
      const text = (story.content_text ?? '').slice(0, 16000) // hard cap for tokens
      if (!text.trim()) continue

      const prompt = [
        'You are an Everloop Archivist. Extract proper nouns from the passage',
        'that look like canonical lore entities (characters, locations, artifacts,',
        'events, factions, concepts, creatures, monsters). Ignore common nouns,',
        'pronouns, narrator asides, and any name that is just a job title.',
        '',
        'Return STRICT JSON in the shape:',
        '{ "candidates": [{ "name": string, "type": string, "reason": string }] }',
        '',
        'PASSAGE:',
        '"""',
        text,
        '"""',
      ].join('\n')

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'You extract proper nouns from prose. Reply with JSON only.' },
            { role: 'user', content: prompt },
          ],
        }),
      })
      if (!res.ok) {
        notes.push(`OpenAI ${res.status} for story ${story.id}`)
        continue
      }
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[]
      }
      const raw = json.choices?.[0]?.message?.content ?? '{"candidates":[]}'
      let parsed: { candidates?: DiscoveryCandidate[] } = {}
      try { parsed = JSON.parse(raw) } catch { /* ignore */ }
      const candidates = parsed.candidates ?? []
      counters.candidates_returned += candidates.length

      for (const c of candidates) {
        if (!c?.name || !c?.type) continue
        if (known.has(c.name.toLowerCase())) {
          counters.proposals_skipped_duplicate++
          continue
        }
        const slug = `${slugify(c.name)}-prop`
        const { error: insErr } = await admin
          .from('canon_entities')
          .insert({
            name: c.name,
            slug,
            type: c.type,
            description: c.reason ?? '',
            status: 'proposed',
            stability_rating: 0.3,
            metadata: { proposed_by: 'lore-agent', source_story_id: story.id },
          })
        if (insErr) {
          notes.push(`insert failed for "${c.name}": ${insErr.message}`)
          continue
        }
        known.add(c.name.toLowerCase())
        counters.proposals_inserted++
      }
    }

    return { pass: 'entity-discovery', ok: true, counters, notes }
  } catch (e) {
    return {
      pass: 'entity-discovery',
      ok: false,
      counters,
      notes,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}
