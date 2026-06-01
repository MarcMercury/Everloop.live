'use client'

/**
 * Projector View
 * --------------
 * Fullscreen, distraction-free image surface intended to be opened on a
 * second monitor / projector / casted display while the DM runs the
 * In-Person Dashboard on the primary screen.
 *
 * Receives image pushes from the dashboard via BroadcastChannel +
 * localStorage (no server round-trip — both windows are on the same machine).
 */

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface Payload {
  imageUrl: string | null
  caption: string | null
  sceneTitle: string | null
  mood: string | null
}

function ProjectorInner() {
  const search = useSearchParams()
  const sessionId = search.get('sessionId')
  const [payload, setPayload] = useState<Payload>({
    imageUrl: null, caption: null, sceneTitle: null, mood: null,
  })

  useEffect(() => {
    if (!sessionId) return
    const key = `everloop-projector-${sessionId}`

    // Hydrate from last-known
    try {
      const raw = localStorage.getItem(key)
      if (raw) setPayload(JSON.parse(raw))
    } catch { /* ignore */ }

    // Subscribe
    let bc: BroadcastChannel | null = null
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel(key)
      bc.onmessage = (e) => setPayload(e.data as Payload)
    }
    // Fallback: storage events (cross-tab in same origin)
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try { setPayload(JSON.parse(e.newValue)) } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      bc?.close()
      window.removeEventListener('storage', onStorage)
    }
  }, [sessionId])

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-parchment-muted text-sm">
        Missing sessionId — open this from the In-Person Dashboard.
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
      {payload.imageUrl ? (
        <>
          <img
            src={payload.imageUrl}
            alt={payload.caption ?? ''}
            className="max-w-full max-h-full object-contain"
          />
          {(payload.caption || payload.sceneTitle) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 text-center">
              {payload.sceneTitle && (
                <div className="text-xs uppercase tracking-[0.3em] text-amber-200/80 mb-1">
                  {payload.sceneTitle}
                </div>
              )}
              {payload.caption && (
                <div className="text-2xl font-serif text-parchment">{payload.caption}</div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-parchment-muted/40">
          <div className="text-6xl font-serif mb-2 opacity-30">●</div>
          <div className="text-sm">Awaiting the DM…</div>
        </div>
      )}
    </div>
  )
}

export default function ProjectorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ProjectorInner />
    </Suspense>
  )
}
