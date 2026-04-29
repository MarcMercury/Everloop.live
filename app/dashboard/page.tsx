import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUser, getProfile } from '@/lib/supabase/cached'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  PenLine, 
  ExternalLink,
  Award,
  AlertCircle,
  Swords,
  Users,
  Shield,
  Crown,
  Plus
} from 'lucide-react'
import { DeleteStoryButton } from './delete-story-button'
import { WritingStatsCard } from '@/components/dashboard/writing-stats-card'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { GAME_MODE_INFO } from '@/types/campaign'
import type { GameMode } from '@/types/campaign'
import type { PlayerCharacter } from '@/types/player-character'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export const metadata = {
  title: 'My Dashboard | Everloop',
  description: 'Manage your stories and track your progress in the Everloop universe',
}

interface DashboardCampaign {
  id: string
  title: string
  slug: string
  description: string | null
  dm_id: string
  game_mode: string
  status: string
  max_players: number
  session_count: number
  updated_at: string
  dm: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null
}

interface UserStory {
  id: string
  title: string
  slug: string
  word_count: number
  canon_status: string
  created_at: string
  updated_at: string
  reviews: Array<{
    id: string
    canon_consistency_score: number | null
    quality_score: number | null
    feedback: string | null
    decision: string | null
    is_ai_review: boolean
    created_at: string
  }>
}

