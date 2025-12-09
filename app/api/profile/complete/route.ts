import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to complete your profile.' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { userId, username, displayName } = body
    
    // Verify the userId matches the authenticated user
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 403 }
      )
    }
    
    // Validate username
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required.' },
        { status: 400 }
      )
    }
    
    const trimmedUsername = username.trim().toLowerCase()
    
    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 30 characters.' },
        { status: 400 }
      )
    }
    
    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(trimmedUsername)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, underscores, and hyphens.' },
        { status: 400 }
      )
    }
    
    // Check if username is already taken (case-insensitive)
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', trimmedUsername)
      .neq('id', user.id) // Exclude current user in case of update
      .single()
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken.' },
        { status: 409 }
      )
    }
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()
    
    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: trimmedUsername,
          display_name: displayName?.trim() || trimmedUsername,
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', user.id)
      
      if (updateError) {
        console.error('Profile update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update profile.' },
          { status: 500 }
        )
      }
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: trimmedUsername,
          display_name: displayName?.trim() || trimmedUsername,
          role: 'writer',
          reputation_score: 0,
        } as never)
      
      if (insertError) {
        console.error('Profile creation error:', insertError)
        
        // Handle unique constraint violation
        if (insertError.message.includes('unique') || insertError.message.includes('duplicate')) {
          return NextResponse.json(
            { error: 'Username is already taken.' },
            { status: 409 }
          )
        }
        
        return NextResponse.json(
          { error: 'Failed to create profile.' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Profile completed successfully.'
    })
    
  } catch (error) {
    console.error('Complete profile error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
