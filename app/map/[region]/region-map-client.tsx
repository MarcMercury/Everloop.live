'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { EverloopRegion } from '@/lib/data/regions'

interface RegionMapClientProps {
  region: EverloopRegion
}

export default function RegionMapClient({ region }: RegionMapClientProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

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
        </div>
      </div>

      {/* Map content */}
      {region.mapImage ? (
        <div className="relative w-full h-[calc(100vh-60px)] overflow-hidden">
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

          {/* Region map image with pan/zoom feel */}
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
          {/* Atmospheric background */}
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
