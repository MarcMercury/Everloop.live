'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Lightbulb, 
  HelpCircle, 
  AlertTriangle,
  CheckCircle,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  getStoryComments, 
  getCommentCounts,
  resolveComment,
  type StoryComment,
  type CommentType 
} from '@/lib/actions/comments'

interface CommentsSidebarProps {
  storyId: string
  chapterId?: string | null
  isOpen: boolean
  onClose: () => void
  onCommentClick?: (comment: StoryComment) => void
}

const COMMENT_TYPE_CONFIG: Record<CommentType, { 
  icon: typeof MessageSquare
  color: string
  label: string 
}> = {
  note: { icon: MessageSquare, color: 'text-blue-400', label: 'Notes' },
  suggestion: { icon: Lightbulb, color: 'text-gold', label: 'Suggestions' },
  question: { icon: HelpCircle, color: 'text-purple-400', label: 'Questions' },
  issue: { icon: AlertTriangle, color: 'text-orange-400', label: 'Issues' },
}

type FilterType = 'all' | CommentType | 'unresolved'

export function CommentsSidebar({
  storyId,
  chapterId,
  isOpen,
  onClose,
  onCommentClick,
}: CommentsSidebarProps) {
  const [comments, setComments] = useState<StoryComment[]>([])
  const [counts, setCounts] = useState<{
    total: number
    unresolved: number
    notes: number
    suggestions: number
    questions: number
    issues: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen) {
      loadComments()
      loadCounts()
    }
  }, [isOpen, storyId, chapterId])

  const loadComments = async () => {
    setIsLoading(true)
    const result = await getStoryComments(storyId, { chapterId: chapterId || undefined })
    if (result.success && result.comments) {
      setComments(result.comments)
    }
    setIsLoading(false)
  }

  const loadCounts = async () => {
    const result = await getCommentCounts(storyId)
    if (result.success && result.counts) {
      setCounts(result.counts)
    }
  }

  const handleResolve = async (commentId: string, currentState: boolean) => {
    const result = await resolveComment(commentId, !currentState)
    if (result.success) {
      await loadComments()
      await loadCounts()
    }
  }

  const toggleThread = (threadId: string) => {
    const newExpanded = new Set(expandedThreads)
    if (newExpanded.has(threadId)) {
      newExpanded.delete(threadId)
    } else {
      newExpanded.add(threadId)
    }
    setExpandedThreads(newExpanded)
  }

  // Group comments by thread
  const groupedComments = comments.reduce<Record<string, StoryComment[]>>((acc, comment) => {
    const threadId = comment.thread_id || comment.id
    if (!acc[threadId]) {
      acc[threadId] = []
    }
    acc[threadId].push(comment)
    return acc
  }, {})

  // Get root comments (first in each thread)
  const rootComments = Object.values(groupedComments)
    .map(thread => thread.find(c => !c.parent_id) || thread[0])
    .filter(Boolean) as StoryComment[]

  // Apply filters
  const filteredComments = rootComments.filter(comment => {
    if (filter === 'all') return true
    if (filter === 'unresolved') return !comment.is_resolved
    return comment.comment_type === filter
  })

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-charcoal border-l border-charcoal-700 z-40 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-charcoal-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gold" />
          <h2 className="font-serif text-lg text-gold">Comments</h2>
          {counts && (
            <Badge variant="outline" className="text-xs">
              {counts.unresolved} open
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="p-3 border-b border-charcoal-700">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filter: {filter === 'all' ? 'All' : filter === 'unresolved' ? 'Unresolved' : COMMENT_TYPE_CONFIG[filter as CommentType].label}</span>
          <ChevronDown className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
        </button>
        
        {showFilters && (
          <div className="mt-2 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => { setFilter('all'); setShowFilters(false) }}
              className={cn(
                'px-2 py-1 text-xs rounded-md transition-colors',
                filter === 'all' ? 'bg-gold/20 text-gold' : 'text-muted-foreground hover:bg-charcoal-700'
              )}
            >
              All ({counts?.total || 0})
            </button>
            <button
              type="button"
              onClick={() => { setFilter('unresolved'); setShowFilters(false) }}
              className={cn(
                'px-2 py-1 text-xs rounded-md transition-colors',
                filter === 'unresolved' ? 'bg-gold/20 text-gold' : 'text-muted-foreground hover:bg-charcoal-700'
              )}
            >
              Unresolved ({counts?.unresolved || 0})
            </button>
            {(Object.keys(COMMENT_TYPE_CONFIG) as CommentType[]).map(type => {
              const config = COMMENT_TYPE_CONFIG[type]
              const count = counts ? counts[`${type}s` as keyof typeof counts] || 0 : 0
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => { setFilter(type); setShowFilters(false) }}
                  className={cn(
                    'px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1',
                    filter === type ? 'bg-gold/20 text-gold' : 'text-muted-foreground hover:bg-charcoal-700'
                  )}
                >
                  <config.icon className={cn('w-3 h-3', config.color)} />
                  {config.label} ({count})
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs mt-1">Select text in the editor to add a comment</p>
          </div>
        ) : (
          <div className="divide-y divide-charcoal-700">
            {filteredComments.map(comment => {
              const config = COMMENT_TYPE_CONFIG[comment.comment_type]
              const Icon = config.icon
              const threadId = comment.thread_id || comment.id
              const threadComments = groupedComments[threadId] || []
              const hasReplies = threadComments.length > 1
              const isExpanded = expandedThreads.has(threadId)

              return (
                <div key={comment.id} className="group">
                  {/* Main Comment */}
                  <div 
                    className={cn(
                      'p-3 cursor-pointer hover:bg-charcoal-800/50 transition-colors',
                      comment.is_resolved && 'opacity-60'
                    )}
                    onClick={() => onCommentClick?.(comment)}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', config.color)} />
                      <div className="flex-1 min-w-0">
                        {/* Selected Text */}
                        {comment.selected_text && (
                          <p className="text-xs text-muted-foreground italic mb-1 line-clamp-1">
                            &ldquo;{comment.selected_text}&rdquo;
                          </p>
                        )}
                        {/* Comment Content */}
                        <p className="text-sm text-foreground/90 line-clamp-2">
                          {comment.content}
                        </p>
                        {/* Meta */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                          {hasReplies && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); toggleThread(threadId) }}
                              className="text-xs text-gold hover:underline flex items-center gap-0.5"
                            >
                              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                              {threadComments.length - 1} {threadComments.length === 2 ? 'reply' : 'replies'}
                            </button>
                          )}
                        </div>
                      </div>
                      {/* Resolve Button */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleResolve(comment.id, comment.is_resolved) }}
                        className={cn(
                          'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
                          comment.is_resolved 
                            ? 'text-green-400 hover:bg-green-400/10' 
                            : 'text-muted-foreground hover:bg-charcoal-700'
                        )}
                        title={comment.is_resolved ? 'Unresolve' : 'Resolve'}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Thread Replies */}
                  {hasReplies && isExpanded && (
                    <div className="bg-charcoal-800/30 border-l-2 border-charcoal-700 ml-6">
                      {threadComments
                        .filter(c => c.id !== comment.id)
                        .map(reply => (
                          <div 
                            key={reply.id}
                            className="p-3 border-t border-charcoal-700/50"
                          >
                            <p className="text-sm text-foreground/80">{reply.content}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {counts && counts.total > 0 && (
        <div className="p-3 border-t border-charcoal-700 bg-charcoal-800/50">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{counts.total} total</span>
            <span className="text-green-400">{counts.total - counts.unresolved} resolved</span>
          </div>
        </div>
      )}
    </div>
  )
}
