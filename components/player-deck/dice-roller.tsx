'use client'

import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Dices, RotateCcw } from 'lucide-react'

interface DiceResult {
  notation: string
  rolls: number[]
  modifier: number
  total: number
  timestamp: number
}

const COMMON_ROLLS = [
  { label: 'd4', notation: '1d4' },
  { label: 'd6', notation: '1d6' },
  { label: 'd8', notation: '1d8' },
  { label: 'd10', notation: '1d10' },
  { label: 'd12', notation: '1d12' },
  { label: 'd20', notation: '1d20' },
  { label: '2d6', notation: '2d6' },
  { label: 'd100', notation: '1d100' },
]

function rollDice(notation: string): DiceResult {
  // Parse "2d6+3" format
  const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/i)
  if (!match) {
    return { notation, rolls: [0], modifier: 0, total: 0, timestamp: Date.now() }
  }
  
  const count = parseInt(match[1])
  const sides = parseInt(match[2])
  const modifier = match[3] ? parseInt(match[3]) : 0
  
  const rolls: number[] = []
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1)
  }
  
  const total = rolls.reduce((sum, r) => sum + r, 0) + modifier
  
  return { notation, rolls, modifier, total, timestamp: Date.now() }
}

export function DiceRoller({ onClose }: { onClose: () => void }) {
  const [results, setResults] = useState<DiceResult[]>([])
  const [customNotation, setCustomNotation] = useState('')
  
  const handleRoll = useCallback((notation: string) => {
    const result = rollDice(notation)
    setResults(prev => [result, ...prev].slice(0, 20))
  }, [])
  
  const handleCustomRoll = () => {
    if (customNotation.trim()) {
      handleRoll(customNotation.trim())
      setCustomNotation('')
    }
  }
  
  const lastResult = results[0]
  
  return (
    <Card className="bg-charcoal-900/95 backdrop-blur-xl border-gold-500/20 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gold-500/10">
        <h3 className="text-sm font-serif text-parchment flex items-center gap-2">
          <Dices className="w-4 h-4 text-amber-400" />
          Dice Roller
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-parchment-muted h-7 w-7 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Result Display */}
      <div className="p-4 text-center bg-charcoal-950/50">
        {lastResult ? (
          <>
            <div className="text-4xl font-bold font-mono text-parchment dice-result-animate">
              {lastResult.total}
            </div>
            <div className="text-xs text-parchment-muted mt-1">
              {lastResult.notation}: [{lastResult.rolls.join(', ')}]
              {lastResult.modifier !== 0 && ` ${lastResult.modifier > 0 ? '+' : ''}${lastResult.modifier}`}
            </div>
            {lastResult.rolls.length === 1 && lastResult.rolls[0] === 20 && (
              <div className="text-amber-400 text-xs font-bold mt-1 animate-pulse">NAT 20!</div>
            )}
            {lastResult.rolls.length === 1 && lastResult.rolls[0] === 1 && (
              <div className="text-red-400 text-xs font-bold mt-1">NAT 1...</div>
            )}
          </>
        ) : (
          <div className="text-parchment-muted text-sm py-2">Roll the dice...</div>
        )}
      </div>
      
      {/* Quick Roll Buttons */}
      <div className="p-3 grid grid-cols-4 gap-2">
        {COMMON_ROLLS.map(({ label, notation }) => (
          <Button
            key={notation}
            variant="outline"
            size="sm"
            className="text-xs font-mono border-gold-500/10 text-parchment hover:bg-gold-500/10 hover:border-gold-500/30 touch-target"
            onClick={() => handleRoll(notation)}
          >
            {label}
          </Button>
        ))}
      </div>
      
      {/* Special Rolls */}
      <div className="px-3 pb-2 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
          onClick={() => {
            const r1 = rollDice('1d20')
            const r2 = rollDice('1d20')
            const best = r1.total >= r2.total ? r1 : r2
            setResults(prev => [
              { ...best, notation: 'Adv (2d20)', rolls: [r1.rolls[0], r2.rolls[0]] },
              ...prev,
            ].slice(0, 20))
          }}
        >
          Advantage
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs border-red-500/20 text-red-400 hover:bg-red-500/10"
          onClick={() => {
            const r1 = rollDice('1d20')
            const r2 = rollDice('1d20')
            const worst = r1.total <= r2.total ? r1 : r2
            setResults(prev => [
              { ...worst, notation: 'Dis (2d20)', rolls: [r1.rolls[0], r2.rolls[0]] },
              ...prev,
            ].slice(0, 20))
          }}
        >
          Disadvantage
        </Button>
      </div>
      
      {/* Custom Roll */}
      <div className="px-3 pb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={customNotation}
            onChange={(e) => setCustomNotation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomRoll()}
            placeholder="e.g. 2d6+3"
            className="flex-1 bg-charcoal-950 border border-gold-500/10 rounded-lg px-3 py-2 text-sm text-parchment placeholder:text-parchment-muted/40 focus-glow"
          />
          <Button
            variant="outline"
            size="sm" 
            onClick={handleCustomRoll}
            className="border-gold-500/20 text-amber-400"
          >
            Roll
          </Button>
        </div>
      </div>
      
      {/* History */}
      {results.length > 1 && (
        <div className="px-3 pb-3 max-h-32 overflow-y-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-parchment-muted">History</span>
            <button onClick={() => setResults([])} className="text-parchment-muted hover:text-parchment">
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-0.5">
            {results.slice(1).map((r, i) => (
              <div key={r.timestamp + i} className="flex items-center justify-between text-xs text-parchment-muted/60">
                <span>{r.notation}</span>
                <span className="font-mono">{r.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
