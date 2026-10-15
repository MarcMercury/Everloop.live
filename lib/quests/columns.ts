import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Explicit column lists for quest tables that carry DM-only fields.
 *
 * `quest_scenes.dm_notes` and `quest_npcs.secrets` are not SELECT-able by the
 * `anon`/`authenticated` roles (column privileges, see migration
 * 20261014_001_protect_dm_secrets.sql). Never use `select('*')` or a bare
 * `.select()` on these tables with a user-scoped client — PostgREST would
 * request the protected column and the query fails. DM screens load the
 * secrets separately via `attachDmSecrets()`.
 */
export const QUEST_SCENE_PUBLIC_COLUMNS = [
  'id',
  'quest_id',
  'title',
  'description',
  'scene_order',
  'scene_type',
  'mood',
  'atmosphere',
  'map_url',
  'image_url',
  'layout_description',
  'map_data',
  'fog_of_war',
  'triggers',
  'npcs',
  'narration',
  'status',
  'linked_entities',
  'metadata',
  'feeling',
  'reveal',
  'choice',
  'sensory_anchors',
  'pacing',
  'created_at',
  'updated_at',
].join(', ')

export const QUEST_NPC_PUBLIC_COLUMNS = [
  'id',
  'quest_id',
  'canon_entity_id',
  'name',
  'description',
  'portrait_url',
  'npc_type',
  'stats',
  'personality',
  'voice_style',
  'motivations',
  'is_alive',
  'is_visible',
  'current_scene_id',
  'metadata',
  'wants',
  'wont',
  'quirk',
  'voice_note',
  'why_here',
  'shard_ref',
  'created_at',
  'updated_at',
].join(', ')

type Client = SupabaseClient<Database>

interface DmSecrets {
  scenes: Record<string, string | null>
  npcs: Record<string, string | null>
}

async function fetchDmSecrets(supabase: Client, questId: string): Promise<DmSecrets> {
  const { data, error } = await supabase.rpc('get_quest_dm_secrets', { p_quest_id: questId })
  if (!error) return (data as DmSecrets | null) ?? { scenes: {}, npcs: {} }

  // Fallback for databases where the protect-dm-secrets migration has not run
  // yet: the columns are still directly readable (RLS keeps this DM-scoped).
  const [scenes, npcs] = await Promise.all([
    supabase.from('quest_scenes').select('id, dm_notes').eq('quest_id', questId),
    supabase.from('quest_npcs').select('id, secrets').eq('quest_id', questId),
  ])
  if (scenes.error || npcs.error) {
    console.error(
      '[attachDmSecrets] unable to load DM secrets:',
      error?.message ?? scenes.error?.message ?? npcs.error?.message,
    )
    return { scenes: {}, npcs: {} }
  }
  return {
    scenes: Object.fromEntries((scenes.data ?? []).map((s) => [s.id, s.dm_notes ?? null])),
    npcs: Object.fromEntries((npcs.data ?? []).map((n) => [n.id, n.secrets ?? null])),
  }
}

/**
 * Merge DM-only fields back onto scene/NPC rows. Only call this after
 * verifying the current user is the quest's DM; the RPC enforces it too.
 */
export async function attachDmSecrets<S extends { id: string }, N extends { id: string }>(
  supabase: Client,
  questId: string,
  rows: { scenes?: S[]; npcs?: N[] },
): Promise<{ scenes: (S & { dm_notes: string | null })[]; npcs: (N & { secrets: string | null })[] }> {
  const secrets = await fetchDmSecrets(supabase, questId)
  return {
    scenes: (rows.scenes ?? []).map((s) => ({ ...s, dm_notes: secrets.scenes[s.id] ?? null })),
    npcs: (rows.npcs ?? []).map((n) => ({ ...n, secrets: secrets.npcs[n.id] ?? null })),
  }
}
