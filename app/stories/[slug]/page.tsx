import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Calendar, BookOpen, Clock, Sparkles } from 'lucide-react'
import { CANON_STORY_STATUSES, calculateReadingTime } from '@/lib/utils'

interface StoryPageProps {
  params: { slug: string }
}

interface AuthorProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

interface StoryData {
  id: string
  title: string
  slug: string
  content: unknown
  summary: string | null
  content_text: string | null
  word_count: number | null
  published_at: string | null
  created_at: string
  canon_status: string
  referenced_entities: string[]
  author: AuthorProfile | null
}

interface CanonEntity {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
}

const statusFilter = Array.from(CANON_STORY_STATUSES)

async function getStory(slug: string): Promise<StoryData | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      slug,
      content,
      summary,
      content_text,
      word_count,
      published_at,
      created_at,
      canon_status,
      referenced_entities,
      author:profiles!stories_author_id_fkey(id, username, display_name, avatar_url)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .in('canon_status', statusFilter)
    .single() as { data: StoryData | null; error: Error | null }

  if (error) {
    console.error('Error fetching story:', error)
    return null
  }

  return data
}

async function getReferencedEntities(entityIds: string[]): Promise<CanonEntity[]> {
  if (!entityIds || entityIds.length === 0) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('canon_entities')
    .select('id, name, slug, type, description')
    .in('id', entityIds)
    .eq('status', 'canonical') as { data: CanonEntity[] | null; error: Error | null }

  if (error) {
    console.error('Error fetching entities:', error)
    return []
  }

  return data || []
}

// Find entities mentioned in story text by name matching
async function getMentionedEntities(contentText: string | null): Promise<CanonEntity[]> {
  if (!contentText) return []

  const supabase = await createClient()

  // Get all canonical entities
  const { data: allEntities, error } = await supabase
    .from('canon_entities')
    .select('id, name, slug, type, description')
    .eq('status', 'canonical') as { data: CanonEntity[] | null; error: Error | null }

  if (error || !allEntities) return []

  // Find entities whose names appear in the story text (case-insensitive)
  const lowerContent = contentText.toLowerCase()
  const mentioned = allEntities.filter(entity => 
    lowerContent.includes(entity.name.toLowerCase())
  )

  // Limit to 6 most relevant
  return mentioned.slice(0, 6)
}

type TiptapNode = {
  type?: string
  text?: string
  content?: TiptapNode[]
  attrs?: Record<string, unknown>
}

function extractParagraphs(content: unknown): string[] {
  if (!content || typeof content !== 'object') return []

  const paragraphs: string[] = []

  const getText = (node: TiptapNode): string => {
    if (node.type === 'text' && typeof node.text === 'string') {
      return node.text
    }
    if (Array.isArray(node.content)) {
      return node.content.map(getText).join('')
    }
    return ''
  }

  const root = content as TiptapNode
  if (Array.isArray(root.content)) {
    for (const node of root.content) {
      if (['paragraph', 'heading'].includes(node.type || '')) {
        const text = getText(node)
        if (text.trim()) paragraphs.push(text)
      }
    }
  }

  return paragraphs
}

/**
 * Parse plain text content into paragraphs, preserving line breaks
 */
