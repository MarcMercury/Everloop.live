'use client'

/**
 * QuestFlowBuilder
 * ----------------
 * Visual flow-chart designer for the second step of quest creation.
 *
 * Designers compose a quest as a directed graph of beats:
 *   Hook → (Scenes / Encounters / Choices / NPCs / Skill Checks / Rewards) → Goal
 *
 * Branches can fork from Choice nodes and rejoin the main thread anywhere.
 * The graph is serialized to `quests.quest_structure` so the AI narrator can
 * reference the intended structure during play.
 */

import { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type NodeProps,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  Sparkles,
  MapPin,
  Sword,
  GitBranch,
  Users,
  Dice6,
  Gem,
  Flag,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Wand2,
  Copy,
} from 'lucide-react'
import { ArchivePicker, autoLayout, type ArchiveRef } from '@/components/flow/flow-shared'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuestNodeKind =
  | 'hook'
  | 'scene'
  | 'encounter'
  | 'choice'
  | 'npc'
  | 'skill_check'
  | 'reward'
  | 'goal'

export interface QuestNodeData {
  kind: QuestNodeKind
  label: string
  description?: string
  // Type-specific fields (loosely typed, narrator interprets)
  monsters?: string
  npc_name?: string
  ability?: string
  dc?: number
  reward?: string
  outcomes?: string
  /** Linked canonical entities from the Archive. */
  archive_refs?: ArchiveRef[]
}

export interface QuestFlowGraph {
  nodes: Node<QuestNodeData>[]
  edges: Edge[]
}

interface QuestFlowBuilderProps {
  initial?: QuestFlowGraph
  onChange?: (graph: QuestFlowGraph) => void
}

// ---------------------------------------------------------------------------
// Node kind metadata (icon, color, default label, helper text)
// ---------------------------------------------------------------------------

const KIND_META: Record<
  QuestNodeKind,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    color: string // tailwind border + accent color
    accent: string // tailwind text color
    bg: string
    hint: string
  }
> = {
  hook: {
    label: 'Hook',
    icon: Sparkles,
    color: 'border-amber-400/60',
    accent: 'text-amber-300',
    bg: 'from-amber-950/50 to-amber-900/20',
    hint: 'The opening pull — what draws players in.',
  },
  scene: {
    label: 'Scene',
    icon: MapPin,
    color: 'border-teal-400/60',
    accent: 'text-teal-300',
    bg: 'from-teal-950/60 to-teal-900/20',
    hint: 'A narrative beat or location.',
  },
  encounter: {
    label: 'Encounter',
    icon: Sword,
    color: 'border-red-400/60',
    accent: 'text-red-300',
    bg: 'from-red-950/50 to-red-900/20',
    hint: 'Combat, danger, a Monster manifests.',
  },
  choice: {
    label: 'Choice',
    icon: GitBranch,
    color: 'border-purple-400/60',
    accent: 'text-purple-300',
    bg: 'from-purple-950/60 to-purple-900/20',
    hint: 'A branch point — paths fork here.',
  },
  npc: {
    label: 'NPC',
    icon: Users,
    color: 'border-blue-400/60',
    accent: 'text-blue-300',
    bg: 'from-blue-950/60 to-blue-900/20',
    hint: 'A character interaction.',
  },
  skill_check: {
    label: 'Skill Check',
    icon: Dice6,
    color: 'border-emerald-400/60',
    accent: 'text-emerald-300',
    bg: 'from-emerald-950/60 to-emerald-900/20',
    hint: 'An ability check — outcome forks.',
  },
  reward: {
    label: 'Reward',
    icon: Gem,
    color: 'border-yellow-400/60',
    accent: 'text-yellow-300',
    bg: 'from-yellow-950/50 to-yellow-900/20',
    hint: 'Loot, knowledge, a Shard fragment.',
  },
  goal: {
    label: 'Goal',
    icon: Flag,
    color: 'border-gold/80',
    accent: 'text-gold',
    bg: 'from-yellow-900/40 to-amber-900/30',
    hint: 'The quest culminates here.',
  },
}

const PALETTE_KINDS: QuestNodeKind[] = [
  'scene',
  'encounter',
  'choice',
  'npc',
  'skill_check',
  'reward',
]

