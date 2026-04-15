import { getUser, getIsAdmin } from '@/lib/supabase/cached'
import { redirect } from 'next/navigation'

interface AdminCheck {
  isAdmin: boolean
  userId: string | null
}

/**
 * Check if current user has admin privileges — uses per-request cache.
 * Does NOT redirect - use for conditional rendering.
 */
export async function checkAdmin(): Promise<AdminCheck> {
  const user = await getUser()
  if (!user) {
    return { isAdmin: false, userId: null }
  }
  
  const isAdmin = await getIsAdmin()
  return { isAdmin, userId: user.id }
}

/**
 * Require admin access - redirects to /explore if not admin.
 * Use in server components/pages that require admin access.
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  
  const isAdmin = await getIsAdmin()
  if (!isAdmin) {
    redirect('/dashboard')
  }
  
  return { userId: user.id }
}

/**
 * Verify admin in server actions - returns error if not admin.
 * Use in server actions that require admin access.
 */
export async function verifyAdmin(): Promise<
  { success: true; userId: string } | { success: false; error: string }
> {
  const user = await getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }
  
  const isAdmin = await getIsAdmin()
  if (!isAdmin) {
    return { success: false, error: 'Admin access required' }
  }
  
  return { success: true, userId: user.id }
}
