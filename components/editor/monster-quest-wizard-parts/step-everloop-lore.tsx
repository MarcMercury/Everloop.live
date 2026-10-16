'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Sparkles, Loader2 } from 'lucide-react'
import type { WizardStepProps } from './types'

/** Step 6 — Everloop lore: what broke, what leaked through, what draws it. */
export function StepEverloopLore({ wizard }: WizardStepProps) {
  const {
    name,
    description,
    setDescription,
    whatBrokeHere,
    setWhatBrokeHere,
    whatLeakedThrough,
    setWhatLeakedThrough,
    drawnTo,
    setDrawnTo,
    isGeneratingText,
    handleExpandDescription,
  } = wizard
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
        <p className="text-sm text-parchment mb-1 font-medium">
          Every monster exists because something broke.
        </p>
        <p className="text-xs text-parchment-muted">
          Monsters are consequences, not random encounters. They tie to the Fray, a Shard, or
          fractured reality. Answer these to ground this horror in the Everloop.
        </p>
      </div>

      {/* What broke here? */}
      <div className="space-y-2">
        <Label className="text-parchment">
          What broke here? <span className="text-red-400">*</span>
        </Label>
        <textarea
          placeholder="An ancient Shard was disturbed during excavation, causing reality to split along its fault lines..."
          value={whatBrokeHere}
          onChange={(e) => setWhatBrokeHere(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment placeholder:text-parchment-muted/50 focus:outline-hidden focus:ring-2 focus:ring-gold/30 resize-none"
        />
        <p className="text-xs text-parchment-muted">
          What event, location, or force in the Fray allowed this monster to exist?
        </p>
      </div>

      {/* What leaked through? */}
      <div className="space-y-2">
        <Label className="text-parchment">
          What leaked through? <span className="text-red-400">*</span>
        </Label>
        <textarea
          placeholder="Pure Drift matter, formless and hungry — it took shape from the fear of the first witnesses..."
          value={whatLeakedThrough}
          onChange={(e) => setWhatLeakedThrough(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment placeholder:text-parchment-muted/50 focus:outline-hidden focus:ring-2 focus:ring-gold/30 resize-none"
        />
        <p className="text-xs text-parchment-muted">
          Was it raw Drift, corrupted local reality, or something shaped from memory?
        </p>
      </div>

      {/* Drawn to */}
      <div className="space-y-2">
        <Label className="text-parchment">
          What is it drawn to? <span className="text-red-400">*</span>
        </Label>
        <textarea
          placeholder="The Shard beneath the ruined temple — it circles the area, never straying far..."
          value={drawnTo}
          onChange={(e) => setDrawnTo(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment placeholder:text-parchment-muted/50 focus:outline-hidden focus:ring-2 focus:ring-gold/30 resize-none"
        />
        <p className="text-xs text-parchment-muted">
          Is it drawn to a Shard, a place, a person, or instability itself?
        </p>
      </div>

      {/* Description (full narrative) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-parchment">
            Full Description <span className="text-red-400">*</span>
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleExpandDescription}
            disabled={isGeneratingText || !name.trim()}
            className="text-gold hover:text-gold/80 gap-1"
          >
            {isGeneratingText ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {description ? 'Expand' : 'Generate'} with AI
          </Button>
        </div>
        <textarea
          placeholder={`Describe what entered through the crack. The Fray connection, its nature, its form, behavior, and why it is monstrous...`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          className="w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment placeholder:text-parchment-muted/50 focus:outline-hidden focus:ring-2 focus:ring-gold/30 resize-none"
        />
      </div>
    </div>
  )
}
