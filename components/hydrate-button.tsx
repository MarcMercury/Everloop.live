'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Zap, Check, AlertCircle } from 'lucide-react'

export function HydrateButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [needsHydration, setNeedsHydration] = useState<number | null>(null)

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/admin/hydrate')
      if (res.ok) {
        const data = await res.json()
        setNeedsHydration(data.needsHydration)
      }
    } catch {
      // Ignore errors silently
    }
  }

  const handleHydrate = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/hydrate', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setResult({
          success: true,
          message: data.message || `Hydrated ${data.hydrated} entities`,
        })
        setNeedsHydration(0)
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to hydrate embeddings',
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check status on mount
  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="inline-flex items-center gap-3">
      <Button
        onClick={handleHydrate}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="border-gold/30 hover:border-gold hover:bg-gold/10 text-xs"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Hydrating...
          </>
        ) : (
          <>
            <Zap className="w-3 h-3 mr-1" />
            Regenerate Embeddings
          </>
        )}
      </Button>

      {needsHydration !== null && needsHydration > 0 && !result && (
        <span className="text-xs text-muted-foreground">
          {needsHydration} entities need embeddings
        </span>
      )}

      {result && (
        <span className={`text-xs flex items-center gap-1 ${result.success ? 'text-green-500' : 'text-red-500'}`}>
          {result.success ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {result.message}
        </span>
      )}
    </div>
  )
}
