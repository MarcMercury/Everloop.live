import Link from 'next/link'
import { ArrowLeft, BookOpen, Sparkles, Clock, Headphones } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'The Everloop – Narrative History | Everloop Library',
  description: 'The foundational history of the Everloop — from the Drift to the Pattern, from the First Architects to the unraveling.',
}

const SECTIONS: { title?: string; paragraphs: string[] }[] = [
  {
    paragraphs: [
      'The world is not a natural occurrence.',
      'It holds because something is holding it.',
    ],
  },
  {
    title: 'The Drift',
    paragraphs: [
      'Before anything could remain, there was only the Drift.',
      'Not emptiness — never emptiness — but a vast, shifting expanse where matter and intent had no boundary between them. Form would begin, hesitate, and dissolve. A mountain might rise from ash, hold for a breath, then scatter into light. A feeling could take shape, flicker, and vanish before it could be understood.',
      'Nothing stayed. Nothing repeated.',
      'Everything existed only as long as it was becoming something else.',
      'And yet — even there — something gathered.',
      'Within the Drift moved vast presences, later called the Prime Beings. They were not creators. They did not build. They did not choose. They were concentrations — Hunger, Storm, Silence, Birth — forces that gave weight to the chaos around them.',
      'Where they passed, the Drift thickened.',
      'For a moment — just a moment — things almost held.',
      'But never long enough.',
    ],
  },
  {
    title: 'The Fold',
    paragraphs: [
      'At the furthest edge of that chaos, something changed.',
      'The motion slowed.',
      'Not enough to stop — but enough to hesitate.',
      'And in that hesitation, something remained.',
      'Not perfectly. Not forever. But longer than anything had before.',
      'That boundary came to be known as the Fold.',
      'And within it, something new emerged — not born, not made, but self-formed from the pressure of intent itself.',
      'They were the first to persist.',
      'The first to remain themselves across more than a single moment.',
      'They became known as the First Architects.',
    ],
  },
  {
    title: 'The First Map',
    paragraphs: [
      'They did not build the world.',
      'They understood the problem.',
      'Everything could become anything.',
      'But nothing could remain.',
      'So they began — not by creating, but by limiting.',
      'From the instability around them, they traced out a structure — what would later be called the First Map. It was not a map of land or place, but of relationship. Geometry without surface. Light without source. A way for things to follow one another instead of collapsing back into formlessness.',
      'It was not the world.',
      'It was the first time the world was told how to hold.',
    ],
  },
  {
    title: 'The Pattern',
    paragraphs: [
      'From that shaping, something deeper took form.',
      'Not seen, but binding.',
      'A continuous weave beneath everything — the Pattern — through which time could move forward, matter could remain itself, and memory could take hold.',
      'For the first time, a moment could lead into the next.',
      'For the first time, something could be known — because it could remain.',
      'But it would not hold on its own.',
      'The Drift pressed against it constantly, pulling, dissolving, undoing.',
      'So the First Architects made a final decision.',
      'They gave themselves to it.',
    ],
  },
  {
    title: 'The Anchors',
    paragraphs: [
      'They fixed themselves into the Pattern — not symbolically, not in memory, but in truth.',
      'They became the Anchors.',
      'What had once been will became weight. What had been presence became foundation.',
      'They could no longer move. No longer change. No longer return.',
      'But around them, something impossible happened.',
      'Things began to stay.',
      'Stone did not forget itself between moments. Water returned to the same path. Time began to move forward instead of collapsing inward.',
      'Continuity took root.',
    ],
  },
  {
    title: 'The Everloop',
    paragraphs: [
      'From that held structure, the world rose.',
      'The chaos of the Drift was drawn inward, slowed, shaped, and passed through the First Map — woven into the Pattern and carried into everything that followed.',
      'And from it, the Everloop grew.',
      'Not separate from what came before, but formed from it — a living surface stretched over chaos, where things could exist long enough to matter.',
      'Life emerged. Memory followed.',
      'And with memory came weight.',
      'The more something was lived, the more it resisted being undone. The world was not fixed — but it held.',
      'For a time.',
    ],
  },
  {
    title: 'The Unraveling',
    paragraphs: [
      'Nothing that holds can hold forever.',
      'The Pattern was never solid. It was tension — held in place by what had been sacrificed to create it. And over time, that tension began to loosen.',
      'At first, it was subtle.',
      'A place that felt quieter than it should. A moment that didn\'t fully connect to the next. A memory that slipped — not gone, but never fully there.',
      'Then it widened.',
      'There are places now where things do not break — they simply fail to continue.',
      'Sound dulls. Color fades. A step is taken, and the ground does not fully remember it. People pass through and leave no trace — not because they are erased, but because they were never fully held.',
      'These are the Hollows.',
      'Elsewhere, the opposite.',
      'Too much holds at once.',
      'Moments overlap. Seasons sit on top of one another. Cause and effect lose their order. A shadow might hesitate, then move without its source. A word might be spoken twice, then not at all.',
      'The world is not collapsing.',
      'It is losing its agreement with itself.',
    ],
  },
  {
    title: 'The Rogue Architects',
    paragraphs: [
      'There were those who could feel it.',
      'Who could sense the Pattern beneath things — the tension that kept the world from slipping.',
      'They believed it could be repaired.',
      'They called themselves the Rogue Architects.',
      'They believed they could do what the First had done — reach into the foundation and restore what was loosening.',
      'They were wrong.',
      'What had been fixed into the Pattern was not meant to be moved.',
      'And in trying to restore it, they struck the very things that made holding possible.',
      'They did not remove them.',
      'They broke them.',
    ],
  },
  {
    title: 'The Shards',
    paragraphs: [
      'The Anchors did not vanish.',
      'They fractured.',
      'What had once been singular became scattered. What had been constant became unstable.',
      'The fragments became known as the Shards.',
      'Each still carried the immense weight of what once held the world together — but without balance, without unity, without restraint.',
      'Where they lie, reality bends to match them.',
      'Time slips. Memory fractures. The world strains to remain itself.',
    ],
  },
  {
    title: 'The Fray',
    paragraphs: [
      'And from that breaking, something began to spread.',
      'Not absence — but instability.',
      'Not silence — but too much at once.',
      'The Fray.',
      'Where the Pattern still exists but no longer holds cleanly, the world begins to pull apart. Moments overlap. Cause loses its place. Reality struggles to agree with itself.',
      'And the Drift — always waiting beneath — presses closer.',
    ],
  },
  {
    title: 'The World Now',
    paragraphs: [
      'The world still stands.',
      'Mostly.',
      'There are places where it holds as it always has — where days follow days, where lives unfold without interruption.',
      'And there are places where it doesn\'t.',
      'Most people never see the difference.',
      'They live within what remains, unaware of what is loosening beneath them.',
      'But some do.',
      'They can feel the Pattern strain. They can sense where things are slipping, where the world is thinning, where continuity is beginning to fail.',
      'And some can do more than feel it.',
      'They can press against it.',
      'Nudge it.',
      'Persuade it to hold a little longer.',
    ],
  },
  {
    title: 'The Cost',
    paragraphs: [
      'But nothing changes in one place alone.',
      'To steady something here is to strain something elsewhere.',
      'And the Shards — those fragments of what once held everything together — can be used.',
      'They can force a place to remain. They can restore what is slipping. They can make something real again.',
      'But they do not restore balance.',
      'They replace it.',
      'To save one place may mean letting another come undone.',
    ],
  },
  {
    paragraphs: [
      'The world is not ending.',
      'It is losing its ability to remain.',
      'And for the first time since the First Architects fixed it in place —',
      'what survives, and what is allowed to slip,',
      'is no longer certain.',
    ],
  },
]

