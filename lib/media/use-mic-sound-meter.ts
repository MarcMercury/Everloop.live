'use client'

/**
 * useMicSoundMeter
 * -----------------
 * Live microphone level meter using the Web Audio API. Produces a
 * normalized 0..1 RMS amplitude. Designed to drive the Bell Tree-style
 * **Sound Meter** mechanic — i.e. when the table is loud for sustained
 * windows, the meter ticks up.
 *
 * Usage:
 *   const { start, stop, listening, level, peak, error,
 *           registerThresholdCallback } = useMicSoundMeter()
 *
 * Browsers will only grant mic access after a user gesture (button click).
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export interface MicMeterOptions {
  /** Rolling-average window in ms. Default 250. */
  smoothingMs?: number
  /** Update tick in ms. Default 100. */
  tickMs?: number
}

export interface MicSoundMeter {
  start: () => Promise<void>
  stop: () => void
  listening: boolean
  /** Current smoothed RMS amplitude (0..1). */
  level: number
  /** Peak amplitude observed since `resetPeak` was last called. */
  peak: number
  resetPeak: () => void
  /**
   * Register a callback that fires when the smoothed level crosses `threshold`
   * upward AND stays above for `holdMs`. Returns an unsubscribe function.
   */
  registerThresholdCallback: (threshold: number, holdMs: number, cb: () => void) => () => void
  error: string | null
}

type ThresholdReg = {
  threshold: number
  holdMs: number
  cb: () => void
  enteredAt: number | null
  fired: boolean
}

export function useMicSoundMeter(opts: MicMeterOptions = {}): MicSoundMeter {
  const { smoothingMs = 250, tickMs = 100 } = opts
  const [listening, setListening] = useState(false)
  const [level, setLevel] = useState(0)
  const [peak, setPeak] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const tickRef = useRef<number | null>(null)
  const recentRef = useRef<number[]>([])
  const peakRef = useRef(0)
  const thresholdsRef = useRef<ThresholdReg[]>([])

  const stop = useCallback(() => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    if (tickRef.current !== null) { window.clearInterval(tickRef.current); tickRef.current = null }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null }
    analyserRef.current = null
    recentRef.current = []
    setListening(false)
    setLevel(0)
  }, [])

  const start = useCallback(async () => {
    if (listening) return
    setError(null)
    try {
      // Echo/noise/gain processing OFF — we want the raw room level.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      streamRef.current = stream
      const ACtor: typeof AudioContext = window.AudioContext
        ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new ACtor()
      audioCtxRef.current = ctx
      const src = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      src.connect(analyser)
      analyserRef.current = analyser

      const data = new Uint8Array(analyser.fftSize)
      const samplesPerWindow = Math.max(1, Math.round(smoothingMs / 16))

      const loop = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteTimeDomainData(data)
        // RMS around 128 (center of unsigned 8-bit).
        let sumSq = 0
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128
          sumSq += v * v
        }
        const rms = Math.sqrt(sumSq / data.length) // 0..1ish
        recentRef.current.push(rms)
        if (recentRef.current.length > samplesPerWindow) recentRef.current.shift()
        rafRef.current = requestAnimationFrame(loop)
      }
      rafRef.current = requestAnimationFrame(loop)

      // Tick updates state + threshold callbacks at a moderate rate.
      tickRef.current = window.setInterval(() => {
        const arr = recentRef.current
        if (!arr.length) return
        const smoothed = arr.reduce((a, b) => a + b, 0) / arr.length
        // Scale: speech ~ 0.05, loud shout ~ 0.3+. Normalize *3 with cap.
        const norm = Math.min(1, smoothed * 3)
        setLevel(norm)
        if (norm > peakRef.current) { peakRef.current = norm; setPeak(norm) }
        const now = Date.now()
        thresholdsRef.current.forEach(reg => {
          if (norm >= reg.threshold) {
            if (reg.enteredAt == null) reg.enteredAt = now
            if (!reg.fired && now - reg.enteredAt >= reg.holdMs) {
              reg.fired = true
              try { reg.cb() } catch (e) { console.error('[mic-meter] threshold cb error', e) }
            }
          } else {
            reg.enteredAt = null
            reg.fired = false
          }
        })
      }, tickMs)

      setListening(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Microphone access denied'
      setError(msg)
      stop()
    }
  }, [listening, smoothingMs, tickMs, stop])

  const resetPeak = useCallback(() => { peakRef.current = 0; setPeak(0) }, [])

  const registerThresholdCallback = useCallback((threshold: number, holdMs: number, cb: () => void) => {
    const reg: ThresholdReg = { threshold, holdMs, cb, enteredAt: null, fired: false }
    thresholdsRef.current.push(reg)
    return () => {
      thresholdsRef.current = thresholdsRef.current.filter(r => r !== reg)
    }
  }, [])

  useEffect(() => () => stop(), [stop])

  return { start, stop, listening, level, peak, resetPeak, registerThresholdCallback, error }
}
