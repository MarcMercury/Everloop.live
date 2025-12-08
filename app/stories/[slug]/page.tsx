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
    <div className="min-h-screen bg-charcoal">
      {/* Header */}
      <header className="border-b border-charcoal-700 bg-charcoal/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/stories" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Library</span>
            </Link>
            <Link href="/" className="text-xl font-serif">
              <span className="text-foreground">Ever</span>
              <span className="text-gold">loop</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
          {/* Main Content */}
          <article>
            {/* Story Header */}
            <header className="mb-10 pb-8 border-b border-charcoal-700">
              <Badge className="mb-4 bg-gold/10 text-gold border-gold/30">
                Canonical Story
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-serif font-semibold text-foreground mb-6 leading-tight">
                {story.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>
                    {story.author?.display_name || story.author?.username || 'Anonymous'}
                  </span>
                </div>
                
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
            
            {/* Story Content */}
            <div className="prose prose-lg prose-invert max-w-none
                            prose-p:font-serif prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:text-lg
                            prose-headings:font-serif prose-headings:text-foreground
                            prose-blockquote:border-l-gold prose-blockquote:border-l-2 prose-blockquote:pl-6 
                            prose-blockquote:italic prose-blockquote:text-muted-foreground
                            prose-strong:text-foreground">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="mb-6 first-letter:text-3xl first-letter:font-serif first-letter:text-gold first-letter:float-left first-letter:mr-2 first-letter:mt-1">
                  {paragraph}
                </p>
              ))}
              
              {paragraphs.length === 0 && (
                <p className="text-muted-foreground italic">
                  This story has no content yet.
                </p>
              )}
            </div>
            
            {/* End Marker */}
            <div className="mt-12 pt-8 border-t border-charcoal-700 text-center">
              <span className="text-gold text-2xl">◈</span>
              <p className="text-muted-foreground text-sm mt-4">
                End of &quot;{story.title}&quot;
              </p>
            </div>
          </article>
          
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* Mentioned Entities */}
            {mentionedEntities.length > 0 && (
              <div className="p-4 rounded-lg bg-navy/30 border border-charcoal-700">
                <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gold" />
                  Mentioned in this story
                </h3>
                
                <div className="space-y-3">
                  {mentionedEntities.map((entity) => (
                    <Link
                      key={entity.id}
                      href={`/explore?entity=${entity.slug}`}
                      className="block p-3 rounded bg-charcoal-700/50 hover:bg-charcoal-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <EntityTypeIcon type={entity.type} />
                        <span className="font-medium text-foreground text-sm">
                          {entity.name}
                        </span>
                      </div>
                      {entity.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
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
              <div className="p-4 rounded-lg bg-navy/30 border border-charcoal-700">
                <h3 className="font-medium text-foreground mb-3">About the Author</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {story.author.display_name || story.author.username}
                    </p>
                    <p className="text-xs text-muted-foreground">Everloop Writer</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Share / Actions */}
            <div className="p-4 rounded-lg bg-navy/30 border border-charcoal-700">
              <h3 className="font-medium text-foreground mb-3">Explore More</h3>
              <div className="space-y-2">
                <Link
                  href="/stories"
                  className="block w-full py-2 px-3 rounded bg-charcoal-700/50 hover:bg-charcoal-700 
                             text-sm text-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  Browse all stories
                </Link>
                <Link
                  href="/explore"
                  className="block w-full py-2 px-3 rounded bg-charcoal-700/50 hover:bg-charcoal-700 
                             text-sm text-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  Explore the Archive
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-charcoal-700 mt-16">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <p>© 2024 Everloop. All stories live forever.</p>
          <Link href="/stories" className="hover:text-gold transition-colors">
            ← Back to Library
          </Link>
        </div>
      </footer>
    </div>
  )
}
