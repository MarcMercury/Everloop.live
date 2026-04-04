'use client'

import { useState } from 'react'

type Layer = 'drift' | 'fold' | 'pattern'
type GenerationMode = 'texture' | 'text-to-3d' | 'image-to-3d'

interface TaskStatus {
  status: string
  progress: number
  model_urls?: { glb?: string }
  thumbnail_url?: string
  task_error?: { message: string }
}

const LAYER_CONFIG: Record<Layer, { label: string; color: string; description: string }> = {
  drift: {
    label: 'The Drift',
    color: '#8040c0',
    description: 'Sea of Unformed Chaos — primordial nebula clouds',
  },
  fold: {
    label: 'The Fold',
    color: '#6080b0',
    description: 'Where the Architects Weave — chaos-to-order boundary',
  },
  pattern: {
    label: 'The Pattern',
    color: '#40a0ff',
    description: 'Lattice of Intent & Purpose — sacred geometry web',
  },
}

export default function SublayerGeneratePanel() {
  const [selectedLayer, setSelectedLayer] = useState<Layer>('drift')
  const [mode, setMode] = useState<GenerationMode>('texture')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    imageUrl?: string
    taskId?: string
    revisedPrompt?: string
    glbUrl?: string
    thumbnailUrl?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [taskPolling, setTaskPolling] = useState(false)

  async function generateTexture() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/map/sublayer-textures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layer: selectedLayer }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      setResult({
        imageUrl: data.imageUrl,
        revisedPrompt: data.revisedPrompt,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function generate3D() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const body: Record<string, string> = { layer: selectedLayer }

      if (mode === 'text-to-3d') {
        body.mode = 'text-to-3d'
      } else if (mode === 'image-to-3d' && result?.imageUrl) {
        body.mode = 'image-to-3d'
        body.imageUrl = result.imageUrl
      }

      const res = await fetch('/api/map/sublayer-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '3D generation failed')

      setResult((prev) => ({ ...prev, taskId: data.taskId }))
      pollTaskStatus(data.taskId, body.mode === 'image-to-3d' ? 'image-to-3d' : 'text-to-3d')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }

  async function pollTaskStatus(taskId: string, taskType: string) {
    setTaskPolling(true)
    const maxAttempts = 60 // 5 minutes max

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 5000))

      try {
        const res = await fetch('/api/map/sublayer-3d', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            layer: selectedLayer,
            mode: 'status',
            taskId,
            taskType,
          }),
        })

        const data: TaskStatus & { layer: string } = await res.json()

        if (data.status === 'SUCCEEDED') {
          setResult((prev) => ({
            ...prev,
            glbUrl: data.model_urls?.glb,
            thumbnailUrl: data.thumbnail_url,
          }))
          setTaskPolling(false)
          setLoading(false)
          return
        }

        if (data.status === 'FAILED') {
          setError(data.task_error?.message || '3D generation failed')
          setTaskPolling(false)
          setLoading(false)
          return
        }

        // Still in progress — update progress
        setResult((prev) => ({ ...prev }))
      } catch {
        // Network error — keep polling
      }
    }

    setError('Generation timed out')
    setTaskPolling(false)
    setLoading(false)
  }

  const config = LAYER_CONFIG[selectedLayer]

  return (
    <div className="rounded-lg p-4 backdrop-blur-xl border border-gold/20" style={{ background: 'rgba(5, 10, 15, 0.95)' }}>
      <h3 className="text-sm font-serif text-parchment uppercase tracking-wider mb-3">
        Sublayer Visual Generator
      </h3>

      {/* Layer Selection */}
      <div className="space-y-2 mb-4">
        <label className="text-xs text-parchment-muted">Select Layer</label>
        <div className="flex gap-2">
          {(Object.keys(LAYER_CONFIG) as Layer[]).map((layer) => (
            <button
              key={layer}
              onClick={() => setSelectedLayer(layer)}
              className="flex-1 px-2 py-1.5 rounded text-[10px] font-medium transition-all border"
              style={{
                background: selectedLayer === layer ? `${LAYER_CONFIG[layer].color}25` : 'transparent',
                borderColor: selectedLayer === layer ? `${LAYER_CONFIG[layer].color}60` : 'rgba(212, 168, 75, 0.15)',
                color: selectedLayer === layer ? LAYER_CONFIG[layer].color : '#888',
              }}
            >
              {LAYER_CONFIG[layer].label}
            </button>
          ))}
        </div>
        <p className="text-[9px] italic" style={{ color: config.color }}>{config.description}</p>
      </div>

      {/* Generation Mode */}
      <div className="space-y-2 mb-4">
        <label className="text-xs text-parchment-muted">Generation Mode</label>
        <div className="flex gap-2">
          {[
            { id: 'texture' as const, label: 'DALL-E Texture' },
            { id: 'text-to-3d' as const, label: 'Meshy Text→3D' },
            { id: 'image-to-3d' as const, label: 'Meshy Image→3D' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className="flex-1 px-2 py-1.5 rounded text-[10px] font-medium transition-all border"
              style={{
                background: mode === m.id ? 'rgba(64, 160, 255, 0.15)' : 'transparent',
                borderColor: mode === m.id ? 'rgba(64, 160, 255, 0.3)' : 'rgba(212, 168, 75, 0.15)',
                color: mode === m.id ? '#40a0ff' : '#888',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={mode === 'texture' ? generateTexture : generate3D}
        disabled={loading || (mode === 'image-to-3d' && !result?.imageUrl)}
        className="w-full px-3 py-2 rounded text-xs font-medium transition-all border disabled:opacity-40"
        style={{
          background: `${config.color}20`,
          borderColor: `${config.color}40`,
          color: config.color,
        }}
      >
        {loading
          ? taskPolling
            ? 'Generating 3D Model...'
            : 'Generating...'
          : mode === 'texture'
            ? `Generate ${config.label} Texture`
            : mode === 'text-to-3d'
              ? `Generate ${config.label} 3D Model`
              : `Convert Texture to 3D`}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-2 p-2 rounded bg-red-900/20 border border-red-500/30">
          <p className="text-[10px] text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {result?.imageUrl && (
        <div className="mt-3 space-y-2">
          <p className="text-[10px] text-parchment-muted">Generated Texture:</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.imageUrl}
            alt={`${config.label} texture`}
            className="w-full rounded border border-gold/20"
          />
          {result.revisedPrompt && (
            <p className="text-[9px] text-parchment-muted italic leading-tight">
              {result.revisedPrompt}
            </p>
          )}
          {mode !== 'image-to-3d' && result.imageUrl && (
            <button
              onClick={() => { setMode('image-to-3d'); }}
              className="w-full px-2 py-1.5 rounded text-[10px] font-medium transition-all border"
              style={{
                background: 'rgba(64, 160, 255, 0.1)',
                borderColor: 'rgba(64, 160, 255, 0.2)',
                color: '#40a0ff',
              }}
            >
              Convert this texture to 3D →
            </button>
          )}
        </div>
      )}

      {result?.glbUrl && (
        <div className="mt-3 space-y-2">
          <p className="text-[10px] text-parchment-muted">3D Model Ready:</p>
          {result.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.thumbnailUrl}
              alt={`${config.label} 3D preview`}
              className="w-full rounded border border-gold/20"
            />
          )}
          <a
            href={result.glbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-2 py-1.5 rounded text-[10px] font-medium transition-all border"
            style={{
              background: 'rgba(64, 255, 128, 0.1)',
              borderColor: 'rgba(64, 255, 128, 0.2)',
              color: '#40ff80',
            }}
          >
            Download GLB Model
          </a>
        </div>
      )}
    </div>
  )
}
