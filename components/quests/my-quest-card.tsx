'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Clock,
  Compass,
  Globe,
  Bot,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react'
import { deleteQuest } from '@/lib/actions/quests'

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
  creator: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

const QUEST_TYPE_INFO: Record<string, { label: string; icon: React.ReactNode }> = {
  solo: { label: 'Solo Quest', icon: <Compass className="w-5 h-5" /> },
  paired: { label: 'Paired Quest', icon: <Users className="w-5 h-5" /> },
  party: { label: 'Party Quest', icon: <Users className="w-5 h-5" /> },
  public: { label: 'Public Quest', icon: <Globe className="w-5 h-5" /> },
  ai_guided: { label: 'AI-Guided', icon: <Bot className="w-5 h-5" /> },
}

const DIFFICULTY_BADGE: Record<string, { color: string; label: string }> = {
  story_mode: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Story Mode' },
  standard: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Standard' },
  brutal: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Brutal' },
  chaos: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Chaos' },
}

export default function MyQuestCard({ quest }: { quest: QuestRow }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const typeInfo = QUEST_TYPE_INFO[quest.quest_type] ?? QUEST_TYPE_INFO.solo
  const diffBadge = DIFFICULTY_BADGE[quest.difficulty] ?? DIFFICULTY_BADGE.standard
  const isDraft = quest.status === 'draft'

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result = await deleteQuest(quest.id)
      if (!result.success) {
        setError(result.error ?? 'Failed to delete quest')
        setConfirming(false)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="story-card p-5 hover:border-gold/40 transition-all flex flex-col">
      <Link href={`/quests/${quest.slug}`} className="group block">
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
          {quest.times_played > 0 && <span>{quest.times_played} played</span>}
        </div>

        {quest.everloop_overlay && (
          <div className="mt-2">
            <span className="text-xs text-purple-400/80">✦ Everloop Enhanced</span>
          </div>
        )}

        <div className="mt-3">
          {isDraft ? (
            <span className="inline-block px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs">
              Draft — not yet published
            </span>
          ) : quest.status === 'available' || quest.status === 'featured' ? (
            <span className="inline-block px-2 py-0.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs">
              Published
            </span>
          ) : (
            <span className="inline-block px-2 py-0.5 rounded-full border border-gold/20 bg-teal-rich/40 text-parchment-muted text-xs capitalize">
              {quest.status}
            </span>
          )}
        </div>
      </Link>

      {/* Owner actions — drafts only */}
      {isDraft && (
        <div className="mt-4 pt-3 border-t border-gold/10">
          {error && (
            <div className="mb-2 p-2 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          {confirming ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-parchment-muted">Delete this draft?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={pending}
                  className="px-2 py-1 rounded text-xs text-parchment-muted hover:text-parchment transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={pending}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-colors text-xs disabled:opacity-50"
                >
                  {pending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/quests/${quest.slug}/edit`}
                className="flex items-center gap-1 px-2 py-1 rounded border border-gold/30 text-parchment-muted hover:text-gold hover:border-gold/60 transition-colors text-xs"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </Link>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="flex items-center gap-1 px-2 py-1 rounded border border-red-500/30 text-red-400/80 hover:text-red-300 hover:border-red-500/60 transition-colors text-xs"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
