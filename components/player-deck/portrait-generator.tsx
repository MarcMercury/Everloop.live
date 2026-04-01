'use client'

import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Loader2, Sparkles, Palette, RefreshCw, Check, ImageIcon } from 'lucide-react'

// ── Style Options ──────────────────────────────────────

const ART_STYLES = [
  {
    id: 'fantasy-oil',
    label: 'Fantasy Oil',
    description: 'Classic fantasy book cover',
    preview: '🎨',
    accent: 'from-amber-600 to-orange-800',
  },
  {
    id: 'anime',
    label: 'Anime',
    description: 'Vibrant anime aesthetic',
    preview: '✨',
    accent: 'from-pink-500 to-purple-600',
  },
  {
    id: 'comic-book',
    label: 'Comic Book',
    description: 'Bold ink & cel-shading',
    preview: '💥',
    accent: 'from-red-500 to-yellow-500',
  },
  {
    id: 'realistic',
    label: 'Realistic',
    description: 'Photorealistic portrait',
    preview: '📷',
    accent: 'from-slate-500 to-stone-700',
  },
  {
    id: 'watercolor',
    label: 'Watercolor',
    description: 'Soft and ethereal washes',
    preview: '🌊',
    accent: 'from-sky-400 to-teal-500',
  },
  {
    id: 'dark-fantasy',
    label: 'Dark Fantasy',
    description: 'Gothic and atmospheric',
    preview: '🌑',
    accent: 'from-violet-900 to-slate-900',
  },
] as const

type ArtStyleId = (typeof ART_STYLES)[number]['id']

// ── Description Template Fields ────────────────────────

const TEMPLATE_FIELDS = [
  { key: 'pose', label: 'Pose & Expression', placeholder: 'e.g. Stern gaze, arms crossed; Smiling warmly with hand on hip' },
  { key: 'clothing', label: 'Clothing & Armor', placeholder: 'e.g. Worn leather armor with a dark hooded cloak; Elegant blue robes with silver trim' },
  { key: 'accessories', label: 'Accessories & Weapons', placeholder: 'e.g. Glowing staff in hand, raven on shoulder; Twin daggers, silver necklace' },
  { key: 'scars', label: 'Scars, Tattoos & Marks', placeholder: 'e.g. Scar across left cheek; Druidic vine tattoos on arms' },
  { key: 'mood', label: 'Mood & Atmosphere', placeholder: 'e.g. Mysterious and shadowy; Heroic with golden light behind them' },
] as const

interface PortraitGeneratorProps {
  // Character data from forge state
  race: string
  charClass: string
  subclass: string
  name: string
  age: string
  height: string
  weight: string
  eyes: string
  hair: string
  skin: string
  appearance: string
  personality: string
  // Callback when user selects portrait
  onPortraitSelect: (url: string) => void
}

