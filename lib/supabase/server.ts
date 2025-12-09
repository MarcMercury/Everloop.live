import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { type Database } from '@/types/database'

/**
 * Creates a typed Supabase client for server-side usage.
 * Handles cookie management for auth state.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Handle cookie errors in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Handle cookie errors in Server Components
          }
        },
      },
    }
  )
}

/**
 * Creates an admin Supabase client with service role key.
 * ONLY use for server-side admin operations.
 * Returns null if service role key is not configured.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl) {
    console.error('[createAdminClient] NEXT_PUBLIC_SUPABASE_URL is not set')
    return null
  }
  
  if (!serviceRoleKey) {
    console.error('[createAdminClient] SUPABASE_SERVICE_ROLE_KEY is not set')
    return null
  }
  
  // Use direct supabase-js client for admin operations
  // db.schema ensures we use the public schema
  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  })
}
