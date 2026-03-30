import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlayerSessionClient } from './player-session-client'
import type { Campaign, CampaignPlayer, CampaignScene, CampaignSession, CampaignMessage, NarrativeIdol } from '@/types/campaign'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PlayerSessionPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: campaignData } = await supabase
    .from('campaigns')
    .select('*')
    .eq('slug', slug)
    .single()

  const campaign = campaignData as unknown as Campaign | null
  if (!campaign) notFound()

  // Verify player is accepted
  const { data: myPlayerData } = await supabase
    .from('campaign_players')
    .select(`
      *,
      character:player_characters!campaign_players_character_id_fkey(*)
    `)
    .eq('campaign_id', campaign.id)
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .single()

  const myPlayer = myPlayerData as unknown as CampaignPlayer | null

  if (!myPlayer && campaign.dm_id !== user.id) {
    redirect(`/campaigns/${slug}`)
  }

  // Fetch all players
  const { data: playersData } = await supabase
    .from('campaign_players')
    .select(`
      *,
      user:profiles!campaign_players_user_id_fkey(id, username, display_name, avatar_url),
      character:player_characters!campaign_players_character_id_fkey(id, name, race, class, level, current_hp, max_hp, armor_class, portrait_url, theme_color)
    `)
    .eq('campaign_id', campaign.id)
    .eq('status', 'accepted')

  // Fetch active session
  const { data: sessionData } = await supabase
    .from('campaign_sessions')
    .select('*')
    .eq('campaign_id', campaign.id)
    .in('status', ['active', 'paused'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const session = sessionData as unknown as CampaignSession | null
  if (!session) redirect(`/campaigns/${slug}`)

  // Fetch active scene (only non-DM-only fields)
  const { data: activeSceneData } = await supabase
    .from('campaign_scenes')
    .select('id, campaign_id, title, description, scene_type, mood, atmosphere, map_url, narration, status, scene_order, linked_entities, created_at, updated_at')
    .eq('id', session.active_scene_id ?? '')
    .single()

  // Fetch messages (filter whispers to only those visible to this player)
  const { data: allMessagesData } = await supabase
    .from('campaign_messages')
    .select(`
      *,
      sender:profiles!campaign_messages_sender_id_fkey(username, display_name, avatar_url)
    `)
    .eq('session_id', session.id)
    .order('created_at', { ascending: true })
    .limit(200)

  const allMessages = (allMessagesData ?? []) as unknown as (CampaignMessage & { visible_to: string[] })[]

  // Client-side filter: show public messages + whispers where user is in visible_to
  const messages = allMessages.filter(msg => {
    if (msg.message_type !== 'whisper') return !msg.is_hidden
    return msg.visible_to?.includes(user.id) || msg.sender_id === user.id
  })

  // Fetch player's idols
  const { data: myIdolsData } = await supabase
    .from('narrative_idols')
    .select('*')
    .eq('campaign_id', campaign.id)
    .eq('holder_id', user.id)
    .eq('status', 'held')

  return (
    <PlayerSessionClient
      campaign={campaign}
      player={myPlayer as CampaignPlayer}
      players={(playersData ?? []) as unknown as CampaignPlayer[]}
      session={session}
      activeScene={activeSceneData as unknown as CampaignScene | null}
      messages={messages as CampaignMessage[]}
      idols={(myIdolsData ?? []) as unknown as NarrativeIdol[]}
      userId={user.id}
    />
  )
}
