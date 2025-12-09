'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TiptapEditor, type JSONContent } from '@/components/editor/tiptap-editor'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { submitStoryById, saveDraft } from '@/lib/actions/story'
import { analyzeStoryCanon, type CanonAnalysisResult } from '@/lib/actions/analyze'
import { CanonFeedback } from '@/components/editor/canon-feedback'
import { StreamOfConsciousnessModal } from '@/components/editor/stream-modal'
import { RosterSidebar } from '@/components/editor/roster-sidebar'
import { ArrowLeft, Send, Save, Loader2, BookOpen, Sparkles, Book, FileText, Scroll } from 'lucide-react'
import { type Json, type StoryScope } from '@/types/database'
import { type Editor } from '@tiptap/react'

interface WriteClientWithStoryProps {
  storyId: string
  initialTitle: string
  initialContent: Json
  scope: StoryScope
}

const SCOPE_CONFIG: Record<StoryScope, { label: string; icon: React.ReactNode; description: string }> = {
  tome: {
    label: 'Tome',
    icon: <Book className="w-3.5 h-3.5" />,
    description: 'Epic, world-shaping narrative'
  },
  tale: {
    label: 'Tale',
    icon: <FileText className="w-3.5 h-3.5" />,
    description: 'Complete story arc'
  },
  scene: {
    label: 'Scene',
    icon: <Scroll className="w-3.5 h-3.5" />,
    description: 'Single moment in time'
  },
}

