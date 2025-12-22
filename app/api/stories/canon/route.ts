import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface StoryWithAuthor {
  id: string
  title: string
  slug: string
  summary: string | null
  word_count: number
  canon_status: string
  scope: string | null
  profiles: {
    username: string
    display_name: string | null
  } | null
}

export async function GET() {
  const supabase = await createClient()

  const { data: stories, error } = await supabase
    .from('stories')
    .select(`
      id, 
      title, 
      slug, 
      summary, 
      word_count, 
      canon_status, 
      scope,
      profiles:author_id (
        username,
        display_name
      )
    `)
    .eq('canon_status', 'canonical')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    )
  }

  // Transform the data to match expected format
  const transformedStories = (stories as unknown as StoryWithAuthor[])?.map(story => ({
    id: story.id,
    title: story.title,
    slug: story.slug,
    summary: story.summary,
    word_count: story.word_count,
    canon_status: story.canon_status,
    scope: story.scope,
    author: story.profiles,
  }))

  return NextResponse.json({ stories: transformedStories })
}
