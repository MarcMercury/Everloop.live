'use client'

import { type CanonAnalysisResult } from '@/lib/actions/analyze'
import { cn } from '@/lib/utils'
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Loader2,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useState } from 'react'

interface CanonFeedbackProps {
  analysis: CanonAnalysisResult | null
  isAnalyzing: boolean
  error?: string | null
  onRetry?: () => void
}

export function CanonFeedback({ 
  analysis, 
  isAnalyzing, 
  error,
  onRetry 
}: CanonFeedbackProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  // Loading state
  if (isAnalyzing) {
    return (
      <div className="rounded-lg border border-charcoal-700 bg-charcoal-800/50 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Loader2 className="w-5 h-5 text-gold animate-spin" />
            <Sparkles className="w-3 h-3 text-gold absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Analyzing Canon Compatibility...</p>
            <p className="text-xs text-muted-foreground">The Canon Keeper is reviewing your story</p>
          </div>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-400">Analysis Failed</p>
            <p className="text-xs text-red-400/80">{error}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-red-400 hover:text-red-300 underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }
  
  // No analysis yet
  if (!analysis) {
    return (
      <div className="rounded-lg border border-charcoal-700 bg-charcoal-800/30 p-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Canon Check Pending</p>
            <p className="text-xs text-muted-foreground/80">Click "Check Canon" to analyze your story</p>
          </div>
        </div>
      </div>
    )
  }
  
  // Determine status styling
  const getStatusConfig = (status: string, score: number) => {
    if (status === 'Approved' || score >= 85) {
      return {
        icon: CheckCircle2,
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/50',
        iconColor: 'text-green-500',
        textColor: 'text-green-400',
        badgeColor: 'bg-green-500/20 text-green-400',
        label: 'Canon Compatible',
        description: 'Your story aligns with Everloop canon',
      }
    }
    
    if (status === 'Review' || score >= 50) {
      return {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/50',
        iconColor: 'text-yellow-500',
        textColor: 'text-yellow-400',
        badgeColor: 'bg-yellow-500/20 text-yellow-400',
        label: 'Needs Review',
        description: 'Minor lore conflicts detected',
      }
    }
    
    return {
      icon: XCircle,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/50',
      iconColor: 'text-red-500',
      textColor: 'text-red-400',
      badgeColor: 'bg-red-500/20 text-red-400',
      label: 'Lore Violations',
      description: 'Significant issues require revision',
    }
  }
  
  const config = getStatusConfig(analysis.status, analysis.score)
  const StatusIcon = config.icon
  
  return (
    <div className={cn(
      'rounded-lg border transition-all',
      config.bgColor,
      config.borderColor
    )}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <StatusIcon className={cn('w-5 h-5', config.iconColor)} />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={cn('text-sm font-medium', config.textColor)}>
                {config.label}
              </span>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-mono',
                config.badgeColor
              )}>
                {analysis.score}/100
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Score Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Canon Alignment</span>
              <span>{analysis.score}%</span>
            </div>
            <div className="h-2 bg-charcoal-700 rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  analysis.score >= 85 ? 'bg-green-500' :
                  analysis.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                )}
                style={{ width: `${analysis.score}%` }}
              />
            </div>
          </div>
          
          {/* Matched Entities */}
          {analysis.matchedEntities && analysis.matchedEntities.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Canon Entities Referenced:</p>
              <div className="flex flex-wrap gap-1">
                {analysis.matchedEntities.map((entity, i) => (
                  <span 
                    key={i}
                    className="text-xs px-2 py-0.5 rounded bg-charcoal-700 text-foreground"
                  >
                    {entity}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Feedback Points */}
          {analysis.feedback && analysis.feedback.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Feedback:</p>
              <ul className="space-y-1">
                {analysis.feedback.map((point, i) => (
                  <li 
                    key={i}
                    className="text-xs text-foreground/90 flex gap-2"
                  >
                    <span className={cn(
                      'mt-1.5 w-1 h-1 rounded-full shrink-0',
                      config.iconColor.replace('text-', 'bg-')
                    )} />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Compact badge version for inline display
 */
export function CanonBadge({ 
  score, 
  status 
}: { 
  score: number
  status: 'Approved' | 'Review' | 'Rejected' 
}) {
  if (status === 'Approved' || score >= 85) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
        <CheckCircle2 className="w-3 h-3" />
        Canon Compatible
      </span>
    )
  }
  
  if (status === 'Review' || score >= 50) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
        <AlertTriangle className="w-3 h-3" />
        Needs Review
      </span>
    )
  }
  
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
      <XCircle className="w-3 h-3" />
      Lore Violations
    </span>
  )
}
