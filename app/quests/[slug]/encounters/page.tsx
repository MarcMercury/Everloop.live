import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EncounterBuilderClient } from './encounter-builder-client'
import type { Quest, QuestPlayer, QuestSession } from '@/types/quest'

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * GM-only Encounter Builder.
 * Search SRD monsters, build an encounter, see live difficulty (DMG XP rules),
 * and start combat — which writes the initiative order into the active session.
 *
 * Fray-aware: when the quest's fray_intensity is high, the UI warns the GM and
 * nudges them toward aberration/fiend/undead picks (Drift leakage).
 */
export default async function EncounterBuilderPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: questRow } = await supabase
    .from('quests')
    .select('*')
    .eq('slug', slug)
    .single()
  const quest = questRow as unknown as Quest | null
  if (!quest) notFound()
  if (quest.dm_id !== user.id) redirect(`/quests/${slug}`)

  const [playersRes, sessionRes] = await Promise.all([
    supabase
      .from('quest_players')
      .select(`
        *,
        character:player_characters!quest_players_character_id_fkey(id, name, level, max_hp, armor_class, portrait_url)
      `)
      .eq('quest_id', quest.id)
      .eq('status', 'accepted'),
    supabase
      .from('quest_sessions')
      .select('*')
      .eq('quest_id', quest.id)
      .in('status', ['active', 'paused'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const players = (playersRes.data ?? []) as unknown as QuestPlayer[]
  const session = sessionRes.data as unknown as QuestSession | null

  return (
    <EncounterBuilderClient
      quest={quest}
      players={players}
      session={session}
    />
  )
}
