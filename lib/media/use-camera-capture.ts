'use client'

/**
 * useCameraCapture
 * -----------------
 * Browser camera access for capturing session moments (table photo, prop
 * reveal, player reaction). Uses `getUserMedia({ video: true })` + a canvas
 * to grab a JPEG blob.
 *
 *  - `start({ facingMode })` opens the camera. Must be called from a user gesture.
 *  - `capture()` snaps a JPEG blob from the current frame.
 *  - `videoRef` should be attached to a `<video>` element.
 *
 * Browsers will only grant camera access after a user gesture, and only on
 * HTTPS (or localhost / Codespaces dev tunnel).
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export type CameraFacing = 'user' | 'environment'

export interface CameraCapture {
  videoRef: React.RefObject<HTMLVideoElement | null>
  start: (opts?: { facingMode?: CameraFacing }) => Promise<void>
  stop: () => void
  capture: (jpegQuality?: number) => Promise<Blob | null>
  active: boolean
  facing: CameraFacing
  error: string | null
}

export function useCameraCapture(initialFacing: CameraFacing = 'environment'): CameraCapture {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [active, setActive] = useState(false)
  const [facing, setFacing] = useState<CameraFacing>(initialFacing)
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setActive(false)
  }, [])

  const start = useCallback(async (opts?: { facingMode?: CameraFacing }) => {
    stop()
    setError(null)
    const facingMode = opts?.facingMode ?? facing
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      setFacing(facingMode)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setActive(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Camera access denied'
      setError(msg)
      stop()
    }
  }, [facing, stop])

  const capture = useCallback(async (jpegQuality = 0.85): Promise<Blob | null> => {
    const video = videoRef.current
    if (!video || !streamRef.current) return null
    const w = video.videoWidth
    const h = video.videoHeight
    if (!w || !h) return null
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, w, h)
    return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/jpeg', jpegQuality))
  }, [])

  useEffect(() => () => stop(), [stop])

  return { videoRef, start, stop, capture, active, facing, error }
}
