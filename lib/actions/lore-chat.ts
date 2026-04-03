'use server'

import { createClient } from '@/lib/supabase/server'

interface LoreSearchResult {
  id: string
  name: string
  type: string
  description: string | null
  extended_lore: Record<string, unknown> | null
  tags: string[] | null
  similarity: number
}

/**
 * Search canon entities by semantic similarity for RAG context.
 * Returns the top matching entities for a given query.
 */
export async function searchLoreBySemantic(query: string, count = 8): Promise<{
  success: boolean
  results?: LoreSearchResult[]
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  if (!query || query.trim().length < 3) {
    return { success: false, error: 'Query too short' }
  }

  try {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query.slice(0, 4000),
    })

    const embedding = embeddingResponse.data[0].embedding

    const { data, error } = await supabase.rpc('match_canon_entities', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: count,
    } as unknown as undefined) as { data: LoreSearchResult[] | null; error: Error | null }

    if (error) {
      console.error('[Lore Chat] Vector search failed:', error)
      return { success: false, error: 'Lore search failed' }
    }

    return { success: true, results: (data ?? []) as LoreSearchResult[] }
  } catch (err) {
    console.error('[Lore Chat] Error:', err)
    return { success: false, error: 'Failed to search lore' }
  }
}
