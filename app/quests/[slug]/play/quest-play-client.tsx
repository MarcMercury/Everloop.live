'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { completeQuest } from '@/lib/actions/quests'
import { Button } from '@/components/ui/button'
import { Send, Dice6, Heart, Shield, Scroll, Sparkles } from 'lucide-react'

interface NarratorConfig {
  style?: string
  pacing?: string
  detail_level?: string
  branching_narrative?: boolean
  character_interaction?: boolean
}

interface CharacterData {
  id: string
  name: string
  race: string
  class: string
  level: number
  current_hp: number
  max_hp: number
  armor_class: number
  portrait_url: string | null
  everloop_traits: string[]
  abilities: Record<string, number>
}

interface NarrativeEntry {
  id: string
  role: 'narrator' | 'player' | 'system'
  content: string
  timestamp: Date
  everloopEffect?: string
}

interface Props {
  questId: string
  questSlug: string
  questTitle: string
  questDescription: string | null
  questType: string
  difficulty: string
  everloopOverlay: boolean
  aiNarratorConfig: NarratorConfig | null
  participationId: string
  currentAct: number
  character: CharacterData | null
}

export default function QuestPlayClient({
  questId,
  questSlug,
  questTitle,
  questDescription,
  questType,
  difficulty,
  everloopOverlay,
  aiNarratorConfig,
  participationId,
  currentAct,
  character,
}: Props) {
  const router = useRouter()
  const [narrative, setNarrative] = useState<NarrativeEntry[]>([
    {
      id: 'intro',
      role: 'narrator',
      content: questDescription
        ? `${questDescription}\n\nThe quest begins. What do you do?`
        : 'The Loop shimmers around you. Reality bends, and a path forward reveals itself. What do you do?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [diceResult, setDiceResult] = useState<{ roll: number; type: string } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [narrative])

  function rollDice(sides: number = 20) {
    const roll = Math.floor(Math.random() * sides) + 1
    setDiceResult({ roll, type: `d${sides}` })

    const modifier = character
      ? Math.floor((Object.values(character.abilities)[0] - 10) / 2)
      : 0

    setNarrative(prev => [
      ...prev,
      {
        id: `dice-${Date.now()}`,
        role: 'system',
        content: `🎲 Rolled ${roll} on a d${sides}${modifier !== 0 ? ` (${modifier >= 0 ? '+' : ''}${modifier} = ${roll + modifier})` : ''}`,
        timestamp: new Date(),
      },
    ])

    setTimeout(() => setDiceResult(null), 2000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const playerAction = input.trim()
    setInput('')

    // Add player entry
    setNarrative(prev => [
      ...prev,
      {
        id: `player-${Date.now()}`,
        role: 'player',
        content: playerAction,
        timestamp: new Date(),
      },
    ])

    setLoading(true)

    // Call AI narrator API
    try {
      const res = await fetch('/api/quests/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questId,
          participationId,
          playerAction,
          character: character
            ? {
                name: character.name,
                race: character.race,
                class: character.class,
                level: character.level,
                hp: `${character.current_hp}/${character.max_hp}`,
                ac: character.armor_class,
                everloop_traits: character.everloop_traits,
              }
            : null,
          narrativeHistory: narrative.slice(-8).map(n => ({
            role: n.role,
            content: n.content,
          })),
          config: aiNarratorConfig,
          difficulty,
          everloopOverlay,
          currentAct,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const entry: NarrativeEntry = {
          id: `narrator-${Date.now()}`,
          role: 'narrator',
          content: data.narration || 'The Loop responds, but its words fade before you can grasp them...',
          timestamp: new Date(),
        }
        if (data.everloopEffect) {
          entry.everloopEffect = data.everloopEffect
        }
        setNarrative(prev => [...prev, entry])
      } else {
        // Fallback narrator
        setNarrative(prev => [
          ...prev,
          {
            id: `narrator-${Date.now()}`,
            role: 'narrator',
            content: generateFallbackNarration(playerAction, difficulty),
            timestamp: new Date(),
          },
        ])
      }
    } catch {
      setNarrative(prev => [
        ...prev,
        {
          id: `narrator-${Date.now()}`,
          role: 'narrator',
          content: generateFallbackNarration(playerAction, difficulty),
          timestamp: new Date(),
        },
      ])
    }

    setLoading(false)
  }

  async function handleComplete() {
    const result = await completeQuest(questId)
    if (result.success) {
      router.push(`/quests/${questSlug}`)
    }
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Narrative Panel */}
      <div className="flex-1 flex flex-col">
        {/* Narrative Scroll */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {narrative.map(entry => (
            <div key={entry.id} className={`max-w-3xl mx-auto ${entry.role === 'player' ? 'ml-auto mr-6' : ''}`}>
              {entry.role === 'narrator' && (
                <div className="prose prose-invert max-w-none">
                  <div className="text-parchment-dark leading-relaxed whitespace-pre-wrap text-[15px]">
                    {entry.content}
                  </div>
                  {entry.everloopEffect && (
                    <div className="mt-2 px-3 py-2 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm italic">
                      ✦ {entry.everloopEffect}
                    </div>
                  )}
                </div>
              )}
              {entry.role === 'player' && (
                <div className="bg-gold/5 border border-gold/20 rounded-lg px-4 py-3 text-parchment text-sm max-w-lg">
                  {character && (
                    <span className="text-xs text-gold font-medium block mb-1">{character.name}</span>
                  )}
                  {entry.content}
                </div>
              )}
              {entry.role === 'system' && (
                <div className="text-center">
                  <span className="text-xs text-parchment-muted bg-teal-rich/80 px-3 py-1 rounded-full border border-gold/10">
                    {entry.content}
                  </span>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 text-parchment-muted text-sm">
                <div className="w-2 h-2 rounded-full bg-gold/60 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-gold/60 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-gold/60 animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span className="ml-2 text-xs">The narrator weaves the tale...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gold/10 px-6 py-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-center gap-3">
            {/* Dice Button */}
            <Button
              type="button"
              onClick={() => rollDice(20)}
              variant="ghost"
              size="sm"
              className={`text-parchment-muted hover:text-gold relative ${diceResult ? 'text-gold' : ''}`}
              title="Roll d20"
            >
              <Dice6 className="w-5 h-5" />
              {diceResult && (
                <span className="absolute -top-2 -right-2 text-[10px] bg-gold text-teal-rich rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {diceResult.roll}
                </span>
              )}
            </Button>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Describe your action..."
              disabled={loading}
              className="flex-1 bg-teal-rich/50 border border-gold/20 rounded-lg px-4 py-3 text-parchment placeholder:text-parchment-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="sm"
              className="btn-fantasy px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="max-w-3xl mx-auto flex items-center gap-2 mt-2">
            <button type="button" onClick={() => rollDice(4)} className="text-[10px] text-parchment-muted hover:text-gold px-2 py-0.5 rounded border border-gold/10 hover:border-gold/30 transition-colors">d4</button>
            <button type="button" onClick={() => rollDice(6)} className="text-[10px] text-parchment-muted hover:text-gold px-2 py-0.5 rounded border border-gold/10 hover:border-gold/30 transition-colors">d6</button>
            <button type="button" onClick={() => rollDice(8)} className="text-[10px] text-parchment-muted hover:text-gold px-2 py-0.5 rounded border border-gold/10 hover:border-gold/30 transition-colors">d8</button>
            <button type="button" onClick={() => rollDice(10)} className="text-[10px] text-parchment-muted hover:text-gold px-2 py-0.5 rounded border border-gold/10 hover:border-gold/30 transition-colors">d10</button>
            <button type="button" onClick={() => rollDice(12)} className="text-[10px] text-parchment-muted hover:text-gold px-2 py-0.5 rounded border border-gold/10 hover:border-gold/30 transition-colors">d12</button>
            <button type="button" onClick={() => rollDice(20)} className="text-[10px] text-parchment-muted hover:text-gold px-2 py-0.5 rounded border border-gold/10 hover:border-gold/30 transition-colors">d20</button>
            <button type="button" onClick={() => rollDice(100)} className="text-[10px] text-parchment-muted hover:text-gold px-2 py-0.5 rounded border border-gold/10 hover:border-gold/30 transition-colors">d100</button>
            <div className="flex-1" />
            <Button onClick={handleComplete} variant="ghost" size="sm" className="text-xs text-parchment-muted hover:text-parchment">
              Complete Quest
            </Button>
          </div>
        </div>
      </div>

      {/* Character Sidebar (if character selected) */}
      {character && (
        <div className="w-64 border-l border-gold/10 bg-teal-rich/30 overflow-y-auto hidden lg:block">
          <div className="p-4 space-y-4">
            {/* Character Header */}
            <div className="text-center">
              {character.portrait_url ? (
                <img src={character.portrait_url} alt={character.name} className="w-16 h-16 rounded-full mx-auto border-2 border-gold/30 object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full mx-auto bg-teal-mid border-2 border-gold/30 flex items-center justify-center text-xl font-serif text-gold">
                  {character.name[0]}
                </div>
              )}
              <h3 className="font-serif text-parchment text-sm mt-2">{character.name}</h3>
              <p className="text-xs text-parchment-muted">
                Lv{character.level} {character.race} {character.class}
              </p>
            </div>

            {/* HP Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-parchment-muted flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /> HP</span>
                <span className="text-parchment">{character.current_hp}/{character.max_hp}</span>
              </div>
              <div className="h-2 rounded-full bg-teal-mid overflow-hidden">
                <div
                  className="h-full rounded-full transition-all bg-red-500"
                  style={{ width: `${(character.current_hp / character.max_hp) * 100}%` }}
                />
              </div>
            </div>

            {/* AC */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-parchment-muted flex items-center gap-1"><Shield className="w-3 h-3 text-blue-400" /> AC</span>
              <span className="text-parchment font-medium">{character.armor_class}</span>
            </div>

            {/* Abilities */}
            <div>
              <h4 className="text-xs text-parchment-muted mb-2 flex items-center gap-1">
                <Scroll className="w-3 h-3" /> Abilities
              </h4>
              <div className="grid grid-cols-3 gap-1">
                {Object.entries(character.abilities).map(([key, val]) => (
                  <div key={key} className="text-center p-1 rounded bg-teal-rich/50 border border-gold/5">
                    <div className="text-[10px] text-parchment-muted">{key}</div>
                    <div className="text-xs text-parchment font-medium">{val}</div>
                    <div className="text-[10px] text-gold">
                      {Math.floor((val - 10) / 2) >= 0 ? '+' : ''}{Math.floor((val - 10) / 2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Everloop Traits */}
            {everloopOverlay && character.everloop_traits.length > 0 && (
              <div>
                <h4 className="text-xs text-purple-400 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Everloop Traits
                </h4>
                <div className="space-y-1">
                  {character.everloop_traits.map(trait => (
                    <div key={trait} className="text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
                      {trait}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** Fallback narrator when AI is unavailable */
function generateFallbackNarration(action: string, difficulty: string): string {
  const responses = [
    'The world shifts around you. Your action echoes through the Loop, and the path ahead changes...',
    'The air crackles with unseen energy. Something is watching. Something is waiting.',
    'Your choice reverberates through the fabric of this reality. The narrative threads respond...',
    'Time stutters for a moment—was that a memory, or a premonition? The Loop continues.',
    'The landscape reacts to your presence. Shadows lengthen, and new possibilities emerge.',
  ]

  if (difficulty === 'chaos') {
    return responses[Math.floor(Math.random() * responses.length)]
      + '\n\n*Reality shudders. The Fray intensifies. Nothing here is certain.*'
  }

  return responses[Math.floor(Math.random() * responses.length)]
    + '\n\nWhat do you do next?'
}
