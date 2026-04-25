'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Heart, Shield, Swords, Zap, BookOpen, Scroll,
  Backpack, Star, Sparkles, Moon, Sun, Flame, 
  Skull, Eye, ArrowLeft, Pencil, Dices, Target,
  ChevronDown, ChevronUp, Timer, Brain,
  CircleDot, Wind, PawPrint, MessageCircle,
  Loader2, Palette, X as XIcon, Info,
} from 'lucide-react'
import type { 
  PlayerCharacter, FeatureEntry, SpellEntry, WeaponEntry,
  DndCondition, SkillName, AbilityScore, InventoryItem,
  ArmorEntry, MagicItemEntry,
} from '@/types/player-character'
import { 
  abilityModifier, formatModifier, hpPercentage, hpColor,
  CLASS_COLORS, DND_CONDITIONS, SKILL_ABILITY_MAP,
  CONDITION_EFFECTS, conditionAttackModifier, defaultStatus,
} from '@/types/player-character'
import {
  updateCharacterHP, updateCharacterStatus, updateSpellSlots,
  updateFeatureUses, shortRest, longRest, updatePlayerCharacter
} from '@/lib/actions/player-characters'
import { DiceRoller } from '@/components/player-deck/dice-roller'
import { CelestialAdvisor } from '@/components/player-deck/celestial-advisor'
import { lookupSpellDetail } from '@/lib/data/spell-details'
import {
  SKILL_INFO, ABILITY_INFO, STANDARD_ACTIONS, CONDITION_INFO,
  WEAPON_PROPERTY_INFO, lookupWeaponProperty, DAMAGE_TYPE_INFO,
  ARMOR_TYPE_INFO, RARITY_INFO, lookupGearInfo, lookupLanguageInfo,
} from '@/lib/data/dnd-reference'
import { InfoPopover, InfoSection, InfoBullets } from '@/components/player-deck/info-popover'

type InfoTarget =
  | { kind: 'skill'; skill: SkillName; modifier: number; advantage?: 'advantage' | 'disadvantage' }
  | { kind: 'save'; ability: AbilityScore; modifier: number }
  | { kind: 'ability'; ability: AbilityScore; modifier: number; saveModifier: number; saveProficient: boolean }
  | { kind: 'condition'; condition: DndCondition; active: boolean }
  | { kind: 'standardAction'; action: keyof typeof STANDARD_ACTIONS }
  | { kind: 'weapon'; weapon: WeaponEntry; advantage?: 'advantage' | 'disadvantage' }
  | { kind: 'item'; item: InventoryItem }
  | { kind: 'magicItem'; item: MagicItemEntry }
  | { kind: 'armor'; armor: ArmorEntry }
  | { kind: 'language'; name: string }
  | { kind: 'tool'; name: string }
  | { kind: 'inspiration' }
  | { kind: 'deathSave' }
  | { kind: 'passive'; type: 'perception' | 'investigation' | 'insight'; value: number }
  | { kind: 'damageType'; name: string }
  | { kind: 'rarity'; name: string }

