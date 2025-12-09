import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCanonEntityBySlug } from '@/lib/data/canon'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, User, Calendar, Sparkles } from 'lucide-react'
import type { CanonEntityType } from '@/types/database'

interface EntityPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Get display label for entity type
 */
function getTypeLabel(type: CanonEntityType): string {
  const labels: Record<CanonEntityType, string> = {
    character: 'Character',
    location: 'Location',
    artifact: 'Artifact',
    event: 'Event',
    faction: 'Faction',
    concept: 'Concept',
    creature: 'Creature',
  }
  return labels[type]
}

/**
 * Get icon for entity type
 */
function getTypeIcon(type: CanonEntityType): string {
  const icons: Record<CanonEntityType, string> = {
    character: '👤',
    location: '🏛️',
    artifact: '✨',
    event: '📜',
    faction: '⚔️',
    concept: '💭',
    creature: '🐉',
  }
  return icons[type]
}

/**
 * Get stability label
 */
function getStabilityLabel(rating: number): string {
  if (rating >= 0.9) return 'Absolute'
  if (rating >= 0.7) return 'Stable'
  if (rating >= 0.5) return 'Fluctuating'
  if (rating >= 0.3) return 'Unstable'
  return 'Volatile'
}

/**
 * Get stability color based on rating
 */
function getStabilityColor(rating: number): string {
  if (rating >= 0.8) return 'bg-emerald-500'
  if (rating >= 0.6) return 'bg-gold'
  if (rating >= 0.4) return 'bg-amber-500'
  return 'bg-red-500'
}

export async function generateMetadata({ params }: EntityPageProps) {
  const { slug } = await params
  const entity = await getCanonEntityBySlug(slug)
  
  if (!entity) {
    return { title: 'Entity Not Found | Everloop' }
  }
  
  return {
    title: `${entity.name} | Everloop Archive`,
    description: entity.description || `Learn about ${entity.name} in the Everloop universe.`,
  }
}

export default async function EntityPage({ params }: EntityPageProps) {
  const { slug } = await params
  const entity = await getCanonEntityBySlug(slug)

  if (!entity) {
    notFound()
  }

  const stabilityPercent = entity.stability_rating * 100
  const entityImage = (entity.metadata as { image_url?: string })?.image_url
  const extendedLore = entity.extended_lore as Record<string, unknown> | null

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-serif">
              <span className="text-parchment">Ever</span>
              <span className="text-gold">loop</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/explore" className="text-gold">Archive</Link>
              <Link href="/stories" className="text-parchment-muted hover:text-parchment transition-colors">Stories</Link>
              <Link href="/write" className="text-parchment-muted hover:text-parchment transition-colors">Write</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Back navigation */}
        <Link 
          href="/explore" 
          className="inline-flex items-center gap-2 text-parchment-muted hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Archive
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Entity header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getTypeIcon(entity.type)}</span>
                <Badge variant={entity.type as CanonEntityType} className="text-sm">
                  {getTypeLabel(entity.type)}
                </Badge>
                {entity.status === 'canonical' && (
                  <Badge className="bg-gold/20 text-gold border-gold/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Canonical
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-serif text-parchment">
                {entity.name}
              </h1>
            </div>

            {/* Description */}
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-parchment-muted leading-relaxed whitespace-pre-line">
                {entity.description || 'No description available.'}
              </p>
            </div>

            {/* Extended Lore */}
            {extendedLore && Object.keys(extendedLore).length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-gold">Extended Lore</h2>
                <div className="space-y-4">
                  {Object.entries(extendedLore).map(([key, value]) => (
                    <div key={key} className="p-4 rounded-lg bg-teal-rich/50 border border-gold/10">
                      <h3 className="text-lg font-medium text-parchment capitalize mb-2">
                        {key.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-parchment-muted">
                        {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {entity.tags && entity.tags.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-serif text-gold">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {entity.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-charcoal-700 text-parchment-muted text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Entity Image */}
            <div className="rounded-lg overflow-hidden border border-gold/20 bg-teal-rich/50">
              {entityImage ? (
                <div className="relative aspect-square">
                  <Image
                    src={entityImage}
                    alt={entity.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-charcoal-700/50">
                  <span className="text-8xl">{getTypeIcon(entity.type)}</span>
                </div>
              )}
            </div>

            {/* Metadata card */}
            <div className="p-6 rounded-lg bg-teal-rich/50 border border-gold/10 space-y-4">
              <h3 className="text-lg font-serif text-gold">Details</h3>
              
              {/* Author */}
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-parchment-muted" />
                <span className="text-parchment-muted">Created by:</span>
                {entity.creator ? (
                  <Link 
                    href={`/profile/${entity.creator.username}`}
                    className="text-parchment hover:text-gold transition-colors"
                  >
                    {entity.creator.display_name || entity.creator.username}
                  </Link>
                ) : (
                  <span className="text-parchment-muted italic">System</span>
                )}
              </div>

              {/* Created date */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-parchment-muted" />
                <span className="text-parchment-muted">Created:</span>
                <span className="text-parchment">{formatDate(entity.created_at)}</span>
              </div>

              {/* Updated date */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-parchment-muted" />
                <span className="text-parchment-muted">Updated:</span>
                <span className="text-parchment">{formatDate(entity.updated_at)}</span>
              </div>

              {/* Stability */}
              <div className="space-y-2 pt-2 border-t border-gold/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-parchment-muted">Canon Stability</span>
                  <span className={
                    stabilityPercent >= 70 ? 'text-emerald-400' : 
                    stabilityPercent >= 40 ? 'text-gold' : 'text-red-400'
                  }>
                    {getStabilityLabel(entity.stability_rating)} ({Math.round(stabilityPercent)}%)
                  </span>
                </div>
                <Progress 
                  value={stabilityPercent} 
                  indicatorClassName={getStabilityColor(entity.stability_rating)}
                />
              </div>
            </div>

            {/* Related Stories placeholder */}
            <div className="p-6 rounded-lg bg-teal-rich/50 border border-gold/10 space-y-4">
              <h3 className="text-lg font-serif text-gold">Appears In</h3>
              <p className="text-sm text-parchment-muted">
                Stories referencing this entity will appear here.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