// Section accent colors matching the lore themes
const SECTION_ACCENTS: Record<string, { border: string; glow: string }> = {
  'The Drift': { border: 'border-purple-500/40', glow: 'shadow-purple-500/10' },
  'The Fold': { border: 'border-blue-400/40', glow: 'shadow-blue-400/10' },
  'The First Map': { border: 'border-cyan-400/40', glow: 'shadow-cyan-400/10' },
  'The Pattern': { border: 'border-emerald-400/40', glow: 'shadow-emerald-400/10' },
  'The Anchors': { border: 'border-gold/40', glow: 'shadow-yellow-500/10' },
  'The Everloop': { border: 'border-gold/50', glow: 'shadow-yellow-500/15' },
  'The Unraveling': { border: 'border-orange-500/40', glow: 'shadow-orange-500/10' },
  'The Rogue Architects': { border: 'border-red-400/40', glow: 'shadow-red-400/10' },
  'The Shards': { border: 'border-amber-400/40', glow: 'shadow-amber-400/10' },
  'The Fray': { border: 'border-red-500/40', glow: 'shadow-red-500/10' },
  'The World Now': { border: 'border-teal-400/40', glow: 'shadow-teal-400/10' },
  'The Cost': { border: 'border-rose-400/40', glow: 'shadow-rose-400/10' },
}

