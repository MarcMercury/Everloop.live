import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated (uses cookie-based session)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Use admin client for profile operations to bypass RLS
    const adminClient = createAdminClient()
    
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
    const { data: existingUser } = await adminClient
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
    const { data: existingProfile, error: profileCheckError } = await adminClient
      .from('profiles')
      .select('id, username')
      .eq('id', user.id)
      .single() as { data: { id: string; username: string | null } | null; error: { message: string; code?: string } | null }
    
    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine
      console.error('Profile check error:', profileCheckError)
    }
    
    if (existingProfile) {
      // Update existing profile
      const updateData = {
        username: trimmedUsername,
        display_name: displayName?.trim() || trimmedUsername,
        updated_at: new Date().toISOString(),
      }
      const { error: updateError } = await adminClient
        .from('profiles')
        .update(updateData as never)
        .eq('id', user.id)
      
      if (updateError) {
        console.error('Profile update error:', updateError)
        
        // Check for unique constraint violation
        if (updateError.message?.includes('unique') || updateError.message?.includes('duplicate') || updateError.message?.includes('23505')) {
          return NextResponse.json(
            { error: 'Username is already taken.' },
            { status: 409 }
          )
        }
        
        return NextResponse.json(
          { error: `Failed to update profile: ${updateError.message}` },
          { status: 500 }
        )
      }
    } else {
      // Create new profile
      const insertData = {
        id: user.id,
        username: trimmedUsername,
        display_name: displayName?.trim() || trimmedUsername,
        role: 'writer',
        reputation_score: 0,
      }
      const { error: insertError } = await adminClient
        .from('profiles')
        .insert(insertData as never)
      
      if (insertError) {
        console.error('Profile creation error:', insertError)
        
        // Handle unique constraint violation
        if (insertError.message?.includes('unique') || insertError.message?.includes('duplicate') || insertError.message?.includes('23505')) {
          return NextResponse.json(
            { error: 'Username is already taken.' },
            { status: 409 }
          )
        }
        
        return NextResponse.json(
          { error: `Failed to create profile: ${insertError.message}` },
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
