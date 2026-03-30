import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getQuest, getQuestParticipants } from '@/lib/actions/quests'
import { Users, Clock, Star, ArrowLeft, Bot, Compass, Globe } from 'lucide-react'
import Link from 'next/link'
import QuestDetailClient from './quest-detail-client'

const QUEST_TYPE_LABELS: Record<string, string> = {
  solo: 'Solo Quest',
  paired: 'Paired Quest',
  party: 'Party Quest',
  public: 'Public Quest',
  ai_guided: 'AI-Guided Quest',
}

const DIFFICULTY_INFO: Record<string, { label: string; color: string }> = {
  story_mode: { label: 'Story Mode', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  standard: { label: 'Standard', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  brutal: { label: 'Brutal', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  chaos: { label: 'Chaos', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
}

export default async function QuestDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const result = await getQuest(slug)
  if (!result.success || !result.quest) redirect('/quests')

  const quest = result.quest
  const diff = DIFFICULTY_INFO[quest.difficulty] ?? DIFFICULTY_INFO.standard

  // Get participants
  const partResult = await getQuestParticipants(quest.id)
  const participants = partResult.participants ?? []

  // Check if current user already joined
  const myParticipation = user
    ? participants.find(p => p.user_id === user.id && p.status === 'active')
    : null

  // Fetch user's characters for selection
  let userCharacters: { id: string; name: string; race: string; class: string; level: number; portrait_url: string | null }[] = []
  if (user) {
    const { data } = await supabase
      .from('player_characters')
      .select('id, name, race, class, level, portrait_url')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    userCharacters = (data ?? []) as typeof userCharacters
  }

  const isCreator = user?.id === quest.created_by

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/quests" className="flex items-center gap-2 text-sm text-parchment-muted hover:text-parchment transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Quest Portal
      </Link>

      {/* Quest Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className={`px-3 py-1 text-xs rounded-full border ${diff.color}`}>
            {diff.label}
          </span>
          <span className="text-xs text-parchment-muted">
            {QUEST_TYPE_LABELS[quest.quest_type] ?? quest.quest_type}
          </span>
          {quest.everloop_overlay && (
            <span className="text-xs text-purple-400">✦ Everloop Enhanced</span>
          )}
          {quest.is_official && (
            <span className="text-xs text-gold">Official</span>
          )}
        </div>

        <h1 className="text-4xl font-serif text-parchment mb-3">{quest.title}</h1>

        {quest.description && (
          <p className="text-parchment-dark text-lg leading-relaxed">{quest.description}</p>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-6 mt-4 text-sm text-parchment-muted">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {quest.min_participants === quest.max_participants
              ? `${quest.min_participants} player${quest.min_participants > 1 ? 's' : ''}`
              : `${quest.min_participants}-${quest.max_participants} players`}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {quest.estimated_duration}
          </span>
          {quest.times_played > 0 && (
            <span>{quest.times_played} times played</span>
          )}
          {quest.average_rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400" />
              {quest.average_rating.toFixed(1)}
            </span>
          )}
        </div>

        {quest.creator && (
          <div className="flex items-center gap-2 mt-4">
            {quest.creator.avatar_url ? (
              <img src={quest.creator.avatar_url} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-teal-rich border border-gold/20" />
            )}
            <span className="text-sm text-parchment-muted">
              Created by{' '}
              <Link href={`/profile/${quest.creator.username}`} className="text-parchment hover:text-gold transition-colors">
                {quest.creator.display_name || quest.creator.username}
              </Link>
            </span>
          </div>
        )}
      </div>

      {/* Active Participants */}
      {participants.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-serif text-parchment mb-3">Active Participants</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {participants.filter(p => p.status === 'active').map(p => (
              <div key={p.id} className="story-card p-3 flex items-center gap-3">
                {p.user?.avatar_url ? (
                  <img src={p.user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-teal-rich border border-gold/20" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-parchment truncate">
                    {p.user?.display_name || p.user?.username || 'Unknown'}
                  </div>
                  {p.character && (
                    <div className="text-xs text-parchment-muted">
                      {p.character.name} — Lv{p.character.level} {p.character.race} {p.character.class}
                    </div>
                  )}
                </div>
                <div className="text-xs text-parchment-muted">Act {p.current_act}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quest Tags */}
      {quest.tags && quest.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {quest.tags.map(tag => (
            <span key={tag} className="px-2 py-1 text-xs rounded bg-teal-rich/50 text-parchment-muted border border-gold/10">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Join / Play Controls (Client Component) */}
      <QuestDetailClient
        questId={quest.id}
        questStatus={quest.status}
        maxParticipants={quest.max_participants}
        currentParticipants={participants.filter(p => p.status === 'active').length}
        isLoggedIn={!!user}
        isCreator={isCreator}
        myParticipation={myParticipation ? { id: myParticipation.id, status: myParticipation.status, current_act: myParticipation.current_act } : null}
        userCharacters={userCharacters}
      />
    </div>
  )
}
