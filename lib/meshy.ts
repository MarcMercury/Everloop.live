// ═══════════════════════════════════════════════════════════
// Meshy AI 3D Generation - Server-side API Client
// Base URL: https://api.meshy.ai
// ═══════════════════════════════════════════════════════════

import type {
  TextTo3DPreviewRequest,
  TextTo3DRefineRequest,
  ImageTo3DRequest,
  MultiImageTo3DRequest,
  RetextureRequest,
  MeshyTask,
  MeshyTextTo3DTask,
  MeshyImageTo3DTask,
  MeshyMultiImageTo3DTask,
  MeshyRetextureTask,
} from '@/types/meshy'

const API_BASE = 'https://api.meshy.ai/openapi'

function getApiKey(): string {
  const key = process.env.MESHY_API_KEY
  if (!key) {
    throw new Error('MESHY_API_KEY environment variable is not set')
  }
  return key
}

async function meshyFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Meshy API error (${res.status}): ${text}`)
  }

  return res.json()
}

// ─── Text to 3D ─────────────────────────────────────────

export async function createTextTo3DPreview(
  input: TextTo3DPreviewRequest
): Promise<string> {
  const data = await meshyFetch<{ result: string }>('/v2/text-to-3d', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.result
}

export async function createTextTo3DRefine(
  input: TextTo3DRefineRequest
): Promise<string> {
  const data = await meshyFetch<{ result: string }>('/v2/text-to-3d', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.result
}

export async function getTextTo3DTask(
  taskId: string
): Promise<MeshyTextTo3DTask> {
  return meshyFetch<MeshyTextTo3DTask>(`/v2/text-to-3d/${encodeURIComponent(taskId)}`)
}

// ─── Image to 3D ────────────────────────────────────────

export async function createImageTo3D(
  input: ImageTo3DRequest
): Promise<string> {
  const data = await meshyFetch<{ result: string }>('/v1/image-to-3d', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.result
}

export async function getImageTo3DTask(
  taskId: string
): Promise<MeshyImageTo3DTask> {
  return meshyFetch<MeshyImageTo3DTask>(`/v1/image-to-3d/${encodeURIComponent(taskId)}`)
}

// ─── Multi-Image to 3D ─────────────────────────────────

export async function createMultiImageTo3D(
  input: MultiImageTo3DRequest
): Promise<string> {
  const data = await meshyFetch<{ result: string }>(
    '/v1/multi-image-to-3d',
    { method: 'POST', body: JSON.stringify(input) }
  )
  return data.result
}

export async function getMultiImageTo3DTask(
  taskId: string
): Promise<MeshyMultiImageTo3DTask> {
  return meshyFetch<MeshyMultiImageTo3DTask>(
    `/v1/multi-image-to-3d/${encodeURIComponent(taskId)}`
  )
}

// ─── Retexture ──────────────────────────────────────────

export async function createRetexture(
  input: RetextureRequest
): Promise<string> {
  const data = await meshyFetch<{ result: string }>('/v1/retexture', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.result
}

export async function getRetextureTask(
  taskId: string
): Promise<MeshyRetextureTask> {
  return meshyFetch<MeshyRetextureTask>(`/v1/retexture/${encodeURIComponent(taskId)}`)
}

// ─── Generic task status (routing by type) ──────────────

export type MeshyTaskType =
  | 'text-to-3d'
  | 'image-to-3d'
  | 'multi-image-to-3d'
  | 'retexture'

export async function getMeshyTask(
  taskId: string,
  taskType: MeshyTaskType
): Promise<MeshyTask> {
  switch (taskType) {
    case 'text-to-3d':
      return getTextTo3DTask(taskId)
    case 'image-to-3d':
      return getImageTo3DTask(taskId)
    case 'multi-image-to-3d':
      return getMultiImageTo3DTask(taskId)
    case 'retexture':
      return getRetextureTask(taskId)
  }
}
