import { searchCreatures } from '@/lib/open5e'
import Link from 'next/link'
import { Suspense } from 'react'
import { Skull } from 'lucide-react'

export const metadata = { title: 'Monsters — Compendium' }
export const dynamic = 'force-dynamic'

const TYPES = ['aberration','beast','celestial','construct','dragon','elemental','fey','fiend','giant','humanoid','monstrosity','ooze','plant','undead']
const CR_OPTIONS = ['0','0.125','0.25','0.5','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30']

interface PageProps { searchParams: Promise<{ q?: string; cr?: string; type?: string; ordering?: string }> }

export default async function MonstersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const search = params.q?.trim() || undefined
  const cr = params.cr || undefined
  const type = params.type || undefined
  const ordering = params.ordering || 'challenge_rating_decimal'

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <header className="mb-6 flex items-center gap-3">
        <Skull className="w-7 h-7 text-rose-300" />
        <div>
          <h1 className="text-3xl font-serif text-parchment">Monsters</h1>
          <Link href="/library" className="text-xs text-parchment-muted hover:text-gold">← Library</Link>
        </div>
      </header>

      <form className="grid sm:grid-cols-4 gap-3 mb-6">
        <input name="q" defaultValue={search} placeholder="Search creatures…" className="sm:col-span-2 bg-charcoal-950 border border-gold/15 rounded-md px-3 py-2 text-sm text-parchment placeholder:text-parchment-muted/60" />
        <select name="cr" defaultValue={cr ?? ''} className="bg-charcoal-950 border border-gold/15 rounded-md px-3 py-2 text-sm text-parchment">
          <option value="">All CRs</option>
          {CR_OPTIONS.map((c) => <option key={c} value={c}>CR {c}</option>)}
        </select>
        <select name="type" defaultValue={type ?? ''} className="bg-charcoal-950 border border-gold/15 rounded-md px-3 py-2 text-sm text-parchment capitalize">
          <option value="">All types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select name="ordering" defaultValue={ordering} className="bg-charcoal-950 border border-gold/15 rounded-md px-3 py-2 text-sm text-parchment">
          <option value="challenge_rating_decimal">Sort: CR ↑</option>
          <option value="-challenge_rating_decimal">Sort: CR ↓</option>
          <option value="name">Sort: Name A→Z</option>
        </select>
        <button type="submit" className="sm:col-span-4 bg-gold/20 hover:bg-gold/30 border border-gold/30 text-gold py-2 rounded-md text-sm font-medium">Apply Filters</button>
      </form>

      <Suspense fallback={<p className="text-parchment-muted">Loading…</p>}>
        <Results search={search} cr={cr} type={type} ordering={ordering} />
      </Suspense>
    </div>
  )
}

async function Results({ search, cr, type, ordering }: { search?: string; cr?: string; type?: string; ordering?: string }) {
  try {
    const data = await searchCreatures({ search, cr, type, ordering, limit: 60 })
    if (data.results.length === 0) {
      return <p className="text-parchment-muted text-center py-8">No creatures found.</p>
    }
    return (
      <div className="overflow-x-auto rounded-lg border border-gold/10">
        <table className="w-full text-sm">
          <thead className="bg-teal-rich/40 text-parchment-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="px-3 py-2 text-left">CR</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Size</th>
              <th className="px-3 py-2 text-right">HP</th>
              <th className="px-3 py-2 text-right">AC</th>
              <th className="px-3 py-2 text-right">XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/5">
            {data.results.map((m) => (
              <tr key={m.key} className="hover:bg-gold/5">
                <td className="px-3 py-2 text-rose-300 font-mono">{m.challenge_rating_text}</td>
                <td className="px-3 py-2">
                  <Link href={`/library/monsters/${m.key}`} className="text-parchment hover:text-gold font-medium">
                    {m.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-parchment-muted capitalize">{m.type?.name}</td>
                <td className="px-3 py-2 text-parchment-muted">{m.size?.name}</td>
                <td className="px-3 py-2 text-parchment text-right font-mono">{m.hit_points}</td>
                <td className="px-3 py-2 text-parchment text-right font-mono">{m.armor_class}</td>
                <td className="px-3 py-2 text-parchment-muted text-right font-mono">{m.experience_points?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  } catch (e) {
    return <p className="text-red-400">Failed to load creatures: {(e as Error).message}</p>
  }
}
