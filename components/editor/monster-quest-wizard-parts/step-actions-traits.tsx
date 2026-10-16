'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { crEntry } from '@/lib/dnd-rules/monsters'
import { ActionEditor } from './action-editor'
import type { WizardStepProps } from './types'

/** Step 5 — Multiattack, actions, bonus actions, reactions, legendary actions, traits & weaknesses. */
export function StepActionsTraits({ wizard }: WizardStepProps) {
  const {
    cr,
    multiattack,
    setMultiattack,
    bonusActions,
    reactions,
    hasLegendary,
    setHasLegendary,
    legendaryActions,
    setLegendaryActions,
    tactics,
    setTactics,
    actions,
    traits,
    weaknesses,
    addAction,
    removeAction,
    updateAction,
    addTrait,
    removeTrait,
    updateTrait,
    addBonusAction,
    removeBonusAction,
    updateBonusAction,
    addReaction,
    removeReaction,
    updateReaction,
    addLegendaryAction,
    removeLegendaryAction,
    updateLegendaryAction,
    addWeakness,
    removeWeakness,
    updateWeakness,
  } = wizard
  const attackBonus = crEntry(cr).suggestedAttackBonus
  const saveDC = crEntry(cr).suggestedSaveDC

  return (
    <div className="space-y-6">
      {/* Multiattack */}
      <div className="space-y-2">
        <Label className="text-parchment">Multiattack <span className="text-parchment-muted/60">(optional)</span></Label>
        <Input
          placeholder='e.g. "The monster makes three attacks: two with its claws and one with its bite."'
          value={multiattack}
          onChange={(e) => setMultiattack(e.target.value)}
          className="bg-teal-deep/50"
        />
        <p className="text-xs text-parchment-muted">
          Describe how many attacks the creature gets per turn and which combinations.
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-parchment">
            Actions <span className="text-red-400">*</span>
          </Label>
          <Button type="button" variant="ghost" size="sm" onClick={addAction} className="text-gold gap-1">
            <Plus className="w-3 h-3" /> Add Action
          </Button>
        </div>
        <p className="text-xs text-parchment-muted">
          Suggested attack bonus +{attackBonus}, save DC {saveDC}. Use the &quot;To-Hit / Save&quot; field
          to set either (type <code>+5</code> for attack or <code>DC 14</code> for a save).
        </p>
        {actions.map((a, i) =>
          <ActionEditor
            key={`action-${i}`}
            a={a}
            i={i}
            label={i === 0 ? 'Basic Attack' : `Action ${i + 1}`}
            onUpdate={updateAction}
            onRemove={removeAction}
            canRemove={actions.length > 1}
            kind="action"
            attackBonus={attackBonus}
            saveDC={saveDC}
          />
        )}
      </div>

      {/* Bonus Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-parchment">Bonus Actions</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addBonusAction} className="text-gold gap-1">
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
        {bonusActions.map((a, i) =>
          <ActionEditor
            key={`bonus-${i}`}
            a={a}
            i={i}
            label={`Bonus ${i + 1}`}
            onUpdate={updateBonusAction}
            onRemove={removeBonusAction}
            canRemove
            kind="bonus"
            attackBonus={attackBonus}
            saveDC={saveDC}
          />
        )}
      </div>

      {/* Reactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-parchment">Reactions</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addReaction} className="text-gold gap-1">
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
        {reactions.map((a, i) =>
          <ActionEditor
            key={`reaction-${i}`}
            a={a}
            i={i}
            label={`Reaction ${i + 1}`}
            onUpdate={updateReaction}
            onRemove={removeReaction}
            canRemove
            kind="reaction"
            attackBonus={attackBonus}
            saveDC={saveDC}
          />
        )}
      </div>

      {/* Legendary Actions (CR 5+) */}
      {cr >= 5 && (
        <div className="space-y-3 p-3 rounded-lg border border-gold/30 bg-gold/5">
          <div className="flex items-center justify-between">
            <Label className="text-gold">Legendary Actions <span className="text-parchment-muted/60 text-xs">(boss creatures)</span></Label>
            <label className="flex items-center gap-2 text-xs text-parchment">
              <input
                type="checkbox"
                className="accent-gold"
                checked={hasLegendary}
                onChange={(e) => setHasLegendary(e.target.checked)}
              />
              Enable
            </label>
          </div>
          {hasLegendary && (
            <>
              <div className="grid grid-cols-3 gap-2 items-end">
                <div>
                  <Label className="text-parchment-muted text-xs">Points / round</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={legendaryActions.count}
                    onChange={(e) =>
                      setLegendaryActions((prev) => ({ ...prev, count: Number(e.target.value) || 3 }))
                    }
                    className="bg-teal-deep/50"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-parchment-muted text-xs">Description</Label>
                  <Input
                    placeholder="Can take 3 legendary actions, one at a time, at the end of another creature's turn..."
                    value={legendaryActions.description || ''}
                    onChange={(e) =>
                      setLegendaryActions((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="bg-teal-deep/50"
                  />
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={addLegendaryAction} className="text-gold gap-1">
                <Plus className="w-3 h-3" /> Add Legendary Action
              </Button>
              {legendaryActions.actions.map((a, i) =>
                <ActionEditor
                  key={`legendary-${i}`}
                  a={a}
                  i={i}
                  label={`Legendary ${i + 1}`}
                  onUpdate={updateLegendaryAction}
                  onRemove={removeLegendaryAction}
                  canRemove
                  kind="legendary"
                  attackBonus={attackBonus}
                  saveDC={saveDC}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Passive Traits — structured */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-parchment">Passive Traits</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addTrait} className="text-gold gap-1">
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
        <p className="text-xs text-parchment-muted">
          Always-on features: regeneration, magic resistance, drift aura, pack tactics. Each has a name + description.
        </p>
        {traits.map((t, i) => (
          <Card key={i} className="border-gold/20">
            <CardContent className="pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Trait name (e.g. Magic Resistance)"
                  value={t.name}
                  onChange={(e) => updateTrait(i, { name: e.target.value })}
                  className="bg-teal-deep/50 flex-1"
                />
                {traits.length > 1 && (
                  <button type="button" onClick={() => removeTrait(i)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                placeholder="Description (mechanics + when it triggers)"
                value={t.description}
                onChange={(e) => updateTrait(i, { description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment placeholder:text-parchment-muted/50 focus:outline-hidden focus:ring-2 focus:ring-gold/30 resize-none text-sm"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tactics */}
      <div className="space-y-2">
        <Label className="text-parchment">Tactics <span className="text-parchment-muted/60">(DM notes)</span></Label>
        <textarea
          placeholder="How does it fight? Does it open with breath weapon, retreat at half HP, target spellcasters first, summon allies?"
          value={tactics}
          onChange={(e) => setTactics(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment placeholder:text-parchment-muted/50 focus:outline-hidden focus:ring-2 focus:ring-gold/30 resize-none"
        />
        <p className="text-xs text-gold/60 italic">These appear in the DM stat block during quests.</p>
      </div>

      {/* Weaknesses */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-parchment">
            Weaknesses / Counterplay <span className="text-red-400">*</span>
          </Label>
          <Button type="button" variant="ghost" size="sm" onClick={addWeakness} className="text-gold gap-1">
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
        <p className="text-xs text-parchment-muted">
          How do players beat it? Without weaknesses, fights feel unfair.
        </p>
        {weaknesses.map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              placeholder="e.g. Slow, Vulnerable to radiant, Predictable pattern"
              value={w}
              onChange={(e) => updateWeakness(i, e.target.value)}
              className="bg-teal-deep/50 flex-1"
            />
            {weaknesses.length > 1 && (
              <button type="button" onClick={() => removeWeakness(i)} className="text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
