import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { BookOpen, User, Calendar, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'The Library | Everloop',
  description: 'Read canonical stories from the Everloop universe',
}

interface Story {
  id: string
  title: string
  slug: string
  excerpt: string | null
  word_count: number | null
  created_at: string
  author: {
    username: string
  } | null
}

async function getApprovedStories(search?: string): Promise<Story[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('stories')
    .select(`
      id,
      title,
      slug,
      excerpt,
      word_count,
      created_at,
      author:profiles!stories_author_id_fkey(username)
    `)
    .in('canon_status', ['approved', 'canonical'])
    .order('created_at', { ascending: false })
  
  if (search) {
    query = query.ilike('title', `%${search}%`)
  }
  
  const { data, error } = await query as { data: Story[] | null; error: Error | null }
  
  if (error) {
    console.error('Error fetching stories:', error)
    return []
  }
  
  return data || []
}

async function getStoryCount(): Promise<number> {
  const supabase = await createClient()
  
  const { count } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .in('canon_status', ['approved', 'canonical'])
  
  return count || 0
}

function StoryCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className="group block p-6 rounded-lg bg-navy/30 border border-charcoal-700 
                 hover:border-gold/30 hover:bg-navy/50 transition-all"
    >
      <h3 className="font-serif text-xl text-foreground mb-2 group-hover:text-gold transition-colors">
        {story.title}
      </h3>
      
      {story.excerpt && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {story.excerpt}
        </p>
      )}
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {story.author?.username || 'Anonymous'}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {story.word_count || 0} words
          </span>
        </div>
        
        <span className="flex items-center gap-1 text-gold opacity-0 group-hover:opacity-100 transition-opacity">
          Read <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  )
}

function StoryCardSkeleton() {
  return (
    <div className="p-6 rounded-lg bg-navy/30 border border-charcoal-700 animate-pulse">
      <div className="h-6 bg-charcoal-700 rounded w-3/4 mb-3" />
      <div className="h-4 bg-charcoal-700 rounded w-full mb-2" />
      <div className="h-4 bg-charcoal-700 rounded w-2/3 mb-4" />
      <div className="flex gap-4">
        <div className="h-4 bg-charcoal-700 rounded w-20" />
        <div className="h-4 bg-charcoal-700 rounded w-16" />
      </div>
    </div>
  )
}

interface StoriesPageProps {
  searchParams: Promise<{ search?: string }>
}

async function StoryGrid({ search }: { search?: string }) {
  const stories = await getApprovedStories(search)
  
  if (stories.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-xl font-serif text-foreground mb-2">No Stories Found</h3>
        <p className="text-muted-foreground">
          {search 
            ? `No stories match "${search}"`
            : 'The library awaits its first canonical tales.'}
        </p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  )
}

export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  const params = await searchParams
  const search = params.search
  const storyCount = await getStoryCount()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-charcoal-700 bg-charcoal/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-serif">
              <span className="text-foreground">Ever</span>
              <span className="text-gold">loop</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/explore" className="text-muted-foreground hover:text-foreground transition-colors">Archive</Link>
              <Link href="/stories" className="text-gold">Library</Link>
              <Link href="/write" className="text-muted-foreground hover:text-foreground transition-colors">Write</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">
            The <span className="canon-text">Library</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Canonical tales from the Everloop universe. 
            Each story has been verified against the lore and approved by the Lorekeepers.
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-4 mt-6 text-sm">
            <Badge variant="outline" className="text-gold border-gold/30">
              <BookOpen className="w-3 h-3 mr-1" />
              {storyCount} {storyCount === 1 ? 'Story' : 'Stories'}
            </Badge>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-10">
          <form action="/stories" method="GET">
            <div className="relative">
              <input
                type="text"
                name="search"
                placeholder="Search stories..."
                defaultValue={search}
                className="w-full px-4 py-3 pl-12 rounded-lg bg-navy/50 border border-charcoal-700 
                           text-foreground placeholder:text-muted-foreground/50
                           focus:border-gold/50 focus:ring-1 focus:ring-gold/20 focus:outline-none"
              />
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </form>
          {search && (
            <div className="mt-2 text-sm text-muted-foreground text-center">
              Showing results for &quot;{search}&quot;
              <Link href="/stories" className="text-gold ml-2 hover:underline">Clear</Link>
            </div>
          )}
        </div>

        {/* Story Grid */}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <StoryCardSkeleton key={i} />
            ))}
          </div>
        }>
          <StoryGrid search={search} />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-charcoal-700 mt-16">
        <div className="container mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <p>© 2024 Everloop. All stories live forever.</p>
          <Link href="/" className="hover:text-gold transition-colors">
            ← Back to Home
          </Link>
        </div>
      </footer>
    </div>
  )
}
