import { createAdminClient, createClient } from '@/lib/supabase/server'
import { ShardsClient } from './shards-client'
import type { ShardRecord } from '@/types/shard'

export const metadata = {
  title: 'Shard Management | Everloop Admin',
  description: 'Manage the 88 Shards across all regions of the Everloop',
}

async function getShards(): Promise<ShardRecord[]> {
  const adminClient = createAdminClient()
  const regularClient = await createClient()
  const client = adminClient || regularClient

  const { data, error } = await client
    .from('shards')
    .select('*')
    .order('shard_number', { ascending: true })

  if (error) {
    console.error('[Admin Shards] Error fetching shards:', error)
    return []
  }

  return (data || []) as unknown as ShardRecord[]
}

export default async function AdminShardsPage() {
  const shards = await getShards()

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-parchment mb-2">Shard Management</h1>
        <p className="text-parchment-muted">
          88 Shards across 8 regions — fragments of what holds reality together.
        </p>
      </div>
      <ShardsClient shards={shards} />
    </div>
  )
}
