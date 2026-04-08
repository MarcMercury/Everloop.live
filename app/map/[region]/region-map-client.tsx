'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { EverloopRegion } from '@/lib/data/regions'
import { getRegionLocations } from '@/lib/data/region-locations'
import { getMapLabels, type MapLabel } from '@/lib/data/map-labels'
import { LOCATION_DESCRIPTIONS } from '@/lib/data/location-descriptions'

interface RegionLocation {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  stability: number
  tags: string[]
  imageUrl: string | null
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
  const [locationKeyOpen, setLocationKeyOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [regionInfoOpen, setRegionInfoOpen] = useState(true)
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null)
  const [selectedLabel, setSelectedLabel] = useState<MapLabel | null>(null)
  const [allLocations, setAllLocations] = useState<RegionLocation[]>([])

  // Pan & zoom state for 2D map
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })
  const panOrigin = useRef({ x: 0, y: 0 })
  const didDrag = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const regionDirectory = getRegionLocations(region.id)
  const mapLabels = getMapLabels(region.id)

  // --- Pan & zoom handlers ---
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only pan with left mouse / single touch
    if (e.button !== 0) return
    isPanning.current = true
    didDrag.current = false
    panStart.current = { x: e.clientX, y: e.clientY }
    panOrigin.current = { ...pan }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }, [pan])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return
    const dx = e.clientX - panStart.current.x
    const dy = e.clientY - panStart.current.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true
    setPan({ x: panOrigin.current.x + dx, y: panOrigin.current.y + dy })
  }, [])

  const handlePointerUp = useCallback(() => {
    isPanning.current = false
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2

    setZoom(prevZoom => {
      const nextZoom = Math.min(8, Math.max(0.3, prevZoom - e.deltaY * 0.002))
      const factor = 1 - nextZoom / prevZoom
      setPan(p => ({
        x: p.x + (mouseX - cx - p.x) * factor,
        y: p.y + (mouseY - cy - p.y) * factor,
      }))
      return nextZoom
    })
  }, [])

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 })
    setZoom(1)
  }, [])

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
        // Deduplicate: exclude API pins whose name already appears as a static map label
        const labels = getMapLabels(region.id)
        const labelNames = new Set(labels.map((l) => l.name.toLowerCase()))
        const all = data.locations ?? []
        setAllLocations(all)
        const deduped = all.filter(
          (loc: RegionLocation) => !labelNames.has(loc.name.toLowerCase())
        )
        setLocations(deduped)
      } catch {
        // Silently fail — locations are optional overlay
      }
    }
    fetchLocations()
  }, [region.id])

  const handlePinClick = useCallback((loc: RegionLocation) => {
    setSelectedLocation(prev => prev?.id === loc.id ? null : loc)
    setSelectedLabel(null)
  }, [])

  const handleBackdropClick = useCallback(() => {
    setSelectedLocation(null)
    setSelectedLabel(null)
  }, [])

  // Helper: find the DB entity matching a static label by name
  const getLabelEntity = useCallback((name: string): RegionLocation | undefined => {
    return allLocations.find(loc => loc.name.toLowerCase() === name.toLowerCase())
  }, [allLocations])

  // Helper: generate a slug from a label name
  const nameToSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

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

      {/* Region header info — collapsible */}
      <div className="absolute top-4 right-4 z-20 max-w-sm">
        {regionInfoOpen ? (
          <div
            className="rounded-xl p-5 backdrop-blur-xl border relative"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 20, 25, 0.95), rgba(15, 30, 35, 0.92))',
              borderColor: `${region.color}30`,
              boxShadow: `0 0 30px ${region.color}15, 0 12px 40px rgba(0,0,0,0.5)`,
            }}
          >
            <button
              onClick={() => setRegionInfoOpen(false)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-parchment-muted hover:text-parchment transition-colors"
              style={{ background: `${region.color}15` }}
              aria-label="Collapse region info"
            >
              ✕
            </button>
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
        ) : (
          <button
            onClick={() => setRegionInfoOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-xl border transition-all hover:brightness-125"
            style={{
              background: 'rgba(5, 10, 15, 0.9)',
              borderColor: `${region.color}30`,
              color: region.color,
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: region.color, boxShadow: `0 0 8px ${region.color}80` }}
            />
            <span className="font-serif">{region.name}</span>
            <span className="text-[10px] opacity-60">ⓘ</span>
          </button>
        )}
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

      {/* Selected static-label detail panel */}
      {selectedLabel && (() => {
        const entity = getLabelEntity(selectedLabel.name)
        const desc = LOCATION_DESCRIPTIONS[selectedLabel.name]
        const dotColor = selectedLabel.size === 'city' ? '#f0d890' : selectedLabel.size === 'town' ? '#d4a84b' : selectedLabel.size === 'landmark' ? '#c090e0' : selectedLabel.size === 'ruin' ? '#888' : selectedLabel.size === 'tavern' ? '#d08040' : selectedLabel.size === 'outpost' ? '#80b0d0' : '#b0c090'
        const imageUrl = entity?.imageUrl ?? null
        const slug = entity?.slug ?? nameToSlug(selectedLabel.name)
        return (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-[380px] max-w-[calc(100vw-2rem)]">
            <div
              className="rounded-xl p-5 backdrop-blur-xl border"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 20, 25, 0.96), rgba(15, 30, 35, 0.93))',
                borderColor: `${dotColor}40`,
                boxShadow: `0 0 40px ${dotColor}20, 0 20px 60px rgba(0,0,0,0.5)`,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏛️</span>
                  <div>
                    <h3 className="text-lg font-serif font-bold" style={{ color: dotColor }}>
                      {selectedLabel.name}
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider opacity-70" style={{ color: dotColor }}>
                      {selectedLabel.size}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLabel(null)}
                  className="text-parchment-muted hover:text-parchment transition-colors p-1"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              {imageUrl && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3 border" style={{ borderColor: `${dotColor}30` }}>
                  <Image
                    src={imageUrl}
                    alt={selectedLabel.name}
                    fill
                    className="object-cover"
                    sizes="380px"
                    unoptimized
                  />
                </div>
              )}
              {desc && (
                <p className="text-sm text-parchment-muted leading-relaxed mb-3">
                  {desc.length > 200 ? desc.slice(0, 200) + '…' : desc}
                </p>
              )}
              {entity && (
                <div className="flex items-center gap-3 mb-3">
                  <div>
                    <span className="text-[10px] text-parchment-muted">Stability</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: `${dotColor}20` }}>
                        <div className="h-full rounded-full" style={{ width: `${entity.stability * 100}%`, background: dotColor }} />
                      </div>
                      <span className="text-[10px]" style={{ color: dotColor }}>{Math.round(entity.stability * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}
              <a
                href={`/explore/${slug}`}
                className="block text-center px-4 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-125"
                style={{
                  background: `${dotColor}20`,
                  color: dotColor,
                  border: `1px solid ${dotColor}40`,
                }}
              >
                View Full Entry →
              </a>
            </div>
          </div>
        )
      })()}

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
            {selectedLocation.imageUrl && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3 border" style={{ borderColor: `${getTypeColor(selectedLocation.type)}30` }}>
                <Image
                  src={selectedLocation.imageUrl}
                  alt={selectedLocation.name}
                  fill
                  className="object-cover"
                  sizes="380px"
                  unoptimized
                />
              </div>
            )}
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

      {/* Map content */}
      {region.mapImage ? (
        <div
          ref={containerRef}
          className="relative w-full h-[calc(100vh-60px)] overflow-hidden"
          style={{
            cursor: isPanning.current ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          onClick={(e) => { if (!didDrag.current) handleBackdropClick() }}
        >
          {/* Reset view button */}
          {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
            <button
              onClick={(e) => { e.stopPropagation(); resetView() }}
              className="absolute bottom-28 right-4 z-30 px-3 py-2 rounded-lg text-xs font-medium backdrop-blur-xl border transition-all hover:brightness-125"
              style={{
                background: 'rgba(5, 10, 15, 0.9)',
                borderColor: `${region.color}30`,
                color: region.color,
              }}
            >
              ↻ Reset View
            </button>
          )}

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

          {/* Region map image — pannable & zoomable */}
          <div
            className="relative w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isPanning.current ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            <Image
              src={region.mapImage}
              alt={`Map of ${region.name}`}
              fill
              className="object-contain transition-opacity duration-700"
              style={{ opacity: imageLoaded ? 1 : 0 }}
              onLoad={() => setImageLoaded(true)}
              priority
              sizes="100vw"
              draggable={false}
            />

            {/* Static map labels (location dots + names) */}
            {imageLoaded && mapLabels.map((label) => {
              const dotSize = label.size === 'city' ? 10 : label.size === 'town' ? 8 : label.size === 'landmark' ? 7 : 6
              const dotColor = label.size === 'city' ? '#f0d890' : label.size === 'town' ? '#d4a84b' : label.size === 'landmark' ? '#c090e0' : label.size === 'ruin' ? '#888' : label.size === 'tavern' ? '#d08040' : label.size === 'outpost' ? '#80b0d0' : '#b0c090'
              const desc = LOCATION_DESCRIPTIONS[label.name]
              const isLabelHovered = hoveredLabel === label.name

              return (
                <div
                  key={label.name}
                  className="absolute z-10 cursor-pointer"
                  style={{
                    left: `${label.x}%`,
                    top: `${label.z}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseEnter={() => setHoveredLabel(label.name)}
                  onMouseLeave={() => setHoveredLabel(null)}
                  onClick={(e) => { e.stopPropagation(); setSelectedLabel(selectedLabel?.name === label.name ? null : label); setSelectedLocation(null) }}
                >
                  <div
                    className="rounded-full transition-transform duration-150"
                    style={{
                      width: dotSize,
                      height: dotSize,
                      background: dotColor,
                      boxShadow: `0 0 ${dotSize}px ${dotColor}80, 0 0 ${dotSize * 2}px ${dotColor}30`,
                      border: `1px solid ${dotColor}`,
                      transform: isLabelHovered ? 'scale(1.4)' : 'scale(1)',
                    }}
                  />
                  {/* Persistent label name */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
                    style={{ top: dotSize + 2 }}
                  >
                    <span
                      className="text-[10px] font-serif font-bold px-1 py-0.5 rounded"
                      style={{
                        color: dotColor,
                        textShadow: '0 0 6px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)',
                        background: isLabelHovered ? 'rgba(5,10,15,0.8)' : 'transparent',
                      }}
                    >
                      {label.name}
                    </span>
                  </div>
                  {/* Description popup */}
                  {isLabelHovered && desc && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                      style={{ bottom: dotSize + 8 }}
                    >
                      <div
                        className="rounded-lg px-3 py-2 backdrop-blur-xl border text-left"
                        style={{
                          background: 'linear-gradient(135deg, rgba(10, 20, 25, 0.96), rgba(15, 30, 35, 0.93))',
                          borderColor: `${dotColor}40`,
                          boxShadow: `0 0 20px ${dotColor}15, 0 8px 24px rgba(0,0,0,0.5)`,
                          width: '260px',
                          maxWidth: '50vw',
                        }}
                      >
                        <h4 className="text-xs font-serif font-bold mb-1" style={{ color: dotColor }}>
                          {label.name}
                        </h4>
                        <p className="text-[10px] leading-relaxed text-parchment-muted">
                          {desc}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

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
                  onClick={(e) => { e.stopPropagation(); if (!didDrag.current) handlePinClick(loc) }}
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
      ) : (
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
      )}

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
