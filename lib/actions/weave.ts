'use server'

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface WeaveParams {
  entityId: string
  storyId: string
  contextBefore: string // Last ~500 words of story before cursor
  contextAfter?: string // Optional: text after cursor
}

interface WeaveResult {
  success: boolean
  paragraph?: string
  error?: string
}

/**
 * Weave - AI generates a paragraph introducing an entity into the story
 * 
 * Reads the entity's details (name, description, lore) and the story context
 * to generate a natural, in-world introduction of the entity.
 */
export async function weaveEntityIntoStory(params: WeaveParams): Promise<WeaveResult> {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Authentication required' }
    }

    // Type for entity from database
    type EntityData = {
      name: string
      type: string
      description: string | null
      extended_lore: Record<string, unknown> | null
      tags: string[] | null
    }

    // Type for story from database
    type StoryData = {
      title: string
      scope: string | null
    }

    // Fetch entity details
    const { data: entity, error: entityError } = await supabase
      .from('canon_entities')
      .select('name, type, description, extended_lore, tags')
      .eq('id', params.entityId)
      .single() as { data: EntityData | null; error: Error | null }

    if (entityError || !entity) {
      return { success: false, error: 'Entity not found' }
    }

    // Fetch story details for context
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('title, scope')
      .eq('id', params.storyId)
      .single() as { data: StoryData | null; error: Error | null }

    if (storyError || !story) {
      return { success: false, error: 'Story not found' }
    }

    // Build entity context for the AI
    const entityContext = buildEntityContext(entity)
    
    // Craft the prompt
    const systemPrompt = `You are a skilled fantasy writer helping to weave entities into ongoing stories. 
Your task is to write a SINGLE paragraph (3-5 sentences) that naturally introduces an entity into the narrative.

Guidelines:
- Match the existing prose style and tone
- Never break the fourth wall
- Show, don't tell - introduce through action or observation
- The introduction should feel organic, not forced
- Use the entity's characteristics but don't dump all information at once
- Maintain narrative flow with what comes before/after`

    const userPrompt = `Story: "${story.title}" (${story.scope === 'tome' ? 'Novel' : story.scope === 'scene' ? 'Vignette' : 'Short Story'})

ENTITY TO INTRODUCE:
${entityContext}

STORY CONTEXT (text before where entity should appear):
"""
${params.contextBefore.slice(-1500)}
"""

${params.contextAfter ? `TEXT AFTER (what comes next):
"""
${params.contextAfter.slice(0, 500)}
"""` : ''}

Write a single paragraph that introduces ${entity.name} into the story at this point. The paragraph should flow naturally from the context provided.`

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    const paragraph = completion.choices[0]?.message?.content?.trim()

    if (!paragraph) {
      return { success: false, error: 'Failed to generate introduction' }
    }

    return {
      success: true,
      paragraph,
    }
  } catch (error) {
    console.error('Weave error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to weave entity into story',
    }
  }
}

/**
 * Build a context string from entity data for the AI
 */
function buildEntityContext(entity: {
  name: string
  type: string
  description: string | null
  extended_lore: Record<string, unknown> | null
  tags: string[] | null
}): string {
  const lines: string[] = [
    `Name: ${entity.name}`,
    `Type: ${entity.type}`,
  ]

  if (entity.description) {
    lines.push(`Description: ${entity.description}`)
  }

  if (entity.tags && entity.tags.length > 0) {
    lines.push(`Traits: ${entity.tags.join(', ')}`)
  }

  // Extract useful info from extended_lore
  const lore = entity.extended_lore || {}
  
  if (lore.tagline) {
    lines.push(`Tagline: ${lore.tagline}`)
  }

  // For characters
  if (lore.origin) {
    lines.push(`Origin: ${lore.origin}`)
  }
  if (lore.abilities) {
    lines.push(`Abilities: ${lore.abilities}`)
  }
  if (lore.personality) {
    lines.push(`Personality: ${lore.personality}`)
  }
  if (lore.appearance) {
    lines.push(`Appearance: ${lore.appearance}`)
  }

  // For locations
  if (lore.climate) {
    lines.push(`Climate: ${lore.climate}`)
  }
  if (lore.inhabitants) {
    lines.push(`Inhabitants: ${lore.inhabitants}`)
  }
  if (lore.notable_features) {
    lines.push(`Notable Features: ${lore.notable_features}`)
  }

  // For creatures
  if (lore.habitat) {
    lines.push(`Habitat: ${lore.habitat}`)
  }
  if (lore.behavior) {
    lines.push(`Behavior: ${lore.behavior}`)
  }
  if (lore.danger_level) {
    lines.push(`Danger Level: ${lore.danger_level}`)
  }

  return lines.join('\n')
}
