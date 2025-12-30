import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Feather } from 'lucide-react'

export const metadata = {
  title: 'Welcome to the Everloop',
  description: 'A complete guide to the Broken World. Discover the lore, factions, and mysteries of the Everloop universe.',
}

export default function WelcomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          {/* Main Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-serif mb-4">
              <span className="text-parchment">A Guide to the </span>
              <span className="canon-text">Broken World</span>
            </h1>
            <p className="text-lg text-parchment-muted italic">
              The Complete Everloop World Guide
            </p>
          </div>

          {/* Hero Image */}
          <div className="relative w-full aspect-[16/9] mb-16 rounded-lg overflow-hidden border border-gold/20 shadow-2xl shadow-gold/10">
            <Image
              src="/Gemini_Generated_Image_2aqbhj2aqbhj2aqb.png"
              alt="The Everloop Universe"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-deep via-transparent to-transparent" />
          </div>

          {/* Table of Contents */}
          <nav className="glass-subtle p-6 rounded-lg border border-gold/10 mb-12">
            <h2 className="text-xl font-serif text-gold mb-4">Contents</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-parchment-muted">
              <li><a href="#origin" className="hover:text-gold transition-colors">I. The Origin</a></li>
              <li><a href="#creation" className="hover:text-gold transition-colors">II. The Creation</a></li>
              <li><a href="#breaking" className="hover:text-gold transition-colors">III. The Breaking</a></li>
              <li><a href="#unraveling" className="hover:text-gold transition-colors">IV. The Unraveling</a></li>
              <li><a href="#prime-beings" className="hover:text-gold transition-colors">V. The Prime Beings</a></li>
              <li><a href="#factions" className="hover:text-gold transition-colors">VI. The Factions</a></li>
              <li><a href="#glossary" className="hover:text-gold transition-colors">VII. Glossary of Terms</a></li>
              <li><a href="#writing" className="hover:text-gold transition-colors">VIII. Begin Your Story</a></li>
            </ul>
          </nav>

          {/* Lore Sections */}
          <div className="space-y-12 text-parchment-muted">
            
            {/* PART I: The Origin */}
            <section id="origin" className="glass-subtle p-8 rounded-lg border border-gold/10 scroll-mt-8">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                I. The Origin — Before Memory Began
              </h2>
              <div className="space-y-4 text-lg leading-relaxed">
                <p>
                  In the beginning, there was only the <span className="text-parchment font-medium">Drift</span>—a primordial sea of chaos where matter and will existed without boundary. The Drift is not a place but a condition. Nothing within it is still. To enter it is to dissolve into what you once were.
                </p>
                <p>
                  Within this churning void roamed the <span className="text-parchment font-medium">Prime Beings</span>—vast entities of hunger, storm, ash, birth, and silence. They were not gods, for gods require worship, and in the beginning there was none to give it. They were instinct given gravity, elemental forces with neither purpose nor design.
                </p>
                <p>
                  From the outer haze of the Drift arose something new: beings who sought form within the formless. They called themselves the <span className="text-gold">First Architects</span>.
                </p>
              </div>
            </section>

            {/* PART II: The Creation */}
            <section id="creation" className="glass-subtle p-8 rounded-lg border border-gold/10 scroll-mt-8">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                II. The Creation — The Weaving of the World
              </h2>
              <div className="space-y-4 text-lg leading-relaxed">
                <p>
                  The First Architects sought to impose order upon the chaos. They built a realm of pure intent called <span className="text-gold">The Fold</span>—the intermediary plane of thought, design, and intent. Neither matter nor spirit, it is the mind of creation itself.
                </p>
                <p>
                  Within the Fold, they drafted the <span className="text-parchment font-medium">First Map</span>—lines of pure concept drawn across the unanchored dark. The map was not creation, but containment—a way to keep the world from slipping back into oblivion.
                </p>
                <p>
                  To make this map real, they began <span className="text-gold">The Weaving</span>—a vast lattice of luminous threads binding time, space, and thought into continuity. This became known as the <span className="text-parchment font-medium">Pattern</span>.
                </p>
                <p>
                  To hold the Weaving firm, the Architects drove great pillars of intent and memory into the Pattern—the <span className="text-gold">Anchors</span>. Around the Anchors, reality crystallized. Mountains learned to stay still. Rivers remembered their beds.
                </p>
                <p>
                  Upon this stable surface, life flourished in a cycle known as the <span className="canon-text font-semibold">Everloop</span>—both the living world and the eternal cycle of return. Each life lived is a single thread in its design. Its purpose: to enact the Pattern&apos;s rhythm—birth, loss, return. A cycle that spins ever onward, never the same, never truly new.
                </p>
              </div>
            </section>

            {/* PART III: The Breaking */}
            <section id="breaking" className="glass-subtle p-8 rounded-lg border border-gold/10 scroll-mt-8">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                III. The Breaking — The Shattering of the Anchors
              </h2>
              <div className="space-y-4 text-lg leading-relaxed">
                <p>
                  Nothing made can remain perfect forever. Over ages uncounted, the Pattern began to thin. Weak points appeared where space, time, and memory flickered—places where the Pattern forgot itself. These became known as the <span className="text-parchment font-medium">Hollows</span>.
                </p>
                <p>
                  As the Hollows widened, a circle of <span className="text-parchment font-medium">Vaultkeepers</span> and <span className="text-parchment font-medium">Dreamers</span> sought to repair the failing Pattern. They believed they could weave anew as their ancestors once had. They called themselves the <span className="text-red-400 font-medium">Rogue Architects</span>.
                </p>
                <p>
                  But they misjudged the balance. In their attempt to mend the Weaving, they shattered the Anchors—creating the <span className="text-gold">Shards</span>, broken remnants that still hum with the intent that once held the world together.
                </p>
                <p>
                  The destruction tore a wound in reality known as <span className="text-red-400 font-medium">The Fray</span>—the unraveling edge of reality where the Pattern frays and loops collapse. The Fray is not a place but a condition—where time stutters, memory bleeds, and the world forgets itself.
                </p>
              </div>
            </section>

            {/* PART IV: The Unraveling */}
            <section id="unraveling" className="glass-subtle p-8 rounded-lg border border-gold/10 scroll-mt-8">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                IV. The Unraveling — The World as It Is Now
              </h2>
              <div className="space-y-4 text-lg leading-relaxed">
                <p>
                  Now, the world is quiet but trembling. The Hollows have become more than weak spots—they are wounds where regions blink in and out of existence entirely. Whole villages wake to find their neighbors never existed. Children forget their parents between dawn and dusk.
                </p>
                <p>
                  The Fray expands, and where the <span className="text-gold">Shards</span> lie buried, time runs like spilled ink. Shard-touched regions are the most unstable—time, matter, and memory contorting where their influence spreads. The Fray manifests differently in each region: buildings appear and disappear, streets rearrange themselves, and people vanish from memory only to return as if they never left.
                </p>
                <p>
                  Some places resist. <span className="text-parchment font-medium">Drelmere</span>, once a sanctuary for Dreamers, now struggles against the Bell Tree that appeared in its square. <span className="text-parchment font-medium">Virelay</span>, a coastal town, drowns in loops where fishermen cast their lines at the same spot forever, the only constant in a town that forgets itself between heartbeats.
                </p>
                <p>
                  Yet where there is unraveling, there is also possibility. The Shards, though dangerous, hold the key. Some believe that gathering them could repair the Pattern. Others fear that wielding such power would complete its destruction.
                </p>
              </div>
            </section>

            {/* PART V: The Prime Beings */}
            <section id="prime-beings" className="glass-subtle p-8 rounded-lg border border-gold/10 scroll-mt-8">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                V. The Prime Beings — Forces Before Form
              </h2>
              <div className="space-y-4 text-lg leading-relaxed">
                <p>
                  Before the Architects, before the Pattern, the Prime Beings roamed the Drift. They are not creatures but forces—instinct given gravity, each embodying an elemental truth:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                  <div className="p-4 border border-gold/20 rounded-lg">
                    <h4 className="text-gold font-medium mb-2">Hunger</h4>
                    <p className="text-sm text-parchment-muted">The endless void that consumes. Not evil, but inevitable—the space between all things.</p>
                  </div>
                  <div className="p-4 border border-gold/20 rounded-lg">
                    <h4 className="text-gold font-medium mb-2">Storm</h4>
                    <p className="text-sm text-parchment-muted">Motion without destination. The violence of change and the energy of becoming.</p>
                  </div>
                  <div className="p-4 border border-gold/20 rounded-lg">
                    <h4 className="text-gold font-medium mb-2">Ash</h4>
                    <p className="text-sm text-parchment-muted">What remains after all else burns. The memory of endings and the quiet after.</p>
                  </div>
                  <div className="p-4 border border-gold/20 rounded-lg">
                    <h4 className="text-gold font-medium mb-2">Birth</h4>
                    <p className="text-sm text-parchment-muted">The relentless push toward existence. Creation without wisdom or purpose.</p>
                  </div>
                  <div className="p-4 border border-gold/20 rounded-lg md:col-span-2 md:w-1/2 md:mx-auto">
                    <h4 className="text-gold font-medium mb-2">Silence</h4>
                    <p className="text-sm text-parchment-muted">The absence that precedes and follows all things. The truth beneath the noise.</p>
                  </div>
                </div>
                <p>
                  Where these beings still touch the world, reality bends. They neither sleep nor wake—they simply are.
                </p>
              </div>
            </section>

            {/* PART VI: The Factions */}
            <section id="factions" className="glass-subtle p-8 rounded-lg border border-gold/10 scroll-mt-8">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                VI. The Factions — Those Who Shape the World
              </h2>
              <div className="space-y-6 text-lg leading-relaxed">
                
                <div className="border-l-2 border-gold/30 pl-6">
                  <h3 className="text-xl font-serif text-parchment mb-2">The First Architects</h3>
                  <p>
                    Beings who arose from the outer haze of the Drift, seeking form within the formless. They built the Fold, inscribed the First Map, and began the Weaving. They drove the Anchors into the Pattern to hold reality firm. Some claim they were absorbed into the Fold itself, becoming one with their creation.
                  </p>
                </div>

                <div className="border-l-2 border-red-400/30 pl-6">
                  <h3 className="text-xl font-serif text-parchment mb-2">The Rogue Architects</h3>
                  <p>
                    A circle of Vaultkeepers and Dreamers who sought to repair the failing Pattern when the Hollows widened. They believed they could weave anew as their ancestors once had. But they misjudged the balance. In their attempt to mend the Weaving, they shattered the Anchors—creating the Shards and the Fray. Their fate remains unknown.
                  </p>
                </div>

                <div className="border-l-2 border-blue-400/30 pl-6">
                  <h3 className="text-xl font-serif text-parchment mb-2">The Vaultkeepers</h3>
                  <p>
                    Stewards of memory who perceive the echoes within the Fold through the threads of the Pattern. Born upon the Everloop with the gift to see its threads. They interpret what they see, though meaning is rarely clear. Some work alone, others in Circles. They can read the memories trapped in the Pattern—see the past as it truly was, not as it is remembered.
                  </p>
                </div>

                <div className="border-l-2 border-purple-400/30 pl-6">
                  <h3 className="text-xl font-serif text-parchment mb-2">The Dreamers</h3>
                  <p>
                    Walkers between waking and Fold, born tethered to that liminal plane. Through discipline, accident, or madness they can nudge the threads of the Pattern—subtle shifts that bend fate, soften storms, or still hearts. Their art is not conjuring but persuasion. They do not create; they convince reality to be otherwise.
                  </p>
                </div>

                <div className="border-l-2 border-amber-400/30 pl-6">
                  <h3 className="text-xl font-serif text-parchment mb-2">The Scholars</h3>
                  <p>
                    Those who study the Shards and the Pattern through observation and theory. The Scholars believe the Shards were safeguards—anchors placed by the First Architects as points of return should the weave falter. They question why a perfect loop would require safeguards, wondering what flaw the Architects saw in their own design.
                  </p>
                </div>

                <div className="border-l-2 border-gray-400/30 pl-6">
                  <h3 className="text-xl font-serif text-parchment mb-2">Folders</h3>
                  <p>
                    Rare beings who have been &quot;folded&quot; across multiple time layers. They remember things that haven&apos;t happened and forget things happening now. Their minds scatter across moments. If a Folder leaves their grounding place, they risk becoming scattered entirely—lost across every moment they have ever touched.
                  </p>
                </div>
              </div>
            </section>

            {/* PART VII: Glossary */}
            <section id="glossary" className="glass-subtle p-8 rounded-lg border border-gold/10 scroll-mt-8">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-6">
                VII. Glossary of Terms
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
                <div className="space-y-3">
                  <div>
                    <span className="text-gold font-medium">The Drift</span>
                    <p className="text-sm text-parchment-muted">The primordial sea of chaos—matter and will without boundary.</p>
                  </div>
                  <div>
                    <span className="text-gold font-medium">The Fold</span>
                    <p className="text-sm text-parchment-muted">The intermediary plane of thought, design, and intent.</p>
                  </div>
                  <div>
                    <span className="text-gold font-medium">The First Map</span>
                    <p className="text-sm text-parchment-muted">The original design drawn by the First Architects—containment, not creation.</p>
                  </div>
                  <div>
                    <span className="text-gold font-medium">The Pattern</span>
                    <p className="text-sm text-parchment-muted">The vast lattice of luminous threads binding time, space, and thought.</p>
                  </div>
                  <div>
                    <span className="text-gold font-medium">The Weaving</span>
                    <p className="text-sm text-parchment-muted">The act by which the Pattern was created—reality woven from chaos.</p>
                  </div>
                  <div>
                    <span className="text-gold font-medium">The Everloop</span>
                    <p className="text-sm text-parchment-muted">Both the living world and the eternal cycle of return.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-gold font-medium">The Anchors</span>
                    <p className="text-sm text-parchment-muted">Great pillars that held the Weaving firm—now shattered.</p>
                  </div>
                  <div>
                    <span className="text-gold font-medium">The Shards</span>
                    <p className="text-sm text-parchment-muted">Broken remnants of the Anchors, still humming with power.</p>
                  </div>
                  <div>
                    <span className="text-gold font-medium">The Hollows</span>
                    <p className="text-sm text-parchment-muted">Weak points where space, time, and memory flicker.</p>
                  </div>
                  <div>
                    <span className="text-red-400 font-medium">The Fray</span>
                    <p className="text-sm text-parchment-muted">The unraveling edge of reality—where time stutters and memory bleeds.</p>
                  </div>
                  <div>
                    <span className="text-gold font-medium">The Triumvirate</span>
                    <p className="text-sm text-parchment-muted">Time, Memory, Flesh—the three aspects the Pattern holds stable.</p>
                  </div>
                  <div>
                    <span className="text-gold font-medium">The Bell Tree</span>
                    <p className="text-sm text-parchment-muted">Manifestations that appear in Fray-touched regions—keys to the Shards.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Final Call */}
            <section id="writing" className="text-center py-12 scroll-mt-8">
              <div className="glass-subtle p-8 rounded-lg border border-gold/10">
                <p className="text-xl md:text-2xl font-serif text-parchment italic mb-4">
                  You have stepped into a broken world that is slowly unraveling.
                </p>
                <p className="text-2xl md:text-3xl font-serif mb-6">
                  <span className="text-parchment">Welcome to the </span>
                  <span className="canon-text">Everloop</span>.
                </p>
                <p className="text-parchment-muted max-w-2xl mx-auto mb-8">
                  This is a collaborative canon—a living world shaped by every story written within it. Your characters, your places, your events become part of the tapestry. The Pattern awaits your thread.
                </p>
              </div>
            </section>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/explore">
              <Button variant="canon" size="lg" className="gap-2 w-full sm:w-auto">
                <BookOpen className="w-5 h-5" />
                Explore the Archive
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/stories">
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto border-gold/30 text-gold hover:bg-gold/10">
                <Feather className="w-5 h-5" />
                Read Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
