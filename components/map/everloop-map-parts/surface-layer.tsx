'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Html, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { MAP_HEIGHT, MAP_WIDTH, SURFACE_Y, getShardColor, getSurfaceHeight, seededRandom, type RegionId } from './constants'
import { MAP_BASE_TEXTURE_URL, configureSurfaceTexture } from './textures'

// ═══════════════════════════════════════════════════════════════
// LAYER 4 — THE EVERLOOP SURFACE (Image-Textured Map)
// ═══════════════════════════════════════════════════════════════
export function TheSurface() {
  const texture = useTexture(MAP_BASE_TEXTURE_URL, configureSurfaceTexture)

  return (
    <group position={[0, SURFACE_Y, 0]}>
      {/* Main map surface with painted texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT]} />
        <meshBasicMaterial
          map={texture}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Parchment-style edge frame */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[MAP_WIDTH + 4, 3, MAP_HEIGHT + 4]} />
        <meshStandardMaterial color="#2a2218" roughness={0.9} metalness={0.1} />
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

export function SurfaceShards() {
  return (
    <group>
      {SHARD_SITES.map((site, i) => (
        <SurfaceShard key={i} site={site} index={i} />
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
// AMBIENT PARTICLES (golden motes above the surface)
// ═══════════════════════════════════════════════════════════════
function createSurfaceParticles() {
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
}

export function SurfaceParticles() {
  const pointsRef = useRef<THREE.Points>(null)
  const [obj] = useState(createSurfaceParticles)

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const t = clock.elapsedTime * 0.1
    for (let i = 0; i < Math.min(pos.count, 400); i++) {
      pos.setY(i, pos.getY(i) + Math.sin(t + i * 0.15) * 0.003)
    }
    pos.needsUpdate = true
  })

  return <primitive ref={pointsRef} object={obj} />
}
