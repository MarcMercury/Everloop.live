'use client'

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { FOLD_Y } from './constants'
import { FoldMembraneFragmentShader, FoldMembraneVertexShader } from './shaders'

// ═══════════════════════════════════════════════════════════════
// LAYER 2 — THE FOLD (Where Matter Barely Holds Form)
// The outer edge of the Drift where Architects emerge —
// beings of intent and permanence who pull chaos into order.
// ═══════════════════════════════════════════════════════════════

/** The boundary membrane — shimmering edge between chaos and nascent form */
function FoldBoundaryMembrane() {
  const ref = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const shaderRef = useRef<THREE.ShaderMaterial>(null)

  const membraneUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 0.45 },
  }), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.06 + Math.sin(t * 0.3) * 0.03 + Math.sin(t * 0.7) * 0.02
      mat.emissiveIntensity = 0.3 + Math.sin(t * 0.5) * 0.15
      ref.current.rotation.z = t * 0.005
    }
    if (innerRef.current) {
      const mat = innerRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.1 + Math.sin(t * 0.4 + 1) * 0.04
      mat.emissiveIntensity = 0.4 + Math.sin(t * 0.6 + 0.5) * 0.2
    }
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = t
    }
  })

  return (
    <group>
      {/* Shader-based living membrane — the reality boundary */}
      <mesh position={[0, FOLD_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[155, 128]} />
        <shaderMaterial
          ref={shaderRef}
          vertexShader={FoldMembraneVertexShader}
          fragmentShader={FoldMembraneFragmentShader}
          uniforms={membraneUniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Outer boundary ring — chaos side, flickering */}
      <mesh ref={ref} position={[0, FOLD_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[120, 145, 96]} />
        <meshStandardMaterial
          color="#6040a0" emissive="#4020a0" emissiveIntensity={0.3}
          transparent opacity={0.08} roughness={0.1} metalness={0.6}
          side={THREE.DoubleSide} depthWrite={false}
        />
      </mesh>
      {/* Inner stabilized disc — where form begins to hold */}
      <mesh ref={innerRef} position={[0, FOLD_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[120, 96]} />
        <meshStandardMaterial
          color="#2a3a5a" emissive="#304080" emissiveIntensity={0.4}
          transparent opacity={0.12} roughness={0.05} metalness={0.8}
          side={THREE.DoubleSide} depthWrite={false}
        />
      </mesh>
      {/* Concentric rings of crystalline energy at the boundary */}
      {[115, 120, 125, 130].map((r, i) => (
        <mesh key={i} position={[0, FOLD_Y + 0.3 + i * 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.3, r + 0.3, 96]} />
          <meshStandardMaterial
            color="#8060c0" emissive="#6040b0" emissiveIntensity={0.6}
            transparent opacity={0.15} roughness={0.02} metalness={0.95}
            side={THREE.DoubleSide} depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

function createTransitionParticles() {
  const count = 3000
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const data: { angle: number; r: number; baseY: number }[] = []

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = 20 + Math.random() * 130
    positions[i * 3] = Math.cos(angle) * r
    positions[i * 3 + 1] = FOLD_Y + (Math.random() - 0.5) * 8
    positions[i * 3 + 2] = Math.sin(angle) * r
    data.push({ angle, r, baseY: positions[i * 3 + 1] })
    // Outside (r > 120): chaotic drift colors, Inside: more blue/structured
    const isOuter = r > 110
    if (isOuter) {
      const t = Math.random()
      colors[i * 3] = t < 0.5 ? 0.3 + Math.random() * 0.3 : 0.1
      colors[i * 3 + 1] = 0.05
      colors[i * 3 + 2] = t < 0.5 ? 0.2 + Math.random() * 0.2 : 0.3 + Math.random() * 0.2
    } else {
      colors[i * 3] = 0.15 + (1 - r / 120) * 0.1
      colors[i * 3 + 1] = 0.3 + (1 - r / 120) * 0.3
      colors[i * 3 + 2] = 0.6 + (1 - r / 120) * 0.2
    }
  }

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const m = new THREE.PointsMaterial({
    size: 0.2, vertexColors: true, transparent: true, opacity: 0.5,
    sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })
  return { geo: g, mat: m, baseData: data }
}

/** Fold chaos-to-order particles — outside is chaotic, inside is structured */
function FoldTransitionParticles() {
  const pointsRef = useRef<THREE.Points>(null)
  const [{ geo, mat, baseData }] = useState(createTransitionParticles)

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const t = clock.elapsedTime
    for (let i = 0; i < pos.count; i++) {
      const d = baseData[i]
      if (!d) continue
      // Outer particles: chaotic like drift. Inner: gentle orbit.
      const chaosAmount = Math.max(0, (d.r - 80) / 60) // 0 at center, 1 at edge
      const chaos = chaosAmount * Math.sin(t * 0.5 + i * 0.1) * 3
      const orderedOrbit = (1 - chaosAmount) * t * 0.02
      const a = d.angle + orderedOrbit
      const x = Math.cos(a) * d.r + chaos * Math.sin(t * 0.3 + i * 0.05)
      const z = Math.sin(a) * d.r + chaos * Math.cos(t * 0.25 + i * 0.07)
      const y = d.baseY + chaos * 0.8 * Math.sin(t * 0.4 + i * 0.02)
      pos.setXYZ(i, x, y, z)
    }
    pos.needsUpdate = true
  })

  return <points ref={pointsRef} geometry={geo} material={mat} />
}

function createArchitects() {
  const result: { angle: number; r: number; height: number; phase: number }[] = []
  const count = 7
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + 0.2
    result.push({
      angle,
      r: 105 + Math.sin(i * 1.7) * 15,
      height: 8 + Math.random() * 6,
      phase: Math.random() * Math.PI * 2,
    })
  }
  return result
}

/** The Architects — tall angular figures standing at the boundary, beings of intent */
function FoldArchitects() {
  const groupRef = useRef<THREE.Group>(null)
  const [architects] = useState(createArchitects)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.children.forEach((group, i) => {
      const arch = architects[i]
      if (!arch) return
      // Subtle swaying — they are permanent but in a chaotic realm
      group.rotation.y = Math.sin(t * 0.1 + arch.phase) * 0.05
      group.rotation.x = Math.cos(t * 0.08 + arch.phase) * 0.03
      // Pulsing glow — their intent radiates
      group.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial
          mat.emissiveIntensity = 0.5 + Math.sin(t * 0.4 + arch.phase) * 0.3
        }
      })
    })
  })

  return (
    <group ref={groupRef}>
      {architects.map((arch, i) => {
        const x = Math.cos(arch.angle) * arch.r
        const z = Math.sin(arch.angle) * arch.r
        return (
          <group key={i} position={[x, FOLD_Y, z]}>
            {/* Body — tall angular pillar */}
            <mesh position={[0, arch.height / 2, 0]}>
              <cylinderGeometry args={[0.4, 1.2, arch.height, 4]} />
              <meshStandardMaterial
                color="#1a2040" emissive="#4060c0" emissiveIntensity={0.5}
                transparent opacity={0.6} roughness={0.1} metalness={0.9}
              />
            </mesh>
            {/* Head — floating geometric shape */}
            <Float speed={0.5} rotationIntensity={0.5} floatIntensity={0.3}>
              <mesh position={[0, arch.height + 1.5, 0]}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                  color="#6080c0" emissive="#80a0ff" emissiveIntensity={0.8}
                  transparent opacity={0.7} roughness={0.05} metalness={0.9}
                />
              </mesh>
            </Float>
            {/* Arms/tendrils reaching outward into drift, inward toward pattern */}
            <mesh position={[-2, arch.height * 0.6, 0]} rotation={[0, 0, -0.6]}>
              <cylinderGeometry args={[0.08, 0.2, 4, 4]} />
              <meshStandardMaterial
                color="#3050a0" emissive="#4070c0" emissiveIntensity={0.4}
                transparent opacity={0.35} depthWrite={false}
              />
            </mesh>
            <mesh position={[2, arch.height * 0.6, 0]} rotation={[0, 0, 0.6]}>
              <cylinderGeometry args={[0.08, 0.2, 4, 4]} />
              <meshStandardMaterial
                color="#3050a0" emissive="#4070c0" emissiveIntensity={0.4}
                transparent opacity={0.35} depthWrite={false}
              />
            </mesh>
            {/* Intent aura */}
            <pointLight color="#5080dd" intensity={1} distance={15} decay={2} position={[0, arch.height * 0.7, 0]} />
          </group>
        )
      })}
    </group>
  )
}

