'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Search, Sword, Sparkles, Shield } from 'lucide-react'
import { STANDARD_ACTIONS, BONUS_ACTIONS, REACTIONS, type ActionDefinition } from '@/lib/dnd-rules/actions'
import { CONDITION_LIST, type ConditionDefinition } from '@/lib/dnd-rules/conditions'

type Tab = 'actions' | 'conditions'

/**
 * DnDQuickReference
 *
 * A collapsible side-panel that surfaces the dnd-rules engine for the DM
 * during play: every action economy entry, every condition, with one-line
 * rules. No editing — pure reference. Backed entirely by lib/dnd-rules.
 */
export function DnDQuickReference() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('actions')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase()
    const all: ActionDefinition[] = [...STANDARD_ACTIONS, ...BONUS_ACTIONS, ...REACTIONS]
    if (!q) return all
    return all.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    )
  }, [query])

  const filteredConditions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CONDITION_LIST
    return CONDITION_LIST.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.effects.some(e => e.toLowerCase().includes(q))
    )
  }, [query])

  return (
    <div className="border-t border-gold/10 pt-3 mt-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between text-left text-sm font-serif text-parchment hover:text-gold transition-colors"
      >
        <span className="flex items-center gap-2">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <Shield className="w-4 h-4 text-gold/60" />
          D&D Quick Reference
        </span>
        <span className="text-xs text-parchment-muted">
          {STANDARD_ACTIONS.length + BONUS_ACTIONS.length + REACTIONS.length} actions · {CONDITION_LIST.length} conditions
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="flex gap-1">
            <button
              onClick={() => { setTab('actions'); setExpanded(null) }}
              className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                tab === 'actions'
                  ? 'bg-gold/20 border border-gold/40 text-parchment'
                  : 'bg-teal-rich/50 border border-gold/10 text-parchment-muted hover:border-gold/20'
              }`}
            >
              <Sword className="w-3 h-3 inline mr-1" />
              Actions
            </button>
            <button
              onClick={() => { setTab('conditions'); setExpanded(null) }}
              className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                tab === 'conditions'
                  ? 'bg-gold/20 border border-gold/40 text-parchment'
                  : 'bg-teal-rich/50 border border-gold/10 text-parchment-muted hover:border-gold/20'
              }`}
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              Conditions
            </button>
          </div>

          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-parchment-muted/60" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={tab === 'actions' ? 'Search actions...' : 'Search conditions...'}
              className="w-full pl-7 pr-2 py-1 rounded bg-teal-rich/40 border border-gold/10 text-xs text-parchment placeholder:text-parchment-muted/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
            {tab === 'actions' && filteredActions.map(a => (
              <ActionRow key={a.key} action={a} expanded={expanded === a.key} onToggle={() => setExpanded(expanded === a.key ? null : a.key)} />
            ))}
            {tab === 'conditions' && filteredConditions.map(c => (
              <ConditionRow key={c.key} condition={c} expanded={expanded === c.key} onToggle={() => setExpanded(expanded === c.key ? null : c.key)} />
            ))}
            {tab === 'actions' && filteredActions.length === 0 && (
              <p className="text-xs text-parchment-muted text-center py-4">No actions match &ldquo;{query}&rdquo;.</p>
            )}
            {tab === 'conditions' && filteredConditions.length === 0 && (
              <p className="text-xs text-parchment-muted text-center py-4">No conditions match &ldquo;{query}&rdquo;.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ActionRow({ action, expanded, onToggle }: { action: ActionDefinition; expanded: boolean; onToggle: () => void }) {
  const economyColor =
    action.economy === 'action' ? 'text-rose-300' :
    action.economy === 'bonus_action' ? 'text-amber-300' :
    action.economy === 'reaction' ? 'text-sky-300' :
    'text-parchment-muted'
  return (
    <div className="rounded border border-gold/10 bg-teal-rich/30">
      <button onClick={onToggle} className="w-full text-left px-2 py-1.5 flex items-center justify-between hover:bg-gold/5">
        <span className="text-xs text-parchment font-medium">{action.name}</span>
        <span className={`text-[10px] uppercase tracking-wide ${economyColor}`}>{action.economy.replace('_', ' ')}</span>
      </button>
      {expanded && (
        <div className="px-2 pb-2 text-xs text-parchment-muted space-y-1 border-t border-gold/10 pt-2">
          <p>{action.summary}</p>
          {action.rules.length > 0 && (
            <ul className="list-disc list-inside space-y-0.5 pl-2 border-l border-gold/20 italic text-parchment-muted/80">
              {action.rules.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
          <p className="text-[10px] text-parchment-muted/60">Category: {action.category}</p>
        </div>
      )}
    </div>
  )
}

function ConditionRow({ condition, expanded, onToggle }: { condition: ConditionDefinition; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="rounded border border-gold/10 bg-teal-rich/30">
      <button onClick={onToggle} className="w-full text-left px-2 py-1.5 hover:bg-gold/5">
        <span className="text-xs text-parchment font-medium capitalize">{condition.name}</span>
        <p className="text-[11px] text-parchment-muted mt-0.5">{condition.summary}</p>
      </button>
      {expanded && (
        <div className="px-2 pb-2 text-xs text-parchment-muted space-y-1 border-t border-gold/10 pt-2">
          {condition.effects.length === 0 ? (
            <p className="italic text-parchment-muted/70">No mechanical effects beyond the summary.</p>
          ) : (
            <ul className="list-disc list-inside space-y-0.5">
              {condition.effects.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
