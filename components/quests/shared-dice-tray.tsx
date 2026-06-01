'use client'

/**
 * SharedDiceTray — drop-in panel for any quest session view:
 * quick dice buttons + live-tailing roll feed shared by all participants.
 */

import { useCallback } from 'react'
import { DiceRollVisualizer, QuickDiceButtons, rollDiceLocally } from '@/components/quests/dice-roller'
import { useSharedRolls } from '@/lib/hooks/use-shared-rolls'
import { broadcastRoll } from '@/lib/broadcast-roll'

interface Props {
  questId: string
  sessionId?: string
  rollerName?: string
}

export function SharedDiceTray({ questId, sessionId, rollerName }: Props) {
  const rolls = useSharedRolls(questId)

  const handleRoll = useCallback(
    (formula: string) => {
      const { results, modifier, total } = rollDiceLocally(formula)
      const isCriticalHit = formula === '1d20' && results[0] === 20
      const isCriticalFail = formula === '1d20' && results[0] === 1
      broadcastRoll(questId, {
        formula,
        results,
        modifier,
        total,
        isCriticalHit,
        isCriticalFail,
        rollType: 'custom',
        rollerName,
        sessionId,
      })
    },
    [questId, sessionId, rollerName],
  )

  return (
    <div className="space-y-3">
      <QuickDiceButtons onRoll={handleRoll} />
      <DiceRollVisualizer results={rolls} />
    </div>
  )
}
