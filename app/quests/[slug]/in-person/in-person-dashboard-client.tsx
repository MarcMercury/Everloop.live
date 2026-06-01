'use client'

/**
 * InPersonDashboardClient
 * -----------------------
 * DM-only dashboard for running a quest at a physical table. Players are NOT
 * online — they're using paper sheets. This dashboard turns the laptop into a
 * "stage manager" panel:
 *
 *   • Top bar      — quest title, scene selector, end session, projector toggle.
 *   • Left column  — Script Reader: read-aloud, DM notes, sensory anchors.
 *   • Center       — Image Board: scene image + manual library + "Push to Projector".
 *   • Right column — Initiative Tracker, HP Tracker (players + NPCs), Soundboard.
 *
 * Cross-window sync to the projector view is done with BroadcastChannel keyed
 * on the session id (same-laptop split-screen / external monitor). No server
 * round-trip needed since the DM is the only operator.
 *
 * Initiative & HP state is local + persisted to localStorage keyed by
 * sessionId so a refresh doesn't wipe combat in progress.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Square, Play, Pause, SkipForward, Plus, Minus, X,
  Swords, Volume2, Music, Image as ImageIcon, ScrollText, Eye, EyeOff,
  Monitor, Printer, Trash2, RotateCcw, Dice5, Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type {
  Quest, QuestPlayer, QuestScene, QuestSession, QuestNpc,
} from '@/types/quest'
import { MOOD_THEMES } from '@/types/quest'
import { changeScene, endSession } from '@/lib/actions/quests'
import { useAudioPlayer } from '@/lib/media/use-audio-player'
import { suggestAmbienceFor, suggestSfxFor } from '@/lib/media/sound-libraries'

// =====================================================
// PROJECTOR BROADCAST
// =====================================================

interface ProjectorPayload {
  imageUrl: string | null
  caption: string | null
  sceneTitle: string | null
  mood: string | null
}

function broadcastToProjector(sessionId: string, payload: ProjectorPayload) {
  try {
    const key = `everloop-projector-${sessionId}`
    localStorage.setItem(key, JSON.stringify(payload))
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(key)
      bc.postMessage(payload)
      bc.close()
    }
  } catch {
    /* ignore */
  }
}

// =====================================================
// TYPES
// =====================================================

interface Props {
  quest: Quest
  players: QuestPlayer[]
  scenes: QuestScene[]
  npcs: QuestNpc[]
  session: QuestSession
}

