'use client'

import { cn } from '@/lib/utils'
import type { ConvergenceState } from '@/lib/data/world-state'

interface WorldPulseProps {
  convergence: ConvergenceState
  compact?: boolean
  className?: string
}

const phaseLabels: Record<string, { label: string; color: string; glow: string }> = {
  dormant: { label: 'Dormant', color: 'text-gray-400', glow: 'shadow-gray-500/20' },
  scattered: { label: 'Scattered', color: 'text-teal-400', glow: 'shadow-teal-500/20' },
  stirring: { label: 'Stirring', color: 'text-amber-400', glow: 'shadow-amber-500/20' },
  awakening: { label: 'Awakening', color: 'text-orange-400', glow: 'shadow-orange-500/30' },
  convergence_imminent: { label: 'Convergence Imminent', color: 'text-red-400', glow: 'shadow-red-500/40' },
}

/**
 * WorldPulse — the heartbeat of the Everloop.
 * Shows global convergence state: how close the Shards are to gathering.
 * "The world is being decided."
 */
export function WorldPulse({ convergence, compact = false, className }: WorldPulseProps) {
  const phase = phaseLabels[convergence.world_phase] ?? phaseLabels.scattered
  const frayPercent = Math.round(convergence.global_fray_intensity * 100)
  const stabilityPercent = Math.round(convergence.global_stability * 100)

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3 text-xs', className)}>
        <div className="flex items-center gap-1.5">
          <span className={cn('w-2 h-2 rounded-full animate-pulse', 
            convergence.global_fray_intensity > 0.3 ? 'bg-red-500' : 'bg-emerald-500'
          )} />
          <span className={cn('font-medium', phase.color)}>
            {phase.label}
          </span>
        </div>
        <span className="text-parchment-muted">
          Fray: {frayPercent}%
        </span>
        {convergence.total_shards > 0 && (
          <span className="text-gold">
            Shards: {convergence.gathered_shards}/{convergence.total_shards}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      'p-4 rounded-lg border',
      'bg-gradient-to-br from-teal-rich/80 to-teal-deep/90',
      'border-gold/10',
      phase.glow,
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-serif text-gold">World Pulse</h3>
        <div className="flex items-center gap-1.5">
          <span className={cn('w-2 h-2 rounded-full animate-pulse',
            convergence.global_fray_intensity > 0.3 ? 'bg-red-500' : 'bg-emerald-500'
          )} />
          <span className={cn('text-xs font-medium', phase.color)}>
            {phase.label}
          </span>
        </div>
      </div>
      
      {/* Convergence bar */}
      <div className="space-y-1.5 mb-3">
        <div className="flex justify-between text-xs">
          <span className="text-parchment-muted">Convergence</span>
          <span className="text-gold">{convergence.convergence_percentage}%</span>
        </div>
        <div className="h-1.5 bg-charcoal-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full transition-all duration-1000"
            style={{ width: `${convergence.convergence_percentage}%` }}
          />
        </div>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="text-parchment-muted">Fray</div>
          <div className={cn('font-medium', 
            frayPercent > 30 ? 'text-red-400' : frayPercent > 15 ? 'text-amber-400' : 'text-emerald-400'
          )}>
            {frayPercent}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-parchment-muted">Stability</div>
          <div className={cn('font-medium',
            stabilityPercent > 70 ? 'text-emerald-400' : stabilityPercent > 40 ? 'text-amber-400' : 'text-red-400'
          )}>
            {stabilityPercent}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-parchment-muted">Shards</div>
          <div className="font-medium text-gold">
            {convergence.gathered_shards}/{convergence.total_shards}
          </div>
        </div>
      </div>
      
      {/* Atmospheric text */}
      <p className="text-[10px] text-parchment-muted/60 mt-3 italic text-center leading-tight">
        {convergence.world_phase === 'dormant' && 'The Shards sleep, scattered and silent.'}
        {convergence.world_phase === 'scattered' && 'Fragments stir in hidden places. The pull is faint but real.'}
        {convergence.world_phase === 'stirring' && 'Something is gathering. The Pattern trembles with recognition.'}
        {convergence.world_phase === 'awakening' && 'The Shards call to each other across the breaking world.'}
        {convergence.world_phase === 'convergence_imminent' && 'The world holds its breath. What comes next has never happened before.'}
      </p>
    </div>
  )
}

/**
 * FrayIndicator — shows Fray intensity for a region or campaign
 */
export function FrayIndicator({ 
  intensity, 
  label,
  showDescription = false,
  className 
}: { 
  intensity: number
  label?: string
  showDescription?: boolean
  className?: string
}) {
  const percent = Math.round(intensity * 100)
  
  const getColor = () => {
    if (intensity < 0.1) return 'text-emerald-400'
    if (intensity < 0.2) return 'text-teal-400'
    if (intensity < 0.35) return 'text-amber-400'
    if (intensity < 0.5) return 'text-orange-400'
    if (intensity < 0.7) return 'text-red-400'
    return 'text-red-600'
  }
  
  const getBarColor = () => {
    if (intensity < 0.2) return 'bg-emerald-500'
    if (intensity < 0.35) return 'bg-amber-500'
    if (intensity < 0.5) return 'bg-orange-500'
    return 'bg-red-500'
  }
  
  const getDescription = () => {
    if (intensity < 0.1) return 'The Pattern holds firm here.'
    if (intensity < 0.2) return 'Subtle disturbances at the edges.'
    if (intensity < 0.35) return 'The world stutters. Memories bleed.'
    if (intensity < 0.5) return 'Drift leaking through. Monsters stir.'
    if (intensity < 0.7) return 'Hollows widening. The Fray is visible.'
    return 'Reality fracturing. The Drift presses through.'
  }
  
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-parchment-muted">{label ?? 'Fray Intensity'}</span>
        <span className={cn('font-medium', getColor())}>{percent}%</span>
      </div>
      <div className="h-1 bg-charcoal-700 rounded-full overflow-hidden">
        <div 
          className={cn('h-full rounded-full transition-all', getBarColor())}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showDescription && (
        <p className="text-[10px] text-parchment-muted/70 italic">{getDescription()}</p>
      )}
    </div>
  )
}

/**
 * MonsterWarning — contextual indicator for monster spawn likelihood
 */
export function MonsterWarning({ frayIntensity, className }: { frayIntensity: number; className?: string }) {
  if (frayIntensity < 0.15) return null
  
  const getLevel = () => {
    if (frayIntensity < 0.3) return { label: 'Echo Activity', icon: '👁️', color: 'text-amber-400/70' }
    if (frayIntensity < 0.5) return { label: 'Corruption Detected', icon: '⚠️', color: 'text-orange-400' }
    if (frayIntensity < 0.7) return { label: 'Drift Intrusions', icon: '🔺', color: 'text-red-400' }
    return { label: 'Breach Active', icon: '💀', color: 'text-red-600' }
  }
  
  const level = getLevel()
  
  return (
    <div className={cn('flex items-center gap-1.5 text-xs', level.color, className)}>
      <span>{level.icon}</span>
      <span className="font-medium">{level.label}</span>
    </div>
  )
}
