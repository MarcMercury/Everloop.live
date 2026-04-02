'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Stars, Html, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { REGIONS } from '@/lib/data/regions'

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const SURFACE_Y = 30
const PATTERN_Y = 12
const FOLD_Y = -2
const DRIFT_Y = -20

// Map surface dimensions matching image aspect ratio (3:2)
const MAP_WIDTH = 240
const MAP_HEIGHT = 160
const MAP_HALF_W = MAP_WIDTH / 2
const MAP_HALF_H = MAP_HEIGHT / 2

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

/** Gentle dome height at a point on the map surface */
function getSurfaceHeight(wx: number, wz: number): number {
  const nx = wx / MAP_HALF_W
  const nz = wz / MAP_HALF_H
  const dist = Math.sqrt(nx * nx + nz * nz)
  return Math.max(0, (1 - dist * dist * 0.5) * 3)
}

// ═══════════════════════════════════════════════════════════════
// 8 REGIONS OF THE EVERLOOP
// ═══════════════════════════════════════════════════════════════
// Positioned to match the geography visible on the reference map.
// Coordinates: X range [-120, 120], Z range [-80, 80]
// Negative Z = south, Positive Z = north on the painted map.
type RegionId = 'deyune' | 'virelay' | 'bellroot' | 'ashen' | 'glass' | 'varnhalt' | 'luminous' | 'drowned'

const REGION_LABEL_DATA: {
  id: RegionId; name: string; sub: string
  x: number; z: number; color: string
}[] = [
  { id: 'bellroot',  name: 'The Bellroot Vale',     sub: 'Memory Nexus',         x: 28,  z: -3,  color: '#50c070' },
  { id: 'luminous',  name: 'The Luminous Fold',     sub: 'Over-Stabilized Zone', x: 55,  z: -40, color: '#e0d890' },
  { id: 'ashen',     name: 'The Ashen Spine',       sub: 'Volcanic Chain',       x: 0,   z: -45, color: '#cc5533' },
  { id: 'drowned',   name: 'The Drowned Reach',     sub: 'Submerged Ruins',      x: 0,   z: 45,  color: '#509088' },
  { id: 'glass',     name: 'The Glass Expanse',     sub: 'Crystal Desert',       x: 75,  z: -5,  color: '#c0c8d0' },
  { id: 'virelay',   name: 'Virelay Coastlands',    sub: 'Fractured Shore',      x: -70, z: 30,  color: '#8888aa' },
  { id: 'varnhalt',  name: 'Varnhalt Frontier',     sub: 'Rough Feudal Edge',    x: -80, z: -5,  color: '#a08050' },
  { id: 'deyune',    name: 'The Deyune Steps',      sub: 'Nomadic Vastlands',    x: -55, z: -35, color: '#d4a84b' },
]