function createFormingFragments() {
  return Array.from({ length: 30 }, () => ({
    angle: Math.random() * Math.PI * 2,
    r: 40 + Math.random() * 80,
    y: FOLD_Y + (Math.random() - 0.5) * 6,
    size: 0.3 + Math.random() * 1.2,
    phase: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.3,
    type: Math.floor(Math.random() * 4),
  }))
}

/** Semi-stable geometric fragments — matter trying to hold form, flickering */
function FoldFormingFragments() {
  const groupRef = useRef<THREE.Group>(null)
  const [fragments] = useState(createFormingFragments)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const frag = fragments[i]
        if (!frag) return
        // Fragments flicker between solid and dissolving
        const stability = Math.sin(t * 0.8 + frag.phase)
        const mat = child.material as THREE.MeshStandardMaterial
        mat.opacity = 0.15 + Math.max(0, stability) * 0.35
        mat.wireframe = stability < -0.3 // Dissolve into wireframe when unstable
        mat.emissiveIntensity = 0.3 + Math.max(0, stability) * 0.5
        // Jitter position when unstable
        const jitter = Math.max(0, -stability) * 0.5
        child.position.x = Math.cos(frag.angle) * frag.r + Math.sin(t + frag.phase) * jitter
        child.position.z = Math.sin(frag.angle) * frag.r + Math.cos(t + frag.phase) * jitter
        child.rotation.y = t * frag.rotSpeed
        child.rotation.x = t * frag.rotSpeed * 0.7
        // Scale wobble
        child.scale.setScalar(frag.size * (1 + Math.sin(t * 1.5 + frag.phase) * 0.2 * Math.max(0, -stability)))
      }
    })
  })

  return (
    <group ref={groupRef}>
      {fragments.map((frag, i) => (
        <mesh key={i} position={[Math.cos(frag.angle) * frag.r, frag.y, Math.sin(frag.angle) * frag.r]}>
          {frag.type === 0 ? <boxGeometry args={[frag.size, frag.size, frag.size]} /> :
           frag.type === 1 ? <tetrahedronGeometry args={[frag.size]} /> :
           frag.type === 2 ? <dodecahedronGeometry args={[frag.size, 0]} /> :
           <icosahedronGeometry args={[frag.size, 0]} />}
          <meshStandardMaterial
            color="#304060" emissive="#4070b0" emissiveIntensity={0.4}
            transparent opacity={0.3} roughness={0.15} metalness={0.7} depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/** Energy streams being drawn inward from drift into fold */
function FoldInflowStreams() {
  const streamsObj = useMemo(() => {
    const group = new THREE.Group()
    const streamCount = 16
    for (let s = 0; s < streamCount; s++) {
      const angle = (s / streamCount) * Math.PI * 2
      const points: THREE.Vector3[] = []
      const outerR = 160
      const innerR = 50
      const steps = 30
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const r = outerR - (outerR - innerR) * t
        // Spiral inward
        const a = angle + t * 0.8
        const wobble = Math.sin(t * Math.PI * 3 + s * 0.7) * 5 * (1 - t)
        points.push(new THREE.Vector3(
          Math.cos(a) * r + wobble,
          FOLD_Y + Math.sin(t * Math.PI) * 3 * (1 - t),
          Math.sin(a) * r + wobble,
        ))
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points)
      const mat = new THREE.LineBasicMaterial({
        color: s % 2 === 0 ? '#6040a0' : '#4060a0',
        transparent: true, opacity: 0.15,
        depthWrite: false, blending: THREE.AdditiveBlending,
      })
      group.add(new THREE.Line(geo, mat))
    }
    return group
  }, [])

  const streamRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!streamRef.current) return
    const t = clock.elapsedTime
    streamRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Line) {
        const mat = child.material as THREE.LineBasicMaterial
        mat.opacity = 0.1 + Math.sin(t * 0.5 + i * 0.4) * 0.08
      }
    })
    streamRef.current.rotation.y = t * 0.005
  })

  return <group ref={streamRef}><primitive object={streamsObj} /></group>
}

