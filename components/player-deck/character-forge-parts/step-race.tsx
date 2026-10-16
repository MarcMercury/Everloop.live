'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { DND_RACES } from '@/types/player-character'
import {
  getRace,
} from '@/lib/data'
import { TextStudyButton } from '../forge-info'
import { RACE_INFO } from './constants'

export function StepRace({
  race, setRace, subrace, setSubrace,
}: {
  race: string; setRace: (v: string) => void
  subrace: string; setSubrace: (v: string) => void
}) {
  const raceData = getRace(race)
  const raceInfo = RACE_INFO[race]
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Race selection grid */}
      <div className="space-y-4 md:col-span-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {DND_RACES.map(r => {
            const rd = getRace(r)
            const info = RACE_INFO[r]
            const isSelected = race === r
            const displayTrait = rd ? `+${Object.entries(rd.abilityBonuses).map(([k,v]) => `${v} ${k.slice(0,3).toUpperCase()}`).join(', ')}` : info?.traits[0]
            return (
              <button
                key={r}
                onClick={() => { setRace(r); setSubrace('') }}
                className={`text-left p-3 rounded-lg border transition-all touch-target-lg ${
                  isSelected
                    ? 'border-gold-500/50 bg-gold-500/10 shadow-lg shadow-gold-500/5'
                    : 'border-gold-500/10 bg-teal-rich/50 hover:border-gold-500/25 hover:bg-teal-rich'
                }`}
              >
                <div className={`text-sm font-serif ${isSelected ? 'text-gold-500' : 'text-parchment'}`}>
                  {r}
                </div>
                {displayTrait && (
                  <div className="text-[10px] text-parchment-muted mt-0.5 line-clamp-2">
                    {displayTrait}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Race Info Panel */}
      {(raceData || raceInfo) && (
        <Card className="md:col-span-2 p-5 bg-teal-rich/60 border-gold-500/15">
          <h3 className="font-serif text-lg text-parchment mb-2">{race}</h3>
          <p className="text-sm text-parchment-muted mb-4">{raceData?.desc || raceInfo?.description}</p>
          <div className="space-y-2">
            <h4 className="text-xs text-gold-500 uppercase tracking-wider font-medium">Racial Traits</h4>
            <div className="flex flex-wrap gap-2">
              {raceData ? (
                <>
                  {Object.entries(raceData.abilityBonuses).map(([key, val]) => (
                    <Badge key={key} variant="outline" className="border-emerald-500/30 text-emerald-400">
                      +{val} {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Badge>
                  ))}
                  {raceData.traits.map((trait, i) => (
                    <span key={i} className="inline-flex items-center gap-1">
                      <Badge variant="outline" className="border-gold-500/20 text-parchment-muted">
                        {trait.name}
                      </Badge>
                      <TextStudyButton
                        title={trait.name}
                        subtitle={`${race} Trait`}
                        description={trait.desc}
                        accent="#34d399"
                        className="text-parchment-muted/50 hover:text-emerald-300 p-1 rounded touch-target"
                      />
                    </span>
                  ))}
                </>
              ) : raceInfo?.traits.map((trait, i) => (
                <Badge key={i} variant="outline" className="border-gold-500/20 text-parchment-muted">
                  {trait}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-parchment-muted">
              <span>Speed: <strong className="text-parchment">{raceData?.speed || raceInfo?.speed || 30} ft</strong></span>
              <span>Size: <strong className="text-parchment">{raceData?.size || 'Medium'}</strong></span>
              {raceData && raceData.darkvision > 0 && (
                <span>Darkvision: <strong className="text-parchment">{raceData.darkvision} ft</strong></span>
              )}
            </div>
          </div>

          {/* Subrace dropdown or input */}
          <div className="mt-4 pt-4 border-t border-gold-500/10">
            <Label className="text-parchment-muted text-xs">Subrace</Label>
            {raceData?.subraces && raceData.subraces.length > 0 ? (
              <select
                value={subrace}
                onChange={e => setSubrace(e.target.value)}
                className="w-full h-10 mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm px-3"
              >
                <option value="">None</option>
                {raceData.subraces.map(sr => (
                  <option key={sr.name} value={sr.name}>{sr.name}</option>
                ))}
              </select>
            ) : (
              <Input
                value={subrace}
                onChange={e => setSubrace(e.target.value)}
                placeholder="e.g. High Elf"
                className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment"
              />
            )}
            {subrace && raceData?.subraces?.find(sr => sr.name === subrace) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(raceData.subraces.find(sr => sr.name === subrace)!.abilityBonuses).map(([key, val]) => (
                  <Badge key={key} variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
                    +{val} {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Badge>
                ))}
                {raceData.subraces.find(sr => sr.name === subrace)!.traits.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    <Badge variant="outline" className="border-gold-500/20 text-parchment-muted text-[10px]">
                      {t.name}
                    </Badge>
                    <TextStudyButton
                      title={t.name}
                      subtitle={`${subrace} Trait`}
                      description={t.desc}
                      accent="#34d399"
                      className="text-parchment-muted/50 hover:text-emerald-300 p-0.5 rounded touch-target"
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

        </Card>
      )}
    </div>
  )
}
