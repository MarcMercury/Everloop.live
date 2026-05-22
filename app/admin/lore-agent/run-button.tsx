'use client'

import { useState, useTransition } from 'react'
import { triggerLoreAgentManually } from '@/lib/actions/lore-agent'
import { Sparkles } from 'lucide-react'

export function RunLoreAgentButton() {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  function run() {
    setMessage(null)
    startTransition(async () => {
      const r = await triggerLoreAgentManually()
      if (r.success) setMessage('Run complete.')
      else setMessage(r.error ?? 'Run failed.')
    })
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={run}
        disabled={pending}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold text-sm font-medium transition-colors disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" />
        {pending ? 'Running…' : 'Run Lore Agent Now'}
      </button>
      {message && <span className="text-sm text-parchment-muted">{message}</span>}
    </div>
  )
}
