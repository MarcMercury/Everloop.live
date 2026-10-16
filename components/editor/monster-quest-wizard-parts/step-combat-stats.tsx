'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { type MovementType, CR_TABLE, crEntry } from '@/lib/dnd-rules/monsters'
import { MOVEMENT_TYPES } from './constants'
import { Select } from './select'
import type { WizardStepProps } from './types'

/** Step 2 — Combat Stats (CR, HP, AC, movement). */
export function StepCombatStats({ wizard }: WizardStepProps) {
  const {
    cr,
    setCr,
    hp,
    setHp,
    ac,
    setAc,
    damagePerRound,
    setDamagePerRound,
    movements,
    hitDice,
    setHitDice,
    acSource,
    setAcSource,
    addMovement,
    removeMovement,
    updateMovement,
  } = wizard
  const entry = crEntry(cr)
  return (
    <div className="space-y-6">
      {/* Challenge Rating */}
      <div className="space-y-2">
        <Label className="text-parchment">
          Challenge Rating (CR) <span className="text-red-400">*</span>
        </Label>
        <Select value={String(cr)} onChange={(v) => setCr(Number(v))}>
          {CR_TABLE.map((p) => (
            <option key={p.cr} value={p.cr}>
              CR {p.cr} — XP {p.xp.toLocaleString()} | PB +{p.proficiencyBonus} | HP ~{p.suggestedHp} | AC ~{p.suggestedAc} | DPR ~{p.suggestedDpr}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded bg-teal-deep/30 text-center">
            <div className="text-parchment-muted">XP</div>
            <div className="text-gold font-medium">{entry.xp.toLocaleString()}</div>
          </div>
          <div className="p-2 rounded bg-teal-deep/30 text-center">
            <div className="text-parchment-muted">Proficiency</div>
            <div className="text-gold font-medium">+{entry.proficiencyBonus}</div>
          </div>
          <div className="p-2 rounded bg-teal-deep/30 text-center">
            <div className="text-parchment-muted">Atk Bonus / Save DC</div>
            <div className="text-gold font-medium">+{entry.suggestedAttackBonus} / {entry.suggestedSaveDC}</div>
          </div>
        </div>
        <p className="text-xs text-parchment-muted">
          CR = a fair fight for a party of 4 at that level. Proficiency and XP are derived per SRD.
        </p>
      </div>

      {/* HP + Hit Dice */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-parchment">
            Hit Points <span className="text-red-400">*</span>
          </Label>
          <Input
            type="number"
            min={1}
            value={hp}
            onChange={(e) => setHp(Number(e.target.value))}
            className="bg-teal-deep/50"
          />
          <p className="text-xs text-gold/60">Suggested: ~{entry.suggestedHp} HP</p>
        </div>
        <div className="space-y-2">
          <Label className="text-parchment">Hit Dice <span className="text-parchment-muted/60">(optional)</span></Label>
          <Input
            placeholder="e.g. 8d10 + 24"
            value={hitDice}
            onChange={(e) => setHitDice(e.target.value)}
            className="bg-teal-deep/50"
          />
          <p className="text-xs text-parchment-muted">Dice formula for HP rolls.</p>
        </div>
      </div>

      {/* AC + Source */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-parchment">
            Armor Class <span className="text-red-400">*</span>
          </Label>
          <Input
            type="number"
            min={1}
            value={ac}
            onChange={(e) => setAc(Number(e.target.value))}
            className="bg-teal-deep/50"
          />
          <p className="text-xs text-gold/60">Suggested: ~{entry.suggestedAc} AC</p>
        </div>
        <div className="space-y-2">
          <Label className="text-parchment">AC Source <span className="text-parchment-muted/60">(optional)</span></Label>
          <Input
            placeholder="natural armor, chitin, drift-warp..."
            value={acSource}
            onChange={(e) => setAcSource(e.target.value)}
            className="bg-teal-deep/50"
          />
        </div>
      </div>

      {/* Damage per Round */}
      <div className="space-y-2">
        <Label className="text-parchment">
          Damage Output per Round <span className="text-red-400">*</span>
        </Label>
        <Input
          placeholder="e.g. 2d8+4 or 18"
          value={damagePerRound}
          onChange={(e) => setDamagePerRound(e.target.value)}
          className="bg-teal-deep/50"
        />
        <p className="text-xs text-gold/60">Suggested for CR {cr}: ~{entry.suggestedDpr} damage/round</p>
      </div>

      {/* Movement */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-parchment">Movement Speeds</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addMovement} className="text-gold gap-1">
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
        {movements.map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <Select
              value={m.type}
              onChange={(v) => updateMovement(i, { type: v as MovementType })}
              className="w-32"
            >
              {MOVEMENT_TYPES.map((mt) => (
                <option key={mt.value} value={mt.value}>
                  {mt.label}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              min={0}
              step={5}
              value={m.speed}
              onChange={(e) => updateMovement(i, { speed: Number(e.target.value) })}
              className="bg-teal-deep/50 w-24"
            />
            <span className="text-xs text-parchment-muted">ft.</span>
            {movements.length > 1 && (
              <button type="button" onClick={() => removeMovement(i)} className="text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
