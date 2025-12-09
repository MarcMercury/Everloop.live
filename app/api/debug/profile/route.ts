import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      return NextResponse.json({ 
        status: 'auth_error', 
        error: authError.message 
      })
    }
    
    if (!user) {
      return NextResponse.json({ 
        status: 'not_authenticated',
        user: null 
      })
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, display_name, is_admin')
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
        details: profileError.details,
      } : null,
      isAdmin: profile?.is_admin === true,
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      error: String(error) 
    })
  }
}
