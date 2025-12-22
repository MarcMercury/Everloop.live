'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, Loader2, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotesPanelProps {
  storyId?: string
}

const STORAGE_KEY_PREFIX = 'everloop-notes-'
const AUTOSAVE_DELAY = 1000 // 1 second debounce

export function NotesPanel({ storyId }: NotesPanelProps) {
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const storageKey = storyId 
    ? `${STORAGE_KEY_PREFIX}${storyId}` 
    : `${STORAGE_KEY_PREFIX}scratch`

  // Load notes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        setNotes(parsed.content || '')
        setLastSaved(parsed.savedAt ? new Date(parsed.savedAt) : null)
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [storageKey])

  // Autosave with debounce
  useEffect(() => {
    if (!hasChanges) return

    const timer = setTimeout(() => {
      saveNotes()
    }, AUTOSAVE_DELAY)

    return () => clearTimeout(timer)
  }, [notes, hasChanges])

  const saveNotes = useCallback(() => {
    setIsSaving(true)
    try {
      const data = {
        content: notes,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(storageKey, JSON.stringify(data))
      setLastSaved(new Date())
      setHasChanges(false)
    } catch (err) {
      console.error('Failed to save notes:', err)
    } finally {
      setIsSaving(false)
    }
  }, [notes, storageKey])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value)
    setHasChanges(true)
  }

  const formatLastSaved = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-charcoal-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-foreground">
              {storyId ? 'Story Notes' : 'Scratchpad'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isSaving ? (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </span>
            ) : hasChanges ? (
              <span className="text-gold">Unsaved changes</span>
            ) : lastSaved ? (
              <span>Saved {formatLastSaved(lastSaved)}</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Notes Editor */}
      <div className="flex-1 p-3">
        <textarea
          value={notes}
          onChange={handleChange}
          placeholder={storyId 
            ? "Jot down ideas, plot points, character notes, or anything you want to remember about this story..."
            : "Quick notes and ideas. These will persist even when you close the browser."}
          className={cn(
            'w-full h-full resize-none bg-charcoal-800 border border-charcoal-700 rounded-lg p-3',
            'text-sm text-foreground placeholder:text-muted-foreground/50',
            'focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20',
            'transition-colors'
          )}
        />
      </div>

      {/* Tips */}
      <div className="p-3 border-t border-charcoal-700">
        <p className="text-xs text-muted-foreground">
          💡 Notes are saved automatically to your browser. 
          {storyId && ' These notes are specific to this story.'}
        </p>
      </div>
    </div>
  )
}
