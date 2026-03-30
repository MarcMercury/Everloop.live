import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getQuest, getQuestParticipants } from '@/lib/actions/quests'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import QuestPlayClient from './quest-play-client'

export default async function QuestPlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = await getQuest(slug)
  if (!result.success || !result.quest) redirect('/quests')
  const quest = result.quest

  // Check participation
  const partResult = await getQuestParticipants(quest.id)
  const participants = partResult.participants ?? []
  const myParticipation = participants.find(
    p => p.user_id === user.id && p.status === 'active'
  )

  if (!myParticipation) redirect(`/quests/${slug}`)

  // Fetch character details if selected
  let character: {
    id: string; name: string; race: string; class: string; level: number
    current_hp: number; max_hp: number; armor_class: number
    portrait_url: string | null; everloop_traits: string[]
    abilities: Record<string, number>
  } | null = null

  if (myParticipation.character_id) {
    const { data } = await supabase
      .from('player_characters')
      .select('id, name, race, class, level, current_hp, max_hp, armor_class, portrait_url, everloop_traits, strength, dexterity, constitution, intelligence, wisdom, charisma')
      .eq('id', myParticipation.character_id)
      .single()

    if (data) {
      const d = data as Record<string, unknown>
      character = {
        id: d.id as string,
        name: d.name as string,
        race: d.race as string,
        class: d.class as string,
        level: d.level as number,
        current_hp: d.current_hp as number,
        max_hp: d.max_hp as number,
        armor_class: d.armor_class as number,
        portrait_url: d.portrait_url as string | null,
        everloop_traits: (d.everloop_traits as string[]) ?? [],
        abilities: {
          STR: d.strength as number ?? 10,
          DEX: d.dexterity as number ?? 10,
          CON: d.constitution as number ?? 10,
          INT: d.intelligence as number ?? 10,
          WIS: d.wisdom as number ?? 10,
          CHA: d.charisma as number ?? 10,
        },
      }
    }
  }

  return (
    <div className="h-[calc(100vh-60px)] flex flex-col">
      {/* Thin top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gold/10 bg-teal-rich/50">
        <div className="flex items-center gap-3">
          <Link
            href={`/quests/${slug}`}
            className="flex items-center gap-1 text-xs text-parchment-muted hover:text-parchment transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Exit
          </Link>
          <div className="w-px h-4 bg-gold/20" />
          <span className="text-sm font-serif text-parchment">{quest.title}</span>
          {quest.everloop_overlay && (
            <span className="text-xs text-purple-400">✦ Everloop</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-parchment-muted">
          <span>Act {myParticipation.current_act}</span>
          {character && (
            <>
              <div className="w-px h-4 bg-gold/20" />
              <span>{character.name}</span>
              <span className="text-green-400">{character.current_hp}/{character.max_hp} HP</span>
            </>
          )}
        </div>
      </div>

      <QuestPlayClient
        questId={quest.id}
        questSlug={slug}
        questTitle={quest.title}
        questDescription={quest.description}
        questType={quest.quest_type}
        difficulty={quest.difficulty}
        everloopOverlay={quest.everloop_overlay}
        aiNarratorConfig={quest.ai_narrator_config}
        participationId={myParticipation.id}
        currentAct={myParticipation.current_act}
        character={character}
      />
    </div>
  )
}
