import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

interface CookieToSet {
  name: string
  value: string
  options?: Record<string, unknown>
}

/**
 * Creates a Supabase client for use in API routes (NOT Edge middleware).
 * This is for route handlers that run in Node.js runtime, not Edge.
 * 
 * For Edge middleware, use cookie-based checks instead of this client
 * to avoid @supabase/realtime-js Edge Runtime incompatibility.
 */
export function createRouteHandlerClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  return { supabase, response: () => supabaseResponse }
}

/**
 * Helper to check if auth cookies exist (for Edge-compatible checks).
 * Use this in middleware instead of importing the Supabase client.
 */
export function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
  )
}

