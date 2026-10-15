import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createRetexture } from '@/lib/meshy'
import type { RetextureRequest } from '@/types/meshy'
import { rateLimitResponse } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const limited = await rateLimitResponse(supabase, user.id, 'ai:3d', 'meshy-retexture')
  if (limited) return limited

  try {
    const body = await request.json()
    const { input_task_id, model_url, text_style_prompt, image_style_url, ...options } = body

    if (!input_task_id && !model_url) {
      return NextResponse.json(
        { error: 'Either input_task_id or model_url is required' },
        { status: 400 }
      )
    }

    if (!text_style_prompt && !image_style_url) {
      return NextResponse.json(
        { error: 'Either text_style_prompt or image_style_url is required' },
        { status: 400 }
      )
    }

    const taskId = await createRetexture({
      input_task_id,
      model_url,
      text_style_prompt,
      image_style_url,
      enable_pbr: true,
      target_formats: ['glb'],
      ...options,
    } as RetextureRequest)

    return NextResponse.json({ taskId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Retexture generation failed'
    console.error('Retexture error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
