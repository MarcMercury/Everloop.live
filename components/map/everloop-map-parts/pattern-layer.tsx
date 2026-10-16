'use client'

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { FOLD_Y, PATTERN_Y, SURFACE_Y } from './constants'
import { PatternGlowFragmentShader, PatternGlowVertexShader } from './shaders'

// ═══════════════════════════════════════════════════════════════
// LAYER 3 — THE PATTERN (Lattice of Intent & Purpose)
// Woven from the chaos of the Drift by the Architects,
// pinned to the Fold by great Anchors — the stable foundation
// from which the Everloop springs.
// ═══════════════════════════════════════════════════════════════

function createLattice() {
  const group = new THREE.Group()
  const spacing = 12
  const range = 105
  // Nodes — brighter and more varied than before
  const nodeGeo = new THREE.SphereGeometry(0.4, 8, 8)

  // Primary grid
  for (let x = -range; x <= range; x += spacing) {
    for (let z = -range; z <= range; z += spacing) {
      const dist = Math.sqrt(x * x + z * z)
      if (dist > range + 5) continue

      // Node intensity based on distance — stronger near Anchors
      const anchorProximity = getAnchorProximity(x, z)
      const intensity = 0.6 + anchorProximity * 0.4

      const nodeMat = new THREE.MeshStandardMaterial({
        color: '#50b0ff', emissive: '#3090ee',
        emissiveIntensity: intensity,
        transparent: true, opacity: 0.9, roughness: 0.15,
      })
      const node = new THREE.Mesh(nodeGeo, nodeMat)
      node.position.set(x, PATTERN_Y, z)
      group.add(node)

      // Horizontal connections
      if (x + spacing <= range) {
        const nx = x + spacing
        const nd = Math.sqrt(nx * nx + z * z)
        if (nd <= range + 5) {
          const lineMat = new THREE.LineBasicMaterial({
            color: '#3090ee', transparent: true, opacity: 0.3 + intensity * 0.2,
            depthWrite: false, blending: THREE.AdditiveBlending,
          })
          const geo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, PATTERN_Y, z),
            new THREE.Vector3(nx, PATTERN_Y, z),
          ])
          group.add(new THREE.Line(geo, lineMat))
        }
      }
      if (z + spacing <= range) {
        const nz = z + spacing
        const nd = Math.sqrt(x * x + nz * nz)
        if (nd <= range + 5) {
          const lineMat = new THREE.LineBasicMaterial({
            color: '#3090ee', transparent: true, opacity: 0.3 + intensity * 0.2,
            depthWrite: false, blending: THREE.AdditiveBlending,
          })
          const geo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, PATTERN_Y, z),
            new THREE.Vector3(x, PATTERN_Y, nz),
          ])
          group.add(new THREE.Line(geo, lineMat))
        }
      }
      // Diagonal cross-threads for richer weave
      if (x + spacing <= range && z + spacing <= range) {
        const nd = Math.sqrt((x + spacing) ** 2 + (z + spacing) ** 2)
        if (nd <= range + 5 && Math.random() > 0.4) {
          const lineMat = new THREE.LineBasicMaterial({
            color: '#2080dd', transparent: true, opacity: 0.12,
            depthWrite: false, blending: THREE.AdditiveBlending,
          })
          const geo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, PATTERN_Y, z),
            new THREE.Vector3(x + spacing, PATTERN_Y, z + spacing),
          ])
          group.add(new THREE.Line(geo, lineMat))
        }
      }
    }
  }
  return group
}

/** Primary lattice — intricate web of glowing threads with flowing energy */
function PatternLattice() {
  const latticeRef = useRef<THREE.Group>(null)

  const [latticeObj] = useState(createLattice)

  useFrame(({ clock }) => {
    if (latticeRef.current) {
      const t = clock.elapsedTime
      // Animate node emissive — energy pulse waves radiating from center
      latticeRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial
          const d = child.position.length()
          // Wave pulses outward from center
          const wave1 = Math.sin(t * 1.2 - d * 0.06) * 0.3
          const wave2 = Math.sin(t * 0.7 + d * 0.04) * 0.15
          mat.emissiveIntensity = 0.5 + wave1 + wave2 + getAnchorProximity(child.position.x, child.position.z) * 0.3
        }
      })
    }
  })

  return (
    <group>
      <group ref={latticeRef}>
        <primitive object={latticeObj} />
      </group>
      <pointLight position={[0, PATTERN_Y, 0]} intensity={1.5} color="#3090ee" distance={100} decay={2} />
    </group>
  )
}

/** Helper to calculate proximity to nearest anchor position */
function getAnchorProximity(x: number, z: number): number {
  let minDist = Infinity
  const count = 8
  const r = 95
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const ax = Math.cos(angle) * r
    const az = Math.sin(angle) * r
    const dist = Math.sqrt((x - ax) ** 2 + (z - az) ** 2)
    if (dist < minDist) minDist = dist
  }
  return Math.max(0, 1 - minDist / 40)
}

