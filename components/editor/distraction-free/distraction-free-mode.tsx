'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Moon, Sun, Type, AlignLeft, AlignCenter, AlignJustify, Minus, Plus, Volume2, VolumeX, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type DistractionFreeTheme = 'minimal' | 'dark' | 'warm'
type TextAlignment = 'left' | 'center' | 'justify'

interface DistractionFreeModeProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  wordCount: number
  onContentChange?: (text: string) => void
  readOnly?: boolean
}

// Ambient sound URLs (using free ambient sounds)
const AMBIENT_SOUNDS = {
  rain: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3',
  fire: 'https://assets.mixkit.co/sfx/preview/mixkit-campfire-crackles-1330.mp3',
  forest: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3',
}

export function DistractionFreeMode({
  isOpen,
  onClose,
  title,
  content,
  wordCount,
  onContentChange,
  readOnly = false,
}: DistractionFreeModeProps) {
  const [theme, setTheme] = useState<DistractionFreeTheme>('dark')
  const [fontSize, setFontSize] = useState(20)
  const [lineHeight, setLineHeight] = useState(1.8)
  const [alignment, setAlignment] = useState<TextAlignment>('left')
  const [showControls, setShowControls] = useState(false)
  const [typingFocus, setTypingFocus] = useState(true) // Highlight current paragraph
  const [ambientSound, setAmbientSound] = useState<keyof typeof AMBIENT_SOUNDS | null>(null)
  const [audioVolume, setAudioVolume] = useState(0.3)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Handle ambient sounds
  useEffect(() => {
    if (ambientSound && isOpen) {
      if (!audioRef.current) {
        audioRef.current = new Audio()
        audioRef.current.loop = true
      }
      audioRef.current.src = AMBIENT_SOUNDS[ambientSound]
      audioRef.current.volume = audioVolume
      audioRef.current.play().catch(() => {
        // Autoplay blocked, user needs to interact first
      })
    } else if (audioRef.current) {
      audioRef.current.pause()
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [ambientSound, isOpen, audioVolume])
  
  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === 'Escape') {
        onClose()
        return
      }
      
      // Ctrl/Cmd + shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '+':
          case '=':
            e.preventDefault()
            setFontSize(prev => Math.min(prev + 2, 32))
            break
          case '-':
            e.preventDefault()
            setFontSize(prev => Math.max(prev - 2, 14))
            break
          case 't':
            e.preventDefault()
            setTheme(prev => {
              const themes: DistractionFreeTheme[] = ['minimal', 'dark', 'warm']
              const idx = themes.indexOf(prev)
              return themes[(idx + 1) % themes.length]
            })
            break
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])
  
  // Show/hide controls on mouse movement
  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }, [])
  
  // Focus textarea when opening
  useEffect(() => {
    if (isOpen && textareaRef.current && !readOnly) {
      setTimeout(() => {
        textareaRef.current?.focus()
        // Move cursor to end
        const len = textareaRef.current?.value.length || 0
        textareaRef.current?.setSelectionRange(len, len)
      }, 100)
    }
  }, [isOpen, readOnly])
  
  // Theme configurations
  const getThemeStyles = () => {
    switch (theme) {
      case 'minimal':
        return {
          bg: 'bg-white',
          text: 'text-gray-900',
          muted: 'text-gray-500',
          border: 'border-gray-200',
          controls: 'bg-white/90',
        }
      case 'warm':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-950',
          muted: 'text-amber-700',
          border: 'border-amber-200',
          controls: 'bg-amber-50/90',
        }
      case 'dark':
      default:
        return {
          bg: 'bg-[#1a1a1a]',
          text: 'text-gray-200',
          muted: 'text-gray-500',
          border: 'border-gray-800',
          controls: 'bg-[#1a1a1a]/90',
        }
    }
  }
  
  const themeStyles = getThemeStyles()
  
  if (!isOpen || !mounted) return null
  
  const portalContent = (
    <div 
      className={cn(
        'fixed inset-0 z-[100] flex flex-col transition-colors duration-500',
        themeStyles.bg
      )}
      onMouseMove={handleMouseMove}
    >
      {/* Top controls bar - fades in/out */}
      <div 
        className={cn(
          'fixed top-0 left-0 right-0 p-4 flex items-center justify-between transition-opacity duration-300 backdrop-blur-sm',
          themeStyles.controls,
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className={cn('text-sm', themeStyles.muted)}>
          {wordCount} words
        </div>
        
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(prev => {
              const themes: DistractionFreeTheme[] = ['minimal', 'dark', 'warm']
              const idx = themes.indexOf(prev)
              return themes[(idx + 1) % themes.length]
            })}
            className={themeStyles.muted}
            title="Toggle theme (Ctrl+T)"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
          
          {/* Font Size */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFontSize(prev => Math.max(prev - 2, 14))}
              className={themeStyles.muted}
              title="Decrease font size (Ctrl+-)"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className={cn('text-xs w-8 text-center', themeStyles.muted)}>{fontSize}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFontSize(prev => Math.min(prev + 2, 32))}
              className={themeStyles.muted}
              title="Increase font size (Ctrl++)"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Alignment */}
          <div className="flex items-center border-l border-r px-2 mx-1" style={{ borderColor: 'currentColor', opacity: 0.2 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAlignment('left')}
              className={cn(themeStyles.muted, alignment === 'left' && 'text-gold')}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAlignment('center')}
              className={cn(themeStyles.muted, alignment === 'center' && 'text-gold')}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAlignment('justify')}
              className={cn(themeStyles.muted, alignment === 'justify' && 'text-gold')}
            >
              <AlignJustify className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Typing Focus Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTypingFocus(!typingFocus)}
            className={cn(themeStyles.muted, typingFocus && 'text-gold')}
            title="Focus mode"
          >
            <Type className="w-4 h-4" />
          </Button>
          
          {/* Ambient Sounds */}
          <div className="flex items-center gap-1 border-l pl-2 ml-1" style={{ borderColor: 'currentColor', opacity: 0.2 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAmbientSound(prev => prev === 'rain' ? null : 'rain')}
              className={cn(themeStyles.muted, ambientSound === 'rain' && 'text-gold')}
              title="Rain sounds"
            >
              {ambientSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAmbientSound(prev => prev === 'forest' ? null : 'forest')}
              className={cn(themeStyles.muted, ambientSound === 'forest' && 'text-gold')}
              title="Forest sounds"
            >
              <Music className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Close */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={cn(themeStyles.muted, 'ml-2')}
            title="Exit (Esc)"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Main writing area */}
      <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto px-4 pt-20 pb-32">
        {/* Title */}
        <h1 
          className={cn(
            'text-2xl font-serif font-medium mb-8 max-w-3xl w-full transition-colors',
            themeStyles.text,
            alignment === 'center' && 'text-center',
            alignment === 'left' && 'text-left',
            alignment === 'justify' && 'text-left'
          )}
        >
          {title || 'Untitled'}
        </h1>
        
        {/* Content */}
        <div className="max-w-3xl w-full flex-1">
          {readOnly ? (
            <div 
              className={cn(
                'font-serif whitespace-pre-wrap transition-all',
                themeStyles.text,
                typingFocus && 'focus-paragraphs'
              )}
              style={{ 
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                textAlign: alignment,
              }}
            >
              {content}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onContentChange?.(e.target.value)}
              className={cn(
                'w-full h-full min-h-[60vh] resize-none border-none outline-none font-serif transition-all',
                themeStyles.bg,
                themeStyles.text,
                'placeholder:opacity-30'
              )}
              style={{ 
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                textAlign: alignment,
              }}
              placeholder="Begin writing..."
              spellCheck
            />
          )}
        </div>
      </div>
      
      {/* Bottom hint */}
      <div 
        className={cn(
          'fixed bottom-4 left-1/2 -translate-x-1/2 text-xs transition-opacity duration-300',
          themeStyles.muted,
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-[10px]">Esc</kbd> to exit
      </div>
    </div>
  )
  
  return createPortal(portalContent, document.body)
}

// CSS for focus mode (add to globals.css)
// .focus-paragraphs p:not(:hover):not(:focus-within) { opacity: 0.3; }
