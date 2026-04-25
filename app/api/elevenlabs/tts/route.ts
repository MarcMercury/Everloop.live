// ═══════════════════════════════════════════════════════════
// ElevenLabs TTS - Narrate story excerpts, NPC dialogue, DM voice
// POST /api/elevenlabs/tts
// ═══════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { parseBody } from '@/lib/api/parse-body'
import { textToSpeech, textToSpeechStream, EVERLOOP_VOICE_PRESETS, type VoicePresetKey } from '@/lib/elevenlabs'

export const runtime = 'nodejs'

const MAX_TEXT_LENGTH = 5000

const PRESET_KEYS = Object.keys(EVERLOOP_VOICE_PRESETS) as [VoicePresetKey, ...VoicePresetKey[]]

const TtsSchema = z
  .object({
    text: z.string().min(1).max(MAX_TEXT_LENGTH),
    preset: z.enum(PRESET_KEYS).optional(),
    voiceId: z.string().min(1).optional(),
    stream: z.boolean().optional(),
  })
  .refine((d) => d.preset || d.voiceId, {
    message: 'Either preset or voiceId is required',
  })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = await parseBody(request, TtsSchema)
  if (!parsed.ok) return parsed.response
  const { text, preset, voiceId, stream: useStream } = parsed.data

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
