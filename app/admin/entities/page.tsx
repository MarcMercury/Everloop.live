import { createClient } from '@/lib/supabase/server'
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
  embedding: number[] | null
}

async function getEntities(): Promise<CanonEntityData[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('canon_entities')
    .select('id, name, slug, type, description, status, stability_rating, created_at, updated_at, embedding')
    .order('name') as { data: CanonEntityData[] | null; error: Error | null }
  
  if (error) {
    console.error('Error fetching entities:', error)
    return []
  }
  
  return data || []
}

export default async function EntitiesPage() {
  const entities = await getEntities()
  
  return <EntitiesClient entities={entities} />
}