async function getUserStories(supabase: SupabaseServerClient, userId: string): Promise<UserStory[]> {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      slug,
      word_count,
      canon_status,
      created_at,
      updated_at,
      reviews:story_reviews(
        id,
        canon_consistency_score,
        quality_score,
        feedback,
        decision,
        is_ai_review,
        created_at
      )
    `)
    .eq('author_id', userId)
    .order('updated_at', { ascending: false }) as { data: UserStory[] | null; error: Error | null }
  
  if (error) {
    console.error('Error fetching user stories:', error)
    return []
  }
  
  return data || []
}

async function getUserStats(supabase: SupabaseServerClient, userId: string) {
  const [drafts, submitted, revisions, approved, rejected] = await Promise.all([
    supabase.from('stories').select('*', { count: 'exact', head: true }).eq('author_id', userId).eq('canon_status', 'draft'),
    supabase.from('stories').select('*', { count: 'exact', head: true }).eq('author_id', userId).in('canon_status', ['submitted', 'under_review']),
    supabase.from('stories').select('*', { count: 'exact', head: true }).eq('author_id', userId).eq('canon_status', 'revision_requested'),
    // `approved` is a legacy state; surface it alongside `canonical` so any
    // pre-existing rows still show up under Published.
    supabase.from('stories').select('*', { count: 'exact', head: true }).eq('author_id', userId).in('canon_status', ['approved', 'canonical']),
    supabase.from('stories').select('*', { count: 'exact', head: true }).eq('author_id', userId).eq('canon_status', 'rejected'),
  ])

  return {
    drafts: drafts.count || 0,
    submitted: submitted.count || 0,
    revisions: revisions.count || 0,
    approved: approved.count || 0,
    rejected: rejected.count || 0,
    total:
      (drafts.count || 0) +
      (submitted.count || 0) +
      (revisions.count || 0) +
      (approved.count || 0) +
      (rejected.count || 0),
  }
}

function getScoreBadge(score: number | null) {
  if (score === null) return null
  
  if (score >= 85) {
    return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Score: {score}</Badge>
  } else if (score >= 50) {
    return <Badge className="bg-gold/20 text-gold border-gold/30">Score: {score}</Badge>
  } else {
    return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Score: {score}</Badge>
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function StoryRow({ story, variant }: { story: UserStory; variant: 'draft' | 'pending' | 'revision' | 'published' | 'rejected' }) {
  const latestReview = story.reviews
    .filter(r => r.is_ai_review)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  
  const adminReview = story.reviews
    .filter(r => !r.is_ai_review && r.feedback)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-teal-rich/30 border border-gold/10 hover:border-gold/20 transition-colors">
      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-lg text-parchment truncate">{story.title}</h3>
        <div className="flex items-center gap-4 mt-1 text-sm text-parchment-muted">
          <span>{story.word_count} words</span>
          <span>Updated {formatDate(story.updated_at)}</span>
          {variant === 'pending' && latestReview && getScoreBadge(latestReview.canon_consistency_score)}
        </div>
        
        {/* Show rejection feedback */}
        {variant === 'rejected' && (adminReview?.feedback || latestReview?.feedback) && (
          <div className="mt-3 p-3 rounded bg-red-500/10 border border-red-500/20 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-red-400 font-medium">Feedback: </span>
                <span className="text-parchment-muted">
                  {adminReview?.feedback || latestReview?.feedback}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Show revision-request feedback */}
        {variant === 'revision' && (adminReview?.feedback || latestReview?.feedback) && (
          <div className="mt-3 p-3 rounded bg-amber-500/10 border border-amber-500/20 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-amber-400 font-medium">Revisions requested: </span>
                <span className="text-parchment-muted">
                  {adminReview?.feedback || latestReview?.feedback}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        {variant === 'draft' && (
          <>
            <Link href={`/write?id=${story.id}`}>
              <Button variant="outline" size="sm" className="gap-1">
                <PenLine className="w-3 h-3" />
                Continue
              </Button>
            </Link>
            <DeleteStoryButton storyId={story.id} storyTitle={story.title} />
          </>
        )}
        
        {variant === 'pending' && (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            In Review
          </Badge>
        )}

        {variant === 'revision' && (
          <Link href={`/write?id=${story.id}`}>
            <Button variant="outline" size="sm" className="gap-1 border-amber-500/40 text-amber-300 hover:bg-amber-500/10">
              <PenLine className="w-3 h-3" />
              Revise & Resubmit
            </Button>
          </Link>
        )}

        {variant === 'published' && (
          <Link href={`/stories/${story.slug}`}>
            <Button variant="outline" size="sm" className="gap-1">
              <ExternalLink className="w-3 h-3" />
              View
            </Button>
          </Link>
        )}
        
        {variant === 'rejected' && (
          <Link href={`/write?id=${story.id}`}>
            <Button variant="outline" size="sm" className="gap-1">
              <PenLine className="w-3 h-3" />
              Revise
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

function EmptyState({ variant }: { variant: 'draft' | 'pending' | 'revision' | 'published' | 'rejected' }) {
  const messages = {
    draft: { icon: FileText, title: 'No Drafts', message: 'Use the Write button in the navigation to start your first story!' },
    pending: { icon: Clock, title: 'Nothing Pending', message: 'Submit a story for review to see it here.' },
    revision: { icon: AlertCircle, title: 'No Revision Requests', message: 'When a Lorekeeper asks for changes, those stories appear here.' },
    published: { icon: Award, title: 'No Published Stories', message: 'Once a Lorekeeper approves a story it is published straight to the Library and shows up here.' },
    rejected: { icon: CheckCircle, title: 'No Rejections', message: "Great news! None of your stories have been rejected." },
  }
  
  const { icon: Icon, title, message } = messages[variant]
  
  return (
    <div className="text-center py-12">
      <Icon className="w-12 h-12 mx-auto mb-4 text-parchment-muted/50" />
      <h3 className="font-serif text-lg text-parchment mb-2">{title}</h3>
      <p className="text-parchment-muted text-sm">{message}</p>
    </div>
  )
}

// =====================================================
// PLAYING SECTION HELPERS
// =====================================================

async function getUserCampaigns(supabase: SupabaseServerClient, userId: string) {
  // Campaigns I DM
  const { data: dmCampaigns } = await supabase
    .from('campaigns')
    .select('id, title, slug, description, dm_id, game_mode, status, max_players, session_count, updated_at, dm:profiles!campaigns_dm_id_fkey(id, username, display_name, avatar_url)')
    .eq('dm_id', userId)
    .order('updated_at', { ascending: false })

  // Campaigns I'm a player in
  const { data: playerEntries } = await supabase
    .from('campaign_players')
    .select('campaign_id')
    .eq('user_id', userId)
    .in('status', ['pending', 'accepted'])

  let playerCampaigns: DashboardCampaign[] = []
  if (playerEntries && playerEntries.length > 0) {
    const ids = (playerEntries as unknown as { campaign_id: string }[]).map(p => p.campaign_id)
    const { data } = await supabase
      .from('campaigns')
      .select('id, title, slug, description, dm_id, game_mode, status, max_players, session_count, updated_at, dm:profiles!campaigns_dm_id_fkey(id, username, display_name, avatar_url)')
      .in('id', ids)
      .order('updated_at', { ascending: false })
    playerCampaigns = (data ?? []) as unknown as DashboardCampaign[]
  }

  const dmList = (dmCampaigns ?? []) as unknown as DashboardCampaign[]
  // Tag which are DM'd vs played
  const dmd = dmList.map(c => ({ ...c, isDm: true }))
  const played = playerCampaigns.filter(c => !dmList.some(d => d.id === c.id)).map(c => ({ ...c, isDm: false }))

  return { dmd, played }
}

async function getUserCharacters(supabase: SupabaseServerClient, userId: string) {
  const { data } = await supabase
    .from('player_characters')
    .select('id, name, race, class, level, current_hp, max_hp, armor_class, is_active, portrait_url, theme_color, campaign_name, updated_at')
    .eq('user_id', userId)
    .order('is_active', { ascending: false })
    .order('updated_at', { ascending: false })

  return (data ?? []) as unknown as Pick<PlayerCharacter, 'id' | 'name' | 'race' | 'class' | 'level' | 'current_hp' | 'max_hp' | 'armor_class' | 'is_active' | 'portrait_url' | 'theme_color' | 'campaign_name' | 'updated_at'>[]
}

function getStatusBadge(status: string) {
  const map: Record<string, { color: string; label: string }> = {
    draft: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: 'Draft' },
    lobby: { color: 'bg-sky-500/20 text-sky-400 border-sky-500/30', label: 'Lobby' },
    ready: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Ready' },
    active: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Active' },
    paused: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Paused' },
    complete: { color: 'bg-gold/20 text-gold border-gold/30', label: 'Complete' },
    archived: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: 'Archived' },
    recruiting: { color: 'bg-sky-500/20 text-sky-400 border-sky-500/30', label: 'Recruiting' },
    in_progress: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'In Progress' },
  }
  const info = map[status] || { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: status }
  return <Badge className={info.color}>{info.label}</Badge>
}

function CampaignRow({ campaign, isDm }: { campaign: DashboardCampaign; isDm: boolean }) {
  const modeInfo = GAME_MODE_INFO[campaign.game_mode as GameMode]
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-teal-rich/30 border border-gold/10 hover:border-gold/20 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-lg text-parchment truncate">{campaign.title}</h3>
          {isDm && (
            <Badge className="bg-gold/20 text-gold border-gold/30 text-xs gap-1">
              <Crown className="w-3 h-3" />
              DM
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-parchment-muted">
          {modeInfo && <span>{modeInfo.icon} {modeInfo.name}</span>}
          {getStatusBadge(campaign.status)}
          <span>{campaign.session_count} sessions</span>
          {!isDm && campaign.dm && (
            <span>DM: {campaign.dm.display_name || campaign.dm.username}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <Link href={`/campaigns/${campaign.slug}`}>
          <Button variant="outline" size="sm" className="gap-1">
            <ExternalLink className="w-3 h-3" />
            Open
          </Button>
        </Link>
      </div>
    </div>
  )
}

function CharacterRow({ character }: { character: Pick<PlayerCharacter, 'id' | 'name' | 'race' | 'class' | 'level' | 'current_hp' | 'max_hp' | 'armor_class' | 'is_active' | 'portrait_url' | 'theme_color' | 'campaign_name' | 'updated_at'> }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-teal-rich/30 border border-gold/10 hover:border-gold/20 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {character.portrait_url ? (
          <img src={character.portrait_url} alt={character.name} className="w-10 h-10 rounded-full border border-gold/20 object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center" style={{ backgroundColor: character.theme_color || '#1a3a3a' }}>
            <Shield className="w-5 h-5 text-parchment-muted" />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg text-parchment truncate">{character.name}</h3>
            {character.is_active && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Active</Badge>}
          </div>
          <div className="flex items-center gap-3 text-sm text-parchment-muted">
            <span>Lvl {character.level} {character.race} {character.class}</span>
            <span>HP {character.current_hp}/{character.max_hp}</span>
            <span>AC {character.armor_class}</span>
            {character.campaign_name && <span className="truncate">• {character.campaign_name}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <Link href={`/player-deck/${character.id}`}>
          <Button variant="outline" size="sm" className="gap-1">
            <ExternalLink className="w-3 h-3" />
            View
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login?redirected=true')
  }
  
  // Use cached profile (same as Navbar — zero extra calls)
  const cachedProfile = await getProfile()
  const displayName = cachedProfile?.display_name || cachedProfile?.username || 'Adventurer'
  
  // Single shared client for all dashboard queries
  const supabase = await createClient()
  
  const [stories, stats, campaigns, characters] = await Promise.all([
    getUserStories(supabase, user.id),
    getUserStats(supabase, user.id),
    getUserCampaigns(supabase, user.id),
    getUserCharacters(supabase, user.id),
  ])
  
  // Categorize stories
  const drafts = stories.filter(s => s.canon_status === 'draft')
  const pending = stories.filter(s => ['submitted', 'under_review'].includes(s.canon_status))
  const revisions = stories.filter(s => s.canon_status === 'revision_requested')
  // `approved` is a legacy status that pre-dates the direct approve→canonical
  // transition. Keep it grouped with `canonical` so old rows still appear here.
  const published = stories.filter(s => ['approved', 'canonical'].includes(s.canon_status))
  const rejected = stories.filter(s => s.canon_status === 'rejected')

  const allCampaigns = [...campaigns.dmd, ...campaigns.played]
  const totalCharacters = characters.length

  // =====================================================
  // WRITING SECTION
  // =====================================================
  const writingContent = (
    <>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/10">
                <FileText className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-serif text-parchment">{stats.total}</p>
                <p className="text-xs text-parchment-muted">Total Stories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10">
                <PenLine className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <p className="text-2xl font-serif text-parchment">{stats.drafts}</p>
                <p className="text-xs text-parchment-muted">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-serif text-parchment">{stats.approved}</p>
                <p className="text-xs text-parchment-muted">Canon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-serif text-parchment">{stats.submitted}</p>
                <p className="text-xs text-parchment-muted">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Writing Stats Card */}
      <div className="mb-10">
        <WritingStatsCard />
      </div>

      {/* Story Tabs */}
      <Tabs defaultValue="drafts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-teal-deep/50 border border-gold/10">
          <TabsTrigger value="drafts" className="gap-2 data-[state=active]:bg-teal-rich data-[state=active]:text-gold">
            <PenLine className="w-4 h-4" />
            <span className="hidden sm:inline">Drafts</span>
            <Badge variant="secondary" className="ml-1">{drafts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-teal-rich data-[state=active]:text-gold">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Pending</span>
            <Badge variant="secondary" className="ml-1">{pending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="revisions" className="gap-2 data-[state=active]:bg-teal-rich data-[state=active]:text-gold">
            <AlertCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Revisions</span>
            <Badge variant="secondary" className="ml-1">{revisions.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="published" className="gap-2 data-[state=active]:bg-teal-rich data-[state=active]:text-gold">
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Published</span>
            <Badge variant="secondary" className="ml-1">{published.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2 data-[state=active]:bg-teal-rich data-[state=active]:text-gold">
            <XCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Rejected</span>
            <Badge variant="secondary" className="ml-1">{rejected.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drafts" className="space-y-3">
          {drafts.length > 0 ? (
            drafts.map(story => (
              <StoryRow key={story.id} story={story} variant="draft" />
            ))
          ) : (
            <EmptyState variant="draft" />
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-3">
          {pending.length > 0 ? (
            pending.map(story => (
              <StoryRow key={story.id} story={story} variant="pending" />
            ))
          ) : (
            <EmptyState variant="pending" />
          )}
        </TabsContent>

        <TabsContent value="revisions" className="space-y-3">
          {revisions.length > 0 ? (
            revisions.map(story => (
              <StoryRow key={story.id} story={story} variant="revision" />
            ))
          ) : (
            <EmptyState variant="revision" />
          )}
        </TabsContent>

        <TabsContent value="published" className="space-y-3">
          {published.length > 0 ? (
            published.map(story => (
              <StoryRow key={story.id} story={story} variant="published" />
            ))
          ) : (
            <EmptyState variant="published" />
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-3">
          {rejected.length > 0 ? (
            rejected.map(story => (
              <StoryRow key={story.id} story={story} variant="rejected" />
            ))
          ) : (
            <EmptyState variant="rejected" />
          )}
        </TabsContent>
      </Tabs>
    </>
  )

  // =====================================================
  // PLAYING SECTION
  // =====================================================
  const playingContent = (
    <>
      {/* Playing Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/10">
                <Swords className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-serif text-parchment">{allCampaigns.length}</p>
                <p className="text-xs text-parchment-muted">Total Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-serif text-parchment">{campaigns.dmd.length}</p>
                <p className="text-xs text-parchment-muted">As DM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10">
                <Users className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <p className="text-2xl font-serif text-parchment">{campaigns.played.length}</p>
                <p className="text-xs text-parchment-muted">As Player</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-serif text-parchment">{totalCharacters}</p>
                <p className="text-xs text-parchment-muted">Characters</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif text-parchment">My Campaigns</h2>
          <Link href="/campaigns/create">
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="w-3 h-3" />
              New Campaign
            </Button>
          </Link>
        </div>
        
        {allCampaigns.length > 0 ? (
          <div className="space-y-3">
            {campaigns.dmd.map(c => (
              <CampaignRow key={c.id} campaign={c} isDm={true} />
            ))}
            {campaigns.played.map(c => (
              <CampaignRow key={c.id} campaign={c} isDm={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Swords className="w-12 h-12 mx-auto mb-4 text-parchment-muted/50" />
            <h3 className="font-serif text-lg text-parchment mb-2">No Campaigns Yet</h3>
            <p className="text-parchment-muted text-sm mb-4">Create or join a campaign to begin your adventure.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/campaigns/create">
                <Button variant="outline" className="gap-1">
                  <Plus className="w-4 h-4" />
                  Create Campaign
                </Button>
              </Link>
              <Link href="/campaigns">
                <Button variant="outline" className="gap-1">
                  <Users className="w-4 h-4" />
                  Browse Campaigns
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Characters Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif text-parchment">My Characters</h2>
          <Link href="/player-deck/create">
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="w-3 h-3" />
              New Character
            </Button>
          </Link>
        </div>

        {characters.length > 0 ? (
          <div className="space-y-3">
            {characters.map(c => (
              <CharacterRow key={c.id} character={c} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 mx-auto mb-4 text-parchment-muted/50" />
            <h3 className="font-serif text-lg text-parchment mb-2">No Characters Yet</h3>
            <p className="text-parchment-muted text-sm mb-4">Create a character to join campaigns.</p>
            <Link href="/player-deck/create">
              <Button variant="outline" className="gap-1">
                <Plus className="w-4 h-4" />
                Create Character
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  )

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        {/* Welcome & Page Title */}
        <div className="mb-10">
          <p className="text-parchment-muted text-sm mb-1">Welcome back,</p>
          <h1 className="text-3xl md:text-4xl font-serif text-parchment mb-2">
            {displayName}&apos;s <span className="text-gold">Dashboard</span>
          </h1>
          <p className="text-parchment-muted">
            Track your stories and adventures across the Everloop.
          </p>
        </div>

        {/* Top-level Writing / Playing Tabs */}
        <DashboardShell
          writingContent={writingContent}
          playingContent={playingContent}
        />
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gold/10 mt-16">
        <div className="container mx-auto flex items-center justify-between text-sm text-parchment-muted">
          <p>&copy; {new Date().getFullYear()} Everloop. All stories live forever.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-gold transition-colors">
              About
            </Link>
            <Link href="/guidelines" className="hover:text-gold transition-colors">
              Guidelines
            </Link>
            <Link href="/" className="hover:text-gold transition-colors">
              ← Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
