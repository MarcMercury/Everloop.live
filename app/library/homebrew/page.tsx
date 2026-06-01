import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Hammer, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Row {
  id: string
  slug: string
  name: string
  type: string
  description: string | null
  created_by: string | null
  status: string
  metadata: { is_homebrew?: boolean; kind?: string } | null
}

export default async function HomebrewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Pull anything explicitly marked as homebrew, plus the current user's drafts.
  const { data } = await supabase
    .from('canon_entities')
    .select('id, slug, name, type, description, created_by, status, metadata')
    .order('created_at', { ascending: false })
    .limit(200)

  const rows = ((data ?? []) as Row[]).filter((r) => r.metadata?.is_homebrew === true)
  const mine = user ? rows.filter((r) => r.created_by === user.id) : []
  const others = rows.filter((r) => !user || r.created_by !== user.id)

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-gold mb-2">
            <Hammer className="w-5 h-5" />
            <span className="uppercase tracking-[0.3em] text-xs">Homebrew Workshop</span>
          </div>
          <h1 className="font-serif text-4xl text-parchment">Forge new lore</h1>
          <p className="text-parchment-muted mt-2 max-w-2xl">
            Craft creatures, artifacts, locations, and concepts that the world has not yet seen.
            Drafts remain yours until promoted into canon.
          </p>
        </div>
        {user && (
          <Link href="/library/homebrew/create">
            <Button className="bg-gold text-charcoal-950 hover:bg-gold/90">
              <Plus className="w-4 h-4 mr-1" /> New Homebrew
            </Button>
          </Link>
        )}
      </div>

      {user && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-parchment mb-3">Your Drafts</h2>
          {mine.length === 0 ? (
            <p className="text-parchment-muted text-sm italic">No drafts yet — create one to begin.</p>
          ) : (
            <Grid rows={mine} />
          )}
        </section>
      )}

      <section>
        <h2 className="font-serif text-2xl text-parchment mb-3">Community Homebrew</h2>
        {others.length === 0 ? (
          <p className="text-parchment-muted text-sm italic">Nothing here yet.</p>
        ) : (
          <Grid rows={others} />
        )}
      </section>
    </div>
  )
}

function Grid({ rows }: { rows: Row[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {rows.map((r) => (
        <Link
          key={r.id}
          href={`/library/entity/${r.slug}`}
          className="block p-4 rounded-lg border border-gold/15 bg-charcoal-900/40 hover:border-gold/40 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase tracking-wider text-gold/70">{r.metadata?.kind ?? r.type}</span>
            <span className="text-[10px] uppercase tracking-wider text-parchment-muted">{r.status}</span>
          </div>
          <div className="font-serif text-lg text-parchment">{r.name}</div>
          {r.description && (
            <p className="text-sm text-parchment-muted mt-1 line-clamp-2">{r.description}</p>
          )}
        </Link>
      ))}
    </div>
  )
}
