import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/check
 * Debug endpoint to check current user's admin status
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        authenticated: false,
        error: authError?.message || 'Not logged in'
      })
    }
    
    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, role, is_admin')
      .eq('id', user.id)
      .single() as {
        data: { id: string; username: string; role: string; is_admin: boolean } | null
        error: { message: string; code?: string } | null
      }
    
    if (profileError) {
      return NextResponse.json({
        authenticated: true,
        userId: user.id,
        email: user.email,
        profileError: profileError.message,
        profileCode: profileError.code || 'UNKNOWN',
        hint: 'The is_admin column may not exist in your database'
      })
    }

    if (!profile) {
      return NextResponse.json({
        authenticated: true,
        userId: user.id,
        email: user.email,
        profileError: 'No profile found',
        profileCode: 'NOT_FOUND',
        hint: 'Profile record does not exist for this user'
      })
    }
    
    return NextResponse.json({
      authenticated: true,
      userId: user.id,
      email: user.email,
      profile: {
        id: profile.id,
        username: profile.username,
        role: profile.role,
        is_admin: profile.is_admin,
        is_admin_type: typeof profile.is_admin
      },
      isAdminCheck: profile.is_admin === true
    })
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