function createCrystalRings() {
  const data: { angle: number; r: number; height: number; width: number; phase: number; tilt: number }[] = []
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.15
    data.push({
      angle,
      r: 112 + Math.random() * 10,
      height: 1.5 + Math.random() * 4,
      width: 0.2 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      tilt: Math.random() * 0.3 - 0.15,
    })
  }
  return data
}

/** Crystalline formation rings — where Drift substance crystallizes at the boundary */
function FoldCrystalRings() {
  const groupRef = useRef<THREE.Group>(null)
  const [crystals] = useState(createCrystalRings)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const c = crystals[i]
        if (!c) return
        const mat = child.material as THREE.MeshStandardMaterial
        // Crystals grow and shrink — reality solidifying and dissolving
        const growth = 0.5 + Math.sin(t * 0.3 + c.phase) * 0.5
        child.scale.y = growth
        mat.opacity = 0.2 + growth * 0.4
        mat.emissiveIntensity = 0.4 + growth * 0.6
      }
    })
  })

  return (
    <group ref={groupRef}>
      {crystals.map((c, i) => {
        const x = Math.cos(c.angle) * c.r
        const z = Math.sin(c.angle) * c.r
        return (
          <mesh key={i} position={[x, FOLD_Y, z]} rotation={[0, c.angle, c.tilt]}>
            <coneGeometry args={[c.width, c.height, 5]} />
            <meshStandardMaterial
              color="#5060b0" emissive="#7060d0" emissiveIntensity={0.5}
              transparent opacity={0.3} roughness={0.02} metalness={0.95}
              depthWrite={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}

/** Fold energy vortex — visible spiraling energy being pulled from Drift into ordered space */
function FoldEnergyVortex() {
  const groupRef = useRef<THREE.Group>(null)
  const spirals = useMemo(() => {
    const group = new THREE.Group()
    for (let s = 0; s < 6; s++) {
      const points: THREE.Vector3[] = []
      const startAngle = (s / 6) * Math.PI * 2
      const segments = 50
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const r = 140 * (1 - t) + 30 * t // spiral inward
        const angle = startAngle + t * Math.PI * 3 // 1.5 full rotations
        const y = FOLD_Y - 3 + t * 8 // rise slightly
        points.push(new THREE.Vector3(
          Math.cos(angle) * r,
          y,
          Math.sin(angle) * r,
        ))
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points)
      const hue = s % 3
      const color = hue === 0 ? '#8040d0' : hue === 1 ? '#4060c0' : '#6050b0'
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
      group.add(new THREE.Line(geo, mat))
    }
    return group
  }, [])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.elapsedTime
      groupRef.current.rotation.y = t * 0.01
      groupRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Line) {
          const mat = child.material as THREE.LineBasicMaterial
          mat.opacity = 0.15 + Math.sin(t * 0.4 + i * 1.0) * 0.1
        }
      })
    }
  })

  return <group ref={groupRef}><primitive object={spirals} /></group>
}

