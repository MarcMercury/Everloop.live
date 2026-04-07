'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Stars, Html, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { WORLD_LOCATIONS } from '@/lib/data/region-locations'

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
type RegionId = 'deyune' | 'virelay' | 'bellroot' | 'ashen' | 'glass' | 'varnhalt' | 'luminous' | 'drowned'

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
// LAYER 1 — THE DRIFT (Sea of Unformed Energy & Matter)
// Pure chaos — nothing retains form but holds intent.
// Mountains, ash, emotion — ever-changing dust, light, particles.
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// CUSTOM SHADER MATERIALS — Volumetric rendering for sublayers
// ═══════════════════════════════════════════════════════════════

/** Drift Nebula Shader — volumetric chaos clouds with turbulent noise */
const DriftNebulaVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const DriftNebulaFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  // Simplex-like noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  float fbm(vec3 p) {
    float f = 0.0;
    f += 0.5000 * snoise(p); p *= 2.01;
    f += 0.2500 * snoise(p); p *= 2.02;
    f += 0.1250 * snoise(p); p *= 2.03;
    f += 0.0625 * snoise(p);
    return f;
  }

  void main() {
    vec3 pos = vWorldPos * 0.008;
    float t = uTime * 0.08;

    // Multi-layered turbulent noise
    float n1 = fbm(pos + vec3(t * 0.3, -t * 0.2, t * 0.1));
    float n2 = fbm(pos * 1.5 + vec3(-t * 0.2, t * 0.15, -t * 0.25));
    float n3 = fbm(pos * 0.5 + vec3(t * 0.1, t * 0.1, -t * 0.3));

    // Color channels: deep purple, burning orange, cold blue, hot pink
    vec3 purple = vec3(0.35, 0.05, 0.55);
    vec3 orange = vec3(0.75, 0.25, 0.05);
    vec3 blue = vec3(0.05, 0.15, 0.55);
    vec3 pink = vec3(0.65, 0.1, 0.45);
    vec3 white = vec3(0.9, 0.85, 0.95);

    // Mix colors based on noise layers
    vec3 color = mix(purple, orange, smoothstep(-0.3, 0.3, n1));
    color = mix(color, blue, smoothstep(-0.2, 0.4, n2) * 0.6);
    color = mix(color, pink, smoothstep(0.1, 0.5, n3) * 0.4);

    // Intent flashes — rare bright bursts
    float flash = pow(max(0.0, snoise(pos * 3.0 + vec3(t * 2.0))), 6.0);
    color = mix(color, white, flash * 0.8);

    // Radial falloff from center
    float dist = length(vWorldPos.xz) / 160.0;
    float alpha = smoothstep(1.1, 0.3, dist) * uOpacity;

    // Depth-based density
    float depthFactor = smoothstep(-35.0, -10.0, vWorldPos.y);
    alpha *= mix(0.3, 1.0, depthFactor);

    // Add emissive glow
    color *= 1.0 + flash * 2.0;

    gl_FragColor = vec4(color, alpha * (0.4 + abs(n1) * 0.4));
  }
