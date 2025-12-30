import Link from 'next/link'

export default function Home() {
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
                <div className="text-2xl font-serif text-gold">∞</div>
                <div className="text-xs text-parchment-muted tracking-wide">Stories</div>
              </div>
              <div className="w-px h-8 bg-gold/20" />
              <div className="text-center">
                <div className="text-2xl font-serif text-gold">1</div>
                <div className="text-xs text-parchment-muted tracking-wide">Universe</div>
              </div>
              <div className="w-px h-8 bg-gold/20" />
              <div className="text-center">
                <div className="text-2xl font-serif text-gold">You</div>
                <div className="text-xs text-parchment-muted tracking-wide">Writer</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-gold/10 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-parchment-muted">
          <p>© 2024 Everloop. All stories live forever.</p>
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