function createEnergyFlow() {
  const count = 1500
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const data: { x: number; z: number; speed: number; phase: number }[] = []
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = Math.random() * 100
    const x = Math.cos(angle) * r
    const z = Math.sin(angle) * r
    positions[i * 3] = x
    positions[i * 3 + 1] = PATTERN_Y + Math.random() * (SURFACE_Y - PATTERN_Y)
    positions[i * 3 + 2] = z
    data.push({ x, z, speed: 0.5 + Math.random() * 1.5, phase: Math.random() * Math.PI * 2 })
    // Bright blue-white energy
    colors[i * 3] = 0.4 + Math.random() * 0.3
    colors[i * 3 + 1] = 0.6 + Math.random() * 0.3
    colors[i * 3 + 2] = 0.9 + Math.random() * 0.1
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const m = new THREE.PointsMaterial({
    size: 0.15, vertexColors: true, transparent: true, opacity: 0.5,
    sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })
  return { geo: g, mat: m, flowData: data }
}

/** Energy flow particles — visible streams moving upward through the Pattern toward the surface */
function PatternEnergyFlow() {
  const pointsRef = useRef<THREE.Points>(null)
  const [{ geo, mat, flowData }] = useState(createEnergyFlow)

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const t = clock.elapsedTime
    for (let i = 0; i < pos.count; i++) {
      const d = flowData[i]
      if (!d) continue
      // Flow upward, reset to bottom when reaching top
      let y = pos.getY(i) + d.speed * 0.02
      if (y > SURFACE_Y - 2) y = PATTERN_Y + Math.random() * 2
      pos.setY(i, y)
      // Slight lateral sway
      pos.setX(i, d.x + Math.sin(t * 0.3 + d.phase) * 1.5)
      pos.setZ(i, d.z + Math.cos(t * 0.25 + d.phase) * 1.5)
    }
    pos.needsUpdate = true
  })

  return <points ref={pointsRef} geometry={geo} material={mat} />
}

function createWeavingThreads() {
  const group = new THREE.Group()
  const threadCount = 24
  for (let t = 0; t < threadCount; t++) {
    const angle = (t / threadCount) * Math.PI * 2 + Math.random() * 0.3
    const r = 20 + Math.random() * 75
    const points: THREE.Vector3[] = []
    const steps = 20
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps
      const y = FOLD_Y + (PATTERN_Y - FOLD_Y + 3) * frac
      // Spiral upward
      const spiralAngle = angle + frac * 1.5
      const spiralR = r + Math.sin(frac * Math.PI * 2) * 5
      points.push(new THREE.Vector3(
        Math.cos(spiralAngle) * spiralR,
        y,
        Math.sin(spiralAngle) * spiralR,
      ))
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    const mat = new THREE.LineBasicMaterial({
      color: t % 3 === 0 ? '#6040c0' : t % 3 === 1 ? '#4080dd' : '#50a0ee',
      transparent: true, opacity: 0.2,
      depthWrite: false, blending: THREE.AdditiveBlending,
    })
    group.add(new THREE.Line(geo, mat))
  }
  return group
}

/** Weaving threads — visible strands being pulled from below (Fold) upward into the lattice */
function PatternWeavingThreads() {
  const groupRef = useRef<THREE.Group>(null)
  const [threads] = useState(createWeavingThreads)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Line) {
        const mat = child.material as THREE.LineBasicMaterial
        mat.opacity = 0.1 + Math.sin(t * 0.4 + i * 0.5) * 0.1
      }
    })
    groupRef.current.rotation.y = t * 0.003
  })

  return <group ref={groupRef}><primitive object={threads} /></group>
}

