/**
 * Freesound search proxy.
 *
 * GET /api/media/freesound/search?q=tavern&page=1
 *
 * Returns lightweight result rows with preview MP3 URLs we can stream
 * directly in the browser. Requires FREESOUND_API_KEY env var
 * (free token from https://freesound.org/apiv2/apply/).
 *
 * If the key is missing, returns 503 with a structured `{ error, hint }`
 * so the UI can show a helpful message rather than failing silently.
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

interface FreesoundResult {
  id: number
  name: string
  username: string
  duration: number
  license: string
  previews?: { 'preview-hq-mp3'?: string; 'preview-lq-mp3'?: string }
  tags?: string[]
}

interface FreesoundResponse {
  count: number
  results: FreesoundResult[]
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.FREESOUND_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Freesound is not configured', hint: 'Set FREESOUND_API_KEY in .env.local (free token at freesound.org/apiv2/apply).' },
      { status: 503 },
    )
  }

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') ?? '').trim()
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const pageSize = 15

  if (!q) return NextResponse.json({ count: 0, results: [] })

  const url = new URL('https://freesound.org/apiv2/search/text/')
  url.searchParams.set('query', q)
  url.searchParams.set('page', String(page))
  url.searchParams.set('page_size', String(pageSize))
  url.searchParams.set('fields', 'id,name,username,duration,license,previews,tags')
  url.searchParams.set('token', apiKey)

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 60 } })
    if (!res.ok) {
      return NextResponse.json(
        { error: `Freesound API returned ${res.status}`, hint: 'Check your FREESOUND_API_KEY.' },
        { status: 502 },
      )
    }
    const data = (await res.json()) as FreesoundResponse
    const results = (data.results ?? []).map(r => ({
      id: r.id,
      title: r.name,
      author: r.username,
      durationSec: r.duration,
      license: r.license,
      previewUrl: r.previews?.['preview-hq-mp3'] ?? r.previews?.['preview-lq-mp3'] ?? null,
      tags: r.tags ?? [],
      pageUrl: `https://freesound.org/s/${r.id}/`,
    })).filter(r => r.previewUrl)
    return NextResponse.json({ count: data.count, results })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Freesound request failed', hint: msg }, { status: 502 })
  }
}
