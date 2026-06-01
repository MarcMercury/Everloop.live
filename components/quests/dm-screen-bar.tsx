'use client'

/**
 * DM Screen — quick reference popover bar.
 * A fixed strip with popover buttons for: Conditions, Actions, Cover, DC,
 * Damage Types, Skills. Pulls directly from lib/data/dnd-reference + combat.
 */

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Shield, Swords, Target, Sparkles, Zap, X } from 'lucide-react'
import {
  STANDARD_ACTIONS,
  CONDITION_INFO,
  SKILL_INFO,
  DAMAGE_TYPE_INFO,
} from '@/lib/data/dnd-reference'
import { COVER_AC_BONUS, DIFFICULTY_DC } from '@/lib/dnd-rules/combat'

type Panel = 'actions' | 'conditions' | 'cover' | 'dc' | 'skills' | 'damage' | null

export function DMScreenBar() {
  const [open, setOpen] = useState<Panel>(null)

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-charcoal-900/95 backdrop-blur border-t border-gold/15 px-3 py-2">
        <div className="max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto">
          <span className="text-[10px] uppercase tracking-wider text-parchment-muted px-2 shrink-0">
            <BookOpen className="w-3 h-3 inline mr-1" /> DM Screen
          </span>
          <Btn icon={<Zap className="w-3.5 h-3.5" />} label="Actions" onClick={() => setOpen(open === 'actions' ? null : 'actions')} />
          <Btn icon={<Sparkles className="w-3.5 h-3.5" />} label="Conditions" onClick={() => setOpen(open === 'conditions' ? null : 'conditions')} />
          <Btn icon={<Shield className="w-3.5 h-3.5" />} label="Cover" onClick={() => setOpen(open === 'cover' ? null : 'cover')} />
          <Btn icon={<Target className="w-3.5 h-3.5" />} label="DCs" onClick={() => setOpen(open === 'dc' ? null : 'dc')} />
          <Btn icon={<Swords className="w-3.5 h-3.5" />} label="Damage" onClick={() => setOpen(open === 'damage' ? null : 'damage')} />
          <Btn icon={<BookOpen className="w-3.5 h-3.5" />} label="Skills" onClick={() => setOpen(open === 'skills' ? null : 'skills')} />
        </div>
      </div>

      {open && (
        <div className="fixed bottom-12 left-0 right-0 z-40 px-3 pb-3">
          <Card className="max-w-5xl mx-auto bg-charcoal-900/95 backdrop-blur border border-gold/20 p-4 max-h-[60vh] overflow-y-auto relative">
            <button
              onClick={() => setOpen(null)}
              className="absolute top-2 right-2 text-parchment-muted hover:text-parchment"
            >
              <X className="w-4 h-4" />
            </button>

            {open === 'actions' && (
              <Panel title="Actions in Combat">
                {Object.entries(STANDARD_ACTIONS).map(([k, a]) => (
                  <Row key={k} title={a.name} body={a.description} extra={a.type} />
                ))}
              </Panel>
            )}

            {open === 'conditions' && (
              <Panel title="Conditions" cols={2}>
                {Object.entries(CONDITION_INFO).map(([k, lines]) => (
                  <Row
                    key={k}
                    title={k}
                    body={(lines as string[]).map((l, i) => <span key={i} className="block">• {l}</span>)}
                  />
                ))}
              </Panel>
            )}

            {open === 'cover' && (
              <Panel title="Cover">
                <Row title="No cover" body="No bonus." extra="+0 AC / +0 Dex saves" />
                <Row title="Half cover" body="Behind low wall, large furniture, creature, etc." extra={`+${COVER_AC_BONUS.half} AC / Dex saves`} />
                <Row title="Three-quarters" body="Arrow slit, portcullis, tree trunk." extra={`+${COVER_AC_BONUS.three_quarters} AC / Dex saves`} />
                <Row title="Total cover" body="Can't be targeted directly. Spells & abilities may still hit if AOE." extra="Cannot be targeted" />
              </Panel>
            )}

            {open === 'dc' && (
              <Panel title="Difficulty Classes">
                {Object.entries(DIFFICULTY_DC).map(([k, v]) => (
                  <Row key={k} title={k.replace(/_/g, ' ')} body={`DC ${v}`} />
                ))}
              </Panel>
            )}

            {open === 'damage' && (
              <Panel title="Damage Types" cols={2}>
                {Object.entries(DAMAGE_TYPE_INFO).map(([k, desc]) => (
                  <Row key={k} title={k} body={desc} />
                ))}
              </Panel>
            )}

            {open === 'skills' && (
              <Panel title="Skills" cols={2}>
                {Object.entries(SKILL_INFO).map(([k, s]) => (
                  <Row key={k} title={s.name} body={s.description} extra={s.ability.toUpperCase()} />
                ))}
              </Panel>
            )}
          </Card>
        </div>
      )}
    </>
  )
}

function Btn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-parchment hover:bg-gold/10 hover:text-gold transition-colors shrink-0"
    >
      {icon}
      {label}
    </button>
  )
}

function Panel({ title, children, cols = 1 }: { title: string; children: React.ReactNode; cols?: 1 | 2 }) {
  return (
    <div>
      <h3 className="font-serif text-parchment text-base mb-3">{title}</h3>
      <div className={`grid gap-2 ${cols === 2 ? 'md:grid-cols-2' : ''}`}>{children}</div>
    </div>
  )
}

function Row({ title, body, extra }: { title: string; body: React.ReactNode; extra?: string }) {
  return (
    <div className="p-2 rounded-md bg-charcoal-950/50 border border-gold/5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gold capitalize">{title}</span>
        {extra && <span className="text-[10px] uppercase tracking-wider text-parchment-muted">{extra}</span>}
      </div>
      <div className="text-xs text-parchment-muted mt-0.5">{body}</div>
    </div>
  )
}
