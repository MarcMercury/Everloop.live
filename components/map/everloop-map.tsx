'use client'

import { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Billboard, Float, Stars, Cloud } from '@react-three/drei'
import * as THREE from 'three'

// ─── Types ────────────────────────────────────────────────────
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

// ─── Color palette by entity type ──────────────────────────────
function getTypeColor(type: string): string {
  switch (type) {
    case 'location':  return '#d4a84b'   // gold
    case 'character': return '#6ec6ff'   // ice blue
    case 'artifact':  return '#e066ff'   // arcane purple
    case 'faction':   return '#ff6b6b'   // ember red
    case 'creature':  return '#66ff9e'   // verdant green
    case 'event':     return '#ffaa66'   // amber
    case 'concept':   return '#66d9ff'   // ethereal cyan
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

// ─── Simplex-like noise (seeded) ──────────────────────────────
function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

function noise2D(x: number, z: number): number {
  const ix = Math.floor(x)
  const iz = Math.floor(z)
  const fx = x - ix
  const fz = z - iz

  const a = seededRandom(ix + iz * 157)
  const b = seededRandom(ix + 1 + iz * 157)
  const c = seededRandom(ix + (iz + 1) * 157)
  const d = seededRandom(ix + 1 + (iz + 1) * 157)

  const ux = fx * fx * (3 - 2 * fx)
  const uz = fz * fz * (3 - 2 * fz)

  return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz
}

function fbm(x: number, z: number, octaves: number = 6): number {
  let value = 0
  let amplitude = 0.5
  let frequency = 0.03
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, z * frequency)
    amplitude *= 0.5
    frequency *= 2
  }
  return value
}

