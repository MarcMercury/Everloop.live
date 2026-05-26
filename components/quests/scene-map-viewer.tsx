'use client'

import { useEffect, useState } from 'react'
import { Download, Maximize2, X } from 'lucide-react'

interface SceneMapViewerProps {
  mapUrl: string
  alt?: string
  /** Filename used when downloading. */
  downloadName?: string
}

/**
 * Renders an AI-generated scene battle map with:
 *  - A Settlers-of-Catan-style hex grid overlay (subtle borders)
 *  - An "Expand" action that opens a full-width modal
 *  - A "Download" action that saves the map (with hex overlay baked in) as a PNG
 */
export function SceneMapViewer({
  mapUrl,
  alt = 'Scene map',
  downloadName = 'scene-map.png',
}: SceneMapViewerProps) {
  const [expanded, setExpanded] = useState(false)

  // Close modal on Escape
  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded])

  return (
    <>
      {/* Thumbnail */}
      <div className="relative inline-block group">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="block focus:outline-none focus:ring-2 focus:ring-gold/40 rounded"
          title="Expand map"
        >
          <MapWithHexOverlay
            src={mapUrl}
            alt={alt}
            className="w-32 h-32 object-cover rounded border border-gold/20"
            hexSize={10}
          />
          <span className="absolute inset-0 rounded bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Maximize2 className="w-5 h-5 text-parchment" />
          </span>
        </button>
      </div>

      {expanded && (
        <ExpandedMap
          mapUrl={mapUrl}
          alt={alt}
          downloadName={downloadName}
          onClose={() => setExpanded(false)}
        />
      )}
    </>
  )
}

function ExpandedMap({
  mapUrl,
  alt,
  downloadName,
  onClose,
}: {
  mapUrl: string
  alt: string
  downloadName: string
  onClose: () => void
}) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      await downloadMapWithHexOverlay(mapUrl, downloadName)
    } catch (err) {
      console.error('Map download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[92vh] bg-teal-deep border border-gold/30 rounded-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gold/20">
          <h3 className="text-parchment font-serif text-base truncate">{alt}</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gold/30 text-parchment hover:bg-gold/10 text-sm disabled:opacity-50"
              title="Download map as PNG (with hex grid)"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Preparing…' : 'Download'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gold/20 text-parchment-muted hover:text-parchment hover:bg-gold/10 text-sm"
              title="Close"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>

        {/* Map body */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
          <MapWithHexOverlay
            src={mapUrl}
            alt={alt}
            className="max-w-full max-h-[80vh] object-contain rounded shadow-lg"
            hexSize={36}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Displays an image with an SVG hex grid overlay sized to the rendered image.
 * The overlay mimics Settlers of Catan: thin, visible-but-subtle borders.
 */
function MapWithHexOverlay({
  src,
  alt,
  className,
  hexSize,
}: {
  src: string
  alt: string
  className?: string
  /** Hex circumradius in pixels (relative to displayed image). */
  hexSize: number
}) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)

  return (
    <span className="relative inline-block leading-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={className}
        crossOrigin="anonymous"
        onLoad={(e) => {
          const img = e.currentTarget
          setDims({ w: img.clientWidth, h: img.clientHeight })
        }}
      />
      {dims && (
        <HexGridSvg
          width={dims.w}
          height={dims.h}
          hexSize={hexSize}
          stroke="rgba(20, 18, 12, 0.55)"
          strokeWidth={1}
        />
      )}
    </span>
  )
}

function HexGridSvg({
  width,
  height,
  hexSize,
  stroke,
  strokeWidth,
}: {
  width: number
  height: number
  hexSize: number
  stroke: string
  strokeWidth: number
}) {
  const path = buildHexGridPath(width, height, hexSize)
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      <path d={path} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  )
}

/**
 * Build a single SVG path containing all hex outlines for the grid.
 * Uses pointy-top hexes laid out in offset rows (Catan-style).
 */
function buildHexGridPath(width: number, height: number, hexSize: number): string {
  // For pointy-top hexes: width = sqrt(3) * size, height = 2 * size
  const hexW = Math.sqrt(3) * hexSize
  const hexH = 2 * hexSize
  const vertSpacing = hexH * 0.75
  const cols = Math.ceil(width / hexW) + 2
  const rows = Math.ceil(height / vertSpacing) + 2

  const parts: string[] = []
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const cx = col * hexW + (row % 2 === 0 ? 0 : hexW / 2)
      const cy = row * vertSpacing
      // pointy-top hex vertices (angles 30, 90, 150, 210, 270, 330)
      const pts: Array<[number, number]> = []
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i - 30)
        pts.push([cx + hexSize * Math.cos(angle), cy + hexSize * Math.sin(angle)])
      }
      parts.push(
        `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)} ` +
          pts.slice(1).map((p) => `L ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ') +
          ' Z'
      )
    }
  }
  return parts.join(' ')
}

/**
 * Downloads the map as a PNG with the hex overlay baked in.
 * Renders the source image to a canvas at its natural resolution, then
 * draws the hex grid on top, scaling the hex size to the image's natural size.
 */
async function downloadMapWithHexOverlay(mapUrl: string, filename: string): Promise<void> {
  const img = await loadImage(mapUrl)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.drawImage(img, 0, 0)

  // Scale hex size to image: aim for ~24 hex columns across.
  const hexSize = canvas.width / 24 / Math.sqrt(3)
  drawHexGrid(ctx, canvas.width, canvas.height, hexSize)

  // Try blob first (better for large images); fall back to data URL.
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      try {
        if (blob) {
          const url = URL.createObjectURL(blob)
          triggerDownload(url, filename)
          setTimeout(() => URL.revokeObjectURL(url), 5000)
        } else {
          triggerDownload(canvas.toDataURL('image/png'), filename)
        }
        resolve()
      } catch (e) {
        reject(e)
      }
    }, 'image/png')
  })
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = src
  })
}

function drawHexGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  hexSize: number,
) {
  const hexW = Math.sqrt(3) * hexSize
  const hexH = 2 * hexSize
  const vertSpacing = hexH * 0.75
  const cols = Math.ceil(width / hexW) + 2
  const rows = Math.ceil(height / vertSpacing) + 2

  ctx.save()
  ctx.strokeStyle = 'rgba(20, 18, 12, 0.55)'
  ctx.lineWidth = Math.max(1, hexSize * 0.04)
  ctx.beginPath()
  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const cx = col * hexW + (row % 2 === 0 ? 0 : hexW / 2)
      const cy = row * vertSpacing
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i - 30)
        const px = cx + hexSize * Math.cos(angle)
        const py = cy + hexSize * Math.sin(angle)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
    }
  }
  ctx.stroke()
  ctx.restore()
}
