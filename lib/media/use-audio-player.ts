'use client'

/**
 * useAudioPlayer
 * ---------------
 * Browser-only multi-channel audio for live sessions.
 *
 *  - `playAmbience(url, { loop, fadeMs })` — single long-running background track
 *    (looping music or ambience). Calling again cross-fades into the new track.
 *  - `stopAmbience(fadeMs)` — fade out the current ambience.
 *  - `playOneShot(url)` — fire-and-forget SFX. Multiple can overlap.
 *  - `setMasterVolume(0..1)` — affects both channels.
 *
 * Uses native HTMLAudioElement + WebAudio for the gain ramp (no deps).
 *
 * IMPORTANT: browsers require a user gesture before audio can play. Call any
 * of these from inside a click/tap handler. The hook itself does not auto-start.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export interface AmbienceOptions {
  loop?: boolean
  fadeMs?: number
  volume?: number
}

export interface AudioPlayer {
  playAmbience: (url: string, opts?: AmbienceOptions) => Promise<void>
  stopAmbience: (fadeMs?: number) => Promise<void>
  playOneShot: (url: string, volume?: number) => Promise<void>
  setMasterVolume: (v: number) => void
  masterVolume: number
  ambience: { url: string | null; playing: boolean; volume: number }
}

export function useAudioPlayer(initialVolume = 0.6): AudioPlayer {
  const ambienceElRef = useRef<HTMLAudioElement | null>(null)
  const oneShotsRef = useRef<HTMLAudioElement[]>([])
  const [masterVolume, setMasterVolumeState] = useState(initialVolume)
  const [ambience, setAmbience] = useState<{ url: string | null; playing: boolean; volume: number }>({
    url: null,
    playing: false,
    volume: 0.6,
  })

  // Master volume applies to ambience and outstanding one-shots.
  useEffect(() => {
    if (ambienceElRef.current) ambienceElRef.current.volume = ambience.volume * masterVolume
    oneShotsRef.current.forEach(a => { a.volume = masterVolume })
  }, [masterVolume, ambience.volume])

  const fadeAudio = useCallback((el: HTMLAudioElement, from: number, to: number, ms: number) =>
    new Promise<void>(resolve => {
      const steps = Math.max(1, Math.round(ms / 30))
      let i = 0
      const id = window.setInterval(() => {
        i += 1
        const t = i / steps
        el.volume = Math.max(0, Math.min(1, from + (to - from) * t))
        if (i >= steps) { window.clearInterval(id); resolve() }
      }, 30)
    }), [])

  const stopAmbience = useCallback(async (fadeMs = 600) => {
    const el = ambienceElRef.current
    if (!el) return
    await fadeAudio(el, el.volume, 0, fadeMs)
    el.pause()
    el.src = ''
    ambienceElRef.current = null
    setAmbience({ url: null, playing: false, volume: ambience.volume })
  }, [fadeAudio, ambience.volume])

  const playAmbience = useCallback(async (url: string, opts: AmbienceOptions = {}) => {
    const { loop = true, fadeMs = 800, volume = ambience.volume } = opts
    // Fade out anything currently playing.
    if (ambienceElRef.current) {
      await stopAmbience(fadeMs)
    }
    const el = new Audio(url)
    el.crossOrigin = 'anonymous'
    el.loop = loop
    el.volume = 0
    ambienceElRef.current = el
    setAmbience({ url, playing: true, volume })
    try {
      await el.play()
      await fadeAudio(el, 0, volume * masterVolume, fadeMs)
    } catch (err) {
      console.warn('[audio] ambience play blocked:', err)
      setAmbience(prev => ({ ...prev, playing: false }))
    }
  }, [ambience.volume, fadeAudio, masterVolume, stopAmbience])

  const playOneShot = useCallback(async (url: string, volume = 1) => {
    const el = new Audio(url)
    el.crossOrigin = 'anonymous'
    el.volume = volume * masterVolume
    oneShotsRef.current.push(el)
    el.addEventListener('ended', () => {
      oneShotsRef.current = oneShotsRef.current.filter(a => a !== el)
    })
    try {
      await el.play()
    } catch (err) {
      console.warn('[audio] sfx play blocked:', err)
    }
  }, [masterVolume])

  const setMasterVolume = useCallback((v: number) => {
    setMasterVolumeState(Math.max(0, Math.min(1, v)))
  }, [])

  // Cleanup on unmount: stop everything.
  useEffect(() => () => {
    if (ambienceElRef.current) { ambienceElRef.current.pause(); ambienceElRef.current = null }
    oneShotsRef.current.forEach(a => a.pause())
    oneShotsRef.current = []
  }, [])

  return { playAmbience, stopAmbience, playOneShot, setMasterVolume, masterVolume, ambience }
}
