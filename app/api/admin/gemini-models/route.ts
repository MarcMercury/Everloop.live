import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * GET /api/admin/gemini-models
 *
 * Lists every model visible to the server-side GEMINI_API_KEY, flagging
 * those that look image-capable. Useful when image generation falls back
 * to Gemini and every candidate 404s — this tells us exactly which model
 * names the key is allowed to call.
 *
 * Auth: requires a signed-in user. The response only contains public
 * Gemini model metadata (no key material), so user-level auth is
 * sufficient.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY
  if (!key) {
    return NextResponse.json(
      { error: 'No Gemini API key configured (GEMINI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY / GOOGLE_API_KEY)' },
      { status: 500 },
    )
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}&pageSize=200`
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return NextResponse.json(
      { error: `Gemini ListModels HTTP ${res.status}`, body: text.slice(0, 500) },
      { status: 500 },
    )
  }
  const data = (await res.json()) as {
    models?: Array<{
      name?: string
      displayName?: string
      supportedGenerationMethods?: string[]
    }>
  }
  const models = (data.models ?? []).map(m => {
    const name = m.name?.replace(/^models\//, '') ?? '(unknown)'
    const methods = m.supportedGenerationMethods ?? []
    const isImagey =
      /imagen|image-generation|flash-image|image-preview|nano-banana/i.test(name) ||
      methods.includes('predict')
    return {
      name,
      displayName: m.displayName ?? null,
      methods,
      imageCapable: isImagey,
    }
  })
  const imageCapable = models.filter(m => m.imageCapable)
  return NextResponse.json({
    total: models.length,
    imageCapableCount: imageCapable.length,
    imageCapable,
    all: models,
  })
}
