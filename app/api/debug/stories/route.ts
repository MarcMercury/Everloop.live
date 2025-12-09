import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/debug/stories
 * Debug endpoint to test story fetching
 */
export async function GET() {
  try {
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
      const { data: adminStories, error: adminError } = await adminClient
        .from('stories')
        .select('id, title, canon_status')
        .limit(10)
      
      results.adminQuery = {
        success: !adminError,
        error: adminError ? adminError.message : null,
        count: adminStories?.length || 0,
        stories: adminStories?.map(s => ({ id: s.id, title: s.title, status: s.canon_status })) || []
      }
    }
    
    // Test 3: Try regular client
    const regularClient = await createClient()
    const { data: regularStories, error: regularError } = await regularClient
      .from('stories')
      .select('id, title, canon_status')
      .limit(10)
    
    results.regularQuery = {
      success: !regularError,
      error: regularError ? regularError.message : null,
      count: regularStories?.length || 0,
      stories: regularStories?.map(s => ({ id: s.id, title: s.title, status: s.canon_status })) || []
    }
    
    // Test 4: Check auth status with regular client
    const { data: { user }, error: authError } = await regularClient.auth.getUser()
    results.auth = {
      isLoggedIn: !!user,
      userId: user?.id || null,
      email: user?.email || null,
      authError: authError?.message || null
    }
    
    // Test 5: Try entities too
    if (adminClient) {
      const { data: entities, error: entityError } = await adminClient
        .from('canon_entities')
        .select('id, name, status')
        .limit(5)
      
      results.entitiesQuery = {
        success: !entityError,
        error: entityError ? entityError.message : null,
        count: entities?.length || 0,
      }
    }
    
    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}
