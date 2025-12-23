'use server'

import { createClient } from '@/lib/supabase/server'
import { type Json, type StoryInsert, type StoryScope } from '@/types/database'

// Helper type for the Supabase client return with explicit any to bypass type issues
type SupabaseClient = Awaited<ReturnType<typeof createClient>>

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function extractTextFromContent(content: Json): string {
  if (!content || typeof content !== 'object') return ''
  
  const jsonContent = content as { content?: Array<{ type?: string; text?: string; content?: unknown[] }> }
  
  const extractText = (node: unknown): string => {
    if (!node || typeof node !== 'object') return ''
    
    const n = node as { type?: string; text?: string; content?: unknown[] }
    
    if (n.type === 'text' && typeof n.text === 'string') {
      return n.text
    }
    
    if (Array.isArray(n.content)) {
      return n.content.map(extractText).join(' ')
    }
    
    return ''
  }
  
  if (Array.isArray(jsonContent.content)) {
    return jsonContent.content.map(extractText).join('\n').trim()
  }
  
  return ''
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length
}

export interface SubmitStoryResult {
  success: boolean
  error?: string
  storyId?: string
}

export async function submitStory(
  title: string,
  content: Json
): Promise<SubmitStoryResult> {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return {
      success: false,
      error: 'You must be logged in to submit a story.',
    }
  }
  
  // Validate input
  if (!title || title.trim().length === 0) {
    return {
      success: false,
      error: 'Story title is required.',
    }
  }
  
  if (title.trim().length < 3) {
    return {
      success: false,
      error: 'Story title must be at least 3 characters.',
    }
  }
  
  if (!content) {
    return {
      success: false,
      error: 'Story content is required.',
    }
  }
  
  // Extract plain text for search and word count
  const contentText = extractTextFromContent(content)
  const wordCount = countWords(contentText)
  
  if (wordCount < 50) {
    return {
      success: false,
      error: 'Story must be at least 50 words.',
    }
  }
  
  // Generate slug with timestamp to ensure uniqueness
  const baseSlug = slugify(title.trim())
  const timestamp = Date.now().toString(36)
  const slug = `${baseSlug}-${timestamp}`
  
  // Calculate reading time (average 200 words per minute)
  const readingTimeMinutes = Math.ceil(wordCount / 200)
  
  // Build insert data with explicit type
  const storyData: StoryInsert = {
    title: title.trim(),
    slug,
    content,
    content_text: contentText,
    word_count: wordCount,
    author_id: user.id,
    canon_status: 'submitted',
    reading_time_minutes: readingTimeMinutes,
    is_published: false,
  }
  
  // Insert the story - using type assertion to handle Supabase type inference issues
  const { data, error } = await supabase
    .from('stories')
    .insert(storyData as never)
    .select('id')
    .single()
  
  if (error) {
    console.error('Error inserting story:', error)
    return {
      success: false,
      error: 'Failed to submit story. Please try again.',
    }
  }
  
  const result = data as { id: string } | null
  
  return {
    success: true,
    storyId: result?.id,
  }
}

export async function saveDraft(
  title: string,
  content: Json,
  storyId?: string
): Promise<SubmitStoryResult> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return {
      success: false,
      error: 'You must be logged in to save a draft.',
    }
  }
  
  const contentText = extractTextFromContent(content)
  const wordCount = countWords(contentText)
  const readingTimeMinutes = Math.ceil(wordCount / 200)
  
  if (storyId) {
    // Update existing draft
    const updateData = {
      title: title.trim() || 'Untitled',
      content,
      content_text: contentText,
      word_count: wordCount,
      reading_time_minutes: readingTimeMinutes,
    }
    
    const { error } = await supabase
      .from('stories')
      .update(updateData as never)
      .eq('id', storyId)
      .eq('author_id', user.id)
    
    if (error) {
      return {
        success: false,
        error: 'Failed to save draft.',
      }
    }
    
    return { success: true, storyId }
  } else {
    // Create new draft
    const baseSlug = slugify(title.trim() || 'untitled')
    const timestamp = Date.now().toString(36)
    const slug = `${baseSlug}-${timestamp}`
    
    const draftData: StoryInsert = {
      title: title.trim() || 'Untitled',
      slug,
      content,
      content_text: contentText,
      word_count: wordCount,
      author_id: user.id,
      canon_status: 'draft',
      reading_time_minutes: readingTimeMinutes,
      is_published: false,
    }
    
    const { data, error } = await supabase
      .from('stories')
      .insert(draftData as never)
      .select('id')
      .single()
    
    if (error) {
      return {
        success: false,
        error: 'Failed to create draft.',
      }
    }
    
    const result = data as { id: string } | null
    
    return { success: true, storyId: result?.id }
  }
}

// =============================================================================
// SUBMIT EXISTING STORY BY ID
// Submits an existing draft story for review
// =============================================================================

