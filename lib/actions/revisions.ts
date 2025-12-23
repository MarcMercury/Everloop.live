'use server'

import { createClient } from '@/lib/supabase/server'
import type { 
  StoryRevision, 
  StoryRevisionInsert, 
  RevisionType,
  Json 
} from '@/types/database'

// ============================================================================
// Types
// ============================================================================

export interface RevisionResult {
  success: boolean
  error?: string
  revision?: StoryRevision
}

export interface RevisionsListResult {
  success: boolean
  error?: string
  revisions?: StoryRevision[]
}

export interface DiffChange {
  type: 'added' | 'removed' | 'unchanged'
  content: string
}

export interface DiffData {
  oldRevision: StoryRevision
  newRevision: StoryRevision
  changes: DiffChange[]
  linesAdded: number
  linesRemoved: number
  totalChanges: number
}

export interface DiffResult {
  success: boolean
  error?: string
  diff?: DiffData
}

// Re-export types for components
export type { StoryRevision, RevisionType }

// ============================================================================
// Create Revision
// ============================================================================

export async function createRevision(
  storyId: string,
  title: string,
  content: Json,
  options?: {
    chapterId?: string
    revisionType?: RevisionType
    changeSummary?: string
    contentText?: string
    wordCount?: number
    wordsAdded?: number
    wordsRemoved?: number
  }
): Promise<RevisionResult> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  // Verify user owns the story
  const { data: storyData, error: storyError } = await supabase
    .from('stories')
    .select('id, author_id')
    .eq('id', storyId)
    .single()
  
  if (storyError || !storyData) {
    return { success: false, error: 'Story not found.' }
  }
  
  const story = storyData as { id: string; author_id: string }
  
  if (story.author_id !== user.id) {
    return { success: false, error: 'You can only create revisions for your own stories.' }
  }
  
  const insertData: StoryRevisionInsert = {
    story_id: storyId,
    chapter_id: options?.chapterId || null,
    revision_type: options?.revisionType || 'auto',
    title,
    content,
    content_text: options?.contentText || null,
    word_count: options?.wordCount || 0,
    change_summary: options?.changeSummary || null,
    words_added: options?.wordsAdded || 0,
    words_removed: options?.wordsRemoved || 0,
  }
  
  const { data, error } = await supabase
    .from('story_revisions' as never)
    .insert({ ...insertData, created_by: user.id } as never)
    .select('*')
    .single()
  
  if (error) {
    console.error('Error creating revision:', error)
    return { success: false, error: 'Failed to create revision.' }
  }
  
  return { success: true, revision: data as unknown as StoryRevision }
}

// ============================================================================
// Get Revisions
// ============================================================================

export async function getRevisions(
  storyId: string,
  chapterId?: string | null,
  options?: {
    limit?: number
    offset?: number
  }
): Promise<RevisionsListResult> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  let query = supabase
    .from('story_revisions' as never)
    .select('*')
    .eq('story_id', storyId)
    .order('revision_number', { ascending: false })
  
  if (chapterId !== undefined) {
    if (chapterId === null) {
      query = query.is('chapter_id', null)
    } else {
      query = query.eq('chapter_id', chapterId)
    }
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching revisions:', error)
    return { success: false, error: 'Failed to fetch revisions.' }
  }
  
  return { success: true, revisions: (data || []) as unknown as StoryRevision[] }
}

// ============================================================================
// Get Single Revision
// ============================================================================

export async function getRevision(revisionId: string): Promise<RevisionResult> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  const { data, error } = await supabase
    .from('story_revisions' as never)
    .select('*')
    .eq('id', revisionId)
    .single()
  
  if (error) {
    console.error('Error fetching revision:', error)
    return { success: false, error: 'Revision not found.' }
  }
  
  return { success: true, revision: data as unknown as StoryRevision }
}

// ============================================================================
// Get Latest Revision
// ============================================================================

export async function getLatestRevision(
  storyId: string,
  chapterId?: string | null
): Promise<RevisionResult> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  let query = supabase
    .from('story_revisions' as never)
    .select('*')
    .eq('story_id', storyId)
    .order('revision_number', { ascending: false })
    .limit(1)
  
  if (chapterId !== undefined) {
    if (chapterId === null) {
      query = query.is('chapter_id', null)
    } else {
      query = query.eq('chapter_id', chapterId)
    }
  }
  
  const { data, error } = await query
  
  if (error || !data || data.length === 0) {
    return { success: false, error: 'No revisions found.' }
  }
  
  return { success: true, revision: data[0] as unknown as StoryRevision }
}

// ============================================================================
// Compare Revisions (Diff)
// ============================================================================

function extractTextFromContent(content: Json): string {
  if (!content || typeof content !== 'object') return ''
  
  const extractText = (node: unknown): string => {
    if (!node || typeof node !== 'object') return ''
    
    const n = node as { type?: string; text?: string; content?: unknown[] }
    
    if (n.type === 'text' && typeof n.text === 'string') {
      return n.text
    }
    
    if (Array.isArray(n.content)) {
      return n.content.map(extractText).join('')
    }
    
    return ''
  }
  
  const jsonContent = content as { content?: unknown[] }
  if (Array.isArray(jsonContent.content)) {
    return jsonContent.content.map(extractText).join('\n')
  }
  
  return ''
}

