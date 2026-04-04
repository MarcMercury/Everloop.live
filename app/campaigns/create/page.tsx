'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCampaign } from '@/lib/actions/campaigns'
import { GAME_MODE_INFO } from '@/types/campaign'
import type {
  GameMode,
  CampaignTone,
  CampaignLength,
  DifficultyPreset,
  SettingName,
  WorldStructure,
  WorldPersistence,
  AiAssistLevel,
  CharacterEntryMode,
} from '@/types/campaign'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight, Flame, Check, MapPin, ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { REGIONS } from '@/lib/data/regions'
import { WORLD_LOCATIONS } from '@/lib/data/region-locations'

const STEPS = [
  'Identity',
  'Structure',
  'Difficulty',
  'Rules',
  'Narrative',
  'World',
  'Players',
  'Review',
] as const

const TONE_OPTIONS: { value: CampaignTone; label: string; icon: string; desc: string }[] = [
  { value: 'light_adventure', label: 'Light / Adventure', icon: '☀️', desc: 'Heroic, hopeful, fun' },
  { value: 'dark_horror', label: 'Dark / Horror', icon: '🌑', desc: 'Dread, survival, fear' },
  { value: 'political_intrigue', label: 'Political / Intrigue', icon: '🗡️', desc: 'Deception, power plays' },
  { value: 'chaotic_experimental', label: 'Chaotic / Experimental', icon: '🌀', desc: 'Unpredictable, wild' },
]

const LENGTH_OPTIONS: { value: CampaignLength; label: string; icon: string; sessions: string; desc: string }[] = [
  { value: 'one_shot', label: 'One-Shot', icon: '🟢', sessions: '1 session', desc: 'Pre-built pacing, fast onboarding, minimal progression' },
  { value: 'short_arc', label: 'Short Arc', icon: '🟡', sessions: '3–6 sessions', desc: 'Light progression, defined narrative arc' },
  { value: 'full_campaign', label: 'Full Campaign', icon: '🔵', sessions: '10–30 sessions', desc: 'Full leveling, deep world persistence' },
  { value: 'endless', label: 'Endless / Sandbox', icon: '🔴', sessions: 'Ongoing', desc: 'Drop-in/out, persistent consequences' },
]

const DIFFICULTY_OPTIONS: { value: DifficultyPreset; label: string; icon: string; desc: string }[] = [
  { value: 'story_mode', label: 'Story Mode', icon: '🟢', desc: 'Player-favored outcomes, reduced death risk' },
  { value: 'standard', label: 'Standard', icon: '🟡', desc: 'Balanced encounters, RAW-friendly' },
  { value: 'brutal', label: 'Brutal', icon: '🔴', desc: 'Resource scarcity, permanent consequences' },
  { value: 'chaos', label: 'Chaos Mode', icon: '⚫', desc: 'Unpredictable shifts, hidden mechanics, reality instability' },
]

const WORLD_STRUCTURE_OPTIONS: { value: WorldStructure; label: string; desc: string }[] = [
  { value: 'linear', label: 'Linear Campaign', desc: 'Guided, chapter-by-chapter' },
  { value: 'branching', label: 'Branching Story', desc: 'Player choices create forks' },
  { value: 'open_world', label: 'Open World', desc: 'Full sandbox exploration' },
  { value: 'looping', label: 'Looping Reality', desc: 'Everloop-style time loops' },
]

const PERSISTENCE_OPTIONS: { value: WorldPersistence; label: string }[] = [
  { value: 'session_reset', label: 'Session-based reset' },
  { value: 'persistent', label: 'Persistent world state' },
  { value: 'evolving', label: 'Evolving (AI modifies over time)' },
]

const AI_ASSIST_OPTIONS: { value: AiAssistLevel; label: string; desc: string }[] = [
  { value: 'off', label: 'Off', desc: 'Pure manual DM' },
  { value: 'assistant', label: 'Assistant', desc: 'Suggestions only' },
  { value: 'co_dm', label: 'Co-DM', desc: 'Active involvement' },
  { value: 'director', label: 'Director', desc: 'AI drives narrative beats' },
]

const ENTRY_MODE_OPTIONS: { value: CharacterEntryMode; label: string; desc: string }[] = [
  { value: 'pre_generated', label: 'Pre-generated Only', desc: 'DM provides characters' },
  { value: 'bring_own', label: 'Bring Your Own', desc: 'Players use existing characters' },
  { value: 'create_new', label: 'Create New', desc: 'Players make new characters for this campaign' },
  { value: 'dm_approval', label: 'DM Approval Required', desc: 'All characters must be approved' },
]

