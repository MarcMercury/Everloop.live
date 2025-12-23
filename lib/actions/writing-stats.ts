'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { 
  WritingSession, 
  WritingSessionInsert, 
  WritingGoals,
  DailyWritingStats,
  WritingStatsSummary 
} from '@/types/database'

// ============================================================================
// Session Management
// ============================================================================

export async function startWritingSession(
  storyId: string | null,
  chapterId: string | null = null,
  wordsAtStart: number = 0
): Promise<{ data: WritingSession | null; error: string | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  // End any active sessions first
  await endAllActiveSessions()

  const sessionData: WritingSessionInsert = {
    user_id: user.id,
    story_id: storyId,
    chapter_id: chapterId,
    words_at_start: wordsAtStart,
    is_active: true,
  }

  const { data, error } = await supabase
    .from('writing_sessions' as unknown as never)
    .insert(sessionData as unknown as never)
    .select()
    .single()

  if (error) {
    console.error('Error starting session:', error)
    return { data: null, error: error.message }
  }

  return { data: data as unknown as WritingSession, error: null }
}

export async function updateSessionWords(
  sessionId: string,
  currentWords: number
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get the session to calculate words written
  const { data: session } = await supabase
    .from('writing_sessions' as unknown as never)
    .select('words_at_start')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) {
    return { success: false, error: 'Session not found' }
  }

  const wordsWritten = currentWords - (session as unknown as WritingSession).words_at_start

  const { error } = await supabase
    .from('writing_sessions' as unknown as never)
    .update({
      words_at_end: currentWords,
      words_written: Math.max(0, wordsWritten),
    } as unknown as never)
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating session:', error)
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

export async function endWritingSession(
  sessionId: string,
  finalWords: number
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get the session
  const { data: session } = await supabase
    .from('writing_sessions' as unknown as never)
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) {
    return { success: false, error: 'Session not found' }
  }

  const typedSession = session as unknown as WritingSession
  const now = new Date()
  const startedAt = new Date(typedSession.started_at)
  const durationSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000)
  const wordsWritten = finalWords - typedSession.words_at_start

  const { error } = await supabase
    .from('writing_sessions' as unknown as never)
    .update({
      ended_at: now.toISOString(),
      duration_seconds: durationSeconds,
      words_at_end: finalWords,
      words_written: Math.max(0, wordsWritten),
      is_active: false,
    } as unknown as never)
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error ending session:', error)
    return { success: false, error: error.message }
  }

  // Aggregate to daily stats
  await aggregateDailyStats(user.id, now)

  revalidatePath('/dashboard')
  return { success: true, error: null }
}

export async function endAllActiveSessions(): Promise<void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const now = new Date()

  // Get all active sessions
  const { data: sessions } = await supabase
    .from('writing_sessions' as unknown as never)
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (!sessions || sessions.length === 0) return

  for (const session of sessions as unknown as WritingSession[]) {
    const startedAt = new Date(session.started_at)
    const durationSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000)

    await supabase
      .from('writing_sessions' as unknown as never)
      .update({
        ended_at: now.toISOString(),
        duration_seconds: durationSeconds,
        is_active: false,
      } as unknown as never)
      .eq('id', session.id)
  }
}

export async function getActiveSession(): Promise<WritingSession | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('writing_sessions' as unknown as never)
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  return data as unknown as WritingSession | null
}

// ============================================================================
// Daily Stats Aggregation
// ============================================================================

async function aggregateDailyStats(userId: string, date: Date): Promise<void> {
  const supabase = await createClient()
  
  const dateStr = date.toISOString().split('T')[0]
  const startOfDay = `${dateStr}T00:00:00.000Z`
  const endOfDay = `${dateStr}T23:59:59.999Z`

  // Get all sessions for the day
  const { data: sessions } = await supabase
    .from('writing_sessions' as unknown as never)
    .select(`
      *,
      stories:story_id (id, title)
    `)
    .eq('user_id', userId)
    .eq('is_active', false)
    .gte('started_at', startOfDay)
    .lte('started_at', endOfDay)

  if (!sessions || sessions.length === 0) return

  const typedSessions = sessions as unknown as (WritingSession & { stories: { id: string; title: string } | null })[]

  // Calculate totals
  const totalWords = typedSessions.reduce((sum, s) => sum + (s.words_written || 0), 0)
  const totalDuration = typedSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0)

  // Group by story
  const storyMap = new Map<string, { story_id: string; title: string; words: number }>()
  for (const session of typedSessions) {
    if (session.story_id && session.stories) {
      const existing = storyMap.get(session.story_id)
      if (existing) {
        existing.words += session.words_written || 0
      } else {
        storyMap.set(session.story_id, {
          story_id: session.story_id,
          title: session.stories.title,
          words: session.words_written || 0,
        })
      }
    }
  }

  // Get user's daily goal
  const { data: goals } = await supabase
    .from('writing_goals' as unknown as never)
    .select('daily_word_goal')
    .eq('user_id', userId)
    .single()

  const dailyGoal = (goals as unknown as WritingGoals)?.daily_word_goal || 500

  // Upsert daily stats
  const { error } = await supabase
    .from('daily_writing_stats' as unknown as never)
    .upsert({
      user_id: userId,
      date: dateStr,
      total_words: totalWords,
      total_sessions: typedSessions.length,
      total_duration_seconds: totalDuration,
      stories_worked_on: Array.from(storyMap.values()),
      daily_goal: dailyGoal,
      goal_met: totalWords >= dailyGoal,
    } as unknown as never, {
      onConflict: 'user_id,date',
    })

  if (error) {
    console.error('Error aggregating daily stats:', error)
  }

  // Update streak
  await updateStreak(userId, dateStr, totalWords >= dailyGoal)
}

