import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRegionById } from '@/lib/data/regions'

export const dynamic = 'force-dynamic'

interface CanonEntityRow {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  stability_rating: number
  tags: string[]
  metadata: Record<string, unknown> | null
  extended_lore: Record<string, unknown> | null
  created_at: string
}

/**
 * GET /api/map/regions/[regionId]/locations
 * Returns canonical entities assigned to a specific region.
 * Entities are matched by metadata.region or by tag matching the region id.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ regionId: string }> }
) {
  const { regionId } = await params
  const region = getRegionById(regionId)

  if (!region) {
    return NextResponse.json({ error: 'Region not found' }, { status: 404 })
  }

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
      extended_lore,
      created_at
    `)
    .eq('status', 'canonical')
    .order('name', { ascending: true })

  if (error) {
    console.error('Region locations fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }

  const rows = (data ?? []) as unknown as CanonEntityRow[]

  // Filter entities that belong to this region:
  // 1. metadata.region matches the region id (authoritative)
  // 2. extended_lore.region matches the region id (authoritative — set by seed script)
  // 3. For entities without an explicit region, fall back to tag/description matching
  const regionName = region.name.toLowerCase().replace(/^the /, '')
  const filtered = rows.filter((entity) => {
    const meta = entity.metadata
    const extLore = entity.extended_lore as Record<string, unknown> | null
    // If the entity has an explicit region, only match on exact region
    if (meta?.region) return meta.region === regionId
    if (extLore?.region) return extLore.region === regionId
    // Fallback: tags include the region id or region name
    if (entity.tags?.some((tag: string) => {
      const lower = tag.toLowerCase()
      return lower === regionId || lower === regionName || lower.includes(regionId)
    })) return true
    // Fallback: description mentions the region
    if (entity.description?.toLowerCase().includes(regionId)) return true
    if (entity.description?.toLowerCase().includes(regionName)) return true
    return false
  })

  const locations = filtered.map((entity) => {
    const coords = entity.metadata
    const hasCoords = coords?.map_x !== undefined && coords?.map_z !== undefined

    const imageUrl =
      (entity.metadata?.image_url as string | undefined) ??
      (entity.extended_lore?.image_url as string | undefined) ??
      null

    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      type: entity.type,
      description: entity.description,
      stability: entity.stability_rating,
      tags: entity.tags,
      imageUrl,
      x: hasCoords ? Number(coords.map_x) : hashToCoord(entity.name, 0),
      z: hasCoords ? Number(coords.map_z) : hashToCoord(entity.name, 1),
      createdAt: entity.created_at,
    }
  })

  return NextResponse.json({ locations, region: { id: region.id, name: region.name } })
}

/** Simple string hash to generate deterministic coordinates in percentage [10, 90] */
function hashToCoord(str: string, seed: number): number {
  let hash = seed * 9973
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return 10 + ((((hash % 8000) + 8000) % 8000) / 8000) * 80
}
