'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// Displacement vertex shader — uses depth map for height
const TerrainVertex = `
  uniform sampler2D uDepthMap;
  uniform float uDisplacement;
  varying vec2 vUv;
  varying float vHeight;
  varying vec3 vNormal;

  void main() {
    vUv = uv;

    // Sample depth map for elevation
    vec4 depth = texture2D(uDepthMap, uv);
    float h = dot(depth.rgb, vec3(0.299, 0.587, 0.114));
    vHeight = h;

    // Displace along Y (up)
    vec3 pos = position;
    pos.z += h * uDisplacement;

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

// Fragment shader — renders the color texture with subtle lighting
const TerrainFragment = `
  uniform sampler2D uColorMap;
  varying vec2 vUv;
  varying float vHeight;
  varying vec3 vNormal;

  void main() {
    vec4 texColor = texture2D(uColorMap, vUv);

    // Soft directional light
    vec3 lightDir = normalize(vec3(0.3, 0.8, 0.4));
    float diff = max(dot(vNormal, lightDir), 0.0);
    float lighting = 0.7 + diff * 0.3;

    vec3 color = texColor.rgb * lighting;
    gl_FragColor = vec4(color, 1.0);
  }
`

function Terrain() {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  // Load both textures
  const [colorMap, depthMap] = useTexture([
    '/everloop-map-base.png',
    '/Maps/depth-map.png',
  ])

  // Configure textures
  colorMap.colorSpace = THREE.SRGBColorSpace
  colorMap.minFilter = THREE.LinearMipmapLinearFilter
  colorMap.magFilter = THREE.LinearFilter
  colorMap.anisotropy = 16

  depthMap.minFilter = THREE.LinearMipmapLinearFilter
  depthMap.magFilter = THREE.LinearFilter

  const uniforms = useMemo(() => ({
    uColorMap: { value: colorMap },
    uDepthMap: { value: depthMap },
    uDisplacement: { value: 12.0 },
  }), [colorMap, depthMap])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[150, 100, 512, 512]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={TerrainVertex}
        fragmentShader={TerrainFragment}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} color="#f0e8d0" />
      <directionalLight position={[50, 80, 30]} intensity={1.0} color="#fff8e8" />
      <directionalLight position={[-40, 60, -20]} intensity={0.3} color="#c0c8e0" />

      <Terrain />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={30}
        maxDistance={250}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
      />
    </>
  )
}

export default function EverloopMap3D() {
  return (
    <Canvas
      camera={{ position: [0, 80, 100], fov: 45, near: 0.1, far: 500 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      style={{ background: '#0a0a12' }}
    >
      <Scene />
    </Canvas>
  )
}
