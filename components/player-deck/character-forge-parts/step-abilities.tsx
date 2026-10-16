'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Star, Plus, Minus } from 'lucide-react'
import { abilityModifier, formatModifier } from '@/types/player-character'
import {
  getClass,
  FEATS,
  meetsFeatPrereq,
} from '@/lib/data'
import { FeatStudyButton } from '../forge-info'
import { STANDARD_ARRAY, POINT_BUY_MAX, POINT_COSTS, ABILITY_NAMES, ABILITY_SHORT, ABILITY_DESCRIPTIONS } from './constants'
import { asiOpportunities } from './utils'
import type { AbilityMethod } from './types'

export function StepAbilities({
  method, setMethod, abilities, setAbilityScore,
  standardAssignment, assignStandardScore, pointBuyTotal,
  charClass, level, finalAbilities, selectedFeats, setSelectedFeats,
}: {
  method: AbilityMethod; setMethod: (v: AbilityMethod) => void
  abilities: number[]; setAbilityScore: (i: number, v: number) => void
  standardAssignment: (number | null)[]; assignStandardScore: (i: number, v: number | null) => void
  pointBuyTotal: number
  charClass: string; level: number; finalAbilities: number[]
  selectedFeats: string[]; setSelectedFeats: (v: string[]) => void
}) {
  const usedStandard = new Set(standardAssignment.filter(v => v !== null))

  return (
    <div className="space-y-6">
      {/* Method Selection */}
      <div className="flex flex-wrap gap-3">
        {[
          { id: 'standard' as const, label: 'Standard Array', desc: '15, 14, 13, 12, 10, 8' },
          { id: 'point-buy' as const, label: 'Point Buy', desc: '27 points to spend' },
          { id: 'manual' as const, label: 'Manual Entry', desc: 'Type your scores' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`flex-1 min-w-[140px] p-3 rounded-lg border transition-all text-left touch-target-lg ${
              method === m.id
                ? 'border-gold-500/50 bg-gold-500/10'
                : 'border-gold-500/10 bg-teal-rich/50 hover:border-gold-500/25'
            }`}
          >
            <div className={`text-sm font-medium ${method === m.id ? 'text-gold-500' : 'text-parchment'}`}>
              {m.label}
            </div>
            <div className="text-[10px] text-parchment-muted">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* Point Buy Budget */}
      {method === 'point-buy' && (
        <Card className="p-3 bg-teal-rich/60 border-gold-500/15 flex items-center justify-between">
          <span className="text-sm text-parchment-muted">Points spent:</span>
          <span className={`text-lg font-mono font-bold ${pointBuyTotal > POINT_BUY_MAX ? 'text-red-400' : 'text-gold-500'}`}>
            {pointBuyTotal} / {POINT_BUY_MAX}
          </span>
        </Card>
      )}

      {/* Ability Score Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ABILITY_NAMES.map((name, i) => (
          <Card
            key={name}
            className="p-4 bg-teal-rich/60 border-gold-500/15 text-center"
          >
            <div className="text-xs text-gold-500 uppercase tracking-wider font-medium mb-1">
              {ABILITY_SHORT[i]}
            </div>
            <div className="text-[10px] text-parchment-muted mb-3">
              {ABILITY_DESCRIPTIONS[name]}
            </div>

            {method === 'standard' ? (
              /* Standard Array: dropdown assignment */
              <div>
                <select
                  value={standardAssignment[i] ?? ''}
                  onChange={e => assignStandardScore(i, e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full h-10 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-center text-lg font-mono appearance-none cursor-pointer"
                >
                  <option value="">—</option>
                  {STANDARD_ARRAY.map(score => (
                    <option
                      key={score}
                      value={score}
                      disabled={usedStandard.has(score) && standardAssignment[i] !== score}
                    >
                      {score}
                    </option>
                  ))}
                </select>
                {standardAssignment[i] !== null && (
                  <div className="text-sm text-parchment-muted mt-1 font-mono">
                    Mod: {formatModifier(abilityModifier(standardAssignment[i]!))}
                  </div>
                )}
              </div>
            ) : method === 'point-buy' ? (
              /* Point Buy: +/- buttons */
              <div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setAbilityScore(i, abilities[i] - 1)}
                    disabled={abilities[i] <= 8}
                    className="w-8 h-8 p-0 text-parchment-muted"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-2xl font-mono font-bold text-parchment w-8 text-center">
                    {abilities[i]}
                  </span>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => setAbilityScore(i, abilities[i] + 1)}
                    disabled={abilities[i] >= 15}
                    className="w-8 h-8 p-0 text-parchment-muted"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="text-[10px] text-parchment-muted mt-1">
                  Cost: {POINT_COSTS[abilities[i]] ?? '?'} pts
                </div>
                <div className="text-sm text-parchment-muted font-mono">
                  Mod: {formatModifier(abilityModifier(abilities[i]))}
                </div>
              </div>
            ) : (
              /* Manual Entry */
              <div>
                <Input
                  type="number" min={1} max={30}
                  value={abilities[i]}
                  onChange={e => setAbilityScore(i, parseInt(e.target.value) || 10)}
                  className="bg-charcoal-950 border-gold-500/10 text-parchment text-center text-xl font-mono h-12"
                />
                <div className="text-sm text-parchment-muted mt-1 font-mono">
                  Mod: {formatModifier(abilityModifier(abilities[i]))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Feats — optional; available at ASI levels (4/8/12/16/19, + class extras) */}
      {(() => {
        const slots = asiOpportunities(charClass, level)
        const cd = getClass(charClass)
        const abilityRecord: Record<string, number> = {
          strength: finalAbilities[0], dexterity: finalAbilities[1], constitution: finalAbilities[2],
          intelligence: finalAbilities[3], wisdom: finalAbilities[4], charisma: finalAbilities[5],
        }
        const profList = (cd?.armorProfs ?? []).map(p => `${p} armor`.toLowerCase())
          .concat((cd?.weaponProfs ?? []).map(p => p.toLowerCase()))
        function toggleFeat(name: string) {
          if (selectedFeats.includes(name)) setSelectedFeats(selectedFeats.filter(f => f !== name))
          else if (selectedFeats.length < slots) setSelectedFeats([...selectedFeats, name])
        }
        return (
          <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
                <Star className="w-4 h-4" /> Feats
              </h3>
              <span className="text-xs text-parchment-muted">
                {slots > 0 ? `${selectedFeats.length} / ${slots} selected` : 'Unlocks at Lv4'}
              </span>
            </div>
            <p className="text-xs text-parchment-muted">
              {slots > 0
                ? `You may take a feat in place of an Ability Score Improvement. At Level ${level}, your ${charClass} has reached ${slots} such ${slots === 1 ? 'opportunity' : 'opportunities'}. Tap ⓘ to study each feat.`
                : 'Feats become available at Level 4 (and certain class levels). You can still browse and study them below.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {FEATS.map(feat => {
                const isSelected = selectedFeats.includes(feat.name)
                const meets = meetsFeatPrereq(feat, abilityRecord, profList)
                const isDisabled = !isSelected && (slots === 0 || selectedFeats.length >= slots)
                return (
                  <div key={feat.name} className="relative">
                    <button
                      onClick={() => toggleFeat(feat.name)}
                      disabled={isDisabled}
                      className={`w-full p-2.5 pr-8 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-gold-500/50 bg-gold-500/15'
                          : isDisabled
                          ? 'border-gold-500/5 bg-charcoal-900/30 cursor-not-allowed opacity-50'
                          : 'border-gold-500/10 bg-charcoal-900/50 hover:border-gold-500/30'
                      }`}
                    >
                      <div className={`text-sm font-medium flex items-center gap-1.5 ${isSelected ? 'text-gold-500' : 'text-parchment'}`}>
                        {isSelected && <Check className="w-3 h-3 shrink-0" />}
                        {feat.name}
                      </div>
                      <div className="text-[10px] text-parchment-muted mt-0.5 line-clamp-1">{feat.desc}</div>
                      {feat.prerequisite !== 'None' && (
                        <span className={`text-[9px] ${meets ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {meets ? '✓ ' : '⚠ '}Req: {feat.prerequisite}
                        </span>
                      )}
                    </button>
                    <span className="absolute top-1.5 right-1.5">
                      <FeatStudyButton feat={feat} className="text-parchment-muted/50 hover:text-gold-500 p-1 rounded touch-target" />
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        )
      })()}
    </div>
  )
}
