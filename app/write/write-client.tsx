'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TiptapEditor, type JSONContent } from '@/components/editor/tiptap-editor'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { submitStory, saveDraft } from '@/lib/actions/story'
import { ArrowLeft, Send, Save, Loader2, BookOpen } from 'lucide-react'
import { type Json } from '@/types/database'

export function WriteClient() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSaving, setIsSaving] = useState(false)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<JSONContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [wordCount, setWordCount] = useState(0)
  
  const handleContentChange = (newContent: JSONContent) => {
    setContent(newContent)
    
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
  
  const handleSubmit = () => {
    setError(null)
    
    startTransition(async () => {
      const result = await submitStory(title, content as Json)
      
      if (!result.success) {
        setError(result.error || 'Failed to submit story')
        return
      }
      
      // Redirect to explore on success (dashboard will be built later)
      router.push('/explore')
    })
  }
  
  const handleSaveDraft = async () => {
    setError(null)
    setIsSaving(true)
    
    try {
      const result = await saveDraft(title, content as Json)
      
      if (!result.success) {
        setError(result.error || 'Failed to save draft')
      }
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-charcoal">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-charcoal-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/explore"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Archive</span>
            </Link>
            
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
                disabled={isSaving || !content}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="ml-2">Save Draft</span>
              </Button>
              
              {/* Submit */}
              <Button
                variant="canon"
                size="sm"
                onClick={handleSubmit}
                disabled={isPending || !title || !content || wordCount < 50}
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
        
        {/* Title Input */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Story Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-serif bg-transparent border-0 border-b border-charcoal-700 rounded-none px-0 py-4 
                       placeholder:text-muted-foreground/50 focus:border-gold focus-visible:ring-0
                       text-foreground"
          />
        </div>
        
        {/* Editor */}
        <TiptapEditor
          onChange={handleContentChange}
          placeholder="Begin your story... Let your words flow into the Everloop."
        />
        
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
    </div>
  )
}
