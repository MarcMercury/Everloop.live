// ═══════════════════════════════════════════════════════════
// ElevenLabs TTS - Narrate story excerpts, NPC dialogue, DM voice
// POST /api/elevenlabs/tts
// ═══════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { textToSpeech, textToSpeechStream, VoicePresetKey, EVERLOOP_VOICE_PRESETS } from '@/lib/elevenlabs'

export const runtime = 'nodejs'

const MAX_TEXT_LENGTH = 5000

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { text, preset, voiceId, stream: useStream } = body as {
    text?: string
    preset?: VoicePresetKey
    voiceId?: string
    stream?: boolean
  }

  if (!text || text.length === 0) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` },
      { status: 400 }
    )
  }

  if (!preset && !voiceId) {
    return NextResponse.json(
      { error: 'Either preset or voiceId is required' },
      { status: 400 }
    )
  }

  if (preset && !(preset in EVERLOOP_VOICE_PRESETS)) {
    return NextResponse.json(
      { error: `Invalid preset. Options: ${Object.keys(EVERLOOP_VOICE_PRESETS).join(', ')}` },
      { status: 400 }
    )
  }

  try {
    if (useStream) {
      const audioStream = await textToSpeechStream({ text, preset, voiceId })
      return new Response(audioStream, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Transfer-Encoding': 'chunked',
        },
      })
    }

    const audioBuffer = await textToSpeech({ text, preset, voiceId })
    return new Response(new Uint8Array(audioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.length),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'TTS generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
