import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, wordCount } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the session
    const { data: session } = await supabase
      .from('writing_sessions' as unknown as never)
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    const typedSession = session as unknown as { 
      started_at: string
      words_at_start: number 
    }
    
    const now = new Date()
    const startedAt = new Date(typedSession.started_at)
    const durationSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000)
    const wordsWritten = Math.max(0, (wordCount || 0) - typedSession.words_at_start)
    
    // Update the session
    await supabase
      .from('writing_sessions' as unknown as never)
      .update({
        ended_at: now.toISOString(),
        duration_seconds: durationSeconds,
        words_at_end: wordCount || typedSession.words_at_start,
        words_written: wordsWritten,
        is_active: false,
      } as unknown as never)
      .eq('id', sessionId)
      .eq('user_id', user.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error ending session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
