'use server'

import { createClient } from '@/lib/supabase/server'
import type { 
  StoryCollaborator, 
  StoryCollaboratorInsert,
  StoryInvitation,
  StoryInvitationInsert,
  CollaboratorRole 
} from '@/types/database'

// Re-export types for components
export type { StoryCollaborator, StoryInvitation, CollaboratorRole }

// ============================================================================
// Types
// ============================================================================

export interface CollaboratorResult {
  success: boolean
  error?: string
  collaborator?: StoryCollaborator
}

export interface CollaboratorsListResult {
  success: boolean
  error?: string
  collaborators?: StoryCollaborator[]
}

export interface InvitationResult {
  success: boolean
  error?: string
  invitation?: StoryInvitation
}

export interface InvitationsListResult {
  success: boolean
  error?: string
  invitations?: StoryInvitation[]
}

export interface StoryRoleResult {
  success: boolean
  error?: string
  role?: 'owner' | CollaboratorRole | null
  canEdit?: boolean
  canComment?: boolean
}

// ============================================================================
// Role Permission Helpers
// ============================================================================

const ROLE_PERMISSIONS: Record<CollaboratorRole | 'owner', { canEdit: boolean; canComment: boolean }> = {
  owner: { canEdit: true, canComment: true },
  co_author: { canEdit: true, canComment: true },
  editor: { canEdit: true, canComment: true },
  commenter: { canEdit: false, canComment: true },
  viewer: { canEdit: false, canComment: false },
}

// ============================================================================
// Get User's Role on Story
// ============================================================================

export async function getStoryRole(storyId: string): Promise<StoryRoleResult> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  // Check if user is the author
  const { data: storyData } = await supabase
    .from('stories')
    .select('author_id')
    .eq('id', storyId)
    .single()
  
  const story = storyData as { author_id: string } | null
  
  if (story && story.author_id === user.id) {
    return { 
      success: true, 
      role: 'owner',
      canEdit: true,
      canComment: true,
    }
  }
  
  // Check collaborator role
  const { data: collab } = await supabase
    .from('story_collaborators' as never)
    .select('role')
    .eq('story_id', storyId)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .not('accepted_at', 'is', null)
    .single()
  
  if (collab) {
    const role = (collab as { role: CollaboratorRole }).role
    const permissions = ROLE_PERMISSIONS[role]
    return {
      success: true,
      role,
      canEdit: permissions.canEdit,
      canComment: permissions.canComment,
    }
  }
  
  return { success: true, role: null, canEdit: false, canComment: false }
}

// ============================================================================
// Get Collaborators for Story
// ============================================================================

export async function getCollaborators(storyId: string): Promise<CollaboratorsListResult> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  const { data, error } = await supabase
    .from('story_collaborators' as never)
    .select(`
      *,
      user:profiles!user_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('story_id', storyId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching collaborators:', error)
    return { success: false, error: 'Failed to fetch collaborators.' }
  }
  
  return { 
    success: true, 
    collaborators: data as unknown as StoryCollaborator[] 
  }
}

// ============================================================================
// Add Collaborator (Direct - user already exists)
// ============================================================================

export async function addCollaborator(
  storyId: string,
  username: string,
  role: CollaboratorRole = 'viewer'
): Promise<CollaboratorResult> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  // Verify user owns the story
  const { data: storyData2 } = await supabase
    .from('stories')
    .select('author_id')
    .eq('id', storyId)
    .single()
  
  const story2 = storyData2 as { author_id: string } | null
  
  if (!story2 || story2.author_id !== user.id) {
    return { success: false, error: 'Only the story author can add collaborators.' }
  }
  
  // Find the user by username
  const { data: targetUserData, error: userError } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('username', username)
    .single()
  
  if (userError || !targetUserData) {
    return { success: false, error: 'User not found.' }
  }
  
  const targetUser = targetUserData as { id: string; username: string }
  
  // Can't add yourself
  if (targetUser.id === user.id) {
    return { success: false, error: 'You cannot add yourself as a collaborator.' }
  }
  
  // Check if already a collaborator
  const { data: existing } = await supabase
    .from('story_collaborators' as never)
    .select('id')
    .eq('story_id', storyId)
    .eq('user_id', targetUser.id)
    .single()
  
  if (existing) {
    return { success: false, error: 'This user is already a collaborator.' }
  }
  
  // Add the collaborator
  const insertData: StoryCollaboratorInsert = {
    story_id: storyId,
    user_id: targetUser.id,
    role,
    invited_by: user.id,
  }
  
  const { data, error } = await supabase
    .from('story_collaborators' as never)
    .insert(insertData as never)
    .select(`
      *,
      user:profiles!user_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .single()
  
  if (error) {
    console.error('Error adding collaborator:', error)
    return { success: false, error: 'Failed to add collaborator.' }
  }
  
  return { success: true, collaborator: data as unknown as StoryCollaborator }
}

// ============================================================================
// Update Collaborator Role
// ============================================================================

