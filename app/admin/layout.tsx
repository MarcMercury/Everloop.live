import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Check is_admin flag
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single() as { data: { is_admin: boolean | null } | null; error: Error | null }
  
  if (!profile || profile.is_admin !== true) {
    redirect('/explore')
  }
  
  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-serif">
                <span className="text-parchment">Ever</span>
                <span className="text-gold">loop</span>
              </Link>
              <span className="text-xs px-2 py-1 rounded bg-gold/20 text-gold font-medium border border-gold/30">
                ADMIN
              </span>
            </div>
            
            <nav className="flex items-center gap-6 text-sm">
              <Link 
                href="/admin" 
                className="text-parchment-muted hover:text-parchment transition-colors"
              >
                Submissions
              </Link>
              <Link 
                href="/admin/entities" 
                className="text-parchment-muted hover:text-parchment transition-colors"
              >
                Entities
              </Link>
              <div className="w-px h-4 bg-gold/20" />
              <Link 
                href="/explore" 
                className="text-parchment-muted hover:text-parchment transition-colors"
              >
                ← Back to Site
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      {children}
    </div>
  )
}
