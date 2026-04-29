'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>
type AdminGate =
  | { ok: true; supabase: SupabaseClient; userId: string }
  | { ok: false; error: string }

/**
 * Single auth+admin gate for server actions in this file.
 * Uses is_admin_check() RPC (SECURITY DEFINER) to bypass RLS.
 */
async function gateAdmin(): Promise<AdminGate> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const { data: isAdmin, error } = await supabase.rpc('is_admin_check')
  if (error) {
    console.error('[gateAdmin] RPC error:', error.message)
    return { ok: false, error: 'Admin access required' }
  }
  if (isAdmin !== true) {
    return { ok: false, error: 'Admin access required' }
  }
  return { ok: true, supabase, userId: user.id }
}

/**
 * Approve a story for canon. Writes the terminal `canonical` state
 * directly (skipping the intermediate `approved` value) and flips
 * `is_published` so the story is visible to the public Library and
 * passes the RLS "Published stories are viewable by everyone" policy.
 *
 * Note: The `approved` enum value is intentionally not used as a
 * destination. Earlier versions wrote `approved` here, which left
 * stories invisible to the public Library (which filters on
 * `canon_status = 'canonical' AND is_published = true`).
 */
export async function approveStory(storyId: string, reviewNotes?: string) {
  const gate = await gateAdmin()
  if (!gate.ok) return { success: false, error: gate.error }
  const { supabase, userId } = gate

  const now = new Date().toISOString()

  // Promote directly to canonical and publish.
  const { error } = await supabase
    .from('stories')
    .update({
      canon_status: 'canonical',
      is_published: true,
      published_at: now,
      updated_at: now,
    } as never)
    .eq('id', storyId)

  if (error) {
    console.error('Approve error:', error)
    return { success: false, error: error.message }
  }

  // Create review record
  await supabase.from('story_reviews').insert({
    story_id: storyId,
    reviewer_id: userId,
    decision: 'approve',
    feedback: reviewNotes || 'Approved by admin',
    is_ai_review: false,
  } as never)

  revalidatePath('/admin')
  revalidatePath('/stories')
  revalidatePath('/explore')
  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Send a story back to the author for revisions. Sets status to
 * `revision_requested` and records the reviewer's feedback. The
 * author can then edit and resubmit via submitStoryById().
 */
export async function requestRevisionStory(storyId: string, feedback: string) {
  const gate = await gateAdmin()
  if (!gate.ok) return { success: false, error: gate.error }
  const { supabase, userId } = gate

  if (!feedback || !feedback.trim()) {
    return { success: false, error: 'Revision feedback is required.' }
  }

  const { error } = await supabase
    .from('stories')
    .update({
      canon_status: 'revision_requested',
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', storyId)

  if (error) {
    console.error('Request revision error:', error)
    return { success: false, error: error.message }
  }

  await supabase.from('story_reviews').insert({
    story_id: storyId,
    reviewer_id: userId,
    decision: 'revision_requested',
    feedback: feedback.trim(),
    is_ai_review: false,
  } as never)

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Reject a story - sets status to 'rejected'
 */
export async function rejectStory(storyId: string, reason: string) {
  const gate = await gateAdmin()
  if (!gate.ok) return { success: false, error: gate.error }
  const { supabase, userId } = gate

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
    reviewer_id: userId,
    decision: 'reject',
    feedback: reason,
    is_ai_review: false,
  } as never)
  
  revalidatePath('/admin')
  revalidatePath('/stories')
  revalidatePath('/explore')
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
  const gate = await gateAdmin()
  if (!gate.ok) return { success: false, error: gate.error }
  const { supabase } = gate

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
  const gate = await gateAdmin()
  if (!gate.ok) return { success: false, error: gate.error }
  const { supabase } = gate

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
  const gate = await gateAdmin()
  if (!gate.ok) return { success: false, error: gate.error }
  const { supabase, userId } = gate

  const { error } = await supabase
    .from('canon_entities')
    .insert({
      ...data,
      status: data.status || 'proposed',
      stability_rating: data.stability_rating || 50,
      created_by: userId,
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
  const gate = await gateAdmin()
  if (!gate.ok) return { success: false, error: gate.error }
  const { supabase, userId } = gate

  // Update entity status to canonical
  const { error } = await supabase
    .from('canon_entities')
    .update({ 
      status: 'canonical',
      approved_by: userId,
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
  const gate = await gateAdmin()
  if (!gate.ok) return { success: false, error: gate.error }

  const adminClient = createAdminClient()
  if (!adminClient) {
    return { success: false, error: 'Admin client not available' }
  }

  // Fetch the entity using admin client
  const { data: entity, error: fetchError } = await adminClient
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
    console.error('[hydrateEntity] Fetch error:', fetchError)
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
  
  // Check for OpenAI key
  if (!process.env.OPENAI_API_KEY) {
    return { success: false, error: 'OpenAI API key not configured' }
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
    
    // Save embedding to database using admin client
    const { error: updateError } = await adminClient
      .from('canon_entities')
      .update({ 
        embedding: embedding,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', entityId)
    
    if (updateError) {
      console.error('[hydrateEntity] Update error:', updateError)
      return { success: false, error: 'Failed to save embedding' }
    }
    
    revalidatePath('/admin/entities')
    return { success: true }
  } catch (err) {
    console.error('[hydrateEntity] OpenAI error:', err)
    return { success: false, error: 'Failed to generate embedding' }
  }
}

// ── User Management Actions ──────────────────────────────────

/**
 * Freeze (ban) a user account. Sets a far-future ban duration.
 */
export async function freezeUser(userId: string) {
  const gate = await gateAdmin()
  if (!gate.ok) return { success: false, error: gate.error }

  if (userId === gate.userId) return { success: false, error: 'Cannot freeze your own account' }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Admin client not available' }

  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    ban_duration: '876600h', // ~100 years
  })

  if (error) {
    console.error('[freezeUser] Error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

/**
 * Unfreeze (unban) a user account.
 */
export async function unfreezeUser(userId: string) {
  const gate = await gateAdmin()
  if (!gate.ok) return { success: false, error: gate.error }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Admin client not available' }

  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  })

  if (error) {
    console.error('[unfreezeUser] Error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

/**
 * Delete a user account entirely (auth + profile).
 */
export async function deleteUser(userId: string) {
  const gate = await gateAdmin()
  if (!gate.ok) return { success: false, error: gate.error }

  if (userId === gate.userId) return { success: false, error: 'Cannot delete your own account' }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Admin client not available' }

  // Delete auth user (Supabase cascades to profile via FK or trigger)
  const { error } = await adminClient.auth.admin.deleteUser(userId)

  if (error) {
    console.error('[deleteUser] Error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

/**
 * Generate a password reset link for a user.
 */
export async function resetUserPassword(userId: string, email: string) {
  const gate = await gateAdmin()
  if (!gate.ok) return { success: false, error: gate.error }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Admin client not available' }

  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'recovery',
    email,
  })

  if (error) {
    console.error('[resetUserPassword] Error:', error)
    return { success: false, error: error.message }
  }

  return {
    success: true,
    resetLink: data.properties?.action_link || null,
  }
}

/**
 * Toggle admin status for a user.
 */
export async function toggleUserAdmin(userId: string, makeAdmin: boolean) {
  const gate = await gateAdmin()
  if (!gate.ok) return { success: false, error: gate.error }

  if (userId === gate.userId) return { success: false, error: 'Cannot change your own admin status' }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Admin client not available' }

  const { error } = await adminClient
    .from('profiles')
    .update({ is_admin: makeAdmin, updated_at: new Date().toISOString() } as never)
    .eq('id', userId)

  if (error) {
    console.error('[toggleUserAdmin] Error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
