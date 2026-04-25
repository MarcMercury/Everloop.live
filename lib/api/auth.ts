import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

/**
 * Auth helpers for API route handlers.
 *
 * Usage:
 *   const auth = await requireUser()
 *   if (!auth.ok) return auth.response
 *   const { user, supabase } = auth
 */

export type AuthSuccess = {
  ok: true
  user: User
  supabase: SupabaseClient
}

export type AuthFailure = {
  ok: false
  response: NextResponse
}

export async function requireUser(): Promise<AuthSuccess | AuthFailure> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  return { ok: true, user, supabase }
}

export async function requireAdmin(): Promise<AuthSuccess | AuthFailure> {
  const auth = await requireUser()
  if (!auth.ok) return auth

  const { data: isAdmin } = await auth.supabase.rpc('is_admin_check')
  if (isAdmin !== true) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }
  return auth
}
