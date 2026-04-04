import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
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
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }

    // Fetch auth users
    const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
      perPage: 1000,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    // Fetch profiles
    const { data: profiles, error: profileError } = await adminClient
      .from('profiles')
      .select('id, username, display_name, avatar_url, role, is_admin, created_at, updated_at, last_sign_in_at') as {
        data: Array<{
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          role: string
          is_admin: boolean
          created_at: string
          updated_at: string
          last_sign_in_at: string | null
        }> | null
        error: Error | null
      }

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

    // Merge auth users with profiles
    const users = authData.users.map(authUser => {
      const profile = profileMap.get(authUser.id)
      // banned_until may not be in the TS type but exists in Supabase Auth
      const rawUser = authUser as unknown as Record<string, unknown>
      const bannedUntil = rawUser.banned_until as string | null | undefined
      return {
        id: authUser.id,
        email: authUser.email || '',
        username: profile?.username || null,
        display_name: profile?.display_name || null,
        avatar_url: profile?.avatar_url || null,
        role: profile?.role || 'writer',
        is_admin: profile?.is_admin || false,
        created_at: authUser.created_at,
        last_sign_in_at: profile?.last_sign_in_at || authUser.last_sign_in_at || null,
        is_banned: !!bannedUntil && new Date(bannedUntil) > new Date(),
        banned_until: bannedUntil || null,
        email_confirmed_at: authUser.email_confirmed_at || null,
        has_profile: !!profile,
      }
    })

    // Sort by created_at descending (newest first)
    users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ users })
  } catch (err) {
    console.error('[Admin Users API] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
