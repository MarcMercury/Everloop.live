import Link from 'next/link'
import Image from 'next/image'
import { Headphones, BookOpen, ScrollText } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Decorative floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-900/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[150px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 md:pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif tracking-tight mb-4">
            <span className="canon-text">EVERLOOP</span>
          </h1>
          <p className="text-xl md:text-2xl font-serif text-parchment-muted">
            Welcome to The Broken World
          </p>
        </div>
      </section>

      {/* Structure Image */}
      <section className="relative z-10 px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-gold/20 shadow-2xl shadow-gold/10">
            <Image
              src="/Maps/New Structure Map.png"
              alt="Structure of the Everloop"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-deep/60 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Explore / Write / Play Tiles */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="story-card p-6 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-light/10 border border-teal-light/20 flex items-center justify-center text-lg">🌍</div>
                <h3 className="text-xl font-serif text-parchment">Explore</h3>
              </div>
              <p className="text-sm text-parchment-dark leading-relaxed">
                Dive into Everloop: uncover stories, study the lore, explore vast maps, and search for what the world has scattered across its regions.
              </p>
              <div className="space-y-1.5 pt-2 text-xs text-parchment-muted">
                <Link href="/map" className="flex items-center gap-2 hover:text-parchment transition-colors"><span className="text-teal-light">✦</span> Interactive Map</Link>
                <Link href="/stories" className="flex items-center gap-2 hover:text-parchment transition-colors"><span className="text-teal-light">✦</span> Library</Link>
                <Link href="/explore" className="flex items-center gap-2 hover:text-parchment transition-colors"><span className="text-teal-light">✦</span> Archive</Link>
              </div>
            </div>
            <div className="story-card p-6 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-lg">✍️</div>
                <h3 className="text-xl font-serif text-parchment">Write</h3>
              </div>
              <p className="text-sm text-parchment-dark leading-relaxed">
                Expand the canon: create characters, locations, creatures, or full stories — every entry moves the world closer to something no one fully understands yet.
              </p>
              <div className="space-y-1.5 pt-2 text-xs text-parchment-muted">
                <Link href="/create" className="flex items-center gap-2 hover:text-parchment transition-colors"><span className="text-gold">✦</span> Create</Link>
                <Link href="/roster" className="flex items-center gap-2 hover:text-parchment transition-colors"><span className="text-gold">✦</span> Roster</Link>
                <Link href="/write" className="flex items-center gap-2 hover:text-parchment transition-colors"><span className="text-gold">✦</span> Write</Link>
              </div>
            </div>
            <div className="story-card p-6 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg">⚔️</div>
                <h3 className="text-xl font-serif text-parchment">Play</h3>
              </div>
              <p className="text-sm text-parchment-dark leading-relaxed">
                Build and experience: craft playable characters, quests, and campaigns — every path through the Everloop bends toward what was broken and what might yet be found.
              </p>
              <div className="space-y-1.5 pt-2 text-xs text-parchment-muted">
                <Link href="/player-deck" className="flex items-center gap-2 hover:text-parchment transition-colors"><span className="text-purple-400">✦</span> Player Deck</Link>
                <Link href="/campaigns" className="flex items-center gap-2 hover:text-parchment transition-colors"><span className="text-purple-400">✦</span> Campaigns</Link>
                <Link href="/quests" className="flex items-center gap-2 hover:text-parchment transition-colors"><span className="text-purple-400">✦</span> Quests</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audio — Listen to the Narrative */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-md mx-auto">
          <div className="rounded-lg border border-gold/15 bg-teal-rich/30 backdrop-blur-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-4 h-4 text-gold/70" />
              </div>
              <div>
                <p className="text-sm font-medium text-parchment">Listen to the Narrative</p>
                <p className="text-xs text-parchment-muted">The Everloop — spoken aloud</p>
              </div>
            </div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
              controls
              preload="none"
              className="w-full h-10 [&::-webkit-media-controls-panel]:bg-teal-deep/80 [&::-webkit-media-controls-current-time-display]:text-parchment-muted [&::-webkit-media-controls-time-remaining-display]:text-parchment-muted"
            >
              <source src="/audio/everloop-narrative.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      </section>

      {/* Brief Intro Text */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* The Drift */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" />
            <div className="pl-8">
              <h2 className="text-sm uppercase tracking-[0.2em] text-purple-400/80 mb-3 font-medium">The Drift</h2>
              <p className="text-lg leading-relaxed text-parchment-muted">
                Before anything could remain, there was only the <span className="text-purple-300 font-medium">Drift</span> — a boundless chaos where matter and intent dissolved as quickly as they formed. Within it moved the <span className="text-parchment">Prime Beings</span>, vast forces that gave weight to the chaos, but never held it.
              </p>
            </div>
          </div>

          {/* The Fold */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/30 to-transparent" />
            <div className="pl-8">
              <h2 className="text-sm uppercase tracking-[0.2em] text-blue-400/80 mb-3 font-medium">The Fold</h2>
              <p className="text-lg leading-relaxed text-parchment-muted">
                At the edge of that unrest, the motion slowed. That boundary became the <span className="text-blue-300 font-medium">Fold</span> — and within it, something endured. The <span className="text-parchment">First Architects</span> shaped the First Map, not of land, but of possibility itself. From it, they wove the <span className="text-blue-300 font-medium">Pattern</span>, a hidden structure that allows time, memory, and matter to remain.
              </p>
            </div>
          </div>

          {/* The Anchors */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
            <div className="pl-8">
              <h2 className="text-sm uppercase tracking-[0.2em] text-gold/80 mb-3 font-medium">The Anchors</h2>
              <p className="text-lg leading-relaxed text-parchment-muted mb-4">
                To keep it from collapsing, they became the <span className="text-gold font-medium">Anchors</span>.
              </p>
              <p className="text-lg leading-relaxed text-parchment-muted">
                Around them, the <span className="canon-text font-semibold">Everloop</span> rose — a living world where things can exist long enough to matter.
              </p>
            </div>
          </div>

          {/* The Breaking */}
          <div className="text-center py-4">
            <div className="w-16 h-px bg-red-500/40 mx-auto mb-6" />
            <p className="text-2xl md:text-3xl font-serif text-parchment leading-relaxed">
              But the Pattern is <span className="text-red-400 font-medium">thinning</span>.
            </p>
            <div className="w-16 h-px bg-red-500/40 mx-auto mt-6" />
          </div>

          {/* The Unraveling */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-red-500/30 to-transparent" />
            <div className="pl-8">
              <h2 className="text-sm uppercase tracking-[0.2em] text-red-400/80 mb-3 font-medium">The Unraveling</h2>
              <p className="text-lg leading-relaxed text-parchment-muted mb-4">
                In some places, existence fades into the <span className="text-parchment">Hollows</span>. In others, it fractures into the <span className="text-red-400">Fray</span>. The Rogue Architects, in trying to repair what was failing, shattered the Anchors — leaving behind the <span className="text-gold font-medium">Shards</span>, fragments scattered across every region, each still humming with the intent that once held the world together.
              </p>
              <p className="text-lg leading-relaxed text-parchment-muted mb-4">
                They pull toward one another. Slowly, inevitably, across distances no map fully records.
              </p>
              <p className="text-lg leading-relaxed text-parchment italic">
                No one knows what happens when they are all brought together.
              </p>
            </div>
          </div>

          {/* The Conclusion */}
          <div className="text-center py-4">
            <p className="text-xl md:text-2xl font-serif text-parchment-muted leading-relaxed mb-4">
              The world is not ending.
            </p>
            <p className="text-3xl md:text-4xl font-serif text-parchment mb-4">
              It is being <span className="canon-text font-semibold">decided</span>.
            </p>
            <p className="text-sm text-parchment-muted/60 italic">
              And every story told here is part of that decision.
            </p>
          </div>
        </div>
      </section>

      {/* Guide Links */}
      <section className="relative z-10 py-16 px-6 border-t border-gold/10">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link href="/readers-guide" className="story-card p-6 flex items-center gap-4 hover:border-gold/40 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="text-lg font-serif text-parchment group-hover:text-gold transition-colors">Reader&apos;s Guide</h3>
                <p className="text-xs text-parchment-muted">A glossary of the world as it is known</p>
              </div>
            </Link>
            <Link href="/players-guide" className="story-card p-6 flex items-center gap-4 hover:border-purple-500/40 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <ScrollText className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-serif text-parchment group-hover:text-purple-400 transition-colors">Player&apos;s Guide</h3>
                <p className="text-xs text-parchment-muted">What you need to know before stepping in</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-gold/10 relative z-10 mt-auto">
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