`

/** Fold Membrane Shader — reality boundary that shimmers between chaos and order */
const FoldMembraneVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const FoldMembraneFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    float dist = length(vWorldPos.xz);
    float t = uTime * 0.1;

    // Chaos-to-order gradient: chaotic outside (r>110), ordered inside
    float orderAmount = smoothstep(130.0, 70.0, dist);

    // Noise for chaos region
    vec3 pos = vWorldPos * 0.02;
    float chaos = snoise(pos + vec3(t, -t * 0.5, t * 0.3)) * (1.0 - orderAmount);

    // Grid pattern emerging for ordered region
    float gridX = abs(sin(vWorldPos.x * 0.2)) * orderAmount;
    float gridZ = abs(sin(vWorldPos.z * 0.2)) * orderAmount;
    float grid = max(gridX, gridZ) * 0.5;

    // Boundary shimmer at the transition zone (r ~ 110-120)
    float boundaryDist = abs(dist - 115.0);
    float boundary = smoothstep(15.0, 0.0, boundaryDist);
    float shimmer = boundary * (0.5 + 0.5 * sin(t * 3.0 + dist * 0.1));

    // Colors
    vec3 chaosColor = vec3(0.45, 0.15, 0.65); // purple-chaos
    vec3 orderColor = vec3(0.2, 0.4, 0.75);   // blue-structure
    vec3 boundaryColor = vec3(0.5, 0.3, 0.8);  // bright boundary
    vec3 gridColor = vec3(0.25, 0.5, 0.7);     // grid lines

    vec3 color = mix(chaosColor, orderColor, orderAmount);
    color += chaos * vec3(0.15, 0.05, 0.1);
    color = mix(color, gridColor, grid * orderAmount * 0.3);
    color = mix(color, boundaryColor, shimmer * 0.6);

    // Fresnel-like edge glow
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 1.0, 0.0))), 2.0);
    color += fresnel * vec3(0.3, 0.2, 0.5) * 0.3;

    // Radial alpha
    float alpha = smoothstep(155.0, 120.0, dist) * uOpacity;
    alpha = max(alpha, shimmer * 0.4 * uOpacity);
    alpha = max(alpha, grid * orderAmount * 0.2 * uOpacity);

    gl_FragColor = vec4(color, alpha);
  }
`

/** Pattern Lattice Shader — luminous sacred geometry web */
const PatternGlowVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const PatternGlowFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    float dist = length(vWorldPos.xz);
    float t = uTime;

    // Radial wave pulses from center
    float wave1 = sin(t * 1.2 - dist * 0.06) * 0.5 + 0.5;
    float wave2 = sin(t * 0.7 + dist * 0.04) * 0.5 + 0.5;

    // Grid pattern — sacred geometry
    float gridSize = 12.0;
    float lineWidth = 0.4;
    float gx = abs(mod(vWorldPos.x + gridSize * 0.5, gridSize) - gridSize * 0.5);
    float gz = abs(mod(vWorldPos.z + gridSize * 0.5, gridSize) - gridSize * 0.5);
    float gridLine = 1.0 - smoothstep(0.0, lineWidth, min(gx, gz));

    // Diagonal sacred geometry threads
    float dx = abs(mod(vWorldPos.x + vWorldPos.z + gridSize * 0.5, gridSize) - gridSize * 0.5);
    float dz = abs(mod(vWorldPos.x - vWorldPos.z + gridSize * 0.5, gridSize) - gridSize * 0.5);
    float diagLine = 1.0 - smoothstep(0.0, lineWidth * 0.6, min(dx, dz));

    // Hexagonal sacred geometry overlay
    float hexAngle = atan(vWorldPos.z, vWorldPos.x);
    float hexR = length(vWorldPos.xz);
    float hex = abs(sin(hexAngle * 3.0 + t * 0.2)) * smoothstep(30.0, 80.0, hexR);

    // Color: bright blue with wave-modulated intensity
    vec3 baseColor = vec3(0.2, 0.55, 1.0);
    vec3 brightColor = vec3(0.5, 0.8, 1.0);
    vec3 coreColor = vec3(0.7, 0.9, 1.0);

    float intensity = gridLine * 0.6 + diagLine * 0.2 + hex * 0.15;
    intensity *= (0.5 + wave1 * 0.3 + wave2 * 0.2);

    vec3 color = mix(baseColor, brightColor, intensity);
    color = mix(color, coreColor, pow(intensity, 2.0) * 0.5);

    // Radial falloff
    float alpha = smoothstep(115.0, 80.0, dist) * uOpacity;
    alpha *= intensity;

    // Emissive glow
    color *= 1.0 + intensity * 0.8;

    gl_FragColor = vec4(color, alpha);
  }