// ─── Terrain Geometry ────────────────────────────────────────
function Terrain({ locations }: { locations: MapLocation[] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => {
    const size = 200
    const segments = 256
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    const positions = geo.attributes.position
    const colors = new Float32Array(positions.count * 3)

    // Build set of "explored" zones centred on canon locations
    const revealZones = locations.map(loc => ({
      x: loc.x,
      z: loc.z,
      radius: 8 + loc.stability * 6,
    }))

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getY(i) // PlaneGeometry is XY, we rotate later

      // Height from FBM noise
      let h = fbm(x + 100, z + 100, 6) * 8
      // Add gentle rolling hills
      h += Math.sin(x * 0.02) * Math.cos(z * 0.015) * 3
      // Mountain ridges (distant)
      const ridge = Math.max(0, fbm(x * 0.5 + 500, z * 0.5 + 500, 4) - 0.35) * 25
      h += ridge

      // Valleys near water
      const valley = Math.sin(x * 0.01 + 2) * Math.sin(z * 0.01 + 1) * 2
      h += Math.min(0, valley)

      positions.setZ(i, h)

      // Vertex colours — base terrain with fog
      const closestDist = revealZones.reduce((min, zone) => {
        const dx = x - zone.x
        const dz = z - zone.z
        return Math.min(min, Math.sqrt(dx * dx + dz * dz) / zone.radius)
      }, Infinity)

      const revealed = Math.max(0, 1 - closestDist)
      const fogFactor = 1 - Math.pow(Math.max(0, Math.min(1, revealed)), 2)

      // Terrain colour gradient based on height
      let r: number, g: number, b: number
      if (h < -0.5) {
        // Deep water
        r = 0.05; g = 0.12; b = 0.15
      } else if (h < 0.5) {
        // Shoreline / marsh
        r = 0.08; g = 0.18; b = 0.16
      } else if (h < 3) {
        // Grassland
        r = 0.1; g = 0.22; b = 0.14
      } else if (h < 6) {
        // Forest
        r = 0.07; g = 0.16; b = 0.1
      } else if (h < 10) {
        // Highland
        r = 0.15; g = 0.14; b = 0.12
      } else {
        // Mountain peaks — snow
        const snow = Math.min(1, (h - 10) / 8)
        r = 0.15 + snow * 0.6
        g = 0.14 + snow * 0.58
        b = 0.12 + snow * 0.55
      }

      // Apply fog: blend towards dark fog colour
      const fogR = 0.04
      const fogG = 0.06
      const fogB = 0.08
      colors[i * 3]     = r * (1 - fogFactor) + fogR * fogFactor
      colors[i * 3 + 1] = g * (1 - fogFactor) + fogG * fogFactor
      colors[i * 3 + 2] = b * (1 - fogFactor) + fogB * fogFactor
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [locations])

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <meshStandardMaterial
        vertexColors
        roughness={0.85}
        metalness={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ─── Water Plane ────────────────────────────────────────────
function Water() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.5 + Math.sin(clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial
        color="#0a2020"
        transparent
        opacity={0.7}
        roughness={0.1}
        metalness={0.6}
      />
    </mesh>
  )
}

// ─── Fog of War Dome ────────────────────────────────────────
function FogDome({ locations }: { locations: MapLocation[] }) {
  const fogRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (fogRef.current) {
      const mat = fogRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.25 + Math.sin(clock.elapsedTime * 0.2) * 0.05
    }
  })

  return (
    <mesh ref={fogRef} position={[0, 15, 0]}>
      <sphereGeometry args={[100, 32, 32]} />
      <meshStandardMaterial
        color="#0a1515"
        transparent
        opacity={0.3}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Ambient Particles ──────────────────────────────────────
function AmbientParticles() {
  const ref = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const count = 3000
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 160
      positions[i * 3 + 1] = Math.random() * 30 + 1
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160
      sizes[i] = Math.random() * 0.3 + 0.05
    }
    return { positions, sizes }
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position
    const time = clock.elapsedTime * 0.15
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      pos.setY(i, y + Math.sin(time + i * 0.1) * 0.002)
      // Gentle drift
      pos.setX(i, pos.getX(i) + Math.sin(time * 0.5 + i) * 0.003)
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[particles.sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#d4a84b"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ─── Location Beacon ────────────────────────────────────────
function LocationBeacon({
  location,
  isSelected,
  onSelect,
}: {
  location: MapLocation
  isSelected: boolean
  onSelect: (loc: MapLocation) => void
}) {
  const beaconRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const pillarRef = useRef<THREE.Mesh>(null)
  const color = getTypeColor(location.type)
  const colorObj = useMemo(() => new THREE.Color(color), [color])

  // Get terrain height at this position
  const terrainHeight = useMemo(() => {
    let h = fbm(location.x + 100, location.z + 100, 6) * 8
    h += Math.sin(location.x * 0.02) * Math.cos(location.z * 0.015) * 3
    const ridge = Math.max(0, fbm(location.x * 0.5 + 500, location.z * 0.5 + 500, 4) - 0.35) * 25
    h += ridge
    return Math.max(h, 0)
  }, [location.x, location.z])

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = clock.elapsedTime * 0.5
      ringRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.3) * 0.1
    }
    if (pillarRef.current) {
      const mat = pillarRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.8 + Math.sin(clock.elapsedTime * 2) * 0.3
    }
    if (beaconRef.current) {
      // Gentle float
      beaconRef.current.position.y = terrainHeight + location.elevation + Math.sin(clock.elapsedTime * 0.8 + location.x) * 0.15
    }
  })

  const scale = isSelected ? 1.4 : 1

  return (
    <group
      ref={beaconRef}
      position={[location.x, terrainHeight + location.elevation, location.z]}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(location)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default'
      }}
    >
      {/* Light pillar from ground */}
      <mesh ref={pillarRef} position={[0, -location.elevation / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.2, location.elevation + 1, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Core orb */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
        <mesh castShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            roughness={0.2}
            metalness={0.5}
          />
        </mesh>

        {/* Rotating ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[0.7, 0.04, 8, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Second ring (perpendicular) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.03, 8, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            transparent
            opacity={0.5}
          />
        </mesh>
      </Float>

      {/* Name label */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.6}
          color={color}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.06}
          outlineColor="#0a1515"
          font="/fonts/inter-medium.woff"
        >
          {location.name}
        </Text>
        <Text
          position={[0, 1.0, 0]}
          fontSize={0.3}
          color="#8a9a9a"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.03}
          outlineColor="#0a1515"
        >
          {location.type}
        </Text>
      </Billboard>

      {/* Point light for local illumination */}
      <pointLight
        color={color}
        intensity={isSelected ? 4 : 1.5}
        distance={12}
        decay={2}
      />
    </group>
  )
}

