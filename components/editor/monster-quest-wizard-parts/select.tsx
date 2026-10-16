'use client'

import type { ReactNode } from 'react'

export function Select({
  value,
  onChange,
  children,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  children: ReactNode
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment focus:outline-hidden focus:ring-2 focus:ring-gold/30 ${className}`}
    >
      {children}
    </select>
  )
}
