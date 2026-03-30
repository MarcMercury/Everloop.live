import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { GAME_MODE_INFO, MOOD_THEMES } from '@/types/campaign'
import type { GameMode, CampaignPlayer, CampaignScene, CampaignSession } from '@/types/campaign'
import { Users, Clock, Flame, Shield, Swords, Play, Settings, Map, Plus, Crown, UserPlus } from 'lucide-react'
import { CampaignLobbyClient } from './campaign-lobby-client'

// Row shapes for Supabase type assertions
interface CampaignRow { id: string; title: string; slug: string; description: string | null; dm_id: string; game_mode: string; status: string; max_players: number; is_public: boolean; session_count: number; fray_intensity: number; dm: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null; [key: string]: unknown }
interface PlayerRow { id: string; campaign_id: string; user_id: string; character_id: string | null; role: string; status: string; joined_at: string | null; user: { username: string; display_name: string | null; avatar_url: string | null } | null; character: { name: string; class: string; level: number; race: string; current_hp: number; max_hp: number; theme_color: string } | null; [key: string]: unknown }
interface SceneRow { id: string; title: string; scene_type: string; mood: string; status: string; scene_order: number; [key: string]: unknown }
interface SessionRow { id: string; session_number: number; title: string | null; status: string; active_scene_id: string | null; summary: string | null; [key: string]: unknown }

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CampaignPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch campaign
  const { data: campaignData } = await supabase
    .from('campaigns')
    .select('*, dm:profiles!campaigns_dm_id_fkey(id, username, display_name, avatar_url)')
    .eq('slug', slug)
    .single()

  const campaign = campaignData as unknown as CampaignRow | null
  if (!campaign) notFound()

  // Fetch players
  const { data: playersData } = await supabase
    .from('campaign_players')
    .select(`
      *,
      user:profiles!campaign_players_user_id_fkey(id, username, display_name, avatar_url),
      character:player_characters!campaign_players_character_id_fkey(id, name, race, class, level, current_hp, max_hp, armor_class, portrait_url, theme_color)
    `)
    .eq('campaign_id', campaign.id)
    .order('joined_at', { ascending: true })

  const players = (playersData ?? []) as unknown as PlayerRow[]

  // Fetch scenes
  const { data: scenesData } = await supabase
    .from('campaign_scenes')
    .select('*')
    .eq('campaign_id', campaign.id)
    .order('scene_order', { ascending: true })

  const scenes = (scenesData ?? []) as unknown as SceneRow[]

  // Fetch active session
  const { data: activeSessionData } = await supabase
    .from('campaign_sessions')
    .select('*')
    .eq('campaign_id', campaign.id)
    .in('status', ['active', 'paused'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const activeSession = activeSessionData as unknown as SessionRow | null

  // Fetch all sessions for history
  const { data: sessionsData } = await supabase
    .from('campaign_sessions')
    .select('*')
    .eq('campaign_id', campaign.id)
    .order('session_number', { ascending: false })

  const sessions = (sessionsData ?? []) as unknown as SessionRow[]

  // Fetch user's characters for selection
  let myCharacters: { id: string; name: string; class: string; level: number; race: string }[] = []
  if (user) {
    const { data } = await supabase
      .from('player_characters')
      .select('id, name, class, level, race')
      .eq('user_id', user.id)
      .eq('is_active', true)
    myCharacters = (data ?? []) as { id: string; name: string; class: string; level: number; race: string }[]
  }

  const isDM = user?.id === campaign.dm_id
  const myPlayer = players.find(p => p.user_id === user?.id)
  const isPlayer = myPlayer?.status === 'accepted'
  const mode = GAME_MODE_INFO[campaign.game_mode as GameMode]
  const dm = campaign.dm
  const acceptedPlayers = players.filter(p => p.status === 'accepted')
  const pendingPlayers = players.filter(p => p.status === 'pending')

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-parchment-muted mb-4">
        <Link href="/campaigns" className="hover:text-parchment transition-colors">Campaigns</Link>
        <span>/</span>
        <span className="text-parchment">{campaign.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Campaign Header */}
          <div className="story-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{mode?.icon}</span>
                  <span className="text-sm text-parchment-muted">{mode?.name}</span>
                  <StatusBadge status={campaign.status} />
                </div>
                <h1 className="text-3xl md:text-4xl font-serif text-parchment">{campaign.title}</h1>
                {campaign.description && (
                  <p className="text-parchment-dark mt-3 leading-relaxed">{campaign.description}</p>
                )}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gold/10">
              <div className="flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4 text-gold" />
                <span className="text-parchment-muted">DM:</span>
                <span className="text-parchment">{dm?.display_name ?? dm?.username}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gold" />
                <span className="text-parchment">{acceptedPlayers.length}/{campaign.max_players}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gold" />
                <span className="text-parchment">{campaign.session_count} sessions</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-parchment">Fray: {Math.round((campaign.fray_intensity ?? 0.5) * 100)}%</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-6">
              {isDM && activeSession && (
                <Link
                  href={`/campaigns/${slug}/dm`}
                  className="btn-fantasy flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  DM Control Panel
                </Link>
              )}
              {isDM && !activeSession && (
                <Link
                  href={`/campaigns/${slug}/dm`}
                  className="btn-fantasy flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Session
                </Link>
              )}
              {isPlayer && activeSession && (
                <Link
                  href={`/campaigns/${slug}/play`}
                  className="btn-fantasy flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Enter Session
                </Link>
              )}
              {isDM && (
                <Link
                  href={`/campaigns/${slug}/scenes`}
                  className="btn-outline-fantasy flex items-center gap-2"
                >
                  <Map className="w-4 h-4" />
                  Scene Builder
                </Link>
              )}
            </div>
          </div>

          {/* Scenes Preview */}
          <div className="story-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif text-parchment flex items-center gap-2">
                <Map className="w-5 h-5 text-gold" />
                Scenes
              </h2>
              {isDM && (
                <Link
                  href={`/campaigns/${slug}/scenes`}
                  className="text-sm text-gold hover:text-gold/80 transition-colors"
                >
                  Manage →
                </Link>
              )}
            </div>
            {scenes && scenes.length > 0 ? (
              <div className="space-y-2">
                {scenes.map((scene, i) => {
                  const moodTheme = MOOD_THEMES[scene.mood as keyof typeof MOOD_THEMES]
                  const isActive = activeSession?.active_scene_id === scene.id
                  return (
                    <div
                      key={scene.id}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-gold/10 border border-gold/30'
                          : scene.status === 'completed'
                          ? 'bg-teal-rich/30 opacity-60'
                          : 'bg-teal-rich/50 border border-gold/5 hover:border-gold/20'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: `${moodTheme?.color}20`, color: moodTheme?.color }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-parchment font-medium">{scene.title}</div>
                        <div className="text-xs text-parchment-muted flex items-center gap-2">
                          <span>{scene.scene_type}</span>
                          <span>·</span>
                          <span>{moodTheme?.icon} {scene.mood}</span>
                        </div>
                      </div>
                      {isActive && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse">
                          LIVE
                        </span>
                      )}
                      {scene.status === 'completed' && (
                        <span className="text-xs text-parchment-muted">✓</span>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-parchment-muted text-sm">
                {isDM ? 'No scenes yet. Build your first scene!' : 'The DM is preparing scenes...'}
              </p>
            )}
          </div>

          {/* Session History */}
          {sessions && sessions.length > 0 && (
            <div className="story-card">
              <h2 className="text-xl font-serif text-parchment mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold" />
                Session History
              </h2>
              <div className="space-y-2">
                {sessions.map(session => (
                  <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg bg-teal-rich/30">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-sm font-bold text-gold">
                      {session.session_number}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-parchment">{session.title ?? `Session ${session.session_number}`}</div>
                      {session.summary && (
                        <div className="text-xs text-parchment-muted mt-1 line-clamp-1">{session.summary}</div>
                      )}
                    </div>
                    <StatusBadge status={session.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 space-y-6">
          {/* Join / Character Selection */}
          <CampaignLobbyClient
            campaignId={campaign.id}
            campaignSlug={slug}
            campaignStatus={campaign.status}
            campaignType={(campaign as Record<string, unknown>).campaign_type as string ?? 'dm_led'}
            characterEntryMode={(campaign as Record<string, unknown>).character_entry_mode as string ?? 'bring_own'}
            joinCode={(campaign as Record<string, unknown>).join_code as string | null ?? null}
            isDM={isDM}
            isPlayer={isPlayer}
            myPlayer={myPlayer as CampaignPlayer | undefined}
            myCharacters={myCharacters}
            pendingPlayers={pendingPlayers as unknown as CampaignPlayer[]}
            userId={user?.id}
          />

          {/* Party Roster */}
          <div className="story-card">
            <h3 className="text-lg font-serif text-parchment mb-4 flex items-center gap-2">
              <Swords className="w-4 h-4 text-gold" />
              Party
            </h3>
            {acceptedPlayers.length > 0 ? (
              <div className="space-y-3">
                {acceptedPlayers.map(player => {
                  const pUser = player.user as { username: string; display_name: string | null; avatar_url: string | null } | null
                  const char = player.character as { name: string; class: string; level: number; race: string; current_hp: number; max_hp: number; theme_color: string } | null
                  return (
                    <div key={player.id} className="flex items-center gap-3 p-2 rounded-lg bg-teal-rich/30">
                      {pUser?.avatar_url ? (
                        <img src={pUser.avatar_url} alt="" className="w-8 h-8 rounded-full border border-gold/20" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-teal-mid flex items-center justify-center text-xs text-parchment-muted">
                          {(pUser?.display_name ?? pUser?.username ?? '?')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-parchment truncate">{pUser?.display_name ?? pUser?.username}</div>
                        {char ? (
                          <div className="text-xs text-parchment-muted">
                            {char.name} · Lvl {char.level} {char.class}
                          </div>
                        ) : (
                          <div className="text-xs text-parchment-muted/50 italic">No character selected</div>
                        )}
                      </div>
                      {char && (
                        <div className="text-xs text-parchment-muted">
                          {char.current_hp}/{char.max_hp} HP
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-parchment-muted text-sm">No players yet.</p>
            )}

            {/* Pending Players (DM only) */}
            {isDM && pendingPlayers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gold/10">
                <h4 className="text-xs text-parchment-muted uppercase tracking-wider mb-2">Pending Requests</h4>
                {pendingPlayers.map(player => {
                  const pUser = player.user as { username: string; display_name: string | null } | null
                  return (
                    <div key={player.id} className="flex items-center justify-between p-2 rounded bg-teal-rich/30 mb-1">
                      <span className="text-sm text-parchment">{pUser?.display_name ?? pUser?.username}</span>
                      <div className="flex gap-1">
                        <form action={async () => {
                          'use server'
                          const { updatePlayerStatus } = await import('@/lib/actions/campaigns')
                          await updatePlayerStatus(campaign.id, player.id, 'accepted')
                        }}>
                          <button type="submit" className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 hover:bg-green-500/30">Accept</button>
                        </form>
                        <form action={async () => {
                          'use server'
                          const { updatePlayerStatus } = await import('@/lib/actions/campaigns')
                          await updatePlayerStatus(campaign.id, player.id, 'rejected')
                        }}>
                          <button type="submit" className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">Reject</button>
                        </form>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'recruiting':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Recruiting</span>
    case 'in_progress': case 'active':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Active</span>
    case 'completed':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Completed</span>
    case 'paused':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Paused</span>
    case 'draft':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Draft</span>
    case 'scheduled':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">Scheduled</span>
    default:
      return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-500/20 text-gray-400">{status}</span>
  }
}
