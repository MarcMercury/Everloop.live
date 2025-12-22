import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ slug: string }>
}

interface StoryContent {
  content_text: string | null
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: story, error } = await supabase
    .from('stories')
    .select('content_text')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !story) {
    return NextResponse.json(
      { error: 'Story not found' },
      { status: 404 }
    )
  }

  const typedStory = story as unknown as StoryContent
  return NextResponse.json({ content_text: typedStory.content_text })
}
