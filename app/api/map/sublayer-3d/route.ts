import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createTextTo3DPreview, createImageTo3D, getMeshyTask } from '@/lib/meshy'
import type { MeshyTaskType } from '@/lib/meshy'

export const runtime = 'nodejs'
export const maxDuration = 30

// Detailed text-to-3D prompts for each sublayer environment
const SUBLAYER_3D_PROMPTS: Record<string, { prompt: string }> = {
  drift: {
    prompt: [
      'A vast swirling cosmic abyss of primordial chaos energy.',
      'Dark nebula clouds of deep purple, burning orange, and cold blue.',
      'Ephemeral crystal mountains rising and dissolving.',
      'Bright energy wisps arcing through dark cosmic void.',
      'Vortex rings of glowing energy.',
      'Deep space fantasy environment, volumetric nebula.',
    ].join(' '),
  },
  fold: {
    prompt: [
      'A vast circular plane where chaos transforms into geometric order.',
      'Outer edge is chaotic purple energy. Inner area shows a structured blue luminous grid.',
      'Tall dark metallic angular figures with glowing blue heads stand at the boundary.',
      'Semi-stable geometric crystal fragments floating, some solid, some wireframe.',
      'Energy streams spiraling inward from chaos to structure.',
      'Dark fantasy architectural plane, metallic and crystalline.',
    ].join(' '),
  },
  pattern: {
    prompt: [
      'A vast luminous lattice web made of glowing blue energy threads.',
      'Intricate geometric grid with pulsing light nodes at every intersection.',
      'Eight great crystalline blue pillars rising from below.',
      'Floating octahedral shards of bright cyan crystal.',
      'Energy flowing upward through bright blue-white thread streams.',
      'Sacred geometry fantasy structure, luminous crystalline web in dark space.',
    ].join(' '),
  },
}

const VALID_LAYERS = new Set(['drift', 'fold', 'pattern'])

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check admin role
  const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin_check')
  if (rpcError || !isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json()
  const { layer, mode, imageUrl, taskId } = body

  if (!layer || !VALID_LAYERS.has(layer)) {
    return NextResponse.json(
      { error: 'Invalid layer. Must be one of: drift, fold, pattern' },
      { status: 400 }
    )
  }

  try {
    // Mode 1: Generate 3D from an existing texture image (DALL-E output → Meshy 3D)
    if (mode === 'image-to-3d' && imageUrl) {
      const resultId = await createImageTo3D({
        image_url: imageUrl,
        ai_model: 'latest',
        should_texture: true,
        enable_pbr: true,
      })
      return NextResponse.json({
        taskId: resultId,
        layer,
        mode: 'image-to-3d',
        message: 'Image-to-3D task started. Poll for status.',
      })
    }

    // Mode 2: Generate 3D directly from text prompt
    if (mode === 'text-to-3d') {
      const config = SUBLAYER_3D_PROMPTS[layer]
      const resultId = await createTextTo3DPreview({
        mode: 'preview',
        prompt: config.prompt,
        ai_model: 'latest',
      })
      return NextResponse.json({
        taskId: resultId,
        layer,
        mode: 'text-to-3d',
        message: 'Text-to-3D preview task started. Poll for status.',
      })
    }

    // Mode 3: Check task status
    if (mode === 'status' && taskId) {
      const taskType: MeshyTaskType = body.taskType || 'text-to-3d'
      const status = await getMeshyTask(taskId, taskType)
      return NextResponse.json({
        ...status,
        layer,
      })
    }

    return NextResponse.json(
      { error: 'Invalid mode. Must be: text-to-3d, image-to-3d, or status' },
      { status: 400 }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '3D generation failed'
    console.error('Sublayer 3D generation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
