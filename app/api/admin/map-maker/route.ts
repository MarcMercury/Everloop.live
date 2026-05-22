import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getRegionById } from '@/lib/data/regions'

export const dynamic = 'force-dynamic'

interface SavePayload {
  regionId: string
  /** Static label updates: name -> coords (percentage 0-100) */
  labels?: Array<{ name: string; x: number; z: number }>
  /** Canon entity updates: id -> coords */
  entities?: Array<{ id: string; x: number; z: number }>
}

function clamp(n: number): number {
  if (!Number.isFinite(n)) return 50
  return Math.max(0, Math.min(100, Number(n)))
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin_check')
  if (rpcError || !isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  let payload: SavePayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { regionId, labels = [], entities = [] } = payload
  if (!regionId || !getRegionById(regionId)) {
    return NextResponse.json({ error: 'Invalid regionId' }, { status: 400 })
  }

  const admin = createAdminClient() ?? supabase

  // ----- Upsert static label overrides -----
  if (labels.length > 0) {
    const rows = labels
      .filter((l) => l && typeof l.name === 'string' && l.name.length > 0)
      .map((l) => ({
        region_id: regionId,
        label_name: l.name,
        x: clamp(l.x),
        z: clamp(l.z),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }))

    if (rows.length > 0) {
      // map_label_overrides is not in the generated Supabase types yet — cast.
      const { data: savedRows, error } = await (admin.from('map_label_overrides') as unknown as {
        upsert: (rows: unknown, opts: { onConflict: string }) => {
          select: () => Promise<{ data: unknown[] | null; error: { message: string } | null }>
        }
      }).upsert(rows, { onConflict: 'region_id,label_name' }).select()
      if (error) {
        console.error('label override upsert failed:', error)
        return NextResponse.json(
          { error: 'Failed to save label overrides', detail: error.message },
          { status: 500 }
        )
      }
      if (!savedRows || savedRows.length !== rows.length) {
        console.error(
          '[map-maker] upsert wrote fewer rows than requested',
          { requested: rows.length, saved: savedRows?.length ?? 0 }
        )
        return NextResponse.json(
          {
            error: 'Save partially failed',
            detail: `Requested ${rows.length} label overrides but only ${savedRows?.length ?? 0} persisted. ` +
              `This usually means the PostgREST schema cache is stale — refresh it and retry.`,
          },
          { status: 500 }
        )
      }
    }
  }

  // ----- Update canon entity coordinates in metadata -----
  for (const entity of entities) {
    if (!entity?.id) continue

    const { data: existing, error: fetchErr } = (await admin
      .from('canon_entities')
      .select('metadata')
      .eq('id', entity.id)
      .single()) as {
        data: { metadata: Record<string, unknown> | null } | null
        error: { message: string } | null
      }

    if (fetchErr || !existing) {
      console.error('entity fetch failed:', fetchErr)
      continue
    }

    const nextMeta = {
      ...(existing.metadata ?? {}),
      region: regionId,
      map_x: clamp(entity.x),
      map_z: clamp(entity.z),
    }

    const { error: updateErr } = await (admin.from('canon_entities') as unknown as {
      update: (patch: unknown) => { eq: (col: string, val: string) => Promise<{ error: { message: string } | null }> }
    }).update({ metadata: nextMeta }).eq('id', entity.id)

    if (updateErr) {
      console.error('entity update failed:', updateErr)
      return NextResponse.json(
        { error: 'Failed to update entity position', detail: updateErr.message },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ ok: true, savedLabels: labels.length, savedEntities: entities.length })
}

/**
 * DELETE /api/admin/map-maker?regionId=...&labelName=...
 * Removes a single label override so the static code default takes effect again.
 */
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin_check')
  if (rpcError || !isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const url = new URL(request.url)
  const regionId = url.searchParams.get('regionId')
  const labelName = url.searchParams.get('labelName')
  if (!regionId || !labelName) {
    return NextResponse.json({ error: 'regionId and labelName are required' }, { status: 400 })
  }

  const admin = createAdminClient() ?? supabase
  const { error } = await (admin.from('map_label_overrides') as unknown as {
    delete: () => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
      }
    }
  }).delete().eq('region_id', regionId).eq('label_name', labelName)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
