import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo/Title */}
          <h1 className="text-display font-serif tracking-tight">
            <span className="text-foreground">Ever</span>
            <span className="canon-text">loop</span>
          </h1>

          {/* Tagline */}
          <p className="text-subtitle text-muted-foreground max-w-2xl mx-auto">
            A collaborative story universe where writers build within a living world
            — <span className="text-gold">guided by AI</span>, grounded in canon.
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 py-6">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-gold/50" />
            <div className="w-2 h-2 rotate-45 bg-gold" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-gold/50" />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center px-10 py-4 text-xl font-medium 
                         bg-gold text-charcoal rounded-md transition-all duration-300
                         hover:bg-gold-400 hover:shadow-lg hover:shadow-gold/20
                         canon-glow"
            >
              Enter the Archive
            </Link>
            <Link
              href="/stories"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium
                         border border-gold/30 text-gold rounded-md transition-all duration-300
                         hover:border-gold hover:bg-gold/10"
            >
              Read Stories
            </Link>
          </div>

          {/* Stats or info */}
          <div className="pt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto text-center">
            <div>
              <div className="text-2xl font-serif text-gold">∞</div>
              <div className="text-sm text-muted-foreground">Stories</div>
            </div>
            <div>
              <div className="text-2xl font-serif text-gold">1</div>
              <div className="text-sm text-muted-foreground">Universe</div>
            </div>
            <div>
              <div className="text-2xl font-serif text-gold">You</div>
              <div className="text-sm text-muted-foreground">Writer</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-charcoal-700">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
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
