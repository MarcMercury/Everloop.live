'use client'

import { Card } from '@/components/ui/card'
import { Flame } from 'lucide-react'
import type { WeaponEntry } from '@/types/player-character'
import { CLASS_COLORS, abilityModifier, formatModifier } from '@/types/player-character'
import { ABILITY_SHORT } from './constants'

export function StepReview({
  name, race, subrace, charClass, subclass, level,
  abilities, background, alignment, maxHp, baseAC, speed,
  classInfo, weapons, portraitUrl,
}: {
  name: string; race: string; subrace: string
  charClass: string; subclass: string; level: number
  abilities: number[]; background: string; alignment: string
  maxHp: number; baseAC: number; speed: number
  classInfo: { hitDie: string; primaryAbility: string } | undefined
  weapons: WeaponEntry[]
  portraitUrl: string
}) {
  const classColor = CLASS_COLORS[charClass] || '#d4a84b'
  const profBonus = level <= 4 ? 2 : level <= 8 ? 3 : level <= 12 ? 4 : level <= 16 ? 5 : 6

  return (
    <div className="space-y-6">
      {/* Character Card Preview */}
      <Card className="overflow-hidden border-gold-500/20 bg-linear-to-br from-teal-rich/80 to-charcoal-900/80">
        <div className="h-1.5" style={{ backgroundColor: classColor }} />
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Portrait */}
            <div className="w-24 h-32 rounded-lg overflow-hidden shrink-0 border border-gold-500/20">
              {portraitUrl ? (
                // Portrait URLs are arbitrary user/AI-generated hosts not covered by next/image remotePatterns.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={portraitUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${classColor}25 0%, ${classColor}08 100%)` }}
                >
                  <span className="text-4xl font-serif" style={{ color: classColor }}>
                    {name ? name.charAt(0) : '?'}
                  </span>
                </div>
              )}
            </div>

            {/* Name & Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-serif text-parchment">
                {name || 'Unnamed Hero'}
              </h2>
              <p className="text-sm text-parchment-muted">
                Level {level} {race}{subrace ? ` (${subrace})` : ''} {charClass}{subclass ? ` — ${subclass}` : ''}
              </p>
              {background && <p className="text-xs text-parchment-muted/60 mt-0.5">{background} • {alignment}</p>}

              {/* Core stats */}
              <div className="flex gap-4 mt-4">
                <div className="text-center">
                  <div className="text-xs text-red-400">HP</div>
                  <div className="text-xl font-mono font-bold text-parchment">{maxHp}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-blue-400">AC</div>
                  <div className="text-xl font-mono font-bold text-parchment">{baseAC}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-emerald-400">Speed</div>
                  <div className="text-xl font-mono font-bold text-parchment">{speed}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gold-500">Prof</div>
                  <div className="text-xl font-mono font-bold text-parchment">+{profBonus}</div>
                </div>
                {classInfo && (
                  <div className="text-center">
                    <div className="text-xs text-amber-400">Hit Die</div>
                    <div className="text-xl font-mono font-bold text-parchment">{classInfo.hitDie}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Ability Scores Summary */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15">
        <h3 className="text-sm font-serif text-gold-500 mb-3">Ability Scores</h3>
        <div className="grid grid-cols-6 gap-2">
          {ABILITY_SHORT.map((label, i) => (
            <div key={label} className="text-center">
              <div className="text-[10px] text-gold-500/60 uppercase">{label}</div>
              <div className="text-lg font-mono font-bold text-parchment">{abilities[i]}</div>
              <div className="text-xs text-parchment-muted font-mono">
                {formatModifier(abilityModifier(abilities[i]))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Equipment Summary */}
      {weapons.length > 0 && (
        <Card className="p-5 bg-teal-rich/60 border-gold-500/15">
          <h3 className="text-sm font-serif text-gold-500 mb-3">Equipment</h3>
          <div className="space-y-1">
            {weapons.map((w, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-parchment">{w.name || 'Unnamed weapon'}</span>
                <span className="text-parchment-muted font-mono">
                  {w.damage ? `${formatModifier(w.attack_bonus)} / ${w.damage}` : '—'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Ready message */}
      <div className="text-center py-4">
        <Flame className="w-8 h-8 text-gold-500 mx-auto mb-2 float" />
        <p className="text-sm text-parchment-muted">
          Your character is ready. Click <strong className="text-gold-500">Forge Character</strong> to bring them to life.
        </p>
      </div>
    </div>
  )
}
