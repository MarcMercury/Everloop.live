'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Save, ArrowLeft, Plus, Trash2, Loader2,
  User, Swords, Sparkles, BookOpen, Backpack 
} from 'lucide-react'
import Link from 'next/link'
import type { 
  PlayerCharacter, PlayerCharacterInsert,
  SpellEntry, CantripEntry, FeatureEntry, WeaponEntry, InventoryItem,
  CompanionEntry, SessionNote, MulticlassEntry,
  SpellcastingData, ProficiencyData, InventoryData, CharacterStatus
} from '@/types/player-character'
import { 
  DND_CLASSES, DND_RACES, DND_ALIGNMENTS, DND_BACKGROUNDS,
  defaultSpellcasting, defaultProficiencies, defaultInventory, defaultStatus
} from '@/types/player-character'
import { createPlayerCharacter, updatePlayerCharacter, deletePlayerCharacter } from '@/lib/actions/player-characters'

interface Props {
  character?: PlayerCharacter
}

export function CharacterForm({ character }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing = !!character
  
  // Core fields
  const [name, setName] = useState(character?.name || '')
  const [race, setRace] = useState(character?.race || 'Human')
  const [subrace, setSubrace] = useState(character?.subrace || '')
  const [charClass, setCharClass] = useState(character?.class || 'Fighter')
  const [subclass, setSubclass] = useState(character?.subclass || '')
  const [level, setLevel] = useState(character?.level || 1)
  const [xp, setXp] = useState(character?.experience_points || 0)
  const [background, setBackground] = useState(character?.background || '')
  const [alignment, setAlignment] = useState(character?.alignment || 'True Neutral')
  const [portraitUrl, setPortraitUrl] = useState(character?.portrait_url || '')
  const [campaignName, setCampaignName] = useState(character?.campaign_name || '')
  const [dmName, setDmName] = useState(character?.dm_name || '')
  const [isActive, setIsActive] = useState(character?.is_active ?? true)
  
  // Ability Scores
  const [str, setStr] = useState(character?.strength || 10)
  const [dex, setDex] = useState(character?.dexterity || 10)
  const [con, setCon] = useState(character?.constitution || 10)
  const [int, setInt] = useState(character?.intelligence || 10)
  const [wis, setWis] = useState(character?.wisdom || 10)
  const [cha, setCha] = useState(character?.charisma || 10)
  
  // Combat
  const [maxHp, setMaxHp] = useState(character?.max_hp || 10)
  const [ac, setAc] = useState(character?.armor_class || 10)
  const [initBonus, setInitBonus] = useState(character?.initiative_bonus || 0)
  const [speed, setSpeed] = useState(character?.speed || 30)
  const [hitDice, setHitDice] = useState(character?.hit_dice_total || '1d10')
  const [profBonus, setProfBonus] = useState(character?.proficiency_bonus || 2)
  
  // Bio
  const [personality, setPersonality] = useState(character?.personality_traits || '')
  const [ideals, setIdeals] = useState(character?.ideals || '')
  const [bonds, setBonds] = useState(character?.bonds || '')
  const [flaws, setFlaws] = useState(character?.flaws || '')
  const [backstory, setBackstory] = useState(character?.backstory || '')
  const [appearance, setAppearance] = useState(character?.appearance || '')
  
  // Spellcasting
  const [spellcasting, setSpellcasting] = useState<SpellcastingData>(
    character?.spellcasting || defaultSpellcasting()
  )
  
  // Proficiencies
  const [proficiencies, setProficiencies] = useState<ProficiencyData>(
    character?.proficiencies || defaultProficiencies()
  )
  
  // Features
  const [features, setFeatures] = useState<FeatureEntry[]>(character?.features || [])
  
  // Inventory
  const [inventory, setInventory] = useState<InventoryData>(
    character?.inventory || defaultInventory()
  )
  
  // Companions
  const [companions, setCompanions] = useState<CompanionEntry[]>(character?.companions || [])
  
  async function handleSubmit() {
    if (!name.trim()) return
    
    const data: Omit<PlayerCharacterInsert, 'user_id'> = {
      name: name.trim(),
      race,
      subrace: subrace || null,
      class: charClass,
      subclass: subclass || null,
      level,
      experience_points: xp,
      background: background || null,
      alignment,
      portrait_url: portraitUrl || null,
      campaign_name: campaignName || null,
      dm_name: dmName || null,
      is_active: isActive,
      strength: str,
      dexterity: dex,
      constitution: con,
      intelligence: int,
      wisdom: wis,
      charisma: cha,
      max_hp: maxHp,
      current_hp: isEditing ? undefined : maxHp,
      armor_class: ac,
      initiative_bonus: initBonus,
      speed,
      hit_dice_total: hitDice,
      hit_dice_remaining: isEditing ? undefined : hitDice,
      proficiency_bonus: profBonus,
      personality_traits: personality || null,
      ideals: ideals || null,
      bonds: bonds || null,
      flaws: flaws || null,
      backstory: backstory || null,
      appearance: appearance || null,
      spellcasting: JSON.parse(JSON.stringify(spellcasting)),
      proficiencies: JSON.parse(JSON.stringify(proficiencies)),
      features: JSON.parse(JSON.stringify(features)),
      inventory: JSON.parse(JSON.stringify(inventory)),
      companions: JSON.parse(JSON.stringify(companions)),
    }
    
    startTransition(async () => {
      if (isEditing) {
        const result = await updatePlayerCharacter(character.id, data)
        if (result.success) {
          router.push(`/player-deck/${character.id}`)
        }
      } else {
        const result = await createPlayerCharacter(data)
        if (result.success && result.character) {
          router.push(`/player-deck/${result.character.id}`)
        }
      }
    })
  }
  
  async function handleDelete() {
    if (!character || !confirm('Are you sure you want to delete this character? This cannot be undone.')) return
    
    startTransition(async () => {
      const result = await deletePlayerCharacter(character.id)
      if (result.success) {
        router.push('/player-deck')
      }
    })
  }
  
  // Helpers for managing array fields
  function addFeature() {
    setFeatures(prev => [...prev, { name: '', source: charClass, description: '', recharge: 'none' }])
  }
  
  function updateFeature(index: number, updates: Partial<FeatureEntry>) {
    setFeatures(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f))
  }
  
  function removeFeature(index: number) {
    setFeatures(prev => prev.filter((_, i) => i !== index))
  }
  
  function addWeapon() {
    setInventory(prev => ({
      ...prev,
      weapons: [...prev.weapons, { name: '', attack_bonus: 0, damage: '', properties: [], equipped: true }]
    }))
  }
  
  function updateWeapon(index: number, updates: Partial<WeaponEntry>) {
    setInventory(prev => ({
      ...prev,
      weapons: prev.weapons.map((w, i) => i === index ? { ...w, ...updates } : w)
    }))
  }
  
  function removeWeapon(index: number) {
    setInventory(prev => ({ ...prev, weapons: prev.weapons.filter((_, i) => i !== index) }))
  }
  
  function addItem() {
    setInventory(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1 }]
    }))
  }
  
  function updateItem(index: number, updates: Partial<InventoryItem>) {
    setInventory(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, ...updates } : item)
    }))
  }
  
  function removeItem(index: number) {
    setInventory(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }
  
  function addSpell() {
    setSpellcasting(prev => ({
      ...prev,
      spells_known: [...prev.spells_known, { 
        name: '', level: 1, school: '', casting_time: '1 action', 
        range: '', components: '', duration: '', description: '', 
        prepared: true, concentration: false, ritual: false 
      }]
    }))
  }
  
  function updateSpell(index: number, updates: Partial<SpellEntry>) {
    setSpellcasting(prev => ({
      ...prev,
      spells_known: prev.spells_known.map((s, i) => i === index ? { ...s, ...updates } : s)
    }))
  }
  
  function removeSpell(index: number) {
    setSpellcasting(prev => ({
      ...prev,
      spells_known: prev.spells_known.filter((_, i) => i !== index)
    }))
  }
  
  function addCantrip() {
    setSpellcasting(prev => ({
      ...prev,
      cantrips: [...prev.cantrips, { name: '', school: '', casting_time: '1 action', range: '', components: '', duration: '', description: '' }]
    }))
  }
  
  function updateCantrip(index: number, updates: Partial<CantripEntry>) {
    setSpellcasting(prev => ({
      ...prev,
      cantrips: prev.cantrips.map((c, i) => i === index ? { ...c, ...updates } : c)
    }))
  }
  
  function removeCantrip(index: number) {
    setSpellcasting(prev => ({
      ...prev,
      cantrips: prev.cantrips.filter((_, i) => i !== index)
    }))
  }
  
  function addCompanion() {
    setCompanions(prev => [...prev, { name: '', type: '', hp: 10, max_hp: 10, ac: 10, notes: '' }])
  }
  
  function updateCompanion(index: number, updates: Partial<CompanionEntry>) {
    setCompanions(prev => prev.map((c, i) => i === index ? { ...c, ...updates } : c))
  }
  
  function removeCompanion(index: number) {
    setCompanions(prev => prev.filter((_, i) => i !== index))
  }
  
  return (
    <div className="space-y-6 pb-12">
      {/* Action Bar */}
      <div className="flex items-center justify-between sticky top-14 z-30 py-3 glass -mx-4 md:-mx-6 px-4 md:px-6">
        <Link href={isEditing ? `/player-deck/${character?.id}` : '/player-deck'} className="flex items-center gap-2 text-parchment-muted hover:text-parchment text-sm">
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </Link>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Button variant="outline" size="sm" className="text-red-400 border-red-500/20 hover:bg-red-500/10" onClick={handleDelete} disabled={isPending}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()} className="btn-fantasy gap-2">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditing ? 'Save Changes' : 'Create Character'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="w-full flex overflow-x-auto bg-charcoal-950/50 border border-gold-500/10 p-1 rounded-xl mb-6">
          <TabsTrigger value="identity" className="flex-1 min-w-fit gap-1.5 text-xs md:text-sm">
            <User className="w-3.5 h-3.5" /> Identity
          </TabsTrigger>
          <TabsTrigger value="combat" className="flex-1 min-w-fit gap-1.5 text-xs md:text-sm">
            <Swords className="w-3.5 h-3.5" /> Combat
          </TabsTrigger>
          <TabsTrigger value="spells" className="flex-1 min-w-fit gap-1.5 text-xs md:text-sm">
            <Sparkles className="w-3.5 h-3.5" /> Spells
          </TabsTrigger>
          <TabsTrigger value="features" className="flex-1 min-w-fit gap-1.5 text-xs md:text-sm">
            <BookOpen className="w-3.5 h-3.5" /> Features
          </TabsTrigger>
          <TabsTrigger value="gear" className="flex-1 min-w-fit gap-1.5 text-xs md:text-sm">
            <Backpack className="w-3.5 h-3.5" /> Gear
          </TabsTrigger>
        </TabsList>

        {/* IDENTITY TAB */}
        <TabsContent value="identity" className="space-y-6">
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <h3 className="text-lg font-serif text-parchment">Basic Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-parchment-muted">Character Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Thorin Oakenshield" className="bg-charcoal-950 border-gold-500/10 text-parchment" />
              </div>
              
              <div>
                <Label className="text-parchment-muted">Race</Label>
                <select value={race} onChange={e => setRace(e.target.value)} className="w-full bg-charcoal-950 border border-gold-500/10 text-parchment rounded-lg px-3 py-2 text-sm">
                  {DND_RACES.map(r => <option key={r} value={r}>{r}</option>)}
                  <option value="Custom">Custom</option>
                </select>
              </div>
              
              <div>
                <Label className="text-parchment-muted">Subrace</Label>
                <Input value={subrace} onChange={e => setSubrace(e.target.value)} placeholder="e.g. High Elf, Hill Dwarf" className="bg-charcoal-950 border-gold-500/10 text-parchment" />
              </div>
              
              <div>
                <Label className="text-parchment-muted">Class</Label>
                <select value={charClass} onChange={e => setCharClass(e.target.value)} className="w-full bg-charcoal-950 border border-gold-500/10 text-parchment rounded-lg px-3 py-2 text-sm">
                  {DND_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div>
                <Label className="text-parchment-muted">Subclass</Label>
                <Input value={subclass} onChange={e => setSubclass(e.target.value)} placeholder="e.g. Battle Master, School of Evocation" className="bg-charcoal-950 border-gold-500/10 text-parchment" />
              </div>
              
              <div>
                <Label className="text-parchment-muted">Level</Label>
                <Input type="number" min={1} max={20} value={level} onChange={e => setLevel(parseInt(e.target.value) || 1)} className="bg-charcoal-950 border-gold-500/10 text-parchment" />
              </div>
              
              <div>
                <Label className="text-parchment-muted">Experience Points</Label>
                <Input type="number" min={0} value={xp} onChange={e => setXp(parseInt(e.target.value) || 0)} className="bg-charcoal-950 border-gold-500/10 text-parchment" />
              </div>
              
              <div>
                <Label className="text-parchment-muted">Background</Label>
                <select value={background} onChange={e => setBackground(e.target.value)} className="w-full bg-charcoal-950 border border-gold-500/10 text-parchment rounded-lg px-3 py-2 text-sm">
                  <option value="">Select background...</option>
                  {DND_BACKGROUNDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              
              <div>
                <Label className="text-parchment-muted">Alignment</Label>
                <select value={alignment} onChange={e => setAlignment(e.target.value)} className="w-full bg-charcoal-950 border border-gold-500/10 text-parchment rounded-lg px-3 py-2 text-sm">
                  {DND_ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <h3 className="text-lg font-serif text-parchment">Campaign & Portrait</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-parchment-muted">Campaign Name</Label>
                <Input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Curse of Strahd" className="bg-charcoal-950 border-gold-500/10 text-parchment" />
              </div>
              <div>
                <Label className="text-parchment-muted">DM Name</Label>
                <Input value={dmName} onChange={e => setDmName(e.target.value)} placeholder="Matt Mercer" className="bg-charcoal-950 border-gold-500/10 text-parchment" />
              </div>
              <div className="md:col-span-2">
                <Label className="text-parchment-muted">Portrait URL</Label>
                <Input value={portraitUrl} onChange={e => setPortraitUrl(e.target.value)} placeholder="https://..." className="bg-charcoal-950 border-gold-500/10 text-parchment" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded border-gold-500/20" />
                  <span className="text-parchment-muted">Active character (in current play)</span>
                </label>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <h3 className="text-lg font-serif text-parchment">Ability Scores</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: 'STR', value: str, set: setStr },
                { label: 'DEX', value: dex, set: setDex },
                { label: 'CON', value: con, set: setCon },
                { label: 'INT', value: int, set: setInt },
                { label: 'WIS', value: wis, set: setWis },
                { label: 'CHA', value: cha, set: setCha },
              ].map(({ label, value, set }) => (
                <div key={label} className="text-center">
                  <Label className="text-parchment-muted text-xs">{label}</Label>
                  <Input 
                    type="number" min={1} max={30} value={value} 
                    onChange={e => set(parseInt(e.target.value) || 10)}
                    className="bg-charcoal-950 border-gold-500/10 text-parchment text-center text-lg font-mono"
                  />
                  <div className="text-xs text-parchment-muted mt-1">
                    mod: {Math.floor((value - 10) / 2) >= 0 ? '+' : ''}{Math.floor((value - 10) / 2)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <h3 className="text-lg font-serif text-parchment">Personality & Backstory</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-parchment-muted">Personality Traits</Label>
                <textarea value={personality} onChange={e => setPersonality(e.target.value)} rows={2} className="w-full bg-charcoal-950 border border-gold-500/10 text-parchment rounded-lg px-3 py-2 text-sm focus-glow" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-parchment-muted">Ideals</Label>
                  <textarea value={ideals} onChange={e => setIdeals(e.target.value)} rows={2} className="w-full bg-charcoal-950 border border-gold-500/10 text-parchment rounded-lg px-3 py-2 text-sm focus-glow" />
                </div>
                <div>
                  <Label className="text-parchment-muted">Bonds</Label>
                  <textarea value={bonds} onChange={e => setBonds(e.target.value)} rows={2} className="w-full bg-charcoal-950 border border-gold-500/10 text-parchment rounded-lg px-3 py-2 text-sm focus-glow" />
                </div>
              </div>
              <div>
                <Label className="text-parchment-muted">Flaws</Label>
                <textarea value={flaws} onChange={e => setFlaws(e.target.value)} rows={2} className="w-full bg-charcoal-950 border border-gold-500/10 text-parchment rounded-lg px-3 py-2 text-sm focus-glow" />
              </div>
              <div>
                <Label className="text-parchment-muted">Backstory</Label>
                <textarea value={backstory} onChange={e => setBackstory(e.target.value)} rows={4} className="w-full bg-charcoal-950 border border-gold-500/10 text-parchment rounded-lg px-3 py-2 text-sm focus-glow" />
              </div>
              <div>
                <Label className="text-parchment-muted">Appearance</Label>
                <textarea value={appearance} onChange={e => setAppearance(e.target.value)} rows={3} className="w-full bg-charcoal-950 border border-gold-500/10 text-parchment rounded-lg px-3 py-2 text-sm focus-glow" />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* COMBAT TAB */}
        <TabsContent value="combat" className="space-y-6">
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <h3 className="text-lg font-serif text-parchment">Combat Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-parchment-muted">Max HP</Label>
                <Input type="number" min={1} value={maxHp} onChange={e => setMaxHp(parseInt(e.target.value) || 1)} className="bg-charcoal-950 border-gold-500/10 text-parchment text-center font-mono" />
              </div>
              <div>
                <Label className="text-parchment-muted">Armor Class</Label>
                <Input type="number" min={1} value={ac} onChange={e => setAc(parseInt(e.target.value) || 10)} className="bg-charcoal-950 border-gold-500/10 text-parchment text-center font-mono" />
              </div>
              <div>
                <Label className="text-parchment-muted">Initiative Bonus</Label>
                <Input type="number" value={initBonus} onChange={e => setInitBonus(parseInt(e.target.value) || 0)} className="bg-charcoal-950 border-gold-500/10 text-parchment text-center font-mono" />
              </div>
              <div>
                <Label className="text-parchment-muted">Speed (ft)</Label>
                <Input type="number" min={0} value={speed} onChange={e => setSpeed(parseInt(e.target.value) || 30)} className="bg-charcoal-950 border-gold-500/10 text-parchment text-center font-mono" />
              </div>
              <div>
                <Label className="text-parchment-muted">Hit Dice</Label>
                <Input value={hitDice} onChange={e => setHitDice(e.target.value)} placeholder="5d10" className="bg-charcoal-950 border-gold-500/10 text-parchment" />
              </div>
              <div>
                <Label className="text-parchment-muted">Proficiency Bonus</Label>
                <Input type="number" min={2} max={6} value={profBonus} onChange={e => setProfBonus(parseInt(e.target.value) || 2)} className="bg-charcoal-950 border-gold-500/10 text-parchment text-center font-mono" />
              </div>
            </div>
          </Card>
          
          {/* Saving Throws */}
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <h3 className="text-lg font-serif text-parchment">Saving Throw Proficiencies</h3>
            <div className="flex flex-wrap gap-2">
              {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(ability => (
                <Button
                  key={ability}
                  type="button"
                  variant={proficiencies.saving_throws.includes(ability) ? "default" : "outline"}
                  size="sm"
                  className={proficiencies.saving_throws.includes(ability) ? "bg-gold-500/20 text-gold-500 border-gold-500/30" : "text-parchment-muted border-gold-500/10"}
                  onClick={() => {
                    setProficiencies(prev => ({
                      ...prev,
                      saving_throws: prev.saving_throws.includes(ability) 
                        ? prev.saving_throws.filter(s => s !== ability) 
                        : [...prev.saving_throws, ability]
                    }))
                  }}
                >
                  {ability}
                </Button>
              ))}
            </div>
          </Card>
          
          {/* Proficiencies text fields */}
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <h3 className="text-lg font-serif text-parchment">Other Proficiencies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-parchment-muted">Armor (comma-separated)</Label>
                <Input 
                  value={proficiencies.armor_proficiencies.join(', ')} 
                  onChange={e => setProficiencies(prev => ({ ...prev, armor_proficiencies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                  placeholder="light, medium, heavy, shields"
                  className="bg-charcoal-950 border-gold-500/10 text-parchment"
                />
              </div>
              <div>
                <Label className="text-parchment-muted">Weapons (comma-separated)</Label>
                <Input 
                  value={proficiencies.weapon_proficiencies.join(', ')} 
                  onChange={e => setProficiencies(prev => ({ ...prev, weapon_proficiencies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                  placeholder="simple, martial"
                  className="bg-charcoal-950 border-gold-500/10 text-parchment"
                />
              </div>
              <div>
                <Label className="text-parchment-muted">Tools (comma-separated)</Label>
                <Input 
                  value={proficiencies.tool_proficiencies.join(', ')} 
                  onChange={e => setProficiencies(prev => ({ ...prev, tool_proficiencies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                  placeholder="Thieves' tools, Herbalism kit"
                  className="bg-charcoal-950 border-gold-500/10 text-parchment"
                />
              </div>
              <div>
                <Label className="text-parchment-muted">Languages (comma-separated)</Label>
                <Input 
                  value={proficiencies.languages.join(', ')} 
                  onChange={e => setProficiencies(prev => ({ ...prev, languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                  placeholder="Common, Elvish"
                  className="bg-charcoal-950 border-gold-500/10 text-parchment"
                />
              </div>
            </div>
          </Card>
          
          {/* Companions */}
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-parchment">Companions / Familiars</h3>
              <Button variant="outline" size="sm" onClick={addCompanion} className="gap-1 text-xs border-gold-500/10">
                <Plus className="w-3 h-3" /> Add
              </Button>
            </div>
            {companions.map((comp, i) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-6 gap-2 p-3 bg-charcoal-900/30 rounded-lg relative">
                <Input value={comp.name} onChange={e => updateCompanion(i, { name: e.target.value })} placeholder="Name" className="bg-charcoal-950 border-gold-500/10 text-parchment col-span-2" />
                <Input value={comp.type} onChange={e => updateCompanion(i, { type: e.target.value })} placeholder="Type" className="bg-charcoal-950 border-gold-500/10 text-parchment" />
                <Input type="number" value={comp.max_hp} onChange={e => updateCompanion(i, { max_hp: parseInt(e.target.value) || 1, hp: parseInt(e.target.value) || 1 })} placeholder="HP" className="bg-charcoal-950 border-gold-500/10 text-parchment" />
                <Input type="number" value={comp.ac} onChange={e => updateCompanion(i, { ac: parseInt(e.target.value) || 10 })} placeholder="AC" className="bg-charcoal-950 border-gold-500/10 text-parchment" />
                <Button variant="ghost" size="sm" onClick={() => removeCompanion(i)} className="text-red-400 h-9">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </Card>
        </TabsContent>

        {/* SPELLS TAB */}
        <TabsContent value="spells" className="space-y-6">
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <h3 className="text-lg font-serif text-parchment">Spellcasting</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-parchment-muted">Ability</Label>
                <select value={spellcasting.spellcasting_ability} onChange={e => setSpellcasting(prev => ({ ...prev, spellcasting_ability: e.target.value }))} className="w-full bg-charcoal-950 border border-gold-500/10 text-parchment rounded-lg px-3 py-2 text-sm">
                  <option value="">None</option>
                  <option value="INT">Intelligence</option>
                  <option value="WIS">Wisdom</option>
                  <option value="CHA">Charisma</option>
                </select>
              </div>
              <div>
                <Label className="text-parchment-muted">Spell Save DC</Label>
                <Input type="number" value={spellcasting.spell_save_dc} onChange={e => setSpellcasting(prev => ({ ...prev, spell_save_dc: parseInt(e.target.value) || 0 }))} className="bg-charcoal-950 border-gold-500/10 text-parchment text-center font-mono" />
              </div>
              <div>
                <Label className="text-parchment-muted">Spell Attack Bonus</Label>
                <Input type="number" value={spellcasting.spell_attack_bonus} onChange={e => setSpellcasting(prev => ({ ...prev, spell_attack_bonus: parseInt(e.target.value) || 0 }))} className="bg-charcoal-950 border-gold-500/10 text-parchment text-center font-mono" />
              </div>
            </div>
          </Card>
          
          {/* Spell Slots */}
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <h3 className="text-lg font-serif text-parchment">Spell Slots</h3>
            <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                <div key={level} className="text-center">
                  <Label className="text-parchment-muted text-xs">Lvl {level}</Label>
                  <Input 
                    type="number" 
                    min={0} 
                    max={9}
                    value={spellcasting.spell_slots[String(level)]?.max || 0} 
                    onChange={e => {
                      const max = parseInt(e.target.value) || 0
                      setSpellcasting(prev => ({
                        ...prev,
                        spell_slots: {
                          ...prev.spell_slots,
                          [String(level)]: { max, used: prev.spell_slots[String(level)]?.used || 0 }
                        }
                      }))
                    }}
                    className="bg-charcoal-950 border-gold-500/10 text-parchment text-center text-sm font-mono"
                  />
                </div>
              ))}
            </div>
          </Card>
          
          {/* Cantrips */}
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-parchment">Cantrips</h3>
              <Button variant="outline" size="sm" onClick={addCantrip} className="gap-1 text-xs border-gold-500/10">
                <Plus className="w-3 h-3" /> Add Cantrip
              </Button>
            </div>
            {spellcasting.cantrips.map((cantrip, i) => (
              <div key={i} className="p-3 bg-charcoal-900/30 rounded-lg space-y-2">
                <div className="flex gap-2">
                  <Input value={cantrip.name} onChange={e => updateCantrip(i, { name: e.target.value })} placeholder="Cantrip name" className="bg-charcoal-950 border-gold-500/10 text-parchment flex-1" />
                  <Input value={cantrip.school} onChange={e => updateCantrip(i, { school: e.target.value })} placeholder="School" className="bg-charcoal-950 border-gold-500/10 text-parchment w-32" />
                  <Button variant="ghost" size="sm" onClick={() => removeCantrip(i)} className="text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Input value={cantrip.casting_time} onChange={e => updateCantrip(i, { casting_time: e.target.value })} placeholder="Cast time" className="bg-charcoal-950 border-gold-500/10 text-parchment text-xs" />
                  <Input value={cantrip.range} onChange={e => updateCantrip(i, { range: e.target.value })} placeholder="Range" className="bg-charcoal-950 border-gold-500/10 text-parchment text-xs" />
                  <Input value={cantrip.damage || ''} onChange={e => updateCantrip(i, { damage: e.target.value })} placeholder="Damage" className="bg-charcoal-950 border-gold-500/10 text-parchment text-xs" />
                  <Input value={cantrip.duration} onChange={e => updateCantrip(i, { duration: e.target.value })} placeholder="Duration" className="bg-charcoal-950 border-gold-500/10 text-parchment text-xs" />
                </div>
                <textarea value={cantrip.description} onChange={e => updateCantrip(i, { description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-charcoal-950 border border-gold-500/10 text-parchment rounded-lg px-3 py-2 text-xs" />
              </div>
            ))}
          </Card>
          
          {/* Spells */}
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-parchment">Spells</h3>
              <Button variant="outline" size="sm" onClick={addSpell} className="gap-1 text-xs border-gold-500/10">
                <Plus className="w-3 h-3" /> Add Spell
              </Button>
            </div>
            {spellcasting.spells_known.map((spell, i) => (
              <div key={i} className="p-3 bg-charcoal-900/30 rounded-lg space-y-2">
                <div className="flex gap-2">
                  <Input value={spell.name} onChange={e => updateSpell(i, { name: e.target.value })} placeholder="Spell name" className="bg-charcoal-950 border-gold-500/10 text-parchment flex-1" />
                  <Input type="number" min={1} max={9} value={spell.level} onChange={e => updateSpell(i, { level: parseInt(e.target.value) || 1 })} className="bg-charcoal-950 border-gold-500/10 text-parchment w-16 text-center" />
                  <Input value={spell.school} onChange={e => updateSpell(i, { school: e.target.value })} placeholder="School" className="bg-charcoal-950 border-gold-500/10 text-parchment w-28" />
                  <Button variant="ghost" size="sm" onClick={() => removeSpell(i)} className="text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Input value={spell.casting_time} onChange={e => updateSpell(i, { casting_time: e.target.value })} placeholder="Cast time" className="bg-charcoal-950 border-gold-500/10 text-parchment text-xs" />
                  <Input value={spell.range} onChange={e => updateSpell(i, { range: e.target.value })} placeholder="Range" className="bg-charcoal-950 border-gold-500/10 text-parchment text-xs" />
                  <Input value={spell.damage || ''} onChange={e => updateSpell(i, { damage: e.target.value })} placeholder="Damage" className="bg-charcoal-950 border-gold-500/10 text-parchment text-xs" />
                  <Input value={spell.duration} onChange={e => updateSpell(i, { duration: e.target.value })} placeholder="Duration" className="bg-charcoal-950 border-gold-500/10 text-parchment text-xs" />
                </div>
                <textarea value={spell.description} onChange={e => updateSpell(i, { description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-charcoal-950 border border-gold-500/10 text-parchment rounded-lg px-3 py-2 text-xs" />
                <div className="flex gap-3 text-xs">
                  <label className="flex items-center gap-1 text-parchment-muted">
                    <input type="checkbox" checked={spell.prepared} onChange={e => updateSpell(i, { prepared: e.target.checked })} />
                    Prepared
                  </label>
                  <label className="flex items-center gap-1 text-parchment-muted">
                    <input type="checkbox" checked={spell.concentration} onChange={e => updateSpell(i, { concentration: e.target.checked })} />
                    Concentration
                  </label>
                  <label className="flex items-center gap-1 text-parchment-muted">
                    <input type="checkbox" checked={spell.ritual} onChange={e => updateSpell(i, { ritual: e.target.checked })} />
                    Ritual
                  </label>
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>

        {/* FEATURES TAB */}
        <TabsContent value="features" className="space-y-6">
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-parchment">Features & Traits</h3>
              <Button variant="outline" size="sm" onClick={addFeature} className="gap-1 text-xs border-gold-500/10">
                <Plus className="w-3 h-3" /> Add Feature
              </Button>
            </div>
            {features.map((feature, i) => (
              <div key={i} className="p-3 bg-charcoal-900/30 rounded-lg space-y-2">
                <div className="flex gap-2">
                  <Input value={feature.name} onChange={e => updateFeature(i, { name: e.target.value })} placeholder="Feature name" className="bg-charcoal-950 border-gold-500/10 text-parchment flex-1" />
                  <Input value={feature.source} onChange={e => updateFeature(i, { source: e.target.value })} placeholder="Source" className="bg-charcoal-950 border-gold-500/10 text-parchment w-28" />
                  <Button variant="ghost" size="sm" onClick={() => removeFeature(i)} className="text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <textarea value={feature.description} onChange={e => updateFeature(i, { description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-charcoal-950 border border-gold-500/10 text-parchment rounded-lg px-3 py-2 text-xs" />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-parchment-muted text-xs">Max Uses (0 = unlimited)</Label>
                    <Input type="number" min={0} value={feature.uses_max || 0} onChange={e => updateFeature(i, { uses_max: parseInt(e.target.value) || 0, uses_remaining: parseInt(e.target.value) || 0 })} className="bg-charcoal-950 border-gold-500/10 text-parchment text-xs" />
                  </div>
                  <div>
                    <Label className="text-parchment-muted text-xs">Recharge</Label>
                    <select value={feature.recharge || 'none'} onChange={e => updateFeature(i, { recharge: e.target.value as FeatureEntry['recharge'] })} className="w-full bg-charcoal-950 border border-gold-500/10 text-parchment rounded-lg px-3 py-2 text-xs">
                      <option value="none">None</option>
                      <option value="short_rest">Short Rest</option>
                      <option value="long_rest">Long Rest</option>
                      <option value="dawn">Dawn</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {features.length === 0 && (
              <p className="text-sm text-parchment-muted text-center py-4">No features added yet.</p>
            )}
          </Card>
        </TabsContent>

        {/* GEAR TAB */}
        <TabsContent value="gear" className="space-y-6">
          {/* Weapons */}
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-parchment">Weapons</h3>
              <Button variant="outline" size="sm" onClick={addWeapon} className="gap-1 text-xs border-gold-500/10">
                <Plus className="w-3 h-3" /> Add Weapon
              </Button>
            </div>
            {inventory.weapons.map((weapon, i) => (
              <div key={i} className="p-3 bg-charcoal-900/30 rounded-lg space-y-2">
                <div className="flex gap-2">
                  <Input value={weapon.name} onChange={e => updateWeapon(i, { name: e.target.value })} placeholder="Weapon name" className="bg-charcoal-950 border-gold-500/10 text-parchment flex-1" />
                  <Button variant="ghost" size="sm" onClick={() => removeWeapon(i)} className="text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input type="number" value={weapon.attack_bonus} onChange={e => updateWeapon(i, { attack_bonus: parseInt(e.target.value) || 0 })} placeholder="Atk bonus" className="bg-charcoal-950 border-gold-500/10 text-parchment text-xs" />
                  <Input value={weapon.damage} onChange={e => updateWeapon(i, { damage: e.target.value })} placeholder="1d8+4 slashing" className="bg-charcoal-950 border-gold-500/10 text-parchment text-xs" />
                  <Input value={weapon.properties.join(', ')} onChange={e => updateWeapon(i, { properties: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Properties" className="bg-charcoal-950 border-gold-500/10 text-parchment text-xs" />
                </div>
                <label className="flex items-center gap-1 text-xs text-parchment-muted">
                  <input type="checkbox" checked={weapon.equipped} onChange={e => updateWeapon(i, { equipped: e.target.checked })} />
                  Equipped
                </label>
              </div>
            ))}
          </Card>
          
          {/* Armor */}
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <h3 className="text-lg font-serif text-parchment">Armor</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Input 
                value={inventory.armor?.name || ''} 
                onChange={e => setInventory(prev => ({ ...prev, armor: { name: e.target.value, ac: prev.armor?.ac || 10, type: prev.armor?.type || 'medium', equipped: true } }))}
                placeholder="Armor name" className="bg-charcoal-950 border-gold-500/10 text-parchment" />
              <Input 
                type="number"
                value={inventory.armor?.ac || 10} 
                onChange={e => setInventory(prev => ({ ...prev, armor: { ...prev.armor!, ac: parseInt(e.target.value) || 10 } }))}
                placeholder="AC" className="bg-charcoal-950 border-gold-500/10 text-parchment text-center font-mono" />
              <select 
                value={inventory.armor?.type || 'medium'}
                onChange={e => setInventory(prev => ({ ...prev, armor: { ...prev.armor!, type: e.target.value } }))}
                className="bg-charcoal-950 border border-gold-500/10 text-parchment rounded-lg px-3 py-2 text-sm">
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
          </Card>

          {/* Currency */}
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <h3 className="text-lg font-serif text-parchment">Currency</h3>
            <div className="grid grid-cols-5 gap-2">
              {[
                { key: 'cp', label: 'CP' },
                { key: 'sp', label: 'SP' },
                { key: 'ep', label: 'EP' },
                { key: 'gp', label: 'GP' },
                { key: 'pp', label: 'PP' },
              ].map(({ key, label }) => (
                <div key={key} className="text-center">
                  <Label className="text-parchment-muted text-xs">{label}</Label>
                  <Input 
                    type="number" min={0}
                    value={(inventory.currency as unknown as Record<string, number>)[key] || 0}
                    onChange={e => setInventory(prev => ({
                      ...prev,
                      currency: { ...prev.currency, [key]: parseInt(e.target.value) || 0 }
                    }))}
                    className="bg-charcoal-950 border-gold-500/10 text-parchment text-center font-mono"
                  />
                </div>
              ))}
            </div>
          </Card>
          
          {/* Items */}
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-parchment">Inventory Items</h3>
              <Button variant="outline" size="sm" onClick={addItem} className="gap-1 text-xs border-gold-500/10">
                <Plus className="w-3 h-3" /> Add Item
              </Button>
            </div>
            {inventory.items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input value={item.name} onChange={e => updateItem(i, { name: e.target.value })} placeholder="Item name" className="bg-charcoal-950 border-gold-500/10 text-parchment flex-1" />
                <Input type="number" min={1} value={item.quantity} onChange={e => updateItem(i, { quantity: parseInt(e.target.value) || 1 })} className="bg-charcoal-950 border-gold-500/10 text-parchment w-16 text-center" />
                <Input type="number" min={0} value={item.weight || 0} onChange={e => updateItem(i, { weight: parseFloat(e.target.value) || 0 })} placeholder="lb" className="bg-charcoal-950 border-gold-500/10 text-parchment w-16 text-center" />
                <label className="flex items-center gap-1 text-xs text-parchment-muted whitespace-nowrap">
                  <input type="checkbox" checked={item.magical || false} onChange={e => updateItem(i, { magical: e.target.checked })} />
                  Magic
                </label>
                <Button variant="ghost" size="sm" onClick={() => removeItem(i)} className="text-red-400">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </Card>
          
          {/* Attunement */}
          <Card className="p-4 md:p-6 bg-charcoal-950/50 border-gold-500/10 space-y-4">
            <h3 className="text-lg font-serif text-parchment">Attuned Items (max 3)</h3>
            <Input 
              value={inventory.attunement.join(', ')} 
              onChange={e => setInventory(prev => ({
                ...prev,
                attunement: e.target.value.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)
              }))}
              placeholder="Item 1, Item 2, Item 3"
              className="bg-charcoal-950 border-gold-500/10 text-parchment"
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Save Button (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass md:hidden z-30">
        <Button onClick={handleSubmit} disabled={isPending || !name.trim()} className="w-full btn-fantasy gap-2">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditing ? 'Save Changes' : 'Create Character'}
        </Button>
      </div>
    </div>
  )
}
