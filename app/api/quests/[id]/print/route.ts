import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { renderQuestPrintHtml } from '@/lib/quest-print'
import type { Campaign, CampaignScene, CampaignNpc, NarrativeIdol } from '@/types/campaign'

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
 * NOTE: Internally a "quest" is currently backed by the `campaigns` table
 * (and `campaign_scenes`, `campaign_npcs`, `narrative_idols`). The Quest
 * Unification effort plans to rename these tables in a follow-up migration.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const supabase = await createClient()

  // Allow lookup by UUID or slug.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  // Supabase generated types treat the campaigns table row as broader than
  // our Campaign interface — cast through unknown for the narrow fields we need.
  const query = supabase.from('campaigns').select('*')
  const { data, error } = await (isUuid ? query.eq('id', id) : query.eq('slug', id)).maybeSingle()
  const quest = (data ?? null) as unknown as Campaign | null

  if (error || !quest) {
    return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
  }

  const [{ data: scenes }, { data: npcs }, { data: idols }] = await Promise.all([
    supabase
      .from('campaign_scenes')
      .select('*')
      .eq('campaign_id', quest.id)
      .order('scene_order', { ascending: true }),
    supabase.from('campaign_npcs').select('*').eq('campaign_id', quest.id),
    supabase.from('narrative_idols').select('*').eq('campaign_id', quest.id),
  ])

  const html = renderQuestPrintHtml({
    quest: quest as unknown as Campaign,
    scenes: (scenes ?? []) as unknown as CampaignScene[],
    npcs: (npcs ?? []) as unknown as CampaignNpc[],
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
