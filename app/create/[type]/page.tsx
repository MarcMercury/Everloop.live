import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateEntityForm } from './create-form'
import { getEntity, type EntityType } from '@/lib/actions/create'

const validTypes = ['character', 'location', 'creature'] as const

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
