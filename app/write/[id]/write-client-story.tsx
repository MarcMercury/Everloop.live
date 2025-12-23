'use client'

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TiptapEditor, type JSONContent } from '@/components/editor/tiptap-editor'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { submitStoryById, saveDraft } from '@/lib/actions/story'
import { analyzeStoryCanon, type CanonAnalysisResult } from '@/lib/actions/analyze'
import { saveChapterContent, type Chapter } from '@/lib/actions/chapters'
import { type StoryComment } from '@/lib/actions/comments'
import { createRevision } from '@/lib/actions/revisions'
import { 
  startWritingSession, 
  endWritingSession, 
  updateSessionWords 
} from '@/lib/actions/writing-stats'
import { CanonFeedback } from '@/components/editor/canon-feedback'
import { StreamOfConsciousnessModal } from '@/components/editor/stream-modal'
import { RosterSidebar } from '@/components/editor/roster-sidebar'
import { ChapterSidebar } from '@/components/editor/chapter-sidebar'
import { CommentsSidebar } from '@/components/editor/comments'
import { VersionHistorySidebar } from '@/components/editor/version-history'
import { CollaboratorsModal, PresenceIndicator } from '@/components/editor/collaborators'
import { ExportModal } from '@/components/editor/export'
import { ReadingMode } from '@/components/editor/reading-mode'
import { AchievementToastContainer } from '@/components/achievements'
import { checkAchievements, type NewAchievement } from '@/lib/actions/achievements'
import { SplitViewProvider, SplitViewContainer, SplitViewToggle } from '@/components/editor/split-view'
import { ArrowLeft, Send, Save, Loader2, BookOpen, Sparkles, Book, FileText, Scroll, PanelRight, List, MessageSquare, History, Users, Download, Eye } from 'lucide-react'
import { type Json, type StoryScope } from '@/types/database'
import { type Editor } from '@tiptap/react'

interface WriteClientWithStoryProps {
  storyId: string
  initialTitle: string
  initialContent: Json
  scope: StoryScope
  currentUser?: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
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
  scope,
  currentUser 
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
  
