'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Box, RefreshCw } from 'lucide-react'
import type { Generate3DMode, MeshyTaskStatus } from '@/types/meshy'

const POLL_INTERVAL_MS = 5000

interface Generate3DButtonProps {
  /** 'text-to-3d' sends prompt, 'image-to-3d' sends image URL */
  mode: Generate3DMode
  /** For text-to-3d: the text prompt. For image-to-3d: the image URL. */
  input: string
  /** Additional options to pass to the API. */
  options?: Record<string, unknown>
  /** Called when 3D model is ready with GLB URL + thumbnail */
  onComplete: (modelUrl: string, thumbnailUrl: string) => void
  /** Called on error */
  onError?: (error: string) => void
  /** Size variant */
  size?: 'sm' | 'default'
  /** Label override */
  label?: string
  /** Disabled state */
  disabled?: boolean
  className?: string
}

export function Generate3DButton({
  mode,
  input,
  options,
  onComplete,
  onError,
  size = 'sm',
  label,
  disabled = false,
  className,
}: Generate3DButtonProps) {
  const [status, setStatus] = useState<MeshyTaskStatus | 'idle'>('idle')
  const [progress, setProgress] = useState(0)
  const [taskId, setTaskId] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  const pollTask = useCallback(
    (id: string, taskType: string) => {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/meshy/${encodeURIComponent(id)}?type=${taskType}`)
          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || 'Poll failed')
          }
          const task = await res.json()

          setProgress(task.progress || 0)
          setStatus(task.status)

          if (task.status === 'SUCCEEDED') {
            stopPolling()
            const glbUrl = task.model_urls?.glb
            const thumb = task.thumbnail_url || ''
            if (glbUrl) {
              onComplete(glbUrl, thumb)
            } else {
              onError?.('No GLB model URL in response')
            }
          } else if (task.status === 'FAILED' || task.status === 'CANCELED') {
            stopPolling()
            setStatus('idle')
            onError?.(task.task_error?.message || `Task ${task.status.toLowerCase()}`)
          }
        } catch (err) {
          // Don't stop polling on transient errors
          console.error('Poll error:', err)
        }
      }, POLL_INTERVAL_MS)
    },
    [onComplete, onError, stopPolling]
  )

  const handleGenerate = async () => {
    if (!input) return
    setStatus('PENDING')
    setProgress(0)
    setTaskId(null)

    try {
      let endpoint: string
      let body: Record<string, unknown>
      let taskType: string

      switch (mode) {
        case 'text-to-3d':
          endpoint = '/api/meshy/text-to-3d'
          body = { mode: 'preview', prompt: input, ...options }
          taskType = 'text-to-3d'
          break
        case 'image-to-3d':
          endpoint = '/api/meshy/image-to-3d'
          body = { image_url: input, ...options }
          taskType = 'image-to-3d'
          break
        case 'retexture':
          endpoint = '/api/meshy/retexture'
          body = { ...options }
          taskType = 'retexture'
          break
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to start 3D generation')
      }

      const { taskId: newTaskId } = await res.json()
      setTaskId(newTaskId)
      setStatus('IN_PROGRESS')
      pollTask(newTaskId, taskType)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed'
      setStatus('idle')
      onError?.(message)
    }
  }

  const isWorking = status === 'PENDING' || status === 'IN_PROGRESS'
  const defaultLabel = label || 'Generate 3D'

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={handleGenerate}
        disabled={disabled || isWorking || !input}
        className="gap-1.5 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
      >
        {isWorking ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {progress > 0 ? `${progress}%` : 'Starting...'}
          </>
        ) : status === 'SUCCEEDED' ? (
          <>
            <RefreshCw className="w-4 h-4" />
            Regenerate 3D
          </>
        ) : (
          <>
            <Box className="w-4 h-4" />
            {defaultLabel}
          </>
        )}
      </Button>

      {/* Progress bar during generation */}
      {isWorking && (
        <div className="mt-2 w-full">
          <div className="h-1.5 w-full bg-purple-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(progress, 5)}%` }}
            />
          </div>
          <p className="text-xs text-purple-400/70 mt-1 text-center">
            {status === 'PENDING'
              ? 'Queued — waiting for processing...'
              : `Generating 3D model... ${progress}%`}
          </p>
        </div>
      )}
    </div>
  )
}
