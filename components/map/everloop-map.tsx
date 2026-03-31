'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Stars, Html } from '@react-three/drei'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
export interface MapLocation {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  stability: number
  tags: string[]
  x: number
  z: number
  elevation: number
  createdAt: string
}

interface EverloopMapProps {
  locations: MapLocation[]
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS & HELPERS
// ═══════════════════════════════════════════════════════════════
const SURFACE_Y = 30      // Living world height
const PATTERN_Y = 12      // Pattern lattice height
const FOLD_Y = -2         // Fold platform height
const DRIFT_Y = -20       // Drift base
const WORLD_RADIUS = 120  // Disc radius — large for epic scale

function getTypeColor(type: string): string {
  switch (type) {
    case 'location':  return '#d4a84b'
    case 'character': return '#6ec6ff'
    case 'artifact':  return '#e066ff'
    case 'faction':   return '#ff6b6b'
    case 'creature':  return '#66ff9e'
    case 'event':     return '#ffaa66'
    case 'concept':   return '#66d9ff'
    default:          return '#d4a84b'
  }
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'location':  return '🏛️'
    case 'character': return '👤'
    case 'artifact':  return '✨'
    case 'faction':   return '⚔️'
    case 'creature':  return '🐉'
    case 'event':     return '📜'
    case 'concept':   return '💭'
    default:          return '◈'
  }
}

// ─── Noise for terrain ──────────────────────────────────────
function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

function noise2D(x: number, z: number): number {
  const ix = Math.floor(x); const iz = Math.floor(z)
  const fx = x - ix; const fz = z - iz
  const a = seededRandom(ix + iz * 157)
  const b = seededRandom(ix + 1 + iz * 157)
  const c = seededRandom(ix + (iz + 1) * 157)
  const d = seededRandom(ix + 1 + (iz + 1) * 157)
  const ux = fx * fx * (3 - 2 * fx)
  const uz = fz * fz * (3 - 2 * fz)
  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz
}

function fbm(x: number, z: number, octaves: number = 6): number {
  let v = 0, amp = 0.5, freq = 0.03
  for (let i = 0; i < octaves; i++) { v += amp * noise2D(x * freq, z * freq); amp *= 0.5; freq *= 2 }
  return v
}

// ═══════════════════════════════════════════════════════════════
// 8 REGIONS OF THE EVERLOOP
// ═══════════════════════════════════════════════════════════════
//
// Layout (on the disc, viewed from above):
//
//   NW: Luminous Fold       N: Bellroot Vale      NE: Ashen Spine
//   W:  Drowned Reach       C: (shared borders)   E:  Glass Expanse
//   SW: Virelay Coastlands  S: Varnhalt Frontier  SE: Deyune Steps
//

type RegionId = 'deyune' | 'virelay' | 'bellroot' | 'ashen' | 'glass' | 'varnhalt' | 'luminous' | 'drowned'

interface RegionDef {
  id: RegionId
  cx: number; cz: number   // Center
  rx: number; rz: number   // Radii
  strength: number
}

const REGIONS: RegionDef[] = [
  { id: 'deyune',   cx: 55,  cz: -50, rx: 48, rz: 45, strength: 1.0 },   // SE — nomadic vastlands
  { id: 'virelay',  cx: -50, cz: -35, rx: 42, rz: 40, strength: 1.0 },   // SW — fractured coast
  { id: 'bellroot', cx: 0,   cz: 45,  rx: 40, rz: 38, strength: 1.0 },   // N  — memory vale
  { id: 'ashen',    cx: 55,  cz: 40,  rx: 42, rz: 38, strength: 1.0 },   // NE — volcanic spine
  { id: 'glass',    cx: 65,  cz: -5,  rx: 40, rz: 38, strength: 1.0 },   // E  — crystal desert
  { id: 'varnhalt', cx: 0,   cz: -50, rx: 42, rz: 40, strength: 1.0 },   // S  — rough frontier
  { id: 'luminous', cx: -55, cz: 35,  rx: 42, rz: 38, strength: 1.0 },   // NW — over-stabilized
  { id: 'drowned',  cx: -55, cz: -5,  rx: 38, rz: 35, strength: 1.0 },   // W  — submerged ruins
]

/** Returns blend weights for each region at a world point (0-1 each, can overlap at borders) */
function getRegionWeights(wx: number, wz: number): Map<RegionId, number> {
  const weights = new Map<RegionId, number>()
  for (const r of REGIONS) {
    const dx = (wx - r.cx) / r.rx
    const dz = (wz - r.cz) / r.rz
    const d = Math.sqrt(dx * dx + dz * dz)
    if (d >= 1.3) continue
    const f = Math.max(0, 1 - d)
    const w = f * f * (3 - 2 * f) * r.strength
    if (w > 0.001) weights.set(r.id, w)
  }
  return weights
}

/** Returns the dominant region at a point */
function getDominantRegion(wx: number, wz: number): RegionId | null {
  const w = getRegionWeights(wx, wz)
  let best: RegionId | null = null
  let bestW = 0
  for (const [id, val] of w) {
    if (val > bestW) { bestW = val; best = id }
  }
  return best
}

// ─── Continental mask: defines land vs ocean ───────────────
function continentMask(wx: number, wz: number): number {
  const blobs: [number, number, number, number, number][] = [
    // Core continent — large interconnected landmass
    [5, 0, 65, 60, 1.0],         // Central core
    [40, 25, 40, 35, 0.95],      // NE extension (Ashen Spine)
    [-35, 20, 38, 32, 0.92],     // NW extension (Luminous Fold)
    [-35, -25, 38, 35, 0.90],    // SW lobe (Virelay Coast)
    [35, -35, 40, 38, 0.88],     // SE lobe (Deyune Steps)
    [0, -45, 35, 40, 0.86],      // Southern peninsula (Varnhalt)
    [0, 40, 35, 30, 0.85],       // Northern cape (Bellroot Vale)
    [-50, 0, 32, 28, 0.82],      // Far-west (Drowned Reach)
    [60, 0, 35, 30, 0.80],       // Eastern reach (Glass Expanse)
    // Islands and extensions
    [55, -55, 22, 18, 0.65],     // Deyune outer island
    [-58, -45, 18, 16, 0.60],    // Virelay offshore
    [65, 45, 16, 20, 0.55],      // Ashen volcanic isle
    [-62, 40, 14, 18, 0.50],     // Luminous isle
    [0, 58, 18, 14, 0.50],       // Bellroot northern isle
    [-68, -15, 20, 22, 0.55],    // Drowned outer ruins
    [80, -20, 18, 22, 0.50],     // Glass Expanse outer
    // Small islets
    [-72, -55, 12, 10, 0.40],    // SW islet
    [72, -48, 12, 10, 0.38],     // SE islet
    [75, 30, 10, 14, 0.35],      // E islet
    [-15, 62, 12, 10, 0.35],     // N islet
    // Edge extensions for disc fill
    [85, -10, 50, 60, 0.70],     // Eastern edge fill
    [-80, 10, 45, 50, 0.60],     // Western edge fill
    [20, 70, 35, 45, 0.65],      // Northern edge
    [20, -70, 40, 45, 0.62],     // Southern edge
  ]
  let v = 0
  for (const [bx, bz, brx, brz, strength] of blobs) {
    const dx = (wx - bx) / brx; const dz = (wz - bz) / brz
    const d = Math.sqrt(dx * dx + dz * dz)
    if (d < 1) {
      const f = 1 - d
      v = Math.max(v, strength * f * f * (3 - 2 * f))
    }
  }
  // Fractal coastline — region-aware distortion
  const coast1 = fbm(wx * 1.5 + 50, wz * 1.5 + 50, 6) - 0.42
  const coast2 = fbm(wx * 2.8 + 150, wz * 2.8 + 150, 4) - 0.45
  v += coast1 * 0.30 + coast2 * 0.12

  // Virelay gets extra inlet/fjord fracturing
  const dom = getDominantRegion(wx, wz)
  if (dom === 'virelay') {
    v += (fbm(wx * 3.5 + 200, wz * 3.5 + 200, 3) - 0.50) * 0.25
  }
  // Drowned Reach: carve submerged sections
  if (dom === 'drowned') {
    const sink = fbm(wx * 1.2 + 600, wz * 1.2 + 600, 4)
    if (sink > 0.55) v -= (sink - 0.55) * 1.5
  }

  v += Math.sin(wx * 0.08 + wz * 0.06) * fbm(wx * 0.9 + 80, wz * 0.9 + 80, 3) * 0.10
  return v
}

