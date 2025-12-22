'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, User, MapPin, Sword, Calendar, Users, Lightbulb, Bug, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CanonEntity {
  id: string
  name: string
  type: string
  description: string | null
  status: string
}

const ENTITY_TYPE_CONFIG: Record<string, { icon: typeof User; label: string; color: string }> = {
  character: { icon: User, label: 'Character', color: 'text-blue-400' },
  location: { icon: MapPin, label: 'Location', color: 'text-green-400' },
  artifact: { icon: Sword, label: 'Artifact', color: 'text-purple-400' },
  event: { icon: Calendar, label: 'Event', color: 'text-orange-400' },
  faction: { icon: Users, label: 'Faction', color: 'text-red-400' },
  concept: { icon: Lightbulb, label: 'Concept', color: 'text-cyan-400' },
  creature: { icon: Bug, label: 'Creature', color: 'text-yellow-400' },
}

export function LoreBrowserPanel() {
  const [entities, setEntities] = useState<CanonEntity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<CanonEntity | null>(null)

  useEffect(() => {
    loadEntities()
  }, [])

  const loadEntities = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/entities')
      if (!response.ok) throw new Error('Failed to load entities')
      const data = await response.json()
      setEntities(data.entities || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lore')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (entity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesType = !selectedType || entity.type === selectedType
    return matchesSearch && matchesType
  })

  const entityTypes = [...new Set(entities.map(e => e.type))]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>{error}</p>
        <button 
          onClick={loadEntities}
          className="mt-2 text-gold hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  // Entity Detail View
  if (selectedEntity) {
    const config = ENTITY_TYPE_CONFIG[selectedEntity.type] || ENTITY_TYPE_CONFIG.concept
    const Icon = config.icon

    return (
      <div className="p-4 space-y-4">
        <button
          onClick={() => setSelectedEntity(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to list
        </button>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className={cn('p-2 rounded-lg bg-charcoal-700', config.color)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-foreground">{selectedEntity.name}</h3>
              <Badge variant="outline" className="text-xs">
                {config.label}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {selectedEntity.description || 'No description available.'}
          </p>

          <button
            onClick={() => {
              // Copy entity name to clipboard for easy reference
              navigator.clipboard.writeText(selectedEntity.name)
            }}
            className="w-full py-2 px-3 rounded-md bg-gold/10 text-gold text-sm 
                       hover:bg-gold/20 transition-colors"
          >
            Copy name to clipboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-charcoal-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search lore..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-charcoal-800 border-charcoal-700"
          />
        </div>
      </div>

      {/* Type Filters */}
      <div className="p-3 border-b border-charcoal-700">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedType(null)}
            className={cn(
              'px-2 py-1 rounded text-xs transition-colors',
              !selectedType
                ? 'bg-gold/20 text-gold'
                : 'bg-charcoal-700 text-muted-foreground hover:text-foreground'
            )}
          >
            All
          </button>
          {entityTypes.map(type => {
            const config = ENTITY_TYPE_CONFIG[type]
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'px-2 py-1 rounded text-xs transition-colors',
                  selectedType === type
                    ? 'bg-gold/20 text-gold'
                    : 'bg-charcoal-700 text-muted-foreground hover:text-foreground'
                )}
              >
                {config?.label || type}
              </button>
            )
          })}
        </div>
      </div>

      {/* Entity List */}
      <div className="flex-1 overflow-auto">
        {filteredEntities.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No entities found
          </div>
        ) : (
          <div className="divide-y divide-charcoal-700">
            {filteredEntities.map(entity => {
              const config = ENTITY_TYPE_CONFIG[entity.type] || ENTITY_TYPE_CONFIG.concept
              const Icon = config.icon

              return (
                <button
                  key={entity.id}
                  onClick={() => setSelectedEntity(entity)}
                  className="w-full p-3 text-left hover:bg-charcoal-700/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', config.color)} />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{entity.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {entity.description || 'No description'}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
