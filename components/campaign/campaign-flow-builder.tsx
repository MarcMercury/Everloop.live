'use client'

/**
 * CampaignFlowBuilder
 * -------------------
 * Visual flow-chart designer for campaigns. Adapted from QuestFlowBuilder,
 * with one key addition: a `quest` node kind that embeds a fully built,
 * saved Quest as a single beat in the campaign flow.
 *
 *   Start → Chapters / Scenes / Encounters / Choices / NPCs / Quests → Climax
 *
 * The graph is serialized to `campaigns.metadata.flow` so the Director / AI Co-DM
 * can reference the intended narrative spine during play.
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
  Gem,
  Flag,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Scroll,
  ExternalLink,
  Search,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CampaignNodeKind =
  | 'start'
  | 'chapter'
  | 'scene'
  | 'encounter'
  | 'choice'
  | 'npc'
  | 'quest'
  | 'reward'
  | 'climax'

export interface QuestSummary {
  id: string
  slug: string
  title: string
  quest_type?: string | null
  difficulty?: string | null
  status?: string | null
}

export interface CampaignNodeData {
  kind: CampaignNodeKind
  label: string
  description?: string
  // Type-specific fields
  monsters?: string
  npc_name?: string
  reward?: string
  outcomes?: string
  // Embedded quest reference (kind === 'quest' only)
  quest_id?: string
  quest_slug?: string
  quest_title?: string
  quest_type?: string
  quest_difficulty?: string
}

export interface CampaignFlowGraph {
  nodes: Node<CampaignNodeData>[]
  edges: Edge[]
}

interface CampaignFlowBuilderProps {
  initial?: CampaignFlowGraph
  onChange?: (graph: CampaignFlowGraph) => void
  /** Pool of quests the designer can embed as quest-nodes. */
  availableQuests?: QuestSummary[]
}

// ---------------------------------------------------------------------------
// Node kind metadata
// ---------------------------------------------------------------------------

const KIND_META: Record<
  CampaignNodeKind,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    accent: string
    bg: string
    hint: string
  }
