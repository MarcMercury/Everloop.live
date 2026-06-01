/**
 * Client helper for fire-and-forget broadcasting of a dice roll to a quest's
 * shared message stream. Pair with the `useSharedRolls` hook (or a server
 * fetch of `quest_messages` where message_type='roll') to display them.
 */

export interface BroadcastRollPayload {
  formula: string
  results: number[]
  modifier: number
  total: number
  isCriticalHit?: boolean
  isCriticalFail?: boolean
  rollType?: string
  rollerName?: string
  sessionId?: string
  visibleTo?: string[]
}

export async function broadcastRoll(questId: string, payload: BroadcastRollPayload): Promise<void> {
  try {
    await fetch(`/api/quests/${encodeURIComponent(questId)}/roll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch {
    // Intentionally swallow: dice broadcast must never block the UI.
  }
}
