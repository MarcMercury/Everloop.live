import * as THREE from 'three'
import { assetUrl } from '@/lib/assets'

// Texture configuration callbacks for drei's `useTexture(url, onLoad)`.
// drei runs `onLoad` in a layout effect before uploading the texture to the GPU,
// so sampling settings are applied without mutating the hook's return value during render.
// They are module-level so the callback identity is stable across renders.

export const MAP_BASE_TEXTURE_URL = assetUrl('/everloop-map-base.png')
export const STRUCTURE_MAP_TEXTURE_URL = assetUrl('/Maps/New Structure Map.png')

function applyHighQualitySampling(texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = 16
}

/** Painted surface map texture */
export function configureSurfaceTexture(texture: THREE.Texture) {
  applyHighQualitySampling(texture)
  texture.needsUpdate = true
}

/** Structure map rendered as a flat textured plane */
export function configureStructureSurfaceTexture(texture: THREE.Texture) {
  applyHighQualitySampling(texture)
}

/** Structure map used as both color and height map for the displaced terrain */
export function configureStructureTerrainTexture(texture: THREE.Texture) {
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.anisotropy = 16
}
