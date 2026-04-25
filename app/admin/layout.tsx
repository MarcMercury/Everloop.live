import { redirect } from 'next/navigation'
import { getUser, getIsAdmin } from '@/lib/supabase/cached'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const isAdmin = await getIsAdmin()
  
  if (!isAdmin) {
    redirect('/explore')
  }
  
  return (
    <div className="min-h-screen">
      {/* Admin sub-nav (the global Navbar already renders the logo + auth UI) */}
      <div className="border-b border-gold/15 bg-teal-deep/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 rounded bg-gold/20 text-gold font-medium border border-gold/30">
                ADMIN
              </span>
              <nav className="flex items-center gap-5 text-sm">
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
                <Link
                  href="/admin/shards"
                  className="text-parchment-muted hover:text-parchment transition-colors"
                >
                  Shards
                </Link>
                <Link
                  href="/admin/users"
                  className="text-parchment-muted hover:text-parchment transition-colors"
                >
                  Users
                </Link>
              </nav>
            </div>
            <Link
              href="/explore"
              className="text-xs text-parchment-muted hover:text-parchment transition-colors"
            >
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>

      {children}
    </div>
  )
}
