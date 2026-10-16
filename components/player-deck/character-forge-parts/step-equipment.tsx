'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Swords, Shield, Sparkles, Backpack, Plus, Minus, X } from 'lucide-react'
import type { WeaponEntry } from '@/types/player-character'
import {
  WEAPONS as DND_WEAPONS,
  ARMOR as DND_ARMOR,
  EQUIPMENT_PACKS as DND_EQUIPMENT_PACKS,
} from '@/lib/data'
import type { ForgeItem } from './types'

// Collect all unique item names from equipment packs for the items dropdown
const ALL_GEAR_ITEMS = Array.from(new Set(
  Object.values(DND_EQUIPMENT_PACKS).flatMap(p => p.items)
)).sort().concat([
  'Arcane Focus', 'Component Pouch', 'Druidic Focus', 'Holy Symbol',
  'Spellbook', "Thieves' Tools", 'Healer\'s Kit', 'Poisoner\'s Kit',
  'Herbalism Kit', 'Navigator\'s Tools', 'Disguise Kit', 'Forgery Kit',
  'Gaming Set', 'Musical Instrument', 'Smith\'s Tools', 'Brewer\'s Supplies',
  'Calligrapher\'s Supplies', 'Carpenter\'s Tools', 'Cartographer\'s Tools',
  'Cobbler\'s Tools', 'Cook\'s Utensils', 'Glassblower\'s Tools',
  'Jeweler\'s Tools', 'Leatherworker\'s Tools', 'Mason\'s Tools',
  'Painter\'s Supplies', 'Potter\'s Tools', 'Tinker\'s Tools',
  'Weaver\'s Tools', 'Woodcarver\'s Tools',
  'Arrows (20)', 'Crossbow Bolts (20)', 'Sling Bullets (20)',
  'Blowgun Needles (50)', 'Torch', 'Rope, Hempen (50 ft)',
  'Rope, Silk (50 ft)', 'Chain (10 ft)', 'Grappling Hook',
  'Manacles', 'Mirror, Steel', 'Oil Flask', 'Potion of Healing',
  'Rations (1 day)', 'Waterskin', 'Bedroll', 'Tent',
  'Lamp', 'Lantern, Hooded', 'Lantern, Bullseye', 'Candle',
  'Tinderbox', 'Holy Water', 'Alchemist\'s Fire', 'Acid Vial',
  'Antitoxin', 'Ball Bearings (bag of 1000)', 'Caltrops (bag of 20)',
  'Climber\'s Kit', 'Crowbar', 'Hammer', 'Piton',
  'Shovel', 'Mess Kit', 'Backpack', 'Chest',
  'Quiver', 'Spyglass', 'Signet Ring',
]).sort()