  // Collaborators state
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false)
  
  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false)
  
  // Reading mode state
  const [showReadingMode, setShowReadingMode] = useState(false)
  
  // Achievement state
  const [newAchievements, setNewAchievements] = useState<NewAchievement[]>([])
  
  // Chapter state (for Tomes)
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [showChapterSidebar, setShowChapterSidebar] = useState(scope === 'tome')
  const [chapterHasChanges, setChapterHasChanges] = useState(false)
  
  // Comments state
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(false)
  const [comments, setComments] = useState<StoryComment[]>([])
  
  // Version History state
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  
  // Writing session state
  const [sessionId, setSessionId] = useState<string | null>(null)
  const initialWordCountRef = useRef(0)
  
  // Handle new comment created
  const handleCommentCreated = useCallback((comment: StoryComment) => {
    setComments(prev => [...prev, comment])
  }, [])
  
  // Handle comment click from sidebar - scroll to position
  const handleCommentClick = useCallback((comment: StoryComment) => {
    if (editorRef.current) {
      editorRef.current.commands.setTextSelection({
        from: comment.position_start,
        to: comment.position_end,
      })
      editorRef.current.commands.scrollIntoView()
    }
    setShowCommentsSidebar(false)
  }, [])
  
  // Get current text for voice analysis
  const getText = useCallback(() => {
    if (!content) return ''
    return extractTextFromJSON(content)
  }, [content])
  
  // Get editor for entity linking
  const getEditor = useCallback(() => {
    return editorRef.current
  }, [])
  
  // Calculate initial word count
  useEffect(() => {
    if (initialContent) {
      const text = extractTextFromJSON(initialContent as JSONContent)
      const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
      setWordCount(words)
      initialWordCountRef.current = words
    }
  }, [initialContent])
  
  // Start writing session on mount
  useEffect(() => {
    const initSession = async () => {
      const result = await startWritingSession(storyId, null, initialWordCountRef.current)
      if (result.data) {
        setSessionId(result.data.id)
      }
    }
    
    initSession()
    
    // End session on unmount or page unload
    return () => {
      if (sessionId) {
        endWritingSession(sessionId, wordCount)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId])
  
  // Handle beforeunload to end session
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId) {
        // Use sendBeacon for reliable delivery on page close
        navigator.sendBeacon('/api/end-session', JSON.stringify({ sessionId, wordCount }))
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [sessionId, wordCount])
  
  // Update session word count periodically (every 30 seconds)
  useEffect(() => {
    if (!sessionId) return
    
    const interval = setInterval(() => {
      updateSessionWords(sessionId, wordCount)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [sessionId, wordCount])
  
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
  
  // Handle chapter selection (for Tomes)
  const handleChapterSelect = async (chapter: Chapter) => {
    // Save current chapter if there are changes
    if (currentChapter && chapterHasChanges && content) {
      setIsSaving(true)
      const contentText = extractTextFromJSON(content as JSONContent)
      const result = await saveChapterContent(
        currentChapter.id,
        currentChapter.title,
        content as Json,
        contentText
      )
      if (!result.success) {
        setError('Failed to save chapter before switching')
        setIsSaving(false)
        return
      }
      setIsSaving(false)
    }
    
    // Load the selected chapter
    setCurrentChapter(chapter)
    setContent(chapter.content as JSONContent | null)
    setChapterHasChanges(false)
    setHasChanges(false)
    setCanonAnalysis(null)
    setAnalysisError(null)
    
    // Update word count for this chapter
    if (chapter.content) {
      const text = extractTextFromJSON(chapter.content as JSONContent)
      const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
      setWordCount(words)
    } else {
      setWordCount(0)
    }
  }
  
  // Handle chapter content change
  const handleChapterContentChange = (newContent: JSONContent) => {
    setContent(newContent)
    setHasChanges(true)
    setChapterHasChanges(true)
    setCanonAnalysis(null)
    setAnalysisError(null)
    
    const text = extractTextFromJSON(newContent)
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
    setWordCount(words)
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
      const contentText = extractTextFromJSON(content as JSONContent)
      
      // For Tomes with a current chapter, save to chapter
      if (scope === 'tome' && currentChapter) {
        const result = await saveChapterContent(
          currentChapter.id,
          currentChapter.title,
          content as Json,
          contentText
        )
        
        if (result.success) {
          setHasChanges(false)
          setChapterHasChanges(false)
          
          // Create revision snapshot for manual saves
          await createRevision(storyId, title || 'Untitled', content as Json, {
            chapterId: currentChapter.id,
            revisionType: 'manual',
            contentText,
            wordCount,
          })
        } else {
          setError(result.error || 'Failed to save chapter')
        }
      } else {
        // For Tales/Scenes, save to story
        const result = await saveDraft(title, content as Json, storyId)
        
        if (result.success) {
          setHasChanges(false)
          
          // Create revision snapshot for manual saves
          await createRevision(storyId, title || 'Untitled', content as Json, {
            revisionType: 'manual',
            contentText,
            wordCount,
          })
        } else {
          setError(result.error || 'Failed to save draft')
        }
      }
      
      // Check for new achievements after save
      const achievementResult = await checkAchievements()
      if (achievementResult.data && achievementResult.data.length > 0) {
        setNewAchievements(achievementResult.data)
      }
    } finally {
      setIsSaving(false)
    }
  }
  
  const scopeConfig = SCOPE_CONFIG[scope]
  
  return (
    <SplitViewProvider>
      <div className="min-h-screen h-screen bg-charcoal flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 glass border-b border-charcoal-700 flex-shrink-0">
          <div className="px-6 py-4">
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
                {/* Presence Indicator */}
                {currentUser && (
                  <PresenceIndicator 
                    storyId={storyId} 
                    currentUser={currentUser}
                  />
                )}
                
                {/* Word count */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span>{wordCount} words</span>
                  {currentChapter && (
                    <span className="text-gold/70">· {currentChapter.title}</span>
                  )}
                </div>
                
                {/* Collaborators */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCollaboratorsModal(true)}
                  title="Manage Collaborators"
                >
                  <Users className="w-4 h-4" />
                </Button>
                
                {/* Chapter Toggle (Tomes only) */}
                {scope === 'tome' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChapterSidebar(!showChapterSidebar)}
                    className={showChapterSidebar ? 'border-gold text-gold' : ''}
                  >
                    <List className="w-4 h-4" />
                    <span className="ml-2 hidden sm:inline">Chapters</span>
                  </Button>
                )}
                
                {/* Split View Toggle */}
                <SplitViewToggle />
                
                {/* Comments Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCommentsSidebar(!showCommentsSidebar)}
                  className={showCommentsSidebar ? 'border-gold text-gold' : ''}
                  title="Comments & Notes"
                >
                  <MessageSquare className="w-4 h-4" />
                  {comments.length > 0 && (
                    <span className="ml-1 text-xs">{comments.length}</span>
                  )}
                </Button>
                
                {/* Version History Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className={showVersionHistory ? 'border-gold text-gold' : ''}
                  title="Version History"
                >
                  <History className="w-4 h-4" />
                </Button>
                
                {/* Export */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportModal(true)}
                  title="Export Story"
                >
                  <Download className="w-4 h-4" />
                </Button>
                
                {/* Reading Mode */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReadingMode(true)}
                  title="Reading Mode"
                  disabled={!content || wordCount < 10}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                
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
        
        {/* Split View Container */}
        <SplitViewContainer storyId={storyId} getText={getText} getEditor={getEditor}>
          <div className="flex h-full">
            {/* Chapter Sidebar (Tomes only) */}
            {scope === 'tome' && showChapterSidebar && (
              <ChapterSidebar
                storyId={storyId}
                currentChapterId={currentChapter?.id}
                onChapterSelect={handleChapterSelect}
                onClose={() => setShowChapterSidebar(false)}
              />
            )}
            
            {/* Main Editor Area */}
            <main className={`flex-1 overflow-y-auto ${scope === 'tome' && showChapterSidebar ? 'ml-0' : ''}`}>
              <div className="max-w-4xl mx-auto px-6 py-8">
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
          content={content as JSONContent}
          onChange={scope === 'tome' && currentChapter ? handleChapterContentChange : handleContentChange}
          placeholder={currentChapter 
            ? `Continue writing "${currentChapter.title}"...`
            : "Begin your story... Let your words flow into the Everloop."
          }
          onMagicWand={() => setShowStreamModal(true)}
          onCanonCheck={handleAnalyze}
          onRosterOpen={() => setShowRosterSidebar(true)}
          onEditorReady={handleEditorReady}
          storyId={storyId}
          chapterId={currentChapter?.id}
          onCommentCreated={handleCommentCreated}
          comments={comments}
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
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span>
              <span>Use the Reference panel (Cmd/Ctrl + \) to browse lore and canon stories while writing.</span>
            </li>
            {scope === 'tome' && (
              <li className="flex items-start gap-2">
                <span className="text-gold">•</span>
                <span>Organize your Tome into chapters using the chapter sidebar for better structure.</span>
              </li>
            )}
          </ul>
        </div>
              </div>
            </main>
          </div>
        </SplitViewContainer>
      
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
        
        {/* Comments Sidebar */}
        <CommentsSidebar
          storyId={storyId}
          chapterId={currentChapter?.id}
          isOpen={showCommentsSidebar}
          onClose={() => setShowCommentsSidebar(false)}
          onCommentClick={handleCommentClick}
        />
        
        {/* Version History Sidebar */}
        {showVersionHistory && (
          <div className="fixed inset-y-0 right-0 z-40 flex">
            <VersionHistorySidebar
              storyId={storyId}
              chapterId={currentChapter?.id}
              currentWordCount={wordCount}
              onClose={() => setShowVersionHistory(false)}
            />
          </div>
        )}
        
        {/* Collaborators Modal */}
        <CollaboratorsModal
          storyId={storyId}
          storyTitle={title || 'Untitled Story'}
          isOpen={showCollaboratorsModal}
          onClose={() => setShowCollaboratorsModal(false)}
        />
        
        {/* Export Modal */}
        <ExportModal
          open={showExportModal}
          onOpenChange={setShowExportModal}
          storyId={storyId}
          storyTitle={title || 'Untitled Story'}
          scope={scope}
          currentChapterId={currentChapter?.id}
        />
        
        {/* Reading Mode */}
        <ReadingMode
          isOpen={showReadingMode}
          onClose={() => setShowReadingMode(false)}
          title={title || 'Untitled Story'}
          content={getText()}
          wordCount={wordCount}
          chapterTitle={currentChapter?.title}
        />
        
        {/* Achievement Notifications */}
        {newAchievements.length > 0 && (
          <AchievementToastContainer
            achievements={newAchievements}
            onDismissAll={() => setNewAchievements([])}
          />
        )}
      </div>
    </SplitViewProvider>
  )
}
