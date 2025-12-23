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

  // Verify ownership or collaboration access
  const isOwner = story.author_id === user.id
  
  // Check if user is a collaborator with edit access
  let hasEditAccess = isOwner
  if (!isOwner) {
    const { data: collab } = await supabase
      .from('story_collaborators' as never)
      .select('role')
      .eq('story_id', id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .not('accepted_at', 'is', null)
      .single()
    
    if (collab) {
      const role = (collab as { role: string }).role
      hasEditAccess = role === 'editor' || role === 'co_author'
    }
  }
  
  if (!hasEditAccess) {
    redirect('/dashboard')
  }

  // Only allow editing drafts
  if (story.canon_status !== 'draft') {
    redirect('/dashboard')
  }
  
  // Fetch user profile for presence
  const { data: profileData } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url')
    .eq('id', user.id)
    .single()
  
  const profile = profileData as { username: string; display_name: string | null; avatar_url: string | null } | null

  return (
    <WriteClientWithStory 
      storyId={story.id}
      initialTitle={story.title}
      initialContent={story.content}
      scope={story.scope || 'tale'}
      currentUser={profile ? {
        id: user.id,
        username: profile.username || '',
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
      } : undefined}
    />
  )
}
