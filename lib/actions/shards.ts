'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ShardInsert, ShardUpdate, ShardRecord, ShardRegion } from '@/types/shard'

type ShardAdminGate =
  | { ok: true; userId: string; adminClient: NonNullable<ReturnType<typeof createAdminClient>> }
  | { ok: false; error: string }

/**
 * Single auth+admin gate for shard mutations. All shard writes require admin
 * access and use the service-role client to bypass RLS.
 */
async function gateShardAdmin(): Promise<ShardAdminGate> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const { data: isAdmin, error } = await supabase.rpc('is_admin_check')
  if (error) {
    console.error('[gateShardAdmin] RPC error:', error.message)
    return { ok: false, error: 'Admin access required' }
  }
  if (isAdmin !== true) {
    return { ok: false, error: 'Admin access required' }
  }

  const adminClient = createAdminClient()
  if (!adminClient) return { ok: false, error: 'Admin client unavailable' }

  return { ok: true, userId: user.id, adminClient }
}

/**
 * Fetch all shards, optionally filtered by region
 */
export async function getShards(region?: ShardRegion): Promise<{ data: ShardRecord[] | null; error: string | null }> {
  const adminClient = createAdminClient()
  const regularClient = await createClient()
  const client = adminClient || regularClient

  let query = client
    .from('shards')
    .select('*')
    .order('shard_number', { ascending: true })

  if (region) {
    query = query.eq('region', region)
  }

  const { data, error } = await query

  if (error) {
    console.error('[getShards] Error:', error)
    return { data: null, error: error.message }
  }

  return { data: data as unknown as ShardRecord[], error: null }
}

/**
 * Fetch a single shard by ID
 */
export async function getShard(id: string): Promise<{ data: ShardRecord | null; error: string | null }> {
  const adminClient = createAdminClient()
  const regularClient = await createClient()
  const client = adminClient || regularClient

  const { data, error } = await client
    .from('shards')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[getShard] Error:', error)
    return { data: null, error: error.message }
  }

  return { data: data as unknown as ShardRecord, error: null }
}

/**
 * Create a new shard (admin/curator only)
 */
export async function createShard(input: ShardInsert): Promise<{ data: ShardRecord | null; error: string | null }> {
  const gate = await gateShardAdmin()
  if (!gate.ok) return { data: null, error: gate.error }
  const { adminClient } = gate

  const { data, error } = await adminClient
    .from('shards')
    .insert({
      name: input.name,
      shard_number: input.shard_number,
      description: input.description || null,
      power_description: input.power_description || null,
      visual_description: input.visual_description || null,
      form_state: input.form_state,
      region: input.region,
      site_types: input.site_types,
      location_description: input.location_description || null,
      expressions: input.expressions,
      situations: input.situations,
      monster_link: input.monster_link || null,
      current_holder_id: input.current_holder_id || null,
      location_id: input.location_id || null,
      state: input.state || 'dormant',
      power_level: input.power_level || 1,
      history: [],
    } as never)
    .select()
    .single()

  if (error) {
    console.error('[createShard] Error:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/admin/shards')
  revalidatePath('/map')
  return { data: data as unknown as ShardRecord, error: null }
}

/**
 * Update an existing shard (admin/curator only)
 */
export async function updateShard(id: string, input: ShardUpdate): Promise<{ data: ShardRecord | null; error: string | null }> {
  const gate = await gateShardAdmin()
  if (!gate.ok) return { data: null, error: gate.error }
  const { adminClient } = gate

  const updateData: Record<string, unknown> = {}
  if (input.name !== undefined) updateData.name = input.name
  if (input.shard_number !== undefined) updateData.shard_number = input.shard_number
  if (input.description !== undefined) updateData.description = input.description
  if (input.power_description !== undefined) updateData.power_description = input.power_description
  if (input.visual_description !== undefined) updateData.visual_description = input.visual_description
  if (input.form_state !== undefined) updateData.form_state = input.form_state
  if (input.region !== undefined) updateData.region = input.region
  if (input.site_types !== undefined) updateData.site_types = input.site_types
  if (input.location_description !== undefined) updateData.location_description = input.location_description
  if (input.expressions !== undefined) updateData.expressions = input.expressions
  if (input.situations !== undefined) updateData.situations = input.situations
  if (input.monster_link !== undefined) updateData.monster_link = input.monster_link
  if (input.current_holder_id !== undefined) updateData.current_holder_id = input.current_holder_id
  if (input.location_id !== undefined) updateData.location_id = input.location_id
  if (input.state !== undefined) updateData.state = input.state
  if (input.power_level !== undefined) updateData.power_level = input.power_level

  const { data, error } = await adminClient
    .from('shards')
    .update(updateData as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[updateShard] Error:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/admin/shards')
  revalidatePath('/map')
  return { data: data as unknown as ShardRecord, error: null }
}

/**
 * Delete a shard (admin only)
 */
export async function deleteShard(id: string): Promise<{ success: boolean; error: string | null }> {
  const gate = await gateShardAdmin()
  if (!gate.ok) return { success: false, error: gate.error }
  const { adminClient } = gate

  const { error } = await adminClient
    .from('shards')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deleteShard] Error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/shards')
  revalidatePath('/map')
  return { success: true, error: null }
}

/**
 * Get shard stats by region (for world state display)
 */
export async function getShardStats(): Promise<{ data: Record<string, { total: number; by_state: Record<string, number>; by_form: Record<string, number> }> | null; error: string | null }> {
  const adminClient = createAdminClient()
  const regularClient = await createClient()
  const client = adminClient || regularClient

  const { data, error } = await client
    .from('shards')
    .select('region, state, form_state')

  if (error) {
    console.error('[getShardStats] Error:', error)
    return { data: null, error: error.message }
  }

  const stats: Record<string, { total: number; by_state: Record<string, number>; by_form: Record<string, number> }> = {}

  for (const shard of (data || [])) {
    const region = (shard as Record<string, unknown>).region as string || 'unknown'
    if (!stats[region]) {
      stats[region] = { total: 0, by_state: {}, by_form: {} }
    }
    stats[region].total++
    const state = (shard as Record<string, unknown>).state as string || 'dormant'
    stats[region].by_state[state] = (stats[region].by_state[state] || 0) + 1
    const form = (shard as Record<string, unknown>).form_state as string || 'raw'
    stats[region].by_form[form] = (stats[region].by_form[form] || 0) + 1
  }

  return { data: stats, error: null }
}

/**
 * Record a shard event (discovery, movement, use, etc.)
 */
export async function recordShardEvent(input: {
  shard_id: string
  event_type: 'found' | 'revealed' | 'moved' | 'misunderstood' | 'used' | 'corrupted' | 'united'
  region_id?: string
  campaign_id?: string
  quest_id?: string
  story_id?: string
  description: string
  world_impact?: string
}): Promise<{ success: boolean; error: string | null }> {
  const gate = await gateShardAdmin()
  if (!gate.ok) return { success: false, error: gate.error }
  const { adminClient, userId } = gate

  const { error } = await adminClient
    .from('shard_events')
    .insert({
      shard_id: input.shard_id,
      event_type: input.event_type,
      region_id: input.region_id || null,
      actor_id: userId,
      campaign_id: input.campaign_id || null,
      quest_id: input.quest_id || null,
      story_id: input.story_id || null,
      description: input.description,
      world_impact: input.world_impact || null,
    } as never)

  if (error) {
    console.error('[recordShardEvent] Error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/shards')
  revalidatePath('/map')
  return { success: true, error: null }
}