export function CharacterSheet({ character: initial }: { character: PlayerCharacter }) {
  const [char, setChar] = useState(initial)
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState('actions')
  const [showDice, setShowDice] = useState(false)
  const [showCelestial, setShowCelestial] = useState(false)
  const [lastRoll, setLastRoll] = useState<{ label: string; result: number; detail: string } | null>(null)
  const [recapLoading, setRecapLoading] = useState(false)
  const [recapText, setRecapText] = useState('')
  const [showPortraitGen, setShowPortraitGen] = useState(false)
  const [portraitStyle, setPortraitStyle] = useState('fantasy-oil')
  const [portraitLoading, setPortraitLoading] = useState(false)
  const [portraitError, setPortraitError] = useState<string | null>(null)
  const [info, setInfo] = useState<InfoTarget | null>(null)
  
  const classColor = CLASS_COLORS[char.class] || '#d4a84b'
  const hp = hpPercentage(char.current_hp, char.max_hp)
  const activeConditions = char.status?.conditions || []
  const attackAdvantage = conditionAttackModifier(activeConditions)
  const cantAct = activeConditions.some(c => CONDITION_EFFECTS[c]?.cantAct)
  
  // HP modification
  function adjustHP(amount: number) {
    const newHP = Math.max(0, Math.min(char.max_hp, char.current_hp + amount))
    setChar(prev => ({ ...prev, current_hp: newHP }))
    startTransition(async () => {
      await updateCharacterHP(char.id, newHP, char.temp_hp)
    })
  }
  
  function adjustTempHP(amount: number) {
    const newTemp = Math.max(0, char.temp_hp + amount)
    setChar(prev => ({ ...prev, temp_hp: newTemp }))
    startTransition(async () => {
      await updateCharacterHP(char.id, char.current_hp, newTemp)
    })
  }
  
  // Spell slot usage
  function useSpellSlot(level: string) {
    const slots = { ...char.spellcasting.spell_slots }
    if (slots[level] && slots[level].used < slots[level].max) {
      slots[level] = { ...slots[level], used: slots[level].used + 1 }
      const newSpellcasting = { ...char.spellcasting, spell_slots: slots }
      setChar(prev => ({ ...prev, spellcasting: newSpellcasting }))
      startTransition(async () => {
        await updateSpellSlots(char.id, newSpellcasting)
      })
    }
  }
  
  function restoreSpellSlot(level: string) {
    const slots = { ...char.spellcasting.spell_slots }
    if (slots[level] && slots[level].used > 0) {
      slots[level] = { ...slots[level], used: slots[level].used - 1 }
      const newSpellcasting = { ...char.spellcasting, spell_slots: slots }
      setChar(prev => ({ ...prev, spellcasting: newSpellcasting }))
      startTransition(async () => {
        await updateSpellSlots(char.id, newSpellcasting)
      })
    }
  }

  // Concentration tracking
  function setConcentration(spellName: string | null) {
    const newStatus = { ...char.status, concentration_spell: spellName }
    setChar(prev => ({ ...prev, status: newStatus }))
    startTransition(async () => {
      await updateCharacterStatus(char.id, newStatus as unknown as Record<string, unknown>)
    })
  }

  // Quick Cast — set concentration + use a slot in one tap
  function quickCast(spellName: string, spellLevel: number) {
    // Use spell slot
    const levelKey = String(spellLevel)
    const slots = { ...char.spellcasting.spell_slots }
    if (slots[levelKey] && slots[levelKey].used < slots[levelKey].max) {
      slots[levelKey] = { ...slots[levelKey], used: slots[levelKey].used + 1 }
    }
    const newSpellcasting = { ...char.spellcasting, spell_slots: slots }
    // Set concentration
    const details = lookupSpellDetail(spellName)
    const isConcentration = details?.concentration ?? false
    const newStatus = isConcentration
      ? { ...char.status, concentration_spell: spellName }
      : char.status
    setChar(prev => ({ ...prev, spellcasting: newSpellcasting, status: newStatus }))
    startTransition(async () => {
      await updateSpellSlots(char.id, newSpellcasting)
      if (isConcentration) {
        await updateCharacterStatus(char.id, newStatus as unknown as Record<string, unknown>)
      }
    })
  }

  // Session Recap AI
  async function generateRecap() {
    setRecapLoading(true)
    setRecapText('')
    try {
      const res = await fetch(`/api/player-deck/recap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: char.id }),
      })
      if (!res.ok) throw new Error('Failed')
      const reader = res.body?.getReader()
      if (!reader) return
      const decoder = new TextDecoder()
      let text = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (line.startsWith('0:')) {
            try { text += JSON.parse(line.slice(2)) } catch { /* skip */ }
          }
        }
        setRecapText(text)
      }
    } catch {
      setRecapText('Failed to generate recap. Try again later.')
    } finally {
      setRecapLoading(false)
    }
  }

  // Portrait regeneration
  async function regeneratePortrait() {
    setPortraitLoading(true)
    setPortraitError(null)
    try {
      const res = await fetch('/api/player-deck/portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterData: {
            name: char.name,
            race: char.race,
            class: char.class,
            subclass: char.subclass,
            age: char.age,
            height: char.height,
            weight: char.weight,
            eyes: char.eyes,
            hair: char.hair,
            skin: char.skin,
            appearance: char.appearance,
            personality: char.personality_traits,
          },
          style: portraitStyle,
          customDetails: '',
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Portrait generation failed')
      }
      const data = await res.json()
      if (data.imageUrl) {
        setChar(prev => ({ ...prev, portrait_url: data.imageUrl }))
        setShowPortraitGen(false)
        startTransition(async () => {
          await updatePlayerCharacter(char.id, { portrait_url: data.imageUrl })
        })
      }
    } catch (err) {
      setPortraitError(err instanceof Error ? err.message : 'Portrait generation failed. Try again.')
    } finally {
      setPortraitLoading(false)
    }
  }
  
  // Condition toggling
  function toggleCondition(condition: DndCondition) {
    const currentStatus = char.status ?? defaultStatus()
    const currentConditions = currentStatus.conditions ?? []
    const conditions = currentConditions.includes(condition)
      ? currentConditions.filter(c => c !== condition)
      : [...currentConditions, condition]
    const newStatus = { ...currentStatus, conditions }
    setChar(prev => ({ ...prev, status: newStatus }))
    startTransition(async () => {
      await updateCharacterStatus(char.id, newStatus)
    })
  }
  
  // Inspiration toggle
  function toggleInspiration() {
    const currentStatus = char.status ?? defaultStatus()
    const newStatus = { ...currentStatus, inspiration: !currentStatus.inspiration }
    setChar(prev => ({ ...prev, status: newStatus }))
    startTransition(async () => {
      await updateCharacterStatus(char.id, newStatus)
    })
  }
  
  // Feature use tracking
  function useFeature(index: number) {
    const features = [...char.features]
    if (features[index].uses_remaining && features[index].uses_remaining! > 0) {
      features[index] = { ...features[index], uses_remaining: features[index].uses_remaining! - 1 }
      setChar(prev => ({ ...prev, features }))
      startTransition(async () => {
        await updateFeatureUses(char.id, features as unknown as Record<string, unknown>[])
      })
    }
  }
  
  // Rests
  function handleShortRest() {
    startTransition(async () => {
      await shortRest(char.id)
      // Optimistic: reset short-rest features
      const updated = char.features.map(f => ({
        ...f,
        uses_remaining: f.recharge === 'short_rest' ? f.uses_max : f.uses_remaining,
      }))
      setChar(prev => ({ ...prev, features: updated }))
    })
  }
  
  function handleLongRest() {
    startTransition(async () => {
      await longRest(char.id)
      // Optimistic full reset
      const updatedFeatures = char.features.map(f => ({
        ...f,
        uses_remaining: (f.recharge === 'short_rest' || f.recharge === 'long_rest' || f.recharge === 'dawn')
          ? f.uses_max
          : f.uses_remaining,
      }))
      const updatedSlots = { ...char.spellcasting }
      if (updatedSlots.spell_slots) {
        for (const level of Object.keys(updatedSlots.spell_slots)) {
          updatedSlots.spell_slots[level] = { ...updatedSlots.spell_slots[level], used: 0 }
        }
      }
      setChar(prev => ({
        ...prev,
        current_hp: prev.max_hp,
        temp_hp: 0,
        death_save_successes: 0,
        death_save_failures: 0,
        features: updatedFeatures,
        spellcasting: updatedSlots,
        status: {
          ...prev.status,
          exhaustion_level: Math.max(0, prev.status.exhaustion_level - 1),
          concentration_spell: null,
          conditions: prev.status.conditions.filter(c => c !== 'unconscious'),
        },
      }))
    })
  }

  // Quick roll from sheet (D&D Beyond-style click-to-roll)
  function quickRoll(label: string, modifier: number, advantage?: 'advantage' | 'disadvantage') {
    const roll1 = Math.floor(Math.random() * 20) + 1
    const roll2 = Math.floor(Math.random() * 20) + 1
    let die: number
    let detail: string

    if (advantage === 'advantage') {
      die = Math.max(roll1, roll2)
      detail = `d20(${roll1}, ${roll2}) take high → ${die} ${modifier >= 0 ? '+' : ''}${modifier}`
    } else if (advantage === 'disadvantage') {
      die = Math.min(roll1, roll2)
      detail = `d20(${roll1}, ${roll2}) take low → ${die} ${modifier >= 0 ? '+' : ''}${modifier}`
    } else {
      die = roll1
      detail = `d20(${die}) ${modifier >= 0 ? '+' : ''}${modifier}`
    }

    const result = die + modifier
    setLastRoll({ label, result, detail })
    setTimeout(() => setLastRoll(null), 4000)
  }

  function quickDamageRoll(label: string, notation: string) {
    // Parse simple notation like 1d8+3, 2d6, etc.
    const match = notation.match(/(\d+)d(\d+)(?:\s*\+\s*(\d+))?/)
    if (!match) return
    const count = parseInt(match[1])
    const sides = parseInt(match[2])
    const bonus = parseInt(match[3] || '0')
    const rolls: number[] = []
    for (let i = 0; i < count; i++) rolls.push(Math.floor(Math.random() * sides) + 1)
    const total = rolls.reduce((s, r) => s + r, 0) + bonus
    const detail = `${rolls.join('+')}${bonus ? ` + ${bonus}` : ''} = ${total}`
    setLastRoll({ label: `${label} damage`, result: total, detail })
    setTimeout(() => setLastRoll(null), 4000)
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Roll Result Toast */}
      {lastRoll && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <Card className="px-6 py-3 bg-charcoal/95 border-gold-500/30 shadow-2xl shadow-gold-500/10 flex items-center gap-4">
            <div className="text-sm text-parchment-muted">{lastRoll.label}</div>
            <div className={`text-3xl font-mono font-bold dice-result-animate ${
              lastRoll.detail.includes('d20(20)') || lastRoll.detail.includes('take high → 20') 
                ? 'text-amber-400 nat20-burst' 
                : lastRoll.detail.includes('d20(1)') || lastRoll.detail.includes('take low → 1')
                  ? 'text-red-400 nat1-shake'
                  : 'text-parchment'
            }`}>
              {lastRoll.result}
            </div>
            <div className="text-xs text-parchment-muted font-mono">{lastRoll.detail}</div>
          </Card>
        </div>
      )}
      {/* Top Bar */}
      <div className="sticky top-0 z-40 glass">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/player-deck" className="flex items-center gap-2 text-parchment-muted hover:text-parchment transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Deck</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="font-serif text-parchment text-sm md:text-base">{char.name}</span>
            <Badge variant="outline" className="text-xs" style={{ borderColor: `${classColor}60`, color: classColor }}>
              Lvl {char.level}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDice(!showDice)}
              className="text-parchment-muted hover:text-amber-400"
              title="Dice Roller"
            >
              <Dices className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowCelestial(!showCelestial)}
              className="text-parchment-muted hover:text-blue-400"
              title="Ask a Celestial"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Link href={`/player-deck/${char.id}/edit`}>
              <Button variant="ghost" size="sm" className="text-parchment-muted hover:text-parchment">
                <Pencil className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        {/* Character Header with portrait */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6">
          {/* Portrait */}
          <div className="flex-shrink-0 relative">
            <div 
              className="w-full md:w-48 h-48 md:h-64 rounded-xl overflow-hidden border-2 relative cursor-pointer group"
              style={{ borderColor: `${classColor}40` }}
              onClick={() => setShowPortraitGen(!showPortraitGen)}
            >
              {char.portrait_url ? (
                <img src={char.portrait_url} alt={char.name} className="w-full h-full object-cover" />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${classColor}20, ${classColor}05)` }}
                >
                  <span className="text-7xl font-serif opacity-20" style={{ color: classColor }}>
                    {char.name.charAt(0)}
                  </span>
                </div>
              )}
              {/* Class gradient overlay */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-1/3"
                style={{ background: `linear-gradient(to top, ${classColor}30, transparent)` }}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-xs text-white font-medium bg-black/60 px-3 py-1.5 rounded-full">
                  <Palette className="w-3 h-3" />
                  {char.portrait_url ? 'Regenerate' : 'Generate'}
                </div>
              </div>
            </div>

            {/* Portrait Generation Panel */}
            {showPortraitGen && (
              <div className="absolute top-0 left-0 right-0 z-20 md:w-64 bg-charcoal-950 border border-gold-500/20 rounded-xl p-4 shadow-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-serif text-parchment flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-purple-400" /> AI Portrait
                  </h4>
                  <button onClick={() => setShowPortraitGen(false)} className="text-parchment-muted hover:text-parchment">
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { id: 'fantasy-oil', label: '🎨 Oil' },
                    { id: 'anime', label: '✨ Anime' },
                    { id: 'comic-book', label: '💥 Comic' },
                    { id: 'realistic', label: '📷 Real' },
                    { id: 'watercolor', label: '🌊 Water' },
                    { id: 'dark-fantasy', label: '🌑 Dark' },
                  ] as const).map(s => (
                    <button
                      key={s.id}
                      onClick={() => setPortraitStyle(s.id)}
                      className={`text-[10px] p-1.5 rounded-md border transition-all ${
                        portraitStyle === s.id
                          ? 'border-gold-500/50 bg-gold-500/10 text-parchment'
                          : 'border-gold-500/10 text-parchment-muted hover:border-gold-500/25'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="w-full text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/20"
                  onClick={regeneratePortrait}
                  disabled={portraitLoading}
                >
                  {portraitLoading ? (
                    <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-3 h-3 mr-1.5" /> Generate Portrait</>
                  )}
                </Button>
                {portraitLoading && (
                  <p className="text-[10px] text-parchment-muted text-center">~15 seconds...</p>
                )}
                {portraitError && (
                  <p className="text-[10px] text-red-400 text-center">{portraitError}</p>
                )}
              </div>
            )}
          </div>
          
          {/* Character Info + HP */}
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-parchment">{char.name}</h1>
              <p className="text-parchment-muted">
                Level {char.level} {char.race}{char.subrace ? ` (${char.subrace})` : ''} {char.class}
                {char.subclass ? ` — ${char.subclass}` : ''}
              </p>
              {char.campaign_name && (
                <p className="text-xs text-parchment-muted/60 mt-1">
                  {char.campaign_name}{char.dm_name ? ` • DM: ${char.dm_name}` : ''}
                </p>
              )}
            </div>
            
            {/* HP Tracker - BIG and touch-friendly */}
            <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="text-sm text-parchment-muted">Hit Points</span>
                {char.status?.inspiration && (
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 ml-auto" />
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-12 h-12 text-lg font-bold text-red-400 border-red-500/30 hover:bg-red-500/10 touch-target"
                  onClick={() => adjustHP(-1)}
                >
                  −
                </Button>
                
                <div className="flex-1 text-center">
                  <div className="text-3xl md:text-4xl font-bold font-mono text-parchment">
                    {char.current_hp}
                    <span className="text-lg text-parchment-muted">/{char.max_hp}</span>
                  </div>
                  {char.temp_hp > 0 && (
                    <div className="text-sm text-blue-400 font-mono">+{char.temp_hp} temp</div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-12 h-12 text-lg font-bold text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 touch-target"
                  onClick={() => adjustHP(1)}
                >
                  +
                </Button>
              </div>
              
              {/* HP Bar */}
              <div className="h-3 bg-charcoal-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${hpColor(hp)}`}
                  style={{ width: `${hp}%` }}
                />
              </div>
              
              {/* Quick HP buttons */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {[-5, -10, 5, 10].map(amt => (
                  <Button
                    key={amt}
                    variant="ghost"
                    size="sm"
                    className={`text-xs ${amt < 0 ? 'text-red-400' : 'text-emerald-400'}`}
                    onClick={() => adjustHP(amt)}
                  >
                    {amt > 0 ? '+' : ''}{amt}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-400 ml-auto"
                  onClick={() => adjustTempHP(5)}
                >
                  +5 temp
                </Button>
              </div>
            </Card>
            
            {/* Quick Stats Row */}
            <div className="grid grid-cols-4 gap-2">
              <StatBox icon={<Shield className="w-4 h-4" />} label="AC" value={String(char.armor_class)} color="text-blue-300" />
              <StatBox icon={<Zap className="w-4 h-4" />} label="Init" value={formatModifier(char.initiative_bonus)} color="text-amber-300" />
              <StatBox icon={<Wind className="w-4 h-4" />} label="Speed" value={`${char.speed}ft`} color="text-emerald-300" />
              <StatBox icon={<CircleDot className="w-4 h-4" />} label="Prof" value={`+${char.proficiency_bonus}`} color="text-purple-300" />
            </div>
          </div>
        </div>

        {/* Ability Scores */}
        <div className="grid grid-cols-6 gap-2 md:gap-3 mb-6">
          {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map(ability => {
            const score = char[ability]
            const mod = abilityModifier(score)
            const abbr = ability.slice(0, 3).toUpperCase()
            const isProficient = !!char.proficiencies?.saving_throws?.includes(abbr)
            const saveMod = mod + (isProficient ? char.proficiency_bonus : 0)
            return (
              <button
                key={ability}
                onClick={() => setInfo({ kind: 'ability', ability, modifier: mod, saveModifier: saveMod, saveProficient: isProficient })}
                className="text-center p-2 md:p-3 bg-charcoal-950/50 border border-gold-500/10 rounded-lg hover:border-gold-500/30 transition-colors touch-target-lg"
                title={`${abbr} — tap for info`}
              >
                <div className="text-[10px] md:text-xs text-parchment-muted uppercase tracking-wider">{abbr}</div>
                <div className="text-lg md:text-xl font-bold text-parchment">{formatModifier(mod)}</div>
                <div className="text-xs text-parchment-muted">{score}</div>
              </button>
            )
          })}
        </div>
        
        {/* Rest Buttons + Inspiration */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            onClick={handleShortRest}
            disabled={isPending}
          >
            <Moon className="w-4 h-4" />
            Short Rest
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            onClick={handleLongRest}
            disabled={isPending}
          >
            <Sun className="w-4 h-4" />
            Long Rest
          </Button>
          <Button 
            variant={char.status?.inspiration ? "default" : "outline"} 
            size="sm" 
            className={`gap-2 ml-auto ${char.status?.inspiration ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'border-amber-500/20 text-parchment-muted'}`}
            onClick={toggleInspiration}
          >
            <Star className={`w-4 h-4 ${char.status?.inspiration ? 'fill-amber-400' : ''}`} />
            Inspiration
          </Button>
        </div>

        {/* Main Tabs - tablet optimized */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex overflow-x-auto bg-charcoal-950/50 border border-gold-500/10 p-1 rounded-xl mb-4">
            <TabsTrigger value="actions" className="flex-1 min-w-fit gap-1.5 text-xs md:text-sm">
              <Target className="w-3.5 h-3.5" /> Actions
            </TabsTrigger>
            <TabsTrigger value="combat" className="flex-1 min-w-fit gap-1.5 text-xs md:text-sm">
              <Swords className="w-3.5 h-3.5" /> Combat
            </TabsTrigger>
            <TabsTrigger value="spells" className="flex-1 min-w-fit gap-1.5 text-xs md:text-sm">
              <Sparkles className="w-3.5 h-3.5" /> Spells
            </TabsTrigger>
            <TabsTrigger value="features" className="flex-1 min-w-fit gap-1.5 text-xs md:text-sm">
              <Flame className="w-3.5 h-3.5" /> Features
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex-1 min-w-fit gap-1.5 text-xs md:text-sm">
              <Brain className="w-3.5 h-3.5" /> Skills
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex-1 min-w-fit gap-1.5 text-xs md:text-sm">
              <Backpack className="w-3.5 h-3.5" /> Gear
            </TabsTrigger>
            <TabsTrigger value="bio" className="flex-1 min-w-fit gap-1.5 text-xs md:text-sm">
              <BookOpen className="w-3.5 h-3.5" /> Bio
            </TabsTrigger>
          </TabsList>

          {/* ACTIONS TAB — D&D Beyond-style turn planner */}
          <TabsContent value="actions" className="space-y-4">
            {/* Action Economy Summary */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="p-3 text-center border-emerald-500/15 bg-emerald-500/5">
                <div className="text-[10px] text-emerald-400 uppercase tracking-wider mb-0.5">Action</div>
                <div className="text-lg font-bold text-emerald-300">1</div>
              </Card>
              <Card className="p-3 text-center border-amber-500/15 bg-amber-500/5">
                <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-0.5">Bonus</div>
                <div className="text-lg font-bold text-amber-300">1</div>
              </Card>
              <Card className="p-3 text-center border-blue-500/15 bg-blue-500/5">
                <div className="text-[10px] text-blue-400 uppercase tracking-wider mb-0.5">Reaction</div>
                <div className="text-lg font-bold text-blue-300">1</div>
              </Card>
            </div>

            {/* Weapon Attacks — Actions */}
            <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
              <h3 className="text-sm font-serif text-parchment mb-3 flex items-center gap-2">
                <Swords className="w-4 h-4 text-amber-400" /> Attacks
              </h3>
              <div className="space-y-2">
                {char.inventory?.weapons?.filter(w => w.equipped).map((weapon, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-charcoal-900/50 border border-gold-500/5 hover:border-gold-500/20 transition-colors">
                    <button
                      onClick={() => setInfo({ kind: 'weapon', weapon, advantage: attackAdvantage })}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-parchment font-medium text-sm">{weapon.name}</span>
                        <Info className="w-3 h-3 text-parchment-muted/40" />
                      </div>
                      <div className="text-[10px] text-parchment-muted">
                        {weapon.damage_type && <span className="text-amber-400/70">{weapon.damage_type}</span>}
                        {weapon.damage_type && weapon.properties?.length > 0 && <span className="mx-1">·</span>}
                        {weapon.properties?.join(', ')}
                      </div>
                    </button>
                    <button
                      onClick={() => quickRoll(`${weapon.name} Attack`, weapon.attack_bonus, attackAdvantage)}
                      className="flex flex-col items-center px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors touch-target-lg cursor-pointer"
                    >
                      <span className="text-amber-400 font-mono font-bold text-sm">
                        {formatModifier(weapon.attack_bonus)}
                        {attackAdvantage && (
                          <span className={`ml-0.5 ${attackAdvantage === 'advantage' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {attackAdvantage === 'advantage' ? '▲' : '▼'}
                          </span>
                        )}
                      </span>
                      <span className="text-[9px] text-amber-400/60">HIT</span>
                    </button>
                    <button
                      onClick={() => quickDamageRoll(weapon.name, weapon.damage)}
                      className="flex flex-col items-center px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors touch-target-lg cursor-pointer"
                    >
                      <span className="text-red-400 font-mono font-bold text-sm">{weapon.damage}</span>
                      <span className="text-[9px] text-red-400/60">DMG</span>
                    </button>
                  </div>
                ))}
                {(!char.inventory?.weapons || char.inventory.weapons.filter(w => w.equipped).length === 0) && (
                  <p className="text-sm text-parchment-muted">No weapons equipped. Add weapons in Gear tab.</p>
                )}
              </div>
            </Card>

            {/* Cantrips (at-will spells) */}
            {char.spellcasting?.cantrips?.length > 0 && (
              <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
                <h3 className="text-sm font-serif text-parchment mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Cantrips (At Will)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {char.spellcasting.cantrips.map((cantrip, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (cantrip.damage) quickDamageRoll(cantrip.name, cantrip.damage)
                        else quickRoll(`${cantrip.name} Spell Attack`, char.spellcasting.spell_attack_bonus || 0, attackAdvantage)
                      }}
                      className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-all text-left"
                    >
                      <div className="min-w-0">
                        <span className="text-sm text-parchment font-medium">{cantrip.name}</span>
                        <div className="text-[10px] text-parchment-muted">{cantrip.school}</div>
                      </div>
                      {cantrip.damage && (
                        <span className="text-xs text-red-400 font-mono ml-2 flex-shrink-0">{cantrip.damage}</span>
                      )}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Standard Actions */}
            <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
              <h3 className="text-sm font-serif text-parchment mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" /> Standard Actions
                <span className="text-[10px] text-parchment-muted/60 font-normal ml-auto">tap for details</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {([
                  { name: 'Dash', actionKey: 'Dash', desc: 'Double movement speed', icon: '💨' },
                  { name: 'Dodge', actionKey: 'Dodge', desc: 'Attacks against you have disadvantage', icon: '🛡️' },
                  { name: 'Disengage', actionKey: 'Disengage', desc: 'Movement doesn\'t provoke opportunity attacks', icon: '↩️' },
                  { name: 'Help', actionKey: 'Help', desc: 'Give an ally advantage on next check', icon: '🤝' },
                  { name: 'Hide', actionKey: 'Hide', desc: 'Make a Stealth check', icon: '👁️' },
                  { name: 'Ready', actionKey: 'Ready', desc: 'Prepare an action with a trigger', icon: '⏳' },
                  { name: 'Use Object', actionKey: 'Use Object', desc: 'Interact with an object', icon: '📦' },
                  { name: 'Grapple', actionKey: 'Grapple', desc: `Athletics: ${formatModifier(abilityModifier(char.strength) + (char.proficiencies?.skills?.athletics ? char.proficiency_bonus : 0))}`, icon: '🤼' },
                  { name: 'Shove', actionKey: 'Shove', desc: `Athletics: ${formatModifier(abilityModifier(char.strength) + (char.proficiencies?.skills?.athletics ? char.proficiency_bonus : 0))}`, icon: '👊' },
                ] as const).map(action => (
                  <div
                    key={action.name}
                    className="p-3 rounded-lg bg-charcoal-900/50 border border-gold-500/5 hover:border-emerald-500/30 transition-all"
                  >
                    <button
                      onClick={() => setInfo({ kind: 'standardAction', action: action.actionKey })}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-base">{action.icon}</span>
                        <span className="text-xs text-parchment font-medium">{action.name}</span>
                        <Info className="w-3 h-3 text-parchment-muted/40 ml-auto" />
                      </div>
                      <p className="text-[10px] text-parchment-muted leading-snug">{action.desc}</p>
                    </button>
                    {(action.name === 'Hide' || action.name === 'Grapple' || action.name === 'Shove') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (action.name === 'Hide') {
                            quickRoll('Stealth', abilityModifier(char.dexterity) + (char.proficiencies?.skills?.stealth ? char.proficiency_bonus : 0))
                          } else {
                            quickRoll(`${action.name} (Athletics)`, abilityModifier(char.strength) + (char.proficiencies?.skills?.athletics ? char.proficiency_bonus : 0))
                          }
                        }}
                        className="mt-2 text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20 hover:bg-amber-500/25"
                      >
                        Roll
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Bonus Actions (from features & spells) */}
            {(() => {
              const bonusFeatures = char.features.filter(f => 
                f.description?.toLowerCase().includes('bonus action')
              )
              const bonusSpells = char.spellcasting?.spells_known?.filter((s: SpellEntry) => 
                s.casting_time?.toLowerCase().includes('bonus')
              ) ?? []
              if (bonusFeatures.length === 0 && bonusSpells.length === 0) return null
              return (
                <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
                  <h3 className="text-sm font-serif text-parchment mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" /> Bonus Actions
                  </h3>
                  <div className="space-y-2">
                    {bonusFeatures.map((feat, i) => (
                      <div key={`bf-${i}`} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <div className="min-w-0">
                          <span className="text-sm text-parchment font-medium">{feat.name}</span>
                          <div className="text-[10px] text-parchment-muted">{feat.source}</div>
                        </div>
                        {feat.uses_max !== undefined && feat.uses_max > 0 && (
                          <div className="flex items-center gap-1.5">
                            <div className="flex gap-0.5">
                              {Array.from({ length: feat.uses_max }).map((_, j) => (
                                <div key={j} className={`w-3 h-3 rounded-full border ${
                                  j < (feat.uses_remaining || 0)
                                    ? 'bg-amber-500/30 border-amber-400/50'
                                    : 'bg-charcoal-900 border-charcoal-900'
                                }`} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {bonusSpells.map((spell, i) => (
                      <div key={`bs-${i}`} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <div className="min-w-0">
                          <span className="text-sm text-parchment font-medium">{spell.name}</span>
                          <div className="text-[10px] text-parchment-muted">Level {spell.level} {spell.school}</div>
                        </div>
                        {spell.damage && (
                          <button
                            onClick={() => quickDamageRoll(spell.name, spell.damage!)}
                            className="text-xs text-red-400 font-mono px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20"
                          >
                            {spell.damage}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )
            })()}

            {/* Reactions (from features & spells) */}
            {(() => {
              const reactionFeatures = char.features.filter(f => 
                f.description?.toLowerCase().includes('reaction')
              )
              const reactionSpells = char.spellcasting?.spells_known?.filter((s: SpellEntry) => 
                s.casting_time?.toLowerCase().includes('reaction')
              ) ?? []
              if (reactionFeatures.length === 0 && reactionSpells.length === 0) return null
              return (
                <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
                  <h3 className="text-sm font-serif text-parchment mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" /> Reactions
                  </h3>
                  <div className="space-y-2">
                    {reactionFeatures.map((feat, i) => (
                      <div key={`rf-${i}`} className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                        <span className="text-sm text-parchment font-medium">{feat.name}</span>
                        <div className="text-[10px] text-parchment-muted">{feat.source}</div>
                      </div>
                    ))}
                    {reactionSpells.map((spell, i) => (
                      <div key={`rs-${i}`} className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                        <span className="text-sm text-parchment font-medium">{spell.name}</span>
                        <div className="text-[10px] text-parchment-muted">Level {spell.level} {spell.school}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )
            })()}

            {/* Quick Ability Checks */}
            <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
              <h3 className="text-sm font-serif text-parchment mb-3 flex items-center gap-2">
                <Dices className="w-4 h-4 text-purple-400" /> Quick Checks
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {([
                  { name: 'STR', score: char.strength },
                  { name: 'DEX', score: char.dexterity },
                  { name: 'CON', score: char.constitution },
                  { name: 'INT', score: char.intelligence },
                  { name: 'WIS', score: char.wisdom },
                  { name: 'CHA', score: char.charisma },
                ] as const).map(({ name, score }) => (
                  <button
                    key={name}
                    onClick={() => quickRoll(`${name} Check`, abilityModifier(score))}
                    className="p-2 rounded-lg bg-charcoal-900/50 border border-gold-500/5 hover:border-purple-500/30 transition-all text-center touch-target-lg"
                  >
                    <div className="text-[10px] text-parchment-muted uppercase">{name}</div>
                    <div className="text-lg font-mono font-bold text-parchment">{formatModifier(abilityModifier(score))}</div>
                  </button>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* COMBAT TAB */}
          <TabsContent value="combat" className="space-y-4">
            {/* Conditions */}
            <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
              <h3 className="text-sm font-serif text-parchment mb-3 flex items-center gap-2">
                <Skull className="w-4 h-4 text-red-400" /> Conditions
                <span className="text-[10px] text-parchment-muted/60 font-normal ml-auto">tap to toggle · ⓘ for rules</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {DND_CONDITIONS.map(condition => {
                  const active = char.status?.conditions?.includes(condition)
                  return (
                    <div
                      key={condition}
                      className={`inline-flex items-stretch rounded-md overflow-hidden border transition-all ${
                        active
                          ? 'border-red-500/60 bg-red-500/15 shadow-[0_0_0_1px_rgba(239,68,68,0.25)]'
                          : 'border-gold-500/15 bg-charcoal-900/40 hover:border-red-500/30 hover:bg-charcoal-900/70'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleCondition(condition)}
                        className={`px-3 py-1.5 text-xs capitalize touch-target font-medium transition-colors flex items-center gap-1.5 ${
                          active ? 'text-red-200' : 'text-parchment-muted hover:text-parchment'
                        }`}
                      >
                        {active && <span className="text-red-300">●</span>}
                        {condition}
                      </button>
                      <button
                        type="button"
                        onClick={() => setInfo({ kind: 'condition', condition, active: !!active })}
                        className={`px-2 flex items-center border-l touch-target ${
                          active
                            ? 'border-red-500/40 text-red-300 hover:bg-red-500/10'
                            : 'border-gold-500/15 text-parchment-muted/60 hover:text-parchment hover:bg-charcoal-900/80'
                        }`}
                        title={`What does ${condition} do?`}
                        aria-label={`Info about ${condition}`}
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
              {char.status?.exhaustion_level > 0 && (
                <div className="mt-3 text-sm text-amber-400">
                  Exhaustion Level: {char.status.exhaustion_level}/6
                </div>
              )}

              {/* Active Condition Effects */}
              {activeConditions.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-gold-500/10 pt-3">
                  {activeConditions.map(condition => (
                    <div key={condition} className="flex items-start gap-2 text-xs">
                      <span className="font-medium text-red-300 capitalize min-w-[90px]">{condition}:</span>
                      <span className="text-parchment-muted">{CONDITION_EFFECTS[condition].description}</span>
                    </div>
                  ))}
                  {attackAdvantage && (
                    <div className={`mt-2 text-xs font-medium px-2 py-1 rounded inline-block ${
                      attackAdvantage === 'advantage'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      Attack rolls: {attackAdvantage === 'advantage' ? '▲ Advantage' : '▼ Disadvantage'}
                    </div>
                  )}
                  {cantAct && (
                    <div className="mt-2 text-xs font-medium px-2 py-1 rounded inline-block bg-red-500/10 text-red-400 border border-red-500/20 ml-1">
                      ⚠ Incapacitated — can&apos;t take actions
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Weapons */}
            <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
              <h3 className="text-sm font-serif text-parchment mb-3 flex items-center gap-2">
                <Swords className="w-4 h-4 text-amber-400" /> Attacks
              </h3>
              <div className="space-y-2">
                {char.inventory?.weapons?.length > 0 ? (
                  char.inventory.weapons.filter(w => w.equipped).map((weapon, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-charcoal-900/50 border border-gold-500/5">
                      <button
                        onClick={() => setInfo({ kind: 'weapon', weapon, advantage: attackAdvantage })}
                        className="flex-1 text-left min-w-0 pr-2"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-parchment font-medium">{weapon.name}</span>
                          <Info className="w-3 h-3 text-parchment-muted/40" />
                        </div>
                        <div className="text-xs text-parchment-muted">
                          {weapon.damage_type && <span className="text-amber-400/70">{weapon.damage_type}</span>}
                          {weapon.damage_type && weapon.properties?.length > 0 && <span className="mx-1">·</span>}
                          {weapon.properties?.join(', ')}
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => quickRoll(`${weapon.name} Attack`, weapon.attack_bonus, attackAdvantage)}
                          className="text-amber-400 font-mono px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 transition-colors cursor-pointer touch-target"
                        >
                          {formatModifier(weapon.attack_bonus)} to hit
                          {attackAdvantage && (
                            <span className={`ml-1 text-[10px] ${attackAdvantage === 'advantage' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {attackAdvantage === 'advantage' ? '▲' : '▼'}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => quickDamageRoll(weapon.name, weapon.damage)}
                          className="text-xs text-parchment-muted font-mono px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer touch-target"
                        >
                          {weapon.damage}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-parchment-muted">No weapons equipped</p>
                )}
              </div>
            </Card>

            {/* Death Saves */}
            {char.current_hp === 0 && (
              <Card className="p-4 bg-red-500/5 border-red-500/20">
                <h3 className="text-sm font-serif text-red-300 mb-3 flex items-center gap-2">
                  <Skull className="w-4 h-4" /> Death Saving Throws
                </h3>
                <div className="flex justify-around">
                  <div>
                    <span className="text-xs text-parchment-muted">Successes</span>
                    <div className="flex gap-1 mt-1">
                      {[0, 1, 2].map(i => (
                        <div
                          key={`s${i}`}
                          className={`w-6 h-6 rounded-full border-2 ${
                            i < char.death_save_successes 
                              ? 'bg-emerald-500/50 border-emerald-400' 
                              : 'border-parchment-muted/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-parchment-muted">Failures</span>
                    <div className="flex gap-1 mt-1">
                      {[0, 1, 2].map(i => (
                        <div
                          key={`f${i}`}
                          className={`w-6 h-6 rounded-full border-2 ${
                            i < char.death_save_failures 
                              ? 'bg-red-500/50 border-red-400' 
                              : 'border-parchment-muted/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}
            
            {/* Companions */}
            {char.companions?.length > 0 && (
              <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
                <h3 className="text-sm font-serif text-parchment mb-3 flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-emerald-400" /> Companions
                </h3>
                <div className="space-y-2">
                  {char.companions.map((comp, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-charcoal-900/50">
                      <div>
                        <span className="text-parchment font-medium">{comp.name}</span>
                        <span className="text-xs text-parchment-muted ml-2">{comp.type}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-red-400">♥ {comp.hp}/{comp.max_hp}</span>
                        <span className="text-blue-400">AC {comp.ac}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* SPELLS TAB */}
          <TabsContent value="spells" className="space-y-4">
            {/* Spell Slots */}
            {Object.keys(char.spellcasting?.spell_slots || {}).length > 0 && (
              <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
                <h3 className="text-sm font-serif text-parchment mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" /> Spell Slots
                  <span className="ml-auto text-xs text-parchment-muted">
                    DC {char.spellcasting?.spell_save_dc} | {formatModifier(char.spellcasting?.spell_attack_bonus || 0)} atk
                  </span>
                </h3>
                <div className="space-y-3">
                  {Object.entries(char.spellcasting.spell_slots)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([level, slot]) => (
                      <div key={level} className="flex items-center gap-3">
                        <span className="text-xs text-parchment-muted w-12">Lvl {level}</span>
                        <div className="flex gap-1 flex-1">
                          {Array.from({ length: slot.max }).map((_, i) => (
                            <button
                              key={i}
                              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 transition-all touch-target ${
                                i < slot.max - slot.used
                                  ? 'bg-blue-500/20 border-blue-400/50 hover:bg-blue-500/30'
                                  : 'bg-charcoal-900 border-charcoal-900/50 opacity-40'
                              }`}
                              onClick={() => i < slot.max - slot.used ? useSpellSlot(level) : restoreSpellSlot(level)}
                              title={i < slot.max - slot.used ? 'Click to use' : 'Click to restore'}
                            >
                              <Sparkles className={`w-3 h-3 mx-auto ${
                                i < slot.max - slot.used ? 'text-blue-400' : 'text-charcoal-900'
                              }`} />
                            </button>
                          ))}
                        </div>
                        <span className="text-xs text-parchment-muted font-mono">
                          {slot.max - slot.used}/{slot.max}
                        </span>
                      </div>
                    ))}
                </div>
              </Card>
            )}

            {/* Concentration Tracker */}
            {char.status?.concentration_spell && (
              <Card className="p-3 bg-amber-500/5 border-amber-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-sm text-amber-300 font-medium">Concentrating</span>
                    <span className="text-sm text-parchment">{char.status.concentration_spell}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 px-2"
                    onClick={() => setConcentration(null)}
                  >
                    Drop
                  </Button>
                </div>
              </Card>
            )}

            {/* Cantrips */}
            {char.spellcasting?.cantrips?.length > 0 && (
              <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
                <h3 className="text-sm font-serif text-parchment mb-3">Cantrips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {char.spellcasting.cantrips.map((cantrip, i) => (
                    <SpellCard
                      key={i}
                      name={cantrip.name}
                      school={cantrip.school}
                      description={cantrip.description}
                      damage={cantrip.damage}
                      castingTime={cantrip.casting_time}
                      range={cantrip.range}
                      duration={cantrip.duration}
                      spellComponents={cantrip.components}
                      isCantrip
                    />
                  ))}
                </div>
              </Card>
            )}

            {/* Prepared Spells by Level */}
            {char.spellcasting?.spells_known?.length > 0 && (
              <>
                {Array.from(new Set(char.spellcasting.spells_known.map(s => s.level)))
                  .sort((a, b) => a - b)
                  .map(level => (
                    <Card key={level} className="p-4 bg-charcoal-950/50 border-gold-500/10">
                      <h3 className="text-sm font-serif text-parchment mb-3">Level {level} Spells</h3>
                      <div className="space-y-2">
                        {char.spellcasting.spells_known
                          .filter(s => s.level === level)
                          .map((spell, i) => (
                            <SpellCard 
                              key={i} 
                              name={spell.name} 
                              school={spell.school} 
                              description={spell.description} 
                              damage={spell.damage}
                              concentration={spell.concentration}
                              ritual={spell.ritual}
                              prepared={spell.prepared}
                              castingTime={spell.casting_time}
                              range={spell.range}
                              duration={spell.duration}
                              spellComponents={spell.components}
                              spellLevel={spell.level}
                              concentrationActive={char.status?.concentration_spell === spell.name}
                              onQuickCast={() => quickCast(spell.name, spell.level)}
                            />
                          ))}
                      </div>
                    </Card>
                  ))}
              </>
            )}

            {!char.spellcasting?.cantrips?.length && !char.spellcasting?.spells_known?.length && (
              <div className="text-center py-12 text-parchment-muted">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No spells. This character relies on steel, not sorcery.</p>
              </div>
            )}
          </TabsContent>

          {/* FEATURES TAB */}
          <TabsContent value="features" className="space-y-2">
            {char.features?.length > 0 ? (
              char.features.map((feature, i) => (
                <FeatureCard key={i} feature={feature} onUse={() => useFeature(i)} />
              ))
            ) : (
              <div className="text-center py-12 text-parchment-muted">
                <Flame className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No features yet. Add them in the character editor.</p>
              </div>
            )}
          </TabsContent>

          {/* SKILLS TAB */}
          <TabsContent value="skills" className="space-y-1">
            <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
              <h3 className="text-sm font-serif text-parchment mb-3 flex items-center gap-2">
                Saving Throws
                <span className="text-[10px] text-parchment-muted/60 font-normal">tap to roll</span>
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map(ability => {
                  const isProficient = char.proficiencies?.saving_throws?.includes(ability.slice(0, 3).toUpperCase())
                  const mod = abilityModifier(char[ability]) + (isProficient ? char.proficiency_bonus : 0)
                  return (
                    <div
                      key={ability}
                      className={`relative text-center p-2 rounded-lg cursor-pointer transition-all touch-target-lg ${
                        isProficient
                          ? 'bg-gold-500/10 border border-gold-500/20 hover:bg-gold-500/15 hover:border-gold-500/40'
                          : 'bg-charcoal-900/30 hover:bg-charcoal-900/50 border border-transparent hover:border-gold-500/20'
                      }`}
                    >
                      <button
                        className="w-full"
                        onClick={() => quickRoll(`${ability.slice(0, 3).toUpperCase()} Save`, mod)}
                        title={`Roll ${ability.slice(0, 3).toUpperCase()} save`}
                      >
                        <div className="text-[10px] text-parchment-muted uppercase">{ability.slice(0, 3)}</div>
                        <div className="text-lg font-mono text-parchment">{formatModifier(mod)}</div>
                        {isProficient && <Star className="w-2.5 h-2.5 mx-auto text-gold-500 fill-gold-500" />}
                      </button>
                      <button
                        className="absolute top-0.5 right-0.5 p-1 text-parchment-muted/50 hover:text-parchment"
                        onClick={(e) => { e.stopPropagation(); setInfo({ kind: 'save', ability, modifier: mod }) }}
                        title="What is this save?"
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
              <h3 className="text-sm font-serif text-parchment mb-3 flex items-center gap-2">
                Skills
                <span className="text-[10px] text-parchment-muted/60 font-normal">tap to roll · ⓘ for details</span>
              </h3>
              <div className="space-y-1">
                {(Object.entries(SKILL_ABILITY_MAP) as [SkillName, string][])
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([skill, ability]) => {
                    const prof = char.proficiencies?.skills?.[skill]
                    const abilityScore = char[ability as keyof PlayerCharacter] as number
                    const mod = abilityModifier(abilityScore) 
                      + (prof === 'expertise' ? char.proficiency_bonus * 2 : prof === 'proficient' ? char.proficiency_bonus : 0)
                    return (
                      <div key={skill} className="flex items-center justify-between rounded transition-colors hover:bg-charcoal-900/30">
                        <button
                          onClick={() => quickRoll(SKILL_INFO[skill].name, mod)}
                          className="flex-1 flex items-center gap-2 py-2 px-2 text-left touch-target"
                          title={`Roll ${SKILL_INFO[skill].name}`}
                        >
                          {prof === 'expertise' ? (
                            <div className="flex">
                              <Star className="w-2.5 h-2.5 text-gold-500 fill-gold-500" />
                              <Star className="w-2.5 h-2.5 text-gold-500 fill-gold-500 -ml-0.5" />
                            </div>
                          ) : prof === 'proficient' ? (
                            <Star className="w-3 h-3 text-gold-500 fill-gold-500" />
                          ) : (
                            <div className="w-3 h-3" />
                          )}
                          <span className="text-sm text-parchment capitalize">{skill.replace('_', ' ')}</span>
                          <span className="text-[10px] text-parchment-muted/50">({ability.slice(0, 3)})</span>
                        </button>
                        <span className="text-sm font-mono text-parchment px-2">{formatModifier(mod)}</span>
                        <button
                          onClick={() => setInfo({ kind: 'skill', skill, modifier: mod })}
                          className="p-2 text-parchment-muted/50 hover:text-parchment touch-target"
                          title={`What is ${SKILL_INFO[skill].name}?`}
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  })}
              </div>
            </Card>

            {/* Proficiencies */}
            <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
              <h3 className="text-sm font-serif text-parchment mb-3">Proficiencies & Languages</h3>
              <div className="space-y-3 text-sm">
                {char.proficiencies?.armor_proficiencies?.length > 0 && (
                  <div>
                    <span className="text-parchment-muted text-xs">Armor: </span>
                    <span className="text-parchment">{char.proficiencies.armor_proficiencies.join(', ')}</span>
                  </div>
                )}
                {char.proficiencies?.weapon_proficiencies?.length > 0 && (
                  <div>
                    <span className="text-parchment-muted text-xs">Weapons: </span>
                    <span className="text-parchment">{char.proficiencies.weapon_proficiencies.join(', ')}</span>
                  </div>
                )}
                {char.proficiencies?.tool_proficiencies?.length > 0 && (
                  <div>
                    <span className="text-parchment-muted text-xs block mb-1">Tools:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {char.proficiencies.tool_proficiencies.map((t, i) => (
                        <button
                          key={i}
                          onClick={() => setInfo({ kind: 'tool', name: t })}
                          className="text-xs px-2 py-1 rounded-md bg-charcoal-900/50 text-parchment border border-gold-500/10 hover:border-gold-500/30 transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {char.proficiencies?.languages?.length > 0 && (
                  <div>
                    <span className="text-parchment-muted text-xs block mb-1">Languages:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {char.proficiencies.languages.map((lang, i) => (
                        <button
                          key={i}
                          onClick={() => setInfo({ kind: 'language', name: lang })}
                          className="text-xs px-2 py-1 rounded-md bg-charcoal-900/50 text-parchment border border-gold-500/10 hover:border-gold-500/30 transition-colors"
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* INVENTORY TAB */}
          <TabsContent value="inventory" className="space-y-4">
            {/* Currency */}
            <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
              <h3 className="text-sm font-serif text-parchment mb-3">Currency</h3>
              <div className="grid grid-cols-5 gap-2 text-center">
                {[
                  { key: 'cp', label: 'CP', color: 'text-amber-700' },
                  { key: 'sp', label: 'SP', color: 'text-slate-300' },
                  { key: 'ep', label: 'EP', color: 'text-blue-300' },
                  { key: 'gp', label: 'GP', color: 'text-amber-400' },
                  { key: 'pp', label: 'PP', color: 'text-slate-100' },
                ].map(({ key, label, color }) => (
                  <div key={key} className="p-2 rounded-lg bg-charcoal-900/50">
                    <div className="text-[10px] text-parchment-muted">{label}</div>
                    <div className={`text-lg font-mono font-bold ${color}`}>
                      {(char.inventory?.currency as unknown as Record<string, number>)?.[key] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Equipped Armor */}
            {char.inventory?.armor && (
              <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
                <h3 className="text-sm font-serif text-parchment mb-3">Equipped Armor</h3>
                <button
                  onClick={() => setInfo({ kind: 'armor', armor: char.inventory.armor! })}
                  className="w-full flex items-center justify-between hover:bg-charcoal-900/30 -m-2 p-2 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-parchment">{char.inventory.armor.name}</span>
                    <Info className="w-3 h-3 text-parchment-muted/40" />
                  </div>
                  <span className="text-blue-400 font-mono">AC {char.inventory.armor.ac}</span>
                </button>
              </Card>
            )}

            {/* All Weapons (equipped & not) */}
            {char.inventory?.weapons?.length > 0 && (
              <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
                <h3 className="text-sm font-serif text-parchment mb-3">Weapons</h3>
                <div className="space-y-2">
                  {char.inventory.weapons.map((w, i) => (
                    <button
                      key={i}
                      onClick={() => setInfo({ kind: 'weapon', weapon: w, advantage: attackAdvantage })}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                        w.equipped
                          ? 'bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10'
                          : 'bg-charcoal-900/30 hover:bg-charcoal-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-parchment text-sm">{w.name}</span>
                        {w.equipped && <Badge variant="outline" className="text-[10px] py-0">equipped</Badge>}
                        <Info className="w-3 h-3 text-parchment-muted/40" />
                      </div>
                      <div className="text-right text-xs">
                        <span className="text-amber-400 font-mono">{formatModifier(w.attack_bonus)}</span>
                        <span className="text-parchment-muted ml-2">{w.damage}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Inventory Items */}
            {char.inventory?.items?.length > 0 && (
              <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
                <h3 className="text-sm font-serif text-parchment mb-3 flex items-center gap-2">
                  Items
                  <span className="text-[10px] text-parchment-muted/60 font-normal">tap for details</span>
                </h3>
                <div className="space-y-1">
                  {char.inventory.items.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setInfo({ kind: 'item', item })}
                      className="w-full flex items-center justify-between py-1.5 px-2 -mx-2 rounded text-sm hover:bg-charcoal-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {item.magical && <Sparkles className="w-3 h-3 text-purple-400" />}
                        <span className={`text-parchment ${item.magical ? 'text-purple-300' : ''}`}>{item.name}</span>
                        <Info className="w-3 h-3 text-parchment-muted/30" />
                      </div>
                      <div className="flex items-center gap-3 text-parchment-muted">
                        {item.quantity > 1 && <span>×{item.quantity}</span>}
                        {item.weight && <span>{item.weight} lb</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Magic Items (rich) */}
            {(char.inventory?.magic_items?.length ?? 0) > 0 && (
              <Card className="p-4 bg-purple-500/5 border-purple-500/20">
                <h3 className="text-sm font-serif text-purple-300 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Magic Items
                  <span className="text-[10px] text-parchment-muted/60 font-normal ml-auto">tap for details</span>
                </h3>
                <div className="space-y-1.5">
                  {char.inventory.magic_items!.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setInfo({ kind: 'magicItem', item })}
                      className="w-full flex items-center justify-between py-1.5 px-2 rounded text-sm hover:bg-purple-500/10 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Sparkles className="w-3 h-3 text-purple-400 flex-shrink-0" />
                        <span className="text-purple-200 truncate">{item.name}</span>
                        {item.attuned && <Badge variant="outline" className="text-[10px] py-0 border-purple-400/40 text-purple-300">attuned</Badge>}
                      </div>
                      {item.charges_max !== undefined && item.charges_max > 0 && (
                        <span className="text-xs text-purple-300/70 font-mono">
                          {item.charges_remaining ?? 0}/{item.charges_max}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Attunement */}
            {char.inventory?.attunement?.length > 0 && (
              <Card className="p-4 bg-purple-500/5 border-purple-500/20">
                <h3 className="text-sm font-serif text-purple-300 mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Attuned Items ({char.inventory.attunement.length}/3)
                </h3>
                <div className="space-y-1">
                  {char.inventory.attunement.map((item, i) => (
                    <div key={i} className="text-sm text-purple-200 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* BIO TAB */}
          <TabsContent value="bio" className="space-y-4">
            <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
              <h3 className="text-sm font-serif text-parchment mb-3">Character Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-parchment-muted text-xs">Race</span>
                  <p className="text-parchment">{char.race}{char.subrace ? ` (${char.subrace})` : ''}</p>
                </div>
                <div>
                  <span className="text-parchment-muted text-xs">Class</span>
                  <p className="text-parchment">{char.class}{char.subclass ? ` — ${char.subclass}` : ''}</p>
                </div>
                <div>
                  <span className="text-parchment-muted text-xs">Background</span>
                  <p className="text-parchment">{char.background || '—'}</p>
                </div>
                <div>
                  <span className="text-parchment-muted text-xs">Alignment</span>
                  <p className="text-parchment">{char.alignment}</p>
                </div>
                <div>
                  <span className="text-parchment-muted text-xs">XP</span>
                  <p className="text-parchment">{char.experience_points.toLocaleString()}</p>
                </div>
                {char.faith && (
                  <div>
                    <span className="text-parchment-muted text-xs">Faith / Deity</span>
                    <p className="text-parchment">{char.faith}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Physical Characteristics */}
            {(char.age || char.height || char.weight || char.eyes || char.hair || char.skin) && (
              <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
                <h3 className="text-sm font-serif text-parchment mb-3">Physical Characteristics</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {char.age && (
                    <div>
                      <span className="text-parchment-muted text-xs">Age</span>
                      <p className="text-parchment">{char.age}</p>
                    </div>
                  )}
                  {char.height && (
                    <div>
                      <span className="text-parchment-muted text-xs">Height</span>
                      <p className="text-parchment">{char.height}</p>
                    </div>
                  )}
                  {char.weight && (
                    <div>
                      <span className="text-parchment-muted text-xs">Weight</span>
                      <p className="text-parchment">{char.weight}</p>
                    </div>
                  )}
                  {char.eyes && (
                    <div>
                      <span className="text-parchment-muted text-xs">Eyes</span>
                      <p className="text-parchment">{char.eyes}</p>
                    </div>
                  )}
                  {char.hair && (
                    <div>
                      <span className="text-parchment-muted text-xs">Hair</span>
                      <p className="text-parchment">{char.hair}</p>
                    </div>
                  )}
                  {char.skin && (
                    <div>
                      <span className="text-parchment-muted text-xs">Skin</span>
                      <p className="text-parchment">{char.skin}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
            
            {(char.personality_traits || char.ideals || char.bonds || char.flaws) && (
              <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
                <h3 className="text-sm font-serif text-parchment mb-3">Personality</h3>
                <div className="space-y-3 text-sm">
                  {char.personality_traits && (
                    <div>
                      <span className="text-parchment-muted text-xs">Personality Traits</span>
                      <p className="text-parchment whitespace-pre-wrap">{char.personality_traits}</p>
                    </div>
                  )}
                  {char.ideals && (
                    <div>
                      <span className="text-parchment-muted text-xs">Ideals</span>
                      <p className="text-parchment whitespace-pre-wrap">{char.ideals}</p>
                    </div>
                  )}
                  {char.bonds && (
                    <div>
                      <span className="text-parchment-muted text-xs">Bonds</span>
                      <p className="text-parchment whitespace-pre-wrap">{char.bonds}</p>
                    </div>
                  )}
                  {char.flaws && (
                    <div>
                      <span className="text-parchment-muted text-xs">Flaws</span>
                      <p className="text-parchment whitespace-pre-wrap">{char.flaws}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
            
            {char.backstory && (
              <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
                <h3 className="text-sm font-serif text-parchment mb-3">Backstory</h3>
                <p className="text-sm text-parchment-muted whitespace-pre-wrap leading-relaxed">{char.backstory}</p>
              </Card>
            )}
            
            {char.appearance && (
              <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
                <h3 className="text-sm font-serif text-parchment mb-3">Appearance</h3>
                <p className="text-sm text-parchment-muted whitespace-pre-wrap leading-relaxed">{char.appearance}</p>
              </Card>
            )}

            {/* Session Notes */}
            {char.session_notes?.length > 0 && (
              <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-serif text-parchment">Session Notes</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 h-7 px-2 gap-1"
                    onClick={generateRecap}
                    disabled={recapLoading}
                  >
                    <Sparkles className="w-3 h-3" />
                    {recapLoading ? 'Writing...' : 'AI Recap'}
                  </Button>
                </div>
                {recapText && (
                  <div className="mb-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/15">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span className="text-[10px] text-purple-400 uppercase tracking-wider font-medium">Chronicle Recap</span>
                    </div>
                    <p className="text-sm text-parchment-muted whitespace-pre-wrap leading-relaxed italic">{recapText}</p>
                  </div>
                )}
                <div className="space-y-3">
                  {char.session_notes
                    .slice()
                    .reverse()
                    .map((note, i) => (
                      <div key={i} className="p-3 rounded-lg bg-charcoal-900/30 border-l-2 border-gold-500/20">
                        <div className="text-xs text-parchment-muted mb-1">
                          Session {note.session} • {note.date}
                        </div>
                        <p className="text-sm text-parchment whitespace-pre-wrap">{note.notes}</p>
                      </div>
                    ))}
                </div>
              </Card>
            )}

            {/* Multiclass Details */}
            {char.multiclass?.length > 0 && (
              <Card className="p-4 bg-charcoal-950/50 border-gold-500/10">
                <h3 className="text-sm font-serif text-parchment mb-3">Multiclass</h3>
                <div className="space-y-2">
                  {char.multiclass.map((mc, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-parchment">{mc.class}{mc.subclass ? ` — ${mc.subclass}` : ''}</span>
                      <Badge variant="outline" className="text-xs">{mc.level}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Panels */}
      {showDice && (
        <div className="fixed bottom-4 right-4 z-50 w-80 md:w-96">
          <DiceRoller onClose={() => setShowDice(false)} />
        </div>
      )}
      
      {showCelestial && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 md:w-[28rem]">
          <CelestialAdvisor characterId={char.id} characterName={char.name} onClose={() => setShowCelestial(false)} />
        </div>
      )}

      {/* Tap-to-Explain Popover */}
      <CharacterInfoPopover
        info={info}
        onClose={() => setInfo(null)}
        onRoll={(label, mod, adv) => {
          quickRoll(label, mod, adv)
          setInfo(null)
        }}
        onDamageRoll={(label, notation) => {
          quickDamageRoll(label, notation)
          setInfo(null)
        }}
        onToggleCondition={(c) => {
          toggleCondition(c)
          setInfo(null)
        }}
      />
    </div>
  )
}

// Sub-components

function StatBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <Card className="p-2 md:p-3 text-center bg-charcoal-950/50 border-gold-500/10">
      <div className={`flex items-center justify-center gap-1 mb-1 ${color}`}>
        {icon}
        <span className="text-[10px] md:text-xs uppercase">{label}</span>
      </div>
      <div className="text-lg md:text-xl font-bold font-mono text-parchment">{value}</div>
    </Card>
  )
}

function SpellCard({ 
  name, school, description, damage, isCantrip, concentration, ritual, prepared, castingTime, range, duration, spellComponents,
  spellLevel, concentrationActive, onQuickCast
}: { 
  name: string; school: string; description: string; damage?: string; isCantrip?: boolean
  concentration?: boolean; ritual?: boolean; prepared?: boolean; castingTime?: string; range?: string; duration?: string; spellComponents?: string
  spellLevel?: number; concentrationActive?: boolean; onQuickCast?: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  // Fallback to SRD spell details when fields are empty
  const details = lookupSpellDetail(name)
  const dSchool = school || details?.school || ''
  const dCastingTime = castingTime || details?.casting_time || ''
  const dRange = range || details?.range || ''
  const dDuration = duration || details?.duration || ''
  const dComponents = spellComponents || details?.components || ''
  const dDescription = description && description !== `(${name})` && !description.startsWith('(') ? description : (details?.description || description || '')
  const dDamage = damage || details?.damage || ''
  const dConcentration = concentration ?? details?.concentration ?? false
  const dRitual = ritual ?? details?.ritual ?? false
  
  return (
    <div
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        concentrationActive
          ? 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20'
          : isCantrip 
            ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30'
            : prepared !== false
              ? 'bg-blue-500/5 border-blue-500/10 hover:border-blue-500/30'
              : 'bg-charcoal-900/30 border-charcoal-900/50 opacity-60'
      }`}
    >
      <button className="w-full text-left" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-parchment font-medium">{name}</span>
            {dConcentration && <Sparkles className="w-3 h-3 text-amber-400" />}
            {dRitual && <BookOpen className="w-3 h-3 text-emerald-400" />}
            {concentrationActive && <span className="text-[9px] text-amber-400 font-medium uppercase tracking-wider">Active</span>}
          </div>
          <div className="flex items-center gap-2">
            {dDamage && <span className="text-xs text-red-400 font-mono">{dDamage}</span>}
            {expanded ? <ChevronUp className="w-3 h-3 text-parchment-muted" /> : <ChevronDown className="w-3 h-3 text-parchment-muted" />}
          </div>
        </div>
        <span className="text-[10px] text-parchment-muted">{dSchool}</span>
      </button>
      
      {expanded && (
        <div className="mt-2 pt-2 border-t border-gold-500/10 space-y-1">
          {dCastingTime && <div className="text-xs text-parchment-muted"><span className="text-parchment-muted/70">Cast:</span> {dCastingTime}</div>}
          {dRange && <div className="text-xs text-parchment-muted"><span className="text-parchment-muted/70">Range:</span> {dRange}</div>}
          {dDuration && <div className="text-xs text-parchment-muted"><span className="text-parchment-muted/70">Duration:</span> {dDuration}</div>}
          {dComponents && <div className="text-xs text-parchment-muted"><span className="text-parchment-muted/70">Components:</span> {dComponents}</div>}
          {dDescription && <p className="text-xs text-parchment-muted leading-relaxed mt-1">{dDescription}</p>}
          {/* Quick Cast button for leveled spells */}
          {!isCantrip && onQuickCast && prepared !== false && (
            <button
              className="mt-2 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/25 hover:bg-blue-500/25 transition-colors"
              onClick={(e) => { e.stopPropagation(); onQuickCast() }}
            >
              <Zap className="w-3 h-3" />
              Cast{dConcentration ? ' (sets concentration)' : ''}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function FeatureCard({ feature, onUse }: { feature: FeatureEntry; onUse: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const hasUses = feature.uses_max !== undefined && feature.uses_max > 0
  const isEmpty = hasUses && feature.uses_remaining === 0
  
  return (
    <Card className={`p-3 border-gold-500/10 transition-all ${isEmpty ? 'opacity-50' : ''} bg-charcoal-950/50`}>
      <div className="flex items-center justify-between">
        <button className="flex-1 text-left" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-2">
            <span className="text-sm text-parchment font-medium">{feature.name}</span>
            <Badge variant="outline" className="text-[10px] py-0">{feature.source}</Badge>
            {feature.recharge && feature.recharge !== 'none' && (
              <Badge variant="outline" className="text-[10px] py-0 text-amber-400 border-amber-500/20">
                {feature.recharge === 'short_rest' ? 'SR' : feature.recharge === 'long_rest' ? 'LR' : 'Dawn'}
              </Badge>
            )}
          </div>
        </button>
        
        {hasUses && (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: feature.uses_max! }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border ${
                    i < (feature.uses_remaining || 0)
                      ? 'bg-amber-500/30 border-amber-400/50'
                      : 'bg-charcoal-900 border-charcoal-900'
                  }`}
                />
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onUse}
              disabled={isEmpty}
              className="text-xs text-amber-400 h-7 px-2"
            >
              Use
            </Button>
          </div>
        )}
        
        <button onClick={() => setExpanded(!expanded)} className="ml-2">
          {expanded ? <ChevronUp className="w-4 h-4 text-parchment-muted" /> : <ChevronDown className="w-4 h-4 text-parchment-muted" />}
        </button>
      </div>
      
      {expanded && feature.description && (
        <p className="text-xs text-parchment-muted mt-2 pt-2 border-t border-gold-500/10 leading-relaxed whitespace-pre-wrap">
          {feature.description}
        </p>
      )}
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tap-to-Explain Popover dispatcher — renders the right body for any InfoTarget
// ─────────────────────────────────────────────────────────────────────────────

function CharacterInfoPopover({
  info,
  onClose,
  onRoll,
  onDamageRoll,
  onToggleCondition,
}: {
  info: InfoTarget | null
  onClose: () => void
  onRoll: (label: string, modifier: number, advantage?: 'advantage' | 'disadvantage') => void
  onDamageRoll: (label: string, notation: string) => void
  onToggleCondition: (condition: DndCondition) => void
}) {
  if (!info) {
    return (
      <InfoPopover open={false} onOpenChange={onClose} title="">
        <div />
      </InfoPopover>
    )
  }

  // SKILL
  if (info.kind === 'skill') {
    const skill = SKILL_INFO[info.skill]
    return (
      <InfoPopover
        open
        onOpenChange={onClose}
        title={skill.name}
        subtitle={`${skill.ability} skill`}
        accent="#d4a84b"
        footer={
          <Button
            className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 gap-2"
            onClick={() => onRoll(skill.name, info.modifier, info.advantage)}
          >
            <Dices className="w-4 h-4" />
            Roll {skill.name} ({formatModifier(info.modifier)})
          </Button>
        }
      >
        <InfoSection label="What it does">
          <p>{skill.description}</p>
        </InfoSection>
        <InfoSection label="When to use it">
          <InfoBullets items={skill.examples} />
        </InfoSection>
      </InfoPopover>
    )
  }

  // SAVING THROW
  if (info.kind === 'save') {
    const ab = ABILITY_INFO[info.ability]
    return (
      <InfoPopover
        open
        onOpenChange={onClose}
        title={`${ab.name} Save`}
        subtitle="Saving Throw"
        accent="#d4a84b"
        footer={
          <Button
            className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 gap-2"
            onClick={() => onRoll(`${ab.name} Save`, info.modifier)}
          >
            <Dices className="w-4 h-4" />
            Roll {ab.name} Save ({formatModifier(info.modifier)})
          </Button>
        }
      >
        <InfoSection label="When you roll it">
          <p>
            A {ab.name} save resists effects that target your {ab.description.toLowerCase()} The DM will
            call for one when something tries to overcome you in that way.
          </p>
        </InfoSection>
        <InfoSection label="Common triggers">
          <InfoBullets items={ab.usedFor.filter(s => s.toLowerCase().includes('save'))} />
        </InfoSection>
      </InfoPopover>
    )
  }

  // ABILITY SCORE
  if (info.kind === 'ability') {
    const ab = ABILITY_INFO[info.ability]
    return (
      <InfoPopover
        open
        onOpenChange={onClose}
        title={ab.name}
        subtitle="Ability Score"
        accent="#d4a84b"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 gap-1.5"
              onClick={() => onRoll(`${ab.name} Check`, info.modifier)}
            >
              <Dices className="w-3.5 h-3.5" />
              Check ({formatModifier(info.modifier)})
            </Button>
            <Button
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 gap-1.5"
              onClick={() => onRoll(`${ab.name} Save`, info.saveModifier)}
            >
              <Dices className="w-3.5 h-3.5" />
              Save ({formatModifier(info.saveModifier)}{info.saveProficient ? ' ★' : ''})
            </Button>
          </div>
        }
      >
        <InfoSection label="What it represents">
          <p>{ab.description}</p>
        </InfoSection>
        <InfoSection label="Used for">
          <InfoBullets items={ab.usedFor} />
        </InfoSection>
      </InfoPopover>
    )
  }

  // CONDITION
  if (info.kind === 'condition') {
    const c = info.condition
    const summary = CONDITION_EFFECTS[c]?.description
    const bullets = CONDITION_INFO[c]
    return (
      <InfoPopover
        open
        onOpenChange={onClose}
        title={c[0].toUpperCase() + c.slice(1)}
        subtitle={info.active ? 'Currently applied' : 'Condition'}
        accent="#ef4444"
        footer={
          <Button
            className={
              info.active
                ? 'w-full bg-charcoal-900 hover:bg-charcoal-800 text-parchment border border-gold-500/20 gap-2'
                : 'w-full bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 gap-2'
            }
            onClick={() => onToggleCondition(c)}
          >
            {info.active ? 'Remove Condition' : 'Apply Condition'}
          </Button>
        }
      >
        {summary && (
          <InfoSection label="In one line">
            <p>{summary}</p>
          </InfoSection>
        )}
        {bullets && (
          <InfoSection label="Full effect">
            <InfoBullets items={bullets} />
          </InfoSection>
        )}
      </InfoPopover>
    )
  }

  // STANDARD ACTION
  if (info.kind === 'standardAction') {
    const a = STANDARD_ACTIONS[info.action]
    if (!a) return null
    return (
      <InfoPopover
        open
        onOpenChange={onClose}
        title={a.name}
        subtitle={a.type}
        accent="#10b981"
      >
        <InfoSection label="What it does">
          <p>{a.description}</p>
        </InfoSection>
        <InfoSection label="Rules">
          <InfoBullets items={a.rules} />
        </InfoSection>
      </InfoPopover>
    )
  }

  // WEAPON
  if (info.kind === 'weapon') {
    const w = info.weapon
    const propBullets = (w.properties ?? [])
      .map(p => {
        const propInfo = lookupWeaponProperty(p)
        return propInfo ? `${p} — ${propInfo}` : p
      })
    const masteryInfo = w.weapon_mastery ? WEAPON_PROPERTY_INFO[w.weapon_mastery.toLowerCase()] : null
    const dtKey = w.damage_type?.toLowerCase()
    const damageInfo = dtKey ? DAMAGE_TYPE_INFO[dtKey] : null
    return (
      <InfoPopover
        open
        onOpenChange={onClose}
        title={w.name}
        subtitle={w.equipped ? 'Equipped weapon' : 'Weapon'}
        accent="#d97706"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 gap-1.5"
              onClick={() => onRoll(`${w.name} Attack`, w.attack_bonus, info.advantage)}
            >
              <Dices className="w-3.5 h-3.5" />
              To Hit ({formatModifier(w.attack_bonus)})
            </Button>
            <Button
              className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 gap-1.5"
              onClick={() => onDamageRoll(w.name, w.damage)}
            >
              <Dices className="w-3.5 h-3.5" />
              Damage ({w.damage})
            </Button>
          </div>
        }
      >
        <InfoSection label="Stats">
          <div className="grid grid-cols-2 gap-y-1 text-xs">
            <span className="text-parchment-muted">Attack bonus:</span>
            <span className="font-mono text-amber-300">{formatModifier(w.attack_bonus)}</span>
            <span className="text-parchment-muted">Damage:</span>
            <span className="font-mono text-red-300">{w.damage}{w.damage_type ? ` ${w.damage_type.toLowerCase()}` : ''}</span>
            {w.range && (<>
              <span className="text-parchment-muted">Range:</span>
              <span>{w.range}</span>
            </>)}
            {w.weapon_mastery && (<>
              <span className="text-parchment-muted">Mastery:</span>
              <span className="text-purple-300">{w.weapon_mastery}</span>
            </>)}
          </div>
        </InfoSection>
        {propBullets.length > 0 && (
          <InfoSection label="Properties">
            <InfoBullets items={propBullets} />
          </InfoSection>
        )}
        {masteryInfo && (
          <InfoSection label={`Weapon Mastery: ${w.weapon_mastery}`}>
            <p>{masteryInfo}</p>
          </InfoSection>
        )}
        {damageInfo && (
          <InfoSection label={`${w.damage_type} damage`}>
            <p>{damageInfo}</p>
          </InfoSection>
        )}
      </InfoPopover>
    )
  }

  // ITEM
  if (info.kind === 'item') {
    const item = info.item
    const fallback = lookupGearInfo(item.name)
    return (
      <InfoPopover
        open
        onOpenChange={onClose}
        title={item.name}
        subtitle={item.magical ? 'Magical Item' : 'Item'}
        accent={item.magical ? '#a855f7' : undefined}
      >
        <div className="flex flex-wrap gap-3 text-xs text-parchment-muted mb-3">
          {item.quantity > 1 && <span>Quantity: <span className="text-parchment">×{item.quantity}</span></span>}
          {item.weight !== undefined && <span>Weight: <span className="text-parchment">{item.weight} lb</span></span>}
          {item.attuned && <span className="text-purple-300">★ Attuned</span>}
        </div>
        {item.description ? (
          <InfoSection label="Description">
            <p className="whitespace-pre-wrap">{item.description}</p>
          </InfoSection>
        ) : fallback ? (
          <InfoSection label="What it does">
            <p>{fallback}</p>
          </InfoSection>
        ) : (
          <p className="text-parchment-muted italic text-xs">
            No description set. You can add one in the character editor → Inventory.
          </p>
        )}
      </InfoPopover>
    )
  }

  // MAGIC ITEM
  if (info.kind === 'magicItem') {
    const item = info.item
    const rarityInfo = item.rarity ? RARITY_INFO[item.rarity.toLowerCase()] : null
    return (
      <InfoPopover
        open
        onOpenChange={onClose}
        title={item.name}
        subtitle={item.rarity || 'Magic Item'}
        accent="#a855f7"
      >
        <div className="flex flex-wrap gap-3 text-xs text-parchment-muted mb-3">
          {item.requires_attunement && (
            <span className={item.attuned ? 'text-purple-300' : 'text-parchment-muted'}>
              {item.attuned ? '★ Attuned' : 'Requires attunement'}
            </span>
          )}
          {item.charges_max !== undefined && (
            <span>Charges: <span className="font-mono text-purple-300">{item.charges_remaining ?? 0}/{item.charges_max}</span></span>
          )}
          {item.recharge && item.recharge !== 'none' && (
            <span>Recharges: <span className="text-parchment">{item.recharge.replace('_', ' ')}</span></span>
          )}
        </div>
        {item.description && (
          <InfoSection label="Description">
            <p className="whitespace-pre-wrap">{item.description}</p>
          </InfoSection>
        )}
        {rarityInfo && (
          <InfoSection label={`${item.rarity} item`}>
            <p>{rarityInfo}</p>
          </InfoSection>
        )}
      </InfoPopover>
    )
  }

  // ARMOR
  if (info.kind === 'armor') {
    const a = info.armor
    const tKey = a.type?.toLowerCase()
    const typeInfo = tKey ? ARMOR_TYPE_INFO[tKey] : null
    return (
      <InfoPopover
        open
        onOpenChange={onClose}
        title={a.name}
        subtitle={`${a.type} armor`}
        accent="#3b82f6"
      >
        <InfoSection label="Stats">
          <div className="grid grid-cols-2 gap-y-1 text-xs">
            <span className="text-parchment-muted">Armor Class:</span>
            <span className="font-mono text-blue-300">{a.ac}</span>
            <span className="text-parchment-muted">Type:</span>
            <span>{a.type}</span>
            {a.stealth_disadvantage && (<>
              <span className="text-parchment-muted">Stealth:</span>
              <span className="text-red-300">Disadvantage</span>
            </>)}
          </div>
        </InfoSection>
        {typeInfo && (
          <InfoSection label={`${a.type} armor rules`}>
            <p>{typeInfo}</p>
          </InfoSection>
        )}
      </InfoPopover>
    )
  }

  // LANGUAGE
  if (info.kind === 'language') {
    const desc = lookupLanguageInfo(info.name)
    return (
      <InfoPopover
        open
        onOpenChange={onClose}
        title={info.name}
        subtitle="Language"
        accent="#06b6d4"
      >
        {desc ? (
          <p>{desc}</p>
        ) : (
          <p className="text-parchment-muted italic text-xs">
            A language you can read, write, and speak.
          </p>
        )}
      </InfoPopover>
    )
  }

  // TOOL
  if (info.kind === 'tool') {
    return (
      <InfoPopover
        open
        onOpenChange={onClose}
        title={info.name}
        subtitle="Tool Proficiency"
        accent="#a3a3a3"
      >
        <InfoSection label="What it means">
          <p>
            You add your proficiency bonus to ability checks the DM calls for when using {info.name}.
            The ability used (STR/DEX/INT/WIS/CHA) depends on the task.
          </p>
        </InfoSection>
        <InfoSection label="Common uses">
          <p className="text-parchment-muted italic">
            Ask your DM how this tool applies — e.g. Thieves&apos; Tools for locks &amp; traps,
            Smith&apos;s Tools to repair armor, an instrument to perform.
          </p>
        </InfoSection>
      </InfoPopover>
    )
  }

  return null
}
