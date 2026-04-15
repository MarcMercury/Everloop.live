import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CanonEntityRow {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  stability_rating: number
  tags: string[]
  metadata: Record<string, unknown> | null
  created_at: string
}

/**
 * GET /api/map/locations
 * Returns all canonical entities that should appear on the 3D world map.
 * Only 'canonical' status entities are visible — everything else is fog.
 */
export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('canon_entities')
    .select(`
      id,
      name,
      slug,
      type,
      description,
      stability_rating,
      tags,
      metadata,
      created_at
    `)
    .eq('status', 'canonical')
    .order('name', { ascending: true })

  if (error) {
    console.error('Map locations fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }

  const rows = (data ?? []) as unknown as CanonEntityRow[]

  // Transform entities into map-ready data with deterministic positions
  const locations = rows.map((entity) => {
    // Use metadata coordinates if available, otherwise generate from name hash
    const coords = entity.metadata
    const hasCoords = coords?.map_x !== undefined && coords?.map_z !== undefined

    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      type: entity.type,
      description: entity.description,
      stability: entity.stability_rating,
      tags: entity.tags,
      // Map position — deterministic from name if no coords stored
      x: hasCoords ? Number(coords.map_x) : hashToCoord(entity.name, 0),
      z: hasCoords ? Number(coords.map_z) : hashToCoord(entity.name, 1),
      elevation: hasCoords && coords.map_y !== undefined
        ? Number(coords.map_y)
        : getElevationForType(entity.type),
      createdAt: entity.created_at,
    }
  })

  return NextResponse.json({ locations }, {
    headers: {
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
    },
  })
}

/** Simple string hash to generate deterministic coordinates in range [-40, 40] */
function hashToCoord(str: string, seed: number): number {
  let hash = seed * 9973
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  // Map to range [-40, 40]
  return ((((hash % 8000) + 8000) % 8000) / 8000 - 0.5) * 80
}

/** Default elevation by entity type */
function getElevationForType(type: string): number {
  switch (type) {
    case 'location': return 1.5
    case 'character': return 0.8
    case 'artifact': return 2.0
    case 'faction': return 1.0
    case 'creature': return 0.6
    case 'event': return 3.0
    case 'concept': return 4.0
    default: return 1.0
  }
}