// ---------------------------------------------------------------------------
// Custom node renderer
// ---------------------------------------------------------------------------

function QuestNode({ data, selected }: NodeProps<QuestNodeData>) {
  const meta = KIND_META[data.kind]
  const Icon = meta.icon
  const isTerminal = data.kind === 'hook' || data.kind === 'goal'

  // Branch handles for Choice node: one per outcome line.
  const branches = useMemo(() => {
    if (data.kind !== 'choice') return [] as { id: string; label: string }[]
    const lines = (data.outcomes ?? '')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
    if (lines.length === 0) return [{ id: 'b0', label: 'Branch 1' }]
    return lines.map((label, i) => ({ id: `b${i}`, label }))
  }, [data.kind, data.outcomes])

  const archiveRefs = data.archive_refs ?? []

  return (
    <div
      className={`relative rounded-lg border-2 bg-gradient-to-br ${meta.bg} ${meta.color} backdrop-blur-sm shadow-lg transition-all min-w-[200px] max-w-[240px] ${
        selected ? 'ring-2 ring-gold/70 scale-[1.02]' : ''
      }`}
    >
      {/* Top handle (target) — hook has none */}
      {data.kind !== 'hook' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-gold !border-2 !border-teal-deep"
        />
      )}

      <div className="p-3">
        <div className={`flex items-center gap-2 ${meta.accent} mb-1`}>
          <Icon className="w-4 h-4 shrink-0" />
          <span className="text-[10px] uppercase tracking-wider font-medium">
            {meta.label}
          </span>
        </div>
        <div className="text-sm font-serif text-parchment leading-tight break-words">
          {data.label || <span className="italic text-parchment-muted/60">Untitled</span>}
        </div>
        {data.description && (
          <div className="text-[11px] text-parchment-muted mt-1 line-clamp-2">
            {data.description}
          </div>
        )}
        {data.kind === 'skill_check' && data.ability && (
          <div className="text-[10px] text-emerald-300/80 mt-1">
            {data.ability.toUpperCase()}{data.dc ? ` · DC ${data.dc}` : ''}
          </div>
        )}
        {data.kind === 'encounter' && data.monsters && (
          <div className="text-[10px] text-red-300/80 mt-1 line-clamp-1">
            {data.monsters}
          </div>
        )}
        {/* Archive chips */}
        {archiveRefs.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {archiveRefs.slice(0, 4).map(r => (
              <span
                key={r.id}
                className="text-[9px] px-1.5 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold/90"
                title={`${r.type}: ${r.name}`}
              >
                {r.name}
              </span>
            ))}
            {archiveRefs.length > 4 && (
              <span className="text-[9px] text-parchment-muted">
                +{archiveRefs.length - 4}
              </span>
            )}
          </div>
        )}
        {/* Branch labels for Choice */}
        {data.kind === 'choice' && branches.length > 0 && (
          <div className="mt-2 pt-2 border-t border-purple-400/20 space-y-0.5">
            {branches.map((b, i) => (
              <div
                key={b.id}
                className="text-[10px] text-purple-200/90 flex items-center gap-1"
                style={{ paddingRight: 6 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400/80 shrink-0" />
                <span className="truncate">{b.label}</span>
                <span className="ml-auto text-[9px] text-purple-300/60">
                  {String.fromCharCode(65 + i)}
                </span>
              </div>
            ))}
          </div>
        )}
        {isTerminal && (
          <div className="text-[10px] text-gold/60 mt-1 italic">
            {data.kind === 'hook' ? 'Quest entry' : 'Quest culmination'}
          </div>
        )}
      </div>

      {/* Bottom handle(s) */}
      {data.kind === 'goal' ? null : data.kind === 'choice' ? (
        // One labeled handle per outcome, evenly distributed across the bottom edge.
        branches.map((b, i) => {
          const left = ((i + 1) / (branches.length + 1)) * 100
          return (
            <Handle
              key={b.id}
              id={b.id}
              type="source"
              position={Position.Bottom}
              style={{ left: `${left}%` }}
              className="!w-3 !h-3 !bg-purple-400 !border-2 !border-teal-deep"
            />
          )
        })
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-gold !border-2 !border-teal-deep"
        />
      )}
    </div>
  )
}

const NODE_TYPES = { quest: QuestNode }

