import { getSpell } from '@/lib/open5e'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CanonRefs } from '@/components/library/canon-refs'

export const dynamic = 'force-dynamic'

export default async function SpellDetailPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  let spell
  try {
    spell = await getSpell(key)
  } catch {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link href="/library/spells" className="text-xs text-parchment-muted hover:text-gold">← Spells</Link>
      <h1 className="text-3xl font-serif text-parchment mt-2">{spell.name}</h1>
      <p className="text-sm text-parchment-muted italic mt-1 capitalize">
        {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} • {spell.school?.name}
        {spell.ritual && <span className="text-purple-400"> • Ritual</span>}
        {spell.requires_concentration && <span className="text-amber-400"> • Concentration</span>}
      </p>

      <dl className="grid grid-cols-2 gap-3 mt-6 text-sm">
        <Stat label="Casting Time" value={spell.casting_time} />
        <Stat label="Range" value={spell.range} />
        <Stat label="Duration" value={spell.duration} />
        <Stat label="Components" value={spell.components?.join(', ')} />
      </dl>

      <article className="prose prose-invert mt-6 max-w-none text-parchment whitespace-pre-wrap">{spell.description}</article>

      {spell.higher_levels && (
        <div className="mt-4 p-3 rounded-md border border-amber-500/20 bg-amber-500/5">
          <div className="text-xs uppercase tracking-wider text-amber-400 mb-1">At Higher Levels</div>
          <p className="text-sm text-parchment whitespace-pre-wrap">{spell.higher_levels}</p>
        </div>
      )}

      <CanonRefs searchTerm={spell.name} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md bg-teal-rich/30 border border-gold/10 px-3 py-2">
      <dt className="text-xs uppercase tracking-wider text-parchment-muted">{label}</dt>
      <dd className="text-parchment mt-0.5">{value || '—'}</dd>
    </div>
  )
}
