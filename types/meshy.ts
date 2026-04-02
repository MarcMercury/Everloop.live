// ═══════════════════════════════════════════════════════════
// Meshy AI 3D Generation Types
// Covers: Text-to-3D, Image-to-3D, Multi-Image-to-3D, Retexture
// ═══════════════════════════════════════════════════════════

export type MeshyTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'CANCELED'

export type MeshyAiModel = 'meshy-5' | 'meshy-6' | 'latest'

export type MeshyTopology = 'quad' | 'triangle'

export type MeshySymmetryMode = 'off' | 'auto' | 'on'

export type MeshyPoseMode = 'a-pose' | 't-pose' | ''

export type MeshyModelType = 'standard' | 'lowpoly'

export type MeshyTargetFormat = 'glb' | 'obj' | 'fbx' | 'stl' | 'usdz'

// ─── Model URLs ─────────────────────────────────────────
export interface MeshyModelUrls {
  glb?: string
  fbx?: string
  obj?: string
  usdz?: string
  mtl?: string
  stl?: string
  pre_remeshed_glb?: string
}

export interface MeshyTextureUrl {
  base_color: string
  metallic?: string
  normal?: string
  roughness?: string
}

// ─── Task Object (shared across all task types) ─────────
export interface MeshyTaskBase {
  id: string
  model_urls: MeshyModelUrls
  thumbnail_url: string
  progress: number
  started_at: number
  created_at: number
  expires_at?: number
  finished_at: number
  status: MeshyTaskStatus
  texture_urls: MeshyTextureUrl[]
  preceding_tasks: number
  task_error: { message: string }
}

export interface MeshyTextTo3DTask extends MeshyTaskBase {
  type: 'text-to-3d-preview' | 'text-to-3d-refine'
  prompt: string
  art_style?: string
  texture_prompt?: string
  texture_image_url?: string
}

export interface MeshyImageTo3DTask extends MeshyTaskBase {
  type: 'image-to-3d'
  texture_prompt?: string
  texture_image_url?: string
}

export interface MeshyMultiImageTo3DTask extends MeshyTaskBase {
  type: 'multi-image-to-3d'
  texture_prompt?: string
}

export interface MeshyRetextureTask extends MeshyTaskBase {
  type: 'retexture'
  text_style_prompt?: string
  image_style_url?: string
}

export type MeshyTask =
  | MeshyTextTo3DTask
  | MeshyImageTo3DTask
  | MeshyMultiImageTo3DTask
  | MeshyRetextureTask

// ─── Request Bodies ─────────────────────────────────────

export interface TextTo3DPreviewRequest {
  mode: 'preview'
  prompt: string
  model_type?: MeshyModelType
  ai_model?: MeshyAiModel
  topology?: MeshyTopology
  target_polycount?: number
  should_remesh?: boolean
  symmetry_mode?: MeshySymmetryMode
  pose_mode?: MeshyPoseMode
  moderation?: boolean
  target_formats?: MeshyTargetFormat[]
  auto_size?: boolean
  origin_at?: 'bottom' | 'center'
}

export interface TextTo3DRefineRequest {
  mode: 'refine'
  preview_task_id: string
  enable_pbr?: boolean
  texture_prompt?: string
  texture_image_url?: string
  ai_model?: MeshyAiModel
  moderation?: boolean
  remove_lighting?: boolean
  target_formats?: MeshyTargetFormat[]
  auto_size?: boolean
  origin_at?: 'bottom' | 'center'
}

export interface ImageTo3DRequest {
  image_url: string
  model_type?: MeshyModelType
  ai_model?: MeshyAiModel
  topology?: MeshyTopology
  target_polycount?: number
  symmetry_mode?: MeshySymmetryMode
  should_remesh?: boolean
  save_pre_remeshed_model?: boolean
  should_texture?: boolean
  enable_pbr?: boolean
  pose_mode?: MeshyPoseMode
  texture_prompt?: string
  texture_image_url?: string
  moderation?: boolean
  image_enhancement?: boolean
  remove_lighting?: boolean
  target_formats?: MeshyTargetFormat[]
  auto_size?: boolean
  origin_at?: 'bottom' | 'center'
}

export interface MultiImageTo3DRequest {
  image_urls: string[]
  ai_model?: MeshyAiModel
  topology?: MeshyTopology
  target_polycount?: number
  symmetry_mode?: MeshySymmetryMode
  should_remesh?: boolean
  save_pre_remeshed_model?: boolean
  should_texture?: boolean
  enable_pbr?: boolean
  pose_mode?: MeshyPoseMode
  texture_prompt?: string
  texture_image_url?: string
  moderation?: boolean
  image_enhancement?: boolean
  remove_lighting?: boolean
  target_formats?: MeshyTargetFormat[]
  auto_size?: boolean
  origin_at?: 'bottom' | 'center'
}

export interface RetextureRequest {
  input_task_id?: string
  model_url?: string
  text_style_prompt?: string
  image_style_url?: string
  ai_model?: MeshyAiModel
  enable_original_uv?: boolean
  enable_pbr?: boolean
  remove_lighting?: boolean
  target_formats?: MeshyTargetFormat[]
}

// ─── Client-side types for UI components ────────────────

export type Generate3DMode = 'text-to-3d' | 'image-to-3d' | 'retexture'

export interface Generate3DState {
  taskId: string | null
  status: MeshyTaskStatus | 'idle'
  progress: number
  modelUrl: string | null
  thumbnailUrl: string | null
  error: string | null
}
