// @ts-nocheck — campaign tables not yet in generated Supabase types
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  Quest,
  QuestInsert,
  QuestUpdate,
  QuestPlayer,
  QuestScene,
  QuestSceneInsert,
  QuestSceneUpdate,
  QuestSession,
  QuestMessage,
  QuestDiceRoll,
  NarrativeIdol,
  QuestNpc,
  DiceRollData,
  MessageType,
  RollType,
  AdvantageType,
  IdolPower,
  IdolType,
} from '@/types/quest'

// =====================================================
// CAMPAIGNS
// =====================================================

export async function getQuests(filters?: {
  status?: string
  game_mode?: string
  is_public?: boolean
}): Promise<{ success: boolean; campaigns?: Quest[]; error?: string }> {
  const supabase = await createClient()

  let query = supabase
    .from('quests')
    .select('*, dm:profiles!quests_dm_id_fkey(id, username, display_name, avatar_url)')
    .order('updated_at', { ascending: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.game_mode) query = query.eq('game_mode', filters.game_mode)
  if (filters?.is_public !== undefined) query = query.eq('is_public', filters.is_public)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching campaigns:', error)
    return { success: false, error: error.message }
  }

  return { success: true, campaigns: (data ?? []) as unknown as Quest[] }
}

export async function getQuest(idOrSlug: string): Promise<{ success: boolean; campaign?: Quest; error?: string }> {
  const supabase = await createClient()

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)

  let query = supabase
    .from('quests')
    .select('*, dm:profiles!quests_dm_id_fkey(id, username, display_name, avatar_url)')

  if (isUuid) {
    query = query.eq('id', idOrSlug)
  } else {
    query = query.eq('slug', idOrSlug)
  }

  const { data, error } = await query.single()

  if (error) {
    console.error('Error fetching campaign:', error)
    return { success: false, error: error.message }
  }

  return { success: true, campaign: data as unknown as Quest }
}

export async function getMyQuests(): Promise<{ success: boolean; campaigns?: Quest[]; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Quests I DM
  const { data: dmQuests, error: dmErr } = await supabase
    .from('quests')
    .select('*, dm:profiles!quests_dm_id_fkey(id, username, display_name, avatar_url)')
    .eq('dm_id', user.id)
    .order('updated_at', { ascending: false })

  if (dmErr) return { success: false, error: dmErr.message }

  // Quests I'm a player in
  const { data: playerEntries } = await supabase
    .from('quest_players')
    .select('quest_id')
    .eq('user_id', user.id)
    .eq('status', 'accepted')

  let playerQuests: Quest[] = []
  if (playerEntries && playerEntries.length > 0) {
    const ids = playerEntries.map(p => p.quest_id)
    const { data } = await supabase
      .from('quests')
      .select('*, dm:profiles!quests_dm_id_fkey(id, username, display_name, avatar_url)')
      .in('id', ids)
      .order('updated_at', { ascending: false })
    playerQuests = (data ?? []) as unknown as Quest[]
  }

  const all = [...(dmQuests ?? []) as unknown as Quest[], ...playerQuests]
  // Deduplicate
  const seen = new Set<string>()
  const unique = all.filter(c => {
    if (seen.has(c.id)) return false
    seen.add(c.id)
    return true
  })

  return { success: true, campaigns: unique }
}

