'use client'

import { useEffect } from 'react'
import { BookX, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function StoriesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Stories Error]', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 rounded-full bg-red-500/10">
            <BookX className="w-12 h-12 text-red-500" />
          </div>
        </div>
        
        <h2 className="text-2xl font-serif mb-2 text-parchment">
          Library Error
        </h2>
        
        <p className="text-parchment-muted mb-6">
          {error.message || 'Could not load the story library.'}
        </p>
        
        {error.digest && (
          <p className="text-xs text-parchment-muted/50 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/20 text-gold hover:bg-gold/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <Link
            href="/explore"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-charcoal-700 text-parchment hover:bg-charcoal-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Explore
          </Link>
        </div>
      </div>
    </div>
  )
}
