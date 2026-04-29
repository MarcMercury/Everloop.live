'use server'

import { createClient } from '@/lib/supabase/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import OpenAI from 'openai'
import { revalidatePath } from 'next/cache'
import type { CanonEntityType } from '@/types/database'

// Lazy initialization of OpenAI client for DALL-E
let openaiClient: OpenAI | null = null
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

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

export type EntityType = 'character' | 'location' | 'creature' | 'monster'

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
      character: 'a character in the Everloop, a world where reality is fractured into Shards — broken remnants of the Anchors that once held everything together. Characters are shaped by their relationship to the Shards: seeking them, protecting them, being changed by them, or drawn toward them without understanding why',
      location: 'a location in the Everloop, a world where the Pattern frays and reality fractures. Locations exist in tension with the forces beneath them — some still stand because a Shard holds them together, others crumble because the Fray runs deep. Monsters born from the Drift may haunt places where reality has broken',
      creature: 'a creature in the Everloop — a being that appeared only after the Fray, when the Rogue Architects broke the world. Creatures are manifestations of the Drift leaking through fractured reality: Pure Drift Intrusions (alien, unstable), Corrupted Reality (warped by Drift exposure), or Echo Constructs (formed from memory). If a creature exists, something broke in reality to let it through',
      monster: 'a monster in the Everloop — an uncontrolled manifestation of the Drift entering through the Fray. Monsters are NOT native to the Everloop. They appeared only after the Rogue Architects shattered the Anchors and the Fray cut from the Everloop through the Pattern, through the Fold, all the way to the Drift. They are raw existence forcing itself into form without rules — broken combinations of matter, memory, and intent. They lack consistent structure, stable identity, logical biology, or predictable behavior. If a monster exists, reality broke there for a reason tied to a Shard or the Fray',
    }

    const prompt = input.existingDescription
      ? `You are a creative writing assistant for the Everloop universe. 
         Expand and enrich this ${input.type} description while maintaining its core essence.
         
         Name: ${input.name}
         Tagline: ${input.tagline}
         Current Description: ${input.existingDescription}
         
         Write a rich, evocative 2-3 paragraph description that:
         - Expands on the existing description
         - Adds sensory details and atmosphere
         - Hints at connections to the deeper forces shaping the world (Shards, the Fray, the Pattern)
         - ${input.type === 'creature' || input.type === 'monster' ? 'Implies what broke in reality to let this through — connect it to the Fray, the Drift, or a Shard. It is a consequence of instability, not a random being' : input.type === 'character' ? 'Suggests how this person relates to the Shards — are they seeking, guarding, changed by, or unknowingly drawn toward one?' : 'Hints at what hidden force holds this place together or tears it apart — a buried Shard, a Fray zone, the pull of something deeper'}
         - Maintains a contemplative, atmospheric tone appropriate for ${typeDescriptions[input.type]}
         
         Return ONLY the description text, no headers or labels.`
      : `You are a creative writing assistant for the Everloop universe.
         Create a compelling description for ${typeDescriptions[input.type]}.
         
         Name: ${input.name}
         Tagline: ${input.tagline}
         
         Write a rich, evocative 2-3 paragraph description that:
         - Captures the essence of the name and tagline
         - Includes sensory details and atmosphere
         - Hints at connections to the deeper forces of the Everloop — Shards, the Fray, the Pattern
         - ${input.type === 'creature' || input.type === 'monster' ? 'Implies what fractured in reality to birth this being. Monsters are consequences of the Fray, not random beings. Connect it to the Drift, the Fray, or a Shard' : input.type === 'character' ? 'Suggests their relationship to the hidden forces shaping the world — the Shards that pull everything toward convergence' : 'Hints at what remains beneath this place — a Shard, a Fray zone, an instability that draws or repels'}
         - Maintains a contemplative, atmospheric tone
         
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
      monster: 'dark fantasy horror creature, unstable form, reality distortion, eldritch design, fractured anatomy, concept art style, dramatic lighting, atmospheric dread',
    }

    // Description-led prompt: the image must depict what the Description says.
    // For monsters we deliberately omit the name from the prompt — DALL-E 3
    // frequently renders proper nouns as text labels in the image. We also
    // front-load and repeat strong negative constraints, since DALL-E 3
    // ignores weak single-mention negatives.
    const safeDescription = input.description.slice(0, 800).trim()
    const noTextDirective =
      'IMPORTANT: pure illustration only. Absolutely no text, no letters, no words, no captions, no labels, no titles, no signatures, no watermarks, no logos, no UI, no borders, no frames, no banners. Image only.'

    const imagePrompt =
      input.type === 'monster'
        ? `${noTextDirective} Depict the following creature exactly as described: ${safeDescription}. Style: ${stylePrompts.monster}. ${noTextDirective}`
        : `${noTextDirective} ${input.name}: ${safeDescription}. Style: ${stylePrompts[input.type]}. ${noTextDirective}`

    // Generate image with DALL-E 3
    const response = await getOpenAIClient().images.generate({
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
      // Common errors: permission denied = missing GRANT, 42501 = RLS policy violation
      const errorMessage = error.code === '42501' 
        ? 'Permission denied - please contact support'
        : error.message || 'Failed to save entity'
      return { success: false, error: errorMessage }
    }

    revalidatePath('/roster')
    revalidatePath('/create')

    // Auto-queue 3D model generation in the background
    // Fire-and-forget — don't block the save response
    import('./auto-3d').then(({ queueEntityModel }) => {
      queueEntityModel(data.id).catch((err: unknown) => {
        console.error('[Auto 3D] Background queue failed:', err)
      })
    }).catch(() => {})

    return { success: true, entityId: data.id, slug: data.slug }
  } catch (error) {
    console.error('Error saving entity:', error)
    return { success: false, error: 'Failed to save entity. Please try again.' }
  }
}

/**
 * Submit a draft entity for canon review
 * Changes status from 'draft' to 'proposed'
 */
export async function submitEntityForCanon(entityId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'You must be logged in to submit entities' }
    }

    // Type for entity check
    type EntityCheck = {
      id: string
      status: string
      created_by: string
    }

    // First verify the entity belongs to the user and is a draft
    const { data: entity, error: fetchError } = await supabase
      .from('canon_entities')
      .select('id, status, created_by')
      .eq('id', entityId)
      .single() as { data: EntityCheck | null; error: Error | null }

    if (fetchError || !entity) {
      return { success: false, error: 'Entity not found' }
    }

    if (entity.created_by !== user.id) {
      return { success: false, error: 'You can only submit your own entities' }
    }

    if (entity.status !== 'draft') {
      return { success: false, error: 'Only draft entities can be submitted' }
    }

    // Update status to 'proposed' for admin review
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('canon_entities')
      .update({ status: 'proposed' })
      .eq('id', entityId)
      .eq('created_by', user.id)
      .eq('status', 'draft')

    if (updateError) {
      console.error('Submit entity error:', updateError)
      return { success: false, error: 'Failed to submit entity for review' }
    }

    revalidatePath('/roster')
    revalidatePath('/admin/entities')

    return { success: true }
  } catch (error) {
    console.error('Error submitting entity:', error)
    return { success: false, error: 'Failed to submit entity. Please try again.' }
  }
}

/**
 * Delete a user-created entity
 * Users can delete their own draft or proposed entities
 * Canonical entities can only be deleted by admins
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

    // Only allow deletion of entities the user created that are NOT canonical
    // Canonical entities can only be deleted by admins
    // First verify the entity exists and belongs to this user
    const { data: entity } = await supabase
      .from('canon_entities')
      .select('id')
      .eq('id', entityId)
      .eq('created_by', user.id)
      .in('status', ['draft', 'proposed'])
      .single()

    if (!entity) {
      return { success: false, error: 'Entity not found or cannot be deleted' }
    }

    const { error } = await supabase
      .from('canon_entities')
      .delete()
      .eq('id', entityId)
      .eq('created_by', user.id)
      .in('status', ['draft', 'proposed'])

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

/**
 * Get a single entity by ID for editing
 */
export async function getEntity(entityId: string): Promise<{
  success: boolean
  entity?: {
    id: string
    name: string
    slug: string
    type: EntityType
    description: string | null
    extended_lore: {
      tagline?: string
      image_url?: string | null
    }
    status: string
  }
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'You must be logged in' }
    }

    // Type for the response
    type EntityRow = {
      id: string
      name: string
      slug: string
      type: string
      description: string | null
      extended_lore: Record<string, unknown> | null
      status: string
      created_by: string
    }

    const { data, error } = await supabase
      .from('canon_entities')
      .select('id, name, slug, type, description, extended_lore, status, created_by')
      .eq('id', entityId)
      .single() as { data: EntityRow | null; error: Error | null }

    if (error || !data) {
      return { success: false, error: 'Entity not found' }
    }

    // Verify user owns this entity
    if (data.created_by !== user.id) {
      return { success: false, error: 'You can only edit your own entities' }
    }

    return {
      success: true,
      entity: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        type: data.type as EntityType,
        description: data.description,
        extended_lore: {
          tagline: (data.extended_lore?.tagline as string) || undefined,
          image_url: (data.extended_lore?.image_url as string | null) || null,
        },
        status: data.status,
      },
    }
  } catch (error) {
    console.error('Error getting entity:', error)
    return { success: false, error: 'Failed to load entity' }
  }
}

interface UpdateEntityInput {
  id: string
  name: string
  tagline: string
  description: string
  imageUrl?: string
}

/**
 * Update an existing entity
 */
export async function updateEntity(input: UpdateEntityInput): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'You must be logged in to update entities' }
    }

    // Verify ownership and status
    type EntityCheck = {
      id: string
      created_by: string
      status: string
    }

    const { data: existing, error: checkError } = await supabase
      .from('canon_entities')
      .select('id, created_by, status')
      .eq('id', input.id)
      .single() as { data: EntityCheck | null; error: Error | null }

    if (checkError || !existing) {
      return { success: false, error: 'Entity not found' }
    }

    if (existing.created_by !== user.id) {
      return { success: false, error: 'You can only edit your own entities' }
    }

    if (existing.status !== 'draft') {
      return { success: false, error: 'Only draft entities can be edited' }
    }

    // Update the entity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('canon_entities')
      .update({
        name: input.name,
        description: input.description,
        extended_lore: {
          tagline: input.tagline,
          image_url: input.imageUrl || null,
          is_user_created: true,
        },
      })
      .eq('id', input.id)
      .eq('created_by', user.id)

    if (updateError) {
      console.error('Update entity error:', updateError)
      return { success: false, error: 'Failed to update entity' }
    }

    revalidatePath('/roster')
    revalidatePath(`/create`)

    return { success: true }
  } catch (error) {
    console.error('Error updating entity:', error)
    return { success: false, error: 'Failed to update entity' }
  }
}

// ═══════════════════════════════════════════════════════════
// CAMPAIGN MONSTER (D&D 5e stat block)
// ═══════════════════════════════════════════════════════════

interface CampaignMonsterStats {
  role: string
  cr: number
  hp: number
  ac: number
  damagePerRound: string
  movements: { type: string; speed: number }[]
  actions: { name: string; description: string; damage?: string; actionType: string }[]
  traits: string[]
  weaknesses: string[]
  regionId: string
  isOneOff: boolean
  whatBrokeHere: string
  whatLeakedThrough: string
  drawnTo: string
}

interface SaveCampaignMonsterInput {
  name: string
  tagline: string
  description: string
  imageUrl?: string
  monsterStats: CampaignMonsterStats
}

/**
 * Save a campaign-ready D&D 5e monster to canon_entities
 * Stores full stat block and Everloop lore in extended_lore + metadata
 */
export async function saveCampaignMonster(input: SaveCampaignMonsterInput): Promise<{
  success: boolean
  entityId?: string
  slug?: string
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in to save monsters' }
    }

    const slug = generateSlug(input.name)
    const stats = input.monsterStats

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase
      .from('canon_entities') as any)
      .insert({
        name: input.name,
        slug,
        type: 'monster' as CanonEntityType,
        description: input.description,
        status: 'draft',
        created_by: user.id,
        extended_lore: {
          tagline: input.tagline,
          image_url: input.imageUrl || null,
          is_user_created: true,
          monster_stats: {
            role: stats.role,
            cr: stats.cr,
            hp: stats.hp,
            ac: stats.ac,
            damage_per_round: stats.damagePerRound,
            movements: stats.movements,
            actions: stats.actions,
            traits: stats.traits,
            weaknesses: stats.weaknesses,
          },
          everloop_lore: {
            what_broke_here: stats.whatBrokeHere,
            what_leaked_through: stats.whatLeakedThrough,
            drawn_to: stats.drawnTo,
          },
          region_id: stats.regionId,
          is_one_off: stats.isOneOff,
        },
        metadata: {
          created_via: 'campaign_monster_wizard',
          monster_purpose: 'campaign',
          region_id: stats.regionId,
          is_one_off: stats.isOneOff,
        },
      })
      .select('id, slug')
      .single()

    if (error) {
      console.error('Save campaign monster error:', error)
      const errorMessage = error.code === '42501'
        ? 'Permission denied - please contact support'
        : error.message || 'Failed to save monster'
      return { success: false, error: errorMessage }
    }

    revalidatePath('/roster')
    revalidatePath('/create')

    // Auto-queue 3D model generation in the background
    import('./auto-3d').then(({ queueEntityModel }) => {
      queueEntityModel(data.id).catch((err: unknown) => {
        console.error('[Auto 3D] Background queue failed:', err)
      })
    }).catch(() => {})

    return { success: true, entityId: data.id, slug: data.slug }
  } catch (error) {
    console.error('Error saving campaign monster:', error)
    return { success: false, error: 'Failed to save monster. Please try again.' }
  }
}
