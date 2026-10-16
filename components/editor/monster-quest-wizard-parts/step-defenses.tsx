'use client'

import { Label } from '@/components/ui/label'
import { DAMAGE_TYPES, DND_CONDITIONS } from '@/lib/dnd-rules/monsters'
import { toggleInList } from './helpers'
import type { WizardStepProps } from './types'

function ChipGroup({
  label,
  values,
  setValues,
  options,
  helper,
}: {
  label: string
  values: string[]
  setValues: (v: string[]) => void
  options: readonly string[]
  helper?: string
}) {
  return (
    <div className="space-y-2">
      <Label className="text-parchment">{label}</Label>
      {helper && <p className="text-xs text-parchment-muted">{helper}</p>}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const on = values.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setValues(toggleInList(values, opt))}
              className={`px-2.5 py-1 rounded-md border text-xs capitalize transition-all ${
                on
                  ? 'border-red-500/60 bg-red-500/10 text-red-300'
                  : 'border-gold/20 bg-teal-deep/30 text-parchment-muted hover:border-gold/40'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Step 4 — Damage vulnerabilities/resistances/immunities & condition immunities. */
export function StepDefenses({ wizard }: WizardStepProps) {
  const {
    damageVulnerabilities,
    setDamageVulnerabilities,
    damageResistances,
    setDamageResistances,
    damageImmunities,
    setDamageImmunities,
    conditionImmunities,
    setConditionImmunities,
  } = wizard
  return (
    <div className="space-y-6">
      <div className="p-3 rounded-lg border border-gold/20 bg-teal-deep/20 text-xs text-parchment-muted">
        Pick the damage types this creature takes <em>extra</em> from, shrugs off, or
        completely ignores — plus the conditions it can&apos;t suffer. These appear in every
        encounter as <span className="text-gold">tactical levers</span> for players.
      </div>

      <ChipGroup
        label="Damage Vulnerabilities"
        helper="Double damage from these types."
        values={damageVulnerabilities}
        setValues={setDamageVulnerabilities}
        options={DAMAGE_TYPES}
      />
      <ChipGroup
        label="Damage Resistances"
        helper="Half damage from these types."
        values={damageResistances}
        setValues={setDamageResistances}
        options={DAMAGE_TYPES}
      />
      <ChipGroup
        label="Damage Immunities"
        helper="Zero damage from these types."
        values={damageImmunities}
        setValues={setDamageImmunities}
        options={DAMAGE_TYPES}
      />
      <ChipGroup
        label="Condition Immunities"
        helper="Cannot suffer these conditions."
        values={conditionImmunities}
        setValues={setConditionImmunities}
        options={DND_CONDITIONS}
      />
    </div>
  )
}