// ─── River paths: carved valleys between terrain ────────────
function riverFactor(wx: number, wz: number): number {
  const rivers: { ox: number; oz: number; dx: number; dz: number; freq: number; amp: number; width: number }[] = [
    { ox: 15,  oz: 45,  dx: 0.1, dz: -1,   freq: 0.06, amp: 14, width: 2.8 },   // Great river through Bellroot → Varnhalt
    { ox: -35, oz: 15,  dx: 0.8, dz: -0.6,  freq: 0.05, amp: 11, width: 2.4 },   // Drowned Reach → Virelay
    { ox: 10,  oz: -10, dx: 1,   dz: 0.2,   freq: 0.07, amp: 9,  width: 2.0 },   // Central → Glass Expanse
    { ox: 40,  oz: 30,  dx: -0.3, dz: -1,   freq: 0.08, amp: 8,  width: 1.8 },   // Ashen Spine drainage
    { ox: -10, oz: -33, dx: 0.6,  dz: 0.8,  freq: 0.06, amp: 7,  width: 1.5 },   // Varnhalt stream
    { ox: 50,  oz: 0,   dx: -1,   dz: 0.3,  freq: 0.09, amp: 9,  width: 2.0 },   // Glass → center delta
    { ox: -40, oz: -5,  dx: 0.5,  dz: -0.85, freq: 0.055, amp: 10, width: 1.8 }, // Drowned Reach river
    { ox: 25,  oz: -45, dx: -0.7, dz: 0.7,  freq: 0.07, amp: 8,  width: 1.6 },   // Deyune → Varnhalt
    { ox: -30, oz: 30,  dx: 0.3,  dz: -0.9, freq: 0.06, amp: 8,  width: 2.0 },   // Luminous → Drowned
  ]
  let closest = Infinity
  let riverWidth = 1.8
  for (const r of rivers) {
    const approxDx = wx - r.ox; const approxDz = wz - r.oz
    if (approxDx * approxDx + approxDz * approxDz > 14000) continue
    for (let t = -60; t <= 60; t += 3) {
      const rx = r.ox + r.dx * t + Math.sin(t * r.freq) * r.amp + Math.sin(t * r.freq * 2.3 + 1) * r.amp * 0.3
      const rz = r.oz + r.dz * t + Math.cos(t * r.freq * 0.8) * r.amp * 0.6 + Math.cos(t * r.freq * 1.7 + 2) * r.amp * 0.2
      const dx = wx - rx; const dz = wz - rz
      const distSq = dx * dx + dz * dz
      if (distSq < closest) { closest = distSq; riverWidth = r.width }
    }
  }
  closest = Math.sqrt(closest)
  return Math.max(0, 1 - closest / riverWidth)
}

// ─── Per-region terrain height shaping ──────────────────────
function getTerrainHeight(wx: number, wz: number, precomputed?: { land: number; rv: number }): number {
  const dist = Math.sqrt(wx * wx + wz * wz)
  const angle = Math.atan2(wz, wx)
  const eastFactor = Math.max(0, Math.cos(angle))
  const northFactor = Math.max(0, Math.sin(angle) * 0.5)
  const extendFactor = Math.max(eastFactor, northFactor)
  const tightFade = Math.max(0, 1 - Math.pow(dist / WORLD_RADIUS, 2.5))
  const looseFade = Math.max(0, 1 - Math.pow(dist / (WORLD_RADIUS * 1.3), 4))
  const edgeFade = tightFade + (looseFade - tightFade) * extendFactor
  const land = precomputed ? precomputed.land : continentMask(wx, wz)

  if (land < 0.08) {
    const oceanDepth = fbm(wx * 0.4 + 200, wz * 0.4 + 200, 4)
    const trench = Math.max(0, fbm(wx * 0.15 + 400, wz * 0.15 + 400, 3) - 0.6) * 8
    return (-1.8 - oceanDepth * 2.5 - trench) * edgeFade
  }

  const shoreBlend = land < 0.2 ? (land - 0.08) / 0.12 : 1
  const weights = getRegionWeights(wx, wz)

  // Base terrain
  let h = land * 2.5
  h += fbm(wx + 100, wz + 100, 6) * 4.5
  h += fbm(wx * 1.5 + 70, wz * 1.5 + 70, 4) * 2.0

  // === Per-region terrain modifiers ===

  // Deyune Steps: flat rolling grassland, windswept
  const deyW = weights.get('deyune') ?? 0
  if (deyW > 0) {
    const gentleRoll = fbm(wx * 0.6 + 700, wz * 0.6 + 700, 3) * 2.5
    const flatH = land * 1.5 + gentleRoll
    h = h * (1 - deyW * 0.9) + flatH * deyW * 0.9
  }

  // Virelay Coastlands: erratic, jagged coastline terrain
  const virW = weights.get('virelay') ?? 0
  if (virW > 0) {
    const erratic = fbm(wx * 2.5 + 400, wz * 2.5 + 400, 5) * 3
    const coastal = Math.max(0, 1 - land * 3) * 2 // lower near coasts
    h += (erratic - coastal * 2) * virW * 0.7
  }

  // Bellroot Vale: gentle valley with a central depression
  const belW = weights.get('bellroot') ?? 0
  if (belW > 0) {
    const valeDist = Math.sqrt((wx - 0) ** 2 + (wz - 45) ** 2) / 30
    const valeDip = Math.max(0, 1 - valeDist) * 4 // central bowl
    const valeRoll = fbm(wx * 0.8 + 800, wz * 0.8 + 800, 4) * 2
    const valeH = land * 2 + valeRoll - valeDip
    h = h * (1 - belW * 0.8) + valeH * belW * 0.8
  }

  // Ashen Spine: volcanic mountain chain with sharp ridges
  const ashW = weights.get('ashen') ?? 0
  if (ashW > 0) {
    const ridge = Math.abs(fbm(wx * 0.7 + 300, wz * 0.7 + 300, 5) - 0.5) * 2
    const spine = Math.abs(fbm(wx * 0.5 + 500, wz * 0.5 - 200, 4) - 0.5) * 2
    const volcanoZone = Math.max(0, fbm(wx * 0.2, wz * 0.2, 3) - 0.25) * 4
    h += (ridge * volcanoZone * 14 + spine * 6) * ashW
    // Volcanic peaks
    const ashPeaks: [number, number, number, number][] = [
      [50, 45, 7, 18], [60, 35, 6, 15], [45, 50, 5, 12], [65, 48, 5, 10],
    ]
    for (const [px, pz, radius, ht] of ashPeaks) {
      const pd = Math.sqrt((wx - px) ** 2 + (wz - pz) ** 2)
      if (pd < radius * 3) {
        const f = Math.max(0, 1 - pd / (radius * 2.5))
        h += f * f * ht * ashW
      }
    }
  }

  // Glass Expanse: flat desert with subtle dune waves
  const glaW = weights.get('glass') ?? 0
  if (glaW > 0) {
    const dunes = Math.sin(wx * 0.15 + wz * 0.08) * Math.sin(wx * 0.08 - wz * 0.12) * 2.5
    const flatDesert = land * 1.8 + dunes + fbm(wx * 1.2 + 900, wz * 1.2 + 900, 3) * 1.5
    h = h * (1 - glaW * 0.85) + flatDesert * glaW * 0.85
  }

  // Varnhalt Frontier: rugged hilly terrain, uneven
  const varW = weights.get('varnhalt') ?? 0
  if (varW > 0) {
    const rugged = fbm(wx * 1.8 + 550, wz * 1.8 + 550, 5) * 4
    const gullies = Math.max(0, 0.45 - fbm(wx * 0.5 + 650, wz * 0.5 + 650, 4)) * 5
    h += (rugged - gullies) * varW * 0.6
  }

  // Luminous Fold: unnaturally smooth, terraced
  const lumW = weights.get('luminous') ?? 0
  if (lumW > 0) {
    const smooth = land * 2.2 + fbm(wx * 0.4 + 1000, wz * 0.4 + 1000, 3) * 3
    // Terracing effect
    const terraced = Math.round(smooth * 1.5) / 1.5
    const lumH = terraced + fbm(wx * 0.8 + 1100, wz * 0.8 + 1100, 2) * 0.5
    h = h * (1 - lumW * 0.85) + lumH * lumW * 0.85
  }

  // Drowned Reach: low, waterlogged, partially submerged
  const droW = weights.get('drowned') ?? 0
  if (droW > 0) {
    const sunken = fbm(wx * 0.9 + 600, wz * 0.9 + 600, 4)
    const drownedH = land * 1.2 + fbm(wx * 0.5 + 700, wz * 0.5 + 700, 3) * 1.5
    // Sink portions below waterline
    const sinkFactor = sunken > 0.5 ? (sunken - 0.5) * 4 : 0
    h = h * (1 - droW * 0.85) + (drownedH - sinkFactor * 2) * droW * 0.85
  }

  // General mountain ridges (reduced in flattened regions)
  const flatRegions = Math.max(deyW, glaW, lumW, droW)
  const mountainSuppress = 1 - flatRegions * 0.9
  const ridge1 = Math.abs(fbm(wx * 0.6 + 300, wz * 0.6 + 300, 5) - 0.5) * 2
  const ridge2 = Math.abs(fbm(wx * 0.45 + 500, wz * 0.45 - 200, 4) - 0.5) * 2
  const mz1 = Math.max(0, fbm(wx * 0.2, wz * 0.2, 3) - 0.35) * 3
  const mz2 = Math.max(0, fbm(wx * 0.18 + 100, wz * 0.18 + 100, 3) - 0.40) * 2.5
  h += (ridge1 * mz1 * 8 + ridge2 * mz2 * 5) * mountainSuppress

  // Valley systems
  const valley = Math.max(0, 0.4 - fbm(wx * 0.35 + 600, wz * 0.35 + 600, 4)) * 5
  h -= valley * mountainSuppress

  // Carve rivers
  const rv = precomputed ? precomputed.rv : riverFactor(wx, wz)
  h -= rv * rv * 4.5

  h *= shoreBlend
  return Math.max(h, -1.5) * edgeFade
}

