import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRegionById } from '@/lib/data/regions'
import { getMapLabels } from '@/lib/data/map-labels'
import MapMakerClient from './map-maker-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ region: string }>
}

export default async function MapMakerRegionPage({ params }: PageProps) {
  const { region: regionId } = await params
  const region = getRegionById(regionId)
  if (!region) notFound()

  const staticLabels = getMapLabels(regionId)

  return (
    <main className="relative">
      <div className="px-6 py-4 border-b border-gold/10 bg-charcoal-900/40 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-parchment-muted mb-1">
            <Link href="/admin/map-maker" className="hover:text-parchment transition-colors">
              ← Map Maker
            </Link>
          </div>
          <h1 className="text-xl font-serif" style={{ color: region.color }}>
            Editing: {region.name}
          </h1>
        </div>
        <Link
          href={`/map/${region.id}`}
          target="_blank"
          className="text-xs px-3 py-1.5 rounded-md border border-gold/20 text-gold hover:bg-gold/10 transition-colors"
        >
          Open public map ↗
        </Link>
      </div>
      <MapMakerClient region={region} staticLabels={staticLabels} />
    </main>
  )
}
