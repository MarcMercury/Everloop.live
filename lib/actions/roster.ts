'use server'

import { createClient } from '@/lib/supabase/server'

export interface RosterEntity {
  id: string
  name: string
  type: 'character' | 'location' | 'creature' | 'artifact' | 'faction' | 'concept' | 'event'
  description: string | null
  isGlobal: boolean // true = canon entity, false = user's private roster
  tags: string[]
  status: 'draft' | 'proposed' | 'canonical'
}

// Keeping for backwards compatibility
export type RosterCharacter = RosterEntity

/**
 * Fetches entities for the roster sidebar
 * Returns both global canon entities and user's private roster (drafts)
 */
export async function fetchRoster(): Promise<{
  success: boolean
  characters?: RosterEntity[]  // Kept as 'characters' for backwards compatibility
  entities?: RosterEntity[]    // New field with all entity types
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Type for entity from database
    type EntityRow = {
      id: string
      name: string
      type: string
      description: string | null
      tags: string[] | null
      status: string
    }
    
    // Fetch global canon entities (all types)
    const { data: canonEntities, error: canonError } = await supabase
      .from('canon_entities')
      .select('id, name, type, description, tags, status')
      .eq('status', 'canonical')
      .order('name')
      .limit(100) as { data: EntityRow[] | null; error: Error | null }
    
    if (canonError) {
      console.error('Error fetching canon entities:', canonError)
    }
    
    // Map canon entities
    const globalEntities: RosterEntity[] = (canonEntities || []).map(entity => ({
      id: entity.id,
      name: entity.name,
      type: entity.type as RosterEntity['type'],
      description: entity.description,
      isGlobal: true,
      tags: entity.tags || [],
      status: 'canonical' as const,
    }))
    
    // Fetch user's private roster (their draft entities)
    let privateEntities: RosterEntity[] = []
    
    if (user) {
      const { data: userEntities, error: userError } = await supabase
        .from('canon_entities')
        .select('id, name, type, description, tags, status')
        .eq('created_by', user.id)
        .in('status', ['draft', 'proposed'])
        .order('name') as { data: EntityRow[] | null; error: Error | null }
      
      if (userError) {
        console.error('Error fetching user entities:', userError)
      } else {
        privateEntities = (userEntities || []).map(entity => ({
          id: entity.id,
          name: entity.name,
          type: entity.type as RosterEntity['type'],
          description: entity.description,
          isGlobal: false,
          tags: entity.tags || [],
          status: entity.status as 'draft' | 'proposed',
        }))
      }
    }

    const allEntities = [...privateEntities, ...globalEntities]
    
    // Filter to just characters for backwards compatibility
    const characters = allEntities.filter(e => e.type === 'character')
    
    return {
      success: true,
      characters, // Backwards compatible
      entities: allEntities, // New: all entity types
    }
  } catch (error) {
    console.error('Roster fetch error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch roster',
    }
  }
}
