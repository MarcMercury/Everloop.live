'use client'

/**
 * Forge study-info system — drop-in "tap to study" affordances for the Character Forge.
 *
 * The goal: while building a character, every choice (spell, feat, racial trait,
 * class feature, weapon, etc.) can be opened to reveal its full rules text, so a
 * player can read and study what they are picking without leaving the builder.
 *
 * Built on the existing InfoPopover (also used by the live character sheet), so the
 * "study" experience is consistent between building and playing.
 */

import * as React from 'react'
import { Info } from 'lucide-react'
import { InfoPopover, InfoSection, InfoBullets } from './info-popover'
import { lookupSpellDetail } from '@/lib/data'
import type { FeatData } from '@/lib/data'

// School → accent color for the popover header
const SCHOOL_ACCENT: Record<string, string> = {
  Abjuration: '#60a5fa',
  Conjuration: '#fbbf24',
  Divination: '#a3a3a3',
  Enchantment: '#f472b6',
  Evocation: '#f87171',
  Illusion: '#c084fc',
  Necromancy: '#4ade80',
  Transmutation: '#34d399',
}

/**
 * A small "ⓘ" button that opens a study popover. Self-manages its own open state so
 * it can be dropped anywhere without threading state through parent components.
 * Stops click propagation so it won't trigger a parent select handler.
 */
export function InfoButton({
  title,
  subtitle,
  accent,
  children,
  label,
  className,
}: {
  title: string
  subtitle?: string
  accent?: string
  children: React.ReactNode
  /** Optional visible text label next to the icon. */
  label?: string
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setOpen(true)
        }}
        aria-label={`Study ${title}`}
        title={`Study ${title}`}
        className={
          className ??
          'inline-flex items-center gap-1 text-parchment-muted/60 hover:text-gold-500 transition-colors rounded touch-target shrink-0'
        }
      >
        <Info className="w-3.5 h-3.5" />
        {label && <span className="text-[10px]">{label}</span>}
      </button>
      <InfoPopover
        open={open}
        onOpenChange={setOpen}
        title={title}
        subtitle={subtitle}
        accent={accent}
      >
        {children}
      </InfoPopover>
    </>
  )
}

/** Renders the full rules text for a spell (school, casting, range, components, duration, damage, description). */
export function SpellInfoBody({ name }: { name: string }) {
  const d = lookupSpellDetail(name)
  if (!d) {
    return (
      <p className="text-parchment-muted">
        Detailed rules text for <span className="text-parchment">{name}</span> isn&apos;t in
        the local library yet. Check your sourcebook for the full description.
      </p>
    )
  }
  const meta: [string, string | undefined][] = [
    ['Casting Time', d.casting_time],
    ['Range', d.range],
    ['Components', d.components],
    ['Duration', d.duration],
    ['Damage / Effect', d.damage],
  ]
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {meta
          .filter(([, v]) => !!v)
          .map(([label, v]) => (
            <div key={label}>
              <div className="text-[10px] text-parchment-muted uppercase tracking-wider">{label}</div>
              <div className="text-parchment/90 text-sm">{v}</div>
            </div>
          ))}
      </div>
      <InfoSection label="Description">
        <p className="whitespace-pre-line">{d.description}</p>
      </InfoSection>
      {(d.concentration || d.ritual) && (
        <div className="flex flex-wrap gap-2 pt-1">
          {d.concentration && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
              Concentration
            </span>
          )}
          {d.ritual && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/25">
              Ritual
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/** A study button for a spell by name — looks up level/school for the subtitle automatically. */
export function SpellStudyButton({ name, className }: { name: string; className?: string }) {
  const d = lookupSpellDetail(name)
  const subtitle = d
    ? d.level === 0
      ? `${d.school} Cantrip`
      : `Level ${d.level} ${d.school}`
    : 'Spell'
  const accent = d ? SCHOOL_ACCENT[d.school] : undefined
  return (
    <InfoButton title={name} subtitle={subtitle} accent={accent} className={className}>
      <SpellInfoBody name={name} />
    </InfoButton>
  )
}

/** Renders the full rules text for a feat. */
export function FeatInfoBody({ feat }: { feat: FeatData }) {
  return (
    <div className="space-y-3">
      {feat.prerequisite && feat.prerequisite !== 'None' && (
        <div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/25">
            Prerequisite: {feat.prerequisite}
          </span>
        </div>
      )}
      <p className="text-parchment/90">{feat.desc}</p>
      <InfoSection label="Benefits">
        <InfoBullets items={feat.effects} />
      </InfoSection>
    </div>
  )
}

/** A study button for a feat. */
export function FeatStudyButton({ feat, className }: { feat: FeatData; className?: string }) {
  return (
    <InfoButton
      title={feat.name}
      subtitle={feat.prerequisite && feat.prerequisite !== 'None' ? feat.prerequisite : 'Feat'}
      accent="#d4a84b"
      className={className}
    >
      <FeatInfoBody feat={feat} />
    </InfoButton>
  )
}

/** A generic study button for a named trait/feature with description text. */
export function TextStudyButton({
  title,
  subtitle,
  description,
  bullets,
  accent,
  className,
}: {
  title: string
  subtitle?: string
  description?: string
  bullets?: string[]
  accent?: string
  className?: string
}) {
  return (
    <InfoButton title={title} subtitle={subtitle} accent={accent} className={className}>
      <div className="space-y-3">
        {description && <p className="text-parchment/90 whitespace-pre-line">{description}</p>}
        {bullets && bullets.length > 0 && <InfoBullets items={bullets} />}
      </div>
    </InfoButton>
  )
}