function parseContentText(contentText: string): string[] {
  // Split by double newlines (paragraph breaks) or single newlines
  return contentText
    .split(/\r?\n\r?\n|\r?\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
}

/**
 * Check if TipTap content is just a placeholder (not real story content)
 */
function isPlaceholderContent(content: unknown): boolean {
  if (!content || typeof content !== 'object') return true
  
  const root = content as TiptapNode
  if (!Array.isArray(root.content) || root.content.length === 0) return true
  
  // Check if the only content is the placeholder text
  const paragraphs = extractParagraphs(content)
  if (paragraphs.length === 1 && paragraphs[0].toLowerCase().includes('content_text field')) {
    return true
  }
  
  return false
}

const TYPE_ICONS: Record<string, string> = {
  character: '👤',
  location: '🏛',
  artifact: '✨',
  faction: '⚔',
  creature: '🐉',
  event: '📜',
  concept: '💭',
}

function EntityWikiCard({ entity }: { entity: CanonEntity }) {
  const icon = TYPE_ICONS[entity.type] || '◇'

  return (
    <Link
      href={`/explore?entity=${entity.slug}`}
      className="block p-3 rounded bg-teal-deep/50 border border-gold/10 hover:border-gold/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="font-medium text-parchment text-sm">{entity.name}</span>
      </div>
      {entity.description && (
        <p className="text-xs text-parchment-muted line-clamp-2">{entity.description}</p>
      )}
    </Link>
  )
}

export async function generateMetadata({ params }: StoryPageProps) {
  const story = await getStory(params.slug)

  if (!story) return { title: 'Story Not Found' }

  return {
    title: `${story.title} | Everloop Library`,
    description: story.summary || story.content_text?.slice(0, 160) || `Read "${story.title}" in the Everloop universe.`,
  }
}

export default async function StoryReaderPage({ params }: StoryPageProps) {
  const story = await getStory(params.slug)

  if (!story) notFound()

  // Use TipTap content if available and not a placeholder, otherwise fall back to content_text
  const useTipTapContent = !isPlaceholderContent(story.content)
  const paragraphs = useTipTapContent 
    ? extractParagraphs(story.content)
    : parseContentText(story.content_text || '')
  
  // Get both explicitly referenced entities and entities mentioned in text
  const referencedEntities = await getReferencedEntities(story.referenced_entities || [])
  const mentionedEntities = await getMentionedEntities(story.content_text)
  
  // Combine and deduplicate entities
  const entityMap = new Map<string, CanonEntity>()
  referencedEntities.forEach(e => entityMap.set(e.id, e))
  mentionedEntities.forEach(e => entityMap.set(e.id, e))
  const entities = Array.from(entityMap.values())
  
  const readingTime = calculateReadingTime(story.word_count || 0)
  const publishedDate = story.published_at || story.created_at
  const displayDate = new Date(publishedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const authorName = story.author?.display_name || story.author?.username || 'Anonymous'

  return (
    <div className="min-h-screen bg-teal-deep text-parchment">
      {/* Sticky Header */}
      <header className="border-b border-gold/10 bg-teal-deep/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/stories" className="flex items-center gap-2 text-parchment-muted hover:text-parchment transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Library</span>
          </Link>
          <Link href="/" className="text-xl font-serif">
            <span className="text-parchment">Ever</span>
            <span className="text-gold">loop</span>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
        {/* Main Content */}
        <article className="prose-everloop prose prose-lg max-w-prose">
          {/* Story Header */}
          <header className="mb-10 pb-8 border-b border-gold/10">
            <Badge className="mb-4 bg-gold/10 text-gold border-gold/30 flex items-center gap-1 w-fit">
              <Sparkles className="w-3 h-3" />
              Canonical Story
            </Badge>

            <h1 className="text-4xl md:text-5xl font-serif font-semibold text-parchment leading-tight mt-0 mb-6">
              {story.title}
            </h1>

            <div className="flex flex-wrap items-center gap-5 text-parchment-muted">
              {/* Author */}
              {story.author?.username ? (
                <Link
                  href={`/profile/${story.author.username}`}
                  className="flex items-center gap-2 hover:text-gold transition-colors"
                >
                  {story.author.avatar_url ? (
                    <Image
                      src={story.author.avatar_url}
                      alt={authorName}
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-gold" />
                    </span>
                  )}
                  <span>{authorName}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{authorName}</span>
                </div>
              )}

              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {displayDate}
              </span>

              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {story.word_count ? `${story.word_count.toLocaleString()} words` : 'N/A'}
              </span>

              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {readingTime} min read
              </span>
            </div>
          </header>

          {/* Story Body - Crimson Text */}
          <div className="font-crimson space-y-6">
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="text-lg text-parchment/90 leading-[1.85] first-of-type:first-letter:text-4xl first-of-type:first-letter:text-gold first-of-type:first-letter:font-bold first-of-type:first-letter:float-left first-of-type:first-letter:mr-2 first-of-type:first-letter:mt-1"
                >
                  {p}
                </p>
              ))
            ) : (
              <p className="text-parchment-muted italic">This story has no content.</p>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-gold/10 text-center">
            <span className="text-gold text-2xl">&#x25C7;</span>
            <p className="text-parchment-muted text-sm mt-4">End of &quot;{story.title}&quot;</p>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
          {/* Lore Sidebar */}
          {entities.length > 0 && (
            <section className="p-4 rounded-lg bg-teal-rich/50 border border-gold/10">
              <h3 className="font-medium text-parchment mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gold" />
                Lore Referenced
              </h3>
              <div className="space-y-3">
                {entities.map((e) => (
                  <EntityWikiCard key={e.id} entity={e} />
                ))}
              </div>
            </section>
          )}

          {/* Author Card */}
          {story.author?.username && (
            <Link
              href={`/profile/${story.author.username}`}
              className="block p-4 rounded-lg bg-teal-rich/50 border border-gold/10 hover:border-gold/30 transition-colors"
            >
              <h3 className="font-medium text-parchment mb-3">About the Author</h3>
              <div className="flex items-center gap-3">
                {story.author.avatar_url ? (
                  <Image
                    src={story.author.avatar_url}
                    alt={authorName}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-gold" />
                  </span>
                )}
                <div>
                  <p className="font-medium text-parchment">{authorName}</p>
                  <p className="text-xs text-parchment-muted">View Profile -&gt;</p>
                </div>
              </div>
            </Link>
          )}

          {/* Quick Links */}
          <section className="p-4 rounded-lg bg-teal-rich/50 border border-gold/10">
            <h3 className="font-medium text-parchment mb-3">Explore More</h3>
            <div className="space-y-2">
              <Link
                href="/stories"
                className="block py-2 px-3 rounded bg-teal-deep/50 border border-gold/5 hover:border-gold/20 text-sm text-center text-parchment-muted hover:text-parchment transition-colors"
              >
                Browse Library
              </Link>
              <Link
                href="/explore"
                className="block py-2 px-3 rounded bg-teal-deep/50 border border-gold/5 hover:border-gold/20 text-sm text-center text-parchment-muted hover:text-parchment transition-colors"
              >
                Explore Archive
              </Link>
            </div>
          </section>
        </aside>
      </div>

      <footer className="py-8 px-6 border-t border-gold/10 mt-16">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-parchment-muted">
          <p>&copy; {new Date().getFullYear()} Everloop. All stories live forever.</p>
          <Link href="/stories" className="hover:text-gold transition-colors">
            &lt;- Back to Library
          </Link>
        </div>
      </footer>
    </div>
  )
}
