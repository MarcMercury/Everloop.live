import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WriteClientWithStory } from './write-client-story'
import { type Json, type StoryScope } from '@/types/database'

interface WriteStoryPageProps {
  params: Promise<{ id: string }>
}

interface StoryData {
  id: string
  title: string
  content: Json
  scope: StoryScope | null
  author_id: string
  canon_status: string
}

export default async function WriteStoryPage({ params }: WriteStoryPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirected=true&next=/write')
  }

  // Fetch the story
  const { data: story, error } = await supabase
    .from('stories')
    .select('id, title, content, scope, author_id, canon_status')
    .eq('id', id)
    .single() as { data: StoryData | null; error: Error | null }

  if (error || !story) {
    notFound()
  }

  // Verify ownership
  if (story.author_id !== user.id) {
    redirect('/dashboard')
  }

  // Only allow editing drafts
  if (story.canon_status !== 'draft') {
    redirect('/dashboard')
  }

  return (
    <WriteClientWithStory 
      storyId={story.id}
      initialTitle={story.title}
      initialContent={story.content}
      scope={story.scope || 'tale'}
    />
  )
}
