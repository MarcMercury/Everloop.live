'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ImageIcon, RefreshCw, Check, Loader2 } from 'lucide-react'
import { REGIONS } from '@/lib/data/regions'
import { ENTITY_ART_STYLE_OPTIONS, type EntityArtStyleId } from '@/lib/data/entity-art-styles'
import { MonsterStatBlock } from '@/components/quests/monster-stat-block'
import type { WizardStepProps } from './types'

const ThreeDPreviewPanel = dynamic(
  () => import('@/components/3d/three-d-preview-panel').then((mod) => mod.ThreeDPreviewPanel),
  { ssr: false }
)

/** Step 7 — Concept art, 3D model, and full stat block preview. */
export function StepArtPreview({ wizard }: WizardStepProps) {
  const {
    name,
    tagline,
    description,
    role,
    regionId,
    isOneOff,
    cr,
    hp,
    ac,
    imageUrl,
    modelUrl,
    setModelUrl,
    artStyle,
    setArtStyle,
    imageCustomDetails,
    setImageCustomDetails,
    isGeneratingImage,
    handleGenerateImage,
    getMonsterStats,
  } = wizard
  const previewStats = getMonsterStats()
  return (
    <div className="space-y-6">
      {/* Stat Summary Card */}
      <Card className="border-red-500/20">
        <CardContent className="pt-4">
          <h3 className="text-lg font-serif text-parchment mb-3">{name || 'Unnamed Monster'}</h3>
          <p className="text-sm text-gold/70 italic mb-4">{tagline}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="p-2 bg-teal-deep/30 rounded text-center">
              <div className="text-parchment-muted text-xs">Role</div>
              <div className="text-parchment font-medium capitalize">{role}</div>
            </div>
            <div className="p-2 bg-teal-deep/30 rounded text-center">
              <div className="text-parchment-muted text-xs">CR</div>
              <div className="text-parchment font-medium">{cr}</div>
            </div>
            <div className="p-2 bg-teal-deep/30 rounded text-center">
              <div className="text-parchment-muted text-xs">HP</div>
              <div className="text-parchment font-medium">{hp}</div>
            </div>
            <div className="p-2 bg-teal-deep/30 rounded text-center">
              <div className="text-parchment-muted text-xs">AC</div>
              <div className="text-parchment font-medium">{ac}</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-parchment-muted">
            <span className="text-gold/60">Region:</span>{' '}
            {REGIONS.find((r) => r.id === regionId)?.name}
            {isOneOff && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px]">
                ONE-OFF
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Concept Art */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-parchment">Concept Art</Label>
              {!imageUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !name.trim() || !description.trim()}
                  className="text-gold hover:text-gold/80 gap-1"
                >
                  {isGeneratingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                  Generate Art
                </Button>
              )}
            </div>

            {/* Style Picker */}
            <div className="space-y-2">
              <Label className="text-parchment-muted text-xs">Art Style</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ENTITY_ART_STYLE_OPTIONS.map((style) => {
                  const selected = artStyle === style.id
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setArtStyle(style.id as EntityArtStyleId)}
                      disabled={isGeneratingImage}
                      className={`relative p-2.5 rounded-lg border text-left transition-all ${
                        selected
                          ? 'border-gold/50 bg-gold/10 ring-1 ring-gold/30'
                          : 'border-gold/10 bg-teal-deep/40 hover:border-gold/25'
                      }`}
                    >
                      {selected && (
                        <div className="absolute top-1.5 right-1.5">
                          <Check className="w-3.5 h-3.5 text-gold" />
                        </div>
                      )}
                      <div className="text-base mb-0.5">{style.preview}</div>
                      <div className="text-parchment text-xs font-medium">{style.label}</div>
                      <div className="text-parchment-muted text-[10px]">{style.description}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Optional refinement */}
            <div className="space-y-1">
              <Label className="text-parchment-muted text-xs">
                Extra Details <span className="text-parchment-muted/60">(optional)</span>
              </Label>
              <textarea
                value={imageCustomDetails}
                onChange={(e) => setImageCustomDetails(e.target.value)}
                placeholder="e.g. crouched mid-stalk, glowing crimson sigils on its hide, fog rolling from its joints"
                disabled={isGeneratingImage}
                className="w-full bg-teal-deep/50 border border-gold/10 rounded-md text-parchment text-sm p-2.5 h-16 resize-none placeholder:text-parchment-muted/40"
              />
              <p className="text-parchment-muted/60 text-[10px]">
                The description above is the source of truth for what the creature looks like.
                Use this field only to nudge pose, mood, or framing.
              </p>
            </div>

            <div className="aspect-square rounded-lg border border-gold/20 bg-teal-deep/30 overflow-hidden relative">
              {isGeneratingImage ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
                  <p className="text-parchment-muted text-sm">Generating concept art...</p>
                </div>
              ) : imageUrl ? (
                // Generated art URLs are arbitrary remote/data URLs not covered by next/image config.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={name || 'Monster concept art'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-parchment-muted/30 mb-4" />
                  <p className="text-parchment-muted/60 text-sm text-center px-8">
                    Complete lore and description, then generate this horror&apos;s visual design
                  </p>
                </div>
              )}
            </div>

            {imageUrl && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="flex-1 gap-1"
                >
                  <RefreshCw className={`w-4 h-4 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                  disabled
                >
                  <Check className="w-4 h-4" />
                  Kept
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3D Model */}
      <ThreeDPreviewPanel
        mode={imageUrl ? 'image-to-3d' : 'text-to-3d'}
        input={imageUrl || description}
        existingModelUrl={modelUrl}
        onModelGenerated={(glbUrl) => setModelUrl(glbUrl)}
        label="3D Monster Model"
        buttonLabel={imageUrl ? 'Convert to 3D Model' : 'Generate 3D from Description'}
        meshyOptions={{ enable_pbr: true }}
      />

      {/* Full D&D 5e Stat Block Preview */}
      <Card className="border-gold/30">
        <CardContent className="pt-4">
          <div className="text-xs uppercase tracking-wider text-gold/70 mb-3">
            Stat Block Preview — this is what DMs and players will see in quests
          </div>
          <MonsterStatBlock stats={previewStats} name={name || 'Unnamed Monster'} />
        </CardContent>
      </Card>
    </div>
  )
}
