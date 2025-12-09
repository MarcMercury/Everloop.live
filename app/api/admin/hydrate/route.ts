import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

/**
 * POST /api/admin/hydrate
 * Generates embeddings for all canon_entities with NULL embeddings
 * Requires authentication (admin check removed for easier testing)
 */
export async function POST() {
  try {
    // Initialize OpenAI client inside the function to avoid build-time errors
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    
    const supabase = await createClient()
    const adminClient = createAdminClient()
    
    if (!adminClient) {
      console.error('Hydrate API - Admin client not available (missing service role key)')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }
    
    // Check if user is authenticated (but don't require admin)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Hydrate API - User:', user?.id, user?.email)
    
    if (authError || !user) {
      console.log('Hydrate API - Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }
    
    // Log admin status but don't block (admin check removed for testing)
    const { data: profile } = await adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single() as { data: { is_admin: boolean } | null; error: Error | null }
    
    console.log('Hydrate API - User is_admin:', profile?.is_admin)
    
    // Use admin client to fetch and update entities (bypasses RLS)
    const { data: entities, error: fetchError } = await adminClient
      .from('canon_entities')
      .select('id, name, description, type, extended_lore')
      .is('embedding', null) as { 
        data: Array<{ 
          id: string
          name: string
          description: string | null
          type: string
          extended_lore: Record<string, unknown> | null 
        }> | null
        error: Error | null 
      }
    
    if (fetchError) {
      console.error('Error fetching entities:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch entities' },
        { status: 500 }
      )
    }
    
    if (!entities || entities.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No entities need hydration - all embeddings are populated',
        hydrated: 0,
      })
    }
    
    let hydratedCount = 0
    const errors: string[] = []
    
    // Process each entity
    for (const entity of entities) {
      try {
        // Build text to embed: name + type + description + extended lore summary
        const textParts = [
          entity.name,
          `Type: ${entity.type}`,
          entity.description || '',
        ]
        
        // Add extended lore if present
        if (entity.extended_lore && typeof entity.extended_lore === 'object') {
          const lore = entity.extended_lore as Record<string, unknown>
          if (lore.history) textParts.push(`History: ${String(lore.history)}`)
          if (lore.abilities) textParts.push(`Abilities: ${String(lore.abilities)}`)
          if (lore.relationships) textParts.push(`Relationships: ${String(lore.relationships)}`)
        }
        
        const textToEmbed = textParts.filter(Boolean).join('\n').slice(0, 8000)
        
        // Generate embedding
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: textToEmbed,
        })
        
        const embedding = embeddingResponse.data[0].embedding
        
        // Update the entity with the new embedding
        const { error: updateError } = await adminClient
          .from('canon_entities')
          .update({ embedding } as never)
          .eq('id', entity.id)
        
        if (updateError) {
          console.error(`Error updating ${entity.name}:`, updateError)
          errors.push(`Failed to update ${entity.name}: ${updateError.message}`)
        } else {
          hydratedCount++
          console.log(`✓ Hydrated: ${entity.name}`)
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (entityError) {
        const errorMsg = entityError instanceof Error ? entityError.message : 'Unknown error'
        console.error(`Error processing ${entity.name}:`, errorMsg)
        errors.push(`Failed to process ${entity.name}: ${errorMsg}`)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Hydrated ${hydratedCount} entities`,
      hydrated: hydratedCount,
      total: entities.length,
      errors: errors.length > 0 ? errors : undefined,
    })
    
  } catch (error) {
    console.error('Hydrate error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/hydrate
 * Returns count of entities needing hydration
 * Authentication required but admin check removed for testing
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Use admin client to count entities (bypasses RLS)
    const client = adminClient || supabase
    
    // Count entities needing hydration
    const { count, error } = await client
      .from('canon_entities')
      .select('*', { count: 'exact', head: true })
      .is('embedding', null)
    
    if (error) {
      console.error('Count entities error:', error)
      return NextResponse.json(
        { error: 'Failed to count entities' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      needsHydration: count || 0,
    })
    
  } catch (error) {
    console.error('Hydrate check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
