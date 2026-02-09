import { createClient, createAdminClient } from '@/lib/supabase/server'
import { EntitiesClient } from './entities-client'

export const metadata = {
  title: 'Entity Management | Everloop Admin',
  description: 'Manage canon entities in the Everloop universe',
}

interface CanonEntityData {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  status: string
  stability_rating: number
  created_at: string
  updated_at: string
  has_embedding: boolean
  created_by: string | null
  extended_lore: {
    tagline?: string
    image_url?: string | null
    is_user_created?: boolean
  } | null
}

async function getEntities(): Promise<CanonEntityData[]> {
  // Try admin client first, fall back to regular client
  const adminClient = createAdminClient()
  const regularClient = await createClient()
  const client = adminClient || regularClient
  
  const { data, error } = await client
    .from('canon_entities')
    .select('id, name, slug, type, description, status, stability_rating, created_at, updated_at, embedding, created_by, extended_lore')
    .order('name') as { data: Array<Omit<CanonEntityData, 'has_embedding'> & { embedding: number[] | null }> | null; error: Error | null }
  
  if (error) {
    console.error('Error fetching entities:', error)
    return []
  }
  
  // Convert embedding to boolean flag to avoid sending megabytes of vector data to client
  return (data || []).map(entity => ({
    ...entity,
    has_embedding: entity.embedding !== null,
    embedding: undefined,
  })) as unknown as CanonEntityData[]
}

export default async function EntitiesPage() {
  const entities = await getEntities()
  
  return <EntitiesClient entities={entities} />
}
