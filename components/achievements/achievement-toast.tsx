'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Trophy, X } from 'lucide-react'

interface AchievementToastProps {
  achievement: {
    id: string
    name: string
    icon: string
  }
  onDismiss: () => void
  autoHide?: boolean
  duration?: number
}

export function AchievementToast({
  achievement,
  onDismiss,
  autoHide = true,
  duration = 5000
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  
  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setIsVisible(true), 50)
    
    // Auto-hide
    let hideTimer: NodeJS.Timeout
    if (autoHide) {
      hideTimer = setTimeout(() => {
        handleDismiss()
      }, duration)
    }
    
    return () => {
      clearTimeout(showTimer)
      if (hideTimer) clearTimeout(hideTimer)
    }
  }, [autoHide, duration])
  
  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onDismiss()
    }, 300)
  }
  
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[100] max-w-sm",
        "transition-all duration-300 ease-out",
        isVisible && !isLeaving
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      )}
    >
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-gold/20 via-gold/10 to-transparent border border-gold/40 shadow-xl shadow-gold/20">
        {/* Sparkle effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.3),transparent_50%)]" />
        
        <div className="relative flex items-center gap-4 p-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full bg-gold/20 text-3xl animate-bounce">
            {achievement.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-gold" />
              <span className="text-xs font-medium uppercase tracking-wider text-gold">
                Achievement Unlocked!
              </span>
            </div>
            <h3 className="text-lg font-serif font-semibold text-parchment truncate">
              {achievement.name}
            </h3>
          </div>
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-parchment-muted" />
          </button>
        </div>
        
        {/* Progress bar for auto-hide */}
        {autoHide && (
          <div className="h-1 bg-gold/10">
            <div 
              className="h-full bg-gold/50 animate-shrink-x"
              style={{ 
                animationDuration: `${duration}ms`,
                animationTimingFunction: 'linear'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Container for multiple toasts
interface AchievementToastContainerProps {
  achievements: Array<{ id: string; name: string; icon: string }>
  onDismissAll: () => void
}

export function AchievementToastContainer({
  achievements,
  onDismissAll
}: AchievementToastContainerProps) {
  const [queue, setQueue] = useState(achievements)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    setQueue(achievements)
    setCurrentIndex(0)
  }, [achievements])
  
  const handleDismiss = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      onDismissAll()
    }
  }
  
  if (queue.length === 0 || currentIndex >= queue.length) {
    return null
  }
  
  const current = queue[currentIndex]
  const remaining = queue.length - currentIndex - 1
  
  return (
    <>
      <AchievementToast
        key={current.id}
        achievement={current}
        onDismiss={handleDismiss}
        duration={4000}
      />
      
      {/* Indicator for remaining achievements */}
      {remaining > 0 && (
        <div className="fixed bottom-20 right-6 z-[99] text-xs text-parchment-muted">
          +{remaining} more
        </div>
      )}
    </>
  )
}
