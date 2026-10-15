'use client'

import { Toaster as Sonner } from 'sonner'

export { toast } from 'sonner'

/** App-wide toast host, styled to the Everloop parchment/teal theme. */
export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'border border-gold/20 bg-teal-rich text-parchment shadow-lg',
          description: 'text-parchment-muted',
        },
      }}
    />
  )
}
