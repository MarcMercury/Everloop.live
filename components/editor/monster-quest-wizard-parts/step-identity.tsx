'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download, X } from 'lucide-react'
import { REGIONS, type RegionId } from '@/lib/data/regions'
import { ROLES } from './constants'
import { Select } from './select'
import type { WizardStepProps } from './types'

/** Step 1 — Identity & Role (plus "Load Story Monster" entry point). */
export function StepIdentity({ wizard }: WizardStepProps) {
  const {
    name,
    setName,
    tagline,
    setTagline,
    role,
    setRole,
    regionId,
    setRegionId,
    isOneOff,
    setIsOneOff,
    sourceEntityId,
    sourceEntityName,
    openLoadModal,
    clearLoadedSource,
  } = wizard
  return (
    <div className="space-y-6">
      {/* Load from Story Monster */}
      {sourceEntityId ? (
        <div className="flex items-start gap-3 p-3 rounded-lg border border-gold/40 bg-gold/5">
          <Download className="w-4 h-4 text-gold mt-0.5 shrink-0" />
          <div className="flex-1 text-xs">
            <div className="text-parchment">
              Converting Story Monster:{' '}
              <span className="text-gold font-medium">{sourceEntityName}</span>
            </div>
            <div className="text-parchment-muted mt-0.5">
              Saving will upgrade this entity in place — adding stats and Everloop lore. The
              original entry will not be duplicated.
            </div>
          </div>
          <button
            type="button"
            onClick={clearLoadedSource}
            className="text-parchment-muted hover:text-red-400 transition-colors"
            aria-label="Cancel conversion"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-gold/30 bg-teal-deep/20">
          <div className="text-xs text-parchment-muted">
            Have a Story Monster you want to upgrade with full combat stats?
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={openLoadModal}
          >
            <Download className="w-3.5 h-3.5" />
            Load Story Monster
          </Button>
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label className="text-parchment">
          Name <span className="text-red-400">*</span>
        </Label>
        <Input
          placeholder="The Unraveling, Hollowmaw, The Stitched Tide..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-teal-deep/50"
        />
        <p className="text-xs text-parchment-muted">
          Monsters are named by survivors who witnessed them — or by the silence they leave behind.
        </p>
      </div>

      {/* Tagline */}
      <div className="space-y-2">
        <Label className="text-parchment">
          Tagline <span className="text-red-400">*</span>
        </Label>
        <Input
          placeholder="It arrived when the ground forgot how to be still..."
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="bg-teal-deep/50"
        />
        <p className="text-xs text-gold/60 italic">
          What would someone whisper to warn others this thing was near?
        </p>
      </div>

      {/* Role */}
      <div className="space-y-3">
        <Label className="text-parchment">
          Combat Role <span className="text-red-400">*</span>
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`text-left p-3 rounded-lg border transition-all ${
                role === r.value
                  ? 'border-red-500/60 bg-red-500/10'
                  : 'border-gold/20 bg-teal-deep/30 hover:border-gold/40'
              }`}
            >
              <div className="text-sm font-medium text-parchment">{r.label}</div>
              <div className="text-xs text-parchment-muted">{r.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Region */}
      <div className="space-y-2">
        <Label className="text-parchment">
          Region <span className="text-red-400">*</span>
        </Label>
        <Select value={regionId} onChange={(v) => setRegionId(v as RegionId)}>
          {REGIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {r.sub}
            </option>
          ))}
        </Select>
        <p className="text-xs text-parchment-muted">
          Where in the Everloop does this monster exist? It can only appear in campaigns and quests set in this
          region.
        </p>
      </div>

      {/* One-off flag */}
      <div className="flex items-start gap-3 p-3 rounded-lg border border-gold/20 bg-teal-deep/20">
        <input
          type="checkbox"
          id="is-one-off"
          checked={isOneOff}
          onChange={(e) => setIsOneOff(e.target.checked)}
          className="mt-1 accent-red-500"
        />
        <label htmlFor="is-one-off" className="cursor-pointer">
          <div className="text-sm font-medium text-parchment">One-Off Monster</div>
          <div className="text-xs text-parchment-muted">
            This monster is unique — it cannot be freely added to custom quests. It exists only once in
            the Everloop.
          </div>
        </label>
      </div>
    </div>
  )
}
