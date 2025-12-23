'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { 
  StoryTemplate, 
  StoryTemplateInsert, 
  StoryTemplateUpdate,
  StoryScope,
  Json
} from '@/types/database'

// ============================================================================
// Template Retrieval
// ============================================================================

export async function getTemplates(
  scope?: StoryScope,
  options?: {
    includeUserTemplates?: boolean
    featuredOnly?: boolean
  }
): Promise<StoryTemplate[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('story_templates' as unknown as never)
    .select('*')
    .order('is_featured', { ascending: false })
    .order('use_count', { ascending: false })
  
  if (scope) {
    query = query.eq('scope', scope)
  }
  
  if (options?.featuredOnly) {
    query = query.eq('is_featured', true)
  }
  
  const { data, error } = await query

  if (error) {
    console.error('Error fetching templates:', error)
    return []
  }

  return (data || []) as unknown as StoryTemplate[]
}

export async function getTemplate(templateId: string): Promise<StoryTemplate | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('story_templates' as unknown as never)
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) {
    console.error('Error fetching template:', error)
    return null
  }

  return data as unknown as StoryTemplate
}

export async function getSystemTemplates(scope?: StoryScope): Promise<StoryTemplate[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('story_templates' as unknown as never)
    .select('*')
    .eq('template_type', 'system')
    .order('is_featured', { ascending: false })
    .order('use_count', { ascending: false })
  
  if (scope) {
    query = query.eq('scope', scope)
  }
  
  const { data, error } = await query

  if (error) {
    console.error('Error fetching system templates:', error)
    return []
  }

  return (data || []) as unknown as StoryTemplate[]
}

export async function getUserTemplates(): Promise<StoryTemplate[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  const { data, error } = await supabase
    .from('story_templates' as unknown as never)
    .select('*')
    .eq('created_by', user.id)
    .eq('template_type', 'user')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching user templates:', error)
    return []
  }

  return (data || []) as unknown as StoryTemplate[]
}

// ============================================================================
// Template Creation & Management
// ============================================================================

export async function createTemplate(
  template: StoryTemplateInsert
): Promise<{ success: boolean; template?: StoryTemplate; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const templateData = {
    ...template,
    created_by: user.id,
    template_type: 'user' as const,
  }

  const { data, error } = await supabase
    .from('story_templates' as unknown as never)
    .insert(templateData as unknown as never)
    .select()
    .single()

  if (error) {
    console.error('Error creating template:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/create')
  return { success: true, template: data as unknown as StoryTemplate }
}

export async function updateTemplate(
  templateId: string,
  updates: StoryTemplateUpdate
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('story_templates' as unknown as never)
    .update(updates as unknown as never)
    .eq('id', templateId)
    .eq('created_by', user.id)

  if (error) {
    console.error('Error updating template:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/create')
  return { success: true }
}

export async function deleteTemplate(
  templateId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('story_templates' as unknown as never)
    .delete()
    .eq('id', templateId)
    .eq('created_by', user.id)
    .eq('template_type', 'user')

  if (error) {
    console.error('Error deleting template:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/create')
  return { success: true }
}

// ============================================================================
// Template Usage
// ============================================================================

export async function useTemplate(
  templateId: string
): Promise<{ success: boolean; template?: StoryTemplate; error?: string }> {
  const supabase = await createClient()
  
  // Get the template
  const template = await getTemplate(templateId)
  if (!template) {
    return { success: false, error: 'Template not found' }
  }

  // Increment use count (using RPC function)
  await supabase.rpc('increment_template_use_count' as never, { template_id: templateId } as never)

  return { success: true, template }
}

// ============================================================================
// Create Template from Story
// ============================================================================

export async function createTemplateFromStory(
  storyId: string,
  templateName: string,
  templateDescription?: string
): Promise<{ success: boolean; template?: StoryTemplate; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get the story
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('title, content, scope, word_count')
    .eq('id', storyId)
    .eq('author_id', user.id)
    .single() as { 
      data: { title: string; content: unknown; scope: string; word_count: number } | null
      error: Error | null 
    }

  if (storyError || !story) {
    return { success: false, error: 'Story not found or access denied' }
  }

  // Create the template
  const templateData: StoryTemplateInsert = {
    name: templateName,
    description: templateDescription || `Template based on "${story.title}"`,
    scope: story.scope as StoryScope,
    initial_content: story.content as Json,
    suggested_title: story.title,
    estimated_words: story.word_count,
    is_public: false,
  }

  return createTemplate(templateData)
}
