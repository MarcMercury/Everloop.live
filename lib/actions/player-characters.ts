'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PlayerCharacterInsert, PlayerCharacterUpdate, PlayerCharacter } from '@/types/player-character'
import type { Json } from '@/types/database'

/**
 * Get all characters for the current user
 */
export async function getPlayerCharacters(): Promise<{
  success: boolean
  characters?: PlayerCharacter[]
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }
  
  const { data, error } = await supabase
    .from('player_characters')
    .select('*')
    .eq('user_id', user.id)
    .order('is_active', { ascending: false })
    .order('updated_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching player characters:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true, characters: (data ?? []) as unknown as PlayerCharacter[] }
}

/**
 * Get a single character by ID (must belong to current user)
 */
export async function getPlayerCharacter(id: string): Promise<{
  success: boolean
  character?: PlayerCharacter
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }
  
  const { data, error } = await supabase
    .from('player_characters')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  
  if (error) {
    console.error('Error fetching player character:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true, character: data as unknown as PlayerCharacter }
}

/**
 * Create a new player character
 */
export async function createPlayerCharacter(input: Omit<PlayerCharacterInsert, 'user_id'>): Promise<{
  success: boolean
  character?: PlayerCharacter
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }
  
  const insertData = {
    ...input,
    user_id: user.id,
  }
  
  const { data, error } = await supabase
    .from('player_characters')
    .insert(insertData as never)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating player character:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/player-deck')
  return { success: true, character: data as unknown as PlayerCharacter }
}

/**
 * Update a player character
 */
export async function updatePlayerCharacter(id: string, updates: PlayerCharacterUpdate): Promise<{
  success: boolean
  character?: PlayerCharacter
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }
  
  const { data, error } = await supabase
    .from('player_characters')
    .update(updates as never)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating player character:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/player-deck')
  revalidatePath(`/player-deck/${id}`)
  return { success: true, character: data as unknown as PlayerCharacter }
}

/**
 * Quick-update HP (optimized for live play)
 */
export async function updateCharacterHP(id: string, current_hp: number, temp_hp?: number): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }
  
  const updateData: Record<string, number> = { current_hp }
  if (temp_hp !== undefined) {
    updateData.temp_hp = temp_hp
  }
  
  const { error } = await supabase
    .from('player_characters')
    .update(updateData as never)
    .eq('id', id)
    .eq('user_id', user.id)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

/**
 * Quick-update spell slots (optimized for live play)
 */
export async function updateSpellSlots(id: string, spellcasting: Record<string, unknown>): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }
  
  const { error } = await supabase
    .from('player_characters')
    .update({ spellcasting } as never)
    .eq('id', id)
    .eq('user_id', user.id)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

/**
 * Quick-update status/conditions (optimized for live play)
 */
export async function updateCharacterStatus(id: string, status: Record<string, unknown>): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }
  
  const { error } = await supabase
    .from('player_characters')
    .update({ status } as never)
    .eq('id', id)
    .eq('user_id', user.id)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

/**
 * Quick-update features uses remaining (optimized for live play)
 */
export async function updateFeatureUses(id: string, features: Record<string, unknown>[]): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }
  
  const { error } = await supabase
    .from('player_characters')
    .update({ features } as never)
    .eq('id', id)
    .eq('user_id', user.id)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

/**
 * Short Rest: Restore hit dice, reset short-rest features
 */
export async function shortRest(id: string): Promise<{
  success: boolean
  error?: string
}> {
  const result = await getPlayerCharacter(id)
  if (!result.success || !result.character) {
    return { success: false, error: result.error || 'Character not found' }
  }
  
  const char = result.character
  
  // Reset short-rest features
  const updatedFeatures = char.features.map(f => ({
    ...f,
    uses_remaining: f.recharge === 'short_rest' ? f.uses_max : f.uses_remaining,
  }))
  
  return updatePlayerCharacter(id, {
    features: updatedFeatures as unknown as Json,
  })
}

/**
 * Long Rest: Full HP restore, reset all features, restore spell slots, clear conditions
 */
export async function longRest(id: string): Promise<{
  success: boolean
  error?: string
}> {
  const result = await getPlayerCharacter(id)
  if (!result.success || !result.character) {
    return { success: false, error: result.error || 'Character not found' }
  }
  
  const char = result.character
  
  // Reset all features
  const updatedFeatures = char.features.map(f => ({
    ...f,
    uses_remaining: (f.recharge === 'short_rest' || f.recharge === 'long_rest' || f.recharge === 'dawn')
      ? f.uses_max
      : f.uses_remaining,
  }))
  
  // Restore all spell slots
  const updatedSpellcasting = { ...char.spellcasting }
  if (updatedSpellcasting.spell_slots) {
    for (const level of Object.keys(updatedSpellcasting.spell_slots)) {
      updatedSpellcasting.spell_slots[level] = {
        ...updatedSpellcasting.spell_slots[level],
        used: 0,
      }
    }
  }
  
  // Reduce exhaustion by 1
  const updatedStatus = {
    ...char.status,
    exhaustion_level: Math.max(0, (char.status.exhaustion_level || 0) - 1),
    concentration_spell: null,
    conditions: char.status.conditions.filter(c => c !== 'unconscious'),
  }
  
  return updatePlayerCharacter(id, {
    current_hp: char.max_hp,
    temp_hp: 0,
    hit_dice_remaining: char.hit_dice_total,
    death_save_successes: 0,
    death_save_failures: 0,
    features: updatedFeatures as unknown as Json,
    spellcasting: updatedSpellcasting as unknown as Json,
    status: updatedStatus as unknown as Json,
  })
}

/**
 * Delete a player character
 */
export async function deletePlayerCharacter(id: string): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }
  
  const { error } = await supabase
    .from('player_characters')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  
  if (error) {
    console.error('Error deleting player character:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/player-deck')
  return { success: true }
}