// ═══════════════════════════════════════════════════════════════
// LAYER 1 — THE DRIFT (Primordial Sea of Chaos)
// ═══════════════════════════════════════════════════════════════
function TheDrift() {
  const particlesObj = useMemo(() => {
    const count = 4000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const r = Math.random() * 170
      positions[i * 3] = Math.cos(theta) * r
      positions[i * 3 + 1] = DRIFT_Y + (Math.random() - 0.5) * 25
      positions[i * 3 + 2] = Math.sin(theta) * r
      // Dark purples, deep blues, occasional white
      const t = Math.random()
      if (t < 0.6) { colors[i*3] = 0.15; colors[i*3+1] = 0.05; colors[i*3+2] = 0.25 }
      else if (t < 0.85) { colors[i*3] = 0.05; colors[i*3+1] = 0.08; colors[i*3+2] = 0.2 }
      else { colors[i*3] = 0.4 + Math.random() * 0.3; colors[i*3+1] = 0.3; colors[i*3+2] = 0.5 + Math.random() * 0.3 }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const mat = new THREE.PointsMaterial({
      size: 0.3, vertexColors: true, transparent: true, opacity: 0.6,
      sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })
    return new THREE.Points(geo, mat)
  }, [])

  useFrame(({ clock }) => {
    const pos = particlesObj.geometry.attributes.position as THREE.BufferAttribute
    const t = clock.elapsedTime * 0.08
    for (let i = 0; i < Math.min(pos.count, 800); i++) {
      const x = pos.getX(i); const z = pos.getZ(i)
      // Swirling chaos
      pos.setX(i, x + Math.sin(t + z * 0.02) * 0.02)
      pos.setZ(i, z + Math.cos(t + x * 0.02) * 0.02)
      pos.setY(i, pos.getY(i) + Math.sin(t * 2 + i * 0.3) * 0.005)
    }
    pos.needsUpdate = true
    particlesObj.rotation.y = t * 0.05
  })

  return (
    <group>
      <primitive object={particlesObj} />
      {/* Dark void sphere at bottom */}
      <mesh position={[0, DRIFT_Y - 5, 0]}>
        <sphereGeometry args={[170, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#050510" side={THREE.BackSide} transparent opacity={0.9} />
      </mesh>
      {/* Swirling nebula rings */}
      {[0, 1, 2].map(i => (
        <mesh key={i} position={[0, DRIFT_Y - 3 + i * 3, 0]} rotation={[Math.PI / 2, 0, i * 0.7]}>
          <torusGeometry args={[80 + i * 30, 15, 8, 64]} />
          <meshStandardMaterial
            color={i === 0 ? '#1a0a2e' : i === 1 ? '#0a1030' : '#150820'}
            transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false}
          />
        </mesh>
      ))}
      <pointLight position={[0, DRIFT_Y, 0]} intensity={0.3} color="#3a1a5e" distance={60} decay={2} />
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
// LAYER 2 — THE FOLD (Architects' Realm — Where Forms Hold)
// ═══════════════════════════════════════════════════════════════
function TheFold() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.08 + Math.sin(clock.elapsedTime * 0.3) * 0.03
    }
  })

  return (
    <group>
      {/* Semi-transparent platform — glass-like */}
      <mesh ref={ref} position={[0, FOLD_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[140, 96]} />
        <meshStandardMaterial
          color="#a0c0e0" transparent opacity={0.1} roughness={0.05} metalness={0.8}
          side={THREE.DoubleSide} depthWrite={false}
        />
      </mesh>
      {/* Ghostly grid lines on the Fold */}
      <FoldGrid />
      {/* Subtle glow */}
      <pointLight position={[0, FOLD_Y + 3, 0]} intensity={0.4} color="#4080c0" distance={80} decay={2} />
    </group>
  )
}

function FoldGrid() {
  const obj = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: '#4060a0', transparent: true, opacity: 0.08, depthWrite: false })
    const group = new THREE.Group()
    for (let i = -130; i <= 130; i += 15) {
      const geoX = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i, FOLD_Y + 0.1, -130),
        new THREE.Vector3(i, FOLD_Y + 0.1, 130),
      ])
      group.add(new THREE.Line(geoX, mat))
      const geoZ = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-130, FOLD_Y + 0.1, i),
        new THREE.Vector3(130, FOLD_Y + 0.1, i),
      ])
      group.add(new THREE.Line(geoZ, mat))
    }
    return group
  }, [])
  return <primitive object={obj} />
}

// ═══════════════════════════════════════════════════════════════
// LAYER 3 — THE PATTERN (Lattice / Weaving + Anchors + Shards)
// ═══════════════════════════════════════════════════════════════
function ThePattern() {
  const latticeRef = useRef<THREE.Group>(null)

  // Build lattice grid
  const latticeObj = useMemo(() => {
    const group = new THREE.Group()
    const spacing = 16
    const range = 105
    const nodeMat = new THREE.MeshStandardMaterial({
      color: '#40a0ff', emissive: '#2080dd', emissiveIntensity: 0.8,
      transparent: true, opacity: 0.9, roughness: 0.2,
    })
    const nodeGeo = new THREE.SphereGeometry(0.35, 8, 8)
    const lineMat = new THREE.LineBasicMaterial({
      color: '#3090ee', transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending,
    })

    for (let x = -range; x <= range; x += spacing) {
      for (let z = -range; z <= range; z += spacing) {
        const dist = Math.sqrt(x * x + z * z)
        if (dist > range + 5) continue
        // Node
        const node = new THREE.Mesh(nodeGeo, nodeMat)
        node.position.set(x, PATTERN_Y, z)
        group.add(node)
        // Connect right
        if (x + spacing <= range) {
          const geo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, PATTERN_Y, z),
            new THREE.Vector3(x + spacing, PATTERN_Y, z),
          ])
          group.add(new THREE.Line(geo, lineMat))
        }
        // Connect forward
        if (z + spacing <= range) {
          const geo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, PATTERN_Y, z),
            new THREE.Vector3(x, PATTERN_Y, z + spacing),
          ])
          group.add(new THREE.Line(geo, lineMat))
        }
      }
    }
    return group
  }, [])

  useFrame(({ clock }) => {
    if (latticeRef.current) {
      // Pulse nodes
      latticeRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial
          const d = child.position.length()
          mat.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * 1.5 - d * 0.05) * 0.4
        }
      })
    }
  })

  return (
    <group>
      <group ref={latticeRef}>
        <primitive object={latticeObj} />
      </group>
      {/* Central glow */}
      <pointLight position={[0, PATTERN_Y, 0]} intensity={1.5} color="#3090ee" distance={80} decay={2} />
    </group>
  )
}

// ─── Anchors: Giant crystal pillars connecting Pattern to Fold ──
function Anchors() {
  const anchorPositions = useMemo(() => {
    const positions: [number, number][] = []
    const count = 8
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const r = 95
      positions.push([Math.cos(angle) * r, Math.sin(angle) * r])
    }
    return positions
  }, [])

  return (
    <group>
      {anchorPositions.map(([x, z], i) => (
        <Anchor key={i} x={x} z={z} index={i} />
      ))}
    </group>
  )
}

function Anchor({ x, z, index }: { x: number; z: number; index: number }) {
  const ref = useRef<THREE.Group>(null)
  const height = SURFACE_Y - FOLD_Y + 5

  useFrame(({ clock }) => {
    if (ref.current) {
      const child = ref.current.children[0] as THREE.Mesh
      if (child) {
        const mat = child.material as THREE.MeshStandardMaterial
        mat.emissiveIntensity = 0.4 + Math.sin(clock.elapsedTime * 0.8 + index) * 0.2
      }
    }
  })

  return (
    <group ref={ref} position={[x, FOLD_Y, z]}>
      {/* Crystal pillar */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.6, 1.5, height, 6]} />
        <meshStandardMaterial
          color="#60b0ff" emissive="#3080dd" emissiveIntensity={0.5}
          transparent opacity={0.5} roughness={0.1} metalness={0.7}
        />
      </mesh>
      {/* Top crystal cap */}
      <mesh position={[0, height + 0.5, 0]}>
        <coneGeometry args={[1.2, 3, 6]} />
        <meshStandardMaterial
          color="#80c0ff" emissive="#4090ee" emissiveIntensity={0.6}
          transparent opacity={0.6} roughness={0.05} metalness={0.9}
        />
      </mesh>
      {/* Glow */}
      <pointLight position={[0, height / 2, 0]} intensity={0.8} color="#4090dd" distance={20} decay={2} />
    </group>
  )
}

