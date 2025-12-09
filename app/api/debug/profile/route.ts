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
    
    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .eq('id', user.id)
      .single()
    
    // Use RPC to check admin status
    const { data: isAdminRpc, error: rpcError } = await supabase.rpc('is_admin_check')
    
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
      isAdminRpc: isAdminRpc,
      rpcError: rpcError ? {
        message: rpcError.message,
        code: rpcError.code,
      } : null,
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      error: String(error) 
    })
  }
}