export function PortraitGenerator({
  race, charClass, subclass, name,
  age, height, weight, eyes, hair, skin,
  appearance, personality,
  onPortraitSelect,
}: PortraitGeneratorProps) {
  const [selectedStyle, setSelectedStyle] = useState<ArtStyleId>('fantasy-oil')
  const [templateDetails, setTemplateDetails] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Build the custom details string from template fields
  const customDetails = Object.entries(templateDetails)
    .filter(([, v]) => v.trim())
    .map(([key, v]) => {
      const field = TEMPLATE_FIELDS.find(f => f.key === key)
      return field ? `${field.label}: ${v}` : v
    })
    .join('. ')

  // Collect populated character traits for the preview summary
  const traitSummary = [
    race && `${race}`,
    charClass && (subclass ? `${subclass} ${charClass}` : charClass),
    age && `Age ${age}`,
    eyes && `${eyes} eyes`,
    hair && `${hair} hair`,
    skin && `${skin} skin`,
  ].filter(Boolean)

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/player-deck/portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterData: {
            name, race, class: charClass, subclass,
            age, height, weight, eyes, hair, skin,
            appearance, personality,
            equipment: templateDetails.clothing
              ? `${templateDetails.clothing}${templateDetails.accessories ? `, ${templateDetails.accessories}` : ''}`
              : undefined,
          },
          style: selectedStyle,
          customDetails,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generation failed')
      }

      const data = await res.json()
      setGeneratedImage(data.imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsGenerating(false)
    }
  }, [name, race, charClass, subclass, age, height, weight, eyes, hair, skin, appearance, personality, templateDetails, selectedStyle, customDetails])

  return (
    <Card className="p-5 bg-teal-rich/60 border-gold-500/15 space-y-5">
      <h3 className="text-sm font-serif text-gold-500 flex items-center gap-2">
        <Sparkles className="w-4 h-4" /> AI Portrait Generator
      </h3>
      <p className="text-parchment-muted text-xs leading-relaxed">
        Generate a portrait of your character using AI. Fill in the template below for the best results —
        the more detail you provide, the more accurate the image.
        Your race, class, and physical traits are included automatically.
      </p>

      {/* ── Auto-detected traits summary ── */}
      {traitSummary.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {traitSummary.map(t => (
            <Badge key={t} variant="outline" className="border-gold-500/20 text-gold-500 text-[10px]">
              {t}
            </Badge>
          ))}
          <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 text-[10px]">
            Auto-included
          </Badge>
        </div>
      )}

      {/* ── Description Template ── */}
      <div className="space-y-3">
        <Label className="text-parchment text-xs font-medium flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" /> Description Template
        </Label>
        <p className="text-parchment-muted text-[11px]">
          Fill in any fields below to refine your portrait. Leave blank to let the AI decide.
        </p>
        {TEMPLATE_FIELDS.map(field => (
          <div key={field.key}>
            <Label className="text-parchment-muted text-[11px]">{field.label}</Label>
            <textarea
              value={templateDetails[field.key] || ''}
              onChange={e => setTemplateDetails(prev => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              className="w-full mt-1 bg-charcoal-950 border border-gold-500/10 rounded-md text-parchment text-sm p-2.5 h-16 resize-none placeholder:text-parchment-muted/40"
            />
          </div>
        ))}
      </div>

      {/* ── Style Picker ── */}
      <div className="space-y-3">
        <Label className="text-parchment text-xs font-medium flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" /> Art Style
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ART_STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`relative p-3 rounded-lg border text-left transition-all ${
                selectedStyle === style.id
                  ? 'border-gold-500/50 bg-gold-500/10 ring-1 ring-gold-500/30'
                  : 'border-gold-500/10 bg-charcoal-950/60 hover:border-gold-500/25'
              }`}
            >
              {selectedStyle === style.id && (
                <div className="absolute top-1.5 right-1.5">
                  <Check className="w-3.5 h-3.5 text-gold-500" />
                </div>
              )}
              <div className="text-lg mb-1">{style.preview}</div>
              <div className="text-parchment text-xs font-medium">{style.label}</div>
              <div className="text-parchment-muted text-[10px]">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Generate Button ── */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-gold-500/20 hover:bg-gold-500/30 text-gold-500 border border-gold-500/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : generatedImage ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Portrait
            </>
          )}
        </Button>
        {isGenerating && (
          <span className="text-parchment-muted text-xs">This may take 10–20 seconds...</span>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* ── Generated Image Preview ── */}
      {generatedImage && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-gold-500/20 bg-charcoal-950 max-w-sm mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedImage}
              alt={`AI-generated portrait of ${name || 'character'}`}
              className="w-full h-auto"
            />
          </div>
          <div className="flex justify-center gap-3">
            <Button
              onClick={() => onPortraitSelect(generatedImage)}
              className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20"
            >
              <Check className="w-4 h-4 mr-2" />
              Use as Portrait
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              variant="outline"
              className="border-gold-500/20 text-parchment-muted hover:text-parchment"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
