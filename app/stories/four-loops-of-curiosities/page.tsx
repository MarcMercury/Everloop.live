import Link from 'next/link'
import { ArrowLeft, BookOpen, Sparkles, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Four Loops of Curiosities | Everloop Library',
  description:
    'Selected entries from the field journal of Archael Viremont, Senior Archivist of the Luminous Fold — a record of four loops spent traveling beyond the geometries of the Fold.',
}

interface Entry {
  number: string
  title: string
  paragraphs: string[]
}

const FRONT_MATTER: string[] = [
  'Being Certain Private Entries from the Journal of Archael Viremont',
  'Senior Archivist of the Luminous Fold',
  'Fellow of the Seventh Circle',
  'Honorary Member of the Cartographic Society of Iterants',
  'Copied and Preserved in the Grand Archive of the Luminous Fold,',
  'One Hundred and Twelve Loops After Their Composition',
]

const ENTRIES: Entry[] = [
  {
    number: 'I',
    title: 'Cycle 12 (contested), Third Quarter (approximate), Loop 1 — Departure from the Luminous Fold',
    paragraphs: [
      'If these pages are opened by any hand other than mine in due return, then let it be understood: this was not composed for record, but for remembrance.',
      'I departed this morning from the outer ring of the Luminous Fold. The geometry of it remains exact in memory—the way light strikes stone in measured planes, the absence of scent beyond mineral and intent, the quiet certainty that each Hour belongs to the one that follows.',
      'I note the time—Cycle 12, Third Quarter, Loop 1—with the understanding that such notation will not endure.',
      'Within Hours, I encountered three travelers. Each offered a different Cycle. None disputed the others.',
      '“The day moves correctly,” one said.',
      'I begin here, so that if I do not return, you will understand:',
      'Agreement is not a universal condition.',
    ],
  },
  {
    number: 'II',
    title: 'Cycle Unknown, Loop 1 — First Entry into the Deyune Steps',
    paragraphs: [
      'The land opens without boundary.',
      'Grass stretches in every direction, bending in long, continuous waves beneath a wind that does not cease. It produces a low sound—not unlike distant surf, though no water is present.',
      'Encampments appear briefly on the horizon—small geometries of canvas and pole—then dissolve into movement as one approaches.',
      'Curiosity: nothing is allowed to settle.',
      'I attempted to mark a position with a driven stake.',
      'When I returned, the stake remained.',
      'Nothing else did.',
    ],
  },
  {
    number: 'III',
    title: 'Cycle Unknown, Loop 1 — Among the Steps',
    paragraphs: [
      'The air carries dust and dry sweetness—crushed grass, warmed by sun.',
      'A Pathkeeper recited a route for me this evening. His voice was steady, almost musical, describing distance not in measures, but in sensations—when the wind shifts, when the ground hardens, when the sky “opens.”',
      'I requested he write it.',
      'He laughed.',
      '“You carry too much already,” he said.',
      'Curiosity: knowledge retained only in motion.',
      'I do not know how to preserve this.',
    ],
  },
  {
    number: 'IV',
    title: 'Cycle Indeterminate, Loop 1 — On Movement',
    paragraphs: [
      'I attempted to remain in one place.',
      'This proved more difficult than anticipated.',
      'The ground is stable, yet the expectation of movement persists. Others pass, glance, and continue, as though stillness were an error to be corrected.',
      'Curiosity: immobility as anomaly.',
      'I moved again.',
    ],
  },
  {
    number: 'V',
    title: 'Cycle 19, Loop 2 — Approaching the Ashen Spine',
    paragraphs: [
      'The air changes before the land.',
      'It grows dry, then sharp, carrying the taste of ash long before the first blackened ridge appears.',
      'The sky dims—not by cloud, but by suspended particulate that filters light into a dull, constant glow.',
      'Heat rises unevenly from the ground.',
      'Curiosity: warmth without source.',
      'I find breathing requires intention here.',
    ],
  },
  {
    number: 'VI',
    title: 'Cycle 23, Loop 2 — Interior of the Ashen Spine',
    paragraphs: [
      'Sleep is not easily achieved.',
      'The ground radiates heat well into darkness. The air trembles—visibly—distorting edges of stone and tool alike.',
      'I woke to a cracking sound, low and sustained. By morning, a ridge I had noted was gone.',
      'No one remarked upon it.',
      'I presented a model regarding such instability.',
      '“Does it keep the ground from breaking?” I was asked.',
      'It did not.',
      'Curiosity: knowledge accepted only if it prevents failure.',
    ],
  },
  {
    number: 'VII',
    title: 'Cycle Unknown, Loop 2 — Ashen Spine (continued)',
    paragraphs: [
      'Tools are worn rapidly here.',
      'Metal softens, edges dull, bindings loosen. Ink dries too quickly, requiring constant replenishment.',
      'The inhabitants adjust without pause.',
      'I do not.',
      'This places me at a disadvantage I cannot mitigate through theory.',
    ],
  },
  {
    number: 'VIII',
    title: 'Cycle 27, Late Quarter, Loop 2 — Varnhalt Frontier',
    paragraphs: [
      'Varnhalt is noise.',
      'Metal striking wood. Voices overlapping. Animals calling. The air smells of sweat, iron, smoke, and fermented grain.',
      'I observed a negotiation.',
      'A Chancebinder stood beside one party. At a moment of tension, she closed her eyes briefly.',
      'The other party conceded.',
      'Coin was exchanged.',
      'Curiosity: outcome as commodity.',
    ],
  },
  {
    number: 'IX',
    title: 'Cycle Unknown, Loop 2 — Varnhalt Interior',
    paragraphs: [
      'The structures here are layered rather than built.',
      'Wood over stone, fabric over wood, additions without removal. Nothing aligns precisely, yet all functions.',
      'I slept above a stable. The smell rose through the floor—sharp, persistent.',
      'A contract I reviewed altered overnight—not rewritten, but adjusted.',
      'Both parties accepted the new form.',
      'My notes did not match.',
      'Curiosity: agreement without fixity.',
    ],
  },
  {
    number: 'X',
    title: 'Cycle Indeterminate, Loop 2 — On Varnhalt Systems',
    paragraphs: [
      'Ownership appears conditional.',
      'Items change hands not always through exchange, but through influence—subtle or otherwise.',
      'Curiosity: possession as a temporary state.',
      'I have begun marking my belongings more carefully.',
    ],
  },
  {
    number: 'XI',
    title: 'Cycle 3, Early Quarter, Loop 3 — Arrival at Virelay',
    paragraphs: [
      'The air carries salt.',
      'It clings to the skin, the tongue. The sound of the sea is constant—waves striking shore in measured intervals.',
      'I recorded these intervals.',
      'They were consistent.',
      'This was reassuring.',
    ],
  },
  {
    number: 'XII',
    title: 'Cycle 9, Loop 3 — Virelay Coast',
    paragraphs: [
      'A deviation.',
      'Small, but measurable.',
      'I presented it to a Tidewatcher.',
      '“It will correct,” he said, watching the horizon.',
      'He did not examine my notes.',
      'Curiosity: trust in repetition over observation.',
      'I find this untenable.',
      'I also find myself wishing to believe it.',
    ],
  },
  {
    number: 'XIII',
    title: 'Cycle Unknown, Loop 3 — Edge of the Sea',
    paragraphs: [
      'The horizon resists certainty.',
      'Ships moving outward diminish too quickly—or not at all. Distance does not scale reliably beyond a certain point.',
      'I was advised not to travel further.',
      '“It does not hold the same way,” I was told.',
      'I accepted this.',
    ],
  },
  {
    number: 'XIV',
    title: 'Cycle Uncertain, Loop 3 — Entry into Bellroot Vale',
    paragraphs: [
      'Bellroot accumulates.',
      'The air grows damp, carrying the scent of soil and growth. Light fractures through layers of leaves, shifting with each step.',
      'Sound settles—becomes less distinct, yet more complete.',
      'Curiosity: density without boundary.',
      'I lowered my voice without deciding to.',
    ],
  },
  {
    number: 'XV',
    title: 'Cycle 8 (approximate), Loop 3 — Bellroot Interior',
    paragraphs: [
      'I was given a meal.',
      'The preparation lacked all measurable structure—no ratios, no documentation.',
      'And yet—it worked.',
      'Not merely as nourishment, but as… stabilization.',
      'I attempted replication.',
      'I failed.',
      'Curiosity: effect without reproducible cause.',
    ],
  },
  {
    number: 'XVI',
    title: 'Cycle 11 (estimated), Loop 3 — Bellroot Interior',
    paragraphs: [
      'Two individuals worked side by side—one tending exposed roots, the other redirecting water flow.',
      'They did not speak.',
      'Their actions aligned.',
      'I asked who led.',
      'They did not understand the question.',
      'Curiosity: coordination without designation.',
    ],
  },
  {
    number: 'XVII',
    title: 'Cycle 41 (estimated), Loop 4 — Drowned Reach',
    paragraphs: [
      'Water obscures more than sight.',
      'Sound carries unevenly. Distant voices arrive as whispers. Nearby movement is muted.',
      'A Depthwarden recovered a fragment of stone—carved, incomplete.',
      'They named it.',
      'I objected.',
      '“If we do not name it, it disappears again,” they said.',
      'Curiosity: naming as preservation.',
    ],
  },
  {
    number: 'XVIII',
    title: 'Cycle 47 (approximate), Loop 4 — Beneath the Surface',
    paragraphs: [
      'I descended briefly.',
      'Orientation failed immediately. Light fractured. Direction dissolved.',
      'I surfaced disoriented.',
      'They observed.',
      'They did not assist.',
      'Curiosity: experience as instruction.',
    ],
  },
  {
    number: 'XIX',
    title: 'Cycle Unknown, Loop 4 — Drowned Reach (continued)',
    paragraphs: [
      'Structures beneath water persist in fragments—arches without walls, columns without roofs.',
      'They are catalogued.',
      'Interpreted.',
      'Curiosity: reconstruction without completion.',
    ],
  },
  {
    number: 'XX',
    title: 'Cycle Indeterminate, Loop 4 — Entry into the Glass Expanse',
    paragraphs: [
      'The ground reflects.',
      'Not cleanly, but in fractured angles. Light scatters, producing images that do not align with position.',
      'Walking produces a sense of delay—as though movement is observed after it occurs.',
      'Curiosity: perception without confirmation.',
    ],
  },
  {
    number: 'XXI',
    title: 'Cycle Indeterminate, Loop 4 — Glass Expanse (continued)',
    paragraphs: [
      'I measured a distance.',
      'The Refractionist agreed.',
      'Later, she insisted it had changed.',
      'My notes remained consistent.',
      'She smiled.',
      'Curiosity: agreement without permanence.',
    ],
  },
  {
    number: 'XXII',
    title: 'Cycle 40, Final Quarter, Loop 4 — Closing Entry',
    paragraphs: [
      'If these pages are read in my absence—',
      'Let them stand not as conclusions, but as interruption.',
      'I departed with systems.',
      'I return with exceptions.',
      'The world does not conform.',
      'It holds.',
      'If I have forgotten this—',
      'Then this journal is the more accurate account.',
    ],
  },
]

