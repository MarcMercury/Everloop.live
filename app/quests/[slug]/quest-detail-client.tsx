'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { joinQuest, leaveQuest } from '@/lib/actions/quests'
import { Button } from '@/components/ui/button'
import { Play, LogOut, Sword } from 'lucide-react'
import Link from 'next/link'

interface Props {
  questId: string
  questSlug: string
  questStatus: string
  maxParticipants: number
  currentParticipants: number
  isLoggedIn: boolean
  isCreator: boolean
  myParticipation: { id: string; status: string; current_act: number } | null
  userCharacters: { id: string; name: string; race: string; class: string; level: number; portrait_url: string | null }[]
}

export default function QuestDetailClient({
  questId,
  questSlug,
  questStatus,
  maxParticipants,
  currentParticipants,
  isLoggedIn,
  isCreator,
  myParticipation,
  userCharacters,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    userCharacters[0]?.id ?? null
  )

  const isFull = currentParticipants >= maxParticipants
  const isAvailable = ['available', 'featured'].includes(questStatus)

  async function handleJoin() {
    setLoading(true)
    setError(null)
    const result = await joinQuest(questId, selectedCharacterId ?? undefined)
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error ?? 'Failed to join quest')
    }
    setLoading(false)
  }

  async function handleLeave() {
    setLoading(true)
    setError(null)
    const result = await leaveQuest(questId)
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error ?? 'Failed to leave quest')
    }
    setLoading(false)
  }

  if (!isLoggedIn) {
    return (
      <div className="story-card p-6 text-center">
        <p className="text-parchment-muted mb-4">Sign in to join this quest.</p>
        <Button onClick={() => router.push('/login')} className="btn-fantasy">
          Sign In to Play
        </Button>
      </div>
    )
  }

  // Already participating
  if (myParticipation && myParticipation.status === 'active') {
    return (
      <div className="story-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif text-parchment">You&apos;re in this quest</h3>
            <p className="text-sm text-parchment-muted mt-1">Currently on Act {myParticipation.current_act}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/quests/${questSlug}/play`}>
              <Button className="btn-fantasy flex items-center gap-2">
                <Play className="w-4 h-4" />
                Enter Quest
              </Button>
            </Link>
            <Button onClick={handleLeave} disabled={loading} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <LogOut className="w-4 h-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Join flow
  return (
    <div className="story-card p-6">
      <h3 className="text-lg font-serif text-parchment mb-4">Join Quest</h3>

      {!isAvailable ? (
        <p className="text-parchment-muted text-sm">This quest is not currently available.</p>
      ) : isFull ? (
        <p className="text-parchment-muted text-sm">This quest is full ({currentParticipants}/{maxParticipants} players).</p>
      ) : (
        <>
          {/* Character Selection */}
          {userCharacters.length > 0 ? (
            <div className="mb-4">
              <label className="text-sm text-parchment mb-2 block">Select a Character</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {userCharacters.map(char => (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => setSelectedCharacterId(char.id)}
                    className={`story-card p-3 text-left transition-all ${
                      selectedCharacterId === char.id
                        ? 'border-gold/60 shadow-lg shadow-gold/10'
                        : 'hover:border-gold/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {char.portrait_url ? (
                        <img src={char.portrait_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-teal-rich border border-gold/20 flex items-center justify-center">
                          <Sword className="w-4 h-4 text-parchment-muted" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-parchment font-medium">{char.name}</div>
                        <div className="text-xs text-parchment-muted">
                          Lv{char.level} {char.race} {char.class}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
              You have no characters yet.{' '}
              <a href="/player-deck/create" className="underline hover:text-amber-300">
                Create one first
              </a>{' '}
              or join without a character.
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button onClick={handleJoin} disabled={loading} className="btn-fantasy">
              <Play className="w-4 h-4 mr-2" />
              {loading ? 'Joining...' : 'Enter Quest'}
            </Button>
            <span className="text-xs text-parchment-muted">
              {currentParticipants}/{maxParticipants} slots filled
            </span>
          </div>
        </>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
