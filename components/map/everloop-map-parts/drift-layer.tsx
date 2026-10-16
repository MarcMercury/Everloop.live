'use client'

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DRIFT_Y, MAP_HEIGHT, MAP_WIDTH } from './constants'
import { DriftNebulaFragmentShader, DriftNebulaVertexShader } from './shaders'

// ═══════════════════════════════════════════════════════════════
// LAYER 1 — THE DRIFT (Sea of Unformed Energy & Matter)
// Pure chaos — nothing retains form but holds intent.
// Mountains, ash, emotion — ever-changing dust, light, particles.
// ═══════════════════════════════════════════════════════════════

function createChaosDust() {
  const count = 8000
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = (Math.random() - 0.5) * Math.PI * 0.8
    const r = 15 + Math.random() * 155
    positions[i * 3] = Math.cos(theta) * Math.cos(phi) * r
    positions[i * 3 + 1] = DRIFT_Y + Math.sin(phi) * r * 0.15 + (Math.random() - 0.5) * 30
    positions[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * r
    // Rich chaos palette: deep purples, burning oranges, cold blues, hot pinks, ash grays
    const t = Math.random()
    if (t < 0.25) { colors[i * 3] = 0.3 + Math.random() * 0.2; colors[i * 3 + 1] = 0.02; colors[i * 3 + 2] = 0.4 + Math.random() * 0.3 } // violet
    else if (t < 0.40) { colors[i * 3] = 0.6 + Math.random() * 0.4; colors[i * 3 + 1] = 0.15 + Math.random() * 0.15; colors[i * 3 + 2] = 0.05 } // burning orange
    else if (t < 0.55) { colors[i * 3] = 0.05; colors[i * 3 + 1] = 0.1 + Math.random() * 0.1; colors[i * 3 + 2] = 0.4 + Math.random() * 0.3 } // cold blue
    else if (t < 0.65) { colors[i * 3] = 0.6 + Math.random() * 0.3; colors[i * 3 + 1] = 0.05; colors[i * 3 + 2] = 0.4 + Math.random() * 0.3 } // hot pink
    else if (t < 0.80) { colors[i * 3] = 0.12; colors[i * 3 + 1] = 0.1; colors[i * 3 + 2] = 0.08 } // ash
    else { colors[i * 3] = 0.8 + Math.random() * 0.2; colors[i * 3 + 1] = 0.7 + Math.random() * 0.2; colors[i * 3 + 2] = 0.9 } // intent flash (bright white-purple)
    sizes[i] = 0.15 + Math.random() * 0.5
  }
  const basePositions = new Float32Array(positions)
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  g.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  const m = new THREE.PointsMaterial({
    size: 0.35, vertexColors: true, transparent: true, opacity: 0.7,
    sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
  })
  return { geo: g, mat: m, basePositions }
}

/** Primary chaos dust — thousands of swirling particles in turbulent motion */
function DriftChaosDust() {
  const pointsRef = useRef<THREE.Points>(null)
  const [{ geo, mat, basePositions }] = useState(createChaosDust)

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const col = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute
    const t = clock.elapsedTime
    // Turbulent displacement — each particle swirls chaotically
    for (let i = 0; i < pos.count; i++) {
      const bx = basePositions[i * 3]
      const by = basePositions[i * 3 + 1]
      const bz = basePositions[i * 3 + 2]
      const speed = 0.15
      const scale = 0.02
      const dx = Math.sin(t * speed + bz * scale + Math.cos(t * 0.1 + i * 0.01)) * 4
      const dy = Math.cos(t * speed * 0.7 + bx * scale * 1.3) * 2 + Math.sin(t * 0.3 + i * 0.005) * 1.5
      const dz = Math.cos(t * speed * 0.9 + by * scale + Math.sin(t * 0.08 + i * 0.008)) * 4
      pos.setX(i, bx + dx)
      pos.setY(i, by + dy)
      pos.setZ(i, bz + dz)
      // Shift colors over time for "nothing retains form" feeling
      if (i < 1000 && i % 4 === 0) {
        const shift = Math.sin(t * 0.5 + i * 0.1) * 0.5 + 0.5
        col.setX(i, col.getX(i) * 0.99 + shift * 0.01 * (0.3 + Math.sin(t + i) * 0.2))
      }
    }
    pos.needsUpdate = true
    col.needsUpdate = true
    // Slow overall rotation — the whole drift churns
    pointsRef.current.rotation.y = Math.sin(t * 0.02) * 0.3
    pointsRef.current.rotation.x = Math.cos(t * 0.015) * 0.05
  })

  return <points ref={pointsRef} geometry={geo} material={mat} />
}

