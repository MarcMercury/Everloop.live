import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { CanonEntity, CanonEntityType, CanonStatus } from '@/types/database'
import { cn } from '@/lib/utils'

interface CanonCardProps {
  entity: CanonEntity
  className?: string
}

/**
 * Get display label for entity type
 */
function getTypeLabel(type: CanonEntityType): string {
  const labels: Record<CanonEntityType, string> = {
    character: 'Character',
    location: 'Location',
    artifact: 'Artifact',
    event: 'Event',
    faction: 'Faction',
    concept: 'Concept',
    creature: 'Creature',
  }
  return labels[type]
}

/**
 * Get icon for entity type
 */
function getTypeIcon(type: CanonEntityType): string {
  const icons: Record<CanonEntityType, string> = {
    character: '👤',
    location: '🏛️',
    artifact: '✨',
    event: '📜',
    faction: '⚔️',
    concept: '💭',
    creature: '🐉',
  }
  return icons[type]
}

/**
 * Get stability color based on rating
 */
function getStabilityColor(rating: number): string {
  if (rating >= 0.8) return 'bg-emerald-500'
  if (rating >= 0.6) return 'bg-gold'
  if (rating >= 0.4) return 'bg-amber-500'
  return 'bg-red-500'
}

/**
 * Get stability label
 */
function getStabilityLabel(rating: number): string {
  if (rating >= 0.9) return 'Absolute'
  if (rating >= 0.7) return 'Stable'
  if (rating >= 0.5) return 'Fluctuating'
  if (rating >= 0.3) return 'Unstable'
  return 'Volatile'
}

export function CanonCard({ entity, className }: CanonCardProps) {
  const stabilityPercent = entity.stability_rating * 100
  const isCanonical = entity.status === 'canonical'

  return (
    <Link href={`/explore/${entity.slug}`}>
      <Card
        className={cn(
          'group relative overflow-hidden transition-all duration-300',
          'bg-gradient-to-br from-teal-rich/80 to-teal-deep/90',
          'border-gold/10 hover:border-gold/30',
          'hover:shadow-xl hover:shadow-gold/10',
          'hover:-translate-y-1',
          isCanonical && 'border-gold/25 shadow-lg shadow-gold/5',
          className
        )}
      >
        {/* Canonical glow effect */}
        {isCanonical && (
          <div className="absolute inset-0 bg-gradient-to-br from-gold/8 via-transparent to-transparent pointer-events-none" />
        )}

        <CardHeader className="pb-3 relative">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">
                {getTypeIcon(entity.type)}
              </span>
              <CardTitle className="text-xl text-parchment group-hover:text-gold transition-colors">
                {entity.name}
              </CardTitle>
            </div>
            <Badge variant={entity.type as CanonEntityType}>
              {getTypeLabel(entity.type)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative">
          {/* Description */}
          <p className="text-sm text-parchment-muted line-clamp-3 leading-relaxed">
            {entity.description || 'No description available.'}
          </p>

          {/* Stability Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-parchment-muted">Canon Stability</span>
              <span className={cn(
                'font-medium',
                stabilityPercent >= 70 ? 'text-emerald-400' : 
                stabilityPercent >= 40 ? 'text-gold' : 'text-red-400'
              )}>
                {getStabilityLabel(entity.stability_rating)}
              </span>
            </div>
            <Progress 
              value={stabilityPercent} 
              indicatorClassName={getStabilityColor(entity.stability_rating)}
            />
          </div>

          {/* Tags */}
          {entity.tags && entity.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {entity.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-charcoal-700 text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {entity.tags.length > 3 && (
                <span className="text-xs px-2 py-0.5 text-muted-foreground">
                  +{entity.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Status indicator */}
          {entity.status !== 'canonical' && (
            <Badge variant={entity.status as CanonStatus} className="mt-2">
              {entity.status}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

/**
 * Skeleton loading state for CanonCard
 */
export function CanonCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-charcoal-700 shimmer" />
            <div className="h-6 w-32 rounded bg-charcoal-700 shimmer" />
          </div>
          <div className="h-5 w-20 rounded-md bg-charcoal-700 shimmer" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-charcoal-700 shimmer" />
          <div className="h-4 w-4/5 rounded bg-charcoal-700 shimmer" />
          <div className="h-4 w-3/5 rounded bg-charcoal-700 shimmer" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 w-24 rounded bg-charcoal-700 shimmer" />
            <div className="h-3 w-16 rounded bg-charcoal-700 shimmer" />
          </div>
          <div className="h-2 w-full rounded-full bg-charcoal-700 shimmer" />
        </div>
      </CardContent>
    </Card>
  )
}
