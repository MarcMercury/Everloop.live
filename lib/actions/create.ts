'use server'

import { createClient } from '@/lib/supabase/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import OpenAI from 'openai'
import { revalidatePath } from 'next/cache'
import type { CanonEntityType } from '@/types/database'

// Initialize OpenAI client for DALL-E
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Generate a URL-friendly slug from a name
function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  
  // Add timestamp suffix to ensure uniqueness for user creations
  const timestamp = Date.now().toString(36)
  return `${baseSlug}-${timestamp}`
}

export type EntityType = 'character' | 'location' | 'creature'

interface GenerateDescriptionInput {
  name: string
  tagline: string
  type: EntityType
  existingDescription?: string
}

/**
 * Generate or expand an entity description using GPT-4o
 */
export async function generateEntityDescription(input: GenerateDescriptionInput): Promise<{
  success: boolean
  description?: string
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'You must be logged in to use AI features' }
    }

    const typeDescriptions = {
      character: 'a character in a fantasy universe called the Everloop, a world of looping time, ancient shards of power, and mystical forces',
      location: 'a mystical location in the Everloop, a fantasy universe with looping time, ancient ruins, and ethereal landscapes',
      creature: 'a creature or being in the Everloop, a fantasy universe filled with spirits, mythical beasts, and otherworldly entities',
    }

    const prompt = input.existingDescription
      ? `You are a creative writing assistant for the Everloop fantasy universe. 
         Expand and enrich this ${input.type} description while maintaining its core essence.
         
         Name: ${input.name}
         Tagline: ${input.tagline}
         Current Description: ${input.existingDescription}
         
         Write a rich, evocative 2-3 paragraph description that:
         - Expands on the existing description
         - Adds sensory details and atmosphere
         - Hints at mysteries and connections to the broader world
         - Maintains a fantasy tone appropriate for ${typeDescriptions[input.type]}
         
         Return ONLY the description text, no headers or labels.`
      : `You are a creative writing assistant for the Everloop fantasy universe.
         Create a compelling description for ${typeDescriptions[input.type]}.
         
         Name: ${input.name}
         Tagline: ${input.tagline}
         
         Write a rich, evocative 2-3 paragraph description that:
         - Captures the essence of the name and tagline
         - Includes sensory details and atmosphere
         - Hints at mysteries and backstory
         - Maintains a fantasy tone
         
         Return ONLY the description text, no headers or labels.`

    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt,
      maxOutputTokens: 800,
    })

    return { success: true, description: text.trim() }
  } catch (error) {
    console.error('Error generating description:', error)
    return { success: false, error: 'Failed to generate description. Please try again.' }
  }
}

interface GenerateImageInput {
  name: string
  type: EntityType
  description: string
}

/**
 * Generate concept art using DALL-E 3 and upload to Supabase Storage
 */
export async function generateEntityImage(input: GenerateImageInput): Promise<{
  success: boolean
  imageUrl?: string
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'You must be logged in to use AI features' }
    }

    // Build a focused prompt for DALL-E
    const stylePrompts = {
      character: 'fantasy character portrait, detailed face and upper body, dramatic lighting, painterly style, high fantasy art',
      location: 'fantasy landscape illustration, atmospheric, mystical lighting, detailed environment, concept art style',
      creature: 'fantasy creature design, detailed anatomy, magical aura, concept art style, dramatic pose',
    }

    const imagePrompt = `${input.name}: ${input.description.slice(0, 300)}. Style: ${stylePrompts[input.type]}. No text, no watermarks.`

    // Generate image with DALL-E 3
    const response = await openaiClient.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    })

    const generatedImageUrl = response.data?.[0]?.url
    if (!generatedImageUrl) {
      return { success: false, error: 'No image was generated' }
    }

    // Download the image
    const imageResponse = await fetch(generatedImageUrl)
    if (!imageResponse.ok) {
      return { success: false, error: 'Failed to download generated image' }
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    
    // Upload to Supabase Storage
    const fileName = `${user.id}/${input.type}-${Date.now()}.png`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('entity-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: 'Failed to upload image to storage' }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('entity-images')
      .getPublicUrl(fileName)

    return { success: true, imageUrl: publicUrl }
  } catch (error) {
    console.error('Error generating image:', error)
    return { success: false, error: 'Failed to generate image. Please try again.' }
  }
}

interface SaveEntityInput {
  name: string
  tagline: string
  description: string
  type: EntityType
  imageUrl?: string
}

/**
 * Save a new entity to the canon_entities table
 * Sets status='draft' and created_by to current user for private entities
 */
export async function saveEntity(input: SaveEntityInput): Promise<{
  success: boolean
  entityId?: string
  slug?: string
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'You must be logged in to save entities' }
    }

    const slug = generateSlug(input.name)
    
    // Cast to CanonEntityType for type safety
    const entityType = input.type as CanonEntityType

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase
      .from('canon_entities') as any)
      .insert({
        name: input.name,
        slug,
        type: entityType,
        description: input.description,
        status: 'draft',
        created_by: user.id,
        extended_lore: {
          tagline: input.tagline,
          image_url: input.imageUrl || null,
          is_user_created: true,
        },
        metadata: {
          created_via: 'creator_studio',
        },
      })
      .select('id, slug')
      .single()

    if (error) {
      console.error('Save entity error:', error)
      return { success: false, error: 'Failed to save entity' }
    }

    revalidatePath('/roster')
    revalidatePath('/create')

    return { success: true, entityId: data.id, slug: data.slug }
  } catch (error) {
    console.error('Error saving entity:', error)
    return { success: false, error: 'Failed to save entity. Please try again.' }
  }
}

/**
 * Delete a user-created entity
 */
export async function deleteEntity(entityId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'You must be logged in to delete entities' }
    }

    // Only allow deletion of entities the user created and that are drafts
    const { error } = await supabase
      .from('canon_entities')
      .delete()
      .eq('id', entityId)
      .eq('created_by', user.id)
      .eq('status', 'draft')

    if (error) {
      console.error('Delete entity error:', error)
      return { success: false, error: 'Failed to delete entity' }
    }

    revalidatePath('/roster')

    return { success: true }
  } catch (error) {
    console.error('Error deleting entity:', error)
    return { success: false, error: 'Failed to delete entity. Please try again.' }
  }
}

/**
 * Get user's private roster entities
 */
export async function getUserRoster(): Promise<{
  success: boolean
  entities?: Array<{
    id: string
    name: string
    slug: string
    type: string
    description: string | null
    extended_lore: {
      tagline?: string
      image_url?: string | null
    }
    created_at: string
  }>
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'You must be logged in to view your roster' }
    }

    const { data, error } = await supabase
      .from('canon_entities')
      .select('id, name, slug, type, description, extended_lore, created_at')
      .eq('created_by', user.id)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get roster error:', error)
      return { success: false, error: 'Failed to load roster' }
    }

    return { 
      success: true, 
      entities: data as Array<{
        id: string
        name: string
        slug: string
        type: string
        description: string | null
        extended_lore: {
          tagline?: string
          image_url?: string | null
        }
        created_at: string
      }>
    }
  } catch (error) {
    console.error('Error getting roster:', error)
    return { success: false, error: 'Failed to load roster. Please try again.' }
  }
}
