'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  History, 
  Clock, 
  RotateCcw, 
  ChevronRight, 
  Loader2, 
  GitCompare,
  Save,
  Send,
  BookOpen,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  getRevisions, 
  restoreRevision,
  type StoryRevision 
} from '@/lib/actions/revisions'
import { cn } from '@/lib/utils'

interface VersionHistorySidebarProps {
  storyId: string
  chapterId?: string | null
  currentWordCount?: number
  onClose: () => void
  onRevisionSelect?: (revision: StoryRevision) => void
  onCompareSelect?: (revision: StoryRevision) => void
}

const REVISION_TYPE_CONFIG: Record<string, { 
  label: string
  icon: typeof Save
  color: string 
}> = {
  auto: { label: 'Auto-save', icon: Clock, color: 'text-muted-foreground' },
  manual: { label: 'Saved', icon: Save, color: 'text-blue-400' },
  submit: { label: 'Submitted', icon: Send, color: 'text-gold' },
  publish: { label: 'Published', icon: BookOpen, color: 'text-green-400' },
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function VersionHistorySidebar({
  storyId,
  chapterId,
  currentWordCount,
  onClose,
  onRevisionSelect,
  onCompareSelect,
}: VersionHistorySidebarProps) {
  const [revisions, setRevisions] = useState<StoryRevision[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRevision, setSelectedRevision] = useState<StoryRevision | null>(null)
  const [isRestoring, setIsRestoring] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [compareRevision, setCompareRevision] = useState<StoryRevision | null>(null)
  
  const loadRevisions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    const result = await getRevisions(storyId, chapterId, { limit: 50 })
    
    if (result.success && result.revisions) {
      setRevisions(result.revisions)
    } else {
      setError(result.error || 'Failed to load history')
    }
    
    setIsLoading(false)
  }, [storyId, chapterId])
  
  useEffect(() => {
    loadRevisions()
  }, [loadRevisions])
  
  const handleRestore = async (revision: StoryRevision) => {
    if (!confirm(`Restore to revision #${revision.revision_number}? This will replace your current content.`)) {
      return
    }
    
    setIsRestoring(true)
    const result = await restoreRevision(revision.id)
    
    if (result.success) {
      // Reload the page to get the restored content
      window.location.reload()
    } else {
      alert(result.error || 'Failed to restore revision')
    }
    
    setIsRestoring(false)
  }
  
  const handleCompareClick = (revision: StoryRevision) => {
    if (compareMode) {
      setCompareRevision(revision)
      onCompareSelect?.(revision)
    } else {
      setSelectedRevision(revision)
      onRevisionSelect?.(revision)
    }
  }
  
  // Group revisions by date
  const groupedRevisions = revisions.reduce((groups, revision) => {
    const date = new Date(revision.created_at).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(revision)
    return groups
  }, {} as Record<string, StoryRevision[]>)
  
  return (
    <div className="w-80 h-full border-l border-charcoal-700 bg-navy/50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-charcoal-700">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gold" />
          <h3 className="font-medium">Version History</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-charcoal-700 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Compare Mode Toggle */}
      <div className="p-3 border-b border-charcoal-700">
        <Button
          variant={compareMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setCompareMode(!compareMode)
            setCompareRevision(null)
          }}
          className="w-full gap-2"
        >
          <GitCompare className="w-4 h-4" />
          {compareMode ? 'Exit Compare Mode' : 'Compare Versions'}
        </Button>
        {compareMode && (
          <p className="text-xs text-muted-foreground mt-2">
            Select two versions to compare changes
          </p>
        )}
      </div>
      
      {/* Revisions List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-400">{error}</p>
            <Button variant="ghost" size="sm" onClick={loadRevisions} className="mt-2">
              Try again
            </Button>
          </div>
        ) : revisions.length === 0 ? (
          <div className="p-8 text-center">
            <History className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No revision history yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Revisions are saved automatically as you write
            </p>
          </div>
        ) : (
          <div className="py-2">
            {Object.entries(groupedRevisions).map(([date, dayRevisions]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-charcoal-800/50 sticky top-0">
                  {date}
                </div>
                
                {/* Revisions for this date */}
                {dayRevisions.map((revision) => {
                  const config = REVISION_TYPE_CONFIG[revision.revision_type] || REVISION_TYPE_CONFIG.auto
                  const Icon = config.icon
                  const isSelected = selectedRevision?.id === revision.id || compareRevision?.id === revision.id
                  
                  return (
                    <div
                      key={revision.id}
                      className={cn(
                        'px-4 py-3 border-b border-charcoal-800 cursor-pointer transition-colors',
                        isSelected ? 'bg-gold/10' : 'hover:bg-charcoal-800/50'
                      )}
                      onClick={() => handleCompareClick(revision)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn('p-1.5 rounded-lg bg-charcoal-800', config.color)}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              v{revision.revision_number}
                            </span>
                            <Badge variant="secondary" className="text-[10px]">
                              {config.label}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatTime(revision.created_at)} • {revision.word_count.toLocaleString()} words
                          </p>
                          
                          {revision.change_summary && (
                            <p className="text-xs text-parchment-muted mt-1 truncate">
                              {revision.change_summary}
                            </p>
                          )}
                          
                          {/* Word count change */}
                          {(revision.words_added > 0 || revision.words_removed > 0) && (
                            <div className="flex items-center gap-2 mt-1 text-[10px]">
                              {revision.words_added > 0 && (
                                <span className="text-green-400">+{revision.words_added}</span>
                              )}
                              {revision.words_removed > 0 && (
                                <span className="text-red-400">-{revision.words_removed}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons (show on hover or selection) */}
                      {isSelected && !compareMode && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRestore(revision)
                            }}
                            disabled={isRestoring}
                            className="flex-1 gap-1"
                          >
                            {isRestoring ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3 h-3" />
                            )}
                            Restore
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer Stats */}
      {revisions.length > 0 && (
        <div className="p-3 border-t border-charcoal-700 text-xs text-muted-foreground">
          {revisions.length} revisions • Latest: {formatRelativeTime(revisions[0]?.created_at)}
        </div>
      )}
    </div>
  )
}
