'use server'

import { createClient } from '@/lib/supabase/server'

export interface DebugResult {
  step: string
  success: boolean
  data?: unknown
  error?: string
}

export async function getAdminQueueDebug(): Promise<DebugResult[]> {
  const results: DebugResult[] = []
  const supabase = await createClient()

  // Step 1: Check current user
  const { data: userData, error: userError } = await supabase.auth.getUser()
  results.push({
    step: '1. Current User',
    success: !userError && !!userData.user,
    data: userData.user ? {
      id: userData.user.id,
      email: userData.user.email
    } : null,
    error: userError?.message
  })

  if (!userData.user) {
    results.push({
      step: '2. STOPPED: No authenticated user',
      success: false,
      error: 'Must be logged in'
    })
    return results
  }

  // Step 2: Check if user is admin in profiles
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, is_admin')
    .eq('id', userData.user.id)
    .single()

  results.push({
    step: '2. User Profile',
    success: !profileError && !!profileData,
    data: profileData,
    error: profileError?.message
  })

  // Step 3: Raw count of ALL stories (no filter)
  const { count: storiesCount, error: storiesCountError } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })

  results.push({
    step: '3. Total Stories Count (raw)',
    success: !storiesCountError,
    data: { count: storiesCount },
    error: storiesCountError?.message
  })

  // Step 4: Count stories by status
  const { data: storiesByStatus, error: storiesStatusError } = await supabase
    .from('stories')
    .select('canon_status')

  const statusCounts: Record<string, number> = {}
  if (storiesByStatus) {
    storiesByStatus.forEach((s: { canon_status: string }) => {
      statusCounts[s.canon_status] = (statusCounts[s.canon_status] || 0) + 1
    })
  }

  results.push({
    step: '4. Stories by Canon Status',
    success: !storiesStatusError,
    data: statusCounts,
    error: storiesStatusError?.message
  })

  // Step 5: Fetch submitted stories
  const { data: submittedStories, error: submittedError } = await supabase
    .from('stories')
    .select('id, title, canon_status, author_id')
    .eq('canon_status', 'submitted')

  results.push({
    step: '5. Submitted Stories Query',
    success: !submittedError,
    data: submittedStories,
    error: submittedError?.message
  })

  // Step 6: Raw count of ALL entities
  const { count: entitiesCount, error: entitiesCountError } = await supabase
    .from('canon_entities')
    .select('*', { count: 'exact', head: true })

  results.push({
    step: '6. Total Entities Count (raw)',
    success: !entitiesCountError,
    data: { count: entitiesCount },
    error: entitiesCountError?.message
  })

  // Step 7: Count entities by status
  const { data: entitiesByStatus, error: entitiesStatusError } = await supabase
    .from('canon_entities')
    .select('status')

  const entityStatusCounts: Record<string, number> = {}
  if (entitiesByStatus) {
    entitiesByStatus.forEach((e: { status: string }) => {
      entityStatusCounts[e.status] = (entityStatusCounts[e.status] || 0) + 1
    })
  }

  results.push({
    step: '7. Entities by Status',
    success: !entitiesStatusError,
    data: entityStatusCounts,
    error: entitiesStatusError?.message
  })

  // Step 8: Fetch proposed entities
  const { data: proposedEntities, error: proposedError } = await supabase
    .from('canon_entities')
    .select('id, name, entity_type, status')
    .eq('status', 'proposed')
    .limit(10)

  results.push({
    step: '8. Proposed Entities Query (first 10)',
    success: !proposedError,
    data: proposedEntities,
    error: proposedError?.message
  })

  return results
}