export function WriteClientWithStory({ 
  storyId, 
  initialTitle, 
  initialContent,
  scope 
}: WriteClientWithStoryProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSaving, setIsSaving] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const [title, setTitle] = useState(initialTitle || '')
  const [content, setContent] = useState<JSONContent | null>(initialContent as JSONContent | null)
  const [error, setError] = useState<string | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Canon analysis state
  const [canonAnalysis, setCanonAnalysis] = useState<CanonAnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  
  // AI features state
  const [showStreamModal, setShowStreamModal] = useState(false)
  const [showRosterSidebar, setShowRosterSidebar] = useState(false)
  const editorRef = useRef<Editor | null>(null)
  
  // Calculate initial word count
  useEffect(() => {
    if (initialContent) {
      const text = extractTextFromJSON(initialContent as JSONContent)
      const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
      setWordCount(words)
    }
  }, [initialContent])
  
  const handleContentChange = (newContent: JSONContent) => {
    setContent(newContent)
    setHasChanges(true)
    // Reset analysis when content changes
    setCanonAnalysis(null)
    setAnalysisError(null)
    
    // Calculate word count
    const text = extractTextFromJSON(newContent)
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
    setWordCount(words)
  }
  
  const extractTextFromJSON = (json: JSONContent): string => {
    if (!json) return ''
    
    const extractText = (node: JSONContent): string => {
      if (node.type === 'text' && typeof node.text === 'string') {
        return node.text
      }
      
      if (Array.isArray(node.content)) {
        return node.content.map(extractText).join(' ')
      }
      
      return ''
    }
    
    if (Array.isArray(json.content)) {
      return json.content.map(extractText).join('\n')
    }
    
    return ''
  }
  
  // Handle editor ready
  const handleEditorReady = (editor: Editor) => {
    editorRef.current = editor
  }
  
  // Insert prose from Stream of Consciousness
  const handleInsertProse = (prose: string) => {
    if (editorRef.current) {
      editorRef.current
        .chain()
        .focus()
        .insertContent(prose)
        .run()
    }
    setShowStreamModal(false)
  }
  
  // Insert character mention from Roster
  const handleInsertCharacter = (characterName: string) => {
    if (editorRef.current) {
      editorRef.current
        .chain()
        .focus()
        .insertContent(characterName)
        .run()
    }
  }
  
  // Analyze story for canon consistency
  const handleAnalyze = async () => {
    if (!title || !content || wordCount < 50) return
    
    setIsAnalyzing(true)
    setAnalysisError(null)
    
    try {
      const plainText = extractTextFromJSON(content)
      const result = await analyzeStoryCanon(title, plainText)
      
      if (result.success && result.analysis) {
        setCanonAnalysis(result.analysis)
      } else {
        setAnalysisError(result.error || 'Analysis failed')
      }
    } catch {
      setAnalysisError('Failed to analyze story')
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  // Submit story for review
  const handleSubmit = () => {
    if (!title || !content) return
    
    setError(null)
    
    startTransition(async () => {
      // Save first, then submit
      const saveResult = await saveDraft(title, content as Json, storyId)
      
      if (!saveResult.success) {
        setError(saveResult.error || 'Failed to save before submitting')
        return
      }
      
      // Now submit using the story ID
      const result = await submitStoryById(storyId)
      
      if (result.success) {
        router.push('/dashboard?submitted=true')
      } else {
        setError(result.error || 'Failed to submit story')
      }
    })
  }
  
  // Save draft
  const handleSaveDraft = async () => {
    if (!content) return
    
    setIsSaving(true)
    setError(null)
    
    try {
      const result = await saveDraft(title, content as Json, storyId)
      
      if (result.success) {
        setHasChanges(false)
      } else {
        setError(result.error || 'Failed to save draft')
      }
    } finally {
      setIsSaving(false)
    }
  }
  
  const scopeConfig = SCOPE_CONFIG[scope]
  
  return (
    <div className="min-h-screen bg-charcoal">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-charcoal-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              
              {/* Scope Badge */}
              <Badge 
                variant="outline" 
                className="border-gold/50 text-gold bg-gold/10 gap-1.5"
              >
                {scopeConfig.icon}
                <span>Writing a {scopeConfig.label}</span>
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Word count */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>{wordCount} words</span>
              </div>
              
              {/* Save Draft */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving || !content || !hasChanges}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="ml-2">{hasChanges ? 'Save Draft' : 'Saved'}</span>
              </Button>
              
              {/* Canon Check */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !title || !content || wordCount < 50}
                className="border-gold/50 hover:border-gold hover:bg-gold/10"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-gold" />
                )}
                <span className="ml-2">Check Canon</span>
              </Button>
              
              {/* Submit */}
              <Button
                variant="canon"
                size="sm"
                onClick={handleSubmit}
                disabled={isPending || !title || !content || wordCount < 50 || (canonAnalysis !== null && canonAnalysis.score < 50)}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="ml-2">Submit for Review</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Editor Area */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
            {error}
          </div>
        )}
        
        {/* Scope Description */}
        <div className="mb-6 p-4 rounded-lg bg-navy/30 border border-charcoal-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10">
              {scopeConfig.icon}
            </div>
            <div>
              <h2 className="font-serif text-lg text-gold">{scopeConfig.label}</h2>
              <p className="text-sm text-muted-foreground">{scopeConfig.description}</p>
            </div>
          </div>
        </div>
        
        {/* Title Input */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Story Title..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setHasChanges(true)
            }}
            className="text-2xl font-serif bg-transparent border-0 border-b border-charcoal-700 rounded-none px-0 py-4 
                       placeholder:text-muted-foreground/50 focus:border-gold focus-visible:ring-0
                       text-foreground"
          />
        </div>
        
        {/* Editor */}
        <TiptapEditor
          content={initialContent as JSONContent}
          onChange={handleContentChange}
          placeholder="Begin your story... Let your words flow into the Everloop."
          onMagicWand={() => setShowStreamModal(true)}
          onCanonCheck={handleAnalyze}
          onRosterOpen={() => setShowRosterSidebar(true)}
          onEditorReady={handleEditorReady}
        />
        
        {/* Canon Feedback */}
        <div className="mt-6">
          <CanonFeedback
            analysis={canonAnalysis}
            isAnalyzing={isAnalyzing}
            error={analysisError}
            onRetry={handleAnalyze}
          />
        </div>
        
        {/* Guidelines */}
        <div className="mt-8 p-6 rounded-lg bg-navy/30 border border-charcoal-700">
          <h3 className="font-serif text-lg text-gold mb-3">Writing Guidelines</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span>
              <span>Stories must be at least 50 words to be submitted for review.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span>
              <span>Your story will be reviewed for consistency with the Everloop canon.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span>
              <span>Reference existing canon entities to strengthen your narrative&apos;s connection to the universe.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span>
              <span>You can save drafts at any time and return to continue writing later.</span>
            </li>
          </ul>
        </div>
      </main>
      
      {/* Stream of Consciousness Modal */}
      <StreamOfConsciousnessModal
        isOpen={showStreamModal}
        onClose={() => setShowStreamModal(false)}
        onInsert={handleInsertProse}
      />
      
      {/* Roster Sidebar */}
      <RosterSidebar
        isOpen={showRosterSidebar}
        onClose={() => setShowRosterSidebar(false)}
        onInsertCharacter={handleInsertCharacter}
      />
    </div>
  )
}
