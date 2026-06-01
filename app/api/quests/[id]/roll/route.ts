import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * POST /api/quests/[id]/roll
 *
 * Broadcasts a dice roll into the quest message stream so every player and the
 * DM see the same result in real time. Writes a row into `quest_messages` with
 * `message_type='roll'` and the structured roll payload in `roll_data`.
 *
 * Body:
 *   {
 *     sessionId?: string,         // optional; defaults to latest active session
 *     formula: string,            // e.g. "1d20+5" or "2d6+3"
 *     results: number[],          // individual die values
 *     modifier: number,
 *     total: number,
 *     isCriticalHit?: boolean,
 *     isCriticalFail?: boolean,
 *     rollType?: string,          // attack, save, check, damage, custom, ...
 *     rollerName?: string,        // character or DM name (cached)
 *     visibleTo?: string[]        // for whispers; default = public
 *   }
 *
 * Auth: signed-in user who is either DM or an accepted player on the quest.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>))
  const formula = typeof body.formula === 'string' ? body.formula.slice(0, 80) : null
  const results = Array.isArray(body.results) ? (body.results as unknown[]).filter((n): n is number => typeof n === 'number') : []
  const modifier = typeof body.modifier === 'number' ? body.modifier : 0
  const total = typeof body.total === 'number' ? body.total : 0
  const isCriticalHit = body.isCriticalHit === true
  const isCriticalFail = body.isCriticalFail === true
  const rollType = typeof body.rollType === 'string' ? body.rollType.slice(0, 40) : 'custom'
  const rollerName = typeof body.rollerName === 'string' ? body.rollerName.slice(0, 80) : null
  const sessionIdInput = typeof body.sessionId === 'string' ? body.sessionId : null
  const visibleTo = Array.isArray(body.visibleTo) ? (body.visibleTo as unknown[]).filter((v): v is string => typeof v === 'string') : []

  if (!formula || results.length === 0) {
    return NextResponse.json({ error: 'formula and results are required' }, { status: 400 })
  }

  // Resolve quest by id or slug.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const questQuery = supabase.from('quests').select('id, dm_id')
  const { data: questRow } = await (isUuid ? questQuery.eq('id', id) : questQuery.eq('slug', id)).maybeSingle()
  const quest = (questRow ?? null) as { id: string; dm_id: string } | null
  if (!quest) {
    return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
  }

  // Authorize: DM or accepted player.
  let authorized = quest.dm_id === user.id
  if (!authorized) {
    const { data: playerRow } = await supabase
      .from('quest_players')
      .select('id, status')
      .eq('quest_id', quest.id)
      .eq('user_id', user.id)
      .maybeSingle()
    authorized = !!playerRow && (playerRow as { status?: string }).status !== 'declined'
  }
  if (!authorized) {
    return NextResponse.json({ error: 'Not a participant in this quest' }, { status: 403 })
  }

  // Resolve session: prefer the explicitly-passed one, else latest active.
  let sessionId = sessionIdInput
  if (!sessionId) {
    const { data: sess } = await supabase
      .from('quest_sessions')
      .select('id')
      .eq('quest_id', quest.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    sessionId = (sess as { id?: string } | null)?.id ?? null
  }
  if (!sessionId) {
    return NextResponse.json({ error: 'No active session for this quest' }, { status: 400 })
  }

  const rollData = {
    formula,
    results,
    modifier,
    total,
    isCriticalHit,
    isCriticalFail,
    rollType,
    rollerName,
  }

  const summary = `${rollerName ?? 'Someone'} rolled ${formula} = ${total}${isCriticalHit ? ' (CRIT!)' : isCriticalFail ? ' (FAIL!)' : ''}`

  const { data: inserted, error } = await supabase
    .from('quest_messages')
    .insert({
      quest_id: quest.id,
      session_id: sessionId,
      sender_id: user.id,
      message_type: 'roll',
      content: summary,
      roll_data: rollData,
      character_name: rollerName,
      visible_to: visibleTo,
    } as never)
    .select('id, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: inserted, roll: rollData })
}
