import { searchSpells } from '@/lib/open5e'
import Link from 'next/link'
import { Suspense } from 'react'
import { Wand2 } from 'lucide-react'

export const metadata = { title: 'Spells — Compendium' }
export const dynamic = 'force-dynamic'

const SCHOOLS = ['abjuration', 'conjuration', 'divination', 'enchantment', 'evocation', 'illusion', 'necromancy', 'transmutation']
const LEVELS = ['0','1','2','3','4','5','6','7','8','9'] as const

interface PageProps { searchParams: Promise<{ q?: string; level?: string; school?: string; class?: string }> }

export default async function SpellsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const search = params.q?.trim() || undefined
  const level = params.level ? Number(params.level) : undefined
  const school = params.school || undefined
  const classKey = params.class || undefined

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <header className="mb-6 flex items-center gap-3">
        <Wand2 className="w-7 h-7 text-violet-300" />
        <div>
          <h1 className="text-3xl font-serif text-parchment">Spells</h1>
          <Link href="/library" className="text-xs text-parchment-muted hover:text-gold">← Library</Link>
        </div>
      </header>

      <form className="grid sm:grid-cols-4 gap-3 mb-6" action="">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search spells…"
          className="sm:col-span-2 bg-charcoal-950 border border-gold/15 rounded-md px-3 py-2 text-sm text-parchment placeholder:text-parchment-muted/60 focus:border-gold/40 focus:outline-none"
        />
        <select name="level" defaultValue={params.level ?? ''} className="bg-charcoal-950 border border-gold/15 rounded-md px-3 py-2 text-sm text-parchment">
          <option value="">All levels</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l === '0' ? 'Cantrip' : `Level ${l}`}</option>)}
        </select>
        <select name="school" defaultValue={school ?? ''} className="bg-charcoal-950 border border-gold/15 rounded-md px-3 py-2 text-sm text-parchment capitalize">
          <option value="">All schools</option>
          {SCHOOLS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input name="class" defaultValue={classKey ?? ''} placeholder="Class key (e.g. wizard)" className="bg-charcoal-950 border border-gold/15 rounded-md px-3 py-2 text-sm text-parchment placeholder:text-parchment-muted/60" />
        <button type="submit" className="sm:col-span-4 bg-gold/20 hover:bg-gold/30 border border-gold/30 text-gold py-2 rounded-md text-sm font-medium">Apply Filters</button>
      </form>

      <Suspense fallback={<p className="text-parchment-muted">Loading…</p>}>
        <SpellResults search={search} level={level} school={school} classKey={classKey} />
      </Suspense>
    </div>
  )
}

async function SpellResults({ search, level, school, classKey }: { search?: string; level?: number; school?: string; classKey?: string }) {
  try {
    const data = await searchSpells({ search, level, school, class_key: classKey, limit: 60 })
    if (data.results.length === 0) {
      return <p className="text-parchment-muted text-center py-8">No spells found.</p>
    }
    return (
      <div className="overflow-x-auto rounded-lg border border-gold/10">
        <table className="w-full text-sm">
          <thead className="bg-teal-rich/40 text-parchment-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="px-3 py-2 text-left">Lvl</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">School</th>
              <th className="px-3 py-2 text-left">Casting Time</th>
              <th className="px-3 py-2 text-left">Range</th>
              <th className="px-3 py-2 text-left">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/5">
            {data.results.map((s) => (
              <tr key={s.key} className="hover:bg-gold/5">
                <td className="px-3 py-2 text-gold font-mono">{s.level === 0 ? 'C' : s.level}</td>
                <td className="px-3 py-2">
                  <Link href={`/library/spells/${s.key}`} className="text-parchment hover:text-gold font-medium">
                    {s.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-parchment-muted capitalize">{s.school?.name}</td>
                <td className="px-3 py-2 text-parchment-muted">{s.casting_time}</td>
                <td className="px-3 py-2 text-parchment-muted">{s.range}</td>
                <td className="px-3 py-2 text-xs">
                  {s.requires_concentration && <span className="text-amber-400 mr-1">CONC</span>}
                  {s.ritual && <span className="text-purple-400">RIT</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  } catch (e) {
    return <p className="text-red-400">Failed to load spells: {(e as Error).message}</p>
  }
}
