import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react'

export const metadata = {
  title: "Reader's Guide | Everloop",
  description: 'A glossary of the Everloop world as it is known — core foundations, instabilities, and open questions.',
}

const FOUNDATIONS = [
  {
    term: 'The Drift',
    description: 'The origin of everything. A boundless state where matter and intent have no fixed form. Nothing within it remains stable for long.',
    color: 'purple-400',
    accent: 'purple-500/20',
    border: 'purple-500/30',
  },
  {
    term: 'The Prime Beings',
    description: 'Vast forces that moved within the Drift before the world existed. Not creators, but concentrations of instinct — Hunger, Storm, Silence, Birth. Their current state is unknown.',
    color: 'purple-300',
    accent: 'purple-400/15',
    border: 'purple-400/20',
  },
  {
    term: 'The Fold',
    description: 'The boundary where chaos first slowed enough for form to persist. It is where the first stable existence became possible.',
    color: 'blue-400',
    accent: 'blue-500/15',
    border: 'blue-500/25',
  },
  {
    term: 'The First Architects',
    description: 'The first beings to remain themselves over time. They shaped the conditions that allow reality to exist and later became part of its foundation.',
    color: 'blue-300',
    accent: 'blue-400/15',
    border: 'blue-400/20',
  },
  {
    term: 'The First Map',
    description: 'The initial structure created by the First Architects. Not a physical map, but a framework that defines how things can exist and relate to one another.',
    color: 'teal-400',
    accent: 'teal-500/15',
    border: 'teal-500/25',
  },
  {
    term: 'The Pattern',
    description: 'The underlying structure of reality. It allows time to move forward, matter to remain consistent, and memory to persist.',
    color: 'blue-400',
    accent: 'blue-500/15',
    border: 'blue-500/25',
  },
  {
    term: 'The Anchors',
    description: 'The First Architects, fixed into the Pattern to hold it stable. They are no longer active beings, but the foundation that keeps reality from collapsing.',
    color: 'gold',
    accent: 'gold/10',
    border: 'gold/25',
  },
  {
    term: 'The Everloop',
    description: 'The living world. The surface layer where life, memory, and events take place, supported by the Pattern beneath it.',
    color: 'gold',
    accent: 'gold/10',
    border: 'gold/25',
  },
]

const INSTABILITIES = [
  {
    term: 'Hollows',
    description: 'Areas where the Pattern has weakened. Reality fades, skips, or fails to continue. People and places may disappear without clear cause.',
    color: 'parchment-muted',
    icon: '◌',
  },
  {
    term: 'The Fray',
    description: 'Areas where reality becomes unstable in the opposite way. Time overlaps, events conflict, and cause and effect break down.',
    color: 'red-400',
    icon: '◈',
  },
  {
    term: 'The Shards',
    description: 'Fragments of the Anchors created when they were broken. Each still carries stabilizing force, but without balance. They can hold reality in place, but often distort it.',
    color: 'gold',
    icon: '◇',
  },
]

const PERCEIVERS = [
  {
    term: 'Vaultkeepers',
    description: 'Individuals who can sense or interpret the underlying structure of reality. They often understand that something is wrong, but not how to fix it.',
    color: 'teal-400',
  },
  {
    term: 'Dreamers',
    description: 'Individuals who can subtly influence reality. Their actions can shift outcomes, but often create unintended consequences elsewhere.',
    color: 'purple-300',
  },
]

