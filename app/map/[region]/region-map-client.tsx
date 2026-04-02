'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { EverloopRegion } from '@/lib/data/regions'
import { getRegionLocations } from '@/lib/data/region-locations'
import { Generate3DButton } from '@/components/3d/generate-3d-button'

// Dynamic import to avoid SSR issues with Three.js
const ModelViewer = dynamic(
  () => import('@/components/3d/model-viewer').then((mod) => mod.ModelViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-charcoal">
        <div className="text-center animate-pulse">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-parchment-muted text-sm">Loading 3D terrain...</p>
        </div>
      </div>
    ),
  }
)

interface RegionLocation {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  stability: number
  tags: string[]
  x: number
  z: number
  createdAt: string
}

interface RegionMapClientProps {
  region: EverloopRegion
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    location: '🏛️', character: '👤', artifact: '✨',
    faction: '⚔️', creature: '🐉', event: '📜', concept: '💭',
  }
  return icons[type] || '◈'
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    location: '#d4a84b', character: '#6ec6ff', artifact: '#e066ff',
    faction: '#ff6b6b', creature: '#66ff9e', event: '#ffaa66', concept: '#66d9ff',
  }
  return colors[type] || '#d4a84b'
}

function getCategoryIcon(heading: string): string {
  const lower = heading.toLowerCase()
  if (lower.includes('city') || lower.includes('cities')) return '🏙️'
  if (lower.includes('town')) return '🏘️'
  if (lower.includes('village')) return '🏡'
  if (lower.includes('settlement')) return '⛺'
  if (lower.includes('outpost') || lower.includes('fort')) return '🏰'
  if (lower.includes('ruin') || lower.includes('anomal')) return '🏚️'
  if (lower.includes('tavern') || lower.includes('armori')) return '🍺'
  if (lower.includes('key')) return '📍'
  return '◈'
}

