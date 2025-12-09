import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  User, 
  BookOpen, 
  Calendar, 
  Sparkles, 
  PenLine,
  ArrowLeft,
  Award,
  Clock,
  Settings
} from 'lucide-react'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

interface ProfileData {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: string | null
  reputation_score: number | null
  created_at: string
}

async function getProfile(username: string): Promise<ProfileData | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data as ProfileData
}

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

interface StoryData {
  id: string
  title: string
  slug: string
  excerpt: string | null
  word_count: number | null
  canon_status: string | null
  created_at: string
}

async function getAuthorStories(authorId: string): Promise<StoryData[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      slug,
      excerpt,
      word_count,
      canon_status,
      created_at
    `)
    .eq('author_id', authorId)
    .in('canon_status', ['approved', 'canonical'])
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching author stories:', error)
    return []
  }
  
  return (data as StoryData[]) || []
}

async function getAuthorStats(authorId: string) {
  const supabase = await createClient()
  
  // Get story stats
  const { data: stories } = await supabase
    .from('stories')
    .select('word_count, canon_status')
    .eq('author_id', authorId)
  
  // Get entity stats
  const { data: entities } = await supabase
    .from('canon_entities')
    .select('id, canon_status')
    .eq('created_by', authorId)
  
  type StoryRow = { word_count: number | null; canon_status: string | null }
  type EntityRow = { id: string; canon_status: string | null }
  
  const canonicalStories = (stories as StoryRow[] | null)?.filter(s => 
    s.canon_status === 'approved' || s.canon_status === 'canonical'
  ) || []
  
  const totalWords = canonicalStories.reduce((sum, s) => sum + (s.word_count || 0), 0)
  
  const canonicalEntities = (entities as EntityRow[] | null)?.filter(e => 
    e.canon_status === 'approved' || e.canon_status === 'canonical'
  ) || []
  
  return {
    storyCount: canonicalStories.length,
    totalWords,
    entityCount: canonicalEntities.length
  }
}

function getRoleBadge(role: string) {
  const badges: Record<string, { label: string; className: string }> = {
    admin: { label: 'Administrator', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    lorekeeper: { label: 'Lorekeeper', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    curator: { label: 'Curator', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    writer: { label: 'Writer', className: 'bg-gold/20 text-gold border-gold/30' },
  }
  return badges[role] || badges.writer
}

function getReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 200)
  return `${minutes} min`
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params
  const profile = await getProfile(username)
  
  if (!profile) {
    return { title: 'Author Not Found | Everloop' }
  }
  
  const displayName = profile.display_name || profile.username
  return {
    title: `${displayName} | Everloop Author`,
    description: profile.bio || `Read stories by ${displayName} in the Everloop universe`,
  }
}

export default async function AuthorProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const profile = await getProfile(username)
  
  if (!profile) {
    notFound()
  }
  
  const [stories, stats, currentUserId] = await Promise.all([
    getAuthorStories(profile.id),
    getAuthorStats(profile.id),
    getCurrentUserId()
  ])
  
  const isOwnProfile = currentUserId === profile.id
  const displayName = profile.display_name || profile.username
  const roleBadge = getRoleBadge(profile.role || 'writer')
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-deep via-teal-rich to-teal-deep">
      {/* Header */}
      <header className="border-b border-gold/10 bg-teal-deep/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/stories" 
              className="flex items-center gap-2 text-parchment-muted hover:text-parchment transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Library</span>
            </Link>
            <Link href="/" className="text-xl font-serif">
              <span className="text-parchment">Ever</span>
              <span className="text-gold">loop</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Author Header */}
        <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url}
                alt={displayName}
                className="w-32 h-32 rounded-full border-2 border-gold/30 object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-teal-rich border-2 border-gold/30 flex items-center justify-center">
                <User className="w-16 h-16 text-gold/50" />
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-serif text-parchment">
                {displayName}
              </h1>
              <Badge className={roleBadge.className}>
                {roleBadge.label}
              </Badge>
            </div>
            
            <p className="text-parchment-muted mb-4">@{profile.username}</p>
            
            {profile.bio && (
              <p className="text-parchment/80 mb-6 max-w-2xl leading-relaxed">
                {profile.bio}
              </p>
            )}
            
            <div className="flex items-center gap-2 text-sm text-parchment-muted">
              <Calendar className="w-4 h-4" />
              <span>Member since {memberSince}</span>
            </div>
            
            {/* Edit Profile Button - only show for own profile */}
            {isOwnProfile && (
              <Link href="/settings/profile" className="mt-4 inline-block">
                <Button variant="outline" size="sm" className="gap-2 border-gold/30 text-parchment hover:bg-gold/10">
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="p-6 rounded-lg bg-teal-rich/50 border border-gold/10 text-center">
            <div className="flex items-center justify-center gap-2 text-gold mb-2">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-3xl font-serif text-parchment mb-1">
              {stats.storyCount}
            </div>
            <div className="text-sm text-parchment-muted">
              Canon Stories
            </div>
          </div>
          
          <div className="p-6 rounded-lg bg-teal-rich/50 border border-gold/10 text-center">
            <div className="flex items-center justify-center gap-2 text-gold mb-2">
              <PenLine className="w-5 h-5" />
            </div>
            <div className="text-3xl font-serif text-parchment mb-1">
              {stats.totalWords.toLocaleString()}
            </div>
            <div className="text-sm text-parchment-muted">
              Words Written
            </div>
          </div>
          
          <div className="p-6 rounded-lg bg-teal-rich/50 border border-gold/10 text-center">
            <div className="flex items-center justify-center gap-2 text-gold mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-3xl font-serif text-parchment mb-1">
              {stats.entityCount}
            </div>
            <div className="text-sm text-parchment-muted">
              Canon Entities
            </div>
          </div>
        </div>
        
        {/* Stories Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Award className="w-6 h-6 text-gold" />
            <h2 className="text-2xl font-serif text-parchment">
              Canonical Stories
            </h2>
          </div>
          
          {stories.length > 0 ? (
            <div className="grid gap-6">
              {stories.map((story) => (
                <Link 
                  key={story.id}
                  href={`/stories/${story.slug}`}
                  className="block p-6 rounded-lg bg-teal-rich/30 border border-gold/10 
                             hover:border-gold/30 hover:bg-teal-rich/50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-serif text-parchment group-hover:text-gold transition-colors mb-2">
                        {story.title}
                      </h3>
                      
                      {story.excerpt && (
                        <p className="text-parchment-muted line-clamp-2 mb-4">
                          {story.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-parchment-muted">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{story.word_count?.toLocaleString() || 0} words</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{getReadingTime(story.word_count || 0)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(story.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Badge className="bg-gold/10 text-gold border-gold/30 flex-shrink-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Canon
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <PenLine className="w-12 h-12 text-parchment-muted mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-parchment mb-2">
                No canonical stories yet
              </h3>
              <p className="text-parchment-muted">
                {displayName} hasn&apos;t had any stories approved for the canon yet.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gold/10 mt-16">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-parchment-muted">
          <p>© 2024 Everloop. All stories live forever.</p>
          <Link href="/stories" className="hover:text-gold transition-colors">
            ← Back to Library
          </Link>
        </div>
      </footer>
    </div>
  )
}
