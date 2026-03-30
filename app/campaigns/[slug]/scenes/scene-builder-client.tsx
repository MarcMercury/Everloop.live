'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createScene, updateScene } from '@/lib/actions/campaigns'
import { MOOD_THEMES } from '@/types/campaign'
import type { Campaign, CampaignScene, CampaignSceneUpdate, SceneType, SceneMood } from '@/types/campaign'
import { ArrowLeft, Plus, Save, Map, Sparkles, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  campaign: Campaign
  scenes: CampaignScene[]
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

  const [newScene, setNewScene] = useState({
    title: '',
    description: '',
    scene_type: 'narrative' as SceneType,
    mood: 'neutral' as SceneMood,
    narration: '',
    dm_notes: '',
  })

  async function handleCreateScene() {
    if (!newScene.title.trim()) return
    setLoading(true)
    const result = await createScene({
      campaign_id: campaign.id,
      title: newScene.title.trim(),
      description: newScene.description.trim() || undefined,
      scene_type: newScene.scene_type,
      mood: newScene.mood,
      narration: newScene.narration.trim() || undefined,
      dm_notes: newScene.dm_notes.trim() || undefined,
    })
    if (result.success && result.scene) {
      setScenes(prev => [...prev, result.scene!])
      setNewScene({ title: '', description: '', scene_type: 'narrative', mood: 'neutral', narration: '', dm_notes: '' })
      setShowNew(false)
    }
    setLoading(false)
  }

  async function handleUpdateScene(sceneId: string, updates: CampaignSceneUpdate) {
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
        <Link href={`/campaigns/${campaign.slug}`} className="hover:text-parchment transition-colors flex items-center gap-1">
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
        <Button onClick={() => setShowNew(!showNew)} className="btn-fantasy gap-2">
          <Plus className="w-4 h-4" />
          Add Scene
        </Button>
      </div>

      {/* New Scene Form */}
      {showNew && (
        <div className="story-card mb-8 border-gold/30">
          <h3 className="text-lg font-serif text-parchment mb-4">New Scene</h3>
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
                    {scene.dm_notes && (
                      <p className="text-xs text-red-400/60 mt-2">🔒 DM: {scene.dm_notes}</p>
                    )}
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
