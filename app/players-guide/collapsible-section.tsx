'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  icon: React.ReactNode
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function CollapsibleSection({ icon, title, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className="mb-16">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 mb-8 group cursor-pointer text-left"
      >
        {icon}
        <h2 className="text-2xl font-serif text-parchment flex-1">{title}</h2>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-parchment-muted transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </section>
  )
}
