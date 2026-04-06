import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCanonEntityBySlug } from '@/lib/data/canon'
import { getEntityCrossReferences } from '@/lib/data/cross-references'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FrayIndicator } from '@/components/world-pulse'
import { ArrowLeft, User, Calendar, Sparkles, BookOpen, Swords, Scroll, Link2, Diamond } from 'lucide-react'
import type { CanonEntityType } from '@/types/database'

interface EntityPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Get display label for entity type
 */
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    character: 'Character',
    location: 'Location',
    artifact: 'Artifact',
    event: 'Event',
    faction: 'Faction',
    concept: 'Concept',
    creature: 'Creature',
    monster: 'Monster',
  }
  return labels[type] || type
}

/**
 * Get icon for entity type
 */
function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    character: '👤',
    location: '🏛️',
    artifact: '✨',
    event: '📜',
    faction: '⚔️',
    concept: '💭',
    creature: '🐉',
    monster: '👁️',
  }
  return icons[type] || '📄'
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

  const crossRefs = await getEntityCrossReferences(entity.id)
  const stabilityPercent = entity.stability_rating * 100
  const entityImage = (entity.metadata as { image_url?: string })?.image_url
  const extendedLore = entity.extended_lore as Record<string, unknown> | null
  const regionMeta = (entity.metadata as { region?: string })?.region

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
              <h3 className="text-lg font-serif text-gold flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Appears In Stories
              </h3>
              {crossRefs.stories.length > 0 ? (
                <ul className="space-y-2">
                  {crossRefs.stories.map((story) => (
                    <li key={story.id}>
                      <Link
                        href={`/stories/${story.slug}`}
                        className="block p-2 rounded hover:bg-gold/5 transition-colors"
                      >
                        <span className="text-sm text-parchment hover:text-gold transition-colors">
                          {story.title}
                        </span>
                        <span className="text-xs text-parchment-muted block mt-0.5">
                          by {story.author_username}
                          {story.canon_status === 'canonical' && (
                            <span className="text-gold ml-2">✦ Canon</span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-parchment-muted italic">
                  No stories reference this entity yet. This part of the world awaits its chronicler.
                </p>
              )}
            </div>

            {/* Campaigns */}
            {crossRefs.campaigns.length > 0 && (
              <div className="p-6 rounded-lg bg-teal-rich/50 border border-gold/10 space-y-4">
                <h3 className="text-lg font-serif text-gold flex items-center gap-2">
                  <Swords className="w-4 h-4" />
                  Active Campaigns
                </h3>
                <ul className="space-y-2">
                  {crossRefs.campaigns.map((campaign) => (
                    <li key={campaign.id}>
                      <Link
                        href={`/campaigns/${campaign.slug}`}
                        className="block p-2 rounded hover:bg-gold/5 transition-colors"
                      >
                        <span className="text-sm text-parchment hover:text-gold transition-colors">
                          {campaign.title}
                        </span>
                        <span className="text-xs text-parchment-muted block mt-0.5">
                          {campaign.game_mode.replace('_', ' ')} · {campaign.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quests */}
            {crossRefs.quests.length > 0 && (
              <div className="p-6 rounded-lg bg-teal-rich/50 border border-gold/10 space-y-4">
                <h3 className="text-lg font-serif text-gold flex items-center gap-2">
                  <Scroll className="w-4 h-4" />
                  Active Quests
                </h3>
                <ul className="space-y-2">
                  {crossRefs.quests.map((quest) => (
                    <li key={quest.id}>
                      <Link
                        href={`/quests/${quest.slug}`}
                        className="block p-2 rounded hover:bg-gold/5 transition-colors"
                      >
                        <span className="text-sm text-parchment hover:text-gold transition-colors">
                          {quest.title}
                        </span>
                        <span className="text-xs text-parchment-muted block mt-0.5">
                          {quest.quest_type.replace('_', ' ')} · {quest.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Entities */}
            {crossRefs.related_entities.length > 0 && (
              <div className="p-6 rounded-lg bg-teal-rich/50 border border-gold/10 space-y-4">
                <h3 className="text-lg font-serif text-gold flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Connected Lore
                </h3>
                <ul className="space-y-2">
                  {crossRefs.related_entities.map((related) => (
                    <li key={related.id}>
                      <Link
                        href={`/explore/${related.slug}`}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gold/5 transition-colors"
                      >
                        <span className="text-sm text-parchment hover:text-gold transition-colors">
                          {related.name}
                        </span>
                        <Badge variant={related.type as CanonEntityType} className="text-[10px]">
                          {related.type}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Shard Connections */}
            {crossRefs.shard_connections.length > 0 && (
              <div className="p-6 rounded-lg bg-gradient-to-br from-purple-900/20 to-teal-rich/50 border border-purple-500/20 space-y-4">
                <h3 className="text-lg font-serif text-purple-300 flex items-center gap-2">
                  <Diamond className="w-4 h-4" />
                  Shard Presence
                </h3>
                <ul className="space-y-2">
                  {crossRefs.shard_connections.map((shard) => (
                    <li key={shard.id} className="flex items-center justify-between p-2">
                      <span className="text-sm text-purple-200">{shard.name}</span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-purple-400 capitalize">{shard.state}</span>
                        <span className="text-gold">⚡ {shard.power_level}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-purple-400/60 italic">
                  The Shards pull toward each other. Their presence here is not coincidence.
                </p>
              </div>
            )}

            {/* Lore impact summary */}
            {crossRefs.total_references > 0 && (
              <div className="p-4 rounded-lg bg-charcoal-800/50 border border-gold/5 text-center">
                <span className="text-xs text-parchment-muted">
                  Referenced across <span className="text-gold font-medium">{crossRefs.total_references}</span> elements of the world
                </span>
              </div>
            )}

            {/* Region context */}
            {regionMeta && (
              <div className="p-4 rounded-lg bg-teal-rich/50 border border-gold/10">
                <h3 className="text-sm font-serif text-gold mb-2">Region</h3>
                <Link
                  href={`/map/${regionMeta}`}
                  className="text-sm text-parchment hover:text-gold transition-colors"
                >
                  View on Map →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
