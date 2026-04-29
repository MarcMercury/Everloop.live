'use server'

import { createClient } from '@/lib/supabase/server'

// =====================================================
// CROSS-REFERENCE TYPES
// Track how entities connect across stories, campaigns, quests
// =====================================================

export interface EntityCrossRef {
  stories: {
    id: string
    title: string
    slug: string
    canon_status: string
    author_username: string
  }[]
  campaigns: {
    id: string
    title: string
    slug: string
    status: string
    game_mode: string
  }[]
  quests: {
    id: string
    title: string
    slug: string
    quest_type: string
    status: string
  }[]
  related_entities: {
    id: string
    name: string
    slug: string
    type: string
  }[]
  shard_connections: {
    id: string
    name: string
    state: string
    power_level: number
  }[]
  total_references: number
}

/**
 * Get all cross-references for a canon entity.
 * This is the connective tissue of the Everloop —
 * showing how every entity ripples across stories, campaigns, and quests.
 */
export async function getEntityCrossReferences(entityId: string): Promise<EntityCrossRef> {
  const supabase = await createClient()

  const result: EntityCrossRef = {
    stories: [],
    campaigns: [],
    quests: [],
    related_entities: [],
    shard_connections: [],
    total_references: 0,
  }

  // 1. Stories that reference this entity
  const { data: stories } = await supabase
    .from('stories')
    .select(`
      id, title, slug, canon_status,
      author:profiles!stories_author_id_fkey(username)
    `)
    .contains('referenced_entities', [entityId])
    .in('canon_status', ['approved', 'canonical'])
    .order('published_at', { ascending: false })
    .limit(20)

  if (stories) {
    result.stories = stories.map((s: Record<string, unknown>) => ({
      id: s.id as string,
      title: s.title as string,
      slug: s.slug as string,
      canon_status: s.canon_status as string,
      author_username: ((s.author as Record<string, unknown>)?.username as string) || 'Unknown',
    }))
  }

  // 2. Campaigns that reference this entity
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, title, slug, status, game_mode')
    .contains('referenced_entities', [entityId])
    .in('status', ['lobby', 'ready', 'active', 'recruiting', 'in_progress'])
    .order('updated_at', { ascending: false })
    .limit(10)

  if (campaigns) {
    result.campaigns = campaigns as typeof result.campaigns
  }

  // 3. Quests that reference this entity
  const { data: quests } = await supabase
    .from('quests')
    .select('id, title, slug, quest_type, status')
    .contains('referenced_entities', [entityId])
    .in('status', ['available', 'featured', 'active'])
    .order('updated_at', { ascending: false })
    .limit(10)

  if (quests) {
    result.quests = quests as typeof result.quests
  }

  // 4. Related entities (from the related_entities array)
  const { data: entityData } = await supabase
    .from('canon_entities')
    .select('related_entities')
    .eq('id', entityId)
    .single()

  const entityRel = entityData as { related_entities: string[] } | null

  if (entityRel?.related_entities && entityRel.related_entities.length > 0) {
    const { data: related } = await supabase
      .from('canon_entities')
      .select('id, name, slug, type')
      .in('id', entityRel.related_entities)
      .eq('status', 'canonical')

    if (related) {
      result.related_entities = related as typeof result.related_entities
    }
  }

  // 5. Shard connections (shards located at this entity, if it's a location)
  const { data: shards } = await supabase
    .from('shards')
    .select('id, name, state, power_level')
    .eq('location_id', entityId)

  if (shards) {
    result.shard_connections = shards as typeof result.shard_connections
  }

  result.total_references =
    result.stories.length +
    result.campaigns.length +
    result.quests.length +
    result.related_entities.length +
    result.shard_connections.length

  return result
}

/**
 * Get entity usage stats for a user's roster
 * Shows how their creations ripple through the world
 */
export async function getUserEntityUsageStats(userId: string): Promise<{
  entityId: string
  entityName: string
  storyCount: number
  campaignCount: number
  questCount: number
}[]> {
  const supabase = await createClient()

  // Get user's entities
  const { data: rawEntities } = await supabase
    .from('canon_entities')
    .select('id, name')
    .eq('created_by', userId)
    .in('status', ['draft', 'proposed', 'canonical'])

  const entities = rawEntities as { id: string; name: string }[] | null

  if (!entities || entities.length === 0) return []

  const entityIds = entities.map(e => e.id)

  // Fetch all referencing rows in parallel with just 3 queries (instead of N*3 sequential)
  const [storiesRes, campaignsRes, questsRes] = await Promise.all([
    supabase
      .from('stories')
      .select('referenced_entities')
      .overlaps('referenced_entities', entityIds)
      .in('canon_status', ['approved', 'canonical']),
    supabase
      .from('campaigns')
      .select('referenced_entities')
      .overlaps('referenced_entities', entityIds),
    supabase
      .from('quests')
      .select('referenced_entities')
      .overlaps('referenced_entities', entityIds),
  ])

  // Aggregate counts per entity in memory
  const tally = (rows: { referenced_entities: string[] | null }[] | null) => {
    const map = new Map<string, number>()
    for (const row of rows ?? []) {
      for (const id of row.referenced_entities ?? []) {
        if (entityIds.includes(id)) {
          map.set(id, (map.get(id) ?? 0) + 1)
        }
      }
    }
    return map
  }

  const storyMap = tally(storiesRes.data as { referenced_entities: string[] | null }[] | null)
  const campaignMap = tally(campaignsRes.data as { referenced_entities: string[] | null }[] | null)
  const questMap = tally(questsRes.data as { referenced_entities: string[] | null }[] | null)

  return entities.map(entity => ({
    entityId: entity.id,
    entityName: entity.name,
    storyCount: storyMap.get(entity.id) ?? 0,
    campaignCount: campaignMap.get(entity.id) ?? 0,
    questCount: questMap.get(entity.id) ?? 0,
  }))
}

/**
 * Get stories that take place in a specific region
 */
export async function getStoriesByRegion(regionId: string): Promise<{
  id: string
  title: string
  slug: string
  author_username: string
  word_count: number
}[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stories')
    .select(`
      id, title, slug, word_count,
      author:profiles!stories_author_id_fkey(username)
    `)
    .contains('regions', [regionId])
    .eq('is_published', true)
    .in('canon_status', ['approved', 'canonical'])
    .order('published_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching stories by region:', error)
    return []
  }

  return (data ?? []).map((s: Record<string, unknown>) => ({
    id: s.id as string,
    title: s.title as string,
    slug: s.slug as string,
    author_username: ((s.author as Record<string, unknown>)?.username as string) || 'Unknown',
    word_count: s.word_count as number,
  }))
}
