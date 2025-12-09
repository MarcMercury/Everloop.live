import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { PenLine, User, LogOut, BookOpen, LayoutDashboard, Palette, Shield, Library } from 'lucide-react'

interface ProfileData {
  username: string | null
  display_name: string | null
  avatar_url: string | null
}

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch profile if user exists
  let profile: ProfileData | null = null
  let isAdmin = false
  
  if (user) {
    // Fetch profile data
    const { data } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single()
    
    profile = data as ProfileData | null
    
    // Use RPC to check admin status - bypasses RLS
    const { data: adminCheck } = await supabase.rpc('is_admin_check')
    isAdmin = adminCheck === true
  }
  
  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-serif tracking-tight">
              <span className="text-parchment">Ever</span>
              <span className="canon-text">loop</span>
            </span>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link 
              href="/explore"
              className="flex items-center gap-2 text-sm text-parchment-muted hover:text-parchment transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Archive</span>
            </Link>
            
            <Link 
              href="/stories"
              className="flex items-center gap-2 text-sm text-parchment-muted hover:text-parchment transition-colors"
            >
              <Library className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </Link>
            
            {user ? (
              <>
                {/* Authenticated User */}
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm text-parchment-muted hover:text-parchment transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                
                <Link 
                  href="/create"
                  className="flex items-center gap-2 text-sm text-parchment-muted hover:text-parchment transition-colors"
                >
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">Create</span>
                </Link>
                
                <Link href="/write">
                  <Button variant="outline" size="sm" className="gap-2 border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50">
                    <PenLine className="w-4 h-4" />
                    <span className="hidden sm:inline">Write</span>
                  </Button>
                </Link>
                
                {/* Admin Link - only for admins/lorekeepers */}
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="gap-2 border-gold/50 bg-gold/10 text-gold hover:bg-gold/20">
                      <Shield className="w-4 h-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </Button>
                  </Link>
                )}
                
                {/* Profile Dropdown / Link */}
                <div className="flex items-center gap-3">
                  <Link 
                    href={profile?.username ? `/profile/${profile.username}` : '/dashboard'}
                    className="flex items-center gap-2 text-sm text-parchment-muted hover:text-parchment transition-colors"
                  >
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.display_name || profile.username || 'Profile'} 
                        className="w-8 h-8 rounded-full border border-gold/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-teal-rich border border-gold/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-parchment-muted" />
                      </div>
                    )}
                    <span className="hidden md:inline">
                      {profile?.display_name || profile?.username || 'Profile'}
                    </span>
                  </Link>
                  
                  {/* Sign Out */}
                  <form action={signout}>
                    <Button 
                      type="submit"
                      variant="ghost" 
                      size="sm"
                      className="text-parchment-muted hover:text-parchment hover:bg-teal-light/20"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline ml-2">Sign Out</span>
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <>
                {/* Unauthenticated User */}
                <Link href="/login">
                  <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="canon" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