export async function updateCollaboratorRole(
  collaboratorId: string,
  newRole: CollaboratorRole
): Promise<CollaboratorResult> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  // Get the collaborator to find the story
  const { data: collab } = await supabase
    .from('story_collaborators' as never)
    .select('story_id')
    .eq('id', collaboratorId)
    .single()
  
  if (!collab) {
    return { success: false, error: 'Collaborator not found.' }
  }
  
  // Verify user owns the story
  const { data: storyData3 } = await supabase
    .from('stories')
    .select('author_id')
    .eq('id', (collab as { story_id: string }).story_id)
    .single()
  
  const story3 = storyData3 as { author_id: string } | null
  
  if (!story3 || story3.author_id !== user.id) {
    return { success: false, error: 'Only the story author can change collaborator roles.' }
  }
  
  // Update the role
  const { data, error } = await supabase
    .from('story_collaborators' as never)
    .update({ role: newRole } as never)
    .eq('id', collaboratorId)
    .select(`
      *,
      user:profiles!user_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .single()
  
  if (error) {
    console.error('Error updating collaborator:', error)
    return { success: false, error: 'Failed to update collaborator.' }
  }
  
  return { success: true, collaborator: data as unknown as StoryCollaborator }
}

// ============================================================================
// Remove Collaborator
// ============================================================================

export async function removeCollaborator(
  collaboratorId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  // Get the collaborator
  const { data: collab } = await supabase
    .from('story_collaborators' as never)
    .select('story_id, user_id')
    .eq('id', collaboratorId)
    .single()
  
  if (!collab) {
    return { success: false, error: 'Collaborator not found.' }
  }
  
  const collabData = collab as { story_id: string; user_id: string }
  
  // Allow removal if: user owns the story OR user is removing themselves
  const { data: storyData4 } = await supabase
    .from('stories')
    .select('author_id')
    .eq('id', collabData.story_id)
    .single()
  
  const story4 = storyData4 as { author_id: string } | null
  const isOwner = story4 && story4.author_id === user.id
  const isSelf = collabData.user_id === user.id
  
  if (!isOwner && !isSelf) {
    return { success: false, error: 'You can only remove yourself or collaborators from your own stories.' }
  }
  
  // Soft delete by setting is_active = false
  const { error } = await supabase
    .from('story_collaborators' as never)
    .update({ is_active: false } as never)
    .eq('id', collaboratorId)
  
  if (error) {
    console.error('Error removing collaborator:', error)
    return { success: false, error: 'Failed to remove collaborator.' }
  }
  
  return { success: true }
}

// ============================================================================
// Accept Collaboration Invite
// ============================================================================

export async function acceptCollaboration(
  collaboratorId: string
): Promise<CollaboratorResult> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  // Update to accepted
  const { data, error } = await supabase
    .from('story_collaborators' as never)
    .update({ accepted_at: new Date().toISOString() } as never)
    .eq('id', collaboratorId)
    .eq('user_id', user.id) // Ensure user can only accept their own
    .is('accepted_at', null) // Only if not already accepted
    .select(`
      *,
      user:profiles!user_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .single()
  
  if (error) {
    console.error('Error accepting collaboration:', error)
    return { success: false, error: 'Failed to accept invitation.' }
  }
  
  return { success: true, collaborator: data as unknown as StoryCollaborator }
}

// ============================================================================
// Get Pending Invitations for Current User
// ============================================================================

export async function getPendingInvitations(): Promise<CollaboratorsListResult> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  // Get collaborations that haven't been accepted yet
  const { data, error } = await supabase
    .from('story_collaborators' as never)
    .select(`
      *,
      story:stories (
        id,
        title,
        slug,
        author:profiles!author_id (
          username,
          display_name
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .is('accepted_at', null)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching pending invitations:', error)
    return { success: false, error: 'Failed to fetch invitations.' }
  }
  
  return { 
    success: true, 
    collaborators: data as unknown as StoryCollaborator[] 
  }
}

// ============================================================================
// Get Stories User Collaborates On
// ============================================================================

export async function getCollaboratingStories(): Promise<{
  success: boolean
  error?: string
  stories?: Array<{
    id: string
    title: string
    slug: string
    role: CollaboratorRole
    author: {
      username: string
      display_name: string | null
    }
  }>
}> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  const { data, error } = await supabase
    .from('story_collaborators' as never)
    .select(`
      role,
      story:stories (
        id,
        title,
        slug,
        author:profiles!author_id (
          username,
          display_name
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .not('accepted_at', 'is', null)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching collaborating stories:', error)
    return { success: false, error: 'Failed to fetch stories.' }
  }
  
  const stories = (data as unknown as Array<{
    role: CollaboratorRole
    story: {
      id: string
      title: string
      slug: string
      author: { username: string; display_name: string | null }
    }
  }>).map(item => ({
    id: item.story.id,
    title: item.story.title,
    slug: item.story.slug,
    role: item.role,
    author: item.story.author,
  }))
  
  return { success: true, stories }
}
