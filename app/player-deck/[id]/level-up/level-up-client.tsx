'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft, Sparkles, Dices, Plus, Trophy } from 'lucide-react'
import { hitDieForClass, isAsiLevel, averageHpGain, rollHpGain, proficiencyBonusForLevel } from '@/lib/dnd-rules/level-up'
import { applyLevelUp } from '@/lib/actions/level-up'
import type { PlayerCharacterDB } from '@/types/player-character'

type Step = 'hp' | 'asi' | 'features' | 'review'
type AbilityKey = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'
const ABILITIES: AbilityKey[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']

interface Props { character: PlayerCharacterDB }

interface FeatureDraft {
  name: string
  description: string
  uses_max?: number
  recharge?: 'short_rest' | 'long_rest' | 'dawn' | null
}

function mod(score: number): number { return Math.floor((score - 10) / 2) }

export function LevelUpClient({ character }: Props) {
  const router = useRouter()
  const newLevel = character.level + 1
  const die = hitDieForClass(character.class)
  const conMod = mod(character.constitution)
  const asiLevel = isAsiLevel(character.class, newLevel)

  const [step, setStep] = useState<Step>('hp')
  const [hpChoice, setHpChoice] = useState<'average' | 'roll'>('average')
  const [hpRoll, setHpRoll] = useState<number | null>(null)
  const [asiMode, setAsiMode] = useState<'asi' | 'feat'>('asi')
  const [asiPicks, setAsiPicks] = useState<Partial<Record<AbilityKey, number>>>({})
  const [featName, setFeatName] = useState('')
  const [featDesc, setFeatDesc] = useState('')
  const [features, setFeatures] = useState<FeatureDraft[]>([])
  const [saving, startSaving] = useTransition()

  const hpGained = hpChoice === 'average' ? averageHpGain(die, conMod) : (hpRoll ?? 0)
  const totalAsiPoints = Object.values(asiPicks).reduce((s, n) => s + (n ?? 0), 0)
  const asiValid = !asiLevel || asiMode === 'feat' ? !asiLevel || (asiMode === 'feat' ? !!featName.trim() : true) :
    asiMode === 'asi' && totalAsiPoints === 2 && Object.values(asiPicks).every((v) => (v ?? 0) <= 2)

  function bumpAbility(k: AbilityKey, delta: number) {
    setAsiPicks((prev) => {
      const next = { ...prev, [k]: Math.max(0, (prev[k] ?? 0) + delta) }
      const total = Object.values(next).reduce<number>((s, n) => s + (n ?? 0), 0)
      if (total > 2) return prev
      // Cap individual at 2 and don't exceed 20.
      const current = character[k] as number
      if ((next[k] ?? 0) > 2) return prev
      if (current + (next[k] ?? 0) > 20) return prev
      return next
    })
  }

  function addFeatureDraft() {
    setFeatures((prev) => [...prev, { name: '', description: '' }])
  }
  function updateFeature(i: number, patch: Partial<FeatureDraft>) {
    setFeatures((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)))
  }
  function removeFeature(i: number) {
    setFeatures((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function commit() {
    startSaving(async () => {
      try {
        await applyLevelUp({
          characterId: character.id,
          hpGained,
          asi: asiLevel && asiMode === 'asi' ? asiPicks : undefined,
          newFeat: asiLevel && asiMode === 'feat' && featName.trim()
            ? { name: featName.trim(), description: featDesc.trim() }
            : undefined,
          newFeatures: features.filter((f) => f.name.trim()).map((f) => ({
            name: f.name.trim(),
            description: f.description.trim(),
            source: 'class',
            uses_max: f.uses_max,
            recharge: f.recharge ?? null,
          })),
        })
        router.push(`/player-deck/${character.id}`)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Level-up failed')
      }
    })
  }

  function StepBtn({ label, target, disabled }: { label: string; target: Step; disabled?: boolean }) {
    return (
      <Button onClick={() => setStep(target)} disabled={disabled} variant="outline" size="sm">
        {label}
      </Button>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-5">
      <div>
        <Link href={`/player-deck/${character.id}`} className="text-xs text-parchment-muted hover:text-gold">
          ← Back to sheet
        </Link>
        <h1 className="text-2xl md:text-3xl font-serif text-parchment mt-1 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" /> Level Up
        </h1>
        <p className="text-sm text-parchment-muted">
          {character.name} · {character.class} {character.level} → {newLevel}
          {' · '}prof {proficiencyBonusForLevel(character.level)} → {proficiencyBonusForLevel(newLevel)}
        </p>
      </div>

      <div className="flex items-center gap-1 text-xs text-parchment-muted">
        {(['hp', ...(asiLevel ? ['asi' as Step] : []), 'features', 'review'] as Step[]).map((s, i, arr) => (
          <span key={s} className="flex items-center gap-1">
            <span className={step === s ? 'text-gold font-medium' : ''}>{s.toUpperCase()}</span>
            {i < arr.length - 1 && <ChevronRight className="w-3 h-3" />}
          </span>
        ))}
      </div>

      {/* HP STEP */}
      {step === 'hp' && (
        <Card className="p-5 bg-charcoal-950/50 border-gold-500/10 space-y-4">
          <h2 className="font-serif text-lg text-parchment">Hit Points</h2>
          <p className="text-xs text-parchment-muted">Hit die for {character.class}: d{die}. CON mod: {conMod >= 0 ? '+' : ''}{conMod}.</p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setHpChoice('average'); setHpRoll(null) }}
              className={`p-4 rounded-lg border text-left transition-colors ${
                hpChoice === 'average' ? 'border-gold/50 bg-gold/5' : 'border-gold/10 hover:border-gold/30'
              }`}
            >
              <div className="text-sm font-medium text-parchment">Average</div>
              <div className="text-2xl font-mono text-gold">+{averageHpGain(die, conMod)}</div>
              <div className="text-[10px] text-parchment-muted">d{die}/2 + 1 + CON mod</div>
            </button>
            <button
              onClick={() => {
                setHpChoice('roll')
                const r = rollHpGain(die, conMod)
                setHpRoll(r.total)
              }}
              className={`p-4 rounded-lg border text-left transition-colors ${
                hpChoice === 'roll' ? 'border-gold/50 bg-gold/5' : 'border-gold/10 hover:border-gold/30'
              }`}
            >
              <div className="text-sm font-medium text-parchment flex items-center gap-1">
                <Dices className="w-3.5 h-3.5" /> Roll d{die}
              </div>
              <div className="text-2xl font-mono text-gold">
                {hpRoll != null ? `+${hpRoll}` : '—'}
              </div>
              <div className="text-[10px] text-parchment-muted">{hpChoice === 'roll' ? 'Click again to re-roll' : 'Click to roll'}</div>
            </button>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep(asiLevel ? 'asi' : 'features')}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* ASI STEP */}
      {step === 'asi' && asiLevel && (
        <Card className="p-5 bg-charcoal-950/50 border-gold-500/10 space-y-4">
          <h2 className="font-serif text-lg text-parchment flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Ability Score Improvement
          </h2>
          <p className="text-xs text-parchment-muted">Level {newLevel} grants +2 ability points or a feat.</p>

          <div className="flex gap-2">
            {(['asi', 'feat'] as const).map((m) => (
              <Button
                key={m}
                size="sm"
                variant={asiMode === m ? 'default' : 'outline'}
                onClick={() => setAsiMode(m)}
              >
                {m === 'asi' ? '+2 to abilities' : 'Take a feat'}
              </Button>
            ))}
          </div>

          {asiMode === 'asi' && (
            <div className="space-y-2">
              {ABILITIES.map((k) => {
                const current = character[k] as number
                const bump = asiPicks[k] ?? 0
                return (
                  <div key={k} className="flex items-center justify-between p-2 rounded bg-charcoal-900/50 border border-gold/5">
                    <span className="capitalize text-sm text-parchment">{k}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-parchment-muted">{current}</span>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => bumpAbility(k, -1)} disabled={bump <= 0}>−</Button>
                      <span className="w-8 text-center font-mono text-gold">{bump > 0 ? `+${bump}` : '—'}</span>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => bumpAbility(k, +1)}>+</Button>
                      <span className="font-mono text-xs text-emerald-300 w-8 text-right">→ {current + bump}</span>
                    </div>
                  </div>
                )
              })}
              <p className="text-xs text-parchment-muted text-right">
                Spent {totalAsiPoints}/2 · {totalAsiPoints === 2 ? 'ready' : `${2 - totalAsiPoints} remaining`}
              </p>
            </div>
          )}

          {asiMode === 'feat' && (
            <div className="space-y-2">
              <input
                value={featName}
                onChange={(e) => setFeatName(e.target.value)}
                placeholder="Feat name (e.g. Lucky, Great Weapon Master)"
                className="w-full bg-charcoal-900 border border-gold/15 rounded px-3 py-2 text-sm text-parchment"
              />
              <textarea
                value={featDesc}
                onChange={(e) => setFeatDesc(e.target.value)}
                placeholder="Description / mechanical effects (optional)"
                rows={3}
                className="w-full bg-charcoal-900 border border-gold/15 rounded px-3 py-2 text-sm text-parchment"
              />
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('hp')}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
            <Button onClick={() => setStep('features')} disabled={!asiValid}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* FEATURES STEP */}
      {step === 'features' && (
        <Card className="p-5 bg-charcoal-950/50 border-gold-500/10 space-y-4">
          <h2 className="font-serif text-lg text-parchment">New Features</h2>
          <p className="text-xs text-parchment-muted">
            Add any class features, spells-known increases, or subclass abilities unlocked at level {newLevel}. Check the {character.class} table in your rulebook.
          </p>

          <div className="space-y-2">
            {features.map((f, i) => (
              <div key={i} className="p-3 rounded border border-gold/10 bg-charcoal-900/40 space-y-2">
                <div className="flex gap-2">
                  <input
                    value={f.name}
                    onChange={(e) => updateFeature(i, { name: e.target.value })}
                    placeholder="Feature name"
                    className="flex-1 bg-charcoal-950 border border-gold/10 rounded px-2 py-1 text-sm text-parchment"
                  />
                  <Button size="sm" variant="ghost" className="text-rose-300" onClick={() => removeFeature(i)}>×</Button>
                </div>
                <textarea
                  value={f.description}
                  onChange={(e) => updateFeature(i, { description: e.target.value })}
                  placeholder="Description"
                  rows={2}
                  className="w-full bg-charcoal-950 border border-gold/10 rounded px-2 py-1 text-sm text-parchment"
                />
                <div className="flex gap-2 items-center text-xs text-parchment-muted">
                  <label>Uses/rest:</label>
                  <input
                    type="number"
                    min={0}
                    value={f.uses_max ?? ''}
                    onChange={(e) => updateFeature(i, { uses_max: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-16 bg-charcoal-950 border border-gold/10 rounded px-2 py-1 text-sm text-parchment font-mono"
                  />
                  <select
                    value={f.recharge ?? ''}
                    onChange={(e) => updateFeature(i, { recharge: (e.target.value || null) as FeatureDraft['recharge'] })}
                    className="bg-charcoal-950 border border-gold/10 rounded px-2 py-1 text-sm text-parchment"
                  >
                    <option value="">no recharge</option>
                    <option value="short_rest">short rest</option>
                    <option value="long_rest">long rest</option>
                    <option value="dawn">dawn</option>
                  </select>
                </div>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={addFeatureDraft}>
              <Plus className="w-3 h-3 mr-1" /> Add feature
            </Button>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(asiLevel ? 'asi' : 'hp')}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
            <Button onClick={() => setStep('review')}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* REVIEW STEP */}
      {step === 'review' && (
        <Card className="p-5 bg-charcoal-950/50 border-gold-500/10 space-y-4">
          <h2 className="font-serif text-lg text-parchment">Review</h2>
          <ul className="text-sm text-parchment space-y-1">
            <li>Level: <span className="text-gold font-mono">{character.level} → {newLevel}</span></li>
            <li>HP: <span className="text-emerald-300 font-mono">+{hpGained}</span> ({character.max_hp} → {character.max_hp + hpGained})</li>
            <li>Proficiency bonus: <span className="text-gold font-mono">{proficiencyBonusForLevel(character.level)} → {proficiencyBonusForLevel(newLevel)}</span></li>
            {asiLevel && asiMode === 'asi' && Object.entries(asiPicks).filter(([, v]) => v).length > 0 && (
              <li>
                ASI: {Object.entries(asiPicks).filter(([, v]) => v).map(([k, v]) => `${k.slice(0, 3).toUpperCase()} +${v}`).join(', ')}
              </li>
            )}
            {asiLevel && asiMode === 'feat' && featName && (
              <li>Feat: <span className="text-amber-300">{featName}</span></li>
            )}
            {features.filter((f) => f.name).length > 0 && (
              <li>
                Features: {features.filter((f) => f.name).map((f) => f.name).join(', ')}
              </li>
            )}
          </ul>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('features')}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
            <Button onClick={commit} disabled={saving || hpGained <= 0} className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100">
              {saving ? 'Leveling up…' : `Confirm Level ${newLevel}`}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
