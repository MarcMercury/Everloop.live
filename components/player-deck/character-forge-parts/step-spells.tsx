'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Swords, Sparkles, BookOpen, Scroll, Star, Zap, Wand2 } from 'lucide-react'
import {
  getClass,
  isSpellcaster,
  getMaxSpellLevel,
  getCantrips,
  getSpellsAtLevel,
  getAllCantrips,
  getAvailableInvocations,
  getInvocationCount,
  getSubclassBonusCantrips,
  getSubclassBonusSpells,
  getRacialSpells,
} from '@/lib/data'
import { SpellStudyButton } from '../forge-info'

export function StepSpells({
  charClass, subclass, race, level, pactBoon,
  selectedCantrips, setSelectedCantrips,
  selectedSpells, setSelectedSpells,
  selectedInvocations, setSelectedInvocations,
  tomeCantrips, setTomeCantrips,
}: {
  charClass: string
  subclass: string
  race: string
  level: number
  pactBoon: string
  selectedCantrips: string[]
  setSelectedCantrips: (v: string[]) => void
  selectedSpells: Record<number, string[]>
  setSelectedSpells: (v: Record<number, string[]>) => void
  selectedInvocations: string[]
  setSelectedInvocations: (v: string[]) => void
  tomeCantrips: string[]
  setTomeCantrips: (v: string[]) => void
}) {
  const classData = getClass(charClass)
  const isCaster = isSpellcaster(charClass)
  const maxSpellLevel = isCaster ? getMaxSpellLevel(charClass, level) : 0
  const cantrips = isCaster ? getCantrips(charClass) : []
  const maxCantrips = classData?.spellcasting?.cantripsKnown[level - 1] ?? 0
  const maxSpellsKnown = classData?.spellcasting?.spellsKnown?.[level - 1]
  const casterType = classData?.spellcasting?.type || 'prepared'

  // Subclass bonus cantrips/spells
  const bonusCantrips = subclass ? getSubclassBonusCantrips(charClass, subclass) : []
  const bonusSpells = subclass ? getSubclassBonusSpells(charClass, subclass, maxSpellLevel) : {}

  // Racial spellcasting
  const racialSpells = getRacialSpells(race, level)

  // Invocations (Warlock only)
  const isWarlock = charClass === 'Warlock'
  const invocLevel = isWarlock && level >= 2 ? level : 0
  const availableInvocations = invocLevel > 0 ? getAvailableInvocations(invocLevel, pactBoon || undefined) : []
  const maxInvocations = invocLevel > 0 ? getInvocationCount(invocLevel) : 0

  // Pact of the Tome cross-class cantrips
  const allCantrips = pactBoon === 'Pact of the Tome' ? getAllCantrips() : []
  const tomeMax = 3

  const totalSelectedSpells = Object.values(selectedSpells).reduce((sum, arr) => sum + arr.length, 0)

  const [aiLoading, setAiLoading] = useState(false)
  const [aiReasoning, setAiReasoning] = useState('')

  async function aiSuggestSpells() {
    setAiLoading(true)
    setAiReasoning('')
    try {
      const availableCantrips = cantrips
      const availableSpellsByLevel: Record<number, string[]> = {}
      for (let lv = 1; lv <= maxSpellLevel; lv++) {
        const classSpells = getSpellsAtLevel(charClass, lv)
        const subBonus = subclass ? (getSubclassBonusSpells(charClass, subclass, maxSpellLevel)[lv] || []) : []
        availableSpellsByLevel[lv] = Array.from(new Set([...classSpells, ...subBonus])).sort()
      }

      const res = await fetch('/api/player-deck/spell-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charClass,
          subclass,
          level,
          availableCantrips,
          availableSpells: availableSpellsByLevel,
          maxCantrips,
          maxSpellsKnown,
          casterType,
        }),
      })
      if (!res.ok) throw new Error('AI suggestion failed')
      const data = await res.json()
      // Apply suggestions
      if (data.cantrips?.length) {
        setSelectedCantrips(data.cantrips.filter((c: string) => cantrips.includes(c)).slice(0, maxCantrips))
      }
      if (data.spells) {
        const newSpells: Record<number, string[]> = {}
        for (const [lvl, names] of Object.entries(data.spells) as [string, string[]][]) {
          const lvNum = Number(lvl)
          const available = availableSpellsByLevel[lvNum] || []
          newSpells[lvNum] = names.filter((n: string) => available.includes(n))
        }
        setSelectedSpells(newSpells)
      }
      if (data.reasoning) setAiReasoning(data.reasoning)
    } catch {
      setAiReasoning('Failed to get suggestions. Try again.')
    } finally {
      setAiLoading(false)
    }
  }

  function toggleCantrip(name: string) {
    if (selectedCantrips.includes(name)) {
      setSelectedCantrips(selectedCantrips.filter(c => c !== name))
    } else if (selectedCantrips.length < maxCantrips) {
      setSelectedCantrips([...selectedCantrips, name])
    }
  }

  function toggleSpell(spellLevel: number, name: string) {
    const current = selectedSpells[spellLevel] || []
    if (current.includes(name)) {
      setSelectedSpells({
        ...selectedSpells,
        [spellLevel]: current.filter(s => s !== name),
      })
    } else {
      if ((casterType === 'known' || casterType === 'pact') && maxSpellsKnown !== undefined && totalSelectedSpells >= maxSpellsKnown) {
        return
      }
      setSelectedSpells({
        ...selectedSpells,
        [spellLevel]: [...current, name],
      })
    }
  }

  function toggleInvocation(name: string) {
    if (selectedInvocations.includes(name)) {
      setSelectedInvocations(selectedInvocations.filter(i => i !== name))
    } else if (selectedInvocations.length < maxInvocations) {
      setSelectedInvocations([...selectedInvocations, name])
    }
  }

  function toggleTomeCantrip(name: string) {
    if (tomeCantrips.includes(name)) {
      setTomeCantrips(tomeCantrips.filter(c => c !== name))
    } else if (tomeCantrips.length < tomeMax) {
      setTomeCantrips([...tomeCantrips, name])
    }
  }

  if (!isCaster) {
    return (
      <div className="space-y-6">
        <Card className="p-8 bg-teal-rich/60 border-gold-500/15 text-center">
          <Swords className="w-12 h-12 text-parchment-muted/30 mx-auto mb-4" />
          <h3 className="text-lg font-serif text-parchment mb-2">No Spellcasting</h3>
          <p className="text-sm text-parchment-muted">
            {charClass}s don&apos;t use spells. Your power comes from martial prowess!
          </p>
          <p className="text-xs text-parchment-muted/60 mt-2">
            Click Continue to proceed to the review step.
          </p>
        </Card>

        {/* Racial spells still show for non-casters */}
        {racialSpells.length > 0 && (
          <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
            <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Racial Spellcasting ({race})
            </h3>
            <p className="text-xs text-parchment-muted">These are innate spells from your racial heritage.</p>
            <div className="flex flex-wrap gap-2">
              {racialSpells.map((rs, i) => (
                <span key={i} className="inline-flex items-center gap-1">
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                    {rs.spell} {rs.spellLevel > 0 ? `(Lv${rs.spellLevel})` : '(Cantrip)'} — at character Lv{rs.level}
                  </Badge>
                  <SpellStudyButton name={rs.spell} className="text-parchment-muted/50 hover:text-emerald-300 p-1 rounded touch-target" />
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Spellcasting Summary */}
      <Card className="p-4 bg-purple-500/10 border-purple-500/20">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Wand2 className="w-3 h-3 mr-1" /> {charClass} — {classData?.spellcasting?.ability}
          </Badge>
          <span className="text-xs text-parchment-muted">
            {casterType === 'prepared' ? 'Prepares spells daily from full list' : casterType === 'known' ? 'Learns a fixed number of spells' : 'Pact Magic'}
          </span>
          <button
            className="ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/25 hover:bg-purple-500/25 transition-colors disabled:opacity-50"
            onClick={aiSuggestSpells}
            disabled={aiLoading}
          >
            {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {aiLoading ? 'Thinking...' : 'AI Suggest'}
          </button>
        </div>
        <div className="flex gap-4 mt-3 text-xs text-parchment-muted flex-wrap">
          <span>Cantrips: <strong className="text-parchment">{selectedCantrips.length}/{maxCantrips}</strong></span>
          {maxSpellsKnown !== undefined && (
            <span>Spells Known: <strong className="text-parchment">{totalSelectedSpells}/{maxSpellsKnown}</strong></span>
          )}
          <span>Max Spell Level: <strong className="text-parchment">{maxSpellLevel > 0 ? maxSpellLevel : '—'}</strong></span>
          {bonusCantrips.length > 0 && (
            <span>Bonus Cantrips: <strong className="text-emerald-400">{bonusCantrips.join(', ')}</strong></span>
          )}
        </div>
        {aiReasoning && (
          <div className="mt-3 p-2.5 rounded-md bg-purple-500/5 border border-purple-500/10">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] text-purple-400 uppercase tracking-wider font-medium">AI Reasoning</span>
            </div>
            <p className="text-xs text-parchment-muted leading-relaxed">{aiReasoning}</p>
          </div>
        )}
      </Card>

      {/* Racial Spellcasting */}
      {racialSpells.length > 0 && (
        <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
          <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Racial Spellcasting ({race})
          </h3>
          <p className="text-xs text-parchment-muted">Auto-granted from your race. These don&apos;t count against your spells known.</p>
          <div className="flex flex-wrap gap-2">
            {racialSpells.map((rs, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                  {rs.spell} {rs.spellLevel > 0 ? `(Lv${rs.spellLevel})` : '(Cantrip)'}
                </Badge>
                <SpellStudyButton name={rs.spell} className="text-parchment-muted/50 hover:text-emerald-300 p-1 rounded touch-target" />
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Subclass Bonus Cantrips */}
      {bonusCantrips.length > 0 && (
        <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
          <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
            <Star className="w-4 h-4" /> {subclass} Bonus Cantrips
          </h3>
          <p className="text-xs text-parchment-muted">Auto-granted by your subclass. These don&apos;t count against cantrips known.</p>
          <div className="flex flex-wrap gap-2">
            {bonusCantrips.map(name => (
              <span key={name} className="inline-flex items-center gap-1">
                <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                  <Check className="w-3 h-3 mr-1" /> {name}
                </Badge>
                <SpellStudyButton name={name} className="text-parchment-muted/50 hover:text-purple-300 p-1 rounded touch-target" />
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Cantrips */}
      {maxCantrips > 0 && cantrips.length > 0 && (
        <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
              <Star className="w-4 h-4" /> Cantrips
            </h3>
            <span className="text-xs text-parchment-muted">
              {selectedCantrips.length} / {maxCantrips} selected
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {cantrips.map(name => {
              const isSelected = selectedCantrips.includes(name)
              const isDisabled = !isSelected && selectedCantrips.length >= maxCantrips
              return (
                <div key={name} className="relative">
                  <button
                    onClick={() => toggleCantrip(name)}
                    disabled={isDisabled}
                    className={`w-full p-2.5 pr-8 rounded-lg border text-left text-sm transition-all ${
                      isSelected
                        ? 'border-purple-500/50 bg-purple-500/15 text-purple-200'
                        : isDisabled
                        ? 'border-gold-500/5 bg-charcoal-900/30 text-parchment-muted/30 cursor-not-allowed'
                        : 'border-gold-500/10 bg-charcoal-900/50 text-parchment hover:border-purple-500/25 hover:bg-purple-500/5'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {isSelected && <Check className="w-3 h-3 text-purple-400 shrink-0" />}
                      {name}
                    </span>
                  </button>
                  <span className="absolute top-1.5 right-1.5">
                    <SpellStudyButton name={name} className="text-parchment-muted/50 hover:text-purple-300 p-1 rounded touch-target" />
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Pact of the Tome — Cross-class Cantrip Picker */}
      {pactBoon === 'Pact of the Tome' && (
        <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Book of Shadows — Tome Cantrips
            </h3>
            <span className="text-xs text-parchment-muted">
              {tomeCantrips.length} / {tomeMax} selected
            </span>
          </div>
          <p className="text-xs text-parchment-muted">Choose 3 cantrips from any class list. These don&apos;t count against your cantrips known.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {allCantrips
              .filter(name => !cantrips.includes(name) && !bonusCantrips.includes(name))
              .map(name => {
                const isSelected = tomeCantrips.includes(name)
                const isDisabled = !isSelected && tomeCantrips.length >= tomeMax
                return (
                  <div key={name} className="relative">
                    <button
                      onClick={() => toggleTomeCantrip(name)}
                      disabled={isDisabled}
                      className={`w-full p-2.5 pr-8 rounded-lg border text-left text-sm transition-all ${
                        isSelected
                          ? 'border-amber-500/50 bg-amber-500/15 text-amber-200'
                          : isDisabled
                          ? 'border-gold-500/5 bg-charcoal-900/30 text-parchment-muted/30 cursor-not-allowed'
                          : 'border-gold-500/10 bg-charcoal-900/50 text-parchment hover:border-amber-500/25 hover:bg-amber-500/5'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {isSelected && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                        {name}
                      </span>
                    </button>
                    <span className="absolute top-1.5 right-1.5">
                      <SpellStudyButton name={name} className="text-parchment-muted/50 hover:text-amber-300 p-1 rounded touch-target" />
                    </span>
                  </div>
                )
              })}
          </div>
        </Card>
      )}

      {/* Subclass Bonus Spells */}
      {Object.keys(bonusSpells).length > 0 && (
        <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
          <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
            <Scroll className="w-4 h-4" /> {subclass} Bonus Spells
          </h3>
          <p className="text-xs text-parchment-muted">
            {charClass === 'Warlock' ? 'Added to your spells you can choose from.' : 'Always prepared for free.'}
          </p>
          {Object.entries(bonusSpells).map(([lvl, spells]) => (
            <div key={lvl}>
              <span className="text-xs text-gold-500/70 uppercase tracking-wider">Level {lvl}</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {spells.map(name => (
                  <span key={name} className="inline-flex items-center gap-1">
                    <Badge variant="outline" className="border-purple-500/20 text-purple-300 text-[10px]">
                      {name}
                    </Badge>
                    <SpellStudyButton name={name} className="text-parchment-muted/50 hover:text-purple-300 p-0.5 rounded touch-target" />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Spells by Level */}
      {Array.from({ length: maxSpellLevel }, (_, i) => i + 1).map(spellLevel => {
        // Merge class spells with warlock subclass bonus spells
        const classSpells = getSpellsAtLevel(charClass, spellLevel)
        const subBonus = bonusSpells[spellLevel] || []
        const mergedSpells = Array.from(new Set([...classSpells, ...subBonus])).sort()
        if (mergedSpells.length === 0) return null
        const selected = selectedSpells[spellLevel] || []
        const atLimit = (casterType === 'known' || casterType === 'pact') && maxSpellsKnown !== undefined && totalSelectedSpells >= maxSpellsKnown

        return (
          <Card key={spellLevel} className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
                <Wand2 className="w-4 h-4" /> Level {spellLevel} Spells
              </h3>
              <span className="text-xs text-parchment-muted">
                {selected.length} selected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {mergedSpells.map(name => {
                const isSelected = selected.includes(name)
                const isBonus = subBonus.includes(name) && !classSpells.includes(name)
                const isDisabled = !isSelected && atLimit
                return (
                  <div key={name} className="relative">
                    <button
                      onClick={() => toggleSpell(spellLevel, name)}
                      disabled={isDisabled}
                      className={`w-full p-2.5 pr-8 rounded-lg border text-left text-sm transition-all ${
                        isSelected
                          ? 'border-purple-500/50 bg-purple-500/15 text-purple-200'
                          : isDisabled
                          ? 'border-gold-500/5 bg-charcoal-900/30 text-parchment-muted/30 cursor-not-allowed'
                          : 'border-gold-500/10 bg-charcoal-900/50 text-parchment hover:border-purple-500/25 hover:bg-purple-500/5'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {isSelected && <Check className="w-3 h-3 text-purple-400 shrink-0" />}
                        {name}
                        {isBonus && <span className="text-[9px] text-amber-400 ml-auto">bonus</span>}
                      </span>
                    </button>
                    <span className="absolute top-1.5 right-1.5">
                      <SpellStudyButton name={name} className="text-parchment-muted/50 hover:text-purple-300 p-1 rounded touch-target" />
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        )
      })}

      {/* Eldritch Invocations (Warlock, level 2+) */}
      {isWarlock && invocLevel > 0 && (
        <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Eldritch Invocations
            </h3>
            <span className="text-xs text-parchment-muted">
              {selectedInvocations.length} / {maxInvocations} selected
            </span>
          </div>
          <p className="text-xs text-parchment-muted">Choose invocations you meet the prerequisites for.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
            {availableInvocations.map(inv => {
              const isSelected = selectedInvocations.includes(inv.name)
              const isDisabled = !isSelected && selectedInvocations.length >= maxInvocations
              return (
                <button
                  key={inv.name}
                  disabled={isDisabled}
                  onClick={() => toggleInvocation(inv.name)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-purple-500/50 bg-purple-500/15'
                      : isDisabled
                      ? 'border-gold-500/5 bg-charcoal-900/30 cursor-not-allowed'
                      : 'border-gold-500/10 bg-charcoal-900/50 hover:border-purple-500/25'
                  }`}
                >
                  <div className={`text-sm font-medium ${isSelected ? 'text-purple-300' : isDisabled ? 'text-parchment-muted/30' : 'text-parchment'}`}>
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {inv.name}
                  </div>
                  <div className="text-[10px] text-parchment-muted mt-0.5 line-clamp-2">{inv.desc}</div>
                  {(inv.prerequisite || inv.pactRequired || inv.minLevel) && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {inv.minLevel && inv.minLevel > 2 && (
                        <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1 rounded">Lv{inv.minLevel}+</span>
                      )}
                      {inv.pactRequired && (
                        <span className="text-[9px] text-blue-400 bg-blue-500/10 px-1 rounded">{inv.pactRequired}</span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
