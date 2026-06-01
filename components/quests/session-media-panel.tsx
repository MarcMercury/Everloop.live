'use client'

/**
 * SessionMediaPanel
 * -----------------
 * Live DM-side panel that pulls together every "Add-Feature" media tool:
 *   - Ambience playback (auto-loaded from scene.metadata.media.ambience_url)
 *   - Soundboard (scene.metadata.media.sfx_buttons + catalog suggestions)
 *   - Microphone Sound Meter (visualizer + auto-tick for Bell Tree-style mechanic)
 *   - Camera capture (snap → upload to /api/sessions/[id]/capture)
 *   - TTS narration of the scene's `narration` text via /api/elevenlabs/tts
 *   - Freesound search (if FREESOUND_API_KEY is set)
 *
 * Renders inline in the DM control panel. Mounts cheaply; only opens
 * media streams when the DM clicks the relevant button.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, Camera, Mic, MicOff, Music, Pause, Play, Search, Square, Upload, Volume2, VolumeX, Loader2, X, Image as ImageIcon } from 'lucide-react'
import { useAudioPlayer } from '@/lib/media/use-audio-player'
import { useMicSoundMeter } from '@/lib/media/use-mic-sound-meter'
import { useCameraCapture } from '@/lib/media/use-camera-capture'
import { suggestAmbienceFor, suggestSfxFor } from '@/lib/media/sound-libraries'
import type { QuestScene, QuestSession, SceneMediaConfig, SfxButton } from '@/types/quest'

interface Props {
  scene: QuestScene | null
  session: QuestSession | null
  questId: string
  /**
   * Optional bell-tree integration: caller may pass the current `live_play.sound_meter`
   * config and a handler invoked when mic detects sustained loudness. The panel
   * itself does not mutate session state.
   */
  onSoundMeterTick?: () => void
}

interface FreesoundHit {
  id: number
  title: string
  author: string
  durationSec: number
  license: string
  previewUrl: string
  pageUrl: string
}

