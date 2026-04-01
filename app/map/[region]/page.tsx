import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getRegionById, getRegionIds } from '@/lib/data/regions'
import RegionMapClient from './region-map-client'

interface RegionMapPageProps {
  params: Promise<{ region: string }>
}

export async function generateStaticParams() {
  return getRegionIds().map((id) => ({ region: id }))
}

export async function generateMetadata({ params }: RegionMapPageProps) {
  const { region: regionId } = await params
  const region = getRegionById(regionId)
  if (!region) return { title: 'Region Not Found' }
  return {
    title: `${region.name} — Everloop Map`,
    description: region.description,
  }
}

function RegionMapSkeleton() {
  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center bg-charcoal">
      <div className="text-center animate-pulse">
        <div className="text-4xl mb-4">🗺️</div>
        <h2 className="text-xl font-serif text-parchment mb-2">Charting the region...</h2>
        <p className="text-parchment-muted text-sm">Preparing the map</p>
        <div className="mt-4 w-48 h-1 mx-auto rounded-full overflow-hidden bg-teal-mid">
          <div className="h-full w-1/3 bg-gold rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default async function RegionMapPage({ params }: RegionMapPageProps) {
  const { region: regionId } = await params
  const region = getRegionById(regionId)
  if (!region) notFound()

  return (
    <main className="flex-1 relative">
      <Suspense fallback={<RegionMapSkeleton />}>
        <RegionMapClient region={region} />
      </Suspense>
    </main>
  )
}
