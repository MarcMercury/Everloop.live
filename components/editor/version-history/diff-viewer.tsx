'use client'

import { useState, useEffect } from 'react'
import { 
  GitCompare, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Plus,
  Minus,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  compareRevisions, 
  type StoryRevision,
  type DiffData 
} from '@/lib/actions/revisions'
import { cn } from '@/lib/utils'

interface DiffViewerProps {
  leftRevision: StoryRevision
  rightRevision: StoryRevision
  onClose: () => void
}

export function DiffViewer({
  leftRevision,
  rightRevision,
  onClose,
}: DiffViewerProps) {
  const [diff, setDiff] = useState<DiffData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified')
  
  useEffect(() => {
    async function loadDiff() {
      setIsLoading(true)
      setError(null)
      
      const result = await compareRevisions(leftRevision.id, rightRevision.id)
      
      if (result.success && result.diff) {
        setDiff(result.diff)
      } else {
        setError(result.error || 'Failed to compare revisions')
      }
      
      setIsLoading(false)
    }
    
    loadDiff()
  }, [leftRevision.id, rightRevision.id])
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    )
  }
  
  if (error || !diff) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || 'Failed to load diff'}</p>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    )
  }
  
  return (
    <div className="flex-1 flex flex-col bg-navy/30">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-charcoal-700">
        <div className="flex items-center gap-3">
          <GitCompare className="w-5 h-5 text-gold" />
          <h3 className="font-medium">Comparing Versions</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={viewMode === 'unified' ? 'default' : 'ghost'}
            onClick={() => setViewMode('unified')}
          >
            Unified
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'split' ? 'default' : 'ghost'}
            onClick={() => setViewMode('split')}
          >
            Split
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
      
      {/* Version Headers */}
      <div className="grid grid-cols-2 border-b border-charcoal-700">
        <div className="p-3 border-r border-charcoal-700 bg-red-500/5">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4 text-red-400" />
            <span className="font-medium">v{leftRevision.revision_number}</span>
            <Badge variant="secondary" className="text-[10px]">
              {leftRevision.revision_type}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(leftRevision.created_at).toLocaleString()} • {leftRevision.word_count} words
          </p>
        </div>
        <div className="p-3 bg-green-500/5">
          <div className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-green-400" />
            <span className="font-medium">v{rightRevision.revision_number}</span>
            <Badge variant="secondary" className="text-[10px]">
              {rightRevision.revision_type}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(rightRevision.created_at).toLocaleString()} • {rightRevision.word_count} words
          </p>
        </div>
      </div>
      
      {/* Stats Bar */}
      <div className="flex items-center gap-4 p-3 bg-charcoal-800/50 border-b border-charcoal-700 text-sm">
        <div className="flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-green-400" />
          <span className="text-green-400">{diff.linesAdded} lines added</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Minus className="w-4 h-4 text-red-400" />
          <span className="text-red-400">{diff.linesRemoved} lines removed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{diff.totalChanges} changes</span>
        </div>
      </div>
      
      {/* Diff Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'unified' ? (
          <UnifiedDiff diff={diff} />
        ) : (
          <SplitDiff diff={diff} />
        )}
      </div>
    </div>
  )
}

function UnifiedDiff({ diff }: { diff: DiffData }) {
  return (
    <div className="font-mono text-sm p-4">
      {diff.changes.map((change, index) => (
        <div
          key={index}
          className={cn(
            'px-3 py-0.5',
            change.type === 'added' && 'bg-green-500/20 text-green-300',
            change.type === 'removed' && 'bg-red-500/20 text-red-300',
            change.type === 'unchanged' && 'text-muted-foreground'
          )}
        >
          <span className="inline-block w-6 text-muted-foreground/50 select-none">
            {change.type === 'added' ? '+' : change.type === 'removed' ? '-' : ' '}
          </span>
          {change.content || '\u00A0'}
        </div>
      ))}
      
      {diff.changes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No differences found between these versions
        </div>
      )}
    </div>
  )
}

function SplitDiff({ diff }: { diff: DiffData }) {
  // Build left and right columns
  const leftLines: Array<{ type: 'removed' | 'unchanged', content: string, lineNum: number }> = []
  const rightLines: Array<{ type: 'added' | 'unchanged', content: string, lineNum: number }> = []
  
  let leftLineNum = 1
  let rightLineNum = 1
  
  diff.changes.forEach((change) => {
    if (change.type === 'unchanged') {
      leftLines.push({ type: 'unchanged', content: change.content, lineNum: leftLineNum++ })
      rightLines.push({ type: 'unchanged', content: change.content, lineNum: rightLineNum++ })
    } else if (change.type === 'removed') {
      leftLines.push({ type: 'removed', content: change.content, lineNum: leftLineNum++ })
    } else if (change.type === 'added') {
      rightLines.push({ type: 'added', content: change.content, lineNum: rightLineNum++ })
    }
  })
  
  // Pad shorter column
  const maxLen = Math.max(leftLines.length, rightLines.length)
  while (leftLines.length < maxLen) {
    leftLines.push({ type: 'unchanged', content: '', lineNum: -1 })
  }
  while (rightLines.length < maxLen) {
    rightLines.push({ type: 'unchanged', content: '', lineNum: -1 })
  }
  
  return (
    <div className="grid grid-cols-2 font-mono text-sm">
      {/* Left Column (Old) */}
      <div className="border-r border-charcoal-700">
        {leftLines.map((line, index) => (
          <div
            key={index}
            className={cn(
              'px-3 py-0.5 flex',
              line.type === 'removed' && 'bg-red-500/20'
            )}
          >
            <span className="w-10 text-xs text-muted-foreground/50 select-none shrink-0">
              {line.lineNum > 0 ? line.lineNum : ''}
            </span>
            <span className={cn(
              'flex-1',
              line.type === 'removed' ? 'text-red-300' : 'text-muted-foreground'
            )}>
              {line.content || '\u00A0'}
            </span>
          </div>
        ))}
      </div>
      
      {/* Right Column (New) */}
      <div>
        {rightLines.map((line, index) => (
          <div
            key={index}
            className={cn(
              'px-3 py-0.5 flex',
              line.type === 'added' && 'bg-green-500/20'
            )}
          >
            <span className="w-10 text-xs text-muted-foreground/50 select-none shrink-0">
              {line.lineNum > 0 ? line.lineNum : ''}
            </span>
            <span className={cn(
              'flex-1',
              line.type === 'added' ? 'text-green-300' : 'text-muted-foreground'
            )}>
              {line.content || '\u00A0'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
