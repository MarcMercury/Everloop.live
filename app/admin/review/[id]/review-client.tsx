'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { approveStory, rejectStory } from '@/lib/actions/admin'
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  User, 
  Calendar,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'

interface StoryReview {
  id: string
  canon_consistency_score: number | null
  quality_score: number | null
  feedback: string | null
  suggestions: Record<string, unknown> | null
  flagged_issues: string[] | null
  decision: string | null
  is_ai_review: boolean
  created_at: string
  reviewer: {
    username: string
  } | null
}

interface Story {
  id: string
  title: string
  content: unknown
  created_at: string
  canon_status: string
  word_count: number | null
  author: {
    id: string
    username: string
  } | null
  reviews: StoryReview[]
}

interface ReviewClientProps {
  story: Story
}

function extractTextFromContent(content: unknown): string {
  if (!content || typeof content !== 'object') return ''
  
  const extractText = (node: unknown): string => {
    if (!node || typeof node !== 'object') return ''
    
    const n = node as { type?: string; text?: string; content?: unknown[] }
    
    if (n.type === 'text' && typeof n.text === 'string') {
      return n.text
    }
    
    if (Array.isArray(n.content)) {
      return n.content.map(extractText).join('')
    }
    
    return ''
  }
  
  const c = content as { content?: unknown[] }
  if (Array.isArray(c.content)) {
    return c.content.map(extractText).join('\n\n')
  }
  
  return ''
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-muted-foreground'
  if (score >= 85) return 'text-green-500'
  if (score >= 50) return 'text-yellow-500'
  return 'text-red-500'
}

function getScoreBg(score: number | null): string {
  if (score === null) return 'bg-charcoal-700'
  if (score >= 85) return 'bg-green-500/20'
  if (score >= 50) return 'bg-yellow-500/20'
  return 'bg-red-500/20'
}

export function ReviewClient({ story }: ReviewClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const storyText = extractTextFromContent(story.content)
  const aiReview = story.reviews.find(r => r.is_ai_review)
  const humanReviews = story.reviews.filter(r => !r.is_ai_review)
  
  const handleApprove = () => {
    setAction('approve')
    setError(null)
    
    startTransition(async () => {
      const result = await approveStory(story.id)
      
      if (!result.success) {
        setError(result.error || 'Failed to approve')
        setAction(null)
      } else {
        router.push('/admin')
      }
    })
  }
  
  const handleReject = () => {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection')
      return
    }
    
    setAction('reject')
    setError(null)
    
    startTransition(async () => {
      const result = await rejectStory(story.id, rejectReason)
      
      if (!result.success) {
        setError(result.error || 'Failed to reject')
        setAction(null)
      } else {
        router.push('/admin')
      }
    })
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Back Link */}
      <Link 
        href="/admin"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Queue
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Story Header */}
          <div className="p-6 rounded-lg bg-navy/30 border border-charcoal-700">
            <h1 className="text-2xl font-serif mb-4">{story.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{story.author?.username || 'Unknown Author'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(story.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{story.word_count || 0} words</span>
              </div>
              <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                {story.canon_status}
              </Badge>
            </div>
          </div>
          
          {/* Story Content */}
          <div className="p-6 rounded-lg bg-charcoal/50 border border-charcoal-700">
            <h2 className="text-lg font-medium mb-4 text-gold">Story Content</h2>
            <div className="prose prose-invert max-w-none prose-p:text-foreground/90 prose-p:leading-relaxed">
              {storyText.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Canon Report */}
          <div className="p-4 rounded-lg bg-navy/30 border border-charcoal-700">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-gold" />
              <h2 className="font-medium">Canon Alignment Report</h2>
            </div>
            
            {aiReview ? (
              <div className="space-y-4">
                {/* Score */}
                <div className={`p-4 rounded-lg ${getScoreBg(aiReview.canon_consistency_score)}`}>
                  <p className="text-sm text-muted-foreground mb-1">Canon Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(aiReview.canon_consistency_score)}`}>
                    {aiReview.canon_consistency_score ?? 'N/A'}
                    <span className="text-lg text-muted-foreground">/100</span>
                  </p>
                </div>
                
                {/* Feedback */}
                {aiReview.feedback && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">AI Feedback</p>
                    <p className="text-sm text-foreground/90">{aiReview.feedback}</p>
                  </div>
                )}
                
                {/* Flagged Issues */}
                {aiReview.flagged_issues && aiReview.flagged_issues.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      Flagged Issues
                    </p>
                    <ul className="space-y-1">
                      {aiReview.flagged_issues.map((issue, i) => (
                        <li key={i} className="text-sm text-yellow-400 flex items-start gap-2">
                          <span>•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No AI analysis available</p>
            )}
          </div>
          
          {/* Previous Reviews */}
          {humanReviews.length > 0 && (
            <div className="p-4 rounded-lg bg-navy/30 border border-charcoal-700">
              <h2 className="font-medium mb-4">Previous Reviews</h2>
              <div className="space-y-3">
                {humanReviews.map((review) => (
                  <div key={review.id} className="p-3 rounded bg-charcoal-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {review.reviewer?.username || 'Reviewer'}
                      </span>
                      <Badge variant={review.decision === 'approve' ? 'default' : 'destructive'}>
                        {review.decision}
                      </Badge>
                    </div>
                    {review.feedback && (
                      <p className="text-sm text-foreground/80">{review.feedback}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="p-4 rounded-lg bg-navy/30 border border-charcoal-700">
            <h2 className="font-medium mb-4">Actions</h2>
            
            {error && (
              <div className="mb-4 p-3 rounded bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-3">
              <Button
                onClick={handleApprove}
                disabled={isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isPending && action === 'approve' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Approve for Canon
              </Button>
              
              {!showRejectModal ? (
                <Button
                  onClick={() => setShowRejectModal(true)}
                  variant="outline"
                  className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              ) : (
                <div className="space-y-3 p-3 rounded bg-charcoal-700/50">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="w-full h-24 px-3 py-2 rounded bg-charcoal border border-charcoal-700 
                               text-foreground placeholder:text-muted-foreground/50
                               focus:border-red-500/50 focus:outline-none resize-none text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleReject}
                      disabled={isPending || !rejectReason.trim()}
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                    >
                      {isPending && action === 'reject' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Confirm Reject
                    </Button>
                    <Button
                      onClick={() => setShowRejectModal(false)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
