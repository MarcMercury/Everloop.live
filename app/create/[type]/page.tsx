import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { CreateEntityForm } from './create-form'

const validTypes = ['character', 'location', 'creature'] as const
type EntityType = typeof validTypes[number]

const typeConfig: Record<EntityType, { title: string; description: string }> = {
  character: {
    title: 'Create a Character',
    description: 'Bring a new hero, villain, or enigmatic figure to life in the Everloop.',
  },
  location: {
    title: 'Create a Location',
    description: 'Forge a mystical place, ancient ruin, or hidden sanctuary.',
  },
  creature: {
    title: 'Create a Creature',
    description: 'Summon a mythical beast, spirit, or otherworldly being.',
  },
}

export default async function CreateEntityPage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  
  if (!validTypes.includes(type as EntityType)) {
    notFound()
  }
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirected=true')
  }

  const config = typeConfig[type as EntityType]

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl md:text-4xl font-serif text-parchment mb-2">
            {config.title}
          </h1>
          <p className="text-parchment-muted">
            {config.description}
          </p>
        </div>

        {/* Form */}
        <CreateEntityForm type={type as EntityType} />
      </main>
    </div>
  )
}
