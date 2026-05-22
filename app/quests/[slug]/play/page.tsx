import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlayerSessionClient } from './player-session-client'
import type { Quest, QuestPlayer, QuestScene, QuestSession, QuestMessage, NarrativeIdol } from '@/types/quest'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PlayerSessionPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: campaignData } = await supabase
    .from('quests')
    .select('*')
    .eq('slug', slug)
    .single()

  const campaign = campaignData as unknown as Quest | null
  if (!campaign) notFound()

  // Verify player is accepted
  const { data: myPlayerData } = await supabase
    .from('quest_players')
    .select(`
      *,
      character:player_characters!quest_players_character_id_fkey(*)
    `)
    .eq('quest_id', campaign.id)
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .single()

  const myPlayer = myPlayerData as unknown as QuestPlayer | null

  if (!myPlayer && campaign.dm_id !== user.id) {
    redirect(`/quests/${slug}`)
  }

  // Fetch all players
  const { data: playersData } = await supabase
    .from('quest_players')
    .select(`
      *,
      user:profiles!quest_players_user_id_fkey(id, username, display_name, avatar_url),
      character:player_characters!quest_players_character_id_fkey(id, name, race, class, level, current_hp, max_hp, armor_class, portrait_url, theme_color)
    `)
    .eq('quest_id', campaign.id)
    .eq('status', 'accepted')

  // Fetch active session
  const { data: sessionData } = await supabase
    .from('quest_sessions')
    .select('*')
    .eq('quest_id', campaign.id)
    .in('status', ['active', 'paused'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const session = sessionData as unknown as QuestSession | null
  if (!session) redirect(`/quests/${slug}`)

  // Fetch active scene (only non-DM-only fields)
  const { data: activeSceneData } = await supabase
    .from('quest_scenes')
    .select('id, quest_id, title, description, scene_type, mood, atmosphere, map_url, narration, status, scene_order, linked_entities, created_at, updated_at')
    .eq('id', session.active_scene_id ?? '')
    .single()

  // Fetch messages (filter whispers to only those visible to this player)
  const { data: allMessagesData } = await supabase
    .from('quest_messages')
    .select(`
      *,
      sender:profiles!quest_messages_sender_id_fkey(username, display_name, avatar_url)
    `)
    .eq('session_id', session.id)
    .order('created_at', { ascending: true })
    .limit(200)

  const allMessages = (allMessagesData ?? []) as unknown as (QuestMessage & { visible_to: string[] })[]

  // Client-side filter: show public messages + whispers where user is in visible_to
  const messages = allMessages.filter(msg => {
    if (msg.message_type !== 'whisper') return !msg.is_hidden
    return msg.visible_to?.includes(user.id) || msg.sender_id === user.id
  })

  // Fetch player's idols
  const { data: myIdolsData } = await supabase
    .from('narrative_idols')
    .select('*')
    .eq('quest_id', campaign.id)
    .eq('holder_id', user.id)
    .eq('status', 'held')

  return (
    <PlayerSessionClient
      campaign={campaign}
      player={myPlayer as QuestPlayer}
      players={(playersData ?? []) as unknown as QuestPlayer[]}
      session={session}
      activeScene={activeSceneData as unknown as QuestScene | null}
      messages={messages as QuestMessage[]}
      idols={(myIdolsData ?? []) as unknown as NarrativeIdol[]}
      userId={user.id}
    />
  )
}
