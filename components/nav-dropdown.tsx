'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavDropdownItem {
  href: string
  label: string
  icon: React.ReactNode
  description?: string
}

interface NavDropdownProps {
  label: string
  icon: React.ReactNode
  items: NavDropdownItem[]
}

export function NavDropdown({ label, icon, items }: NavDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }

  // Close on escape
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  // Close on outside click / tap (mobile + desktop click-toggle)
  React.useEffect(() => {
    if (!open) return
    const handlePointer = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointer)
    return () => document.removeEventListener('pointerdown', handlePointer)
  }, [open])

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1.5 text-sm transition-colors',
          open
            ? 'text-gold'
            : 'text-parchment-muted hover:text-parchment'
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
        <ChevronDown className={cn(
          'w-3 h-3 transition-transform hidden sm:block',
          open && 'rotate-180'
        )} />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
          <div className="min-w-[220px] rounded-lg border border-gold/20 bg-teal-deep/95 backdrop-blur-md shadow-xl shadow-black/30 p-1.5">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-parchment-muted hover:text-parchment hover:bg-teal-light/20 transition-colors group"
              >
                <span className="text-gold/60 group-hover:text-gold transition-colors">
                  {item.icon}
                </span>
                <div>
                  <div className="font-medium">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-parchment-muted/60 mt-0.5">{item.description}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
