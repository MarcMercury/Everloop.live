'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
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

export type EntityType = 'character' | 'location' | 'creature' | 'monster' | 'artifact' | 'faction' | 'event' | 'concept'

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

    const typeDescriptions: Record<EntityType, string> = {
      character: 'a character in the Everloop, a world where reality is fractured into Shards — broken remnants of the Anchors that once held everything together. Characters are shaped by their relationship to the Shards: seeking them, protecting them, being changed by them, or drawn toward them without understanding why',
      location: 'a location in the Everloop, a world where the Pattern frays and reality fractures. Locations exist in tension with the forces beneath them — some still stand because a Shard holds them together, others crumble because the Fray runs deep. Monsters born from the Drift may haunt places where reality has broken',
      creature: 'a creature in the Everloop — a being that appeared only after the Fray, when the Rogue Architects broke the world. Creatures are manifestations of the Drift leaking through fractured reality: Pure Drift Intrusions (alien, unstable), Corrupted Reality (warped by Drift exposure), or Echo Constructs (formed from memory). If a creature exists, something broke in reality to let it through',
      monster: 'a monster in the Everloop — an uncontrolled manifestation of the Drift entering through the Fray. Monsters are NOT native to the Everloop. They appeared only after the Rogue Architects shattered the Anchors and the Fray cut from the Everloop through the Pattern, through the Fold, all the way to the Drift. They are raw existence forcing itself into form without rules — broken combinations of matter, memory, and intent. They lack consistent structure, stable identity, logical biology, or predictable behavior. If a monster exists, reality broke there for a reason tied to a Shard or the Fray',
      artifact: 'an artifact in the Everloop — an object that has outlasted what was meant to hold it. Artifacts carry the residue of the Pattern, the Shards, or the Drift, and their power is rarely free of cost',
      faction: 'a faction in the Everloop — an order, guild, cult, or movement bound by purpose. Factions are defined by what they protect, hunt, or remember about the Shards and the Fray',
      event: 'an event in the Everloop — a moment that fractured, reshaped, or exposed the world. Events are remembered for what they took and what they made possible, and they trace back to the Shards, the Anchors, or the Fray',
      concept: 'a concept in the Everloop — a force, idea, or recurrence that threads through the world\'s deeper logic. Concepts are felt through their consequences, surfacing in people, places, and Monsters alike',
    }

    const guidanceByType: Record<EntityType, string> = {
      character: 'Suggests how this person relates to the Shards — are they seeking, guarding, changed by, or unknowingly drawn toward one?',
      location: 'Hints at what hidden force holds this place together or tears it apart — a buried Shard, a Fray zone, the pull of something deeper',
      creature: 'Implies what broke in reality to let this through — connect it to the Fray, the Drift, or a Shard. It is a consequence of instability, not a random being',
      monster: 'Implies what broke in reality to let this through — connect it to the Fray, the Drift, or a Shard. It is a consequence of instability, not a random being',
      artifact: 'Hints at the artifact\'s origin and the cost of using it — its tie to the Shards, the Anchors, or the Drift',
      faction: 'Suggests how this group relates to the Shards, the Anchors, or the Fray — what they protect, hunt, or refuse to forget',
      event: 'Implies what fractured to make this moment possible — a Shard event, a Fray bleed, a mortal choice with cosmic weight',
      concept: 'Hints at how this idea manifests through the Pattern, the Shards, or the Drift — what becomes legible only because this concept exists',
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
         - ${guidanceByType[input.type]}
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
         - ${guidanceByType[input.type]}
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
  /** Optional art style id (see ENTITY_ART_STYLES). Defaults vary by type. */
  style?: string
  /** Optional extra user-supplied detail to weave in (e.g. pose, mood). */
  customDetails?: string
}

// Shared art-style prompts. Mirrors the approach used by the Player/Roster
// portrait generator so users get the same controllable style picker for
// every kind of AI-generated concept art.
const ENTITY_ART_STYLES: Record<string, string> = {
  'fantasy-oil':
    'High fantasy oil painting, rich saturated colors, dramatic lighting, painterly brushwork, classic fantasy book cover quality',
  'dark-fantasy':
    'Dark fantasy concept art, moody atmospheric lighting, deep shadows with selective highlights, gothic and brooding, muted palette with crimson or violet accents',
  'realistic':
    'Hyperrealistic digital painting, photorealistic detail, natural cinematic lighting, shallow depth of field, physically grounded materials',
  'watercolor':
    'Ethereal watercolor illustration, soft washes of color, delicate brushstrokes, translucent layers, dreamy atmosphere',
  'ink-wash':
    'Black-and-white ink wash illustration, expressive linework, sumi-e influence, high contrast, sparse use of color',
  'comic-book':
    'Comic book illustration, bold ink outlines, cel-shading, vivid colors, dynamic composition, modern Western comic aesthetic',
  'storybook':
    'Storybook illustration, hand-painted texture, gentle warm lighting, charming and intricate detail',
}

