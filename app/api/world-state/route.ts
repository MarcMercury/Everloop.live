import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/world-state
 * 
 * Public endpoint: The pulse of the Everloop.
 * Returns convergence state, regional Fray levels, and recent world events.
 * Every part of the platform can query this to stay connected to the living world.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const regionId = searchParams.get('region')

  const supabase = await createClient()

  // 1. Global convergence state
  const { data: convergence } = await supabase.rpc('get_convergence_state')

  // 2. Regional states
  let regionalQuery = supabase
    .from('regional_state')
    .select('*')
    .order('region_name')

  if (regionId) {
    regionalQuery = regionalQuery.eq('region_id', regionId)
  }

  const { data: regions } = await regionalQuery

  // 3. Recent world events
  let eventsQuery = supabase
    .from('world_events')
    .select('id, title, description, event_type, severity, region_id, created_at')
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(10)

  if (regionId) {
    eventsQuery = eventsQuery.eq('region_id', regionId)
  }

  const { data: events } = await eventsQuery

  // 4. Shard summary
  const { data: shards } = await supabase
    .from('shards')
    .select('id, name, state, power_level')
    .order('power_level', { ascending: false })

  const shardsByState: Record<string, number> = {}
  if (shards) {
    for (const shard of shards) {
      const state = (shard as { state: string }).state
      shardsByState[state] = (shardsByState[state] || 0) + 1
    }
  }

  return NextResponse.json({
    convergence: convergence ?? {
      total_shards: 0,
      gathered_shards: 0,
      convergence_percentage: 0,
      global_fray_intensity: 0.15,
      global_stability: 0.75,
      world_phase: 'scattered',
    },
    regions: regions ?? [],
    recent_events: events ?? [],
    shard_summary: {
      total: shards?.length ?? 0,
      by_state: shardsByState,
    },
    // Narrative context for consumers
    world_rules: {
      monsters_are_consequences: 'Monsters only appear where the Fray has broken reality. They are not native to the Everloop.',
      shards_pull_together: 'Every Shard exerts a pull toward other Shards. This pull is the narrative gravity of the world.',
      convergence_unknown: 'No one knows what happens when all Shards unite. This is the central mystery.',
    },
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  })
}