function getShardColor(region: RegionId): { color: string; emissive: string } {
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
      const t = Math.random()
      if (t < 0.6) { colors[i * 3] = 0.15; colors[i * 3 + 1] = 0.05; colors[i * 3 + 2] = 0.25 }
      else if (t < 0.85) { colors[i * 3] = 0.05; colors[i * 3 + 1] = 0.08; colors[i * 3 + 2] = 0.2 }
      else { colors[i * 3] = 0.4 + Math.random() * 0.3; colors[i * 3 + 1] = 0.3; colors[i * 3 + 2] = 0.5 + Math.random() * 0.3 }
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
      <mesh position={[0, DRIFT_Y - 5, 0]}>
        <sphereGeometry args={[170, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#050510" side={THREE.BackSide} transparent opacity={0.9} />
      </mesh>
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
// LAYER 2 — THE FOLD (Architects' Realm)
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
      <mesh ref={ref} position={[0, FOLD_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[140, 96]} />
        <meshStandardMaterial
          color="#a0c0e0" transparent opacity={0.1} roughness={0.05} metalness={0.8}
          side={THREE.DoubleSide} depthWrite={false}
        />
      </mesh>
      <FoldGrid />
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
// LAYER 3 — THE PATTERN (Lattice / Weaving)
// ═══════════════════════════════════════════════════════════════
function ThePattern() {
  const latticeRef = useRef<THREE.Group>(null)

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
        const node = new THREE.Mesh(nodeGeo, nodeMat)
        node.position.set(x, PATTERN_Y, z)
        group.add(node)
        if (x + spacing <= range) {
          const geo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, PATTERN_Y, z),
            new THREE.Vector3(x + spacing, PATTERN_Y, z),
          ])
          group.add(new THREE.Line(geo, lineMat))
        }
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
      <pointLight position={[0, PATTERN_Y, 0]} intensity={1.5} color="#3090ee" distance={80} decay={2} />
    </group>
  )
}

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
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.6, 1.5, height, 6]} />
        <meshStandardMaterial
          color="#60b0ff" emissive="#3080dd" emissiveIntensity={0.5}
          transparent opacity={0.5} roughness={0.1} metalness={0.7}
        />
      </mesh>
      <mesh position={[0, height + 0.5, 0]}>
        <coneGeometry args={[1.2, 3, 6]} />
        <meshStandardMaterial
          color="#80c0ff" emissive="#4090ee" emissiveIntensity={0.6}
          transparent opacity={0.6} roughness={0.05} metalness={0.9}
        />
      </mesh>
      <pointLight position={[0, height / 2, 0]} intensity={0.8} color="#4090dd" distance={20} decay={2} />
    </group>
  )
}

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
// LAYER 4 — THE EVERLOOP SURFACE (Image-Textured Map)
// ═══════════════════════════════════════════════════════════════
function TheSurface() {
  const texture = useTexture('/everloop-map-base.png')
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = 16

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(MAP_WIDTH, MAP_HEIGHT, 128, 128)
    const positions = geo.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i) / MAP_HALF_W
      const y = positions.getY(i) / MAP_HALF_H
      const dist = Math.sqrt(x * x + y * y)
      // Gentle dome curvature: max ~3 units at center, falling off toward edges
      const dome = Math.max(0, (1 - dist * dist * 0.5)) * 3
      positions.setZ(i, dome)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <group position={[0, SURFACE_Y, 0]}>
      {/* Main map surface with painted texture */}
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial
          map={texture}
          roughness={0.75}
          metalness={0.02}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Parchment-style edge frame */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[MAP_WIDTH + 4, 3, MAP_HEIGHT + 4]} />
        <meshStandardMaterial color="#2a2218" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Underside glow for sub-layer connection */}
      <mesh position={[0, -3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[MAP_WIDTH - 4, MAP_HEIGHT - 4]} />
        <meshStandardMaterial
          color="#1a3040" emissive="#2060a0" emissiveIntensity={0.3}
          transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
// SURFACE SHARDS — Region-assigned crystalline markers
// ═══════════════════════════════════════════════════════════════
interface ShardSite { x: number; z: number; region: RegionId }

const SHARD_SITES: ShardSite[] = [
  { x: -48, z: -38, region: 'virelay' },
  { x: -5, z: 48, region: 'bellroot' },
  { x: 5, z: -48, region: 'varnhalt' },
]

function SurfaceShard({ site, index }: { site: ShardSite; index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const { color, emissive } = getShardColor(site.region)
  const surfH = getSurfaceHeight(site.x, site.z)
  const y = SURFACE_Y + surfH + 1.2
  const size = 0.5 + seededRandom(index * 73 + 11) * 0.5

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.4 + index
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * 1.2 + index * 0.9) * 0.3
    }
  })

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
interface TravelRoute {
  from: RegionId
  to: RegionId
  name: string
  waypoints: [number, number][]
  color: string
  dashed?: boolean
}

