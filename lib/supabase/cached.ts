import { cache } from 'react'
import { createClient } from './server'

/**
 * Per-request cached auth helpers.
 * 
 * React's `cache()` deduplicates calls within a single server render.
 * So if Navbar, AuthProfileCheck, and a page all call `getUser()`,
 * only ONE Supabase call is made per request instead of three.
 */

/**
 * Get the current authenticated user — cached per request.
 * Replaces direct `supabase.auth.getUser()` calls in server components.
 */
export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

/**
 * Get user profile — cached per request.
 * Returns null if no user or no profile.
 */
export const getProfile = cache(async () => {
  const user = await getUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .eq('id', user.id)
    .single()

  return data as { id: string; username: string | null; display_name: string | null; avatar_url: string | null } | null
})

/**
 * Check admin status — cached per request.
 * Calls getUser() (cached) then is_admin_check RPC once.
 */
export const getIsAdmin = cache(async () => {
  const user = await getUser()
  if (!user) return false

  const supabase = await createClient()
  const { data } = await supabase.rpc('is_admin_check')
  return data === true
})
