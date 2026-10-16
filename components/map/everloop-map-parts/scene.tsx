'use client'

import { OrbitControls, Stars, Html } from '@react-three/drei'
import * as THREE from 'three'
import { MAP_HALF_W, SURFACE_Y } from './constants'
import { StructureSurface } from './structure-layer'
import { SurfaceParticles, SurfaceShards, TheSurface } from './surface-layer'
import { TravelRoutes } from './travel-routes'

// Stable orbit target
const ORBIT_TARGET = new THREE.Vector3(0, 15, 0)

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

// ═══════════════════════════════════════════════════════════════
// SCENE
// ═══════════════════════════════════════════════════════════════
export function Scene({ showSubLayers }: { showSubLayers: boolean }) {
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
