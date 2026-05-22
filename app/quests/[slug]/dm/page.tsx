import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DMControlPanelClient } from './dm-control-panel-client'
import type { Quest, QuestPlayer, QuestScene, QuestSession, QuestMessage, NarrativeIdol, QuestNpc } from '@/types/quest'

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
    .from('quests')
    .select('*')
    .eq('slug', slug)
    .single()

  const campaign = campaignData as unknown as Quest | null
  if (!campaign) notFound()
  if (campaign.dm_id !== user.id) redirect(`/quests/${slug}`)

  // Fetch all data
  const [playersRes, scenesRes, sessionRes, npcsRes, idolsRes] = await Promise.all([
    supabase
      .from('quest_players')
      .select(`
        *,
        user:profiles!quest_players_user_id_fkey(id, username, display_name, avatar_url),
        character:player_characters!quest_players_character_id_fkey(id, name, race, class, level, current_hp, max_hp, armor_class, portrait_url, theme_color)
      `)
      .eq('quest_id', campaign.id)
      .eq('status', 'accepted'),
    supabase
      .from('quest_scenes')
      .select('*')
      .eq('quest_id', campaign.id)
      .order('scene_order', { ascending: true }),
    supabase
      .from('quest_sessions')
      .select('*')
      .eq('quest_id', campaign.id)
      .in('status', ['active', 'paused'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('quest_npcs')
      .select('*')
      .eq('quest_id', campaign.id),
    supabase
      .from('narrative_idols')
      .select('*')
      .eq('quest_id', campaign.id),
  ])

  const session = sessionRes.data as unknown as QuestSession | null

  // Fetch messages if session exists
  let messages: QuestMessage[] = []
  if (session) {
    const { data: msgs } = await supabase
      .from('quest_messages')
      .select(`
        *,
        sender:profiles!quest_messages_sender_id_fkey(username, display_name, avatar_url)
      `)
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .limit(200)
    messages = (msgs ?? []) as unknown as QuestMessage[]
  }

  return (
    <DMControlPanelClient
      campaign={campaign}
      players={(playersRes.data ?? []) as unknown as QuestPlayer[]}
      scenes={(scenesRes.data ?? []) as unknown as QuestScene[]}
      session={session}
      messages={messages}
      npcs={(npcsRes.data ?? []) as unknown as QuestNpc[]}
      idols={(idolsRes.data ?? []) as unknown as NarrativeIdol[]}
      userId={user.id}
    />
  )
}
