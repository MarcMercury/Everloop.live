import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Infinity, 
  Users, 
  Sparkles, 
  BookOpen,
  Brain,
  Heart,
  Download
} from 'lucide-react'

export const metadata = {
  title: 'About | Everloop',
  description: 'Learn about the Everloop - a collaborative canon engine for shared storytelling',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gold/10 border border-gold/20">
              <Infinity className="w-12 h-12 text-gold" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-parchment mb-4">
            About <span className="text-gold">Everloop</span>
          </h1>
          <p className="text-parchment-muted text-lg max-w-2xl mx-auto">
            A Canon Engine for collaborative storytelling, where writers build within a living 
            world — guided by AI, grounded in canon.
          </p>
        </div>

        {/* What is Everloop */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-parchment mb-6">What is the Everloop?</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-parchment-muted leading-relaxed mb-4">
              The Everloop is both a world and a platform. As a world, it&apos;s a vast fantasy universe 
              where time loops in mysterious patterns, ancient Shards of power dot the landscape, and 
              reality itself can be shaped by those who understand its secrets.
            </p>
            <p className="text-parchment-muted leading-relaxed mb-4">
              As a platform, Everloop is a <strong className="text-parchment">Canon Engine</strong> — a new 
              kind of collaborative writing space where AI helps maintain consistency across stories 
              written by many authors. Every approved story becomes permanent canon, building an 
              ever-growing tapestry of interconnected narratives.
            </p>
            <p className="text-parchment-muted leading-relaxed">
              Think of it as a shared universe where your contributions matter, your characters can 
              become legendary, and the world itself remembers every story told within it.
            </p>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-parchment mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-gold/10 h-fit">
                    <Brain className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-parchment mb-2">AI-Assisted Canon</h3>
                    <p className="text-parchment-muted text-sm">
                      Our AI reads every piece of canon and helps ensure your stories fit seamlessly 
                      into the existing world. It catches contradictions before they become problems.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-gold/10 h-fit">
                    <BookOpen className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-parchment mb-2">Living Archive</h3>
                    <p className="text-parchment-muted text-sm">
                      Every character, location, and event is catalogued and searchable. Reference 
                      existing lore while writing, and your creations join the archive.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-gold/10 h-fit">
                    <Users className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-parchment mb-2">True Collaboration</h3>
                    <p className="text-parchment-muted text-sm">
                      Reference other writers&apos; characters, build on their stories, and create 
                      together. The Everloop is a shared world, not a solo sandbox.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="p-2 rounded-lg bg-gold/10 h-fit">
                    <Sparkles className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-parchment mb-2">Creator Studio</h3>
                    <p className="text-parchment-muted text-sm">
                      Build characters, locations, and creatures with AI assistance. Generate 
                      concept art, expand descriptions, and craft your roster.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* The World */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-parchment mb-6">The World</h2>
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-teal-rich via-gold/10 to-teal-rich" />
            <CardContent className="pt-6">
              <p className="text-parchment-muted leading-relaxed mb-4">
                The Everloop is a realm where time doesn&apos;t flow in straight lines. Ancient 
                civilizations rose and fell, leaving behind the <strong className="text-parchment">Shards</strong> — 
                fragments of crystallized reality that hold immense power and stranger memories.
              </p>
              <p className="text-parchment-muted leading-relaxed mb-4">
                Those who carry Shards become <strong className="text-parchment">Marked</strong>, bound to 
                the loop in ways they rarely understand. Some seek to escape the cycle. Others 
                embrace it, learning to read the patterns of recurrence.
              </p>
              <p className="text-parchment-muted leading-relaxed mb-6">
                Between the loops, in the spaces where time hesitates, the 
                <strong className="text-parchment"> Hollow Courts</strong> gather — neither living nor dead, 
                watching, waiting, remembering everything that ever was and will be again.
              </p>
              <div className="pt-4 border-t border-gold/10">
                <a 
                  href="/%F0%9F%8C%8C%20EVERLOOP%20-%20A%20Guide%20to%20the%20Broken%20World.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="font-medium">Download: A Guide to the Broken World (PDF)</span>
                </a>
                <p className="text-xs text-parchment-muted mt-2">
                  Complete lore guide with world history, factions, and writing guidelines
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Vision */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-parchment mb-6 flex items-center gap-3">
            <Heart className="w-6 h-6 text-red-400" />
            Our Vision
          </h2>
          <div className="bg-gradient-to-r from-gold/5 to-transparent p-6 rounded-lg border border-gold/10">
            <p className="text-parchment-muted leading-relaxed italic">
              &quot;We believe the best stories are the ones we build together. The Everloop isn&apos;t 
              just a writing platform — it&apos;s an experiment in collective imagination. What 
              happens when thousands of writers contribute to the same living world, each 
              adding their voice to an ever-expanding canon? We&apos;re building the tools to find out.&quot;
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-8 border-t border-gold/10">
          <p className="text-parchment-muted mb-4">Ready to become part of the loop?</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/explore">
              <Button variant="outline">Explore the Archive</Button>
            </Link>
            <Link href="/guidelines">
              <Button variant="outline">Read Guidelines</Button>
            </Link>
            <a 
              href="/%F0%9F%8C%8C%20EVERLOOP%20-%20A%20Guide%20to%20the%20Broken%20World.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                World Guide
              </Button>
            </a>
            <Link href="/login">
              <Button>Join Everloop</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