// ---------------------------------------------------------------------------
// Default graph (Hook → Goal scaffold)
// ---------------------------------------------------------------------------

function defaultGraph(): QuestFlowGraph {
  return {
    nodes: [
      {
        id: 'hook',
        type: 'quest',
        position: { x: 250, y: 40 },
        data: {
          kind: 'hook',
          label: 'The Hook',
          description: 'How the quest begins — what pulls the players in.',
        },
      },
      {
        id: 'goal',
        type: 'quest',
        position: { x: 250, y: 480 },
        data: {
          kind: 'goal',
          label: 'The Goal',
          description: 'What waits at the end — and how it bends toward a Shard.',
        },
      },
    ],
    edges: [],
  }
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateGraph(graph: QuestFlowGraph): {
  ok: boolean
  warnings: string[]
} {
  const warnings: string[] = []
  const { nodes, edges } = graph

  const hook = nodes.find(n => n.data.kind === 'hook')
  const goal = nodes.find(n => n.data.kind === 'goal')

  if (!hook) warnings.push('Missing Hook node — every quest needs an entry.')
  if (!goal) warnings.push('Missing Goal node — every quest needs a culmination.')

  // BFS from hook to goal
  if (hook && goal) {
    const adj = new Map<string, string[]>()
    edges.forEach(e => {
      const list = adj.get(e.source) ?? []
      list.push(e.target)
      adj.set(e.source, list)
    })
    const seen = new Set<string>([hook.id])
    const queue = [hook.id]
    let reached = false
    while (queue.length) {
      const cur = queue.shift()!
      if (cur === goal.id) {
        reached = true
        break
      }
      for (const next of adj.get(cur) ?? []) {
        if (!seen.has(next)) {
          seen.add(next)
          queue.push(next)
        }
      }
    }
    if (!reached) {
      warnings.push('No path connects the Hook to the Goal yet.')
    }

    // Orphan nodes (not reachable from hook)
    const orphans = nodes.filter(n => !seen.has(n.id) && n.id !== goal.id)
    if (orphans.length > 0) {
      warnings.push(
        `${orphans.length} node${orphans.length === 1 ? ' is' : 's are'} not reachable from the Hook.`,
      )
    }
  }

  return { ok: warnings.length === 0, warnings }
}

// ---------------------------------------------------------------------------
// Inner builder (must be inside ReactFlowProvider)
// ---------------------------------------------------------------------------

function BuilderInner({ initial, onChange }: QuestFlowBuilderProps) {
  const [nodes, setNodes] = useState<Node<QuestNodeData>[]>(
    initial?.nodes?.length ? initial.nodes : defaultGraph().nodes,
  )
  const [edges, setEdges] = useState<Edge[]>(initial?.edges ?? [])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const idCounter = useRef(
    Math.max(0, ...((initial?.nodes ?? []).map(n => parseInt(n.id.replace(/\D/g, '')) || 0))) + 1,
  )
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()

  // Notify parent
  useEffect(() => {
    onChange?.({ nodes, edges })
  }, [nodes, edges, onChange])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes(ns => applyNodeChanges(changes, ns) as Node<QuestNodeData>[]),
    [],
  )
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges(es => applyEdgeChanges(changes, es)),
    [],
  )
  const onConnect = useCallback(
    (conn: Connection) => {
      // Find the source node — if it's a Choice, label the edge with the branch outcome.
      let label: string | undefined
      const src = conn.source ? nodes.find(n => n.id === conn.source) : null
      if (src && src.data.kind === 'choice' && conn.sourceHandle) {
        const idx = parseInt(conn.sourceHandle.replace(/\D/g, '')) || 0
        const lines = (src.data.outcomes ?? '')
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean)
        label = lines[idx] ?? undefined
      }
      setEdges(es =>
        addEdge(
          {
            ...conn,
            type: 'smoothstep',
            animated: true,
            label,
            labelStyle: { fill: '#e9d5ff', fontSize: 11, fontWeight: 500 },
            labelBgStyle: { fill: 'rgba(76,29,149,0.7)' },
            labelBgPadding: [4, 2],
            labelBgBorderRadius: 4,
            style: { stroke: '#d4af37', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#d4af37' },
          },
          es,
        ),
      )
    },
    [nodes],
  )

  // Add a node from the palette at a sensible position
  function addNode(kind: QuestNodeKind, position?: { x: number; y: number }) {
    const id = `n${idCounter.current++}`
    const meta = KIND_META[kind]
    const newNode: Node<QuestNodeData> = {
      id,
      type: 'quest',
      position: position ?? { x: 100 + Math.random() * 300, y: 200 + Math.random() * 200 },
      data: { kind, label: `New ${meta.label}` },
    }
    setNodes(ns => [...ns, newNode])
    setSelectedId(id)
  }

  // Drag-and-drop from palette to canvas
  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const kind = e.dataTransfer.getData('application/quest-node') as QuestNodeKind
    if (!kind) return
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    addNode(kind, position)
  }

  function deleteSelected() {
    if (!selectedId) return
    const node = nodes.find(n => n.id === selectedId)
    if (!node || node.data.kind === 'hook' || node.data.kind === 'goal') return
    setNodes(ns => ns.filter(n => n.id !== selectedId))
    setEdges(es => es.filter(e => e.source !== selectedId && e.target !== selectedId))
    setSelectedId(null)
  }

  function duplicateSelected() {
    if (!selectedId) return
    const node = nodes.find(n => n.id === selectedId)
    if (!node || node.data.kind === 'hook' || node.data.kind === 'goal') return
    const id = `n${idCounter.current++}`
    const copy: Node<QuestNodeData> = {
      ...node,
      id,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      data: { ...node.data, label: node.data.label + ' (copy)' },
      selected: false,
    }
    setNodes(ns => [...ns, copy])
    setSelectedId(id)
  }

  function autoLayoutGraph() {
    setNodes(ns => autoLayout(ns, edges, ['hook']))
  }

  // Keyboard: Delete / Backspace removes selected node (when not typing).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        deleteSelected()
      }
      if ((e.key === 'd' || e.key === 'D') && (e.metaKey || e.ctrlKey) && selectedId) {
        e.preventDefault()
        duplicateSelected()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, nodes, edges])

  function updateSelected(patch: Partial<QuestNodeData>) {
    if (!selectedId) return
    setNodes(ns =>
      ns.map(n => (n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n)),
    )
  }

  const selectedNode = useMemo(
    () => nodes.find(n => n.id === selectedId) ?? null,
    [nodes, selectedId],
  )

  const validation = useMemo(() => validateGraph({ nodes, edges }), [nodes, edges])

  return (
    <div className="grid grid-cols-12 gap-4 h-[640px]">
      {/* Left: Palette */}
      <aside className="col-span-2 space-y-2">
        <div className="text-[11px] uppercase tracking-wider text-parchment-muted mb-2 font-medium">
          Add Beat
        </div>
        {PALETTE_KINDS.map(kind => {
          const meta = KIND_META[kind]
          const Icon = meta.icon
          return (
            <button
              key={kind}
              type="button"
              draggable
              onDragStart={e => {
                e.dataTransfer.setData('application/quest-node', kind)
                e.dataTransfer.effectAllowed = 'move'
              }}
              onClick={() => addNode(kind)}
              className={`w-full text-left p-2 rounded-md border ${meta.color} bg-gradient-to-br ${meta.bg} hover:scale-[1.02] transition-all cursor-grab active:cursor-grabbing`}
              title={meta.hint}
            >
              <div className={`flex items-center gap-2 ${meta.accent}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{meta.label}</span>
              </div>
            </button>
          )
        })}
        <div className="text-[10px] text-parchment-muted/70 italic mt-3 leading-relaxed">
          Drag onto the canvas, or click to add. Connect nodes by dragging from
          the bottom dot to the top dot of the next beat.
        </div>
        <div className="text-[10px] text-parchment-muted/70 italic mt-2 leading-relaxed">
          <kbd className="px-1 rounded bg-teal-deep/60 border border-gold/15">Del</kbd>{' '}
          remove ·{' '}
          <kbd className="px-1 rounded bg-teal-deep/60 border border-gold/15">⌘D</kbd>{' '}
          duplicate
        </div>
      </aside>

      {/* Center: Canvas */}
      <div
        ref={wrapperRef}
        className="col-span-7 rounded-lg border border-gold/20 bg-teal-deep/40 overflow-hidden relative"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, n) => setSelectedId(n.id)}
          onPaneClick={() => setSelectedId(null)}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#d4af37', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#d4af37' },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#d4af37" gap={24} size={1} style={{ opacity: 0.15 }} />
          <Controls
            className="!bg-teal-rich/80 !border-gold/30"
            style={{ button: { background: 'transparent' } } as React.CSSProperties}
          />
          <MiniMap
            pannable
            zoomable
            className="!bg-teal-deep/80 !border !border-gold/20"
            nodeColor={n => {
              const k = (n.data as QuestNodeData)?.kind ?? 'scene'
              const map: Record<QuestNodeKind, string> = {
                hook: '#fbbf24',
                scene: '#5eead4',
                encounter: '#f87171',
                choice: '#c084fc',
                npc: '#60a5fa',
                skill_check: '#34d399',
                reward: '#facc15',
                goal: '#d4af37',
              }
              return map[k] ?? '#5eead4'
            }}
            maskColor="rgba(0,0,0,0.6)"
          />
        </ReactFlow>

        {/* Toolbar (top-left) */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={autoLayoutGraph}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-rich/80 border border-gold/30 text-parchment-muted hover:text-gold hover:border-gold/50 backdrop-blur text-xs transition-colors"
            title="Tidy the flow into a clean top-down layout"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Auto Layout
          </button>
          <button
            type="button"
            onClick={duplicateSelected}
            disabled={
              !selectedNode ||
              selectedNode.data.kind === 'hook' ||
              selectedNode.data.kind === 'goal'
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-rich/80 border border-gold/30 text-parchment-muted hover:text-gold hover:border-gold/50 backdrop-blur text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Duplicate the selected beat (⌘D)"
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </button>
        </div>

        {/* Validation banner */}
        <div className="absolute top-3 right-3 max-w-xs z-10">
          {validation.ok ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-900/70 border border-emerald-400/40 text-emerald-200 text-xs backdrop-blur">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Hook reaches Goal — flow valid.
            </div>
          ) : (
            <div className="flex items-start gap-2 px-3 py-1.5 rounded-md bg-amber-900/70 border border-amber-400/40 text-amber-200 text-xs backdrop-blur">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <div>
                {validation.warnings.map((w, i) => (
                  <div key={i}>{w}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Inspector */}
      <aside className="col-span-3 rounded-lg border border-gold/20 bg-teal-rich/40 p-4 overflow-y-auto">
        {!selectedNode ? (
          <div className="text-center text-parchment-muted/70 text-sm py-12">
            <Plus className="w-8 h-8 mx-auto mb-3 opacity-40" />
            Select a node to edit it, or drag a beat from the palette onto the
            canvas.
          </div>
        ) : (
          <NodeInspector
            node={selectedNode}
            onChange={updateSelected}
            onDelete={deleteSelected}
            canDelete={selectedNode.data.kind !== 'hook' && selectedNode.data.kind !== 'goal'}
          />
        )}
      </aside>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inspector panel
// ---------------------------------------------------------------------------

function NodeInspector({
  node,
  onChange,
  onDelete,
  canDelete,
}: {
  node: Node<QuestNodeData>
  onChange: (patch: Partial<QuestNodeData>) => void
  onDelete: () => void
  canDelete: boolean
}) {
  const meta = KIND_META[node.data.kind]
  const Icon = meta.icon

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 ${meta.accent}`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider font-medium">
          {meta.label}
        </span>
      </div>
      <p className="text-xs text-parchment-muted italic">{meta.hint}</p>

      <Field label="Title">
        <input
          value={node.data.label}
          onChange={e => onChange({ label: e.target.value })}
          className="w-full bg-teal-deep/60 border border-gold/20 rounded px-2 py-1.5 text-sm text-parchment focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
      </Field>

      <Field label="Description / Narration Hint">
        <textarea
          value={node.data.description ?? ''}
          onChange={e => onChange({ description: e.target.value })}
          rows={10}
          className="w-full bg-teal-deep/60 border border-gold/20 rounded px-2 py-1.5 text-sm text-parchment resize-y min-h-[200px] focus:outline-none focus:ring-2 focus:ring-gold/40"
          placeholder="What happens here? What should the narrator emphasize?"
        />
      </Field>

      {node.data.kind === 'encounter' && (
        <Field label="Monsters / Threats">
          <input
            value={node.data.monsters ?? ''}
            onChange={e => onChange({ monsters: e.target.value })}
            placeholder="2 Drift-touched wolves, a fractured stalker..."
            className="w-full bg-teal-deep/60 border border-gold/20 rounded px-2 py-1.5 text-sm text-parchment focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </Field>
      )}

      {node.data.kind === 'npc' && (
        <Field label="NPC Name">
          <input
            value={node.data.npc_name ?? ''}
            onChange={e => onChange({ npc_name: e.target.value })}
            placeholder="Elder Mira, Keeper of the Hollow..."
            className="w-full bg-teal-deep/60 border border-gold/20 rounded px-2 py-1.5 text-sm text-parchment focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </Field>
      )}

      {node.data.kind === 'skill_check' && (
        <>
          <Field label="Ability">
            <select
              value={node.data.ability ?? 'wisdom'}
              onChange={e => onChange({ ability: e.target.value })}
              className="w-full bg-teal-deep/60 border border-gold/20 rounded px-2 py-1.5 text-sm text-parchment focus:outline-none focus:ring-2 focus:ring-gold/40"
            >
              {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'perception', 'arcana', 'stealth', 'persuasion'].map(a => (
                <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
              ))}
            </select>
          </Field>
          <Field label="Difficulty Class (DC)">
            <input
              type="number"
              value={node.data.dc ?? 12}
              onChange={e => onChange({ dc: parseInt(e.target.value) || 0 })}
              className="w-full bg-teal-deep/60 border border-gold/20 rounded px-2 py-1.5 text-sm text-parchment focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </Field>
        </>
      )}

      {node.data.kind === 'choice' && (
        <Field label="Branch Outcomes (one per line)">
          <textarea
            value={node.data.outcomes ?? ''}
            onChange={e => onChange({ outcomes: e.target.value })}
            rows={3}
            placeholder={'Trust the stranger\nFollow the trail alone\nReturn to town'}
            className="w-full bg-teal-deep/60 border border-gold/20 rounded px-2 py-1.5 text-sm text-parchment resize-none focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </Field>
      )}

      {node.data.kind === 'reward' && (
        <Field label="Reward">
          <input
            value={node.data.reward ?? ''}
            onChange={e => onChange({ reward: e.target.value })}
            placeholder="A Shard fragment, an oath-blade, a name long forgotten..."
            className="w-full bg-teal-deep/60 border border-gold/20 rounded px-2 py-1.5 text-sm text-parchment focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </Field>
      )}

      {/* Archive linker — wire this beat to canon entities */}
      {(() => {
        const allowedByKind: Record<QuestNodeKind, string[] | undefined> = {
          hook: undefined,
          scene: ['location', 'faction', 'event'],
          encounter: ['monster', 'creature', 'location'],
          choice: undefined,
          npc: ['character', 'faction'],
          skill_check: undefined,
          reward: ['artifact', 'concept'],
          goal: undefined,
        }
        const allowed = allowedByKind[node.data.kind]
        const hintByKind: Partial<Record<QuestNodeKind, string>> = {
          scene: 'Locations, factions, or events from the Archive that anchor this scene.',
          encounter: 'Monsters or creatures from the Archive — their stats & lore are pulled in by the narrator.',
          npc: 'Canon characters or factions this NPC belongs to.',
          reward: 'Canon artifacts or concepts gained here.',
        }
        return (
          <div className="pt-3 mt-3 border-t border-gold/10">
            <ArchivePicker
              value={node.data.archive_refs ?? []}
              onChange={refs => onChange({ archive_refs: refs })}
              allowedTypes={allowed}
              hint={hintByKind[node.data.kind] ?? 'Pull anything from the Archive into this beat.'}
            />
          </div>
        )
      })()}

      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-xs transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete this beat
        </button>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-parchment-muted block mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Public wrapper
// ---------------------------------------------------------------------------

export default function QuestFlowBuilder(props: QuestFlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <BuilderInner {...props} />
    </ReactFlowProvider>
  )
}

// Re-export for callers that want to validate or inspect outside the component.
export { validateGraph, defaultGraph }
