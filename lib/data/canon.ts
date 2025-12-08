import { createClient } from '@/lib/supabase/server'
import type { CanonEntity, CanonEntityType, CanonStatus } from '@/types/database'

/**
 * Fetch all active canon entities from the database
 */
export async function getCanonEntities(options?: {
  status?: CanonStatus
  type?: CanonEntityType
  limit?: number
}): Promise<CanonEntity[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('canon_entities')
    .select('*')
    .order('name', { ascending: true })

  // Filter by status (default to 'canonical' for active entities)
  if (options?.status) {
    query = query.eq('status', options.status)
  }

  // Filter by type if specified
  if (options?.type) {
    query = query.eq('type', options.type)
  }

  // Limit results if specified
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching canon entities:', error)
    return []
  }

  return data || []
}

/**
 * Fetch a single canon entity by slug
 */
export async function getCanonEntityBySlug(slug: string): Promise<CanonEntity | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('canon_entities')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching canon entity:', error)
    return null
  }

  return data
}

/**
 * Get count of entities by type
 */
export async function getCanonEntityCounts(): Promise<Record<CanonEntityType, number>> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('canon_entities')
    .select('type') as { data: { type: string }[] | null; error: unknown }

  const defaultCounts: Record<CanonEntityType, number> = {
    character: 0,
    location: 0,
    artifact: 0,
    event: 0,
    faction: 0,
    concept: 0,
    creature: 0,
  }

  if (error || !data) {
    return defaultCounts
  }

  const counts = { ...defaultCounts }

  for (const entity of data) {
    const entityType = entity.type as CanonEntityType
    if (entityType in counts) {
      counts[entityType]++
    }
  }

  return counts
}
