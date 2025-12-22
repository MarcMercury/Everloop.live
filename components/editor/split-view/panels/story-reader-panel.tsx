'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, BookOpen, User, ChevronRight, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface CanonStory {
  id: string
  title: string
  slug: string
  summary: string | null
  word_count: number
  author: {
    username: string
    display_name: string | null
  } | null
  canon_status: string
  scope: string
}

export function StoryReaderPanel() {
  const [stories, setStories] = useState<CanonStory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStory, setSelectedStory] = useState<CanonStory | null>(null)
  const [storyContent, setStoryContent] = useState<string | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/stories/canon')
      if (!response.ok) throw new Error('Failed to load stories')
      const data = await response.json()
      setStories(data.stories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stories')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStoryContent = async (slug: string) => {
    setLoadingContent(true)
    try {
      const response = await fetch(`/api/stories/${slug}/content`)
      if (!response.ok) throw new Error('Failed to load story content')
      const data = await response.json()
      setStoryContent(data.content_text || 'No content available.')
    } catch (err) {
      setStoryContent('Failed to load story content.')
    } finally {
      setLoadingContent(false)
    }
  }

  const handleSelectStory = (story: CanonStory) => {
    setSelectedStory(story)
    loadStoryContent(story.slug)
  }

  const filteredStories = stories.filter(story => 
    story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (story.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (story.author?.username.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>{error}</p>
        <button 
          onClick={loadStories}
          className="mt-2 text-gold hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  // Story Reader View
  if (selectedStory) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-3 border-b border-charcoal-700">
          <button
            onClick={() => {
              setSelectedStory(null)
              setStoryContent(null)
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to list
          </button>

          <h3 className="font-serif text-lg text-foreground">{selectedStory.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            {selectedStory.author && (
              <span className="text-xs text-muted-foreground">
                by {selectedStory.author.display_name || selectedStory.author.username}
              </span>
            )}
            <Badge variant="outline" className="text-xs capitalize">
              {selectedStory.scope}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loadingContent ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-5 h-5 animate-spin text-gold" />
            </div>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {storyContent}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-charcoal-700">
          <Link
            href={`/stories/${selectedStory.slug}`}
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-md 
                       bg-gold/10 text-gold text-sm hover:bg-gold/20 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open in new tab
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-charcoal-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search canon stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-charcoal-800 border-charcoal-700"
          />
        </div>
      </div>

      {/* Story List */}
      <div className="flex-1 overflow-auto">
        {filteredStories.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {stories.length === 0 
              ? 'No canon stories available yet.'
              : 'No stories match your search.'}
          </div>
        ) : (
          <div className="divide-y divide-charcoal-700">
            {filteredStories.map(story => (
              <button
                key={story.id}
                onClick={() => handleSelectStory(story)}
                className="w-full p-3 text-left hover:bg-charcoal-700/50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold" />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{story.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {story.author && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {story.author.display_name || story.author.username}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {story.word_count} words
                      </span>
                    </div>
                    {story.summary && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {story.summary}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
