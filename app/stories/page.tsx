import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getConvergenceState } from '@/lib/data/world-state'
import { Badge } from '@/components/ui/badge'
import { BookOpen } from 'lucide-react'
import { CANON_STORY_STATUSES } from '@/lib/utils'
import { Bookshelf, BookshelfSkeleton } from '@/components/library/bookshelf-3d'
import { WorldPulse } from '@/components/world-pulse'

export const metadata = {
  title: 'The Library | Everloop',
  description: 'Read canonical stories from the Everloop universe',
}

interface Story {
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

const statusFilter = Array.from(CANON_STORY_STATUSES)

function normalizeSearch(term: string): string {
  return term
    .trim()
    .replace(/[%,_]/g, ' ')
    .replace(/\s+/g, ' ')
}

async function getCanonStories(search?: string): Promise<Story[]> {
  const supabase = await createClient()
  const trimmed = search ? normalizeSearch(search) : undefined

  let query = supabase
    .from('stories')
    .select(`
      id,
      title,
      slug,
      content_text,
      word_count,
      created_at,
      author:profiles!stories_author_id_fkey(username, display_name)
    `)
    .eq('is_published', true)
    .in('canon_status', statusFilter)
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })

  if (trimmed) {
    const pattern = `%${trimmed}%`
    query = query.or(
      `title.ilike.${pattern},profiles.username.ilike.${pattern},profiles.display_name.ilike.${pattern}`
    )
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
    .eq('is_published', true)
    .in('canon_status', statusFilter)

  return count || 0
}

interface StoriesPageProps {
  searchParams?: Promise<{ search?: string }>
}

async function StoryGrid({ search }: { search?: string }) {
  const stories = await getCanonStories(search)

  if (stories.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-parchment-muted/50" />
        <h3 className="text-xl font-serif text-parchment mb-2">No Canon Stories Yet</h3>
        <p className="text-parchment-muted">
          {search
            ? `No canon stories match "${search}".`
            : 'The library is waiting for its next approved tale.'}
        </p>
      </div>
    )
  }

  return <Bookshelf stories={stories} />
}

export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  const params = searchParams ? await searchParams : { search: undefined }
  const search = params.search?.trim() ? params.search.trim() : undefined
  const storyCount = await getStoryCount()
  const convergence = await getConvergenceState()

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-serif">
              <span className="text-parchment">Ever</span>
              <span className="text-gold">loop</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/explore" className="text-parchment-muted hover:text-parchment transition-colors">Archive</Link>
              <Link href="/stories" className="text-gold">Library</Link>
              <Link href="/write" className="text-parchment-muted hover:text-parchment transition-colors">Write</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif mb-4 text-parchment">
            The <span className="canon-text">Library</span>
          </h1>
          <p className="text-parchment-muted text-lg max-w-2xl mx-auto leading-relaxed">
            Browse every story that earned a place in the Everloop canon. Each tale is vetted for lore accuracy and narrative quality — and each one moves the world a little closer to convergence.
          </p>

          <div className="flex items-center justify-center gap-4 mt-6 text-sm">
            <Badge variant="outline" className="text-gold border-gold/30">
              <BookOpen className="w-3 h-3 mr-1" />
              {storyCount} {storyCount === 1 ? 'Story' : 'Stories'} in Circulation
            </Badge>
          </div>

          {/* World Pulse - the living state of the Everloop */}
          <div className="flex justify-center mt-4">
            <WorldPulse convergence={convergence} compact />
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <form action="/stories" method="GET">
            <div className="relative">
              <input
                type="text"
                name="search"
                placeholder="Search by title or author"
                defaultValue={search}
                className="w-full px-4 py-3 pl-12 rounded-lg bg-teal-deep/50 border border-gold/20 
                           text-parchment placeholder:text-parchment-muted/50 focus:border-gold/50
                           focus:ring-2 focus:ring-gold/20 focus:outline-none transition-all"
              />
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment-muted" />
            </div>
          </form>
          {search && (
            <div className="mt-2 text-sm text-parchment-muted text-center">
              Showing results for "{search}".
              <Link href="/stories" className="text-gold ml-2 hover:underline">Clear</Link>
            </div>
          )}
        </div>

        <Suspense fallback={<BookshelfSkeleton />}>
          <StoryGrid search={search} />
        </Suspense>
      </main>

      <footer className="py-8 px-6 border-t border-gold/10 mt-16">
        <div className="container mx-auto flex items-center justify-between text-sm text-parchment-muted">
          <p>&copy; {new Date().getFullYear()} Everloop. All stories live forever.</p>
          <Link href="/" className="hover:text-gold transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </footer>
    </div>
  )
}
