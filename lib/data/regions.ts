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

export interface AttunementRoles {
  /** Local name for the Vaultkeeper attunement (perceive / preserve / interpret) */
  vaultkeeper: string
  /** Local name for the Dreamer attunement (influence / alter outcomes) */
  dreamer: string
}

export interface EverloopRegion {
  id: RegionId
  name: string
  sub: string
  description: string
  color: string
  mapImage: string | null
  model3dPath: string | null
  x: number
  z: number
  /** Local names for the universal Vaultkeeper / Dreamer attunement pair */
  attunementRoles?: AttunementRoles
  /** Short cultural / philosophical concepts that distinguish the region */
  culturalConcepts?: string[]
  /** How the region relates to (or refuses) standardised time */
  timeNote?: string
}

export const REGIONS: EverloopRegion[] = [
  {
    id: 'bellroot',
    name: 'The Bellroot Vale',
    sub: 'Memory Nexus',
    description:
      'A living, layered ecosystem of memory. Cliffs on one side give way to expansive forest systems — redwood clusters, rainforest zones, swamp regions, and mixed woodland transitions. Fragmented waterways weave through wetlands and marshes. Hidden villages lie embedded within the ancient canopy.',
    color: '#50c070',
    mapImage: '/Maps/bellroot-vale.png',
    model3dPath: '/Maps/3D/bellroot-vale.glb',
    x: 28,
    z: -3,
    attunementRoles: { vaultkeeper: 'Rootwardens', dreamer: 'Weave-Tenders' },
    culturalConcepts: [
      'No formal distinction between roles',
      'Knowledge is instinctive, not formalised',
      'Systems exist without language',
    ],
    timeNote: 'Time is felt through growth, decay, and the bell-tones of the canopy — rarely counted.',
  },
  {
    id: 'luminous',
    name: 'The Luminous Fold',
    sub: 'Over-Stabilized Zone',
    description:
      'A land of unnatural order and perfection. Geometric land patterns and structured landscapes stretch across evenly spaced settlements. Subtle glowing energy lines trace through the terrain. Beautiful — but unnerving in its precision.',
    color: '#e0d890',
    mapImage: '/Maps/luminous-expanse.png',
    model3dPath: '/Maps/3D/luminous-expanse.glb',
    x: 55,
    z: -40,
    attunementRoles: { vaultkeeper: 'Archivists', dreamer: 'Iterants' },
    culturalConcepts: [
      'Order is constructed, not discovered',
      'Reality can be measured, catalogued, and understood',
      'Mistakes consistency for truth',
    ],
    timeNote: 'The Fold runs on Seconds, Minutes, Hours, Cycles (days), and Loops (years) — and assumes the rest of the world does too.',
  },
  {
    id: 'ashen',
    name: 'The Ashen Spine',
    sub: 'Volcanic Chain',
    description:
      'A broken backbone of the world. A long, continuous mountain range of jagged, spine-like ridges spans the entire region. Multiple volcanoes feed branching lava flows that meet river systems in hundreds of steam plumes. Small settlements cling to valleys and geothermal edges.',
    color: '#cc5533',
    mapImage: '/Maps/ashen-spine.png',
    model3dPath: '/Maps/3D/ashen-spine.glb',
    x: 0,
    z: -45,
    attunementRoles: { vaultkeeper: 'Ember Scribes', dreamer: 'Flamecallers' },
    culturalConcepts: [
      'Knowledge must be immediately useful',
      'Theory is rejected unless practical',
      'Everything is rebuilt — nothing endures untouched',
    ],
    timeNote: 'Time is measured by eruption, cooling, and the next forced relocation.',
  },
  {
    id: 'drowned',
    name: 'The Drowned Reach',
    sub: 'Submerged Ruins',
    description:
      'The past being erased. Partially submerged land and broken coastlines reveal flooded ruins and sunken cities. Scattered islands dot waters that rise without clear source, encroaching ever further inland.',
    color: '#509088',
    mapImage: '/Maps/drowned-reach.png',
    model3dPath: '/Maps/3D/drowned-reach.glb',
    x: 0,
    z: 45,
    attunementRoles: { vaultkeeper: 'Depthwardens', dreamer: 'Undertides' },
    culturalConcepts: [
      'Naming prevents loss',
      'Fragmentary knowledge is still used',
      'Orientation and memory degrade — and must be rehearsed',
    ],
    timeNote: 'Tides and silt-lines are the only reliable clocks; surface measurements are treated as suspect.',
  },
  {
    id: 'glass',
    name: 'The Glass Expanse',
    sub: 'Crystal Desert',
    description:
      'Reality folding on itself. A crystalline desert of reflective surfaces and fractured dunes stretches endlessly. Mirrored terrain patterns and strange light behavior create "echo" formations. Rare, reflective pools shimmer beneath an alien sky.',
    color: '#c0c8d0',
    mapImage: '/Maps/glass-expanse.png',
    model3dPath: '/Maps/3D/glass-expanse.glb',
    x: 75,
    z: -5,
    attunementRoles: { vaultkeeper: 'Refractionists', dreamer: 'Lightbreakers' },
    culturalConcepts: [
      'Truth is unstable',
      'Agreement is temporary',
      'Perception overrides measurement',
    ],
    timeNote: 'Time is local to whichever reflection you are standing in — and the next one rarely agrees.',
  },
  {
    id: 'virelay',
    name: 'Virelay Coastlands',
    sub: 'Fractured Shore',
    description:
      'Beauty with subtle wrongness. A fractured coastline of islands, coves, and peninsulas gives way to inland forests and hills. Multiple port towns dot the irregular waterways. Fog banks and shifting weather lend an uneasy atmosphere to this unstable shore.',
    color: '#8888aa',
    mapImage: '/Maps/virelay-coastlands.png',
    model3dPath: '/Maps/3D/virelay-coastlands.glb',
    x: -70,
    z: 30,
    attunementRoles: { vaultkeeper: 'Tidewatchers', dreamer: 'Current-Speakers' },
    culturalConcepts: [
      'Trust in repetition and cycles',
      'Resistance to acknowledging deviation',
      'Emotional stability tied to predictability',
    ],
    timeNote: 'Time is the tide returning. Anything that breaks the pattern is recorded but rarely spoken aloud.',
  },
  {
    id: 'varnhalt',
    name: 'Varnhalt Frontier',
    sub: 'Rough Feudal Edge',
    description:
      'Sprawl without control. A chaotic mix of plains, forests, rocky mesas, and dry patches hosts the densest — yet most decentralized — civilization in the Everloop. Roads crisscross everywhere between camps and trade routes.',
    color: '#a08050',
    mapImage: '/Maps/varnhalt-frontier.png',
    model3dPath: '/Maps/3D/varnhalt-frontier.glb',
    x: -80,
    z: -5,
    attunementRoles: { vaultkeeper: 'Ledger-Seers', dreamer: 'Chancebinders' },
    culturalConcepts: [
      'Probability is commodified',
      'Agreements are outcome-based',
      'Reality is negotiable',
    ],
    timeNote: 'Time is whatever the contract says it is — and the contract may be renegotiated.',
  },
  {
    id: 'deyune',
    name: 'The Deyune Steps',
    sub: 'Nomadic Vastlands',
    description:
      'Feels infinite and empty. Rolling grasslands and dry plains stretch beyond sight, crossed by sparse rivers and occasional rock formations. Faint migration paths and barely visible herds mark the wind-swept, open-sky expanse of endless movement.',
    color: '#d4a84b',
    mapImage: '/Maps/deyune-steps.png',
    model3dPath: '/Maps/3D/deyune-steps.glb',
    x: -55,
    z: -35,
    attunementRoles: { vaultkeeper: 'Pathkeepers', dreamer: 'Windshapers' },
    culturalConcepts: [
      'Movement over permanence',
      'Memory over written record',
      'Knowledge tied to motion',
    ],
    timeNote: 'Time is measured in distance walked, herds met, and winds that have already passed.',
  },
]

export function getRegionById(id: string): EverloopRegion | undefined {
  return REGIONS.find((r) => r.id === id)
}

export function getRegionIds(): RegionId[] {
  return REGIONS.map((r) => r.id)
}