async function updateStreak(userId: string, dateStr: string, goalMet: boolean): Promise<void> {
  const supabase = await createClient()

  // Get current goals record
  const { data: goals } = await supabase
    .from('writing_goals' as unknown as never)
    .select('*')
    .eq('user_id', userId)
    .single()

  const typedGoals = goals as unknown as WritingGoals | null

  if (!typedGoals) {
    // Create initial goals record
    await supabase
      .from('writing_goals' as unknown as never)
      .insert({
        user_id: userId,
        current_streak: goalMet ? 1 : 0,
        longest_streak: goalMet ? 1 : 0,
        last_writing_date: dateStr,
      } as unknown as never)
    return
  }

  const today = new Date(dateStr)
  const lastDate = typedGoals.last_writing_date ? new Date(typedGoals.last_writing_date) : null

  let newStreak = typedGoals.current_streak

  if (goalMet) {
    if (!lastDate) {
      newStreak = 1
    } else {
      const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff === 1) {
        // Consecutive day
        newStreak = typedGoals.current_streak + 1
      } else if (daysDiff === 0) {
        // Same day, keep current streak
        newStreak = typedGoals.current_streak
      } else {
        // Streak broken
        newStreak = 1
      }
    }
  } else if (lastDate) {
    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff > 1) {
      newStreak = 0
    }
  }

  const longestStreak = Math.max(typedGoals.longest_streak, newStreak)

  await supabase
    .from('writing_goals' as unknown as never)
    .update({
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_writing_date: dateStr,
    } as unknown as never)
    .eq('user_id', userId)
}

// ============================================================================
// Stats Retrieval
// ============================================================================

export async function getWritingStatsSummary(
  days: number = 30
): Promise<WritingStatsSummary | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  // Get daily stats for the period
  const { data: dailyStats } = await supabase
    .from('daily_writing_stats' as unknown as never)
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDateStr)
    .order('date', { ascending: false })

  const typedStats = (dailyStats || []) as unknown as DailyWritingStats[]

  // Get goals for streak info
  const { data: goals } = await supabase
    .from('writing_goals' as unknown as never)
    .select('*')
    .eq('user_id', user.id)
    .single()

  const typedGoals = goals as unknown as WritingGoals | null

  // Calculate summary
  const totalWords = typedStats.reduce((sum, s) => sum + s.total_words, 0)
  const totalSessions = typedStats.reduce((sum, s) => sum + s.total_sessions, 0)
  const totalDuration = typedStats.reduce((sum, s) => sum + s.total_duration_seconds, 0)
  const daysWithWriting = typedStats.length

  return {
    total_words: totalWords,
    total_sessions: totalSessions,
    total_duration_seconds: totalDuration,
    avg_words_per_day: daysWithWriting > 0 ? Math.round(totalWords / days) : 0,
    avg_session_duration_seconds: totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0,
    current_streak: typedGoals?.current_streak || 0,
    longest_streak: typedGoals?.longest_streak || 0,
    days_with_writing: daysWithWriting,
  }
}

export async function getDailyStats(days: number = 30): Promise<DailyWritingStats[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  const { data } = await supabase
    .from('daily_writing_stats' as unknown as never)
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDateStr)
    .order('date', { ascending: true })

  return (data || []) as unknown as DailyWritingStats[]
}

export async function getRecentSessions(limit: number = 10): Promise<WritingSession[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('writing_sessions' as unknown as never)
    .select(`
      *,
      stories:story_id (id, title, slug)
    `)
    .eq('user_id', user.id)
    .eq('is_active', false)
    .order('started_at', { ascending: false })
    .limit(limit)

  return (data || []) as unknown as WritingSession[]
}

// ============================================================================
// Goals Management
// ============================================================================

export async function getWritingGoals(): Promise<WritingGoals | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('writing_goals' as unknown as never)
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!data) {
    // Create default goals
    const { data: newGoals } = await supabase
      .from('writing_goals' as unknown as never)
      .insert({
        user_id: user.id,
        daily_word_goal: 500,
        weekly_word_goal: 3500,
        monthly_word_goal: 15000,
      } as unknown as never)
      .select()
      .single()

    return newGoals as unknown as WritingGoals
  }

  return data as unknown as WritingGoals
}

export async function updateWritingGoals(
  goals: Partial<Pick<WritingGoals, 'daily_word_goal' | 'weekly_word_goal' | 'monthly_word_goal'>>
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('writing_goals' as unknown as never)
    .upsert({
      user_id: user.id,
      ...goals,
    } as unknown as never, {
      onConflict: 'user_id',
    })

  if (error) {
    console.error('Error updating goals:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, error: null }
}
