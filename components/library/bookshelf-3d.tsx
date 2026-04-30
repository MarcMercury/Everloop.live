'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, BookOpen, Sparkles } from 'lucide-react'

/* ───────── types ───────── */
interface Story {
  id: string
  title: string
  slug: string
  content_text: string | null
  word_count: number | null
  created_at: string
  author: { username: string; display_name: string | null } | null
}

interface LoreBook {
  id: string
  title: string
  subtitle: string
  slug: string
  href: string
  description: string
  external?: boolean
  /** Optional cover image path (under /public). When set, the overlay shows this instead of the gold placeholder. */
  coverImage?: string
}

/* ───────── hardcoded lore books ───────── */
const LORE_BOOKS: LoreBook[] = [
  {
    id: 'lore-narrative-history',
    title: 'The Everloop',
    subtitle: 'Narrative History',
    slug: 'narrative-history',
    href: '/stories/narrative-history',
    description: 'The foundational history of the world — from the Drift to the Pattern, from the First Architects to the unraveling.',
  },
  {
    id: 'lore-four-loops-of-curiosities',
    title: 'Four Loops',
    subtitle: 'of Curiosities',
    slug: 'four-loops-of-curiosities',
    href: '/books/four-loops-of-curiosities.pdf',
    description: 'A curated collection of oddities, marvels, and unexplained phenomena gathered across the four great loops of the world.',
    external: true,
    coverImage: '/covers/four-loops-of-curiosities.png',
  },
  {
    id: 'lore-known-wonders',
    title: 'Known Wonders',
    subtitle: 'of the Everloop',
    slug: 'known-wonders-of-the-everloop',
    href: '/books/known-wonders-of-the-everloop.pdf',
    description: 'A traveler’s register of the named wonders that still endure — each a thread the Pattern refuses to let go.',
    external: true,
    coverImage: '/covers/known-wonders-of-the-everloop.png',
  },
]

/* ───────── cover map ───────── */
const COVER_IMAGES: Record<string, string> = {
  'the-bell-tree-and-the-broken-world': '/covers/story1-01.png',
  'the-prince-and-the-drowning-city': '/covers/story2-01.png',
  'the-ballad-of-rook-and-myx': '/covers/story3-01.png',
  'in-service-of-the-veykar': '/covers/story4-01.png',
}

/* ───────── palette for book spines ───────── */
interface BookStyle {
  bg: string          // gradient for spine
  text: string        // spine text color
  accent: string      // decorative band color
  height: number      // px height (200-280)
  width: number       // px width (28-55)
  tilt: number        // deg of lean (-5 to 5)
  fontStyle: 'serif' | 'sans'
  hasGoldEmboss: boolean
  pattern: 'leather' | 'cloth' | 'linen' | 'velvet'
}

