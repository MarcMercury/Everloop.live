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
  ImageIcon 
} from 'lucide-react'
import { DeleteEntityButton } from './delete-entity-button'

const typeIcons = {
  character: User,
  location: MapPin,
  creature: Sparkles,
}

const typeColors = {
  character: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  location: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  creature: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
}

async function getUserEntities(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('canon_entities')
    .select('id, name, slug, type, description, extended_lore, created_at')
    .eq('created_by', userId)
    .eq('status', 'draft')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching entities:', error)
    return []
  }

  return data as Array<{
    id: string
    name: string
    slug: string
    type: 'character' | 'location' | 'creature'
    description: string | null
    extended_lore: {
      tagline?: string
      image_url?: string | null
    }
    created_at: string
  }>
}

export default async function RosterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirected=true')
  }

  const entities = await getUserEntities(user.id)

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-parchment mb-2">
              My <span className="text-gold">Roster</span>
            </h1>
            <p className="text-parchment-muted">
              Your personal collection of characters, locations, and creatures.
            </p>
          </div>
          <Link href="/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create New
            </Button>
          </Link>
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
                      <div className="flex gap-2 pt-2 border-t border-gold/10">
                        <Link href={`/create/${entity.type}?edit=${entity.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Edit
                          </Button>
                        </Link>
                        <DeleteEntityButton entityId={entity.id} entityName={entity.name} />
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
