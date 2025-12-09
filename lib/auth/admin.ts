import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface AdminCheck {
  isAdmin: boolean
  userId: string | null
}

/**
 * Check if current user has admin privileges using database function
 * This bypasses RLS by using a SECURITY DEFINER function
 * Does NOT redirect - use for conditional rendering
 */
export async function checkAdmin(): Promise<AdminCheck> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { isAdmin: false, userId: null }
  }
  
  // Use RPC to check admin status - bypasses RLS
  const { data: isAdmin, error } = await supabase.rpc('is_admin_check')
  
  if (error) {
    console.error('[checkAdmin] RPC error:', error.message)
    return { isAdmin: false, userId: user.id }
  }
  
  return {
    isAdmin: isAdmin === true,
    userId: user.id,
  }
}

/**
 * Require admin access - redirects to /explore if not admin
 * Use in server components/pages that require admin access
 */
export async function requireAdmin(): Promise<{
  userId: string
}> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Use RPC to check admin status - bypasses RLS
  const { data: isAdmin, error } = await supabase.rpc('is_admin_check')
  
  if (error || !isAdmin) {
    console.error('[requireAdmin] Access denied:', error?.message)
    redirect('/dashboard')
  }
  
  return {
    userId: user.id,
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
  
  // Use RPC to check admin status - bypasses RLS
  const { data: isAdmin, error } = await supabase.rpc('is_admin_check')
  
  if (error || !isAdmin) {
    return { success: false, error: 'Admin access required' }
  }
  
  return {
    success: true,
    userId: user.id,
  }
}
