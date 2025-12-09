import { createClient, createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Admin Dashboard | Everloop',
  description: 'Manage story submissions and canon entities',
}

interface StorySubmission {
  id: string
  title: string
  created_at: string
  canon_status: string
  word_count: number | null
  author: {
    username: string
  } | null
  reviews: Array<{
    canon_consistency_score: number | null
    decision: string | null
    is_ai_review: boolean
  }>
}

async function getSubmissions(): Promise<StorySubmission[]> {
  // Use admin client to bypass RLS - admin page should see all submissions
  const adminClient = createAdminClient()
  
  if (!adminClient) {
    console.error('Admin client not available for submissions query')
    return []
  }
  
  const { data, error } = await adminClient
    .from('stories')
    .select(`
      id,
      title,
      created_at,
      canon_status,
      word_count,
      author:profiles(username),
      reviews:story_reviews(canon_consistency_score, decision, is_ai_review)
    `)
    .in('canon_status', ['submitted', 'under_review'])
    .order('created_at', { ascending: false }) as { 
      data: StorySubmission[] | null
      error: Error | null 
    }
  
  if (error) {
    console.error('Error fetching submissions:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return []
  }
  
  console.log('Stories fetched:', data?.length || 0, 'items')
  
  return data || []
}

async function getStats() {
  // Use admin client to bypass RLS for accurate counts
  const adminClient = createAdminClient()
  
  if (!adminClient) {
    return { pending: 0, approved: 0, rejected: 0 }
  }
  
  const [pending, approved, rejected] = await Promise.all([
    adminClient.from('stories').select('*', { count: 'exact', head: true }).eq('canon_status', 'submitted'),
    adminClient.from('stories').select('*', { count: 'exact', head: true }).eq('canon_status', 'approved'),
    adminClient.from('stories').select('*', { count: 'exact', head: true }).eq('canon_status', 'rejected'),
  ])
  
  return {
    pending: pending.count || 0,
    approved: approved.count || 0,
    rejected: rejected.count || 0,
  }
}

function getScoreBadge(score: number | null) {
  if (score === null) return null
  
  if (score >= 85) {
    return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Score: {score}</Badge>
  } else if (score >= 50) {
    return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Score: {score}</Badge>
  } else {
    return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Score: {score}</Badge>
  }
}

export default async function AdminPage() {
  const [submissions, stats] = await Promise.all([
    getSubmissions(),
    getStats(),
  ])

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">Submission Queue</h1>
        <p className="text-muted-foreground">
          Review and approve stories for the Everloop canon
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-navy/30 border border-charcoal-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-navy/30 border border-charcoal-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-navy/30 border border-charcoal-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Submissions List */}
      <div className="rounded-lg border border-charcoal-700 overflow-hidden">
        <div className="bg-navy/30 px-4 py-3 border-b border-charcoal-700">
          <h2 className="font-medium">Pending Submissions</h2>
        </div>
        
        {submissions.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">No Pending Submissions</h3>
            <p className="text-muted-foreground">
              All stories have been reviewed. Check back later.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-charcoal-700">
            {submissions.map((story) => {
              const aiReview = story.reviews?.find(r => r.is_ai_review)
              const aiScore = aiReview?.canon_consistency_score
              
              return (
                <Link
                  key={story.id}
                  href={`/admin/review/${story.id}`}
                  className="flex items-center justify-between p-4 hover:bg-navy/20 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-foreground truncate">
                        {story.title}
                      </h3>
                      {getScoreBadge(aiScore ?? null)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>by {story.author?.username || 'Unknown'}</span>
                      <span>•</span>
                      <span>{story.word_count || 0} words</span>
                      <span>•</span>
                      <span>{new Date(story.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
