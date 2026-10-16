'use client'

import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { SURFACE_Y, getSurfaceHeight, type RegionId } from './constants'

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

export function TravelRoutes() {
  return (
    <group>
      {TRAVEL_ROUTES.map((route, i) => (
        <TravelRouteLine key={i} route={route} />
      ))}
    </group>
  )
}
