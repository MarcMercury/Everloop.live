'use client'

import { useRef, useCallback, type ReactNode } from 'react'
import { useSplitView } from './split-view-context'
import { cn } from '@/lib/utils'

interface ResizablePanelProps {
  children: ReactNode
  className?: string
}

export function ResizablePanel({ children, className }: ResizablePanelProps) {
  const { panelWidth, setPanelWidth } = useSplitView()
  const isResizing = useRef(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizing.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !panelRef.current) return
      
      // Calculate new width based on distance from right edge
      const containerRect = panelRef.current.parentElement?.getBoundingClientRect()
      if (!containerRect) return
      
      const newWidth = containerRect.right - e.clientX
      setPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [setPanelWidth])

  return (
    <div
      ref={panelRef}
      style={{ width: panelWidth }}
      className={cn(
        'relative flex-shrink-0 h-full border-l border-charcoal-700 bg-charcoal',
        className
      )}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize 
                   hover:bg-gold/30 active:bg-gold/50 transition-colors z-10
                   group"
      >
        {/* Visual indicator on hover */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 
                        bg-gold/0 group-hover:bg-gold/50 rounded-full transition-colors" />
      </div>

      {/* Panel Content */}
      <div className="h-full overflow-hidden">
        {children}
      </div>
    </div>
  )
}
