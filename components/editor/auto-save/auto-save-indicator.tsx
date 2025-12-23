'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Check, Cloud, CloudOff, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline'

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus
  lastSaved?: Date | null
  errorMessage?: string
  className?: string
}

export function AutoSaveIndicator({ 
  status, 
  lastSaved, 
  errorMessage,
  className 
}: AutoSaveIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('')
  
  // Update time ago display
  useEffect(() => {
    if (!lastSaved) return
    
    const updateTimeAgo = () => {
      const now = new Date()
      const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000)
      
      if (diff < 5) {
        setTimeAgo('just now')
      } else if (diff < 60) {
        setTimeAgo(`${diff}s ago`)
      } else if (diff < 3600) {
        const mins = Math.floor(diff / 60)
        setTimeAgo(`${mins}m ago`)
      } else {
        const hours = Math.floor(diff / 3600)
        setTimeAgo(`${hours}h ago`)
      }
    }
    
    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 10000)
    
    return () => clearInterval(interval)
  }, [lastSaved])
  
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
          text: 'Saving...',
          className: 'text-gold',
        }
      case 'saved':
        return {
          icon: <Check className="w-3.5 h-3.5" />,
          text: lastSaved ? `Saved ${timeAgo}` : 'Saved',
          className: 'text-emerald-500',
        }
      case 'error':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          text: errorMessage || 'Save failed',
          className: 'text-red-500',
        }
      case 'offline':
        return {
          icon: <CloudOff className="w-3.5 h-3.5" />,
          text: 'Offline',
          className: 'text-orange-500',
        }
      default:
        return {
          icon: <Cloud className="w-3.5 h-3.5" />,
          text: 'Ready',
          className: 'text-muted-foreground',
        }
    }
  }
  
  const config = getStatusConfig()
  
  return (
    <div 
      className={cn(
        'flex items-center gap-1.5 text-xs transition-all duration-300',
        config.className,
        className
      )}
      title={status === 'error' ? errorMessage : undefined}
    >
      {config.icon}
      <span className="hidden sm:inline">{config.text}</span>
    </div>
  )
}

// Hook for managing auto-save state
interface UseAutoSaveOptions {
  onSave: () => Promise<{ success: boolean; error?: string }>
  delay?: number // ms delay before saving
  enabled?: boolean
}

export function useAutoSave({ onSave, delay = 2000, enabled = true }: UseAutoSaveOptions) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isOnline, setIsOnline] = useState(true)
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingSaveRef = useRef(false)
  
  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setStatus(prev => prev === 'offline' ? 'idle' : prev)
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setStatus('offline')
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Check initial status
    setIsOnline(navigator.onLine)
    if (!navigator.onLine) setStatus('offline')
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // Trigger save with debounce
  const triggerSave = useCallback(() => {
    if (!enabled || !isOnline) return
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    pendingSaveRef.current = true
    
    saveTimeoutRef.current = setTimeout(async () => {
      if (!pendingSaveRef.current) return
      
      setStatus('saving')
      setErrorMessage(undefined)
      
      try {
        const result = await onSave()
        
        if (result.success) {
          setStatus('saved')
          setLastSaved(new Date())
        } else {
          setStatus('error')
          setErrorMessage(result.error || 'Failed to save')
        }
      } catch (err) {
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Failed to save')
      }
      
      pendingSaveRef.current = false
    }, delay)
  }, [onSave, delay, enabled, isOnline])
  
  // Force immediate save
  const forceSave = useCallback(async () => {
    if (!isOnline) {
      setStatus('offline')
      return { success: false, error: 'Offline' }
    }
    
    // Clear pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    pendingSaveRef.current = false
    
    setStatus('saving')
    setErrorMessage(undefined)
    
    try {
      const result = await onSave()
      
      if (result.success) {
        setStatus('saved')
        setLastSaved(new Date())
      } else {
        setStatus('error')
        setErrorMessage(result.error || 'Failed to save')
      }
      
      return result
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to save'
      setStatus('error')
      setErrorMessage(error)
      return { success: false, error }
    }
  }, [onSave, isOnline])
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])
  
  return {
    status,
    lastSaved,
    errorMessage,
    isOnline,
    triggerSave,
    forceSave,
    setStatus,
  }
}