/* seeded RNG for deterministic decoration */
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const SPINE_PALETTES = [
  // Rich leathers and cloths
  { bg: 'linear-gradient(180deg, #5c1a1a 0%, #3d0f0f 25%, #4a1515 50%, #3d0f0f 75%, #2d0a0a 100%)', text: '#e8d5a3', accent: '#c9a84c', pattern: 'leather' as const },
  { bg: 'linear-gradient(180deg, #1a2d4a 0%, #0f1e33 25%, #152840 50%, #0f1e33 75%, #0a1625 100%)', text: '#c9d4e8', accent: '#8fa8c8', pattern: 'cloth' as const },
  { bg: 'linear-gradient(180deg, #2d1a0a 0%, #1e0f04 25%, #261508 50%, #1e0f04 75%, #150b02 100%)', text: '#d4b882', accent: '#c9a84c', pattern: 'leather' as const },
  { bg: 'linear-gradient(180deg, #1a3d2d 0%, #0f2a1e 25%, #153525 50%, #0f2a1e 75%, #0a1e15 100%)', text: '#c9e8d5', accent: '#7cb89a', pattern: 'velvet' as const },
  { bg: 'linear-gradient(180deg, #3d1a3d 0%, #2a0f2a 25%, #331533 50%, #2a0f2a 75%, #1e0a1e 100%)', text: '#e0c9e0', accent: '#b87cb8', pattern: 'cloth' as const },
  { bg: 'linear-gradient(180deg, #4a3d1a 0%, #332a0f 25%, #403515 50%, #332a0f 75%, #251e0a 100%)', text: '#e8dcc4', accent: '#c9a84c', pattern: 'linen' as const },
  { bg: 'linear-gradient(180deg, #1a1a3d 0%, #0f0f2a 25%, #151533 50%, #0f0f2a 75%, #0a0a1e 100%)', text: '#c9c9e8', accent: '#8888c8', pattern: 'cloth' as const },
  { bg: 'linear-gradient(180deg, #3d2a1a 0%, #2a1a0f 25%, #332215 50%, #2a1a0f 75%, #1e120a 100%)', text: '#e8d2b8', accent: '#c99a5c', pattern: 'leather' as const },
  { bg: 'linear-gradient(180deg, #0d2626 0%, #081a1a 25%, #0a2020 50%, #081a1a 75%, #051212 100%)', text: '#b8d4d4', accent: '#5ca8a8', pattern: 'velvet' as const },
  { bg: 'linear-gradient(180deg, #3d1a2a 0%, #2a0f1a 25%, #331522 50%, #2a0f1a 75%, #1e0a12 100%)', text: '#e8c9d5', accent: '#c87ca0', pattern: 'cloth' as const },
  { bg: 'linear-gradient(180deg, #2a2a1a 0%, #1e1e0f 25%, #252515 50%, #1e1e0f 75%, #15150a 100%)', text: '#d4d4b8', accent: '#a8a860', pattern: 'linen' as const },
  { bg: 'linear-gradient(180deg, #1a2a2a 0%, #0f1e1e 25%, #152525 50%, #0f1e1e 75%, #0a1515 100%)', text: '#c4dede', accent: '#6cb0b0', pattern: 'cloth' as const },
]

const FILLER_TITLES = [
  'The Veykar Codex', 'Songs of the Ashbloom', 'Beneath the Shattered Moon',
  'Chronicle of Tides', 'The Warden\'s Oath', 'Paths of the Thornwood',
  'A Treatise on Glyphs', 'Embers of Ythara', 'The Hollow Throne',
  'Masks of the Wanderer', 'Roots and Ruin', 'The Silent Archive',
  'Fables of the Dusklands', 'Letters from Ironspire', 'Blood of the Leyline',
  'The Cartographer\'s Dream', 'On the Nature of Loops', 'Songs Unsung',
  'The Binding Stone', 'Whispers of the Canon', 'The Lamplighter\'s Log',
  'Rites of Passage', 'The Everbloom Almanac', 'Dust and Divinity',
  'The Second Eclipse', 'Hymns to a Lost World', 'The Coral Manuscripts',
  'Voices in the Deep', 'A History of Echoes', 'The Gilded Moth',
  'Riddles of the Reach', 'The Shepherd\'s War', 'Storm and Silk',
  'The Fifth Garden', 'Dreamwalker\'s Journal', 'Bones of the Old Way',
]

function generateBookStyle(seed: number, isReal: boolean): BookStyle {
  const rng = seededRandom(seed)
  const palette = SPINE_PALETTES[Math.floor(rng() * SPINE_PALETTES.length)]

  return {
    bg: palette.bg,
    text: palette.text,
    accent: palette.accent,
    height: isReal ? 240 + Math.floor(rng() * 40) : 200 + Math.floor(rng() * 80),
    width: isReal ? 38 + Math.floor(rng() * 14) : 26 + Math.floor(rng() * 28),
    tilt: (rng() - 0.5) * 6,
    fontStyle: rng() > 0.5 ? 'serif' : 'sans',
    hasGoldEmboss: rng() > 0.4,
    pattern: palette.pattern,
  }
}

