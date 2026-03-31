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
const WORLD_RADIUS = 55   // Disc radius
const FRAY_HEIGHT = 50    // How tall the Fray column reaches

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

// ─── Continental mask: defines land vs ocean ───────────────
function continentMask(wx: number, wz: number): number {
  // Main continent — large irregular mass through center-north
  const blobs: [number, number, number, number, number][] = [
    // [x, z, radiusX, radiusZ, strength]
    [8, 5, 28, 24, 1.0],      // Central landmass core
    [22, 14, 16, 14, 0.95],   // NE extension
    [-10, -2, 18, 16, 0.92],  // Western lobe
    [5, -18, 15, 20, 0.88],   // Southern peninsula
    [-6, 20, 14, 10, 0.85],   // Northern cape
    [32, -8, 10, 12, 0.7],    // Eastern peninsula
    [-28, -10, 12, 14, 0.65], // Far-west large island
    [-22, 12, 8, 10, 0.6],    // NW island
    [18, -28, 10, 8, 0.55],   // SE island
    [35, 10, 7, 9, 0.5],      // Eastern archipelago
    [-32, -26, 6, 7, 0.45],   // SW islet
    [0, 30, 9, 6, 0.5],       // Northern isle
    [-15, -30, 7, 5, 0.4],    // Southern islet
    [28, 25, 6, 8, 0.42],     // NE islet
  ]
  let v = 0
  for (const [bx, bz, brx, brz, strength] of blobs) {
    const dx = (wx - bx) / brx; const dz = (wz - bz) / brz
    const d = Math.sqrt(dx * dx + dz * dz)
    if (d < 1) {
      const f = 1 - d
      v = Math.max(v, strength * f * f * (3 - 2 * f)) // smoothstep falloff
    }
  }
  // Fractal coastline distortion — multiple octaves for jagged coasts
  const coast1 = fbm(wx * 1.5 + 50, wz * 1.5 + 50, 6) - 0.42
  const coast2 = fbm(wx * 2.8 + 150, wz * 2.8 + 150, 4) - 0.45
  v += coast1 * 0.35 + coast2 * 0.15
  // Peninsulas and inlets via directional noise
  v += Math.sin(wx * 0.08 + wz * 0.06) * fbm(wx * 0.9 + 80, wz * 0.9 + 80, 3) * 0.12
  return v
}

// ─── River paths: carved valleys between terrain ────────────
function riverFactor(wx: number, wz: number): number {
  const rivers: { ox: number; oz: number; dx: number; dz: number; freq: number; amp: number; width: number }[] = [
    { ox: 12, oz: 25, dx: 0.1, dz: -1, freq: 0.13, amp: 7, width: 2.0 },    // Great North-South river
    { ox: -10, oz: 10, dx: 0.8, dz: -0.6, freq: 0.10, amp: 5.5, width: 1.6 }, // Western river
    { ox: 5, oz: -5, dx: 1, dz: 0.2, freq: 0.16, amp: 4, width: 1.4 },       // East-flowing river
    { ox: 20, oz: 15, dx: -0.3, dz: -1, freq: 0.18, amp: 3.5, width: 1.2 },  // Eastern tributary
    { ox: -5, oz: -15, dx: 0.6, dz: 0.8, freq: 0.14, amp: 3, width: 1.0 },   // Southern stream
    { ox: 25, oz: 0, dx: -1, dz: 0.3, freq: 0.20, amp: 4, width: 1.3 },      // SE river delta
  ]
  let closest = Infinity
  let riverWidth = 1.8
  for (const r of rivers) {
    for (let t = -35; t <= 35; t += 0.8) {
      const rx = r.ox + r.dx * t + Math.sin(t * r.freq) * r.amp + Math.sin(t * r.freq * 2.3 + 1) * r.amp * 0.3
      const rz = r.oz + r.dz * t + Math.cos(t * r.freq * 0.8) * r.amp * 0.6 + Math.cos(t * r.freq * 1.7 + 2) * r.amp * 0.2
      const dx = wx - rx; const dz = wz - rz
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist < closest) { closest = dist; riverWidth = r.width }
    }
  }
  return Math.max(0, 1 - closest / riverWidth)
}

