// ═══════════════════════════════════════════════════════════
// ElevenLabs Voice Library - List available voices
// GET /api/elevenlabs/voices
// ═══════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { listVoices, EVERLOOP_VOICE_PRESETS } from '@/lib/elevenlabs'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const voices = await listVoices()
    return NextResponse.json({
      presets: Object.entries(EVERLOOP_VOICE_PRESETS).map(([key, val]) => ({
        key,
        voiceId: val.voiceId,
        modelId: val.modelId,
      })),
      library: voices,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch voices'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