function computeSimpleDiff(oldText: string, newText: string): DiffChange[] {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const changes: DiffChange[] = []
  
  // Simple line-by-line diff (not optimal but works for display)
  const oldSet = new Set(oldLines)
  const newSet = new Set(newLines)
  
  // Track which lines were matched
  const matchedOld = new Set<number>()
  const matchedNew = new Set<number>()
  
  // Find unchanged lines
  for (let i = 0; i < newLines.length; i++) {
    const line = newLines[i]
    if (oldSet.has(line)) {
      const oldIndex = oldLines.findIndex((l, idx) => l === line && !matchedOld.has(idx))
      if (oldIndex !== -1) {
        matchedOld.add(oldIndex)
        matchedNew.add(i)
      }
    }
  }
  
  // Build change list
  let oldIdx = 0
  let newIdx = 0
  
  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (matchedOld.has(oldIdx) && matchedNew.has(newIdx) && oldLines[oldIdx] === newLines[newIdx]) {
      changes.push({ type: 'unchanged', content: newLines[newIdx] })
      oldIdx++
      newIdx++
    } else if (oldIdx < oldLines.length && !matchedOld.has(oldIdx)) {
      changes.push({ type: 'removed', content: oldLines[oldIdx] })
      oldIdx++
    } else if (newIdx < newLines.length && !matchedNew.has(newIdx)) {
      changes.push({ type: 'added', content: newLines[newIdx] })
      newIdx++
    } else {
      // Skip matched lines that don't align
      if (oldIdx < oldLines.length) oldIdx++
      if (newIdx < newLines.length) newIdx++
    }
  }
  
  return changes
}

export async function compareRevisions(
  oldRevisionId: string,
  newRevisionId: string
): Promise<DiffResult> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  // Fetch both revisions
  const [oldResult, newResult] = await Promise.all([
    getRevision(oldRevisionId),
    getRevision(newRevisionId),
  ])
  
  if (!oldResult.success || !oldResult.revision) {
    return { success: false, error: 'Old revision not found.' }
  }
  
  if (!newResult.success || !newResult.revision) {
    return { success: false, error: 'New revision not found.' }
  }
  
  const oldText = oldResult.revision.content_text || extractTextFromContent(oldResult.revision.content)
  const newText = newResult.revision.content_text || extractTextFromContent(newResult.revision.content)
  
  const changes = computeSimpleDiff(oldText, newText)
  
  // Calculate stats
  const linesAdded = changes.filter(c => c.type === 'added').length
  const linesRemoved = changes.filter(c => c.type === 'removed').length
  const totalChanges = linesAdded + linesRemoved
  
  return {
    success: true,
    diff: {
      oldRevision: oldResult.revision,
      newRevision: newResult.revision,
      changes,
      linesAdded,
      linesRemoved,
      totalChanges,
    },
  }
}

// ============================================================================
// Delete Revision
// ============================================================================

export async function deleteRevision(revisionId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  const { error } = await supabase
    .from('story_revisions' as never)
    .delete()
    .eq('id', revisionId)
  
  if (error) {
    console.error('Error deleting revision:', error)
    return { success: false, error: 'Failed to delete revision.' }
  }
  
  return { success: true }
}

// ============================================================================
// Cleanup Old Auto Revisions
// ============================================================================

export async function cleanupOldRevisions(
  storyId: string,
  keepCount: number = 50
): Promise<{ success: boolean; deleted?: number; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  // Get all auto revisions sorted by age
  const { data: revisions, error: fetchError } = await supabase
    .from('story_revisions' as never)
    .select('id, revision_number')
    .eq('story_id', storyId)
    .eq('revision_type', 'auto')
    .order('revision_number', { ascending: false })
  
  if (fetchError) {
    return { success: false, error: 'Failed to fetch revisions.' }
  }
  
  const revisionsToDelete = (revisions as { id: string }[] || []).slice(keepCount)
  
  if (revisionsToDelete.length === 0) {
    return { success: true, deleted: 0 }
  }
  
  const idsToDelete = revisionsToDelete.map(r => r.id)
  
  const { error: deleteError } = await supabase
    .from('story_revisions' as never)
    .delete()
    .in('id', idsToDelete)
  
  if (deleteError) {
    return { success: false, error: 'Failed to delete old revisions.' }
  }
  
  return { success: true, deleted: idsToDelete.length }
}

// ============================================================================
// Restore Revision
// ============================================================================

export async function restoreRevision(
  revisionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  // Fetch the revision
  const revisionResult = await getRevision(revisionId)
  if (!revisionResult.success || !revisionResult.revision) {
    return { success: false, error: 'Revision not found.' }
  }
  
  const revision = revisionResult.revision
  
  // Update the story with the revision content
  if (revision.chapter_id) {
    // Update chapter
    const { error } = await supabase
      .from('story_chapters')
      .update({
        title: revision.title,
        content: revision.content,
        content_text: revision.content_text,
        word_count: revision.word_count,
      } as never)
      .eq('id', revision.chapter_id)
    
    if (error) {
      console.error('Error restoring chapter:', error)
      return { success: false, error: 'Failed to restore chapter.' }
    }
  } else {
    // Update story
    const { error } = await supabase
      .from('stories')
      .update({
        title: revision.title,
        content: revision.content,
        content_text: revision.content_text,
        word_count: revision.word_count,
      } as never)
      .eq('id', revision.story_id)
    
    if (error) {
      console.error('Error restoring story:', error)
      return { success: false, error: 'Failed to restore story.' }
    }
  }
  
  // Create a new revision marking the restore
  await createRevision(
    revision.story_id,
    revision.title,
    revision.content,
    {
      chapterId: revision.chapter_id || undefined,
      revisionType: 'manual',
      changeSummary: `Restored from revision #${revision.revision_number}`,
      contentText: revision.content_text || undefined,
      wordCount: revision.word_count,
    }
  )
  
  return { success: true }
}
