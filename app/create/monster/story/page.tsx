import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateEntityForm } from '@/app/create/[type]/create-form'

export default async function CreateStoryMonsterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirected=true')
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl md:text-4xl font-serif text-parchment mb-2">
            Create a Story Monster
          </h1>
          <p className="text-parchment-muted">
            Manifest a Drift-born horror — something that should not exist, but the Fray made
            real. This creature lives in prose and atmosphere.
          </p>
        </div>

        {/* Reuse the existing entity creation form configured for monsters */}
        <CreateEntityForm type="monster" />
      </div>
    </div>
  )
}
