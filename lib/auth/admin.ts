import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type AdminRole = 'admin' | 'lorekeeper'

interface AdminCheck {
  isAdmin: boolean
  role: string | null
  userId: string | null
  username: string | null
}

/**
 * Check if current user has admin privileges (admin or lorekeeper role)
 * Does NOT redirect - use for conditional rendering
 */
export async function checkAdmin(): Promise<AdminCheck> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { isAdmin: false, role: null, userId: null, username: null }
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', user.id)
    .single() as { data: { role: string; username: string } | null; error: Error | null }
  
  if (!profile) {
    return { isAdmin: false, role: null, userId: user.id, username: null }
  }
  
  const isAdmin = profile.role === 'admin' || profile.role === 'lorekeeper'
  
  return {
    isAdmin,
    role: profile.role,
    userId: user.id,
    username: profile.username,
  }
}

/**
 * Require admin access - redirects to /explore if not admin
 * Use in server components/pages that require admin access
 */
export async function requireAdmin(): Promise<{
  role: string
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
    .select('role, username')
    .eq('id', user.id)
    .single() as { data: { role: string; username: string } | null; error: Error | null }
  
  if (!profile || (profile.role !== 'admin' && profile.role !== 'lorekeeper')) {
    redirect('/explore')
  }
  
  return {
    role: profile.role,
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
  role: string
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
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null; error: Error | null }
  
  if (!profile || (profile.role !== 'admin' && profile.role !== 'lorekeeper')) {
    return { success: false, error: 'Admin access required' }
  }
  
  return {
    success: true,
    role: profile.role,
    userId: user.id,
  }
}
