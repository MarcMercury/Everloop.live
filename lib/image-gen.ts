/**
 * Multi-provider image generation with automatic fallback.
 *
 * Tries providers in order and returns the first successful render.
 * Per-provider errors are collected and surfaced together so the caller
 * knows exactly why each one was skipped (key missing, quota, verification,
 * etc.) instead of a single opaque "Token limit reached" string.
 *
 * Provider order: OpenAI → Gemini (Imagen 3) → Stability AI.
 *
 * Environment variables consulted:
 *  - OPENAI_API_KEY
 *  - GEMINI_API_KEY (or GOOGLE_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY)
 *  - STABILITY_API_KEY
 *
 * Anthropic / Claude is intentionally not in the chain — Claude has no
 * native image-generation endpoint (only vision input).
 */

import OpenAI from 'openai'

export type ImageProvider = 'openai' | 'gemini' | 'stability'

export interface GenerateImageOptions {
  prompt: string
  /** Only 1024 supported for OpenAI; others ignored. */
  size?: 1024 | 2048
  /** Forced provider order. Defaults to ['openai', 'gemini', 'stability']. */
  providers?: ImageProvider[]
  /** Quality hint passed to providers that honor it. */
  quality?: 'low' | 'medium' | 'high'
}

export interface GenerateImageResult {
  buffer: Buffer
  contentType: 'image/png' | 'image/jpeg'
  provider: ImageProvider
  /** Diagnostic notes from any providers that were skipped or failed. */
  attempts: Array<{ provider: ImageProvider; ok: boolean; error?: string }>
}

const DEFAULT_ORDER: ImageProvider[] = ['openai', 'gemini', 'stability']

function geminiKey(): string | null {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    null
  )
}

/** Try OpenAI gpt-image-1. */
async function tryOpenAI(opts: GenerateImageOptions): Promise<Buffer> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set')
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  // Only allow valid OpenAI sizes. For square, only 1024x1024 is supported.
  const size: '1024x1024' = '1024x1024'
  const response = await client.images.generate({
    model: 'gpt-image-1',
    prompt: opts.prompt,
    n: 1,
    size,
    quality: opts.quality ?? 'medium',
  })
  const b64 = response.data?.[0]?.b64_json
  const url = response.data?.[0]?.url
  if (b64) return Buffer.from(b64, 'base64')
  if (url) {
    const r = await fetch(url)
    if (!r.ok) throw new Error(`download failed (${r.status})`)
    return Buffer.from(await r.arrayBuffer())
  }
  throw new Error('OpenAI returned no image data')
}

/** Try Google Gemini Imagen 3 via the public Generative Language API. */
async function tryGemini(opts: GenerateImageOptions): Promise<Buffer> {
  const key = geminiKey()
  if (!key) throw new Error('GEMINI_API_KEY not set')

  // imagen-3.0-generate-002 is the current Imagen model exposed through the
  // public generativelanguage endpoint. It supports the :predict method.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${encodeURIComponent(
    key,
  )}`
  const body = {
    instances: [{ prompt: opts.prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: '1:1',
      // Imagen API rejects explicit imagery by default; leave at standard.
      personGeneration: 'allow_adult',
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let parsed = ''
    try {
      const j = JSON.parse(text) as { error?: { message?: string } }
      parsed = j?.error?.message ?? ''
    } catch {
      /* ignore */
    }
    throw new Error(`Gemini Imagen HTTP ${res.status}: ${parsed || text.slice(0, 200)}`)
  }
  const data = (await res.json()) as {
    predictions?: Array<{ bytesBase64Encoded?: string; mimeType?: string }>
  }
  const first = data.predictions?.[0]
  if (!first?.bytesBase64Encoded) {
    throw new Error('Gemini Imagen returned no image bytes')
  }
  return Buffer.from(first.bytesBase64Encoded, 'base64')
}

/** Try Stability AI (Stable Image Core). */
async function tryStability(opts: GenerateImageOptions): Promise<Buffer> {
  const key = process.env.STABILITY_API_KEY
  if (!key) throw new Error('STABILITY_API_KEY not set')

  const form = new FormData()
  form.append('prompt', opts.prompt)
  form.append('output_format', 'png')
  form.append('aspect_ratio', '1:1')

  const res = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: 'image/*',
    },
    body: form,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Stability HTTP ${res.status}: ${text.slice(0, 200)}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

const RUNNERS: Record<ImageProvider, (o: GenerateImageOptions) => Promise<Buffer>> = {
  openai: tryOpenAI,
  gemini: tryGemini,
  stability: tryStability,
}

/**
 * Generate an image trying each configured provider in turn.
 *
 * Throws an aggregated Error if every provider fails or is unconfigured.
 */
export async function generateImage(
  opts: GenerateImageOptions,
): Promise<GenerateImageResult> {
  const order = opts.providers ?? DEFAULT_ORDER
  const attempts: GenerateImageResult['attempts'] = []

  for (const provider of order) {
    const runner = RUNNERS[provider]
    if (!runner) continue
    try {
      const buffer = await runner(opts)
      attempts.push({ provider, ok: true })
      return { buffer, contentType: 'image/png', provider, attempts }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      attempts.push({ provider, ok: false, error: message })
      // Only swallow errors that look recoverable via fallback. Auth/quota/
      // verification errors are all worth falling through on — we have no
      // reliable way to distinguish a transient OpenAI 500 from a hard cap,
      // and the user explicitly asked for fallback behavior, so try the next.
    }
  }

  const summary = attempts
    .map(a => `${a.provider}: ${a.ok ? 'ok' : a.error ?? 'unknown'}`)
    .join(' | ')
  throw new Error(`All image providers failed → ${summary || 'no providers configured'}`)
}

/** True if at least one image provider has credentials configured. */
export function hasAnyImageProvider(): boolean {
  return Boolean(process.env.OPENAI_API_KEY || geminiKey() || process.env.STABILITY_API_KEY)
}

/** List of providers that currently have credentials. */
export function configuredImageProviders(): ImageProvider[] {
  const out: ImageProvider[] = []
  if (process.env.OPENAI_API_KEY) out.push('openai')
  if (geminiKey()) out.push('gemini')
  if (process.env.STABILITY_API_KEY) out.push('stability')
  return out
}
