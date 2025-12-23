'use client'

import { useState, useCallback } from 'react'
import { 
  User, MapPin, Sword, Calendar, Users, Lightbulb, Bug, 
  Search, Link2, Loader2, Wand2, Check, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  detectEntities, 
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

interface EntityLinkPanelProps {
  getText: () => string
  getEditor: () => Editor | null
}

export function EntityLinkPanel({ getText, getEditor }: EntityLinkPanelProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [detectedEntities, setDetectedEntities] = useState<DetectedEntity[]>([])
  const [appliedLinks, setAppliedLinks] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  
  const scanForEntities = useCallback(async () => {
    setIsScanning(true)
    setError(null)
    try {
      const text = getText()
      if (!text || text.trim().length === 0) {
        setDetectedEntities([])
        return
      }
      const entities = await detectEntities(text)
      setDetectedEntities(entities)
      // Reset applied links on new scan
      setAppliedLinks(new Set())
    } catch (err) {
      console.error('Failed to scan for entities:', err)
      setError('Failed to scan for entities')
    } finally {
      setIsScanning(false)
    }
  }, [getText])
  
  const applyLink = useCallback((entity: DetectedEntity) => {
    const editor = getEditor()
    if (!editor) return false
    
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
  }, [getEditor])
  
  const applyAllLinks = useCallback(() => {
    let count = 0
    for (const entity of detectedEntities) {
      const key = `${entity.entityId}-${entity.startIndex}`
      if (!appliedLinks.has(key)) {
        if (applyLink(entity)) count++
      }
    }
  }, [detectedEntities, appliedLinks, applyLink])
  
  const unappliedCount = detectedEntities.filter(
    e => !appliedLinks.has(`${e.entityId}-${e.startIndex}`)
  ).length
  
  // Group entities by type for better organization
  const entitiesByType = detectedEntities.reduce((acc, entity) => {
    if (!acc[entity.entityType]) {
      acc[entity.entityType] = []
    }
    acc[entity.entityType].push(entity)
    return acc
  }, {} as Record<string, DetectedEntity[]>)
  
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="font-medium flex items-center gap-2">
          <Link2 className="w-4 h-4 text-gold" />
          Canon Entity Linker
        </h3>
        <p className="text-xs text-muted-foreground">
          Automatically detect and link canon entities in your story
        </p>
      </div>
      
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
      
      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      
      {/* Results */}
      {detectedEntities.length > 0 && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="flex items-center justify-between p-3 bg-charcoal-800 rounded-lg">
            <div className="text-sm">
              <span className="text-gold font-medium">{detectedEntities.length}</span>
              <span className="text-muted-foreground"> entities found</span>
            </div>
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
          
          {/* Grouped by Type */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {Object.entries(entitiesByType).map(([type, entities]) => {
              const config = ENTITY_TYPE_CONFIG[type] || ENTITY_TYPE_CONFIG.concept
              const Icon = config.icon
              
              return (
                <div key={type} className="space-y-2">
                  {/* Type Header */}
                  <div className="flex items-center gap-2 text-sm">
                    <Icon className={cn('w-4 h-4', config.color)} />
                    <span className="font-medium">{config.label}s</span>
                    <Badge variant="secondary" className="text-xs">
                      {entities.length}
                    </Badge>
                  </div>
                  
                  {/* Entity List */}
                  <div className="space-y-1 pl-6">
                    {entities.map((entity, index) => {
                      const key = `${entity.entityId}-${entity.startIndex}`
                      const isApplied = appliedLinks.has(key)
                      
                      return (
                        <div
                          key={`${entity.entityId}-${index}`}
                          className={cn(
                            'flex items-center justify-between p-2 rounded-lg transition-colors',
                            isApplied ? 'bg-green-900/20' : 'bg-charcoal-800 hover:bg-charcoal-700'
                          )}
                        >
                          <div className="min-w-0">
                            <span className="text-sm font-medium block truncate">
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
              )
            })}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {detectedEntities.length === 0 && !isScanning && !error && (
        <div className="text-center py-8 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-charcoal-800 flex items-center justify-center">
            <Search className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Click &quot;Scan for Entities&quot; to find canon references
            </p>
            <p className="text-xs text-muted-foreground/70">
              Characters, locations, artifacts, and more will be detected
            </p>
          </div>
        </div>
      )}
      
      {/* Help Text */}
      <div className="pt-2 border-t border-charcoal-700">
        <p className="text-xs text-muted-foreground">
          <strong className="text-gold">Tip:</strong> You can also select text and use the 
          <Link2 className="w-3 h-3 inline mx-1" /> 
          button in the toolbar to manually link to an entity.
        </p>
      </div>
    </div>
  )
}
