import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/explore'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Ensure profile exists for OAuth users
      // The database trigger should handle this, but we verify here for robustness
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()
      
      if (!existingProfile) {
        // Create profile for OAuth user
        const email = data.user.email || ''
        const metadata = data.user.user_metadata || {}
        
        // Generate username from Google metadata or email
        const baseUsername = metadata.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') 
          || metadata.full_name?.toLowerCase().replace(/[^a-z0-9]/g, '_')
          || email.split('@')[0].replace(/[^a-z0-9]/g, '_')
          || 'user'
        
        // Add random suffix to ensure uniqueness
        const username = `${baseUsername}_${Date.now().toString(36).slice(-4)}`
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: username,
            display_name: metadata.full_name || metadata.name || baseUsername,
            avatar_url: metadata.avatar_url || metadata.picture || null,
            role: 'writer',
            reputation_score: 0,
          } as never)
        
        if (profileError) {
          console.error('Error creating profile for OAuth user:', profileError)
          // Don't fail - user can fix profile later
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
