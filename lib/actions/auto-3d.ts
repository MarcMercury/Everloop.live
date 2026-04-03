'use server'

import { createClient } from '@/lib/supabase/server'
import { createTextTo3DPreview, getTextTo3DTask } from '@/lib/meshy'

/**
 * Build a concise Meshy-friendly prompt from entity data.
 * Meshy text-to-3D works best with short physical descriptors.
 */
function buildMeshyPrompt(
  name: string,
  type: string,
  description: string,
  tagline?: string
): string {
  const typeHints: Record<string, string> = {
    character: 'fantasy character figurine, full body, detailed',
    location: 'fantasy building diorama, detailed architecture',
    creature: 'fantasy creature figurine, detailed anatomy',
    artifact: 'fantasy magical item, ornate, detailed',
    faction: 'fantasy heraldic emblem, 3D relief',
  }

  const hint = typeHints[type] || 'fantasy object, detailed'
  // Meshy prompt limit is 600 chars — keep it tight
  const desc = description.slice(0, 200).replace(/\n/g, ' ')
  return `${name}: ${desc}. Style: ${hint}`.slice(0, 580)
}

interface AutoGenerate3DResult {
  success: boolean
  taskId?: string
  error?: string
}

/**
 * Queue a 3D model generation via Meshy for a given entity.
 * Returns the Meshy task ID. The model URL must be polled and
 * saved by the client or a background check.
 */
export async function queueEntityModel(entityId: string): Promise<AutoGenerate3DResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Fetch entity
  const { data: entity, error: fetchErr } = await supabase
    .from('canon_entities')
    .select('id, name, type, description, extended_lore, created_by')
    .eq('id', entityId)
    .single()

  if (fetchErr || !entity) {
    return { success: false, error: 'Entity not found' }
  }

  const entityRow = entity as unknown as {
    id: string; name: string; type: string;
    description: string | null; extended_lore: Record<string, unknown> | null;
    created_by: string
  }

  if (entityRow.created_by !== user.id) {
    return { success: false, error: 'You can only generate models for your own entities' }
  }

  if (!entityRow.description) {
    return { success: false, error: 'Entity needs a description before 3D generation' }
  }

  // Check if a model already exists
  if (entityRow.extended_lore?.model_url) {
    return { success: false, error: 'Entity already has a 3D model' }
  }

  const prompt = buildMeshyPrompt(
    entityRow.name,
    entityRow.type,
    entityRow.description,
    entityRow.extended_lore?.tagline as string | undefined
  )

  try {
    const taskId = await createTextTo3DPreview({
      mode: 'preview',
      prompt,
      ai_model: 'latest',
      target_formats: ['glb'],
      should_remesh: false,
    })

    // Store the task ID in extended_lore so the client can poll
    const updatedLore = {
      ...(entityRow.extended_lore || {}),
      meshy_task_id: taskId,
      meshy_status: 'pending',
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('canon_entities') as any)
      .update({ extended_lore: updatedLore })
      .eq('id', entityId)

    return { success: true, taskId }
  } catch (err) {
    console.error('[Auto 3D] Meshy request failed:', err)
    return { success: false, error: 'Failed to start 3D generation' }
  }
}

/**
 * Check a pending Meshy task and update the entity with the model URL.
 * Returns the current status.
 */
export async function checkEntityModelStatus(entityId: string): Promise<{
  success: boolean
  status?: string
  modelUrl?: string
  thumbnailUrl?: string
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: entity } = await supabase
    .from('canon_entities')
    .select('id, extended_lore, created_by')
    .eq('id', entityId)
    .single()

  if (!entity) return { success: false, error: 'Entity not found' }

  const entityRow = entity as unknown as {
    id: string; extended_lore: Record<string, unknown> | null; created_by: string
  }

  if (entityRow.created_by !== user.id) {
    return { success: false, error: 'Access denied' }
  }

  const taskId = entityRow.extended_lore?.meshy_task_id as string | undefined
  if (!taskId) {
    return { success: false, error: 'No pending 3D task for this entity' }
  }

  try {
    const task = await getTextTo3DTask(taskId)

    if (task.status === 'SUCCEEDED') {
      const glbUrl = task.model_urls?.glb
      const thumbnail = task.thumbnail_url

      const updatedLore = {
        ...(entityRow.extended_lore || {}),
        model_url: glbUrl || null,
        model_thumbnail_url: thumbnail || null,
        meshy_status: 'succeeded',
        meshy_task_id: undefined, // Clear task ID
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('canon_entities') as any)
        .update({ extended_lore: updatedLore })
        .eq('id', entityId)

      return { success: true, status: 'SUCCEEDED', modelUrl: glbUrl, thumbnailUrl: thumbnail }
    }

    if (task.status === 'FAILED' || task.status === 'CANCELED') {
      const updatedLore = {
        ...(entityRow.extended_lore || {}),
        meshy_status: 'failed',
        meshy_task_id: undefined,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('canon_entities') as any)
        .update({ extended_lore: updatedLore })
        .eq('id', entityId)

      return { success: true, status: task.status }
    }

    // Still in progress
    return { success: true, status: task.status }
  } catch (err) {
    console.error('[Auto 3D] Status check failed:', err)
    return { success: false, error: 'Failed to check model status' }
  }
}
