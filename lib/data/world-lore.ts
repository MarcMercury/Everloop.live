/**
 * World lore constants and pure helpers for the Everloop.
 *
 * Kept separate from `world-state.ts` because that module is marked
 * 'use server' and may only export async functions.
 */

// =====================================================
// WORLD LORE CONSTANTS
// These are the immutable rules of the Everloop
// =====================================================

export const WORLD_CONSTANTS = {
  // The Pattern holds reality together
  PATTERN_DESCRIPTION: 'The Pattern is the invisible lattice that holds reality together. Where it frays, the world becomes unreliable.',
  
  // The Fray is the unraveling edge
  FRAY_THRESHOLDS: {
    stable: 0.1,      // Below this: region is stable
    uneasy: 0.2,      // Below this: subtle disturbances
    unstable: 0.35,    // Below this: visible instability
    dangerous: 0.5,    // Below this: Drift leaking through
    critical: 0.7,     // Below this: active Hollows forming
    catastrophic: 0.9, // Above this: reality fracturing
  },
  
  // Monster spawn rules — they are CONSEQUENCES, not encounters
  // Canon: Monsters are uncontrolled manifestations of the Drift entering the Everloop
  // through the Fray, forming unstable and unnatural beings not bound by the Pattern or First Map.
  // The Fray cuts from the Everloop → through the Pattern → through the Fold → back to the Drift.
  // Monsters result from the two-way pressure: the Drift pulling inward, chaos pushing outward.
  MONSTER_ORIGIN_TYPES: {
    drift_intrusion: 'Pure alien forms leaking through fractured reality — completely foreign, unstable, wrong',
    corrupted_reality: 'Living things warped by sustained Drift contact — part Everloop, part not',
    echo_construct: 'Shapes formed from memory and repetition — not fully alive, not fully gone',
  },
  
  // What makes monsters monstrous — they lack consistent structure, stable identity,
  // logical biology, or predictable behavior. They are raw existence forcing itself into form.
  MONSTER_CHARACTERISTICS: [
    'No consistent structure — forms shift, merge, or collapse',
    'No stable identity — incomplete, overlapping, unstable',
    'No logical biology — not bound by natural law',
    'No predictable behavior — driven by forces that have no name',
  ] as const,
  
  // Every quest should answer these about the Shards
  SHARD_QUESTIONS: [
    'Where is the Shard?',
    'Who knows about it?',
    'Who is trying to control it?',
    'What changes because of it?',
  ],
  
  // Shard narrative outcomes
  SHARD_OUTCOMES: ['found', 'revealed', 'moved', 'misunderstood', 'used'] as const,
  
  // Convergence — the Great Question
  CONVERGENCE_MYSTERY: 'No one knows what happens when all Shards of a region unite. No one knows what happens if every Shard from every region is brought together. This mystery is the gravitational center of the entire platform.',
} as const

/**
 * Get the Fray severity label for a given intensity
 */
export function getFraySeverity(intensity: number): {
  label: string
  color: string
  description: string
} {
  const t = WORLD_CONSTANTS.FRAY_THRESHOLDS
  
  if (intensity < t.stable) return {
    label: 'Stable',
    color: 'text-emerald-400',
    description: 'The Pattern holds firm here. Reality is coherent and predictable.',
  }
  if (intensity < t.uneasy) return {
    label: 'Uneasy',
    color: 'text-teal-400',
    description: 'Subtle wrongness at the edges. Echoes where there should be silence.',
  }
  if (intensity < t.unstable) return {
    label: 'Unstable',
    color: 'text-amber-400',
    description: 'The world stutters. Time behaves strangely. Memories bleed between places.',
  }
  if (intensity < t.dangerous) return {
    label: 'Dangerous',
    color: 'text-orange-400',
    description: 'Drift leaking through fractures. Monsters begin to appear. Reality can no longer be trusted.',
  }
  if (intensity < t.critical) return {
    label: 'Critical',
    color: 'text-red-400',
    description: 'Hollows widening. The Fray is visible to all. Creatures emerge from nothing.',
  }
  return {
    label: 'Catastrophic',
    color: 'text-red-600',
    description: 'Reality fracturing. The Drift presses through openly. The world is coming apart.',
  }
}

/**
 * Get monster spawn context for a Fray intensity
 * Monsters are CONSEQUENCES of the Fray, not random encounters
 */
export function getMonsterContext(frayIntensity: number): {
  spawnLikelihood: 'none' | 'rare' | 'occasional' | 'frequent' | 'constant'
  dominantType: keyof typeof WORLD_CONSTANTS.MONSTER_ORIGIN_TYPES
  narrativeNote: string
} {
  if (frayIntensity < 0.15) return {
    spawnLikelihood: 'none',
    dominantType: 'echo_construct',
    narrativeNote: 'The Pattern holds. No monsters emerge where reality is intact.',
  }
  if (frayIntensity < 0.3) return {
    spawnLikelihood: 'rare',
    dominantType: 'echo_construct',
    narrativeNote: 'Faint echoes stir. Shapes that should not exist flicker at the periphery — born of repetition and memory.',
  }
  if (frayIntensity < 0.5) return {
    spawnLikelihood: 'occasional',
    dominantType: 'corrupted_reality',
    narrativeNote: 'The Drift touches living things. Animals and people begin to change. The corruption is slow, insidious, irreversible.',
  }
  if (frayIntensity < 0.7) return {
    spawnLikelihood: 'frequent',
    dominantType: 'drift_intrusion',
    narrativeNote: 'Reality cracks open. Things pour through that have no name, no origin, no pattern — pure Drift given shape by the world\'s breaking.',
  }
  return {
    spawnLikelihood: 'constant',
    dominantType: 'drift_intrusion',
    narrativeNote: 'The boundary is gone. The Drift is here. Every shadow might be something that was never supposed to exist.',
  }
}