// ─── Shards: Smaller crystals scattered on the Pattern ─────
function PatternShards() {
  const shardPositions = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2 + 0.3
      const r = 35 + Math.sin(i * 2.7) * 20
      positions.push([Math.cos(angle) * r, PATTERN_Y + 1.5, Math.sin(angle) * r])
    }
    return positions
  }, [])

  return (
    <group>
      {shardPositions.map((pos, i) => (
        <Float key={i} speed={1.5 + i * 0.1} rotationIntensity={0.3} floatIntensity={0.5}>
          <mesh position={pos} rotation={[0.2 * i, 0.5 * i, 0.1 * i]}>
            <octahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial
              color="#80ddff" emissive="#40aaee" emissiveIntensity={0.8}
              transparent opacity={0.7} roughness={0.05} metalness={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
// SURFACE SHARDS — Region-assigned crystalline markers
// ═══════════════════════════════════════════════════════════════
// Each region has shards with lore significance tied to its core force.
// Shard color tints by region to show the local Pattern influence.
interface ShardSite { x: number; z: number; region: RegionId }

const SHARD_SITES: ShardSite[] = [
  // Deyune Steps (Pattern flow) — wind-exposed, migration path markers
  { x: 50, z: -55, region: 'deyune' },
  { x: 60, z: -45, region: 'deyune' },
  { x: 45, z: -40, region: 'deyune' },
  // Virelay Coastlands (Fray onset) — coastal anomalies, tidal deposits
  { x: -48, z: -40, region: 'virelay' },
  { x: -55, z: -28, region: 'virelay' },
  { x: -42, z: -48, region: 'virelay' },
  // Bellroot Vale (Resonance) — near root networks, memory anchors
  { x: -5, z: 48, region: 'bellroot' },
  { x: 8, z: 40, region: 'bellroot' },
  { x: -10, z: 38, region: 'bellroot' },
  // Ashen Spine (Anchor damage) — buried in volcanic rock, unearthed by quakes
  { x: 52, z: 45, region: 'ashen' },
  { x: 60, z: 38, region: 'ashen' },
  { x: 48, z: 35, region: 'ashen' },
  // Glass Expanse (Pattern divergence) — fused into crystallized ground
  { x: 68, z: -8, region: 'glass' },
  { x: 60, z: 2, region: 'glass' },
  { x: 72, z: 5, region: 'glass' },
  // Varnhalt Frontier (denial/survival) — dismissed as curiosities
  { x: 5, z: -48, region: 'varnhalt' },
  { x: -8, z: -55, region: 'varnhalt' },
  // Luminous Fold (over-stabilization) — locked in perfect display pedestals
  { x: -52, z: 38, region: 'luminous' },
  { x: -58, z: 30, region: 'luminous' },
  // Drowned Reach (collapsed Pattern) — submerged, barely visible
  { x: -55, z: -8, region: 'drowned' },
  { x: -50, z: 2, region: 'drowned' },
]

function getShardColor(region: RegionId): { color: string; emissive: string } {
  switch (region) {
    case 'deyune':   return { color: '#e0c060', emissive: '#c0a040' }  // golden flow
    case 'virelay':  return { color: '#9070c0', emissive: '#7050a0' }  // unstable violet
    case 'bellroot': return { color: '#40e080', emissive: '#30b060' }  // resonant green
    case 'ashen':    return { color: '#ff6040', emissive: '#cc4030' }  // ruptured red
    case 'glass':    return { color: '#c0e0ff', emissive: '#90c0ee' }  // prismatic white-blue
    case 'varnhalt': return { color: '#60d0ff', emissive: '#40a8ee' }  // standard cyan
    case 'luminous': return { color: '#f0e8a0', emissive: '#d0c880' }  // locked gold
    case 'drowned':  return { color: '#50a8a0', emissive: '#308880' }  // deep teal
  }
}

function SurfaceShard({ site, index }: { site: ShardSite; index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const land = continentMask(site.x, site.z)
  const terrainH = land > 0.08 ? Math.max(getTerrainHeight(site.x, site.z), 0) : -0.5
  const { color, emissive } = getShardColor(site.region)

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.4 + index
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * 1.2 + index * 0.9) * 0.3
    }
  })

  const y = SURFACE_Y + terrainH + 1.2
  const size = 0.5 + seededRandom(index * 73 + 11) * 0.5

  return (
    <group position={[site.x, y, site.z]}>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh ref={ref}>
          <octahedronGeometry args={[size, 0]} />
          <meshStandardMaterial
            color={color} emissive={emissive} emissiveIntensity={0.8}
            roughness={0.05} metalness={0.8} transparent opacity={0.85}
          />
        </mesh>
      </Float>
      {/* Label */}
      <Html position={[0, size + 1.2, 0]} center style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        <div className="text-center select-none">
          <div className="text-[9px] font-serif drop-shadow-lg" style={{ color, textShadow: '0 0 6px rgba(0,0,0,0.9)' }}>
            Shard Site
          </div>
        </div>
      </Html>
      <pointLight color={emissive} intensity={1} distance={size * 10} decay={2} />
    </group>
  )
}

function SurfaceShards() {
  return (
    <group>
      {SHARD_SITES.map((site, i) => (
        <SurfaceShard key={i} site={site} index={i} />
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
// TRAVEL ROUTES — Visible paths connecting regions
// ═══════════════════════════════════════════════════════════════
// Routes are the canonical safe(ish) travel corridors. Each one has
// narrative weight — controlling a route is controlling trade, information, and escape.
interface TravelRoute {
  from: RegionId
  to: RegionId
  name: string
  waypoints: [number, number][]  // x,z waypoints on the surface
  color: string
  dashed?: boolean               // dashed = dangerous / unreliable
}

const TRAVEL_ROUTES: TravelRoute[] = [
  // === Major trade roads ===
  {
    from: 'varnhalt', to: 'bellroot', name: 'The Spine Road',
    waypoints: [[0, -42], [2, -28], [5, -12], [3, 5], [0, 20], [-2, 35], [0, 42]],
    color: '#d4a84b',
  },
  {
    from: 'virelay', to: 'drowned', name: 'Fog Coast Trail',
    waypoints: [[-45, -30], [-48, -22], [-52, -15], [-54, -8], [-53, 0]],
    color: '#8888aa',
  },
  {
    from: 'drowned', to: 'luminous', name: 'Sunken Way',
    waypoints: [[-53, 0], [-55, 8], [-56, 18], [-55, 28], [-54, 35]],
    color: '#509088', dashed: true,
  },
  {
    from: 'luminous', to: 'bellroot', name: 'Archway Pass',
    waypoints: [[-50, 35], [-40, 38], [-28, 40], [-15, 42], [-5, 44]],
    color: '#e0d890',
  },
  {
    from: 'bellroot', to: 'ashen', name: 'Ember Trail',
    waypoints: [[5, 44], [18, 43], [30, 42], [40, 41], [48, 40]],
    color: '#cc5533', dashed: true,
  },
  {
    from: 'ashen', to: 'glass', name: 'Cinder Descent',
    waypoints: [[52, 35], [55, 25], [58, 15], [62, 5], [64, -2]],
    color: '#c0c8d0',
  },
  {
    from: 'glass', to: 'deyune', name: 'Mirage Crossing',
    waypoints: [[64, -8], [62, -18], [60, -28], [58, -38], [55, -45]],
    color: '#d4a84b', dashed: true,
  },
  {
    from: 'deyune', to: 'varnhalt', name: 'Windwalker Path',
    waypoints: [[48, -48], [38, -50], [25, -50], [15, -50], [5, -48]],
    color: '#a08050',
  },
  // === Cross-continent routes ===
  {
    from: 'virelay', to: 'varnhalt', name: 'Smuggler\'s Run',
    waypoints: [[-40, -38], [-30, -42], [-18, -45], [-8, -47]],
    color: '#8888aa', dashed: true,
  },
  {
    from: 'drowned', to: 'varnhalt', name: 'Ruin March',
    waypoints: [[-48, -5], [-38, -12], [-25, -22], [-15, -32], [-5, -42]],
    color: '#509088',
  },
  {
    from: 'luminous', to: 'drowned', name: 'Fading Bridge',
    waypoints: [[-54, 30], [-55, 18], [-55, 8], [-54, -2]],
    color: '#e0d890',
  },
]

function TravelRouteLine({ route }: { route: TravelRoute }) {
  const lineObj = useMemo(() => {
    const points: THREE.Vector3[] = []
    // Generate smooth path from waypoints with terrain following
    for (let wi = 0; wi < route.waypoints.length - 1; wi++) {
      const [ax, az] = route.waypoints[wi]
      const [bx, bz] = route.waypoints[wi + 1]
      const steps = 12
      for (let s = 0; s <= steps; s++) {
        const t = s / steps
        const x = ax + (bx - ax) * t
        const z = az + (bz - az) * t
        const land = continentMask(x, z)
        const h = land > 0.08 ? Math.max(getTerrainHeight(x, z), 0) : 0
        points.push(new THREE.Vector3(x, SURFACE_Y + h + 0.4, z))
      }
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return geo
  }, [route])

  const lineRef = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color: route.color,
      transparent: true,
      opacity: route.dashed ? 0.35 : 0.55,
      depthWrite: false,
    })
    const line = new THREE.Line(lineObj, mat)
    return line
  }, [lineObj, route])

  return (
    <group>
      <primitive object={lineRef} />
      {/* Route name at midpoint */}
      {(() => {
        const mid = route.waypoints[Math.floor(route.waypoints.length / 2)]
        const land = continentMask(mid[0], mid[1])
        const h = land > 0.08 ? Math.max(getTerrainHeight(mid[0], mid[1]), 0) : 0
        return (
          <Html
            position={[mid[0], SURFACE_Y + h + 3, mid[1]]}
            center
            style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
          >
            <div className="text-center select-none">
              <div
                className="text-[8px] font-serif italic tracking-wide"
                style={{ color: route.color, textShadow: '0 0 8px rgba(0,0,0,0.9)', opacity: 0.7 }}
              >
                {route.name}
              </div>
            </div>
          </Html>
        )
      })()}
    </group>
  )
}

function TravelRoutes() {
  return (
    <group>
      {TRAVEL_ROUTES.map((route, i) => (
        <TravelRouteLine key={i} route={route} />
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
// REGION BARRIERS — Natural/supernatural obstacles between regions
// ═══════════════════════════════════════════════════════════════
// Barriers enforce storytelling constraints — you can't just walk
// from one region to the next without consequence. Each barrier type
// is visually distinct so players immediately understand the cost.
interface RegionBarrier {
  name: string
  type: 'fray_wall' | 'volcanic_ridge' | 'drowned_channel' | 'glass_edge' | 'pattern_fence' | 'mist_bank'
  points: [number, number][]   // chain of x,z points defining the barrier line
  color: string
  emissive: string
  intensity: number
}

const REGION_BARRIERS: RegionBarrier[] = [
  // Fray Scar — between Virelay (instability) and Drowned Reach (loss)
  // A persistent tear in reality; crossing risks temporal displacement
  {
    name: 'The Fray Scar',
    type: 'fray_wall',
    points: [[-50, -18], [-48, -14], [-52, -10], [-50, -6], [-48, -2]],
    color: '#8040c0', emissive: '#6030a0', intensity: 1.2,
  },
  // Ashen Ridgeline — between Ashen Spine and Bellroot Vale
  // Volcanic barrier; only Ember Trail passes through safely
  {
    name: 'The Smolder Line',
    type: 'volcanic_ridge',
    points: [[35, 42], [38, 40], [42, 43], [46, 41], [50, 43]],
    color: '#cc4422', emissive: '#aa3311', intensity: 0.9,
  },
  // Submerged Channel — between Drowned Reach and Luminous Fold
  // Flooded terrain; the Sunken Way is the only viable crossing
  {
    name: 'The Drowned Channel',
    type: 'drowned_channel',
    points: [[-58, 15], [-55, 18], [-52, 15], [-50, 18], [-48, 15]],
    color: '#205858', emissive: '#104040', intensity: 0.7,
  },
  // Glass Edge — between Glass Expanse and Ashen Spine
  // Crystallized reality boundary; reflections disorient travelers
  {
    name: 'The Mirror Wall',
    type: 'glass_edge',
    points: [[55, 28], [58, 24], [60, 20], [62, 16], [64, 12]],
    color: '#c0d0e0', emissive: '#a0b8d0', intensity: 0.8,
  },
  // Pattern Fence — between Luminous Fold and the rest of the world
  // Artificially maintained; the Fold doesn't want outsiders
  {
    name: 'The Lattice Perimeter',
    type: 'pattern_fence',
    points: [[-42, 36], [-38, 32], [-32, 35], [-26, 32], [-20, 36]],
    color: '#e0d070', emissive: '#c0b050', intensity: 1.0,
  },
  // Mist Bank — between Virelay and Varnhalt
  // Thick disorienting fog; smugglers know the paths, others get lost
  {
    name: 'The Grey Veil',
    type: 'mist_bank',
    points: [[-32, -38], [-26, -42], [-20, -38], [-14, -42], [-8, -38]],
    color: '#667788', emissive: '#445566', intensity: 0.6,
  },
  // Windwall — between Deyune Steps and Glass Expanse
  // Perpetual gale; Mirage Crossing is the only navigable route
  {
    name: 'The Windwall',
    type: 'fray_wall',
    points: [[62, -15], [60, -20], [63, -25], [60, -30], [62, -35]],
    color: '#d4a84b', emissive: '#b08830', intensity: 0.8,
  },
]

function BarrierSegment({ barrier }: { barrier: RegionBarrier }) {
  const groupRef = useRef<THREE.Group>(null)

  const meshData = useMemo(() => {
    const segments: { pos: THREE.Vector3; rotation: number; length: number }[] = []
    for (let i = 0; i < barrier.points.length - 1; i++) {
      const [ax, az] = barrier.points[i]
      const [bx, bz] = barrier.points[i + 1]
      const mx = (ax + bx) / 2
      const mz = (az + bz) / 2
      const land = continentMask(mx, mz)
      const h = land > 0.08 ? Math.max(getTerrainHeight(mx, mz), 0) : 0
      const length = Math.sqrt((bx - ax) ** 2 + (bz - az) ** 2)
      const angle = Math.atan2(bx - ax, bz - az)
      segments.push({
        pos: new THREE.Vector3(mx, SURFACE_Y + h + 1.5, mz),
        rotation: angle,
        length,
      })
    }
    return segments
  }, [barrier])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial
          mat.emissiveIntensity = barrier.intensity + Math.sin(clock.elapsedTime * 1.5 + i * 1.2) * 0.3
          mat.opacity = 0.25 + Math.sin(clock.elapsedTime * 0.8 + i) * 0.08
        }
      })
    }
  })

  const wallHeight = barrier.type === 'volcanic_ridge' ? 5 :
                     barrier.type === 'fray_wall' ? 6 :
                     barrier.type === 'glass_edge' ? 4 :
                     barrier.type === 'pattern_fence' ? 3.5 :
                     barrier.type === 'mist_bank' ? 4 : 3

  return (
    <group ref={groupRef}>
      {meshData.map((seg, i) => (
        <group key={i} position={seg.pos} rotation={[0, seg.rotation, 0]}>
          {/* Wall panel */}
          <mesh>
            <boxGeometry args={[0.5, wallHeight, seg.length + 0.5]} />
            <meshStandardMaterial
              color={barrier.color} emissive={barrier.emissive}
              emissiveIntensity={barrier.intensity}
              transparent opacity={0.25} depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Glow plane (wider, softer) */}
          <mesh>
            <boxGeometry args={[2.5, wallHeight * 0.6, seg.length + 2]} />
            <meshStandardMaterial
              color={barrier.color} emissive={barrier.emissive}
              emissiveIntensity={barrier.intensity * 0.4}
              transparent opacity={0.08} depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <pointLight
            color={barrier.emissive}
            intensity={barrier.intensity * 0.8}
            distance={12}
            decay={2}
          />
        </group>
      ))}
      {/* Barrier label at midpoint */}
      {(() => {
        const mid = barrier.points[Math.floor(barrier.points.length / 2)]
        const land = continentMask(mid[0], mid[1])
        const h = land > 0.08 ? Math.max(getTerrainHeight(mid[0], mid[1]), 0) : 0
        return (
          <Html
            position={[mid[0], SURFACE_Y + h + wallHeight + 2, mid[1]]}
            center
            style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
          >
            <div className="text-center select-none">
              <div
                className="text-[8px] font-serif font-bold tracking-wide"
                style={{ color: barrier.color, textShadow: '0 0 8px rgba(0,0,0,0.9)', opacity: 0.8 }}
              >
                ⚠ {barrier.name}
              </div>
            </div>
          </Html>
        )
      })()}
    </group>
  )
}

function RegionBarriers() {
  return (
    <group>
      {REGION_BARRIERS.map((barrier, i) => (
        <BarrierSegment key={i} barrier={barrier} />
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
// LAYER 4 — THE EVERLOOP (Living Surface World)
// ═══════════════════════════════════════════════════════════════
// ─── Biome colour from height + moisture ────────────────────
function lerpColor(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function biomeColor(h: number, wx: number, wz: number, land: number, rv: number): [number, number, number] {
  const moisture = fbm(wx * 0.4 + 500, wz * 0.4 + 500, 5)
  const temp = 0.6 + fbm(wx * 0.15 + 800, wz * 0.15 + 800, 3) * 0.4 - h * 0.02
  const micro = fbm(wx * 4 + 900, wz * 4 + 900, 2) * 0.06
  const weights = getRegionWeights(wx, wz)

  // === Water (shared across all regions) ===
  if (land < 0.08 || h < -2) {
    const depth = Math.min(1, Math.max(0, (-h - 1) / 4))
    // Drowned Reach: teal-tinged deep water
    const droW = weights.get('drowned') ?? 0
    if (droW > 0.3) {
      const deep: [number, number, number] = [0.04, 0.14, 0.25]
      const mid: [number, number, number] = [0.06, 0.22, 0.35]
      return lerpColor(mid, deep, depth)
    }
    // Virelay: grey-violet unsettled water
    const virW = weights.get('virelay') ?? 0
    if (virW > 0.3) {
      const deep: [number, number, number] = [0.08, 0.08, 0.22]
      const mid: [number, number, number] = [0.10, 0.14, 0.30]
      return lerpColor(mid, deep, depth)
    }
    const deep: [number, number, number] = [0.04, 0.10, 0.28]
    const mid: [number, number, number] = [0.06, 0.18, 0.38]
    return lerpColor(mid, deep, depth)
  }
  if (h < -0.3) {
    const t = Math.min(1, (-h - 0.3) / 1.7)
    return lerpColor([0.10, 0.32, 0.50], [0.06, 0.20, 0.40], t)
  }
  if (h < 0) return [0.12 + micro, 0.36 + micro, 0.52]
  if (h < 0.4 && land < 0.22) return [0.78 + micro, 0.72 + micro, 0.52 + micro]
  if (rv > 0.6) {
    const blend = Math.min(1, (rv - 0.6) * 3.5)
    return lerpColor([0.22, 0.48, 0.22], [0.08, 0.28, 0.45], blend)
  }
  if (rv > 0.3) {
    const blend = (rv - 0.3) / 0.3
    return lerpColor([0.28, 0.42, 0.20], [0.18, 0.32, 0.16], blend)
  }

  // === Per-region land coloring ===
  const dom = getDominantRegion(wx, wz)

  // 1. Deyune Steps — golden-amber windswept grassland
  if (dom === 'deyune') {
    const wind = fbm(wx * 1.5 + 300, wz * 1.5 + 300, 3)
    if (h < 3) {
      const gold: [number, number, number] = [0.62 + micro, 0.54 + micro, 0.28]
      const amber: [number, number, number] = [0.55 + micro, 0.46 + micro, 0.22]
      const tan: [number, number, number] = [0.50 + micro, 0.42 + micro, 0.20]
      const base = lerpColor(amber, gold, wind)
      return lerpColor(base, tan, h / 3 * 0.3)
    }
    if (h < 6) return [0.48 + micro, 0.44 + micro, 0.28]
    return [0.52 + micro, 0.48 + micro, 0.38]
  }

  // 2. Virelay Coastlands — muted grey-green fog, bruised purples
  if (dom === 'virelay') {
    const shift = fbm(wx * 2 + 400, wz * 2 + 400, 3) * 0.08
    if (h < 2) {
      const fogGreen: [number, number, number] = [0.28 + shift, 0.34 + shift, 0.28]
      const bruised: [number, number, number] = [0.32 + shift, 0.28 + shift, 0.34]
      return lerpColor(fogGreen, bruised, moisture)
    }
    if (h < 5) {
      const muted: [number, number, number] = [0.24 + micro, 0.30 + micro, 0.24]
      const dark: [number, number, number] = [0.18 + micro, 0.22 + micro, 0.20]
      return lerpColor(muted, dark, (h - 2) / 3)
    }
    return [0.30 + micro, 0.28 + micro, 0.32]
  }

  // 3. Bellroot Vale — deep emerald, violet undertones, sacred
  if (dom === 'bellroot') {
    const resonance = fbm(wx * 0.8 + 800, wz * 0.8 + 800, 3) * 0.05
    if (h < 2) {
      const lush: [number, number, number] = [0.10 + resonance, 0.38 + resonance, 0.14]
      const deep: [number, number, number] = [0.08 + resonance, 0.30 + resonance, 0.18]
      return lerpColor(lush, deep, moisture)
    }
    if (h < 5) {
      const canopy: [number, number, number] = [0.06 + micro, 0.28 + micro, 0.12]
      const floor: [number, number, number] = [0.10 + micro, 0.22 + micro, 0.16]
      return lerpColor(canopy, floor, (h - 2) / 3)
    }
    if (h < 8) return [0.14 + micro, 0.24 + micro, 0.18]
    return [0.35 + micro, 0.32 + micro, 0.28]
  }

  // 4. Ashen Spine — dark volcanic rock, obsidian, lava-tint
  if (dom === 'ashen') {
    const heat = fbm(wx * 1.2 + 500, wz * 1.2 + 500, 3)
    if (h < 2) {
      const ash: [number, number, number] = [0.22 + micro, 0.20 + micro, 0.18]
      const char: [number, number, number] = [0.18 + micro, 0.15 + micro, 0.13]
      return lerpColor(ash, char, heat)
    }
    if (h < 6) {
      const obsidian: [number, number, number] = [0.15 + micro, 0.12 + micro, 0.12]
      const rock: [number, number, number] = [0.25 + micro, 0.22 + micro, 0.20]
      return lerpColor(obsidian, rock, (h - 2) / 4)
    }
    if (h < 12) {
      const darkRock: [number, number, number] = [0.28 + micro, 0.24 + micro, 0.22]
      const lava: [number, number, number] = [0.40, 0.15, 0.08]
      return lerpColor(darkRock, lava, Math.max(0, heat - 0.55) * 3)
    }
    if (h < 18) {
      const t = (h - 12) / 6
      return lerpColor([0.30, 0.26, 0.24], [0.45, 0.42, 0.40], t)
    }
    return [0.50 + micro, 0.48 + micro, 0.46]
  }

  // 5. Glass Expanse — pale crystalline sand, iridescent shimmer
  if (dom === 'glass') {
    const shimmer = fbm(wx * 3 + 600, wz * 3 + 600, 2) * 0.08
    if (h < 3) {
      const crystal: [number, number, number] = [0.72 + shimmer, 0.70 + shimmer, 0.65]
      const sand: [number, number, number] = [0.65 + shimmer, 0.62 + shimmer, 0.55]
      const blueShift: [number, number, number] = [0.60 + shimmer, 0.65 + shimmer, 0.72]
      const base = lerpColor(sand, crystal, fbm(wx * 2 + 200, wz * 2 + 200, 2))
      // Iridescent patches
      const iri = fbm(wx * 4 + 700, wz * 4 + 700, 2)
      if (iri > 0.55) return lerpColor(base, blueShift, (iri - 0.55) * 4)
      return base
    }
    if (h < 6) return [0.58 + micro, 0.56 + micro, 0.52]
    return [0.50 + micro, 0.48 + micro, 0.45]
  }

  // 6. Varnhalt Frontier — earthy browns, muddy greens, rugged
  if (dom === 'varnhalt') {
    if (h < 2) {
      const mud: [number, number, number] = [0.35 + micro, 0.32 + micro, 0.20]
      const grass: [number, number, number] = [0.30 + micro, 0.40 + micro, 0.18]
      return lerpColor(mud, grass, moisture)
    }
    if (h < 5) {
      const scrub: [number, number, number] = [0.28 + micro, 0.35 + micro, 0.16]
      const rock: [number, number, number] = [0.38 + micro, 0.34 + micro, 0.26]
      return lerpColor(scrub, rock, (h - 2) / 3)
    }
    if (h < 8) return [0.40 + micro, 0.36 + micro, 0.28]
    return [0.46 + micro, 0.42 + micro, 0.34]
  }

  // 7. Luminous Fold — ethereal white-gold, pristine, too-perfect greens
  if (dom === 'luminous') {
    const glow = fbm(wx * 0.6 + 1000, wz * 0.6 + 1000, 3) * 0.06
    if (h < 2) {
      const pristine: [number, number, number] = [0.45 + glow, 0.58 + glow, 0.35]
      const manicured: [number, number, number] = [0.40 + glow, 0.55 + glow, 0.30]
      return lerpColor(manicured, pristine, moisture)
    }
    if (h < 5) {
      const ordered: [number, number, number] = [0.38 + micro, 0.52 + micro, 0.32]
      const white: [number, number, number] = [0.70 + micro, 0.68 + micro, 0.60]
      return lerpColor(ordered, white, (h - 2) / 3 * 0.5)
    }
    if (h < 8) return [0.60 + micro, 0.58 + micro, 0.52]
    return [0.75 + micro, 0.73 + micro, 0.68]
  }

  // 8. Drowned Reach — waterlogged dark blue-green, mossy ruins
  if (dom === 'drowned') {
    const waterlog = fbm(wx * 0.9 + 600, wz * 0.9 + 600, 4)
    if (h < 1.5) {
      const swamp: [number, number, number] = [0.12 + micro, 0.25 + micro, 0.20]
      const moss: [number, number, number] = [0.15 + micro, 0.30 + micro, 0.18]
      const submerged: [number, number, number] = [0.08, 0.18, 0.25]
      const base = lerpColor(swamp, moss, moisture)
      // Partially submerged patches
      if (waterlog > 0.52) return lerpColor(base, submerged, (waterlog - 0.52) * 4)
      return base
    }
    if (h < 4) {
      const wet: [number, number, number] = [0.16 + micro, 0.28 + micro, 0.18]
      const dry: [number, number, number] = [0.22 + micro, 0.32 + micro, 0.22]
      return lerpColor(wet, dry, (h - 1.5) / 2.5)
    }
    return [0.28 + micro, 0.30 + micro, 0.26]
  }

  // === Default biome (borders / unassigned areas) ===
  if (h < 2) {
    const t = h / 2
    if (moisture > 0.55) return lerpColor([0.14 + micro, 0.40 + micro, 0.12], [0.25 + micro, 0.55 + micro, 0.18], t)
    if (moisture > 0.38) return [0.30 + micro, 0.55 + micro, 0.20]
    return [0.50 + micro, 0.55 + micro, 0.28]
  }
  if (h < 4.5) {
    const t = (h - 2) / 2.5
    if (moisture > 0.48) return lerpColor([0.22, 0.50, 0.16], [0.10, 0.38, 0.10], t * 0.7 + micro * 3)
    return [0.28 + micro, 0.48 + micro, 0.18]
  }
  if (h < 7) {
    const t = (h - 4.5) / 2.5
    if (temp > 0.5) return lerpColor([0.12 + micro, 0.36, 0.10], [0.06, 0.26, 0.06], t)
    return [0.06 + micro, 0.24 + micro * 2, 0.10]
  }
  if (h < 10) {
    const t = (h - 7) / 3
    return lerpColor([0.22, 0.35, 0.15], [0.42, 0.38, 0.30], t + micro * 2)
  }
  if (h < 14) {
    const t = (h - 10) / 4
    return lerpColor([0.44 + micro, 0.40 + micro, 0.32], [0.55 + micro, 0.50 + micro, 0.42], t)
  }
  if (h < 18) {
    const t = (h - 14) / 4
    return lerpColor([0.55, 0.50, 0.44], [0.88, 0.87, 0.85], t * t)
  }
  const snowAmount = Math.min(1, (h - 18) / 3)
  return lerpColor([0.88, 0.87, 0.85], [0.95, 0.95, 0.94], snowAmount)
}

function TheSurface() {
  const geometry = useMemo(() => {
    // Terrain plane clipped to disc
    const size = WORLD_RADIUS * 2
    const segments = 350
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    const positions = geo.attributes.position
    const colors = new Float32Array(positions.count * 3)
    const indices: number[] = []
    const indexArr = geo.index!

    // Discard triangles entirely outside the disc
    for (let i = 0; i < indexArr.count; i += 3) {
      const ia = indexArr.getX(i), ib = indexArr.getX(i + 1), ic = indexArr.getX(i + 2)
      let allOut = true
      for (const idx of [ia, ib, ic]) {
        const vx = positions.getX(idx); const vz = positions.getY(idx)
        if (Math.sqrt(vx * vx + vz * vz) <= WORLD_RADIUS + 2) { allOut = false; break }
      }
      if (!allOut) { indices.push(ia, ib, ic) }
    }
    geo.setIndex(indices)

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getY(i) // Plane is XY, we rotate to XZ
      const dist = Math.sqrt(x * x + z * z)

      // Clip vertices outside disc radius to edge
      if (dist > WORLD_RADIUS) {
        const scale = WORLD_RADIUS / dist
        positions.setX(i, x * scale)
        positions.setY(i, z * scale)
      }

      const px = positions.getX(i)
      const pz = positions.getY(i)
      // Compute expensive functions once per vertex
      const land = continentMask(px, pz)
      const rv = riverFactor(px, pz)
      const h = getTerrainHeight(px, pz, { land, rv })
      positions.setZ(i, h)

      const [r, g, b] = biomeColor(h, px, pz, land, rv)
      colors[i * 3] = r; colors[i * 3 + 1] = g; colors[i * 3 + 2] = b
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <group position={[0, SURFACE_Y, 0]}>
      {/* Terrain disc */}
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial vertexColors roughness={0.7} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>
      {/* Ocean water plane */}
      <Water />
      {/* Disc edge — rock rim */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[WORLD_RADIUS, WORLD_RADIUS + 3, 6, 96, 1, true]} />
        <meshStandardMaterial color="#2a2218" roughness={0.9} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Underside glow */}
      <mesh position={[0, -4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[WORLD_RADIUS - 2, 96]} />
        <meshStandardMaterial
          color="#1a3040" emissive="#2060a0" emissiveIntensity={0.3}
          transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function Water() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = -0.5 + Math.sin(clock.elapsedTime * 0.25) * 0.08
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <circleGeometry args={[WORLD_RADIUS - 0.5, 96]} />
      <meshStandardMaterial color="#0a3050" transparent opacity={0.8} roughness={0.05} metalness={0.6} />
    </mesh>
  )
}

// ═══════════════════════════════════════════════════════════════
// THE FRAY — Scattered rifts on the surface where reality tears
// ═══════════════════════════════════════════════════════════════

// Deterministic Fray rift positions scattered across the land
const FRAY_RIFTS: [number, number][] = [
  [25, 15], [-18, 8], [40, -20], [-35, -15], [10, -35],
  [-8, 30], [50, 5], [-42, 22], [15, 45], [-25, -38],
  [38, 32], [-50, -5], [8, -48], [55, -35], [-15, 50],
  [-48, -30], [30, -45], [48, 20], [-30, 42], [20, -15],
  [-55, 10], [42, -10], [-20, -50], [5, 55], [60, -25],
]

function FrayRift({ x, z, index }: { x: number; z: number; index: number }) {
  const ref = useRef<THREE.Group>(null)
  const land = continentMask(x, z)
  const terrainH = land > 0.08 ? Math.max(getTerrainHeight(x, z), 0) : 0
  const onLand = land > 0.08

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial
          mat.emissiveIntensity = 0.8 + Math.sin(clock.elapsedTime * 2.5 + index * 1.3 + i) * 0.5
          mat.opacity = 0.25 + Math.sin(clock.elapsedTime * 1.8 + index * 0.7) * 0.1
        }
      })
    }
  })

  if (!onLand) return null

  const y = SURFACE_Y + terrainH + 0.3
  const size = 0.6 + seededRandom(index * 47) * 0.8

  return (
    <group ref={ref} position={[x, y, z]}>
      {/* Rift glow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 2, 16]} />
        <meshStandardMaterial
          color="#6020a0" emissive="#8040c0" emissiveIntensity={1}
          transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide}
        />
      </mesh>
      {/* Inner bright core */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 0.6, 12]} />
        <meshStandardMaterial
          color="#c060ff" emissive="#b050ee" emissiveIntensity={1.5}
          transparent opacity={0.5} depthWrite={false} side={THREE.DoubleSide}
        />
      </mesh>
      {/* Vertical wisp */}
      <mesh position={[0, size * 1.5, 0]}>
        <cylinderGeometry args={[size * 0.15, size * 0.4, size * 3, 6, 1, true]} />
        <meshStandardMaterial
          color="#8040c0" emissive="#6030a0" emissiveIntensity={0.8}
          transparent opacity={0.15} depthWrite={false} side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight color="#8040c0" intensity={1.5} distance={size * 8} decay={2} />
    </group>
  )
}

function FrayRifts() {
  return (
    <group>
      {FRAY_RIFTS.map(([x, z], i) => (
        <FrayRift key={i} x={x} z={z} index={i} />
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
// HOLLOWS — Dark connections between layers
// ═══════════════════════════════════════════════════════════════
function Hollows() {
  const positions = useMemo(() => {
    const pts: [number, number][] = []
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + 1
      const r = 30 + Math.sin(i * 3) * 18
      pts.push([Math.cos(angle) * r, Math.sin(angle) * r])
    }
    return pts
  }, [])

  return (
    <group>
      {positions.map(([x, z], i) => (
        <mesh key={i} position={[x, (SURFACE_Y + PATTERN_Y) / 2, z]}>
          <cylinderGeometry args={[1.5, 2, SURFACE_Y - PATTERN_Y - 5, 6, 1, true]} />
          <meshStandardMaterial
            color="#150520" emissive="#200830" emissiveIntensity={0.3}
            transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
// LOCATION BEACONS (on the surface)
// ═══════════════════════════════════════════════════════════════
function LocationBeacon({
  location, isSelected, onSelect,
}: {
  location: MapLocation; isSelected: boolean; onSelect: (loc: MapLocation) => void
}) {
  const beaconRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const color = getTypeColor(location.type)
  const icon = getTypeIcon(location.type)

  const terrainH = useMemo(
    () => Math.max(getTerrainHeight(location.x, location.z), 0),
    [location.x, location.z]
  )

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = clock.elapsedTime * 0.5
    }
    if (beaconRef.current) {
      beaconRef.current.position.y = SURFACE_Y + terrainH + location.elevation +
        Math.sin(clock.elapsedTime * 0.8 + location.x) * 0.15
    }
  })

  const truncatedDesc = location.description
    ? location.description.length > 120
      ? location.description.slice(0, 120) + '…'
      : location.description
    : null

  return (
    <group
      ref={beaconRef}
      position={[location.x, SURFACE_Y + terrainH + location.elevation, location.z]}
      scale={isSelected ? 1.4 : hovered ? 1.2 : 1}
      onClick={(e) => { e.stopPropagation(); onSelect(location) }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
    >
      {/* Pillar */}
      <mesh position={[0, -location.elevation / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.15, location.elevation + 0.5, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.3} />
      </mesh>
      {/* Orb + ring */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
        <mesh castShadow>
          <sphereGeometry args={[0.35, 12, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} roughness={0.2} metalness={0.5} />
        </mesh>
        <mesh ref={ringRef}>
          <torusGeometry args={[0.6, 0.03, 8, 24]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.7} />
        </mesh>
      </Float>
      {/* Label — fixed screen size so it's readable when zoomed out */}
      <Html position={[0, 1.5, 0]} center style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        <div className="text-center select-none">
          <div className="text-xs font-serif font-bold drop-shadow-lg" style={{ color, textShadow: '0 0 8px rgba(0,0,0,0.9)' }}>
            {location.name}
          </div>
        </div>
      </Html>
      {/* Hover info tooltip — fixed screen size */}
      {hovered && (
        <Html position={[0, 3, 0]} center style={{ pointerEvents: 'auto', whiteSpace: 'normal' }}>
          <div
            className="select-none rounded-lg p-3 backdrop-blur-xl border"
            style={{
              width: '220px',
              background: 'linear-gradient(135deg, rgba(10, 20, 25, 0.95), rgba(15, 30, 35, 0.92))',
              borderColor: `${color}50`,
              boxShadow: `0 0 20px ${color}30, 0 8px 30px rgba(0,0,0,0.6)`,
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">{icon}</span>
              <span className="text-sm font-serif font-bold" style={{ color }}>{location.name}</span>
            </div>
            {truncatedDesc && (
              <p className="text-[11px] leading-snug mb-2" style={{ color: 'rgba(210, 200, 180, 0.8)' }}>
                {truncatedDesc}
              </p>
            )}
            <a
              href={`/explore/${location.slug}`}
              className="block text-center px-2 py-1 rounded text-[11px] font-medium transition-all hover:brightness-125"
              style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
              onClick={(e) => e.stopPropagation()}
            >
              View in Archive →
            </a>
          </div>
        </Html>
      )}
      <pointLight color={color} intensity={isSelected ? 3 : hovered ? 2 : 1} distance={10} decay={2} />
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
// AMBIENT PARTICLES (golden motes above the surface)
// ═══════════════════════════════════════════════════════════════
function SurfaceParticles() {
  const obj = useMemo(() => {
    const count = 2500
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = Math.random() * WORLD_RADIUS * 0.95
      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = SURFACE_Y + 2 + Math.random() * 20
      positions[i * 3 + 2] = Math.sin(angle) * r
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.12, color: '#d4a84b', transparent: true, opacity: 0.35,
      sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }))
  }, [])

  useFrame(({ clock }) => {
    const pos = obj.geometry.attributes.position as THREE.BufferAttribute
    const t = clock.elapsedTime * 0.1
    for (let i = 0; i < Math.min(pos.count, 400); i++) {
      pos.setY(i, pos.getY(i) + Math.sin(t + i * 0.15) * 0.003)
    }
    pos.needsUpdate = true
  })

  return <primitive object={obj} />
}

// ═══════════════════════════════════════════════════════════════
// LAYER LABELS (HTML positioned in 3D space)
// ═══════════════════════════════════════════════════════════════
function LayerLabels() {
  const labels = [
    { y: SURFACE_Y + 18, text: 'THE EVERLOOP', sub: 'Living Surface', color: '#d4a84b' },
    { y: PATTERN_Y, text: 'THE PATTERN', sub: 'Fabric of Reality', color: '#40a0ff' },
    { y: FOLD_Y, text: 'THE FOLD', sub: "Architects' Realm", color: '#6080b0' },
    { y: DRIFT_Y, text: 'THE DRIFT', sub: 'Sea of Origins', color: '#6030a0' },
  ]

  return (
    <group>
      {labels.map((label) => (
        <Html key={label.text} position={[-145, label.y, 0]} style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <div className="select-none">
            <div className="text-sm font-serif font-bold tracking-wider" style={{ color: label.color, textShadow: '0 0 12px rgba(0,0,0,0.9)' }}>
              {label.text}
            </div>
            <div className="text-[10px] italic opacity-60" style={{ color: label.color }}>
              {label.sub}
            </div>
          </div>
        </Html>
      ))}
    </group>
  )
}

// Stable orbit target — avoids re-creating Vector3 each render
const ORBIT_TARGET = new THREE.Vector3(0, 15, 0)

// ═══════════════════════════════════════════════════════════════
// REGION LABELS (floating above terrain in each region)
// ═══════════════════════════════════════════════════════════════
const REGION_LABEL_DATA: { id: RegionId; name: string; sub: string; x: number; z: number; color: string }[] = [
  { id: 'deyune',   name: 'The Deyune Steps',     sub: 'Nomadic Vastlands',     x: 55,  z: -50, color: '#d4a84b' },
  { id: 'virelay',  name: 'Virelay Coastlands',    sub: 'Fractured Shore',       x: -50, z: -35, color: '#8888aa' },
  { id: 'bellroot', name: 'The Bellroot Vale',     sub: 'Memory Nexus',          x: 0,   z: 45,  color: '#50c070' },
  { id: 'ashen',    name: 'The Ashen Spine',       sub: 'Volcanic Chain',        x: 55,  z: 40,  color: '#cc5533' },
  { id: 'glass',    name: 'The Glass Expanse',     sub: 'Crystal Desert',        x: 65,  z: -5,  color: '#c0c8d0' },
  { id: 'varnhalt', name: 'Varnhalt Frontier',     sub: 'Rough Feudal Edge',     x: 0,   z: -50, color: '#a08050' },
  { id: 'luminous', name: 'The Luminous Fold',     sub: 'Over-Stabilized Zone',  x: -55, z: 35,  color: '#e0d890' },
  { id: 'drowned',  name: 'The Drowned Reach',     sub: 'Submerged Ruins',       x: -55, z: -5,  color: '#509088' },
]

function RegionLabels() {
  return (
    <group>
      {REGION_LABEL_DATA.map((r) => {
        const terrainH = Math.max(getTerrainHeight(r.x, r.z), 0)
        return (
          <Html
            key={r.id}
            position={[r.x, SURFACE_Y + terrainH + 8, r.z]}
            center
            style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
          >
            <div className="text-center select-none">
              <div
                className="text-sm font-serif font-bold tracking-wide"
                style={{ color: r.color, textShadow: '0 0 10px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6)' }}
              >
                {r.name}
              </div>
              <div className="text-[9px] italic opacity-50" style={{ color: r.color }}>
                {r.sub}
              </div>
            </div>
          </Html>
        )
      })}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
// SCENE
// ═══════════════════════════════════════════════════════════════
function Scene({
  locations, selectedLocation, onSelectLocation,
}: {
  locations: MapLocation[]
  selectedLocation: MapLocation | null
  onSelectLocation: (loc: MapLocation) => void
}) {
  return (
    <>
      {/* Global lighting — bright enough to see vivid terrain */}
      <ambientLight intensity={0.35} color="#e8e0d0" />
      <directionalLight
        position={[100, 120, 60]} intensity={1.2} color="#fff4e0" castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-far={400}
        shadow-camera-left={-160} shadow-camera-right={160}
        shadow-camera-top={160} shadow-camera-bottom={-160}
      />
      <directionalLight position={[-80, 100, -50]} intensity={0.3} color="#8090cc" />
      <hemisphereLight args={['#c0d0e0', '#1a1a30', 0.4]} />

      {/* Stars behind everything */}
      <Stars radius={400} depth={200} count={10000} factor={6} saturation={0.3} fade speed={0.3} />

      {/* === THE FOUR LAYERS === */}
      <TheDrift />
      <TheFold />
      <ThePattern />
      <Anchors />
      <PatternShards />
      <TheSurface />
      <FrayRifts />
      <SurfaceShards />
      <TravelRoutes />
      <RegionBarriers />
      <Hollows />

      {/* Surface elements */}
      <SurfaceParticles />
      {locations.filter(loc => loc.type === 'location').map((loc) => (
        <LocationBeacon
          key={loc.id}
          location={loc}
          isSelected={selectedLocation?.id === loc.id}
          onSelect={onSelectLocation}
        />
      ))}

      {/* Layer labels */}
      <LayerLabels />
      {/* Region labels */}
      <RegionLabels />

      {/* Camera — user has full control, no auto-animation */}
      <OrbitControls
        makeDefault enableDamping dampingFactor={0.05}
        minDistance={15} maxDistance={500}
        target={ORBIT_TARGET}
        enablePan
      />

      <fog attach="fog" args={['#05050a', 250, 550]} />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// UI OVERLAYS
// ═══════════════════════════════════════════════════════════════
function InfoPanel({ location, onClose }: { location: MapLocation; onClose: () => void }) {
  const color = getTypeColor(location.type)
  const icon = getTypeIcon(location.type)

  return (
    <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[420px] z-20 animate-slide-up">
      <div className="rounded-xl p-6 backdrop-blur-xl border" style={{
        background: 'linear-gradient(135deg, rgba(13, 26, 26, 0.95), rgba(20, 40, 40, 0.9))',
        borderColor: `${color}40`,
        boxShadow: `0 0 40px ${color}20, 0 20px 60px rgba(0,0,0,0.5)`,
      }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="text-xl font-serif font-bold" style={{ color }}>{location.name}</h3>
              <span className="text-xs uppercase tracking-wider opacity-70" style={{ color }}>{location.type}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-parchment-muted hover:text-parchment transition-colors p-1" aria-label="Close">✕</button>
        </div>
        {location.description && <p className="text-sm text-parchment-muted leading-relaxed mb-4">{location.description}</p>}
        <div className="flex flex-wrap gap-4 text-xs mb-4">
          <div>
            <span className="text-parchment-muted">Stability</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: `${color}20` }}>
                <div className="h-full rounded-full" style={{ width: `${location.stability * 100}%`, background: color }} />
              </div>
              <span style={{ color }}>{Math.round(location.stability * 100)}%</span>
            </div>
          </div>
        </div>
        {location.tags && location.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {location.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-xs border" style={{ borderColor: `${color}30`, color: `${color}cc`, background: `${color}10` }}>{tag}</span>
            ))}
          </div>
        )}
        <a href={`/explore/${location.slug}`} className="block text-center px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
          View Full Entry →
        </a>
      </div>
    </div>
  )
}

function MapLegend() {
  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="rounded-lg p-3 backdrop-blur-xl border border-gold/20" style={{ background: 'rgba(5, 10, 15, 0.9)' }}>
        <h4 className="text-xs font-serif text-parchment mb-2 uppercase tracking-wider">Layers of Reality</h4>
        <div className="space-y-1.5">
          {[
            { color: '#d4a84b', label: 'The Everloop', sub: 'Living Surface' },
            { color: '#40a0ff', label: 'The Pattern', sub: 'Fabric of Reality' },
            { color: '#6080b0', label: 'The Fold', sub: "Architects' Realm" },
            { color: '#6030a0', label: 'The Drift', sub: 'Sea of Origins' },
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
          <h4 className="text-xs font-serif text-parchment mb-1.5 uppercase tracking-wider">Surface Markers</h4>
          <div className="space-y-1.5">
            {[
              { color: '#d4a84b', label: 'Locations', sub: 'Canon Places', shape: 'circle' as const },
              { color: '#60d0ff', label: 'Shard Sites', sub: 'Crystal Fragments', shape: 'diamond' as const },
              { color: '#8040c0', label: 'Fray Rifts', sub: 'Reality Tears', shape: 'circle' as const },
              { color: '#d4a84b', label: 'Travel Routes', sub: 'Safe Corridors', shape: 'line' as const },
              { color: '#cc4422', label: 'Barriers', sub: 'Region Boundaries', shape: 'line-danger' as const },
            ].map(({ color, label, sub, shape }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 ${shape === 'diamond' ? 'rotate-45' : shape.startsWith('line') ? 'h-0.5 w-4 rounded' : 'rounded-full'}`} style={{ background: color, boxShadow: `0 0 6px ${color}80`, ...(shape === 'line-danger' ? { background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 3px, transparent 3px, transparent 6px)` } : {}) }} />
                <div>
                  <span className="text-xs text-parchment">{label}</span>
                  <span className="text-[9px] text-parchment-muted ml-1.5">{sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gold/10">
          <p className="text-[9px] text-parchment-muted italic leading-tight">
            Scroll to zoom · Drag to orbit<br />Hover beacons for info · Click for details
          </p>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="text-center">
        <div className="text-6xl mb-4">🌫️</div>
        <h2 className="text-2xl font-serif text-parchment mb-2">The Land Awaits</h2>
        <p className="text-parchment-muted max-w-md">
          No canonical locations have been discovered yet.
        </p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function EverloopMap({ locations }: EverloopMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const handleSelect = useCallback((loc: MapLocation) => {
    setSelectedLocation((prev) => (prev?.id === loc.id ? null : loc))
  }, [])
  const handleClose = useCallback(() => { setSelectedLocation(null) }, [])

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{ position: [160, 70, 160], fov: 40, near: 0.1, far: 1000 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        style={{ background: '#030308' }}
        onClick={() => setSelectedLocation(null)}
      >
        <Scene locations={locations} selectedLocation={selectedLocation} onSelectLocation={handleSelect} />
      </Canvas>
      <MapLegend />
      {locations.length === 0 && <EmptyState />}
      {selectedLocation && <InfoPanel location={selectedLocation} onClose={handleClose} />}
    </div>
  )
}
