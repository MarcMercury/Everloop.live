'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Volume2, VolumeX, Music, Wind } from 'lucide-react'
import type { SceneMood } from '@/types/campaign'

/**
 * Atmosphere Engine
 * 
 * Provides ambient audio and sound effects for campaign sessions.
 * Uses Web Audio API for layered, crossfading ambient tracks.
 * Inspired by: tavern rain, forest whispers, battle drums, cosmic hum.
 */

// Free ambient audio sources (royalty-free URLs — replace with your own hosted files)
const AMBIENT_TRACKS: Record<SceneMood, { label: string; description: string }> = {
  tense: { label: 'Tension', description: 'Low pulsing drones, creaking wood' },
  mysterious: { label: 'Mystery', description: 'Ethereal chimes, distant echoes' },
  peaceful: { label: 'Serenity', description: 'Gentle wind, birdsong, flowing water' },
  chaotic: { label: 'Chaos', description: 'Battle drums, clash of steel, roaring flames' },
  dark: { label: 'Darkness', description: 'Deep rumbles, whispered voices, dripping caves' },
  triumphant: { label: 'Triumph', description: 'Heroic horns, crowd cheers, soaring chords' },
  neutral: { label: 'Ambient', description: 'Soft tavern hum, crackling fireplace' },
  horror: { label: 'Horror', description: 'Heartbeat, scratching, sudden silences' },
  wonder: { label: 'Wonder', description: 'Cosmic shimmer, crystalline tones, starlight' },
  melancholy: { label: 'Melancholy', description: 'Rain on windows, solo strings, sighing wind' },
}

// Generative ambient using oscillators based on mood
const MOOD_AUDIO_CONFIG: Record<SceneMood, { baseFreq: number; modFreq: number; gainLevel: number; waveType: OscillatorType; filterFreq: number }> = {
  neutral: { baseFreq: 120, modFreq: 0.3, gainLevel: 0.08, waveType: 'sine', filterFreq: 400 },
  tense: { baseFreq: 80, modFreq: 1.2, gainLevel: 0.12, waveType: 'sawtooth', filterFreq: 300 },
  mysterious: { baseFreq: 200, modFreq: 0.5, gainLevel: 0.06, waveType: 'sine', filterFreq: 800 },
  peaceful: { baseFreq: 260, modFreq: 0.2, gainLevel: 0.05, waveType: 'sine', filterFreq: 1200 },
  chaotic: { baseFreq: 60, modFreq: 3.0, gainLevel: 0.15, waveType: 'square', filterFreq: 250 },
  dark: { baseFreq: 55, modFreq: 0.8, gainLevel: 0.10, waveType: 'sawtooth', filterFreq: 200 },
  triumphant: { baseFreq: 330, modFreq: 0.4, gainLevel: 0.08, waveType: 'sine', filterFreq: 2000 },
  horror: { baseFreq: 45, modFreq: 2.0, gainLevel: 0.13, waveType: 'sawtooth', filterFreq: 150 },
  wonder: { baseFreq: 440, modFreq: 0.3, gainLevel: 0.05, waveType: 'sine', filterFreq: 3000 },
  melancholy: { baseFreq: 180, modFreq: 0.15, gainLevel: 0.07, waveType: 'triangle', filterFreq: 600 },
}

interface Props {
  mood: SceneMood
  isActive: boolean
  showControls?: boolean
}

