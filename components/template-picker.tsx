'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  BookOpen, 
  ScrollText, 
  Sparkles, 
  FileText,
  Users,
  Eye,
  Loader2,
  ChevronRight,
  Star
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getSystemTemplates, useTemplate } from '@/lib/actions/templates'
import type { StoryTemplate, StoryScope, Json } from '@/types/database'

interface TemplatePickerProps {
  scope: StoryScope
  onSelect: (template: StoryTemplate | null) => void
  onCancel: () => void
  isLoading?: boolean
}

const SCOPE_ICONS: Record<StoryScope, React.ReactNode> = {
  tome: <BookOpen className="w-4 h-4" />,
  tale: <ScrollText className="w-4 h-4" />,
  scene: <Sparkles className="w-4 h-4" />,
}

export function TemplatePicker({ scope, onSelect, onCancel, isLoading }: TemplatePickerProps) {
  const [templates, setTemplates] = useState<StoryTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<StoryTemplate | null>(null)

  useEffect(() => {
    async function loadTemplates() {
      setLoading(true)
      const data = await getSystemTemplates(scope)
      setTemplates(data)
      setLoading(false)
    }
    loadTemplates()
  }, [scope])

  const handleTemplateSelect = useCallback(async (template: StoryTemplate) => {
    // Track usage
    await useTemplate(template.id)
    onSelect(template)
  }, [onSelect])

  const handleBlankStart = useCallback(() => {
    onSelect(null)
  }, [onSelect])

  if (loading) {
    return (
      <div className="py-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-gold">
          {SCOPE_ICONS[scope]}
          <span className="text-sm uppercase tracking-wider">
            {scope} Templates
          </span>
        </div>
        <p className="text-sm text-parchment-muted">
          Choose a starting point or begin with a blank canvas
        </p>
      </div>

      {/* Blank Start Option */}
      <button
        onClick={handleBlankStart}
        disabled={isLoading}
        className={cn(
          'w-full flex items-center gap-4 p-4 rounded-lg text-left',
          'bg-teal-rich/30 border border-gold/20',
          'hover:border-gold/40 hover:bg-teal-rich/50',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center">
          <FileText className="w-6 h-6 text-gold/70" />
        </div>
        <div className="flex-1">
          <h4 className="font-serif text-parchment">Blank Canvas</h4>
          <p className="text-sm text-parchment-muted">
            Start from scratch with your own vision
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-parchment-muted" />
      </button>

      {/* Divider */}
      {templates.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gold/10" />
          <span className="text-xs text-parchment-muted uppercase tracking-wider">
            or use a template
          </span>
          <div className="flex-1 h-px bg-gold/10" />
        </div>
      )}

      {/* Template Grid */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={handleTemplateSelect}
            onPreview={setPreviewTemplate}
            disabled={isLoading}
          />
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={() => {
            handleTemplateSelect(previewTemplate)
            setPreviewTemplate(null)
          }}
        />
      )}

      {/* Back Button */}
      <div className="pt-2 border-t border-gold/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-parchment-muted hover:text-parchment"
        >
          ← Change scope
        </Button>
      </div>
    </div>
  )
}

// Template Card Component
function TemplateCard({
  template,
  onSelect,
  onPreview,
  disabled,
}: {
  template: StoryTemplate
  onSelect: (template: StoryTemplate) => void
  onPreview: (template: StoryTemplate) => void
  disabled?: boolean
}) {
  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-3 rounded-lg',
        'bg-teal-rich/20 border border-gold/10',
        'hover:border-gold/30 hover:bg-teal-rich/40',
        'transition-all duration-200'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-serif text-parchment truncate">{template.name}</h4>
          {template.is_featured && (
            <Star className="w-3.5 h-3.5 text-gold fill-gold/50" />
          )}
        </div>
        <p className="text-sm text-parchment-muted line-clamp-2">
          {template.description}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {template.genre && (
            <Badge variant="outline" className="text-xs">
              {template.genre}
            </Badge>
          )}
          {template.estimated_words && (
            <span className="text-xs text-parchment-muted">
              ~{template.estimated_words.toLocaleString()} words
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-parchment-muted hover:text-parchment"
          onClick={(e) => {
            e.stopPropagation()
            onPreview(template)
          }}
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          onClick={() => onSelect(template)}
          disabled={disabled}
          className="h-7 px-3"
        >
          Use
        </Button>
      </div>
    </div>
  )
}

// Template Preview Component
function TemplatePreview({
  template,
  onClose,
  onUse,
}: {
  template: StoryTemplate
  onClose: () => void
  onUse: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-lg bg-teal-deep border border-gold/20 rounded-lg shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-gold/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg text-parchment">{template.name}</h3>
              <p className="text-sm text-parchment-muted">{template.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-parchment-muted hover:text-parchment"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-4 max-h-[300px] overflow-y-auto">
          <div className="prose prose-invert prose-sm">
            {template.initial_content ? (
              <ContentPreview content={template.initial_content} />
            ) : (
              <p className="text-parchment-muted italic">No preview available</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gold/10 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-parchment-muted">
            {template.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={onUse}>
              Use Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple content preview (converts TipTap JSON to text)
function ContentPreview({ content }: { content: Json }) {
  const extractPreview = (node: unknown, depth: number = 0): string => {
    if (!node || typeof node !== 'object') return ''
    
    const n = node as Record<string, unknown>
    
    if (n.type === 'text' && typeof n.text === 'string') {
      return n.text
    }
    
    if (n.type === 'heading') {
      const level = (n.attrs as Record<string, unknown>)?.level || 2
      const text = Array.isArray(n.content) 
        ? n.content.map((c: unknown) => extractPreview(c, depth + 1)).join('')
        : ''
      return `${'#'.repeat(level as number)} ${text}\n\n`
    }
    
    if (n.type === 'paragraph') {
      const text = Array.isArray(n.content)
        ? n.content.map((c: unknown) => extractPreview(c, depth + 1)).join('')
        : ''
      return `${text}\n\n`
    }
    
    if (n.type === 'bulletList' || n.type === 'orderedList') {
      const items = Array.isArray(n.content) 
        ? n.content.map((item: unknown, i: number) => {
            const itemNode = item as Record<string, unknown>
            const text = Array.isArray(itemNode.content)
              ? itemNode.content.map((c: unknown) => extractPreview(c, depth + 1)).join('')
              : ''
            const prefix = n.type === 'orderedList' ? `${i + 1}.` : '•'
            return `${prefix} ${text}`
          }).join('\n')
        : ''
      return `${items}\n\n`
    }
    
    if (Array.isArray(n.content)) {
      return n.content.map((c: unknown) => extractPreview(c, depth + 1)).join('')
    }
    
    return ''
  }

  const preview = extractPreview(content)
  
  return (
    <pre className="whitespace-pre-wrap font-serif text-parchment-muted text-sm">
      {preview || 'Empty template'}
    </pre>
  )
}

export default TemplatePicker
