import Link from 'next/link'
import { findCanonReferences } from '@/lib/library-cross-links'
import { Link2 } from 'lucide-react'

/**
 * Server component: lists canonical Everloop entities mentioning this compendium item.
 * Differentiates the Library from generic SRD viewers.
 */
export async function CanonRefs({ searchTerm }: { searchTerm: string }) {
  const refs = await findCanonReferences(searchTerm)
  if (refs.length === 0) return null

  return (
    <aside className="rounded-lg border border-gold/15 bg-teal-rich/30 p-4 mt-6">
      <div className="flex items-center gap-2 mb-3 text-sm text-gold">
        <Link2 className="w-4 h-4" />
        <span className="font-semibold uppercase tracking-wider text-xs">Appears in the Everloop</span>
      </div>
      <ul className="space-y-2">
        {refs.map((r) => (
          <li key={r.id}>
            <Link
              href={`/explore/${r.type}/${r.slug ?? r.id}`}
              className="block text-sm text-parchment hover:text-gold transition-colors"
            >
              <span className="font-medium">{r.name}</span>
              <span className="text-parchment-muted/60 ml-2 text-xs uppercase">{r.type}</span>
              {r.summary && (
                <span className="block text-xs text-parchment-muted mt-0.5 line-clamp-1">{r.summary}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
