import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRegionById } from '@/lib/data/regions'

export const dynamic = 'force-dynamic'

/**
 * GET /api/map/regions/[regionId]/label-overrides
 * Returns admin-edited (x, z) positions for static map labels.
 * Public — readable by anon. Mutations go through /api/admin/map-maker.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ regionId: string }> }
) {
  const { regionId } = await params

  if (!getRegionById(regionId)) {
    return NextResponse.json({ error: 'Region not found' }, { status: 404 })
  }

  const supabase = await createClient()
  const { data, error } = (await supabase
    .from('map_label_overrides')
    .select('label_name, x, z')
    .eq('region_id', regionId)) as {
      data: Array<{ label_name: string; x: number; z: number }> | null
      error: { message: string } | null
    }

  if (error) {
    console.error('map_label_overrides fetch error:', error)
    return NextResponse.json({ overrides: {} })
  }

  const overrides: Record<string, { x: number; z: number }> = {}
  for (const row of data ?? []) {
    overrides[row.label_name] = {
      x: Number(row.x),
      z: Number(row.z),
    }
  }

  return NextResponse.json({ overrides })
}
