'use client'

/**
 * SessionLauncher
 * ---------------
 * Three-way launcher shown to the DM on the quest detail page. Lets the DM
 * choose how they want to run this quest:
 *
 *   1. Print Packet    — opens the existing /api/quests/[id]/print pipeline
 *                        (Homebrewery-style PDF the DM can play from at the table).
 *   2. Start Online    — original flow. Players join from their own devices,
 *                        DM routes to /quests/[slug]/dm.
 *   3. Start In Person — new flow. Players are AT the table with paper sheets.
 *                        DM gets a dashboard (soundboard, image board, initiative
 *                        + HP tracker, script reader) at /quests/[slug]/in-person.
 *
 * If a session is already live, we just show "Resume" buttons that route to
 * whichever dashboard matches the session's stored `metadata.session_mode`.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Printer, Wifi, Users, Play, Loader2 } from 'lucide-react'
import { startSession } from '@/lib/actions/quests'

interface Props {
  campaignId: string
  campaignSlug: string
  hasActiveSession: boolean
  activeSessionMode: 'online' | 'in_person' | null
}

export function SessionLauncher({
  campaignId,
  campaignSlug,
  hasActiveSession,
  activeSessionMode,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'online' | 'in_person' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleStart(mode: 'online' | 'in_person') {
    setLoading(mode)
    setError(null)
    const result = await startSession(campaignId, undefined, mode)
    if (!result.success) {
      setError(result.error ?? 'Failed to start session')
      setLoading(null)
      return
    }
    const dest = mode === 'in_person'
      ? `/quests/${campaignSlug}/in-person`
      : `/quests/${campaignSlug}/dm`
    router.push(dest)
  }

  // Active session — show resume buttons appropriate for the running mode.
  if (hasActiveSession) {
    const isInPerson = activeSessionMode === 'in_person'
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={isInPerson ? `/quests/${campaignSlug}/in-person` : `/quests/${campaignSlug}/dm`}
            className="btn-fantasy flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Resume {isInPerson ? 'In-Person' : 'Online'} Session
          </Link>
          <Link
            href={`/api/quests/${campaignId}/print?print=1`}
            target="_blank"
            className="btn-outline-fantasy flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Packet
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link
          href={`/api/quests/${campaignId}/print?print=1`}
          target="_blank"
          className="group flex flex-col items-start gap-2 rounded-lg border border-gold/20 bg-teal-rich/40 hover:bg-teal-rich/60 hover:border-gold/40 transition-all p-4"
        >
          <div className="flex items-center gap-2 text-gold">
            <Printer className="w-5 h-5" />
            <span className="font-serif text-base">Print Packet</span>
          </div>
          <p className="text-xs text-parchment-muted leading-snug">
            Generate a printable PDF (cover, scenes, read-aloud boxes, stat blocks).
            Best for a fully offline table.
          </p>
        </Link>

        <button
          onClick={() => handleStart('online')}
          disabled={loading !== null}
          className="group flex flex-col items-start gap-2 rounded-lg border border-gold/20 bg-teal-rich/40 hover:bg-teal-rich/60 hover:border-gold/40 transition-all p-4 text-left disabled:opacity-50"
        >
          <div className="flex items-center gap-2 text-gold">
            {loading === 'online' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wifi className="w-5 h-5" />}
            <span className="font-serif text-base">Start Session Online</span>
          </div>
          <p className="text-xs text-parchment-muted leading-snug">
            Players join from their own devices. Full chat, dice, idols, and AI
            narration tools. (Original mode.)
          </p>
        </button>

        <button
          onClick={() => handleStart('in_person')}
          disabled={loading !== null}
          className="group flex flex-col items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all p-4 text-left disabled:opacity-50"
        >
          <div className="flex items-center gap-2 text-amber-200">
            {loading === 'in_person' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
            <span className="font-serif text-base">Start Session In Person</span>
          </div>
          <p className="text-xs text-parchment-muted leading-snug">
            Players use paper sheets at the table. You get a DM/Narrator
            dashboard: soundboard, image board, initiative + HP tracker, script reader.
          </p>
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
          {error}
        </div>
      )}
    </div>
  )
}
