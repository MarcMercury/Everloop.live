import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Quest, QuestPlayer, QuestScene, QuestSession, QuestNpc } from '@/types/quest'
import { InPersonDashboardClient } from './in-person-dashboard-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function InPersonDashboardPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: questData } = await supabase
    .from('quests')
    .select('*')
    .eq('slug', slug)
    .single()

  const quest = questData as unknown as Quest | null
  if (!quest) notFound()
  if (quest.dm_id !== user.id) redirect(`/quests/${slug}`)

  const [playersRes, scenesRes, npcsRes, sessionRes] = await Promise.all([
    supabase
      .from('quest_players')
      .select(`
        *,
        user:profiles!quest_players_user_id_fkey(id, username, display_name, avatar_url),
        character:player_characters!quest_players_character_id_fkey(id, name, race, class, level, current_hp, max_hp, armor_class, portrait_url, theme_color)
      `)
      .eq('quest_id', quest.id)
      .eq('status', 'accepted'),
    supabase
      .from('quest_scenes')
      .select('*')
      .eq('quest_id', quest.id)
      .order('scene_order', { ascending: true }),
    supabase
      .from('quest_npcs')
      .select('*')
      .eq('quest_id', quest.id),
    supabase
      .from('quest_sessions')
      .select('*')
      .eq('quest_id', quest.id)
      .in('status', ['active', 'paused'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const session = sessionRes.data as unknown as QuestSession | null
  if (!session) {
    // No active session — bounce back to the launcher.
    redirect(`/quests/${slug}`)
  }

  return (
    <InPersonDashboardClient
      quest={quest}
      players={(playersRes.data ?? []) as unknown as QuestPlayer[]}
      scenes={(scenesRes.data ?? []) as unknown as QuestScene[]}
      npcs={(npcsRes.data ?? []) as unknown as QuestNpc[]}
      session={session}
    />
  )
}
