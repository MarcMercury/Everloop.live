import { Suspense } from 'react'
import MapPageClient from './map-client'

export const metadata = {
  title: 'Explore the Everloop — World Map',
  description: 'Navigate the living world of the Everloop. Discover canonical locations, landmarks, and territories revealed through community storytelling.',
}

function MapSkeleton() {
  return (
    <div className="h-[calc(100vh-60px)] flex items-center justify-center bg-charcoal">
      <div className="text-center animate-pulse">
        <div className="text-4xl mb-4">🗺️</div>
        <h2 className="text-xl font-serif text-parchment mb-2">Charting the Everloop...</h2>
        <p className="text-parchment-muted text-sm">Preparing the world map</p>
        <div className="mt-4 w-48 h-1 mx-auto rounded-full overflow-hidden bg-teal-mid">
          <div className="h-full w-1/3 bg-gold rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default function MapPage() {
  return (
    <main className="flex-1 relative">
      <Suspense fallback={<MapSkeleton />}>
        <MapPageClient />
      </Suspense>
    </main>
  )
}
