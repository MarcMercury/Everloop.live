import Link from 'next/link'
import { CONDITIONS } from '@/lib/dnd-rules/conditions'
import { FlaskConical } from 'lucide-react'

export const metadata = { title: 'Conditions & Rules — Compendium' }

export default function ConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <header className="mb-6 flex items-center gap-3">
        <FlaskConical className="w-7 h-7 text-emerald-300" />
        <div>
          <h1 className="text-3xl font-serif text-parchment">Conditions</h1>
          <Link href="/library" className="text-xs text-parchment-muted hover:text-gold">← Library</Link>
        </div>
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        {Object.values(CONDITIONS).map((c) => (
          <div key={c.key} className="rounded-md border border-gold/10 bg-teal-rich/20 p-4">
            <h2 className="text-lg font-serif text-emerald-300">{c.name}</h2>
            <p className="text-sm text-parchment mt-1">{c.summary}</p>
            {c.effects.length > 0 && (
              <ul className="text-xs text-parchment-muted mt-2 list-disc list-inside space-y-1">
                {c.effects.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
