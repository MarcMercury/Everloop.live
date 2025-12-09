import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface ProfileData {
  username: string
  is_admin: boolean | null
}

interface AdminCheck {
  isAdmin: boolean
  userId: string | null
  username: string | null
}

/**
 * Check if current user has admin privileges (is_admin = true)
 * Does NOT redirect - use for conditional rendering
 */
export async function checkAdmin(): Promise<AdminCheck> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { isAdmin: false, userId: null, username: null }
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, is_admin')
    .eq('id', user.id)
    .single() as { data: ProfileData | null; error: Error | null }
  
  if (!profile) {
    return { isAdmin: false, userId: user.id, username: null }
  }
  
  return {
    isAdmin: profile.is_admin === true,
    userId: user.id,
    username: profile.username,
  }
}

/**
 * Require admin access - redirects to /explore if not admin
 * Use in server components/pages that require admin access
 */
export async function requireAdmin(): Promise<{
  userId: string
  username: string
}> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, is_admin')
    .eq('id', user.id)
    .single() as { data: ProfileData | null; error: Error | null }
  
  if (!profile || profile.is_admin !== true) {
    redirect('/explore')
  }
  
  return {
    userId: user.id,
    username: profile.username,
  }
}

/**
 * Verify admin in server actions - returns error if not admin
 * Use in server actions that require admin access
 */
export async function verifyAdmin(): Promise<{
  success: true
  userId: string
} | {
  success: false
  error: string
}> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single() as { data: { is_admin: boolean | null } | null; error: Error | null }
  
  if (!profile || profile.is_admin !== true) {
    return { success: false, error: 'Admin access required' }
  }
  
  return {
    success: true,
    userId: user.id,
  }
}
