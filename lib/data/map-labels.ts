// ═══════════════════════════════════════════════════════════════
// MAP LABELS — Code-driven location dots + labels for regional maps
// Coordinates are percentages (0–100) of the map image dimensions.
//   x = left→right,  z = top→bottom
// ═══════════════════════════════════════════════════════════════

import type { RegionId } from './regions'

export interface MapLabel {
  name: string
  x: number
  z: number
  /** Visual size class — drives dot radius and font size */
  size: 'city' | 'town' | 'village' | 'outpost' | 'ruin' | 'tavern' | 'landmark'
}

export const REGION_MAP_LABELS: Partial<Record<RegionId, MapLabel[]>> = {
  bellroot: [
    // ─── Cities ───
    { name: 'Bellroot Crossing',  x: 62, z: 45, size: 'city' },
    { name: 'South Vale Cluster', x: 42, z: 15, size: 'city' },

    // ─── Towns ───
    { name: 'Drelmere',           x: 48, z: 48, size: 'town' },
    { name: 'East Drelmere',      x: 30, z: 30, size: 'town' },
    { name: "Halrick's Reach",    x: 68, z: 55, size: 'town' },

    // ─── Villages ───
    { name: 'Merrow Bend',        x: 22, z: 42, size: 'village' },
    { name: 'Tallpine',           x: 40, z: 70, size: 'village' },
    { name: 'Rootfall',           x: 35, z: 40, size: 'village' },
    { name: 'Green Hollow',       x: 25, z: 60, size: 'village' },

    // ─── Outposts ───
    { name: 'Root Watch',         x: 15, z: 48, size: 'outpost' },
    { name: 'Vale Station',       x: 52, z: 62, size: 'outpost' },
    { name: 'North Path Post',    x: 55, z: 82, size: 'outpost' },

    // ─── Ruins ───
    { name: 'Old Bellroot Site',  x: 38, z: 58, size: 'ruin' },
    { name: 'First Root Chamber', x: 45, z: 38, size: 'ruin' },
    { name: 'Lost Grove',         x: 75, z: 48, size: 'ruin' },

    // ─── Taverns ───
    { name: 'The Quiet Bell',     x: 46, z: 52, size: 'tavern' },
    { name: 'Root & Stone',       x: 56, z: 64, size: 'tavern' },
    { name: 'The Low Fire',       x: 52, z: 80, size: 'tavern' },

    // ─── Key Landmarks ───
    { name: 'The Bell Tree',      x: 47, z: 46, size: 'landmark' },
  ],

  luminous: [
    // ─── Cities ───
    { name: 'Lumina',             x: 48, z: 16, size: 'city' },
    { name: 'Central Fold',      x: 40, z: 62, size: 'city' },

    // ─── Towns ───
    { name: 'Symmetry',          x: 30, z: 78, size: 'town' },
    { name: 'East Order',        x: 76, z: 40, size: 'town' },
    { name: 'Venn',              x: 33, z: 22, size: 'town' },

    // ─── Settlements ───
    { name: 'Order Field',       x: 54, z: 11, size: 'village' },
    { name: 'Line Camp',         x: 35, z: 31, size: 'village' },

    // ─── Outposts ───
    { name: 'Grid Station 1',    x: 20, z: 30, size: 'outpost' },
    { name: 'Grid Station 2',    x: 80, z: 25, size: 'outpost' },
    { name: 'Grid Station 3',    x: 82, z: 60, size: 'outpost' },
    { name: 'Grid Station 4',    x: 20, z: 65, size: 'outpost' },
    { name: 'Grid Station 5',    x: 70, z: 80, size: 'outpost' },
    { name: 'Grid Station 6',    x: 53, z: 38, size: 'outpost' },
    { name: 'Axis Watch',        x: 48, z: 44, size: 'outpost' },

    // ─── Ruins ───
    { name: 'Broken Line',       x: 15, z: 15, size: 'ruin' },
    { name: 'Old Fold Node',     x: 58, z: 42, size: 'ruin' },

    // ─── Taverns ───
    { name: 'The Even Table',    x: 65, z: 50, size: 'tavern' },
    { name: 'The Quiet Line',    x: 52, z: 51, size: 'tavern' },
  ],

  varnhalt: [
    // ─── Towns ───
    { name: 'Varnhalt',          x: 86, z: 86, size: 'town' },
  ],

  drowned: [
    // ─── Settlements ───
    { name: 'Lowwater',           x: 22, z: 80, size: 'village' },
    { name: 'Drift Camp',         x: 26, z: 22, size: 'village' },
    { name: 'Salt Edge',          x: 55, z: 24, size: 'village' },

    // ─── Towns ───
    { name: 'New Harbor',         x: 76, z: 67, size: 'town' },    // moved to Drowned Reach pos
    { name: 'West Reach',         x: 27, z: 64, size: 'town' },    // moved to Drowned Gate pos
    { name: 'Floodmark',          x: 41, z: 17, size: 'town' },

    // ─── Cities ───
    { name: 'Deep Reach',         x: 22, z: 11, size: 'city' },
    { name: 'Sunken Port',        x: 69, z: 60, size: 'city' },

    // ─── Outposts ───
    { name: 'Tide Watch',         x: 39, z: 58, size: 'outpost' }, // moved to The Sunken City pos
    { name: 'Flood Station',      x: 44, z: 28, size: 'outpost' },

    // ─── Ruins ───
    { name: 'The Sunken City',    x: 86, z: 82, size: 'ruin' },    // moved to West Reach pos
    { name: 'Old Reach',          x: 34, z: 90, size: 'ruin' },
    { name: 'Drowned Gate',       x: 80, z: 56, size: 'ruin' },    // moved to Last Dock pos

    // ─── Taverns ───
    { name: 'The Wet Lantern',    x: 47, z: 65, size: 'tavern' },
    { name: 'Last Dock',          x: 26, z: 15, size: 'tavern' },  // moved to Tide Watch pos
    { name: 'Salt Line',          x: 30, z: 80, size: 'tavern' },
  ],
}

export function getMapLabels(regionId: string): MapLabel[] {
  return REGION_MAP_LABELS[regionId as RegionId] ?? []
}
