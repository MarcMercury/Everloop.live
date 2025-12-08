'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Approve a story - sets status to 'approved' (or 'canonical')
 */
export async function approveStory(storyId: string, reviewNotes?: string) {
  const supabase = await createClient()
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null; error: Error | null }
  
  if (!profile || (profile.role !== 'admin' && profile.role !== 'lorekeeper')) {
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
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null; error: Error | null }
  
  if (!profile || (profile.role !== 'admin' && profile.role !== 'lorekeeper')) {
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
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null; error: Error | null }
  
  if (!profile || (profile.role !== 'admin' && profile.role !== 'lorekeeper')) {
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
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null; error: Error | null }
  
  if (!profile || profile.role !== 'admin') {
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
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null; error: Error | null }
  
  if (!profile || (profile.role !== 'admin' && profile.role !== 'lorekeeper')) {
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
