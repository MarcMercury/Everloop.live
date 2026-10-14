/**
 * Library Cross-Linker
 *
 * Looks up canonical Everloop entities that reference SRD compendium items by name.
 * This is what differentiates the Everloop Library from DDB — a clicked monster/spell/item
 * shows the canon stories and entities it appears in.
 */

import { createClient } from '@/lib/supabase/server'

export interface CanonReference {
  id: string
  name: string
  type: string
  slug: string | null
  description: string | null
}

export async function findCanonReferences(searchTerm: string, limit = 6): Promise<CanonReference[]> {
  if (!searchTerm || searchTerm.length < 3) return []
  const supabase = await createClient()
  // Strip PostgREST filter syntax characters so user input cannot alter the .or() expression.
  const term = searchTerm.replace(/[,()*%\\:."']/g, ' ').trim()
  if (term.length < 3) return []
  const { data } = await supabase
    .from('canon_entities')
    .select('id, name, type, slug, description')
    .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
    .eq('status', 'canonical')
    .limit(limit)
  return data ?? []
}