`

/** Primary chaos dust — thousands of swirling particles in turbulent motion */
function DriftChaosDust() {
  const pointsRef = useRef<THREE.Points>(null)
  const basePositions = useRef<Float32Array | null>(null)

  const { geo, mat } = useMemo(() => {
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
    basePositions.current = new Float32Array(positions)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    const m = new THREE.PointsMaterial({
      size: 0.35, vertexColors: true, transparent: true, opacity: 0.7,
      sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })
    return { geo: g, mat: m }
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current || !basePositions.current) return
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const col = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute
    const t = clock.elapsedTime
    // Turbulent displacement — each particle swirls chaotically
    for (let i = 0; i < pos.count; i++) {
      const bx = basePositions.current[i * 3]
      const by = basePositions.current[i * 3 + 1]
      const bz = basePositions.current[i * 3 + 2]
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

/** Ephemeral forms — shapes that rise, almost coalesce, then dissolve back into chaos */
function DriftEphemeralForms() {
  const groupRef = useRef<THREE.Group>(null)
  const formsData = useMemo(() => {
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
  }, [])

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

/** Energy wisps — bright streaks of intent that arc through the chaos */
function DriftEnergyWisps() {
  const groupRef = useRef<THREE.Group>(null)
  const wispsData = useMemo(() => {
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
  }, [])

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

/** Intent flashes — brief bright pulses that appear and vanish, showing latent will in chaos */
function DriftIntentFlashes() {
  const flashesRef = useRef<THREE.Group>(null)
  const flashData = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      x: (Math.random() - 0.5) * 280,
      y: DRIFT_Y + (Math.random() - 0.5) * 25,
      z: (Math.random() - 0.5) * 280,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 2,
      color: ['#ffffff', '#ff80ff', '#80ffff', '#ffff80', '#ff8060'][Math.floor(Math.random() * 5)],
    }))
  }, [])

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

/** Drift energy tendrils — long sinuous arcs of raw energy snaking through the chaos */
function DriftEnergyTendrils() {
  const groupRef = useRef<THREE.Group>(null)
  const tendrilData = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      startAngle: (i / 8) * Math.PI * 2 + Math.random() * 0.5,
      radius: 40 + Math.random() * 80,
      phase: Math.random() * Math.PI * 2,
      color: ['#8040ff', '#ff4060', '#4080ff', '#ff8020', '#c040ff', '#40c0ff', '#ff40c0', '#60ff80'][i],
      thickness: 0.3 + Math.random() * 0.5,
    }))
  }, [])

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

function TheDrift() {
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

/** Fold chaos-to-order particles — outside is chaotic, inside is structured */
function FoldTransitionParticles() {
  const pointsRef = useRef<THREE.Points>(null)
  const baseData = useRef<{ angle: number; r: number; baseY: number }[]>([])

  const { geo, mat } = useMemo(() => {
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
    baseData.current = data

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const m = new THREE.PointsMaterial({
      size: 0.2, vertexColors: true, transparent: true, opacity: 0.5,
      sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })
    return { geo: g, mat: m }
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const t = clock.elapsedTime
    for (let i = 0; i < pos.count; i++) {
      const d = baseData.current[i]
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

/** The Architects — tall angular figures standing at the boundary, beings of intent */
function FoldArchitects() {
  const groupRef = useRef<THREE.Group>(null)
  const architects = useMemo(() => {
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
  }, [])

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

/** Semi-stable geometric fragments — matter trying to hold form, flickering */
function FoldFormingFragments() {
  const groupRef = useRef<THREE.Group>(null)
  const fragments = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      angle: Math.random() * Math.PI * 2,
      r: 40 + Math.random() * 80,
      y: FOLD_Y + (Math.random() - 0.5) * 6,
      size: 0.3 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      type: Math.floor(Math.random() * 4),
    }))
  }, [])

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

/** Crystalline formation rings — where Drift substance crystallizes at the boundary */
function FoldCrystalRings() {
  const groupRef = useRef<THREE.Group>(null)
  const crystals = useMemo(() => {
    const data: { angle: number; r: number; height: number; width: number; phase: number }[] = []
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.15
      data.push({
        angle,
        r: 112 + Math.random() * 10,
        height: 1.5 + Math.random() * 4,
        width: 0.2 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      })
    }
    return data
  }, [])

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
          <mesh key={i} position={[x, FOLD_Y, z]} rotation={[0, c.angle, Math.random() * 0.3 - 0.15]}>
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

function TheFold() {
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

// ═══════════════════════════════════════════════════════════════
// LAYER 3 — THE PATTERN (Lattice of Intent & Purpose)
// Woven from the chaos of the Drift by the Architects,
// pinned to the Fold by great Anchors — the stable foundation
// from which the Everloop springs.
// ═══════════════════════════════════════════════════════════════

/** Primary lattice — intricate web of glowing threads with flowing energy */
function PatternLattice() {
  const latticeRef = useRef<THREE.Group>(null)

  const latticeObj = useMemo(() => {
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
  }, [])

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

/** Energy flow particles — visible streams moving upward through the Pattern toward the surface */
function PatternEnergyFlow() {
  const pointsRef = useRef<THREE.Points>(null)
  const flowData = useRef<{ x: number; z: number; speed: number; phase: number }[]>([])

  const { geo, mat } = useMemo(() => {
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
    flowData.current = data
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const m = new THREE.PointsMaterial({
      size: 0.15, vertexColors: true, transparent: true, opacity: 0.5,
      sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })
    return { geo: g, mat: m }
  }, [])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const t = clock.elapsedTime
    const range = SURFACE_Y - PATTERN_Y
    for (let i = 0; i < pos.count; i++) {
      const d = flowData.current[i]
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

/** Weaving threads — visible strands being pulled from below (Fold) upward into the lattice */
function PatternWeavingThreads() {
  const groupRef = useRef<THREE.Group>(null)
  const threads = useMemo(() => {
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
  }, [])

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

/** Pattern luminous pillars — vertical columns of light at key intersections */
function PatternLightPillars() {
  const groupRef = useRef<THREE.Group>(null)
  const pillars = useMemo(() => {
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
  }, [])

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

function ThePattern() {
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
    return new THREE.PlaneGeometry(MAP_WIDTH, MAP_HEIGHT)
  }, [])

  return (
    <group position={[0, SURFACE_Y, 0]}>
      {/* Main map surface with painted texture */}
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <meshStandardMaterial
          map={texture}
          roughness={0.75}
          metalness={0.02}
          side={THREE.DoubleSide}
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
  const labels = showSubLayers
    ? [{ y: 15, text: 'THE STRUCTURE', sub: 'Beneath the Surface — Bone of the World', color: '#d4a060', always: true }]
    : [{ y: SURFACE_Y + 15, text: 'THE EVERLOOP', sub: 'The Living World', color: '#d4a84b', always: true }]

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

// Stable orbit target
const ORBIT_TARGET = new THREE.Vector3(0, 15, 0)

// ═══════════════════════════════════════════════════════════════
// STRUCTURE TERRAIN — 3D terrain from "New Structure Map.png"
// A detailed displacement-mapped landscape sitting between
// Pattern and Surface layers, showing the world's bone structure.
// ═══════════════════════════════════════════════════════════════

/** Vertex shader that displaces a flat plane based on a heightmap texture */
const TerrainVertexShader = `
  uniform sampler2D uHeightMap;
  uniform float uDisplacement;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vHeight;
  varying vec3 vNormal;

  void main() {
    vUv = uv;

    // Sample heightmap for displacement
    vec4 heightData = texture2D(uHeightMap, uv);
    // Use luminance as height
    float h = dot(heightData.rgb, vec3(0.299, 0.587, 0.114));
    vHeight = h;

    // Displace vertex along normal (Y axis for a flat plane)
    vec3 displaced = position;
    displaced.z += h * uDisplacement;

    // Subtle animation — gentle breathing of the terrain
    displaced.z += sin(position.x * 0.02 + uTime * 0.3) * 0.15;
    displaced.z += cos(position.y * 0.025 + uTime * 0.2) * 0.1;

    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vWorldPos = worldPos.xyz;

    // Approximate normal from neighbors
    float eps = 0.005;
    float hL = dot(texture2D(uHeightMap, uv - vec2(eps, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
    float hR = dot(texture2D(uHeightMap, uv + vec2(eps, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
    float hD = dot(texture2D(uHeightMap, uv - vec2(0.0, eps)).rgb, vec3(0.299, 0.587, 0.114));
    float hU = dot(texture2D(uHeightMap, uv + vec2(0.0, eps)).rgb, vec3(0.299, 0.587, 0.114));
    vec3 n = normalize(vec3(hL - hR, hD - hU, 2.0 / max(uDisplacement * 0.1, 0.01)));
    vNormal = normalize(normalMatrix * n);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

/** Fragment shader — paints the terrain with the structure map texture + realistic lighting */
const TerrainFragmentShader = `
  uniform sampler2D uColorMap;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vHeight;
  varying vec3 vNormal;

  void main() {
    // Sample the structure map as color — render it faithfully
    vec4 texColor = texture2D(uColorMap, vUv);

    // Gentle directional lighting — preserve original map colors
    vec3 lightDir1 = normalize(vec3(0.4, 0.8, 0.3));
    vec3 lightDir2 = normalize(vec3(-0.3, 0.6, -0.4));
    float diff1 = max(dot(vNormal, lightDir1), 0.0);
    float diff2 = max(dot(vNormal, lightDir2), 0.0);
    float ambient = 0.75;
    float lighting = ambient + diff1 * 0.18 + diff2 * 0.07;

    // Very subtle shadow in valleys
    float ao = smoothstep(0.0, 0.3, vHeight) * 0.15 + 0.85;
    lighting *= ao;

    // Apply gentle lighting to texture color — keep colors faithful
    vec3 color = texColor.rgb * lighting;

    // Barely perceptible warm highlight on peaks
    color += vec3(0.03, 0.02, 0.01) * smoothstep(0.6, 0.9, vHeight);

    // Gentle depth fog at edges
    float edgeDist = length(vWorldPos.xz) / 140.0;
    float edgeFade = smoothstep(1.0, 0.8, edgeDist);
    vec3 fogColor = vec3(0.03, 0.02, 0.05);
    color = mix(fogColor, color, edgeFade);

    gl_FragColor = vec4(color, uOpacity);
  }
`

function StructureTerrain() {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  // Load the New Structure Map as both color and displacement
  const structureTexture = useTexture('/Maps/New Structure Map.png')
  structureTexture.colorSpace = THREE.SRGBColorSpace
  structureTexture.wrapS = THREE.ClampToEdgeWrapping
  structureTexture.wrapT = THREE.ClampToEdgeWrapping
  structureTexture.minFilter = THREE.LinearMipmapLinearFilter
  structureTexture.magFilter = THREE.LinearFilter
  structureTexture.anisotropy = 16

  const uniforms = useMemo(() => ({
    uHeightMap: { value: structureTexture },
    uColorMap: { value: structureTexture },
    uDisplacement: { value: 3.0 },
    uTime: { value: 0 },
    uOpacity: { value: 1.0 },
  }), [structureTexture])

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Main structure terrain — displacement-mapped plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT, 512, 512]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={TerrainVertexShader}
          fragmentShader={TerrainFragmentShader}
          uniforms={uniforms}
          transparent={false}
          side={THREE.FrontSide}
          depthWrite={true}
        />
      </mesh>

      {/* Dark base beneath the terrain */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[MAP_WIDTH + 20, MAP_HEIGHT + 20]} />
        <meshStandardMaterial
          color="#080612"
          roughness={0.95}
          metalness={0.05}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Edge frame — dark border */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[MAP_WIDTH + 4, 3, MAP_HEIGHT + 4]} />
        <meshStandardMaterial color="#1a1418" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Terrain lighting */}
      <pointLight position={[0, 30, 0]} intensity={0.5} color="#e0d8c0" distance={200} decay={2} />
      <pointLight position={[80, 20, -50]} intensity={0.4} color="#d4a84b" distance={150} decay={2} />
      <pointLight position={[-80, 20, 50]} intensity={0.4} color="#8090b0" distance={150} decay={2} />
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
// STRUCTURE SURFACE — Flat 2D view of the Structure Map
// ═══════════════════════════════════════════════════════════════
function StructureSurface() {
  const texture = useTexture('/Maps/New Structure Map.png')
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = 16

  return (
    <group position={[0, SURFACE_Y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[MAP_WIDTH, MAP_HEIGHT]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.75}
          metalness={0.02}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════
// SCENE
// ═══════════════════════════════════════════════════════════════
function Scene({ showSubLayers }: { showSubLayers: boolean }) {
  return (
    <>
      {/* Warm lighting to match the parchment / painterly aesthetic */}
      <ambientLight intensity={showSubLayers ? 0.8 : 0.7} color="#f0e8d0" />
      <directionalLight
        position={[100, 120, 60]} intensity={showSubLayers ? 1.2 : 1.2} color="#fff8e8" castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-far={400}
        shadow-camera-left={-160} shadow-camera-right={160}
        shadow-camera-top={160} shadow-camera-bottom={-160}
      />
      <directionalLight position={[-80, 100, -50]} intensity={0.25} color="#c0c8e0" />
      <hemisphereLight args={['#e0d8c0', '#1a1a30', showSubLayers ? 0.5 : 0.35]} />

      <Stars radius={400} depth={200} count={8000} factor={6} saturation={0.3} fade speed={0.3} />

      {showSubLayers ? (
        /* Sub-layer view — flat 2D Structure Map */
        <group>
          <StructureSurface />
        </group>
      ) : (
        /* Normal surface view — 2D textured map with overlays */
        <group>
          <TheSurface />
          <SurfaceShards />
          <TravelRoutes />
          <SurfaceParticles />
        </group>
      )}

      {/* Labels */}
      <LayerLabels showSubLayers={showSubLayers} />

      {/* Camera controls */}
      <OrbitControls
        makeDefault enableDamping dampingFactor={0.05}
        minDistance={15} maxDistance={400}
        target={showSubLayers ? new THREE.Vector3(0, 5, 0) : ORBIT_TARGET}
        enablePan
      />

      <fog attach="fog" args={['#080810', 400, 700]} />
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
            ...(showSubLayers
              ? [{ color: '#d4a060', label: 'The Structure', sub: 'Bone of the World' }]
              : [{ color: '#d4a84b', label: 'The Everloop', sub: 'The Living World' }]
            ),
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
            Scroll to zoom · Drag to orbit
          </p>
        </div>

        {/* Region links */}
        <div className="mt-2 pt-2 border-t border-gold/10">
          <h4 className="text-xs font-serif text-parchment mb-1.5 uppercase tracking-wider">Regions</h4>
          <div className="space-y-1">
            {WORLD_LOCATIONS.map((r) => (
              <a
                key={r.id}
                href={`/map/${r.id}`}
                className="flex items-center gap-1.5 px-1 py-0.5 rounded transition-colors hover:bg-white/5"
              >
                <span className="text-[10px]">{r.emoji}</span>
                <span className="text-[11px] font-serif" style={{ color: r.color }}>{r.name}</span>
              </a>
            ))}
          </div>
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
        camera={{ position: showSubLayers ? [0, 80, 120] : [0, 120, 140], fov: 40, near: 0.1, far: 1000 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        style={{ background: '#030308' }}
      >
        <Scene showSubLayers={showSubLayers} />
      </Canvas>
      <MapLegend showSubLayers={showSubLayers} onToggleLayers={handleToggleLayers} />
    </div>
  )
}