/** Sacred geometry glow plane — luminous web rendered via shader */
function PatternSacredGeometry() {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 0.5 },
  }), [])

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  return (
    <mesh position={[0, PATTERN_Y - 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[115, 128]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={PatternGlowVertexShader}
        fragmentShader={PatternGlowFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function createLightPillars() {
  const data: { x: number; z: number; height: number; phase: number }[] = []
  // Place pillars at focal points of the lattice
  const spacing = 24
  for (let x = -96; x <= 96; x += spacing) {
    for (let z = -96; z <= 96; z += spacing) {
      const dist = Math.sqrt(x * x + z * z)
      if (dist > 100 || dist < 15) continue
      if (Math.random() > 0.5) continue // sparse
      data.push({
        x, z,
        height: 3 + Math.random() * (SURFACE_Y - PATTERN_Y - 5),
        phase: Math.random() * Math.PI * 2,
      })
    }
  }
  return data
}

/** Pattern luminous pillars — vertical columns of light at key intersections */
function PatternLightPillars() {
  const groupRef = useRef<THREE.Group>(null)
  const [pillars] = useState(createLightPillars)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const p = pillars[i]
        if (!p) return
        const mat = child.material as THREE.MeshStandardMaterial
        const pulse = Math.sin(t * 0.8 + p.phase) * 0.5 + 0.5
        mat.opacity = 0.05 + pulse * 0.1
        mat.emissiveIntensity = 0.3 + pulse * 0.5
      }
    })
  })

  return (
    <group ref={groupRef}>
      {pillars.map((p, i) => (
        <mesh key={i} position={[p.x, PATTERN_Y + p.height / 2, p.z]}>
          <cylinderGeometry args={[0.08, 0.08, p.height, 4]} />
          <meshStandardMaterial
            color="#60c0ff" emissive="#40a0ff" emissiveIntensity={0.5}
            transparent opacity={0.08} depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

/** Pattern energy rings — concentric rings of energy radiating from the center */
function PatternEnergyRings() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial
        const wave = Math.sin(t * 1.0 - i * 0.5) * 0.5 + 0.5
        mat.opacity = 0.03 + wave * 0.08
        mat.emissiveIntensity = 0.3 + wave * 0.5
        child.rotation.z = t * 0.002 * (i % 2 === 0 ? 1 : -1)
      }
    })
  })

  return (
    <group ref={groupRef}>
      {[20, 35, 50, 65, 80, 95].map((r, i) => (
        <mesh key={i} position={[0, PATTERN_Y + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.15, r + 0.15, 96]} />
          <meshStandardMaterial
            color="#50b0ff" emissive="#3090ee" emissiveIntensity={0.5}
            transparent opacity={0.06} roughness={0.05} metalness={0.8}
            side={THREE.DoubleSide} depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

export function ThePattern() {
  return (
    <group>
      {/* Sacred geometry glow plane — shader-based luminous web */}
      <PatternSacredGeometry />
      {/* Intricate lattice web */}
      <PatternLattice />
      {/* Concentric energy rings */}
      <PatternEnergyRings />
      {/* Vertical light pillars at lattice intersections */}
      <PatternLightPillars />
      {/* Energy flowing upward through the Pattern toward the surface */}
      <PatternEnergyFlow />
      {/* Visible weaving threads from Fold into Pattern */}
      <PatternWeavingThreads />
    </group>
  )
}

export function Anchors() {
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
      const t = clock.elapsedTime
      // Pulse all luminous parts
      ref.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial
          if (mat.emissive) {
            mat.emissiveIntensity = 0.4 + Math.sin(t * 0.6 + index * 0.8 + i * 0.3) * 0.25
          }
        }
      })
    }
  })

  return (
    <group ref={ref} position={[x, FOLD_Y, z]}>
      {/* Main anchor pillar — thick, imposing, crystalline */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.8, 2, height, 8]} />
        <meshStandardMaterial
          color="#4090dd" emissive="#3070cc" emissiveIntensity={0.5}
          transparent opacity={0.55} roughness={0.05} metalness={0.8}
        />
      </mesh>
      {/* Inner energy core — brighter */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.3, 0.8, height * 0.9, 6]} />
        <meshStandardMaterial
          color="#80d0ff" emissive="#60b0ff" emissiveIntensity={0.9}
          transparent opacity={0.35} roughness={0} metalness={1} depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Crown — where anchor meets the surface */}
      <mesh position={[0, height + 0.5, 0]}>
        <coneGeometry args={[1.5, 4, 8]} />
        <meshStandardMaterial
          color="#80c0ff" emissive="#60a0ee" emissiveIntensity={0.7}
          transparent opacity={0.6} roughness={0.05} metalness={0.9}
        />
      </mesh>
      {/* Base — rooted in the Fold */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[3, 2.5, 1.5, 8]} />
        <meshStandardMaterial
          color="#2a4060" emissive="#304080" emissiveIntensity={0.4}
          transparent opacity={0.5} roughness={0.1} metalness={0.7}
        />
      </mesh>
      {/* Radial energy rings spiraling up the pillar */}
      {[0.2, 0.4, 0.6, 0.8].map((frac, ri) => (
        <mesh key={ri} position={[0, height * frac, 0]} rotation={[Math.PI / 2, 0, ri * 0.5]}>
          <torusGeometry args={[1.5 - frac * 0.5, 0.06, 8, 24]} />
          <meshStandardMaterial
            color="#60c0ff" emissive="#40a0ff" emissiveIntensity={0.8}
            transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      {/* Anchor light column */}
      <pointLight position={[0, height / 2, 0]} intensity={1.2} color="#4090dd" distance={25} decay={2} />
      <pointLight position={[0, height, 0]} intensity={0.6} color="#60b0ff" distance={15} decay={2} />
    </group>
  )
}

export function PatternShards() {
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

export function Hollows() {
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
