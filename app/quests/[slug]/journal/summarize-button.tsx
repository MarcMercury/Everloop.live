'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Bot, Loader2 } from 'lucide-react'

interface Props { sessionId: string; existingSummary: string | null }

export function JournalSummarizeButton({ sessionId, existingSummary }: Props) {
  const [loading, startLoading] = useTransition()
  const [summary, setSummary] = useState<string | null>(existingSummary)

  function run() {
    startLoading(async () => {
      try {
        const res = await fetch(`/api/quests/sessions/${sessionId}/summarize`, { method: 'POST' })
        const json = await res.json()
        if (json.summary) setSummary(json.summary)
        else alert(json.error || 'Failed to summarize')
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to summarize')
      }
    })
  }

  return (
    <Button size="sm" variant="outline" onClick={run} disabled={loading} className="text-xs">
      {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Bot className="w-3 h-3 mr-1" />}
      {summary ? 'Re-summarize' : 'AI Summarize'}
    </Button>
  )
}
