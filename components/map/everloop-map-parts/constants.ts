// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
export const SURFACE_Y = 30
export const PATTERN_Y = 12
export const FOLD_Y = -2
export const DRIFT_Y = -20

// Map surface dimensions matching image aspect ratio (3:2)
export const MAP_WIDTH = 240
export const MAP_HEIGHT = 160
export const MAP_HALF_W = MAP_WIDTH / 2
export const MAP_HALF_H = MAP_HEIGHT / 2

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
export function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

/** Gentle dome height at a point on the map surface */
export function getSurfaceHeight(wx: number, wz: number): number {
  const nx = wx / MAP_HALF_W
  const nz = wz / MAP_HALF_H
  const dist = Math.sqrt(nx * nx + nz * nz)
  return Math.max(0, (1 - dist * dist * 0.5) * 3)
}

// ═══════════════════════════════════════════════════════════════
// 8 REGIONS OF THE EVERLOOP
// ═══════════════════════════════════════════════════════════════
export type RegionId = 'deyune' | 'virelay' | 'bellroot' | 'ashen' | 'glass' | 'varnhalt' | 'luminous' | 'drowned'

export function getShardColor(region: RegionId): { color: string; emissive: string } {
  switch (region) {
    case 'deyune':   return { color: '#e0c060', emissive: '#c0a040' }
    case 'virelay':  return { color: '#9070c0', emissive: '#7050a0' }
    case 'bellroot': return { color: '#40e080', emissive: '#30b060' }
    case 'ashen':    return { color: '#ff6040', emissive: '#cc4030' }
    case 'glass':    return { color: '#c0e0ff', emissive: '#90c0ee' }
    case 'varnhalt': return { color: '#60d0ff', emissive: '#40a8ee' }
    case 'luminous': return { color: '#f0e8a0', emissive: '#d0c880' }
    case 'drowned':  return { color: '#50a8a0', emissive: '#308880' }
  }
}
