import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/debug/stories
 * Debug endpoint to test story fetching (admin only)
 */
export async function GET() {
  try {
    // Auth + admin check — single client
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: isAdmin } = await supabase.rpc('is_admin_check')
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const results: Record<string, unknown> = {}
    
    // Test 1: Check environment variables
    results.envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }
    
    // Test 2: Try admin client
    const adminClient = createAdminClient()
    results.adminClientCreated = !!adminClient
    
    if (adminClient) {
      // Run admin queries in parallel
      const [adminStoriesResult, entitiesResult] = await Promise.all([
        adminClient
          .from('stories')
          .select('id, title, canon_status')
          .limit(10),
        adminClient
          .from('canon_entities')
          .select('id, name, status')
          .limit(5),
      ])
      
      results.adminQuery = {
        success: !adminStoriesResult.error,
        error: adminStoriesResult.error ? adminStoriesResult.error.message : null,
        count: adminStoriesResult.data?.length || 0,
        stories: adminStoriesResult.data || []
      }
      
      results.entitiesQuery = {
        success: !entitiesResult.error,
        error: entitiesResult.error ? entitiesResult.error.message : null,
        count: entitiesResult.data?.length || 0,
      }
    }
    
    // Test 3: Regular client query (reuse the same client from auth)
    const { data: regularStories, error: regularError } = await supabase
      .from('stories')
      .select('id, title, canon_status')
      .limit(10) as { data: Array<{ id: string; title: string; canon_status: string }> | null; error: Error | null }
    
    results.regularQuery = {
      success: !regularError,
      error: regularError ? regularError.message : null,
      count: regularStories?.length || 0,
      stories: regularStories || []
    }
    
    results.auth = {
      isLoggedIn: true,
      userId: user?.id || null,
    }
    
    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}
