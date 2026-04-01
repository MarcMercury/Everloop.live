import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  
  // Fetch counts from database with error handling
  let profileCount = 0
  let storyCount = 0
  try {
    const [profilesResult, storiesResult] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('stories').select('id', { count: 'exact', head: true }).in('canon_status', ['approved', 'canonical'])
    ])
    profileCount = profilesResult.count ?? 0
    storyCount = storiesResult.count ?? 0
  } catch (e) {
    console.error('Error fetching homepage counts:', e)
  }

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col relative overflow-hidden">
      {/* Decorative floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-light/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-gold/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo/Title with enhanced styling */}
          <div className="relative">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif tracking-tight">
              <span className="text-parchment">Ever</span>
              <span className="canon-text">loop</span>
            </h1>
            {/* Subtitle flourish */}
            <p className="text-sm tracking-[0.3em] text-parchment-muted uppercase mt-4">
              Stories from the Broken World
            </p>
          </div>

          {/* Ornate divider */}
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold/40 to-gold/60" />
            <div className="flex items-center gap-2">
              <span className="text-gold/40 text-xs">✦</span>
              <div className="w-2 h-2 rotate-45 bg-gold/60 shadow-lg shadow-gold/30" />
              <span className="text-gold/40 text-xs">✦</span>
            </div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent via-gold/40 to-gold/60" />
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-parchment-dark max-w-2xl mx-auto leading-relaxed">
            A collaborative universe where writers build the history of a world that is slowly unraveling.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link
              href="/explore"
              className="btn-fantasy text-lg"
            >
              ✦ Enter the Archive
            </Link>
            <Link
              href="/write"
              className="btn-outline-fantasy text-lg"
            >
              Begin Your Story
            </Link>
          </div>

          {/* Atmospheric stats */}
          <div className="pt-20">
            <div className="inline-flex items-center gap-8 px-8 py-4 rounded-full 
                          bg-teal-rich/50 border border-gold/10
                          shadow-lg shadow-black/20">
              <div className="text-center">
                <div className="text-2xl font-serif text-gold">{storyCount || '∞'}</div>
                <div className="text-xs text-parchment-muted tracking-wide">Stories</div>
              </div>
              <div className="w-px h-8 bg-gold/20" />
              <div className="text-center">
                <div className="text-2xl font-serif text-gold">{profileCount}</div>
                <div className="text-xs text-parchment-muted tracking-wide">Writers</div>
              </div>
              <div className="w-px h-8 bg-gold/20" />
              <div className="text-center">
                <div className="text-2xl font-serif text-gold">1</div>
                <div className="text-xs text-parchment-muted tracking-wide">Universe</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* What is Everloop — Intro Section */}
      <section className="relative z-10 py-20 px-6 border-t border-gold/10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-serif text-parchment">
            A Collaborative Canon Engine
          </h2>
          <p className="text-lg text-parchment-dark max-w-3xl mx-auto leading-relaxed">
            Everloop is a writing platform and living universe. Every story you write, every 
            character you create, every location you name becomes part of a shared canon that 
            other writers and players build upon. There are two ways to enter the Everloop.
          </p>
        </div>
      </section>

      {/* Explore / Write / Play */}
      <section className="relative z-10 py-16 px-6 border-t border-gold/10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="story-card p-6 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-light/10 border border-teal-light/20 flex items-center justify-center text-lg">🌍</div>
                <h3 className="text-xl font-serif text-parchment">Explore</h3>
              </div>
              <p className="text-sm text-parchment-dark leading-relaxed">
                Dive into Everloop: uncover stories, study the lore, explore vast maps, and immerse yourself in a living, shifting world.
              </p>
            </div>
            <div className="story-card p-6 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-lg">✍️</div>
                <h3 className="text-xl font-serif text-parchment">Write</h3>
              </div>
              <p className="text-sm text-parchment-dark leading-relaxed">
                Expand the canon: create characters, locations, creatures, or full stories and contribute them to the Everloop universe.
              </p>
            </div>
            <div className="story-card p-6 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg">⚔️</div>
                <h3 className="text-xl font-serif text-parchment">Play</h3>
              </div>
              <p className="text-sm text-parchment-dark leading-relaxed">
                Build and experience: craft characters, quests, and campaigns—whether grounded in canon or wild one-shots in a reality unraveling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Two Paths Section */}
      <section className="relative z-10 py-16 px-6 border-t border-gold/10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Path 1 — Build the Universe */}
            <div className="story-card p-8 text-left relative overflow-hidden group hover:border-gold/40 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-xl">
                    📜
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.15em] text-gold/60 uppercase">Path One</p>
                    <h3 className="text-2xl font-serif text-parchment">Build the Universe</h3>
                  </div>
                </div>
                <p className="text-parchment-dark text-sm leading-relaxed mb-6">
                  Write stories and add them to the Everloop universe canon. Create locations, 
                  NPCs, factions, and artifacts that other writers reference and that players 
                  encounter in campaigns. Every creation expands the shared world.
                </p>
                <div className="space-y-2.5 text-sm text-parchment-muted mb-8">
                  <div className="flex items-center gap-2">
                    <span className="text-gold">✦</span>
                    <span><span className="text-parchment">Library</span> — Read the canonical stories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gold">✦</span>
                    <span><span className="text-parchment">Archive</span> — Browse all canonical entities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gold">✦</span>
                    <span><span className="text-parchment">Create</span> — Build characters, locations & creatures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gold">✦</span>
                    <span><span className="text-parchment">My Roster</span> — Manage and submit your creations</span>
                  </div>
                </div>
                <Link
                  href="/create"
                  className="btn-fantasy text-sm inline-flex"
                >
                  ✦ Start Creating
                </Link>
              </div>
            </div>

            {/* Path 2 — Play the Canon */}
            <div className="story-card p-8 text-left relative overflow-hidden group hover:border-purple-500/40 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl">
                    ⚔️
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.15em] text-purple-400/60 uppercase">Path Two</p>
                    <h3 className="text-2xl font-serif text-parchment">Play the Canon</h3>
                  </div>
                </div>
                <p className="text-parchment-dark text-sm leading-relaxed mb-6">
                  Step into the world as a player. Run campaigns as a Dungeon Master, 
                  embark on guided quests solo or with friends, and build persistent 
                  characters that carry their story across every adventure.
                </p>
                <div className="space-y-2.5 text-sm text-parchment-muted mb-8">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">✦</span>
                    <span><span className="text-parchment">Campaigns</span> — Run or join live campaign sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">✦</span>
                    <span><span className="text-parchment">Quests</span> — Solo, party & AI-guided adventures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">✦</span>
                    <span><span className="text-parchment">Player Deck</span> — Build & manage your characters</span>
                  </div>
                </div>
                <Link
                  href="/campaigns"
                  className="btn-outline-fantasy text-sm inline-flex"
                >
                  Enter the Fray →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Library Preview */}
      <section className="relative z-10 py-16 px-6 border-t border-gold/10">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-serif text-parchment">
            From the Library
          </h2>
          <p className="text-sm text-parchment-muted max-w-2xl mx-auto">
            Stories written by the community that have been approved as canon. 
            Every story shapes what comes next.
          </p>
          <div className="pt-4">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors text-sm font-medium"
            >
              Browse the Full Library →
            </Link>
          </div>
        </div>
      </section>

      {/* Features Row */}
      <section className="relative z-10 py-16 px-6 border-t border-gold/10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="story-card text-center">
              <div className="text-3xl mb-3">📜</div>
              <h3 className="font-serif text-parchment text-lg">Write &amp; Publish</h3>
              <p className="text-sm text-parchment-muted mt-2">Draft stories with AI analysis, then submit to canon review</p>
            </div>
            <div className="story-card text-center">
              <div className="text-3xl mb-3">⚔️</div>
              <h3 className="font-serif text-parchment text-lg">Campaign &amp; Quest Engine</h3>
              <p className="text-sm text-parchment-muted mt-2">5 game modes, live sessions, AI co-DM, and the Fray engine</p>
            </div>
            <div className="story-card text-center">
              <div className="text-3xl mb-3">🌀</div>
              <h3 className="font-serif text-parchment text-lg">Shared Canon</h3>
              <p className="text-sm text-parchment-muted mt-2">Every creation feeds back into the world — writers and players build together</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-gold/10 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-parchment-muted">
          <p>&copy; {new Date().getFullYear()} Everloop. All stories live forever.</p>
          <nav className="flex gap-6">
            <Link href="/about" className="hover:text-gold transition-colors">
              About
            </Link>
            <Link href="/guidelines" className="hover:text-gold transition-colors">
              Guidelines
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
