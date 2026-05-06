import Link from 'next/link'
import { ArrowLeft, BookOpen, Sparkles, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Known Wonders of the Everloop | Everloop Library',
  description:
    'An Intellectual Review of the Everloop — a survey, classification, and personal account of the notable regions, peoples, and phenomena, by Archael Viremont of the Luminous Fold.',
}

const FRONT_MATTER: string[] = [
  'Being a Survey, Classification, and Personal Account of the Notable Regions, Peoples, and Phenomena of the Everloop',
  'By Archael Viremont, Senior Archivist of the Luminous Fold,',
  'Fellow of the Seventh Circle,',
  'Honorary Member of the Cartographic Society of Iterants',
]

interface Section {
  title?: string
  kicker?: string
  paragraphs?: string[]
  blocks?: { heading: string; body?: string[]; bullets?: string[] }[]
  conclusion?: string[]
}

const SECTIONS: Section[] = [
  {
    title: 'Preface',
    paragraphs: [
      'It is the position of the Luminous Fold that a world not properly observed is a world only half-existing.',
      'For generations, our scholars have catalogued the measurable, the repeatable, and the provable. Yet beyond our ordered centers—beyond the radial cities and the known geometries—there lies a broader Everloop, one less inclined toward compliance.',
      'This volume is the result of a four-Loop expedition undertaken in the interest of correcting that imbalance.',
      'What follows is not myth, nor rumor, nor the unreliable testimony of frightened villagers. It is record. It is classification. It is, insofar as such a thing is possible in a world of shifting structure, truth.',
      'That the reader may find certain interpretations… provincial, or that the peoples described herein may disagree with their classification, is both expected and, in many cases, unavoidable.',
      'The world is not required to understand itself.',
      'But it may yet be understood.',
    ],
  },
  {
    title: 'On the Nature of Attunement',
    paragraphs: [
      'Across all regions of the Everloop, one encounters individuals of peculiar capacity—those who interact with the underlying structure of reality in ways both subtle and profound.',
      'Though nomenclature varies wildly, these individuals fall—without exception—into two functional classifications:',
    ],
    blocks: [
      {
        heading: 'Vaultkeepers',
        body: ['Those who perceive, preserve, and interpret the underlying structure and memory of the world.'],
      },
      {
        heading: 'Dreamers',
        body: ['Those who influence, redirect, or otherwise alter the probable course of events.'],
      },
    ],
    conclusion: [
      'It must be stressed that these are not cultural identities, but operational truths.',
      'The Steppe nomad who calls himself a Pathkeeper, the coastal mystic who claims to speak to tides, and the priest of the Fold who catalogs temporal variance are all, in essence, performing identical functions—however obscured by ritual, superstition, or local pride.',
      'The failure of most regions to recognize this uniformity is, in my estimation, the primary barrier to their advancement.',
    ],
  },
]

interface Region {
  numeral: string
  name: string
  general: string
  peoples: string
  vaultkeepers: string
  dreamers: string
  attunedNote?: string
  flora: string
  fauna: string
  creatures: { name: string; note: string }[]
  conclusion: string[]
}