export default function CreateCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(0)

  const [form, setForm] = useState({
    // Step 1: Identity
    title: '',
    description: '',
    game_mode: 'classic' as GameMode,
    setting_name: 'everloop_world' as SettingName,
    tone: 'light_adventure' as CampaignTone,
    // Step 2: Structure
    campaign_length: 'full_campaign' as CampaignLength,
    // Step 3: Difficulty
    difficulty_preset: 'standard' as DifficultyPreset,
    combat_lethality: 50,
    resource_scarcity: 50,
    puzzle_complexity: 50,
    social_consequence: 50,
    random_event_frequency: 50,
    // Step 4: Rules
    core_rules: 'dnd_5e' as 'dnd_5e' | 'custom' | 'everloop_overlay',
    combat_mode: 'tactical_grid' as 'tactical_grid' | 'hybrid' | 'narrative',
    critical_rules: 'standard' as 'standard' | 'brutal' | 'cinematic',
    initiative_tracking: true,
    spell_slot_tracking: true,
    concentration_tracking: true,
    encumbrance: false,
    leveling_style: 'milestone' as 'milestone' | 'xp_based' | 'hybrid',
    progression_speed: 'standard' as 'fast' | 'standard' | 'slow',
    feats_enabled: true,
    multiclassing_enabled: true,
    // Step 5: Narrative
    hidden_info_level: 'off' as 'off' | 'light' | 'heavy',
    event_engine_intensity: 'off' as 'off' | 'light' | 'active' | 'dominant',
    scene_based_mode: false,
    idol_enabled: true,
    idol_who_earns: 'individuals' as 'individuals' | 'teams',
    idol_when_usable: 'anytime' as 'before_events' | 'anytime',
    // Step 6: World
    world_structure: 'linear' as WorldStructure,
    world_persistence: 'persistent' as WorldPersistence,
    ai_assist_level: 'assistant' as AiAssistLevel,
    music: true,
    ambient_effects: true,
    // Step 7: Players
    max_players: 6,
    is_public: true,
    allow_spectators: false,
    fray_intensity: 0.5,
    character_entry_mode: 'bring_own' as CharacterEntryMode,
    min_level: 1,
    max_level: 20,
    everloop_classes_allowed: false,
    player_knowledge: 'shared' as 'shared' | 'partial' | 'isolated',
    // Region & Location
    regions: [] as string[],
    location_ids: [] as string[],
    location_names: [] as string[],
  })

  // Track which region is expanded in the location picker
  const [activeLocationRegion, setActiveLocationRegion] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  function toggleCategory(key: string) {
    setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleLocationName(name: string) {
    setForm(f => ({
      ...f,
      location_names: f.location_names.includes(name)
        ? f.location_names.filter(n => n !== name)
        : [...f.location_names, name]
    }))
  }

  function selectAllInCategory(items: string[]) {
    setForm(f => {
      const newNames = new Set(f.location_names)
      items.forEach(item => newNames.add(item))
      return { ...f, location_names: Array.from(newNames) }
    })
  }

  function deselectAllInCategory(items: string[]) {
    setForm(f => ({
      ...f,
      location_names: f.location_names.filter(n => !items.includes(n))
    }))
  }

  function nextStep() {
    if (step === 0 && !form.title.trim()) {
      setError('Campaign title is required')
      return
    }
    setError(null)
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  function prevStep() {
    setError(null)
    setStep(s => Math.max(s - 1, 0))
  }

  async function handleSubmit() {
    if (!form.title.trim()) {
      setError('Campaign title is required')
      return
    }

    setLoading(true)
    setError(null)

    const result = await createCampaign({
      title: form.title.trim(),
      description: form.description.trim() || null,
      game_mode: form.game_mode,
      setting_name: 'everloop_world',
      tone: form.tone,
      campaign_length: form.campaign_length,
      difficulty_preset: form.difficulty_preset,
      difficulty_sliders: {
        combat_lethality: form.combat_lethality,
        resource_scarcity: form.resource_scarcity,
        puzzle_complexity: form.puzzle_complexity,
        social_consequence: form.social_consequence,
        random_event_frequency: form.random_event_frequency,
      },
      ruleset: {
        core_rules: form.core_rules,
        initiative_tracking: form.initiative_tracking,
        advantage_disadvantage: true,
        spell_slot_tracking: form.spell_slot_tracking,
        concentration_tracking: form.concentration_tracking,
        encumbrance: form.encumbrance,
        critical_rules: form.critical_rules,
        combat_mode: form.combat_mode,
      },
      progression: {
        leveling_style: form.leveling_style,
        progression_speed: form.progression_speed,
        feats_enabled: form.feats_enabled,
        multiclassing_enabled: form.multiclassing_enabled,
        custom_abilities_enabled: false,
      },
      narrative_settings: {
        hidden_info_level: form.hidden_info_level,
        event_engine_intensity: form.event_engine_intensity,
        scene_based_mode: form.scene_based_mode,
      },
      idol_settings: {
        enabled: form.idol_enabled,
        who_earns: form.idol_who_earns,
        when_usable: form.idol_when_usable,
        effects_allowed: ['reroll', 'reveal', 'shield', 'shift', 'immunity'],
      },
      world_structure: form.world_structure,
      world_persistence: form.world_persistence,
      ai_assist_level: form.ai_assist_level,
      immersion: {
        music: form.music,
        ambient_effects: form.ambient_effects,
        visual_effects_intensity: 'medium',
        dice_animation: 'standard',
      },
      player_config: {
        role_types: 'standard_party',
        knowledge_level: form.player_knowledge,
      },
      character_entry_mode: form.character_entry_mode,
      character_rules: {
        min_level: form.min_level,
        max_level: form.max_level,
        allowed_classes: [],
        everloop_classes_allowed: form.everloop_classes_allowed,
        stat_generation: 'any',
        inventory_restrictions: [],
      },
      max_players: form.max_players,
      is_public: form.is_public,
      allow_spectators: form.allow_spectators,
      fray_intensity: form.fray_intensity,
      tags: form.regions.map(r => `region:${r}`),
      referenced_entities: form.location_ids,
      metadata: { regions: form.regions, location_ids: form.location_ids, location_names: form.location_names },
      status: 'draft',
    })

    if (result.success && result.campaign) {
      router.push(`/campaigns/${result.campaign.slug}`)
    } else {
      setError(result.error ?? 'Failed to create campaign')
      setLoading(false)
    }
  }

  // --- Option picker helper ---
  function OptionCard({ selected, onClick, children, className = '' }: {
    selected: boolean; onClick: () => void; children: React.ReactNode; className?: string
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`story-card text-left p-4 transition-all ${selected ? 'border-gold/60 shadow-lg shadow-gold/10' : 'hover:border-gold/30'} ${className}`}
      >
        {children}
      </button>
    )
  }

  function SliderField({ label, value, onChange, tip }: {
    label: string; value: number; onChange: (v: number) => void; tip?: string
  }) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label className="text-parchment text-sm">{label}</Label>
          <span className="text-xs text-parchment-muted">{value}%</span>
        </div>
        <input type="range" min={0} max={100} value={value} onChange={e => onChange(parseInt(e.target.value))} className="w-full accent-gold" />
        {tip && <p className="text-xs text-parchment-muted mt-1">{tip}</p>}
      </div>
    )
  }

  function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="rounded border-gold/30 bg-teal-rich text-gold focus:ring-gold/40" />
        <span className="text-sm text-parchment">{label}</span>
      </label>
    )
  }

  // --- Step renders ---
  function renderIdentity() {
    return (
      <div className="space-y-6">
        <div>
          <Label className="text-parchment mb-3 block text-lg font-serif">Game Mode</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.entries(GAME_MODE_INFO) as [GameMode, typeof GAME_MODE_INFO[GameMode]][]).map(([key, mode]) => (
              <OptionCard key={key} selected={form.game_mode === key} onClick={() => setForm(f => ({ ...f, game_mode: key as GameMode }))}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{mode.icon}</span>
                  <span className="font-serif text-parchment text-sm">{mode.name}</span>
                </div>
                <p className="text-xs text-parchment-muted line-clamp-2">{mode.description}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-parchment-muted">
                  <span>{mode.minPlayers}-{mode.maxPlayers} players</span>
                  <span>{mode.estimatedLength}</span>
                </div>
              </OptionCard>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-parchment">Campaign Title</Label>
            <Input id="title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="The Shattered Convergence..." className="mt-1 bg-teal-rich/50 border-gold/20 text-parchment placeholder:text-parchment-muted/50" />
          </div>
          <div>
            <Label htmlFor="description" className="text-parchment">Description</Label>
            <textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What pulls your players into this story? What is the local problem, the contained issue, the thing that feels bigger than it should? In the Everloop, every campaign begins somewhere ordinary... but never ends there." rows={3} className="w-full mt-1 rounded-lg bg-teal-rich/50 border border-gold/20 text-parchment placeholder:text-parchment-muted/50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/40" />
          </div>
        </div>

        <div>
          <Label className="text-parchment mb-3 block">Regions</Label>
          <p className="text-xs text-parchment-muted mb-3">Where in the Everloop does this campaign take place? Every region holds Shards in unknown numbers — your choice shapes what gravity pulls your story forward.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {REGIONS.map(region => (
              <OptionCard
                key={region.id}
                selected={form.regions.includes(region.id)}
                onClick={() => setForm(f => ({
                  ...f,
                  regions: f.regions.includes(region.id)
                    ? f.regions.filter(r => r !== region.id)
                    : [...f.regions, region.id]
                }))}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: region.color }} />
                  <span className="text-sm text-parchment font-medium">{region.name}</span>
                </div>
                <p className="text-xs text-parchment-muted line-clamp-2">{region.sub}</p>
              </OptionCard>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-parchment mb-3 block">Tone</Label>
          <div className="grid grid-cols-2 gap-3">
            {TONE_OPTIONS.map(opt => (
              <OptionCard key={opt.value} selected={form.tone === opt.value} onClick={() => setForm(f => ({ ...f, tone: opt.value }))}>
                <div className="flex items-center gap-2">
                  <span>{opt.icon}</span>
                  <span className="text-sm text-parchment font-medium">{opt.label}</span>
                </div>
                <p className="text-xs text-parchment-muted mt-1">{opt.desc}</p>
              </OptionCard>
            ))}
          </div>
        </div>
      </div>
    )
  }

  function renderStructure() {
    return (
      <div className="space-y-6">
        <div>
          <Label className="text-parchment mb-3 block text-lg font-serif">Campaign Length</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LENGTH_OPTIONS.map(opt => (
              <OptionCard key={opt.value} selected={form.campaign_length === opt.value} onClick={() => setForm(f => ({ ...f, campaign_length: opt.value }))}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{opt.icon}</span>
                  <span className="font-serif text-parchment">{opt.label}</span>
                  <span className="text-xs text-parchment-muted ml-auto">{opt.sessions}</span>
                </div>
                <p className="text-xs text-parchment-muted">{opt.desc}</p>
              </OptionCard>
            ))}
          </div>
        </div>
        <p className="text-sm text-parchment-muted">
          Campaign length determines XP pacing, event frequency, narrative complexity, resource scarcity, and AI involvement level.
        </p>
        <div className="p-4 rounded-lg border border-gold/10 bg-teal-rich/20 mt-2">
          <p className="text-xs text-parchment-muted italic leading-relaxed">
            &ldquo;Every campaign in the Everloop follows a natural arc: it begins with something local — a disturbance, a disappearance, a wrong that feels bigger than it should. It deepens into instability — encounters with distortion, creatures born from the Drift, clues toward something ancient. And it resolves at a Shard — a decision that ripples outward, stabilizing or fracturing the world further.&rdquo;
          </p>
        </div>
      </div>
    )
  }

  function renderDifficulty() {
    return (
      <div className="space-y-6">
        <div>
          <Label className="text-parchment mb-3 block text-lg font-serif">Difficulty Preset</Label>
          <div className="grid grid-cols-2 gap-3">
            {DIFFICULTY_OPTIONS.map(opt => (
              <OptionCard key={opt.value} selected={form.difficulty_preset === opt.value} onClick={() => setForm(f => ({ ...f, difficulty_preset: opt.value }))}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{opt.icon}</span>
                  <span className="font-serif text-parchment">{opt.label}</span>
                </div>
                <p className="text-xs text-parchment-muted">{opt.desc}</p>
              </OptionCard>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-parchment mb-3 block text-lg font-serif">Fine-Tune Sliders</Label>
          <div className="space-y-4">
            <SliderField label="Combat Lethality" value={form.combat_lethality} onChange={v => setForm(f => ({ ...f, combat_lethality: v }))} />
            <SliderField label="Resource Scarcity" value={form.resource_scarcity} onChange={v => setForm(f => ({ ...f, resource_scarcity: v }))} />
            <SliderField label="Puzzle Complexity" value={form.puzzle_complexity} onChange={v => setForm(f => ({ ...f, puzzle_complexity: v }))} />
            <SliderField label="Social Consequence Weight" value={form.social_consequence} onChange={v => setForm(f => ({ ...f, social_consequence: v }))} />
            <SliderField label="Random Event Frequency" value={form.random_event_frequency} onChange={v => setForm(f => ({ ...f, random_event_frequency: v }))} />
          </div>
        </div>
      </div>
    )
  }

  function renderRules() {
    return (
      <div className="space-y-6">
        <div>
          <Label className="text-parchment mb-3 block text-lg font-serif">Core Ruleset</Label>
          <div className="grid grid-cols-3 gap-3">
            {([['dnd_5e', 'D&D 5e'], ['custom', 'Custom Variant'], ['everloop_overlay', 'Everloop Overlay']] as const).map(([val, label]) => (
              <OptionCard key={val} selected={form.core_rules === val} onClick={() => setForm(f => ({ ...f, core_rules: val }))}>
                <span className="text-sm text-parchment">{label}</span>
              </OptionCard>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-parchment mb-3 block">Combat Mode</Label>
          <div className="grid grid-cols-3 gap-3">
            {([['tactical_grid', 'Tactical Grid'], ['hybrid', 'Hybrid'], ['narrative', 'Narrative']] as const).map(([val, label]) => (
              <OptionCard key={val} selected={form.combat_mode === val} onClick={() => setForm(f => ({ ...f, combat_mode: val }))}>
                <span className="text-sm text-parchment">{label}</span>
              </OptionCard>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-parchment mb-3 block">Critical Hit Rules</Label>
          <div className="grid grid-cols-3 gap-3">
            {([['standard', 'Standard'], ['brutal', 'Brutal'], ['cinematic', 'Cinematic']] as const).map(([val, label]) => (
              <OptionCard key={val} selected={form.critical_rules === val} onClick={() => setForm(f => ({ ...f, critical_rules: val }))}>
                <span className="text-sm text-parchment">{label}</span>
              </OptionCard>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-parchment mb-2 block">Mechanics Toggles</Label>
          <Toggle label="Initiative Tracking" checked={form.initiative_tracking} onChange={v => setForm(f => ({ ...f, initiative_tracking: v }))} />
          <Toggle label="Spell Slot Tracking" checked={form.spell_slot_tracking} onChange={v => setForm(f => ({ ...f, spell_slot_tracking: v }))} />
          <Toggle label="Concentration Tracking" checked={form.concentration_tracking} onChange={v => setForm(f => ({ ...f, concentration_tracking: v }))} />
          <Toggle label="Encumbrance" checked={form.encumbrance} onChange={v => setForm(f => ({ ...f, encumbrance: v }))} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label className="text-parchment mb-3 block">Leveling Style</Label>
            <div className="space-y-2">
              {(['milestone', 'xp_based', 'hybrid'] as const).map(val => (
                <OptionCard key={val} selected={form.leveling_style === val} onClick={() => setForm(f => ({ ...f, leveling_style: val }))} className="!p-3">
                  <span className="text-sm text-parchment capitalize">{val.replace('_', '-')}</span>
                </OptionCard>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-parchment mb-3 block">Progression Speed</Label>
            <div className="space-y-2">
              {(['fast', 'standard', 'slow'] as const).map(val => (
                <OptionCard key={val} selected={form.progression_speed === val} onClick={() => setForm(f => ({ ...f, progression_speed: val }))} className="!p-3">
                  <span className="text-sm text-parchment capitalize">{val}</span>
                </OptionCard>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Toggle label="Feats Enabled" checked={form.feats_enabled} onChange={v => setForm(f => ({ ...f, feats_enabled: v }))} />
          <Toggle label="Multiclassing Enabled" checked={form.multiclassing_enabled} onChange={v => setForm(f => ({ ...f, multiclassing_enabled: v }))} />
        </div>
      </div>
    )
  }

  function renderNarrative() {
    return (
      <div className="space-y-6">
        <div>
          <Label className="text-parchment mb-3 block text-lg font-serif">Hidden Information</Label>
          <div className="grid grid-cols-3 gap-3">
            {([['off', 'Off', 'Classic D&D'], ['light', 'Light', 'Private notes'], ['heavy', 'Heavy', 'Secret objectives, split knowledge']] as const).map(([val, label, desc]) => (
              <OptionCard key={val} selected={form.hidden_info_level === val} onClick={() => setForm(f => ({ ...f, hidden_info_level: val as typeof form.hidden_info_level }))}>
                <span className="text-sm text-parchment font-medium">{label}</span>
                <p className="text-xs text-parchment-muted mt-1">{desc}</p>
              </OptionCard>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-parchment mb-3 block text-lg font-serif">Event Engine Intensity</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([['off', 'Off'], ['light', 'Light'], ['active', 'Active'], ['dominant', 'Dominant']] as const).map(([val, label]) => (
              <OptionCard key={val} selected={form.event_engine_intensity === val} onClick={() => setForm(f => ({ ...f, event_engine_intensity: val as typeof form.event_engine_intensity }))}>
                <span className="text-sm text-parchment">{label}</span>
              </OptionCard>
            ))}
          </div>
        </div>

        <Toggle label="Scene-Based Mode (story-driven instead of map-based)" checked={form.scene_based_mode} onChange={v => setForm(f => ({ ...f, scene_based_mode: v }))} />

        <div className="border-t border-gold/10 pt-6">
          <Label className="text-parchment mb-3 block text-lg font-serif">Narrative Idols</Label>
          <Toggle label="Enable Idol System" checked={form.idol_enabled} onChange={v => setForm(f => ({ ...f, idol_enabled: v }))} />
          {form.idol_enabled && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <Label className="text-parchment text-sm mb-2 block">Who Earns Idols</Label>
                <div className="space-y-2">
                  {(['individuals', 'teams'] as const).map(val => (
                    <OptionCard key={val} selected={form.idol_who_earns === val} onClick={() => setForm(f => ({ ...f, idol_who_earns: val }))} className="!p-3">
                      <span className="text-sm text-parchment capitalize">{val}</span>
                    </OptionCard>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-parchment text-sm mb-2 block">When Usable</Label>
                <div className="space-y-2">
                  {([['before_events', 'Before Events'], ['anytime', 'Anytime']] as const).map(([val, label]) => (
                    <OptionCard key={val} selected={form.idol_when_usable === val} onClick={() => setForm(f => ({ ...f, idol_when_usable: val as typeof form.idol_when_usable }))} className="!p-3">
                      <span className="text-sm text-parchment">{label}</span>
                    </OptionCard>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderWorld() {
    return (
      <div className="space-y-6">
        <div>
          <Label className="text-parchment mb-3 block text-lg font-serif">World Structure</Label>
          <div className="grid grid-cols-2 gap-3">
            {WORLD_STRUCTURE_OPTIONS.map(opt => (
              <OptionCard key={opt.value} selected={form.world_structure === opt.value} onClick={() => setForm(f => ({ ...f, world_structure: opt.value }))}>
                <span className="text-sm text-parchment font-medium">{opt.label}</span>
                <p className="text-xs text-parchment-muted mt-1">{opt.desc}</p>
              </OptionCard>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-parchment mb-3 block">World Persistence</Label>
          <div className="grid grid-cols-3 gap-3">
            {PERSISTENCE_OPTIONS.map(opt => (
              <OptionCard key={opt.value} selected={form.world_persistence === opt.value} onClick={() => setForm(f => ({ ...f, world_persistence: opt.value }))}>
                <span className="text-sm text-parchment">{opt.label}</span>
              </OptionCard>
            ))}
          </div>
        </div>

        {/* Locations — Region → Category → Area */}
        <div>
          <Label className="text-parchment mb-3 block text-lg font-serif">Locations</Label>
          <p className="text-xs text-parchment-muted mb-3">
            Select a region to explore its areas. Pick specific locations where your campaign takes place.
            {form.location_names.length > 0 && <span className="text-gold ml-1">{form.location_names.length} selected</span>}
          </p>

          {/* Region tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(() => {
              const regionsToShow = form.regions.length > 0
                ? WORLD_LOCATIONS.filter(r => form.regions.includes(r.id))
                : WORLD_LOCATIONS
              return regionsToShow.map(region => {
                const selectedCount = region.categories.reduce((sum, cat) =>
                  sum + cat.items.filter(item => form.location_names.includes(item)).length, 0
                )
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setActiveLocationRegion(activeLocationRegion === region.id ? null : region.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                      activeLocationRegion === region.id
                        ? 'border-gold/60 bg-gold/10 text-gold shadow-md shadow-gold/10'
                        : selectedCount > 0
                          ? 'border-gold/30 bg-teal-rich/50 text-parchment'
                          : 'border-gold/10 bg-teal-rich/30 text-parchment-muted hover:border-gold/30'
                    }`}
                  >
                    <span>{region.emoji}</span>
                    <span className="font-medium">{region.name}</span>
                    {selectedCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-gold/20 text-gold">{selectedCount}</span>
                    )}
                  </button>
                )
              })
            })()}
          </div>

          {form.regions.length === 0 && !activeLocationRegion && (
            <p className="text-xs text-parchment-muted/60 italic mb-3">
              Tip: Select regions in the Identity step to narrow down your choices, or browse all regions above.
            </p>
          )}

          {/* Region detail panel */}
          {activeLocationRegion && (() => {
            const region = WORLD_LOCATIONS.find(r => r.id === activeLocationRegion)
            const regionInfo = REGIONS.find(r => r.id === activeLocationRegion)
            if (!region || !regionInfo) return null

            const allItems = region.categories.flatMap(c => c.items)
            const allSelected = allItems.every(item => form.location_names.includes(item))
            const someSelected = allItems.some(item => form.location_names.includes(item))

            return (
              <div className="rounded-xl border border-gold/20 bg-teal-rich/30 overflow-hidden">
                {/* Region header */}
                <div className="p-4 border-b border-gold/10" style={{ borderLeftWidth: 4, borderLeftColor: region.color }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-serif text-parchment flex items-center gap-2">
                        <span>{region.emoji}</span> {region.name}
                      </h3>
                      <p className="text-xs text-parchment-muted mt-1">{regionInfo.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => allSelected ? deselectAllInCategory(allItems) : selectAllInCategory(allItems)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gold/20 text-parchment-muted hover:text-gold hover:border-gold/40 transition-all"
                    >
                      {allSelected ? 'Deselect All' : someSelected ? 'Select Remaining' : 'Select All'}
                    </button>
                  </div>
                </div>

                {/* Categories */}
                <div className="divide-y divide-gold/5">
                  {region.categories.map(category => {
                    const catKey = `${region.id}-${category.heading}`
                    const isExpanded = expandedCategories[catKey] !== false
                    const catSelectedCount = category.items.filter(item => form.location_names.includes(item)).length
                    const allCatSelected = catSelectedCount === category.items.length

                    return (
                      <div key={catKey}>
                        {/* Category header */}
                        <button
                          type="button"
                          onClick={() => toggleCategory(catKey)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gold/5 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-gold/60" /> : <ChevronRight className="w-4 h-4 text-parchment-muted" />}
                            <span className="text-sm font-medium text-parchment">{category.heading}</span>
                            <span className="text-xs text-parchment-muted">({category.items.length})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {catSelectedCount > 0 && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-gold/15 text-gold">
                                {catSelectedCount}/{category.items.length}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                allCatSelected
                                  ? deselectAllInCategory(category.items)
                                  : selectAllInCategory(category.items)
                              }}
                              className="text-xs px-2 py-1 rounded border border-gold/15 text-parchment-muted hover:text-gold hover:border-gold/30 transition-all"
                            >
                              {allCatSelected ? 'Clear' : 'All'}
                            </button>
                          </div>
                        </button>

                        {/* Location items */}
                        {isExpanded && (
                          <div className="px-4 pb-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {category.items.map(item => {
                              const isSelected = form.location_names.includes(item)
                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => toggleLocationName(item)}
                                  className={`text-left px-3 py-2 rounded-lg border transition-all text-sm ${
                                    isSelected
                                      ? 'border-gold/50 bg-gold/10 text-gold'
                                      : 'border-gold/10 bg-teal-rich/20 text-parchment-muted hover:border-gold/25 hover:text-parchment'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <MapPin className={`w-3 h-3 shrink-0 ${isSelected ? 'text-gold' : 'text-parchment-muted/40'}`} />
                                    <span className="truncate">{item}</span>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* Selected locations summary */}
          {form.location_names.length > 0 && (
            <div className="mt-4 p-3 rounded-lg border border-gold/15 bg-teal-rich/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-parchment-muted">Selected Locations ({form.location_names.length})</span>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, location_names: [] }))}
                  className="text-xs text-parchment-muted hover:text-red-400 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.location_names.map(name => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gold/10 text-gold border border-gold/20 cursor-pointer hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
                    onClick={() => toggleLocationName(name)}
                  >
                    <MapPin className="w-2.5 h-2.5" />
                    {name}
                    <span className="ml-0.5">&times;</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <Label className="text-parchment mb-3 block text-lg font-serif">AI Assist Level</Label>
          <div className="grid grid-cols-2 gap-3">
            {AI_ASSIST_OPTIONS.map(opt => (
              <OptionCard key={opt.value} selected={form.ai_assist_level === opt.value} onClick={() => setForm(f => ({ ...f, ai_assist_level: opt.value }))}>
                <span className="text-sm text-parchment font-medium">{opt.label}</span>
                <p className="text-xs text-parchment-muted mt-1">{opt.desc}</p>
              </OptionCard>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-parchment mb-2 block">Immersion</Label>
          <Toggle label="Background Music" checked={form.music} onChange={v => setForm(f => ({ ...f, music: v }))} />
          <Toggle label="Ambient Sound Effects" checked={form.ambient_effects} onChange={v => setForm(f => ({ ...f, ambient_effects: v }))} />
        </div>
      </div>
    )
  }

  function renderPlayers() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="max_players" className="text-parchment">Max Players</Label>
            <Input id="max_players" type="number" min={1} max={20} value={form.max_players} onChange={e => setForm(f => ({ ...f, max_players: parseInt(e.target.value) || 6 }))} className="mt-1 bg-teal-rich/50 border-gold/20 text-parchment" />
          </div>
          <div>
            <Label className="text-parchment flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Fray Intensity
            </Label>
            <p className="text-xs text-parchment-muted mt-1 mb-2">How deeply has reality fractured here? Higher Fray means more Monsters — Drift-born manifestations that leak through the cracks. It also means Shards are closer to the surface, pulling harder.</p>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={100} value={Math.round(form.fray_intensity * 100)} onChange={e => setForm(f => ({ ...f, fray_intensity: parseInt(e.target.value) / 100 }))} className="flex-1 accent-gold" />
              <span className="text-sm text-parchment w-10 text-right">{Math.round(form.fray_intensity * 100)}%</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-parchment mb-3 block text-lg font-serif">Character Entry Mode</Label>
          <div className="grid grid-cols-2 gap-3">
            {ENTRY_MODE_OPTIONS.map(opt => (
              <OptionCard key={opt.value} selected={form.character_entry_mode === opt.value} onClick={() => setForm(f => ({ ...f, character_entry_mode: opt.value }))}>
                <span className="text-sm text-parchment font-medium">{opt.label}</span>
                <p className="text-xs text-parchment-muted mt-1">{opt.desc}</p>
              </OptionCard>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="min_level" className="text-parchment">Min Character Level</Label>
            <Input id="min_level" type="number" min={1} max={20} value={form.min_level} onChange={e => setForm(f => ({ ...f, min_level: parseInt(e.target.value) || 1 }))} className="mt-1 bg-teal-rich/50 border-gold/20 text-parchment" />
          </div>
          <div>
            <Label htmlFor="max_level" className="text-parchment">Max Character Level</Label>
            <Input id="max_level" type="number" min={1} max={20} value={form.max_level} onChange={e => setForm(f => ({ ...f, max_level: parseInt(e.target.value) || 20 }))} className="mt-1 bg-teal-rich/50 border-gold/20 text-parchment" />
          </div>
        </div>

        <div>
          <Label className="text-parchment mb-3 block">Player Knowledge Level</Label>
          <div className="grid grid-cols-3 gap-3">
            {([['shared', 'Shared'], ['partial', 'Partial'], ['isolated', 'Isolated']] as const).map(([val, label]) => (
              <OptionCard key={val} selected={form.player_knowledge === val} onClick={() => setForm(f => ({ ...f, player_knowledge: val as typeof form.player_knowledge }))}>
                <span className="text-sm text-parchment">{label}</span>
              </OptionCard>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Toggle label="Public (anyone can find and request to join)" checked={form.is_public} onChange={v => setForm(f => ({ ...f, is_public: v }))} />
          <Toggle label="Allow Spectators" checked={form.allow_spectators} onChange={v => setForm(f => ({ ...f, allow_spectators: v }))} />
          <Toggle label="Allow Everloop Custom Classes" checked={form.everloop_classes_allowed} onChange={v => setForm(f => ({ ...f, everloop_classes_allowed: v }))} />
        </div>
      </div>
    )
  }

  function renderReview() {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-serif text-parchment">Campaign Summary</h2>
        <div className="story-card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-parchment-muted">Title:</span>
              <span className="text-parchment ml-2 font-medium">{form.title || '(untitled)'}</span>
            </div>
            <div>
              <span className="text-parchment-muted">Mode:</span>
              <span className="text-parchment ml-2">{GAME_MODE_INFO[form.game_mode]?.name}</span>
            </div>
            <div>
              <span className="text-parchment-muted">Length:</span>
              <span className="text-parchment ml-2 capitalize">{form.campaign_length.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-parchment-muted">Difficulty:</span>
              <span className="text-parchment ml-2 capitalize">{form.difficulty_preset.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-parchment-muted">Ruleset:</span>
              <span className="text-parchment ml-2">{form.core_rules === 'dnd_5e' ? 'D&D 5e' : form.core_rules === 'everloop_overlay' ? 'Everloop Overlay' : 'Custom'}</span>
            </div>
            <div>
              <span className="text-parchment-muted">Combat:</span>
              <span className="text-parchment ml-2 capitalize">{form.combat_mode.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-parchment-muted">Leveling:</span>
              <span className="text-parchment ml-2 capitalize">{form.leveling_style} ({form.progression_speed})</span>
            </div>
            <div>
              <span className="text-parchment-muted">Players:</span>
              <span className="text-parchment ml-2">Up to {form.max_players}</span>
            </div>
            <div>
              <span className="text-parchment-muted">Hidden Info:</span>
              <span className="text-parchment ml-2 capitalize">{form.hidden_info_level}</span>
            </div>
            <div>
              <span className="text-parchment-muted">Events:</span>
              <span className="text-parchment ml-2 capitalize">{form.event_engine_intensity}</span>
            </div>
            <div>
              <span className="text-parchment-muted">World:</span>
              <span className="text-parchment ml-2 capitalize">{form.world_structure} / {form.world_persistence.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-parchment-muted">AI:</span>
              <span className="text-parchment ml-2 capitalize">{form.ai_assist_level.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-parchment-muted">Idols:</span>
              <span className="text-parchment ml-2">{form.idol_enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div>
              <span className="text-parchment-muted">Characters:</span>
              <span className="text-parchment ml-2 capitalize">{form.character_entry_mode.replace('_', ' ')}</span>
            </div>
            {form.regions.length > 0 && (
              <div className="col-span-2">
                <span className="text-parchment-muted">Regions:</span>
                <span className="text-parchment ml-2">{form.regions.map(r => REGIONS.find(reg => reg.id === r)?.name ?? r).join(', ')}</span>
              </div>
            )}
            {form.location_names.length > 0 && (
              <div className="col-span-2">
                <span className="text-parchment-muted">Locations:</span>
                <span className="text-parchment ml-2">{form.location_names.join(', ')}</span>
              </div>
            )}
          </div>
          {form.description && (
            <div className="border-t border-gold/10 pt-3">
              <span className="text-xs text-parchment-muted">Description</span>
              <p className="text-sm text-parchment mt-1">{form.description}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const stepRenderers = [renderIdentity, renderStructure, renderDifficulty, renderRules, renderNarrative, renderWorld, renderPlayers, renderReview]

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/campaigns" className="flex items-center gap-2 text-sm text-parchment-muted hover:text-parchment transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Campaigns
      </Link>

      <h1 className="text-4xl font-serif mb-2">
        <span className="text-parchment">Campaign</span>{' '}
        <span className="canon-text">Forge</span>
      </h1>
      <p className="text-parchment-muted mb-8">
        Design your experience step by step. Every setting shapes how the game plays.
      </p>

      {/* Step Indicator */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((name, i) => (
          <button
            key={name}
            type="button"
            onClick={() => { if (i <= step || form.title.trim()) setStep(i) }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all whitespace-nowrap ${
              i === step
                ? 'bg-gold/20 text-gold border border-gold/40'
                : i < step
                  ? 'bg-teal-rich/50 text-parchment-muted border border-gold/10'
                  : 'text-parchment-muted/50 border border-transparent'
            }`}
          >
            {i < step ? <Check className="w-3 h-3 text-green-400" /> : <span className="w-4 text-center">{i + 1}</span>}
            <span className="hidden sm:inline">{name}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {stepRenderers[step]()}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gold/10">
        <Button type="button" variant="ghost" onClick={prevStep} disabled={step === 0} className="text-parchment-muted hover:text-parchment">
          <ArrowLeft className="w-4 h-4 mr-2" /> Previous
        </Button>

        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={nextStep} className="btn-fantasy">
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={loading} className="btn-fantasy">
            {loading ? 'Forging...' : '✦ Forge Campaign'}
          </Button>
        )}
      </div>
    </div>
  )
}
