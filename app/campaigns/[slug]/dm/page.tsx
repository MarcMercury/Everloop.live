import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DMControlPanelClient } from './dm-control-panel-client'
import type { Campaign, CampaignPlayer, CampaignScene, CampaignSession, CampaignMessage, NarrativeIdol, CampaignNpc } from '@/types/campaign'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function DMControlPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch campaign
  const { data: campaignData } = await supabase
    .from('campaigns')
    .select('*')
    .eq('slug', slug)
    .single()

  const campaign = campaignData as unknown as Campaign | null
  if (!campaign) notFound()
  if (campaign.dm_id !== user.id) redirect(`/campaigns/${slug}`)

  // Fetch all data
  const [playersRes, scenesRes, sessionRes, npcsRes, idolsRes] = await Promise.all([
    supabase
      .from('campaign_players')
      .select(`
        *,
        user:profiles!campaign_players_user_id_fkey(id, username, display_name, avatar_url),
        character:player_characters!campaign_players_character_id_fkey(id, name, race, class, level, current_hp, max_hp, armor_class, portrait_url, theme_color)
      `)
      .eq('campaign_id', campaign.id)
      .eq('status', 'accepted'),
    supabase
      .from('campaign_scenes')
      .select('*')
      .eq('campaign_id', campaign.id)
      .order('scene_order', { ascending: true }),
    supabase
      .from('campaign_sessions')
      .select('*')
      .eq('campaign_id', campaign.id)
      .in('status', ['active', 'paused'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('campaign_npcs')
      .select('*')
      .eq('campaign_id', campaign.id),
    supabase
      .from('narrative_idols')
      .select('*')
      .eq('campaign_id', campaign.id),
  ])

  const session = sessionRes.data as unknown as CampaignSession | null

  // Fetch messages if session exists
  let messages: CampaignMessage[] = []
  if (session) {
    const { data: msgs } = await supabase
      .from('campaign_messages')
      .select(`
        *,
        sender:profiles!campaign_messages_sender_id_fkey(username, display_name, avatar_url)
      `)
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .limit(200)
    messages = (msgs ?? []) as unknown as CampaignMessage[]
  }

  return (
    <DMControlPanelClient
      campaign={campaign}
      players={(playersRes.data ?? []) as unknown as CampaignPlayer[]}
      scenes={(scenesRes.data ?? []) as unknown as CampaignScene[]}
      session={session}
      messages={messages}
      npcs={(npcsRes.data ?? []) as unknown as CampaignNpc[]}
      idols={(idolsRes.data ?? []) as unknown as NarrativeIdol[]}
      userId={user.id}
    />
  )
}
