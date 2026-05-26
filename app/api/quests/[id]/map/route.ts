import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import {
  configuredImageProviders,
  generateImage,
  hasAnyImageProvider,
} from '@/lib/image-gen'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * POST /api/quests/[id]/map
 *
 * Body: { sceneId?: string; prompt?: string; style?: string }
 *
 * Generates a tactical / atmospheric map for a quest scene using gpt-image-1,
 * uploads it to Supabase Storage (bucket: entity-images), and updates the
 * scene's `map_url` if a sceneId is provided. Returns the public URL.
 *
 * The Quest Builder calls this when the GM clicks "Generate Map" on a scene.
 *
 * Auth: any signed-in user who owns the quest (dm_id) may call it. We
 * intentionally keep the model and size modest (gpt-image-1 / 1024x1024 /
 * medium) so map generation is affordable.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({} as Record<string, unknown>))
  const sceneId = typeof body.sceneId === 'string' ? body.sceneId : null
  const userPrompt = typeof body.prompt === 'string' ? body.prompt.slice(0, 800) : ''
  const style = typeof body.style === 'string' ? body.style.slice(0, 120) : 'tactical fantasy battle map'

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const questQuery = supabase.from('quests').select('id, dm_id, title')
  const { data: questRow } = await (isUuid ? questQuery.eq('id', id) : questQuery.eq('slug', id)).maybeSingle()
  const quest = (questRow ?? null) as { id: string; dm_id: string; title: string } | null

  if (!quest) {
    return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
  }
  if (quest.dm_id !== user.id) {
    return NextResponse.json({ error: 'Only the quest owner can generate maps' }, { status: 403 })
  }

  // If a scene id is provided, pull its title/description to enrich the prompt.
  let sceneTitle: string | null = null
  let sceneDescription: string | null = null
  let sceneLayout: string | null = null
  if (sceneId) {
    const { data: sceneRow } = await supabase
      .from('quest_scenes')
      .select('title, description, scene_type, mood, layout_description')
      .eq('id', sceneId)
      .eq('quest_id', quest.id)
      .maybeSingle()
    const scene = sceneRow as { title: string | null; description: string | null; layout_description: string | null } | null
    if (scene) {
      sceneTitle = scene.title
      sceneDescription = scene.description
      sceneLayout = scene.layout_description
    }
  }

  if (!hasAnyImageProvider()) {
    return NextResponse.json(
      {
        error:
          'No image-generation provider is configured. Set OPENAI_API_KEY, GEMINI_API_KEY, or STABILITY_API_KEY.',
      },
      { status: 500 },
    )
  }

  // Layout description (if present) is the AUTHORITATIVE source for map
  // geometry / scale / features. When provided we lead with it and keep
  // stylistic guidance terse so the model interprets the architecture
  // literally instead of defaulting to generic battlemap tropes.
  const hasLayout = Boolean(sceneLayout && sceneLayout.trim())
  // gpt-image-1 accepts very long prompts; previous 1200-char cap was
  // dropping critical rooms from detailed tavern/dungeon layouts.
  const LAYOUT_CHAR_BUDGET = 6000
  const layoutText = (hasLayout ? sceneLayout! : sceneDescription || '').slice(0, LAYOUT_CHAR_BUDGET)

  let prompt: string
  if (hasLayout) {
    // Layout-first prompt: the architectural spec leads, style is a footer.
    prompt = [
      'Top-down architectural floor plan / tactical battlemap of the following location. Interpret the layout LITERALLY: respect the stated overall footprint, room dimensions, wall positions, doors, windows, furniture placement, and scale. Do not invent extra rooms, courtyards, palisades, or features that are not described. Do not make the building circular if it is described as rectangular.',
      sceneTitle ? `Location: "${sceneTitle}".` : '',
      '',
      'LAYOUT SPECIFICATION:',
      layoutText,
      '',
      userPrompt ? `Additional direction: ${userPrompt}` : '',
      `Render as a ${style}: bird\u2019s-eye orthographic view, walls and furniture clearly visible from above, consistent scale across the whole image, faint 5 ft square grid overlay, muted natural colors, hand-drawn ink-and-wash style on aged parchment. No text, no labels, no character tokens, no compass rose.`,
    ]
      .filter(Boolean)
      .join('\n')
  } else {
    // Fallback (no dedicated layout): old behavior, kept compact.
    prompt = [
      `Design a ${style} for a D&D 5e quest scene.`,
      sceneTitle ? `Scene title: "${sceneTitle}".` : '',
      layoutText ? `Description: ${layoutText.slice(0, 400)}` : '',
      userPrompt ? `Additional direction: ${userPrompt}` : '',
      'Top-down perspective. Clear distinct terrain features, walls, doors, hazards, cover.',
      'Aged parchment background with subtle grid lines, hand-painted style.',
      'No text, no labels, no character tokens.',
      'Composition usable as a printed tactical map for tabletop play.',
    ]
      .filter(Boolean)
      .join(' ')
  }

  try {
    const { buffer: imageBuffer, provider, attempts } = await generateImage({
      prompt,
      size: 1024,
      quality: 'medium',
    })

    const fileName = `${user.id}/quest-${quest.id}/map-${sceneId ?? 'scene'}-${Date.now()}.png`
    const { error: uploadError } = await supabase.storage
      .from('entity-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      })
    if (uploadError) {
      console.error('Quest map upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to save map image' }, { status: 500 })
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from('entity-images').getPublicUrl(fileName)

    // Persist on the scene if applicable. Cast through unknown because the
    // generated Database type does not currently expose campaign_scenes.map_url.
    if (sceneId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scenes = supabase.from('quest_scenes') as any
      await scenes
        .update({ map_url: publicUrl })
        .eq('id', sceneId)
        .eq('quest_id', quest.id)
    }

    return NextResponse.json({ mapUrl: publicUrl, provider, attempts })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Map generation failed'
    console.error('Quest map generation error:', message)
    return NextResponse.json(
      {
        error: message,
        providersConfigured: configuredImageProviders(),
        hint:
          'OpenAI returns "Token limit reached" when the project-level usage cap is hit or the org is not verified for gpt-image-1. Configure GEMINI_API_KEY or STABILITY_API_KEY to enable automatic fallback.',
      },
      { status: 500 },
    )
  }
}
