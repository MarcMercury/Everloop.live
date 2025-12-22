'use client'

import { useState } from 'react'
import { 
  X, 
  Check, 
  MessageSquare, 
  Lightbulb, 
  HelpCircle, 
  AlertTriangle,
  Send,
  Trash2,
  Lock,
  Unlock,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  createComment, 
  updateComment, 
  deleteComment, 
  resolveComment,
  replyToComment,
  type StoryComment,
  type CommentType 
} from '@/lib/actions/comments'

interface CommentPopoverProps {
  // For new comments
  storyId?: string
  chapterId?: string | null
  selectedText?: string
  selectionStart?: number
  selectionEnd?: number
  
  // For existing comments
  comment?: StoryComment
  threadComments?: StoryComment[]
  
  // UI state
  position: { x: number; y: number }
  onClose: () => void
  onCommentCreated?: (comment: StoryComment) => void
  onCommentUpdated?: (comment: StoryComment) => void
  onCommentDeleted?: (commentId: string) => void
}

const COMMENT_TYPE_CONFIG: Record<CommentType, { 
  icon: typeof MessageSquare
  color: string
  bgColor: string
  label: string 
}> = {
  note: { 
    icon: MessageSquare, 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-400/10',
    label: 'Note' 
  },
  suggestion: { 
    icon: Lightbulb, 
    color: 'text-gold', 
    bgColor: 'bg-gold/10',
    label: 'Suggestion' 
  },
  question: { 
    icon: HelpCircle, 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-400/10',
    label: 'Question' 
  },
  issue: { 
    icon: AlertTriangle, 
    color: 'text-orange-400', 
    bgColor: 'bg-orange-400/10',
    label: 'Issue' 
  },
}

