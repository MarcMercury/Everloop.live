import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST() {
  // Auth gate — admin only (DALL-E 3 HD is expensive)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data: isAdmin } = await supabase.rpc('is_admin_check')
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: [
        'Create a grayscale heightmap/depth map for a fantasy world terrain map.',
        'The image should be a top-down grayscale elevation map where:',
        '- White/bright areas represent high terrain (mountains, ridges, highlands)',
        '- Dark/black areas represent low terrain (oceans, deep valleys, abysses)',
        '- Mid-gray represents plains and normal elevation',
        'The terrain should have:',
        '- A large central highland region with ridges radiating outward',
        '- Mountain ranges running roughly north-south on the eastern side',
        '- Coastal lowlands on the western and southern edges',
        '- A deep dark area in the northwest (drowned marshlands)',
        '- Rolling hills in the northeast transitioning to sharp peaks',
        '- A vast flat expanse (glass desert) in the east-center, shown as uniform mid-gray',
        '- Volcanic elevated terrain in the far east (ashen peaks), very bright',
        '- Gentle rolling terrain in the south-center (verdant vale)',
        'Style: smooth gradient grayscale heightmap, subtle noise for natural feel.',
        'No text, no labels, no color — pure grayscale elevation data.',
        'Seamless edges that fade to mid-gray at borders.',
      ].join(' '),
      size: '1024x1024',
      quality: 'hd',
      n: 1,
    })

    const imageUrl = response.data?.[0]?.url
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 })
    }

    return NextResponse.json({ imageUrl, revisedPrompt: response.data?.[0]?.revised_prompt })
  } catch (error) {
    console.error('Depth map generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate depth map' },
      { status: 500 }
    )
  }
}
