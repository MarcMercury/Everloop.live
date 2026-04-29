import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 120

// Detailed prompts per sublayer, grounded in the Everloop's visual and narrative identity
const SUBLAYER_PROMPTS: Record<string, { prompt: string; size: '1024x1024' }> = {
  drift: {
    prompt: [
      'A vast primordial sea of unformed chaos, viewed from above as a cross-section of reality.',
      'Deep space nebula-like environment with swirling clouds of deep purple, burning orange, cold blue, and hot pink energy.',
      'Raw matter and energy in constant turbulent motion — nothing holds shape.',
      'Ephemeral mountains of dark crystal briefly form then dissolve. Bright flashes of white intent spark and vanish.',
      'Vortex rings of glowing energy spiral through the void. Wisps of light arc like lightning through dark cosmic clouds.',
      'An abyss bowl of deep black at the bottom. Everything feels primordial, alien, and beautiful in its chaos.',
      'Style: dark fantasy cosmic art, volumetric nebula lighting, deep saturated colors against absolute darkness.',
      'Highly detailed, cinematic, 8K quality, seamless tileable texture for 3D environment mapping.',
      'No text, no labels, no UI elements.',
    ].join(' '),
    size: '1024x1024',
  },
  fold: {
    prompt: [
      'The intermediary plane between chaos and order — where reality is being actively woven into existence.',
      'A vast circular boundary membrane that shimmers between purple chaos on the outside and structured blue geometry inside.',
      'Tall angular architect figures stand at the boundary — beings of intent made of dark metallic material with glowing blue heads.',
      'Semi-stable geometric fragments (cubes, tetrahedra, dodecahedra) flicker between solid and wireframe, struggling to hold form.',
      'Energy streams spiral inward from the chaotic outer edge toward a structured blue grid at the center.',
      'The outer edge is chaotic with drift-like purple and orange particles. The inner area shows an emerging grid of blue-white light.',
      'Transition zone: matter transforms from formless chaos to nascent geometric structure.',
      'Style: dark fantasy architectural visualization, metallic and crystalline materials, deep blue and purple palette.',
      'Highly detailed, cinematic, 8K quality, seamless tileable texture for 3D environment mapping.',
      'No text, no labels, no UI elements.',
    ].join(' '),
    size: '1024x1024',
  },
  pattern: {
    prompt: [
      'A vast luminous lattice web — the fabric of reality itself, woven from threads of pure intent and purpose.',
      'An intricate network of glowing bright blue threads forming a geometric grid extending to the horizon.',
      'Nodes of light pulse at each intersection. Energy flows upward through the threads in visible streams of blue-white particles.',
      'Eight great anchor pillars of crystalline blue energy rise from below, pinning the lattice to reality.',
      'Octahedral shards of bright cyan crystal float within the lattice, humming with energy.',
      'Weaving threads spiral upward from below, new strands being added to the ever-growing web.',
      'The whole lattice pulses with wave patterns radiating outward from the center — a living, breathing structure of light.',
      'Style: luminous crystalline fantasy, sacred geometry, bright blue and white energy against deep dark space.',
      'Highly detailed, cinematic, 8K quality, seamless tileable texture for 3D environment mapping.',
      'No text, no labels, no UI elements.',
    ].join(' '),
    size: '1024x1024',
  },
}

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
  const { layer } = body

  if (!layer || !SUBLAYER_PROMPTS[layer]) {
    return NextResponse.json(
      { error: 'Invalid layer. Must be one of: drift, fold, pattern' },
      { status: 400 }
    )
  }

  const config = SUBLAYER_PROMPTS[layer]

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const response = await client.images.generate({
      model: 'gpt-image-1',
      prompt: config.prompt,
      n: 1,
      size: config.size,
      quality: 'high',
    })

    const b64 = response.data?.[0]?.b64_json
    const tempUrl = response.data?.[0]?.url
    let imageBuffer: ArrayBuffer
    if (b64) {
      imageBuffer = Buffer.from(b64, 'base64').buffer.slice(0) as ArrayBuffer
    } else if (tempUrl) {
      const imgRes = await fetch(tempUrl)
      if (!imgRes.ok) {
        return NextResponse.json({ error: 'Failed to download generated image' }, { status: 500 })
      }
      imageBuffer = await imgRes.arrayBuffer()
    } else {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 })
    }

    const fileName = `map/sublayers/${layer}-texture-${Date.now()}.png`

    const { error: uploadError } = await supabase.storage
      .from('entity-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('Sublayer texture upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to save texture image' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('entity-images')
      .getPublicUrl(fileName)

    return NextResponse.json({
      imageUrl: publicUrl,
      layer,
      revisedPrompt: response.data?.[0]?.revised_prompt,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Texture generation failed'
    console.error('Sublayer texture generation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET endpoint to retrieve existing sublayer textures
export async function GET() {
  const supabase = await createClient()

  // List files in the sublayers folder
  const { data: files, error } = await supabase.storage
    .from('entity-images')
    .list('map/sublayers', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

  if (error) {
    return NextResponse.json({ error: 'Failed to list textures' }, { status: 500 })
  }

  const textures: Record<string, { url: string; name: string; created: string }[]> = {
    drift: [],
    fold: [],
    pattern: [],
  }

  for (const file of files || []) {
    const layer = file.name.split('-texture-')[0]
    if (layer && textures[layer]) {
      const { data: { publicUrl } } = supabase.storage
        .from('entity-images')
        .getPublicUrl(`map/sublayers/${file.name}`)
      textures[layer].push({
        url: publicUrl,
        name: file.name,
        created: file.created_at ?? '',
      })
    }
  }

  return NextResponse.json({ textures })
}
