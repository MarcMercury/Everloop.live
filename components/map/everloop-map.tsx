'use client'

import { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
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

type ActiveLayer = 'all' | 'drift' | 'fold' | 'pattern' | 'surface'

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

function getTerrainHeight(wx: number, wz: number): number {
  // Distance from center for disc falloff
  const dist = Math.sqrt(wx * wx + wz * wz)
  const edgeFade = Math.max(0, 1 - Math.pow(dist / WORLD_RADIUS, 3))

  let h = fbm(wx + 100, wz + 100, 6) * 10
  h += Math.sin(wx * 0.02) * Math.cos(wz * 0.015) * 4
  // Mountain ridges at edges
  const ridgeDist = Math.max(0, dist / WORLD_RADIUS - 0.5) * 2
  h += ridgeDist * fbm(wx * 0.8, wz * 0.8, 4) * 18
  // Valley near center
  const centerDist = dist / WORLD_RADIUS
  if (centerDist < 0.15) h -= (0.15 - centerDist) * 20 // Fray crater
  return h * edgeFade
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
function TheSurface({ locations }: { locations: MapLocation[] }) {
  const geometry = useMemo(() => {
    const segments = 200
    const geo = new THREE.CircleGeometry(WORLD_RADIUS, segments)
    const positions = geo.attributes.position
    const colors = new Float32Array(positions.count * 3)

    const revealZones = locations.map(loc => ({
      x: loc.x, z: loc.z, radius: 8 + loc.stability * 6,
    }))

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getY(i) // CircleGeometry is in XY plane
      const h = getTerrainHeight(x, z)
      positions.setZ(i, h) // Set as Z since we rotate later

      // Fog of war
      const closestDist = revealZones.length > 0
        ? revealZones.reduce((min, zone) => {
            const dx = x - zone.x; const dz = z - zone.z
            return Math.min(min, Math.sqrt(dx * dx + dz * dz) / zone.radius)
          }, Infinity)
        : Infinity
      const revealed = Math.max(0, 1 - closestDist)
      const fogFactor = 1 - Math.pow(Math.max(0, Math.min(1, revealed)), 2)

      // Terrain colours
      const distFromCenter = Math.sqrt(x * x + z * z) / WORLD_RADIUS
      let r: number, g: number, b: number
      if (h < -1) { r = 0.06; g = 0.15; b = 0.2 }             // Deep water
      else if (h < 0.5) { r = 0.08; g = 0.2; b = 0.18 }       // Shore/marsh
      else if (h < 3) { r = 0.15; g = 0.3; b = 0.12 }          // Grassland
      else if (h < 5) { r = 0.1; g = 0.25; b = 0.08 }          // Forest
      else if (h < 8) { r = 0.12; g = 0.22; b = 0.1 }          // Deep forest
      else if (h < 12) { r = 0.2; g = 0.18; b = 0.14 }         // Highland
      else {                                                       // Mountains/snow
        const snow = Math.min(1, (h - 12) / 6)
        r = 0.2 + snow * 0.55; g = 0.18 + snow * 0.55; b = 0.14 + snow * 0.55
      }

      // Edge mountains are rockier
      if (distFromCenter > 0.6) {
        const edgeBlend = (distFromCenter - 0.6) / 0.4
        r = r * (1 - edgeBlend) + 0.25 * edgeBlend
        g = g * (1 - edgeBlend) + 0.22 * edgeBlend
        b = b * (1 - edgeBlend) + 0.2 * edgeBlend
      }

      // Apply fog
      colors[i * 3]     = r * (1 - fogFactor * 0.7) + 0.05 * fogFactor * 0.7
      colors[i * 3 + 1] = g * (1 - fogFactor * 0.7) + 0.07 * fogFactor * 0.7
      colors[i * 3 + 2] = b * (1 - fogFactor * 0.7) + 0.08 * fogFactor * 0.7
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [locations])

  return (
    <group position={[0, SURFACE_Y, 0]}>
      {/* Terrain disc */}
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial vertexColors roughness={0.8} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* Water layer */}
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
    if (ref.current) ref.current.position.y = -0.3 + Math.sin(clock.elapsedTime * 0.3) * 0.1
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
      <circleGeometry args={[WORLD_RADIUS - 1, 64]} />
      <meshStandardMaterial color="#0a2530" transparent opacity={0.65} roughness={0.1} metalness={0.6} />
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

// ═══════════════════════════════════════════════════════════════
// CAMERA
// ═══════════════════════════════════════════════════════════════
function CameraAnimator({ target }: { target: MapLocation | null }) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(80, 40, 80))

  useEffect(() => {
    if (target) {
      const h = Math.max(getTerrainHeight(target.x, target.z), 0)
      targetPos.current.set(target.x + 15, SURFACE_Y + h + 12, target.z + 15)
    } else {
      targetPos.current.set(80, 40, 80)
    }
  }, [target])

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.02)
  })

  return null
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
      {/* Global lighting */}
      <ambientLight intensity={0.08} color="#303050" />
      <directionalLight
        position={[60, 80, 40]} intensity={0.5} color="#ffe8c0" castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-far={200}
        shadow-camera-left={-80} shadow-camera-right={80}
        shadow-camera-top={80} shadow-camera-bottom={-80}
      />
      <directionalLight position={[-40, 60, -30]} intensity={0.12} color="#6688aa" />
      <hemisphereLight args={['#1a2040', '#0a0a15', 0.2]} />

      {/* Stars behind everything */}
      <Stars radius={200} depth={100} count={8000} factor={5} saturation={0.3} fade speed={0.3} />

      {/* === THE FOUR LAYERS === */}
      <TheDrift />
      <TheFold />
      <ThePattern />
      <Anchors />
      <Shards />
      <TheSurface locations={locations} />
      <TheFray />
      <Hollows />

      {/* Surface elements */}
      <SurfaceParticles />
      {locations.map((loc) => (
        <LocationBeacon
          key={loc.id}
          location={loc}
          isSelected={selectedLocation?.id === loc.id}
          onSelect={onSelectLocation}
        />
      ))}

      {/* Layer labels */}
      <LayerLabels />

      {/* Camera */}
      <CameraAnimator target={selectedLocation} />
      <OrbitControls
        makeDefault enableDamping dampingFactor={0.05}
        minDistance={15} maxDistance={200}
        target={[0, 15, 0]}
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
