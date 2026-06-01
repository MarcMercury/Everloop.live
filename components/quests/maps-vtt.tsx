'use client'

/**
 * MapsVTT — minimal in-browser VTT for a quest scene.
 *
 * Features (MVP):
 *  - Scene map image background (uses scene.map_url or scene.image_url)
 *  - Toggleable square grid overlay
 *  - Draggable tokens (PCs + monsters) with HP/AC labels
 *  - Measurement tool: click two points → distance in 5ft squares
 *  - Fog-of-war "reveal" brush (circles)
 *
 * Persistence: state saved to quest_scenes.metadata.vtt via server action.
 * No new tables, no migrations.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Grid3x3, Ruler, Cloud, Eraser, Plus, Save, Trash2 } from 'lucide-react'
import { saveVttState, type VttState, type VttToken } from '@/lib/actions/vtt'

interface Props {
  sceneId: string
  bgUrl: string | null
  initialState?: Partial<VttState> | null
  isDM: boolean
}

type Tool = 'select' | 'measure' | 'reveal' | 'add-token'

function defaultState(bgUrl: string | null): VttState {
  return {
    tokens: [],
    gridSize: 50,
    showGrid: true,
    fog: [],
    revealed: [],
    bgUrl,
  }
}

export function MapsVTT({ sceneId, bgUrl, initialState, isDM }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const bgImageRef = useRef<HTMLImageElement | null>(null)
  const [state, setState] = useState<VttState>(() => ({ ...defaultState(bgUrl), ...(initialState ?? {}) }))
  const [tool, setTool] = useState<Tool>('select')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [measure, setMeasure] = useState<{ x1: number; y1: number; x2?: number; y2?: number } | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load background image.
  useEffect(() => {
    const url = state.bgUrl
    if (!url) {
      bgImageRef.current = null
      draw()
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      bgImageRef.current = img
      draw()
    }
    img.src = url
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.bgUrl])

  // Redraw on state change.
  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, measure])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width, height } = canvas

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#0c1416'
    ctx.fillRect(0, 0, width, height)

    if (bgImageRef.current) {
      const img = bgImageRef.current
      const scale = Math.min(width / img.width, height / img.height)
      const dw = img.width * scale
      const dh = img.height * scale
      const dx = (width - dw) / 2
      const dy = (height - dh) / 2
      ctx.drawImage(img, dx, dy, dw, dh)
    }

    // Grid
    if (state.showGrid) {
      ctx.strokeStyle = 'rgba(212, 168, 75, 0.18)'
      ctx.lineWidth = 1
      for (let x = 0; x <= width; x += state.gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
      }
      for (let y = 0; y <= height; y += state.gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
      }
    }

    // Fog reveals (cut holes in dark overlay)
    if (state.fog.length > 0) {
      ctx.save()
      ctx.fillStyle = 'rgba(8, 10, 12, 0.7)'
      ctx.fillRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'destination-out'
      for (const f of state.fog) {
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    // Tokens
    for (const t of state.tokens) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2)
      ctx.fillStyle = t.color
      ctx.globalAlpha = 0.85
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.lineWidth = 2
      ctx.strokeStyle = t.isPC ? '#5eead4' : '#fda4af'
      ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 11px Georgia, serif'
      ctx.textAlign = 'center'
      ctx.fillText(t.label.slice(0, 8), t.x, t.y + 3)
      if (t.hp != null && t.maxHp) {
        const pct = Math.max(0, Math.min(1, t.hp / t.maxHp))
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillRect(t.x - t.size, t.y + t.size + 2, t.size * 2, 4)
        ctx.fillStyle = pct > 0.5 ? '#10b981' : pct > 0.25 ? '#f59e0b' : '#ef4444'
        ctx.fillRect(t.x - t.size, t.y + t.size + 2, t.size * 2 * pct, 4)
      }
      ctx.restore()
    }

    // Measurement
    if (measure && measure.x2 != null && measure.y2 != null) {
      ctx.save()
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      ctx.moveTo(measure.x1, measure.y1)
      ctx.lineTo(measure.x2, measure.y2)
      ctx.stroke()
      const dx = measure.x2 - measure.x1
      const dy = measure.y2 - measure.y1
      const squares = Math.round(Math.sqrt(dx * dx + dy * dy) / state.gridSize)
      ctx.setLineDash([])
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 12px Georgia, serif'
      ctx.fillText(`${squares * 5} ft`, (measure.x1 + measure.x2) / 2, (measure.y1 + measure.y2) / 2 - 8)
      ctx.restore()
    }
  }, [state, measure])

  // Resize canvas to container.
  useEffect(() => {
    function resize() {
      const c = canvasRef.current
      const wrap = containerRef.current
      if (!c || !wrap) return
      const w = wrap.clientWidth
      const h = Math.min(700, Math.max(400, w * 0.6))
      c.width = w
      c.height = h
      draw()
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [draw])

  function hit(x: number, y: number): VttToken | null {
    for (let i = state.tokens.length - 1; i >= 0; i--) {
      const t = state.tokens[i]
      const dx = x - t.x
      const dy = y - t.y
      if (dx * dx + dy * dy <= t.size * t.size) return t
    }
    return null
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDM) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === 'measure') {
      setMeasure({ x1: x, y1: y })
      return
    }
    if (tool === 'reveal') {
      setState((s) => ({ ...s, fog: [...s.fog, { x, y, r: 80 }] }))
      setDirty(true)
      return
    }
    if (tool === 'add-token') {
      const isPC = confirm('Player character? OK = PC, Cancel = Monster.')
      const label = prompt('Token label?') ?? 'New'
      const token: VttToken = {
        id: crypto.randomUUID(),
        label,
        color: isPC ? '#0e7490' : '#7f1d1d',
        x, y,
        size: state.gridSize / 2 - 4,
        isPC,
        hp: 10,
        maxHp: 10,
      }
      setState((s) => ({ ...s, tokens: [...s.tokens, token] }))
      setDirty(true)
      setTool('select')
      return
    }

    const t = hit(x, y)
    if (t) setDraggingId(t.id)
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (measure && measure.x2 == null) {
      setMeasure({ ...measure, x2: x, y2: y })
    } else if (measure && tool === 'measure') {
      setMeasure({ ...measure, x2: x, y2: y })
    }
    if (draggingId) {
      // Snap to grid.
      const g = state.gridSize
      const snapped = { x: Math.round(x / g) * g + g / 2, y: Math.round(y / g) * g + g / 2 }
      setState((s) => ({
        ...s,
        tokens: s.tokens.map((t) => (t.id === draggingId ? { ...t, x: snapped.x, y: snapped.y } : t)),
      }))
      setDirty(true)
    }
  }

  function onPointerUp() {
    setDraggingId(null)
    if (tool === 'measure' && measure) {
      // Keep last measurement visible briefly, then clear.
      setTimeout(() => setMeasure(null), 1500)
    }
  }

  async function save() {
    setSaving(true)
    try {
      await saveVttState(sceneId, state)
      setDirty(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function clearFog() {
    if (!confirm('Reset fog of war (re-cover the map)?')) return
    setState((s) => ({ ...s, fog: [] }))
    setDirty(true)
  }

  function removeSelectedToken() {
    if (!draggingId) {
      const label = prompt('Token label to remove?')
      if (!label) return
      setState((s) => ({ ...s, tokens: s.tokens.filter((t) => t.label !== label) }))
    } else {
      setState((s) => ({ ...s, tokens: s.tokens.filter((t) => t.id !== draggingId) }))
    }
    setDirty(true)
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      {isDM && (
        <div className="flex items-center gap-1 flex-wrap p-2 bg-charcoal-900/60 rounded border border-gold/10">
          <ToolBtn label="Select" active={tool === 'select'} onClick={() => setTool('select')} />
          <ToolBtn icon={<Plus className="w-3.5 h-3.5" />} label="Token" active={tool === 'add-token'} onClick={() => setTool('add-token')} />
          <ToolBtn icon={<Ruler className="w-3.5 h-3.5" />} label="Measure" active={tool === 'measure'} onClick={() => setTool('measure')} />
          <ToolBtn icon={<Cloud className="w-3.5 h-3.5" />} label="Reveal Fog" active={tool === 'reveal'} onClick={() => setTool('reveal')} />
          <div className="w-px h-5 bg-gold/15 mx-1" />
          <ToolBtn
            icon={<Grid3x3 className="w-3.5 h-3.5" />}
            label={state.showGrid ? 'Hide Grid' : 'Show Grid'}
            onClick={() => { setState((s) => ({ ...s, showGrid: !s.showGrid })); setDirty(true) }}
          />
          <ToolBtn icon={<Eraser className="w-3.5 h-3.5" />} label="Clear Fog" onClick={clearFog} />
          <ToolBtn icon={<Trash2 className="w-3.5 h-3.5" />} label="Remove Token" onClick={removeSelectedToken} />
          <div className="ml-auto flex items-center gap-2">
            {dirty && <span className="text-xs text-amber-300">unsaved</span>}
            <Button size="sm" onClick={save} disabled={!dirty || saving} className="text-xs">
              <Save className="w-3 h-3 mr-1" /> {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="block w-full rounded border border-gold/10 cursor-crosshair touch-none"
      />
    </div>
  )
}

function ToolBtn({ icon, label, active, onClick }: { icon?: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
        active ? 'bg-gold/20 text-gold' : 'text-parchment-muted hover:text-parchment hover:bg-charcoal-800'
      }`}
    >
      {icon} {label}
    </button>
  )
}