const REGIONS: Region[] = [
  {
    numeral: 'I',
    name: 'The Luminous Fold',
    general: 'A region of radial cities, ordered expansion, and deliberate construction. Settlement density increases toward central geometries, diminishing outward in planned intervals.',
    peoples: 'Highly structured population organized into institutional tiers. Literacy is near-universal. Movement between roles is regulated. External visitors are documented upon entry.',
    vaultkeepers: 'Archivists',
    dreamers: 'Iterants',
    attunedNote: 'Both are formally trained, classified, and assigned roles within the system.',
    flora: 'Predominantly cultivated. Native growth has been replaced or reorganized into symmetrical and controlled forms. Seasonal cycles are stabilized.',
    fauna: 'Limited within central zones. Peripheral regions host adaptable small mammals and avian species.',
    creatures: [
      { name: 'Loop Hares', note: 'small mammals exhibiting repeated pathing patterns' },
      { name: 'Glasswing Corvids', note: 'reflective-feathered birds nesting near archive structures' },
    ],
    conclusion: [
      'The Fold remains, by all measurable criteria, the only region approaching a coherent and cumulative understanding of the Everloop.',
      'Where others encounter phenomena, the Fold defines them. Where others react, the Fold refines. This distinction, though subtle to the untrained observer, is absolute in its consequences.',
      'It has been suggested—typically by those outside its influence—that the Fold imposes order where none naturally exists. This is, of course, a misreading.',
      'Order does not emerge spontaneously. It is constructed, maintained, and corrected. That the Fold has succeeded in doing so is not evidence of artificiality, but of competence.',
    ],
  },
  {
    numeral: 'II',
    name: 'Bellroot Vale',
    general: 'Dense, interwoven ecosystems. Forest, wetland, and fertile plains coexist without rigid boundary.',
    peoples: 'Distributed villages with moderate population density. Communities are stable, interdependent, and long-standing.',
    vaultkeepers: 'Rootwardens',
    dreamers: 'Weave-Tenders',
    attunedNote: 'Roles are informal and widely integrated into daily life.',
    flora: 'Extensive root systems. Growth is adaptive and persistent. Overgrowth is common in unmanaged areas.',
    fauna: 'Highly diverse. Stable behavioral patterns. High species density.',
    creatures: [
      { name: 'Mossback Elk', note: 'large herbivores with lichen-covered antlers' },
      { name: 'Thread Moths', note: 'small insects found in areas of heightened Pattern activity' },
    ],
    conclusion: [
      'The Vale presents a case of remarkable instinct coupled with near-total absence of formal inquiry.',
      'Its inhabitants display a degree of intuitive attunement that, if encountered within the Fold, would place them among its more promising novices. Yet this capacity is left unexamined, applied only in immediate and localized contexts.',
      'One observes in the Vale a persistent reliance on what might be termed ambient understanding—knowledge absorbed but never articulated.',
      'This produces stability, certainly. But it is the stability of a system that does not know why it functions, and therefore cannot adapt when it ceases to do so.',
      'In mathematical terms: high sensitivity, zero formalization.',
    ],
  },
  {
    numeral: 'III',
    name: 'Varnhalt Frontier',
    general: 'Expanding settlements, trade corridors, and mixed architectural forms. Constant development and restructuring.',
    peoples: 'High-density population centers. Significant cultural diversity. Frequent migration. Power structures shift regularly.',
    vaultkeepers: 'Ledger-Seers',
    dreamers: 'Chancebinders',
    attunedNote: 'Often employed by commercial or governing entities.',
    flora: 'Partially cultivated. Native flora displaced by expansion.',
    fauna: 'Moderate diversity. Larger species displaced outward. Smaller adaptable species persist near settlements.',
    creatures: [
      { name: 'Ironhide Oxen', note: 'domesticated for labor and transport' },
      { name: 'Slipfox', note: 'small predators exhibiting irregular movement patterns' },
    ],
    conclusion: [
      'Varnhalt demonstrates the predictable outcome of applied influence absent structural discipline.',
      'Its practitioners have correctly deduced that reality admits of manipulation. They have further deduced that such manipulation may be exchanged for advantage. From this, however, they have drawn no higher-order conclusions.',
      'The region operates on a model of transactional variance, wherein localized gains are prioritized over systemic coherence. The result is a persistent state of instability which, while often mistaken for dynamism, is more accurately described as unmanaged drift.',
      'There is intelligence present in Varnhalt.',
      'It is simply not aggregated.',
    ],
  },
  {
    numeral: 'IV',
    name: 'The Deyune Steps',
    general: 'Expansive grasslands with minimal fixed structures. Terrain appears uniform but contains subtle navigational variation.',
    peoples: 'Low density. Nomadic populations travel shifting but established routes.',
    vaultkeepers: 'Pathkeepers',
    dreamers: 'Windshapers',
    attunedNote: 'Integrated within leadership and movement structures.',
    flora: 'Dominated by hardy grasses and low-rooted plants. Growth cycles are rapid.',
    fauna: 'Large migratory herds. Predator species track movement patterns.',
    creatures: [
      { name: 'Steppe Runners', note: 'fast herd animals with high endurance' },
      { name: 'Sky Kites', note: 'large gliding predators' },
    ],
    conclusion: [
      'The Steps exhibit a deliberate refusal of permanence, and with it, a corresponding refusal of cumulative knowledge.',
      'Their methods are efficient within constrained parameters. Navigation, adaptation, and survival are executed with notable precision. Yet all such knowledge is bound to motion and therefore dissipates with it.',
      'One might describe their system as perfectly optimized for continuity of existence, and entirely unsuited for advancement beyond it.',
      'They do not fail.',
      'They also do not progress.',
    ],
  },
  {
    numeral: 'V',
    name: 'The Ashen Spine',
    general: 'Volcanic ridges and unstable terrain. Frequent environmental change.',
    peoples: 'Sparse population. Settlements are temporary or fortified.',
    vaultkeepers: 'Ember Scribes',
    dreamers: 'Flamecallers',
    attunedNote: 'Both roles tied directly to survival and environmental management.',
    flora: 'Minimal. Heat-resistant plant life near cooled flows.',
    fauna: 'Low diversity. Species adapted to extreme conditions.',
    creatures: [
      { name: 'Cinder Drakes', note: 'heat-adapted reptiles' },
      { name: 'Ash Crawlers', note: 'burrowing subsurface organisms' },
    ],
    conclusion: [
      'The Spine reduces all variables to immediate consequence.',
      'In such an environment, ineffective practices are eliminated with admirable efficiency. What remains is function—pure, unabstracted, and unexamined.',
      'This produces a form of knowledge that is entirely empirical and entirely local. The inhabitants understand what yields survival under specific conditions, but demonstrate little inclination toward generalization.',
      'In effect, they operate within a closed system of high fidelity and zero expansion.',
      'It is not ignorance.',
      'It is compression.',
    ],
  },
  {
    numeral: 'VI',
    name: 'Virelay Coastlands',
    general: 'Coastal cliffs, ports, and inland waterways. Gradual transition between land and sea.',
    peoples: 'Moderate population centered around coastal settlements. Trade and fishing dominate.',
    vaultkeepers: 'Tidewatchers',
    dreamers: 'Current-Speakers',
    attunedNote: 'Roles associated with navigation and communal coordination.',
    flora: 'Salt-tolerant vegetation along coasts. Inland areas more varied.',
    fauna: 'High marine biodiversity. Predictable coastal species behavior.',
    creatures: [
      { name: 'Drift Whales', note: 'large migratory sea creatures' },
      { name: 'Shoreclaw Crabs', note: 'territorial shoreline scavengers' },
    ],
    conclusion: [
      'The Coastlands base their understanding on observed recurrence, deriving models from cycles sufficiently stable to appear reliable.',
      'This produces a functional predictive framework under normal conditions. However, such frameworks fail under perturbation—a limitation repeatedly observed and consistently unaddressed.',
      'Their error lies not in observation, but in inference.',
      'They assume that repetition implies permanence.',
      'It does not.',
    ],
  },
  {
    numeral: 'VII',
    name: 'The Glass Expanse',
    general: 'Reflective terrain with unstable depth perception. Distances are unreliable.',
    peoples: 'Low density. Small, isolated settlements.',
    vaultkeepers: 'Refractionists',
    dreamers: 'Lightbreakers',
    attunedNote: 'Operate within shifting perceptual frameworks.',
    flora: 'Sparse. Crystalline growths dominate.',
    fauna: 'Limited. Species adapted to visual distortion.',
    creatures: [
      { name: 'Mirror Stalkers', note: 'predators using reflection to obscure movement' },
      { name: 'Glass Serpents', note: 'terrain-blending organisms' },
    ],
    conclusion: [
      'The Expanse abandons fixed reference entirely, substituting instead a system of adaptive interpretation.',
      'While this permits navigation within unstable perceptual environments, it precludes the establishment of shared truth. Without shared truth, knowledge cannot accumulate; without accumulation, refinement is impossible.',
      'The inhabitants of the Expanse demonstrate considerable skill in individual adjustment, but no capacity for collective advancement.',
      'They have mastered variability.',
      'They have forfeited certainty.',
    ],
  },
  {
    numeral: 'VIII',
    name: 'The Drowned Reach',
    general: 'Submerged and partially submerged landmasses. Movement is primarily water-based.',
    peoples: 'Low to moderate population concentrated in elevated or constructed areas.',
    vaultkeepers: 'Depthwardens',
    dreamers: 'Undertides',
    attunedNote: 'Roles focused on recovery, navigation, and unseen environmental influence.',
    flora: 'Aquatic and semi-aquatic plant systems. Root structures extend into submerged ruins.',
    fauna: 'High aquatic diversity. Limited terrestrial life.',
    creatures: [
      { name: 'Hollowfish', note: 'deep-water species found near submerged structures' },
      { name: 'Tidemire Serpents', note: 'large aquatic predators' },
    ],
    conclusion: [
      'The Reach is engaged in a continuous process of recovery, reconstructing fragments of structure from environments that resist preservation.',
      'This work is methodical and, in isolation, commendable. However, it is inherently retrospective. The system operates by retrieving and reassembling what has already been lost.',
      'Such a model cannot produce forward development.',
      'It can only delay disappearance.',
      'In contrast to the Fold, which extends the Pattern through deliberate construction, the Reach remains confined to its remnants.',
    ],
  },
]

