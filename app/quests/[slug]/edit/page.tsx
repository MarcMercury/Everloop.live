import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getQuest } from '@/lib/actions/quests'
import QuestForm, { type QuestFormInitial } from '@/components/quests/quest-form'
import type { QuestType, DifficultyPreset } from '@/types/campaign'
import type { QuestFlowGraph } from '@/components/quests/quest-flow-builder'
import { defaultGraph } from '@/components/quests/quest-flow-builder'
import type { Edge } from 'reactflow'

interface SavedFlowNode {
  id: string
  kind?: string
  position?: { x: number; y: number }
  data?: Record<string, unknown>
}
interface SavedFlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
}

function reconstructGraph(quest_structure: Record<string, unknown> | null | undefined): QuestFlowGraph {
  const flow = (quest_structure as { flow?: { nodes?: SavedFlowNode[]; edges?: SavedFlowEdge[] } } | undefined)?.flow
  if (!flow || !flow.nodes || flow.nodes.length === 0) return defaultGraph()
  const nodes = flow.nodes.map(n => ({
    id: n.id,
    type: 'quest',
    position: n.position ?? { x: 0, y: 0 },
    data: { kind: 'scene', label: 'Beat', ...(n.data ?? {}) },
  })) as QuestFlowGraph['nodes']
  const edges: Edge[] = (flow.edges ?? []).map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? undefined,
    targetHandle: e.targetHandle ?? undefined,
  }))
  return { nodes, edges }
}

export default async function EditQuestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirected=true&next=/quests/${slug}/edit`)

  const result = await getQuest(slug)
  if (!result.success || !result.quest) notFound()
  const quest = result.quest

  if (quest.created_by !== user.id) {
    // Only the creator can edit. Redirect non-owners to detail page.
    redirect(`/quests/${slug}`)
  }
  if (quest.status !== 'draft') {
    // Editing is only supported for unpublished drafts. Send published quests
    // back to their detail view.
    redirect(`/quests/${slug}`)
  }

  const narratorCfg = (quest.ai_narrator_config ?? {}) as {
    style?: string
    pacing?: string
    branching_narrative?: boolean
  }
  const metadata = (quest.metadata ?? {}) as { regions?: string[]; location_ids?: string[] }

  const tagsList = Array.isArray(quest.tags) ? quest.tags : []
  const userTags = tagsList.filter(t => !t.startsWith('region:'))
  const tagRegions = tagsList
    .filter(t => t.startsWith('region:'))
    .map(t => t.slice('region:'.length))

  const initial: QuestFormInitial = {
    id: quest.id,
    slug: quest.slug,
    title: quest.title ?? '',
    description: quest.description ?? '',
    quest_type: (quest.quest_type ?? 'solo') as QuestType,
    difficulty: (quest.difficulty ?? 'standard') as DifficultyPreset,
    estimated_duration: quest.estimated_duration ?? '1-2 hours',
    min_participants: quest.min_participants ?? 1,
    max_participants: quest.max_participants ?? 1,
    everloop_overlay: quest.everloop_overlay ?? true,
    narrator_style: narratorCfg.style ?? 'atmospheric',
    narrator_pacing: narratorCfg.pacing ?? 'moderate',
    branching_narrative: narratorCfg.branching_narrative ?? true,
    tags: userTags.join(', '),
    regions: metadata.regions ?? tagRegions,
    location_ids: metadata.location_ids ?? (Array.isArray(quest.referenced_entities) ? quest.referenced_entities : []),
    publish_now: false,
    graph: reconstructGraph(quest.quest_structure),
    status: quest.status,
  }

  return <QuestForm mode="edit" initial={initial} />
}
