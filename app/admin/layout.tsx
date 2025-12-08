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
  
  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', user.id)
    .single() as { data: { role: string; username: string } | null; error: Error | null }
  
  // Allow if admin or lorekeeper, or if no profile (dev mode)
  const isAdmin = !profile || profile.role === 'admin' || profile.role === 'lorekeeper'
  
  if (!isAdmin) {
    redirect('/explore')
  }
  
  return (
    <div className="min-h-screen bg-charcoal">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 glass border-b border-charcoal-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-serif">
                <span className="text-foreground">Ever</span>
                <span className="text-gold">loop</span>
              </Link>
              <span className="text-xs px-2 py-1 rounded bg-gold/20 text-gold font-medium">
                ADMIN
              </span>
            </div>
            
            <nav className="flex items-center gap-6 text-sm">
              <Link 
                href="/admin" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Submissions
              </Link>
              <Link 
                href="/admin/entities" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Entities
              </Link>
              <div className="w-px h-4 bg-charcoal-700" />
              <Link 
                href="/explore" 
                className="text-muted-foreground hover:text-foreground transition-colors"
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
