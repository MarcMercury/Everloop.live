'use client'

import dynamic from 'next/dynamic'

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
  return (
    <div className="h-[calc(100vh-60px)]">
      <EverloopMap />
    </div>
  )
}