function createEphemeralForms() {
  const forms: { x: number; z: number; seed: number; scale: number; type: number }[] = []
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.5
    const r = 30 + Math.random() * 100
    forms.push({
      x: Math.cos(angle) * r,
      z: Math.sin(angle) * r,
      seed: Math.random() * 100,
      scale: 3 + Math.random() * 8,
      type: Math.floor(Math.random() * 3), // 0=mountain, 1=spire, 2=wave
    })
  }
  return forms
}

/** Ephemeral forms — shapes that rise, almost coalesce, then dissolve back into chaos */
function DriftEphemeralForms() {
  const groupRef = useRef<THREE.Group>(null)
  const [formsData] = useState(createEphemeralForms)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const form = formsData[i]
        if (!form) return
        // Cycle: rise → almost form → dissolve → repeat
        const cycle = ((t * 0.15 + form.seed) % 4) / 4 // 0 to 1 over ~26 seconds
        const presence = Math.sin(cycle * Math.PI) // 0→1→0
        const mat = child.material as THREE.MeshStandardMaterial
        mat.opacity = presence * 0.25
        // Shift position as if being blown by chaotic winds
        child.position.x = form.x + Math.sin(t * 0.1 + form.seed) * 8
        child.position.y = DRIFT_Y - 5 + presence * form.scale * 1.5
        child.position.z = form.z + Math.cos(t * 0.08 + form.seed * 2) * 8
        // Distort shape
        child.scale.x = 1 + Math.sin(t * 0.3 + form.seed) * 0.4
        child.scale.y = 0.5 + presence * 1.5 + Math.sin(t * 0.5 + form.seed) * 0.3
        child.scale.z = 1 + Math.cos(t * 0.25 + form.seed * 1.5) * 0.4
        child.rotation.y = t * 0.1 + form.seed
        child.rotation.x = Math.sin(t * 0.07 + form.seed) * 0.3
      }
    })
  })

  return (
    <group ref={groupRef}>
      {formsData.map((form, i) => (
        <mesh key={i} position={[form.x, DRIFT_Y, form.z]}>
          {form.type === 0 ? (
            <coneGeometry args={[form.scale * 0.8, form.scale * 2, 5]} />
          ) : form.type === 1 ? (
            <cylinderGeometry args={[form.scale * 0.2, form.scale * 0.6, form.scale * 2.5, 4]} />
          ) : (
            <torusKnotGeometry args={[form.scale * 0.5, form.scale * 0.15, 32, 6]} />
          )}
          <meshStandardMaterial
            color={i % 3 === 0 ? '#2a0a3e' : i % 3 === 1 ? '#3a1505' : '#0a1535'}
            emissive={i % 3 === 0 ? '#5020a0' : i % 3 === 1 ? '#a04010' : '#1040a0'}
            emissiveIntensity={0.6}
            transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false}
            wireframe={i % 2 === 0}
          />
        </mesh>
      ))}
    </group>
  )
}

function createEnergyWisps() {
  const wisps: THREE.Line[] = []
  for (let w = 0; w < 20; w++) {
    const points: THREE.Vector3[] = []
    const startAngle = Math.random() * Math.PI * 2
    const startR = 20 + Math.random() * 120
    const sx = Math.cos(startAngle) * startR
    const sz = Math.sin(startAngle) * startR
    const numPts = 20
    for (let p = 0; p < numPts; p++) {
      const t = p / numPts
      points.push(new THREE.Vector3(
        sx + Math.sin(t * Math.PI * 3 + w) * 15,
        DRIFT_Y + (Math.random() - 0.5) * 20 + Math.sin(t * Math.PI) * 10,
        sz + Math.cos(t * Math.PI * 2.5 + w * 1.3) * 15,
      ))
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    const hue = Math.random()
    const color = hue < 0.3 ? '#ff6030' : hue < 0.5 ? '#c040ff' : hue < 0.7 ? '#3080ff' : '#ff50a0'
    const mat = new THREE.LineBasicMaterial({
      color, transparent: true, opacity: 0.3,
      depthWrite: false, blending: THREE.AdditiveBlending,
    })
    wisps.push(new THREE.Line(geo, mat))
  }
  return wisps
}

/** Energy wisps — bright streaks of intent that arc through the chaos */
function DriftEnergyWisps() {
  const groupRef = useRef<THREE.Group>(null)
  const [wispsData] = useState(createEnergyWisps)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Line) {
        const mat = child.material as THREE.LineBasicMaterial
        // Wisps pulse and fade — intent flickering through chaos
        const pulse = Math.sin(t * 1.5 + i * 0.8) * 0.5 + 0.5
        mat.opacity = pulse * 0.4
        child.rotation.y = t * 0.03 + i * 0.3
        child.rotation.x = Math.sin(t * 0.05 + i) * 0.1
      }
    })
  })

  return (
    <group ref={groupRef}>
      {wispsData.map((wisp, i) => <primitive key={i} object={wisp} />)}
    </group>
  )
}

