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
  summary: string | null
}

export async function findCanonReferences(searchTerm: string, limit = 6): Promise<CanonReference[]> {
  if (!searchTerm || searchTerm.length < 3) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('canon_entities')
    .select('id, name, type, slug, summary')
    .or(`name.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`)
    .eq('status', 'canonical')
    .limit(limit)
  return (data ?? []) as CanonReference[]
}
