import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/write', '/profile', '/dashboard']

// Routes that should redirect to /explore if already authenticated
const authRoutes = ['/login']

/**
 * Lightweight middleware that checks for Supabase auth cookies.
 * Does NOT import @supabase/ssr to avoid Edge Runtime issues with realtime-js.
 * Actual session validation happens in Server Components/Actions.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Check for Supabase auth cookies (they start with 'sb-')
  // The cookie name format is: sb-<project-ref>-auth-token
  const hasAuthCookie = request.cookies.getAll().some(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
  )

  // Protect routes - redirect to login if no auth cookie
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!hasAuthCookie) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirected', 'true')
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (hasAuthCookie) {
      return NextResponse.redirect(new URL('/explore', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