/** Chaos vortex — swirling nebula rings at different angles */
function DriftVortexRings() {
  const ringsRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!ringsRef.current) return
    const t = clock.elapsedTime
    ringsRef.current.children.forEach((child, i) => {
      child.rotation.x = Math.sin(t * 0.05 + i * 2) * 0.3 + i * 0.4
      child.rotation.y = t * (0.02 + i * 0.008)
      child.rotation.z = Math.cos(t * 0.03 + i * 1.5) * 0.2
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial
        mat.opacity = 0.06 + Math.sin(t * 0.4 + i * 1.2) * 0.04
        mat.emissiveIntensity = 0.3 + Math.sin(t * 0.6 + i * 0.9) * 0.2
      }
    })
  })

  const rings = useMemo(() => {
    return [
      { r: 60, tube: 25, color: '#1a0a2e', emissive: '#4020a0' },
      { r: 90, tube: 20, color: '#150505', emissive: '#a03010' },
      { r: 120, tube: 30, color: '#0a0a25', emissive: '#2040b0' },
      { r: 45, tube: 18, color: '#200a20', emissive: '#8030a0' },
      { r: 100, tube: 22, color: '#0a1510', emissive: '#20a060' },
    ]
  }, [])

  return (
    <group ref={ringsRef} position={[0, DRIFT_Y, 0]}>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.5, 0, i * 0.7]}>
          <torusGeometry args={[ring.r, ring.tube, 12, 48]} />
          <meshStandardMaterial
            color={ring.color} emissive={ring.emissive} emissiveIntensity={0.3}
            transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function createIntentFlashes() {
  return Array.from({ length: 25 }, () => ({
    x: (Math.random() - 0.5) * 280,
    y: DRIFT_Y + (Math.random() - 0.5) * 25,
    z: (Math.random() - 0.5) * 280,
    phase: Math.random() * Math.PI * 2,
    speed: 0.5 + Math.random() * 2,
    color: ['#ffffff', '#ff80ff', '#80ffff', '#ffff80', '#ff8060'][Math.floor(Math.random() * 5)],
  }))
}

/** Intent flashes — brief bright pulses that appear and vanish, showing latent will in chaos */
function DriftIntentFlashes() {
  const flashesRef = useRef<THREE.Group>(null)
  const [flashData] = useState(createIntentFlashes)

  useFrame(({ clock }) => {
    if (!flashesRef.current) return
    const t = clock.elapsedTime
    flashesRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const data = flashData[i]
        if (!data) return
        // Brief bright flash then long dark period
        const cycle = (t * data.speed + data.phase) % (Math.PI * 2)
        const flash = Math.pow(Math.max(0, Math.sin(cycle)), 8) // Sharp spike
        const mat = child.material as THREE.MeshStandardMaterial
        mat.emissiveIntensity = flash * 3
        mat.opacity = flash * 0.8
        child.scale.setScalar(0.5 + flash * 2)
        // Drift through space
        child.position.x = data.x + Math.sin(t * 0.1 + data.phase) * 10
        child.position.y = data.y + Math.cos(t * 0.15 + data.phase) * 5
        child.position.z = data.z + Math.sin(t * 0.12 + data.phase * 1.5) * 10
      }
    })
  })

  return (
    <group ref={flashesRef}>
      {flashData.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, d.z]}>
          <sphereGeometry args={[0.5, 6, 6]} />
          <meshStandardMaterial
            color={d.color} emissive={d.color} emissiveIntensity={0}
            transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

