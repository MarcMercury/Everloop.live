import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getMeshyTask, type MeshyTaskType } from '@/lib/meshy'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { taskId } = await params
  const taskType = request.nextUrl.searchParams.get('type') as MeshyTaskType | null

  if (!taskType || !['text-to-3d', 'image-to-3d', 'multi-image-to-3d', 'retexture'].includes(taskType)) {
    return NextResponse.json(
      { error: 'Query param "type" is required: text-to-3d | image-to-3d | multi-image-to-3d | retexture' },
      { status: 400 }
    )
  }

  try {
    const task = await getMeshyTask(taskId, taskType)
    return NextResponse.json(task)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch task'
    console.error('Meshy task fetch error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
