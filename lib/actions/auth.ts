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
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return {
      success: false,
      error: error.message,
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
  
  if (username.length < 3) {
    return {
      success: false,
      error: 'Username must be at least 3 characters.',
    }
  }
  
  if (password.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters.',
    }
  }
  
  // Check if username is already taken
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()
  
  if (existingUser) {
    return {
      success: false,
      error: 'Username is already taken.',
    }
  }
  
  // Create the user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        username,
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
  
  // The profile will be created automatically by the database trigger
  // But we can also ensure it's created here as a backup
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        username,
        display_name: username,
      } as never, { onConflict: 'id' })
    
    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Don't return error - the trigger should handle this
    }
  }
  
  return {
    success: true,
    message: 'Account created! Please check your email to confirm your account.',
  }
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
