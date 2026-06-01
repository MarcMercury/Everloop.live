import { NextRequest, NextResponse } from 'next/server'
import { searchCreatures } from '@/lib/open5e'

export const runtime = 'nodejs'

/**
 * GET /api/library/creatures?q=&cr=&type=&ordering=
 * Thin Open5E proxy so client components can search SRD monsters without
 * shipping the API client to the browser.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.slice(0, 80) ?? undefined
  const cr = searchParams.get('cr') ?? undefined
  const type = searchParams.get('type') ?? undefined
  const ordering = searchParams.get('ordering') ?? undefined
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))

  try {
    const data = await searchCreatures({ search: q, cr, type, ordering, limit })
    return NextResponse.json({ results: data.results })
  } catch (err) {
    return NextResponse.json({ results: [], error: err instanceof Error ? err.message : 'unknown' }, { status: 500 })
  }
}