export function SessionMediaPanel({ scene, session, questId, onSoundMeterTick }: Props) {
  const audio = useAudioPlayer(0.5)
  const mic = useMicSoundMeter()
  const cam = useCameraCapture('environment')

  const sceneMeta = (scene?.metadata as Record<string, unknown> | null | undefined) ?? null
  const media = (sceneMeta?.media as SceneMediaConfig | undefined) ?? {}
  const livePlay = (sceneMeta?.live_play as Record<string, unknown> | undefined) ?? {}
  const soundMeterScene = (livePlay?.sound_meter as { enabled?: boolean } | undefined)?.enabled === true

  const [activeTab, setActiveTab] = useState<'sound' | 'mic' | 'cam' | 'lib'>('sound')
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState<FreesoundHit[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [ttsLoading, setTtsLoading] = useState(false)
  const [ttsError, setTtsError] = useState<string | null>(null)
  const [captures, setCaptures] = useState<{ url: string; caption: string | null }[]>([])
  const [captureUploading, setCaptureUploading] = useState(false)
  const [captureError, setCaptureError] = useState<string | null>(null)

  const ttsAudioRef = useRef<HTMLAudioElement | null>(null)

  // Auto-load scene ambience when scene changes (no auto-play — needs gesture).
  // We only update the displayed "selected" but defer play to a click.
  const sceneAmbienceUrl = media.ambience_url ?? null
  const ambienceSuggestions = suggestAmbienceFor(scene?.mood)
  const sfxSuggestions = suggestSfxFor(scene?.mood)
  const sceneSfxButtons: SfxButton[] = Array.isArray(media.sfx_buttons) ? media.sfx_buttons : []

  // Auto-arm mic Sound Meter if scene asks for it (still requires user gesture
  // — browsers block getUserMedia without one — so we surface a prompt instead).
  const autoArmRequested = media.auto_arm_sound_meter || soundMeterScene
  const [showAutoArmPrompt, setShowAutoArmPrompt] = useState(false)
  useEffect(() => {
    if (autoArmRequested && !mic.listening) setShowAutoArmPrompt(true)
    else setShowAutoArmPrompt(false)
  }, [autoArmRequested, mic.listening, scene?.id])

  // Wire mic threshold → onSoundMeterTick (sustained loud = 1 tick, 1s cooldown).
  useEffect(() => {
    if (!mic.listening || !onSoundMeterTick) return
    let lastTick = 0
    const unsubscribe = mic.registerThresholdCallback(0.35, 600, () => {
      const now = Date.now()
      if (now - lastTick < 1000) return
      lastTick = now
      onSoundMeterTick()
    })
    return unsubscribe
  }, [mic, onSoundMeterTick])

  const handleSearch = useCallback(async () => {
    const q = searchQ.trim()
    if (!q) return
    setSearching(true)
    setSearchError(null)
    try {
      const res = await fetch(`/api/media/freesound/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!res.ok) {
        setSearchError(data?.hint || data?.error || 'Search failed')
        setSearchResults([])
      } else {
        setSearchResults(data.results ?? [])
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setSearching(false)
    }
  }, [searchQ])

  const handleReadNarration = useCallback(async () => {
    const text = scene?.narration?.trim()
    if (!text) return
    setTtsLoading(true)
    setTtsError(null)
    try {
      const res = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voicePreset: media.narration_voice_preset || 'narrator_warm',
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || `TTS failed (HTTP ${res.status})`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      if (ttsAudioRef.current) ttsAudioRef.current.pause()
      const el = new Audio(url)
      ttsAudioRef.current = el
      el.addEventListener('ended', () => URL.revokeObjectURL(url))
      await el.play()
    } catch (err) {
      setTtsError(err instanceof Error ? err.message : 'TTS failed')
    } finally {
      setTtsLoading(false)
    }
  }, [scene?.narration, media.narration_voice_preset])

  const handleCapture = useCallback(async (caption: string | null) => {
    setCaptureError(null)
    setCaptureUploading(true)
    try {
      const blob = await cam.capture()
      if (!blob) throw new Error('Camera not ready')
      const form = new FormData()
      form.set('image', blob, `capture-${Date.now()}.jpg`)
      form.set('quest_id', questId)
      if (session?.id) form.set('session_id', session.id)
      if (scene?.id) form.set('scene_id', scene.id)
      if (caption) form.set('caption', caption)
      const res = await fetch('/api/sessions/captures', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `Upload failed (HTTP ${res.status})`)
      setCaptures(prev => [{ url: data.url, caption }, ...prev])
    } catch (err) {
      setCaptureError(err instanceof Error ? err.message : 'Capture failed')
    } finally {
      setCaptureUploading(false)
    }
  }, [cam, questId, session?.id, scene?.id])

  return (
    <div className="rounded-lg border border-amber-500/20 bg-teal-rich/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-500/15">
        <Music className="w-4 h-4 text-amber-300" />
        <span className="text-sm text-parchment font-medium">Session Media</span>
        {scene && (
          <span className="text-[10px] text-parchment-muted truncate">· {scene.title}</span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {audio.ambience.playing && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-300 border border-green-500/20 inline-flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> Ambience
            </span>
          )}
          {mic.listening && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 inline-flex items-center gap-1">
              <Mic className="w-3 h-3" /> Mic
            </span>
          )}
          {cam.active && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/20 inline-flex items-center gap-1">
              <Camera className="w-3 h-3" /> Cam
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-amber-500/10 text-[11px]">
        {([
          { key: 'sound', label: 'Audio',   icon: <Music className="w-3 h-3" /> },
          { key: 'mic',   label: 'Mic',     icon: <Mic className="w-3 h-3" /> },
          { key: 'cam',   label: 'Camera',  icon: <Camera className="w-3 h-3" /> },
          { key: 'lib',   label: 'Library', icon: <Search className="w-3 h-3" /> },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-1.5 px-2 inline-flex items-center justify-center gap-1 transition-all border-b-2 ${
              activeTab === t.key
                ? 'border-amber-400 text-amber-200 bg-amber-500/5'
                : 'border-transparent text-parchment-muted hover:text-parchment'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Auto-arm prompt */}
      {showAutoArmPrompt && activeTab !== 'mic' && (
        <button
          onClick={() => setActiveTab('mic')}
          className="block w-full text-[11px] px-3 py-1.5 bg-cyan-500/10 text-cyan-200 border-b border-cyan-500/20 text-left hover:bg-cyan-500/20"
        >
          <Mic className="w-3 h-3 inline mr-1" /> This scene wants the Sound Meter live — click to arm the microphone.
        </button>
      )}

      <div className="p-3 space-y-3">
        {activeTab === 'sound' && (
          <div className="space-y-3">
            {/* Master volume */}
            <div className="flex items-center gap-2">
              {audio.masterVolume === 0 ? <VolumeX className="w-3 h-3 text-parchment-muted" /> : <Volume2 className="w-3 h-3 text-parchment-muted" />}
              <input
                type="range" min={0} max={1} step={0.05}
                value={audio.masterVolume}
                onChange={e => audio.setMasterVolume(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-[10px] text-parchment-muted w-7 text-right">{Math.round(audio.masterVolume * 100)}%</span>
            </div>

            {/* Scene narration TTS */}
            {scene?.narration && (
              <div className="rounded border border-gold/15 bg-teal-rich/40 p-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] text-parchment-muted">Scene narration ({scene.narration.length} chars)</div>
                  <button
                    onClick={handleReadNarration}
                    disabled={ttsLoading}
                    className="text-[11px] px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30 inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {ttsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    Read aloud
                  </button>
                </div>
                {ttsError && <p className="text-[10px] text-red-400 mt-1">{ttsError}</p>}
              </div>
            )}

            {/* Ambience */}
            <div>
              <div className="text-[10px] uppercase tracking-wide text-parchment-muted mb-1">Ambience</div>
              {audio.ambience.url ? (
                <div className="flex items-center justify-between gap-2 rounded bg-teal-rich/40 border border-gold/15 px-2 py-1.5">
                  <div className="text-[11px] text-parchment truncate flex-1">{audio.ambience.url}</div>
                  <button onClick={() => audio.stopAmbience()} className="text-[10px] px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30 inline-flex items-center gap-1">
                    <Square className="w-3 h-3" /> Stop
                  </button>
                </div>
              ) : sceneAmbienceUrl ? (
                <button
                  onClick={() => audio.playAmbience(sceneAmbienceUrl)}
                  className="w-full text-left text-[11px] px-2 py-1.5 rounded bg-green-500/10 border border-green-500/30 text-green-200 hover:bg-green-500/20 inline-flex items-center gap-2"
                >
                  <Play className="w-3 h-3" /> Play scene ambience: {media.ambience_label || sceneAmbienceUrl}
                </button>
              ) : (
                <div className="text-[10px] text-parchment-muted italic">No scene ambience set. Pick one below:</div>
              )}

              {/* Catalog suggestions */}
              <div className="mt-2 grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                {ambienceSuggestions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => audio.playAmbience(s.url)}
                    className="text-left text-[11px] px-2 py-1 rounded bg-teal-rich/50 border border-gold/10 hover:border-gold/30 text-parchment-muted hover:text-parchment inline-flex items-center gap-2"
                  >
                    <Play className="w-3 h-3 text-gold/60" />
                    <span className="truncate flex-1">{s.title}</span>
                    <span className="text-[9px] text-parchment-muted/60">{s.license}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Soundboard — scene-authored buttons + catalog */}
            <div>
              <div className="text-[10px] uppercase tracking-wide text-parchment-muted mb-1">Soundboard</div>
              <div className="grid grid-cols-2 gap-1">
                {sceneSfxButtons.map((b, i) => (
                  <button
                    key={`scene-${i}`}
                    onClick={() => audio.playOneShot(b.url)}
                    className="text-[11px] px-2 py-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-200 hover:bg-amber-500/20 inline-flex items-center gap-1 truncate"
                  >
                    {b.icon && <span>{b.icon}</span>}
                    <span className="truncate">{b.label}</span>
                  </button>
                ))}
                {sfxSuggestions.slice(0, 6).map(s => (
                  <button
                    key={s.id}
                    onClick={() => audio.playOneShot(s.url)}
                    className="text-[11px] px-2 py-1.5 rounded bg-teal-rich/50 border border-gold/10 hover:border-gold/30 text-parchment-muted hover:text-parchment inline-flex items-center gap-1 truncate"
                  >
                    <Volume2 className="w-3 h-3 text-gold/60" />
                    <span className="truncate">{s.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mic' && (
          <div className="space-y-2">
            {!mic.listening ? (
              <button onClick={() => mic.start()} className="w-full px-3 py-2 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 inline-flex items-center justify-center gap-2 text-xs">
                <Mic className="w-3 h-3" /> Arm microphone
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button onClick={mic.stop} className="px-2 py-1 rounded bg-red-500/15 border border-red-500/30 text-red-300 inline-flex items-center gap-1 text-[11px]">
                    <MicOff className="w-3 h-3" /> Stop
                  </button>
                  <button onClick={mic.resetPeak} className="px-2 py-1 rounded bg-teal-rich/50 border border-gold/10 text-parchment-muted text-[11px]">
                    Reset peak
                  </button>
                  <div className="ml-auto text-[10px] text-parchment-muted">
                    peak {Math.round(mic.peak * 100)}%
                  </div>
                </div>
                {/* Meter */}
                <div className="relative h-3 bg-teal-rich/60 rounded overflow-hidden border border-gold/10">
                  <div
                    className={`h-full transition-[width] duration-100 ${
                      mic.level < 0.35 ? 'bg-green-500/60' : mic.level < 0.6 ? 'bg-amber-500/60' : 'bg-red-500/60'
                    }`}
                    style={{ width: `${Math.round(mic.level * 100)}%` }}
                  />
                  <div className="absolute top-0 bottom-0" style={{ left: '35%', width: 1, background: 'rgba(255,200,0,0.4)' }} />
                </div>
                <div className="text-[10px] text-parchment-muted">
                  Sustained level &gt; 35% for 0.6s = +1 Sound Meter tick (Bell Tree-style).
                  {soundMeterScene && <span className="text-cyan-300"> · Active for this scene.</span>}
                </div>
                {mic.error && <p className="text-[10px] text-red-400">{mic.error}</p>}
              </>
            )}
          </div>
        )}

        {activeTab === 'cam' && (
          <div className="space-y-2">
            <div className="aspect-video bg-black/60 rounded overflow-hidden border border-gold/15">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={cam.videoRef as React.RefObject<HTMLVideoElement>} playsInline muted className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2">
              {!cam.active ? (
                <>
                  <button onClick={() => cam.start({ facingMode: 'environment' })} className="flex-1 text-[11px] px-2 py-1.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 inline-flex items-center justify-center gap-1">
                    <Camera className="w-3 h-3" /> Open camera (rear)
                  </button>
                  <button onClick={() => cam.start({ facingMode: 'user' })} className="text-[11px] px-2 py-1.5 rounded bg-teal-rich/50 border border-gold/10 text-parchment-muted">
                    Front
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleCapture(null)}
                    disabled={captureUploading}
                    className="flex-1 text-[11px] px-2 py-1.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-200 inline-flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {captureUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    Capture & save
                  </button>
                  <button onClick={cam.stop} className="text-[11px] px-2 py-1.5 rounded bg-red-500/15 border border-red-500/30 text-red-300 inline-flex items-center gap-1">
                    <X className="w-3 h-3" /> Close
                  </button>
                </>
              )}
            </div>
            {cam.error && <p className="text-[10px] text-red-400">{cam.error}</p>}
            {captureError && <p className="text-[10px] text-red-400">{captureError}</p>}
            {captures.length > 0 && (
              <div className="grid grid-cols-3 gap-1 mt-2">
                {captures.map((c, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <a key={i} href={c.url} target="_blank" rel="noreferrer" className="block aspect-square rounded overflow-hidden border border-gold/10">
                    <img src={c.url} alt={c.caption ?? 'capture'} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'lib' && (
          <div className="space-y-2">
            <form
              onSubmit={e => { e.preventDefault(); handleSearch() }}
              className="flex gap-1"
            >
              <input
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search Freesound (tavern, bell, wind…)"
                className="flex-1 text-[11px] px-2 py-1.5 rounded bg-teal-rich/50 border border-gold/15 text-parchment placeholder:text-parchment-muted/50"
              />
              <button type="submit" disabled={searching} className="text-[11px] px-2 py-1.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-200 inline-flex items-center gap-1 disabled:opacity-50">
                {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                Search
              </button>
            </form>
            {searchError && <p className="text-[10px] text-red-400">{searchError}</p>}
            {searchResults.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-1">
                {searchResults.map(r => (
                  <div key={r.id} className="rounded border border-gold/10 bg-teal-rich/40 p-2 text-[11px]">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-parchment truncate flex-1">{r.title}</span>
                      <span className="text-[9px] text-parchment-muted">{Math.round(r.durationSec)}s · {r.license.replace('http://creativecommons.org/', 'CC ').slice(0, 24)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => audio.playOneShot(r.previewUrl)} className="text-[10px] px-2 py-0.5 rounded bg-teal-rich/50 border border-gold/10 inline-flex items-center gap-1 text-parchment-muted hover:text-parchment">
                        <Play className="w-3 h-3" /> Preview
                      </button>
                      <button onClick={() => audio.playAmbience(r.previewUrl, { loop: true })} className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 border border-green-500/30 inline-flex items-center gap-1 text-green-300">
                        <Music className="w-3 h-3" /> Loop as ambience
                      </button>
                      <a href={r.pageUrl} target="_blank" rel="noreferrer" className="ml-auto text-[10px] text-parchment-muted/70 hover:text-parchment">by {r.author} ↗</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-parchment-muted/70">
              Powered by Freesound.org · Most results are CC-BY / CC0. Credit the author when using in published content.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