/** Volumetric nebula cloud plane — the sea of chaos rendered as flat living cloud layers */
function DriftNebulaPlane() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const mat2Ref = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 0.55 },
  }), [])

  const uniforms2 = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 0.35 },
  }), [])

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.elapsedTime
    if (mat2Ref.current) mat2Ref.current.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <group>
      {/* Main nebula plane — flat chaos cloud layer */}
      <mesh position={[0, DRIFT_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[MAP_WIDTH * 1.3, MAP_HEIGHT * 1.3, 128, 128]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={DriftNebulaVertexShader}
          fragmentShader={DriftNebulaFragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Second offset chaos cloud layer for depth */}
      <mesh position={[0, DRIFT_Y - 5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[MAP_WIDTH * 1.1, MAP_HEIGHT * 1.1, 96, 96]} />
        <shaderMaterial
          ref={mat2Ref}
          vertexShader={DriftNebulaVertexShader}
          fragmentShader={DriftNebulaFragmentShader}
          uniforms={uniforms2}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

function createTendrilData() {
  return Array.from({ length: 8 }, (_, i) => ({
    startAngle: (i / 8) * Math.PI * 2 + Math.random() * 0.5,
    radius: 40 + Math.random() * 80,
    phase: Math.random() * Math.PI * 2,
    color: ['#8040ff', '#ff4060', '#4080ff', '#ff8020', '#c040ff', '#40c0ff', '#ff40c0', '#60ff80'][i],
    thickness: 0.3 + Math.random() * 0.5,
  }))
}

/** Drift energy tendrils — long sinuous arcs of raw energy snaking through the chaos */
function DriftEnergyTendrils() {
  const groupRef = useRef<THREE.Group>(null)
  const [tendrilData] = useState(createTendrilData)

  const tendrils = useMemo(() => {
    return tendrilData.map((td) => {
      const points: THREE.Vector3[] = []
      const segs = 40
      for (let j = 0; j <= segs; j++) {
        const t = j / segs
        const angle = td.startAngle + t * Math.PI * 1.5
        const r = td.radius * (1 - t * 0.3)
        const wobble = Math.sin(t * Math.PI * 4) * 8
        points.push(new THREE.Vector3(
          Math.cos(angle) * r + wobble,
          DRIFT_Y + Math.sin(t * Math.PI * 2) * 12 + t * 15,
          Math.sin(angle) * r + Math.cos(t * Math.PI * 3) * wobble,
        ))
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points)
      const mat = new THREE.LineBasicMaterial({
        color: td.color,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
      return new THREE.Line(geo, mat)
    })
  }, [tendrilData])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Line) {
        const mat = child.material as THREE.LineBasicMaterial
        mat.opacity = 0.2 + Math.sin(t * 0.8 + i * 1.2) * 0.2
        child.rotation.y = t * 0.015 + i * 0.1
      }
    })
  })

  return (
    <group ref={groupRef}>
      {tendrils.map((t, i) => <primitive key={i} object={t} />)}
    </group>
  )
}

export function TheDrift() {
  return (
    <group>
      {/* Flat nebula cloud layers — the primordial sea */}
      <DriftNebulaPlane />
      {/* Core chaos particles */}
      <DriftChaosDust />
      {/* Nebula vortex rings */}
      <DriftVortexRings />
      {/* Ephemeral forms — mountains, spires, shapes that almost form then dissolve */}
      <DriftEphemeralForms />
      {/* Energy wisps — intent arcing through the void */}
      <DriftEnergyWisps />
      {/* Energy tendrils — long sinuous arcs of raw power */}
      <DriftEnergyTendrils />
      {/* Intent flashes — brief sparks of will */}
      <DriftIntentFlashes />
      {/* Flat abyss floor */}
      <mesh position={[0, DRIFT_Y - 12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[MAP_WIDTH * 1.5, MAP_HEIGHT * 1.5]} />
        <meshStandardMaterial color="#030008" side={THREE.DoubleSide} transparent opacity={0.95} />
      </mesh>
      {/* Deep chaos glow — enhanced lighting */}
      <pointLight position={[0, DRIFT_Y, 0]} intensity={0.8} color="#5020a0" distance={130} decay={2} />
      <pointLight position={[40, DRIFT_Y - 5, -30]} intensity={0.6} color="#a04010" distance={80} decay={2} />
      <pointLight position={[-50, DRIFT_Y + 5, 20]} intensity={0.4} color="#2050b0" distance={80} decay={2} />
      <pointLight position={[0, DRIFT_Y + 10, 0]} intensity={0.3} color="#ff40a0" distance={60} decay={2} />
      <pointLight position={[-30, DRIFT_Y - 8, 40]} intensity={0.3} color="#c060ff" distance={60} decay={2} />
      <pointLight position={[60, DRIFT_Y + 3, -20]} intensity={0.25} color="#ff6020" distance={50} decay={2} />
    </group>
  )
}
