'use client'

import { Suspense, useRef, Component, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei'
import * as THREE from 'three'
import { Loader2, AlertTriangle } from 'lucide-react'

// ═══════════════════════════════════════════════════════════
// Error Boundary for catching GLB load failures
// ═══════════════════════════════════════════════════════════

interface ErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ModelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

function ErrorFallback({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-charcoal/50 rounded-lg border border-red-500/20">
      <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
      <p className="text-sm text-red-400 font-medium">Failed to load 3D model</p>
      {message && (
        <p className="text-xs text-parchment-muted mt-1 max-w-[240px] text-center">{message}</p>
      )}
    </div>
  )
}

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
      <ModelErrorBoundary fallback={<ErrorFallback message={`Could not load: ${modelUrl.split('/').pop()}`} />}>
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
      </ModelErrorBoundary>
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