interface TrackedCombatant {
  id: string
  name: string
  type: 'player' | 'npc'
  initiative: number
  hp: number
  maxHp: number
  ac: number | null
  conditions: string[]
  isActive: boolean
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function InPersonDashboardClient({
  quest,
  players,
  scenes,
  npcs,
  session: initialSession,
}: Props) {
  const router = useRouter()
  const [session, setSession] = useState(initialSession)
  const [endingSession, setEndingSession] = useState(false)
  const [showHidden, setShowHidden] = useState(false)

  const activeScene = scenes.find(s => s.id === session.active_scene_id) ?? scenes[0] ?? null
  const moodTheme = activeScene ? MOOD_THEMES[activeScene.mood] : MOOD_THEMES.neutral

  async function handleChangeScene(sceneId: string) {
    const result = await changeScene(session.id, sceneId, quest.id)
    if (result.success) {
      setSession(s => ({ ...s, active_scene_id: sceneId }))
      router.refresh()
    }
  }

  async function handleEndSession() {
    if (!confirm('End this session? You can start a new one later.')) return
    setEndingSession(true)
    const result = await endSession(session.id, quest.id)
    if (result.success) {
      router.push(`/quests/${quest.slug}`)
    } else {
      setEndingSession(false)
    }
  }

  return (
    <div className="min-h-screen bg-teal-deep">
      {/* ============================================
          TOP BAR
          ============================================ */}
      <header className="sticky top-0 z-20 border-b border-gold/20 bg-teal-deep/95 backdrop-blur">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Link
            href={`/quests/${quest.slug}`}
            className="text-parchment-muted hover:text-parchment transition-colors flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Quest</span>
          </Link>

          <div className="h-6 w-px bg-gold/20" />

          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-amber-200/80">
              In-Person Session · #{session.session_number}
            </div>
            <div className="text-lg font-serif text-parchment truncate">{quest.title}</div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/quests/${quest.slug}/in-person/projector?sessionId=${session.id}`}
              target="_blank"
              className="btn-outline-fantasy text-xs flex items-center gap-1.5 !py-1.5"
            >
              <Monitor className="w-3.5 h-3.5" />
              Open Projector
            </Link>
            <Link
              href={`/api/quests/${quest.id}/print?print=1`}
              target="_blank"
              className="btn-outline-fantasy text-xs flex items-center gap-1.5 !py-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Packet
            </Link>
            <Button
              onClick={handleEndSession}
              disabled={endingSession}
              variant="ghost"
              className="text-red-300 hover:bg-red-500/10 text-xs !py-1.5"
            >
              <Square className="w-3.5 h-3.5 mr-1" />
              End
            </Button>
          </div>
        </div>

        {/* Scene strip */}
        <div className="max-w-[1800px] mx-auto px-4 pb-2 flex items-center gap-1.5 overflow-x-auto">
          {scenes.map((s, i) => {
            const isActive = s.id === activeScene?.id
            const theme = MOOD_THEMES[s.mood]
            return (
              <button
                key={s.id}
                onClick={() => handleChangeScene(s.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gold/20 border border-gold/40 text-parchment'
                    : 'bg-teal-rich/40 border border-gold/10 text-parchment-muted hover:text-parchment hover:border-gold/30'
                }`}
                title={s.title}
              >
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ backgroundColor: `${theme?.color}30`, color: theme?.color }}
                >
                  {i + 1}
                </span>
                <span className="max-w-[140px] truncate">{s.title}</span>
                {isActive && <span className="text-[9px] text-amber-300">●</span>}
              </button>
            )
          })}
        </div>
      </header>

      {/* ============================================
          MAIN 3-COLUMN LAYOUT
          ============================================ */}
      <main className="max-w-[1800px] mx-auto px-4 py-4 grid grid-cols-12 gap-4">
        {/* LEFT — Script Reader */}
        <section className="col-span-12 lg:col-span-4 space-y-4">
          <ScriptReaderPanel
            scene={activeScene}
            moodColor={moodTheme?.color ?? '#888'}
            showHidden={showHidden}
            onToggleHidden={() => setShowHidden(v => !v)}
          />
        </section>

        {/* CENTER — Image Board */}
        <section className="col-span-12 lg:col-span-4 space-y-4">
          <ImageBoardPanel
            scene={activeScene}
            scenes={scenes}
            sessionId={session.id}
          />
        </section>

        {/* RIGHT — Combat + Soundboard */}
        <section className="col-span-12 lg:col-span-4 space-y-4">
          <CombatTrackerPanel
            sessionId={session.id}
            players={players}
            npcs={npcs}
            scene={activeScene}
          />
          <SoundboardPanel scene={activeScene} />
        </section>
      </main>
    </div>
  )
}

// =====================================================
// SCRIPT READER PANEL
// =====================================================

