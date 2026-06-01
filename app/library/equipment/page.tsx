import Link from 'next/link'
import { WEAPONS, ARMOR } from '@/lib/data/equipment'
import { Sword } from 'lucide-react'

export const metadata = { title: 'Equipment — Compendium' }

interface PageProps { searchParams: Promise<{ q?: string; cat?: string }> }

export default async function EquipmentPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = (params.q ?? '').toLowerCase().trim()
  const cat = params.cat ?? 'all'

  const weapons = WEAPONS.filter((w) => {
    if (q && !w.name.toLowerCase().includes(q) && !w.properties.join(' ').toLowerCase().includes(q)) return false
    if (cat !== 'all' && cat !== 'weapons') return false
    return true
  })
  const armor = ARMOR.filter((a) => {
    if (q && !a.name.toLowerCase().includes(q)) return false
    if (cat !== 'all' && cat !== 'armor') return false
    return true
  })

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <header className="mb-6 flex items-center gap-3">
        <Sword className="w-7 h-7 text-amber-300" />
        <div>
          <h1 className="text-3xl font-serif text-parchment">Equipment</h1>
          <Link href="/library" className="text-xs text-parchment-muted hover:text-gold">← Library</Link>
        </div>
      </header>

      <form className="grid sm:grid-cols-3 gap-3 mb-6">
        <input name="q" defaultValue={params.q} placeholder="Search…" className="sm:col-span-2 bg-charcoal-950 border border-gold/15 rounded-md px-3 py-2 text-sm text-parchment placeholder:text-parchment-muted/60" />
        <select name="cat" defaultValue={cat} className="bg-charcoal-950 border border-gold/15 rounded-md px-3 py-2 text-sm text-parchment">
          <option value="all">All</option>
          <option value="weapons">Weapons</option>
          <option value="armor">Armor</option>
        </select>
        <button type="submit" className="sm:col-span-3 bg-gold/20 hover:bg-gold/30 border border-gold/30 text-gold py-2 rounded-md text-sm font-medium">Search</button>
      </form>

      {(cat === 'all' || cat === 'weapons') && weapons.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif text-xl text-gold border-b border-gold/20 pb-1 mb-3">Weapons</h2>
          <div className="overflow-x-auto rounded-lg border border-gold/10">
            <table className="w-full text-sm">
              <thead className="bg-teal-rich/40 text-parchment-muted text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-left">Damage</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-right">Wt</th>
                  <th className="px-3 py-2 text-right">Cost</th>
                  <th className="px-3 py-2 text-left">Properties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {weapons.map((w) => (
                  <tr key={w.name} className="hover:bg-gold/5">
                    <td className="px-3 py-2 text-parchment font-medium">{w.name}</td>
                    <td className="px-3 py-2 text-parchment-muted">{w.category}</td>
                    <td className="px-3 py-2 text-amber-300 font-mono">{w.damage}</td>
                    <td className="px-3 py-2 text-parchment-muted capitalize">{w.damageType}</td>
                    <td className="px-3 py-2 text-right font-mono text-parchment-muted">{w.weight}</td>
                    <td className="px-3 py-2 text-right font-mono text-parchment-muted">{w.cost}</td>
                    <td className="px-3 py-2 text-xs text-parchment-muted">{w.properties.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(cat === 'all' || cat === 'armor') && armor.length > 0 && (
        <section>
          <h2 className="font-serif text-xl text-gold border-b border-gold/20 pb-1 mb-3">Armor</h2>
          <div className="overflow-x-auto rounded-lg border border-gold/10">
            <table className="w-full text-sm">
              <thead className="bg-teal-rich/40 text-parchment-muted text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">AC</th>
                  <th className="px-3 py-2 text-right">Min STR</th>
                  <th className="px-3 py-2 text-right">Wt</th>
                  <th className="px-3 py-2 text-right">Cost</th>
                  <th className="px-3 py-2 text-left">Stealth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {armor.map((a) => (
                  <tr key={a.name} className="hover:bg-gold/5">
                    <td className="px-3 py-2 text-parchment font-medium">{a.name}</td>
                    <td className="px-3 py-2 text-parchment-muted">{a.type}</td>
                    <td className="px-3 py-2 text-cyan-300 font-mono">{a.ac}</td>
                    <td className="px-3 py-2 text-right font-mono text-parchment-muted">{a.minStr ?? '—'}</td>
                    <td className="px-3 py-2 text-right font-mono text-parchment-muted">{a.weight}</td>
                    <td className="px-3 py-2 text-right font-mono text-parchment-muted">{a.cost}</td>
                    <td className="px-3 py-2 text-xs">{a.stealthDisadv ? <span className="text-rose-400">Disadv.</span> : <span className="text-parchment-muted/60">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
