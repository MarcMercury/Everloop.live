import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Allowlisted domains for SSRF protection
const ALLOWED_HOSTS = [
  'assets.meshy.ai',
  'd2eii41no6ts20.cloudfront.net',
  'd39bg2k09y8bsb.cloudfront.net',
]

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      (parsed.protocol === 'https:') &&
      ALLOWED_HOSTS.some((host) => parsed.hostname === host || parsed.hostname.endsWith('.cloudfront.net'))
    )
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'Missing "url" query parameter' }, { status: 400 })
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 })
  }

  try {
    const upstream = await fetch(url)

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${upstream.status}` },
        { status: 502 }
      )
    }

    const contentType = upstream.headers.get('content-type') || 'model/gltf-binary'
    const body = upstream.body

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to proxy model'
    console.error('GLB proxy error:', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