export function TheFold() {
  return (
    <group>
      {/* Boundary membrane — the edge between chaos and form */}
      <FoldBoundaryMembrane />
      {/* Energy vortex — spiraling matter being drawn inward */}
      <FoldEnergyVortex />
      {/* Crystalline formations at the boundary */}
      <FoldCrystalRings />
      {/* Transition particles — chaotic outside, ordered inside */}
      <FoldTransitionParticles />
      {/* Inflow streams — drift matter being drawn inward */}
      <FoldInflowStreams />
      {/* Semi-stable fragments — matter trying to hold form */}
      <FoldFormingFragments />
      {/* The Architects — beings of intent and permanence */}
      <FoldArchitects />
      {/* Grid showing nascent structure */}
      <FoldGrid />
      {/* Enhanced ambient lighting */}
      <pointLight position={[0, FOLD_Y + 3, 0]} intensity={0.8} color="#4080c0" distance={130} decay={2} />
      <pointLight position={[0, FOLD_Y - 2, 0]} intensity={0.4} color="#5030a0" distance={80} decay={2} />
      <pointLight position={[80, FOLD_Y + 1, 0]} intensity={0.3} color="#6050b0" distance={60} decay={2} />
      <pointLight position={[-80, FOLD_Y + 1, 0]} intensity={0.3} color="#4070c0" distance={60} decay={2} />
    </group>
  )
}

function FoldGrid() {
  const obj = useMemo(() => {
    const group = new THREE.Group()
    // More subtle grid — order emerging from chaos
    for (let i = -120; i <= 120; i += 12) {
      const distFromCenter = Math.abs(i) / 120
      const opacity = 0.03 + (1 - distFromCenter) * 0.08 // Stronger near center
      const mat = new THREE.LineBasicMaterial({ color: '#4060a0', transparent: true, opacity, depthWrite: false })
      const geoX = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i, FOLD_Y + 0.1, -120),
        new THREE.Vector3(i, FOLD_Y + 0.1, 120),
      ])
      group.add(new THREE.Line(geoX, mat))
      const geoZ = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-120, FOLD_Y + 0.1, i),
        new THREE.Vector3(120, FOLD_Y + 0.1, i),
      ])
      group.add(new THREE.Line(geoZ, mat))
    }
    return group
  }, [])
  return <primitive object={obj} />
}