function getTerrainHeight(wx: number, wz: number): number {
  const dist = Math.sqrt(wx * wx + wz * wz)
  const edgeFade = Math.max(0, 1 - Math.pow(dist / WORLD_RADIUS, 2.5))
  const land = continentMask(wx, wz)

  if (land < 0.08) {
    // Ocean floor with varying depth
    const oceanDepth = fbm(wx * 0.4 + 200, wz * 0.4 + 200, 4)
    const trench = Math.max(0, fbm(wx * 0.15 + 400, wz * 0.15 + 400, 3) - 0.6) * 8
    return (-1.8 - oceanDepth * 2.5 - trench) * edgeFade
  }

  // Shore band
  const shoreBlend = land < 0.2 ? (land - 0.08) / 0.12 : 1

  // Base terrain — continental elevation
  let h = land * 2.5

  // Low-frequency rolling terrain
  h += fbm(wx + 100, wz + 100, 6) * 5

  // Medium-frequency hills
  h += fbm(wx * 1.5 + 70, wz * 1.5 + 70, 4) * 2.5

  // Mountain ranges: ridged noise concentrated in zones
  const ridge1 = Math.abs(fbm(wx * 0.6 + 300, wz * 0.6 + 300, 5) - 0.5) * 2
  const ridge2 = Math.abs(fbm(wx * 0.45 + 500, wz * 0.45 - 200, 4) - 0.5) * 2
  const mountainZone1 = Math.max(0, fbm(wx * 0.2, wz * 0.2, 3) - 0.32) * 3.5
  const mountainZone2 = Math.max(0, fbm(wx * 0.18 + 100, wz * 0.18 + 100, 3) - 0.38) * 2.5
  h += ridge1 * mountainZone1 * 12 + ridge2 * mountainZone2 * 8

  // Volcanic peaks — sharp isolated mountains
  const peaks: [number, number, number, number][] = [
    [18, 8, 4, 14],   // Main peak
    [-15, -12, 3.5, 11], // Western peak
    [30, -5, 3, 9],   // Eastern peak
    [-5, 22, 2.5, 7], // Northern peak
  ]
  for (const [px, pz, radius, height] of peaks) {
    const pd = Math.sqrt((wx - px) ** 2 + (wz - pz) ** 2)
    if (pd < radius * 3) {
      const f = Math.max(0, 1 - pd / (radius * 2.5))
      h += f * f * height
    }
  }

  // Valley systems — low areas between mountain ranges
  const valley = Math.max(0, 0.4 - fbm(wx * 0.35 + 600, wz * 0.35 + 600, 4)) * 6
  h -= valley

  // Carve rivers into terrain
  const rv = riverFactor(wx, wz)
  h -= rv * rv * 4.5

  // Fray crater at center
  const centerDist = dist / WORLD_RADIUS
  if (centerDist < 0.08) h -= (0.08 - centerDist) * 30

  // Apply shore blend and edge fade
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
      const r = Math.random() * 80
      positions[i * 3] = Math.cos(theta) * r
      positions[i * 3 + 1] = DRIFT_Y + (Math.random() - 0.5) * 20
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
        <sphereGeometry args={[80, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#050510" side={THREE.BackSide} transparent opacity={0.9} />
      </mesh>
      {/* Swirling nebula rings */}
      {[0, 1, 2].map(i => (
        <mesh key={i} position={[0, DRIFT_Y - 3 + i * 3, 0]} rotation={[Math.PI / 2, 0, i * 0.7]}>
          <torusGeometry args={[40 + i * 15, 8, 8, 64]} />
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
        <circleGeometry args={[65, 64]} />
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
    for (let i = -60; i <= 60; i += 10) {
      const geoX = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i, FOLD_Y + 0.1, -60),
        new THREE.Vector3(i, FOLD_Y + 0.1, 60),
      ])
      group.add(new THREE.Line(geoX, mat))
      const geoZ = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-60, FOLD_Y + 0.1, i),
        new THREE.Vector3(60, FOLD_Y + 0.1, i),
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
    const spacing = 8
    const range = 48
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
      const r = 42
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
function Shards() {
  const shardPositions = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + 0.3
      const r = 18 + Math.sin(i * 2.7) * 10
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
// LAYER 4 — THE EVERLOOP (Living Surface World)
// ═══════════════════════════════════════════════════════════════
// ─── Biome colour from height + moisture ────────────────────
function lerpColor(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function biomeColor(h: number, wx: number, wz: number, land: number, rv: number): [number, number, number] {
  // Moisture map — varies spatially
  const moisture = fbm(wx * 0.4 + 500, wz * 0.4 + 500, 5)
  // Temperature gradient — cooler further from center, higher elevation
  const temp = 0.6 + fbm(wx * 0.15 + 800, wz * 0.15 + 800, 3) * 0.4 - h * 0.02
  // Micro-variation for texture
  const micro = fbm(wx * 4 + 900, wz * 4 + 900, 2) * 0.06

  // Deep ocean
  if (land < 0.08 || h < -2) {
    const depth = Math.min(1, Math.max(0, (-h - 1) / 4))
    const deep: [number, number, number] = [0.04, 0.10, 0.28]
    const mid: [number, number, number] = [0.06, 0.18, 0.38]
    return lerpColor(mid, deep, depth)
  }
  // Shallow water
  if (h < -0.3) {
    const t = Math.min(1, (-h - 0.3) / 1.7)
    return lerpColor([0.10, 0.32, 0.50], [0.06, 0.20, 0.40], t)
  }
  // Coastal shallows
  if (h < 0) {
    return [0.12 + micro, 0.36 + micro, 0.52]
  }
  // Sandy beach
  if (h < 0.4 && land < 0.22) {
    return [0.78 + micro, 0.72 + micro, 0.52 + micro]
  }
  // River water
  if (rv > 0.6) {
    const blend = Math.min(1, (rv - 0.6) * 3.5)
    return lerpColor([0.22, 0.48, 0.22], [0.08, 0.28, 0.45], blend)
  }
  // River bank mud
  if (rv > 0.3) {
    const blend = (rv - 0.3) / 0.3
    return lerpColor([0.28, 0.42, 0.20], [0.18, 0.32, 0.16], blend)
  }

  // === Land biomes by height + moisture + temperature ===

  // Lowland (0-2)
  if (h < 2) {
    const t = h / 2
    if (moisture > 0.55) {
      // Marsh / lush wetland
      const wet: [number, number, number] = [0.14 + micro, 0.40 + micro, 0.12]
      const meadow: [number, number, number] = [0.25 + micro, 0.55 + micro, 0.18]
      return lerpColor(wet, meadow, t)
    }
    if (moisture > 0.38) {
      // Green grassland
      return [0.30 + micro, 0.55 + micro, 0.20]
    }
    // Dry grassland / savanna
    return [0.50 + micro, 0.55 + micro, 0.28]
  }

  // Rolling hills and light forest (2-4.5)
  if (h < 4.5) {
    const t = (h - 2) / 2.5
    if (moisture > 0.48) {
      const grass: [number, number, number] = [0.22, 0.50, 0.16]
      const forest: [number, number, number] = [0.10, 0.38, 0.10]
      return lerpColor(grass, forest, t * 0.7 + micro * 3)
    }
    return [0.28 + micro, 0.48 + micro, 0.18]
  }

  // Dense forest (4.5-7)
  if (h < 7) {
    const t = (h - 4.5) / 2.5
    if (temp > 0.5) {
      // Temperate deciduous
      const light: [number, number, number] = [0.12 + micro, 0.36, 0.10]
      const dark: [number, number, number] = [0.06, 0.26, 0.06]
      return lerpColor(light, dark, t)
    }
    // Coniferous
    return [0.06 + micro, 0.24 + micro * 2, 0.10]
  }

  // Upland / scrubland (7-10)
  if (h < 10) {
    const t = (h - 7) / 3
    const scrub: [number, number, number] = [0.22, 0.35, 0.15]
    const rock: [number, number, number] = [0.42, 0.38, 0.30]
    return lerpColor(scrub, rock, t + micro * 2)
  }

  // Highland / rocky (10-14)
  if (h < 14) {
    const t = (h - 10) / 4
    const rockLow: [number, number, number] = [0.44 + micro, 0.40 + micro, 0.32]
    const rockHigh: [number, number, number] = [0.55 + micro, 0.50 + micro, 0.42]
    return lerpColor(rockLow, rockHigh, t)
  }

  // Alpine / snow transition (14-18)
  if (h < 18) {
    const t = (h - 14) / 4
    const alpine: [number, number, number] = [0.55, 0.50, 0.44]
    const snow: [number, number, number] = [0.88, 0.87, 0.85]
    return lerpColor(alpine, snow, t * t)
  }

  // Snow caps
  const snowAmount = Math.min(1, (h - 18) / 3)
  return lerpColor([0.88, 0.87, 0.85], [0.95, 0.95, 0.94], snowAmount)
}

function TheSurface() {
  const geometry = useMemo(() => {
    // High-res plane clipped to disc
    const size = WORLD_RADIUS * 2
    const segments = 500
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
      const h = getTerrainHeight(px, pz)
      positions.setZ(i, h)

      const land = continentMask(px, pz)
      const rv = riverFactor(px, pz)
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
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[WORLD_RADIUS, WORLD_RADIUS + 2, 4, 64, 1, true]} />
        <meshStandardMaterial color="#2a2218" roughness={0.9} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Underside glow */}
      <mesh position={[0, -3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[WORLD_RADIUS - 2, 64]} />
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
      <circleGeometry args={[WORLD_RADIUS - 0.5, 64]} />
      <meshStandardMaterial color="#0a3050" transparent opacity={0.8} roughness={0.05} metalness={0.6} />
    </mesh>
  )
}

// ═══════════════════════════════════════════════════════════════
// THE FRAY — Wound between realities (purple energy column)
// ═══════════════════════════════════════════════════════════════
function TheFray() {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.15
      ref.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial
          mat.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * 2 + i) * 0.3
          mat.opacity = 0.15 + Math.sin(clock.elapsedTime * 1.5 + i * 0.5) * 0.05
        }
      })
    }
  })

  return (
    <group ref={ref} position={[0, DRIFT_Y, 0]}>
      {/* Main column */}
      <mesh position={[0, FRAY_HEIGHT / 2 + 10, 0]}>
        <cylinderGeometry args={[1.5, 3, FRAY_HEIGHT + 20, 8, 1, true]} />
        <meshStandardMaterial
          color="#8030c0" emissive="#6020a0" emissiveIntensity={0.8}
          transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false}
        />
      </mesh>
      {/* Inner bright core */}
      <mesh position={[0, FRAY_HEIGHT / 2 + 10, 0]}>
        <cylinderGeometry args={[0.4, 0.8, FRAY_HEIGHT + 20, 6, 1, true]} />
        <meshStandardMaterial
          color="#c060ff" emissive="#a040dd" emissiveIntensity={1.2}
          transparent opacity={0.25} side={THREE.DoubleSide} depthWrite={false}
        />
      </mesh>
      {/* Swirling outer wisps */}
      {[0, 1, 2, 3].map(i => (
        <mesh key={i} position={[0, FRAY_HEIGHT / 2 + 5, 0]} rotation={[0, i * Math.PI / 2, 0.2]}>
          <cylinderGeometry args={[3 + i, 4 + i * 0.5, FRAY_HEIGHT, 6, 1, true]} />
          <meshStandardMaterial
            color="#5020a0" emissive="#4010a0" emissiveIntensity={0.3}
            transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false}
          />
        </mesh>
      ))}
      {/* Fray light */}
      <pointLight position={[0, SURFACE_Y + 5, 0]} intensity={2} color="#8040c0" distance={40} decay={2} />
      <pointLight position={[0, PATTERN_Y, 0]} intensity={1.5} color="#6030a0" distance={30} decay={2} />
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
      const r = 15 + Math.sin(i * 3) * 8
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
  const color = getTypeColor(location.type)

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

  return (
    <group
      ref={beaconRef}
      position={[location.x, SURFACE_Y + terrainH + location.elevation, location.z]}
      scale={isSelected ? 1.4 : 1}
      onClick={(e) => { e.stopPropagation(); onSelect(location) }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
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
      {/* Label */}
      <Html position={[0, 1.5, 0]} center distanceFactor={18} style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        <div className="text-center select-none">
          <div className="text-xs font-serif font-bold drop-shadow-lg" style={{ color, textShadow: '0 0 8px rgba(0,0,0,0.9)' }}>
            {location.name}
          </div>
        </div>
      </Html>
      <pointLight color={color} intensity={isSelected ? 3 : 1} distance={10} decay={2} />
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
// AMBIENT PARTICLES (golden motes above the surface)
// ═══════════════════════════════════════════════════════════════
function SurfaceParticles() {
  const obj = useMemo(() => {
    const count = 1500
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = Math.random() * WORLD_RADIUS * 0.9
      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = SURFACE_Y + 2 + Math.random() * 15
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
        <Html key={label.text} position={[-68, label.y, 0]} style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
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
        position={[60, 80, 40]} intensity={1.2} color="#fff4e0" castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-far={200}
        shadow-camera-left={-80} shadow-camera-right={80}
        shadow-camera-top={80} shadow-camera-bottom={-80}
      />
      <directionalLight position={[-40, 60, -30]} intensity={0.3} color="#8090cc" />
      <hemisphereLight args={['#c0d0e0', '#1a1a30', 0.4]} />

      {/* Stars behind everything */}
      <Stars radius={200} depth={100} count={8000} factor={5} saturation={0.3} fade speed={0.3} />

      {/* === THE FOUR LAYERS === */}
      <TheDrift />
      <TheFold />
      <ThePattern />
      <Anchors />
      <Shards />
      <TheSurface />
      <TheFray />
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

      {/* Camera — user has full control, no auto-animation */}
      <OrbitControls
        makeDefault enableDamping dampingFactor={0.05}
        minDistance={10} maxDistance={250}
        target={ORBIT_TARGET}
        enablePan
      />

      <fog attach="fog" args={['#05050a', 120, 250]} />
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
            { color: '#8040c0', label: 'The Fray', sub: 'Wound Between Realities' },
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
            Scroll to zoom · Drag to orbit<br />Click beacons on the surface for info
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
        camera={{ position: [80, 40, 80], fov: 50, near: 0.1, far: 500 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
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
