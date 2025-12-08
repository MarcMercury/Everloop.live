import { createBrowserClient } from '@supabase/ssr'
import { type Database } from '@/types/database'

/**
 * Creates a typed Supabase client for browser/client-side usage.
 * Uses NEXT_PUBLIC_ environment variables which are safe to expose.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Export a singleton instance for convenience
export const supabase = createClient()
