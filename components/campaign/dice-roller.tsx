'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Dices } from 'lucide-react'

/**
 * Visual Dice Roller
 * 
 * Animated dice results with physics-style tumbling effect.
 * Shows individual dice + total with critical hit/fail indicators.
 */

interface DiceResult {
  formula: string
  results: number[]
  modifier: number
  total: number
  isCriticalHit: boolean
  isCriticalFail: boolean
  rollType?: string
  rollerName?: string
  timestamp: number
}

interface Props {
  results: DiceResult[]
  maxVisible?: number
}

export function DiceRollVisualizer({ results, maxVisible = 5 }: Props) {
  const [animatingId, setAnimatingId] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Animate the latest roll
  useEffect(() => {
    if (results.length > 0) {
      const latest = results[results.length - 1]
      setAnimatingId(latest.timestamp)
      const timer = setTimeout(() => setAnimatingId(null), 1200)
      return () => clearTimeout(timer)
    }
  }, [results])

  // Auto-scroll to latest
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [results])

  const visibleResults = results.slice(-maxVisible)

  return (
    <div ref={containerRef} className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
      {visibleResults.map((roll) => (
        <DiceRollResult
          key={roll.timestamp}
          roll={roll}
          isAnimating={animatingId === roll.timestamp}
        />
      ))}
    </div>
  )
}

function DiceRollResult({ roll, isAnimating }: { roll: DiceResult; isAnimating: boolean }) {
  return (
    <div
      className={`rounded-lg p-3 transition-all duration-300 ${
        roll.isCriticalHit
          ? 'bg-amber-500/20 border border-amber-500/40 shadow-lg shadow-amber-500/10'
          : roll.isCriticalFail
          ? 'bg-red-500/20 border border-red-500/40 shadow-lg shadow-red-500/10'
          : 'bg-teal-rich/40 border border-gold/10'
      } ${isAnimating ? 'animate-bounce-once scale-105' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Dices className="w-3.5 h-3.5 text-gold" />
          {roll.rollerName && (
            <span className="text-xs text-parchment font-medium">{roll.rollerName}</span>
          )}
          <span className="text-xs text-parchment-muted">{roll.formula}</span>
          {roll.rollType && roll.rollType !== 'custom' && (
            <span className="text-xs text-parchment-muted/60 capitalize">
              ({roll.rollType.replace('_', ' ')})
            </span>
          )}
        </div>
        <div className={`text-lg font-bold font-mono ${
          roll.isCriticalHit ? 'text-amber-400' : roll.isCriticalFail ? 'text-red-400' : 'text-gold'
        }`}>
          {roll.total}
        </div>
      </div>

      {/* Dice Display */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {roll.results.map((die, i) => (
          <DiceFace
            key={i}
            value={die}
            isCrit={roll.results.length === 1 && roll.isCriticalHit}
            isFail={roll.results.length === 1 && roll.isCriticalFail}
            isAnimating={isAnimating}
            delay={i * 100}
          />
        ))}
        {roll.modifier !== 0 && (
          <span className="text-xs text-parchment-muted ml-1">
            {roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier}
          </span>
        )}
      </div>

      {/* Critical Indicator */}
      {roll.isCriticalHit && (
        <div className="text-xs text-amber-400 mt-1 font-bold uppercase tracking-wider animate-pulse">
          Critical Hit!
        </div>
      )}
      {roll.isCriticalFail && (
        <div className="text-xs text-red-400 mt-1 font-bold uppercase tracking-wider">
          Critical Fail!
        </div>
      )}
    </div>
  )
}

function DiceFace({ value, isCrit, isFail, isAnimating, delay }: {
  value: number
  isCrit: boolean
  isFail: boolean
  isAnimating: boolean
  delay: number
}) {
  const [showValue, setShowValue] = useState(!isAnimating)
  const [tumbleValue, setTumbleValue] = useState(Math.ceil(Math.random() * 20))

  useEffect(() => {
    if (isAnimating) {
      setShowValue(false)
      // Tumble through random values
      const interval = setInterval(() => {
        setTumbleValue(Math.ceil(Math.random() * 20))
      }, 50)

      const timer = setTimeout(() => {
        clearInterval(interval)
        setShowValue(true)
      }, 600 + delay)

      return () => {
        clearInterval(interval)
        clearTimeout(timer)
      }
    } else {
      setShowValue(true)
    }
  }, [isAnimating, value, delay])

  const displayValue = showValue ? value : tumbleValue

  return (
    <div
      className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold font-mono transition-all ${
        isAnimating && !showValue ? 'animate-spin-fast' : ''
      } ${
        isCrit
          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/20'
          : isFail
          ? 'bg-red-500/30 text-red-300 border border-red-500/50'
          : 'bg-teal-rich/80 text-parchment border border-gold/20'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {displayValue}
    </div>
  )
}

/**
 * Quick Dice Buttons — reusable row of common dice
 */
export function QuickDiceButtons({ onRoll }: { onRoll: (formula: string) => void }) {
  const dice = [
    { formula: '1d4', label: 'd4', color: 'text-blue-400' },
    { formula: '1d6', label: 'd6', color: 'text-green-400' },
    { formula: '1d8', label: 'd8', color: 'text-purple-400' },
    { formula: '1d10', label: 'd10', color: 'text-orange-400' },
    { formula: '1d12', label: 'd12', color: 'text-pink-400' },
    { formula: '1d20', label: 'd20', color: 'text-gold' },
    { formula: '1d100', label: 'd100', color: 'text-red-400' },
  ]

  return (
    <div className="flex gap-1.5 flex-wrap">
      {dice.map(d => (
        <button
          key={d.formula}
          onClick={() => onRoll(d.formula)}
          className={`px-2.5 py-1.5 rounded-md text-xs font-bold border border-gold/10 bg-teal-rich/50 hover:bg-teal-rich/80 hover:border-gold/30 transition-all ${d.color}`}
        >
          {d.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Parse a dice formula and roll it client-side (for preview / local rolls)
 */
export function rollDiceLocally(formula: string): { results: number[]; modifier: number; total: number } {
  const match = formula.match(/^(\d+)d(\d+)([+-]\d+)?$/)
  if (!match) return { results: [0], modifier: 0, total: 0 }

  const count = parseInt(match[1])
  const sides = parseInt(match[2])
  const modifier = match[3] ? parseInt(match[3]) : 0

  const results: number[] = []
  for (let i = 0; i < count; i++) {
    results.push(Math.floor(Math.random() * sides) + 1)
  }

  const total = results.reduce((a, b) => a + b, 0) + modifier
  return { results, modifier, total }
}