export async function submitStoryById(storyId: string): Promise<SubmitStoryResult> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return {
      success: false,
      error: 'You must be logged in to submit a story.',
    }
  }
  
  // Fetch the story to verify ownership and get current data
  const { data: story, error: fetchError } = await supabase
    .from('stories')
    .select('id, author_id, canon_status, title, word_count')
    .eq('id', storyId)
    .single() as { data: { id: string; author_id: string; canon_status: string; title: string; word_count: number } | null; error: Error | null }
  
  if (fetchError || !story) {
    return {
      success: false,
      error: 'Story not found.',
    }
  }
  
  if (story.author_id !== user.id) {
    return {
      success: false,
      error: 'You can only submit your own stories.',
    }
  }
  
  if (story.canon_status !== 'draft') {
    return {
      success: false,
      error: 'Only draft stories can be submitted for review.',
    }
  }
  
  if (!story.title || story.title.startsWith('Untitled')) {
    return {
      success: false,
      error: 'Please give your story a title before submitting.',
    }
  }
  
  if (story.word_count < 50) {
    return {
      success: false,
      error: 'Story must be at least 50 words.',
    }
  }
  
  // Update the story status to submitted
  const { error: updateError } = await supabase
    .from('stories')
    .update({ canon_status: 'submitted' } as never)
    .eq('id', storyId)
  
  if (updateError) {
    console.error('Error submitting story:', updateError)
    return {
      success: false,
      error: 'Failed to submit story. Please try again.',
    }
  }
  
  return {
    success: true,
    storyId,
  }
}

/**
 * Delete a story (only drafts or rejected stories owned by the user)
 */
export async function deleteStory(storyId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in.' }
  }
  
  // First verify the story belongs to this user and is deletable
  const { data: story, error: fetchError } = await supabase
    .from('stories')
    .select('id, author_id, canon_status')
    .eq('id', storyId)
    .single() as { data: { id: string; author_id: string; canon_status: string } | null; error: Error | null }
  
  if (fetchError || !story) {
    return { success: false, error: 'Story not found.' }
  }
  
  if (story.author_id !== user.id) {
    return { success: false, error: 'You can only delete your own stories.' }
  }
  
  // Only allow deletion of drafts and rejected stories
  if (!['draft', 'rejected'].includes(story.canon_status)) {
    return { success: false, error: 'You can only delete drafts or rejected stories.' }
  }
  
  // Delete associated reviews first (if any)
  await supabase
    .from('story_reviews')
    .delete()
    .eq('story_id', storyId)
  
  // Delete the story
  const { error: deleteError } = await supabase
    .from('stories')
    .delete()
    .eq('id', storyId)
  
  if (deleteError) {
    console.error('Delete error:', deleteError)
    return { success: false, error: 'Failed to delete story.' }
  }
  
  return { success: true }
}

// =============================================================================
// CREATE DRAFT STORY
// Creates a new empty draft story with the specified scope
// =============================================================================

export interface CreateDraftResult {
  success: boolean
  error?: string
  storyId?: string
}

const SCOPE_TITLES: Record<StoryScope, string> = {
  tome: 'Untitled Tome',
  tale: 'Untitled Tale',
  scene: 'Untitled Scene',
}

export async function createDraftStory(
  scope: StoryScope,
  templateTitle?: string,
  templateContent?: Json
): Promise<CreateDraftResult> {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return {
      success: false,
      error: 'You must be logged in to create a story.',
    }
  }
  
  // Validate scope
  if (!['tome', 'tale', 'scene'].includes(scope)) {
    return {
      success: false,
      error: 'Invalid story scope.',
    }
  }
  
  // Use template title/content if provided, otherwise defaults
  const title = templateTitle || SCOPE_TITLES[scope]
  const timestamp = Date.now().toString(36)
  const slug = `draft-${scope}-${timestamp}`
  
  // Create empty TipTap document structure or use template content
  const content = templateContent || {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: []
      }
    ]
  }
  
  // Calculate word count from template content if present
  const contentText = templateContent ? extractTextFromContent(templateContent) : ''
  const wordCount = templateContent ? countWords(contentText) : 0
  
  // Build insert data
  const storyData: StoryInsert = {
    title,
    slug,
    content,
    content_text: contentText,
    word_count: wordCount,
    author_id: user.id,
    canon_status: 'draft',
    scope,
    is_published: false,
  }
  
  // Insert the story
  const { data, error } = await supabase
    .from('stories')
    .insert(storyData as never)
    .select('id')
    .single()
  
  if (error) {
    console.error('Error creating draft story:', error)
    console.error('Story data was:', JSON.stringify(storyData, null, 2))
    return {
      success: false,
      error: `Failed to create story: ${error.message}`,
    }
  }
  
  const result = data as { id: string } | null
  
  return {
    success: true,
    storyId: result?.id,
  }
}
