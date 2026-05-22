import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

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
  const questQuery = supabase.from('campaigns').select('id, dm_id, title')
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
  if (sceneId) {
    const { data: sceneRow } = await supabase
      .from('campaign_scenes')
      .select('title, description, scene_type, mood')
      .eq('id', sceneId)
      .eq('campaign_id', quest.id)
      .maybeSingle()
    const scene = sceneRow as { title: string | null; description: string | null } | null
    if (scene) {
      sceneTitle = scene.title
      sceneDescription = scene.description
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const prompt = [
    `Design a ${style} for a D&D 5e quest scene.`,
    sceneTitle ? `Scene title: "${sceneTitle}".` : '',
    sceneDescription ? `Description: ${sceneDescription.slice(0, 400)}` : '',
    userPrompt ? `Additional direction: ${userPrompt}` : '',
    'Top-down perspective. Clear distinct terrain features, walls, doors, hazards, cover.',
    'Aged parchment background with subtle grid lines, hand-painted style.',
    'No text, no labels, no character tokens.',
    'Composition usable as a printed tactical map for tabletop play.',
  ]
    .filter(Boolean)
    .join(' ')

  try {
    const response = await client.images.generate({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'medium',
    })

    const b64 = response.data?.[0]?.b64_json
    const tempUrl = response.data?.[0]?.url
    let imageBuffer: ArrayBuffer
    if (b64) {
      imageBuffer = Buffer.from(b64, 'base64').buffer.slice(0) as ArrayBuffer
    } else if (tempUrl) {
      const r = await fetch(tempUrl)
      if (!r.ok) {
        return NextResponse.json({ error: 'Failed to download generated map' }, { status: 500 })
      }
      imageBuffer = await r.arrayBuffer()
    } else {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 })
    }

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
      const scenes = supabase.from('campaign_scenes') as any
      await scenes
        .update({ map_url: publicUrl })
        .eq('id', sceneId)
        .eq('campaign_id', quest.id)
    }

    return NextResponse.json({ mapUrl: publicUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Map generation failed'
    console.error('Quest map generation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