/* ───────── texture overlay for patterns ───────── */
function patternCSS(pattern: BookStyle['pattern']): string {
  switch (pattern) {
    case 'leather':
      return `repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(255,255,255,0.015) 2px,
        rgba(255,255,255,0.015) 4px
      ), repeating-linear-gradient(
        90deg,
        transparent,
        transparent 3px,
        rgba(0,0,0,0.06) 3px,
        rgba(0,0,0,0.06) 5px
      )`
    case 'cloth':
      return `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 1px,
        rgba(255,255,255,0.03) 1px,
        rgba(255,255,255,0.03) 2px
      ), repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 1px,
        rgba(0,0,0,0.04) 1px,
        rgba(0,0,0,0.04) 2px
      )`
    case 'linen':
      return `repeating-linear-gradient(
        0deg,
        transparent,
        transparent 1px,
        rgba(255,255,255,0.04) 1px,
        rgba(255,255,255,0.04) 2px
      )`
    case 'velvet':
      return `linear-gradient(
        180deg,
        rgba(255,255,255,0.06) 0%,
        transparent 15%,
        transparent 85%,
        rgba(0,0,0,0.08) 100%
      )`
  }
}

/* ───────── single book spine ───────── */
function BookSpine({
  title,
  style,
  isReal,
  onClick,
}: {
  title: string
  style: BookStyle
  isReal: boolean
  onClick?: () => void
}) {
  // Truncate long titles for spine
  const spineTitle = title.length > 30 ? title.slice(0, 28) + '…' : title

  return (
    <div
      className={`relative flex-shrink-0 group transition-all duration-300 ${
        isReal ? 'cursor-pointer hover:-translate-y-3 hover:z-10' : ''
      }`}
      style={{
        width: style.width,
        height: style.height,
        transform: `rotate(${style.tilt}deg)`,
        transformOrigin: 'bottom center',
      }}
      onClick={isReal ? onClick : undefined}
    >
      {/* Main spine body */}
      <div
        className="absolute inset-0 rounded-[2px] overflow-hidden"
        style={{
          background: style.bg,
          boxShadow: `
            inset 0 0 0 1px rgba(255,255,255,0.05),
            inset -2px 0 4px rgba(0,0,0,0.4),
            inset 2px 0 4px rgba(0,0,0,0.2),
            2px 0 4px rgba(0,0,0,0.5),
            -1px 0 3px rgba(0,0,0,0.3),
            0 2px 6px rgba(0,0,0,0.4)
          `,
        }}
      >
        {/* Texture overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: patternCSS(style.pattern) }}
        />

        {/* Left edge highlight (spine ridge) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, rgba(0,0,0,0.1) 100%)',
          }}
        />

        {/* Right edge shadow */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[3px]"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.3) 100%)',
          }}
        />

        {/* Top decorative band */}
        {style.hasGoldEmboss && (
          <>
            <div
              className="absolute top-3 left-1 right-1 h-[1px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${style.accent}88, transparent)`,
              }}
            />
            <div
              className="absolute top-5 left-1 right-1 h-[1px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${style.accent}55, transparent)`,
              }}
            />
          </>
        )}

        {/* Title text - vertical */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          <span
            className={`text-center leading-tight tracking-wide px-1 ${
              style.fontStyle === 'serif' ? 'font-serif' : 'font-sans'
            }`}
            style={{
              color: style.text,
              fontSize: style.width < 32 ? '8px' : style.width < 40 ? '9px' : '10px',
              textShadow: style.hasGoldEmboss
                ? `0 0 2px rgba(0,0,0,0.8), 0 1px 1px rgba(0,0,0,0.6)`
                : `0 1px 2px rgba(0,0,0,0.7)`,
              letterSpacing: '0.08em',
              fontWeight: style.hasGoldEmboss ? 600 : 400,
              transform: 'rotate(180deg)',
              maxHeight: style.height - 40,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {spineTitle}
          </span>
        </div>

        {/* Bottom decorative band */}
        {style.hasGoldEmboss && (
          <>
            <div
              className="absolute bottom-5 left-1 right-1 h-[1px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${style.accent}55, transparent)`,
              }}
            />
            <div
              className="absolute bottom-3 left-1 right-1 h-[1px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${style.accent}88, transparent)`,
              }}
            />
          </>
        )}

        {/* Center emblem for wider books */}
        {style.width > 40 && style.hasGoldEmboss && (
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: '18%',
              width: Math.min(style.width - 12, 24),
              height: Math.min(style.width - 12, 24),
              border: `1px solid ${style.accent}44`,
              borderRadius: '50%',
            }}
          />
        )}

        {/* Hover glow for real books */}
        {isReal && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2px]"
            style={{
              background: 'linear-gradient(180deg, rgba(212,168,75,0.08) 0%, transparent 30%, transparent 70%, rgba(212,168,75,0.08) 100%)',
              boxShadow: '0 0 12px rgba(212,168,75,0.15)',
            }}
          />
        )}
      </div>
    </div>
  )
}

