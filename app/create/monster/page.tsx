import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Swords, ChevronRight, ArrowLeft } from 'lucide-react'
import { getEntity } from '@/lib/actions/create'
import { CreateEntityForm } from '@/app/create/[type]/create-form'

const monsterPurposes = [
  {
    purpose: 'story',
    title: 'For a Story',
    description:
      'Create a narrative creature — a Drift-born horror described through prose, atmosphere, and lore. This mirrors the creature creation wizard.',
    icon: BookOpen,
    gradient: 'from-red-500/20 to-rose-900/20',
    borderColor: 'border-red-500/30 hover:border-red-500/60',
    iconColor: 'text-red-400',
    href: '/create/monster/story',
  },
  {
    purpose: 'campaign',
    title: 'For a Quest / Quest',
    description:
      'Build a fully statted D&D 5e monster — with CR, HP, AC, actions, traits, and Everloop lore — ready to drop into encounters.',
    icon: Swords,
    gradient: 'from-red-600/20 to-orange-900/20',
    borderColor: 'border-orange-500/30 hover:border-orange-500/60',
    iconColor: 'text-orange-400',
    href: '/create/monster/quest',
  },
]

export default async function CreateMonsterPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirected=true')
  }

  const { edit: editId } = await searchParams

  // ── Edit mode ──────────────────────────────────────────────
  // The static /create/monster route shadows the dynamic [type] route, so
  // monster edits from the Roster land here. Render the entity editor
  // directly (prose-level fields; any quest stat block is preserved by
  // updateEntity's extended_lore merge).
  if (editId) {
    const result = await getEntity(editId)

    if (!result.success || !result.entity || result.entity.type !== 'monster') {
      redirect('/roster')
    }

    const entity = result.entity!
    const initialData = {
      id: entity.id,
      name: entity.name,
      tagline: entity.extended_lore?.tagline || '',
      description: entity.description || '',
      imageUrl: entity.extended_lore?.image_url || null,
    }

    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto mb-10">
            <h1 className="text-3xl md:text-4xl font-serif text-parchment mb-2">
              Edit <span className="text-red-400">Monster</span>
            </h1>
            <p className="text-parchment-muted">
              Refine this Drift-born horror. Its name, tagline, description, and image
              are editable here; any campaign stat block stays intact.
            </p>
          </div>

          <CreateEntityForm type="monster" initialData={initialData} isEditMode />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-parchment mb-4">
            Create <span className="text-red-400">Monster</span>
          </h1>
          <p className="text-parchment-muted text-lg max-w-2xl mx-auto">
            Monsters are not native to the Everloop. They appeared only after the Fray —
            fragments of the Drift leaking through fractured reality. Choose how this
            horror will serve your world.
          </p>
        </div>

        {/* Purpose Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {monsterPurposes.map((mp) => {
            const Icon = mp.icon
            return (
              <Link key={mp.purpose} href={mp.href}>
                <Card
                  className={`group h-full cursor-pointer transition-all duration-300 ${mp.borderColor} hover:scale-[1.02]`}
                >
                  <CardContent className="p-0">
                    <div
                      className={`h-36 bg-gradient-to-br ${mp.gradient} flex items-center justify-center`}
                    >
                      <div className="p-4 rounded-full bg-teal-deep/50 backdrop-blur-sm">
                        <Icon className={`w-12 h-12 ${mp.iconColor}`} />
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-serif text-parchment group-hover:text-gold transition-colors">
                          {mp.title}
                        </h2>
                        <ChevronRight className="w-5 h-5 text-parchment-muted group-hover:text-gold group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-parchment-muted text-sm">{mp.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 text-parchment-muted hover:text-gold transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Creator Studio
          </Link>
        </div>
      </div>
    </div>
  )
}
