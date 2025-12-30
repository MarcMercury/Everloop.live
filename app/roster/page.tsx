import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  User, 
  MapPin, 
  Sparkles,
  ImageIcon,
  Clock
} from 'lucide-react'
import { DeleteEntityButton } from './delete-entity-button'
import { SubmitToCanonButton } from './submit-to-canon-button'

const typeIcons: Record<string, typeof User> = {
  character: User,
  location: MapPin,
  creature: Sparkles,
}

const typeColors: Record<string, string> = {
  character: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  location: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  creature: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
}

async function getUserEntities(userId: string, statusFilter?: 'draft' | 'proposed' | 'all') {
  const supabase = await createClient()
  
  let query = supabase
    .from('canon_entities')
    .select('id, name, slug, type, status, description, extended_lore, created_at')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  // Filter by status
  if (statusFilter === 'draft') {
    query = query.eq('status', 'draft')
  } else if (statusFilter === 'proposed') {
    query = query.eq('status', 'proposed')
  } else {
    // 'all' - show both draft and proposed (not canonical, those are in explore)
    query = query.in('status', ['draft', 'proposed'])
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching entities:', error)
    return []
  }

  return data as Array<{
    id: string
    name: string
    slug: string
    type: 'character' | 'location' | 'creature'
    status: 'draft' | 'proposed' | 'canonical'
    description: string | null
    extended_lore: {
      tagline?: string
      image_url?: string | null
    }
    created_at: string
  }>
}

export default async function RosterPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirected=true')
  }

  const params = await searchParams
  const typeFilter = params.type as 'character' | 'location' | 'creature' | undefined
  const statusFilter = (params.status || 'all') as 'draft' | 'proposed' | 'all'

  const allEntities = await getUserEntities(user.id, statusFilter)
  const entities = typeFilter 
    ? allEntities.filter(e => e.type === typeFilter)
    : allEntities

  // Count by type for badges
  const typeCounts = {
    all: allEntities.length,
    character: allEntities.filter(e => e.type === 'character').length,
    location: allEntities.filter(e => e.type === 'location').length,
    creature: allEntities.filter(e => e.type === 'creature').length,
  }

  const statusCounts = {
    all: allEntities.length,
    draft: allEntities.filter(e => e.status === 'draft').length,
    proposed: allEntities.filter(e => e.status === 'proposed').length,
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-parchment mb-2">
              My <span className="text-gold">Roster</span>
            </h1>
            <p className="text-parchment-muted">
              Your private collection. Submit to Canon when ready for the world.
            </p>
          </div>
          <Link href="/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create New
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Type Filter */}
          <div className="flex gap-2">
            <Link href={`/roster?status=${statusFilter}`}>
              <Button 
                variant={!typeFilter ? "default" : "outline"} 
                size="sm"
                className={!typeFilter ? "" : "opacity-70"}
              >
                All Types ({typeCounts.all})
              </Button>
            </Link>
            <Link href={`/roster?type=character&status=${statusFilter}`}>
              <Button 
                variant={typeFilter === 'character' ? "default" : "outline"} 
                size="sm"
                className={typeFilter === 'character' ? "" : "opacity-70"}
              >
                <User className="w-3 h-3 mr-1" />
                Characters ({typeCounts.character})
              </Button>
            </Link>
            <Link href={`/roster?type=location&status=${statusFilter}`}>
              <Button 
                variant={typeFilter === 'location' ? "default" : "outline"} 
                size="sm"
                className={typeFilter === 'location' ? "" : "opacity-70"}
              >
                <MapPin className="w-3 h-3 mr-1" />
                Locations ({typeCounts.location})
              </Button>
            </Link>
            <Link href={`/roster?type=creature&status=${statusFilter}`}>
              <Button 
                variant={typeFilter === 'creature' ? "default" : "outline"} 
                size="sm"
                className={typeFilter === 'creature' ? "" : "opacity-70"}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Creatures ({typeCounts.creature})
              </Button>
            </Link>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 ml-auto">
            <Link href={`/roster?${typeFilter ? `type=${typeFilter}&` : ''}status=all`}>
              <Button 
                variant={statusFilter === 'all' ? "default" : "ghost"} 
                size="sm"
              >
                All ({statusCounts.all})
              </Button>
            </Link>
            <Link href={`/roster?${typeFilter ? `type=${typeFilter}&` : ''}status=draft`}>
              <Button 
                variant={statusFilter === 'draft' ? "default" : "ghost"} 
                size="sm"
              >
                <Clock className="w-3 h-3 mr-1" />
                Drafts ({statusCounts.draft})
              </Button>
            </Link>
            <Link href={`/roster?${typeFilter ? `type=${typeFilter}&` : ''}status=proposed`}>
              <Button 
                variant={statusFilter === 'proposed' ? "default" : "ghost"} 
                size="sm"
              >
                Pending Review ({statusCounts.proposed})
              </Button>
            </Link>
          </div>
        </div>

        {entities.length === 0 ? (
          /* Empty State */
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-gold" />
              </div>
              <h2 className="text-xl font-serif text-parchment mb-2">
                Your Roster is Empty
              </h2>
              <p className="text-parchment-muted mb-6">
                Start building your collection of characters, locations, and creatures.
              </p>
              <Link href="/create">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Entity
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Entity Grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {entities.map((entity) => {
              const Icon = typeIcons[entity.type] || Sparkles
              const colorClass = typeColors[entity.type] || typeColors.creature
              const imageUrl = entity.extended_lore?.image_url
              const tagline = entity.extended_lore?.tagline

              return (
                <Card key={entity.id} className="group overflow-hidden hover:border-gold/40 transition-colors">
                  <CardContent className="p-0">
                    {/* Image */}
                    <div className="aspect-square relative bg-teal-deep/50 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={entity.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-parchment-muted/20" />
                        </div>
                      )}
                      
                      {/* Type Badge */}
                      <Badge className={`absolute top-3 left-3 ${colorClass}`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {entity.type}
                      </Badge>

                      {/* Status Badge */}
                      {entity.status === 'proposed' && (
                        <Badge className="absolute top-3 right-3 bg-amber-500/20 text-amber-400 border-amber-500/30">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-serif text-lg text-parchment group-hover:text-gold transition-colors mb-1 line-clamp-1">
                        {entity.name}
                      </h3>
                      {tagline && (
                        <p className="text-parchment-muted text-sm italic line-clamp-2 mb-3">
                          &quot;{tagline}&quot;
                        </p>
                      )}
                      
                      {/* Actions */}
                      <div className="flex flex-col gap-2 pt-2 border-t border-gold/10">
                        {entity.status === 'draft' && (
                          <SubmitToCanonButton entityId={entity.id} entityName={entity.name} />
                        )}
                        {entity.status === 'proposed' && (
                          <p className="text-xs text-amber-400/70 text-center py-1">
                            Awaiting admin review
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Link href={`/create/${entity.type}?edit=${entity.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              Edit
                            </Button>
                          </Link>
                          {entity.status === 'draft' && (
                            <DeleteEntityButton entityId={entity.id} entityName={entity.name} />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
