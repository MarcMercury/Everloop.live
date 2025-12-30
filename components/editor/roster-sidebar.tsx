'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { fetchRoster, type RosterEntity } from '@/lib/actions/roster'
import { weaveEntityIntoStory } from '@/lib/actions/weave'
import { X, User, Users, Loader2, Search, ChevronRight, Globe, Lock, MapPin, Sparkles, Package, Shield, Brain, Calendar, Wand2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const typeIcons: Record<string, typeof User> = {
  character: User,
  location: MapPin,
  creature: Sparkles,
  artifact: Package,
  faction: Shield,
  concept: Brain,
  event: Calendar,
}

const typeColors: Record<string, string> = {
  character: 'text-amber-400',
  location: 'text-emerald-400',
  creature: 'text-purple-400',
  artifact: 'text-cyan-400',
  faction: 'text-red-400',
  concept: 'text-blue-400',
  event: 'text-orange-400',
}

interface RosterSidebarProps {
  isOpen: boolean
  onClose: () => void
  onInsertCharacter: (name: string, description: string) => void
  onWeaveEntity?: (paragraph: string) => void
  storyId?: string
  getContextBefore?: () => string
}

export function RosterSidebar({
  isOpen,
  onClose,
  onInsertCharacter,
  onWeaveEntity,
  storyId,
  getContextBefore,
}: RosterSidebarProps) {
  const [entities, setEntities] = useState<RosterEntity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isWeaving, setIsWeaving] = useState<string | null>(null) // Entity ID being woven
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'global' | 'private'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    if (isOpen && entities.length === 0) {
      loadRoster()
    }
  }, [isOpen])

  const loadRoster = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await fetchRoster()
      if (result.success && result.entities) {
        setEntities(result.entities)
      } else {
        setError(result.error || 'Failed to load roster')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roster')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (entity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesSource = sourceFilter === 'all' || 
                         (sourceFilter === 'global' && entity.isGlobal) ||
                         (sourceFilter === 'private' && !entity.isGlobal)
    const matchesType = typeFilter === 'all' || entity.type === typeFilter
    return matchesSearch && matchesSource && matchesType
  })

  // Get unique types for filter
  const availableTypes = [...new Set(entities.map(e => e.type))]

  const handleInsert = (entity: RosterEntity) => {
    const desc = entity.description 
      ? entity.description.slice(0, 150) + (entity.description.length > 150 ? '...' : '')
      : ''
    onInsertCharacter(entity.name, desc)
  }

  const handleWeave = async (entity: RosterEntity) => {
    if (!storyId || !getContextBefore || !onWeaveEntity) return
    
    setIsWeaving(entity.id)
    setError(null)
    
    try {
      const contextBefore = getContextBefore()
      
      if (!contextBefore || contextBefore.trim().length < 50) {
        setError('Write at least a paragraph first so the AI can match your style')
        setIsWeaving(null)
        return
      }
      
      const result = await weaveEntityIntoStory({
        entityId: entity.id,
        storyId,
        contextBefore,
      })
      
      if (result.success && result.paragraph) {
        onWeaveEntity(result.paragraph)
        onClose()
      } else {
        setError(result.error || 'Failed to weave entity')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to weave entity')
    } finally {
      setIsWeaving(null)
    }
  }

  const canWeave = !!storyId && !!getContextBefore && !!onWeaveEntity

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="relative ml-auto w-full max-w-md bg-charcoal border-l border-charcoal-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-charcoal-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <Users className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-foreground">Roster</h2>
              <p className="text-sm text-muted-foreground">Insert entities into your story</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-charcoal-700 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search & Filter */}
        <div className="p-4 border-b border-charcoal-700 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-navy/50 border border-charcoal-700
                         text-foreground placeholder:text-muted-foreground/50
                         focus:border-gold/50 focus:ring-1 focus:ring-gold/20 focus:outline-none"
            />
          </div>
          
          {/* Source Filter */}
          <div className="flex gap-2">
            <Button
              variant={sourceFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSourceFilter('all')}
              className={sourceFilter === 'all' ? 'bg-gold text-charcoal hover:bg-gold/90' : ''}
            >
              All
            </Button>
            <Button
              variant={sourceFilter === 'private' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSourceFilter('private')}
              className={sourceFilter === 'private' ? 'bg-gold text-charcoal hover:bg-gold/90' : ''}
            >
              <Lock className="w-3 h-3 mr-1" />
              My Roster
            </Button>
            <Button
              variant={sourceFilter === 'global' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSourceFilter('global')}
              className={sourceFilter === 'global' ? 'bg-gold text-charcoal hover:bg-gold/90' : ''}
            >
              <Globe className="w-3 h-3 mr-1" />
              Canon
            </Button>
          </div>

          {/* Type Filter */}
          <div className="flex gap-1 flex-wrap">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTypeFilter('all')}
              className={`h-7 px-2 text-xs ${typeFilter === 'all' ? 'bg-gold/20 text-gold' : ''}`}
            >
              All Types
            </Button>
            {availableTypes.map((type) => {
              const Icon = typeIcons[type] || Sparkles
              return (
                <Button
                  key={type}
                  variant={typeFilter === type ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTypeFilter(type)}
                  className={`h-7 px-2 text-xs capitalize ${typeFilter === type ? 'bg-gold/20 text-gold' : ''}`}
                >
                  <Icon className={`w-3 h-3 mr-1 ${typeColors[type] || ''}`} />
                  {type}s
                </Button>
              )
            })}
          </div>
        </div>
        
        {/* Entity List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            </div>
          ) : error ? (
            <div className="p-4">
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
              <Button onClick={loadRoster} variant="outline" size="sm" className="mt-3">
                Retry
              </Button>
            </div>
          ) : filteredEntities.length === 0 ? (
            <div className="p-8 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No entities match your search' : 'No entities available'}
              </p>
              {sourceFilter === 'private' && !searchQuery && (
                <p className="text-muted-foreground/70 text-sm mt-2">
                  Create entities in your Roster to see them here
                </p>
              )}
            </div>
          ) : (
            <div className="p-2">
              {filteredEntities.map((entity) => {
                const Icon = typeIcons[entity.type] || Sparkles
                return (
                  <button
                    key={entity.id}
                    onClick={() => handleInsert(entity)}
                    className="w-full p-3 rounded-lg text-left hover:bg-navy/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${typeColors[entity.type] || 'text-gold'}`} />
                          <span className="font-medium text-foreground truncate">
                            {entity.name}
                          </span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {entity.isGlobal ? (
                              <><Globe className="w-3 h-3 mr-1" />Canon</>
                            ) : (
                              <><Lock className="w-3 h-3 mr-1" />{entity.status === 'draft' ? 'Draft' : 'Pending'}</>
                            )}
                          </Badge>
                        </div>
                        {entity.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {entity.description}
                          </p>
                        )}
                        {entity.tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {entity.tags.slice(0, 3).map((tag) => (
                              <span 
                                key={tag}
                                className="px-1.5 py-0.5 text-xs rounded bg-charcoal-700 text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="flex gap-2 mt-3 pt-2 border-t border-charcoal-700/50">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleInsert(entity)
                            }}
                            className="flex-1 h-7 text-xs"
                          >
                            Insert Name
                          </Button>
                          {canWeave && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleWeave(entity)
                              }}
                              disabled={isWeaving === entity.id}
                              className="flex-1 h-7 text-xs bg-gold text-charcoal hover:bg-gold/90 gap-1"
                            >
                              {isWeaving === entity.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Wand2 className="w-3 h-3" />
                              )}
                              Weave In
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-charcoal-700">
          <p className="text-xs text-muted-foreground text-center">
            {canWeave 
              ? 'Insert name or Weave to have AI introduce the entity into your story'
              : 'Click an entity to insert its name into your story'
            }
          </p>
        </div>
      </div>
    </div>
  )
}
