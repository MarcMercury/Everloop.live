'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface ConfirmOptions {
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

type Request = ConfirmOptions & { resolve: (value: boolean) => void }

let enqueue: ((request: Request) => void) | null = null

/**
 * Promise-based replacement for `await confirmDialog()`. Requires
 * `<ConfirmDialogHost />` to be mounted (it is, in the root layout).
 *
 *   if (!(await confirmDialog({ description: 'Delete this chapter?', destructive: true }))) return
 */
export function confirmDialog(options: ConfirmOptions | string): Promise<boolean> {
  const opts = typeof options === 'string' ? { description: options } : options
  return new Promise((resolve) => {
    if (!enqueue) {
      // Host not mounted (e.g. isolated test render): fall back to the native dialog.
      resolve(window.confirm(opts.description))
      return
    }
    enqueue({ ...opts, resolve })
  })
}

export function ConfirmDialogHost() {
  const [queue, setQueue] = useState<Request[]>([])
  const current = queue[0]

  useEffect(() => {
    enqueue = (request) => setQueue((q) => [...q, request])
    return () => {
      enqueue = null
    }
  }, [])

  const settle = (value: boolean) => {
    if (!current) return
    current.resolve(value)
    setQueue((q) => q.slice(1))
  }

  return (
    <Dialog open={!!current} onOpenChange={(open) => !open && settle(false)}>
      {current && (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{current.title ?? 'Are you sure?'}</DialogTitle>
            <DialogDescription>{current.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => settle(false)}>
              {current.cancelLabel ?? 'Cancel'}
            </Button>
            <Button
              variant={current.destructive ? 'destructive' : 'canon'}
              onClick={() => settle(true)}
              autoFocus
            >
              {current.confirmLabel ?? 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}
