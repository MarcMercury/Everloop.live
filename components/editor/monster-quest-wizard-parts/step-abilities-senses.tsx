'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import {
  ABILITY_ORDER,
  ABILITY_LABELS,
  STANDARD_SKILLS,
  abilityMod,
  crEntry,
  formatMod,
  passivePerception,
} from '@/lib/dnd-rules/monsters'
import { Select } from './select'
import type { WizardStepProps } from './types'

/** Step 3 — Ability Scores, proficiencies, senses & languages. */
export function StepAbilitiesSenses({ wizard }: WizardStepProps) {
  const {
    cr,
    abilities,
    setAbilities,
    savingThrows,
    setSavingThrows,
    skills,
    senses,
    setSenses,
    languages,
    setLanguages,
    telepathy,
    setTelepathy,
    addSkill,
    removeSkill,
    updateSkill,
  } = wizard
  const wisMod = abilityMod(abilities.WIS)
  const perceptionBonus = skills.find((s) => s.name === 'Perception')?.bonus ?? wisMod
  const computedPP = passivePerception(perceptionBonus)
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-parchment">Ability Scores</Label>
        <p className="text-xs text-parchment-muted">
          Standard 5e abilities. Modifier is auto-derived as floor((score − 10) / 2).
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ABILITY_ORDER.map((ab) => (
            <div key={ab} className="p-2 rounded-lg border border-gold/20 bg-teal-deep/30">
              <div className="text-xs text-gold/70 mb-1">{ABILITY_LABELS[ab]} ({ab})</div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={abilities[ab]}
                  onChange={(e) =>
                    setAbilities((prev) => ({ ...prev, [ab]: Number(e.target.value) || 10 }))
                  }
                  className="bg-teal-deep/50"
                />
                <span className="text-sm text-parchment font-mono w-10 text-center">
                  {formatMod(abilityMod(abilities[ab]))}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saving throw proficiencies */}
      <div className="space-y-2">
        <Label className="text-parchment">Saving Throw Proficiencies</Label>
        <p className="text-xs text-parchment-muted">
          Click an ability to grant proficiency. Bonus = ability mod + proficiency bonus (+{crEntry(cr).proficiencyBonus}).
        </p>
        <div className="flex flex-wrap gap-2">
          {ABILITY_ORDER.map((ab) => {
            const isProf = savingThrows[ab] !== undefined
            const bonus = abilityMod(abilities[ab]) + crEntry(cr).proficiencyBonus
            return (
              <button
                key={ab}
                type="button"
                onClick={() =>
                  setSavingThrows((prev) => {
                    const next = { ...prev }
                    if (isProf) delete next[ab]
                    else next[ab] = bonus
                    return next
                  })
                }
                className={`px-3 py-1.5 rounded-md border text-xs transition-all ${
                  isProf
                    ? 'border-gold/60 bg-gold/10 text-gold'
                    : 'border-gold/20 bg-teal-deep/30 text-parchment-muted hover:border-gold/40'
                }`}
              >
                {ab} {isProf && `(${formatMod(bonus)})`}
              </button>
            )
          })}
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-parchment">Skill Bonuses</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addSkill} className="text-gold gap-1">
            <Plus className="w-3 h-3" /> Add Skill
          </Button>
        </div>
        {skills.length === 0 && (
          <p className="text-xs text-parchment-muted italic">
            Add Perception, Stealth, Athletics, etc. with their final bonus (mod + proficiency).
          </p>
        )}
        {skills.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <Select
              value={s.name}
              onChange={(v) => updateSkill(i, { name: v })}
              className="flex-1"
            >
              {STANDARD_SKILLS.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              value={s.bonus}
              onChange={(e) => updateSkill(i, { bonus: Number(e.target.value) })}
              className="bg-teal-deep/50 w-20"
            />
            <button type="button" onClick={() => removeSkill(i)} className="text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Senses */}
      <div className="space-y-3">
        <Label className="text-parchment">Senses</Label>
        <p className="text-xs text-parchment-muted">
          Leave 0 if the monster doesn&apos;t have that sense. Passive Perception auto-derives from Perception
          (or WIS mod) but can be overridden.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-parchment-muted text-xs">Darkvision (ft.)</Label>
            <Input
              type="number"
              min={0}
              step={5}
              value={senses.darkvision ?? 0}
              onChange={(e) =>
                setSenses((prev) => ({ ...prev, darkvision: Number(e.target.value) || 0 }))
              }
              className="bg-teal-deep/50"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-parchment-muted text-xs">Blindsight (ft.)</Label>
            <Input
              type="number"
              min={0}
              step={5}
              value={senses.blindsight ?? 0}
              onChange={(e) =>
                setSenses((prev) => ({ ...prev, blindsight: Number(e.target.value) || 0 }))
              }
              className="bg-teal-deep/50"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-parchment-muted text-xs">Tremorsense (ft.)</Label>
            <Input
              type="number"
              min={0}
              step={5}
              value={senses.tremorsense ?? 0}
              onChange={(e) =>
                setSenses((prev) => ({ ...prev, tremorsense: Number(e.target.value) || 0 }))
              }
              className="bg-teal-deep/50"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-parchment-muted text-xs">Truesight (ft.)</Label>
            <Input
              type="number"
              min={0}
              step={5}
              value={senses.truesight ?? 0}
              onChange={(e) =>
                setSenses((prev) => ({ ...prev, truesight: Number(e.target.value) || 0 }))
              }
              className="bg-teal-deep/50"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-xs text-parchment-muted">
            <input
              type="checkbox"
              className="accent-gold"
              checked={!!senses.blindsightBlindBeyond}
              onChange={(e) =>
                setSenses((prev) => ({ ...prev, blindsightBlindBeyond: e.target.checked }))
              }
            />
            Blind beyond blindsight radius
          </label>
          <div className="space-y-1">
            <Label className="text-parchment-muted text-xs">Passive Perception</Label>
            <Input
              type="number"
              min={1}
              value={senses.passivePerception || computedPP}
              onChange={(e) =>
                setSenses((prev) => ({ ...prev, passivePerception: Number(e.target.value) }))
              }
              className="bg-teal-deep/50"
            />
            <p className="text-xs text-gold/60">Auto: {computedPP}</p>
          </div>
        </div>
      </div>

      {/* Languages + Telepathy */}
      <div className="space-y-2">
        <Label className="text-parchment">Languages</Label>
        <Input
          placeholder="Common, Abyssal, — (none), or 'understands Common but can't speak'"
          value={languages.join(', ')}
          onChange={(e) =>
            setLanguages(
              e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
          className="bg-teal-deep/50"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-parchment-muted text-xs">Telepathy range (ft.) <span className="text-parchment-muted/60">(optional)</span></Label>
            <Input
              type="number"
              min={0}
              step={30}
              value={telepathy ?? 0}
              onChange={(e) => {
                const n = Number(e.target.value)
                setTelepathy(n > 0 ? n : undefined)
              }}
              className="bg-teal-deep/50"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
