'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { MapLocation } from '@/components/map/everloop-map'

// Dynamically import the 3D map to avoid SSR issues with Three.js
const EverloopMap = dynamic(() => import('@/components/map/everloop-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-60px)] flex items-center justify-center bg-charcoal">
      <div className="text-center animate-pulse">
        <div className="text-4xl mb-4">🗺️</div>
        <h2 className="text-xl font-serif text-parchment mb-2">Rendering the world...</h2>
        <p className="text-parchment-muted text-sm">Loading 3D engine</p>
      </div>
    </div>
  ),
})

export default function MapPageClient() {
  const [locations, setLocations] = useState<MapLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch('/api/map/locations')
        if (!res.ok) throw new Error('Failed to load map data')
        const data = await res.json()
        setLocations(data.locations ?? [])
      } catch (err) {
        console.error('Map data fetch error:', err)
        setError('Could not load map data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchLocations()
  }, [])

  if (loading) {
    return (
      <div className="h-[calc(100vh-60px)] flex items-center justify-center bg-charcoal">
        <div className="text-center animate-pulse">
          <div className="text-4xl mb-4">🗺️</div>
          <h2 className="text-xl font-serif text-parchment mb-2">Charting the Everloop...</h2>
          <p className="text-parchment-muted text-sm">Fetching canonical locations</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-60px)] flex items-center justify-center bg-charcoal">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-serif text-parchment mb-2">Map Unavailable</h2>
          <p className="text-parchment-muted text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-60px)]">
      <EverloopMap locations={locations} />
    </div>
  )
}