// ─── Connecting Lines between related entities ──────────────
function ConnectionLines({ locations }: { locations: MapLocation[] }) {
  const linesRef = useRef<THREE.Group>(null)

  const lines = useMemo(() => {
    // Create connections between nearby locations
    const result: { from: MapLocation; to: MapLocation }[] = []
    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        const dx = locations[i].x - locations[j].x
        const dz = locations[i].z - locations[j].z
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist < 25) {
          result.push({ from: locations[i], to: locations[j] })
        }
      }
    }
    return result
  }, [locations])

  useFrame(({ clock }) => {
    if (!linesRef.current) return
    linesRef.current.children.forEach((child, i) => {
      const mat = (child as THREE.Line).material as THREE.LineBasicMaterial
      mat.opacity = 0.15 + Math.sin(clock.elapsedTime + i * 0.5) * 0.08
    })
  })

  return (
    <group ref={linesRef}>
      {lines.map((line, i) => {
        const fromH = Math.max(fbm(line.from.x + 100, line.from.z + 100, 6) * 8, 0)
        const toH = Math.max(fbm(line.to.x + 100, line.to.z + 100, 6) * 8, 0)
        const points = [
          new THREE.Vector3(line.from.x, fromH + line.from.elevation, line.from.z),
          new THREE.Vector3(
            (line.from.x + line.to.x) / 2,
            Math.max(fromH, toH) + 4,
            (line.from.z + line.to.z) / 2
          ),
          new THREE.Vector3(line.to.x, toH + line.to.elevation, line.to.z),
        ]
        const curve = new THREE.QuadraticBezierCurve3(points[0], points[1], points[2])
        const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(20))

        return (
          <primitive key={i} object={new THREE.Line(geo, new THREE.LineBasicMaterial({
            color: '#d4a84b',
            transparent: true,
            opacity: 0.2,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          }))} />
        )
      })}
    </group>
  )
}

// ─── Camera Animator ────────────────────────────────────────
function CameraAnimator({ target }: { target: MapLocation | null }) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, 30, 50))

  useEffect(() => {
    if (target) {
      const h = Math.max(fbm(target.x + 100, target.z + 100, 6) * 8, 0)
      targetPos.current.set(target.x + 10, h + 15, target.z + 15)
    }
  }, [target])

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.02)
  })

  return null
}

// ─── Scene Contents ─────────────────────────────────────────
function Scene({
  locations,
  selectedLocation,
  onSelectLocation,
}: {
  locations: MapLocation[]
  selectedLocation: MapLocation | null
  onSelectLocation: (loc: MapLocation) => void
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} color="#4a6a6a" />
      <directionalLight
        position={[50, 60, 30]}
        intensity={0.6}
        color="#ffe8c0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <directionalLight position={[-30, 40, -20]} intensity={0.15} color="#6688aa" />

      {/* Hemisphere light for soft fill */}
      <hemisphereLight
        args={['#1a3030', '#0a1515', 0.3]}
      />

      {/* Point lights for atmosphere */}
      <pointLight position={[0, 20, 0]} intensity={0.5} color="#d4a84b" distance={80} decay={2} />

      {/* Stars */}
      <Stars
        radius={100}
        depth={80}
        count={5000}
        factor={4}
        saturation={0.2}
        fade
        speed={0.5}
      />

      {/* Clouds */}
      <Cloud
        position={[30, 25, -20]}
        speed={0.2}
        opacity={0.15}
        color="#1a3030"
        segments={20}
      />
      <Cloud
        position={[-40, 22, 30]}
        speed={0.15}
        opacity={0.1}
        color="#1a3030"
        segments={15}
      />

      {/* Terrain */}
      <Terrain locations={locations} />
      <Water />
      <FogDome locations={locations} />

      {/* Particles */}
      <AmbientParticles />

      {/* Location Beacons */}
      {locations.map((loc) => (
        <LocationBeacon
          key={loc.id}
          location={loc}
          isSelected={selectedLocation?.id === loc.id}
          onSelect={onSelectLocation}
        />
      ))}

      {/* Connection Lines */}
      <ConnectionLines locations={locations} />

      {/* Camera */}
      <CameraAnimator target={selectedLocation} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={120}
        target={
          selectedLocation
            ? [selectedLocation.x, 2, selectedLocation.z]
            : [0, 0, 0]
        }
      />

      {/* Scene fog */}
      <fog attach="fog" args={['#0a1515', 60, 140]} />
    </>
  )
}

