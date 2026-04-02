'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, User, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookStory {
  id: string
  title: string
  slug: string
  content_text: string | null
  word_count: number | null
  created_at: string
  author: {
    username: string
    display_name: string | null
  } | null
}

// Deterministic color palette for book spines based on story id
const SPINE_COLORS = [
  { bg: 'from-amber-900 to-amber-800', spine: 'bg-amber-950', text: 'text-amber-100' },
  { bg: 'from-emerald-900 to-emerald-800', spine: 'bg-emerald-950', text: 'text-emerald-100' },
  { bg: 'from-red-900 to-red-800', spine: 'bg-red-950', text: 'text-red-100' },
  { bg: 'from-blue-900 to-blue-800', spine: 'bg-blue-950', text: 'text-blue-100' },
  { bg: 'from-purple-900 to-purple-800', spine: 'bg-purple-950', text: 'text-purple-100' },
  { bg: 'from-teal-800 to-teal-700', spine: 'bg-teal-950', text: 'text-teal-100' },
  { bg: 'from-rose-900 to-rose-800', spine: 'bg-rose-950', text: 'text-rose-100' },
  { bg: 'from-indigo-900 to-indigo-800', spine: 'bg-indigo-950', text: 'text-indigo-100' },
  { bg: 'from-orange-900 to-orange-800', spine: 'bg-orange-950', text: 'text-orange-100' },
  { bg: 'from-cyan-900 to-cyan-800', spine: 'bg-cyan-950', text: 'text-cyan-100' },
]

// Deterministic "random" values per book for tilt/position variety
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

function getBookStyle(id: string, index: number) {
  const hash = hashCode(id)
  const colorIndex = hash % SPINE_COLORS.length
  const colors = SPINE_COLORS[colorIndex]

  // Determine variation type based on hash
  const variationType = hash % 7

  let tilt = 0
  let isLeaningLeft = false
  let isLeaningRight = false
  let isLayingFlat = false
  let heightClass = 'h-[220px]'
  let widthClass = 'w-[42px]'

  switch (variationType) {
    case 0: // Straight tall
      heightClass = 'h-[230px]'
      widthClass = 'w-[38px]'
      break
    case 1: // Slightly tilted left
      tilt = -3
      isLeaningLeft = true
      heightClass = 'h-[210px]'
      widthClass = 'w-[44px]'
      break
    case 2: // Slightly tilted right
      tilt = 4
      isLeaningRight = true
      heightClass = 'h-[225px]'
      widthClass = 'w-[40px]'
      break
    case 3: // Laying flat on top
      isLayingFlat = true
      break
    case 4: // Thick straight
      heightClass = 'h-[215px]'
      widthClass = 'w-[52px]'
      break
    case 5: // Skinny tilted
      tilt = -2
      isLeaningLeft = true
      heightClass = 'h-[235px]'
      widthClass = 'w-[34px]'
      break
    case 6: // Medium tilted right
      tilt = 3
      isLeaningRight = true
      heightClass = 'h-[220px]'
      widthClass = 'w-[46px]'
      break
  }

  return { colors, tilt, isLeaningLeft, isLeaningRight, isLayingFlat, heightClass, widthClass }
}

function getSnippet(contentText?: string | null): string {
  if (!contentText) return 'A story awaiting its reader...'
  const words = contentText.split(/\s+/).filter(Boolean)
  const first = words.slice(0, 30).join(' ')
  return words.length > 30 ? `${first}...` : first
}

