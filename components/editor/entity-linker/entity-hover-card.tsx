'use client'

import { useState, useEffect } from 'react'
import { User, MapPin, Sword, Calendar, Users, Lightbulb, Bug, Loader2, ExternalLink } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Badge } from '@/components/ui/badge'
import { getEntityDetails, type EntityMatch } from '@/lib/actions/entity-linker'
import { cn } from '@/lib/utils'

const ENTITY_TYPE_CONFIG: Record<string, { icon: typeof User; label: string; color: string }> = {
  character: { icon: User, label: 'Character', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  location: { icon: MapPin, label: 'Location', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  artifact: { icon: Sword, label: 'Artifact', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  event: { icon: Calendar, label: 'Event', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' },
  faction: { icon: Users, label: 'Faction', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
  concept: { icon: Lightbulb, label: 'Concept', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30' },
  creature: { icon: Bug, label: 'Creature', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
}

interface EntityHoverCardProps {
  entityId: string
  entityType: string
  entityName: string
  children: React.ReactNode
  className?: string
}

export function EntityHoverCard({ 
  entityId, 
  entityType, 
  entityName,
  children,
  className 
}: EntityHoverCardProps) {
  const [entity, setEntity] = useState<EntityMatch | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  
  const config = ENTITY_TYPE_CONFIG[entityType] || ENTITY_TYPE_CONFIG.concept
  const Icon = config.icon
  
  const loadEntity = async () => {
    if (hasLoaded) return
    
    setIsLoading(true)
    try {
      const data = await getEntityDetails(entityId)
      setEntity(data)
      setHasLoaded(true)
    } catch (error) {
      console.error('Failed to load entity:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild onMouseEnter={loadEntity}>
        <span 
          className={cn(
            'entity-link cursor-pointer border-b border-dotted transition-colors',
            config.color.split(' ')[0],
            'hover:border-solid',
            className
          )}
        >
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
          </div>
        ) : entity ? (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className={cn(
                'p-2 rounded-lg border',
                config.color
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">
                  {entity.name}
                </h4>
                <Badge variant="outline" className="text-xs mt-1">
                  {config.label}
                </Badge>
              </div>
            </div>
            
            {/* Description */}
            {entity.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {entity.description}
              </p>
            )}
            
            {/* View in Lore Browser hint */}
            <div className="flex items-center gap-1 text-xs text-gold/70 pt-1 border-t border-charcoal-700">
              <ExternalLink className="w-3 h-3" />
              <span>View in Lore Browser</span>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className={cn(
              'p-2 rounded-lg border',
              config.color
            )}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{entityName}</h4>
              <Badge variant="outline" className="text-xs mt-1">
                {config.label}
              </Badge>
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}

/**
 * Inline display for entity link (for use in rendered content)
 */
interface EntityLinkDisplayProps {
  entityId: string
  entityType: string
  entityName: string
  children: React.ReactNode
}

export function EntityLinkDisplay({ entityId, entityType, entityName, children }: EntityLinkDisplayProps) {
  const config = ENTITY_TYPE_CONFIG[entityType] || ENTITY_TYPE_CONFIG.concept
  const Icon = config.icon
  
  return (
    <EntityHoverCard entityId={entityId} entityType={entityType} entityName={entityName}>
      <span className="inline-flex items-center gap-1">
        <Icon className="w-3 h-3 inline" />
        {children}
      </span>
    </EntityHoverCard>
  )
}
