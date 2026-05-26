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
 * POST /api/quests/[id]/scene-image
 *
 * Body: { sceneId: string }
 *
 * Generates an atmospheric scene illustration (NOT a tactical map) from the
 * scene's full text — title, description, narration, feeling/reveal/choice,
 * sensory anchors, mood, scene_type, and linked entities (so a monster from
 * the Everloop Archive can be depicted). Saves the result to Supabase Storage
 * and persists the public URL on `quest_scenes.image_url`.
 *
 * Auth: quest owner (dm_id) only.
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
  if (!sceneId) {
    return NextResponse.json({ error: 'sceneId is required' }, { status: 400 })
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  const questQuery = supabase.from('quests').select('id, dm_id, title, setting_name, tone')
  const { data: questRow } = await (isUuid ? questQuery.eq('id', id) : questQuery.eq('slug', id)).maybeSingle()
  const quest = (questRow ?? null) as {
    id: string
    dm_id: string
    title: string
    setting_name?: string | null
    tone?: string | null
  } | null

  if (!quest) {
    return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
  }
  if (quest.dm_id !== user.id) {
    return NextResponse.json({ error: 'Only the quest owner can generate scene images' }, { status: 403 })
  }

  // Pull the scene's narrative text so we can craft a rich prompt.
  const { data: sceneRow } = await supabase
    .from('quest_scenes')
    .select(
      'title, description, narration, dm_notes, scene_type, mood, feeling, reveal, choice, sensory_anchors, pacing, linked_entities',
    )
    .eq('id', sceneId)
    .eq('quest_id', quest.id)
    .maybeSingle()

  const scene = (sceneRow ?? null) as {
    title: string | null
    description: string | null
    narration: string | null
    dm_notes: string | null
    scene_type: string | null
    mood: string | null
    feeling: string | null
    reveal: string | null
    choice: string | null
    sensory_anchors: Array<{ label?: string }> | null
    pacing: string | null
    linked_entities: string[] | null
  } | null

  if (!scene) {
    return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
  }

  // Optional: resolve linked entities (monsters, NPCs, locations) so a creature
  // referenced in the Archive can be depicted. Failures are non-fatal.
  let entityHints: string[] = []
  if (scene.linked_entities && scene.linked_entities.length > 0) {
    try {
      const { data: ents } = await supabase
        .from('canon_entities')
        .select('name, entity_type, description')
        .in('id', scene.linked_entities.slice(0, 6))
      if (Array.isArray(ents)) {
        entityHints = (ents as Array<{ name?: string; entity_type?: string; description?: string }>)
          .map((e) =>
            [e.name, e.entity_type ? `(${e.entity_type})` : '', e.description ? `— ${e.description.slice(0, 220)}` : '']
              .filter(Boolean)
              .join(' '),
          )
          .filter(Boolean)
      }
    } catch {
      // ignore lookup failures
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

  const sensory = (scene.sensory_anchors ?? [])
    .map((a) => a?.label)
    .filter((s): s is string => Boolean(s && s.trim()))
  const subjectHint = pickSubjectHint(scene.scene_type)

  const prompt = [
    `Cinematic fantasy illustration for a D&D 5e ${scene.scene_type ?? 'narrative'} scene titled "${scene.title ?? 'Untitled'}".`,
    scene.description ? `Scene summary: ${scene.description.slice(0, 400)}` : '',
    scene.narration ? `Atmosphere narration: ${scene.narration.slice(0, 500)}` : '',
    scene.feeling ? `Emotional target: ${scene.feeling}.` : '',
    scene.reveal ? `Hidden truth surfacing: ${scene.reveal}.` : '',
    scene.choice ? `Player dilemma: ${scene.choice}.` : '',
    sensory.length ? `Sensory anchors: ${sensory.join(', ')}.` : '',
    scene.mood ? `Mood: ${scene.mood}.` : '',
    scene.pacing ? `Pacing: ${scene.pacing}.` : '',
    entityHints.length ? `Featured subjects from the Everloop Archive: ${entityHints.join(' | ')}.` : '',
    `Composition: ${subjectHint}`,
    'Painterly hand-illustrated style, dramatic lighting, evocative atmosphere, no text or UI elements, no watermarks.',
    'Aspect 1:1, focal subject clearly visible, suitable as a tabletop scene-setting visual.',
  ]
    .filter(Boolean)
    .join(' ')

  try {
    const { buffer: imageBuffer, provider, attempts } = await generateImage({
      prompt,
      size: 1024,
      quality: 'medium',
    })

    const fileName = `${user.id}/quest-${quest.id}/scene-image-${sceneId}-${Date.now()}.png`
    const { error: uploadError } = await supabase.storage
      .from('entity-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      })
    if (uploadError) {
      console.error('Scene image upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to save scene image' }, { status: 500 })
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from('entity-images').getPublicUrl(fileName)

    // Persist on the scene. Cast through any because the generated Database
    // type does not yet expose quest_scenes.image_url.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scenes = supabase.from('quest_scenes') as any
    await scenes
      .update({ image_url: publicUrl })
      .eq('id', sceneId)
      .eq('quest_id', quest.id)

    return NextResponse.json({ imageUrl: publicUrl, provider, attempts })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Scene image generation failed'
    console.error('Scene image generation error:', message)
    return NextResponse.json(
      {
        error: message,
        providersConfigured: configuredImageProviders(),
        hint:
          'If OpenAI fails with token/verification errors, configure GEMINI_API_KEY or STABILITY_API_KEY for automatic fallback.',
      },
      { status: 500 },
    )
  }
}

function pickSubjectHint(sceneType: string | null): string {
  switch (sceneType) {
    case 'combat':
      return 'show the central threat or creature engaged with the party at a dramatic moment.'
    case 'boss':
      return 'a portrait/establishing shot of the boss antagonist in their domain, oppressive and iconic.'
    case 'social':
      return 'character-focused composition of the key NPC(s) in their environment, capturing emotion and intent.'
    case 'exploration':
      return 'establishing shot of the location with a sense of scale, mystery, and travel.'
    case 'puzzle':
      return 'the puzzle, riddle, or arcane mechanism as the focal subject, with hints to its solution embedded visually.'
    case 'rest':
      return 'an intimate, warm camp/sanctuary scene that conveys relief and reflection.'
    case 'event':
      return 'a single iconic moment capturing the event\'s turning point.'
    case 'narrative':
    default:
      return 'an atmospheric establishing shot that sets tone and place, character-led when possible.'
  }
}
