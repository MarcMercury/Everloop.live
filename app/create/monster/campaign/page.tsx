import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MonsterCampaignWizard } from '@/components/editor/monster-campaign-wizard'

export default async function CreateCampaignMonsterPage() {
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
        <div className="max-w-2xl mx-auto mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-serif text-parchment mb-2">
            Forge a <span className="text-red-400">Campaign Monster</span>
          </h1>
          <p className="text-parchment-muted">
            Build a fully statted D&D 5e monster with combat role, stats, actions, and
            Everloop lore — ready for your campaigns and quests.
          </p>
        </div>

        {/* Wizard */}
        <MonsterCampaignWizard />
      </div>
    </div>
  )
}