const COLOPHON: string[] = [
  'End of Selected Entries',
  'Recovered and Entered into Archive, Luminous Fold',
  'Preservation Date: Loop 112 Following Original Composition',
]

export default function FourLoopsOfCuriositiesPage() {
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
            Four Loops of Curiosities
            <span className="block text-xl md:text-2xl text-gold/70 font-normal mt-3 italic">
              From the Field Journal of Archael Viremont
            </span>
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-parchment-muted text-sm mb-6">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Foundational Text
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              ~12 min read
            </span>
          </div>

          <div className="space-y-1 text-parchment-muted/80 text-sm font-serif italic">
            {FRONT_MATTER.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </header>

        {/* Story Body */}
        <article className="space-y-14">
          {ENTRIES.map((entry) => (
            <section key={entry.number} className="relative">
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-gold/60 font-serif text-sm tracking-[0.2em] uppercase">Entry</span>
                  <span className="text-gold text-2xl font-serif">{entry.number}</span>
                </div>
                <h2 className="text-base md:text-lg font-serif text-parchment/90 italic mt-2 leading-snug">
                  {entry.title}
                </h2>
                <div className="mt-3 w-16 h-px bg-gold/30" />
              </div>

              <div className="space-y-4 pl-4 border-l border-gold/10">
                {entry.paragraphs.map((p, pIdx) => {
                  const isShort = p.length < 50
                  if (isShort) {
                    return (
                      <p
                        key={pIdx}
                        className="text-lg text-parchment/90 font-serif italic leading-relaxed"
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
            </section>
          ))}
        </article>

        {/* Colophon */}
        <div className="mt-16 pt-8 border-t border-gold/10 text-center space-y-1">
          <span className="text-gold text-2xl block">&#x25C7;</span>
          {COLOPHON.map((line, i) => (
            <p key={i} className="text-parchment-muted/80 text-sm font-serif italic">
              {line}
            </p>
          ))}
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
