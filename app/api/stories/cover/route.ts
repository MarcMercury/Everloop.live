import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, author, snippet } = body

  if (!title) {
    return NextResponse.json({ error: 'Missing title' }, { status: 400 })
  }

  const prompt = [
    'Design a rich, elegant fantasy book cover illustration for a novel titled',
    `"${title}"${author ? ` by ${author}` : ''}.`,
    snippet ? `The story begins: "${snippet.slice(0, 200)}"` : '',
    'Style: ornate high-fantasy book cover art, oil painting aesthetic,',
    'dramatic lighting, deep rich colors (burgundy, emerald, navy, gold),',
    'intricate border decorations, gold foil accents, aged parchment undertones.',
    'The image should feel like a premium collectible hardcover edition.',
    'Do NOT include any text or lettering in the image.',
    'Portrait orientation, vertical composition.',
  ].filter(Boolean).join(' ')

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1792',
      quality: 'standard',
    })

    const imageUrl = response.data?.[0]?.url
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 })
    }

    return NextResponse.json({ imageUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Cover generation failed'
    console.error('Cover generation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