const DEFAULT_STYLE_BY_TYPE: Record<EntityType, string> = {
  character: 'fantasy-oil',
  location: 'fantasy-oil',
  creature: 'dark-fantasy',
  monster: 'dark-fantasy',
  artifact: 'fantasy-oil',
  faction: 'fantasy-oil',
  event: 'fantasy-oil',
  concept: 'ethereal-watercolor',
}

/**
 * Generate concept art using gpt-image-1 and upload to Supabase Storage.
 *
 * gpt-image-1 follows long descriptions far more faithfully than DALL-E 3
 * and does not hallucinate caption text on the canvas, which is critical
 * for the monster wizard where the description specifies size, anatomy,
 * and atmosphere precisely.
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

    const styleId = input.style && ENTITY_ART_STYLES[input.style]
      ? input.style
      : DEFAULT_STYLE_BY_TYPE[input.type]
    const stylePrompt = ENTITY_ART_STYLES[styleId]

    const compositionByType: Record<EntityType, string> = {
      character: 'Single figure portrait, full body or chest-up, clearly framed, fantasy environment behind.',
      location: 'Wide environmental establishing shot, atmospheric perspective, no figures unless described.',
      creature: 'Single creature portrait, full body, three-quarter angle, environment readable but secondary.',
      monster:
        'Single creature subject, full body in frame, three-quarter angle, scale and anatomy must match the description exactly. Environment should be atmospheric but secondary to the creature.',
      artifact:
        'Centered object study of a single artifact, three-quarter angle, soft directional lighting against a moody backdrop, no figures.',
      faction:
        'Iconic group composition — a banner, sigil, or representative gathering of members in their environment, evoking the faction\'s identity.',
      event:
        'Cinematic moment-of-event composition, dynamic action or aftermath, atmospheric lighting that conveys scale and consequence.',
      concept:
        'Abstract evocative illustration that visualises the idea symbolically — no literal figures unless described, dreamlike and atmospheric.',
    }

    const safeDescription = input.description.slice(0, 1500).trim()

    // Description-led prompt. The description is the source of truth — style
    // and composition are constraints, not subject matter. We deliberately
    // omit the entity name from the prompt body for monsters so the model
    // does not try to render the name as a caption.
    const promptParts: string[] = [
      'Concept art illustration. The image must accurately depict the subject described below — anatomy, scale, proportions, color, and described features must match the description.',
      `Subject description: ${safeDescription}`,
    ]
    if (input.customDetails?.trim()) {
      promptParts.push(`Additional details: ${input.customDetails.trim()}`)
    }
    promptParts.push(`Composition: ${compositionByType[input.type]}`)
    promptParts.push(`Style: ${stylePrompt}.`)
    promptParts.push(
      'Strictly no text, no letters, no words, no captions, no titles, no labels, no signatures, no watermarks, no logos, no UI elements, no borders or frames. Pure illustration only.'
    )

    const prompt = promptParts.join('\n\n')

    let response
    try {
      response = await getOpenAIClient().images.generate({
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'medium',
      })
    } catch (err: unknown) {
      const e = err as { status?: number; code?: string; message?: string }
      console.error('gpt-image-1 error:', e?.message || err)
      const isPolicy =
        e?.code === 'content_policy_violation' ||
        /content[_ ]policy|safety system|moderation/i.test(e?.message || '')
      return {
        success: false,
        error: isPolicy
          ? 'The image service rejected this description. Try softening graphic or violent wording in the description and regenerate.'
          : e?.message || 'Failed to generate image. Please try again.',
      }
    }

    // gpt-image-1 returns base64-encoded PNG in `b64_json`.
    const b64 = response.data?.[0]?.b64_json
    const tempUrl = response.data?.[0]?.url
    let imageBuffer: ArrayBuffer
    if (b64) {
      imageBuffer = Buffer.from(b64, 'base64').buffer.slice(0) as ArrayBuffer
    } else if (tempUrl) {
      const imageResponse = await fetch(tempUrl)
      if (!imageResponse.ok) {
        return { success: false, error: 'Failed to download generated image' }
      }
      imageBuffer = await imageResponse.arrayBuffer()
    } else {
      return { success: false, error: 'No image was generated' }
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}/${input.type}-${Date.now()}.png`

    const { error: uploadError } = await supabase.storage
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

    // Creators can edit their own entities at any status. Canonical entities
    // remain editable by their author so they can refine descriptions and
    // refresh images post-approval; admins control promotion/demotion.
    //
    // RLS on canon_entities only permits creators to UPDATE rows whose
    // status is 'draft'. To allow creators to edit their proposed/canonical
    // entries (after we've manually verified ownership above) we route the
    // write through the service-role admin client. If the service role key
    // is unavailable we fall back to the user-scoped client, which still
    // works for drafts.
    const adminClient = createAdminClient()
    const writeClient = adminClient ?? supabase

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (writeClient as any)
      .from('canon_entities')
      .update({
        name: input.name,
        description: input.description,
        extended_lore: {
          tagline: input.tagline,
          image_url: input.imageUrl || null,
          is_user_created: true,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .eq('created_by', user.id)

    if (updateError) {
      console.error('Update entity error:', updateError)
      return { success: false, error: 'Failed to update entity' }
    }

    revalidatePath('/roster')
    revalidatePath(`/create`)
    revalidatePath('/explore')
    revalidatePath(`/explore/${input.id}`)

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
  /**
   * Optional. If provided, the existing canon_entities row will be updated
   * (converted from story → campaign) instead of creating a new entity.
   * The user must own this entity.
   */
  sourceEntityId?: string
}

