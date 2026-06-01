'use server'

/**
 * Combat tracker server actions. State lives entirely on
 * `quest_sessions.initiative_order` (JSONB) plus the existing
 * `current_turn_index`, `round_number`, `is_combat`, `metadata` columns —
 * no migrations required.
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { rollInitiative } from '@/lib/dnd-rules/combat'
import type { DndCondition } from '@/types/player-character'

export interface Combatant {
  id: string
  name: string
  initiative: number
  dexMod: number
  hp: number
  maxHp: number
  tempHp?: number
  ac: number
  conditions: DndCondition[]
  isPC: boolean
  characterId?: string | null
  monsterKey?: string | null
  notes?: string
  /** Sequence number used to disambiguate duplicates ("Goblin 1", "Goblin 2"). */
  seq?: number
}

export interface CombatState {
  initiativeOrder: Combatant[]
  currentTurnIndex: number
  roundNumber: number
  isCombat: boolean
}

interface StartCombatInput {
  sessionId: string
  combatants: Array<Omit<Combatant, 'initiative'> & { initiative?: number }>
}

async function assertCanEditSession(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: session } = await supabase
    .from('quest_sessions')
    .select('id, quest_id')
    .eq('id', sessionId)
    .single()
  if (!session) throw new Error('Session not found')
  const { data: quest } = await supabase
    .from('quests')
    .select('id, dm_id, slug')
    .eq('id', (session as { quest_id: string }).quest_id)
    .single()
  if (!quest) throw new Error('Quest not found')
  if ((quest as { dm_id: string }).dm_id !== user.id) {
    throw new Error('Only the DM can manage combat')
  }
  return { supabase, quest: quest as { id: string; dm_id: string; slug: string | null } }
}

export async function startCombat(input: StartCombatInput): Promise<CombatState> {
  const { supabase, quest } = await assertCanEditSession(input.sessionId)

  // Roll initiative for any combatants without an explicit value.
  const rolled: Combatant[] = input.combatants.map((c) => {
    const initiative = c.initiative ?? rollInitiative(c.dexMod ?? 0).total
    return { ...c, initiative, conditions: c.conditions ?? [] }
  })

  // Sort: highest initiative first; ties broken by DEX mod, then PC priority.
  rolled.sort((a, b) => {
    if (b.initiative !== a.initiative) return b.initiative - a.initiative
    if (b.dexMod !== a.dexMod) return b.dexMod - a.dexMod
    if (a.isPC !== b.isPC) return a.isPC ? -1 : 1
    return 0
  })

  const { error } = await supabase
    .from('quest_sessions')
    .update({
      initiative_order: rolled,
      current_turn_index: 0,
      round_number: 1,
      is_combat: true,
    } as never)
    .eq('id', input.sessionId)
  if (error) throw new Error(error.message)

  if (quest.slug) revalidatePath(`/quests/${quest.slug}`)
  return { initiativeOrder: rolled, currentTurnIndex: 0, roundNumber: 1, isCombat: true }
}

export async function endCombat(sessionId: string) {
  const { supabase, quest } = await assertCanEditSession(sessionId)
  const { error } = await supabase
    .from('quest_sessions')
    .update({
      initiative_order: [],
      current_turn_index: 0,
      round_number: 0,
      is_combat: false,
    } as never)
    .eq('id', sessionId)
  if (error) throw new Error(error.message)
  if (quest.slug) revalidatePath(`/quests/${quest.slug}`)
}

export async function advanceTurn(sessionId: string) {
  const { supabase, quest } = await assertCanEditSession(sessionId)
  const { data: session } = await supabase
    .from('quest_sessions')
    .select('initiative_order, current_turn_index, round_number')
    .eq('id', sessionId)
    .single()
  const s = session as { initiative_order: Combatant[]; current_turn_index: number; round_number: number } | null
  if (!s) throw new Error('Session not found')
  const order = s.initiative_order ?? []
  if (order.length === 0) return

  let next = (s.current_turn_index ?? 0) + 1
  let round = s.round_number ?? 1
  if (next >= order.length) {
    next = 0
    round += 1
  }

  const { error } = await supabase
    .from('quest_sessions')
    .update({ current_turn_index: next, round_number: round } as never)
    .eq('id', sessionId)
  if (error) throw new Error(error.message)
  if (quest.slug) revalidatePath(`/quests/${quest.slug}`)
}