/* ───────── wooden shelf ───────── */
function WoodShelf() {
  return (
    <div className="relative w-full" style={{ height: 22 }}>
      {/* Shelf front face */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: 18,
          background: `linear-gradient(180deg, 
            #5c3d1e 0%, 
            #7a5230 15%, 
            #8b6335 30%,
            #7a5230 50%, 
            #6b4728 70%,
            #5c3d1e 85%,
            #4a3118 100%
          )`,
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.12),
            inset 0 -1px 0 rgba(0,0,0,0.3),
            0 4px 12px rgba(0,0,0,0.6),
            0 2px 4px rgba(0,0,0,0.4)
          `,
          borderRadius: '0 0 2px 2px',
        }}
      >
        {/* Wood grain texture */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 40px,
                rgba(0,0,0,0.04) 40px,
                rgba(0,0,0,0.04) 42px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 97px,
                rgba(255,255,255,0.03) 97px,
                rgba(255,255,255,0.03) 100px
              )
            `,
          }}
        />

        {/* Front lip highlight */}
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
          }}
        />
      </div>

      {/* Shelf bottom shadow */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: 8,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
        }}
      />
    </div>
  )
}

/* ───────── build a full row of books ───────── */
function useShelfBooks(
  stories: Story[],
  shelfIndex: number,
  storiesPerShelf: number[],
) {
  return useMemo(() => {
    const books: {
      id: string
      title: string
      slug: string
      isReal: boolean
      isLore?: boolean
      style: BookStyle
      story?: Story
      loreBook?: LoreBook
    }[] = []

    // Determine which real stories go on this shelf
    const startIdx = storiesPerShelf
      .slice(0, shelfIndex)
      .reduce((a, b) => a + b, 0)
    const realOnShelf = stories.slice(startIdx, startIdx + storiesPerShelf[shelfIndex])

    // Seed for this shelf
    const baseSeed = (shelfIndex + 1) * 7919

    // Generate filler count for this shelf
    const rng = seededRandom(baseSeed)
    const totalFillerCount = 8 + Math.floor(rng() * 6) // 8-13 fillers per shelf

    // Add lore books on the first shelf
    const loreOnShelf = shelfIndex === 0 ? LORE_BOOKS : []

    // Distribute real books among fillers
    const totalSlots = totalFillerCount + realOnShelf.length + loreOnShelf.length
    const realPositions = new Set<number>()
    const lorePositions = new Set<number>()
    const posRng = seededRandom(baseSeed + 31)

    // Place lore books first (near the center for prominence)
    for (const lb of loreOnShelf) {
      const centerArea = Math.floor(totalSlots * 0.4) + Math.floor(posRng() * Math.floor(totalSlots * 0.2))
      let pos = centerArea
      while (lorePositions.has(pos) || realPositions.has(pos)) pos++
      lorePositions.add(pos)
    }

    for (const story of realOnShelf) {
      let pos: number
      do {
        pos = Math.floor(posRng() * totalSlots)
      } while (realPositions.has(pos) || lorePositions.has(pos))
      realPositions.add(pos)
    }

    const realArray = [...realOnShelf]
    const loreArray = [...loreOnShelf]
    let fillerIdx = 0

    for (let i = 0; i < totalSlots; i++) {
      if (lorePositions.has(i) && loreArray.length > 0) {
        const lb = loreArray.shift()!
        books.push({
          id: lb.id,
          title: lb.title,
          slug: lb.slug,
          isReal: true,
          isLore: true,
          style: {
            bg: 'linear-gradient(180deg, #2a1f0a 0%, #1a1505 15%, #2a1f0a 35%, #c9a84c 38%, #2a1f0a 41%, #1a1505 60%, #c9a84c 63%, #2a1f0a 66%, #1a1505 85%, #2a1f0a 100%)',
            text: '#f0d060',
            accent: '#f0d060',
            height: 270,
            width: 48,
            tilt: 0,
            fontStyle: 'serif',
            hasGoldEmboss: true,
            pattern: 'leather',
          },
          loreBook: lb,
        })
      } else if (realPositions.has(i) && realArray.length > 0) {
        const story = realArray.shift()!
        const seed = hashStr(story.id)
        books.push({
          id: story.id,
          title: story.title,
          slug: story.slug,
          isReal: true,
          style: generateBookStyle(seed, true),
          story,
        })
      } else {
        const fIdx = (shelfIndex * 20 + fillerIdx) % FILLER_TITLES.length
        const seed = baseSeed + fillerIdx * 131
        books.push({
          id: `filler-${shelfIndex}-${fillerIdx}`,
          title: FILLER_TITLES[fIdx],
          slug: '',
          isReal: false,
          style: generateBookStyle(seed, false),
        })
        fillerIdx++
      }
    }
    return books
  }, [stories, shelfIndex, storiesPerShelf])
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/* ───────── selected book overlay ───────── */
function SelectedBookOverlay({
  story,
  onClose,
}: {
  story: Story
  onClose: () => void
}) {
  const coverSrc = COVER_IMAGES[story.slug]
  const wordCount = story.word_count
    ? story.word_count >= 1000
      ? `${(story.word_count / 1000).toFixed(1)}k words`
      : `${story.word_count} words`
    : null

  return (
    <div
      className="book-selected-overlay"
      onClick={onClose}
    >
      <div
        className="book-cover-reveal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 w-8 h-8 rounded-full bg-charcoal-800/80 border border-gold/30 
                     flex items-center justify-center text-parchment-muted hover:text-gold hover:border-gold/60 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Book cover with 3D effect — click to open story */}
        <Link
          href={`/stories/${story.slug}`}
          className="book-cover-3d relative cursor-pointer transition-transform duration-300 hover:-translate-y-1"
          aria-label={`Begin reading ${story.title}`}
        >
          {/* Spine edge */}
          <div
            className="absolute left-0 top-0 bottom-0 w-4"
            style={{
              background: 'linear-gradient(90deg, #3d2210 0%, #5c3d1e 40%, #4a3118 100%)',
              transform: 'perspective(600px) rotateY(-15deg)',
              transformOrigin: 'right center',
              borderRadius: '2px 0 0 2px',
              boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.3)',
              zIndex: 1,
            }}
          />

          {/* Cover image */}
          <div
            className="relative ml-3 rounded-r-sm overflow-hidden"
            style={{
              width: 280,
              height: 400,
              boxShadow: `
                4px 4px 20px rgba(0,0,0,0.6),
                -2px 0 8px rgba(0,0,0,0.3),
                inset 0 0 0 1px rgba(255,255,255,0.05)
              `,
            }}
          >
            {coverSrc ? (
              <Image
                src={coverSrc}
                alt={story.title}
                fill
                className="object-cover"
                sizes="280px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-charcoal-800 p-6">
                <span className="text-xl font-serif text-gold text-center leading-relaxed">
                  {story.title}
                </span>
              </div>
            )}

            {/* Page edges effect (right side) */}
            <div
              className="absolute top-1 right-0 bottom-1 w-[3px]"
              style={{
                background: `repeating-linear-gradient(
                  180deg,
                  #f5f0e8 0px,
                  #e8dcc4 1px,
                  #ddd2b8 2px
                )`,
                boxShadow: 'inset -1px 0 1px rgba(0,0,0,0.15)',
              }}
            />
          </div>
        </Link>

        {/* Book info */}
        <div className="mt-6 text-center max-w-xs">
          <h3 className="text-xl font-serif text-parchment mb-1">{story.title}</h3>
          {story.author && (
            <p className="text-sm text-parchment-muted">
              by {story.author.display_name || story.author.username}
            </p>
          )}
          {wordCount && (
            <p className="text-xs text-parchment-muted/60 mt-1">{wordCount}</p>
          )}

          <Link
            href={`/stories/${story.slug}`}
            className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-lg bg-gold/20 border border-gold/40
                       text-gold hover:bg-gold/30 hover:border-gold/60 transition-all text-sm font-medium"
          >
            <BookOpen className="w-4 h-4" />
            Begin Reading
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ───────── lore book cover (shared by overlay link wrappers) ───────── */
function LoreBookCover({ loreBook }: { loreBook: LoreBook }) {
  return (
    <>
      {/* Spine edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-4"
        style={{
          background: 'linear-gradient(90deg, #4a3118 0%, #6b4c2a 40%, #5c3d1e 100%)',
          transform: 'perspective(600px) rotateY(-15deg)',
          transformOrigin: 'right center',
          borderRadius: '2px 0 0 2px',
          boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.3)',
          zIndex: 1,
        }}
      />

      {/* Cover — image when provided, otherwise gold-themed stylized cover */}
      <div
        className="relative ml-3 rounded-r-sm overflow-hidden flex flex-col items-center justify-center"
        style={{
          width: 280,
          height: 400,
          background: loreBook.coverImage
            ? '#000'
            : 'linear-gradient(160deg, #1a1410 0%, #0d1f1f 30%, #0a1818 60%, #1a1410 100%)',
          boxShadow: `
            4px 4px 20px rgba(0,0,0,0.6),
            -2px 0 8px rgba(0,0,0,0.3),
            inset 0 0 0 1px rgba(212,168,75,0.15),
            inset 0 0 80px rgba(212,168,75,0.04)
          `,
        }}
      >
        {loreBook.coverImage ? (
          <Image
            src={loreBook.coverImage}
            alt={`${loreBook.title}: ${loreBook.subtitle}`}
            fill
            className="object-cover"
            sizes="280px"
            priority
          />
        ) : (
          <>
            <div
              className="absolute inset-3 rounded-sm"
              style={{
                border: '1px solid rgba(212,168,75,0.2)',
                boxShadow: 'inset 0 0 20px rgba(212,168,75,0.03)',
              }}
            />
            <div
              className="absolute inset-5 rounded-sm"
              style={{ border: '1px solid rgba(212,168,75,0.1)' }}
            />

            <Sparkles className="w-8 h-8 text-gold/50 mb-6" />

            <h3 className="text-2xl font-serif text-gold text-center px-8 leading-tight">
              {loreBook.title}
            </h3>
            <p className="text-sm font-serif text-gold/60 text-center mt-2 tracking-wider uppercase">
              {loreBook.subtitle}
            </p>

            <div className="mt-6 w-16 h-px bg-gold/30" />

            <p className="mt-6 text-xs text-parchment-muted/50 tracking-[0.15em] uppercase">
              Foundational Lore
            </p>
          </>
        )}

        {/* Page edges effect (right side) */}
        <div
          className="absolute top-1 right-0 bottom-1 w-[3px]"
          style={{
            background: `repeating-linear-gradient(
              180deg,
              #f5f0e8 0px,
              #e8dcc4 1px,
              #ddd2b8 2px
            )`,
            boxShadow: 'inset -1px 0 1px rgba(0,0,0,0.15)',
          }}
        />
      </div>
    </>
  )
}

/* ───────── lore book overlay ───────── */
function LoreBookOverlay({
  loreBook,
  onClose,
}: {
  loreBook: LoreBook
  onClose: () => void
}) {
  return (
    <div
      className="book-selected-overlay"
      onClick={onClose}
    >
      <div
        className="book-cover-reveal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 w-8 h-8 rounded-full bg-charcoal-800/80 border border-gold/30 
                     flex items-center justify-center text-parchment-muted hover:text-gold hover:border-gold/60 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Book cover with 3D effect — click to open */}
        {loreBook.external ? (
          <a
            href={loreBook.href}
            target="_blank"
            rel="noopener noreferrer"
            className="book-cover-3d relative cursor-pointer transition-transform duration-300 hover:-translate-y-1"
            aria-label={`Begin reading ${loreBook.title}: ${loreBook.subtitle}`}
          >
            <LoreBookCover loreBook={loreBook} />
          </a>
        ) : (
          <Link
            href={loreBook.href}
            className="book-cover-3d relative cursor-pointer transition-transform duration-300 hover:-translate-y-1"
            aria-label={`Begin reading ${loreBook.title}: ${loreBook.subtitle}`}
          >
            <LoreBookCover loreBook={loreBook} />
          </Link>
        )}

        {/* Book info */}
        <div className="mt-6 text-center max-w-xs">
          <h3 className="text-xl font-serif text-parchment mb-1">{loreBook.title}: {loreBook.subtitle}</h3>
          <p className="text-sm text-parchment-muted">{loreBook.description}</p>

          {loreBook.external ? (
            <a
              href={loreBook.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-lg bg-gold/20 border border-gold/40
                         text-gold hover:bg-gold/30 hover:border-gold/60 transition-all text-sm font-medium"
            >
              <BookOpen className="w-4 h-4" />
              Begin Reading
            </a>
          ) : (
            <Link
              href={loreBook.href}
              className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-lg bg-gold/20 border border-gold/40
                         text-gold hover:bg-gold/30 hover:border-gold/60 transition-all text-sm font-medium"
            >
              <BookOpen className="w-4 h-4" />
              Begin Reading
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

/* ───────── bookshelf row ───────── */
function ShelfRow({
  stories,
  shelfIndex,
  storiesPerShelf,
  onSelectStory,
  onSelectLoreBook,
}: {
  stories: Story[]
  shelfIndex: number
  storiesPerShelf: number[]
  onSelectStory: (story: Story) => void
  onSelectLoreBook: (loreBook: LoreBook) => void
}) {
  const books = useShelfBooks(stories, shelfIndex, storiesPerShelf)
  // Varied bookshelf row height based on tallest book
  const maxHeight = Math.max(...books.map((b) => b.style.height))

  return (
    <div className="relative">
      {/* Book backs (dark wall shadow behind books) */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-sm"
        style={{
          height: maxHeight + 8,
          background: `linear-gradient(180deg, 
            #0a0e0e 0%, 
            #0d1212 30%, 
            #111818 60%,
            #0d1212 100%
          )`,
          boxShadow: 'inset 0 -2px 6px rgba(0,0,0,0.4), inset 0 2px 8px rgba(0,0,0,0.6)',
        }}
      />

      {/* Books container */}
      <div
        className="relative flex items-end gap-[2px] px-4 pb-0"
        style={{ minHeight: maxHeight + 8 }}
      >
        {books.map((book) => (
          <BookSpine
            key={book.id}
            title={book.title}
            style={book.style}
            isReal={book.isReal}
            onClick={
              book.isLore && book.loreBook
                ? () => onSelectLoreBook(book.loreBook!)
                : book.isReal && book.story
                ? () => onSelectStory(book.story!)
                : undefined
            }
          />
        ))}
      </div>

      {/* Shelf plank */}
      <WoodShelf />
    </div>
  )
}

/* ───────── main bookshelf ───────── */
export function Bookshelf({ stories }: { stories: Story[] }) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [selectedLoreBook, setSelectedLoreBook] = useState<LoreBook | null>(null)

  // Distribute real stories across shelves (3 shelves)
  const shelfCount = 3
  const storiesPerShelf = useMemo(() => {
    const result: number[] = new Array(shelfCount).fill(0)
    stories.forEach((_, i) => {
      result[i % shelfCount]++
    })
    return result
  }, [stories])

  return (
    <div className="bookshelf-container relative mx-auto" style={{ maxWidth: 900 }}>
      {/* Bookcase frame */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          background: `linear-gradient(180deg, 
            #1a1410 0%, 
            #12100d 50%, 
            #0d0b09 100%
          )`,
          boxShadow: `
            0 0 0 3px #4a3118,
            0 0 0 5px #2d1e0e,
            0 8px 32px rgba(0,0,0,0.7),
            inset 0 0 60px rgba(0,0,0,0.4)
          `,
          padding: '12px 6px 0',
        }}
      >
        {/* Decorative top molding */}
        <div
          className="absolute top-0 inset-x-0 h-3"
          style={{
            background: `linear-gradient(180deg, 
              #7a5230 0%, 
              #5c3d1e 50%, 
              #4a3118 100%
            )`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
          }}
        />

        {/* Side pillars */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2"
          style={{
            background: `linear-gradient(90deg, #5c3d1e, #4a3118)`,
            boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.3)',
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-2"
          style={{
            background: `linear-gradient(90deg, #4a3118, #5c3d1e)`,
            boxShadow: 'inset 1px 0 2px rgba(0,0,0,0.3)',
          }}
        />

        {/* Shelf rows */}
        <div className="relative pt-4 flex flex-col gap-0">
          {Array.from({ length: shelfCount }).map((_, i) => (
            <ShelfRow
              key={i}
              stories={stories}
              shelfIndex={i}
              storiesPerShelf={storiesPerShelf}
              onSelectStory={setSelectedStory}
              onSelectLoreBook={setSelectedLoreBook}
            />
          ))}
        </div>

        {/* Bottom base */}
        <div
          className="relative h-6 -mx-2"
          style={{
            background: `linear-gradient(180deg, 
              #5c3d1e 0%, 
              #4a3118 40%, 
              #3d2812 100%
            )`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        />
      </div>

      {/* Ambient light / glow */}
      <div
        className="absolute -inset-8 -z-10 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(212,168,75,0.08), transparent 70%)',
        }}
      />

      {/* Selected book overlay */}
      {selectedStory && (
        <SelectedBookOverlay
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}

      {/* Selected lore book overlay */}
      {selectedLoreBook && (
        <LoreBookOverlay
          loreBook={selectedLoreBook}
          onClose={() => setSelectedLoreBook(null)}
        />
      )}
    </div>
  )
}

/* ───────── loading skeleton ───────── */
export function BookshelfSkeleton() {
  return (
    <div className="mx-auto animate-pulse" style={{ maxWidth: 900 }}>
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1a1410 0%, #12100d 50%, #0d0b09 100%)',
          boxShadow: '0 0 0 3px #4a3118, 0 0 0 5px #2d1e0e',
          padding: '12px 6px 0',
        }}
      >
        {[0, 1, 2].map((shelf) => (
          <div key={shelf} className="mb-0">
            <div className="flex items-end gap-[2px] px-4 pb-0" style={{ height: 260 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[2px]"
                  style={{
                    width: 30 + (i % 3) * 8,
                    height: 180 + (i % 4) * 20,
                    background: `linear-gradient(180deg, rgba(60,40,20,0.6), rgba(40,25,12,0.6))`,
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)',
                  }}
                />
              ))}
            </div>
            <div style={{
              height: 18,
              background: 'linear-gradient(180deg, #5c3d1e, #4a3118)',
            }} />
          </div>
        ))}
        <div className="h-6" style={{ background: '#4a3118' }} />
      </div>
    </div>
  )
}
