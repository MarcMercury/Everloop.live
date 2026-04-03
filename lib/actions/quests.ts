// @ts-nocheck — quest tables not yet in generated Supabase types
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { QuestType, DifficultyPreset } from '@/types/campaign'

// =====================================================
// QUEST TYPES (inline until dedicated types file)
// =====================================================

export interface Quest {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image_url: string | null
  quest_type: QuestType
  difficulty: DifficultyPreset
  estimated_duration: string
  min_participants: number
  max_participants: number
  world_era: string
  everloop_overlay: boolean
  referenced_entities: string[]
  ai_narrator_config: Record<string, unknown>
  quest_structure: Record<string, unknown>
  status: string
  created_by: string | null
  is_official: boolean
  times_played: number
  average_rating: number
  total_ratings: number
  tags: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  creator?: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

export interface QuestParticipant {
  id: string
  quest_id: string
  user_id: string
  character_id: string | null
  status: 'active' | 'completed' | 'abandoned'
  current_act: number
  progress_data: Record<string, unknown>
  character_state_snapshot: Record<string, unknown>
  joined_at: string
  completed_at: string | null
  user?: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  character?: {
    id: string
    name: string
    race: string
    class: string
    level: number
    portrait_url: string | null
  }
}

// =====================================================
// QUEST CRUD
// =====================================================

export async function getQuests(filters?: {
  quest_type?: QuestType
  difficulty?: DifficultyPreset
  status?: string
}): Promise<{ success: boolean; quests?: Quest[]; error?: string }> {
  const supabase = await createClient()

  let query = supabase
    .from('quests')
    .select('*, creator:profiles!quests_created_by_fkey(id, username, display_name, avatar_url)')
    .in('status', ['available', 'featured'])
    .order('updated_at', { ascending: false })

  if (filters?.quest_type) query = query.eq('quest_type', filters.quest_type)
  if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching quests:', error)
    return { success: false, error: error.message }
  }

  return { success: true, quests: (data ?? []) as unknown as Quest[] }
}

export async function getQuest(idOrSlug: string): Promise<{ success: boolean; quest?: Quest; error?: string }> {
  const supabase = await createClient()

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)

  let query = supabase
    .from('quests')
    .select('*, creator:profiles!quests_created_by_fkey(id, username, display_name, avatar_url)')

  if (isUuid) {
    query = query.eq('id', idOrSlug)
  } else {
    query = query.eq('slug', idOrSlug)
  }

  const { data, error } = await query.single()

  if (error) {
    console.error('Error fetching quest:', error)
    return { success: false, error: error.message }
  }

  return { success: true, quest: data as unknown as Quest }
}

export async function getMyQuests(): Promise<{ success: boolean; quests?: Quest[]; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Quests I created
  const { data: created, error: createdErr } = await supabase
    .from('quests')
    .select('*, creator:profiles!quests_created_by_fkey(id, username, display_name, avatar_url)')
    .eq('created_by', user.id)
    .order('updated_at', { ascending: false })

  if (createdErr) return { success: false, error: createdErr.message }

  // Quests I'm participating in
  const { data: participations } = await supabase
    .from('quest_participants')
    .select('quest_id')
    .eq('user_id', user.id)
    .eq('status', 'active')

  let participatedQuests: Quest[] = []
  if (participations && participations.length > 0) {
    const ids = participations.map(p => p.quest_id)
    const { data } = await supabase
      .from('quests')
      .select('*, creator:profiles!quests_created_by_fkey(id, username, display_name, avatar_url)')
      .in('id', ids)
      .order('updated_at', { ascending: false })
    participatedQuests = (data ?? []) as unknown as Quest[]
  }

  const all = [...(created ?? []) as unknown as Quest[], ...participatedQuests]
  const seen = new Set<string>()
  const unique = all.filter(q => {
    if (seen.has(q.id)) return false
    seen.add(q.id)
    return true
  })

  return { success: true, quests: unique }
}

