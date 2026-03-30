import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SceneBuilderClient } from './scene-builder-client'
import type { Campaign, CampaignScene } from '@/types/campaign'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function SceneBuilderPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: campaignData } = await supabase
    .from('campaigns')
    .select('*')
    .eq('slug', slug)
    .single()

  const campaign = campaignData as unknown as Campaign | null
  if (!campaign) notFound()
  if (campaign.dm_id !== user.id) redirect(`/campaigns/${slug}`)

  const { data: scenes } = await supabase
    .from('campaign_scenes')
    .select('*')
    .eq('campaign_id', campaign.id)
    .order('scene_order', { ascending: true })

  // Fetch canon entities for linking
  const { data: entities } = await supabase
    .from('canon_entities')
    .select('id, name, type, slug')
    .in('status', ['canonical', 'proposed'])
    .order('name')
    .limit(100)

  return (
    <SceneBuilderClient
      campaign={campaign}
      scenes={(scenes ?? []) as unknown as CampaignScene[]}
      entities={(entities ?? []) as { id: string; name: string; type: string; slug: string }[]}
    />
  )
}
