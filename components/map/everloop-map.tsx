'use client'

import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Scene } from './everloop-map-parts/scene'
import { MapLegend } from './everloop-map-parts/map-legend'

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// Layer components, shaders, and data live in ./everloop-map-parts/
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
