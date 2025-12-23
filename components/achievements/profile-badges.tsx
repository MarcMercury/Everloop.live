'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Trophy } from 'lucide-react'
import type { UserAchievement } from '@/lib/actions/achievements'

interface ProfileBadgesProps {
  achievements: UserAchievement[]
  totalCount: number
  totalPoints: number
  showAll?: boolean
}

export function ProfileBadges({
  achievements,
  totalCount,
  totalPoints,
  showAll = false
}: ProfileBadgesProps) {
  if (achievements.length === 0) {
    return null
  }
  
  const displayAchievements = showAll ? achievements : achievements.slice(0, 6)
  const moreCount = totalCount - displayAchievements.length
  
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-gold" />
          <span className="text-sm font-medium text-parchment">Achievements</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-parchment-muted">
          <span>{totalCount} earned</span>
          <span className="text-gold">{totalPoints} pts</span>
        </div>
      </div>
      
      {/* Badge grid */}
      <div className="flex flex-wrap gap-2">
        {displayAchievements.map((ua) => {
          const achievement = ua.achievement
          if (!achievement) return null
          
          return (
            <div
              key={ua.id}
              className="group relative"
              title={`${achievement.name}: ${achievement.description}`}
            >
              <div className={cn(
                "w-10 h-10 flex items-center justify-center rounded-lg text-xl",
                "bg-gold/10 border border-gold/20",
                "hover:bg-gold/20 hover:border-gold/40 transition-colors cursor-help"
              )}>
                {achievement.icon}
              </div>
              
              {/* Tooltip */}
              <div className={cn(
                "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1",
                "bg-teal-deep border border-gold/20 rounded text-xs whitespace-nowrap",
                "opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
              )}>
                {achievement.name}
              </div>
            </div>
          )
        })}
        
        {moreCount > 0 && (
          <div className="w-10 h-10 flex items-center justify-center rounded-lg text-xs bg-muted/30 border border-muted/50 text-muted-foreground">
            +{moreCount}
          </div>
        )}
      </div>
    </div>
  )
}

// Stats summary for dashboard
interface AchievementStatsProps {
  stats: {
    total: number
    unlocked: number
    points: number
    tier_counts: Record<string, { total: number; unlocked: number }>
  }
}

export function AchievementStats({ stats }: AchievementStatsProps) {
  const tiers = [
    { key: 'bronze', label: 'Bronze', color: 'text-amber-500' },
    { key: 'silver', label: 'Silver', color: 'text-slate-300' },
    { key: 'gold', label: 'Gold', color: 'text-gold' },
    { key: 'platinum', label: 'Platinum', color: 'text-purple-300' }
  ]
  
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-gold/10 border border-gold/20">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-gold" />
          <div>
            <p className="text-2xl font-bold text-parchment">
              {stats.unlocked} <span className="text-lg text-parchment-muted">/ {stats.total}</span>
            </p>
            <p className="text-sm text-parchment-muted">Achievements Earned</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gold">{stats.points}</p>
          <p className="text-sm text-parchment-muted">Total Points</p>
        </div>
      </div>
      
      {/* Tier breakdown */}
      <div className="grid grid-cols-4 gap-2">
        {tiers.map(tier => {
          const counts = stats.tier_counts[tier.key] || { total: 0, unlocked: 0 }
          return (
            <div 
              key={tier.key}
              className="text-center p-2 rounded-lg bg-muted/20"
            >
              <p className={cn("text-lg font-bold", tier.color)}>
                {counts.unlocked}/{counts.total}
              </p>
              <p className="text-xs text-muted-foreground">{tier.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
