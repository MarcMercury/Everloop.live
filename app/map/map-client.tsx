'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { WORLD_LOCATIONS } from '@/lib/data/region-locations'

export default function MapPageClient() {
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })
  const panOrigin = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    isPanning.current = true
    panStart.current = { x: e.clientX, y: e.clientY }
    panOrigin.current = { ...pan }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }, [pan])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return
    const dx = e.clientX - panStart.current.x
    const dy = e.clientY - panStart.current.y
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

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100vh-60px)] bg-charcoal overflow-hidden"
      style={{ cursor: isPanning.current ? 'grabbing' : 'grab', touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning.current ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        <Image
          src="/everloop-map-base.png"
          alt="The Everloop — Interactive World Map"
          fill
          className="object-contain"
          priority
          quality={100}
          draggable={false}
        />
      </div>

      {/* Reset view button */}
      {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
        <button
          onClick={(e) => { e.stopPropagation(); resetView() }}
          className="absolute bottom-20 right-4 z-20 px-3 py-2 rounded-lg text-xs font-medium backdrop-blur-xl border transition-all hover:brightness-125"
          style={{
            background: 'rgba(5, 10, 15, 0.9)',
            borderColor: 'rgba(212, 168, 75, 0.3)',
            color: '#d4a84b',
          }}
        >
          ↻ Reset View
        </button>
      )}

      {/* Legend panel */}
      <div className="absolute top-4 left-4 z-10">
        <div className="rounded-lg p-3 backdrop-blur-xl border border-gold/20" style={{ background: 'rgba(5, 10, 15, 0.9)' }}>
          <h4 className="text-xs font-serif text-parchment mb-2 uppercase tracking-wider">Explore the Everloop</h4>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#d4a84b', boxShadow: '0 0 6px #d4a84b80' }} />
            <div>
              <span className="text-xs text-parchment">The Everloop</span>
              <span className="text-[9px] text-parchment-muted ml-1.5">The Living World</span>
            </div>
          </div>

          <div className="mb-2 pt-1 border-t border-gold/10">
            <p className="text-[9px] text-parchment-muted italic leading-tight">
              Drag to pan · Scroll to zoom
            </p>
          </div>

          {/* Region links */}
          <div className="pt-2 border-t border-gold/10">
            <h4 className="text-xs font-serif text-parchment mb-1.5 uppercase tracking-wider">Regions</h4>
            <div className="space-y-1">
              {WORLD_LOCATIONS.map((r) => (
                <Link
                  key={r.id}
                  href={`/map/${r.id}`}
                  className="flex items-center gap-1.5 px-1 py-0.5 rounded transition-colors hover:bg-white/5"
                >
                  <span className="text-[10px]">{r.emoji}</span>
                  <span className="text-[11px] font-serif" style={{ color: r.color }}>{r.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
