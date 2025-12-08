import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ReviewClient } from './review-client'

interface ReviewPageProps {
  params: Promise<{ id: string }>
}

interface StoryData {
  id: string
  title: string
  content: unknown
  created_at: string
  canon_status: string
  word_count: number | null
  author: {
    id: string
    username: string
  } | null
  reviews: Array<{
    id: string
    canon_consistency_score: number | null
    quality_score: number | null
    feedback: string | null
    suggestions: Record<string, unknown> | null
    flagged_issues: string[] | null
    decision: string | null
    is_ai_review: boolean
    created_at: string
    reviewer: {
      username: string
    } | null
  }>
}

async function getStory(id: string): Promise<StoryData | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      content,
      created_at,
      canon_status,
      word_count,
      author:profiles!stories_author_id_fkey(id, username),
      reviews:story_reviews(
        id,
        canon_consistency_score,
        quality_score,
        feedback,
        suggestions,
        flagged_issues,
        decision,
        is_ai_review,
        created_at,
        reviewer:profiles!story_reviews_reviewer_id_fkey(username)
      )
    `)
    .eq('id', id)
    .single() as { data: StoryData | null; error: Error | null }
  
  if (error) {
    console.error('Error fetching story:', error)
    return null
  }
  
  return data
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id } = await params
  const story = await getStory(id)
  
  if (!story) {
    notFound()
  }
  
  return <ReviewClient story={story} />
}