const CONCLUSION: string[] = [
  'After four loops of observation, travel, and classification, I find that the Everloop resists not understanding—but agreement.',
  'Each region, in its way, has grasped at some fragment of truth. The nomad understands movement. The coastal dweller understands cycle. The archivist understands structure. The isolated observer understands distortion. None are wholly incorrect.',
  'But none are complete.',
  'It is the error of the unstudied world to believe that perspective is equivalent to knowledge. It is not. Experience alone does not produce understanding. It must be measured, compared, and refined.',
  'The Luminous Fold does not claim perfection. Only process.',
  'We observe where others assume.',
  'We record where others forget.',
  'We compare where others isolate.',
  'The Everloop is not chaos.',
  'It is a system not yet fully described.',
  'Until such time as it is, works such as this must serve as both record and argument—that beneath the divergence of culture and interpretation, there exists a common framework awaiting recognition.',
  'Whether the world chooses to recognize it remains uncertain.',
  'But uncertainty, properly studied, is merely the beginning of knowledge.',
]

const COLOPHON: string[] = [
  'Filed in the Grand Archive of the Luminous Fold',
  'Cycle Unrecorded, Continuity Assumed',
]

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 py-1">
      <span className="text-gold/60 font-serif text-xs uppercase tracking-[0.18em] pt-1">{label}</span>
      <span className="text-parchment/80 font-crimson leading-relaxed">{value}</span>
    </div>
  )
}

