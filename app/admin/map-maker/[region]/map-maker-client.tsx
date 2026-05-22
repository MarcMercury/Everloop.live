'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import type { EverloopRegion } from '@/lib/data/regions'
import type { MapLabel } from '@/lib/data/map-labels'

interface RegionLocation {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  stability: number
  tags: string[]
  imageUrl: string | null
  x: number
  z: number
  createdAt: string
}

interface Props {
  region: EverloopRegion
  staticLabels: MapLabel[]
}

type DraftMap = Record<string, { x: number; z: number }>

const SIZE_COLOR: Record<string, string> = {
  city: '#f0d890',
  town: '#d4a84b',
  village: '#b0c090',
  landmark: '#c090e0',
  ruin: '#888',
  tavern: '#d08040',
  outpost: '#80b0d0',
}

const SIZE_DOT: Record<string, number> = {
  city: 12, town: 10, landmark: 9, tavern: 8, outpost: 8, village: 7, ruin: 7,
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    location: '#d4a84b', character: '#6ec6ff', artifact: '#e066ff',
    faction: '#ff6b6b', creature: '#66ff9e', event: '#ffaa66', concept: '#66d9ff',
  }
  return colors[type] || '#d4a84b'
}

export default function MapMakerClient({ region, staticLabels }: Props) {
  // ---------------- Data ----------------
  const [labelDrafts, setLabelDrafts] = useState<DraftMap>({})
  const [entityDrafts, setEntityDrafts] = useState<DraftMap>({})
  const [entities, setEntities] = useState<RegionLocation[]>([])
  const [labelOverrides, setLabelOverrides] = useState<DraftMap>({})
  const [imageLoaded, setImageLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [selected, setSelected] = useState<{ kind: 'label' | 'entity'; key: string } | null>(null)

  // ---------------- Pan / zoom ----------------
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })
  const panOrigin = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)

  // ---------------- Drag pin state ----------------
  const dragRef = useRef<
    | null
    | { kind: 'label' | 'entity'; key: string; moved: boolean }
  >(null)

  // ---------------- Load overrides + entities ----------------
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [overridesRes, entitiesRes] = await Promise.all([
          fetch(`/api/map/regions/${region.id}/label-overrides`, { cache: 'no-store' }),
          fetch(`/api/map/regions/${region.id}/locations`, { cache: 'no-store' }),
        ])
        if (overridesRes.ok) {
          const data = await overridesRes.json()
          if (!cancelled) setLabelOverrides(data.overrides ?? {})
        }
        if (entitiesRes.ok) {
          const data = await entitiesRes.json()
          if (!cancelled) setEntities(data.locations ?? [])
        }
      } catch (err) {
        console.error('Map maker load failed:', err)
      }
    }
    load()
    return () => { cancelled = true }
  }, [region.id])

  // ---------------- Resolved positions ----------------
  const resolvedLabels = useMemo(() => {
    return staticLabels.map((l) => {
      const draft = labelDrafts[l.name]
      const override = labelOverrides[l.name]
      const pos = draft ?? override ?? { x: l.x, z: l.z }
      return { ...l, x: pos.x, z: pos.z, hasOverride: !!override, isDirty: !!draft }
    })
  }, [staticLabels, labelDrafts, labelOverrides])

  const resolvedEntities = useMemo(() => {
    // De-dupe: hide canon entities whose name is also a static label.
    const labelNames = new Set(staticLabels.map((l) => l.name.toLowerCase()))
    return entities
      .filter((e) => !labelNames.has(e.name.toLowerCase()))
      .map((e) => {
        const draft = entityDrafts[e.id]
        const pos = draft ?? { x: e.x, z: e.z }
        return { ...e, x: pos.x, z: pos.z, isDirty: !!draft }
      })
  }, [entities, entityDrafts, staticLabels])

  const dirtyCount =
    Object.keys(labelDrafts).length + Object.keys(entityDrafts).length

  // ---------------- Pan / zoom handlers ----------------
  const handleSurfacePointerDown = useCallback((e: React.PointerEvent) => {
    // Only pan when clicking the background (not a pin)
    if ((e.target as HTMLElement).dataset.pin) return
    if (e.button !== 0) return
    isPanning.current = true
    panStart.current = { x: e.clientX, y: e.clientY }
    panOrigin.current = { ...pan }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }, [pan])

  const handleSurfacePointerMove = useCallback((e: React.PointerEvent) => {
    if (isPanning.current) {
      const dx = e.clientX - panStart.current.x
      const dy = e.clientY - panStart.current.y
      setPan({ x: panOrigin.current.x + dx, y: panOrigin.current.y + dy })
      return
    }
  }, [])

  const handleSurfacePointerUp = useCallback(() => {
    isPanning.current = false
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    setZoom((prev) => {
      const next = Math.min(8, Math.max(0.3, prev - e.deltaY * 0.002))
      const factor = 1 - next / prev
      setPan((p) => ({
        x: p.x + (mouseX - cx - p.x) * factor,
        y: p.y + (mouseY - cy - p.y) * factor,
      }))
      return next
    })
  }, [])

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 })
    setZoom(1)
  }, [])

  // ---------------- Pin drag ----------------
  const beginPinDrag = useCallback(
    (e: React.PointerEvent, kind: 'label' | 'entity', key: string) => {
      e.stopPropagation()
      e.preventDefault()
      dragRef.current = { kind, key, moved: false }
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
      setSelected({ kind, key })
    },
    []
  )

  const handlePinPointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const surface = surfaceRef.current
    if (!surface) return

    const rect = surface.getBoundingClientRect()
    // Convert client coords into the surface's percentage space
    const xPct = ((e.clientX - rect.left) / rect.width) * 100
    const zPct = ((e.clientY - rect.top) / rect.height) * 100
    const x = Math.max(0, Math.min(100, xPct))
    const z = Math.max(0, Math.min(100, zPct))

    drag.moved = true
    if (drag.kind === 'label') {
      setLabelDrafts((prev) => ({ ...prev, [drag.key]: { x, z } }))
    } else {
      setEntityDrafts((prev) => ({ ...prev, [drag.key]: { x, z } }))
    }
  }, [])

  const endPinDrag = useCallback((e: React.PointerEvent) => {
    if (dragRef.current) {
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
    }
    dragRef.current = null
  }, [])

  // ---------------- Save / discard ----------------
  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaveMessage(null)
    try {
      const body = {
        regionId: region.id,
        labels: Object.entries(labelDrafts).map(([name, pos]) => ({ name, ...pos })),
        entities: Object.entries(entityDrafts).map(([id, pos]) => ({ id, ...pos })),
      }
      const res = await fetch('/api/admin/map-maker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSaveMessage(`Save failed: ${data.error ?? res.status}`)
        return
      }
      // Bake drafts into committed overrides locally
      setLabelOverrides((prev) => ({ ...prev, ...labelDrafts }))
      setEntities((prev) =>
        prev.map((e) => entityDrafts[e.id]
          ? { ...e, x: entityDrafts[e.id].x, z: entityDrafts[e.id].z }
          : e
        )
      )
      setLabelDrafts({})
      setEntityDrafts({})
      setSaveMessage(`Saved ${data.savedLabels} label(s), ${data.savedEntities} entity position(s).`)
      setTimeout(() => setSaveMessage(null), 4000)
    } catch (err) {
      setSaveMessage(`Save failed: ${(err as Error).message}`)
    } finally {
      setSaving(false)
    }
  }, [labelDrafts, entityDrafts, region.id])

  const handleDiscard = useCallback(() => {
    setLabelDrafts({})
    setEntityDrafts({})
    setSaveMessage(null)
  }, [])

  const handleResetLabel = useCallback(async (name: string) => {
    if (!confirm(`Reset "${name}" to its default position?`)) return
    setSaving(true)
    try {
      const res = await fetch(
        `/api/admin/map-maker?regionId=${encodeURIComponent(region.id)}&labelName=${encodeURIComponent(name)}`,
        { method: 'DELETE' }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setSaveMessage(`Reset failed: ${data.error ?? res.status}`)
        return
      }
      // Remove from local overrides and any pending draft
      setLabelOverrides((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
      setLabelDrafts((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
      setSaveMessage(`Reset "${name}" to default.`)
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setSaving(false)
    }
  }, [region.id])

  // ---------------- Render ----------------
  if (!region.mapImage) {
    return (
      <div className="p-12 text-center text-parchment-muted">
        This region has no map image yet — nothing to edit.
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-gold/10 bg-charcoal-900/40 flex items-center gap-3 flex-wrap sticky top-0 z-30 backdrop-blur">
        <span className="text-xs text-parchment-muted">
          Drag any pin to reposition. Pan the map with the background.
        </span>
        <div className="flex-1" />
        {dirtyCount > 0 && (
          <span className="text-xs text-gold">
            {dirtyCount} unsaved change{dirtyCount === 1 ? '' : 's'}
          </span>
        )}
        {saveMessage && (
          <span className="text-xs text-parchment">{saveMessage}</span>
        )}
        <button
          onClick={handleDiscard}
          disabled={dirtyCount === 0 || saving}
          className="px-3 py-1.5 rounded-md border border-charcoal-700 text-xs text-parchment-muted hover:text-parchment hover:border-gold/30 transition-colors disabled:opacity-40"
        >
          Discard
        </button>
        <button
          onClick={handleSave}
          disabled={dirtyCount === 0 || saving}
          className="px-3 py-1.5 rounded-md text-xs font-medium border border-gold/40 bg-gold/20 text-gold hover:bg-gold/30 transition-colors disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Selected pin panel */}
      {selected && (() => {
        const labelMatch = resolvedLabels.find((l) => selected.kind === 'label' && l.name === selected.key)
        const entityMatch = resolvedEntities.find((e) => selected.kind === 'entity' && e.id === selected.key)
        const x = labelMatch?.x ?? entityMatch?.x ?? 0
        const z = labelMatch?.z ?? entityMatch?.z ?? 0
        const title = labelMatch?.name ?? entityMatch?.name ?? ''
        if (!title) return null
        return (
          <div className="absolute top-20 right-4 z-30 w-72 rounded-xl p-4 backdrop-blur-xl border border-gold/20 bg-charcoal-900/90">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-parchment-muted">
                  {selected.kind === 'label' ? `Static · ${labelMatch?.size}` : `Canon · ${entityMatch?.type}`}
                </div>
                <h3 className="text-sm font-serif font-bold text-gold">{title}</h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-parchment-muted hover:text-parchment p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-parchment-muted">X (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={x.toFixed(2)}
                  onChange={(e) => {
                    const nx = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))
                    if (selected.kind === 'label') setLabelDrafts((p) => ({ ...p, [selected.key]: { x: nx, z } }))
                    else setEntityDrafts((p) => ({ ...p, [selected.key]: { x: nx, z } }))
                  }}
                  className="w-full mt-1 px-2 py-1 rounded bg-charcoal-700 border border-charcoal-600 text-parchment text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-parchment-muted">Z (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={z.toFixed(2)}
                  onChange={(e) => {
                    const nz = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))
                    if (selected.kind === 'label') setLabelDrafts((p) => ({ ...p, [selected.key]: { x, z: nz } }))
                    else setEntityDrafts((p) => ({ ...p, [selected.key]: { x, z: nz } }))
                  }}
                  className="w-full mt-1 px-2 py-1 rounded bg-charcoal-700 border border-charcoal-600 text-parchment text-xs"
                />
              </div>
            </div>
            {selected.kind === 'label' && (
              <button
                onClick={() => handleResetLabel(selected.key)}
                className="mt-3 w-full text-[11px] text-parchment-muted hover:text-parchment py-1.5 rounded border border-charcoal-700 hover:border-gold/30 transition-colors"
              >
                Reset to code default
              </button>
            )}
          </div>
        )
      })()}

      {/* Map surface */}
      <div
        ref={containerRef}
        className="relative w-full h-[calc(100vh-160px)] overflow-hidden bg-charcoal"
        style={{ cursor: isPanning.current ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={handleSurfacePointerDown}
        onPointerMove={handleSurfacePointerMove}
        onPointerUp={handleSurfacePointerUp}
        onPointerCancel={handleSurfacePointerUp}
        onWheel={handleWheel}
      >
        {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
          <button
            onClick={(e) => { e.stopPropagation(); resetView() }}
            className="absolute bottom-4 right-4 z-30 px-3 py-2 rounded-lg text-xs font-medium backdrop-blur-xl border border-gold/30 bg-charcoal-900/90 text-gold"
          >
            ↻ Reset View
          </button>
        )}

        <div
          ref={surfaceRef}
          className="relative w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning.current ? 'none' : 'transform 0.15s ease-out',
          }}
          onPointerMove={handlePinPointerMove}
          onPointerUp={endPinDrag}
          onPointerCancel={endPinDrag}
        >
          <Image
            src={region.mapImage}
            alt={`Map of ${region.name}`}
            fill
            className="object-contain transition-opacity duration-700 pointer-events-none select-none"
            style={{ opacity: imageLoaded ? 1 : 0 }}
            onLoad={() => setImageLoaded(true)}
            priority
            sizes="100vw"
            draggable={false}
          />

          {/* Static labels */}
          {imageLoaded && resolvedLabels.map((label) => {
            const color = SIZE_COLOR[label.size] ?? '#d4a84b'
            const size = SIZE_DOT[label.size] ?? 8
            const isSelected = selected?.kind === 'label' && selected.key === label.name
            return (
              <div
                key={`label-${label.name}`}
                data-pin="label"
                className="absolute z-10"
                style={{
                  left: `${label.x}%`,
                  top: `${label.z}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'grab',
                  touchAction: 'none',
                }}
                onPointerDown={(e) => beginPinDrag(e, 'label', label.name)}
              >
                <div
                  data-pin="label"
                  className="rounded-full"
                  style={{
                    width: size + (isSelected ? 4 : 0),
                    height: size + (isSelected ? 4 : 0),
                    background: color,
                    boxShadow: `0 0 ${size}px ${color}80, 0 0 ${size * 2}px ${color}30`,
                    border: `2px solid ${isSelected ? '#fff' : color}`,
                    outline: label.isDirty ? '2px dashed #ffeb6c' : 'none',
                    outlineOffset: 2,
                  }}
                />
                <div
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
                  style={{ top: size + 4 }}
                >
                  <span
                    className="text-[10px] font-serif font-bold px-1 py-0.5 rounded"
                    style={{
                      color,
                      textShadow: '0 0 6px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)',
                      background: isSelected ? 'rgba(5,10,15,0.8)' : 'transparent',
                    }}
                  >
                    {label.name}
                    {label.hasOverride && !label.isDirty && <span className="ml-1 opacity-60">·moved</span>}
                    {label.isDirty && <span className="ml-1 text-gold">·unsaved</span>}
                  </span>
                </div>
              </div>
            )
          })}

          {/* Canon entity pins */}
          {imageLoaded && resolvedEntities.map((loc) => {
            const color = getTypeColor(loc.type)
            const isSelected = selected?.kind === 'entity' && selected.key === loc.id
            return (
              <div
                key={`entity-${loc.id}`}
                data-pin="entity"
                className="absolute z-20"
                style={{
                  left: `${loc.x}%`,
                  top: `${loc.z}%`,
                  transform: 'translate(-50%, -100%)',
                  cursor: 'grab',
                  touchAction: 'none',
                }}
                onPointerDown={(e) => beginPinDrag(e, 'entity', loc.id)}
              >
                <div className="relative flex flex-col items-center pointer-events-none">
                  <div
                    data-pin="entity"
                    className="relative w-8 h-8 rounded-full flex items-center justify-center pointer-events-auto"
                    style={{
                      background: `linear-gradient(135deg, rgba(10,20,25,0.95), rgba(15,30,35,0.9))`,
                      border: `2px solid ${isSelected ? '#fff' : color}`,
                      boxShadow: `0 0 ${isSelected ? 16 : 8}px ${color}80`,
                      outline: loc.isDirty ? '2px dashed #ffeb6c' : 'none',
                      outlineOffset: 2,
                    }}
                  >
                    <span className="text-xs" style={{ color }}>◈</span>
                  </div>
                  <div className="w-0.5 h-2" style={{ background: `${color}80` }} />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span
                      className="text-[10px] font-serif font-bold px-1.5 py-0.5 rounded"
                      style={{
                        color,
                        textShadow: '0 0 6px rgba(0,0,0,0.9)',
                        background: isSelected ? 'rgba(5,10,15,0.8)' : 'transparent',
                      }}
                    >
                      {loc.name}
                      {loc.isDirty && <span className="ml-1 text-gold">·unsaved</span>}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
