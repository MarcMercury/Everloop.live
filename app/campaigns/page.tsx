import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getConvergenceState } from '@/lib/data/world-state'
import { GAME_MODE_INFO } from '@/types/campaign'
import type { GameMode, CampaignStatus } from '@/types/campaign'
import { Plus, Users, Clock, Flame, Search, Swords, Target, Skull, Eye } from 'lucide-react'
import { WorldPulse, FrayIndicator, MonsterWarning } from '@/components/world-pulse'

interface CampaignRow { id: string; title: string; slug: string; description: string | null; dm_id: string; game_mode: string; status: string; max_players: number; is_public: boolean; session_count: number; fray_intensity: number; updated_at: string; dm: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null; [key: string]: unknown }

export default async function CampaignsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const convergence = await getConvergenceState()

  // Fetch public campaigns
  const { data: campaignsData } = await supabase
    .from('campaigns')
    .select('*, dm:profiles!campaigns_dm_id_fkey(id, username, display_name, avatar_url)')
    .eq('is_public', true)
    .in('status', ['lobby', 'ready', 'active', 'recruiting', 'in_progress'])
    .order('updated_at', { ascending: false })

  const campaigns = (campaignsData ?? []) as unknown as CampaignRow[]

  // Fetch my campaigns (DM + player)
  let myCampaigns: CampaignRow[] = []
  if (user) {
    const { data: dmCampaignsData } = await supabase
      .from('campaigns')
      .select('*, dm:profiles!campaigns_dm_id_fkey(id, username, display_name, avatar_url)')
      .eq('dm_id', user.id)
      .order('updated_at', { ascending: false })

    const { data: playerEntries } = await supabase
      .from('campaign_players')
      .select('campaign_id')
      .eq('user_id', user.id)
      .in('status', ['pending', 'accepted'])

    const playerIds = ((playerEntries ?? []) as unknown as { campaign_id: string }[]).map(p => p.campaign_id)

    let playerCampaigns: CampaignRow[] = []
    if (playerIds.length > 0) {
      const { data } = await supabase
        .from('campaigns')
        .select('*, dm:profiles!campaigns_dm_id_fkey(id, username, display_name, avatar_url)')
        .in('id', playerIds)
        .order('updated_at', { ascending: false })
      playerCampaigns = (data ?? []) as unknown as CampaignRow[]
    }

    const all = [...((dmCampaignsData ?? []) as unknown as CampaignRow[]), ...playerCampaigns]
    const seen = new Set<string>()
    myCampaigns = all.filter(c => {
      if (seen.has(c.id)) return false
      seen.add(c.id)
      return true
    })
  }

  const gameModeIcon = (mode: string) => {
    switch (mode) {
      case 'classic': return <Swords className="w-4 h-4" />
      case 'one_shot': return <Target className="w-4 h-4" />
      case 'survivor': return <Flame className="w-4 h-4" />
      case 'mystery': return <Search className="w-4 h-4" />
      case 'social_deception': return <Eye className="w-4 h-4" />
      default: return <Swords className="w-4 h-4" />
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'lobby': case 'recruiting':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Open Lobby</span>
      case 'ready':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Ready</span>
      case 'active': case 'in_progress':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Active</span>
      case 'paused':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Paused</span>
      case 'complete': case 'completed':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Complete</span>
      case 'archived':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-500/20 text-gray-500 border border-gray-500/20">Archived</span>
      case 'draft':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Draft</span>
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-500/20 text-gray-400">{status}</span>
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif">
            <span className="text-parchment">Campaign</span>{' '}
            <span className="canon-text">Engine</span>
          </h1>
          <p className="text-parchment-muted mt-2 max-w-xl">
            Enter the Everloop as a player. Join campaigns, build your character, and follow the pull that draws all things toward what was broken.
          </p>
        </div>
        {user && (
          <Link
            href="/campaigns/create"
            className="btn-fantasy flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </Link>
        )}
      </div>

      {/* Game Mode Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-12">
        <div className="md:col-span-1">
          <WorldPulse convergence={convergence} />
        </div>
        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-5 gap-3">
          {(Object.entries(GAME_MODE_INFO) as [GameMode, typeof GAME_MODE_INFO[GameMode]][]).map(([key, mode]) => (
          <div
            key={key}
            className="story-card text-center p-4 hover:border-gold/40 transition-all cursor-pointer"
          >
            <div className="text-2xl mb-2">{mode.icon}</div>
            <div className="text-sm font-serif text-parchment">{mode.name}</div>
            <div className="text-xs text-parchment-muted mt-1">{mode.estimatedLength}</div>
          </div>
        ))}
        </div>
      </div>

      {/* My Campaigns */}
      {user && myCampaigns && myCampaigns.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-parchment mb-6 flex items-center gap-2">
            <Skull className="w-5 h-5 text-gold" />
            My Campaigns
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCampaigns.map((campaign) => {
              const mode = GAME_MODE_INFO[campaign.game_mode as GameMode]
              const isDM = campaign.dm_id === user.id
              return (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.slug}`}
                  className="story-card group block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {gameModeIcon(campaign.game_mode)}
                      <span className="text-xs text-parchment-muted">{mode?.name ?? campaign.game_mode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isDM && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gold/20 text-gold border border-gold/30">DM</span>
                      )}
                      {statusBadge(campaign.status)}
                    </div>
                  </div>
                  <h3 className="text-lg font-serif text-parchment group-hover:text-gold transition-colors">
                    {campaign.title}
                  </h3>
                  {campaign.description && (
                    <p className="text-sm text-parchment-muted mt-2 line-clamp-2">{campaign.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-4 text-xs text-parchment-muted">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {campaign.max_players} max
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {campaign.session_count} sessions
                    </span>
                    <FrayIndicator intensity={campaign.fray_intensity ?? 0.15} />
                  </div>
                  <MonsterWarning frayIntensity={campaign.fray_intensity ?? 0.15} className="mt-2" />
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Public Campaigns */}
      <section>
        <h2 className="text-2xl font-serif text-parchment mb-6 flex items-center gap-2">
          <Swords className="w-5 h-5 text-gold" />
          Open Campaigns
        </h2>
        {campaigns && campaigns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const mode = GAME_MODE_INFO[campaign.game_mode as GameMode]
              const dm = campaign.dm
              return (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.slug}`}
                  className="story-card group block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {gameModeIcon(campaign.game_mode)}
                      <span className="text-xs text-parchment-muted">{mode?.name ?? campaign.game_mode}</span>
                    </div>
                    {statusBadge(campaign.status)}
                  </div>
                  <h3 className="text-lg font-serif text-parchment group-hover:text-gold transition-colors">
                    {campaign.title}
                  </h3>
                  {campaign.description && (
                    <p className="text-sm text-parchment-muted mt-2 line-clamp-2">{campaign.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 text-xs text-parchment-muted">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {campaign.max_players} max
                      </span>
                      <FrayIndicator intensity={campaign.fray_intensity ?? 0.15} />
                    </div>
                    {dm && (
                      <span className="text-xs text-parchment-muted">
                        DM: <span className="text-gold">{dm.display_name ?? dm.username}</span>
                      </span>
                    )}
                  </div>
                  <MonsterWarning frayIntensity={campaign.fray_intensity ?? 0.15} className="mt-2" />
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="story-card text-center py-16">
            <Swords className="w-12 h-12 text-parchment-muted mx-auto mb-4" />
            <p className="text-parchment-muted">No open campaigns yet.</p>
            {user && (
              <Link href="/campaigns/create" className="btn-fantasy mt-4 inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Be the First DM
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
