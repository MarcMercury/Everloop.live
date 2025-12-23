'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Bold, Italic, Heading1, Heading2, 
  List, ListOrdered, Quote, Undo, Redo,
  ChevronUp, ChevronDown, Type, Keyboard,
  Maximize2, Eye, Menu, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { type Editor } from '@tiptap/react'

interface MobileToolbarProps {
  editor: Editor | null
  wordCount: number
  onToggleDistractionFree?: () => void
  onToggleReadingMode?: () => void
  onOpenMenu?: () => void
  className?: string
}

export function MobileToolbar({
  editor,
  wordCount,
  onToggleDistractionFree,
  onToggleReadingMode,
  onOpenMenu,
  className,
}: MobileToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFormatting, setShowFormatting] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  
  // Detect mobile keyboard visibility
  useEffect(() => {
    const handleResize = () => {
      // If viewport height is significantly less than window height, keyboard is likely visible
      const isKeyboardOpen = window.visualViewport 
        ? window.visualViewport.height < window.innerHeight * 0.75
        : false
      setKeyboardVisible(isKeyboardOpen)
    }
    
    window.visualViewport?.addEventListener('resize', handleResize)
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize)
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  // Toolbar actions
  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run()
  }, [editor])
  
  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run()
  }, [editor])
  
  const toggleHeading1 = useCallback(() => {
    editor?.chain().focus().toggleHeading({ level: 1 }).run()
  }, [editor])
  
  const toggleHeading2 = useCallback(() => {
    editor?.chain().focus().toggleHeading({ level: 2 }).run()
  }, [editor])
  
  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run()
  }, [editor])
  
  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run()
  }, [editor])
  
  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run()
  }, [editor])
  
  const undo = useCallback(() => {
    editor?.chain().focus().undo().run()
  }, [editor])
  
  const redo = useCallback(() => {
    editor?.chain().focus().redo().run()
  }, [editor])
  
  if (!editor) return null
  
  return (
    <div 
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 md:hidden',
        'bg-charcoal-800/95 backdrop-blur-lg border-t border-charcoal-700',
        'safe-area-inset-bottom',
        className
      )}
    >
      {/* Expanded formatting panel */}
      {isExpanded && (
        <div className="border-b border-charcoal-700 p-2">
          <div className="flex flex-wrap gap-1 justify-center">
            {/* Text formatting */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleBold}
              className={cn(
                'h-10 w-10 p-0',
                editor.isActive('bold') && 'bg-gold/20 text-gold'
              )}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleItalic}
              className={cn(
                'h-10 w-10 p-0',
                editor.isActive('italic') && 'bg-gold/20 text-gold'
              )}
            >
              <Italic className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-8 bg-charcoal-600 self-center mx-1" />
            
            {/* Headings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleHeading1}
              className={cn(
                'h-10 w-10 p-0',
                editor.isActive('heading', { level: 1 }) && 'bg-gold/20 text-gold'
              )}
            >
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleHeading2}
              className={cn(
                'h-10 w-10 p-0',
                editor.isActive('heading', { level: 2 }) && 'bg-gold/20 text-gold'
              )}
            >
              <Heading2 className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-8 bg-charcoal-600 self-center mx-1" />
            
            {/* Lists */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleBulletList}
              className={cn(
                'h-10 w-10 p-0',
                editor.isActive('bulletList') && 'bg-gold/20 text-gold'
              )}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleOrderedList}
              className={cn(
                'h-10 w-10 p-0',
                editor.isActive('orderedList') && 'bg-gold/20 text-gold'
              )}
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleBlockquote}
              className={cn(
                'h-10 w-10 p-0',
                editor.isActive('blockquote') && 'bg-gold/20 text-gold'
              )}
            >
              <Quote className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Main toolbar */}
      <div className="flex items-center justify-between p-2 gap-2">
        {/* Left: Menu */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenMenu}
          className="h-10 w-10 p-0"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        {/* Center: Quick actions */}
        <div className="flex items-center gap-1 flex-1 justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!editor.can().undo()}
            className="h-10 w-10 p-0"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!editor.can().redo()}
            className="h-10 w-10 p-0"
          >
            <Redo className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-8 bg-charcoal-600 mx-1" />
          
          {/* Formatting toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'h-10 px-3 gap-1',
              isExpanded && 'bg-gold/20 text-gold'
            )}
          >
            <Type className="w-4 h-4" />
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </Button>
          
          <div className="w-px h-8 bg-charcoal-600 mx-1" />
          
          {/* Word count */}
          <span className="text-xs text-muted-foreground px-2">
            {wordCount}w
          </span>
        </div>
        
        {/* Right: Mode toggles */}
        <div className="flex items-center gap-1">
          {onToggleDistractionFree && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDistractionFree}
              className="h-10 w-10 p-0"
              title="Distraction-free mode"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          )}
          {onToggleReadingMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleReadingMode}
              className="h-10 w-10 p-0"
              title="Reading mode"
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Keyboard spacer when keyboard is visible */}
      {keyboardVisible && (
        <div className="h-8 flex items-center justify-center border-t border-charcoal-700">
          <Keyboard className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}

// Mobile slide-over menu
interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function MobileMenu({ isOpen, onClose, children }: MobileMenuProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu panel */}
      <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-charcoal-800 border-r border-charcoal-700 overflow-y-auto animate-slide-in-left">
        <div className="sticky top-0 bg-charcoal-800 border-b border-charcoal-700 p-4 flex items-center justify-between">
          <h2 className="font-serif text-lg text-gold">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// Hook for detecting mobile
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return isMobile
}
