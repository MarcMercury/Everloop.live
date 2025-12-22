'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  GripVertical, 
  Loader2, 
  FileText, 
  CheckCircle, 
  PenLine, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  getChapters, 
  createChapter, 
  deleteChapter,
  reorderChapters,
  type Chapter 
} from '@/lib/actions/chapters'

// Re-export Chapter type for consumers
export type { Chapter } from '@/lib/actions/chapters'

interface ChapterSidebarProps {
  storyId: string
  currentChapterId?: string | null
  onChapterSelect: (chapter: Chapter) => void
  onClose?: () => void
  onChapterCreate?: (chapter: Chapter) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const STATUS_CONFIG: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  draft: { icon: FileText, color: 'text-muted-foreground', label: 'Draft' },
  in_progress: { icon: PenLine, color: 'text-blue-400', label: 'In Progress' },
  complete: { icon: CheckCircle, color: 'text-green-400', label: 'Complete' },
  revision: { icon: AlertCircle, color: 'text-orange-400', label: 'Revision' },
}

export function ChapterSidebar({
  storyId,
  currentChapterId,
  onChapterSelect,
  onChapterCreate,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: ChapterSidebarProps) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  useEffect(() => {
    loadChapters()
  }, [storyId])

  const loadChapters = async () => {
    setIsLoading(true)
    setError(null)
    
    const result = await getChapters(storyId)
    
    if (result.success && result.chapters) {
      setChapters(result.chapters)
    } else {
      setError(result.error || 'Failed to load chapters')
    }
    
    setIsLoading(false)
  }

  const handleCreateChapter = async () => {
    setIsCreating(true)
    
    const result = await createChapter(storyId)
    
    if (result.success && result.chapter) {
      setChapters(prev => [...prev, result.chapter!])
      onChapterCreate?.(result.chapter)
      onChapterSelect(result.chapter)
    } else {
      setError(result.error || 'Failed to create chapter')
    }
    
    setIsCreating(false)
  }

  const handleDeleteChapter = async (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Delete this chapter? This cannot be undone.')) return
    
    const result = await deleteChapter(chapterId)
    
    if (result.success) {
      setChapters(prev => prev.filter(ch => ch.id !== chapterId))
    } else {
      setError(result.error || 'Failed to delete chapter')
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, chapterId: string) => {
    setDraggedId(chapterId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, chapterId: string) => {
    e.preventDefault()
    if (chapterId !== draggedId) {
      setDragOverId(chapterId)
    }
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDragOverId(null)
    
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      return
    }

    // Reorder locally first for instant feedback
    const draggedIndex = chapters.findIndex(ch => ch.id === draggedId)
    const targetIndex = chapters.findIndex(ch => ch.id === targetId)
    
    const newChapters = [...chapters]
    const [removed] = newChapters.splice(draggedIndex, 1)
    newChapters.splice(targetIndex, 0, removed)
    
    setChapters(newChapters)
    setDraggedId(null)

    // Persist to database
    const chapterIds = newChapters.map(ch => ch.id)
    const result = await reorderChapters(storyId, chapterIds)
    
    if (!result.success) {
      // Revert on error
      loadChapters()
      setError('Failed to reorder chapters')
    }
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  // Calculate totals
  const totalWords = chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0)
  const totalTarget = chapters.reduce((sum, ch) => sum + (ch.word_target || 0), 0)
  const completedChapters = chapters.filter(ch => ch.status === 'complete').length

  if (isCollapsed) {
    return (
      <div className="w-12 border-r border-charcoal-700 bg-navy/30 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-md hover:bg-charcoal-700 text-muted-foreground hover:text-foreground transition-colors"
          title="Expand chapters"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="mt-4 text-xs text-muted-foreground writing-mode-vertical">
          {chapters.length} chapters
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 border-r border-charcoal-700 bg-navy/30 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-charcoal-700 flex items-center justify-between">
        <h3 className="font-serif text-sm text-foreground">Chapters</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreateChapter}
            disabled={isCreating}
            className="h-7 w-7 p-0"
            title="Add chapter"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-md hover:bg-charcoal-700 text-muted-foreground hover:text-foreground transition-colors"
              title="Collapse"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      {chapters.length > 0 && (
        <div className="p-3 border-b border-charcoal-700 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedChapters}/{chapters.length} complete</span>
            <span>{totalWords.toLocaleString()} words</span>
          </div>
          {totalTarget > 0 && (
            <div className="space-y-1">
              <Progress 
                value={Math.min(100, (totalWords / totalTarget) * 100)} 
                className="h-1.5"
              />
              <div className="text-xs text-muted-foreground text-right">
                {Math.round((totalWords / totalTarget) * 100)}% of {totalTarget.toLocaleString()} target
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chapter List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <button 
              onClick={loadChapters}
              className="mt-2 text-sm text-gold hover:underline"
            >
              Try again
            </button>
          </div>
        ) : chapters.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              No chapters yet. Start by adding your first chapter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateChapter}
              disabled={isCreating}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Chapter
            </Button>
          </div>
        ) : (
          <div className="py-1">
            {chapters.map((chapter, index) => {
              const statusConfig = STATUS_CONFIG[chapter.status] || STATUS_CONFIG.draft
              const StatusIcon = statusConfig.icon
              const isActive = chapter.id === currentChapterId
              const isDragging = chapter.id === draggedId
              const isDragOver = chapter.id === dragOverId

              return (
                <div
                  key={chapter.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, chapter.id)}
                  onDragOver={(e) => handleDragOver(e, chapter.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, chapter.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onChapterSelect(chapter)}
                  className={cn(
                    'group flex items-start gap-2 px-3 py-2 cursor-pointer transition-colors',
                    isActive 
                      ? 'bg-gold/10 border-l-2 border-gold' 
                      : 'hover:bg-charcoal-700/50 border-l-2 border-transparent',
                    isDragging && 'opacity-50',
                    isDragOver && 'bg-gold/5 border-l-2 border-gold/50'
                  )}
                >
                  {/* Drag Handle */}
                  <div className="flex-shrink-0 mt-0.5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* Chapter Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span className={cn(
                        'text-sm truncate',
                        isActive ? 'text-gold' : 'text-foreground'
                      )}>
                        {chapter.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusIcon className={cn('w-3 h-3', statusConfig.color)} />
                      <span className="text-xs text-muted-foreground">
                        {chapter.word_count.toLocaleString()} words
                      </span>
                      {chapter.word_target > 0 && (
                        <span className="text-xs text-muted-foreground">
                          / {chapter.word_target.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteChapter(chapter.id, e)}
                    className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 
                               hover:bg-destructive/20 text-muted-foreground hover:text-destructive 
                               transition-all"
                    title="Delete chapter"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {chapters.length > 0 && (
        <div className="p-3 border-t border-charcoal-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreateChapter}
            disabled={isCreating}
            className="w-full gap-2 text-muted-foreground hover:text-foreground"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Chapter
          </Button>
        </div>
      )}
    </div>
  )
}
