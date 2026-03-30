'use client'

import { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Float, Stars, Html } from '@react-three/drei'
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

// ─── Noise functions ──────────────────────────────────────────
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

function getTerrainHeight(wx: number, wz: number): number {
  let h = fbm(wx + 100, wz + 100, 6) * 8
  h += Math.sin(wx * 0.02) * Math.cos(wz * 0.015) * 3
  const ridge = Math.max(0, fbm(wx * 0.5 + 500, wz * 0.5 + 500, 4) - 0.35) * 25
  h += ridge
  return h
}

// ─── Terrain ─────────────────────────────────────────────────
function Terrain({ locations }: { locations: MapLocation[] }) {
  const geometry = useMemo(() => {
    const size = 200
    const segments = 200
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    const positions = geo.attributes.position
    const colors = new Float32Array(positions.count * 3)

    const revealZones = locations.map(loc => ({
      x: loc.x, z: loc.z, radius: 8 + loc.stability * 6,
    }))

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getY(i)
      const h = getTerrainHeight(x, z)
      positions.setZ(i, h)

      const closestDist = revealZones.length > 0
        ? revealZones.reduce((min, zone) => {
            const dx = x - zone.x
            const dz = z - zone.z
            return Math.min(min, Math.sqrt(dx * dx + dz * dz) / zone.radius)
          }, Infinity)
        : Infinity

      const revealed = Math.max(0, 1 - closestDist)
      const fogFactor = 1 - Math.pow(Math.max(0, Math.min(1, revealed)), 2)

      let r: number, g: number, b: number
      if (h < -0.5) {
        r = 0.05; g = 0.12; b = 0.15
      } else if (h < 0.5) {
        r = 0.08; g = 0.18; b = 0.16
      } else if (h < 3) {
        r = 0.1; g = 0.22; b = 0.14
      } else if (h < 6) {
        r = 0.07; g = 0.16; b = 0.1
      } else if (h < 10) {
        r = 0.15; g = 0.14; b = 0.12
      } else {
        const snow = Math.min(1, (h - 10) / 8)
        r = 0.15 + snow * 0.6; g = 0.14 + snow * 0.58; b = 0.12 + snow * 0.55
      }

      colors[i * 3]     = r * (1 - fogFactor) + 0.04 * fogFactor
      colors[i * 3 + 1] = g * (1 - fogFactor) + 0.06 * fogFactor
      colors[i * 3 + 2] = b * (1 - fogFactor) + 0.08 * fogFactor
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [locations])

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.85} metalness={0.05} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ─── Water ──────────────────────────────────────────────────
function Water() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = -0.5 + Math.sin(clock.elapsedTime * 0.3) * 0.1
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#0a2020" transparent opacity={0.7} roughness={0.1} metalness={0.6} />
    </mesh>
  )
}

// ─── Fog Dome ───────────────────────────────────────────────
function FogDome() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.25 + Math.sin(clock.elapsedTime * 0.2) * 0.05
    }
  })
  return (
    <mesh ref={ref} position={[0, 15, 0]}>
      <sphereGeometry args={[100, 32, 32]} />
      <meshStandardMaterial color="#0a1515" transparent opacity={0.3} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  )
}

// ─── Particles ──────────────────────────────────────────────
function AmbientParticles() {
  const pointsObj = useMemo(() => {
    const count = 2000
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 160
      positions[i * 3 + 1] = Math.random() * 30 + 1
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({
      size: 0.15,
      color: '#d4a84b',
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    return new THREE.Points(geo, mat)
  }, [])

  useFrame(({ clock }) => {
    const pos = pointsObj.geometry.attributes.position as THREE.BufferAttribute
    const t = clock.elapsedTime * 0.15
    for (let i = 0; i < Math.min(pos.count, 500); i++) {
      pos.setY(i, pos.getY(i) + Math.sin(t + i * 0.1) * 0.002)
    }
    pos.needsUpdate = true
  })

  return <primitive object={pointsObj} />
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

  const terrainHeight = useMemo(
    () => Math.max(getTerrainHeight(location.x, location.z), 0),
    [location.x, location.z]
  )

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
      beaconRef.current.position.y =
        terrainHeight + location.elevation + Math.sin(clock.elapsedTime * 0.8 + location.x) * 0.15
    }
  })

  return (
    <group
      ref={beaconRef}
      position={[location.x, terrainHeight + location.elevation, location.z]}
      scale={isSelected ? 1.4 : 1}
      onClick={(e) => { e.stopPropagation(); onSelect(location) }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
    >
      {/* Light pillar */}
      <mesh ref={pillarRef} position={[0, -location.elevation / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.2, location.elevation + 1, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.3} />
      </mesh>

      {/* Core orb + rings */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
        <mesh castShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} roughness={0.2} metalness={0.5} />
        </mesh>
        <mesh ref={ringRef}>
          <torusGeometry args={[0.7, 0.04, 8, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.7} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.03, 8, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.5} />
        </mesh>
      </Float>

      {/* HTML label — no font file needed */}
      <Html
        position={[0, 1.8, 0]}
        center
        distanceFactor={15}
        style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
      >
        <div className="text-center select-none">
          <div
            className="text-sm font-serif font-bold drop-shadow-lg"
            style={{ color, textShadow: '0 0 8px rgba(0,0,0,0.8)' }}
          >
            {location.name}
          </div>
          <div className="text-[10px] uppercase tracking-wider opacity-70" style={{ color: '#8a9a9a' }}>
            {location.type}
          </div>
        </div>
      </Html>

      <pointLight color={color} intensity={isSelected ? 4 : 1.5} distance={12} decay={2} />
    </group>
  )
}

// ─── Connection Lines ───────────────────────────────────────
function ConnectionLines({ locations }: { locations: MapLocation[] }) {
  const groupObj = useMemo(() => {
    const group = new THREE.Group()
    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        const a = locations[i]
        const b = locations[j]
        const dx = a.x - b.x
        const dz = a.z - b.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist < 25) {
          const fromH = Math.max(getTerrainHeight(a.x, a.z), 0)
          const toH = Math.max(getTerrainHeight(b.x, b.z), 0)
          const p0 = new THREE.Vector3(a.x, fromH + a.elevation, a.z)
          const p1 = new THREE.Vector3((a.x + b.x) / 2, Math.max(fromH, toH) + 4, (a.z + b.z) / 2)
          const p2 = new THREE.Vector3(b.x, toH + b.elevation, b.z)
          const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2)
          const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(20))
          const mat = new THREE.LineBasicMaterial({
            color: '#d4a84b',
            transparent: true,
            opacity: 0.2,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          })
          group.add(new THREE.Line(geo, mat))
        }
      }
    }
    return group
  }, [locations])

  useFrame(({ clock }) => {
    groupObj.children.forEach((child, i) => {
      const mat = (child as THREE.Line).material as THREE.LineBasicMaterial
      mat.opacity = 0.15 + Math.sin(clock.elapsedTime + i * 0.5) * 0.08
    })
  })

  return <primitive object={groupObj} />
}

