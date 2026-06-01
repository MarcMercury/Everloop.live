'use client'

/**
 * useSharedRolls — subscribe to a quest's shared dice roll stream.
 *
 * Pulls recent rolls from `quest_messages` (message_type='roll') and live-tails
 * new ones via Supabase realtime. Returns a list of normalized DiceResult-like
 * objects ready to feed into <DiceRollVisualizer />.
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SharedRoll {
  formula: string
  results: number[]
  modifier: number
  total: number
  isCriticalHit: boolean
  isCriticalFail: boolean
  rollType?: string
  rollerName?: string
  timestamp: number
}

interface QuestMessageRow {
  id: string
  created_at: string
  roll_data: Partial<SharedRoll> | null
  character_name: string | null
  message_type: string
}

function normalize(row: QuestMessageRow): SharedRoll | null {
  if (row.message_type !== 'roll' || !row.roll_data) return null
  const r = row.roll_data
  if (!r.formula || !Array.isArray(r.results)) return null
  return {
    formula: r.formula,
    results: r.results as number[],
    modifier: r.modifier ?? 0,
    total: r.total ?? 0,
    isCriticalHit: !!r.isCriticalHit,
    isCriticalFail: !!r.isCriticalFail,
    rollType: r.rollType,
    rollerName: r.rollerName ?? row.character_name ?? undefined,
    timestamp: new Date(row.created_at).getTime(),
  }
}

export function useSharedRolls(questId: string | null, maxHistory: number = 30) {
  const [rolls, setRolls] = useState<SharedRoll[]>([])

  useEffect(() => {
    if (!questId) return
    const supabase = createClient()
    let cancelled = false

    async function loadInitial() {
      const { data } = await supabase
        .from('quest_messages')
        .select('id, created_at, roll_data, character_name, message_type')
        .eq('quest_id', questId)
        .eq('message_type', 'roll')
        .order('created_at', { ascending: false })
        .limit(maxHistory)
      if (cancelled || !data) return
      const normalized = (data as QuestMessageRow[])
        .map(normalize)
        .filter((r): r is SharedRoll => r != null)
        .reverse()
      setRolls(normalized)
    }
    loadInitial()

    const channel = supabase
      .channel(`quest-rolls-${questId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quest_messages',
          filter: `quest_id=eq.${questId}`,
        },
        (payload) => {
          const next = normalize(payload.new as QuestMessageRow)
          if (!next) return
          setRolls((prev) => [...prev.slice(-(maxHistory - 1)), next])
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [questId, maxHistory])

  return rolls
}
