'use client'

/**
 * Combat Tracker — DM-facing initiative + HP + conditions board.
 * Powered by quest_sessions.initiative_order (JSONB) — zero new tables.
 */

import { useState, useTransition } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Shield, Skull, ChevronRight, X, UserPlus, Swords, Flame } from 'lucide-react'
import {
  advanceTurn,
  adjustCombatantHp,
  endCombat,
  removeCombatant,
  toggleCombatantCondition,
  addCombatant,
  type Combatant,
} from '@/lib/actions/combat'
import { CONDITION_LIST, type ConditionKey } from '@/lib/dnd-rules/conditions'

interface Props {
  sessionId: string
  initial: {
    initiativeOrder: Combatant[]
    currentTurnIndex: number
    roundNumber: number
    isCombat: boolean
  }
  /** When true, surface DM-only controls. */
  isDM: boolean
  /** Optional ambient sfx button hook (#15). */
  onAmbience?: (mood: 'combat-start' | 'crit-hit' | 'crit-fail' | 'boss' | 'calm') => void
}

export function CombatTracker({ sessionId, initial, isDM, onAmbience }: Props) {
  const [order, setOrder] = useState<Combatant[]>(initial.initiativeOrder ?? [])
  const [turn, setTurn] = useState<number>(initial.currentTurnIndex ?? 0)
  const [round, setRound] = useState<number>(initial.roundNumber ?? 1)
  const [adding, setAdding] = useState(false)
  const [, startTransition] = useTransition()

  function localPatch(id: string, patch: Partial<Combatant>) {
    setOrder((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  function next() {
    let n = turn + 1
    let r = round
    if (n >= order.length) {
      n = 0
      r += 1
    }
    setTurn(n)
    setRound(r)
    startTransition(() => {
      advanceTurn(sessionId).catch(() => {})
    })
  }

  function hp(c: Combatant, delta: number) {
    localPatch(c.id, { hp: Math.max(0, Math.min(c.maxHp, c.hp + delta)) })
    startTransition(() => {
      adjustCombatantHp(sessionId, c.id, delta).catch(() => {})
    })
  }

  function toggleCond(c: Combatant, k: ConditionKey) {
    const has = (c.conditions ?? []).includes(k)
    localPatch(c.id, {
      conditions: has ? c.conditions.filter((x) => x !== k) : [...(c.conditions ?? []), k],
    })
    startTransition(() => {
      toggleCombatantCondition(sessionId, c.id, k).catch(() => {})
    })
  }

  function remove(c: Combatant) {
    setOrder((prev) => prev.filter((x) => x.id !== c.id))
    startTransition(() => {
      removeCombatant(sessionId, c.id).catch(() => {})
    })
  }

  function end() {
    if (!confirm('End combat? Initiative order will be cleared.')) return
    startTransition(() => {
      endCombat(sessionId).catch(() => {})
    })
    setOrder([])
    setTurn(0)
    setRound(0)
  }

  if (order.length === 0) {
    return (
      <Card className="p-6 bg-charcoal-950/50 border-gold-500/10 text-center">
        <Swords className="w-8 h-8 text-gold/40 mx-auto mb-2" />
        <p className="text-sm text-parchment-muted">No combat in progress.</p>
        {isDM && <p className="text-xs text-parchment-muted/60 mt-1">Use the Encounter Builder to start a fight.</p>}
      </Card>
    )
  }

  return (
    <Card className="p-4 bg-charcoal-950/60 border-gold-500/15">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-rose-400" />
          <span className="font-serif text-parchment">Round {round}</span>
        </div>
        {isDM && (
          <div className="flex gap-2">
            {onAmbience && (
              <>
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => onAmbience('combat-start')}>
                  <Flame className="w-3 h-3 mr-1" /> Combat
                </Button>
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => onAmbience('boss')}>
                  Boss
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" className="text-xs" onClick={next}>
              Next <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
            <Button size="sm" variant="ghost" className="text-xs text-rose-300" onClick={end}>
              End
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        {order.map((c, i) => {
          const isActive = i === turn
          const hpPct = (c.hp / c.maxHp) * 100
          return (
            <div
              key={c.id}
              className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/40'
                  : 'bg-charcoal-900/50 border-gold/5 hover:border-gold/15'
              }`}
            >
              <div className="w-9 text-center">
                <div className="text-xs uppercase text-parchment-muted/60">init</div>
                <div className="text-sm font-mono text-parchment">{c.initiative}</div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm truncate ${c.isPC ? 'text-emerald-200' : 'text-parchment'}`}>
                    {c.name}
                  </span>
                  {c.hp === 0 && <Skull className="w-3 h-3 text-rose-400" />}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <Heart className="w-3 h-3 text-rose-400" />
                  <div className="flex-1 h-1.5 bg-charcoal-900 rounded-full overflow-hidden max-w-[140px]">
                    <div
                      className={`h-full ${hpPct > 50 ? 'bg-emerald-500' : hpPct > 25 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${hpPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-parchment-muted">
                    {c.hp}/{c.maxHp}
                  </span>
                  <Shield className="w-3 h-3 text-blue-400 ml-2" />
                  <span className="text-xs font-mono text-parchment-muted">{c.ac}</span>
                </div>

                {(c.conditions ?? []).length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {c.conditions.map((cond) => (
                      <span key={cond} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-200 capitalize">
                        {cond}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {isDM && (
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-rose-300" onClick={() => hp(c, -1)}>−</Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-emerald-300" onClick={() => hp(c, +1)}>+</Button>
                  <details className="relative">
                    <summary className="cursor-pointer list-none px-1.5 py-1 text-xs text-parchment-muted hover:text-parchment">⋮</summary>
                    <div className="absolute right-0 top-full mt-1 z-10 bg-charcoal-900 border border-gold/15 rounded-md shadow-xl p-2 w-44 max-h-72 overflow-y-auto">
                      <div className="text-[10px] uppercase tracking-wider text-parchment-muted/60 px-1 mb-1">Conditions</div>
                      {CONDITION_LIST.map((cond) => {
                        const active = (c.conditions ?? []).includes(cond.key)
                        return (
                          <button
                            key={cond.key}
                            onClick={() => toggleCond(c, cond.key)}
                            className={`w-full text-left text-xs px-1.5 py-1 rounded capitalize ${
                              active ? 'bg-violet-500/30 text-violet-100' : 'text-parchment-muted hover:bg-charcoal-800'
                            }`}
                          >
                            {cond.name}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => remove(c)}
                        className="mt-1 w-full text-left text-xs px-1.5 py-1 rounded text-rose-300 hover:bg-rose-500/10"
                      >
                        <X className="w-3 h-3 inline mr-1" /> Remove
                      </button>
                    </div>
                  </details>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isDM && (
        <div className="mt-3">
          {!adding ? (
            <Button size="sm" variant="ghost" className="text-xs text-parchment-muted" onClick={() => setAdding(true)}>
              <UserPlus className="w-3 h-3 mr-1" /> Add combatant
            </Button>
          ) : (
            <AddCombatantForm
              sessionId={sessionId}
              onAdded={(c) => {
                setOrder((prev) => [...prev, c].sort((a, b) => b.initiative - a.initiative))
                setAdding(false)
              }}
              onCancel={() => setAdding(false)}
            />
          )}
        </div>
      )}
    </Card>
  )
}

function AddCombatantForm({
  sessionId,
  onAdded,
  onCancel,
}: {
  sessionId: string
  onAdded: (c: Combatant) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [initiative, setInitiative] = useState(10)
  const [hp, setHp] = useState(10)
  const [ac, setAc] = useState(12)
  const [isPC, setIsPC] = useState(false)
  const [, startTransition] = useTransition()

  function submit() {
    if (!name.trim()) return
    const combatant: Combatant = {
      id: crypto.randomUUID(),
      name: name.trim(),
      initiative,
      dexMod: 0,
      hp,
      maxHp: hp,
      ac,
      conditions: [],
      isPC,
    }
    startTransition(() => {
      addCombatant(sessionId, combatant)
        .then(() => onAdded(combatant))
        .catch(() => {})
    })
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end p-2 bg-charcoal-900/50 rounded-md border border-gold/10">
      <div className="col-span-2">
        <label className="text-[10px] uppercase text-parchment-muted">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-charcoal-950 border border-gold/10 rounded px-2 py-1 text-sm text-parchment"
          autoFocus
        />
      </div>
      <NumField label="Init" value={initiative} onChange={setInitiative} />
      <NumField label="HP" value={hp} onChange={setHp} />
      <NumField label="AC" value={ac} onChange={setAc} />
      <label className="flex items-center gap-1 text-xs text-parchment-muted">
        <input type="checkbox" checked={isPC} onChange={(e) => setIsPC(e.target.checked)} /> PC
      </label>
      <div className="col-span-2 md:col-span-6 flex gap-2 justify-end">
        <Button size="sm" variant="ghost" className="text-xs" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className="text-xs" onClick={submit}>Add</Button>
      </div>
    </div>
  )
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <label className="text-[10px] uppercase text-parchment-muted">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value || '0'))}
        className="w-full bg-charcoal-950 border border-gold/10 rounded px-2 py-1 text-sm text-parchment font-mono"
      />
    </div>
  )
}
