'use server'

import { createClient } from '@/lib/supabase/server'
import { type Json, type Chapter, type ChapterInsert, type ChapterUpdate, type ChapterStatus } from '@/types/database'

// Re-export types for convenient imports
export type { Chapter, ChapterInsert, ChapterUpdate, ChapterStatus }

// =============================================================================
// CHAPTER ACTIONS
// Server actions for managing story chapters (Tomes)
// =============================================================================

interface ChapterResult {
  success: boolean
  error?: string
  chapter?: Chapter
  chapters?: Chapter[]
}

/**
 * Fetch all chapters for a story
 */
export async function getChapters(storyId: string): Promise<ChapterResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('story_chapters')
    .select('*')
    .eq('story_id', storyId)
    .order('chapter_order', { ascending: true })

  if (error) {
    console.error('Error fetching chapters:', error)
    return { success: false, error: 'Failed to fetch chapters' }
  }

  return { success: true, chapters: data as unknown as Chapter[] }
}

/**
 * Get a single chapter by ID
 */
export async function getChapter(chapterId: string): Promise<ChapterResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('story_chapters')
    .select('*')
    .eq('id', chapterId)
    .single()

  if (error) {
    console.error('Error fetching chapter:', error)
    return { success: false, error: 'Failed to fetch chapter' }
  }

  return { success: true, chapter: data as unknown as Chapter }
}

/**
 * Create a new chapter
 */
export async function createChapter(storyId: string, title?: string): Promise<ChapterResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify user owns the story and it's a tome
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('id, author_id, scope')
    .eq('id', storyId)
    .single()

  if (storyError || !story) {
    return { success: false, error: 'Story not found' }
  }

  const storyData = story as { id: string; author_id: string; scope: string }
  
  if (storyData.author_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  if (storyData.scope !== 'tome') {
    return { success: false, error: 'Chapters are only available for Tomes' }
  }

  // Get the next chapter order
  const { data: existingChapters } = await supabase
    .from('story_chapters')
    .select('chapter_order')
    .eq('story_id', storyId)
    .order('chapter_order', { ascending: false })
    .limit(1)

  const nextOrder = existingChapters && existingChapters.length > 0 
    ? (existingChapters[0] as { chapter_order: number }).chapter_order + 1 
    : 0

  // Create the chapter
  const chapterData: ChapterInsert = {
    story_id: storyId,
    title: title || `Chapter ${nextOrder + 1}`,
    chapter_order: nextOrder,
    content: { type: 'doc', content: [{ type: 'paragraph', content: [] }] },
  }

  const { data, error } = await supabase
    .from('story_chapters')
    .insert(chapterData as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating chapter:', error)
    return { success: false, error: 'Failed to create chapter' }
  }

  return { success: true, chapter: data as unknown as Chapter }
}

/**
 * Update a chapter
 */
export async function updateChapter(
  chapterId: string, 
  updates: ChapterUpdate
): Promise<ChapterResult> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('story_chapters')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', chapterId)
    .select()
    .single()

  if (error) {
    console.error('Error updating chapter:', error)
    return { success: false, error: 'Failed to update chapter' }
  }

  return { success: true, chapter: data as unknown as Chapter }
}

/**
 * Save chapter content (convenience wrapper for updateChapter)
 */
export async function saveChapterContent(
  chapterId: string,
  title: string,
  content: Json,
  contentText: string
): Promise<ChapterResult> {
  const wordCount = contentText.trim().split(/\s+/).filter(w => w.length > 0).length

  return updateChapter(chapterId, {
    title,
    content,
    content_text: contentText,
    word_count: wordCount,
  })
}

/**
 * Update chapter status
 */
export async function updateChapterStatus(
  chapterId: string,
  status: ChapterStatus
): Promise<ChapterResult> {
  return updateChapter(chapterId, { status })
}

/**
 * Update chapter summary
 */
export async function updateChapterSummary(
  chapterId: string,
  summary: string
): Promise<ChapterResult> {
  return updateChapter(chapterId, { summary })
}

/**
 * Update chapter word target
 */
export async function updateChapterWordTarget(
  chapterId: string,
  wordTarget: number
): Promise<ChapterResult> {
  return updateChapter(chapterId, { word_target: wordTarget })
}

/**
 * Delete a chapter
 */
export async function deleteChapter(chapterId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('story_chapters')
    .delete()
    .eq('id', chapterId)

  if (error) {
    console.error('Error deleting chapter:', error)
    return { success: false, error: 'Failed to delete chapter' }
  }

  return { success: true }
}

/**
 * Reorder chapters (for drag and drop)
 */
export async function reorderChapters(
  storyId: string,
  chapterIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify user owns the story
  const { data: story } = await supabase
    .from('stories')
    .select('author_id')
    .eq('id', storyId)
    .single()

  if (!story || (story as { author_id: string }).author_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  // Update each chapter's order
  const updates = chapterIds.map((id, index) => 
    supabase
      .from('story_chapters')
      .update({ chapter_order: index } as never)
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const hasError = results.some(r => r.error)

  if (hasError) {
    console.error('Error reordering chapters')
    return { success: false, error: 'Failed to reorder chapters' }
  }

  return { success: true }
}

/**
 * Get total word count across all chapters
 */
export async function getTotalChapterWordCount(storyId: string): Promise<{ 
  success: boolean
  totalWords?: number
  totalTarget?: number
  error?: string 
}> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('story_chapters')
    .select('word_count, word_target')
    .eq('story_id', storyId)

  if (error) {
    return { success: false, error: 'Failed to fetch word counts' }
  }

  const chapters = data as unknown as { word_count: number; word_target: number }[]
  const totalWords = chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0)
  const totalTarget = chapters.reduce((sum, ch) => sum + (ch.word_target || 0), 0)

  return { success: true, totalWords, totalTarget }
}
