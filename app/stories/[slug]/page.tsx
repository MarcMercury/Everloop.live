import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Calendar, BookOpen, Clock } from 'lucide-react'

interface StoryPageProps {
  params: Promise<{ slug: string }>
}

interface StoryData {
  id: string
  title: string
  slug: string
  content: unknown
  excerpt: string | null
  word_count: number | null
  created_at: string
  canon_status: string
  author: {
    id: string
    username: string
    display_name: string | null
  } | null
  mentioned_entities: string[] | null
}

interface CanonEntity {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
}

async function getStory(slug: string): Promise<StoryData | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      slug,
      content,
      excerpt,
      word_count,
      created_at,
      canon_status,
      mentioned_entities,
      author:profiles!stories_author_id_fkey(id, username, display_name)
    `)
    .eq('slug', slug)
    .in('canon_status', ['approved', 'canonical'])
    .single() as { data: StoryData | null; error: Error | null }
  
  if (error) {
    console.error('Error fetching story:', error)
    return null
  }
  
  return data
}

async function getMentionedEntities(entityIds: string[]): Promise<CanonEntity[]> {
  if (!entityIds || entityIds.length === 0) return []
  
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('canon_entities')
    .select('id, name, slug, type, description')
    .in('id', entityIds) as { data: CanonEntity[] | null; error: Error | null }
  
  if (error) {
    console.error('Error fetching entities:', error)
    return []
  }
  
  return data || []
}

function extractTextFromContent(content: unknown): string[] {
  if (!content || typeof content !== 'object') return []
  
  const paragraphs: string[] = []
  
  const extractText = (node: unknown): string => {
    if (!node || typeof node !== 'object') return ''
    
    const n = node as { type?: string; text?: string; content?: unknown[] }
    
    if (n.type === 'text' && typeof n.text === 'string') {
      return n.text
    }
    
    if (Array.isArray(n.content)) {
      return n.content.map(extractText).join('')
    }
    
    return ''
  }
  
  const c = content as { content?: unknown[] }
  if (Array.isArray(c.content)) {
    for (const node of c.content) {
      const n = node as { type?: string }
      if (n.type === 'paragraph' || n.type === 'heading') {
        const text = extractText(node)
        if (text.trim()) {
          paragraphs.push(text)
        }
      }
    }
  }
  
  return paragraphs
}

function getReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 200)
  return `${minutes} min read`
}

function EntityTypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    character: '👤',
    location: '🏛️',
    artifact: '✨',
    faction: '⚔️',
    creature: '🐉',
    event: '📜',
    concept: '💭',
  }
  return <span className="text-sm">{icons[type] || '◈'}</span>
}

export async function generateMetadata({ params }: StoryPageProps) {
  const { slug } = await params
  const story = await getStory(slug)
  
  if (!story) {
    return { title: 'Story Not Found' }
  }
  
  return {
    title: `${story.title} | Everloop Library`,
    description: story.excerpt || `Read "${story.title}" in the Everloop universe`,
  }
}

export default async function StoryReaderPage({ params }: StoryPageProps) {
  const { slug } = await params
  const story = await getStory(slug)
  
  if (!story) {
    notFound()
  }
  
  const paragraphs = extractTextFromContent(story.content)
  const mentionedEntities = await getMentionedEntities(story.mentioned_entities || [])
  const readingTime = getReadingTime(story.word_count || 0)
  
  return (
    <div className="min-h-screen bg-teal-deep">
      {/* Header */}
      <header className="border-b border-gold/10 bg-teal-deep/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/stories" 
              className="flex items-center gap-2 text-parchment-muted hover:text-parchment transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Library</span>
            </Link>
            <Link href="/" className="text-xl font-serif">
              <span className="text-parchment">Ever</span>
              <span className="text-gold">loop</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
          {/* Main Content */}
          <article className="max-w-prose">
            {/* Story Header */}
            <header className="mb-10 pb-8 border-b border-gold/10">
              <Badge className="mb-4 bg-gold/10 text-gold border-gold/30">
                Canonical Story
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-serif font-semibold text-parchment mb-6 leading-tight">
                {story.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-parchment-muted">
                <Link 
                  href={`/profile/${story.author?.username}`}
                  className="flex items-center gap-2 hover:text-gold transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>
                    {story.author?.display_name || story.author?.username || 'Anonymous'}
                  </span>
                </Link>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(story.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{story.word_count?.toLocaleString() || 0} words</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{readingTime}</span>
                </div>
              </div>
            </header>
            
            {/* Story Content - Crimson Text serif for body */}
            <div className="story-content space-y-6">
              {paragraphs.map((paragraph, index) => (
                <p 
                  key={index} 
                  className="font-serif text-lg text-parchment/90 leading-relaxed first-letter:text-3xl first-letter:font-serif first-letter:text-gold first-letter:float-left first-letter:mr-2 first-letter:mt-1"
                >
                  {paragraph}
                </p>
              ))}
              
              {paragraphs.length === 0 && (
                <p className="text-parchment-muted italic">
                  This story has no content yet.
                </p>
              )}
            </div>
            
            {/* End Marker */}
            <div className="mt-12 pt-8 border-t border-gold/10 text-center">
              <span className="text-gold text-2xl">◈</span>
              <p className="text-parchment-muted text-sm mt-4">
                End of &quot;{story.title}&quot;
              </p>
            </div>
          </article>
          
          {/* Sidebar - Lore Wiki Cards */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* Mentioned Entities */}
            {mentionedEntities.length > 0 && (
              <div className="p-4 rounded-lg bg-teal-rich/50 border border-gold/10">
                <h3 className="font-medium text-parchment mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gold" />
                  Lore Mentioned
                </h3>
                
                <div className="space-y-3">
                  {mentionedEntities.map((entity) => (
                    <Link
                      key={entity.id}
                      href={`/explore?entity=${entity.slug}`}
                      className="block p-3 rounded bg-teal-deep/50 border border-gold/5 hover:border-gold/20 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <EntityTypeIcon type={entity.type} />
                        <span className="font-medium text-parchment text-sm">
                          {entity.name}
                        </span>
                      </div>
                      {entity.description && (
                        <p className="text-xs text-parchment-muted line-clamp-2">
                          {entity.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Author Card */}
            {story.author && (
              <Link 
                href={`/profile/${story.author.username}`}
                className="block p-4 rounded-lg bg-teal-rich/50 border border-gold/10 hover:border-gold/20 transition-colors"
              >
                <h3 className="font-medium text-parchment mb-3">About the Author</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-parchment">
                      {story.author.display_name || story.author.username}
                    </p>
                    <p className="text-xs text-parchment-muted">View Profile →</p>
                  </div>
                </div>
              </Link>
            )}
            
            {/* Explore Actions */}
            <div className="p-4 rounded-lg bg-teal-rich/50 border border-gold/10">
              <h3 className="font-medium text-parchment mb-3">Explore More</h3>
              <div className="space-y-2">
                <Link
                  href="/stories"
                  className="block w-full py-2 px-3 rounded bg-teal-deep/50 border border-gold/5 hover:border-gold/20 
                             text-sm text-center text-parchment-muted hover:text-parchment transition-colors"
                >
                  Browse Library
                </Link>
                <Link
                  href="/explore"
                  className="block w-full py-2 px-3 rounded bg-teal-deep/50 border border-gold/5 hover:border-gold/20 
                             text-sm text-center text-parchment-muted hover:text-parchment transition-colors"
                >
                  Explore Archive
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gold/10 mt-16">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-parchment-muted">
          <p>© 2024 Everloop. All stories live forever.</p>
          <Link href="/stories" className="hover:text-gold transition-colors">
            ← Back to Library
          </Link>
        </div>
      </footer>
    </div>
  )
}