export function StepEquipment({
  weapons, setWeapons, armorName, setArmorName, setArmorAC,
  shieldEquipped, setShieldEquipped, startingGold, setStartingGold,
  items, setItems,
}: {
  weapons: WeaponEntry[]; setWeapons: (v: WeaponEntry[]) => void
  armorName: string; setArmorName: (v: string) => void
  setArmorAC: (v: number) => void
  shieldEquipped: boolean; setShieldEquipped: (v: boolean) => void
  startingGold: number; setStartingGold: (v: number) => void
  items: ForgeItem[]; setItems: (v: ForgeItem[]) => void
}) {
  function selectWeapon(weaponName: string) {
    const wpn = DND_WEAPONS.find(w => w.name === weaponName)
    if (!wpn) return
    setWeapons([...weapons, {
      name: wpn.name,
      attack_bonus: 0,
      damage: wpn.damage,
      properties: wpn.properties,
      equipped: true,
    }])
  }
  function removeWeapon(i: number) {
    setWeapons(weapons.filter((_, j) => j !== i))
  }
  function selectArmor(armorNameVal: string) {
    const arm = DND_ARMOR.find(a => a.name === armorNameVal)
    if (!arm) {
      setArmorName('')
      setArmorAC(10)
      return
    }
    setArmorName(arm.name)
    // For numeric AC, use directly; for string formula, extract first number
    if (typeof arm.ac === 'number') {
      setArmorAC(arm.ac)
    } else {
      const match = arm.ac.match(/(\d+)/)
      setArmorAC(match ? parseInt(match[1]) : 10)
    }
  }
  function addItem(itemName: string) {
    if (!itemName) return
    const existing = items.findIndex(it => it.name === itemName)
    if (existing >= 0) {
      const next = [...items]
      next[existing] = { ...next[existing], quantity: next[existing].quantity + 1 }
      setItems(next)
    } else {
      setItems([...items, { name: itemName, quantity: 1 }])
    }
  }
  function removeItem(i: number) {
    setItems(items.filter((_, j) => j !== i))
  }

  // D&D Beyond-style starter packs (unchanged)
  const EQUIPMENT_PACKS: Record<string, {
    label: string; weapons: WeaponEntry[]; armor: string; armorAC: number;
    shield: boolean; gold: number; items: { name: string; quantity: number }[]
  }> = {
    fighter_melee: {
      label: '⚔️ Fighter (Melee)',
      weapons: [
        { name: 'Longsword', attack_bonus: 0, damage: '1d8', properties: ['Versatile (1d10)'], equipped: true },
        { name: 'Handaxe', attack_bonus: 0, damage: '1d6', properties: ['Light', 'Thrown (20/60)'], equipped: true },
      ],
      armor: 'Chain Mail', armorAC: 16, shield: true, gold: 10,
      items: [{ name: 'Explorer\'s Pack', quantity: 1 }, { name: 'Javelin', quantity: 4 }],
    },
    fighter_ranged: {
      label: '🏹 Fighter (Ranged)',
      weapons: [
        { name: 'Longbow', attack_bonus: 0, damage: '1d8', properties: ['Ammunition (150/600)', 'Heavy', 'Two-Handed'], equipped: true },
        { name: 'Shortsword', attack_bonus: 0, damage: '1d6', properties: ['Finesse', 'Light'], equipped: true },
      ],
      armor: 'Leather', armorAC: 11, shield: false, gold: 10,
      items: [{ name: 'Explorer\'s Pack', quantity: 1 }, { name: 'Arrows (20)', quantity: 1 }],
    },
    rogue: {
      label: '🗡️ Rogue',
      weapons: [
        { name: 'Rapier', attack_bonus: 0, damage: '1d8', properties: ['Finesse'], equipped: true },
        { name: 'Shortbow', attack_bonus: 0, damage: '1d6', properties: ['Ammunition (80/320)', 'Two-Handed'], equipped: true },
        { name: 'Dagger', attack_bonus: 0, damage: '1d4', properties: ['Finesse', 'Light', 'Thrown (20/60)'], equipped: true },
      ],
      armor: 'Leather', armorAC: 11, shield: false, gold: 15,
      items: [{ name: 'Burglar\'s Pack', quantity: 1 }, { name: "Thieves' Tools", quantity: 1 }, { name: 'Arrows (20)', quantity: 1 }],
    },
    wizard: {
      label: '🔮 Wizard',
      weapons: [
        { name: 'Quarterstaff', attack_bonus: 0, damage: '1d6', properties: ['Versatile (1d8)'], equipped: true },
      ],
      armor: 'None', armorAC: 10, shield: false, gold: 10,
      items: [{ name: 'Scholar\'s Pack', quantity: 1 }, { name: 'Spellbook', quantity: 1 }, { name: 'Component Pouch', quantity: 1 }, { name: 'Arcane Focus', quantity: 1 }],
    },
    cleric: {
      label: '✝️ Cleric',
      weapons: [
        { name: 'Mace', attack_bonus: 0, damage: '1d6', properties: [], equipped: true },
        { name: 'Light Crossbow', attack_bonus: 0, damage: '1d8', properties: ['Ammunition (80/320)', 'Loading', 'Two-Handed'], equipped: true },
      ],
      armor: 'Scale Mail', armorAC: 14, shield: true, gold: 10,
      items: [{ name: 'Priest\'s Pack', quantity: 1 }, { name: 'Holy Symbol', quantity: 1 }, { name: 'Crossbow Bolts (20)', quantity: 1 }],
    },
    ranger: {
      label: '🌿 Ranger',
      weapons: [
        { name: 'Longbow', attack_bonus: 0, damage: '1d8', properties: ['Ammunition (150/600)', 'Heavy', 'Two-Handed'], equipped: true },
        { name: 'Shortsword', attack_bonus: 0, damage: '1d6', properties: ['Finesse', 'Light'], equipped: true },
        { name: 'Shortsword', attack_bonus: 0, damage: '1d6', properties: ['Finesse', 'Light'], equipped: true },
      ],
      armor: 'Scale Mail', armorAC: 14, shield: false, gold: 10,
      items: [{ name: 'Explorer\'s Pack', quantity: 1 }, { name: 'Arrows (20)', quantity: 1 }],
    },
    barbarian: {
      label: '🪓 Barbarian',
      weapons: [
        { name: 'Greataxe', attack_bonus: 0, damage: '1d12', properties: ['Heavy', 'Two-Handed'], equipped: true },
        { name: 'Javelin', attack_bonus: 0, damage: '1d6', properties: ['Thrown (30/120)'], equipped: true },
      ],
      armor: 'None (Unarmored Defense)', armorAC: 10, shield: false, gold: 10,
      items: [{ name: 'Explorer\'s Pack', quantity: 1 }, { name: 'Javelin', quantity: 4 }],
    },
    bard: {
      label: '🎵 Bard',
      weapons: [
        { name: 'Rapier', attack_bonus: 0, damage: '1d8', properties: ['Finesse'], equipped: true },
        { name: 'Dagger', attack_bonus: 0, damage: '1d4', properties: ['Finesse', 'Light', 'Thrown (20/60)'], equipped: true },
      ],
      armor: 'Leather', armorAC: 11, shield: false, gold: 15,
      items: [{ name: 'Entertainer\'s Pack', quantity: 1 }, { name: 'Musical Instrument', quantity: 1 }],
    },
    paladin: {
      label: '⚜️ Paladin',
      weapons: [
        { name: 'Longsword', attack_bonus: 0, damage: '1d8', properties: ['Versatile (1d10)'], equipped: true },
        { name: 'Javelin', attack_bonus: 0, damage: '1d6', properties: ['Thrown (30/120)'], equipped: true },
      ],
      armor: 'Chain Mail', armorAC: 16, shield: true, gold: 10,
      items: [{ name: 'Priest\'s Pack', quantity: 1 }, { name: 'Holy Symbol', quantity: 1 }, { name: 'Javelin', quantity: 5 }],
    },
  }

  function applyPack(packKey: string) {
    const pack = EQUIPMENT_PACKS[packKey]
    if (!pack) return
    setWeapons(pack.weapons)
    setArmorName(pack.armor)
    setArmorAC(pack.armorAC)
    setShieldEquipped(pack.shield)
    setStartingGold(pack.gold)
    setItems(pack.items)
  }

  const weaponCategories = ['Simple Melee', 'Simple Ranged', 'Martial Melee', 'Martial Ranged'] as const
  const armorTypes = ['Light', 'Medium', 'Heavy'] as const

  return (
    <div className="space-y-6">
      {/* Quick-start equipment packs */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-3">
        <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Quick Start Packs
        </h3>
        <p className="text-xs text-parchment-muted">
          Choose a pack to auto-fill. You can customise everything after.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(EQUIPMENT_PACKS).map(([key, pack]) => (
            <button
              key={key}
              onClick={() => applyPack(key)}
              className="p-3 rounded-lg border border-gold-500/10 bg-charcoal-900/50 hover:border-gold-500/30 hover:bg-gold-500/5 transition-all text-left"
            >
              <span className="text-sm text-parchment">{pack.label}</span>
              <div className="text-[10px] text-parchment-muted mt-0.5">
                {pack.weapons.map(w => w.name).join(', ')}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Weapons — dropdown selector */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
            <Swords className="w-4 h-4" /> Weapons
          </h3>
        </div>
        <div>
          <Label className="text-parchment-muted text-xs">Add Weapon</Label>
          <select
            value=""
            onChange={e => { if (e.target.value) selectWeapon(e.target.value) }}
            className="w-full h-10 mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm px-3"
          >
            <option value="">Select a weapon...</option>
            {weaponCategories.map(cat => (
              <optgroup key={cat} label={cat}>
                {DND_WEAPONS.filter(w => w.category === cat).map(w => (
                  <option key={w.name} value={w.name}>
                    {w.name} — {w.damage} {w.damageType} ({w.cost})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {weapons.length === 0 && (
          <p className="text-sm text-parchment-muted italic">No weapons added. Select from the dropdown above.</p>
        )}
        {weapons.map((w, i) => {
          const wpnData = DND_WEAPONS.find(dw => dw.name === w.name)
          return (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-charcoal-900/50 border border-gold-500/10">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-parchment font-medium">{w.name}</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-xs text-red-300 font-mono">{w.damage} {wpnData?.damageType || ''}</span>
                  {w.properties.map((p, pi) => (
                    <Badge key={pi} variant="outline" className="border-gold-500/15 text-parchment-muted text-[10px]">{p}</Badge>
                  ))}
                  {wpnData && <span className="text-[10px] text-parchment-muted/50">{wpnData.cost} · {wpnData.weight} lb</span>}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeWeapon(i)} className="text-red-400 h-8 w-8 p-0 shrink-0">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )
        })}
      </Card>

      {/* Armor — dropdown selector */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-4">
        <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Armor & Defense
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label className="text-parchment-muted text-xs">Armor</Label>
            <select
              value={armorName}
              onChange={e => selectArmor(e.target.value)}
              className="w-full h-10 mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm px-3"
            >
              <option value="">None (AC 10 + DEX)</option>
              {armorTypes.map(type => (
                <optgroup key={type} label={`${type} Armor`}>
                  {DND_ARMOR.filter(a => a.type === type).map(a => (
                    <option key={a.name} value={a.name}>
                      {a.name} — AC {a.ac}{a.stealthDisadv ? ' (Stealth Disadv.)' : ''} ({a.cost})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {armorName && (() => {
              const arm = DND_ARMOR.find(a => a.name === armorName)
              return arm ? (
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <Badge variant="outline" className="border-blue-500/20 text-blue-300">AC {arm.ac}</Badge>
                  <Badge variant="outline" className="border-gold-500/15 text-parchment-muted">{arm.type}</Badge>
                  {arm.minStr && <Badge variant="outline" className="border-red-500/20 text-red-300">STR {arm.minStr}+</Badge>}
                  {arm.stealthDisadv && <Badge variant="outline" className="border-amber-500/20 text-amber-300">Stealth Disadv.</Badge>}
                  <span className="text-parchment-muted/50">{arm.cost} · {arm.weight} lb</span>
                </div>
              ) : null
            })()}
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShieldEquipped(!shieldEquipped)}
              className={`w-full h-10 flex items-center justify-center gap-2 rounded-md border transition-all ${
                shieldEquipped
                  ? 'border-gold-500/50 bg-gold-500/15 text-gold-500'
                  : 'border-gold-500/10 bg-charcoal-950 text-parchment-muted'
              }`}
            >
              <Shield className="w-4 h-4" />
              Shield (+2 AC)
            </button>
          </div>
        </div>
      </Card>

      {/* Gear & Gold — dropdown selector */}
      <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
            <Backpack className="w-4 h-4" /> Gear & Gold
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-parchment-muted text-xs">Add Equipment Pack</Label>
            <select
              value=""
              onChange={e => {
                if (!e.target.value) return
                const pack = DND_EQUIPMENT_PACKS[e.target.value]
                if (pack) {
                  const newItems = pack.items.map(name => ({ name, quantity: 1 }))
                  setItems([...items, ...newItems])
                }
              }}
              className="w-full h-10 mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm px-3"
            >
              <option value="">Select a pack...</option>
              {Object.entries(DND_EQUIPMENT_PACKS).map(([key, pack]) => (
                <option key={key} value={key}>{pack.name} ({pack.items.length} items)</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-parchment-muted text-xs">Add Individual Item</Label>
            <select
              value=""
              onChange={e => { if (e.target.value) addItem(e.target.value) }}
              className="w-full h-10 mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm px-3"
            >
              <option value="">Select an item...</option>
              {ALL_GEAR_ITEMS.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="w-32">
          <Label className="text-parchment-muted text-xs">Starting Gold (GP)</Label>
          <Input
            type="number" min={0}
            value={startingGold}
            onChange={e => setStartingGold(parseInt(e.target.value) || 0)}
            className="mt-1 bg-charcoal-950 border-gold-500/10 text-parchment text-center font-mono"
          />
        </div>
        {items.length > 0 && (
          <div className="space-y-1">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-charcoal-900/40 border border-gold-500/5">
                <span className="flex-1 text-sm text-parchment">{item.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const next = [...items]
                      next[i] = { ...next[i], quantity: Math.max(1, next[i].quantity - 1) }
                      setItems(next)
                    }}
                    className="w-6 h-6 flex items-center justify-center text-parchment-muted hover:text-parchment rounded"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs text-parchment font-mono w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => {
                      const next = [...items]
                      next[i] = { ...next[i], quantity: next[i].quantity + 1 }
                      setItems(next)
                    }}
                    className="w-6 h-6 flex items-center justify-center text-parchment-muted hover:text-parchment rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeItem(i)} className="text-red-400 h-7 w-7 p-0">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
