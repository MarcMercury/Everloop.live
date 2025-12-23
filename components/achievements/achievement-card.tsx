'use client'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { Trophy, Lock } from 'lucide-react'
import type { AchievementWithProgress, AchievementTier } from '@/lib/actions/achievements'

interface AchievementCardProps {
  achievement: AchievementWithProgress
  compact?: boolean
}

const TIER_STYLES: Record<AchievementTier, { bg: string; border: string; text: string; glow: string }> = {
  bronze: {
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/30',
    text: 'text-amber-500',
    glow: 'shadow-amber-500/20'
  },
  silver: {
    bg: 'bg-slate-400/20',
    border: 'border-slate-400/30',
    text: 'text-slate-300',
    glow: 'shadow-slate-300/20'
  },
  gold: {
    bg: 'bg-gold/20',
    border: 'border-gold/30',
    text: 'text-gold',
    glow: 'shadow-gold/20'
  },
  platinum: {
    bg: 'bg-purple-400/20',
    border: 'border-purple-400/30',
    text: 'text-purple-300',
    glow: 'shadow-purple-300/20'
  }
}

export function AchievementCard({ achievement, compact = false }: AchievementCardProps) {
  const tierStyle = TIER_STYLES[achievement.tier]
  const isUnlocked = achievement.unlocked
  const isSecret = achievement.is_secret && !isUnlocked
  
  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-all",
          isUnlocked
            ? `${tierStyle.bg} ${tierStyle.border} shadow-md ${tierStyle.glow}`
            : "bg-muted/30 border-muted/50 opacity-60"
        )}
        title={isSecret ? 'Secret Achievement' : achievement.description}
      >
        <span className={cn(
          "text-2xl",
          !isUnlocked && "grayscale opacity-50"
        )}>
          {isSecret ? '❓' : achievement.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium text-sm truncate",
            isUnlocked ? tierStyle.text : "text-muted-foreground"
          )}>
            {isSecret ? '???' : achievement.name}
          </p>
          {!isUnlocked && !isSecret && (
            <div className="mt-1">
              <Progress 
                value={achievement.progress_percent} 
                className="h-1"
              />
            </div>
          )}
        </div>
        {isUnlocked && (
          <Trophy className={cn("w-4 h-4", tierStyle.text)} />
        )}
      </div>
    )
  }
  
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 transition-all",
        isUnlocked
          ? `${tierStyle.bg} ${tierStyle.border} shadow-lg ${tierStyle.glow}`
          : "bg-muted/20 border-muted/40"
      )}
    >
      {/* Locked overlay */}
      {!isUnlocked && !isSecret && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      )}
      
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-lg text-4xl",
          isUnlocked ? tierStyle.bg : "bg-muted/30",
          !isUnlocked && "grayscale"
        )}>
          {isSecret ? (
            <Lock className="w-8 h-8 text-muted-foreground" />
          ) : (
            achievement.icon
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              "font-serif font-semibold",
              isUnlocked ? tierStyle.text : "text-muted-foreground"
            )}>
              {isSecret ? 'Secret Achievement' : achievement.name}
            </h3>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs capitalize",
                isUnlocked ? tierStyle.border : "border-muted"
              )}
            >
              {achievement.tier}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {isSecret ? 'Keep exploring to unlock this secret achievement!' : achievement.description}
          </p>
          
          {/* Progress */}
          {!isUnlocked && !isSecret && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className={tierStyle.text}>
                  {achievement.current_value} / {achievement.requirement_value}
                </span>
              </div>
              <Progress 
                value={achievement.progress_percent} 
                className="h-2"
              />
            </div>
          )}
          
          {/* Unlocked info */}
          {isUnlocked && achievement.unlocked_at && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Trophy className="w-3 h-3" />
              <span>
                Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
              </span>
              <span className={tierStyle.text}>+{achievement.points} pts</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Grid display for achievements
interface AchievementGridProps {
  achievements: AchievementWithProgress[]
  showLocked?: boolean
  compact?: boolean
}

export function AchievementGrid({ 
  achievements, 
  showLocked = true,
  compact = false 
}: AchievementGridProps) {
  const filtered = showLocked 
    ? achievements 
    : achievements.filter(a => a.unlocked)
  
  if (filtered.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No achievements yet</p>
        <p className="text-sm">Start writing to unlock achievements!</p>
      </div>
    )
  }
  
  return (
    <div className={cn(
      "grid gap-4",
      compact 
        ? "grid-cols-1 sm:grid-cols-2" 
        : "grid-cols-1 lg:grid-cols-2"
    )}>
      {filtered.map(achievement => (
        <AchievementCard 
          key={achievement.id} 
          achievement={achievement}
          compact={compact}
        />
      ))}
    </div>
  )
}