export function AtmosphereEngine({ mood, isActive, showControls = true }: Props) {
  const [muted, setMuted] = useState(true) // Start muted, user opts in
  const [volume, setVolume] = useState(0.5)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const gainNodeRef = useRef<GainNode | null>(null)
  const filterNodeRef = useRef<BiquadFilterNode | null>(null)

  const stopAudio = useCallback(() => {
    oscillatorsRef.current.forEach(osc => {
      try { osc.stop() } catch { /* already stopped */ }
    })
    oscillatorsRef.current = []
    if (audioCtxRef.current?.state === 'running') {
      audioCtxRef.current.suspend()
    }
  }, [])

  const startAudio = useCallback((targetMood: SceneMood) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    const ctx = audioCtxRef.current

    // Stop existing
    oscillatorsRef.current.forEach(osc => {
      try { osc.stop() } catch { /* already stopped */ }
    })
    oscillatorsRef.current = []

    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const config = MOOD_AUDIO_CONFIG[targetMood]

    // Master gain
    const masterGain = ctx.createGain()
    masterGain.gain.value = config.gainLevel * volume
    gainNodeRef.current = masterGain

    // Low-pass filter for warmth
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = config.filterFreq
    filter.Q.value = 0.7
    filterNodeRef.current = filter

    // Base drone
    const baseOsc = ctx.createOscillator()
    baseOsc.type = config.waveType
    baseOsc.frequency.value = config.baseFreq

    // LFO for movement
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = config.modFreq
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = config.baseFreq * 0.05 // Subtle pitch modulation

    lfo.connect(lfoGain)
    lfoGain.connect(baseOsc.frequency)

    // Harmonic layer (fifth above, quieter)
    const harmOsc = ctx.createOscillator()
    harmOsc.type = 'sine'
    harmOsc.frequency.value = config.baseFreq * 1.5
    const harmGain = ctx.createGain()
    harmGain.gain.value = config.gainLevel * volume * 0.3

    // Sub bass layer
    const subOsc = ctx.createOscillator()
    subOsc.type = 'sine'
    subOsc.frequency.value = config.baseFreq * 0.5
    const subGain = ctx.createGain()
    subGain.gain.value = config.gainLevel * volume * 0.4

    // Connect chain
    baseOsc.connect(filter)
    filter.connect(masterGain)
    masterGain.connect(ctx.destination)

    harmOsc.connect(harmGain)
    harmGain.connect(filter)

    subOsc.connect(subGain)
    subGain.connect(filter)

    // Start all
    baseOsc.start()
    lfo.start()
    harmOsc.start()
    subOsc.start()

    oscillatorsRef.current = [baseOsc, lfo, harmOsc, subOsc]
  }, [volume])

  // Handle mood changes
  useEffect(() => {
    if (isActive && !muted) {
      startAudio(mood)
    } else {
      stopAudio()
    }
    return () => stopAudio()
  }, [mood, isActive, muted, startAudio, stopAudio])

  // Handle volume changes
  useEffect(() => {
    if (gainNodeRef.current) {
      const config = MOOD_AUDIO_CONFIG[mood]
      gainNodeRef.current.gain.value = config.gainLevel * volume
    }
  }, [volume, mood])

  const toggleMute = () => {
    if (muted) {
      setMuted(false)
    } else {
      setMuted(true)
      stopAudio()
    }
  }

  if (!showControls) return null

  const track = AMBIENT_TRACKS[mood]

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggleMute}
        className={`p-2 rounded-lg transition-all ${
          muted 
            ? 'bg-teal-rich/50 text-parchment-muted hover:bg-teal-rich/70' 
            : 'bg-gold/20 text-gold hover:bg-gold/30'
        }`}
        title={muted ? 'Enable atmosphere audio' : 'Mute atmosphere'}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {!muted && (
        <>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 accent-gold"
          />
          <div className="flex items-center gap-1 text-xs text-parchment-muted">
            <Music className="w-3 h-3" />
            <span>{track.label}</span>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Sound effect trigger for dice rolls, events, etc.
 */
export function playSoundEffect(type: 'dice_roll' | 'critical_hit' | 'critical_fail' | 'idol_used' | 'scene_change' | 'combat_start') {
  try {
    const ctx = new AudioContext()
    const now = ctx.currentTime

    switch (type) {
      case 'dice_roll': {
        // Quick percussive click
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(800, now)
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1)
        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.15)
        break
      }
      case 'critical_hit': {
        // Ascending fanfare
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(400, now)
        osc.frequency.linearRampToValueAtTime(800, now + 0.2)
        osc.frequency.linearRampToValueAtTime(1200, now + 0.4)
        gain.gain.setValueAtTime(0.2, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.5)
        break
      }
      case 'critical_fail': {
        // Descending sad trombone
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(400, now)
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.6)
        gain.gain.setValueAtTime(0.15, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.7)
        break
      }
      case 'idol_used': {
        // Mystical shimmer
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const gain = ctx.createGain()
        osc1.type = 'sine'
        osc1.frequency.value = 523
        osc2.type = 'sine'
        osc2.frequency.value = 659
        gain.gain.setValueAtTime(0.15, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
        osc1.connect(gain)
        osc2.connect(gain)
        gain.connect(ctx.destination)
        osc1.start(now)
        osc2.start(now)
        osc1.stop(now + 0.8)
        osc2.stop(now + 0.8)
        break
      }
      case 'scene_change': {
        // Whoosh sweep
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(100, now)
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.3)
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.6)
        filter.type = 'bandpass'
        filter.frequency.value = 1000
        filter.Q.value = 2
        gain.gain.setValueAtTime(0.1, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7)
        osc.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.7)
        break
      }
      case 'combat_start': {
        // War drum
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(80, now)
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.3)
        gain.gain.setValueAtTime(0.4, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.4)
        break
      }
    }

    // Cleanup context after effects finish
    setTimeout(() => ctx.close(), 2000)
  } catch {
    // Audio not supported or blocked
  }
}