> = {
  start: {
    label: 'Start',
    icon: Sparkles,
    color: 'border-amber-400/60',
    accent: 'text-amber-300',
    bg: 'from-amber-950/50 to-amber-900/20',
    hint: 'Where the campaign begins — the first pull.',
  },
  chapter: {
    label: 'Chapter',
    icon: BookOpen,
    color: 'border-indigo-400/60',
    accent: 'text-indigo-300',
    bg: 'from-indigo-950/60 to-indigo-900/20',
    hint: 'A major arc or chapter of the campaign.',
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
  quest: {
    label: 'Quest',
    icon: Scroll,
    color: 'border-fuchsia-400/70',
    accent: 'text-fuchsia-300',
    bg: 'from-fuchsia-950/60 to-fuchsia-900/30',
    hint: 'Embed a fully built Quest as a layer of the campaign.',
  },
  reward: {
    label: 'Reward',
    icon: Gem,
    color: 'border-yellow-400/60',
    accent: 'text-yellow-300',
    bg: 'from-yellow-950/50 to-yellow-900/20',
    hint: 'Loot, knowledge, a Shard fragment.',
  },
  climax: {
    label: 'Climax',
    icon: Flag,
    color: 'border-gold/80',
    accent: 'text-gold',
    bg: 'from-yellow-900/40 to-amber-900/30',
    hint: 'The campaign culminates here.',
  },
}

const PALETTE_KINDS: CampaignNodeKind[] = [
  'chapter',
  'scene',
  'encounter',
  'choice',
  'npc',
  'quest',
  'reward',
]

// ---------------------------------------------------------------------------
// Custom node renderer
// ---------------------------------------------------------------------------

function CampaignNode({ data, selected }: NodeProps<CampaignNodeData>) {
  const meta = KIND_META[data.kind]
  const Icon = meta.icon
  const isTerminal = data.kind === 'start' || data.kind === 'climax'
  const isQuest = data.kind === 'quest'

  return (
    <div
      className={`relative rounded-lg border-2 bg-gradient-to-br ${meta.bg} ${meta.color} backdrop-blur-sm shadow-lg transition-all min-w-[200px] max-w-[240px] ${
        selected ? 'ring-2 ring-gold/70 scale-[1.02]' : ''
      } ${isQuest && data.quest_id ? 'ring-1 ring-fuchsia-400/40' : ''}`}
    >
      {data.kind !== 'start' && (
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
          {isQuest && data.quest_id && (
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-200">
              embedded
            </span>
          )}
        </div>
        <div className="text-sm font-serif text-parchment leading-tight break-words">
          {data.label || (
            <span className="italic text-parchment-muted/60">Untitled</span>
          )}
        </div>
        {data.description && (
          <div className="text-[11px] text-parchment-muted mt-1 line-clamp-2">
            {data.description}
          </div>
        )}
        {isQuest && data.quest_title && (
          <div className="mt-2 px-2 py-1 rounded bg-fuchsia-950/40 border border-fuchsia-400/20 text-[10px] text-fuchsia-200">
            <div className="flex items-center gap-1">
              <Scroll className="w-3 h-3" />
              <span className="truncate">{data.quest_title}</span>
            </div>
            {(data.quest_type || data.quest_difficulty) && (
              <div className="text-[9px] text-fuchsia-300/70 mt-0.5">
                {[data.quest_type, data.quest_difficulty].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        )}
        {isQuest && !data.quest_id && (
          <div className="mt-2 px-2 py-1 rounded bg-amber-950/40 border border-amber-400/30 text-[10px] text-amber-200 italic">
            No quest selected — open inspector
          </div>
        )}
        {data.kind === 'encounter' && data.monsters && (
          <div className="text-[10px] text-red-300/80 mt-1 line-clamp-1">
            {data.monsters}
          </div>
        )}
        {isTerminal && (
          <div className="text-[10px] text-gold/60 mt-1 italic">
            {data.kind === 'start' ? 'Campaign entry' : 'Campaign culmination'}
          </div>
        )}
      </div>

      {data.kind !== 'climax' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-gold !border-2 !border-teal-deep"
        />
      )}
    </div>
  )
}

const NODE_TYPES = { campaign: CampaignNode }

// ---------------------------------------------------------------------------
// Default graph (Start → Climax scaffold)
// ---------------------------------------------------------------------------

function defaultGraph(): CampaignFlowGraph {
  return {
    nodes: [
      {
        id: 'start',
        type: 'campaign',
        position: { x: 280, y: 40 },
        data: {
          kind: 'start',
          label: 'The Beginning',
          description: 'How the campaign opens — what pulls the players in.',
        },
      },
      {
        id: 'climax',
        type: 'campaign',
        position: { x: 280, y: 560 },
        data: {
          kind: 'climax',
          label: 'The Climax',
          description:
            'What waits at the end — and how it bends toward a Shard.',
        },
      },
    ],
    edges: [],
  }
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateGraph(graph: CampaignFlowGraph): {
  ok: boolean
  warnings: string[]
} {
  const warnings: string[] = []
  const { nodes, edges } = graph

  const start = nodes.find(n => n.data.kind === 'start')
  const climax = nodes.find(n => n.data.kind === 'climax')

  if (!start) warnings.push('Missing Start node — every campaign needs an entry.')
  if (!climax) warnings.push('Missing Climax node — every campaign needs a culmination.')

  // Quest nodes without a selected quest
  const unboundQuests = nodes.filter(
    n => n.data.kind === 'quest' && !n.data.quest_id,
  )
  if (unboundQuests.length > 0) {
    warnings.push(
      `${unboundQuests.length} quest node${unboundQuests.length === 1 ? '' : 's'} not yet linked to a saved quest.`,
    )
  }

  if (start && climax) {
    const adj = new Map<string, string[]>()
    edges.forEach(e => {
      const list = adj.get(e.source) ?? []
      list.push(e.target)
      adj.set(e.source, list)
    })
    const seen = new Set<string>([start.id])
    const queue = [start.id]
    let reached = false
    while (queue.length) {
      const cur = queue.shift()!
      if (cur === climax.id) {
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
      warnings.push('No path connects Start to Climax yet.')
    }

    const orphans = nodes.filter(n => !seen.has(n.id) && n.id !== climax.id)
    if (orphans.length > 0) {
      warnings.push(
        `${orphans.length} node${orphans.length === 1 ? ' is' : 's are'} not reachable from Start.`,
      )
    }
  }

  return { ok: warnings.length === 0, warnings }
}

// ---------------------------------------------------------------------------
// Inner builder
// ---------------------------------------------------------------------------

function BuilderInner({
  initial,
  onChange,
  availableQuests,
}: CampaignFlowBuilderProps) {
  const [nodes, setNodes] = useState<Node<CampaignNodeData>[]>(
    initial?.nodes?.length ? initial.nodes : defaultGraph().nodes,
  )
  const [edges, setEdges] = useState<Edge[]>(initial?.edges ?? [])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const idCounter = useRef(
    Math.max(
      0,
      ...((initial?.nodes ?? []).map(n => parseInt(n.id.replace(/\D/g, '')) || 0)),
    ) + 1,
  )
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()

  useEffect(() => {
    onChange?.({ nodes, edges })
  }, [nodes, edges, onChange])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes(ns => applyNodeChanges(changes, ns) as Node<CampaignNodeData>[]),
    [],
  )
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges(es => applyEdgeChanges(changes, es)),
    [],
  )
  const onConnect = useCallback(
    (conn: Connection) =>
      setEdges(es =>
        addEdge(
          {
            ...conn,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#d4af37', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#d4af37' },
          },
          es,
        ),
      ),
    [],
  )

  function addNode(kind: CampaignNodeKind, position?: { x: number; y: number }) {
    const id = `n${idCounter.current++}`
    const meta = KIND_META[kind]
    const newNode: Node<CampaignNodeData> = {
      id,
      type: 'campaign',
      position:
        position ?? { x: 100 + Math.random() * 360, y: 220 + Math.random() * 220 },
      data: { kind, label: `New ${meta.label}` },
    }
    setNodes(ns => [...ns, newNode])
    setSelectedId(id)
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const kind = e.dataTransfer.getData(
      'application/campaign-node',
    ) as CampaignNodeKind
    if (!kind) return
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    addNode(kind, position)
  }

  function deleteSelected() {
    if (!selectedId) return
    const node = nodes.find(n => n.id === selectedId)
    if (!node || node.data.kind === 'start' || node.data.kind === 'climax') return
    setNodes(ns => ns.filter(n => n.id !== selectedId))
    setEdges(es =>
      es.filter(e => e.source !== selectedId && e.target !== selectedId),
    )
    setSelectedId(null)
  }

  function updateSelected(patch: Partial<CampaignNodeData>) {
    if (!selectedId) return
    setNodes(ns =>
      ns.map(n =>
        n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
    )
  }

  const selectedNode = useMemo(
    () => nodes.find(n => n.id === selectedId) ?? null,
    [nodes, selectedId],
  )

  const validation = useMemo(
    () => validateGraph({ nodes, edges }),
    [nodes, edges],
  )

  return (
    <div className="grid grid-cols-12 gap-4 h-[680px]">
      {/* Palette */}
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
                e.dataTransfer.setData('application/campaign-node', kind)
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
          Drag onto the canvas, or click to add. The{' '}
          <span className="text-fuchsia-300">Quest</span> beat embeds a fully
          built quest from your library — its entire flow becomes a layer of the
          campaign.
        </div>
      </aside>

      {/* Canvas */}
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
          <Controls className="!bg-teal-rich/80 !border-gold/30" />
          <MiniMap
            pannable
            zoomable
            className="!bg-teal-deep/80 !border !border-gold/20"
            nodeColor={n => {
              const k = (n.data as CampaignNodeData)?.kind ?? 'scene'
              const map: Record<CampaignNodeKind, string> = {
                start: '#fbbf24',
                chapter: '#818cf8',
                scene: '#5eead4',
                encounter: '#f87171',
                choice: '#c084fc',
                npc: '#60a5fa',
                quest: '#e879f9',
                reward: '#facc15',
                climax: '#d4af37',
              }
              return map[k] ?? '#5eead4'
            }}
            maskColor="rgba(0,0,0,0.6)"
          />
        </ReactFlow>

        <div className="absolute top-3 right-3 max-w-xs z-10">
          {validation.ok ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-900/70 border border-emerald-400/40 text-emerald-200 text-xs backdrop-blur">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Start reaches Climax — flow valid.
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

      {/* Inspector */}
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
            canDelete={
              selectedNode.data.kind !== 'start' &&
              selectedNode.data.kind !== 'climax'
            }
            availableQuests={availableQuests ?? []}
          />
        )}
      </aside>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inspector
// ---------------------------------------------------------------------------

function NodeInspector({
  node,
  onChange,
  onDelete,
  canDelete,
  availableQuests,
}: {
  node: Node<CampaignNodeData>
  onChange: (patch: Partial<CampaignNodeData>) => void
  onDelete: () => void
  canDelete: boolean
  availableQuests: QuestSummary[]
}) {
  const meta = KIND_META[node.data.kind]
  const Icon = meta.icon
  const [questSearch, setQuestSearch] = useState('')

  const filteredQuests = useMemo(() => {
    const q = questSearch.trim().toLowerCase()
    if (!q) return availableQuests
    return availableQuests.filter(
      qq =>
        qq.title.toLowerCase().includes(q) ||
        (qq.quest_type ?? '').toLowerCase().includes(q),
    )
  }, [questSearch, availableQuests])

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

      <Field label="Description / Director Note">
        <textarea
          value={node.data.description ?? ''}
          onChange={e => onChange({ description: e.target.value })}
          rows={3}
          className="w-full bg-teal-deep/60 border border-gold/20 rounded px-2 py-1.5 text-sm text-parchment resize-none focus:outline-none focus:ring-2 focus:ring-gold/40"
          placeholder="What happens here? What should the AI co-DM emphasize?"
        />
      </Field>

      {node.data.kind === 'quest' && (
        <div className="space-y-2 pt-2 border-t border-fuchsia-400/20">
          <Field label="Linked Quest">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-parchment-muted/60" />
              <input
                value={questSearch}
                onChange={e => setQuestSearch(e.target.value)}
                placeholder="Search your quests..."
                className="w-full bg-teal-deep/60 border border-gold/20 rounded pl-7 pr-2 py-1.5 text-xs text-parchment focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
              />
            </div>
          </Field>
          {availableQuests.length === 0 ? (
            <div className="text-[11px] text-amber-300/80 italic px-2 py-2 rounded bg-amber-950/30 border border-amber-400/20">
              No quests available yet. Build a quest first at /quests/create —
              then return here to embed it.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {filteredQuests.map(q => {
                const isSelected = node.data.quest_id === q.id
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() =>
                      onChange({
                        quest_id: q.id,
                        quest_slug: q.slug,
                        quest_title: q.title,
                        quest_type: q.quest_type ?? undefined,
                        quest_difficulty: q.difficulty ?? undefined,
                        // Sync the node label to the quest title for quick recognition
                        label:
                          node.data.label.startsWith('New ') || !node.data.label
                            ? q.title
                            : node.data.label,
                      })
                    }
                    className={`w-full text-left px-2 py-1.5 rounded border transition-all ${
                      isSelected
                        ? 'bg-fuchsia-500/20 border-fuchsia-400/50 text-fuchsia-100'
                        : 'bg-teal-deep/40 border-gold/15 text-parchment hover:border-fuchsia-400/30'
                    }`}
                  >
                    <div className="text-xs font-medium truncate">
                      {q.title}
                    </div>
                    <div className="text-[10px] text-parchment-muted">
                      {[q.quest_type, q.difficulty, q.status]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </button>
                )
              })}
              {filteredQuests.length === 0 && (
                <div className="text-[11px] text-parchment-muted/70 italic px-2 py-1">
                  No quests match.
                </div>
              )}
            </div>
          )}
          {node.data.quest_slug && (
            <a
              href={`/quests/${node.data.quest_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-fuchsia-300 hover:text-fuchsia-200"
            >
              <ExternalLink className="w-3 h-3" />
              View linked quest
            </a>
          )}
        </div>
      )}

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

      {node.data.kind === 'choice' && (
        <Field label="Branch Outcomes (one per line)">
          <textarea
            value={node.data.outcomes ?? ''}
            onChange={e => onChange({ outcomes: e.target.value })}
            rows={3}
            placeholder={
              'Side with the rebels\nReport to the council\nSlip away unseen'
            }
            className="w-full bg-teal-deep/60 border border-gold/20 rounded px-2 py-1.5 text-sm text-parchment resize-none focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </Field>
      )}

      {node.data.kind === 'reward' && (
        <Field label="Reward">
          <input
            value={node.data.reward ?? ''}
            onChange={e => onChange({ reward: e.target.value })}
            placeholder="A Shard fragment, a name long forgotten..."
            className="w-full bg-teal-deep/60 border border-gold/20 rounded px-2 py-1.5 text-sm text-parchment focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </Field>
      )}

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

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
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

export default function CampaignFlowBuilder(props: CampaignFlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <BuilderInner {...props} />
    </ReactFlowProvider>
  )
}

export { validateGraph, defaultGraph }
