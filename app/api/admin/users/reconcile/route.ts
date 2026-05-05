import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Admin tool: backfill profiles for any auth.users without one.
 * Calls the SECURITY DEFINER RPC `reconcile_orphan_profiles()` which
 * is granted to service_role only.
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin_check')
    if (rpcError || !isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json(
        { error: 'Admin client not configured (missing SUPABASE_SERVICE_ROLE_KEY)' },
        { status: 500 },
      )
    }

    const { data, error } = await adminClient.rpc('reconcile_orphan_profiles')
    if (error) {
      console.error('[Admin Reconcile] RPC error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ fixed: data ?? 0 })
  } catch (err) {
    console.error('[Admin Reconcile] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
