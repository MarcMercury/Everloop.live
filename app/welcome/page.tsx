import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Feather, ScrollText, Sparkles, Headphones } from 'lucide-react'

export const metadata = {
  title: 'Welcome to the Everloop',
  description: 'Enter a broken world that is slowly unraveling. Discover the lore of the Everloop universe.',
}

export default function WelcomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section — Cinematic Opening */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background atmospheric effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-900/10 rounded-full blur-[100px]" style={{ animationDuration: '8s', animationName: 'pulse' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          {/* Main Title */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-parchment-muted/60 mb-6">
              <span className="w-8 h-px bg-gold/30" />
              A Canon Engine
              <span className="w-8 h-px bg-gold/30" />
            </div>
            <h1 className="text-5xl md:text-7xl font-serif mb-6">
              <span className="text-parchment">Welcome to the </span>
              <span className="canon-text">Everloop</span>
            </h1>
          </div>

          {/* The Opening — The core hook */}
          <div className="max-w-3xl mx-auto mb-20">
            <blockquote className="text-center">
              <p className="text-2xl md:text-3xl font-serif text-parchment leading-relaxed italic">
                &ldquo;The world is not a natural occurrence.&rdquo;
              </p>
              <p className="text-xl md:text-2xl font-serif text-gold/80 mt-3 italic">
                It holds because something is holding it.
              </p>
            </blockquote>
          </div>

          {/* Audio — Listen to the Narrative */}
          <div className="max-w-md mx-auto mb-20">
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

          {/* The Drift — Origin */}
          <div className="relative mb-16">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" />
            <div className="pl-8">
              <h2 className="text-sm uppercase tracking-[0.2em] text-purple-400/80 mb-3 font-medium">The Drift</h2>
              <p className="text-lg md:text-xl leading-relaxed text-parchment-muted">
                Before anything could remain, there was only the <span className="text-purple-300 font-medium">Drift</span> — a boundless chaos where matter and intent dissolved as quickly as they formed. Within it moved the <span className="text-parchment">Prime Beings</span>, vast forces that gave weight to the chaos, but never held it.
              </p>
            </div>
          </div>

          {/* The Fold & Architects */}
          <div className="relative mb-16">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/30 to-transparent" />
            <div className="pl-8">
              <h2 className="text-sm uppercase tracking-[0.2em] text-blue-400/80 mb-3 font-medium">The Fold</h2>
              <p className="text-lg md:text-xl leading-relaxed text-parchment-muted">
                At the edge of that unrest, the motion slowed. That boundary became the <span className="text-blue-300 font-medium">Fold</span> — and within it, something endured. The <span className="text-parchment">First Architects</span> shaped the First Map, not of land, but of possibility itself. From it, they wove the <span className="text-blue-300 font-medium">Pattern</span>, a hidden structure that allows time, memory, and matter to remain.
              </p>
            </div>
          </div>

          {/* The Anchors & Everloop */}
          <div className="relative mb-16">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
            <div className="pl-8">
              <h2 className="text-sm uppercase tracking-[0.2em] text-gold/80 mb-3 font-medium">The Anchors</h2>
              <p className="text-lg md:text-xl leading-relaxed text-parchment-muted mb-4">
                To keep it from collapsing, they became the <span className="text-gold font-medium">Anchors</span>.
              </p>
              <p className="text-lg md:text-xl leading-relaxed text-parchment-muted">
                Around them, the <span className="canon-text font-semibold">Everloop</span> rose — a living world where things can exist long enough to matter.
              </p>
            </div>
          </div>

          {/* The Breaking — dramatic pause */}
          <div className="text-center my-20">
            <div className="w-16 h-px bg-red-500/40 mx-auto mb-8" />
            <p className="text-2xl md:text-3xl font-serif text-parchment leading-relaxed">
              But the Pattern is <span className="text-red-400 font-medium">thinning</span>.
            </p>
            <div className="w-16 h-px bg-red-500/40 mx-auto mt-8" />
          </div>

          {/* The Unraveling */}
          <div className="relative mb-16">
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-red-500/30 to-transparent" />
            <div className="pl-8">
              <h2 className="text-sm uppercase tracking-[0.2em] text-red-400/80 mb-3 font-medium">The Unraveling</h2>
              <p className="text-lg md:text-xl leading-relaxed text-parchment-muted mb-4">
                In some places, existence fades into the <span className="text-parchment">Hollows</span>. In others, it fractures into the <span className="text-red-400">Fray</span>. The Rogue Architects, in trying to repair what was failing, shattered the Anchors — leaving behind the <span className="text-gold font-medium">Shards</span>, fragments that can force reality to hold, but never without cost.
              </p>
              <p className="text-lg md:text-xl leading-relaxed text-parchment italic">
                To save something is to risk losing something else.
              </p>
            </div>
          </div>

          {/* The Conclusion */}
          <div className="text-center my-20">
            <p className="text-xl md:text-2xl font-serif text-parchment-muted leading-relaxed mb-4">
              The world is not ending.
            </p>
            <p className="text-3xl md:text-4xl font-serif text-parchment">
              It is being <span className="canon-text font-semibold">decided</span>.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-16">
            <div className="flex-1 h-px bg-gold/10" />
            <Sparkles className="w-4 h-4 text-gold/40" />
            <div className="flex-1 h-px bg-gold/10" />
          </div>

          {/* Pillar Descriptions */}
          <div className="space-y-6 mb-12 max-w-3xl mx-auto text-lg leading-relaxed text-parchment-muted">
            <div>
              <p>
                <span className="text-gold font-serif font-semibold">Explore</span> – Dive into Everloop: uncover stories, study the lore, explore vast maps, and immerse yourself in a living, shifting world.
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                <Link href="/map" className="text-teal-light/70 hover:text-teal-light transition-colors">✦ Interactive Map</Link>
                <Link href="/stories" className="text-teal-light/70 hover:text-teal-light transition-colors">✦ Library</Link>
                <Link href="/explore" className="text-teal-light/70 hover:text-teal-light transition-colors">✦ Archive</Link>
              </div>
            </div>
            <div>
              <p>
                <span className="text-gold font-serif font-semibold">Write</span> – Expand the canon: create characters, locations, creatures, or full stories and contribute them to the Everloop universe.
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                <Link href="/create" className="text-gold/70 hover:text-gold transition-colors">✦ Create</Link>
                <Link href="/roster" className="text-gold/70 hover:text-gold transition-colors">✦ Roster</Link>
                <Link href="/write" className="text-gold/70 hover:text-gold transition-colors">✦ Write</Link>
              </div>
            </div>
            <div>
              <p>
                <span className="text-gold font-serif font-semibold">Play</span> – Build and experience: craft playable characters, quests, and campaigns — whether grounded in canon or wild one-shots in a world where reality is unraveling.
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                <Link href="/player-deck" className="text-purple-400/70 hover:text-purple-400 transition-colors">✦ Player Deck</Link>
                <Link href="/campaigns" className="text-purple-400/70 hover:text-purple-400 transition-colors">✦ Campaigns</Link>
                <Link href="/quests" className="text-purple-400/70 hover:text-purple-400 transition-colors">✦ Quests</Link>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative w-full aspect-[16/9] mb-8 rounded-lg overflow-hidden border border-gold/20 shadow-2xl shadow-gold/10">
            <Image
              src="/Maps/New Structure Map.png"
              alt="Structure of the Everloop"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-deep via-transparent to-transparent" />
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/stories">
              <Button variant="canon" size="lg" className="gap-2 w-full sm:w-auto">
                <BookOpen className="w-5 h-5" />
                Enter the Library
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/guide">
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto border-gold/30 text-gold hover:bg-gold/10">
                <ScrollText className="w-5 h-5" />
                Read the World Guide
              </Button>
            </Link>
            <Link href="/map">
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto border-gold/30 text-gold hover:bg-gold/10">
                <Feather className="w-5 h-5" />
                Explore the Map
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