interface PatchCombatantInput {
  sessionId: string
  combatantId: string
  patch: Partial<Combatant>
}

export async function patchCombatant(input: PatchCombatantInput) {
  const { supabase, quest } = await assertCanEditSession(input.sessionId)
  const { data: session } = await supabase
    .from('quest_sessions')
    .select('initiative_order')
    .eq('id', input.sessionId)
    .single()
  const order = (session as { initiative_order: Combatant[] } | null)?.initiative_order ?? []
  const updated = order.map((c) => (c.id === input.combatantId ? { ...c, ...input.patch } : c))
  const { error } = await supabase
    .from('quest_sessions')
    .update({ initiative_order: updated } as never)
    .eq('id', input.sessionId)
  if (error) throw new Error(error.message)
  if (quest.slug) revalidatePath(`/quests/${quest.slug}`)
}

export async function adjustCombatantHp(sessionId: string, combatantId: string, delta: number) {
  const { supabase, quest } = await assertCanEditSession(sessionId)
  const { data: session } = await supabase
    .from('quest_sessions')
    .select('initiative_order')
    .eq('id', sessionId)
    .single()
  const order = (session as { initiative_order: Combatant[] } | null)?.initiative_order ?? []
  const updated = order.map((c) => {
    if (c.id !== combatantId) return c
    let hp = c.hp + delta
    if (hp > c.maxHp) hp = c.maxHp
    if (hp < 0) hp = 0
    return { ...c, hp }
  })
  const { error } = await supabase
    .from('quest_sessions')
    .update({ initiative_order: updated } as never)
    .eq('id', sessionId)
  if (error) throw new Error(error.message)
  if (quest.slug) revalidatePath(`/quests/${quest.slug}`)
}

export async function toggleCombatantCondition(sessionId: string, combatantId: string, condition: DndCondition) {
  const { supabase, quest } = await assertCanEditSession(sessionId)
  const { data: session } = await supabase
    .from('quest_sessions')
    .select('initiative_order')
    .eq('id', sessionId)
    .single()
  const order = (session as { initiative_order: Combatant[] } | null)?.initiative_order ?? []
  const updated = order.map((c) => {
    if (c.id !== combatantId) return c
    const has = (c.conditions ?? []).includes(condition)
    const conditions = has
      ? c.conditions.filter((x) => x !== condition)
      : [...(c.conditions ?? []), condition]
    return { ...c, conditions }
  })
  const { error } = await supabase
    .from('quest_sessions')
    .update({ initiative_order: updated as never } as never)
    .eq('id', sessionId)
  if (error) throw new Error(error.message)
  if (quest.slug) revalidatePath(`/quests/${quest.slug}`)
}

export async function removeCombatant(sessionId: string, combatantId: string) {
  const { supabase, quest } = await assertCanEditSession(sessionId)
  const { data: session } = await supabase
    .from('quest_sessions')
    .select('initiative_order, current_turn_index')
    .eq('id', sessionId)
    .single()
  const s = session as { initiative_order: Combatant[]; current_turn_index: number } | null
  if (!s) return
  const idx = s.initiative_order.findIndex((c) => c.id === combatantId)
  if (idx === -1) return
  const updated = s.initiative_order.filter((c) => c.id !== combatantId)
  let cur = s.current_turn_index ?? 0
  if (idx < cur) cur = Math.max(0, cur - 1)
  if (cur >= updated.length) cur = 0
  const { error } = await supabase
    .from('quest_sessions')
    .update({ initiative_order: updated, current_turn_index: cur } as never)
    .eq('id', sessionId)
  if (error) throw new Error(error.message)
  if (quest.slug) revalidatePath(`/quests/${quest.slug}`)
}

export async function addCombatant(sessionId: string, combatant: Combatant) {
  const { supabase, quest } = await assertCanEditSession(sessionId)
  const { data: session } = await supabase
    .from('quest_sessions')
    .select('initiative_order')
    .eq('id', sessionId)
    .single()
  const order = (session as { initiative_order: Combatant[] } | null)?.initiative_order ?? []
  const next = [...order, combatant].sort((a, b) => b.initiative - a.initiative)
  const { error } = await supabase
    .from('quest_sessions')
    .update({ initiative_order: next } as never)
    .eq('id', sessionId)
  if (error) throw new Error(error.message)
  if (quest.slug) revalidatePath(`/quests/${quest.slug}`)
}
