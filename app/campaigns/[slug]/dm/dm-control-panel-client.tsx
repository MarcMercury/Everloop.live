'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  startSession, endSession, changeScene, sendMessage,
  rollDiceAction, grantIdol, updateScene,
} from '@/lib/actions/campaigns'
import { generateAINarration, generateSceneNarration, generateConsequence } from '@/lib/actions/ai-dm'
import { MOOD_THEMES, IDOL_DEFINITIONS } from '@/types/campaign'
import type {
  Campaign, CampaignPlayer, CampaignScene, CampaignSession,
  CampaignMessage, CampaignNpc, NarrativeIdol,
  SceneMood, IdolPower, IdolType,
} from '@/types/campaign'
import {
  Play, Square, ArrowLeft, Send, Dice1, Crown, Users, Map,
  Volume2, Eye, EyeOff, Sparkles, Flame, Shield, MessageSquare,
  ChevronRight, Zap, Gift, SkipForward, AlertTriangle, Bot, Box,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AtmosphereEngine } from '@/components/campaign/atmosphere-engine'
import { Generate3DButton } from '@/components/3d/generate-3d-button'
import { ModelViewerCompact } from '@/components/3d/model-viewer'

interface Props {
  campaign: Campaign
  players: CampaignPlayer[]
  scenes: CampaignScene[]
  session: CampaignSession | null
  messages: CampaignMessage[]
  npcs: CampaignNpc[]
  idols: NarrativeIdol[]
  userId: string
}

