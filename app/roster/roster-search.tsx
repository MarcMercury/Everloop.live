'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'

/**
 * Search box for the Roster. Updates the `q` URL param (debounced) while
 * preserving the active type/status filters so the server component can
 * filter the creator's entities by name, tagline, or description.
 */
export function RosterSearch({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()

  // Keep local state in sync if the URL changes externally (e.g. filter click).
  useEffect(() => {
    setValue(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    const handle = setTimeout(() => {
      const current = searchParams.get('q') ?? ''
      if (value === current) return

      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) {
        params.set('q', value.trim())
      } else {
        params.delete('q')
      }
      const queryString = params.toString()
      startTransition(() => {
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        })
      })
    }, 250)

    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className="relative w-full sm:max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search your roster by name, tagline, or description…"
        aria-label="Search roster"
        className="w-full pl-10 pr-10 py-2 rounded-lg bg-teal-deep/50 border border-gold/20
                   text-parchment placeholder:text-parchment-muted/60
                   focus:border-gold/50 focus:ring-1 focus:ring-gold/20 focus:outline-none"
      />
      {isPending ? (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-muted animate-spin" />
      ) : value ? (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment-muted hover:text-parchment transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      ) : null}
    </div>
  )
}
