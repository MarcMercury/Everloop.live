/**
 * POST /api/sessions/captures
 * Form-data: image (file, jpeg/png/webp), quest_id, session_id?, scene_id?, caption?
 *
 * Auth: only the DM of the quest may upload (RLS enforces this on the row too).
 * Stores the image in the `session-captures` storage bucket via service role
 * and inserts a row in `session_captures`.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })

  const file = form.get('image') as File | null
  const questId = form.get('quest_id') as string | null
  const sessionId = (form.get('session_id') as string | null) || null
  const sceneId = (form.get('scene_id') as string | null) || null
  const caption = (form.get('caption') as string | null) || null

  if (!file) return NextResponse.json({ error: 'Missing image' }, { status: 400 })
  if (!questId) return NextResponse.json({ error: 'Missing quest_id' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Image too large (max 10MB)' }, { status: 413 })
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 415 })
  }

  // Verify caller is the DM of this quest.
  const { data: quest } = await supabase
    .from('quests')
    .select('id, dm_id')
    .eq('id', questId)
    .single()
  if (!quest) return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
  if ((quest as { dm_id: string }).dm_id !== user.id) {
    return NextResponse.json({ error: 'Only the DM can capture' }, { status: 403 })
  }

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Server misconfigured (admin client)' }, { status: 500 })

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${questId}/${sessionId ?? 'no-session'}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadErr } = await admin.storage
    .from('session-captures')
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (uploadErr) {
    return NextResponse.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 })
  }

  const { data: pub } = admin.storage.from('session-captures').getPublicUrl(path)
  const imageUrl = pub.publicUrl

  // Cast — `session_captures` was added by migration 20260601_002 and isn't in
  // the regenerated Database types yet.
  const { data: row, error: rowErr } = await admin
    .from('session_captures')
    .insert({
      quest_id: questId,
      session_id: sessionId,
      scene_id: sceneId,
      captured_by: user.id,
      image_url: imageUrl,
      caption,
    } as never)
    .select()
    .single()

  if (rowErr) {
    return NextResponse.json({ error: `Insert failed: ${rowErr.message}` }, { status: 500 })
  }

  return NextResponse.json({ url: imageUrl, capture: row })
}
