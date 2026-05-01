'use client'

/**
 * Shared inspector pieces for the flow builders:
 *   - ArchivePicker: multi-select canonical entities of one or more types.
 *   - autoLayout: simple top-down BFS layout for a graph.
 *
 * The two flow builders (quest, campaign) keep their own files for the
 * canvas / palette / node renderers, but share these helpers so the
 * archive integration and auto-layout logic stay consistent.
 */

import { useEffect, useMemo, useState } from 'react'
import { Search, X, Sparkles } from 'lucide-react'
import { getArchiveForPicker } from '@/lib/actions/entity-linker'
import type { Node, Edge } from 'reactflow'

export interface ArchiveEntity {
  id: string
  name: string
  type: string
  description: string | null
}

let _cache: ArchiveEntity[] | null = null
let _inflight: Promise<ArchiveEntity[]> | null = null

/** Cached archive fetch — every inspector instance shares one network call. */
export async function loadArchive(): Promise<ArchiveEntity[]> {
  if (_cache) return _cache
  if (_inflight) return _inflight
  _inflight = getArchiveForPicker().then(res => {
    const list = res.success && res.entities ? res.entities : []
    _cache = list
    _inflight = null
    return list
  })
  return _inflight
}

const TYPE_LABEL: Record<string, string> = {
  character: 'Character',
  location: 'Location',
  artifact: 'Artifact',
  event: 'Event',
  faction: 'Faction',
  concept: 'Concept',
  creature: 'Creature',
  monster: 'Monster',
}

const TYPE_COLOR: Record<string, string> = {
  character: 'border-blue-400/40 text-blue-200 bg-blue-950/40',
  location: 'border-teal-400/40 text-teal-200 bg-teal-950/40',
  artifact: 'border-yellow-400/40 text-yellow-200 bg-yellow-950/40',
  event: 'border-orange-400/40 text-orange-200 bg-orange-950/40',
  faction: 'border-rose-400/40 text-rose-200 bg-rose-950/40',
  concept: 'border-violet-400/40 text-violet-200 bg-violet-950/40',
  creature: 'border-red-400/40 text-red-200 bg-red-950/40',
  monster: 'border-red-500/50 text-red-100 bg-red-950/60',
}

export interface ArchiveRef {
  id: string
  name: string
  type: string
}