const TRAVEL_ROUTES: TravelRoute[] = [
  {
    from: 'varnhalt', to: 'bellroot', name: 'The Spine Road',
    waypoints: [[0, -42], [2, -28], [5, -12], [3, 5], [0, 20], [-2, 35], [0, 42]],
    color: '#d4a84b',
  },
  {
    from: 'virelay', to: 'drowned', name: 'Fog Coast Trail',
    waypoints: [[-48, -30], [-52, -22], [-56, -15], [-60, -8], [-58, 0]],
    color: '#8888aa',
  },
  {
    from: 'drowned', to: 'luminous', name: 'Sunken Way',
    waypoints: [[-58, 0], [-60, 8], [-62, 18], [-60, 28], [-58, 35]],
    color: '#509088', dashed: true,
  },
  {
    from: 'luminous', to: 'bellroot', name: 'Archway Pass',
    waypoints: [[-55, 32], [-42, 36], [-28, 40], [-15, 42], [-5, 44]],
    color: '#e0d890',
  },
  {
    from: 'bellroot', to: 'ashen', name: 'Ember Trail',
    waypoints: [[5, 44], [18, 43], [30, 42], [40, 40], [50, 38]],
    color: '#cc5533', dashed: true,
  },
  {
    from: 'ashen', to: 'glass', name: 'Cinder Descent',
    waypoints: [[55, 32], [60, 22], [65, 12], [70, 2], [72, -3]],
    color: '#c0c8d0',
  },
  {
    from: 'glass', to: 'deyune', name: 'Mirage Crossing',
    waypoints: [[72, -8], [68, -18], [64, -28], [60, -35], [55, -40]],
    color: '#d4a84b', dashed: true,
  },
  {
    from: 'deyune', to: 'varnhalt', name: 'Windwalker Path',
    waypoints: [[48, -42], [38, -45], [25, -46], [15, -46], [5, -44]],
    color: '#a08050',
  },
  {
    from: 'virelay', to: 'varnhalt', name: "Smuggler's Run",
    waypoints: [[-42, -36], [-30, -40], [-18, -42], [-8, -44]],
    color: '#8888aa', dashed: true,
  },
  {
    from: 'drowned', to: 'varnhalt', name: 'Ruin March',
    waypoints: [[-52, -5], [-40, -12], [-28, -22], [-15, -32], [-5, -42]],
    color: '#509088',
  },
]

