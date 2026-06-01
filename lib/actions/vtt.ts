'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface VttToken {
  id: string
  label: string
  color: string
  imageUrl?: string | null
  x: number
  y: number
  size: number
  isPC: boolean
  characterId?: string | null
  hp?: number
  maxHp?: number
}

export interface VttState {
  tokens: VttToken[]
  gridSize: number
  showGrid: boolean
  fog: { x: number; y: number; r: number }[]
  revealed: boolean[]
  bgUrl: string | null
}

async function assertCanEditScene(sceneId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: scene } = await supabase
    .from('quest_scenes')
    .select('id, quest_id, metadata, map_url, image_url')
    .eq('id', sceneId)
    .single()
  if (!scene) throw new Error('Scene not found')
  const { data: quest } = await supabase
    .from('quests')
    .select('id, dm_id, slug')
    .eq('id', (scene as { quest_id: string }).quest_id)
    .single()
  if (!quest || (quest as { dm_id: string }).dm_id !== user.id) {
    throw new Error('Only the DM can edit the scene VTT')
  }
  return {
    supabase,
    scene: scene as { id: string; quest_id: string; metadata: Record<string, unknown> | null; map_url: string | null; image_url: string | null },
    quest: quest as { id: string; dm_id: string; slug: string | null },
  }
}

export async function saveVttState(sceneId: string, state: VttState) {
  const { supabase, scene, quest } = await assertCanEditScene(sceneId)
  const metadata = { ...(scene.metadata ?? {}), vtt: state }
  const { error } = await supabase
    .from('quest_scenes')
    .update({ metadata })
    .eq('id', sceneId)
  if (error) throw new Error(error.message)
  if (quest.slug) revalidatePath(`/quests/${quest.slug}`)
}
