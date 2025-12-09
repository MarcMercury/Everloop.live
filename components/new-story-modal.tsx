'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PenLine, BookOpen, ScrollText, Sparkles, Loader2 } from 'lucide-react'
import { createDraftStory } from '@/lib/actions/story'
import type { StoryScope } from '@/types/database'

interface ScopeOption {
  scope: StoryScope
  title: string
  subtitle: string
  description: string
  icon: React.ReactNode
}

const SCOPE_OPTIONS: ScopeOption[] = [
  {
    scope: 'tome',
    title: 'The Tome',
    subtitle: 'A multi-chapter saga',
    description: 'Heavy lore. Epic scope. The kind of story that reshapes the world.',
    icon: <BookOpen className="w-8 h-8" />,
  },
  {
    scope: 'tale',
    title: 'The Tale',
    subtitle: 'A standalone narrative',
    description: 'A complete story with beginning, middle, and end. Most common choice.',
    icon: <ScrollText className="w-8 h-8" />,
  },
  {
    scope: 'scene',
    title: 'The Scene',
    subtitle: 'A fleeting moment',
    description: 'A vignette, conversation, or atmospheric description. Quick and evocative.',
    icon: <Sparkles className="w-8 h-8" />,
  },
]

interface NewStoryModalProps {
  children: React.ReactNode
}

export function NewStoryModal({ children }: NewStoryModalProps) {
  const [open, setOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedScope, setSelectedScope] = useState<StoryScope | null>(null)
  const router = useRouter()

  async function handleScopeSelect(scope: StoryScope) {
    setSelectedScope(scope)
    setIsCreating(true)

    try {
      const result = await createDraftStory(scope)
      
      if (result.success && result.storyId) {
        setOpen(false)
        router.push(`/write/${result.storyId}`)
      } else {
        console.error('Failed to create story:', result.error)
        setIsCreating(false)
        setSelectedScope(null)
      }
    } catch (error) {
      console.error('Error creating story:', error)
      setIsCreating(false)
      setSelectedScope(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl bg-teal-deep border-gold/20">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-2xl font-serif text-parchment">
            What are you weaving today?
          </DialogTitle>
          <DialogDescription className="text-parchment-muted">
            Choose the scope of your story. This helps the Canon Keeper understand your intent.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {SCOPE_OPTIONS.map((option) => (
            <button
              key={option.scope}
              onClick={() => handleScopeSelect(option.scope)}
              disabled={isCreating}
              className={`
                group relative flex items-start gap-4 p-4 rounded-lg text-left
                bg-teal-rich/50 border border-gold/10 
                hover:border-gold/30 hover:bg-teal-rich/80
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                ${selectedScope === option.scope ? 'border-gold/50 bg-gold/10' : ''}
              `}
            >
              {/* Icon */}
              <div className={`
                flex-shrink-0 w-14 h-14 rounded-lg 
                bg-gradient-to-br from-gold/20 to-gold/5
                flex items-center justify-center
                text-gold group-hover:text-gold/80
                transition-colors
                ${selectedScope === option.scope ? 'from-gold/30 to-gold/10' : ''}
              `}>
                {isCreating && selectedScope === option.scope ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  option.icon
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg text-parchment group-hover:text-gold transition-colors">
                    {option.title}
                  </h3>
                  <span className="text-xs text-parchment-muted uppercase tracking-wider">
                    {option.subtitle}
                  </span>
                </div>
                <p className="mt-1 text-sm text-parchment-muted leading-relaxed">
                  {option.description}
                </p>
              </div>

              {/* Hover Arrow */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <PenLine className="w-5 h-5 text-gold" />
              </div>
            </button>
          ))}
        </div>

        <div className="text-center pt-2 border-t border-gold/10">
          <p className="text-xs text-parchment-muted">
            You can always change the scope later in the editor.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