export function DMControlPanelClient({
  campaign,
  players,
  scenes,
  session: initialSession,
  messages: initialMessages,
  npcs,
  idols,
  userId,
}: Props) {
  const router = useRouter()
  const [session, setSession] = useState(initialSession)
  const [messages, setMessages] = useState(initialMessages)
  const [activeTab, setActiveTab] = useState<'narrate' | 'players' | 'scenes' | 'npcs' | 'idols' | 'dice'>('narrate')
  const [messageInput, setMessageInput] = useState('')
  const [narrationInput, setNarrationInput] = useState('')
  const [whisperTarget, setWhisperTarget] = useState<string | null>(null)
  const [diceFormula, setDiceFormula] = useState('1d20')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeScene = scenes.find(s => s.id === session?.active_scene_id)
  const moodTheme = activeScene ? MOOD_THEMES[activeScene.mood as SceneMood] : MOOD_THEMES.neutral

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages
  useEffect(() => {
    if (!session) return
    const interval = setInterval(async () => {
      const res = await fetch(`/api/campaigns/${campaign.id}/messages?session_id=${session.id}&after=${messages[messages.length - 1]?.created_at ?? ''}`)
      if (res.ok) {
        const data = await res.json()
        if (data.messages?.length > 0) {
          setMessages(prev => [...prev, ...data.messages])
        }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [session, campaign.id, messages])

  async function handleStartSession() {
    setLoading(true)
    const result = await startSession(campaign.id)
    if (result.success && result.session) {
      setSession(result.session)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleEndSession() {
    if (!session) return
    setLoading(true)
    await endSession(session.id, campaign.id)
    setSession(null)
    router.refresh()
    setLoading(false)
  }

  async function handleSendChat() {
    if (!session || !messageInput.trim()) return
    const result = await sendMessage({
      session_id: session.id,
      campaign_id: campaign.id,
      message_type: whisperTarget ? 'whisper' : 'chat',
      content: messageInput.trim(),
      visible_to: whisperTarget ? [whisperTarget, userId] : [],
      character_name: 'DM',
    })
    if (result.success && result.message) {
      setMessages(prev => [...prev, result.message!])
    }
    setMessageInput('')
    setWhisperTarget(null)
  }

  async function handleNarrate() {
    if (!session || !narrationInput.trim()) return
    const result = await sendMessage({
      session_id: session.id,
      campaign_id: campaign.id,
      message_type: 'narration',
      content: narrationInput.trim(),
      character_name: 'Narrator',
    })
    if (result.success && result.message) {
      setMessages(prev => [...prev, result.message!])
    }
    setNarrationInput('')
  }

  async function handleChangeScene(sceneId: string) {
    if (!session) return
    setLoading(true)
    await changeScene(session.id, sceneId, campaign.id)
    router.refresh()
    setLoading(false)
  }

  async function handleDMRoll() {
    if (!session) return
    const result = await rollDiceAction({
      session_id: session.id,
      campaign_id: campaign.id,
      roll_type: 'custom',
      dice_formula: diceFormula,
      character_name: 'DM',
    })
    if (result.success) router.refresh()
  }

  async function handleGrantIdol(playerId: string, power: IdolPower) {
    if (!session) return
    const def = IDOL_DEFINITIONS[power]
    await grantIdol({
      campaign_id: campaign.id,
      player_id: playerId,
      session_id: session.id,
      name: def.name,
      description: def.description,
      idol_type: def.type,
      power,
      visual: def.visual,
      reason: 'Granted by the DM',
    })
    router.refresh()
  }

  async function handleAINarrate(type: 'narration' | 'event' | 'consequence' | 'description') {
    if (!session || !aiPrompt.trim()) return
    setAiLoading(true)
    const result = await generateAINarration({
      campaignId: campaign.id,
      sessionId: session.id,
      prompt: aiPrompt.trim(),
      context: {
        sceneMood: activeScene?.mood,
        sceneDescription: activeScene?.narration ?? undefined,
        activeNpcs: npcs.map(n => n.name),
        playerNames: players.map(p => {
          const c = p.character as { name: string } | null
          return c?.name ?? 'Unknown'
        }),
      },
      type,
    })
    if (result.success && result.content) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        session_id: session.id,
        campaign_id: campaign.id,
        sender_id: userId,
        message_type: 'ai_narration',
        content: result.content,
        character_name: 'AI Co-DM',
        reference_data: { ai_generated: true },
        roll_data: null,
        is_hidden: false,
        visible_to: [],
        sender: null,
        created_at: new Date().toISOString(),
      } as unknown as CampaignMessage])
    }
    setAiPrompt('')
    setAiLoading(false)
  }

  async function handleAISceneNarration() {
    if (!session || !activeScene) return
    setAiLoading(true)
    const result = await generateSceneNarration(
      campaign.id,
      session.id,
      activeScene.title,
      activeScene.mood,
      activeScene.narration,
    )
    if (result.success && result.content) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        session_id: session.id,
        campaign_id: campaign.id,
        sender_id: userId,
        message_type: 'ai_narration',
        content: result.content,
        character_name: 'AI Co-DM',
        reference_data: { ai_generated: true },
        roll_data: null,
        is_hidden: false,
        visible_to: [],
        sender: null,
        created_at: new Date().toISOString(),
      } as unknown as CampaignMessage])
    }
    setAiLoading(false)
  }

  async function handleMoodChange(mood: SceneMood) {
    if (!activeScene) return
    await updateScene(activeScene.id, campaign.id, { mood })
    // Send system message
    if (session) {
      const theme = MOOD_THEMES[mood]
      await sendMessage({
        session_id: session.id,
        campaign_id: campaign.id,
        message_type: 'system',
        content: `${theme.icon} The atmosphere shifts to ${mood}...`,
      })
    }
    router.refresh()
  }

  return (
    <div className="h-screen flex flex-col bg-charcoal overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-teal-rich border-b border-gold/10">
        <div className="flex items-center gap-4">
          <Link href={`/campaigns/${campaign.slug}`} className="text-parchment-muted hover:text-parchment">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-serif text-parchment">{campaign.title}</h1>
            <div className="flex items-center gap-2 text-xs text-parchment-muted">
              <Crown className="w-3 h-3 text-gold" />
              DM Control Panel
              {session && (
                <>
                  <span>·</span>
                  <span className="text-green-400">Session {session.session_number} LIVE</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!session ? (
            <Button onClick={handleStartSession} disabled={loading} className="btn-fantasy text-sm gap-2">
              <Play className="w-4 h-4" />
              Start Session
            </Button>
          ) : (
            <Button onClick={handleEndSession} disabled={loading} variant="destructive" className="text-sm gap-2">
              <Square className="w-4 h-4" />
              End Session
            </Button>
          )}
        </div>
      </div>

      {/* Main Layout: 3 columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Tab Navigation */}
        <div className="w-12 bg-teal-deep border-r border-gold/10 flex flex-col items-center py-2 gap-1">
          {[
            { id: 'narrate' as const, icon: MessageSquare, label: 'Narrate' },
            { id: 'players' as const, icon: Users, label: 'Players' },
            { id: 'scenes' as const, icon: Map, label: 'Scenes' },
            { id: 'npcs' as const, icon: Shield, label: 'NPCs' },
            { id: 'idols' as const, icon: Sparkles, label: 'Idols' },
            { id: 'dice' as const, icon: Dice1, label: 'Dice' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                activeTab === tab.id
                  ? 'bg-gold/20 text-gold'
                  : 'text-parchment-muted hover:text-parchment hover:bg-teal-rich'
              }`}
              title={tab.label}
            >
              <tab.icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        {/* Center: Active Tab Content */}
        <div className="w-80 bg-teal-deep/50 border-r border-gold/10 flex flex-col overflow-hidden">
          {activeTab === 'narrate' && (
            <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
              <h3 className="text-sm font-serif text-parchment">Narration</h3>
              {/* Active Scene Info */}
              {activeScene && (
                <div className="p-3 rounded-lg border border-gold/10" style={{ background: `${moodTheme.color}10` }}>
                  <div className="text-xs text-parchment-muted mb-1">Active Scene</div>
                  <div className="text-sm text-parchment font-medium">{activeScene.title}</div>
                  <div className="text-xs text-parchment-muted mt-1">{moodTheme.icon} {activeScene.mood} · {activeScene.scene_type}</div>
                </div>
              )}
              {/* Read-aloud narration */}
              <div>
                <label className="text-xs text-parchment-muted mb-1 block">Read Aloud</label>
                <textarea
                  value={narrationInput}
                  onChange={e => setNarrationInput(e.target.value)}
                  placeholder="The ground trembles as reality folds..."
                  rows={4}
                  className="w-full rounded-lg bg-teal-rich/50 border border-gold/20 text-parchment placeholder:text-parchment-muted/50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/40"
                />
                <Button onClick={handleNarrate} className="w-full mt-2 btn-fantasy text-sm" disabled={!session}>
                  Narrate
                </Button>
              </div>
              {/* Mood Switcher */}
              <div>
                <label className="text-xs text-parchment-muted mb-2 block">Mood</label>
                <div className="grid grid-cols-5 gap-1">
                  {(Object.entries(MOOD_THEMES) as [SceneMood, typeof MOOD_THEMES[SceneMood]][]).map(([mood, theme]) => (
                    <button
                      key={mood}
                      onClick={() => handleMoodChange(mood)}
                      className={`p-2 rounded text-center transition-all ${
                        activeScene?.mood === mood
                          ? 'ring-2 ring-gold/40'
                          : 'hover:bg-teal-rich'
                      }`}
                      style={{ backgroundColor: `${theme.color}15` }}
                      title={mood}
                    >
                      <span className="text-lg">{theme.icon}</span>
                      <div className="text-[10px] text-parchment-muted mt-0.5">{mood}</div>
                    </button>
                  ))}
                </div>
              </div>
              {/* AI Co-DM */}
              <div className="border-t border-gold/10 pt-4">
                <label className="text-xs text-parchment-muted mb-1 flex items-center gap-1">
                  <Bot className="w-3 h-3" /> AI Co-DM
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Describe what you need: a scene transition, NPC reaction, event..."
                  rows={2}
                  className="w-full rounded-lg bg-violet-500/5 border border-violet-500/20 text-parchment placeholder:text-parchment-muted/50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
                <div className="grid grid-cols-2 gap-1 mt-2">
                  <Button
                    onClick={() => handleAINarrate('narration')}
                    disabled={!session || aiLoading || !aiPrompt.trim()}
                    variant="outline"
                    className="text-xs border-violet-500/20 text-violet-300 hover:bg-violet-500/10"
                  >
                    Narrate
                  </Button>
                  <Button
                    onClick={() => handleAINarrate('event')}
                    disabled={!session || aiLoading || !aiPrompt.trim()}
                    variant="outline"
                    className="text-xs border-violet-500/20 text-violet-300 hover:bg-violet-500/10"
                  >
                    Event
                  </Button>
                  <Button
                    onClick={() => handleAINarrate('consequence')}
                    disabled={!session || aiLoading || !aiPrompt.trim()}
                    variant="outline"
                    className="text-xs border-violet-500/20 text-violet-300 hover:bg-violet-500/10"
                  >
                    Consequence
                  </Button>
                  <Button
                    onClick={handleAISceneNarration}
                    disabled={!session || aiLoading || !activeScene}
                    variant="outline"
                    className="text-xs border-violet-500/20 text-violet-300 hover:bg-violet-500/10"
                  >
                    Auto-Describe Scene
                  </Button>
                </div>
                {aiLoading && (
                  <div className="text-xs text-violet-400 mt-2 animate-pulse">AI is composing...</div>
                )}
              </div>
              {/* Quick DM Notes */}
              {activeScene?.dm_notes && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                  <div className="text-xs text-red-400 mb-1 flex items-center gap-1">
                    <EyeOff className="w-3 h-3" /> DM Notes (hidden)
                  </div>
                  <div className="text-xs text-parchment-muted">{activeScene.dm_notes}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'players' && (
            <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
              <h3 className="text-sm font-serif text-parchment">Party ({players.length})</h3>
              {players.map(player => {
                const pUser = player.user as { username: string; display_name: string | null; avatar_url: string | null } | null
                const char = player.character as { name: string; class: string; level: number; current_hp: number; max_hp: number; armor_class: number; theme_color: string } | null
                const hpPct = char ? (char.current_hp / char.max_hp) * 100 : 100
                return (
                  <div key={player.id} className="p-3 rounded-lg bg-teal-rich/50 border border-gold/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-parchment font-medium">{char?.name ?? pUser?.display_name ?? pUser?.username}</div>
                      <button
                        onClick={() => setWhisperTarget(player.user_id)}
                        className="text-xs text-gold hover:text-gold/80"
                        title="Whisper to this player"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </button>
                    </div>
                    {char && (
                      <>
                        <div className="text-xs text-parchment-muted mb-1">
                          Lvl {char.level} {char.class} · AC {char.armor_class}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-teal-rich overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.max(0, hpPct)}%` }}
                            />
                          </div>
                          <span className="text-xs text-parchment-muted">{char.current_hp}/{char.max_hp}</span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-parchment-muted">
                      <span>Rolls: {player.total_rolls}</span>
                      <span>·</span>
                      <span className="text-green-400">Crits: {player.critical_hits}</span>
                      <span>·</span>
                      <span className="text-red-400">Fails: {player.critical_fails}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'scenes' && (
            <div className="flex-1 flex flex-col p-4 gap-2 overflow-y-auto">
              <h3 className="text-sm font-serif text-parchment">Scenes</h3>
              {scenes.map((scene, i) => {
                const theme = MOOD_THEMES[scene.mood as SceneMood]
                const isActive = scene.id === session?.active_scene_id
                return (
                  <button
                    key={scene.id}
                    onClick={() => handleChangeScene(scene.id)}
                    disabled={isActive || !session}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gold/10 border border-gold/30 ring-1 ring-gold/20'
                        : 'bg-teal-rich/50 border border-gold/5 hover:border-gold/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: theme?.color }}>{theme?.icon}</span>
                      <span className="text-sm text-parchment">{scene.title}</span>
                      {isActive && <span className="ml-auto text-xs text-green-400">● LIVE</span>}
                    </div>
                    <div className="text-xs text-parchment-muted mt-1">{scene.scene_type} · {scene.mood}</div>
                    {scene.narration && (
                      <div className="text-xs text-parchment-muted/60 mt-1 italic line-clamp-2">{scene.narration}</div>
                    )}
                  </button>
                )
              })}
              <Link
                href={`/campaigns/${campaign.slug}/scenes`}
                className="text-sm text-gold hover:text-gold/80 text-center mt-2"
              >
                + Build More Scenes
              </Link>
            </div>
          )}

          {activeTab === 'npcs' && (
            <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
              <h3 className="text-sm font-serif text-parchment">NPCs ({npcs.length})</h3>
              {npcs.map(npc => (
                <div key={npc.id} className="p-3 rounded-lg bg-teal-rich/50 border border-gold/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-parchment">{npc.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      npc.npc_type === 'enemy' ? 'bg-red-500/20 text-red-400' :
                      npc.npc_type === 'ally' ? 'bg-green-500/20 text-green-400' :
                      npc.npc_type === 'boss' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>{npc.npc_type}</span>
                  </div>
                  {npc.personality && <p className="text-xs text-parchment-muted mt-1 line-clamp-2">{npc.personality}</p>}
                  {npc.secrets && (
                    <div className="text-xs text-red-400/60 mt-1 flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> {npc.secrets}
                    </div>
                  )}
                  {/* Generate 3D Model for NPC */}
                  <div className="mt-2 pt-2 border-t border-gold/5">
                    <Generate3DButton
                      mode="text-to-3d"
                      input={`Fantasy RPG ${npc.npc_type} NPC miniature: ${npc.name}. ${npc.personality || ''} ${npc.description || 'detailed fantasy character'}. Tabletop RPG miniature style.`}
                      onComplete={() => {}}
                      label="Generate 3D"
                      size="sm"
                      options={{ pose_mode: 'a-pose', enable_pbr: true }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'idols' && (
            <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
              <h3 className="text-sm font-serif text-parchment">Narrative Idols</h3>
              <p className="text-xs text-parchment-muted">Grant idols to reward players. They can use them to bend reality.</p>
              {session && (
                <div>
                  <label className="text-xs text-parchment-muted mb-1 block">Grant Idol To:</label>
                  {players.map(player => {
                    const pUser = player.user as { display_name: string | null; username: string } | null
                    return (
                      <div key={player.id} className="mb-2">
                        <div className="text-xs text-parchment mb-1">{pUser?.display_name ?? pUser?.username}</div>
                        <div className="flex flex-wrap gap-1">
                          {(Object.entries(IDOL_DEFINITIONS) as [IdolPower, typeof IDOL_DEFINITIONS[IdolPower]][]).map(([power, def]) => (
                            <button
                              key={power}
                              onClick={() => handleGrantIdol(player.user_id, power)}
                              className="px-2 py-1 text-xs rounded bg-teal-rich/50 border border-gold/10 hover:border-gold/30 text-parchment-muted hover:text-parchment transition-all"
                              title={def.description}
                            >
                              {def.visual} {def.name.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {/* Active Idols */}
              <div className="mt-2">
                <h4 className="text-xs text-parchment-muted uppercase tracking-wider mb-2">Active Idols</h4>
                {idols.filter(i => i.status === 'held').map(idol => (
                  <div key={idol.id} className="p-2 rounded bg-gold/5 border border-gold/10 mb-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-parchment">{idol.name}</span>
                      <span className="text-xs text-gold">{idol.idol_type}</span>
                    </div>
                    <div className="text-xs text-parchment-muted">{idol.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dice' && (
            <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
              <h3 className="text-sm font-serif text-parchment">DM Dice</h3>
              <div className="flex gap-2">
                <Input
                  value={diceFormula}
                  onChange={e => setDiceFormula(e.target.value)}
                  placeholder="1d20+5"
                  className="bg-teal-rich/50 border-gold/20 text-parchment"
                />
                <Button onClick={handleDMRoll} className="btn-fantasy" disabled={!session}>
                  <Dice1 className="w-4 h-4" />
                </Button>
              </div>
              {/* Quick rolls */}
              <div className="grid grid-cols-4 gap-1">
                {['1d4', '1d6', '1d8', '1d10', '1d12', '1d20', '2d6', '1d100'].map(formula => (
                  <button
                    key={formula}
                    onClick={() => setDiceFormula(formula)}
                    className="p-2 text-xs rounded bg-teal-rich/50 border border-gold/10 hover:border-gold/30 text-parchment-muted hover:text-parchment transition-all"
                  >
                    {formula}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Message Feed */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scene Atmosphere Banner */}
          {activeScene && (
            <div
              className={`px-4 py-2 border-b border-gold/10 bg-gradient-to-r ${moodTheme.bgGradient}`}
            >
              <div className="flex items-center gap-2 text-sm">
                <span>{moodTheme.icon}</span>
                <span className="text-parchment font-serif">{activeScene.title}</span>
                <span className="text-parchment-muted">·</span>
                <span className="text-parchment-muted text-xs">{activeScene.mood}</span>
                <AtmosphereEngine mood={activeScene.mood as SceneMood} isActive={!!session} showControls={true} />
                {session?.is_combat && (
                  <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    ⚔️ Combat · Round {session.round_number}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {!session ? (
              <div className="flex-1 flex items-center justify-center text-parchment-muted">
                <div className="text-center">
                  <Flame className="w-12 h-12 mx-auto mb-4 text-gold/30" />
                  <p className="font-serif text-lg">No Active Session</p>
                  <p className="text-sm mt-2">Start a session to begin your campaign.</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-parchment-muted text-sm py-8">
                Session started. The story begins...
              </div>
            ) : (
              messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} userId={userId} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          {session && (
            <div className="px-4 py-3 border-t border-gold/10 bg-teal-rich/50">
              {whisperTarget && (
                <div className="flex items-center gap-2 mb-2 text-xs text-purple-400">
                  <EyeOff className="w-3 h-3" />
                  Whispering to {players.find(p => p.user_id === whisperTarget)?.user?.username ?? 'player'}
                  <button onClick={() => setWhisperTarget(null)} className="text-parchment-muted hover:text-parchment ml-2">×</button>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                  placeholder={whisperTarget ? 'Whisper...' : 'Send a message as DM...'}
                  className="bg-teal-rich/50 border-gold/20 text-parchment placeholder:text-parchment-muted/50"
                />
                <Button onClick={handleSendChat} className="btn-fantasy">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message, userId }: { message: CampaignMessage; userId: string }) {
  const isOwn = message.sender_id === userId
  const sender = message.sender as { username: string; display_name: string | null } | null

  const typeStyles: Record<string, string> = {
    chat: 'bg-teal-rich/50 border-gold/5',
    whisper: 'bg-purple-500/10 border-purple-500/20 italic',
    narration: 'bg-gold/5 border-gold/20 font-serif text-parchment',
    system: 'bg-teal-rich/30 border-gold/5 text-parchment-muted text-center',
    roll: 'bg-blue-500/10 border-blue-500/20',
    ai_narration: 'bg-violet-500/10 border-violet-500/20 font-serif',
    event: 'bg-orange-500/10 border-orange-500/20',
    idol: 'bg-gold/10 border-gold/30',
  }

  return (
    <div className={`p-3 rounded-lg border ${typeStyles[message.message_type] ?? typeStyles.chat} transition-all`}>
      {message.message_type !== 'system' && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium" style={{ color: message.message_type === 'narration' ? '#d4a84b' : '#a89888' }}>
            {message.character_name ?? sender?.display_name ?? sender?.username ?? 'Unknown'}
          </span>
          {message.message_type === 'whisper' && <EyeOff className="w-3 h-3 text-purple-400" />}
          {message.message_type === 'roll' && <Dice1 className="w-3 h-3 text-blue-400" />}
          {message.message_type === 'idol' && <Sparkles className="w-3 h-3 text-gold" />}
          {message.message_type === 'event' && <Zap className="w-3 h-3 text-orange-400" />}
          <span className="text-[10px] text-parchment-muted ml-auto">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
      <div className={`text-sm ${message.message_type === 'narration' ? 'text-parchment leading-relaxed' : 'text-parchment-dark'}`}>
        {message.content}
      </div>
    </div>
  )
}