// ─── Camera Animator ────────────────────────────────────────
function CameraAnimator({ target }: { target: MapLocation | null }) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, 30, 50))

  useEffect(() => {
    if (target) {
      const h = Math.max(getTerrainHeight(target.x, target.z), 0)
      targetPos.current.set(target.x + 10, h + 15, target.z + 15)
    }
  }, [target])

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.02)
  })

  return null
}

// ─── Scene ──────────────────────────────────────────────────
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
      <hemisphereLight args={['#1a3030', '#0a1515', 0.3]} />
      <pointLight position={[0, 20, 0]} intensity={0.5} color="#d4a84b" distance={80} decay={2} />

      <Stars radius={100} depth={80} count={5000} factor={4} saturation={0.2} fade speed={0.5} />

      <Terrain locations={locations} />
      <Water />
      <FogDome />
      <AmbientParticles />

      {locations.map((loc) => (
        <LocationBeacon
          key={loc.id}
          location={loc}
          isSelected={selectedLocation?.id === loc.id}
          onSelect={onSelectLocation}
        />
      ))}

      <ConnectionLines locations={locations} />
      <CameraAnimator target={selectedLocation} />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={120}
      />

      <fog attach="fog" args={['#0a1515', 60, 140]} />
    </>
  )
}

// ─── Info Panel ─────────────────────────────────────────────
function InfoPanel({ location, onClose }: { location: MapLocation; onClose: () => void }) {
  const color = getTypeColor(location.type)
  const icon = getTypeIcon(location.type)

  return (
    <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[420px] z-20 animate-slide-up">
      <div
        className="rounded-xl p-6 backdrop-blur-xl border"
        style={{
          background: 'linear-gradient(135deg, rgba(13, 26, 26, 0.95), rgba(20, 40, 40, 0.9))',
          borderColor: `${color}40`,
          boxShadow: `0 0 40px ${color}20, 0 20px 60px rgba(0,0,0,0.5)`,
        }}
      >
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

        {location.description && (
          <p className="text-sm text-parchment-muted leading-relaxed mb-4">{location.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-xs mb-4">
          <div>
            <span className="text-parchment-muted">Stability</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: `${color}20` }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${location.stability * 100}%`, background: color }} />
              </div>
              <span style={{ color }}>{Math.round(location.stability * 100)}%</span>
            </div>
          </div>
          <div>
            <span className="text-parchment-muted">Coordinates</span>
            <div className="mt-1" style={{ color }}>{location.x.toFixed(1)}, {location.z.toFixed(1)}</div>
          </div>
        </div>

        {location.tags && location.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {location.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-xs border" style={{ borderColor: `${color}30`, color: `${color}cc`, background: `${color}10` }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <a
            href={`/explore/${location.slug}`}
            className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
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
      <div className="rounded-lg p-3 backdrop-blur-xl border border-gold/20" style={{ background: 'rgba(13, 26, 26, 0.85)' }}>
        <h4 className="text-xs font-serif text-parchment mb-2 uppercase tracking-wider">Legend</h4>
        <div className="space-y-1">
          {types.map(({ type, label }) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: getTypeColor(type), boxShadow: `0 0 6px ${getTypeColor(type)}80` }} />
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
  useEffect(() => { const t = setTimeout(() => setVisible(false), 6000); return () => clearTimeout(t) }, [])
  if (!visible) return null
  return (
    <div className="absolute top-4 right-4 z-10 animate-fade-in">
      <div className="rounded-lg px-4 py-3 backdrop-blur-xl border border-gold/20" style={{ background: 'rgba(13, 26, 26, 0.85)' }}>
        <p className="text-xs text-parchment-muted">
          <span className="text-gold">Scroll</span> to zoom · <span className="text-gold">Drag</span> to rotate · <span className="text-gold">Click</span> beacons for info
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

// ─── Main Export ────────────────────────────────────────────
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
      <Canvas
        shadows
        camera={{ position: [0, 35, 55], fov: 55, near: 0.1, far: 300 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        style={{ background: '#0a1212' }}
        onClick={() => setSelectedLocation(null)}
      >
        <Scene locations={locations} selectedLocation={selectedLocation} onSelectLocation={handleSelect} />
      </Canvas>

      <MapLegend />
      <ControlsHint />
      {locations.length === 0 && <EmptyState />}
      {selectedLocation && <InfoPanel location={selectedLocation} onClose={handleClose} />}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-charcoal to-transparent pointer-events-none" />
    </div>
  )
}
