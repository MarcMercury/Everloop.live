'use client'

/**
 * DmCraftPanel
 *
 * A read-only review card that surfaces the new adventure-design layer
 * (Kelsey Dionne 7-step, Lazy DM checklist, EPIC encounter linter, hurdle
 * variety linter, hook scoring, WWN sandbox tag roller) against the data the
 * user has already entered in the Quest Builder.
 *
 * No mutations. No I/O. Pure derivation + local UI state (Lazy Prep checks,
 * sandbox tag re-rolls). Intended to render inside the Review step.
 */

import { useMemo, useState } from 'react'
import {
  LAZY_PREP_CHECKLIST,
  lintEncounterList,
  lintEpic,
  scoreHook,
  rollSandboxTags,
  type EncounterDraft,
  type EncounterKind,
  type HookAppeal,
  type LinterFinding,
} from '@/lib/dnd-rules/adventure-design'
import type {
  QuestFlowGraph,
  QuestNodeKind,
} from '@/components/quests/quest-flow-builder'

interface DmCraftPanelProps {
  hook: string
  description: string
  stakesPersonal: string
  stakesWorld: string
  stakesMystery: string
  graph: QuestFlowGraph
}

const NODE_KIND_TO_ENCOUNTER: Partial<Record<QuestNodeKind, EncounterKind>> = {
  encounter: 'combat',
  choice: 'social',
  npc: 'social',
  scene: 'exploration',
  chapter: 'exploration',
  // start / climax / reward / quest are structural; not counted as hurdles.
}

function inferHookAppeals(text: string): HookAppeal[] {
  const t = text.toLowerCase()
  const appeals: HookAppeal[] = []
  if (/\b(reward|gold|coin|treasure|pay|bounty|relic|reagent|loot|prize)\b/.test(t)) {
    appeals.push('reward')
  }
  if (/\b(save|rescue|protect|defend|innocent|child|village|stop|prevent|wrong|justice|vengeance)\b/.test(t)) {
    appeals.push('heroism')
  }
  if (/\b(strange|mystery|secret|unknown|forgotten|ancient|whisper|portent|shard|fray|drift|anchor|rumor)\b/.test(t)) {
    appeals.push('discovery')
  }
  return appeals
}

function severityClass(s: LinterFinding['severity']): string {
  return s === 'error'
    ? 'text-rose-300 border-rose-400/40 bg-rose-500/10'
    : 'text-amber-200 border-amber-400/30 bg-amber-500/10'
}

