import { createClient } from '@/lib/supabase/server'
import { CompleteProfileModal } from './complete-profile-modal'

interface ProfileRow {
  id: string
  username: string | null
}

/**
 * Auth wrapper that checks if a logged-in user has a profile.
 * If not, shows a modal to complete their profile.
 * 
 * This handles the "orphan" case where a user exists in auth
 * but their profile row is missing from the database.
 */
export async function AuthProfileCheck() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // No user logged in - nothing to check
  if (!user) {
    return null
  }
  
  // Check if profile exists
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', user.id)
    .single()
  
  const profile = data as ProfileRow | null
  
  // Profile exists with username - all good
  if (profile && profile.username) {
    return null
  }
  
  // User is logged in but has no profile - show completion modal
  return (
    <CompleteProfileModal 
      userId={user.id} 
      email={user.email || ''} 
    />
  )
}