export default function RegionMapClient({ region }: RegionMapClientProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [locations, setLocations] = useState<RegionLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<RegionLocation | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>(region.model3dPath ? '3d' : '2d')
  const [generated3dUrl, setGenerated3dUrl] = useState<string | null>(null)
  const [locationKeyOpen, setLocationKeyOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const regionDirectory = getRegionLocations(region.id)

  const toggleCategory = useCallback((heading: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(heading)) next.delete(heading)
      else next.add(heading)
      return next
    })
  }, [])

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch(`/api/map/regions/${region.id}/locations`)
        if (!res.ok) return
        const data = await res.json()
        setLocations(data.locations ?? [])
      } catch {
        // Silently fail — locations are optional overlay
      }
    }
    fetchLocations()
  }, [region.id])

  const handlePinClick = useCallback((loc: RegionLocation) => {
    setSelectedLocation(prev => prev?.id === loc.id ? null : loc)
  }, [])

  const handleBackdropClick = useCallback(() => {
    setSelectedLocation(null)
  }, [])

  return (
    <div className="min-h-[calc(100vh-60px)] bg-charcoal relative">
      {/* Back navigation */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          href="/map"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-xl border transition-all hover:brightness-125"
          style={{
            background: 'rgba(5, 10, 15, 0.9)',
            borderColor: `${region.color}30`,
            color: region.color,
          }}
        >
          ← Back to World Map
        </Link>
      </div>

      {/* Region header info */}
      <div className="absolute top-4 right-4 z-20 max-w-sm">
        <div
          className="rounded-xl p-5 backdrop-blur-xl border"
          style={{
            background: 'linear-gradient(135deg, rgba(10, 20, 25, 0.95), rgba(15, 30, 35, 0.92))',
            borderColor: `${region.color}30`,
            boxShadow: `0 0 30px ${region.color}15, 0 12px 40px rgba(0,0,0,0.5)`,
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ background: region.color, boxShadow: `0 0 12px ${region.color}80` }}
            />
            <div>
              <h1 className="text-xl font-serif font-bold" style={{ color: region.color }}>
                {region.name}
              </h1>
              <span
                className="text-[11px] uppercase tracking-wider opacity-60"
                style={{ color: region.color }}
              >
                {region.sub}
              </span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-parchment-muted">
            {region.description}
          </p>
          {locations.length > 0 && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: `${region.color}20` }}>
              <span className="text-[10px] uppercase tracking-wider text-parchment-muted">
                {locations.length} canonical {locations.length === 1 ? 'location' : 'locations'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Location Key / Nav */}
      {regionDirectory && (
        <div className="absolute top-20 left-4 z-20" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {/* Toggle button */}
          <button
            onClick={() => setLocationKeyOpen(prev => !prev)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-xl border transition-all hover:brightness-125"
            style={{
              background: 'rgba(5, 10, 15, 0.9)',
              borderColor: `${region.color}30`,
              color: region.color,
            }}
          >
            <span className="text-base">{regionDirectory.emoji}</span>
            <span className="font-serif">Location Key</span>
            <svg
              className="w-3.5 h-3.5 transition-transform duration-200"
              style={{ transform: locationKeyOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Expanded panel */}
          {locationKeyOpen && (
            <div
              className="mt-2 rounded-xl backdrop-blur-xl border overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(5, 10, 15, 0.95), rgba(10, 20, 25, 0.92))',
                borderColor: `${region.color}25`,
                boxShadow: `0 0 30px ${region.color}10, 0 12px 40px rgba(0,0,0,0.5)`,
                maxHeight: 'calc(100vh - 200px)',
                width: '280px',
              }}
            >
              {/* Panel header */}
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: `${region.color}15` }}
              >
                <h3 className="text-sm font-serif font-bold" style={{ color: region.color }}>
                  {regionDirectory.name}
                </h3>
                <span className="text-[10px] text-parchment-muted">
                  {regionDirectory.categories.reduce((sum, c) => sum + c.items.length, 0)} known locations
                </span>
              </div>

              {/* Scrollable categories */}
              <div
                className="overflow-y-auto overscroll-contain"
                style={{ maxHeight: 'calc(100vh - 270px)' }}
              >
                {regionDirectory.categories.map((cat) => {
                  const isExpanded = expandedCategories.has(cat.heading)
                  return (
                    <div key={cat.heading} className="border-b" style={{ borderColor: `${region.color}08` }}>
                      {/* Category header – clickable to expand/collapse */}
                      <button
                        onClick={() => toggleCategory(cat.heading)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[11px]">{getCategoryIcon(cat.heading)}</span>
                          <span className="text-xs font-serif font-semibold tracking-wide" style={{ color: `${region.color}cc` }}>
                            {cat.heading}
                          </span>
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full"
                            style={{ background: `${region.color}15`, color: `${region.color}80` }}
                          >
                            {cat.items.length}
                          </span>
                        </div>
                        <svg
                          className="w-3 h-3 transition-transform duration-200"
                          style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            color: `${region.color}60`,
                          }}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Location items */}
                      {isExpanded && (
                        <div className="px-3 pb-2">
                          {cat.items.map((item) => (
                            <div
                              key={item}
                              className="flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors hover:bg-white/[0.04] group"
                            >
                              {/* Placeholder for future render thumbnail */}
                              <div
                                className="w-7 h-7 rounded flex-shrink-0 flex items-center justify-center border"
                                style={{
                                  background: `${region.color}08`,
                                  borderColor: `${region.color}15`,
                                }}
                              >
                                <span className="text-[10px] opacity-40" style={{ color: region.color }}>
                                  {getCategoryIcon(cat.heading)}
                                </span>
                              </div>
                              <span
                                className="text-[11px] font-serif leading-tight group-hover:brightness-125 transition-all"
                                style={{ color: `${region.color}bb` }}
                              >
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected location detail panel */}
      {selectedLocation && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-[380px] max-w-[calc(100vw-2rem)]">
          <div
            className="rounded-xl p-5 backdrop-blur-xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 20, 25, 0.96), rgba(15, 30, 35, 0.93))',
              borderColor: `${getTypeColor(selectedLocation.type)}40`,
              boxShadow: `0 0 40px ${getTypeColor(selectedLocation.type)}20, 0 20px 60px rgba(0,0,0,0.5)`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getTypeIcon(selectedLocation.type)}</span>
                <div>
                  <h3 className="text-lg font-serif font-bold" style={{ color: getTypeColor(selectedLocation.type) }}>
                    {selectedLocation.name}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider opacity-70" style={{ color: getTypeColor(selectedLocation.type) }}>
                    {selectedLocation.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-parchment-muted hover:text-parchment transition-colors p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {selectedLocation.description && (
              <p className="text-sm text-parchment-muted leading-relaxed mb-3">
                {selectedLocation.description.length > 200
                  ? selectedLocation.description.slice(0, 200) + '…'
                  : selectedLocation.description}
              </p>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div>
                <span className="text-[10px] text-parchment-muted">Stability</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: `${getTypeColor(selectedLocation.type)}20` }}>
                    <div className="h-full rounded-full" style={{ width: `${selectedLocation.stability * 100}%`, background: getTypeColor(selectedLocation.type) }} />
                  </div>
                  <span className="text-[10px]" style={{ color: getTypeColor(selectedLocation.type) }}>{Math.round(selectedLocation.stability * 100)}%</span>
                </div>
              </div>
            </div>
            {selectedLocation.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedLocation.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-[10px] border"
                    style={{
                      borderColor: `${getTypeColor(selectedLocation.type)}30`,
                      color: `${getTypeColor(selectedLocation.type)}cc`,
                      background: `${getTypeColor(selectedLocation.type)}10`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <a
              href={`/explore/${selectedLocation.slug}`}
              className="block text-center px-4 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-125"
              style={{
                background: `${getTypeColor(selectedLocation.type)}20`,
                color: getTypeColor(selectedLocation.type),
                border: `1px solid ${getTypeColor(selectedLocation.type)}40`,
              }}
            >
              View Full Entry →
            </a>
          </div>
        </div>
      )}

      {/* 2D / 3D View Toggle */}
      {(region.model3dPath || region.mapImage) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-lg overflow-hidden backdrop-blur-xl border"
          style={{
            background: 'rgba(5, 10, 15, 0.9)',
            borderColor: `${region.color}30`,
          }}
        >
          <button
            onClick={() => setViewMode('2d')}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              viewMode === '2d'
                ? 'text-parchment'
                : 'text-parchment-muted hover:text-parchment'
            }`}
            style={viewMode === '2d' ? { background: `${region.color}20`, color: region.color } : {}}
          >
            🗺️ 2D Map
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              viewMode === '3d'
                ? 'text-parchment'
                : 'text-parchment-muted hover:text-parchment'
            }`}
            style={viewMode === '3d' ? { background: `${region.color}20`, color: region.color } : {}}
          >
            📦 3D Terrain
          </button>
          {!region.model3dPath && !generated3dUrl && region.mapImage && (
            <div className="px-2 border-l" style={{ borderColor: `${region.color}20` }}>
              <Generate3DButton
                mode="image-to-3d"
                input={region.mapImage.startsWith('/') ? `${typeof window !== 'undefined' ? window.location.origin : ''}${region.mapImage}` : region.mapImage}
                onComplete={(glbUrl) => {
                  setGenerated3dUrl(glbUrl)
                  setViewMode('3d')
                }}
                label="Generate"
                size="sm"
                options={{ enable_pbr: true }}
              />
            </div>
          )}
        </div>
      )}

      {/* 3D Terrain View */}
      {viewMode === '3d' && (region.model3dPath || generated3dUrl) && (
        <div className="relative w-full h-[calc(100vh-60px)]">
          <ModelViewer
            modelUrl={region.model3dPath || generated3dUrl!}
            className="w-full h-full"
            autoRotate={false}
          />
          {/* Atmospheric border glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 100px ${region.color}15`,
            }}
          />
        </div>
      )}

      {/* 2D Map content */}
      {viewMode === '2d' && region.mapImage ? (
        <div
          className="relative w-full h-[calc(100vh-60px)] overflow-hidden"
          onClick={handleBackdropClick}
        >
          {/* Loading state */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal z-10">
              <div className="text-center animate-pulse">
                <div className="text-4xl mb-4">🗺️</div>
                <h2 className="text-xl font-serif text-parchment mb-2">
                  Rendering {region.name}...
                </h2>
                <p className="text-parchment-muted text-sm">Loading regional map</p>
              </div>
            </div>
          )}

          {/* Region map image */}
          <div className="relative w-full h-full">
            <Image
              src={region.mapImage}
              alt={`Map of ${region.name}`}
              fill
              className="object-contain transition-opacity duration-700"
              style={{ opacity: imageLoaded ? 1 : 0 }}
              onLoad={() => setImageLoaded(true)}
              priority
              sizes="100vw"
            />

            {/* Location pins overlaid on the map */}
            {imageLoaded && locations.map((loc) => {
              const color = getTypeColor(loc.type)
              const isSelected = selectedLocation?.id === loc.id
              const isHovered = hoveredLocation === loc.id

              return (
                <button
                  key={loc.id}
                  className="absolute transform -translate-x-1/2 -translate-y-full z-20 group"
                  style={{
                    left: `${loc.x}%`,
                    top: `${loc.z}%`,
                    transition: 'transform 0.15s ease',
                    transform: `translate(-50%, -100%) scale(${isSelected ? 1.3 : isHovered ? 1.15 : 1})`,
                  }}
                  onClick={(e) => { e.stopPropagation(); handlePinClick(loc) }}
                  onMouseEnter={() => setHoveredLocation(loc.id)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  aria-label={loc.name}
                >
                  {/* Pin marker */}
                  <div className="relative flex flex-col items-center">
                    {/* Glow */}
                    <div
                      className="absolute -inset-2 rounded-full blur-md"
                      style={{
                        background: color,
                        opacity: isSelected ? 0.4 : isHovered ? 0.25 : 0.1,
                        transition: 'opacity 0.15s ease',
                      }}
                    />
                    {/* Icon circle */}
                    <div
                      className="relative w-8 h-8 rounded-full flex items-center justify-center border-2"
                      style={{
                        background: `linear-gradient(135deg, rgba(10, 20, 25, 0.95), rgba(15, 30, 35, 0.9))`,
                        borderColor: isSelected ? color : `${color}80`,
                        boxShadow: `0 0 ${isSelected ? 16 : 8}px ${color}50, 0 2px 8px rgba(0,0,0,0.5)`,
                      }}
                    >
                      <span className="text-sm">{getTypeIcon(loc.type)}</span>
                    </div>
                    {/* Pin stem */}
                    <div
                      className="w-0.5 h-2"
                      style={{ background: `${color}60` }}
                    />
                    {/* Pin dot at bottom */}
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: color, boxShadow: `0 0 4px ${color}80` }}
                    />
                    {/* Label */}
                    <div
                      className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
                    >
                      <span
                        className="text-[10px] font-serif font-bold px-1.5 py-0.5 rounded"
                        style={{
                          color,
                          textShadow: '0 0 6px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)',
                          background: isHovered || isSelected ? 'rgba(5,10,15,0.8)' : 'transparent',
                        }}
                      >
                        {loc.name}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Atmospheric vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, transparent 50%, rgba(3,3,8,0.6) 100%)`,
            }}
          />

          {/* Bottom gradient fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(3,3,8,0.8) 0%, transparent 100%)',
            }}
          />
        </div>
      ) : viewMode === '2d' ? (
        /* Placeholder for regions without map images yet */
        <div className="relative w-full h-[calc(100vh-60px)] flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, ${region.color}08 0%, rgba(3,3,8,1) 70%)`,
            }}
          />

          <div className="relative text-center max-w-lg px-6">
            <div
              className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center"
              style={{
                background: `${region.color}10`,
                border: `2px solid ${region.color}30`,
                boxShadow: `0 0 60px ${region.color}15`,
              }}
            >
              <span className="text-6xl">🌫️</span>
            </div>
            <h2
              className="text-3xl font-serif font-bold mb-3"
              style={{ color: region.color }}
            >
              {region.name}
            </h2>
            <p className="text-parchment-muted text-sm leading-relaxed mb-6">
              This region&apos;s map has not yet been charted. The cartographers of the Everloop
              are still surveying {region.name.replace(/^The /, '')}. Check back as the world
              continues to reveal itself.
            </p>

            {/* Show locations as a list even without a map image */}
            {locations.length > 0 && (
              <div className="mb-6 text-left">
                <h3 className="text-xs uppercase tracking-wider text-parchment-muted mb-3">
                  Known Locations in This Region
                </h3>
                <div className="space-y-2">
                  {locations.map((loc) => (
                    <a
                      key={loc.id}
                      href={`/explore/${loc.slug}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:brightness-125"
                      style={{
                        background: `${getTypeColor(loc.type)}08`,
                        borderColor: `${getTypeColor(loc.type)}20`,
                      }}
                    >
                      <span>{getTypeIcon(loc.type)}</span>
                      <span className="text-sm font-serif" style={{ color: getTypeColor(loc.type) }}>
                        {loc.name}
                      </span>
                      <span className="text-[10px] text-parchment-muted ml-auto">{loc.type}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div
              className="inline-block px-4 py-2 rounded-lg text-xs font-medium border"
              style={{
                background: `${region.color}10`,
                borderColor: `${region.color}30`,
                color: `${region.color}aa`,
              }}
            >
              Map Coming Soon
            </div>
          </div>
        </div>
      ) : null}

      {/* Bottom region navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div
          className="rounded-xl px-4 py-3 backdrop-blur-xl border flex items-center gap-2"
          style={{
            background: 'rgba(5, 10, 15, 0.9)',
            borderColor: `${region.color}20`,
          }}
        >
          <span className="text-[10px] text-parchment-muted uppercase tracking-wider mr-2">
            Region
          </span>
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: region.color, boxShadow: `0 0 6px ${region.color}80` }}
          />
          <span className="text-xs font-serif font-bold" style={{ color: region.color }}>
            {region.name}
          </span>
          <span className="text-[10px] text-parchment-muted mx-1">·</span>
          <span className="text-[10px] italic text-parchment-muted">{region.sub}</span>
        </div>
      </div>
    </div>
  )
}
