import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 60

const client = new OpenAI()

// Pre-defined art style prompts that get appended to the description
const STYLE_PROMPTS: Record<string, string> = {
  'fantasy-oil': 'High fantasy oil painting style, rich colors, dramatic lighting, detailed brushwork, reminiscent of classic fantasy book covers',
  'anime': 'Anime art style, clean linework, vibrant colors, expressive features, detailed costume design, Studio Ghibli quality',
  'comic-book': 'Comic book art style, bold ink lines, cel-shading, dynamic pose, superhero comic aesthetic, detailed crosshatching',
  'realistic': 'Hyperrealistic digital portrait, photorealistic rendering, natural lighting, detailed skin texture, cinematic depth of field',
  'watercolor': 'Ethereal watercolor painting style, soft washes of color, delicate brushstrokes, dreamy atmosphere, elegant and flowing',
  'dark-fantasy': 'Dark fantasy art style, moody and atmospheric, deep shadows, muted tones with accent colors, gothic and brooding aesthetic',
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { characterData, style, customDetails } = body

  if (!characterData || !style) {
    return NextResponse.json({ error: 'Missing characterData or style' }, { status: 400 })
  }

  const stylePrompt = STYLE_PROMPTS[style]
  if (!stylePrompt) {
    return NextResponse.json({ error: 'Invalid style option' }, { status: 400 })
  }

  // Build the image generation prompt from character data
  const imagePrompt = buildImagePrompt(characterData, stylePrompt, customDetails)

  try {
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    })

    const imageUrl = response.data?.[0]?.url
    if (!imageUrl) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 })
    }

    return NextResponse.json({ imageUrl, revisedPrompt: response.data?.[0]?.revised_prompt })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Image generation failed'
    console.error('Portrait generation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function buildImagePrompt(
  char: {
    name?: string
    race?: string
    class?: string
    subclass?: string
    age?: string
    height?: string
    weight?: string
    eyes?: string
    hair?: string
    skin?: string
    appearance?: string
    personality?: string
    equipment?: string
  },
  stylePrompt: string,
  customDetails?: string
): string {
  const parts: string[] = []

  parts.push('Character portrait of a fantasy RPG character.')

  // Race & class foundation
  if (char.race) parts.push(`Race: ${char.race}.`)
  if (char.class) {
    const classPart = char.subclass ? `${char.subclass} ${char.class}` : char.class
    parts.push(`Class: ${classPart}.`)
  }

  // Physical traits
  const physicals: string[] = []
  if (char.age) physicals.push(`${char.age} years old`)
  if (char.height) physicals.push(`${char.height} tall`)
  if (char.weight) physicals.push(`${char.weight}`)
  if (char.eyes) physicals.push(`${char.eyes} eyes`)
  if (char.hair) physicals.push(`${char.hair} hair`)
  if (char.skin) physicals.push(`${char.skin} skin`)
  if (physicals.length > 0) {
    parts.push(`Physical: ${physicals.join(', ')}.`)
  }

  // Free-form appearance
  if (char.appearance) {
    parts.push(`Appearance details: ${char.appearance}.`)
  }

  // Personality hints for expression
  if (char.personality) {
    parts.push(`Expression and bearing: ${char.personality}.`)
  }

  // Equipment cues
  if (char.equipment) {
    parts.push(`Wearing/carrying: ${char.equipment}.`)
  }

  // User custom details
  if (customDetails?.trim()) {
    parts.push(`Additional details: ${customDetails}.`)
  }

  // Style directive
  parts.push(stylePrompt + '.')

  // Safety: portrait framing
  parts.push('Chest-up portrait composition, detailed face visible, fantasy background.')

  return parts.join(' ')
}
