'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  FileText, 
  FileCode, 
  Book, 
  Printer,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react'
import { exportStory, exportChapter, type ExportFormat } from '@/lib/actions/export'
import { type Chapter } from '@/lib/actions/chapters'
import { cn } from '@/lib/utils'

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storyId: string
  storyTitle: string
  scope: 'tome' | 'tale' | 'scene'
  chapters?: Chapter[]
  currentChapterId?: string
}

interface ExportOption {
  format: ExportFormat
  label: string
  description: string
  icon: React.ReactNode
  fileType: string
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    format: 'pdf',
    label: 'PDF (Print)',
    description: 'Styled HTML for printing to PDF',
    icon: <Printer className="w-5 h-5" />,
    fileType: '.html'
  },
  {
    format: 'epub',
    label: 'EPUB',
    description: 'E-reader compatible format',
    icon: <Book className="w-5 h-5" />,
    fileType: '.html'
  },
  {
    format: 'markdown',
    label: 'Markdown',
    description: 'Plain text with formatting',
    icon: <FileCode className="w-5 h-5" />,
    fileType: '.md'
  },
  {
    format: 'txt',
    label: 'Plain Text',
    description: 'Simple text, no formatting',
    icon: <FileText className="w-5 h-5" />,
    fileType: '.txt'
  },
  {
    format: 'html',
    label: 'HTML',
    description: 'Styled web page',
    icon: <FileCode className="w-5 h-5" />,
    fileType: '.html'
  },
]

export function ExportModal({
  open,
  onOpenChange,
  storyId,
  storyTitle,
  scope,
  chapters = [],
  currentChapterId
}: ExportModalProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null)
  const [exportMode, setExportMode] = useState<'full' | 'chapter'>('full')
  const [selectedChapter, setSelectedChapter] = useState<string | null>(currentChapterId || null)
  const [status, setStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleExport = (format: ExportFormat) => {
    setSelectedFormat(format)
    setStatus('exporting')
    setErrorMessage(null)

    startTransition(async () => {
      try {
        let result

        if (exportMode === 'chapter' && selectedChapter) {
          result = await exportChapter(storyId, selectedChapter, format)
        } else {
          result = await exportStory({
            storyId,
            format,
            includeTitle: true,
            includeChapterTitles: true,
          })
        }

        if (!result.success || !result.content) {
          setStatus('error')
          setErrorMessage(result.error || 'Export failed')
          return
        }

        // Create and download the file
        const blob = new Blob([result.content], { type: result.mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.filename || 'export.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        setStatus('success')
        
        // Auto-close after success
        setTimeout(() => {
          onOpenChange(false)
          setStatus('idle')
          setSelectedFormat(null)
        }, 1500)
      } catch (err) {
        console.error('Export error:', err)
        setStatus('error')
        setErrorMessage('An unexpected error occurred')
      }
    })
  }

  const hasChapters = scope === 'tome' && chapters.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-teal-deep border-gold/20">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-parchment flex items-center gap-2">
            <Download className="w-5 h-5 text-gold" />
            Export Story
          </DialogTitle>
          <DialogDescription className="text-parchment-muted">
            Download "{storyTitle}" in your preferred format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Mode Selection (for Tomes with chapters) */}
          {hasChapters && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-parchment">
                Export Mode
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExportMode('full')}
                  className={cn(
                    "flex-1 border-gold/20",
                    exportMode === 'full' 
                      ? "bg-gold/20 text-gold border-gold/40" 
                      : "text-parchment-muted hover:text-parchment"
                  )}
                >
                  <Book className="w-4 h-4 mr-2" />
                  Full Story
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExportMode('chapter')}
                  className={cn(
                    "flex-1 border-gold/20",
                    exportMode === 'chapter' 
                      ? "bg-gold/20 text-gold border-gold/40" 
                      : "text-parchment-muted hover:text-parchment"
                  )}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Single Chapter
                </Button>
              </div>
              
              {/* Chapter Selection */}
              {exportMode === 'chapter' && (
                <select
                  value={selectedChapter || ''}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-md bg-teal-rich/50 border border-gold/20 
                             text-parchment text-sm focus:outline-none focus:border-gold/40"
                >
                  <option value="">Select a chapter...</option>
                  {chapters.map((ch, i) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.title || `Chapter ${i + 1}`}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-parchment">
              Choose Format
            </label>
            <div className="grid gap-2">
              {EXPORT_OPTIONS.map((option) => (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  disabled={isPending || (exportMode === 'chapter' && !selectedChapter)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border transition-all",
                    "hover:bg-gold/10 hover:border-gold/30",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    selectedFormat === option.format && status === 'exporting'
                      ? "bg-gold/20 border-gold/40"
                      : "bg-teal-rich/30 border-gold/10"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    selectedFormat === option.format && status === 'exporting'
                      ? "bg-gold/30 text-gold"
                      : "bg-teal-deep/50 text-parchment-muted"
                  )}>
                    {selectedFormat === option.format && status === 'exporting' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : selectedFormat === option.format && status === 'success' ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      option.icon
                    )}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-parchment font-medium">
                        {option.label}
                      </span>
                      <Badge variant="outline" className="text-xs border-gold/20 text-parchment-muted">
                        {option.fileType}
                      </Badge>
                    </div>
                    <p className="text-sm text-parchment-muted">
                      {option.description}
                    </p>
                  </div>
                  
                  <Download className="w-4 h-4 text-parchment-muted" />
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {status === 'error' && errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Export complete! Your download should start automatically.</span>
            </div>
          )}

          {/* PDF Print Instructions */}
          <div className="p-3 rounded-lg bg-teal-rich/30 border border-gold/10">
            <p className="text-xs text-parchment-muted">
              <strong className="text-parchment">PDF Tip:</strong> Use the "PDF (Print)" option, then 
              open the downloaded HTML file in your browser and use Print → Save as PDF for the best results.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