export default function ReadersGuidePage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Back link */}
        <Link href="/welcome" className="inline-flex items-center gap-2 text-sm text-parchment-muted hover:text-parchment transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-parchment-muted/60 mb-4">
            <span className="w-8 h-px bg-gold/30" />
            A Glossary of the World
            <span className="w-8 h-px bg-gold/30" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-parchment mb-4">
            Reader&apos;s <span className="canon-text">Guide</span>
          </h1>
          <p className="text-parchment-muted text-lg max-w-2xl mx-auto">
            A guide to the Everloop world as it is known.
          </p>
        </div>

        {/* ═══ Core Foundations ═══ */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-parchment">Core Foundations</h2>
              <p className="text-sm text-parchment-muted">The architecture of reality</p>
            </div>
          </div>

          <div className="space-y-4">
            {FOUNDATIONS.map((item) => (
              <div
                key={item.term}
                className={`relative p-6 rounded-lg border border-${item.border} bg-${item.accent} backdrop-blur-sm transition-all hover:scale-[1.01] hover:border-opacity-50`}
                style={{
                  background: `linear-gradient(135deg, rgba(13, 26, 26, 0.6) 0%, rgba(20, 36, 36, 0.4) 100%)`,
                  borderColor: `var(--tw-border-opacity, 1)`,
                }}
              >
                <h3 className={`text-lg font-serif font-semibold text-${item.color} mb-2`}>
                  {item.term}
                </h3>
                <p className="text-parchment-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Current Instabilities ═══ */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <span className="text-red-400 text-lg">◈</span>
            </div>
            <div>
              <h2 className="text-2xl font-serif text-parchment">Current Instabilities</h2>
              <p className="text-sm text-parchment-muted">Where the world is failing</p>
            </div>
          </div>

          <div className="space-y-4">
            {INSTABILITIES.map((item) => (
              <div
                key={item.term}
                className="relative p-6 rounded-lg border border-red-500/15 transition-all hover:scale-[1.01]"
                style={{
                  background: `linear-gradient(135deg, rgba(30, 15, 15, 0.4) 0%, rgba(20, 10, 10, 0.3) 100%)`,
                }}
              >
                <div className="flex items-start gap-4">
                  <span className={`text-${item.color} text-2xl mt-0.5`}>{item.icon}</span>
                  <div>
                    <h3 className={`text-lg font-serif font-semibold text-${item.color} mb-2`}>
                      {item.term}
                    </h3>
                    <p className="text-parchment-muted leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Historical Event ═══ */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
              <span className="text-gold text-lg">⚡</span>
            </div>
            <div>
              <h2 className="text-2xl font-serif text-parchment">Historical Event</h2>
              <p className="text-sm text-parchment-muted">The moment everything changed</p>
            </div>
          </div>

          <div
            className="relative p-8 rounded-lg border border-gold/20"
            style={{
              background: `linear-gradient(135deg, rgba(30, 25, 15, 0.4) 0%, rgba(20, 15, 10, 0.3) 100%)`,
            }}
          >
            <h3 className="text-xl font-serif font-semibold text-gold mb-3">
              The Rogue Architects
            </h3>
            <p className="text-parchment-muted leading-relaxed">
              A group of Vaultkeepers and Dreamers who attempted to repair the failing Pattern. Their actions resulted in the destruction of the Anchors and the current state of the world.
            </p>
          </div>
        </section>

        {/* ═══ Those Who Perceive More ═══ */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <span className="text-teal-400 text-lg">👁</span>
            </div>
            <div>
              <h2 className="text-2xl font-serif text-parchment">Those Who Perceive More</h2>
              <p className="text-sm text-parchment-muted">The rare few who can sense the Pattern</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {PERCEIVERS.map((item) => (
              <div
                key={item.term}
                className="relative p-6 rounded-lg border border-teal-500/15 transition-all hover:scale-[1.01]"
                style={{
                  background: `linear-gradient(135deg, rgba(13, 26, 26, 0.6) 0%, rgba(15, 30, 30, 0.4) 100%)`,
                }}
              >
                <h3 className={`text-lg font-serif font-semibold text-${item.color} mb-2`}>
                  {item.term}
                </h3>
                <p className="text-parchment-muted leading-relaxed text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Common Observations ═══ */}
        <section className="mb-20">
          <h2 className="text-2xl font-serif text-parchment mb-6">Common Observations</h2>
          <div
            className="p-6 rounded-lg border border-gold/10"
            style={{
              background: `linear-gradient(135deg, rgba(13, 26, 26, 0.4) 0%, rgba(20, 36, 36, 0.3) 100%)`,
            }}
          >
            <ul className="space-y-3 text-parchment-muted">
              <li className="flex items-start gap-3">
                <span className="text-gold/60 mt-1.5">◦</span>
                <span>The world is not uniformly stable</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold/60 mt-1.5">◦</span>
                <span>Some regions behave normally, others do not</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold/60 mt-1.5">◦</span>
                <span>Memory, time, and causality may be unreliable in certain areas</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold/60 mt-1.5">◦</span>
                <span>Most people are unaware of the larger structure or its failure</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ═══ Current State ═══ */}
        <section className="mb-20">
          <div
            className="text-center p-10 rounded-lg border border-gold/15"
            style={{
              background: `linear-gradient(135deg, rgba(20, 30, 30, 0.5) 0%, rgba(13, 20, 20, 0.4) 100%)`,
            }}
          >
            <h2 className="text-2xl font-serif text-parchment mb-6">Current State of the World</h2>
            <p className="text-lg text-parchment-muted leading-relaxed max-w-2xl mx-auto mb-6">
              The Everloop continues to exist, but the Pattern beneath it is weakening.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="px-4 py-2 rounded-full border border-parchment-muted/20 text-parchment-muted">
                Hollows are increasing
              </span>
              <span className="px-4 py-2 rounded-full border border-red-400/20 text-red-400/80">
                The Fray is spreading
              </span>
              <span className="px-4 py-2 rounded-full border border-gold/20 text-gold/80">
                Shards remain scattered
              </span>
            </div>
            <p className="text-parchment-muted/60 text-sm mt-6 italic">
              No confirmed method exists to fully restore stability.
            </p>
          </div>
        </section>

        {/* ═══ Open Questions ═══ */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-parchment mb-6">Open Questions</h2>
          <div className="space-y-4">
            {[
              'Why did the Pattern begin to fail?',
              'What happened to the Prime Beings?',
              'Do the First Architects still exist in any form?',
              'Can the Shards be used to restore balance, or only to delay collapse?',
            ].map((question, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-lg border border-gold/10 transition-all hover:border-gold/20"
                style={{
                  background: `linear-gradient(135deg, rgba(13, 26, 26, 0.3) 0%, rgba(20, 36, 36, 0.2) 100%)`,
                }}
              >
                <span className="text-gold/40 font-serif text-lg mt-0.5">?</span>
                <p className="text-parchment italic leading-relaxed">{question}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-8 border-t border-gold/10">
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/stories">
              <Button variant="canon" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Read Stories
              </Button>
            </Link>
            <Link href="/map">
              <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                Explore the Map
              </Button>
            </Link>
            <Link href="/players-guide">
              <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                Player&apos;s Guide
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
