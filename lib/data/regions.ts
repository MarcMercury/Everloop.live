// ═══════════════════════════════════════════════════════════════
// EVERLOOP REGION DATA
// Shared between world map and region sub-map pages
// ═══════════════════════════════════════════════════════════════

export type RegionId =
  | 'deyune'
  | 'virelay'
  | 'bellroot'
  | 'ashen'
  | 'glass'
  | 'varnhalt'
  | 'luminous'
  | 'drowned'

export interface EverloopRegion {
  id: RegionId
  name: string
  sub: string
  description: string
  color: string
  mapImage: string | null
  x: number
  z: number
}

export const REGIONS: EverloopRegion[] = [
  {
    id: 'bellroot',
    name: 'The Bellroot Vale',
    sub: 'Memory Nexus',
    description:
      'A living, layered ecosystem of memory. Cliffs on one side give way to expansive forest systems — redwood clusters, rainforest zones, swamp regions, and mixed woodland transitions. Fragmented waterways weave through wetlands and marshes. Hidden villages lie embedded within the ancient canopy.',
    color: '#50c070',
    mapImage: '/Maps/Bellroot Vale.png',
    x: 0,
    z: 45,
  },
  {
    id: 'luminous',
    name: 'The Luminous Fold',
    sub: 'Over-Stabilized Zone',
    description:
      'A land of unnatural order and perfection. Geometric land patterns and structured landscapes stretch across evenly spaced settlements. Subtle glowing energy lines trace through the terrain. Beautiful — but unnerving in its precision.',
    color: '#e0d890',
    mapImage: '/Maps/Luminous Expanse.png',
    x: -70,
    z: 30,
  },
  {
    id: 'ashen',
    name: 'The Ashen Spine',
    sub: 'Volcanic Chain',
    description:
      'A broken backbone of the world. A long, continuous mountain range of jagged, spine-like ridges spans the entire region. Multiple volcanoes feed branching lava flows that meet river systems in hundreds of steam plumes. Small settlements cling to valleys and geothermal edges.',
    color: '#cc5533',
    mapImage: '/Maps/Ashen Spine.png',
    x: 55,
    z: 38,
  },
  {
    id: 'drowned',
    name: 'The Drowned Reach',
    sub: 'Submerged Ruins',
    description:
      'The past being erased. Partially submerged land and broken coastlines reveal flooded ruins and sunken cities. Scattered islands dot waters that rise without clear source, encroaching ever further inland.',
    color: '#509088',
    mapImage: '/Maps/Drowned Reach.png',
    x: -80,
    z: -5,
  },
  {
    id: 'glass',
    name: 'The Glass Expanse',
    sub: 'Crystal Desert',
    description:
      'Reality folding on itself. A crystalline desert of reflective surfaces and fractured dunes stretches endlessly. Mirrored terrain patterns and strange light behavior create "echo" formations. Rare, reflective pools shimmer beneath an alien sky.',
    color: '#c0c8d0',
    mapImage: '/Maps/Glass Expanse.png',
    x: 75,
    z: -5,
  },
  {
    id: 'virelay',
    name: 'Virelay Coastlands',
    sub: 'Fractured Shore',
    description:
      'Beauty with subtle wrongness. A fractured coastline of islands, coves, and peninsulas gives way to inland forests and hills. Multiple port towns dot the irregular waterways. Fog banks and shifting weather lend an uneasy atmosphere to this unstable shore.',
    color: '#8888aa',
    mapImage: '/Maps/Virelay Coastlands.png',
    x: -55,
    z: -35,
  },
  {
    id: 'varnhalt',
    name: 'Varnhalt Frontier',
    sub: 'Rough Feudal Edge',
    description:
      'Sprawl without control. A chaotic mix of plains, forests, rocky mesas, and dry patches hosts the densest — yet most decentralized — civilization in the Everloop. Roads crisscross everywhere between camps and trade routes.',
    color: '#a08050',
    mapImage: '/Maps/Varnhalt Frontier.png',
    x: 0,
    z: -45,
  },
  {
    id: 'deyune',
    name: 'The Deyune Steps',
    sub: 'Nomadic Vastlands',
    description:
      'Feels infinite and empty. Rolling grasslands and dry plains stretch beyond sight, crossed by sparse rivers and occasional rock formations. Faint migration paths and barely visible herds mark the wind-swept, open-sky expanse of endless movement.',
    color: '#d4a84b',
    mapImage: '/Maps/Deyune Steps.png',
    x: 55,
    z: -40,
  },
]

export function getRegionById(id: string): EverloopRegion | undefined {
  return REGIONS.find((r) => r.id === id)
}

export function getRegionIds(): RegionId[] {
  return REGIONS.map((r) => r.id)
}
