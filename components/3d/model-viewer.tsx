'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei'
import * as THREE from 'three'
import { Loader2 } from 'lucide-react'

// ═══════════════════════════════════════════════════════════
// GLB Model Component — loads and renders a GLB file
// ═══════════════════════════════════════════════════════════

function Model({ url, autoRotate }: { url: string; autoRotate: boolean }) {
  const { scene } = useGLTF(url)
  const ref = useRef<THREE.Group>(null)

  // Auto-center and scale the model to fit within a unit sphere
  const box = new THREE.Box3().setFromObject(scene)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = maxDim > 0 ? 2 / maxDim : 1
  const center = box.getCenter(new THREE.Vector3())

  useFrame((_, delta) => {
    if (autoRotate && ref.current) {
      ref.current.rotation.y += delta * 0.4
    }
  })

  return (
    <group ref={ref}>
      <primitive
        object={scene}
        scale={[scale, scale, scale]}
        position={[-center.x * scale, -center.y * scale, -center.z * scale]}
      />
    </group>
  )
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <p className="text-xs text-parchment-muted">Loading 3D model...</p>
      </div>
    </Html>
  )
}

// ═══════════════════════════════════════════════════════════
// ModelViewer — full canvas component
// ═══════════════════════════════════════════════════════════

interface ModelViewerProps {
  modelUrl: string
  className?: string
  autoRotate?: boolean
  showControls?: boolean
  backgroundColor?: string
}

export function ModelViewer({
  modelUrl,
  className = '',
  autoRotate = true,
  showControls = true,
  backgroundColor = 'transparent',
}: ModelViewerProps) {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 1.5, 3.5], fov: 45 }}
        style={{ background: backgroundColor }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.4} />

        <Suspense fallback={<LoadingFallback />}>
          <Model url={modelUrl} autoRotate={autoRotate} />
          <Environment preset="city" />
          <ContactShadows
            position={[0, -1.05, 0]}
            opacity={0.4}
            scale={5}
            blur={2.5}
          />
        </Suspense>

        {showControls && (
          <OrbitControls
            enablePan={false}
            minDistance={1.5}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.8}
          />
        )}
      </Canvas>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// ModelViewerCompact — smaller inline viewer for cards
// ═══════════════════════════════════════════════════════════

interface ModelViewerCompactProps {
  modelUrl: string
  className?: string
}

export function ModelViewerCompact({
  modelUrl,
  className = 'w-full aspect-square',
}: ModelViewerCompactProps) {
  return (
    <ModelViewer
      modelUrl={modelUrl}
      className={className}
      autoRotate={true}
      showControls={false}
    />
  )
}
