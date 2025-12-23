import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  PenLine, 
  Trash2, 
  ExternalLink,
  BookOpen,
  Award,
  AlertCircle
} from 'lucide-react'
import { DeleteStoryButton } from './delete-story-button'
import { WritingStatsCard } from '@/components/dashboard/writing-stats-card'

export const metadata = {
  title: 'My Dashboard | Everloop',
  description: 'Manage your stories and track your progress in the Everloop universe',
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

async function getUserStories(userId: string): Promise<UserStory[]> {
  const supabase = await createClient()
  
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

async function getUserStats(userId: string) {
  const supabase = await createClient()
  
  const [drafts, submitted, approved, rejected] = await Promise.all([
    supabase.from('stories').select('*', { count: 'exact', head: true }).eq('author_id', userId).eq('canon_status', 'draft'),
    supabase.from('stories').select('*', { count: 'exact', head: true }).eq('author_id', userId).in('canon_status', ['submitted', 'under_review']),
    supabase.from('stories').select('*', { count: 'exact', head: true }).eq('author_id', userId).in('canon_status', ['approved', 'canonical']),
    supabase.from('stories').select('*', { count: 'exact', head: true }).eq('author_id', userId).eq('canon_status', 'rejected'),
  ])
  
  return {
    drafts: drafts.count || 0,
    submitted: submitted.count || 0,
    approved: approved.count || 0,
    rejected: rejected.count || 0,
    total: (drafts.count || 0) + (submitted.count || 0) + (approved.count || 0) + (rejected.count || 0),
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

function StoryRow({ story, variant }: { story: UserStory; variant: 'draft' | 'pending' | 'published' | 'rejected' }) {
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

function EmptyState({ variant }: { variant: 'draft' | 'pending' | 'published' | 'rejected' }) {
  const messages = {
    draft: { icon: FileText, title: 'No Drafts', message: 'Start writing your first story!' },
    pending: { icon: Clock, title: 'Nothing Pending', message: 'Submit a story for review to see it here.' },
    published: { icon: Award, title: 'No Published Stories', message: 'Get your stories approved to become canon!' },
    rejected: { icon: CheckCircle, title: 'No Rejections', message: "Great news! None of your stories have been rejected." },
  }
  
  const { icon: Icon, title, message } = messages[variant]
  
  return (
    <div className="text-center py-12">
      <Icon className="w-12 h-12 mx-auto mb-4 text-parchment-muted/50" />
      <h3 className="font-serif text-lg text-parchment mb-2">{title}</h3>
      <p className="text-parchment-muted text-sm">{message}</p>
      {variant === 'draft' && (
        <Link href="/write" className="inline-block mt-4">
          <Button className="gap-2">
            <PenLine className="w-4 h-4" />
            Start Writing
          </Button>
        </Link>
      )}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirected=true')
  }
  
  // Fetch profile for welcome message
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', user.id)
    .single() as { data: { username: string | null, display_name: string | null } | null }
  
  const displayName = profile?.display_name || profile?.username || 'Writer'
  
  const [stories, stats] = await Promise.all([
    getUserStories(user.id),
    getUserStats(user.id),
  ])
  
  // Categorize stories
  const drafts = stories.filter(s => s.canon_status === 'draft')
  const pending = stories.filter(s => ['submitted', 'under_review'].includes(s.canon_status))
  const published = stories.filter(s => ['approved', 'canonical'].includes(s.canon_status))
  const rejected = stories.filter(s => s.canon_status === 'rejected')

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
            Track your stories and monitor their journey to becoming canon.
          </p>
        </div>

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
          <TabsList className="grid w-full grid-cols-4 bg-teal-deep/50 border border-gold/10">
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
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gold/10 mt-16">
        <div className="container mx-auto flex items-center justify-between text-sm text-parchment-muted">
          <p>© 2024 Everloop. All stories live forever.</p>
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
