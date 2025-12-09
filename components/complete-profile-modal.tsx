'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, AlertTriangle } from 'lucide-react'

interface CompleteProfileModalProps {
  userId: string
  email: string
}

export function CompleteProfileModal({ userId, email }: CompleteProfileModalProps) {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const suggestedUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    const finalUsername = username.trim() || suggestedUsername
    const finalDisplayName = displayName.trim() || finalUsername
    
    if (finalUsername.length < 3) {
      setError('Username must be at least 3 characters.')
      setIsLoading(false)
      return
    }
    
    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(finalUsername)) {
      setError('Username can only contain letters, numbers, underscores, and hyphens.')
      setIsLoading(false)
      return
    }
    
    try {
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          username: finalUsername.toLowerCase(),
          displayName: finalDisplayName,
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        setError(result.error || 'Failed to create profile.')
        setIsLoading(false)
        return
      }
      
      // Refresh the page to load the new profile
      window.location.reload()
    } catch (err) {
      console.error('Profile creation error:', err)
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-teal-rich border border-gold/20 rounded-lg max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-serif text-parchment">Complete Your Profile</h2>
            <p className="text-sm text-parchment-muted">Your account needs a few more details.</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-parchment">
              Username <span className="text-gold">*</span>
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={suggestedUsername}
              className="bg-teal-deep border-gold/20 text-parchment placeholder:text-parchment-muted/50"
              minLength={3}
              maxLength={30}
            />
            <p className="text-xs text-parchment-muted">
              Letters, numbers, underscores, and hyphens only. 3-30 characters.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-parchment">
              Display Name
            </Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you want to be known"
              className="bg-teal-deep border-gold/20 text-parchment placeholder:text-parchment-muted/50"
              maxLength={50}
            />
            <p className="text-xs text-parchment-muted">
              Optional. Your public name shown on stories.
            </p>
          </div>
          
          {error && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gold hover:bg-gold/90 text-teal-deep font-medium"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-teal-deep/30 border-t-teal-deep rounded-full animate-spin mr-2" />
                Creating Profile...
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Complete Profile
              </>
            )}
          </Button>
        </form>
        
        <p className="mt-4 text-xs text-center text-parchment-muted">
          This is required to use Everloop. Your username cannot be changed later.
        </p>
      </div>
    </div>
  )
}