export async function createQuest(input: {
  title: string
  description?: string | null
  quest_type?: QuestType
  difficulty?: DifficultyPreset
  estimated_duration?: string
  min_participants?: number
  max_participants?: number
  everloop_overlay?: boolean
  ai_narrator_config?: Record<string, unknown>
  tags?: string[]
  referenced_entities?: string[]
  metadata?: Record<string, unknown>
}): Promise<{ success: boolean; quest?: Quest; error?: string }> {
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
    .insert({
      title: input.title,
      slug,
      description: input.description ?? null,
      quest_type: input.quest_type ?? 'solo',
      difficulty: input.difficulty ?? 'standard',
      estimated_duration: input.estimated_duration ?? '1-2 hours',
      min_participants: input.min_participants ?? 1,
      max_participants: input.max_participants ?? 1,
      everloop_overlay: input.everloop_overlay ?? true,
      ai_narrator_config: input.ai_narrator_config ?? {
        style: 'atmospheric',
        pacing: 'moderate',
        detail_level: 'rich',
        character_interaction: true,
        branching_narrative: true,
      },
      tags: input.tags ?? [],
      referenced_entities: input.referenced_entities ?? [],
      metadata: input.metadata ?? {},
      created_by: user.id,
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating quest:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/quests')
  return { success: true, quest: data as unknown as Quest }
}

export async function updateQuest(
  id: string,
  updates: Partial<Pick<Quest, 'title' | 'description' | 'quest_type' | 'difficulty' | 'estimated_duration' | 'min_participants' | 'max_participants' | 'everloop_overlay' | 'ai_narrator_config' | 'quest_structure' | 'status' | 'tags'>>
): Promise<{ success: boolean; quest?: Quest; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('quests')
    .update(updates)
    .eq('id', id)
    .eq('created_by', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating quest:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/quests')
  revalidatePath(`/quests/${id}`)
  return { success: true, quest: data as unknown as Quest }
}

// =====================================================
// QUEST PARTICIPANTS
// =====================================================

export async function joinQuest(questId: string, characterId?: string): Promise<{
  success: boolean; error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Check quest exists and is available
  const { data: quest } = await supabase
    .from('quests')
    .select('id, max_participants, status')
    .eq('id', questId)
    .single()

  if (!quest) return { success: false, error: 'Quest not found' }
  if (!['available', 'featured'].includes(quest.status)) {
    return { success: false, error: 'Quest is not available to join' }
  }

  // Check participant count
  const { count } = await supabase
    .from('quest_participants')
    .select('id', { count: 'exact', head: true })
    .eq('quest_id', questId)
    .eq('status', 'active')

  if ((count ?? 0) >= (quest.max_participants ?? 1)) {
    return { success: false, error: 'Quest is full' }
  }

  // Snapshot character state if character selected
  let snapshot = {}
  if (characterId) {
    const { data: char } = await supabase
      .from('player_characters')
      .select('*')
      .eq('id', characterId)
      .eq('user_id', user.id)
      .single()
    if (char) {
      snapshot = {
        level: char.level,
        current_hp: char.current_hp,
        max_hp: char.max_hp,
        class: char.class,
        race: char.race,
      }
    }
  }

  const { error } = await supabase
    .from('quest_participants')
    .insert({
      quest_id: questId,
      user_id: user.id,
      character_id: characterId ?? null,
      status: 'active',
      character_state_snapshot: snapshot,
    })

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Already joined this quest' }
    console.error('Error joining quest:', error)
    return { success: false, error: error.message }
  }

  // Increment times_played
  await supabase.rpc('increment_quest_plays', { quest_id: questId }).catch(() => {
    // Non-critical, ignore if function doesn't exist
  })

  revalidatePath(`/quests/${questId}`)
  return { success: true }
}

export async function getQuestParticipants(questId: string): Promise<{
  success: boolean; participants?: QuestParticipant[]; error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quest_participants')
    .select(`
      *,
      user:profiles!quest_participants_user_id_fkey(id, username, display_name, avatar_url),
      character:player_characters!quest_participants_character_id_fkey(id, name, race, class, level, portrait_url)
    `)
    .eq('quest_id', questId)
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Error fetching quest participants:', error)
    return { success: false, error: error.message }
  }

  return { success: true, participants: (data ?? []) as unknown as QuestParticipant[] }
}

export async function leaveQuest(questId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('quest_participants')
    .update({ status: 'abandoned' })
    .eq('quest_id', questId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error leaving quest:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/quests/${questId}`)
  return { success: true }
}

export async function completeQuest(questId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('quest_participants')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('quest_id', questId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error completing quest:', error)
    return { success: false, error: error.message }
  }

  revalidatePath(`/quests/${questId}`)
  return { success: true }
}

// =====================================================
// NARRATIVE TAGS
// =====================================================

export async function getEverloopNarrativeTags(): Promise<{
  success: boolean
  tags?: { id: string; tag_name: string; display_name: string; description: string; category: string; campaign_effects: Record<string, unknown> }[]
  error?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('everloop_narrative_tags')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })

  if (error) {
    console.error('Error fetching narrative tags:', error)
    return { success: false, error: error.message }
  }

  return { success: true, tags: data ?? [] }
}
