'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createScene, updateScene } from '@/lib/actions/quests'
import { MOOD_THEMES } from '@/types/quest'
import type { Quest, QuestScene, QuestSceneUpdate, SceneType, SceneMood, ScenePacing } from '@/types/quest'
import { ArrowLeft, Plus, Save, Map, Sparkles, GripVertical, Box, Printer, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import dynamic from 'next/dynamic'
import { Generate3DButton } from '@/components/3d/generate-3d-button'
import { EncounterDifficulty } from '@/components/quests/encounter-difficulty'
import { QUEST_SCENE_TEMPLATES, type QuestSceneTemplateKind } from '@/lib/dnd-rules/scene-templates'

const TEMPLATE_TO_SCENE_TYPE: Record<QuestSceneTemplateKind, SceneType> = {
  narrative_arrival: 'narrative',
  social_encounter: 'social',
  combat_encounter: 'combat',
  exploration: 'exploration',
  puzzle_or_trap: 'puzzle',
  rest_camp: 'rest',
  boss_fight: 'boss',
  climax_or_resolution: 'event',
}

const ModelViewerCompact = dynamic(
  () => import('@/components/3d/model-viewer').then((mod) => mod.ModelViewerCompact),
  { ssr: false }
)

interface Props {
  campaign: Quest
  scenes: QuestScene[]
  entities: { id: string; name: string; type: string; slug: string }[]
}

const SCENE_TYPES: { value: SceneType; label: string; icon: string }[] = [
  { value: 'narrative', label: 'Narrative', icon: '📜' },
  { value: 'combat', label: 'Combat', icon: '⚔️' },
  { value: 'exploration', label: 'Exploration', icon: '🗺️' },
  { value: 'social', label: 'Social', icon: '🗣️' },
  { value: 'puzzle', label: 'Puzzle', icon: '🧩' },
  { value: 'rest', label: 'Rest', icon: '🏕️' },
  { value: 'boss', label: 'Boss', icon: '👹' },
  { value: 'event', label: 'Event', icon: '⚡' },
]

export function SceneBuilderClient({ campaign, scenes: initialScenes, entities }: Props) {
  const router = useRouter()
  const [scenes, setScenes] = useState(initialScenes)
  const [editingScene, setEditingScene] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatingMapFor, setGeneratingMapFor] = useState<string | null>(null)
  const [mapError, setMapError] = useState<{ sceneId: string; message: string } | null>(null)

  async function handleGenerateMap(sceneId: string) {
    setGeneratingMapFor(sceneId)
    setMapError(null)
    try {
      const res = await fetch(`/api/quests/${campaign.id}/map`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId }),
      })
      let data: { mapUrl?: string; error?: string } = {}
      try {
        data = await res.json()
      } catch {
        // non-JSON response (e.g. 504 HTML page)
      }
      if (!res.ok || !data.mapUrl) {
        const message = data.error || `Map generation failed (HTTP ${res.status})`
        console.error('Map generation failed:', message)
        setMapError({ sceneId, message })
        return
      }
      // Update local state so the new map appears immediately.
      const newUrl = data.mapUrl
      setScenes(prev =>
        prev.map(s =>
          s.id === sceneId ? ({ ...s, map_url: newUrl } as QuestScene) : s,
        ),
      )
      // Also refresh server data so subsequent navigations see the persisted URL.
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error'
      console.error('Map generation error:', err)
      setMapError({ sceneId, message })
    } finally {
      setGeneratingMapFor(null)
    }
  }

  const [newScene, setNewScene] = useState({
    title: '',
    description: '',
    scene_type: 'narrative' as SceneType,
    mood: 'neutral' as SceneMood,
    narration: '',
    dm_notes: '',
    feeling: '',
    reveal: '',
    choice: '',
    pacing: 'medium' as ScenePacing,
    sensory_anchors: ['', '', ''] as [string, string, string],
  })
  const [sceneModelUrls, setSceneModelUrls] = useState<Record<string, string>>({})

  async function handleCreateScene() {
    if (!newScene.title.trim()) return
    setLoading(true)
    const result = await createScene({
      quest_id: campaign.id,
      title: newScene.title.trim(),
      description: newScene.description.trim() || undefined,
      scene_type: newScene.scene_type,
      mood: newScene.mood,
      narration: newScene.narration.trim() || undefined,
      dm_notes: newScene.dm_notes.trim() || undefined,
      feeling: newScene.feeling.trim() || undefined,
      reveal: newScene.reveal.trim() || undefined,
      choice: newScene.choice.trim() || undefined,
      pacing: newScene.pacing,
      sensory_anchors: newScene.sensory_anchors
        .map(s => s.trim())
        .filter(Boolean)
        .map(label => ({ label })),
    })
    if (result.success && result.scene) {
      setScenes(prev => [...prev, result.scene!])
      setNewScene({ title: '', description: '', scene_type: 'narrative', mood: 'neutral', narration: '', dm_notes: '', feeling: '', reveal: '', choice: '', pacing: 'medium', sensory_anchors: ['', '', ''] })
      setShowNew(false)
    }
    setLoading(false)
  }

  async function handleUpdateScene(sceneId: string, updates: QuestSceneUpdate) {
    setLoading(true)
    const result = await updateScene(sceneId, campaign.id, updates)
    if (result.success && result.scene) {
      setScenes(prev => prev.map(s => s.id === sceneId ? result.scene! : s))
    }
    setLoading(false)
    setEditingScene(null)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center gap-2 text-sm text-parchment-muted mb-4">
        <Link href={`/quests/${campaign.slug}`} className="hover:text-parchment transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          {campaign.title}
        </Link>
        <span>/</span>
        <span className="text-parchment">Scene Builder</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-parchment flex items-center gap-3">
            <Map className="w-7 h-7 text-gold" />
            Scene Builder
          </h1>
          <p className="text-parchment-muted mt-1">Design scenes your players will experience. Each scene has a mood, type, and narration.</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/quests/${campaign.id}/print?print=1`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 px-3 py-2 rounded border border-gold/30 text-parchment hover:bg-gold/10 text-sm"
            title="Open printable quest packet (DDEX-style)"
          >
            <Printer className="w-4 h-4" />
            Print Packet
          </a>
          <Button onClick={() => setShowNew(!showNew)} className="btn-fantasy gap-2">
            <Plus className="w-4 h-4" />
            Add Scene
          </Button>
        </div>
      </div>

      {/* New Scene Form */}
      {showNew && (
        <div className="story-card mb-8 border-gold/30">
          <div className="flex items-center justify-between mb-4 gap-3">
            <h3 className="text-lg font-serif text-parchment">New Scene</h3>
            <div className="flex items-center gap-2">
              <label className="text-[11px] uppercase tracking-wide text-parchment-muted">Scaffold from</label>
              <select
                value=""
                onChange={(e) => {
                  const kind = e.target.value as QuestSceneTemplateKind
                  const tpl = QUEST_SCENE_TEMPLATES.find((t) => t.kind === kind)
                  if (!tpl) return
                  const dmHints = tpl.fields
                    .filter((f) => f.key !== 'boxed_text')
                    .map((f) => `${f.label}:\n${f.hint}`)
                    .join('\n\n')
                  setNewScene((p) => ({
                    ...p,
                    scene_type: TEMPLATE_TO_SCENE_TYPE[kind],
                    description: p.description || tpl.description,
                    narration:
                      p.narration ||
                      tpl.fields.find((f) => f.key === 'boxed_text')?.hint ||
                      '',
                    dm_notes: p.dm_notes || dmHints,
                  }))
                }}
                className="rounded bg-teal-rich/50 border border-gold/20 text-parchment text-xs p-1.5 focus:outline-none focus:ring-2 focus:ring-gold/40"
              >
                <option value="" disabled>
                  Template…
                </option>
                {QUEST_SCENE_TEMPLATES.map((t) => (
                  <option key={t.kind} value={t.kind}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-parchment text-sm">Title</Label>
              <Input
                value={newScene.title}
                onChange={e => setNewScene(p => ({ ...p, title: e.target.value }))}
                placeholder="The Fractured Crossing..."
                className="mt-1 bg-teal-rich/50 border-gold/20 text-parchment placeholder:text-parchment-muted/50"
              />
            </div>

            <div>
              <Label className="text-parchment text-sm">Scene Type</Label>
              <div className="grid grid-cols-4 gap-1 mt-1">
                {SCENE_TYPES.map(st => (
                  <button
                    key={st.value}
                    onClick={() => setNewScene(p => ({ ...p, scene_type: st.value }))}
                    className={`p-2 rounded text-center text-xs transition-all ${
                      newScene.scene_type === st.value
                        ? 'bg-gold/20 border border-gold/40 text-parchment'
                        : 'bg-teal-rich/50 border border-gold/5 text-parchment-muted hover:border-gold/20'
                    }`}
                  >
                    <div className="text-base">{st.icon}</div>
                    <div>{st.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-parchment text-sm">Mood</Label>
              <div className="grid grid-cols-5 gap-1 mt-1">
                {(Object.entries(MOOD_THEMES) as [SceneMood, typeof MOOD_THEMES[SceneMood]][]).map(([mood, theme]) => (
                  <button
                    key={mood}
                    onClick={() => setNewScene(p => ({ ...p, mood }))}
                    className={`p-1.5 rounded text-center text-xs transition-all ${
                      newScene.mood === mood
                        ? 'ring-2 ring-gold/40'
                        : 'hover:bg-teal-rich'
                    }`}
                    style={{ backgroundColor: `${theme.color}15` }}
                    title={mood}
                  >
                    <span className="text-base">{theme.icon}</span>
                    <div className="text-[10px]">{mood}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <Label className="text-parchment text-sm">Description</Label>
              <textarea
                value={newScene.description}
                onChange={e => setNewScene(p => ({ ...p, description: e.target.value }))}
                placeholder="A brief summary of what happens in this scene..."
                rows={2}
                className="w-full mt-1 rounded-lg bg-teal-rich/50 border border-gold/20 text-parchment placeholder:text-parchment-muted/50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>

            <div className="col-span-2">
              <Label className="text-parchment text-sm flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-gold" />
                Read-Aloud Narration
              </Label>
              <textarea
                value={newScene.narration}
                onChange={e => setNewScene(p => ({ ...p, narration: e.target.value }))}
                placeholder="The air grows cold as you step through the threshold. The walls seem to breathe..."
                rows={3}
                className="w-full mt-1 rounded-lg bg-gold/5 border border-gold/20 text-parchment placeholder:text-parchment-muted/50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/40 font-serif italic"
              />
            </div>

            {/* Narrative Compass: Feeling / Reveal / Choice */}
            <div className="col-span-2 rounded-lg border border-gold/20 bg-teal-rich/30 p-3 space-y-3">
              <div>
                <h4 className="text-xs font-serif text-gold uppercase tracking-wide">Scene Compass</h4>
                <p className="text-[11px] text-parchment-muted mt-0.5">
                  Three answers keep a scene from drifting. Skip any field if you&apos;re improvising.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-rose-300/90 text-[11px] uppercase tracking-wide">Feeling</Label>
                  <textarea
                    value={newScene.feeling}
                    onChange={e => setNewScene(p => ({ ...p, feeling: e.target.value }))}
                    placeholder="What should the table feel by the end?"
                    rows={2}
                    className="w-full mt-1 rounded bg-rose-950/20 border border-rose-400/20 text-parchment placeholder:text-parchment-muted/40 p-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-rose-400/30"
                  />
                </div>
                <div>
                  <Label className="text-amber-300/90 text-[11px] uppercase tracking-wide">Reveal</Label>
                  <textarea
                    value={newScene.reveal}
                    onChange={e => setNewScene(p => ({ ...p, reveal: e.target.value }))}
                    placeholder="What truth, clue, or escalation surfaces?"
                    rows={2}
                    className="w-full mt-1 rounded bg-amber-950/20 border border-amber-400/20 text-parchment placeholder:text-parchment-muted/40 p-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  />
                </div>
                <div>
                  <Label className="text-indigo-300/90 text-[11px] uppercase tracking-wide">Choice</Label>
                  <textarea
                    value={newScene.choice}
                    onChange={e => setNewScene(p => ({ ...p, choice: e.target.value }))}
                    placeholder="What real decision do the players face?"
                    rows={2}
                    className="w-full mt-1 rounded bg-indigo-950/20 border border-indigo-400/20 text-parchment placeholder:text-parchment-muted/40 p-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-3">
                  <Label className="text-parchment text-[11px] uppercase tracking-wide">Sensory Anchors</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[0, 1, 2].map(i => (
                      <Input
                        key={i}
                        value={newScene.sensory_anchors[i]}
                        onChange={e => setNewScene(p => {
                          const next = [...p.sensory_anchors] as [string, string, string]
                          next[i] = e.target.value
                          return { ...p, sensory_anchors: next }
                        })}
                        placeholder={['Sight', 'Sound', 'Smell/Touch'][i]}
                        className="bg-teal-rich/50 border-gold/20 text-parchment placeholder:text-parchment-muted/40 text-xs h-8"
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-parchment text-[11px] uppercase tracking-wide">Pacing</Label>
                  <div className="grid grid-cols-3 gap-1 mt-1">
                    {(['slow', 'medium', 'fast'] as ScenePacing[]).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewScene(prev => ({ ...prev, pacing: p }))}
                        className={`text-[10px] py-1.5 rounded border transition-all capitalize ${
                          newScene.pacing === p
                            ? 'bg-gold/20 border-gold/40 text-parchment'
                            : 'bg-teal-rich/50 border-gold/10 text-parchment-muted hover:border-gold/30'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <Label className="text-parchment text-sm text-red-400/80">DM Notes (hidden from players)</Label>
              <textarea
                value={newScene.dm_notes}
                onChange={e => setNewScene(p => ({ ...p, dm_notes: e.target.value }))}
                placeholder="The hidden passage is behind the bookshelf. DC 15 Perception..."
                rows={2}
                className="w-full mt-1 rounded-lg bg-red-500/5 border border-red-500/10 text-parchment placeholder:text-parchment-muted/50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            {/* Encounter difficulty calculator (combat/boss scenes) */}
            {(newScene.scene_type === 'combat' || newScene.scene_type === 'boss') && (
              <div className="col-span-2">
                <EncounterDifficulty />
              </div>
            )}

            {/* 3D Scene Environment */}
            {newScene.description && (
              <div className="col-span-2">
                <Label className="text-parchment text-sm flex items-center gap-2">
                  <Box className="w-3 h-3 text-purple-400" />
                  3D Scene Environment
                </Label>
                <p className="text-xs text-parchment-muted mt-1 mb-2">
                  Generate a 3D model of this scene&apos;s environment for immersive play
                </p>
                <Generate3DButton
                  mode="text-to-3d"
                  input={`Fantasy ${newScene.scene_type} scene environment: ${newScene.description}. Mood: ${newScene.mood}. Tabletop RPG diorama style, detailed terrain.`}
                  onComplete={(glbUrl) => setSceneModelUrls(prev => ({ ...prev, new: glbUrl }))}
                  label="Generate 3D Environment"
                  options={{ enable_pbr: true }}
                />
                {sceneModelUrls['new'] && (
                  <div className="mt-3 rounded-lg border border-purple-500/20 overflow-hidden">
                    <ModelViewerCompact modelUrl={sceneModelUrls['new']} className="w-full h-48" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setShowNew(false)} className="text-parchment-muted">
              Cancel
            </Button>
            <Button onClick={handleCreateScene} disabled={loading} className="btn-fantasy">
              <Save className="w-4 h-4 mr-2" />
              Create Scene
            </Button>
          </div>
        </div>
      )}

      {/* Scene List */}
      <div className="space-y-3">
        {scenes.length === 0 ? (
          <div className="story-card text-center py-16">
            <Map className="w-12 h-12 text-parchment-muted mx-auto mb-4" />
            <p className="text-parchment-muted font-serif text-lg">No scenes yet</p>
            <p className="text-parchment-muted text-sm mt-2">Create your first scene to begin building the campaign.</p>
          </div>
        ) : (
          scenes.map((scene, i) => {
            const theme = MOOD_THEMES[scene.mood as SceneMood]
            const sceneTypeInfo = SCENE_TYPES.find(st => st.value === scene.scene_type)
            return (
              <div
                key={scene.id}
                className={`story-card transition-all ${
                  scene.status === 'active' ? 'border-gold/40 shadow-lg shadow-gold/10' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-parchment-muted/30" />
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${theme.color}20`, color: theme.color }}
                    >
                      {sceneTypeInfo?.icon ?? '📜'}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-parchment-muted">Scene {i + 1}</span>
                      <span className="text-xs" style={{ color: theme.color }}>{theme.icon} {scene.mood}</span>
                      <span className="text-xs text-parchment-muted">{scene.scene_type}</span>
                      {scene.status === 'active' && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse">LIVE</span>
                      )}
                      {scene.status === 'completed' && (
                        <span className="text-xs text-parchment-muted">✓ Completed</span>
                      )}
                    </div>
                    <h3 className="text-lg font-serif text-parchment">{scene.title}</h3>
                    {scene.description && (
                      <p className="text-sm text-parchment-muted mt-1">{scene.description}</p>
                    )}
                    {scene.narration && (
                      <p className="text-sm text-parchment/80 mt-2 italic font-serif border-l-2 border-gold/20 pl-3">
                        {scene.narration}
                      </p>
                    )}
                    {(scene.feeling || scene.reveal || scene.choice) && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {scene.feeling && (
                          <div className="rounded bg-rose-950/20 border border-rose-400/20 px-2 py-1.5">
                            <div className="text-[10px] uppercase tracking-wide text-rose-300/80">Feeling</div>
                            <div className="text-parchment/90">{scene.feeling}</div>
                          </div>
                        )}
                        {scene.reveal && (
                          <div className="rounded bg-amber-950/20 border border-amber-400/20 px-2 py-1.5">
                            <div className="text-[10px] uppercase tracking-wide text-amber-300/80">Reveal</div>
                            <div className="text-parchment/90">{scene.reveal}</div>
                          </div>
                        )}
                        {scene.choice && (
                          <div className="rounded bg-indigo-950/20 border border-indigo-400/20 px-2 py-1.5">
                            <div className="text-[10px] uppercase tracking-wide text-indigo-300/80">Choice</div>
                            <div className="text-parchment/90">{scene.choice}</div>
                          </div>
                        )}
                      </div>
                    )}
                    {(scene.sensory_anchors?.length || scene.pacing) && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-parchment-muted">
                        {scene.pacing && (
                          <span className="px-1.5 py-0.5 rounded bg-gold/10 border border-gold/20 text-gold/90 capitalize">
                            {scene.pacing} pacing
                          </span>
                        )}
                        {scene.sensory_anchors?.map((a, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-teal-rich/50 border border-gold/10">
                            {a.label}
                          </span>
                        ))}
                      </div>
                    )}
                    {scene.dm_notes && (
                      <p className="text-xs text-red-400/60 mt-2">🔒 DM: {scene.dm_notes}</p>
                    )}
                    {/* Map preview + generation */}
                    <div className="mt-3 flex items-start gap-3">
                      {(scene as { map_url?: string | null }).map_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={(scene as { map_url?: string }).map_url}
                          alt={`Map for ${scene.title}`}
                          className="w-32 h-32 object-cover rounded border border-gold/20"
                        />
                      ) : null}
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => handleGenerateMap(scene.id)}
                          disabled={generatingMapFor === scene.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gold/30 text-parchment hover:bg-gold/10 text-xs disabled:opacity-50"
                          title="Generate an AI map illustration for this scene"
                        >
                          {generatingMapFor === scene.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <ImageIcon className="w-3 h-3" />
                          )}
                          {(scene as { map_url?: string | null }).map_url ? 'Regenerate Map' : 'Generate Map'}
                        </button>
                        {mapError && mapError.sceneId === scene.id && (
                          <p className="text-xs text-red-400 max-w-xs">
                            {mapError.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
