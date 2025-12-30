'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Save, ArrowLeft, CheckCircle, Upload, X, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ProfileUpdate } from '@/types/database'

interface ProfileData {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
}

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  
  // Form fields
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) {
        setError('Failed to load profile')
        setLoading(false)
        return
      }
      
      const profileData = data as ProfileData
      setProfile(profileData)
      setDisplayName(profileData.display_name || '')
      setBio(profileData.bio || '')
      setAvatarUrl(profileData.avatar_url || '')
      setLoading(false)
    }
    
    loadProfile()
  }, [router])
  
  async function handleAvatarUpload(file: File) {
    if (!profile) return
    
    setError(null)
    setUploading(true)
    
    try {
      const supabase = createClient()
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a JPG, PNG, GIF, or WebP image.')
        setUploading(false)
        return
      }
      
      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024
      if (file.size > maxSize) {
        setError('Image must be less than 2MB.')
        setUploading(false)
        return
      }
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
      const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
        })
      
      if (uploadError) {
        console.error('Upload error:', uploadError)
        // Try entity-images bucket as fallback
        const { error: fallbackError } = await supabase.storage
          .from('entity-images')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: true,
          })
        
        if (fallbackError) {
          setError('Failed to upload image. Please try using a URL instead.')
          setUploading(false)
          return
        }
        
        // Get public URL from fallback bucket
        const { data: { publicUrl } } = supabase.storage
          .from('entity-images')
          .getPublicUrl(fileName)
        
        setAvatarUrl(publicUrl)
        setUploading(false)
        return
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      setAvatarUrl(publicUrl)
      setUploading(false)
    } catch (err) {
      console.error('Avatar upload error:', err)
      setError('Failed to upload image. Please try again.')
      setUploading(false)
    }
  }
  
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleAvatarUpload(file)
    }
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)
    
    const supabase = createClient()
    
    if (!profile) {
      setError('No profile loaded')
      setSaving(false)
      return
    }
    
    const updateData: ProfileUpdate = {
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatarUrl.trim() || null,
      updated_at: new Date().toISOString(),
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profile.id)
    
    if (error) {
      setError('Failed to save profile: ' + error.message)
      setSaving(false)
      return
    }
    
    setSuccess(true)
    setSaving(false)
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-parchment-muted">Profile not found</p>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/profile/${profile.username}`}
            className="inline-flex items-center gap-2 text-parchment-muted hover:text-parchment transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-serif text-parchment">Profile Settings</h1>
          <p className="text-parchment-muted mt-2">
            Update your public profile information
          </p>
        </div>
        
        <Card className="bg-teal-rich/50 border-gold/10">
          <CardHeader>
            <CardTitle className="text-parchment flex items-center gap-2">
              <User className="w-5 h-5 text-gold" />
              Your Profile
            </CardTitle>
            <CardDescription className="text-parchment-muted">
              This information will be displayed publicly on your author page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-parchment">
                  Username
                </Label>
                <Input
                  id="username"
                  value={profile.username}
                  disabled
                  className="bg-teal-deep/50 border-gold/10 text-parchment-muted cursor-not-allowed"
                />
                <p className="text-xs text-parchment-muted">
                  Username cannot be changed after account creation.
                </p>
              </div>
              
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-parchment">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How you want to be known"
                  maxLength={50}
                  className="bg-teal-deep border-gold/20 text-parchment placeholder:text-parchment-muted/50"
                />
                <p className="text-xs text-parchment-muted">
                  This is the name shown on your stories and profile.
                </p>
              </div>
              
              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-parchment">
                  Bio
                </Label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell readers about yourself..."
                  maxLength={500}
                  rows={4}
                  className="w-full px-3 py-2 rounded-md bg-teal-deep border border-gold/20 text-parchment placeholder:text-parchment-muted/50 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20 resize-none"
                />
                <p className="text-xs text-parchment-muted">
                  {bio.length}/500 characters
                </p>
              </div>
              
              {/* Avatar URL */}
              <div className="space-y-2">
                <Label htmlFor="avatarUrl" className="text-parchment">
                  Avatar URL
                </Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/your-avatar.jpg"
                  className="bg-teal-deep border-gold/20 text-parchment placeholder:text-parchment-muted/50"
                />
                <p className="text-xs text-parchment-muted">
                  Paste a URL to an image for your profile picture.
                </p>
                
                {/* Avatar Preview */}
                {avatarUrl && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={avatarUrl}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-full border-2 border-gold/30 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    <span className="text-sm text-parchment-muted">Preview</span>
                  </div>
                )}
              </div>
              
              {/* Error/Success Messages */}
              {error && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-3 rounded bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Profile updated successfully!
                </div>
              )}
              
              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Link href={`/profile/${profile.username}`}>
                  <Button type="button" variant="outline" className="border-gold/30 text-parchment">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-gold hover:bg-gold/90 text-teal-deep"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-teal-deep/30 border-t-teal-deep rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Account Info */}
        <Card className="mt-6 bg-teal-rich/30 border-gold/10">
          <CardHeader>
            <CardTitle className="text-parchment text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-parchment-muted space-y-2">
            <p>
              <span className="text-parchment">Member since:</span>{' '}
              {new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p>
              <span className="text-parchment">Profile URL:</span>{' '}
              <code className="text-gold">/profile/{profile.username}</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
