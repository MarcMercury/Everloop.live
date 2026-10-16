'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { MAP_HEIGHT, MAP_WIDTH, SURFACE_Y } from './constants'
import {
  STRUCTURE_MAP_TEXTURE_URL,
  configureStructureSurfaceTexture,
  configureStructureTerrainTexture,
} from './textures'

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

export function StructureTerrain() {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  // Load the New Structure Map as both color and displacement
  const structureTexture = useTexture(STRUCTURE_MAP_TEXTURE_URL, configureStructureTerrainTexture)

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
export function StructureSurface() {
  const texture = useTexture(STRUCTURE_MAP_TEXTURE_URL, configureStructureSurfaceTexture)

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
