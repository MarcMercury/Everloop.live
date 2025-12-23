'use server'

import { createClient } from '@/lib/supabase/server'

// Achievement types
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type AchievementCategory = 'writing' | 'stories' | 'canon' | 'streaks' | 'special' | 'lore'

export interface Achievement {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  tier: AchievementTier
  requirement_type: string
  requirement_value: number
  points: number
  is_secret: boolean
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  notified: boolean
  achievement?: Achievement
}

export interface AchievementProgress {
  achievement_id: string
  current_value: number
  achievement?: Achievement
}

export interface AchievementWithProgress extends Achievement {
  unlocked: boolean
  unlocked_at?: string
  current_value: number
  progress_percent: number
}

export interface NewAchievement {
  id: string
  name: string
  icon: string
}

/**
 * Get all achievements with user progress
 */
export async function getAchievementsWithProgress(): Promise<{
  data: AchievementWithProgress[] | null
  error: string | null
}> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }
  
  // Get all achievements
  const { data: achievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*')
    .order('tier', { ascending: true })
    .order('requirement_value', { ascending: true }) as { data: Achievement[] | null; error: Error | null }
  
  if (achievementsError) {
    return { data: null, error: achievementsError.message }
  }
  
  // Get user's unlocked achievements
  const { data: unlocked } = await supabase
    .from('user_achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', user.id) as { data: Array<{ achievement_id: string; unlocked_at: string }> | null }
  
  // Get user's progress
  const { data: progress } = await supabase
    .from('achievement_progress')
    .select('achievement_id, current_value')
    .eq('user_id', user.id) as { data: Array<{ achievement_id: string; current_value: number }> | null }
  
  const unlockedMap = new Map(unlocked?.map(u => [u.achievement_id, u.unlocked_at]) || [])
  const progressMap = new Map(progress?.map(p => [p.achievement_id, p.current_value]) || [])
  
  const result: AchievementWithProgress[] = (achievements || []).map(a => {
    const currentValue = progressMap.get(a.id) || 0
    const isUnlocked = unlockedMap.has(a.id)
    
    return {
      ...a,
      unlocked: isUnlocked,
      unlocked_at: unlockedMap.get(a.id),
      current_value: currentValue,
      progress_percent: Math.min(100, Math.round((currentValue / a.requirement_value) * 100))
    }
  })
  
  return { data: result, error: null }
}

/**
 * Get user's unlocked achievements
 */
export async function getUserAchievements(): Promise<{
  data: UserAchievement[] | null
  error: string | null
}> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }
  
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', user.id)
    .order('unlocked_at', { ascending: false })
  
  if (error) {
    return { data: null, error: error.message }
  }
  
  return { data: data as UserAchievement[], error: null }
}

/**
 * Check for new achievements and return any newly unlocked ones
 */
export async function checkAchievements(): Promise<{
  data: NewAchievement[] | null
  error: string | null
}> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }
  
  // Call the database function to check achievements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('check_achievements', {
    p_user_id: user.id
  })
  
  if (error) {
    console.error('Error checking achievements:', error)
    return { data: null, error: error.message }
  }
  
  // Map the result
  const newAchievements: NewAchievement[] = (data || []).map((a: { 
    achievement_id: string
    achievement_name: string
    achievement_icon: string 
  }) => ({
    id: a.achievement_id,
    name: a.achievement_name,
    icon: a.achievement_icon
  }))
  
  return { data: newAchievements, error: null }
}

/**
 * Mark achievements as notified
 */
export async function markAchievementsNotified(achievementIds: string[]): Promise<{
  success: boolean
  error: string | null
}> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('user_achievements')
    .update({ notified: true })
    .eq('user_id', user.id)
    .in('achievement_id', achievementIds)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true, error: null }
}

/**
 * Get pending (unnotified) achievements
 */
export async function getPendingAchievements(): Promise<{
  data: UserAchievement[] | null
  error: string | null
}> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', user.id)
    .eq('notified', false)
    .order('unlocked_at', { ascending: false })
  
  if (error) {
    return { data: null, error: error.message }
  }
  
  return { data: data as UserAchievement[], error: null }
}

/**
 * Get achievement stats summary
 */
export async function getAchievementStats(): Promise<{
  data: {
    total: number
    unlocked: number
    points: number
    tier_counts: Record<AchievementTier, { total: number; unlocked: number }>
  } | null
  error: string | null
}> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }
  
  // Get all achievements
  const { data: achievements } = await (supabase as any)
    .from('achievements')
    .select('id, tier, points') as { data: { id: string; tier: string; points: number }[] | null }
  
  // Get user's unlocked achievements
  const { data: unlocked } = await (supabase as any)
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', user.id) as { data: { achievement_id: string }[] | null }
  
  const unlockedIds = new Set(unlocked?.map(u => u.achievement_id) || [])
  
  const tiers: AchievementTier[] = ['bronze', 'silver', 'gold', 'platinum']
  const tier_counts: Record<AchievementTier, { total: number; unlocked: number }> = {
    bronze: { total: 0, unlocked: 0 },
    silver: { total: 0, unlocked: 0 },
    gold: { total: 0, unlocked: 0 },
    platinum: { total: 0, unlocked: 0 }
  }
  
  let totalPoints = 0
  
  for (const a of achievements || []) {
    const tier = a.tier as AchievementTier
    if (tiers.includes(tier)) {
      tier_counts[tier].total++
      if (unlockedIds.has(a.id)) {
        tier_counts[tier].unlocked++
        totalPoints += a.points
      }
    }
  }
  
  return {
    data: {
      total: achievements?.length || 0,
      unlocked: unlockedIds.size,
      points: totalPoints,
      tier_counts
    },
    error: null
  }
}

/**
 * Get achievements for display on a user's profile
 */
export async function getProfileAchievements(userId: string): Promise<{
  data: {
    featured: UserAchievement[]
    total_count: number
    total_points: number
  } | null
  error: string | null
}> {
  const supabase = await createClient()
  
  // Get user's unlocked achievements (top 6 by points/rarity)
  const { data: unlocked, error } = await (supabase as any)
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })
    .limit(6) as { data: any[] | null; error: any }
  
  if (error) {
    return { data: null, error: error.message }
  }
  
  // Get total count and points
  const { data: allUnlocked } = await (supabase as any)
    .from('user_achievements')
    .select(`
      achievement:achievements(points)
    `)
    .eq('user_id', userId) as { data: { achievement: { points: number } | null }[] | null }
  
  const totalPoints = (allUnlocked || []).reduce((sum, u) => {
    const achievement = u.achievement as { points: number } | null
    return sum + (achievement?.points || 0)
  }, 0)
  
  return {
    data: {
      featured: (unlocked || []) as UserAchievement[],
      total_count: allUnlocked?.length || 0,
      total_points: totalPoints
    },
    error: null
  }
}
