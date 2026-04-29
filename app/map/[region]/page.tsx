import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getRegionById, getRegionIds } from '@/lib/data/regions'
import { getRegionalState } from '@/lib/data/world-state'
import { getShardsByRegion } from '@/lib/data/world-state'
import { getStoriesByRegion } from '@/lib/data/cross-references'
import RegionMapClient from './region-map-client'
import { FrayIndicator, MonsterWarning } from '@/components/world-pulse'
import Link from 'next/link'
import type { RegionId } from '@/lib/data/regions'

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

  const [regionalState, shards, stories] = await Promise.all([
    getRegionalState(regionId as RegionId),
    getShardsByRegion(regionId),
    getStoriesByRegion(regionId),
  ])

  return (
    <main className="flex-1 relative">
      <Suspense fallback={<RegionMapSkeleton />}>
        <RegionMapClient region={region} />
      </Suspense>

      {/* Regional State Overlay */}
      <div className="absolute bottom-4 left-4 max-w-xs space-y-3 z-10">
        {/* Fray Status */}
        {regionalState && (
          <div className="p-3 rounded-lg bg-charcoal-900/90 backdrop-blur border border-gold/10 space-y-2">
            <h3 className="text-xs font-serif text-gold">{region.name} — World State</h3>
            <FrayIndicator intensity={regionalState.fray_intensity} showDescription />
            <MonsterWarning frayIntensity={regionalState.fray_intensity} />
            <div className="grid grid-cols-2 gap-2 text-[10px] text-parchment-muted pt-1 border-t border-gold/5">
              <div>Stability: <span className="text-parchment">{Math.round(regionalState.stability_index * 100)}%</span></div>
              <div>Shards Known: <span className="text-gold">{regionalState.shards_known}</span></div>
              <div>Campaigns: <span className="text-parchment">{regionalState.active_campaigns}</span></div>
              <div>Stories: <span className="text-parchment">{regionalState.canonical_stories}</span></div>
            </div>
          </div>
        )}

        {/* Shard Presence */}
        {shards.length > 0 && (
          <div className="p-3 rounded-lg bg-purple-900/80 backdrop-blur border border-purple-500/20 space-y-1.5">
            <h3 className="text-xs font-serif text-purple-300">Shard Presence</h3>
            {shards.map(shard => (
              <div key={shard.id} className="flex items-center justify-between text-[10px]">
                <span className="text-purple-200">{shard.name}</span>
                <span className="text-purple-400 capitalize">{shard.state} ⚡{shard.power_level}</span>
              </div>
            ))}
            <p className="text-[9px] text-purple-400/50 italic pt-1">
              The Shards pull toward each other across the breaking world.
            </p>
          </div>
        )}

        {/* Cultural Lens — Attunement roles, regional concepts, time note */}
        {(region.attunementRoles || region.culturalConcepts || region.timeNote) && (
          <div className="p-3 rounded-lg bg-charcoal-900/90 backdrop-blur border border-gold/10 space-y-2">
            <h3 className="text-xs font-serif text-gold">Cultural Lens</h3>

            {region.attunementRoles && (
              <div className="space-y-1">
                <p className="text-[9px] uppercase tracking-wider text-parchment-muted">Attunements</p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-parchment-muted">Vaultkeeper:</span>{' '}
                    <span className="text-parchment">{region.attunementRoles.vaultkeeper}</span>
                  </div>
                  <div>
                    <span className="text-parchment-muted">Dreamer:</span>{' '}
                    <span className="text-parchment">{region.attunementRoles.dreamer}</span>
                  </div>
                </div>
              </div>
            )}

            {region.culturalConcepts && region.culturalConcepts.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-gold/5">
                <p className="text-[9px] uppercase tracking-wider text-parchment-muted">Regional Truths</p>
                <ul className="text-[10px] text-parchment space-y-0.5">
                  {region.culturalConcepts.map((concept) => (
                    <li key={concept} className="flex gap-1.5">
                      <span className="text-gold/60">•</span>
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {region.timeNote && (
              <div className="space-y-1 pt-1 border-t border-gold/5">
                <p className="text-[9px] uppercase tracking-wider text-parchment-muted">On Time</p>
                <p className="text-[10px] text-parchment-muted italic leading-snug">{region.timeNote}</p>
              </div>
            )}

            <p className="text-[9px] text-parchment-muted/60 pt-1 italic">
              Every region holds a valid but incomplete truth.{' '}
              <Link href="/explore?type=concept" className="text-gold/70 hover:text-gold">
                Read the principle →
              </Link>
            </p>
          </div>
        )}

        {/* Canon Stories set here */}
        {stories.length > 0 && (
          <div className="p-3 rounded-lg bg-charcoal-900/90 backdrop-blur border border-gold/10 space-y-1.5">
            <h3 className="text-xs font-serif text-gold">Canon Stories in {region.name}</h3>
            {stories.slice(0, 3).map(story => (
              <Link
                key={story.id}
                href={`/stories/${story.slug}`}
                className="block text-[10px] text-parchment hover:text-gold transition-colors"
              >
                {story.title} <span className="text-parchment-muted">by {story.author_username}</span>
              </Link>
            ))}
            {stories.length > 3 && (
              <span className="text-[10px] text-parchment-muted">+{stories.length - 3} more</span>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
