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
  
  // Update last_sign_in_at in profiles
  const { error: loginUpdateError } = await supabase
    .from('profiles')
    .update({ last_sign_in_at: new Date().toISOString() } as never)
    .eq('id', data.user.id)

  if (loginUpdateError) {
    console.error('Failed to update last_sign_in_at on login:', loginUpdateError)
  }

  // Ensure profile exists for this user (handle orphan case)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', data.user.id)
    .single()
  
  if (profileError || !profile) {
    // Profile missing - create one with a collision-safe fallback username.
    // We try a few suffixes; if all collide we let the user proceed and rely
    // on the admin reconcile_orphan_profiles() RPC to clean up.
    const sanitized = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '') || 'user'
    const base = sanitized.length >= 3 ? sanitized : `user_${sanitized}`

    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate =
        attempt === 0
          ? base
          : `${base}_${Date.now().toString(36).slice(-4)}${attempt}`

      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: candidate,
          display_name: data.user.user_metadata?.display_name || candidate,
        } as never)

      if (!createError) break

      const msg = createError.message.toLowerCase()
      if (msg.includes('duplicate') && msg.includes('id')) {
        // Trigger or another request beat us to it — that's fine.
        break
      }
      if (!msg.includes('duplicate') && !msg.includes('unique')) {
        console.error('[login] Failed to create missing profile:', createError)
        break
      }
      // Username collision — loop and try a new suffix.
    }
  }
  
  redirect('/dashboard')
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
  
  // STEP 2: Backstop profile creation only if the DB trigger missed it.
  // We never overwrite a trigger-generated row — that could clobber a
  // username the trigger had to suffix to resolve a collision and re-
  // introduce the conflict for whoever owns the original name.
  const { data: triggerProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!triggerProfile) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username: username.toLowerCase(),
        display_name: username,
        role: 'writer',
        reputation_score: 0,
      } as never)

    if (profileError && !profileError.message.toLowerCase().includes('duplicate')) {
      console.error('[signup] Backstop profile insert failed:', profileError)
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
  
  // Use NEXT_PUBLIC_SITE_URL, VERCEL_URL, or hardcoded production URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || 'https://everloop.live'
  
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
