import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, Feather } from 'lucide-react'

export const metadata = {
  title: 'A Guide to the Broken World | Everloop',
  description: 'The complete guide to the Everloop universe — its origins, factions, and the nature of reality itself.',
}

export default function GuidePage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/welcome">
              <Button variant="ghost" size="sm" className="gap-2 text-parchment-muted hover:text-parchment">
                <ArrowLeft className="w-4 h-4" />
                Back to Overview
              </Button>
            </Link>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <p className="text-gold text-sm uppercase tracking-widest mb-2">🌌</p>
            <h1 className="text-3xl md:text-5xl font-serif mb-4">
              <span className="text-gold">EVERLOOP</span>
            </h1>
            <p className="text-xl md:text-2xl font-serif text-parchment">
              A Guide to the Broken World
            </p>
          </div>

          {/* Guide Content */}
          <div className="space-y-12 text-parchment-muted">

            {/* Part I: Before Memory */}
            <section className="glass-subtle p-8 rounded-lg border border-gold/10">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                Part I: Before Memory
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-serif text-parchment mb-3">The Drift</h3>
                  <p className="text-lg leading-relaxed">
                    The primordial sea of chaos — matter and will without boundary. The Drift is not a place but a condition. Nothing within it is still. To enter it is to dissolve into what you once were. From its outer reaches the First Architects drew substance, shaping the first forms of stability.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif text-parchment mb-3">The Prime Beings</h3>
                  <p className="text-lg leading-relaxed">
                    Vast entities that roamed the Drift before memory — shapes of hunger, storm, and birth. They were not gods, for gods require worship, and in the beginning there was none to give it. They were instinct given gravity. They embody elemental forces: <span className="text-gold">Hunger</span>, <span className="text-gold">Storm</span>, <span className="text-gold">Ash</span>, <span className="text-gold">Birth</span>, <span className="text-gold">Silence</span>.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif text-parchment mb-3">The First Architects</h3>
                  <p className="text-lg leading-relaxed">
                    Beings who arose from the outer haze of the Drift, seeking form within the formless. They built the Fold, inscribed the First Map, and began the Weaving. They drove the Anchors into the Pattern to hold reality firm. Some claim they were absorbed into the Fold itself.
                  </p>
                </div>
              </div>
            </section>

            {/* Part II: The Creation */}
            <section className="glass-subtle p-8 rounded-lg border border-gold/10">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                Part II: The Creation
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-serif text-parchment mb-3">The Fold</h3>
                  <p className="text-lg leading-relaxed">
                    The intermediary plane of thought, design, and intent — neither matter nor spirit, it is the mind of creation. The Fold holds the First Map, a construct of pure geometry and tone that describes the world. It is the wall upon which all else is hung.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif text-parchment mb-3">The First Map</h3>
                  <p className="text-lg leading-relaxed">
                    The original design drawn by the First Architects — lines of pure concept drawn across the unanchored dark. The map was not creation, but containment — a way to keep the world from slipping back into oblivion. From its contours they began the Weaving.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif text-parchment mb-3">The Weaving</h3>
                  <p className="text-lg leading-relaxed">
                    The vast lattice of luminous threads binding time, space, and thought into continuity. The act of creation by which the Pattern was made. Within the Pattern once stood the Anchors, pillars that pinned the Weaving to the Fold. The Weaving grows thin, and Hollows spread.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif text-parchment mb-3">The Anchors</h3>
                  <p className="text-lg leading-relaxed">
                    Great pillars of intent and memory driven into the Pattern by the First Architects to hold the Weaving firm. Around the Anchors, reality crystallized. Mountains learned to stay still. Rivers remembered their beds. Their shattering by the Rogue Architects created the Shards and the Fray.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif text-parchment mb-3">The Everloop</h3>
                  <p className="text-lg leading-relaxed">
                    Both the living world and the eternal cycle of return. The world of mortals layered upon the Pattern, nourished by it. Each life lived is a single thread in its design. Its purpose: to enact the Pattern&apos;s rhythm — birth, loss, return. A cycle that spins ever onward, never the same, never truly new.
                  </p>
                </div>
              </div>
            </section>

            {/* Part III: The Breaking */}
            <section className="glass-subtle p-8 rounded-lg border border-gold/10">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                Part III: The Breaking
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-serif text-parchment mb-3">The Hollows</h3>
                  <p className="text-lg leading-relaxed">
                    Weak points in the Pattern where space, time, and memory flicker. Places where the Pattern forgets itself and existence falters. Their cause remains unknown. The Hollows widened over time, leading the Rogue Architects to attempt their fateful repair.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif text-parchment mb-3">The Rogue Architects</h3>
                  <p className="text-lg leading-relaxed">
                    A circle of Vaultkeepers and Dreamers who sought to repair the failing Pattern when the Hollows widened. They believed they could weave anew as their ancestors once had. But they misjudged the balance. In their attempt to mend the Weaving, they shattered the Anchors — creating the Shards and the Fray.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif text-parchment mb-3">The Shards</h3>
                  <p className="text-lg leading-relaxed">
                    Broken remnants of the Anchors — each still hums with the intent that once held the world together. Where Shards lie buried, the world trembles most, and time runs like spilled ink. Shard-touched regions are the most unstable, with time, matter, and memory contorting where their influence spreads.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif text-parchment mb-3">The Fray</h3>
                  <p className="text-lg leading-relaxed">
                    The unraveling edge of reality where the Pattern frays and loops collapse. The Fray is not a place but a condition — where time stutters, memory bleeds, and the world forgets itself. It spreads from Shard-touched regions, corrupting all it touches.
                  </p>
                </div>
              </div>
            </section>

            {/* Part IV: Those Who Remain */}
            <section className="glass-subtle p-8 rounded-lg border border-gold/10">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                Part IV: Those Who Remain
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-serif text-parchment mb-3">The Vaultkeepers</h3>
                  <p className="text-lg leading-relaxed">
                    Stewards of memory who perceive the echoes within the Fold through the threads of the Pattern. Born upon the Everloop with the gift to see its threads. They interpret what they see, though meaning is rarely clear. Some work alone, others in Circles.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-serif text-parchment mb-3">The Dreamers</h3>
                  <p className="text-lg leading-relaxed">
                    Walkers between waking and Fold, born tethered to that liminal plane. Through discipline, accident, or madness they can nudge the threads of the Pattern — subtle shifts that bend fate, soften storms, or still hearts. Their art is not conjuring but persuasion.
                  </p>
                </div>
              </div>
            </section>

            {/* Part V: The World Now */}
            <section className="glass-subtle p-8 rounded-lg border border-gold/10">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                Part V: The World Now
              </h2>
              
              <div className="space-y-4">
                <p className="text-lg leading-relaxed">
                  The world is quiet but trembling. The Hollows have become wounds where regions blink in and out of existence. Whole villages wake to find their neighbors never existed. Children forget their parents between dawn and dusk.
                </p>
                <p className="text-lg leading-relaxed">
                  The Fray expands. Where the Shards lie buried, time runs like spilled ink. Some places resist — but resistance is not victory. It is only delay.
                </p>
                <p className="text-lg leading-relaxed">
                  Yet where there is unraveling, there is also possibility. The Shards, though dangerous, hold the key. Some believe that gathering them could repair the Pattern. Others fear that wielding such power would complete its destruction.
                </p>
                <p className="text-lg leading-relaxed italic text-parchment">
                  You have stepped into a broken world that is slowly unraveling. What will you do?
                </p>
              </div>
            </section>

            {/* Closing */}
            <div className="text-center py-8">
              <p className="text-2xl md:text-3xl font-serif">
                <span className="text-parchment">Welcome to the </span>
                <span className="canon-text">Everloop</span>.
              </p>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 pt-8 border-t border-gold/10">
            <Link href="/explore">
              <Button variant="canon" size="lg" className="gap-2 w-full sm:w-auto">
                <BookOpen className="w-5 h-5" />
                Dive into the Archive
              </Button>
            </Link>
            <Link href="/write">
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto border-gold/30 text-gold hover:bg-gold/10">
                <Feather className="w-5 h-5" />
                Start Creating Now
              </Button>
            </Link>
          </div>

          {/* Back Button (bottom) */}
          <div className="text-center mt-8">
            <Link href="/welcome">
              <Button variant="ghost" size="sm" className="gap-2 text-parchment-muted hover:text-parchment">
                <ArrowLeft className="w-4 h-4" />
                Back to Overview
              </Button>
            </Link>
          </div>

        </div>
      </section>
    </div>
  )
}