// ─── Info Panel ─────────────────────────────────────────────
function InfoPanel({
  location,
  onClose,
}: {
  location: MapLocation
  onClose: () => void
}) {
  const color = getTypeColor(location.type)
  const icon = getTypeIcon(location.type)

  return (
    <div
      className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[420px] z-20 animate-slide-up"
    >
      <div
        className="rounded-xl p-6 backdrop-blur-xl border"
        style={{
          background: 'linear-gradient(135deg, rgba(13, 26, 26, 0.95), rgba(20, 40, 40, 0.9))',
          borderColor: `${color}40`,
          boxShadow: `0 0 40px ${color}20, 0 20px 60px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3
                className="text-xl font-serif font-bold"
                style={{ color }}
              >
                {location.name}
              </h3>
              <span
                className="text-xs uppercase tracking-wider opacity-70"
                style={{ color }}
              >
                {location.type}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-parchment-muted hover:text-parchment transition-colors p-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        {location.description && (
          <p className="text-sm text-parchment-muted leading-relaxed mb-4">
            {location.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-xs mb-4">
          <div>
            <span className="text-parchment-muted">Stability</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: `${color}20` }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${location.stability * 100}%`,
                    background: color,
                  }}
                />
              </div>
              <span style={{ color }}>{Math.round(location.stability * 100)}%</span>
            </div>
          </div>
          <div>
            <span className="text-parchment-muted">Coordinates</span>
            <div className="mt-1" style={{ color }}>
              {location.x.toFixed(1)}, {location.z.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Tags */}
        {location.tags && location.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {location.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs border"
                style={{
                  borderColor: `${color}30`,
                  color: `${color}cc`,
                  background: `${color}10`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={`/explore/${location.slug}`}
            className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: `${color}20`,
              color,
              border: `1px solid ${color}40`,
            }}
          >
            View Full Entry →
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Legend ──────────────────────────────────────────────────
function MapLegend() {
  const types = [
    { type: 'location', label: 'Locations' },
    { type: 'character', label: 'Characters' },
    { type: 'artifact', label: 'Artifacts' },
    { type: 'faction', label: 'Factions' },
    { type: 'creature', label: 'Creatures' },
    { type: 'event', label: 'Events' },
    { type: 'concept', label: 'Concepts' },
  ]

  return (
    <div className="absolute top-4 left-4 z-10">
      <div
        className="rounded-lg p-3 backdrop-blur-xl border border-gold/20"
        style={{
          background: 'rgba(13, 26, 26, 0.85)',
        }}
      >
        <h4 className="text-xs font-serif text-parchment mb-2 uppercase tracking-wider">Legend</h4>
        <div className="space-y-1">
          {types.map(({ type, label }) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: getTypeColor(type),
                  boxShadow: `0 0 6px ${getTypeColor(type)}80`,
                }}
              />
              <span className="text-xs text-parchment-muted">{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-gold/10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
            <span className="text-xs text-parchment-muted italic">Fog — Undiscovered</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Controls Hint ──────────────────────────────────────────
function ControlsHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 6000)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div className="absolute top-4 right-4 z-10 animate-fade-in">
      <div
        className="rounded-lg px-4 py-3 backdrop-blur-xl border border-gold/20"
        style={{ background: 'rgba(13, 26, 26, 0.85)' }}
      >
        <p className="text-xs text-parchment-muted">
          <span className="text-gold">Scroll</span> to zoom ·{' '}
          <span className="text-gold">Drag</span> to rotate ·{' '}
          <span className="text-gold">Click</span> beacons for info
        </p>
      </div>
    </div>
  )
}

// ─── Empty State ────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="text-center">
        <div className="text-6xl mb-4">🌫️</div>
        <h2 className="text-2xl font-serif text-parchment mb-2">The Land Awaits</h2>
        <p className="text-parchment-muted max-w-md">
          No canonical locations have been discovered yet. As stories are written and 
          approved into Canon, the fog will lift and the Everloop will reveal itself.
        </p>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────
export default function EverloopMap({ locations }: EverloopMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)

  const handleSelect = useCallback((loc: MapLocation) => {
    setSelectedLocation((prev) => (prev?.id === loc.id ? null : loc))
  }, [])

  const handleClose = useCallback(() => {
    setSelectedLocation(null)
  }, [])

  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 35, 55], fov: 55, near: 0.1, far: 300 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        style={{ background: '#0a1212' }}
        onClick={() => setSelectedLocation(null)}
      >
        <Scene
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelect}
        />
      </Canvas>

      {/* Overlays */}
      <MapLegend />
      <ControlsHint />

      {locations.length === 0 && <EmptyState />}

      {selectedLocation && (
        <InfoPanel location={selectedLocation} onClose={handleClose} />
      )}

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-charcoal to-transparent pointer-events-none" />
    </div>
  )
}
