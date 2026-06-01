'use client'

/**
 * Damage Dialog — apply damage with resist/vuln/immunity, then auto-prompt
 * a concentration save if the character is currently concentrating.
 */

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Skull, X } from 'lucide-react'
import type { DamageModifiers, CharacterStatus } from '@/types/player-character'

const DAMAGE_TYPES = [
  'acid','bludgeoning','cold','fire','force','lightning','necrotic',
  'piercing','poison','psychic','radiant','slashing','thunder',
] as const

export type DamageType = (typeof DAMAGE_TYPES)[number]

interface Props {
  open: boolean
  onClose: () => void
  modifiers: DamageModifiers
  status: CharacterStatus
  /** Constitution save modifier for concentration check. */
  conSaveModifier: number
  /** Called with the final HP delta (negative = damage taken). */
  onApply: (delta: number) => void
  /** Called when concentration breaks. */
  onBreakConcentration: () => void
}

function classifyDamage(modifiers: DamageModifiers, dmgType: DamageType): 'normal' | 'resist' | 'vulnerable' | 'immune' {
  const t = dmgType.toLowerCase()
  if ((modifiers.immunities ?? []).some((x) => x.toLowerCase().includes(t))) return 'immune'
  if ((modifiers.vulnerabilities ?? []).some((x) => x.toLowerCase().includes(t))) return 'vulnerable'
  if ((modifiers.resistances ?? []).some((x) => x.toLowerCase().includes(t))) return 'resist'
  return 'normal'
}

export function DamageDialog({ open, onClose, modifiers, status, conSaveModifier, onApply, onBreakConcentration }: Props) {
  const [amount, setAmount] = useState(0)
  const [dmgType, setDmgType] = useState<DamageType>('slashing')
  const [step, setStep] = useState<'enter' | 'concentration'>('enter')
  const [saveRoll, setSaveRoll] = useState<{ d20: number; total: number; dc: number; success: boolean } | null>(null)

  if (!open) return null

  const classification = classifyDamage(modifiers, dmgType)
  const adjusted =
    classification === 'immune' ? 0 :
    classification === 'resist' ? Math.floor(amount / 2) :
    classification === 'vulnerable' ? amount * 2 :
    amount

  function reset() {
    setAmount(0)
    setDmgType('slashing')
    setStep('enter')
    setSaveRoll(null)
  }

  function apply() {
    onApply(-adjusted)
    if (status.concentration_spell && adjusted > 0) {
      setStep('concentration')
      return
    }
    reset()
    onClose()
  }

  function rollConcentrationSave() {
    const dc = Math.max(10, Math.floor(adjusted / 2))
    const d20 = Math.floor(Math.random() * 20) + 1
    const total = d20 + conSaveModifier
    const success = total >= dc
    setSaveRoll({ d20, total, dc, success })
    if (!success) onBreakConcentration()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <Card className="w-full max-w-md bg-charcoal-900 border-rose-500/30" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gold/10">
          <h3 className="font-serif text-lg text-parchment flex items-center gap-2">
            <Skull className="w-5 h-5 text-rose-400" />
            {step === 'enter' ? 'Apply Damage' : 'Concentration Save'}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => { reset(); onClose() }} className="h-7 w-7 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {step === 'enter' && (
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-parchment-muted block mb-1">Damage</label>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value || '0')))}
                className="w-full bg-charcoal-950 border border-gold/15 rounded-md px-3 py-2 text-2xl font-mono text-rose-300 text-center"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-parchment-muted block mb-1">Type</label>
              <div className="grid grid-cols-3 gap-1">
                {DAMAGE_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDmgType(t)}
                    className={`text-xs py-1.5 rounded-md border capitalize transition-colors ${
                      dmgType === t
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                        : 'border-gold/10 text-parchment-muted hover:text-parchment hover:border-gold/30'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {amount > 0 && classification !== 'normal' && (
              <div className={`rounded-md p-2 text-sm text-center border ${
                classification === 'immune' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
                classification === 'resist' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' :
                'bg-orange-500/10 border-orange-500/30 text-orange-300'
              }`}>
                <Shield className="w-4 h-4 inline mr-1" />
                {classification === 'immune' && `Immune — 0 damage`}
                {classification === 'resist' && `Resistant — halved to ${adjusted}`}
                {classification === 'vulnerable' && `Vulnerable — doubled to ${adjusted}`}
              </div>
            )}

            <Button onClick={apply} className="w-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200" disabled={amount <= 0}>
              Apply {adjusted} damage
            </Button>
          </div>
        )}

        {step === 'concentration' && (
          <div className="p-4 space-y-3 text-center">
            <p className="text-sm text-parchment-muted">
              Concentrating on <span className="text-amber-300 font-medium">{status.concentration_spell}</span>.
            </p>
            <p className="text-xs text-parchment-muted">
              DC <span className="font-mono text-parchment">{Math.max(10, Math.floor(adjusted / 2))}</span> Constitution save (your bonus: {conSaveModifier >= 0 ? '+' : ''}{conSaveModifier})
            </p>
            {saveRoll ? (
              <div className={`rounded-md p-3 ${saveRoll.success ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'}`}>
                <div className="text-3xl font-mono text-parchment">{saveRoll.total}</div>
                <div className="text-xs text-parchment-muted">d20({saveRoll.d20}) {conSaveModifier >= 0 ? '+' : ''}{conSaveModifier} vs DC {saveRoll.dc}</div>
                <div className={`mt-2 text-sm font-bold uppercase tracking-wider ${saveRoll.success ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {saveRoll.success ? 'Concentration Held' : 'Concentration Broken'}
                </div>
                <Button onClick={() => { reset(); onClose() }} className="mt-3 w-full" size="sm">Done</Button>
              </div>
            ) : (
              <Button onClick={rollConcentrationSave} className="w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200">
                Roll Concentration Save
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
