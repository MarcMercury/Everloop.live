import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createTextTo3DPreview, createTextTo3DRefine } from '@/lib/meshy'
import type { TextTo3DPreviewRequest, TextTo3DRefineRequest } from '@/types/meshy'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { mode, prompt, preview_task_id, ...options } = body

    if (mode === 'preview') {
      if (!prompt || typeof prompt !== 'string' || prompt.length > 600) {
        return NextResponse.json(
          { error: 'Prompt is required (max 600 characters)' },
          { status: 400 }
        )
      }

      const taskId = await createTextTo3DPreview({
        mode: 'preview',
        prompt,
        ai_model: 'latest',
        target_formats: ['glb'],
        should_remesh: false,
        ...options,
      } as TextTo3DPreviewRequest)

      return NextResponse.json({ taskId })
    }

    if (mode === 'refine') {
      if (!preview_task_id || typeof preview_task_id !== 'string') {
        return NextResponse.json(
          { error: 'preview_task_id is required for refine mode' },
          { status: 400 }
        )
      }

      const taskId = await createTextTo3DRefine({
        mode: 'refine',
        preview_task_id,
        enable_pbr: true,
        target_formats: ['glb'],
        ...options,
      } as TextTo3DRefineRequest)

      return NextResponse.json({ taskId })
    }

    return NextResponse.json({ error: 'Invalid mode. Use "preview" or "refine"' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Text to 3D generation failed'
    console.error('Text to 3D error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
