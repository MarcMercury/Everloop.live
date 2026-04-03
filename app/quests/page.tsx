import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Users, Clock, Sparkles, Compass, Zap, Globe, Bot } from 'lucide-react'

interface QuestRow {
  id: string
  title: string
  slug: string
  description: string | null
  quest_type: string
  difficulty: string
  estimated_duration: string
  min_participants: number
  max_participants: number
  everloop_overlay: boolean
  status: string
  is_official: boolean
  times_played: number
  average_rating: number
  tags: string[]
  updated_at: string
  creator: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null
}

const QUEST_TYPE_INFO: Record<string, { label: string; icon: React.ReactNode; desc: string }> = {
  solo: { label: 'Solo Quest', icon: <Compass className="w-5 h-5" />, desc: 'A personal journey through the Everloop. Just you and the narrative.' },
  paired: { label: 'Paired Quest', icon: <Users className="w-5 h-5" />, desc: 'Two adventurers, bound by fate. Cooperative storytelling for two.' },
  party: { label: 'Party Quest', icon: <Users className="w-5 h-5" />, desc: 'Gather your party. Face challenges designed for a full group.' },
  public: { label: 'Public Quest', icon: <Globe className="w-5 h-5" />, desc: 'Open to all. Jump in with strangers and forge new bonds.' },
  ai_guided: { label: 'AI-Guided', icon: <Bot className="w-5 h-5" />, desc: 'The AI narrates your adventure. No DM needed—the Loop guides you.' },
}

const DIFFICULTY_BADGE: Record<string, { color: string; label: string }> = {
  story_mode: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Story Mode' },
  standard: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Standard' },
  brutal: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Brutal' },
  chaos: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Chaos' },
}

export default async function QuestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch available quests
  const { data: questsData } = await supabase
    .from('quests')
    .select('*, creator:profiles!quests_created_by_fkey(id, username, display_name, avatar_url)')
    .in('status', ['available', 'featured'])
    .order('updated_at', { ascending: false })

  const quests = (questsData ?? []) as unknown as QuestRow[]

  // Fetch my active quest participations
  let myActiveQuests: QuestRow[] = []
  if (user) {
    const { data: participations } = await supabase
      .from('quest_participants')
      .select('quest_id')
      .eq('user_id', user.id)
      .eq('status', 'active')

    const activeIds = ((participations ?? []) as unknown as { quest_id: string }[]).map(p => p.quest_id)
    if (activeIds.length > 0) {
      const { data } = await supabase
        .from('quests')
        .select('*, creator:profiles!quests_created_by_fkey(id, username, display_name, avatar_url)')
        .in('id', activeIds)
      myActiveQuests = (data ?? []) as unknown as QuestRow[]
    }
  }

  const featured = quests.filter(q => q.status === 'featured')
  const available = quests.filter(q => q.status === 'available')

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-serif">
            <span className="text-parchment">Everloop</span>{' '}
            <span className="canon-text">Quest Portal</span>
          </h1>
          <p className="text-parchment-muted mt-2">
            Enter the Loop. Every quest leads somewhere — and everything in the Everloop is being drawn together.
          </p>
        </div>
        {user && (
          <Link
            href="/quests/create"
            className="btn-fantasy flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Quest
          </Link>
        )}
      </div>

      {/* Quest Type Showcase */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
        {Object.entries(QUEST_TYPE_INFO).map(([key, info]) => (
          <div key={key} className="story-card p-4 text-center">
            <div className="flex justify-center text-gold mb-2">{info.icon}</div>
            <h3 className="text-sm font-serif text-parchment">{info.label}</h3>
            <p className="text-xs text-parchment-muted mt-1 line-clamp-2">{info.desc}</p>
          </div>
        ))}
      </div>

      {/* My Active Quests */}
      {myActiveQuests.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-parchment mb-4">
            <Zap className="w-5 h-5 inline mr-2 text-gold" />
            My Active Quests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myActiveQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} isActive />
            ))}
          </div>
        </section>
      )}

      {/* Featured Quests */}
      {featured.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-parchment mb-4">
            <Sparkles className="w-5 h-5 inline mr-2 text-gold" />
            Featured Quests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map(quest => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </section>
      )}

      {/* All Available Quests */}
      <section>
        <h2 className="text-2xl font-serif text-parchment mb-4">
          Available Quests
        </h2>
        {available.length === 0 && featured.length === 0 ? (
          <div className="story-card p-12 text-center">
            <Compass className="w-12 h-12 text-parchment-muted/30 mx-auto mb-4" />
            <h3 className="text-lg font-serif text-parchment mb-2">No quests available yet</h3>
            <p className="text-parchment-muted text-sm mb-4">
              The Quest Portal is waiting for its first stories. Be the pioneer.
            </p>
            {user && (
              <Link href="/quests/create" className="btn-fantasy inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
                <Plus className="w-4 h-4" />
                Create the First Quest
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {available.map(quest => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function QuestCard({ quest, isActive }: { quest: QuestRow; isActive?: boolean }) {
  const typeInfo = QUEST_TYPE_INFO[quest.quest_type] ?? QUEST_TYPE_INFO.solo
  const diffBadge = DIFFICULTY_BADGE[quest.difficulty] ?? DIFFICULTY_BADGE.standard

  return (
    <Link href={`/quests/${quest.slug}`} className="story-card p-5 hover:border-gold/40 transition-all group block">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-gold">
          {typeInfo.icon}
          <span className="text-xs text-parchment-muted">{typeInfo.label}</span>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded-full border ${diffBadge.color}`}>
          {diffBadge.label}
        </span>
      </div>

      <h3 className="text-lg font-serif text-parchment group-hover:text-gold transition-colors mb-2">
        {quest.title}
      </h3>

      {quest.description && (
        <p className="text-sm text-parchment-muted line-clamp-2 mb-3">{quest.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-parchment-muted">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {quest.min_participants === quest.max_participants
            ? `${quest.min_participants}`
            : `${quest.min_participants}-${quest.max_participants}`} players
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {quest.estimated_duration}
        </span>
        {quest.times_played > 0 && (
          <span>{quest.times_played} played</span>
        )}
      </div>

      {quest.everloop_overlay && (
        <div className="mt-2">
          <span className="text-xs text-purple-400/80">✦ Everloop Enhanced</span>
        </div>
      )}

      {isActive && (
        <div className="mt-3 px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-xs text-center">
          In Progress
        </div>
      )}

      {quest.creator && (
        <div className="mt-3 pt-3 border-t border-gold/10 flex items-center gap-2">
          {quest.creator.avatar_url ? (
            <img src={quest.creator.avatar_url} alt="" className="w-5 h-5 rounded-full" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-teal-rich border border-gold/20" />
          )}
          <span className="text-xs text-parchment-muted">
            {quest.is_official ? 'Official' : `by ${quest.creator.display_name || quest.creator.username}`}
          </span>
        </div>
      )}
    </Link>
  )
}
