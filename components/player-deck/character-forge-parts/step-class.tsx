'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Check, Swords, Sparkles, Star, Plus, Minus, Zap } from 'lucide-react'
import { DND_CLASSES, CLASS_COLORS } from '@/types/player-character'
import {
  getClass,
  getClassFeaturesAtLevel,
  getFightingStyles,
  MANEUVERS,
  getManeuverCount,
} from '@/lib/data'
import { InfoButton, TextStudyButton } from '../forge-info'
import { CLASS_INFO, SKILL_STUDY } from './constants'

export function StepClass({
  charClass, setCharClass, subclass, setSubclass, level, setLevel,
  fightingStyle, setFightingStyle, pactBoon, setPactBoon,
  selectedManeuvers, setSelectedManeuvers,
  selectedSkills, setSelectedSkills,
}: {
  charClass: string; setCharClass: (v: string) => void
  subclass: string; setSubclass: (v: string) => void
  level: number; setLevel: (v: number) => void
  fightingStyle: string; setFightingStyle: (v: string) => void
  pactBoon: string; setPactBoon: (v: string) => void
  selectedManeuvers: string[]; setSelectedManeuvers: (v: string[]) => void
  selectedSkills: string[]; setSelectedSkills: (v: string[]) => void
}) {
  const cd = getClass(charClass)
  return (
    <div className="space-y-6">
      {/* Class grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {DND_CLASSES.map(c => {
          const info = CLASS_INFO[c]
          const cData = getClass(c)
          const color = CLASS_COLORS[c] || '#d4a84b'
          const isSelected = charClass === c
          return (
            <button
              key={c}
              onClick={() => { setCharClass(c); setSubclass(''); setSelectedSkills([]) }}
              className={`text-left p-3 rounded-lg border transition-all touch-target-lg ${
                isSelected
                  ? 'border-gold-500/50 bg-gold-500/10 shadow-lg shadow-gold-500/5'
                  : 'border-gold-500/10 bg-teal-rich/50 hover:border-gold-500/25 hover:bg-teal-rich'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className={`text-sm font-serif ${isSelected ? 'text-gold-500' : 'text-parchment'}`}>
                  {c}
                </span>
              </div>
              <div className="text-[10px] text-parchment-muted mt-0.5">
                Hit Die: d{cData?.hitDie || info?.hitDie || '?'} | {cData?.primaryAbility || info?.primaryAbility || '?'}
              </div>
            </button>
          )
        })}
      </div>

      {/* Class Info Panel */}
      {(cd || CLASS_INFO[charClass]) && (
        <Card className="p-5 bg-teal-rich/60 border-gold-500/15">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-lg text-parchment">{charClass}</h3>
              <p className="text-sm text-parchment-muted mt-1">{cd?.desc || CLASS_INFO[charClass]?.description}</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: `${CLASS_COLORS[charClass]}20`, color: CLASS_COLORS[charClass] }}
            >
              d{cd?.hitDie || '?'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <span className="text-xs text-gold-500 uppercase tracking-wider">Primary Ability</span>
              <p className="text-sm text-parchment mt-0.5">{cd?.primaryAbility || CLASS_INFO[charClass]?.primaryAbility}</p>
            </div>
            <div>
              <span className="text-xs text-gold-500 uppercase tracking-wider">Saving Throws</span>
              <p className="text-sm text-parchment mt-0.5">{cd?.savingThrows.join(', ') || CLASS_INFO[charClass]?.saves}</p>
            </div>
          </div>

          {/* Proficiencies */}
          {cd && (
            <div className="mt-4">
              <span className="text-xs text-gold-500 uppercase tracking-wider">Proficiencies</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {cd.armorProfs.map(p => (
                  <Badge key={p} variant="outline" className="border-blue-500/20 text-blue-300 text-[10px]">{p} Armor</Badge>
                ))}
                {cd.weaponProfs.map(p => (
                  <Badge key={p} variant="outline" className="border-red-500/20 text-red-300 text-[10px]">{p} Weapons</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <span className="text-xs text-gold-500 uppercase tracking-wider">Class Features (to Lv{level})</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {cd ? (
                getClassFeaturesAtLevel(charClass, Math.max(level, 1)).map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    <Badge variant="outline" className="border-gold-500/20 text-parchment-muted">
                      {f.name} {f.level > 1 ? `(Lv${f.level})` : ''}
                    </Badge>
                    <TextStudyButton
                      title={f.name}
                      subtitle={`${charClass} · Level ${f.level}`}
                      description={f.desc}
                      accent={CLASS_COLORS[charClass]}
                      className="text-parchment-muted/50 hover:text-gold-500 p-1 rounded touch-target"
                    />
                  </span>
                ))
              ) : CLASS_INFO[charClass]?.features.map((f, i) => (
                <Badge key={i} variant="outline" className="border-gold-500/20 text-parchment-muted">
                  {f}
                </Badge>
              ))}
            </div>
          </div>

          {/* Spellcasting badge */}
          {cd?.spellcasting && (
            <div className="mt-3 flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Sparkles className="w-3 h-3 mr-1" /> Spellcaster — {cd.spellcasting.ability.charAt(0).toUpperCase() + cd.spellcasting.ability.slice(1)}
              </Badge>
              <span className="text-[10px] text-parchment-muted">
                {cd.spellcasting.type === 'prepared' ? 'Prepares spells daily' : cd.spellcasting.type === 'known' ? 'Learns fixed spells' : 'Pact Magic'}
              </span>
            </div>
          )}

          {/* Subclass + Level */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gold-500/10">
            <div>
              <Label className="text-parchment-muted text-xs flex items-center gap-1.5">
                {cd?.subclassName || 'Subclass'} {cd ? `(at Lv${cd.subclassLevel})` : ''}
                {cd && cd.subclasses.length > 0 && (
                  <InfoButton
                    title={`${charClass} — ${cd.subclassName}s`}
                    subtitle={`Choose at Level ${cd.subclassLevel}`}
                    accent={CLASS_COLORS[charClass]}
                  >
                    <div className="space-y-3">
                      {cd.subclasses.map(sc => (
                        <div key={sc.name}>
                          <div className="text-sm font-medium text-parchment">{sc.name}</div>
                          <p className="text-xs text-parchment-muted mt-0.5">{sc.desc}</p>
                        </div>
                      ))}
                    </div>
                  </InfoButton>
                )}
              </Label>
              {cd && cd.subclasses.length > 0 ? (
                <select
                  value={subclass}
                  onChange={e => setSubclass(e.target.value)}
                  className="w-full h-10 mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm px-3"
                >
                  <option value="">Select {cd.subclassName}...</option>
                  {cd.subclasses.map(sc => (
                    <option key={sc.name} value={sc.name}>{sc.name}</option>
                  ))}
                </select>
              ) : (
                <Input
                  value={subclass}
                  onChange={e => setSubclass(e.target.value)}
                  placeholder="e.g. Battle Master, Evocation..."
                  className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
                />
              )}
              {subclass && cd?.subclasses.find(sc => sc.name === subclass) && (
                <p className="text-[10px] text-parchment-muted mt-1">
                  {cd.subclasses.find(sc => sc.name === subclass)!.desc}
                </p>
              )}
            </div>
            <div>
              <Label className="text-parchment-muted text-xs">Starting Level</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setLevel(Math.max(1, level - 1))}
                  className="text-parchment-muted h-9 w-9 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number" min={1} max={20}
                  value={level}
                  onChange={e => setLevel(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                  className="bg-charcoal-950 border-gold-500/10 text-parchment text-center w-16"
                />
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setLevel(Math.min(20, level + 1))}
                  className="text-parchment-muted h-9 w-9 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Skill Proficiencies — chosen from class list */}
      {cd && cd.skillChoice.from.length > 0 && (() => {
        const max = cd.skillChoice.count
        const fromList = cd.skillChoice.from
        function toggleSkill(skill: string) {
          if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter(s => s !== skill))
          } else if (selectedSkills.filter(s => fromList.includes(s)).length < max) {
            setSelectedSkills([...selectedSkills, skill])
          }
        }
        const chosen = selectedSkills.filter(s => fromList.includes(s)).length
        return (
          <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
                <Star className="w-4 h-4" /> Skill Proficiencies
              </h3>
              <span className="text-xs text-parchment-muted">{chosen} / {max} selected</span>
            </div>
            <p className="text-xs text-parchment-muted">
              Choose {max} skill{max === 1 ? '' : 's'} your {charClass} training grants. Tap ⓘ to study what each covers.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {fromList.map(skill => {
                const isSelected = selectedSkills.includes(skill)
                const isDisabled = !isSelected && chosen >= max
                const ref = SKILL_STUDY[skill]
                return (
                  <div key={skill} className="relative">
                    <button
                      onClick={() => toggleSkill(skill)}
                      disabled={isDisabled}
                      className={`w-full p-2.5 pr-8 rounded-lg border text-left text-sm transition-all ${
                        isSelected
                          ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200'
                          : isDisabled
                          ? 'border-gold-500/5 bg-charcoal-900/30 text-parchment-muted/30 cursor-not-allowed'
                          : 'border-gold-500/10 bg-charcoal-900/50 text-parchment hover:border-emerald-500/25 hover:bg-emerald-500/5'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {isSelected && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                        {skill}
                      </span>
                    </button>
                    <span className="absolute top-1.5 right-1.5">
                      <TextStudyButton
                        title={skill}
                        subtitle={ref ? `${ref.ability} skill` : 'Skill'}
                        description={ref?.desc}
                        accent="#34d399"
                        className="text-parchment-muted/50 hover:text-emerald-300 p-1 rounded touch-target"
                      />
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        )
      })()}

      {/* Fighting Style Picker */}
      {['Fighter', 'Ranger', 'Paladin'].includes(charClass) && (
        <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
          <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
            <Swords className="w-4 h-4" /> Fighting Style
          </h3>
          <p className="text-xs text-parchment-muted">Choose a fighting style. You cannot take the same fighting style more than once.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {getFightingStyles(charClass).map(fs => {
              const isSelected = fightingStyle === fs.name
              return (
                <button
                  key={fs.name}
                  onClick={() => setFightingStyle(isSelected ? '' : fs.name)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-gold-500/50 bg-gold-500/15'
                      : 'border-gold-500/10 bg-charcoal-900/50 hover:border-gold-500/25'
                  }`}
                >
                  <div className={`text-sm font-medium ${isSelected ? 'text-gold-500' : 'text-parchment'}`}>
                    {isSelected && <Check className="w-3 h-3 inline mr-1.5" />}
                    {fs.name}
                  </div>
                  <div className="text-[10px] text-parchment-muted mt-0.5">{fs.desc}</div>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* Pact Boon Picker (Warlock, level 3+) */}
      {charClass === 'Warlock' && level >= 3 && (
        <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
          <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Pact Boon
          </h3>
          <p className="text-xs text-parchment-muted">At 3rd level, your patron grants you a gift.</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'Pact of the Chain', desc: 'Gain an improved familiar (imp, pseudodragon, quasit, or sprite).' },
              { name: 'Pact of the Blade', desc: 'Conjure a magical pact weapon in any form you choose.' },
              { name: 'Pact of the Tome', desc: 'Gain a Book of Shadows with 3 cantrips from any class.' },
              { name: 'Pact of the Talisman', desc: 'Gain a talisman that adds 1d4 to failed ability checks.' },
            ].map(pb => {
              const isSelected = pactBoon === pb.name
              return (
                <button
                  key={pb.name}
                  onClick={() => setPactBoon(isSelected ? '' : pb.name)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-purple-500/50 bg-purple-500/15'
                      : 'border-gold-500/10 bg-charcoal-900/50 hover:border-purple-500/25'
                  }`}
                >
                  <div className={`text-sm font-medium ${isSelected ? 'text-purple-300' : 'text-parchment'}`}>
                    {isSelected && <Check className="w-3 h-3 inline mr-1.5" />}
                    {pb.name}
                  </div>
                  <div className="text-[10px] text-parchment-muted mt-0.5">{pb.desc}</div>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* Battle Master Maneuvers */}
      {charClass === 'Fighter' && subclass === 'Battle Master' && level >= 3 && (
        <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Battle Master Maneuvers
            </h3>
            <span className="text-xs text-parchment-muted">
              {selectedManeuvers.length} / {getManeuverCount(level)} selected
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MANEUVERS.map(m => {
              const isSelected = selectedManeuvers.includes(m.name)
              const isDisabled = !isSelected && selectedManeuvers.length >= getManeuverCount(level)
              return (
                <button
                  key={m.name}
                  disabled={isDisabled}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedManeuvers(selectedManeuvers.filter(n => n !== m.name))
                    } else {
                      setSelectedManeuvers([...selectedManeuvers, m.name])
                    }
                  }}
                  className={`p-2.5 rounded-lg border text-left text-sm transition-all ${
                    isSelected
                      ? 'border-gold-500/50 bg-gold-500/15'
                      : isDisabled
                      ? 'border-gold-500/5 bg-charcoal-900/30 text-parchment-muted/30 cursor-not-allowed'
                      : 'border-gold-500/10 bg-charcoal-900/50 hover:border-gold-500/25'
                  }`}
                >
                  <div className={`font-medium ${isSelected ? 'text-gold-500' : isDisabled ? 'text-parchment-muted/30' : 'text-parchment'}`}>
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {m.name}
                  </div>
                  <div className="text-[10px] text-parchment-muted mt-0.5 line-clamp-2">{m.desc}</div>
                </button>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
