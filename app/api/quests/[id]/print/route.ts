import { requireUser } from '@/lib/api/auth'
import { attachDmSecrets, QUEST_NPC_PUBLIC_COLUMNS, QUEST_SCENE_PUBLIC_COLUMNS } from '@/lib/quests/columns'
import { NextRequest, NextResponse } from 'next/server'
import { renderQuestPrintHtml } from '@/lib/quest-print'
import type { Quest, QuestScene, QuestNpc, NarrativeIdol } from '@/types/quest'

export const runtime = 'nodejs'

/**
 * GET /api/quests/[id]/print
 *
 * Returns a printable HTML document for the quest with the given id (or slug).
 * Open in a new tab and use the browser's "Save as PDF" / "Print" dialog to
 * produce a playable handout matching the DDEX / Homebrewery layout.
 *
 * Add `?print=1` to auto-trigger the print dialog on page load.
 *
 * The packet includes DM-only notes and NPC secrets, so only the quest's DM
 * may request it.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const auth = await requireUser()
  if (!auth.ok) return auth.response
  const { supabase, user } = auth

  // Allow lookup by UUID or slug.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  // Supabase generated types treat the campaigns table row as broader than
  // our Quest interface — cast through unknown for the narrow fields we need.
  const query = supabase.from('quests').select('*')
  const { data, error } = await (isUuid ? query.eq('id', id) : query.eq('slug', id)).maybeSingle()
  const quest = (data ?? null) as unknown as Quest | null

  if (error || !quest) {
    return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
  }
  if (quest.dm_id !== user.id) {
    return NextResponse.json({ error: 'Only the DM can print this quest' }, { status: 403 })
  }

  const [{ data: scenes }, { data: npcs }, { data: idols }] = await Promise.all([
    supabase
      .from('quest_scenes')
      .select(QUEST_SCENE_PUBLIC_COLUMNS)
      .eq('quest_id', quest.id)
      .order('scene_order', { ascending: true }),
    supabase.from('quest_npcs').select(QUEST_NPC_PUBLIC_COLUMNS).eq('quest_id', quest.id),
    supabase.from('narrative_idols').select('*').eq('quest_id', quest.id),
  ])

  const withSecrets = await attachDmSecrets(supabase, quest.id, {
    scenes: (scenes ?? []) as unknown as QuestScene[],
    npcs: (npcs ?? []) as unknown as QuestNpc[],
  })

  const html = renderQuestPrintHtml({
    quest: quest as unknown as Quest,
    scenes: withSecrets.scenes,
    npcs: withSecrets.npcs,
    idols: (idols ?? []) as unknown as NarrativeIdol[],
  })

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  })
}