export default function KnownWondersPage() {
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
            Known Wonders of the Everloop
            <span className="block text-xl md:text-2xl text-gold/70 font-normal mt-3 italic">
              An Intellectual Review
            </span>
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-parchment-muted text-sm mb-6">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Foundational Text
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              ~18 min read
            </span>
          </div>

          <div className="space-y-1 text-parchment-muted/80 text-sm font-serif italic">
            {FRONT_MATTER.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </header>

        {/* Preface + Attunement */}
        <article className="space-y-14 mb-16">
          {SECTIONS.map((section, idx) => (
            <section key={idx}>
              {section.title && (
                <>
                  <h2 className="text-2xl md:text-3xl font-serif text-gold mb-2">{section.title}</h2>
                  <div className="w-16 h-px bg-gold/30 mb-6" />
                </>
              )}
              {section.paragraphs?.map((p, pIdx) => (
                <p key={pIdx} className="text-lg text-parchment/80 leading-[1.85] font-crimson mb-4">
                  {p}
                </p>
              ))}
              {section.blocks && (
                <div className="space-y-4 my-6 pl-4 border-l border-gold/20">
                  {section.blocks.map((b, bIdx) => (
                    <div key={bIdx}>
                      <h3 className="text-lg font-serif text-parchment mb-1">{b.heading}</h3>
                      {b.body?.map((line, lIdx) => (
                        <p key={lIdx} className="text-parchment/75 font-crimson leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {section.conclusion?.map((p, pIdx) => (
                <p key={pIdx} className="text-lg text-parchment/80 leading-[1.85] font-crimson mb-4">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </article>

        {/* Regional Survey */}
        <div className="text-center my-16">
          <span className="text-gold text-2xl block mb-2">&#x25C7;</span>
          <h2 className="text-sm tracking-[0.4em] uppercase text-gold/70 font-serif">Regional Survey</h2>
        </div>

        <article className="space-y-20">
          {REGIONS.map((region) => (
            <section key={region.numeral}>
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-gold text-2xl font-serif">{region.numeral}.</span>
                  <h2 className="text-2xl md:text-3xl font-serif text-parchment">{region.name}</h2>
                </div>
                <div className="mt-3 w-16 h-px bg-gold/30" />
              </div>

              <div className="space-y-1 mb-6">
                <FieldRow label="General" value={region.general} />
                <FieldRow label="Peoples" value={region.peoples} />
              </div>

              <div className="my-6 p-4 border border-gold/15 rounded bg-parchment/[0.02]">
                <div className="text-gold/60 font-serif text-xs uppercase tracking-[0.18em] mb-3">Attuned Classification</div>
                <div className="grid sm:grid-cols-2 gap-3 text-parchment/85 font-crimson">
                  <div>
                    <span className="text-gold/70">Vaultkeepers:</span> {region.vaultkeepers}
                  </div>
                  <div>
                    <span className="text-gold/70">Dreamers:</span> {region.dreamers}
                  </div>
                </div>
                {region.attunedNote && (
                  <p className="mt-3 text-sm text-parchment-muted italic font-crimson">{region.attunedNote}</p>
                )}
              </div>

              <div className="space-y-1 mb-6">
                <FieldRow label="Flora" value={region.flora} />
                <FieldRow label="Fauna" value={region.fauna} />
              </div>

              <div className="mb-8">
                <div className="text-gold/60 font-serif text-xs uppercase tracking-[0.18em] mb-2">Known Creatures</div>
                <ul className="space-y-1 pl-4 list-disc list-outside marker:text-gold/40">
                  {region.creatures.map((c) => (
                    <li key={c.name} className="text-parchment/80 font-crimson">
                      <span className="text-parchment">{c.name}</span> — {c.note}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-gold/10">
                <h3 className="text-sm tracking-[0.18em] uppercase text-gold/70 font-serif mb-4">
                  {region.name} — Conclusion
                </h3>
                <div className="space-y-4 pl-4 border-l border-gold/10">
                  {region.conclusion.map((p, idx) => {
                    const isShort = p.length < 50
                    return (
                      <p
                        key={idx}
                        className={
                          isShort
                            ? 'text-lg text-parchment/90 font-serif italic leading-relaxed'
                            : 'text-lg text-parchment/80 leading-[1.85] font-crimson'
                        }
                      >
                        {p}
                      </p>
                    )
                  })}
                </div>
              </div>
            </section>
          ))}
        </article>

        {/* Conclusion */}
        <div className="text-center my-16">
          <span className="text-gold text-2xl block mb-2">&#x25C7;</span>
          <h2 className="text-sm tracking-[0.4em] uppercase text-gold/70 font-serif">In Conclusion</h2>
        </div>

        <article className="space-y-4">
          {CONCLUSION.map((p, idx) => {
            const isShort = p.length < 50
            return (
              <p
                key={idx}
                className={
                  isShort
                    ? 'text-lg text-parchment/90 font-serif italic leading-relaxed'
                    : 'text-lg text-parchment/80 leading-[1.85] font-crimson'
                }
              >
                {p}
              </p>
            )
          })}
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
