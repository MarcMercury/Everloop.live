'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  getWritingStatsSummary,
  getDailyStats,
  getWritingGoals,
  updateWritingGoals,
} from '@/lib/actions/writing-stats'
import { formatDuration, formatWordCount } from '@/lib/utils/writing-stats'
import type { WritingStatsSummary, DailyWritingStats, WritingGoals } from '@/types/database'
import { Flame, Target, Clock, PenLine, Calendar, Settings, TrendingUp } from 'lucide-react'

interface WritingStatsCardProps {
  className?: string
}

export function WritingStatsCard({ className }: WritingStatsCardProps) {
  const [summary, setSummary] = useState<WritingStatsSummary | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyWritingStats[]>([])
  const [goals, setGoals] = useState<WritingGoals | null>(null)
  const [loading, setLoading] = useState(true)
  const [goalsDialogOpen, setGoalsDialogOpen] = useState(false)

  const loadStats = useCallback(async () => {
    try {
      const [summaryData, dailyData, goalsData] = await Promise.all([
        getWritingStatsSummary(30),
        getDailyStats(30),
        getWritingGoals(),
      ])
      setSummary(summaryData)
      setDailyStats(dailyData)
      setGoals(goalsData)
    } catch (error) {
      console.error('Error loading writing stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Writing Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Writing Stats
            </CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </div>
          <GoalsDialog
            goals={goals}
            open={goalsDialogOpen}
            onOpenChange={setGoalsDialogOpen}
            onSave={loadStats}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Streak & Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatBox
            icon={<Flame className="h-4 w-4 text-orange-500" />}
            label="Current Streak"
            value={`${summary?.current_streak || 0} days`}
            sublabel={`Best: ${summary?.longest_streak || 0} days`}
          />
          <StatBox
            icon={<PenLine className="h-4 w-4 text-blue-500" />}
            label="Total Words"
            value={formatWordCount(summary?.total_words || 0)}
            sublabel={`${summary?.avg_words_per_day || 0}/day avg`}
          />
          <StatBox
            icon={<Clock className="h-4 w-4 text-green-500" />}
            label="Time Writing"
            value={formatDuration(summary?.total_duration_seconds || 0)}
            sublabel={`${summary?.total_sessions || 0} sessions`}
          />
          <StatBox
            icon={<Calendar className="h-4 w-4 text-purple-500" />}
            label="Active Days"
            value={`${summary?.days_with_writing || 0}/30`}
            sublabel="days with writing"
          />
        </div>

        {/* Daily Goal Progress */}
        {goals && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5">
                <Target className="h-4 w-4" />
                Today&apos;s Goal
              </span>
              <span className="text-muted-foreground">
                {getTodayProgress(dailyStats)} / {goals.daily_word_goal} words
              </span>
            </div>
            <Progress 
              value={Math.min(100, (getTodayProgress(dailyStats) / goals.daily_word_goal) * 100)} 
              className="h-2"
            />
          </div>
        )}

        {/* Activity Heatmap */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Activity</h4>
          <ActivityHeatmap dailyStats={dailyStats} />
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

function StatBox({ 
  icon, 
  label, 
  value, 
  sublabel 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  sublabel: string
}) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{sublabel}</div>
    </div>
  )
}

function ActivityHeatmap({ dailyStats }: { dailyStats: DailyWritingStats[] }) {
  // Create a map of date -> words for quick lookup
  const statsMap = new Map(dailyStats.map(s => [s.date, s.total_words]))

  // Generate last 30 days
  const days: { date: string; words: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      words: statsMap.get(dateStr) || 0,
    })
  }

  // Calculate max for intensity
  const maxWords = Math.max(...days.map(d => d.words), 1)

  return (
    <div className="flex gap-1 flex-wrap">
      {days.map((day, i) => {
        const intensity = day.words > 0 ? Math.max(0.2, day.words / maxWords) : 0
        const date = new Date(day.date)
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        
        return (
          <div
            key={day.date}
            className="w-6 h-6 rounded-sm transition-colors cursor-default group relative"
            style={{
              backgroundColor: intensity > 0 
                ? `hsl(var(--primary) / ${intensity})` 
                : 'hsl(var(--muted))',
            }}
            title={`${monthDay}: ${day.words} words`}
          >
            {/* Show day number on hover or for every 7th day */}
            {i % 7 === 0 && (
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
                {dayName}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function GoalsDialog({ 
  goals, 
  open, 
  onOpenChange,
  onSave 
}: { 
  goals: WritingGoals | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}) {
  const [dailyGoal, setDailyGoal] = useState(goals?.daily_word_goal || 500)
  const [weeklyGoal, setWeeklyGoal] = useState(goals?.weekly_word_goal || 3500)
  const [monthlyGoal, setMonthlyGoal] = useState(goals?.monthly_word_goal || 15000)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (goals) {
      setDailyGoal(goals.daily_word_goal)
      setWeeklyGoal(goals.weekly_word_goal)
      setMonthlyGoal(goals.monthly_word_goal)
    }
  }, [goals])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateWritingGoals({
        daily_word_goal: dailyGoal,
        weekly_word_goal: weeklyGoal,
        monthly_word_goal: monthlyGoal,
      })
      onSave()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving goals:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Writing Goals</DialogTitle>
          <DialogDescription>
            Set your writing goals to track your progress
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="daily">Daily Word Goal</Label>
            <Input
              id="daily"
              type="number"
              min={1}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weekly">Weekly Word Goal</Label>
            <Input
              id="weekly"
              type="number"
              min={1}
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly">Monthly Word Goal</Label>
            <Input
              id="monthly"
              type="number"
              min={1}
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Goals'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Helpers
// ============================================================================

function getTodayProgress(dailyStats: DailyWritingStats[]): number {
  const today = new Date().toISOString().split('T')[0]
  const todayStats = dailyStats.find(s => s.date === today)
  return todayStats?.total_words || 0
}

export default WritingStatsCard
