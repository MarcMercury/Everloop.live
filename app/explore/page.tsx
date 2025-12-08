import { Suspense } from 'react'
import Link from 'next/link'
import { getCanonEntities, getCanonEntityCounts } from '@/lib/data/canon'
import { CanonCard, CanonCardSkeleton } from '@/components/canon-card'
import type { CanonEntityType } from '@/types/database'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'The Everloop Archive',
  description: 'Explore the canonical entities of the Everloop universe — characters, locations, artifacts, and more.',
}

// Type filter configuration
const typeFilters: { type: CanonEntityType | 'all'; label: string; icon: string }[] = [
  { type: 'all', label: 'All', icon: '◈' },
  { type: 'character', label: 'Characters', icon: '👤' },
  { type: 'location', label: 'Locations', icon: '🏛️' },
  { type: 'artifact', label: 'Artifacts', icon: '✨' },
  { type: 'faction', label: 'Factions', icon: '⚔️' },
  { type: 'creature', label: 'Creatures', icon: '🐉' },
  { type: 'event', label: 'Events', icon: '📜' },
  { type: 'concept', label: 'Concepts', icon: '💭' },
]

interface ExplorePageProps {
  searchParams: Promise<{ type?: string }>
}

async function EntityGrid({ type }: { type?: CanonEntityType }) {
  const entities = await getCanonEntities({
    type: type,
  })

  if (entities.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">📜</div>
        <h3 className="text-xl font-serif text-foreground mb-2">No Entities Found</h3>
        <p className="text-muted-foreground">
          {type 
            ? `No ${type}s have been documented in the archive yet.`
            : 'The archive awaits its first entries.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {entities.map((entity) => (
        <CanonCard key={entity.id} entity={entity} />
      ))}
    </div>
  )
}

function EntityGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <CanonCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams
  const selectedType = params.type as CanonEntityType | undefined
  const counts = await getCanonEntityCounts()
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0)

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
              <Link href="/explore" className="text-gold">Archive</Link>
              <Link href="/stories" className="text-muted-foreground hover:text-foreground transition-colors">Stories</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">
            The Everloop <span className="canon-text">Archive</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore the canonical entities that shape our shared universe. 
            Every character, location, and artifact documented here is part of the living lore.
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-6 text-sm">
            <div>
              <span className="text-gold font-semibold">{totalCount}</span>
              <span className="text-muted-foreground ml-1">Entities</span>
            </div>
            <div className="w-px h-4 bg-charcoal-700" />
            <div>
              <span className="text-gold font-semibold">{counts.character}</span>
              <span className="text-muted-foreground ml-1">Characters</span>
            </div>
            <div className="w-px h-4 bg-charcoal-700" />
            <div>
              <span className="text-gold font-semibold">{counts.location}</span>
              <span className="text-muted-foreground ml-1">Locations</span>
            </div>
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {typeFilters.map((filter) => {
            const isActive = 
              (filter.type === 'all' && !selectedType) || 
              filter.type === selectedType
            const count = filter.type === 'all' ? totalCount : counts[filter.type]
            
            return (
              <Link
                key={filter.type}
                href={filter.type === 'all' ? '/explore' : `/explore?type=${filter.type}`}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all',
                  'border',
                  isActive
                    ? 'bg-gold/10 border-gold/50 text-gold'
                    : 'bg-charcoal-800 border-charcoal-700 text-muted-foreground hover:border-charcoal-600 hover:text-foreground'
                )}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  isActive ? 'bg-gold/20' : 'bg-charcoal-700'
                )}>
                  {count}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Entity Grid */}
        <Suspense fallback={<EntityGridSkeleton />}>
          <EntityGrid type={selectedType} />
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