export function CommentPopover({
  storyId,
  chapterId,
  selectedText,
  selectionStart,
  selectionEnd,
  comment,
  threadComments = [],
  position,
  onClose,
  onCommentCreated,
  onCommentUpdated,
  onCommentDeleted,
}: CommentPopoverProps) {
  const [content, setContent] = useState('')
  const [commentType, setCommentType] = useState<CommentType>('note')
  const [isPrivate, setIsPrivate] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isNewComment = !comment
  const allComments = comment 
    ? [comment, ...threadComments.filter(c => c.id !== comment.id)]
    : []

  const handleSubmitNew = async () => {
    if (!storyId || selectionStart === undefined || selectionEnd === undefined) return
    if (!content.trim()) return

    setIsSubmitting(true)
    setError(null)

    const result = await createComment({
      story_id: storyId,
      chapter_id: chapterId,
      content: content.trim(),
      comment_type: commentType,
      position_start: selectionStart,
      position_end: selectionEnd,
      selected_text: selectedText,
      is_private: isPrivate,
    })

    setIsSubmitting(false)

    if (result.success && result.comment) {
      onCommentCreated?.(result.comment)
      onClose()
    } else {
      setError(result.error || 'Failed to create comment')
    }
  }

  const handleReply = async () => {
    if (!comment || !replyContent.trim()) return

    setIsSubmitting(true)
    setError(null)

    const result = await replyToComment(comment.id, replyContent.trim())

    setIsSubmitting(false)

    if (result.success && result.comment) {
      onCommentUpdated?.(result.comment)
      setReplyContent('')
    } else {
      setError(result.error || 'Failed to add reply')
    }
  }

  const handleResolve = async () => {
    if (!comment) return

    setIsSubmitting(true)
    const result = await resolveComment(comment.id, !comment.is_resolved)
    setIsSubmitting(false)

    if (result.success && result.comment) {
      onCommentUpdated?.(result.comment)
    }
  }

  const handleDelete = async (commentId: string) => {
    setIsSubmitting(true)
    const result = await deleteComment(commentId)
    setIsSubmitting(false)

    if (result.success) {
      onCommentDeleted?.(commentId)
      if (commentId === comment?.id) {
        onClose()
      }
    }
  }

  return (
    <div 
      className="fixed z-50 w-80 max-h-96 overflow-hidden bg-charcoal border border-charcoal-700 rounded-lg shadow-2xl"
      style={{ 
        left: Math.min(position.x, window.innerWidth - 340),
        top: Math.min(position.y + 10, window.innerHeight - 400),
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-charcoal-700">
        <div className="flex items-center gap-2">
          {isNewComment ? (
            <>
              <MessageSquare className="w-4 h-4 text-gold" />
              <span className="font-medium text-sm">Add Comment</span>
            </>
          ) : (
            <>
              {(() => {
                const config = COMMENT_TYPE_CONFIG[comment.comment_type]
                const Icon = config.icon
                return <Icon className={cn('w-4 h-4', config.color)} />
              })()}
              <span className="font-medium text-sm">{COMMENT_TYPE_CONFIG[comment.comment_type].label}</span>
              {comment.is_resolved && (
                <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                  Resolved
                </Badge>
              )}
            </>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Selected Text Preview */}
      {selectedText && (
        <div className="px-3 py-2 bg-navy/30 border-b border-charcoal-700">
          <p className="text-xs text-muted-foreground italic line-clamp-2">
            &ldquo;{selectedText}&rdquo;
          </p>
        </div>
      )}

      {/* Content Area */}
      <div className="max-h-60 overflow-y-auto">
        {isNewComment ? (
          <div className="p-3 space-y-3">
            {/* Comment Type Selector */}
            <div className="flex gap-1">
              {(Object.keys(COMMENT_TYPE_CONFIG) as CommentType[]).map((type) => {
                const config = COMMENT_TYPE_CONFIG[type]
                const Icon = config.icon
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCommentType(type)}
                    className={cn(
                      'flex-1 p-2 rounded-md transition-colors text-center',
                      commentType === type 
                        ? cn(config.bgColor, config.color)
                        : 'text-muted-foreground hover:bg-charcoal-700'
                    )}
                    title={config.label}
                  >
                    <Icon className="w-4 h-4 mx-auto" />
                  </button>
                )
              })}
            </div>

            {/* Comment Input */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your comment..."
              className="w-full h-20 px-3 py-2 text-sm bg-charcoal-800 border border-charcoal-700 rounded-md 
                         placeholder:text-muted-foreground/50 focus:border-gold/50 focus:outline-none
                         resize-none"
              autoFocus
            />

            {/* Privacy Toggle */}
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={cn(
                'flex items-center gap-2 text-xs transition-colors',
                isPrivate ? 'text-muted-foreground' : 'text-gold'
              )}
            >
              {isPrivate ? (
                <>
                  <Lock className="w-3 h-3" />
                  <span>Private note (only you can see)</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3" />
                  <span>Public comment (visible to others)</span>
                </>
              )}
            </button>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-charcoal-700">
            {/* Comment Thread */}
            {allComments.map((c, index) => (
              <div key={c.id} className={cn('p-3', index > 0 && 'pl-6')}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground/90">{c.content}</p>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(c.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}

            {/* Reply Input */}
            <div className="p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Add a reply..."
                  className="flex-1 px-2 py-1 text-sm bg-charcoal-800 border border-charcoal-700 rounded-md 
                             placeholder:text-muted-foreground/50 focus:border-gold/50 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleReply()
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim() || isSubmitting}
                  className="h-8 w-8 p-0"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-3 border-t border-charcoal-700 bg-charcoal-800/50">
        {isNewComment ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="canon"
              size="sm"
              onClick={handleSubmitNew}
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Comment'}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResolve}
              disabled={isSubmitting}
              className={comment.is_resolved ? 'text-muted-foreground' : 'text-green-400'}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              {comment.is_resolved ? 'Unresolve' : 'Resolve'}
            </Button>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {comment.is_private ? (
                <Lock className="w-3 h-3" />
              ) : (
                <Unlock className="w-3 h-3" />
              )}
              <span>{comment.is_private ? 'Private' : 'Public'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