/**
 * List user-created Story Monsters — i.e. canon_entities of type='monster'
 * created by the current user that do NOT yet have a monster_stats stat block.
 * Used by the Campaign Monster wizard to "load / convert" a story monster.
 */
export async function getUserStoryMonsters(): Promise<{
  success: boolean
  monsters?: Array<{
    id: string
    name: string
    tagline: string
    description: string | null
    imageUrl: string | null
    createdAt: string
  }>
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in' }
    }

    type Row = {
      id: string
      name: string
      description: string | null
      extended_lore: Record<string, unknown> | null
      created_at: string
    }

    const { data, error } = await supabase
      .from('canon_entities')
      .select('id, name, description, extended_lore, created_at')
      .eq('created_by', user.id)
      .eq('type', 'monster')
      .order('created_at', { ascending: false }) as { data: Row[] | null; error: Error | null }

    if (error) {
      console.error('Get story monsters error:', error)
      return { success: false, error: 'Failed to load monsters' }
    }

    // Filter out monsters that already have a campaign stat block
    const monsters = (data || [])
      .filter((row) => {
        const lore = row.extended_lore || {}
        return !lore.monster_stats
      })
      .map((row) => {
        const lore = row.extended_lore || {}
        return {
          id: row.id,
          name: row.name,
          tagline: (lore.tagline as string) || '',
          description: row.description,
          imageUrl: (lore.image_url as string | null) || null,
          createdAt: row.created_at,
        }
      })

    return { success: true, monsters }
  } catch (error) {
    console.error('Error listing story monsters:', error)
    return { success: false, error: 'Failed to load monsters. Please try again.' }
  }
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

    const extendedLore = {
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
    }

    const baseMetadata = {
      created_via: 'campaign_monster_wizard',
      monster_purpose: 'campaign',
      region_id: stats.regionId,
      is_one_off: stats.isOneOff,
    }

    // ─── CONVERT MODE: update an existing Story Monster in place ───
    if (input.sourceEntityId) {
      // Verify ownership and that it's actually a monster
      const { data: existing, error: fetchErr } = await supabase
        .from('canon_entities')
        .select('id, type, created_by, metadata')
        .eq('id', input.sourceEntityId)
        .single() as {
          data: { id: string; type: string; created_by: string; metadata: Record<string, unknown> | null } | null
          error: Error | null
        }

      if (fetchErr || !existing) {
        return { success: false, error: 'Source monster not found' }
      }
      if (existing.created_by !== user.id) {
        return { success: false, error: 'You can only convert your own monsters' }
      }
      if (existing.type !== 'monster') {
        return { success: false, error: 'Source entity is not a monster' }
      }

      const mergedMetadata = {
        ...(existing.metadata || {}),
        ...baseMetadata,
        converted_from_story: true,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase
        .from('canon_entities') as any)
        .update({
          name: input.name,
          slug,
          description: input.description,
          extended_lore: extendedLore,
          metadata: mergedMetadata,
        })
        .eq('id', input.sourceEntityId)
        .select('id, slug')
        .single()

      if (error) {
        console.error('Convert story monster error:', error)
        const errorMessage = error.code === '42501'
          ? 'Permission denied - please contact support'
          : error.message || 'Failed to convert monster'
        return { success: false, error: errorMessage }
      }

      revalidatePath('/roster')
      revalidatePath('/create')
      revalidatePath(`/explore/${data.id}`)

      return { success: true, entityId: data.id, slug: data.slug }
    }

    // ─── CREATE MODE: insert a brand new campaign monster ───
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
        extended_lore: extendedLore,
        metadata: baseMetadata,
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