export async function createQuest(input: Omit<QuestInsert, 'dm_id' | 'slug'>): Promise<{
  success: boolean; campaign?: Quest; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const slug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now().toString(36)

  const { data, error } = await supabase
    .from('quests')
    .insert({ ...input, dm_id: user.id, slug })
    .select()
    .single()

  if (error) {
    console.error('Error creating campaign:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/quests')
  return { success: true, campaign: data as unknown as Quest }
}

export async function updateQuest(id: string, updates: QuestUpdate): Promise<{
  success: boolean; campaign?: Quest; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('quests')
    .update(updates)
    .eq('id', id)
    .eq('dm_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating campaign:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/quests')
  revalidatePath(`/quests/${id}`)
  return { success: true, campaign: data as unknown as Quest }
}

// =====================================================
// CAMPAIGN PLAYERS
// =====================================================

export async function getQuestPlayers(campaignId: string): Promise<{
  success: boolean; players?: QuestPlayer[]; error?: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Verify user is DM or player in this campaign
  const { data: campaign } = await supabase
    .from('quests')
    .select('id, dm_id')
    .eq('id', campaignId)
    .single()

  if (!campaign) return { success: false, error: 'Quest not found' }

  const campaignRow = campaign as { id: string; dm_id: string }
  if (campaignRow.dm_id !== user.id) {
    const { data: player } = await supabase
      .from('quest_players')
      .select('id')
      .eq('quest_id', campaignId)
      .eq('user_id', user.id)
      .single()
    if (!player) return { success: false, error: 'Access denied' }
  }

  const { data, error } = await supabase
    .from('quest_players')
    .select(`
      *,
      user:profiles!quest_players_user_id_fkey(id, username, display_name, avatar_url),
      character:player_characters!quest_players_character_id_fkey(id, name, race, class, level, current_hp, max_hp, armor_class, portrait_url, theme_color)
    `)
    .eq('quest_id', campaignId)
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Error fetching campaign players:', error)
    return { success: false, error: error.message }
  }

  return { success: true, players: (data ?? []) as unknown as QuestPlayer[] }
}

