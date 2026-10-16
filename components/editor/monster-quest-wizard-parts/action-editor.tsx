'use client'

import { Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  type Ability,
  type MonsterAction,
  ABILITY_ORDER,
  ABILITY_LABELS,
} from '@/lib/dnd-rules/monsters'
import { Select } from './select'

export type ActionEditorKind = 'action' | 'bonus' | 'reaction' | 'legendary'

/** Editor card for a single action / bonus action / reaction / legendary action. */
export function ActionEditor({
  a,
  i,
  label,
  onUpdate,
  onRemove,
  canRemove,
  kind,
  attackBonus,
  saveDC,
}: {
  a: MonsterAction
  i: number
  label: string
  onUpdate: (i: number, patch: Partial<MonsterAction>) => void
  onRemove: (i: number) => void
  canRemove: boolean
  kind: ActionEditorKind
  /** CR-suggested attack bonus, shown as a placeholder hint. */
  attackBonus: number
  /** CR-suggested save DC, shown as a placeholder hint. */
  saveDC: number
}) {
  return (
    <Card className="border-gold/20">
      <CardContent className="pt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-parchment font-medium">{label}</span>
          {canRemove && (
            <button type="button" onClick={() => onRemove(i)} className="text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <Input
          placeholder="Attack name (e.g. Bite, Tail Sweep, Drift Howl)"
          value={a.name}
          onChange={(e) => onUpdate(i, { name: e.target.value })}
          className="bg-teal-deep/50"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div>
            <Label className="text-parchment-muted text-[10px] uppercase">To-Hit / Save</Label>
            <Input
              placeholder={`+${attackBonus} to hit  or  DC ${saveDC}`}
              value={a.attackBonus !== undefined ? `+${a.attackBonus}` : a.saveDC !== undefined ? `DC ${a.saveDC}` : ''}
              onChange={(e) => {
                const v = e.target.value.trim()
                if (v.toLowerCase().startsWith('dc')) {
                  const n = parseInt(v.replace(/[^0-9]/g, ''), 10)
                  onUpdate(i, { saveDC: isNaN(n) ? undefined : n, attackBonus: undefined })
                } else if (v.startsWith('+') || v.startsWith('-')) {
                  const n = parseInt(v, 10)
                  onUpdate(i, { attackBonus: isNaN(n) ? undefined : n, saveDC: undefined })
                } else {
                  onUpdate(i, { attackBonus: undefined, saveDC: undefined })
                }
              }}
              className="bg-teal-deep/50"
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-[10px] uppercase">Reach / Range</Label>
            <Input
              placeholder="5 ft. or 30/120 ft."
              value={a.reach !== undefined ? `${a.reach} ft.` : ''}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                onUpdate(i, { reach: isNaN(n) ? undefined : n })
              }}
              className="bg-teal-deep/50"
            />
          </div>
          <div>
            <Label className="text-parchment-muted text-[10px] uppercase">Targets</Label>
            <Input
              placeholder="one creature, 15-ft cone"
              value={a.targets || ''}
              onChange={(e) => onUpdate(i, { targets: e.target.value })}
              className="bg-teal-deep/50"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Damage (e.g. 2d8+4 slashing)"
            value={a.damage || ''}
            onChange={(e) => onUpdate(i, { damage: e.target.value })}
            className="bg-teal-deep/50"
          />
          <Input
            placeholder="Recharge (e.g. 5-6, short rest)"
            value={a.recharge || ''}
            onChange={(e) => onUpdate(i, { recharge: e.target.value })}
            className="bg-teal-deep/50"
          />
        </div>
        {a.saveDC !== undefined && (
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={a.saveAbility || 'DEX'}
              onChange={(v) => onUpdate(i, { saveAbility: v as Ability })}
            >
              {ABILITY_ORDER.map((ab) => (
                <option key={ab} value={ab}>
                  {ABILITY_LABELS[ab]} save
                </option>
              ))}
            </Select>
            <Input
              placeholder="Effect on save (e.g. half damage)"
              value={a.saveEffect || ''}
              onChange={(e) => onUpdate(i, { saveEffect: e.target.value })}
              className="bg-teal-deep/50"
            />
          </div>
        )}
        {kind === 'legendary' && (
          <div className="flex items-center gap-2">
            <Label className="text-parchment-muted text-xs">Cost (legendary points):</Label>
            <Input
              type="number"
              min={1}
              max={3}
              value={a.legendaryCost || 1}
              onChange={(e) => onUpdate(i, { legendaryCost: Number(e.target.value) || 1 })}
              className="bg-teal-deep/50 w-20"
            />
          </div>
        )}
        <textarea
          placeholder="Full mechanical description (what does it do, on hit, on save, conditions imposed)"
          value={a.description}
          onChange={(e) => onUpdate(i, { description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment placeholder:text-parchment-muted/50 focus:outline-hidden focus:ring-2 focus:ring-gold/30 resize-none text-sm"
        />
      </CardContent>
    </Card>
  )
}