export function ArchivePicker({
  value,
  onChange,
  /** Allowed entity types — empty/undefined means all. */
  allowedTypes,
  /** Helpful label shown above the picker. */
  label = 'Linked from the Archive',
  hint,
}: {
  value: ArchiveRef[]
  onChange: (next: ArchiveRef[]) => void
  allowedTypes?: string[]
  label?: string
  hint?: string
}) {
  const [archive, setArchive] = useState<ArchiveEntity[]>([])
  const [loaded, setLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | 'all'>('all')

  useEffect(() => {
    let cancelled = false
    loadArchive().then(list => {
      if (cancelled) return
      setArchive(list)
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const pool = useMemo(() => {
    let list = archive
    if (allowedTypes && allowedTypes.length > 0) {
      list = list.filter(e => allowedTypes.includes(e.type))
    }
    if (typeFilter !== 'all') {
      list = list.filter(e => e.type === typeFilter)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        e =>
          e.name.toLowerCase().includes(q) ||
          (e.description ?? '').toLowerCase().includes(q),
      )
    }
    return list.slice(0, 80)
  }, [archive, allowedTypes, typeFilter, search])

  const typesPresent = useMemo(() => {
    const allowedSet = allowedTypes && allowedTypes.length > 0 ? new Set(allowedTypes) : null
    const set = new Set<string>()
    for (const e of archive) {
      if (allowedSet && !allowedSet.has(e.type)) continue
      set.add(e.type)
    }
    return Array.from(set).sort()
  }, [archive, allowedTypes])

  function toggle(e: ArchiveEntity) {
    const exists = value.find(v => v.id === e.id)
    if (exists) {
      onChange(value.filter(v => v.id !== e.id))
    } else {
      onChange([...value, { id: e.id, name: e.name, type: e.type }])
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-gold/70" />
        <label className="text-[11px] uppercase tracking-wider text-parchment-muted">
          {label}
        </label>
      </div>
      {hint && <p className="text-[11px] text-parchment-muted/70 italic">{hint}</p>}

      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map(v => (
            <button
              key={v.id}
              type="button"
              onClick={() =>
                onChange(value.filter(x => x.id !== v.id))
              }
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${TYPE_COLOR[v.type] ?? 'border-gold/30 text-parchment bg-teal-deep/40'} hover:opacity-80`}
              title={`Remove ${v.name}`}
            >
              <span className="font-medium">{v.name}</span>
              <span className="opacity-60">{TYPE_LABEL[v.type] ?? v.type}</span>
              <X className="w-2.5 h-2.5" />
            </button>
          ))}
        </div>
      )}

      {/* Search + type filter */}
      <div className="relative">
        <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-parchment-muted/60" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={loaded ? 'Search the Archive...' : 'Loading archive...'}
          disabled={!loaded}
          className="w-full bg-teal-deep/60 border border-gold/20 rounded pl-7 pr-2 py-1.5 text-xs text-parchment focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
      </div>

      {typesPresent.length > 1 && (
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`text-[10px] px-2 py-0.5 rounded-full border ${
              typeFilter === 'all'
                ? 'border-gold/60 text-gold bg-gold/10'
                : 'border-gold/15 text-parchment-muted hover:text-parchment'
            }`}
          >
            All
          </button>
          {typesPresent.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                typeFilter === t
                  ? 'border-gold/60 text-gold bg-gold/10'
                  : 'border-gold/15 text-parchment-muted hover:text-parchment'
              }`}
            >
              {TYPE_LABEL[t] ?? t}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
        {!loaded ? (
          <div className="text-[11px] text-parchment-muted/60 italic px-1 py-2">
            Loading the Archive...
          </div>
        ) : pool.length === 0 ? (
          <div className="text-[11px] text-parchment-muted/60 italic px-1 py-2">
            {archive.length === 0
              ? 'The Archive is empty — canonical entities will appear here once approved.'
              : 'No matches.'}
          </div>
        ) : (
          pool.map(e => {
            const isSelected = value.some(v => v.id === e.id)
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => toggle(e)}
                className={`w-full text-left px-2 py-1 rounded border transition-all ${
                  isSelected
                    ? 'bg-gold/10 border-gold/50 text-parchment'
                    : 'bg-teal-deep/40 border-gold/15 text-parchment hover:border-gold/35'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${TYPE_COLOR[e.type] ?? 'border-gold/30 text-parchment bg-teal-deep/40'}`}
                  >
                    {TYPE_LABEL[e.type] ?? e.type}
                  </span>
                  <span className="text-xs font-medium truncate">{e.name}</span>
                </div>
                {e.description && (
                  <div className="text-[10px] text-parchment-muted line-clamp-1 mt-0.5">
                    {e.description}
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Auto-layout — simple, dependency-free top-down BFS layout
// ---------------------------------------------------------------------------

const COL_WIDTH = 260
const ROW_HEIGHT = 160

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function autoLayout<N extends Node<any>>(
  nodes: N[],
  edges: Edge[],
  rootIds: string[],
): N[] {
  if (nodes.length === 0) return nodes
  const adj = new Map<string, string[]>()
  for (const e of edges) {
    const list = adj.get(e.source) ?? []
    list.push(e.target)
    adj.set(e.source, list)
  }
  const depth = new Map<string, number>()
  const queue: string[] = []
  for (const r of rootIds) {
    if (nodes.find(n => n.id === r)) {
      depth.set(r, 0)
      queue.push(r)
    }
  }
  while (queue.length) {
    const cur = queue.shift()!
    const d = depth.get(cur) ?? 0
    for (const next of adj.get(cur) ?? []) {
      const existing = depth.get(next)
      if (existing === undefined || existing < d + 1) {
        depth.set(next, d + 1)
        queue.push(next)
      }
    }
  }
  // Unreached nodes get max depth + 1
  let maxDepth = 0
  for (const d of depth.values()) maxDepth = Math.max(maxDepth, d)
  for (const n of nodes) {
    if (!depth.has(n.id)) depth.set(n.id, maxDepth + 1)
  }

  // Group by depth
  const byDepth = new Map<number, string[]>()
  for (const [id, d] of depth.entries()) {
    const arr = byDepth.get(d) ?? []
    arr.push(id)
    byDepth.set(d, arr)
  }

  const positions = new Map<string, { x: number; y: number }>()
  const sortedDepths = Array.from(byDepth.keys()).sort((a, b) => a - b)
  for (const d of sortedDepths) {
    const ids = byDepth.get(d)!
    const totalWidth = ids.length * COL_WIDTH
    const startX = -totalWidth / 2 + COL_WIDTH / 2
    ids.forEach((id, i) => {
      positions.set(id, { x: startX + i * COL_WIDTH, y: d * ROW_HEIGHT })
    })
  }

  return nodes.map(n => {
    const p = positions.get(n.id)
    return p ? { ...n, position: p } : n
  })
}
