'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sendMessage, rollDiceAction, useIdol } from '@/lib/actions/campaigns'
import { MOOD_THEMES, IDOL_DEFINITIONS } from '@/types/campaign'
import type {
  Campaign, CampaignPlayer, CampaignScene, CampaignSession,
  CampaignMessage, NarrativeIdol, SceneMood, RollType,
} from '@/types/campaign'
import {
  Send, Dice1, Users, Heart, Shield, Sparkles, Eye,
  Swords, ArrowLeft, Flame, Zap, EyeOff, MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AtmosphereEngine } from '@/components/campaign/atmosphere-engine'

interface Props {
  campaign: Campaign
  player: CampaignPlayer
  players: CampaignPlayer[]
  session: CampaignSession
  activeScene: CampaignScene | null
  messages: CampaignMessage[]
  idols: NarrativeIdol[]
  userId: string
}

export function PlayerSessionClient({
  campaign,
  player,
  players,
  session,
  activeScene,
  messages: initialMessages,
  idols: initialIdols,
  userId,
}: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState(initialMessages)
  const [idols, setIdols] = useState(initialIdols)
  const [chatInput, setChatInput] = useState('')
  const [showDice, setShowDice] = useState(false)
  const [showIdols, setShowIdols] = useState(false)
  const [showParty, setShowParty] = useState(false)
  const [diceFormula, setDiceFormula] = useState('1d20')
  const [rollType, setRollType] = useState<RollType>('ability_check')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const char = player.character as { name: string; class: string; level: number; race: string; current_hp: number; max_hp: number; armor_class: number; theme_color: string; portrait_url: string | null } | null
  const moodTheme = activeScene ? MOOD_THEMES[activeScene.mood as SceneMood] : MOOD_THEMES.neutral
  const hpPct = char ? (char.current_hp / char.max_hp) * 100 : 100

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for messages
  useEffect(() => {
    const interval = setInterval(async () => {
      const after = messages[messages.length - 1]?.created_at ?? ''
      const res = await fetch(`/api/campaigns/${campaign.id}/messages?session_id=${session.id}&after=${after}`)
      if (res.ok) {
        const data = await res.json()
        if (data.messages?.length > 0) {
          setMessages(prev => [...prev, ...data.messages])
        }
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [session.id, campaign.id, messages])

  async function handleSendChat() {
    if (!chatInput.trim()) return
    setLoading(true)
    const result = await sendMessage({
      session_id: session.id,
      campaign_id: campaign.id,
      message_type: 'chat',
      content: chatInput.trim(),
      character_name: char?.name ?? 'Player',
    })
    if (result.success && result.message) {
      setMessages(prev => [...prev, result.message!])
    }
    setChatInput('')
    setLoading(false)
  }

  async function handleRoll() {
    if (!diceFormula.trim()) return
    setLoading(true)
    const result = await rollDiceAction({
      session_id: session.id,
      campaign_id: campaign.id,
      roll_type: rollType,
      dice_formula: diceFormula,
      character_name: char?.name ?? 'Player',
    })
    if (result.success) {
      router.refresh()
    }
    setLoading(false)
    setShowDice(false)
  }

  async function handleUseIdol(idol: NarrativeIdol) {
    const effect = prompt(`Describe how you use "${idol.name}" (${IDOL_DEFINITIONS[idol.power as keyof typeof IDOL_DEFINITIONS]?.description ?? idol.power}):`)
    if (!effect) return
    setLoading(true)
    await useIdol(idol.id, session.id, campaign.id, effect)
    setIdols(prev => prev.filter(i => i.id !== idol.id))
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="h-screen flex flex-col bg-charcoal overflow-hidden">
      {/* Top Bar - Scene Atmosphere */}
      <div className={`px-4 py-3 border-b border-gold/10 bg-gradient-to-r ${moodTheme.bgGradient}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/campaigns/${campaign.slug}`} className="text-parchment-muted hover:text-parchment">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{moodTheme.icon}</span>
                <h1 className="text-lg font-serif text-parchment">
                  {activeScene?.title ?? campaign.title}
                </h1>
              </div>
              <div className="text-xs text-parchment-muted flex items-center gap-2">
                <span>{activeScene?.scene_type ?? 'narrative'}</span>
                <span>·</span>
                <span>Session {session.session_number}</span>
                {session.is_combat && (
                  <>
                    <span>·</span>
                    <span className="text-red-400">⚔️ Round {session.round_number}</span>
                  </>
                )}
                <AtmosphereEngine mood={activeScene?.mood as SceneMood ?? 'neutral'} isActive={true} showControls={true} />
              </div>
            </div>
          </div>

          {/* Character Quick Stats */}
          {char && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-parchment font-serif">{char.name}</div>
                <div className="text-xs text-parchment-muted">Lvl {char.level} {char.class}</div>
              </div>
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-teal-rich/80 border border-gold/10">
                <div className="flex items-center gap-1">
                  <Heart className={`w-4 h-4 ${hpPct > 50 ? 'text-green-400' : hpPct > 25 ? 'text-amber-400' : 'text-red-400'}`} />
                  <span className="text-sm text-parchment">{char.current_hp}/{char.max_hp}</span>
                </div>
                <div className="w-px h-4 bg-gold/20" />
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-parchment">{char.armor_class}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Message Feed */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scene Narration Banner */}
          {activeScene?.narration && (
            <div className="px-6 py-4 bg-gold/5 border-b border-gold/10">
              <p className="text-sm font-serif text-parchment leading-relaxed italic">
                {activeScene.narration}
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {messages.map(msg => (
              <PlayerMessageBubble key={msg.id} message={msg} userId={userId} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="px-4 py-3 border-t border-gold/10 bg-teal-rich/50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowDice(!showDice); setShowIdols(false); setShowParty(false) }}
                className={`p-2 rounded-lg transition-all ${showDice ? 'bg-blue-500/20 text-blue-400' : 'text-parchment-muted hover:text-parchment hover:bg-teal-rich'}`}
                title="Roll Dice"
              >
                <Dice1 className="w-5 h-5" />
              </button>
              <button
                onClick={() => { setShowIdols(!showIdols); setShowDice(false); setShowParty(false) }}
                className={`p-2 rounded-lg transition-all ${showIdols ? 'bg-gold/20 text-gold' : 'text-parchment-muted hover:text-parchment hover:bg-teal-rich'} relative`}
                title="Narrative Idols"
              >
                <Sparkles className="w-5 h-5" />
                {idols.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-charcoal text-[10px] flex items-center justify-center font-bold">
                    {idols.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => { setShowParty(!showParty); setShowDice(false); setShowIdols(false) }}
                className={`p-2 rounded-lg transition-all ${showParty ? 'bg-green-500/20 text-green-400' : 'text-parchment-muted hover:text-parchment hover:bg-teal-rich'}`}
                title="Party"
              >
                <Users className="w-5 h-5" />
              </button>
              <Input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                placeholder={`Speak as ${char?.name ?? 'your character'}...`}
                className="flex-1 bg-teal-rich/50 border-gold/20 text-parchment placeholder:text-parchment-muted/50"
              />
              <Button onClick={handleSendChat} disabled={loading} className="btn-fantasy">
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Dice Panel */}
            {showDice && (
              <div className="mt-3 p-4 rounded-lg bg-teal-rich border border-blue-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <select
                    value={rollType}
                    onChange={e => setRollType(e.target.value as RollType)}
                    className="text-xs bg-teal-deep text-parchment rounded border border-gold/20 px-2 py-1"
                  >
                    <option value="ability_check">Ability Check</option>
                    <option value="saving_throw">Saving Throw</option>
                    <option value="attack">Attack</option>
                    <option value="damage">Damage</option>
                    <option value="skill_check">Skill Check</option>
                    <option value="initiative">Initiative</option>
                    <option value="custom">Custom</option>
                  </select>
                  <Input
                    value={diceFormula}
                    onChange={e => setDiceFormula(e.target.value)}
                    placeholder="1d20+5"
                    className="flex-1 bg-teal-deep border-gold/20 text-parchment text-sm"
                  />
                  <Button onClick={handleRoll} disabled={loading} className="btn-fantasy text-sm">
                    🎲 Roll
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['1d20', '1d20+2', '1d20+4', '1d20+6', '2d6', '1d8+3', '1d10+4', '4d6'].map(f => (
                    <button
                      key={f}
                      onClick={() => setDiceFormula(f)}
                      className="px-2 py-1 text-xs rounded bg-teal-deep border border-gold/10 hover:border-gold/30 text-parchment-muted hover:text-parchment transition-all"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Idols Panel */}
            {showIdols && (
              <div className="mt-3 p-4 rounded-lg bg-teal-rich border border-gold/20">
                <h4 className="text-sm font-serif text-gold mb-3">Your Narrative Idols</h4>
                {idols.length === 0 ? (
                  <p className="text-xs text-parchment-muted">You have no idols. Earn them through gameplay.</p>
                ) : (
                  <div className="space-y-2">
                    {idols.map(idol => {
                      const def = IDOL_DEFINITIONS[idol.power as keyof typeof IDOL_DEFINITIONS]
                      return (
                        <button
                          key={idol.id}
                          onClick={() => handleUseIdol(idol)}
                          className="w-full text-left p-3 rounded-lg bg-gold/5 border border-gold/20 hover:border-gold/40 transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{def?.visual ?? '❓'}</span>
                            <div className="flex-1">
                              <div className="text-sm text-parchment">{idol.name}</div>
                              <div className="text-xs text-parchment-muted">{def?.description ?? idol.description}</div>
                            </div>
                            <span className="text-xs text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                              USE →
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Party Panel */}
            {showParty && (
              <div className="mt-3 p-4 rounded-lg bg-teal-rich border border-green-500/20">
                <h4 className="text-sm font-serif text-parchment mb-3">Party</h4>
                <div className="space-y-2">
                  {players.map(p => {
                    const pChar = p.character as { name: string; class: string; level: number; current_hp: number; max_hp: number; armor_class: number } | null
                    const pUser = p.user as { display_name: string | null; username: string } | null
                    const pHpPct = pChar ? (pChar.current_hp / pChar.max_hp) * 100 : 100
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded bg-teal-deep/50">
                        <div className="flex-1">
                          <div className="text-sm text-parchment">{pChar?.name ?? pUser?.display_name ?? pUser?.username}</div>
                          {pChar && <div className="text-xs text-parchment-muted">Lvl {pChar.level} {pChar.class}</div>}
                        </div>
                        {pChar && (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-teal-rich overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  pHpPct > 50 ? 'bg-green-500' : pHpPct > 25 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.max(0, pHpPct)}%` }}
                              />
                            </div>
                            <span className="text-xs text-parchment-muted">{pChar.current_hp}/{pChar.max_hp}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayerMessageBubble({ message, userId }: { message: CampaignMessage; userId: string }) {
  const isOwn = message.sender_id === userId
  const sender = message.sender as { username: string; display_name: string | null } | null

  const typeConfig: Record<string, { bg: string; nameColor: string; icon?: React.ReactNode }> = {
    chat: { bg: 'bg-teal-rich/50 border-gold/5', nameColor: '#a89888' },
    whisper: { bg: 'bg-purple-500/10 border-purple-500/20', nameColor: '#c084fc', icon: <EyeOff className="w-3 h-3 text-purple-400" /> },
    narration: { bg: 'bg-gold/5 border-gold/20', nameColor: '#d4a84b' },
    system: { bg: 'bg-teal-rich/30 border-gold/5', nameColor: '#64748b' },
    roll: { bg: 'bg-blue-500/10 border-blue-500/20', nameColor: '#60a5fa', icon: <Dice1 className="w-3 h-3 text-blue-400" /> },
    ai_narration: { bg: 'bg-violet-500/10 border-violet-500/20', nameColor: '#a78bfa' },
    event: { bg: 'bg-orange-500/10 border-orange-500/20', nameColor: '#fb923c', icon: <Zap className="w-3 h-3 text-orange-400" /> },
    idol: { bg: 'bg-gold/10 border-gold/30', nameColor: '#d4a84b', icon: <Sparkles className="w-3 h-3 text-gold" /> },
  }

  const config = typeConfig[message.message_type] ?? typeConfig.chat

  if (message.message_type === 'system') {
    return (
      <div className="text-center py-1">
        <span className="text-xs text-parchment-muted">{message.content}</span>
      </div>
    )
  }

  return (
    <div className={`p-3 rounded-lg border ${config.bg} ${message.message_type === 'narration' ? 'mx-4 my-2' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        {config.icon}
        <span className="text-xs font-medium" style={{ color: config.nameColor }}>
          {message.character_name ?? sender?.display_name ?? sender?.username ?? 'Unknown'}
        </span>
        <span className="text-[10px] text-parchment-muted ml-auto">
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className={`text-sm ${message.message_type === 'narration' ? 'font-serif text-parchment leading-relaxed italic' : 'text-parchment-dark'}`}>
        {message.content}
      </div>
    </div>
  )
}
