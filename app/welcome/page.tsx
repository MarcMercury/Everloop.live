import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Feather } from 'lucide-react'

export const metadata = {
  title: 'Welcome to the Everloop',
  description: 'Enter a broken world that is slowly unraveling. Discover the lore of the Everloop universe.',
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
              <span className="text-parchment">Welcome to the </span>
              <span className="canon-text">Everloop</span>
            </h1>
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

          {/* Lore Sections */}
          <div className="space-y-12 text-parchment-muted">
            
            {/* The Weaving of the World */}
            <div className="glass-subtle p-8 rounded-lg border border-gold/10">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-4">
                The Weaving of the World
              </h2>
              <p className="text-lg leading-relaxed">
                Long ago, before memory began, there was only the <span className="text-parchment font-medium">Drift</span>—a chaotic sea of unformed matter. From this void rose the <span className="text-parchment font-medium">First Architects</span>, beings who sought to impose order upon the chaos. They built a realm of pure intent called <span className="text-gold">The Fold</span> and, within it, drafted the <span className="text-parchment font-medium">First Map</span>. To make this map real, they wove the <span className="text-gold">Pattern</span>—a vast lattice of reality pinned in place by great <span className="text-parchment font-medium">Anchors</span>. Upon this stable surface, life flourished in a cycle known as the <span className="canon-text font-semibold">Everloop</span>.
              </p>
            </div>

            {/* The Breaking */}
            <div className="glass-subtle p-8 rounded-lg border border-gold/10">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-4">
                The Breaking
              </h2>
              <p className="text-lg leading-relaxed">
                But nothing made can remain perfect forever. As the Pattern began to thin, a group known as the <span className="text-parchment font-medium">Rogue Architects</span> attempted to repair the weaving. They failed. Instead of mending the world, they shattered the Anchors, creating <span className="text-gold">Shards</span> of unstable power and tearing a wound in reality known as <span className="text-red-400 font-medium">The Fray</span>.
              </p>
            </div>

            {/* The Unraveling */}
            <div className="glass-subtle p-8 rounded-lg border border-gold/10">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-4">
                The Unraveling
              </h2>
              <p className="text-lg leading-relaxed">
                Now, the world is quiet but trembling. <span className="text-parchment font-medium">Hollows</span> appear where the Pattern has worn through, causing regions to blink in and out of existence. The Fray expands, and time behaves erratically where the Shards lie buried.
              </p>
            </div>

            {/* Those Who See */}
            <div className="glass-subtle p-8 rounded-lg border border-gold/10">
              <h2 className="text-2xl md:text-3xl font-serif text-gold mb-4">
                Those Who See
              </h2>
              <p className="text-lg leading-relaxed">
                In this fading world, some are born with the ability to see the threads that bind us. <span className="text-gold">Vaultkeepers</span> can read the memories trapped in the Pattern, while <span className="text-gold">Dreamers</span> can nudge the threads to bend fate itself.
              </p>
            </div>

            {/* Final Call */}
            <div className="text-center py-8">
              <p className="text-xl md:text-2xl font-serif text-parchment italic">
                You have stepped into a broken world that is slowly unraveling.
              </p>
              <p className="text-2xl md:text-3xl font-serif mt-4">
                <span className="text-parchment">Welcome to the </span>
                <span className="canon-text">Everloop</span>.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
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
