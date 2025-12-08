'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { refineNotesSimple } from '@/lib/actions/refine'
import { X, Wand2, Loader2, Copy, Check, ArrowRight } from 'lucide-react'

interface StreamOfConsciousnessModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (prose: string) => void
}

export function StreamOfConsciousnessModal({
  isOpen,
  onClose,
  onInsert,
}: StreamOfConsciousnessModalProps) {
  const [notes, setNotes] = useState('')
  const [refinedProse, setRefinedProse] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleRefine = async () => {
    if (!notes.trim()) return
    
    setIsRefining(true)
    setError(null)
    setRefinedProse('')
    
    try {
      const result = await refineNotesSimple(notes)
      
      if (result.success && result.prose) {
        setRefinedProse(result.prose)
      } else {
        setError(result.error || 'Failed to refine notes')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsRefining(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(refinedProse)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInsert = () => {
    onInsert(refinedProse)
    // Reset state
    setNotes('')
    setRefinedProse('')
    onClose()
  }

  const handleClose = () => {
    setNotes('')
    setRefinedProse('')
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-charcoal border border-charcoal-700 rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-charcoal-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <Wand2 className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-foreground">Stream of Consciousness</h2>
              <p className="text-sm text-muted-foreground">Transform rough ideas into polished prose</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-md hover:bg-charcoal-700 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Input Area */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Rough Notes / Brain Dump
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Type your loose ideas, fragments, bullet points, or stream-of-consciousness thoughts here..."
              className="w-full h-32 px-4 py-3 rounded-lg bg-navy/50 border border-charcoal-700 
                         text-foreground placeholder:text-muted-foreground/50
                         focus:border-gold/50 focus:ring-1 focus:ring-gold/20 focus:outline-none
                         resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {notes.length} characters
              </span>
              <Button
                onClick={handleRefine}
                disabled={isRefining || notes.trim().length < 10}
                className="bg-gold hover:bg-gold/90 text-charcoal"
              >
                {isRefining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Refining...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Refine
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}
          
          {/* Output Area */}
          {refinedProse && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Refined Prose
              </label>
              <div className="relative">
                <div className="w-full min-h-32 max-h-64 overflow-y-auto px-4 py-3 rounded-lg 
                               bg-navy/30 border border-gold/30 text-foreground/90 leading-relaxed">
                  {refinedProse}
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded bg-charcoal-700/80 hover:bg-charcoal-700 text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end mt-3">
                <Button
                  onClick={handleInsert}
                  className="bg-gold hover:bg-gold/90 text-charcoal"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Insert into Editor
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
