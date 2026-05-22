import Link from 'next/link'
import { REGIONS } from '@/lib/data/regions'
import { getMapLabels } from '@/lib/data/map-labels'

export const metadata = {
  title: 'Map Maker | Admin | Everloop',
  description: 'Drag and reposition map locations for each region.',
}

export default function MapMakerIndexPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">Map Maker</h1>
        <p className="text-muted-foreground">
          Choose a region to drag-and-reposition its towns, cities, villages,
          landmarks, and canon entities. Edits sync to the public Interactive Maps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REGIONS.map((region) => {
          const labelCount = getMapLabels(region.id).length
          return (
            <Link
              key={region.id}
              href={`/admin/map-maker/${region.id}`}
              className="block rounded-xl p-5 border bg-navy/30 hover:bg-navy/50 transition-colors"
              style={{ borderColor: `${region.color}30` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: region.color, boxShadow: `0 0 12px ${region.color}80` }}
                />
                <h2 className="text-lg font-serif font-bold" style={{ color: region.color }}>
                  {region.name}
                </h2>
              </div>
              <p className="text-xs uppercase tracking-wider opacity-60 mb-3" style={{ color: region.color }}>
                {region.sub}
              </p>
              <div className="flex items-center justify-between text-xs text-parchment-muted">
                <span>{labelCount} static {labelCount === 1 ? 'label' : 'labels'}</span>
                <span>{region.mapImage ? 'Map available' : 'No map yet'}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
