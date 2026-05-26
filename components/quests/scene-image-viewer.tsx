'use client'

import { Download, Maximize2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SceneImageViewerProps {
  imageUrl: string
  alt?: string
  downloadName?: string
}

/**
 * Scene illustration viewer: thumbnail click-to-expand modal with download.
 * Used for the AI-generated atmospheric scene image (NOT the tactical map).
 */
export function SceneImageViewer({ imageUrl, alt = 'Scene illustration', downloadName = 'scene-image.png' }: SceneImageViewerProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="relative group block w-32 h-32 rounded overflow-hidden border border-gold/20 hover:border-gold/50 transition"
        title="Click to expand"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={alt} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition">
          <Maximize2 className="w-5 h-5 text-parchment opacity-0 group-hover:opacity-100 transition" />
        </div>
      </button>
      {expanded && (
        <ExpandedImage imageUrl={imageUrl} alt={alt} downloadName={downloadName} onClose={() => setExpanded(false)} />
      )}
    </>
  )
}

function ExpandedImage({
  imageUrl,
  alt,
  downloadName,
  onClose,
}: {
  imageUrl: string
  alt: string
  downloadName: string
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleDownload() {
    try {
      const res = await fetch(imageUrl, { cache: 'no-store' })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = downloadName
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      window.open(imageUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[92vh] bg-teal-rich border border-gold/30 rounded-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-gold/20 bg-teal-rich/80">
          <span className="text-parchment text-sm truncate">{alt}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-gold/30 text-parchment hover:bg-gold/10 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-gold/30 text-parchment hover:bg-gold/10 text-xs"
            >
              <X className="w-3.5 h-3.5" />
              Close
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center bg-black/40 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={alt} className="max-w-full max-h-[80vh] object-contain" />
        </div>
      </div>
    </div>
  )
}
