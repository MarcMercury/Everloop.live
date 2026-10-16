import { WORLD_LOCATIONS } from '@/lib/data/region-locations'

// ═══════════════════════════════════════════════════════════════
// UI OVERLAYS
// ═══════════════════════════════════════════════════════════════
export function MapLegend({ showSubLayers, onToggleLayers }: { showSubLayers: boolean; onToggleLayers: () => void }) {
  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="rounded-lg p-3 backdrop-blur-xl border border-gold/20" style={{ background: 'rgba(5, 10, 15, 0.9)' }}>
        <h4 className="text-xs font-serif text-parchment mb-2 uppercase tracking-wider">Explore the Everloop</h4>

        {/* Sub-layer toggle */}
        <button
          onClick={onToggleLayers}
          className="w-full mb-2 px-2 py-1.5 rounded text-[10px] font-medium transition-all border"
          style={{
            background: showSubLayers ? 'rgba(64, 160, 255, 0.15)' : 'rgba(212, 168, 75, 0.1)',
            borderColor: showSubLayers ? 'rgba(64, 160, 255, 0.3)' : 'rgba(212, 168, 75, 0.2)',
            color: showSubLayers ? '#40a0ff' : '#d4a84b',
          }}
        >
          {showSubLayers ? '◈ Hide Sub-Layers' : '◈ Reveal Sub-Layers'}
        </button>

        <div className="space-y-1.5">
          {[
            ...(showSubLayers
              ? [{ color: '#d4a060', label: 'The Structure', sub: 'Bone of the World' }]
              : [{ color: '#d4a84b', label: 'The Everloop', sub: 'The Living World' }]
            ),
          ].map(({ color, label, sub }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}80` }} />
              <div>
                <span className="text-xs text-parchment">{label}</span>
                <span className="text-[9px] text-parchment-muted ml-1.5">{sub}</span>
              </div>
            </div>
          ))}
        </div>



        <div className="mt-2 pt-2 border-t border-gold/10">
          <p className="text-[9px] text-parchment-muted italic leading-tight">
            Scroll to zoom · Drag to orbit
          </p>
        </div>

        {/* Region links */}
        <div className="mt-2 pt-2 border-t border-gold/10">
          <h4 className="text-xs font-serif text-parchment mb-1.5 uppercase tracking-wider">Regions</h4>
          <div className="space-y-1">
            {WORLD_LOCATIONS.map((r) => (
              <a
                key={r.id}
                href={`/map/${r.id}`}
                className="flex items-center gap-1.5 px-1 py-0.5 rounded transition-colors hover:bg-white/5"
              >
                <span className="text-[10px]">{r.emoji}</span>
                <span className="text-[11px] font-serif" style={{ color: r.color }}>{r.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
