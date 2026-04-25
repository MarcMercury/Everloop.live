import Link from 'next/link'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
          <Compass className="w-7 h-7 text-gold" />
        </div>
        <h1 className="text-3xl font-serif text-parchment">
          This thread frays into nothing
        </h1>
        <p className="text-parchment-muted leading-relaxed">
          The page you reached is not part of any canon — it may have been
          unwoven, renamed, or never woven at all.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-b from-gold to-gold-600 text-charcoal text-sm font-medium shadow-md shadow-gold/20 hover:from-gold-400 hover:to-gold-500 transition-all"
          >
            Return home
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center px-4 py-2 rounded-md border border-gold/25 text-gold text-sm hover:bg-gold/10 transition-colors"
          >
            Browse the Archive
          </Link>
        </div>
      </div>
    </div>
  )
}
