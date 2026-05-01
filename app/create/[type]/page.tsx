import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateEntityForm } from './create-form'
import { getEntity, type EntityType } from '@/lib/actions/create'

const validTypes = [
  'character',
  'location',
  'creature',
  'monster',
  'artifact',
  'faction',
  'event',
  'concept',
] as const

const typeConfig: Record<EntityType, { title: string; editTitle: string; description: string }> = {
  character: {
    title: 'Create a Character',
    editTitle: 'Edit Character',
    description: 'Bring a new hero, villain, or enigmatic figure to life in the Everloop.',
  },
  location: {
    title: 'Create a Location',
    editTitle: 'Edit Location',
    description: 'Forge a mystical place, ancient ruin, or hidden sanctuary.',
  },
  creature: {
    title: 'Create a Creature',
    editTitle: 'Edit Creature',
    description: 'Summon a mythical beast, spirit, or otherworldly being.',
  },
  monster: {
    title: 'Create a Monster',
    editTitle: 'Edit Monster',
    description: 'Manifest a Drift-born horror — something that should not exist, but the Fray made real.',
  },
  artifact: {
    title: 'Create an Artifact',
    editTitle: 'Edit Artifact',
    description: 'Forge a relic, weapon, or object of power that carries the weight of the Pattern.',
  },
  faction: {
    title: 'Create a Faction',
    editTitle: 'Edit Faction',
    description: 'Bind a guild, order, cult, or movement to the Everloop\u2019s shifting alliances.',
  },
  event: {
    title: 'Create an Event',
    editTitle: 'Edit Event',
    description: 'Mark a moment that fractured or reshaped the world \u2014 a cataclysm, a treaty, a vanishing.',
  },
  concept: {
    title: 'Create a Concept',
    editTitle: 'Edit Concept',
    description: 'Define an idea, force, or principle that threads through the Everloop\u2019s deeper logic.',
  },
}

export default async function CreateEntityPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>
  searchParams: Promise<{ edit?: string }>
}) {
  const { type } = await params
  const { edit: editId } = await searchParams
  
  if (!validTypes.includes(type as EntityType)) {
    notFound()
  }
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirected=true')
  }

  const config = typeConfig[type as EntityType]
  
  // If editing, fetch existing entity data
  let initialData: {
    id: string
    name: string
    tagline: string
    description: string
    imageUrl: string | null
  } | undefined

  if (editId) {
    const result = await getEntity(editId)
    if (result.success && result.entity) {
      // Verify entity type matches
      if (result.entity.type !== type) {
        notFound()
      }
      initialData = {
        id: result.entity.id,
        name: result.entity.name,
        tagline: result.entity.extended_lore?.tagline || '',
        description: result.entity.description || '',
        imageUrl: result.entity.extended_lore?.image_url || null,
      }
    } else {
      // Entity not found or not owned by user
      notFound()
    }
  }

  const isEditMode = !!initialData

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl md:text-4xl font-serif text-parchment mb-2">
            {isEditMode ? config.editTitle : config.title}
          </h1>
          <p className="text-parchment-muted">
            {config.description}
          </p>
        </div>

        {/* Form */}
        <CreateEntityForm 
          type={type as EntityType} 
          initialData={initialData}
          isEditMode={isEditMode}
        />
      </div>
    </div>
  )
}
