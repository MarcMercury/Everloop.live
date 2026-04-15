import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Require admin for debug endpoints — single check
    const { data: isAdmin } = await supabase.rpc('is_admin_check')
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .eq('id', user.id)
      .single()
    
    return NextResponse.json({
      status: 'ok',
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profile,
      profileError: profileError ? {
        message: profileError.message,
        code: profileError.code,
      } : null,
      isAdminRpc: isAdmin,
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      error: String(error) 
    })
  }
}
