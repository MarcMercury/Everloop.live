/**
 * Generic page skeleton — used by route-level loading.tsx files.
 * Pure presentational, no client behavior needed.
 */
export function PageSkeleton({ title = 'Loading…' }: { title?: string }) {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="h-10 w-1/2 rounded-md bg-teal-rich/60" aria-label={title} />
          <div className="h-4 w-3/4 rounded bg-teal-rich/40" />
          <div className="h-4 w-2/3 rounded bg-teal-rich/40" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <div className="h-32 rounded-lg bg-teal-rich/40" />
            <div className="h-32 rounded-lg bg-teal-rich/40" />
            <div className="h-32 rounded-lg bg-teal-rich/40" />
          </div>
          <div className="space-y-3 pt-6">
            <div className="h-16 rounded-lg bg-teal-rich/30" />
            <div className="h-16 rounded-lg bg-teal-rich/30" />
            <div className="h-16 rounded-lg bg-teal-rich/30" />
          </div>
        </div>
      </main>
    </div>
  )
}
