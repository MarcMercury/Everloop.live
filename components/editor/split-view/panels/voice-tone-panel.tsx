'use client'

import { useState, useCallback } from 'react'
import { 
  Loader2, 
  Sparkles, 
  BookOpen, 
  Gauge, 
  TrendingUp,
  Lightbulb,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { analyzeVoiceTone, type FullVoiceAnalysis } from '@/lib/actions/voice-analyzer'
import { getReadingEaseDescription, getGradeLevelDescription } from '@/lib/utils/readability'

interface VoiceTonePanelProps {
  getText: () => string
}

const TONE_COLORS: Record<string, string> = {
  contemplative: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  urgent: 'bg-red-500/20 text-red-300 border-red-500/30',
  melancholic: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  hopeful: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  mysterious: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  ominous: 'bg-gray-700/40 text-gray-300 border-gray-500/30',
  whimsical: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  formal: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  intimate: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  neutral: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
}

const PACING_LABELS: Record<string, { label: string; description: string }> = {
  slow: { label: 'Slow', description: 'Deliberate, meditative rhythm' },
  measured: { label: 'Measured', description: 'Balanced, thoughtful pacing' },
  brisk: { label: 'Brisk', description: 'Quick but controlled flow' },
  rapid: { label: 'Rapid', description: 'Fast-paced, urgent momentum' },
  varied: { label: 'Varied', description: 'Dynamic rhythm with changes' },
}

const PRIORITY_COLORS = {
  low: 'bg-blue-500/20 text-blue-300',
  medium: 'bg-yellow-500/20 text-yellow-300',
  high: 'bg-red-500/20 text-red-300',
}

export function VoiceTonePanel({ getText }: VoiceTonePanelProps) {
  const [analysis, setAnalysis] = useState<FullVoiceAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'readability']))

  const runAnalysis = useCallback(async () => {
    const text = getText()
    
    if (!text || text.length < 100) {
      setError('Write at least 50 words before analyzing')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await analyzeVoiceTone(text)
      
      if (result.success && result.analysis) {
        setAnalysis(result.analysis)
        setExpandedSections(new Set(['overview', 'readability', 'voice']))
      } else {
        setError(result.error || 'Analysis failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsLoading(false)
    }
  }, [getText])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gold/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-serif text-lg text-parchment flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            Voice & Tone
          </h3>
          <Button
            onClick={runAnalysis}
            disabled={isLoading}
            size="sm"
            className="gap-1.5"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : analysis ? (
              <RefreshCw className="w-3.5 h-3.5" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {isLoading ? 'Analyzing...' : analysis ? 'Re-analyze' : 'Analyze'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Analyze your writing&apos;s voice, tone, and readability
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="p-4">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {!analysis && !isLoading && !error && (
          <div className="p-8 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-parchment-muted/30" />
            <p className="text-parchment-muted text-sm mb-4">
              Analyze your prose to get insights on voice, tone, readability, and style.
            </p>
            <Button onClick={runAnalysis} disabled={isLoading}>
              <Sparkles className="w-4 h-4 mr-2" />
              Start Analysis
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-gold" />
            <p className="text-parchment-muted text-sm">
              Analyzing your prose...
            </p>
          </div>
        )}

        {analysis && !isLoading && (
          <div className="divide-y divide-gold/10">
            {/* Overview Section */}
            <CollapsibleSection
              title="Overview"
              icon={<BookOpen className="w-4 h-4" />}
              isExpanded={expandedSections.has('overview')}
              onToggle={() => toggleSection('overview')}
            >
              <div className="space-y-4">
                {/* Tone Badge */}
                <div>
                  <span className="text-xs text-muted-foreground block mb-1.5">Dominant Tone</span>
                  <Badge 
                    variant="outline" 
                    className={cn('text-sm capitalize', TONE_COLORS[analysis.voiceTone.overallTone])}
                  >
                    {analysis.voiceTone.overallTone}
                  </Badge>
                </div>

                {/* Pacing */}
                <div>
                  <span className="text-xs text-muted-foreground block mb-1.5">Pacing</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {analysis.voiceTone.pacing}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {PACING_LABELS[analysis.voiceTone.pacing]?.description}
                    </span>
                  </div>
                </div>

                {/* Canon Fit Score */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">Canon Style Fit</span>
                    <span className="text-xs font-medium">{analysis.voiceTone.canonFit.score}%</span>
                  </div>
                  <Progress value={analysis.voiceTone.canonFit.score} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {analysis.voiceTone.canonFit.notes}
                  </p>
                </div>

                {/* Style Comparisons */}
                {analysis.voiceTone.styleComparison.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1.5">Similar to</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.voiceTone.styleComparison.map((style, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Readability Section */}
            <CollapsibleSection
              title="Readability"
              icon={<Gauge className="w-4 h-4" />}
              isExpanded={expandedSections.has('readability')}
              onToggle={() => toggleSection('readability')}
            >
              <div className="space-y-4">
                {/* Reading Ease */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Reading Ease</span>
                    <span className="text-xs">
                      {getReadingEaseDescription(analysis.readability.fleschReadingEase)}
                    </span>
                  </div>
                  <Progress 
                    value={analysis.readability.fleschReadingEase} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Score: {analysis.readability.fleschReadingEase} (Higher = easier)
                  </p>
                </div>

                {/* Grade Level */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground block mb-0.5">Grade Level</span>
                    <span className="text-sm font-medium">
                      {getGradeLevelDescription(analysis.readability.fleschKincaidGrade)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground block mb-0.5">Fog Index</span>
                    <span className="text-sm font-medium">
                      {analysis.readability.gunningFog}
                    </span>
                  </div>
                </div>

                {/* Sentence Stats */}
                <div>
                  <span className="text-xs text-muted-foreground block mb-2">Sentence Distribution</span>
                  <div className="flex gap-1 h-6">
                    <DistributionBar 
                      value={analysis.sentences.shortSentences} 
                      total={analysis.sentences.totalSentences}
                      label="Short (<10)"
                      color="bg-green-500"
                    />
                    <DistributionBar 
                      value={analysis.sentences.mediumSentences} 
                      total={analysis.sentences.totalSentences}
                      label="Medium (10-20)"
                      color="bg-blue-500"
                    />
                    <DistributionBar 
                      value={analysis.sentences.longSentences} 
                      total={analysis.sentences.totalSentences}
                      label="Long (20-30)"
                      color="bg-orange-500"
                    />
                    <DistributionBar 
                      value={analysis.sentences.veryLongSentences} 
                      total={analysis.sentences.totalSentences}
                      label="Very Long (>30)"
                      color="bg-red-500"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                    <span>Avg: {analysis.sentences.averageLength} words</span>
                    <span>Variety: {analysis.sentences.lengthVariance}%</span>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Voice Characteristics Section */}
            <CollapsibleSection
              title="Voice Characteristics"
              icon={<MessageSquare className="w-4 h-4" />}
              isExpanded={expandedSections.has('voice')}
              onToggle={() => toggleSection('voice')}
            >
              <div className="space-y-3">
                {analysis.voiceTone.voiceCharacteristics.map((char, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{char.trait}</span>
                      <span className="text-xs text-muted-foreground">{char.strength}%</span>
                    </div>
                    <Progress value={char.strength} className="h-1.5" />
                    {char.example && (
                      <p className="text-xs text-muted-foreground italic pl-2 border-l-2 border-gold/20">
                        &ldquo;{char.example}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Strengths Section */}
            <CollapsibleSection
              title="Strengths"
              icon={<CheckCircle className="w-4 h-4 text-emerald-400" />}
              isExpanded={expandedSections.has('strengths')}
              onToggle={() => toggleSection('strengths')}
            >
              <ul className="space-y-2">
                {analysis.voiceTone.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-parchment-muted">{strength}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            {/* Suggestions Section */}
            <CollapsibleSection
              title="Suggestions"
              icon={<Lightbulb className="w-4 h-4 text-yellow-400" />}
              isExpanded={expandedSections.has('suggestions')}
              onToggle={() => toggleSection('suggestions')}
            >
              <div className="space-y-3">
                {analysis.voiceTone.suggestions.map((suggestion, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{suggestion.area}</span>
                      <Badge 
                        variant="outline" 
                        className={cn('text-xs', PRIORITY_COLORS[suggestion.priority])}
                      >
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Footer with metadata */}
            <div className="p-4 text-xs text-muted-foreground">
              Analyzed {analysis.wordCount} words • {new Date(analysis.analyzedAt).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper Components

function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string
  icon: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}

function DistributionBar({
  value,
  total,
  label,
  color,
}: {
  value: number
  total: number
  label: string
  color: string
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0
  
  if (percentage === 0) return null
  
  return (
    <div
      className={cn('rounded-sm transition-all hover:opacity-80', color)}
      style={{ width: `${percentage}%`, minWidth: percentage > 0 ? '8px' : '0' }}
      title={`${label}: ${value} sentences (${Math.round(percentage)}%)`}
    />
  )
}

export default VoiceTonePanel