export default function NarrativeHistoryPage() {
  return (
    <div className="min-h-screen bg-teal-deep text-parchment">
      {/* Sticky Header */}
      <header className="border-b border-gold/10 bg-teal-deep/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/stories" className="flex items-center gap-2 text-parchment-muted hover:text-parchment transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Library</span>
          </Link>
          <Link href="/" className="text-xl font-serif">
            <span className="text-parchment">Ever</span>
            <span className="text-gold">loop</span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Article Header */}
        <header className="mb-16 pb-8 border-b border-gold/10">
          <Badge className="mb-4 bg-gold/10 text-gold border-gold/30 flex items-center gap-1 w-fit">
            <Sparkles className="w-3 h-3" />
            Foundational Lore
          </Badge>

          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-parchment leading-tight mb-6">
            The Everloop
            <span className="block text-2xl md:text-3xl text-gold/70 font-normal mt-2">
              Narrative History
            </span>
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-parchment-muted text-sm">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Foundational Text
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              ~8 min read
            </span>
          </div>

          {/* Audio Version */}
          <div className="mt-8 p-4 rounded-lg border border-gold/20 bg-gold/5">
            <div className="flex items-center gap-2 mb-3 text-gold text-sm font-medium">
              <Headphones className="w-4 h-4" />
              Listen — Full Narration
            </div>
            <audio
              controls
              preload="metadata"
              className="w-full [&::-webkit-media-controls-panel]:bg-teal-deep/80"
              src="/audio/ElevenLabs_Everlop_full_Narator.mp3"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        </header>

        {/* Story Body */}
        <article className="space-y-16">
          {SECTIONS.map((section, sIdx) => {
            const accent = section.title ? SECTION_ACCENTS[section.title] : null

            return (
              <section key={sIdx} className="relative">
                {/* Section Title */}
                {section.title && (
                  <div className="mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-1.5 h-8 rounded-full ${accent?.border?.replace('border-', 'bg-') || 'bg-gold/40'}`} />
                      <h2 className="text-2xl md:text-3xl font-serif text-parchment">
                        {section.title}
                      </h2>
                    </div>
                    <div className={`mt-2 ml-5 w-24 h-px ${accent?.border?.replace('border-', 'bg-') || 'bg-gold/20'}`} />
                  </div>
                )}

                {/* Paragraphs */}
                <div className={`space-y-5 ${section.title ? 'pl-5 border-l' : ''} ${accent?.border || 'border-transparent'}`}>
                  {section.paragraphs.map((p, pIdx) => {
                    // Short emphatic lines get special treatment
                    const isShort = p.length < 60
                    const isVeryShort = p.length < 35
                    const isFirstSection = sIdx === 0
                    const isLastSection = sIdx === SECTIONS.length - 1

                    if (isFirstSection || isLastSection) {
                      return (
                        <p
                          key={pIdx}
                          className={`text-center font-serif leading-relaxed ${
                            isFirstSection && pIdx === 0
                              ? 'text-2xl md:text-3xl text-parchment italic'
                              : isFirstSection
                              ? 'text-xl md:text-2xl text-gold/80 italic'
                              : isLastSection && pIdx === section.paragraphs.length - 1
                              ? 'text-xl md:text-2xl text-gold font-medium pt-4'
                              : 'text-lg text-parchment/80 italic'
                          }`}
                        >
                          {p}
                        </p>
                      )
                    }

                    if (isVeryShort) {
                      return (
                        <p
                          key={pIdx}
                          className="text-lg text-parchment/90 font-serif italic leading-relaxed"
                        >
                          {p}
                        </p>
                      )
                    }

                    if (isShort) {
                      return (
                        <p
                          key={pIdx}
                          className="text-lg text-parchment/85 font-serif leading-relaxed"
                        >
                          {p}
                        </p>
                      )
                    }

                    return (
                      <p
                        key={pIdx}
                        className="text-lg text-parchment/80 leading-[1.85] font-crimson"
                      >
                        {p}
                      </p>
                    )
                  })}
                </div>

                {/* Section divider */}
                {sIdx < SECTIONS.length - 1 && !section.title && sIdx !== 0 && (
                  <div className="flex justify-center pt-8">
                    <span className="text-gold/40 text-lg">&#x25C7;</span>
                  </div>
                )}
              </section>
            )
          })}
        </article>

        {/* End marker */}
        <div className="mt-16 pt-8 border-t border-gold/10 text-center">
          <span className="text-gold text-2xl">&#x25C7;</span>
          <p className="text-parchment-muted text-sm mt-4">End of &quot;The Everloop – Narrative History&quot;</p>
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 mt-6 text-sm text-parchment-muted hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to the Library
          </Link>
        </div>
      </div>
    </div>
  )
}