function TravelRouteLine({ route }: { route: TravelRoute }) {
  const lineObj = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (let wi = 0; wi < route.waypoints.length - 1; wi++) {
      const [ax, az] = route.waypoints[wi]
      const [bx, bz] = route.waypoints[wi + 1]
      const steps = 12
      for (let s = 0; s <= steps; s++) {
        const t = s / steps
        const x = ax + (bx - ax) * t
        const z = az + (bz - az) * t
        const h = getSurfaceHeight(x, z)
        points.push(new THREE.Vector3(x, SURFACE_Y + h + 0.4, z))
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [route])

  const lineRef = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color: route.color,
      transparent: true,
      opacity: route.dashed ? 0.3 : 0.45,
      depthWrite: false,
    })
    return new THREE.Line(lineObj, mat)
  }, [lineObj, route])

  return (
    <group>
      <primitive object={lineRef} />
      {(() => {
        const mid = route.waypoints[Math.floor(route.waypoints.length / 2)]
        const h = getSurfaceHeight(mid[0], mid[1])
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
// FRAY RIFTS — Reality tears on the surface
// ═══════════════════════════════════════════════════════════════
const FRAY_RIFTS: [number, number][] = [
  [25, 15], [-18, 8], [40, -20], [-35, -15], [10, -30],
  [-8, 30], [50, 5], [-42, 22], [15, 42], [-25, -35],
  [38, 30], [-50, -5], [8, -45], [55, -30], [-15, 48],
  [-48, -28], [30, -40], [48, 18], [-30, 40], [20, -15],
  [-55, 10], [42, -10], [-20, -48], [5, 52], [60, -22],
]

function FrayRift({ x, z, index }: { x: number; z: number; index: number }) {
  const ref = useRef<THREE.Group>(null)
  const surfH = getSurfaceHeight(x, z)
  const y = SURFACE_Y + surfH + 0.3
  const size = 0.6 + seededRandom(index * 47) * 0.8

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

  return (
    <group ref={ref} position={[x, y, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 2, 16]} />
        <meshStandardMaterial
          color="#6020a0" emissive="#8040c0" emissiveIntensity={1}
          transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 0.6, 12]} />
        <meshStandardMaterial
          color="#c060ff" emissive="#b050ee" emissiveIntensity={1.5}
          transparent opacity={0.5} depthWrite={false} side={THREE.DoubleSide}
        />
      </mesh>
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
// AMBIENT PARTICLES (golden motes above the surface)
// ═══════════════════════════════════════════════════════════════
function SurfaceParticles() {
  const obj = useMemo(() => {
    const count = 2000
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * MAP_WIDTH * 0.9
      const z = (Math.random() - 0.5) * MAP_HEIGHT * 0.9
      positions[i * 3] = x
      positions[i * 3 + 1] = SURFACE_Y + 2 + Math.random() * 18
      positions[i * 3 + 2] = z
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.12, color: '#d4a84b', transparent: true, opacity: 0.3,
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
// LAYER LABELS (positioned along the side in 3D space)
// ═══════════════════════════════════════════════════════════════
function LayerLabels({ showSubLayers }: { showSubLayers: boolean }) {
  const labels = [
    { y: SURFACE_Y + 15, text: 'THE EVERLOOP', sub: 'Living Surface', color: '#d4a84b', always: true },
    { y: PATTERN_Y, text: 'THE PATTERN', sub: 'Fabric of Reality', color: '#40a0ff', always: false },
    { y: FOLD_Y, text: 'THE FOLD', sub: "Architects' Realm", color: '#6080b0', always: false },
    { y: DRIFT_Y, text: 'THE DRIFT', sub: 'Sea of Origins', color: '#6030a0', always: false },
  ]

  return (
    <group>
      {labels
        .filter(l => l.always || showSubLayers)
        .map((label) => (
          <Html key={label.text} position={[-MAP_HALF_W - 15, label.y, 0]} style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
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

function RegionLabel({ r }: { r: typeof REGION_LABEL_DATA[number] }) {
  const [hovered, setHovered] = useState(false)
  const surfH = getSurfaceHeight(r.x, r.z)
  const region = REGIONS.find((reg) => reg.id === r.id)

  return (
    <Html
      position={[r.x, SURFACE_Y + surfH + 2.5, r.z]}
      center
      style={{ pointerEvents: 'auto', whiteSpace: 'nowrap' }}
    >
      <a
        href={`/map/${r.id}`}
        className="block select-none relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing marker dot */}
        <div className="flex justify-center">
          <div
            className="rounded-full transition-all duration-300"
            style={{
              width: hovered ? '12px' : '8px',
              height: hovered ? '12px' : '8px',
              background: r.color,
              boxShadow: hovered
                ? `0 0 12px ${r.color}, 0 0 24px ${r.color}80`
                : `0 0 6px ${r.color}90, 0 0 14px ${r.color}50`,
              border: `1.5px solid ${r.color}cc`,
            }}
          />
        </div>

        {/* Hover popup with region info */}
        {hovered && region && (
          <div
            className="absolute left-1/2 -translate-x-1/2 mt-2 rounded-xl p-4 backdrop-blur-xl border z-50"
            style={{
              width: '280px',
              whiteSpace: 'normal',
              background: 'linear-gradient(135deg, rgba(10, 20, 25, 0.96), rgba(15, 30, 35, 0.93))',
              borderColor: `${r.color}40`,
              boxShadow: `0 0 30px ${r.color}25, 0 12px 40px rgba(0,0,0,0.6)`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: r.color, boxShadow: `0 0 8px ${r.color}80` }}
              />
              <span className="text-sm font-serif font-bold" style={{ color: r.color }}>
                {r.name}
              </span>
            </div>
            <div className="text-[10px] uppercase tracking-wider mb-2 opacity-60" style={{ color: r.color }}>
              {r.sub}
            </div>
            <p
              className="text-[11px] leading-relaxed mb-3"
              style={{ color: 'rgba(210, 200, 180, 0.8)' }}
            >
              {region.description.length > 160
                ? region.description.slice(0, 160) + '\u2026'
                : region.description}
            </p>
            <span
              className="block text-center px-3 py-2 rounded-lg text-xs font-medium transition-all hover:brightness-125"
              style={{
                background: `${r.color}20`,
                color: r.color,
                border: `1px solid ${r.color}40`,
              }}
            >
              Explore Region \u2192
            </span>
          </div>
        )}
      </a>
    </Html>
  )
}

function RegionLabels() {
  return (
    <group>
      {REGION_LABEL_DATA.map((r) => (
        <RegionLabel key={r.id} r={r} />
      ))}
    </group>
  )
}

// Stable orbit target
const ORBIT_TARGET = new THREE.Vector3(0, 15, 0)

// ═══════════════════════════════════════════════════════════════
// SCENE
// ═══════════════════════════════════════════════════════════════
function Scene({ showSubLayers }: { showSubLayers: boolean }) {
  return (
    <>
      {/* Warm lighting to match the parchment / painterly aesthetic */}
      <ambientLight intensity={0.45} color="#f0e8d0" />
      <directionalLight
        position={[100, 120, 60]} intensity={1.0} color="#fff8e8" castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-far={400}
        shadow-camera-left={-160} shadow-camera-right={160}
        shadow-camera-top={160} shadow-camera-bottom={-160}
      />
      <directionalLight position={[-80, 100, -50]} intensity={0.25} color="#c0c8e0" />
      <hemisphereLight args={['#e0d8c0', '#1a1a30', 0.35]} />

      <Stars radius={400} depth={200} count={8000} factor={6} saturation={0.3} fade speed={0.3} />

      {/* Sub-layers — togglable */}
      {showSubLayers && (
        <group>
          <TheDrift />
          <TheFold />
          <ThePattern />
          <Anchors />
          <PatternShards />
          <Hollows />
        </group>
      )}

      {/* THE SURFACE — Image-textured map */}
      <TheSurface />

      {/* Surface overlays */}
      <FrayRifts />
      <SurfaceShards />
      <TravelRoutes />
      <SurfaceParticles />

      {/* Labels */}
      <LayerLabels showSubLayers={showSubLayers} />
      <RegionLabels />

      {/* Camera controls */}
      <OrbitControls
        makeDefault enableDamping dampingFactor={0.05}
        minDistance={15} maxDistance={400}
        target={ORBIT_TARGET}
        enablePan
      />

      <fog attach="fog" args={['#080810', 250, 500]} />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// UI OVERLAYS
// ═══════════════════════════════════════════════════════════════
function MapLegend({ showSubLayers, onToggleLayers }: { showSubLayers: boolean; onToggleLayers: () => void }) {
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
            { color: '#d4a84b', label: 'The Everloop', sub: 'Living Surface' },
            ...(showSubLayers ? [
              { color: '#40a0ff', label: 'The Pattern', sub: 'Fabric of Reality' },
              { color: '#6080b0', label: 'The Fold', sub: "Architects' Realm" },
              { color: '#6030a0', label: 'The Drift', sub: 'Sea of Origins' },
            ] : []),
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
              { color: '#60d0ff', label: 'Shard Sites', sub: 'Crystal Fragments', shape: 'diamond' as const },
              { color: '#8040c0', label: 'Fray Rifts', sub: 'Reality Tears', shape: 'circle' as const },
              { color: '#d4a84b', label: 'Travel Routes', sub: 'Safe Corridors', shape: 'line' as const },
            ].map(({ color, label, sub, shape }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 ${shape === 'diamond' ? 'rotate-45' : shape === 'line' ? 'h-0.5 w-4 rounded' : 'rounded-full'}`}
                  style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
                />
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

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function EverloopMap() {
  const [showSubLayers, setShowSubLayers] = useState(false)
  const handleToggleLayers = useCallback(() => { setShowSubLayers(prev => !prev) }, [])

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 120, 140], fov: 40, near: 0.1, far: 1000 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        style={{ background: '#030308' }}
      >
        <Scene showSubLayers={showSubLayers} />
      </Canvas>
      <MapLegend showSubLayers={showSubLayers} onToggleLayers={handleToggleLayers} />
    </div>
  )
}
