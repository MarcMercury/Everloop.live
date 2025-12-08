'use server'

import { createClient } from '@/lib/supabase/server'

export interface RosterCharacter {
  id: string
  name: string
  type: string
  description: string | null
  isGlobal: boolean // true = canon entity, false = user's private roster
  tags: string[]
}

/**
 * Fetches characters for the roster sidebar
 * Returns both global canon characters and user's private roster
 */
export async function fetchRoster(): Promise<{
  success: boolean
  characters?: RosterCharacter[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Fetch global canon characters
    const { data: canonCharacters, error: canonError } = await supabase
      .from('canon_entities')
      .select('id, name, type, description, tags')
      .in('status', ['canonical', 'proposed'])
      .order('name')
      .limit(50) as { data: Array<{ id: string; name: string; type: string; description: string | null; tags: string[] | null }> | null; error: Error | null }
    
    if (canonError) {
      console.error('Error fetching canon characters:', canonError)
    }
    
    // Map canon characters (filter to only character types)
    const globalChars: RosterCharacter[] = (canonCharacters || [])
      .filter(char => char.type === 'character')
      .map(char => ({
        id: char.id,
        name: char.name,
        type: char.type,
        description: char.description,
        isGlobal: true,
        tags: char.tags || [],
      }))
    
    // For now, we don't have a private roster table, so just return canon
    // In the future, you could add a 'user_roster' or 'private_characters' table
    let privateChars: RosterCharacter[] = []
    
    // If user is logged in, we could fetch their private roster here
    if (user) {
      // Future: fetch from user_roster table
      // const { data: privateData } = await supabase
      //   .from('user_roster')
      //   .select('*')
      //   .eq('user_id', user.id)
      privateChars = []
    }
    
    return {
      success: true,
      characters: [...privateChars, ...globalChars],
    }
  } catch (error) {
    console.error('Roster fetch error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch roster',
    }
  }
}
