'use client'

import Image from 'next/image'
import Link from 'next/link'
import { WORLD_LOCATIONS } from '@/lib/data/region-locations'

export default function MapPageClient() {
  return (
    <div className="relative h-[calc(100vh-60px)] bg-charcoal overflow-hidden">
      {/* Map image — fills the viewport */}
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