function BookOnShelf({
  story,
  index,
  selectedId,
  onSelect,
}: {
  story: BookStory
  index: number
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const router = useRouter()
  const style = getBookStyle(story.id, index)
  const isSelected = selectedId === story.id
  const authorName = story.author?.display_name || story.author?.username || 'Anonymous'
  const snippet = getSnippet(story.content_text)

  const handleClick = useCallback(() => {
    if (isSelected) {
      // Second click — navigate to story
      router.push(`/stories/${story.slug}`)
    } else {
      onSelect(story.id)
    }
  }, [isSelected, story.slug, story.id, router, onSelect])

  // Laying flat book (sits on top of other books)
  if (style.isLayingFlat && !isSelected) {
    return (
      <button
        onClick={handleClick}
        className="book-on-shelf book-flat relative flex-shrink-0 cursor-pointer group"
        aria-label={`Select ${story.title}`}
      >
        {/* Flat book */}
        <div
          className={cn(
            'relative w-[140px] h-[38px] rounded-sm shadow-lg',
            'bg-gradient-to-r', style.colors.bg,
            'border border-white/10',
            'transition-all duration-300',
            'group-hover:shadow-gold/20 group-hover:brightness-110',
          )}
        >
          {/* Title on flat spine */}
          <div className={cn('absolute inset-0 flex items-center justify-center px-2', style.colors.text)}>
            <span className="text-[9px] font-serif truncate tracking-wider opacity-80">
              {story.title}
            </span>
          </div>
          {/* Gold edge lines */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        </div>
      </button>
    )
  }

  // Selected state — book pulled off shelf, showing cover
  if (isSelected) {
    return (
      <div className="book-selected-overlay" onClick={() => onSelect(null)}>
        <div
          className="book-cover-reveal"
          onClick={(e) => {
            e.stopPropagation()
            handleClick()
          }}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelect(null)
            }}
            className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-charcoal-900 border border-gold/30 flex items-center justify-center text-parchment-muted hover:text-parchment hover:border-gold/60 transition-colors"
            aria-label="Put book back"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Book cover */}
          <div
            className={cn(
              'relative w-[260px] sm:w-[300px] rounded-r-md rounded-l-sm overflow-hidden',
              'bg-gradient-to-br', style.colors.bg,
              'border border-white/10',
              'shadow-2xl shadow-black/60',
              'aspect-[2/3]',
            )}
          >
            {/* Spine edge */}
            <div className={cn('absolute left-0 top-0 bottom-0 w-[14px]', style.colors.spine)}>
              <div className="absolute inset-y-0 right-0 w-[1px] bg-white/10" />
            </div>

            {/* Cover content */}
            <div className="absolute inset-0 pl-[24px] pr-4 py-8 flex flex-col justify-between">
              {/* Decorative top line */}
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-4">
                {/* Title */}
                <h3 className={cn('text-2xl sm:text-3xl font-serif leading-tight', style.colors.text)}>
                  {story.title}
                </h3>

                {/* Ornamental divider */}
                <div className="flex items-center gap-2 opacity-50">
                  <div className="w-8 h-[1px] bg-gold/50" />
                  <span className="text-gold/60 text-xs">◆</span>
                  <div className="w-8 h-[1px] bg-gold/50" />
                </div>

                {/* Author */}
                <p className={cn('text-sm opacity-70 font-serif italic', style.colors.text)}>
                  by {authorName}
                </p>

                {/* Snippet */}
                <p className={cn('text-xs opacity-50 line-clamp-3 leading-relaxed max-w-[200px]', style.colors.text)}>
                  {snippet}
                </p>
              </div>

              {/* Bottom info */}
              <div className="flex items-center justify-between text-[10px] opacity-40">
                <span className={style.colors.text}>
                  {story.word_count ? `${story.word_count.toLocaleString()} words` : ''}
                </span>
                <span className={cn('font-serif', style.colors.text)}>Everloop Canon</span>
              </div>

              {/* Decorative bottom line */}
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            </div>

            {/* Click to read prompt */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent py-4 flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4 text-gold" />
              <span className="text-sm text-gold font-medium">Click to Read</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default upright spine on shelf
  return (
    <button
      onClick={handleClick}
      className="book-on-shelf relative flex-shrink-0 cursor-pointer group"
      style={{
        transform: `rotate(${style.tilt}deg)`,
        transformOrigin: 'bottom center',
      }}
      aria-label={`Select ${story.title}`}
    >
      <div
        className={cn(
          'relative rounded-sm shadow-lg',
          style.heightClass, style.widthClass,
          'bg-gradient-to-b', style.colors.bg,
          'border border-white/10',
          'transition-all duration-300',
          'group-hover:-translate-y-3 group-hover:shadow-gold/20 group-hover:brightness-110',
        )}
      >
        {/* Top edge */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold/20 to-transparent rounded-t-sm" />
        {/* Bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/30 rounded-b-sm" />

        {/* Spine title — rotated vertically */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <span
            className={cn(
              'whitespace-nowrap text-[10px] font-serif tracking-[0.15em] rotate-180',
              style.colors.text,
              'opacity-80 group-hover:opacity-100 transition-opacity',
            )}
            style={{ writingMode: 'vertical-rl' }}
          >
            {story.title.length > 28 ? story.title.slice(0, 26) + '…' : story.title}
          </span>
        </div>

        {/* Gold accent lines on spine */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gold/30" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gold/30" />

        {/* 3D depth effect on right edge */}
        <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-black/20" />
      </div>
    </button>
  )
}

function ShelfRow({
  stories,
  selectedId,
  onSelect,
  startIndex,
}: {
  stories: BookStory[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  startIndex: number
}) {
  // Check if any flat books in this row
  const flatBooks = stories.filter((s, i) => getBookStyle(s.id, startIndex + i).isLayingFlat)
  const uprightBooks = stories.filter((s, i) => !getBookStyle(s.id, startIndex + i).isLayingFlat)

  return (
    <div className="bookshelf-row relative">
      {/* Flat books laid on top */}
      {flatBooks.length > 0 && (
        <div className="absolute -top-[42px] left-4 flex gap-1 z-10">
          {flatBooks.map((story, i) => (
            <BookOnShelf
              key={story.id}
              story={story}
              index={startIndex + stories.indexOf(story)}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}

      {/* Upright books */}
      <div className="shelf-books flex items-end gap-[2px] px-4 pb-0 min-h-[240px] relative z-[1]">
        {uprightBooks.map((story, i) => (
          <BookOnShelf
            key={story.id}
            story={story}
            index={startIndex + stories.indexOf(story)}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Wooden shelf */}
      <div className="shelf-plank relative h-[16px] rounded-b-sm z-[2]">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/90 via-amber-800/80 to-amber-950/90 rounded-b-sm" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-700/60" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black/40" />
        {/* Shadow under shelf */}
        <div className="absolute -bottom-3 left-2 right-2 h-3 bg-gradient-to-b from-black/30 to-transparent rounded-full blur-sm" />
      </div>
    </div>
  )
}

interface BookshelfProps {
  stories: BookStory[]
}

export function Bookshelf({ stories }: BookshelfProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Split stories into shelf rows (6-8 per shelf)
  const shelves: BookStory[][] = []
  const perShelf = 7
  for (let i = 0; i < stories.length; i += perShelf) {
    shelves.push(stories.slice(i, i + perShelf))
  }

  return (
    <div className="bookshelf-container relative">
      {/* Bookcase frame */}
      <div className="relative max-w-4xl mx-auto">
        {/* Bookcase back panel */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-amber-900/10 to-amber-950/20 rounded-lg border border-amber-900/20" />

        {/* Shelves */}
        <div className="relative py-12 space-y-14">
          {shelves.map((shelfStories, shelfIndex) => (
            <ShelfRow
              key={shelfIndex}
              stories={shelfStories}
              selectedId={selectedId}
              onSelect={setSelectedId}
              startIndex={shelfIndex * perShelf}
            />
          ))}
        </div>

        {/* Bookcase side shadows */}
        <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-3 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Selected book overlay portal */}
      {selectedId && (
        <BookOnShelf
          story={stories.find(s => s.id === selectedId)!}
          index={stories.findIndex(s => s.id === selectedId)}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      )}
    </div>
  )
}

export function BookshelfSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-14">
      {[0, 1].map((row) => (
        <div key={row} className="relative">
          <div className="flex items-end gap-[2px] px-4 pb-0 min-h-[240px]">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-[220px] w-[42px] rounded-sm bg-teal-rich/50 animate-pulse flex-shrink-0"
              />
            ))}
          </div>
          <div className="h-[16px] bg-amber-900/30 rounded-b-sm" />
        </div>
      ))}
    </div>
  )
}
