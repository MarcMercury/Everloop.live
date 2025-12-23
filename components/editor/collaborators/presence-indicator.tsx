'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Presence {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  color: string
  lastSeen: number
}

interface PresenceIndicatorProps {
  storyId: string
  currentUser: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
}

// Generate a consistent color for a user
function getUserColor(userId: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-cyan-500',
    'bg-rose-500',
    'bg-emerald-500',
  ]
  
  // Simple hash to pick a color
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash = hash & hash
  }
  
  return colors[Math.abs(hash) % colors.length]
}

export function PresenceIndicator({ storyId, currentUser }: PresenceIndicatorProps) {
  const [presences, setPresences] = useState<Presence[]>([])
  const [isConnected, setIsConnected] = useState(false)
  
  useEffect(() => {
    const supabase = createClient()
    
    // Create a channel for this story
    const channel = supabase.channel(`story:${storyId}`, {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    })
    
    // Handle presence sync
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const users: Presence[] = []
      
      Object.values(state).forEach((presenceList) => {
        presenceList.forEach((p: any) => {
          // Don't show current user
          if (p.id !== currentUser.id) {
            users.push({
              id: p.id,
              username: p.username,
              displayName: p.displayName,
              avatarUrl: p.avatarUrl,
              color: getUserColor(p.id),
              lastSeen: Date.now(),
            })
          }
        })
      })
      
      setPresences(users)
    })
    
    // Handle join events
    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      // Presence state will be synced automatically
    })
    
    // Handle leave events
    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      // Presence state will be synced automatically
    })
    
    // Subscribe and track presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true)
        
        // Track our presence
        await channel.track({
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatarUrl: currentUser.avatarUrl,
          joinedAt: Date.now(),
        })
      }
    })
    
    // Cleanup on unmount
    return () => {
      channel.unsubscribe()
    }
  }, [storyId, currentUser])
  
  if (presences.length === 0) {
    return null
  }
  
  return (
    <div className="flex items-center gap-1">
      {/* Presence avatars - show first 3 */}
      <div className="flex -space-x-2">
        {presences.slice(0, 3).map((presence) => (
          <div
            key={presence.id}
            className={cn(
              'w-7 h-7 rounded-full border-2 border-charcoal flex items-center justify-center overflow-hidden',
              presence.color
            )}
            title={presence.displayName || presence.username}
          >
            {presence.avatarUrl ? (
              <img 
                src={presence.avatarUrl} 
                alt="" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-white">
                {(presence.displayName || presence.username)[0].toUpperCase()}
              </span>
            )}
          </div>
        ))}
        
        {/* Overflow indicator */}
        {presences.length > 3 && (
          <div className="w-7 h-7 rounded-full border-2 border-charcoal bg-charcoal-700 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">
              +{presences.length - 3}
            </span>
          </div>
        )}
      </div>
      
      {/* Label */}
      <span className="text-xs text-muted-foreground ml-1">
        {presences.length === 1 
          ? `${presences[0].displayName || presences[0].username} is editing`
          : `${presences.length} others editing`
        }
      </span>
    </div>
  )
}