function ScriptReaderPanel({
  scene,
  moodColor,
  showHidden,
  onToggleHidden,
}: {
  scene: QuestScene | null
  moodColor: string
  showHidden: boolean
  onToggleHidden: () => void
}) {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('lg')

  if (!scene) {
    return (
      <div className="story-card p-6 text-center text-parchment-muted text-sm">
        No active scene. Pick one from the strip above.
      </div>
    )
  }

  const sceneMeta = (scene.metadata as Record<string, unknown> | null | undefined) ?? {}
  const livePlay = (sceneMeta.live_play as Record<string, unknown> | undefined) ?? {}
  const sensoryAnchors = scene.sensory_anchors ?? []
  const fontClass = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }[fontSize]

  return (
    <div
      className="story-card p-0 overflow-hidden border-l-4"
      style={{ borderLeftColor: moodColor }}
    >
      <div className="px-4 py-3 border-b border-gold/15 flex items-center justify-between bg-teal-rich/30">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-gold" />
          <span className="text-sm font-serif text-parchment">Script · {scene.title}</span>
        </div>
        <div className="flex items-center gap-1">
          {(['sm', 'base', 'lg', 'xl'] as const).map(size => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={`px-1.5 py-0.5 text-[10px] rounded ${
                fontSize === size ? 'bg-gold/30 text-parchment' : 'text-parchment-muted hover:text-parchment'
              }`}
            >
              {size.toUpperCase()}
            </button>
          ))}
          <button
            onClick={onToggleHidden}
            className="ml-2 px-2 py-0.5 text-[10px] rounded bg-amber-500/10 border border-amber-500/30 text-amber-200 hover:bg-amber-500/20 flex items-center gap-1"
            title="Toggle DM-only content"
          >
            {showHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            DM
          </button>
        </div>
      </div>

      <div className={`p-5 max-h-[60vh] overflow-y-auto space-y-5 ${fontClass} leading-relaxed`}>
        {/* Scene meta */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-parchment-muted">
          <span className="px-2 py-0.5 rounded bg-teal-rich/50 border border-gold/10 capitalize">{scene.scene_type}</span>
          <span className="px-2 py-0.5 rounded bg-teal-rich/50 border border-gold/10 capitalize">{scene.mood}</span>
          {scene.pacing && (
            <span className="px-2 py-0.5 rounded bg-teal-rich/50 border border-gold/10 capitalize">{scene.pacing}</span>
          )}
        </div>

        {/* Read-aloud — narration */}
        {scene.narration && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-amber-200/80 mb-1.5">
              Read Aloud
            </div>
            <blockquote
              className="rounded border-l-4 px-4 py-3 italic text-parchment bg-teal-rich/40"
              style={{ borderLeftColor: moodColor }}
            >
              {scene.narration.split(/\n{2,}/).map((p, i) => (
                <p key={i} className="mb-2 last:mb-0 whitespace-pre-wrap">{p}</p>
              ))}
            </blockquote>
          </div>
        )}

        {/* Description */}
        {scene.description && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-parchment-muted mb-1.5">
              Setting
            </div>
            <p className="text-parchment-dark whitespace-pre-wrap">{scene.description}</p>
          </div>
        )}

        {/* Sensory anchors */}
        {sensoryAnchors.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-parchment-muted mb-1.5">
              Sensory Anchors
            </div>
            <ul className="space-y-1 text-sm">
              {sensoryAnchors.map((a, i) => (
                <li key={i} className="text-parchment-dark">
                  <span className="text-amber-300/90 mr-2">{a.label}</span>
                  {a.note && <span className="text-parchment-muted">— {a.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Narrative compass */}
        {(scene.feeling || scene.reveal || scene.choice) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {scene.feeling && (
              <div className="rounded border border-gold/15 bg-teal-rich/30 p-2">
                <div className="text-[10px] uppercase text-amber-200/70 mb-0.5">Feeling</div>
                <div className="text-parchment-dark">{scene.feeling}</div>
              </div>
            )}
            {scene.reveal && (
              <div className="rounded border border-gold/15 bg-teal-rich/30 p-2">
                <div className="text-[10px] uppercase text-amber-200/70 mb-0.5">Reveal</div>
                <div className="text-parchment-dark">{scene.reveal}</div>
              </div>
            )}
            {scene.choice && (
              <div className="rounded border border-gold/15 bg-teal-rich/30 p-2">
                <div className="text-[10px] uppercase text-amber-200/70 mb-0.5">Choice</div>
                <div className="text-parchment-dark">{scene.choice}</div>
              </div>
            )}
          </div>
        )}

        {/* DM-only notes */}
        {showHidden && scene.dm_notes && (
          <div className="rounded border border-amber-500/30 bg-amber-500/5 p-3">
            <div className="text-[10px] uppercase tracking-wider text-amber-200 mb-1.5 flex items-center gap-1">
              <EyeOff className="w-3 h-3" /> DM Only
            </div>
            <p className="text-parchment-dark whitespace-pre-wrap text-sm">{scene.dm_notes}</p>
          </div>
        )}

        {/* Live-play hidden mechanics */}
        {showHidden && livePlay && Object.keys(livePlay).length > 0 && (
          <div className="rounded border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
            <div className="text-[10px] uppercase tracking-wider text-amber-200 mb-1.5">
              Live-Play Mechanics
            </div>
            <pre className="text-parchment-dark whitespace-pre-wrap text-[11px] leading-snug">
{JSON.stringify(livePlay, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

// =====================================================
// IMAGE BOARD PANEL
// =====================================================

function ImageBoardPanel({
  scene,
  scenes,
  sessionId,
}: {
  scene: QuestScene | null
  scenes: QuestScene[]
  sessionId: string
}) {
  const [pushed, setPushed] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [manualUrl, setManualUrl] = useState('')

  // Library of all images across this quest's scenes (so the DM can flip to
  // a different scene's art on the projector without changing the active scene).
  const library = useMemo(() => {
    const items: { url: string; label: string; sceneId: string }[] = []
    for (const s of scenes) {
      if (s.image_url) items.push({ url: s.image_url, label: s.title, sceneId: s.id })
      if (s.map_url && s.map_url !== s.image_url) {
        items.push({ url: s.map_url, label: `${s.title} (map)`, sceneId: s.id })
      }
    }
    return items
  }, [scenes])

  const pushImage = useCallback((url: string | null, label: string | null) => {
    setPushed(url)
    broadcastToProjector(sessionId, {
      imageUrl: url,
      caption: caption || label,
      sceneTitle: scene?.title ?? null,
      mood: scene?.mood ?? null,
    })
  }, [sessionId, caption, scene])

  function clearProjector() {
    pushImage(null, null)
  }

  return (
    <div className="story-card p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-gold/15 flex items-center justify-between bg-teal-rich/30">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-gold" />
          <span className="text-sm font-serif text-parchment">Image Board</span>
        </div>
        <button
          onClick={clearProjector}
          className="text-[10px] text-parchment-muted hover:text-red-300 flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          Clear Projector
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Current pushed preview */}
        <div className="aspect-video rounded-lg border border-gold/20 bg-teal-rich/50 overflow-hidden flex items-center justify-center">
          {pushed ? (
            <img src={pushed} alt={caption} className="w-full h-full object-contain" />
          ) : (
            <div className="text-center text-parchment-muted text-xs px-4">
              <Monitor className="w-6 h-6 mx-auto mb-1 opacity-50" />
              <div>Nothing on projector</div>
              <div className="text-[10px] mt-1 opacity-70">
                Click any image below to push it to the projector window.
              </div>
            </div>
          )}
        </div>

        {/* Caption input */}
        <Input
          placeholder="Optional caption shown on projector…"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          className="text-sm"
        />

        {/* Active scene image */}
        {scene?.image_url && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-parchment-muted mb-1.5">
              Active Scene Art
            </div>
            <button
              onClick={() => pushImage(scene.image_url!, scene.title)}
              className="block w-full rounded-lg overflow-hidden border border-gold/20 hover:border-gold/50 transition-all"
            >
              <img src={scene.image_url} alt={scene.title} className="w-full aspect-video object-cover" />
            </button>
          </div>
        )}

        {/* Library */}
        {library.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-parchment-muted mb-1.5">
              Library ({library.length})
            </div>
            <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
              {library.map((item, i) => (
                <button
                  key={i}
                  onClick={() => pushImage(item.url, item.label)}
                  className={`relative aspect-square rounded overflow-hidden border transition-all ${
                    pushed === item.url
                      ? 'border-gold ring-2 ring-gold/40'
                      : 'border-gold/15 hover:border-gold/40'
                  }`}
                  title={item.label}
                >
                  <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Manual URL push */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-parchment-muted mb-1.5">
            Push Custom Image
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Paste image URL…"
              value={manualUrl}
              onChange={e => setManualUrl(e.target.value)}
              className="text-xs"
            />
            <Button
              size="sm"
              onClick={() => { if (manualUrl) { pushImage(manualUrl, null); setManualUrl('') } }}
              disabled={!manualUrl}
              className="btn-fantasy text-xs !py-1"
            >
              Push
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// =====================================================
// COMBAT TRACKER PANEL (initiative + HP)
// =====================================================

function CombatTrackerPanel({
  sessionId,
  players,
  npcs,
  scene,
}: {
  sessionId: string
  players: QuestPlayer[]
  npcs: QuestNpc[]
  scene: QuestScene | null
}) {
  const storageKey = `everloop-combat-${sessionId}`
  const [combatants, setCombatants] = useState<TrackedCombatant[]>([])
  const [round, setRound] = useState(1)
  const [activeIdx, setActiveIdx] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const [newName, setNewName] = useState('')
  const [newHp, setNewHp] = useState('')
  const [newInit, setNewInit] = useState('')

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const data = JSON.parse(raw)
        setCombatants(data.combatants ?? [])
        setRound(data.round ?? 1)
        setActiveIdx(data.activeIdx ?? 0)
      }
    } catch { /* ignore */ }
    setHydrated(true)
  }, [storageKey])

  // Persist
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(storageKey, JSON.stringify({ combatants, round, activeIdx }))
  }, [combatants, round, activeIdx, hydrated, storageKey])

  function importPartyAndNpcs() {
    const partyEntries: TrackedCombatant[] = players
      .filter(p => p.character)
      .map(p => ({
        id: p.id,
        name: p.character!.name,
        type: 'player' as const,
        initiative: 10,
        hp: p.campaign_hp ?? p.character!.current_hp ?? p.character!.max_hp ?? 10,
        maxHp: p.campaign_max_hp ?? p.character!.max_hp ?? 10,
        ac: p.character!.armor_class ?? null,
        conditions: [],
        isActive: false,
      }))

    // NPCs in current scene
    const sceneNpcs: TrackedCombatant[] = npcs
      .filter(n => n.current_scene_id === scene?.id)
      .map(n => {
        const stats = n.stats ?? { hp: 10, max_hp: 10, ac: 10 } as { hp: number; max_hp: number; ac: number }
        return {
          id: n.id,
          name: n.name,
          type: 'npc' as const,
          initiative: 10,
          hp: typeof stats.hp === 'number' ? stats.hp : 10,
          maxHp: typeof stats.max_hp === 'number' ? stats.max_hp : 10,
          ac: typeof stats.ac === 'number' ? stats.ac : null,
          conditions: [],
          isActive: false,
        }
      })

    // Merge (skip ids already in the list)
    setCombatants(prev => {
      const have = new Set(prev.map(c => c.id))
      const incoming = [...partyEntries, ...sceneNpcs].filter(c => !have.has(c.id))
      return [...prev, ...incoming]
    })
  }

  function rollAllInitiative() {
    setCombatants(prev =>
      prev.map(c => ({
        ...c,
        initiative: Math.floor(Math.random() * 20) + 1,
      })).sort((a, b) => b.initiative - a.initiative)
    )
    setActiveIdx(0)
    setRound(1)
  }

  function addAdHoc() {
    if (!newName.trim()) return
    const hp = parseInt(newHp) || 10
    const init = parseInt(newInit) || Math.floor(Math.random() * 20) + 1
    setCombatants(prev => [
      ...prev,
      {
        id: `adhoc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: newName.trim(),
        type: 'npc',
        initiative: init,
        hp,
        maxHp: hp,
        ac: null,
        conditions: [],
        isActive: false,
      },
    ])
    setNewName(''); setNewHp(''); setNewInit('')
  }

  function removeCombatant(id: string) {
    setCombatants(prev => {
      const idx = prev.findIndex(c => c.id === id)
      const next = prev.filter(c => c.id !== id)
      if (idx <= activeIdx && activeIdx > 0) setActiveIdx(activeIdx - 1)
      if (activeIdx >= next.length) setActiveIdx(0)
      return next
    })
  }

  function adjustHp(id: string, delta: number) {
    setCombatants(prev => prev.map(c =>
      c.id === id ? { ...c, hp: Math.max(0, Math.min(c.maxHp, c.hp + delta)) } : c
    ))
  }

  function setHpDirect(id: string, value: number) {
    setCombatants(prev => prev.map(c =>
      c.id === id ? { ...c, hp: Math.max(0, Math.min(c.maxHp, value)) } : c
    ))
  }

  function nextTurn() {
    setCombatants(prev => {
      if (prev.length === 0) return prev
      const next = activeIdx + 1
      if (next >= prev.length) setRound(r => r + 1)
      setActiveIdx(next % prev.length)
      return prev
    })
  }

  function resetCombat() {
    if (!confirm('Clear all combatants?')) return
    setCombatants([])
    setRound(1)
    setActiveIdx(0)
  }

  function sortByInitiative() {
    setCombatants(prev => [...prev].sort((a, b) => b.initiative - a.initiative))
    setActiveIdx(0)
  }

  return (
    <div className="story-card p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-gold/15 flex items-center justify-between bg-teal-rich/30">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-gold" />
          <span className="text-sm font-serif text-parchment">Combat</span>
          {combatants.length > 0 && (
            <span className="text-[10px] text-parchment-muted">Round {round}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={nextTurn}
            disabled={combatants.length === 0}
            className="px-2 py-0.5 text-[10px] rounded bg-gold/20 hover:bg-gold/30 text-parchment disabled:opacity-30 flex items-center gap-1"
            title="Next turn"
          >
            <SkipForward className="w-3 h-3" /> Next
          </button>
          <button
            onClick={sortByInitiative}
            disabled={combatants.length === 0}
            className="px-2 py-0.5 text-[10px] rounded bg-teal-rich/60 hover:bg-teal-rich text-parchment-muted hover:text-parchment disabled:opacity-30"
            title="Sort by initiative"
          >
            Sort
          </button>
          <button
            onClick={resetCombat}
            disabled={combatants.length === 0}
            className="px-2 py-0.5 text-[10px] rounded bg-red-500/10 hover:bg-red-500/20 text-red-300 disabled:opacity-30"
            title="Reset"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-2 max-h-[40vh] overflow-y-auto">
        {combatants.length === 0 ? (
          <div className="text-center py-4 space-y-2">
            <div className="text-xs text-parchment-muted">No combatants yet.</div>
            <div className="flex gap-2 justify-center">
              <Button size="sm" onClick={importPartyAndNpcs} className="btn-fantasy text-xs !py-1">
                <Plus className="w-3 h-3 mr-1" />
                Add Party + NPCs
              </Button>
              <Button size="sm" onClick={rollAllInitiative} variant="ghost" className="text-xs !py-1 text-parchment-muted">
                <Dice5 className="w-3 h-3 mr-1" />
                Roll All
              </Button>
            </div>
          </div>
        ) : (
          combatants.map((c, i) => {
            const isActive = i === activeIdx
            const isDown = c.hp === 0
            const hpPct = c.maxHp > 0 ? (c.hp / c.maxHp) * 100 : 0
            const hpColor = hpPct > 50 ? 'bg-emerald-500' : hpPct > 25 ? 'bg-amber-500' : 'bg-red-500'
            return (
              <div
                key={c.id}
                className={`rounded border p-2 transition-all ${
                  isActive
                    ? 'border-gold/60 bg-gold/10 ring-1 ring-gold/30'
                    : isDown
                    ? 'border-red-500/20 bg-red-500/5 opacity-60'
                    : 'border-gold/10 bg-teal-rich/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  {c.type === 'player' ? (
                    <Crown className="w-3 h-3 text-gold flex-shrink-0" />
                  ) : (
                    <span className="text-[10px] text-parchment-muted flex-shrink-0">NPC</span>
                  )}
                  <Input
                    type="number"
                    value={c.initiative}
                    onChange={e => setCombatants(prev => prev.map(p => p.id === c.id ? { ...p, initiative: parseInt(e.target.value) || 0 } : p))}
                    className="w-12 h-6 text-center text-xs px-1"
                    title="Initiative"
                  />
                  <span className="text-sm text-parchment flex-1 truncate">{c.name}</span>
                  {c.ac !== null && (
                    <span className="text-[10px] text-parchment-muted" title="AC">AC {c.ac}</span>
                  )}
                  <button
                    onClick={() => removeCombatant(c.id)}
                    className="text-parchment-muted hover:text-red-300 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="mt-1.5 flex items-center gap-1.5">
                  <button
                    onClick={() => adjustHp(c.id, -5)}
                    className="px-1 text-[10px] rounded bg-red-500/15 text-red-300 hover:bg-red-500/25"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => adjustHp(c.id, -1)}
                    className="px-1 text-[10px] rounded bg-red-500/10 text-red-300 hover:bg-red-500/20"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <div className="flex-1 relative h-5 rounded bg-teal-rich/60 overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 ${hpColor} transition-all`}
                      style={{ width: `${hpPct}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] font-medium text-parchment">
                      <input
                        type="number"
                        value={c.hp}
                        onChange={e => setHpDirect(c.id, parseInt(e.target.value) || 0)}
                        className="w-10 bg-transparent text-center outline-none"
                      />
                      <span className="opacity-70">/ {c.maxHp}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => adjustHp(c.id, 1)}
                    className="px-1 text-[10px] rounded bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => adjustHp(c.id, 5)}
                    className="px-1 text-[10px] rounded bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                  >
                    +5
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add ad-hoc combatant */}
      <div className="px-3 pb-3 pt-2 border-t border-gold/10 bg-teal-rich/20 flex items-center gap-1.5">
        <Input
          placeholder="Name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="text-xs h-7 flex-1"
        />
        <Input
          placeholder="HP"
          value={newHp}
          onChange={e => setNewHp(e.target.value)}
          className="text-xs h-7 w-14"
          type="number"
        />
        <Input
          placeholder="Init"
          value={newInit}
          onChange={e => setNewInit(e.target.value)}
          className="text-xs h-7 w-14"
          type="number"
        />
        <Button
          size="sm"
          onClick={addAdHoc}
          disabled={!newName.trim()}
          className="btn-fantasy text-xs !py-1 !px-2 h-7"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}

// =====================================================
// SOUNDBOARD PANEL
// =====================================================

function SoundboardPanel({ scene }: { scene: QuestScene | null }) {
  const audio = useAudioPlayer(0.6)
  const [currentAmbient, setCurrentAmbient] = useState<string | null>(null)

  const sceneMeta = (scene?.metadata as Record<string, unknown> | null | undefined) ?? {}
  const media = (sceneMeta.media as Record<string, unknown> | undefined) ?? {}
  const sceneAmbienceUrl = (media.ambience_url as string | undefined) ?? null
  const sceneSfxButtons = (Array.isArray(media.sfx_buttons) ? media.sfx_buttons : []) as { id?: string; label: string; url: string }[]
  const ambienceSuggestions = suggestAmbienceFor(scene?.mood)
  const sfxSuggestions = suggestSfxFor(scene?.mood)

  function playAmbient(url: string, label: string) {
    audio.playAmbience(url, { loop: true })
    setCurrentAmbient(label)
  }

  function stopAmbient() {
    audio.stopAmbience()
    setCurrentAmbient(null)
  }

  function fireSfx(url: string) {
    audio.playOneShot(url)
  }

  return (
    <div className="story-card p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-gold/15 flex items-center justify-between bg-teal-rich/30">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-gold" />
          <span className="text-sm font-serif text-parchment">Soundboard</span>
        </div>
        {currentAmbient && (
          <button
            onClick={stopAmbient}
            className="text-[10px] text-parchment-muted hover:text-red-300 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Stop
          </button>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Ambience now-playing */}
        <div className="rounded border border-gold/15 bg-teal-rich/40 p-2">
          <div className="flex items-center gap-2 mb-1.5">
            <Music className="w-3 h-3 text-gold" />
            <span className="text-[10px] uppercase tracking-wider text-parchment-muted">Ambience</span>
            <span className="text-xs text-parchment ml-auto truncate">
              {currentAmbient ?? 'silent'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={stopAmbient}
              disabled={!audio.ambience.playing}
              className="w-7 h-7 rounded-full bg-gold/20 hover:bg-gold/30 flex items-center justify-center disabled:opacity-30"
              title={audio.ambience.playing ? 'Stop ambience' : 'No ambience playing'}
            >
              {audio.ambience.playing ? <Pause className="w-3 h-3 text-parchment" /> : <Play className="w-3 h-3 text-parchment" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={audio.masterVolume}
              onChange={e => audio.setMasterVolume(parseFloat(e.target.value))}
              className="flex-1 accent-gold"
            />
            <span className="text-[10px] text-parchment-muted w-8 text-right">
              {Math.round(audio.masterVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Ambience options */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-parchment-muted mb-1">
            Ambience Tracks
          </div>
          <div className="flex flex-wrap gap-1">
            {sceneAmbienceUrl && (
              <button
                onClick={() => playAmbient(sceneAmbienceUrl, 'Scene')}
                className="px-2 py-1 text-[10px] rounded bg-amber-500/15 border border-amber-500/30 text-amber-200 hover:bg-amber-500/25"
              >
                ★ Scene Default
              </button>
            )}
            {ambienceSuggestions.map(a => (
              <button
                key={a.id}
                onClick={() => playAmbient(a.url, a.title)}
                className="px-2 py-1 text-[10px] rounded bg-teal-rich/50 border border-gold/15 text-parchment-muted hover:text-parchment hover:border-gold/30"
              >
                {a.title}
              </button>
            ))}
            {ambienceSuggestions.length === 0 && !sceneAmbienceUrl && (
              <span className="text-[10px] text-parchment-muted italic">No suggestions for this mood.</span>
            )}
          </div>
        </div>

        {/* SFX buttons */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-parchment-muted mb-1">
            SFX
          </div>
          <div className="grid grid-cols-2 gap-1">
            {sceneSfxButtons.map((b, i) => (
              <button
                key={b.id ?? i}
                onClick={() => fireSfx(b.url)}
                className="px-2 py-1.5 text-xs rounded bg-amber-500/15 border border-amber-500/30 text-amber-200 hover:bg-amber-500/25 truncate"
                title={b.label}
              >
                ★ {b.label}
              </button>
            ))}
            {sfxSuggestions.map(s => (
              <button
                key={s.id}
                onClick={() => fireSfx(s.url)}
                className="px-2 py-1.5 text-xs rounded bg-teal-rich/50 border border-gold/15 text-parchment-muted hover:text-parchment hover:border-gold/30 truncate"
                title={s.title}
              >
                {s.title}
              </button>
            ))}
          </div>
          {sceneSfxButtons.length === 0 && sfxSuggestions.length === 0 && (
            <p className="text-[10px] text-parchment-muted italic">No SFX configured for this mood.</p>
          )}
        </div>
      </div>
    </div>
  )
}
