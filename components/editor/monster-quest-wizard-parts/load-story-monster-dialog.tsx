'use client'

import Link from 'next/link'
import { ImageIcon, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { WizardStepProps } from './types'

/** Modal for picking an existing Story Monster to upgrade into a Quest Monster. */
export function LoadStoryMonsterDialog({ wizard }: WizardStepProps) {
  const {
    showLoadModal,
    setShowLoadModal,
    isLoadingList,
    loadListError,
    loadList,
    loadStoryMonster,
  } = wizard
  return (
    <Dialog open={showLoadModal} onOpenChange={setShowLoadModal}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Load a Story Monster</DialogTitle>
          <DialogDescription>
            Pick one of your Story Monsters to convert. Its name, tagline, description, and image
            will be loaded — saving will upgrade that entity with full combat stats instead of
            creating a duplicate.
          </DialogDescription>
        </DialogHeader>

        {isLoadingList ? (
          <div className="flex items-center justify-center py-8 text-parchment-muted">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading…
          </div>
        ) : loadListError ? (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {loadListError}
          </div>
        ) : loadList.length === 0 ? (
          <div className="text-center py-8 text-parchment-muted text-sm">
            You don&apos;t have any Story Monsters yet.{' '}
            <Link href="/create/monster/story" className="text-gold hover:underline">
              Create one first
            </Link>
            .
          </div>
        ) : (
          <div className="space-y-2">
            {loadList.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => loadStoryMonster(m)}
                className="w-full text-left flex gap-3 p-3 rounded-lg border border-gold/20 bg-teal-deep/30 hover:border-gold/60 hover:bg-teal-deep/50 transition-all"
              >
                {m.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.imageUrl}
                    alt={m.name}
                    className="w-16 h-16 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-teal-deep/50 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-6 h-6 text-parchment-muted" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-parchment font-medium truncate">{m.name}</div>
                  {m.tagline && (
                    <div className="text-xs text-gold/70 italic truncate">{m.tagline}</div>
                  )}
                  {m.description && (
                    <div className="text-xs text-parchment-muted mt-1 line-clamp-2">
                      {m.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
