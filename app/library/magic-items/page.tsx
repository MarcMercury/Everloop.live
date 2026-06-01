import { searchMagicItems } from '@/lib/open5e'
import Link from 'next/link'
import { Suspense } from 'react'
import { Sparkles } from 'lucide-react'

export const metadata = { title: 'Magic Items — Compendium' }
export const dynamic = 'force-dynamic'

const RARITIES = ['common', 'uncommon', 'rare', 'very-rare', 'legendary', 'artifact']

interface PageProps { searchParams: Promise<{ q?: string; rarity?: string }> }

export default async function MagicItemsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const search = params.q?.trim() || undefined
  const rarity = params.rarity || undefined

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <header className="mb-6 flex items-center gap-3">
        <Sparkles className="w-7 h-7 text-cyan-300" />
        <div>
          <h1 className="text-3xl font-serif text-parchment">Magic Items</h1>
          <Link href="/library" className="text-xs text-parchment-muted hover:text-gold">← Library</Link>
        </div>
      </header>

      <form className="grid sm:grid-cols-3 gap-3 mb-6">
        <input name="q" defaultValue={search} placeholder="Search…" className="sm:col-span-2 bg-charcoal-950 border border-gold/15 rounded-md px-3 py-2 text-sm text-parchment placeholder:text-parchment-muted/60" />
        <select name="rarity" defaultValue={rarity ?? ''} className="bg-charcoal-950 border border-gold/15 rounded-md px-3 py-2 text-sm text-parchment capitalize">
          <option value="">All rarities</option>
          {RARITIES.map((r) => <option key={r} value={r}>{r.replace('-', ' ')}</option>)}
        </select>
        <button type="submit" className="sm:col-span-3 bg-gold/20 hover:bg-gold/30 border border-gold/30 text-gold py-2 rounded-md text-sm font-medium">Search</button>
      </form>

      <Suspense fallback={<p className="text-parchment-muted">Loading…</p>}>
        <Results search={search} rarity={rarity} />
      </Suspense>
    </div>
  )
}

async function Results({ search, rarity }: { search?: string; rarity?: string }) {
  try {
    const data = await searchMagicItems({ search, rarity, limit: 60 })
    if (data.results.length === 0) return <p className="text-parchment-muted text-center py-8">No magic items found.</p>
    return (
      <ul className="space-y-2">
        {data.results.map((it) => (
          <li key={it.key} className="rounded-md border border-gold/10 bg-teal-rich/20 p-3 hover:border-gold/30">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-parchment font-serif">{it.name}</h3>
                <p className="text-xs text-parchment-muted capitalize">
                  {it.rarity?.name}
                  {it.requires_attunement && <span className="text-amber-400"> • requires attunement</span>}
                </p>
              </div>
            </div>
            {it.description && <p className="text-xs text-parchment-muted mt-2 line-clamp-3">{it.description}</p>}
          </li>
        ))}
      </ul>
    )
  } catch (e) {
    return <p className="text-red-400">Failed to load magic items: {(e as Error).message}</p>
  }
}
