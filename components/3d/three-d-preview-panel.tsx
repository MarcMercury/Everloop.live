'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Box, Expand, Minimize2, Download } from 'lucide-react'
import { ModelViewer } from '@/components/3d/model-viewer'
import { Generate3DButton } from '@/components/3d/generate-3d-button'
import type { Generate3DMode } from '@/types/meshy'

interface ThreeDPreviewPanelProps {
  /** 'text-to-3d' for prompt-based, 'image-to-3d' for image-based */
  mode: Generate3DMode
  /** Prompt text or image URL depending on mode */
  input: string
  /** Optional existing model URL to display */
  existingModelUrl?: string | null
  /** Called when a new 3D model is generated */
  onModelGenerated?: (modelUrl: string, thumbnailUrl: string) => void
  /** Label text */
  label?: string
  /** Button label override */
  buttonLabel?: string
  /** Extra options for the Meshy API */
  meshyOptions?: Record<string, unknown>
  /** Whether to render as a card or inline */
  asCard?: boolean
}

export function ThreeDPreviewPanel({
  mode,
  input,
  existingModelUrl,
  onModelGenerated,
  label = '3D Model',
  buttonLabel,
  meshyOptions,
  asCard = true,
}: ThreeDPreviewPanelProps) {
  const [modelUrl, setModelUrl] = useState<string | null>(existingModelUrl || null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleComplete = (glbUrl: string, thumb: string) => {
    setModelUrl(glbUrl)
    setThumbnailUrl(thumb)
    setError(null)
    onModelGenerated?.(glbUrl, thumb)
  }

  const handleError = (msg: string) => {
    setError(msg)
  }

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-parchment flex items-center gap-2">
          <Box className="w-4 h-4 text-purple-400" />
          {label}
        </Label>
        {modelUrl && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-purple-400 hover:text-purple-300 p-1 h-auto"
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Expand className="w-4 h-4" />
              )}
            </Button>
            <a
              href={modelUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 p-1"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* 3D Preview Area */}
      {modelUrl ? (
        <div
          className={`rounded-lg border border-purple-500/20 bg-teal-deep/30 overflow-hidden transition-all duration-300 ${
            isExpanded ? 'aspect-[4/3]' : 'aspect-square'
          }`}
        >
          <ModelViewer
            modelUrl={modelUrl}
            className="w-full h-full"
            autoRotate={true}
          />
        </div>
      ) : (
        <div className="aspect-square rounded-lg border border-purple-500/10 bg-teal-deep/20 flex flex-col items-center justify-center">
          <Box className="w-12 h-12 text-purple-500/20 mb-3" />
          <p className="text-parchment-muted/50 text-sm text-center px-6">
            {mode === 'image-to-3d'
              ? 'Generate a 2D image first, then convert it to a 3D model'
              : 'Generate a 3D model from the description'}
          </p>
        </div>
      )}

      {/* Generate Button */}
      <Generate3DButton
        mode={mode}
        input={input}
        options={meshyOptions}
        onComplete={handleComplete}
        onError={handleError}
        label={buttonLabel}
        disabled={!input}
      />

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
          {error}
        </p>
      )}
    </div>
  )

  if (!asCard) return content

  return (
    <Card className="border-purple-500/20">
      <CardContent className="pt-6">{content}</CardContent>
    </Card>
  )
}
