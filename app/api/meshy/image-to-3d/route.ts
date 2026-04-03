import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createImageTo3D } from '@/lib/meshy'
import type { ImageTo3DRequest } from '@/types/meshy'

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
    const { image_url, ...options } = body

    if (!image_url || typeof image_url !== 'string') {
      return NextResponse.json(
        { error: 'image_url is required (URL or base64 data URI)' },
        { status: 400 }
      )
    }

    // Validate URL format (public URL or data URI)
    const isDataUri = image_url.startsWith('data:image/')
    const isHttpUrl = image_url.startsWith('https://') || image_url.startsWith('http://')
    if (!isDataUri && !isHttpUrl) {
      return NextResponse.json(
        { error: 'image_url must be a public URL or base64 data URI' },
        { status: 400 }
      )
    }

    // Convert HTTP URLs to base64 data URIs so Meshy doesn't need to
    // download from external sources (avoids firewall/access issues)
    let resolvedImageUrl = image_url
    if (isHttpUrl) {
      try {
        const imgRes = await fetch(image_url)
        if (!imgRes.ok) {
          return NextResponse.json(
            { error: 'Failed to download image from URL' },
            { status: 400 }
          )
        }
        const contentType = imgRes.headers.get('content-type') || 'image/png'
        const buffer = await imgRes.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        resolvedImageUrl = `data:${contentType};base64,${base64}`
      } catch {
        return NextResponse.json(
          { error: 'Failed to fetch image for 3D conversion' },
          { status: 400 }
        )
      }
    }

    const taskId = await createImageTo3D({
      image_url: resolvedImageUrl,
      ai_model: 'latest',
      should_texture: true,
      enable_pbr: true,
      target_formats: ['glb'],
      ...options,
    } as ImageTo3DRequest)

    return NextResponse.json({ taskId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Image to 3D generation failed'
    console.error('Image to 3D error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