export async function joinQuest(campaignId: string, characterId?: string): Promise<{
  success: boolean; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Check campaign exists and is recruiting
  const { data: campaign } = await supabase
    .from('quests')
    .select('id, max_players, status, dm_id')
    .eq('id', campaignId)
    .single()

  if (!campaign) return { success: false, error: 'Quest not found' }
  if (campaign.dm_id === user.id) return { success: false, error: 'You are the DM of this campaign' }
  if (!['lobby', 'recruiting'].includes(campaign.status)) return { success: false, error: 'Quest is not accepting players' }

  // Check player count
  const { count } = await supabase
    .from('quest_players')
    .select('id', { count: 'exact', head: true })
    .eq('quest_id', campaignId)
    .in('status', ['pending', 'accepted'])

  if ((count ?? 0) >= (campaign.max_players ?? 6)) {
    return { success: false, error: 'Quest is full' }
  }

  const { error } = await supabase
    .from('quest_players')
    .insert({
      quest_id: campaignId,
      user_id: user.id,
      character_id: characterId ?? null,
      status: 'pending',
    })

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Already joined this campaign' }
    console.error('Error joining campaign:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/quests/${campaignId}`)
  return { success: true }
}

export async function updatePlayerStatus(
  campaignId: string,
  playerId: string,
  status: 'accepted' | 'rejected' | 'removed'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Verify DM
  const { data: campaign } = await supabase
    .from('quests')
    .select('dm_id')
    .eq('id', campaignId)
    .single()

  if (!campaign || campaign.dm_id !== user.id) {
    return { success: false, error: 'Only the DM can manage players' }
  }

  const updates: Record<string, unknown> = { status }
  if (status === 'accepted') updates.joined_at = new Date().toISOString()

  const { error } = await supabase
    .from('quest_players')
    .update(updates)
    .eq('id', playerId)
    .eq('quest_id', campaignId)

  if (error) {
    console.error('Error updating player status:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/quests/${campaignId}`)
  return { success: true }
}

export async function selectCharacter(campaignId: string, characterId: string): Promise<{
  success: boolean; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('quest_players')
    .update({ character_id: characterId })
    .eq('quest_id', campaignId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error selecting character:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/quests/${campaignId}`)
  return { success: true }
}

// =====================================================
// SESSION ZERO (Safety + Heart Anchors)
// =====================================================

export async function submitSessionZero(input: {
  questId: string
  lines: string
  veils: string
  tonePreference: 'light' | 'mixed' | 'dark'
  heartAnchors: Array<{ label: string; note?: string }>
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Verify the user is an accepted player (or the DM) in this quest
  const { data: row } = await supabase
    .from('quest_players')
    .select('id, status')
    .eq('quest_id', input.questId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!row) return { success: false, error: 'Not a player of this quest' }

  // Trim and validate
  const lines = (input.lines || '').trim().slice(0, 1000)
  const veils = (input.veils || '').trim().slice(0, 1000)
  const heartAnchors = (input.heartAnchors || [])
    .filter(a => a && typeof a.label === 'string' && a.label.trim().length > 0)
    .slice(0, 5)
    .map(a => ({
      label: a.label.trim().slice(0, 80),
      note: a.note ? String(a.note).trim().slice(0, 200) : undefined,
    }))

  const { error } = await supabase
    .from('quest_players')
    .update({
      lines_text: lines || null,
      veils_text: veils || null,
      tone_preference: input.tonePreference,
      heart_anchors: heartAnchors,
      session_zero_completed_at: new Date().toISOString(),
    })
    .eq('id', row.id)

  if (error) {
    console.error('Error submitting Session Zero:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/quests/${input.questId}`)
  return { success: true }
}

export async function getSessionZero(questId: string): Promise<{
  success: boolean
  data?: {
    lines_text: string | null
    veils_text: string | null
    tone_preference: 'light' | 'mixed' | 'dark' | null
    heart_anchors: Array<{ label: string; note?: string }>
    session_zero_completed_at: string | null
  }
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('quest_players')
    .select('lines_text, veils_text, tone_preference, heart_anchors, session_zero_completed_at')
    .eq('quest_id', questId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return { success: false, error: error.message }
  if (!data) return { success: false, error: 'Not a player of this quest' }

  return {
    success: true,
    data: {
      lines_text: data.lines_text ?? null,
      veils_text: data.veils_text ?? null,
      tone_preference: data.tone_preference ?? null,
      heart_anchors: Array.isArray(data.heart_anchors) ? data.heart_anchors : [],
      session_zero_completed_at: data.session_zero_completed_at ?? null,
    },
  }
}

// DM-only aggregate view of all safety inputs from accepted players.
export async function getQuestSafetySummary(questId: string): Promise<{
  success: boolean
  data?: {
    lines: string[]
    veils: string[]
    tones: Record<'light' | 'mixed' | 'dark', number>
    pending: number       // accepted players who haven't done Session Zero
    completed: number
  }
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: quest } = await supabase
    .from('quests')
    .select('dm_id')
    .eq('id', questId)
    .single()

  if (!quest || quest.dm_id !== user.id) {
    return { success: false, error: 'Only the DM can view safety summary' }
  }

  const { data: rows, error } = await supabase
    .from('quest_players')
    .select('lines_text, veils_text, tone_preference, session_zero_completed_at')
    .eq('quest_id', questId)
    .eq('status', 'accepted')

  if (error) return { success: false, error: error.message }

  const lines: string[] = []
  const veils: string[] = []
  const tones = { light: 0, mixed: 0, dark: 0 }
  let pending = 0
  let completed = 0

  for (const r of rows || []) {
    if (r.session_zero_completed_at) {
      completed += 1
      if (r.lines_text) lines.push(r.lines_text)
      if (r.veils_text) veils.push(r.veils_text)
      if (r.tone_preference && r.tone_preference in tones) {
        tones[r.tone_preference as keyof typeof tones] += 1
      }
    } else {
      pending += 1
    }
  }

  return { success: true, data: { lines, veils, tones, pending, completed } }
}

// Quill Handoff: track whether the DM or the Narrator currently holds the Quill (live-play voice).
// `holder` is a free-form label so groups can use whatever vocabulary they like
// (e.g. 'dm', 'narrator', or a specific user id). Passing null clears the holder.
export async function setQuillHolder(sessionId: string, holder: string | null): Promise<{
  success: boolean; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Verify user is DM of the parent quest
  const { data: sess } = await supabase
    .from('quest_sessions')
    .select('id, quest_id')
    .eq('id', sessionId)
    .single()

  if (!sess) return { success: false, error: 'Session not found' }

  const { data: quest } = await supabase
    .from('quests')
    .select('dm_id, slug')
    .eq('id', sess.quest_id)
    .single()

  if (!quest || quest.dm_id !== user.id) {
    return { success: false, error: 'Only the DM can set the Quill holder' }
  }

  const trimmed = holder?.trim() || null
  const { error } = await supabase
    .from('quest_sessions')
    .update({ quill_holder: trimmed })
    .eq('id', sessionId)

  if (error) return { success: false, error: error.message }

  if (quest.slug) revalidatePath(`/quests/${quest.slug}/dm`)
  return { success: true }
}

// Spotlight: pick up to 2 players per session whose moments take priority.
// Stored on quest_sessions.spotlight_player_ids (UUID[]).
export async function setSpotlightPlayers(
  sessionId: string,
  playerUserIds: string[],
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Cap at 2 and dedupe
  const clean = Array.from(new Set(playerUserIds)).slice(0, 2)

  const { data: sess } = await supabase
    .from('quest_sessions')
    .select('id, quest_id')
    .eq('id', sessionId)
    .single()
  if (!sess) return { success: false, error: 'Session not found' }

  const { data: quest } = await supabase
    .from('quests')
    .select('dm_id, slug')
    .eq('id', sess.quest_id)
    .single()
  if (!quest || quest.dm_id !== user.id) {
    return { success: false, error: 'Only the DM can set the spotlight' }
  }

  const { error } = await supabase
    .from('quest_sessions')
    .update({ spotlight_player_ids: clean })
    .eq('id', sessionId)
  if (error) return { success: false, error: error.message }

  if (quest.slug) revalidatePath(`/quests/${quest.slug}/dm`)
  return { success: true }
}

// =====================================================
// WORLD COGS — offscreen plots that turn whether players see them or not
// =====================================================

export async function listWorldCogs(questId: string): Promise<{
  success: boolean; data?: any[]; error?: string
}> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('world_cogs')
    .select('*')
    .eq('quest_id', questId)
    .order('created_at', { ascending: true })
  if (error) return { success: false, error: error.message }
  return { success: true, data: data ?? [] }
}

async function assertDmOfQuest(questId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Not authenticated', supabase, user: null }
  const { data: quest } = await supabase
    .from('quests')
    .select('dm_id, slug')
    .eq('id', questId)
    .single()
  if (!quest || quest.dm_id !== user.id) {
    return { ok: false as const, error: 'Only the DM can manage world cogs', supabase, user }
  }
  return { ok: true as const, supabase, user, slug: quest.slug as string | null }
}

export async function createWorldCog(input: {
  quest_id: string
  faction: string
  goal: string
  tempo?: 'crawl' | 'steady' | 'rushing'
  current_state?: string | null
  next_beat?: string | null
  visible_to_players?: boolean
  shard_ref?: number | null
  fray_ref?: string | null
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const g = await assertDmOfQuest(input.quest_id)
  if (!g.ok) return { success: false, error: g.error }
  const { data, error } = await g.supabase
    .from('world_cogs')
    .insert({
      quest_id: input.quest_id,
      faction: input.faction.trim(),
      goal: input.goal.trim(),
      tempo: input.tempo ?? 'steady',
      current_state: input.current_state ?? null,
      next_beat: input.next_beat ?? null,
      visible_to_players: input.visible_to_players ?? false,
      shard_ref: input.shard_ref ?? null,
      fray_ref: input.fray_ref ?? null,
    })
    .select()
    .single()
  if (error) return { success: false, error: error.message }
  if (g.slug) revalidatePath(`/quests/${g.slug}/dm`)
  return { success: true, data }
}

export async function updateWorldCog(
  id: string,
  patch: Partial<{
    faction: string
    goal: string
    tempo: 'crawl' | 'steady' | 'rushing'
    current_state: string | null
    next_beat: string | null
    visible_to_players: boolean
  }>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: cog } = await supabase
    .from('world_cogs')
    .select('quest_id')
    .eq('id', id)
    .single()
  if (!cog) return { success: false, error: 'Cog not found' }
  const g = await assertDmOfQuest(cog.quest_id)
  if (!g.ok) return { success: false, error: g.error }
  const { error } = await g.supabase.from('world_cogs').update(patch).eq('id', id)
  if (error) return { success: false, error: error.message }
  if (g.slug) revalidatePath(`/quests/${g.slug}/dm`)
  return { success: true }
}

export async function deleteWorldCog(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: cog } = await supabase.from('world_cogs').select('quest_id').eq('id', id).single()
  if (!cog) return { success: false, error: 'Cog not found' }
  const g = await assertDmOfQuest(cog.quest_id)
  if (!g.ok) return { success: false, error: g.error }
  const { error } = await g.supabase.from('world_cogs').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  if (g.slug) revalidatePath(`/quests/${g.slug}/dm`)
  return { success: true }
}

// Advance the cog: promote next_beat into current_state and bump last_advanced_at.
export async function advanceWorldCog(
  id: string,
  newNextBeat?: string | null,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: cog } = await supabase
    .from('world_cogs')
    .select('quest_id, next_beat, current_state')
    .eq('id', id)
    .single()
  if (!cog) return { success: false, error: 'Cog not found' }
  const g = await assertDmOfQuest(cog.quest_id)
  if (!g.ok) return { success: false, error: g.error }
  const promoted = cog.next_beat ?? cog.current_state ?? null
  const { error } = await g.supabase
    .from('world_cogs')
    .update({
      current_state: promoted,
      next_beat: newNextBeat ?? null,
      last_advanced_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) return { success: false, error: error.message }
  if (g.slug) revalidatePath(`/quests/${g.slug}/dm`)
  return { success: true }
}

export async function getQuestScenes(campaignId: string): Promise<{
  success: boolean; scenes?: QuestScene[]; error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quest_scenes')
    .select('*')
    .eq('quest_id', campaignId)
    .order('scene_order', { ascending: true })

  if (error) {
    console.error('Error fetching scenes:', error)
    return { success: false, error: error.message }
  }

  return { success: true, scenes: (data ?? []) as unknown as QuestScene[] }
}

export async function createScene(input: QuestSceneInsert): Promise<{
  success: boolean; scene?: QuestScene; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Get next scene order
  const { count } = await supabase
    .from('quest_scenes')
    .select('id', { count: 'exact', head: true })
    .eq('quest_id', input.quest_id)

  const { data, error } = await supabase
    .from('quest_scenes')
    .insert({ ...input, scene_order: input.scene_order ?? (count ?? 0) })
    .select()
    .single()

  if (error) {
    console.error('Error creating scene:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/quests/${input.quest_id}`)
  return { success: true, scene: data as unknown as QuestScene }
}

export async function updateScene(id: string, campaignId: string, updates: QuestSceneUpdate): Promise<{
  success: boolean; scene?: QuestScene; error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quest_scenes')
    .update(updates)
    .eq('id', id)
    .eq('quest_id', campaignId)
    .select()
    .single()

  if (error) {
    console.error('Error updating scene:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/quests/${campaignId}`)
  return { success: true, scene: data as unknown as QuestScene }
}

// =====================================================
// SESSIONS
// =====================================================

export async function startSession(campaignId: string, title?: string): Promise<{
  success: boolean; session?: QuestSession; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Get session number
  const { count } = await supabase
    .from('quest_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('quest_id', campaignId)

  // Get first prepared scene
  const { data: firstScene } = await supabase
    .from('quest_scenes')
    .select('id')
    .eq('quest_id', campaignId)
    .eq('status', 'prepared')
    .order('scene_order', { ascending: true })
    .limit(1)
    .single()

  const { data, error } = await supabase
    .from('quest_sessions')
    .insert({
      quest_id: campaignId,
      session_number: (count ?? 0) + 1,
      title: title ?? `Session ${(count ?? 0) + 1}`,
      status: 'active',
      active_scene_id: firstScene?.id ?? null,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error starting session:', error)
    return { success: false, error: error.message }
  }

  // Update campaign status
  await supabase
    .from('quests')
    .update({ status: 'in_progress' })
    .eq('id', campaignId)
    .eq('dm_id', user.id)

  // Activate the first scene
  if (firstScene?.id) {
    await supabase
      .from('quest_scenes')
      .update({ status: 'active' })
      .eq('id', firstScene.id)
  }

  revalidatePath(`/quests/${campaignId}`)
  return { success: true, session: data as unknown as QuestSession }
}

export async function getActiveSession(campaignId: string): Promise<{
  success: boolean; session?: QuestSession; error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quest_sessions')
    .select('*')
    .eq('quest_id', campaignId)
    .in('status', ['active', 'paused'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return { success: true, session: undefined } // No rows
    return { success: false, error: error.message }
  }

  return { success: true, session: data as unknown as QuestSession }
}

export async function endSession(sessionId: string, campaignId: string, summary?: string): Promise<{
  success: boolean; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('quest_sessions')
    .update({
      status: 'completed',
      ended_at: new Date().toISOString(),
      summary: summary ?? null,
    })
    .eq('id', sessionId)

  if (error) {
    console.error('Error ending session:', error)
    return { success: false, error: error.message }
  }

  // Increment campaign session count
  await supabase.rpc('increment_campaign_sessions', { quest_id: campaignId }).catch(() => {
    // Fallback: manual increment
    supabase
      .from('quests')
      .select('session_count')
      .eq('id', campaignId)
      .single()
      .then(({ data }) => {
        if (data) {
          supabase
            .from('quests')
            .update({ session_count: (data.session_count ?? 0) + 1 })
            .eq('id', campaignId)
        }
      })
  })

  revalidatePath(`/quests/${campaignId}`)
  return { success: true }
}

export async function changeScene(sessionId: string, sceneId: string, campaignId: string): Promise<{
  success: boolean; error?: string
}> {
  const supabase = await createClient()

  // Deactivate old scene
  const { data: session } = await supabase
    .from('quest_sessions')
    .select('active_scene_id')
    .eq('id', sessionId)
    .single()

  if (session?.active_scene_id) {
    await supabase
      .from('quest_scenes')
      .update({ status: 'completed' })
      .eq('id', session.active_scene_id)
  }

  // Activate new scene
  await supabase
    .from('quest_scenes')
    .update({ status: 'active' })
    .eq('id', sceneId)

  // Update session
  const { error } = await supabase
    .from('quest_sessions')
    .update({ active_scene_id: sceneId })
    .eq('id', sessionId)

  if (error) {
    console.error('Error changing scene:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/quests/${campaignId}`)
  return { success: true }
}

// =====================================================
// MESSAGES
// =====================================================

export async function sendMessage(input: {
  session_id: string
  quest_id: string
  message_type: MessageType
  content: string
  visible_to?: string[]
  roll_data?: DiceRollData
  reference_data?: Record<string, unknown>
  character_name?: string
  tone?: 'hushed' | 'steady' | 'urgent' | 'grim' | 'wondrous' | null
}): Promise<{ success: boolean; message?: QuestMessage; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('quest_messages')
    .insert({
      ...input,
      sender_id: user.id,
      visible_to: input.visible_to ?? [],
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return { success: false, error: error.message }
  }

  return { success: true, message: data as unknown as QuestMessage }
}

export async function getSessionMessages(sessionId: string, limit = 100): Promise<{
  success: boolean; messages?: QuestMessage[]; error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quest_messages')
    .select(`
      *,
      sender:profiles!quest_messages_sender_id_fkey(username, display_name, avatar_url)
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching messages:', error)
    return { success: false, error: error.message }
  }

  return { success: true, messages: (data ?? []) as unknown as QuestMessage[] }
}

// =====================================================
// DICE ROLLS
// =====================================================

function rollDice(sides: number, count: number): number[] {
  const results: number[] = []
  for (let i = 0; i < count; i++) {
    results.push(Math.floor(Math.random() * sides) + 1)
  }
  return results
}

function parseDiceFormula(formula: string): { count: number; sides: number; modifier: number } {
  const match = formula.match(/^(\d+)?d(\d+)([+-]\d+)?$/i)
  if (!match) return { count: 1, sides: 20, modifier: 0 }
  return {
    count: parseInt(match[1] || '1'),
    sides: parseInt(match[2]),
    modifier: parseInt(match[3] || '0'),
  }
}

export async function rollDiceAction(input: {
  session_id: string
  quest_id: string
  roll_type: RollType
  dice_formula: string
  ability?: string
  skill?: string
  dc?: number
  advantage_type?: AdvantageType
  is_secret?: boolean
  character_name?: string
}): Promise<{ success: boolean; roll?: QuestDiceRoll; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { count, sides, modifier } = parseDiceFormula(input.dice_formula)
  const advantage = input.advantage_type ?? 'normal'

  let diceResults: number[]
  if (sides === 20 && count === 1 && advantage !== 'normal') {
    // Roll 2d20 for advantage/disadvantage
    const twoRolls = rollDice(20, 2)
    const chosen = advantage === 'advantage' ? Math.max(...twoRolls) : Math.min(...twoRolls)
    diceResults = [chosen]
  } else {
    diceResults = rollDice(sides, count)
  }

  const diceSum = diceResults.reduce((a, b) => a + b, 0)
  const total = diceSum + modifier

  const isCritHit = sides === 20 && count === 1 && diceResults[0] === 20
  const isCritFail = sides === 20 && count === 1 && diceResults[0] === 1
  const isSuccess = input.dc !== undefined ? total >= input.dc : null

  const { data, error } = await supabase
    .from('quest_dice_rolls')
    .insert({
      session_id: input.session_id,
      quest_id: input.quest_id,
      player_id: user.id,
      character_name: input.character_name ?? null,
      roll_type: input.roll_type,
      dice_formula: input.dice_formula,
      dice_results: diceResults,
      modifier,
      total,
      ability: input.ability ?? null,
      skill: input.skill ?? null,
      dc: input.dc ?? null,
      is_critical_hit: isCritHit,
      is_critical_fail: isCritFail,
      is_success: isSuccess,
      is_secret: input.is_secret ?? false,
      advantage_type: advantage,
    })
    .select()
    .single()

  if (error) {
    console.error('Error recording dice roll:', error)
    return { success: false, error: error.message }
  }

  // Also send as a message
  const rollDisplay = isCritHit ? '🎯 CRITICAL HIT!' : isCritFail ? '💀 CRITICAL FAIL!' : `Rolled ${total}`
  await sendMessage({
    session_id: input.session_id,
    quest_id: input.quest_id,
    message_type: 'roll',
    content: `${input.character_name ?? 'Unknown'} rolls ${input.dice_formula}: [${diceResults.join(', ')}] + ${modifier} = **${total}** ${rollDisplay}${input.dc ? ` (DC ${input.dc}: ${isSuccess ? '✅ Success' : '❌ Fail'})` : ''}`,
    roll_data: {
      formula: input.dice_formula,
      dice: [{ sides, count, results: diceResults }],
      modifier,
      total,
      advantage_type: advantage,
      is_critical_hit: isCritHit,
      is_critical_fail: isCritFail,
    },
    character_name: input.character_name,
    visible_to: input.is_secret ? [user.id] : [],
  })

  return { success: true, roll: data as unknown as QuestDiceRoll }
}

// =====================================================
// NARRATIVE IDOLS
// =====================================================

export async function getQuestIdols(campaignId: string): Promise<{
  success: boolean; idols?: NarrativeIdol[]; error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('narrative_idols')
    .select('*')
    .eq('quest_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, idols: (data ?? []) as unknown as NarrativeIdol[] }
}

export async function grantIdol(input: {
  quest_id: string
  player_id: string
  session_id: string
  name: string
  description?: string
  idol_type: IdolType
  power: IdolPower | string
  visual?: string
  reason: string
}): Promise<{ success: boolean; idol?: NarrativeIdol; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('narrative_idols')
    .insert({
      quest_id: input.quest_id,
      holder_id: input.player_id,
      name: input.name,
      description: input.description ?? null,
      visual: input.visual ?? null,
      idol_type: input.idol_type,
      power: input.power,
      status: 'held',
      earned_by: input.player_id,
      earned_in_session: input.session_id,
      earned_reason: input.reason,
    })
    .select()
    .single()

  if (error) {
    console.error('Error granting idol:', error)
    return { success: false, error: error.message }
  }

  // Update player idol count
  await supabase.rpc('increment_player_idols', {
    p_campaign_id: input.quest_id,
    p_user_id: input.player_id,
  }).catch(() => {})

  // Send message
  await sendMessage({
    session_id: input.session_id,
    quest_id: input.quest_id,
    message_type: 'idol',
    content: `🏆 **${input.name}** has been granted! ${input.reason}`,
    reference_data: { idol_id: data?.id, power: input.power },
  })

  return { success: true, idol: data as unknown as NarrativeIdol }
}

export async function useIdol(idolId: string, sessionId: string, campaignId: string, effect: string): Promise<{
  success: boolean; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Verify holder
  const { data: idol } = await supabase
    .from('narrative_idols')
    .select('*')
    .eq('id', idolId)
    .eq('holder_id', user.id)
    .eq('status', 'held')
    .single()

  if (!idol) return { success: false, error: 'Idol not found or not held by you' }

  const { error } = await supabase
    .from('narrative_idols')
    .update({
      status: 'used',
      used_in_session: sessionId,
      used_effect: effect,
      holder_id: null,
    })
    .eq('id', idolId)

  if (error) {
    console.error('Error using idol:', error)
    return { success: false, error: error.message }
  }

  // Send dramatic message
  await sendMessage({
    session_id: sessionId,
    quest_id: campaignId,
    message_type: 'idol',
    content: `⚡ **${(idol as Record<string, unknown>).name}** has been activated! ${effect}. The Everloop trembles...`,
    reference_data: { idol_id: idolId, power: (idol as Record<string, unknown>).power },
  })

  revalidatePath(`/quests/${campaignId}`)
  return { success: true }
}

// =====================================================
// NPCs
// =====================================================

export async function getQuestNpcs(campaignId: string): Promise<{
  success: boolean; npcs?: QuestNpc[]; error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quest_npcs')
    .select('*')
    .eq('quest_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, npcs: (data ?? []) as unknown as QuestNpc[] }
}

export async function createNpc(input: {
  quest_id: string
  name: string
  description?: string
  npc_type?: string
  personality?: string
  voice_style?: string
  motivations?: string
  secrets?: string
  canon_entity_id?: string
  stats?: Record<string, unknown>
}): Promise<{ success: boolean; npc?: QuestNpc; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quest_npcs')
    .insert(input)
    .select()
    .single()

  if (error) {
    console.error('Error creating NPC:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/quests/${input.quest_id}`)
  return { success: true, npc: data as unknown as QuestNpc }
}

// =====================================================
// PICKER — lightweight quest summaries for flow-builder
// =====================================================

export interface QuestPickerSummary {
  id: string
  slug: string
  title: string
  quest_type: string
  difficulty: string
  status: string
}

export async function getQuestsForPicker(): Promise<{
  success: boolean
  quests?: QuestPickerSummary[]
  error?: string
}> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quests')
    .select('id, slug, title, game_mode, fray_intensity, status, is_public')
    .eq('is_public', true)
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching quest picker:', error)
    return { success: false, error: error.message }
  }

  const rows = (data ?? []) as unknown as Array<{
    id: string
    slug: string
    title: string
    game_mode: string
    fray_intensity: number
    status: string
  }>

  const quests: QuestPickerSummary[] = rows.map(r => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    quest_type: r.game_mode === 'solo' || r.game_mode === 'duo' ? r.game_mode : 'group',
    difficulty:
      r.fray_intensity >= 8 ? 'deadly' :
      r.fray_intensity >= 6 ? 'hard' :
      r.fray_intensity >= 4 ? 'standard' :
      'easy',
    status: r.status,
  }))

  return { success: true, quests }
}