export default function DmCraftPanel({
  hook,
  description,
  stakesPersonal,
  stakesWorld,
  stakesMystery,
  graph,
}: DmCraftPanelProps) {
  // ─── Lazy Prep local check state ──────────────────────────────────────
  const [prepChecked, setPrepChecked] = useState<Record<number, boolean>>({})
  const togglePrep = (order: number) =>
    setPrepChecked((p) => ({ ...p, [order]: !p[order] }))

  // ─── Sandbox tag roller ───────────────────────────────────────────────
  const [tags, setTags] = useState<string[]>(() => rollSandboxTags(Math.random, 2))

  // ─── Hook scoring ─────────────────────────────────────────────────────
  const hookScore = useMemo(() => {
    if (!hook.trim()) return null
    const combined = [hook, stakesPersonal, stakesWorld, stakesMystery].join(' ')
    const appeals = inferHookAppeals(combined)
    return {
      score: scoreHook({
        appeals,
        proximity: 'to_pcs', // optimistic; can be lowered when proximity is captured
        inciting_action: hook,
      }),
      appeals,
    }
  }, [hook, stakesPersonal, stakesWorld, stakesMystery])

  // ─── Encounter-variety lint over the flow graph ───────────────────────
  const encounterFindings = useMemo<LinterFinding[]>(() => {
    const drafts: EncounterDraft[] = []
    let i = 0
    for (const n of graph.nodes) {
      const kind = n.data?.kind
      if (!kind) continue
      const mapped = NODE_KIND_TO_ENCOUNTER[kind]
      if (!mapped) continue
      drafts.push({ index: i++, kind: mapped })
    }
    if (drafts.length === 0) return []
    return lintEncounterList(drafts)
  }, [graph.nodes])

  // ─── EPIC lint inferred from hook + stakes ────────────────────────────
  const epicFindings = useMemo<LinterFinding[]>(() => {
    const interactions: string[] = []
    if (stakesPersonal.trim()) interactions.push(stakesPersonal)
    if (stakesWorld.trim()) interactions.push(stakesWorld)
    if (stakesMystery.trim()) interactions.push(stakesMystery)
    if (description.trim()) interactions.push(description)
    return lintEpic({
      enticement: hook,
      pressure: stakesWorld,
      interactions,
      consequences: {
        success: stakesPersonal || stakesWorld,
        failure: stakesWorld || stakesMystery,
      },
    })
  }, [hook, description, stakesPersonal, stakesWorld, stakesMystery])

  const totalFindings = encounterFindings.length + epicFindings.length

  return (
    <div className="story-card p-5 space-y-5 border-fuchsia-400/15">
      <header className="flex items-baseline justify-between">
        <div>
          <h3 className="text-base font-serif text-parchment">DM Craft Check</h3>
          <p className="text-xs text-parchment-muted">
            Heuristics from Kelsey Dionne, Mike Shea, Keith Ammann, Kevin Crawford, and the
            Sly Flourish reading list. Advisory only — nothing here blocks publish.
          </p>
        </div>
        <span className="text-[11px] uppercase tracking-wider text-parchment-muted">
          {totalFindings === 0 ? 'Clean' : `${totalFindings} note${totalFindings === 1 ? '' : 's'}`}
        </span>
      </header>

      {/* Hook score */}
      <section className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-parchment font-medium">Hook strength</span>
          {hookScore ? (
            <span
              className={
                'text-xs px-2 py-0.5 rounded-full border ' +
                (hookScore.score >= 2
                  ? 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10'
                  : 'text-amber-200 border-amber-400/30 bg-amber-500/10')
              }
            >
              {hookScore.score} / 3
            </span>
          ) : (
            <span className="text-xs text-parchment-muted">no hook entered</span>
          )}
        </div>
        {hookScore && (
          <p className="text-xs text-parchment-muted">
            Appeals detected:{' '}
            {hookScore.appeals.length > 0
              ? hookScore.appeals.join(' · ')
              : 'none — add a reward, a wrong to right, or a mystery'}
            {hookScore.score < 2 && (
              <span className="block mt-1 text-amber-200/80">
                Aim for at least two of: reward, heroism, discovery.
              </span>
            )}
          </p>
        )}
      </section>

      {/* EPIC linter */}
      {epicFindings.length > 0 && (
        <section className="space-y-1.5">
          <span className="text-sm text-parchment font-medium">EPIC encounter check</span>
          <ul className="space-y-1">
            {epicFindings.map((f) => (
              <li
                key={f.code}
                className={'text-xs rounded border px-2 py-1 ' + severityClass(f.severity)}
              >
                {f.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Encounter variety linter */}
      {encounterFindings.length > 0 && (
        <section className="space-y-1.5">
          <span className="text-sm text-parchment font-medium">Story-flow variety</span>
          <ul className="space-y-1">
            {encounterFindings.map((f, i) => (
              <li
                key={f.code + ':' + i}
                className={'text-xs rounded border px-2 py-1 ' + severityClass(f.severity)}
              >
                {f.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Lazy Prep checklist */}
      <section className="space-y-1.5">
        <span className="text-sm text-parchment font-medium">Lazy DM prep (Mike Shea)</span>
        <ul className="space-y-1">
          {LAZY_PREP_CHECKLIST.map((step) => {
            const checked = !!prepChecked[step.order]
            return (
              <li key={step.order}>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePrep(step.order)}
                    className="mt-0.5 rounded border-gold/30 bg-teal-rich text-gold focus:ring-gold/40"
                  />
                  <span className="text-xs">
                    <span
                      className={
                        checked
                          ? 'line-through text-parchment-muted'
                          : 'text-parchment'
                      }
                    >
                      {step.title}
                      {!step.skippable && (
                        <span className="ml-1 text-[10px] uppercase tracking-wider text-rose-300/80">
                          core
                        </span>
                      )}
                    </span>
                    <span className="block text-parchment-muted">
                      {step.description}
                    </span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Sandbox tag roller */}
      <section className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-parchment font-medium">Sandbox spark (WWN tags)</span>
          <button
            type="button"
            onClick={() => setTags(rollSandboxTags(Math.random, 2))}
            className="text-[11px] text-gold/80 hover:text-gold underline decoration-dotted"
          >
            re-roll
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="text-[11px] px-2 py-0.5 rounded-full border border-gold/20 bg-gold/5 text-parchment"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-parchment-muted italic">
          Two-word location seeds (Kevin Crawford, Worlds Without Number).
          Friction = the tension between them.
        </p>
      </section>
    </div>
  )
}
