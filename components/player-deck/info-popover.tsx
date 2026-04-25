'use client'

/**
 * InfoPopover — bottom-sheet style modal for tap-to-explain on the character sheet.
 * Designed for live-play on tablets/phones: large touch targets, no hover required.
 */

import * as React from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { X } from 'lucide-react'

interface InfoPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  /** Optional accent color (hex / tailwind text color class). */
  accent?: string
  children: React.ReactNode
  /** Optional action footer (e.g. a "Roll" button). */
  footer?: React.ReactNode
}

export function InfoPopover({
  open,
  onOpenChange,
  title,
  subtitle,
  accent,
  children,
  footer,
}: InfoPopoverProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg w-[calc(100vw-2rem)] bg-charcoal-950 border-gold-500/20 text-parchment p-0 overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b border-gold-500/10 flex items-start justify-between gap-3"
          style={accent ? { borderTop: `3px solid ${accent}` } : undefined}
        >
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-serif text-parchment leading-tight">
              {title}
            </DialogTitle>
            {subtitle && (
              <p className="text-[11px] text-parchment-muted uppercase tracking-wider mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-parchment-muted hover:text-parchment p-1 -m-1 rounded touch-target"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto text-sm leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-gold-500/10 bg-charcoal-950/50">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/** Small section header within an InfoPopover body. */
export function InfoSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="text-[10px] text-parchment-muted uppercase tracking-wider font-medium mb-1">
        {label}
      </div>
      <div className="text-parchment/90">{children}</div>
    </div>
  )
}

/** Bullet list inside an InfoPopover. */
export function InfoBullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1 list-disc list-outside pl-4 marker:text-gold-500/40">
      {items.map((item, i) => (
        <li key={i} className="text-parchment/85">
          {item}
        </li>
      ))}
    </ul>
  )
}
