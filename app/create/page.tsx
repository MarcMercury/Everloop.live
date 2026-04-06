import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { User, MapPin, Sparkles, Skull, ChevronRight } from 'lucide-react'

const entityTypes = [
  {
    type: 'character',
    title: 'Create Character',
    description: 'Bring a new hero, villain, or enigmatic figure to life in the Everloop.',
    icon: User,
    gradient: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30 hover:border-amber-500/60',
    iconColor: 'text-amber-400',
  },
  {
    type: 'location',
    title: 'Create Location',
    description: 'Forge mystical places, ancient ruins, or hidden sanctuaries.',
    icon: MapPin,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
    iconColor: 'text-emerald-400',
  },
  {
    type: 'creature',
    title: 'Create Creature',
    description: 'Summon mythical beasts, spirits, or otherworldly beings.',
    icon: Sparkles,
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30 hover:border-purple-500/60',
    iconColor: 'text-purple-400',
  },
  {
    type: 'monster',
    title: 'Create Monster',
    description: 'Manifest a Drift-born horror — something that should not exist, but the Fray made real.',
    icon: Skull,
    gradient: 'from-red-500/20 to-rose-900/20',
    borderColor: 'border-red-500/30 hover:border-red-500/60',
    iconColor: 'text-red-400',
  },
]

export default async function CreatorStudioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirected=true')
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-parchment mb-4">
            Creator <span className="text-gold">Studio</span>
          </h1>
          <p className="text-parchment-muted text-lg max-w-2xl mx-auto">
            Craft your own characters, locations, creatures, and monsters with AI assistance. 
            Everything you create exists in a world being drawn toward convergence — 
            and what you build here is part of that pull.
          </p>
        </div>

        {/* Creation Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {entityTypes.map((entity) => {
            const Icon = entity.icon
            return (
              <Link key={entity.type} href={`/create/${entity.type}`}>
                <Card className={`group h-full cursor-pointer transition-all duration-300 ${entity.borderColor} hover:scale-[1.02]`}>
                  <CardContent className="p-0">
                    {/* Gradient Header */}
                    <div className={`h-32 bg-gradient-to-br ${entity.gradient} flex items-center justify-center`}>
                      <div className="p-4 rounded-full bg-teal-deep/50 backdrop-blur-sm">
                        <Icon className={`w-10 h-10 ${entity.iconColor}`} />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-serif text-parchment group-hover:text-gold transition-colors">
                          {entity.title}
                        </h2>
                        <ChevronRight className="w-5 h-5 text-parchment-muted group-hover:text-gold group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-parchment-muted text-sm">
                        {entity.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <p className="text-parchment-muted text-sm">
            Already have creations?{' '}
            <Link href="/roster" className="text-gold hover:underline">
              View your Roster →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
