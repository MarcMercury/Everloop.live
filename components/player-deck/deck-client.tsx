'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plus, Swords, Heart, Shield, Sparkles, Star,
  Scroll, Flame, Crown, Users, Search, LayoutGrid,
  List, SlidersHorizontal, ArrowUpDown, Filter,
  Zap, Wind, Target, Eye, X
} from 'lucide-react'
import type { PlayerCharacter } from '@/types/player-character'
import {
  abilityModifier, formatModifier, hpPercentage, CLASS_COLORS, DND_CLASSES
} from '@/types/player-character'

type SortKey = 'name' | 'level' | 'updated' | 'class' | 'hp'
type ViewMode = 'grid' | 'list'

export function DeckClient({ characters }: { characters: PlayerCharacter[] }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('updated')
  const [sortAsc, setSortAsc] = useState(false)
  const [filterClass, setFilterClass] = useState<string>('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'retired'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const classesUsed = useMemo(() =>
    [...new Set(characters.map(c => c.class))].sort(),
    [characters]
  )

  const filtered = useMemo(() => {
    let list = [...characters]

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.race.toLowerCase().includes(q) ||
        c.class.toLowerCase().includes(q) ||
        (c.subclass?.toLowerCase().includes(q)) ||
        (c.campaign_name?.toLowerCase().includes(q))
      )
    }

    // Class filter
    if (filterClass) {
      list = list.filter(c => c.class === filterClass)
    }

    // Active filter
    if (filterActive === 'active') list = list.filter(c => c.is_active)
    if (filterActive === 'retired') list = list.filter(c => !c.is_active)

    // Sort
    list.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'level': cmp = a.level - b.level; break
        case 'updated': cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(); break
        case 'class': cmp = a.class.localeCompare(b.class); break
        case 'hp': cmp = hpPercentage(a.current_hp, a.max_hp) - hpPercentage(b.current_hp, b.max_hp); break
      }
      return sortAsc ? cmp : -cmp
    })

    return list
  }, [characters, search, sortBy, sortAsc, filterClass, filterActive])

  const activeCount = characters.filter(c => c.is_active).length
  const retiredCount = characters.filter(c => !c.is_active).length
  const hasFilters = !!search || !!filterClass || filterActive !== 'all'

  function toggleSort(key: SortKey) {
    if (sortBy === key) setSortAsc(!sortAsc)
    else { setSortBy(key); setSortAsc(false) }
  }

  function clearFilters() {
    setSearch('')
    setFilterClass('')
    setFilterActive('all')
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-parchment mb-1 flex items-center gap-3">
              <Swords className="w-8 h-8 text-gold-500" />
              Player <span className="canon-text">Deck</span>
            </h1>
            <p className="text-parchment-muted text-sm">
              {characters.length} character{characters.length !== 1 ? 's' : ''} —
              {' '}{activeCount} active, {retiredCount} retired
            </p>
          </div>
          <Link href="/player-deck/create">
            <Button className="gap-2 btn-fantasy text-sm md:text-base">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Forge New Character</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        </div>

        {/* Party Summary Banner */}
        {activeCount > 0 && <PartyBanner characters={characters.filter(c => c.is_active)} />}

        {/* Search + Filter Bar */}
        {characters.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-muted" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search characters..."
                  className="pl-9 bg-charcoal-950/50 border-gold-500/10 text-parchment placeholder:text-parchment-muted/40"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment-muted hover:text-parchment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter toggle */}
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                className={`gap-1.5 ${showFilters ? 'bg-gold-500/20 text-gold-500 border-gold-500/40' : 'border-gold-500/10 text-parchment-muted'}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Filters</span>
                {hasFilters && (
                  <span className="w-2 h-2 rounded-full bg-gold-500" />
                )}
              </Button>

              {/* View toggle */}
              <div className="flex border border-gold-500/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-gold-500/20 text-gold-500' : 'text-parchment-muted hover:text-parchment'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-gold-500/20 text-gold-500' : 'text-parchment-muted hover:text-parchment'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <Card className="p-4 bg-charcoal-950/50 border-gold-500/10 animate-slide-up">
                <div className="flex flex-wrap items-end gap-4">
                  {/* Class filter */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-parchment-muted uppercase tracking-wider">Class</label>
                    <select
                      value={filterClass}
                      onChange={e => setFilterClass(e.target.value)}
                      className="h-9 px-3 bg-charcoal-900 border border-gold-500/10 rounded-md text-parchment text-sm"
                    >
                      <option value="">All Classes</option>
                      {classesUsed.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Active filter */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-parchment-muted uppercase tracking-wider">Status</label>
                    <div className="flex gap-1">
                      {(['all', 'active', 'retired'] as const).map(v => (
                        <button
                          key={v}
                          onClick={() => setFilterActive(v)}
                          className={`px-3 h-9 rounded-md text-xs capitalize transition-colors ${
                            filterActive === v
                              ? 'bg-gold-500/20 text-gold-500 border border-gold-500/40'
                              : 'border border-gold-500/10 text-parchment-muted hover:text-parchment'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-parchment-muted uppercase tracking-wider">Sort by</label>
                    <div className="flex gap-1">
                      {([
                        { key: 'updated' as const, label: 'Recent' },
                        { key: 'name' as const, label: 'Name' },
                        { key: 'level' as const, label: 'Level' },
                        { key: 'class' as const, label: 'Class' },
                        { key: 'hp' as const, label: 'HP %' },
                      ]).map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => toggleSort(key)}
                          className={`px-3 h-9 rounded-md text-xs transition-colors flex items-center gap-1 ${
                            sortBy === key
                              ? 'bg-gold-500/20 text-gold-500 border border-gold-500/40'
                              : 'border border-gold-500/10 text-parchment-muted hover:text-parchment'
                          }`}
                        >
                          {label}
                          {sortBy === key && (
                            <ArrowUpDown className="w-3 h-3" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear */}
                  {hasFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-parchment-muted hover:text-parchment"
                      onClick={clearFilters}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Results */}
        {filtered.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map(char => (
                <CharacterTile key={char.id} character={char} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(char => (
                <CharacterRow key={char.id} character={char} />
              ))}
            </div>
          )
        ) : characters.length > 0 ? (
          /* No results from filter */
          <div className="flex flex-col items-center py-16 text-center">
            <Search className="w-10 h-10 text-parchment-muted/30 mb-4" />
            <h3 className="text-lg font-serif text-parchment mb-1">No matches</h3>
            <p className="text-sm text-parchment-muted mb-4">Try adjusting your search or filters.</p>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gold-500">
              Clear filters
            </Button>
          </div>
        ) : (
          /* Empty state — no characters at all */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-teal-rich border border-gold-500/20 flex items-center justify-center mb-6 canon-glow">
              <Swords className="w-12 h-12 text-gold-500" />
            </div>
            <h2 className="text-2xl font-serif text-parchment mb-3">
              Your Deck Awaits
            </h2>
            <p className="text-parchment-muted max-w-md mb-4">
              Create your first character and prepare for adventure. Track stats, spells, inventory, and get AI-powered tactical advice during live play.
            </p>
            <div className="flex flex-col items-center gap-3">
              <Link href="/player-deck/create">
                <Button className="btn-fantasy gap-2 text-lg px-8 py-6">
                  <Flame className="w-5 h-5" />
                  Forge Your First Character
                </Button>
              </Link>
              <p className="text-xs text-parchment-muted/50 max-w-sm">
                Step-by-step guided builder — choose race, class, abilities, and equipment with helpful tooltips at every step.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Party Banner ────────────────────────────────────────

function PartyBanner({ characters }: { characters: PlayerCharacter[] }) {
  const totalHp = characters.reduce((s, c) => s + c.current_hp, 0)
  const totalMaxHp = characters.reduce((s, c) => s + c.max_hp, 0)
  const avgLevel = Math.round(characters.reduce((s, c) => s + c.level, 0) / characters.length)
  const partyHpPct = totalMaxHp > 0 ? Math.round((totalHp / totalMaxHp) * 100) : 100
  const totalSlots = characters.reduce((s, c) => s + getSpellSlotsRemaining(c), 0)
  const hasWounded = characters.some(c => hpPercentage(c.current_hp, c.max_hp) < 50)
  const campaigns = [...new Set(characters.map(c => c.campaign_name).filter(Boolean))]

  return (
    <Card className="mb-6 p-4 md:p-5 bg-teal-rich/60 border-gold-500/15">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-gold-500" />
          <div>
            <h3 className="text-sm font-serif text-parchment">Party Overview</h3>
            {campaigns.length > 0 && (
              <p className="text-[10px] text-parchment-muted">{campaigns.join(' • ')}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6 text-center">
          <PartyBannerStat label="Members" value={String(characters.length)} />
          <PartyBannerStat label="Avg Level" value={String(avgLevel)} />
          <div>
            <div className="text-[10px] text-parchment-muted uppercase">Party HP</div>
            <div className={`text-lg font-mono font-bold ${partyHpPct > 50 ? 'text-emerald-400' : partyHpPct > 25 ? 'text-amber-400' : 'text-red-400'}`}>
              {partyHpPct}%
            </div>
          </div>
          <PartyBannerStat label="Spell Slots" value={String(totalSlots)} color="text-blue-400" />
          {hasWounded && (
            <Badge variant="outline" className="border-red-500/30 text-red-400 text-[10px]">
              <Heart className="w-3 h-3 mr-1" /> Wounded
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}

function PartyBannerStat({ label, value, color = 'text-parchment' }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-[10px] text-parchment-muted uppercase">{label}</div>
      <div className={`text-lg font-mono font-bold ${color}`}>{value}</div>
    </div>
  )
}

// ── Character Tile (Grid View) ──────────────────────────

function CharacterTile({ character }: { character: PlayerCharacter }) {
  const hp = hpPercentage(character.current_hp, character.max_hp)
  const classColor = CLASS_COLORS[character.class] || '#d4a84b'
  const hasConditions = character.status?.conditions?.length > 0
  const isConcentrating = !!character.status?.concentration_spell
  const hasInspiration = character.status?.inspiration

  return (
    <Link href={`/player-deck/${character.id}`}>
      <Card className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border-gold-500/10 hover:border-gold-500/30 bg-gradient-to-b from-teal-rich/80 to-charcoal-900/80 character-tile">
        {/* Class color accent */}
        <div className="absolute top-0 left-0 right-0 h-1 opacity-80 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: classColor }} />

        {/* Portrait */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {character.portrait_url ? (
            <img
              src={character.portrait_url}
              alt={character.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${classColor}20, ${classColor}05)` }}
            >
              <span className="text-5xl md:text-6xl font-serif opacity-30" style={{ color: classColor }}>
                {character.name.charAt(0)}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-transparent to-transparent" />

          {/* Level badge */}
          <div
            className="absolute top-2 right-2 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold border-2"
            style={{ backgroundColor: `${classColor}30`, borderColor: `${classColor}60`, color: classColor }}
          >
            {character.level}
          </div>

          {/* Status indicators */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasInspiration && (
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              </div>
            )}
            {isConcentrating && (
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-blue-400" />
              </div>
            )}
            {hasConditions && (
              <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-400 text-xs">!</span>
              </div>
            )}
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
            <h3 className="text-base md:text-lg font-serif text-parchment font-bold truncate">
              {character.name}
            </h3>
            <p className="text-xs md:text-sm text-parchment-muted truncate">
              {character.race} {character.class}
              {character.subclass ? ` • ${character.subclass}` : ''}
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="p-3 md:p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <div className="flex-1 h-2 bg-charcoal-950 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${hp > 50 ? 'bg-emerald-500' : hp > 25 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${hp}%` }}
              />
            </div>
            <span className="text-xs text-parchment-muted font-mono min-w-[3rem] text-right">
              {character.current_hp}/{character.max_hp}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-parchment-muted">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" /> AC {character.armor_class}
            </span>
            <span className="flex items-center gap-1">
              <Scroll className="w-3 h-3" /> {getSpellSlotsRemaining(character)} slots
            </span>
            <span>Init {formatModifier(character.initiative_bonus)}</span>
          </div>

          {character.campaign_name && (
            <p className="text-[10px] text-parchment-muted/50 truncate pt-1 border-t border-gold-500/5">
              {character.campaign_name}
            </p>
          )}
        </div>
      </Card>
    </Link>
  )
}

// ── Character Row (List View) ───────────────────────────

function CharacterRow({ character }: { character: PlayerCharacter }) {
  const hp = hpPercentage(character.current_hp, character.max_hp)
  const classColor = CLASS_COLORS[character.class] || '#d4a84b'
  const hasConditions = character.status?.conditions?.length > 0

  return (
    <Link href={`/player-deck/${character.id}`}>
      <Card className="group flex items-center gap-4 p-3 md:p-4 cursor-pointer transition-all duration-200 hover:border-gold-500/30 border-gold-500/10 bg-gradient-to-r from-teal-rich/60 to-charcoal-900/60">
        {/* Mini Portrait */}
        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden flex-shrink-0 border" style={{ borderColor: `${classColor}40` }}>
          {character.portrait_url ? (
            <img src={character.portrait_url} alt={character.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${classColor}20, ${classColor}05)` }}>
              <span className="text-xl font-serif" style={{ color: classColor }}>{character.name.charAt(0)}</span>
            </div>
          )}
          {!character.is_active && (
            <div className="absolute inset-0 bg-charcoal-900/60" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm md:text-base font-serif text-parchment font-medium truncate">{character.name}</h3>
            <Badge variant="outline" className="text-[10px] flex-shrink-0" style={{ borderColor: `${classColor}40`, color: classColor }}>
              Lvl {character.level}
            </Badge>
            {hasConditions && (
              <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400 flex-shrink-0">
                {character.status.conditions.length} condition{character.status.conditions.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {!character.is_active && (
              <Badge variant="outline" className="text-[10px] border-parchment-muted/20 text-parchment-muted/50 flex-shrink-0">
                Retired
              </Badge>
            )}
          </div>
          <p className="text-xs text-parchment-muted truncate">
            {character.race} {character.class}{character.subclass ? ` (${character.subclass})` : ''}
            {character.campaign_name ? ` — ${character.campaign_name}` : ''}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-parchment-muted flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-400" />
            <div className="w-16 h-1.5 bg-charcoal-950 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${hp > 50 ? 'bg-emerald-500' : hp > 25 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${hp}%` }}
              />
            </div>
            <span className="font-mono w-12 text-right">{character.current_hp}/{character.max_hp}</span>
          </div>
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" />{character.armor_class}</span>
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{formatModifier(character.initiative_bonus)}</span>
          <span className="flex items-center gap-1"><Scroll className="w-3 h-3" />{getSpellSlotsRemaining(character)}</span>
        </div>

        {/* Mobile quick stat */}
        <div className="sm:hidden flex items-center gap-2 text-xs flex-shrink-0">
          <span className="font-mono text-parchment">{character.current_hp}/{character.max_hp}</span>
          <Shield className="w-3 h-3 text-parchment-muted" />
          <span className="text-parchment-muted">{character.armor_class}</span>
        </div>
      </Card>
    </Link>
  )
}

// ── Helpers ─────────────────────────────────────────────

function getSpellSlotsRemaining(char: PlayerCharacter): number {
  const slots = char.spellcasting?.spell_slots
  if (!slots) return 0
  return Object.values(slots).reduce((total, slot) => total + (slot.max - slot.used), 0)
}
