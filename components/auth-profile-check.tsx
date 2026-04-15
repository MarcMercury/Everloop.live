import { getUser, getProfile } from '@/lib/supabase/cached'
import { CompleteProfileModal } from './complete-profile-modal'

/**
 * Auth wrapper that checks if a logged-in user has a profile.
 * If not, shows a modal to complete their profile.
 * 
 * Uses cached helpers so getUser()/getProfile() are deduplicated
 * with the Navbar — zero extra Supabase calls.
 */
export async function AuthProfileCheck() {
  const user = await getUser()
  
  // No user logged in - nothing to check
  if (!user) {
    return null
  }
  
  // Check if profile exists (cached — same call as Navbar)
  const profile = await getProfile()
  
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
