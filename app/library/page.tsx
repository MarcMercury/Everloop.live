import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Wand2, Skull, Sword, Sparkles, BookOpen, FlaskConical, Hammer } from 'lucide-react'

export const metadata = { title: 'Compendium Library' }

const SECTIONS = [
  {
    href: '/library/spells',
    icon: Wand2,
    title: 'Spells',
    description: 'Every spell in the SRD. Filter by class, level, school, casting time, concentration, ritual.',
    color: 'text-violet-300',
    bg: 'from-violet-500/10 to-violet-500/0',
  },
  {
    href: '/library/monsters',
    icon: Skull,
    title: 'Monsters',
    description: 'Creatures by CR, type, size, alignment. Drop directly into encounters and combat.',
    color: 'text-rose-300',
    bg: 'from-rose-500/10 to-rose-500/0',
  },
  {
    href: '/library/equipment',
    icon: Sword,
    title: 'Equipment',
    description: 'Weapons, armor, adventuring gear. Cost, weight, damage, properties.',
    color: 'text-amber-300',
    bg: 'from-amber-500/10 to-amber-500/0',
  },
  {
    href: '/library/magic-items',
    icon: Sparkles,
    title: 'Magic Items',
    description: 'Wondrous items, rings, rods, staves. Filter by rarity & attunement.',
    color: 'text-cyan-300',
    bg: 'from-cyan-500/10 to-cyan-500/0',
  },
  {
    href: '/library/conditions',
    icon: FlaskConical,
    title: 'Conditions & Rules',
    description: 'Every condition, action, and combat rule for fast in-play lookups.',
    color: 'text-emerald-300',
    bg: 'from-emerald-500/10 to-emerald-500/0',
  },
  {
    href: '/library/homebrew',
    icon: Hammer,
    title: 'Homebrew Workshop',
    description: 'Publish custom species, items, and creatures into the Everloop canon.',
    color: 'text-gold',
    bg: 'from-gold/10 to-gold/0',
  },
]

export default function LibraryHubPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-10">
        <div className="flex items-center gap-3 text-parchment-muted text-sm mb-2">
          <BookOpen className="w-4 h-4" /> Compendium
        </div>
        <h1 className="text-4xl font-serif text-parchment">The Library</h1>
        <p className="text-parchment-muted mt-2 max-w-2xl">
          Every rule, creature, spell, and item — searchable, filterable, and one click away during live play.
          Cross-linked to canonical lore wherever it appears.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTIONS.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.href} href={s.href} className="group">
              <Card className={`relative overflow-hidden p-5 bg-gradient-to-br ${s.bg} border-gold/10 hover:border-gold/30 transition-all hover:-translate-y-0.5`}>
                <Icon className={`w-7 h-7 ${s.color} mb-3`} />
                <h2 className="font-serif text-xl text-parchment mb-1">{s.title}</h2>
                <p className="text-sm text-parchment-muted leading-relaxed">{s.description}</p>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
