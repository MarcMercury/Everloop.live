'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Helper to verify admin access using is_admin column
 * Currently returns true for any authenticated user (admin check disabled for testing)
 */
async function verifyAdminAccess(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  // TEMPORARILY DISABLED: Allow any authenticated user for testing
  // Remove this line and uncomment below to restore admin check
  return true
  
  /*
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, role')
    .eq('id', userId)
    .single() as { data: { is_admin: boolean; role: string } | null; error: Error | null }
  
  // Check is_admin first, fallback to role for backwards compatibility
  return profile?.is_admin === true || profile?.role === 'admin' || profile?.role === 'lorekeeper'
  */
}

/**
 * Approve a story - sets status to 'approved' (or 'canonical')
 */
export async function approveStory(storyId: string, reviewNotes?: string) {
  const supabase = await createClient()
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  
  const isAdmin = await verifyAdminAccess(supabase, user.id)
  if (!isAdmin) {
    return { success: false, error: 'Admin access required' }
  }
  
  // Update story status
  const { error } = await supabase
    .from('stories')
    .update({ 
      canon_status: 'approved',
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', storyId)
  
  if (error) {
    console.error('Approve error:', error)
    return { success: false, error: error.message }
  }
  
  // Create review record
  await supabase.from('story_reviews').insert({
    story_id: storyId,
    reviewer_id: user.id,
    decision: 'approve',
    feedback: reviewNotes || 'Approved by admin',
    is_ai_review: false,
  } as never)
  
  revalidatePath('/admin')
  return { success: true }
}

/**
 * Reject a story - sets status to 'rejected'
 */
export async function rejectStory(storyId: string, reason: string) {
  const supabase = await createClient()
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  
  const isAdmin = await verifyAdminAccess(supabase, user.id)
  if (!isAdmin) {
    return { success: false, error: 'Admin access required' }
  }
  
  // Update story status
  const { error } = await supabase
    .from('stories')
    .update({ 
      canon_status: 'rejected',
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', storyId)
  
  if (error) {
    console.error('Reject error:', error)
    return { success: false, error: error.message }
  }
  
  // Create review record
  await supabase.from('story_reviews').insert({
    story_id: storyId,
    reviewer_id: user.id,
    decision: 'reject',
    feedback: reason,
    is_ai_review: false,
  } as never)
  
  revalidatePath('/admin')
  return { success: true }
}

/**
 * Update a canon entity
 */
export async function updateCanonEntity(
  entityId: string,
  data: {
    name?: string
    description?: string
    type?: string
    status?: string
    stability_rating?: number
  }
) {
  const supabase = await createClient()
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  
  const isAdmin = await verifyAdminAccess(supabase, user.id)
  if (!isAdmin) {
    return { success: false, error: 'Admin access required' }
  }
  
  // Clear embedding if description changed (needs re-hydration)
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
    ...(data.description ? { embedding: null } : {}),
  }
  
  const { error } = await supabase
    .from('canon_entities')
    .update(updateData as never)
    .eq('id', entityId)
  
  if (error) {
    console.error('Update entity error:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/entities')
  revalidatePath('/explore')
  return { success: true }
}

/**
 * Delete a canon entity
 */
export async function deleteCanonEntity(entityId: string) {
  const supabase = await createClient()
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  
  const isAdmin = await verifyAdminAccess(supabase, user.id)
  if (!isAdmin) {
    return { success: false, error: 'Admin access required' }
  }
  
  const { error } = await supabase
    .from('canon_entities')
    .delete()
    .eq('id', entityId)
  
  if (error) {
    console.error('Delete entity error:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/entities')
  revalidatePath('/explore')
  return { success: true }
}

/**
 * Create a new canon entity
 */
export async function createCanonEntity(data: {
  name: string
  slug: string
  type: string
  description: string
  status?: string
  stability_rating?: number
}) {
  const supabase = await createClient()
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  
  const isAdmin = await verifyAdminAccess(supabase, user.id)
  if (!isAdmin) {
    return { success: false, error: 'Admin access required' }
  }
  
  const { error } = await supabase
    .from('canon_entities')
    .insert({
      ...data,
      status: data.status || 'proposed',
      stability_rating: data.stability_rating || 50,
      created_by: user.id,
    } as never)
  
  if (error) {
    console.error('Create entity error:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/entities')
  revalidatePath('/explore')
  return { success: true }
}

/**
 * Canonize a user-created entity - promotes from draft to canonical
 */
export async function canonizeEntity(entityId: string) {
  const supabase = await createClient()
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  
  const isAdmin = await verifyAdminAccess(supabase, user.id)
  if (!isAdmin) {
    return { success: false, error: 'Admin access required' }
  }
  
  // Update entity status to canonical
  const { error } = await supabase
    .from('canon_entities')
    .update({ 
      status: 'canonical',
      approved_by: user.id,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', entityId)
  
  if (error) {
    console.error('Canonize entity error:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/entities')
  revalidatePath('/explore')
  revalidatePath('/roster')
  return { success: true }
}

/**
 * Hydrate a single entity with an embedding
 */
export async function hydrateEntity(entityId: string) {
  const supabase = await createClient()
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  
  const isAdmin = await verifyAdminAccess(supabase, user.id)
  if (!isAdmin) {
    return { success: false, error: 'Admin access required' }
  }
  
  // Fetch the entity
  const { data: entity, error: fetchError } = await supabase
    .from('canon_entities')
    .select('id, name, description, type, extended_lore')
    .eq('id', entityId)
    .single() as { 
      data: { 
        id: string
        name: string
        description: string | null
        type: string
        extended_lore: Record<string, unknown> | null 
      } | null
      error: Error | null 
    }
  
  if (fetchError || !entity) {
    return { success: false, error: 'Entity not found' }
  }
  
  // Build text for embedding
  const textForEmbedding = [
    `Name: ${entity.name}`,
    `Type: ${entity.type}`,
    entity.description ? `Description: ${entity.description}` : '',
    entity.extended_lore?.tagline ? `Tagline: ${entity.extended_lore.tagline}` : '',
  ].filter(Boolean).join('\n')
  
  if (!textForEmbedding.trim()) {
    return { success: false, error: 'Entity has no content to embed' }
  }
  
  // Generate embedding
  const { default: OpenAI } = await import('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  
  try {
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: textForEmbedding,
    })
    
    const embedding = embeddingResponse.data[0].embedding
    
    // Save embedding to database
    const { error: updateError } = await supabase
      .from('canon_entities')
      .update({ 
        embedding: JSON.stringify(embedding),
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', entityId)
    
    if (updateError) {
      console.error('Update embedding error:', updateError)
      return { success: false, error: 'Failed to save embedding' }
    }
    
    revalidatePath('/admin/entities')
    return { success: true }
  } catch (err) {
    console.error('OpenAI embedding error:', err)
    return { success: false, error: 'Failed to generate embedding' }
  }
}
