'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  User, MapPin, Sword, Calendar, Users, Lightbulb, Bug, 
  Search, Link2, X, Loader2, Wand2, Check
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  searchEntitiesForLinking, 
  detectEntities, 
  type EntityMatch, 
  type DetectedEntity 
} from '@/lib/actions/entity-linker'
import { cn } from '@/lib/utils'
import type { Editor } from '@tiptap/react'

const ENTITY_TYPE_CONFIG: Record<string, { icon: typeof User; label: string; color: string }> = {
  character: { icon: User, label: 'Character', color: 'text-blue-400' },
  location: { icon: MapPin, label: 'Location', color: 'text-green-400' },
  artifact: { icon: Sword, label: 'Artifact', color: 'text-purple-400' },
  event: { icon: Calendar, label: 'Event', color: 'text-orange-400' },
  faction: { icon: Users, label: 'Faction', color: 'text-red-400' },
  concept: { icon: Lightbulb, label: 'Concept', color: 'text-cyan-400' },
  creature: { icon: Bug, label: 'Creature', color: 'text-yellow-400' },
}

interface EntityLinkPopoverProps {
  editor: Editor
  position: { x: number; y: number }
  selectedText: string
  selectionRange: { from: number; to: number }
  onClose: () => void
  onLink: (entity: EntityMatch) => void
}

export function EntityLinkPopover({
  editor,
  position,
  selectedText,
  selectionRange,
  onClose,
  onLink,
}: EntityLinkPopoverProps) {
  const [searchQuery, setSearchQuery] = useState(selectedText)
  const [results, setResults] = useState<EntityMatch[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const popoverRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])
  
  // Search as user types
  useEffect(() => {
    const searchEntities = async () => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setResults([])
        return
      }
      
      setIsSearching(true)
      try {
        const entities = await searchEntitiesForLinking(searchQuery)
        setResults(entities)
        setSelectedIndex(0)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsSearching(false)
      }
    }
    
    const debounce = setTimeout(searchEntities, 200)
    return () => clearTimeout(debounce)
  }, [searchQuery])
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          onLink(results[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }
  
  return (
    <div
      ref={popoverRef}
      className="fixed z-50 w-80 bg-navy border border-gold/20 rounded-lg shadow-xl overflow-hidden"
      style={{ 
        left: Math.min(position.x, window.innerWidth - 340), 
        top: position.y + 8 
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-charcoal-700 bg-teal-deep/50">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-gold" />
          <span className="text-sm font-medium">Link to Entity</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-charcoal-700 rounded transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      
      {/* Search Input */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search entities..."
            className="pl-9 bg-charcoal-800 border-charcoal-700"
          />
        </div>
      </div>
      
      {/* Results */}
      <div className="max-h-64 overflow-y-auto">
        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
          </div>
        ) : results.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {searchQuery.length < 2 ? 'Type to search entities...' : 'No entities found'}
          </div>
        ) : (
          <div className="pb-2">
            {results.map((entity, index) => {
              const config = ENTITY_TYPE_CONFIG[entity.type] || ENTITY_TYPE_CONFIG.concept
              const Icon = config.icon
              
              return (
                <button
                  key={entity.id}
                  onClick={() => onLink(entity)}
                  className={cn(
                    'w-full px-3 py-2 flex items-start gap-3 text-left transition-colors',
                    index === selectedIndex 
                      ? 'bg-gold/10 border-l-2 border-l-gold' 
                      : 'hover:bg-charcoal-800 border-l-2 border-l-transparent'
                  )}
                >
                  <Icon className={cn('w-4 h-4 mt-0.5', config.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{entity.name}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {config.label}
                      </Badge>
                    </div>
                    {entity.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {entity.description}
                      </p>
                    )}
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

interface AutoLinkPanelProps {
  editor: Editor
  getText: () => string
  onLinksApplied?: (count: number) => void
}

export function AutoLinkPanel({ editor, getText, onLinksApplied }: AutoLinkPanelProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [detectedEntities, setDetectedEntities] = useState<DetectedEntity[]>([])
  const [appliedLinks, setAppliedLinks] = useState<Set<string>>(new Set())
  
  const scanForEntities = useCallback(async () => {
    setIsScanning(true)
    try {
      const text = getText()
      const entities = await detectEntities(text)
      setDetectedEntities(entities)
    } catch (error) {
      console.error('Failed to scan for entities:', error)
    } finally {
      setIsScanning(false)
    }
  }, [getText])
  
  const applyLink = useCallback((entity: DetectedEntity) => {
    // Find the text in the editor and apply the mark
    const { doc } = editor.state
    let applied = false
    
    doc.descendants((node, pos) => {
      if (applied || !node.isText) return
      
      const text = node.text || ''
      const matchIndex = text.toLowerCase().indexOf(entity.matchedText.toLowerCase())
      
      if (matchIndex !== -1) {
        const from = pos + matchIndex
        const to = from + entity.matchedText.length
        
        editor
          .chain()
          .setTextSelection({ from, to })
          .setEntityLink({
            entityId: entity.entityId,
            entityName: entity.entityName,
            entityType: entity.entityType,
          })
          .run()
        
        applied = true
        setAppliedLinks(prev => new Set([...prev, `${entity.entityId}-${entity.startIndex}`]))
      }
    })
    
    return applied
  }, [editor])
  
  const applyAllLinks = useCallback(() => {
    let count = 0
    for (const entity of detectedEntities) {
      const key = `${entity.entityId}-${entity.startIndex}`
      if (!appliedLinks.has(key)) {
        if (applyLink(entity)) count++
      }
    }
    onLinksApplied?.(count)
  }, [detectedEntities, appliedLinks, applyLink, onLinksApplied])
  
  const unappliedCount = detectedEntities.filter(
    e => !appliedLinks.has(`${e.entityId}-${e.startIndex}`)
  ).length
  
  return (
    <div className="p-4 space-y-4">
      {/* Scan Button */}
      <Button
        onClick={scanForEntities}
        disabled={isScanning}
        variant="outline"
        className="w-full gap-2"
      >
        {isScanning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Scan for Entities
          </>
        )}
      </Button>
      
      {/* Results */}
      {detectedEntities.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Found {detectedEntities.length} entities
            </span>
            {unappliedCount > 0 && (
              <Button
                onClick={applyAllLinks}
                size="sm"
                variant="default"
                className="gap-1"
              >
                <Link2 className="w-3 h-3" />
                Link All ({unappliedCount})
              </Button>
            )}
          </div>
          
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {detectedEntities.map((entity, index) => {
              const config = ENTITY_TYPE_CONFIG[entity.entityType] || ENTITY_TYPE_CONFIG.concept
              const Icon = config.icon
              const key = `${entity.entityId}-${entity.startIndex}`
              const isApplied = appliedLinks.has(key)
              
              return (
                <div
                  key={`${entity.entityId}-${index}`}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg',
                    isApplied ? 'bg-green-900/20' : 'bg-charcoal-800'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', config.color)} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">
                      {entity.entityName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      &quot;{entity.matchedText}&quot;
                    </span>
                  </div>
                  {isApplied ? (
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => applyLink(entity)}
                      className="shrink-0 h-7 px-2"
                    >
                      <Link2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {detectedEntities.length === 0 && !isScanning && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Click &quot;Scan for Entities&quot; to find canon references in your story
        </p>
      )}
    </div>
  )
}
