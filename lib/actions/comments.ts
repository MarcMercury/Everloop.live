'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  type StoryComment, 
  type StoryCommentInsert, 
  type StoryCommentUpdate,
  type CommentType 
} from '@/types/database'

// Re-export types for convenient imports
export type { StoryComment, StoryCommentInsert, StoryCommentUpdate, CommentType }

// =============================================================================
// COMMENT ACTIONS
// Server actions for managing inline story comments
// =============================================================================

interface CommentResult {
  success: boolean
  error?: string
  comment?: StoryComment
  comments?: StoryComment[]
}

interface CommentCountResult {
  success: boolean
  error?: string
  counts?: {
    total: number
    unresolved: number
    notes: number
    suggestions: number
    questions: number
    issues: number
  }
}

/**
 * Fetch all comments for a story
 */
export async function getStoryComments(
  storyId: string,
  options?: {
    chapterId?: string
    includeResolved?: boolean
    onlyPrivate?: boolean
  }
): Promise<CommentResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  let query = supabase
    .from('story_comments')
    .select('*')
    .eq('story_id', storyId)
    .order('position_start', { ascending: true })

  if (options?.chapterId) {
    query = query.eq('chapter_id', options.chapterId)
  }

  if (options?.includeResolved === false) {
    query = query.eq('is_resolved', false)
  }

  if (options?.onlyPrivate) {
    query = query.eq('is_private', true).eq('user_id', user.id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching comments:', error)
    return { success: false, error: 'Failed to fetch comments' }
  }

  return { success: true, comments: data as StoryComment[] }
}

/**
 * Get a single comment by ID
 */
export async function getComment(commentId: string): Promise<CommentResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('story_comments')
    .select('*')
    .eq('id', commentId)
    .single()

  if (error) {
    console.error('Error fetching comment:', error)
    return { success: false, error: 'Failed to fetch comment' }
  }

  return { success: true, comment: data as StoryComment }
}

/**
 * Get comments in a thread
 */
export async function getCommentThread(threadId: string): Promise<CommentResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('story_comments')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comment thread:', error)
    return { success: false, error: 'Failed to fetch comment thread' }
  }

  return { success: true, comments: data as StoryComment[] }
}

/**
 * Create a new comment
 */
export async function createComment(
  data: StoryCommentInsert
): Promise<CommentResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Generate a thread_id for new top-level comments
  const threadId = data.parent_id ? data.thread_id : crypto.randomUUID()

  const insertData = {
    ...data,
    user_id: user.id,
    thread_id: threadId,
  }

  const { data: comment, error } = await supabase
    .from('story_comments')
    .insert(insertData as unknown as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    return { success: false, error: 'Failed to create comment' }
  }

  return { success: true, comment: comment as unknown as StoryComment }
}

/**
 * Reply to an existing comment
 */
export async function replyToComment(
  parentId: string,
  content: string
): Promise<CommentResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get the parent comment to inherit thread_id and position
  const { data: parent, error: parentError } = await supabase
    .from('story_comments')
    .select('*')
    .eq('id', parentId)
    .single()

  if (parentError || !parent) {
    return { success: false, error: 'Parent comment not found' }
  }

  const parentData = parent as unknown as StoryComment

  const insertData = {
    story_id: parentData.story_id,
    chapter_id: parentData.chapter_id,
    user_id: user.id,
    content,
    comment_type: parentData.comment_type,
    position_start: parentData.position_start,
    position_end: parentData.position_end,
    selected_text: parentData.selected_text,
    thread_id: parentData.thread_id,
    parent_id: parentId,
    is_private: parentData.is_private,
  }

  const { data: comment, error } = await supabase
    .from('story_comments')
    .insert(insertData as unknown as never)
    .select()
    .single()

  if (error) {
    console.error('Error replying to comment:', error)
    return { success: false, error: 'Failed to reply to comment' }
  }

  return { success: true, comment: comment as unknown as StoryComment }
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  updates: StoryCommentUpdate
): Promise<CommentResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: comment, error } = await supabase
    .from('story_comments')
    .update(updates as unknown as never)
    .eq('id', commentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating comment:', error)
    return { success: false, error: 'Failed to update comment' }
  }

  return { success: true, comment: comment as unknown as StoryComment }
}

/**
 * Resolve or unresolve a comment thread
 */
export async function resolveComment(
  commentId: string,
  resolved: boolean = true
): Promise<CommentResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const updates: StoryCommentUpdate = {
    is_resolved: resolved,
    resolved_at: resolved ? new Date().toISOString() : null,
    resolved_by: resolved ? user.id : null,
  }

  return updateComment(commentId, updates)
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<CommentResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('story_comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    console.error('Error deleting comment:', error)
    return { success: false, error: 'Failed to delete comment' }
  }

  return { success: true }
}

/**
 * Get comment counts for a story
 */
export async function getCommentCounts(storyId: string): Promise<CommentCountResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Use manual count since the RPC function may not exist yet
  const { data: comments, error } = await supabase
    .from('story_comments')
    .select('*')
    .eq('story_id', storyId)

  if (error) {
    console.error('Error fetching comment counts:', error)
    return { success: false, error: 'Failed to fetch comment counts' }
  }

  const commentData = (comments || []) as unknown as StoryComment[]

  return {
    success: true,
    counts: {
      total: commentData.length,
      unresolved: commentData.filter(c => !c.is_resolved).length,
      notes: commentData.filter(c => c.comment_type === 'note').length,
      suggestions: commentData.filter(c => c.comment_type === 'suggestion').length,
      questions: commentData.filter(c => c.comment_type === 'question').length,
      issues: commentData.filter(c => c.comment_type === 'issue').length,
    }
  }
}

/**
 * Shift comment positions after text edit
 * Call this after inserting/deleting text to keep comments aligned
 */
export async function shiftCommentPositions(
  storyId: string,
  chapterId: string | null,
  editPosition: number,
  shiftAmount: number // Positive for insert, negative for delete
): Promise<CommentResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get all comments that need to be shifted
  let query = supabase
    .from('story_comments')
    .select('*')
    .eq('story_id', storyId)
    .gt('position_start', editPosition)

  if (chapterId) {
    query = query.eq('chapter_id', chapterId)
  }

  const { data: commentsData, error: fetchError } = await query

  if (fetchError) {
    console.error('Error fetching comments to shift:', fetchError)
    return { success: false, error: 'Failed to shift comments' }
  }

  const comments = (commentsData || []) as unknown as StoryComment[]

  if (comments.length === 0) {
    return { success: true, comments: [] }
  }

  // Update each comment's position
  const updates = comments.map(comment => ({
    id: comment.id,
    position_start: comment.position_start + shiftAmount,
    position_end: comment.position_end + shiftAmount,
  }))

  for (const update of updates) {
    await supabase
      .from('story_comments')
      .update({
        position_start: update.position_start,
        position_end: update.position_end,
      } as unknown as never)
      .eq('id', update.id)
  }

  return { success: true }
}
