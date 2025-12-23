'use server'

import { createClient } from '@/lib/supabase/server'

export interface DetectedEntity {
  entityId: string
  entityName: string
  entityType: string
  matchedText: string
  startIndex: number
  endIndex: number
  confidence: 'exact' | 'fuzzy'
}

export interface EntityMatch {
  id: string
  name: string
  type: string
  description: string | null
  aliases?: string[]
}

/**
 * Fetch all canonical entities for matching
 */
export async function getCanonEntities(): Promise<EntityMatch[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('canon_entities')
    .select('id, name, type, description')
    .eq('status', 'canonical')
    .order('name')
  
  if (error) {
    console.error('Error fetching entities:', error)
    return []
  }
  
  return data || []
}

/**
 * Detect entities in text
 * Returns an array of detected entities with their positions
 */
export async function detectEntities(text: string): Promise<DetectedEntity[]> {
  if (!text || text.trim().length === 0) {
    return []
  }
  
  const entities = await getCanonEntities()
  if (entities.length === 0) {
    return []
  }
  
  const detectedEntities: DetectedEntity[] = []
  const textLower = text.toLowerCase()
  
  // Sort entities by name length (longer first) to prioritize longer matches
  const sortedEntities = [...entities].sort((a, b) => b.name.length - a.name.length)
  
  // Track positions already matched to avoid overlapping
  const matchedRanges: Array<{ start: number; end: number }> = []
  
  for (const entity of sortedEntities) {
    const entityNameLower = entity.name.toLowerCase()
    
    // Find all occurrences of this entity name
    let searchIndex = 0
    while (searchIndex < textLower.length) {
      const foundIndex = textLower.indexOf(entityNameLower, searchIndex)
      
      if (foundIndex === -1) break
      
      const endIndex = foundIndex + entity.name.length
      
      // Check if this is a word boundary match (not part of another word)
      const isWordBoundary = (
        (foundIndex === 0 || /\W/.test(text[foundIndex - 1])) &&
        (endIndex === text.length || /\W/.test(text[endIndex]))
      )
      
      // Check if this range overlaps with existing matches
      const overlaps = matchedRanges.some(range => 
        (foundIndex >= range.start && foundIndex < range.end) ||
        (endIndex > range.start && endIndex <= range.end) ||
        (foundIndex <= range.start && endIndex >= range.end)
      )
      
      if (isWordBoundary && !overlaps) {
        detectedEntities.push({
          entityId: entity.id,
          entityName: entity.name,
          entityType: entity.type,
          matchedText: text.substring(foundIndex, endIndex),
          startIndex: foundIndex,
          endIndex: endIndex,
          confidence: 'exact',
        })
        
        matchedRanges.push({ start: foundIndex, end: endIndex })
      }
      
      searchIndex = foundIndex + 1
    }
  }
  
  // Sort by position in text
  detectedEntities.sort((a, b) => a.startIndex - b.startIndex)
  
  return detectedEntities
}

/**
 * Search entities for linking suggestions
 */
export async function searchEntitiesForLinking(query: string): Promise<EntityMatch[]> {
  if (!query || query.trim().length < 2) {
    return []
  }
  
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('canon_entities')
    .select('id, name, type, description')
    .eq('status', 'canonical')
    .ilike('name', `%${query}%`)
    .limit(10)
  
  if (error) {
    console.error('Error searching entities:', error)
    return []
  }
  
  return data || []
}

/**
 * Get entity details for hover card
 */
export async function getEntityDetails(entityId: string): Promise<EntityMatch | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('canon_entities')
    .select('id, name, type, description')
    .eq('id', entityId)
    .single()
  
  if (error) {
    console.error('Error fetching entity:', error)
    return null
  }
  
  return data
}
