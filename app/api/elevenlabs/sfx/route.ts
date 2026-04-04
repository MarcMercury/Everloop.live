// ═══════════════════════════════════════════════════════════
// ElevenLabs Sound Effects - Scene ambience, combat SFX
// POST /api/elevenlabs/sfx
// ═══════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateSoundEffect, generateSceneAmbience } from '@/lib/elevenlabs'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { prompt, scene_type, mood, duration_seconds, prompt_influence } = body as {
    prompt?: string
    scene_type?: string
    mood?: string
    duration_seconds?: number
    prompt_influence?: number
  }

  // Two modes: direct prompt or scene-based generation
  if (!prompt && !(scene_type && mood)) {
    return NextResponse.json(
      { error: 'Either prompt or (scene_type + mood) is required' },
      { status: 400 }
    )
  }

  if (duration_seconds !== undefined && (duration_seconds < 0.1 || duration_seconds > 30)) {
    return NextResponse.json(
      { error: 'duration_seconds must be between 0.1 and 30' },
      { status: 400 }
    )
  }

  try {
    let audioBuffer: Buffer

    if (scene_type && mood) {
      audioBuffer = await generateSceneAmbience(scene_type, mood)
    } else {
      audioBuffer = await generateSoundEffect({
        text: prompt!,
        duration_seconds,
        prompt_influence,
      })
    }

    return new Response(new Uint8Array(audioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.length),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sound effect generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
