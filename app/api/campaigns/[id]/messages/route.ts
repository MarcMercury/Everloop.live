import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface CampaignRow { id: string; dm_id: string }
interface MessageRow { id: string; session_id: string; campaign_id: string; sender_id: string | null; message_type: string; content: string; visible_to: string[]; roll_data: unknown; reference_data: unknown; character_name: string | null; is_hidden: boolean; created_at: string }

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: campaignId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get('session_id')
  const after = searchParams.get('after')

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 })
  }

  // Verify user is a member of this campaign
  const { data: campaignData } = await supabase
    .from('campaigns')
    .select('id, dm_id')
    .eq('id', campaignId)
    .single()

  const campaign = campaignData as unknown as CampaignRow | null

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  const isDm = campaign.dm_id === user.id

  if (!isDm) {
    const { data: player } = await supabase
      .from('campaign_players')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .eq('status', 'accepted')
      .single()

    if (!player) {
      return NextResponse.json({ error: 'Not a campaign member' }, { status: 403 })
    }
  }

  let query = supabase
    .from('campaign_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (after) {
    query = query.gt('created_at', after)
  }

  const { data: messagesData, error } = await query
  const messages = (messagesData ?? []) as unknown as MessageRow[]

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }

  // Filter whispers: non-DMs only see messages visible to them
  const filtered = isDm
    ? messages
    : messages.filter(m => {
        if (m.message_type !== 'whisper') return true
        if (!m.visible_to || m.visible_to.length === 0) return true
        return m.visible_to.includes(user.id) || m.sender_id === user.id
      })

  return NextResponse.json({ messages: filtered })
}
