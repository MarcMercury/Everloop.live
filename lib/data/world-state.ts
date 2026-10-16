'use server'

import { createClient } from '@/lib/supabase/server'
import type { RegionId } from '@/lib/data/regions'

// =====================================================
// WORLD STATE TYPES
// =====================================================

export interface RegionalState {
  id: string
  region_id: string
  region_name: string
  fray_intensity: number
  stability_index: number
  shards_known: number
  shards_gathered: number
  hollow_count: number
  drift_breach_count: number
  active_quests: number
  canonical_stories: number
  last_shard_event: string | null
  last_fray_event: string | null
  metadata: Record<string, unknown>
  updated_at: string
}

export interface ConvergenceState {
  total_shards: number
  gathered_shards: number
  convergence_percentage: number
  global_fray_intensity: number
  global_stability: number
  world_phase: 'dormant' | 'scattered' | 'stirring' | 'awakening' | 'convergence_imminent'
}

export interface WorldEvent {
  id: string
  title: string
  description: string | null
  event_type: string
  severity: string
  region_id: string | null
  affected_entities: string[]
  affected_shards: string[]
  is_visible: boolean
  created_by: string | null
  created_at: string
}

export interface ShardEvent {
  id: string
  shard_id: string | null
  event_type: 'found' | 'revealed' | 'moved' | 'misunderstood' | 'used' | 'corrupted' | 'united'
  region_id: string | null
  actor_id: string | null
  description: string | null
  world_impact: string | null
  created_at: string
}

export interface ShardWithLocation {
  id: string
  name: string
  description: string | null
  state: string
  power_level: number
  visual_description: string | null
  location?: {
    id: string
    name: string
    type: string
  } | null
  holder?: {
    id: string
    username: string
    display_name: string | null
  } | null
}

// =====================================================
// CONVERGENCE STATE
// =====================================================

/**
 * Get global convergence state — the Great Question's answer is forming
 */
export async function getConvergenceState(): Promise<ConvergenceState> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('get_convergence_state')
  
  if (error || !data) {
    console.error('Error fetching convergence state:', error)
    return {
      total_shards: 0,
      gathered_shards: 0,
      convergence_percentage: 0,
      global_fray_intensity: 0.15,
      global_stability: 0.75,
      world_phase: 'scattered',
    }
  }
  
  return data as ConvergenceState
}

// =====================================================
// REGIONAL STATE
// =====================================================

/**
 * Get all regional states — how each region fares against the Fray
 */
export async function getAllRegionalStates(): Promise<RegionalState[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('regional_state')
    .select('*')
    .order('region_name')
  
  if (error) {
    console.error('Error fetching regional states:', error)
    return []
  }
  
  return (data ?? []) as RegionalState[]
}

/**
 * Get a single region's state
 */
export async function getRegionalState(regionId: RegionId): Promise<RegionalState | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('regional_state')
    .select('*')
    .eq('region_id', regionId)
    .single()
  
  if (error) {
    console.error('Error fetching regional state:', error)
    return null
  }
  
  return data as RegionalState
}

// =====================================================
// SHARDS
// =====================================================

/**
 * Get all known Shards with their locations and holders
 */
export async function getShards(): Promise<ShardWithLocation[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('shards')
    .select(`
      id, name, description, state, power_level, visual_description,
      location:canon_entities!shards_location_id_fkey(id, name, type),
      holder:profiles!shards_current_holder_id_fkey(id, username, display_name)
    `)
    .order('power_level', { ascending: false })
  
  if (error) {
    console.error('Error fetching shards:', error)
    return []
  }
  
  return (data ?? []) as unknown as ShardWithLocation[]
}

/**
 * Get Shards by region (via location entity's metadata or mapping)
 */
export async function getShardsByRegion(regionId: string): Promise<ShardWithLocation[]> {
  const supabase = await createClient()
  
  // Query shards whose location entity has region metadata
  const { data, error } = await supabase
    .from('shards')
    .select(`
      id, name, description, state, power_level, visual_description,
      location:canon_entities!shards_location_id_fkey(id, name, type, metadata)
    `)
    .order('power_level', { ascending: false })
  
  if (error) {
    console.error('Error fetching shards by region:', error)
    return []
  }
  
  // Filter by region metadata on the location entity
  const filtered = (data ?? []).filter((shard: Record<string, unknown>) => {
    const location = shard.location as Record<string, unknown> | null
    if (!location) return false
    const meta = location.metadata as Record<string, unknown> | null
    return meta?.region === regionId
  })
  
  return filtered as unknown as ShardWithLocation[]
}

// =====================================================
// WORLD EVENTS
// =====================================================

/**
 * Get recent world events — the living pulse of the Everloop
 */
export async function getWorldEvents(options?: {
  regionId?: string
  limit?: number
  eventType?: string
}): Promise<WorldEvent[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('world_events')
    .select('*')
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
  
  if (options?.regionId) query = query.eq('region_id', options.regionId)
  if (options?.eventType) query = query.eq('event_type', options.eventType)
  if (options?.limit) query = query.limit(options.limit)
  else query = query.limit(20)
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching world events:', error)
    return []
  }
  
  return (data ?? []) as WorldEvent[]
}

/**
 * Get shard event history
 */
export async function getShardEvents(shardId?: string, limit = 10): Promise<ShardEvent[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('shard_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (shardId) query = query.eq('shard_id', shardId)
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching shard events:', error)
    return []
  }
  
  return (data ?? []) as ShardEvent[]
}

// World lore constants and pure helpers live in ./world-lore (this file is
// 'use server', so it may only export async functions).
