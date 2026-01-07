'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export interface AuthResult {
  success: boolean
  error?: string
  message?: string
}

export async function login(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) {
    return {
      success: false,
      error: 'Email and password are required.',
    }
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }
  
  // Verify session was created
  if (!data.session) {
    return {
      success: false,
      error: 'Failed to create session. Please try again.',
    }
  }
  
  // Ensure profile exists for this user (handle orphan case)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', data.user.id)
    .single()
  
  if (profileError || !profile) {
    // Profile missing - create one with fallback username from email
    const fallbackUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Date.now().toString(36).slice(-4)
    const { error: createError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username: fallbackUsername,
        display_name: data.user.user_metadata?.display_name || fallbackUsername,
      } as never)
    
    if (createError) {
      console.error('Failed to create missing profile on login:', createError)
      // Don't fail login - user can fix profile later
    }
  }
  
  redirect('/explore')
}

export async function signup(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || ''
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string
  
  // Validate inputs
  if (!email || !password || !username) {
    return {
      success: false,
      error: 'All fields are required.',
    }
  }
  
  // Validate username format
  const usernameRegex = /^[a-zA-Z0-9_-]+$/
  if (!usernameRegex.test(username)) {
    return {
      success: false,
      error: 'Username can only contain letters, numbers, underscores, and hyphens.',
    }
  }
  
  if (username.length < 3) {
    return {
      success: false,
      error: 'Username must be at least 3 characters.',
    }
  }
  
  if (username.length > 30) {
    return {
      success: false,
      error: 'Username must be 30 characters or less.',
    }
  }
  
  if (password.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters.',
    }
  }
  
  // Check if username is already taken (case-insensitive)
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('username')
    .ilike('username', username)
    .single()
  
  if (existingUser) {
    return {
      success: false,
      error: 'Username is already taken.',
    }
  }
  
  // STEP 1: Create the user in Supabase Auth
  // Include username in metadata so the database trigger can use it
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        username: username.toLowerCase(),
        display_name: username,
      },
    },
  })
  
  if (error) {
    // Handle specific errors
    if (error.message.includes('already registered')) {
      return {
        success: false,
        error: 'An account with this email already exists.',
      }
    }
    return {
      success: false,
      error: error.message,
    }
  }
  
  if (!data.user) {
    return {
      success: false,
      error: 'Failed to create account. Please try again.',
    }
  }
  
  // STEP 2: Explicitly create the profile (backup to database trigger)
  // The database trigger should handle this, but we ensure it here for robustness
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: data.user.id,
      username: username.toLowerCase(),
      display_name: username,
      role: 'writer',
      reputation_score: 0,
    } as never, { 
      onConflict: 'id',
      ignoreDuplicates: false 
    })
  
  if (profileError) {
    console.error('Error creating profile (trigger may handle):', profileError)
    // Check if it's a genuine error vs duplicate (trigger already created it)
    if (!profileError.message.includes('duplicate') && !profileError.message.includes('unique')) {
      // Genuine error - but don't fail signup, the trigger should have handled it
      console.error('Profile creation failed, relying on trigger:', profileError)
    }
  }
  
  // STEP 3: Verify profile was created
  const { data: verifyProfile, error: verifyError } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', data.user.id)
    .single()
  
  if (verifyError || !verifyProfile) {
    console.error('CRITICAL: Profile verification failed after signup:', verifyError)
    // This is a serious issue - log it but let user proceed
    // They can fix their profile later
  }
  
  return {
    success: true,
    message: 'Account created! Please check your email to confirm your account.',
  }
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient()
  
  // Use NEXT_PUBLIC_SITE_URL or VERCEL_URL for production, fallback to localhost for dev
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || 'http://localhost:3000'
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  
  if (error) {
    console.error('Google OAuth error:', error)
    redirect('/login?error=Could not authenticate with Google')
  }
  
  if (data.url) {
    redirect(data.url)
  }
  
  redirect('/login?error=Could not initiate Google sign-in')
}

export async function signout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return profile
}
