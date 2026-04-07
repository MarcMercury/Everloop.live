'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { WORLD_LOCATIONS } from '@/lib/data/region-locations'

const EverloopMap3D = dynamic(() => import('@/components/map/everloop-map-3d'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-charcoal">
      <div className="text-center animate-pulse">
        <div className="text-4xl mb-4">🗺️</div>
        <h2 className="text-xl font-serif text-parchment mb-2">Rendering terrain...</h2>
        <p className="text-parchment-muted text-sm">Loading 3D engine</p>
      </div>
    </div>
  ),
})

export default function MapPageClient() {
  const [view3D, setView3D] = useState(false)
  const toggleView = useCallback(() => setView3D(prev => !prev), [])

  return (
    <div className="relative h-[calc(100vh-60px)] bg-charcoal overflow-hidden">
      {view3D ? (
        <EverloopMap3D />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/everloop-map-base.png"
            alt="The Everloop — Interactive World Map"
            fill
            className="object-contain"
            priority
            quality={100}
          />
        </div>
      )}

      {/* Legend panel */}
      <div className="absolute top-4 left-4 z-10">
        <div className="rounded-lg p-3 backdrop-blur-xl border border-gold/20" style={{ background: 'rgba(5, 10, 15, 0.9)' }}>
          <h4 className="text-xs font-serif text-parchment mb-2 uppercase tracking-wider">Explore the Everloop</h4>

          {/* 3D toggle */}
          <button
            onClick={toggleView}
            className="w-full mb-2 px-2 py-1.5 rounded text-[10px] font-medium transition-all border"
            style={{
              background: view3D ? 'rgba(64, 160, 255, 0.15)' : 'rgba(212, 168, 75, 0.1)',
              borderColor: view3D ? 'rgba(64, 160, 255, 0.3)' : 'rgba(212, 168, 75, 0.2)',
              color: view3D ? '#40a0ff' : '#d4a84b',
            }}
          >
            {view3D ? '◈ Return to 2D Map' : '◈ Explore in 3D'}
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#d4a84b', boxShadow: '0 0 6px #d4a84b80' }} />
            <div>
              <span className="text-xs text-parchment">The Everloop</span>
              <span className="text-[9px] text-parchment-muted ml-1.5">The Living World</span>
            </div>
          </div>

          {view3D && (
            <div className="mb-2 pt-1 border-t border-gold/10">
              <p className="text-[9px] text-parchment-muted italic leading-tight">
                Drag to orbit · Scroll to zoom · Right-drag to pan
              </p>
            </div>
          )}

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
