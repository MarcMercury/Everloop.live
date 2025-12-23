'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { 
  X, 
  Type, 
  Sun, 
  Moon, 
  BookOpen,
  Minus,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Clock,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Theme configurations
type ThemeMode = 'light' | 'dark' | 'sepia'

interface ThemeConfig {
  bg: string
  text: string
  accent: string
  muted: string
  icon: React.ReactNode
  label: string
}

const THEMES: Record<ThemeMode, ThemeConfig> = {
  light: {
    bg: 'bg-[#faf8f5]',
    text: 'text-[#2c2c2c]',
    accent: 'text-[#d4af37]',
    muted: 'text-[#666]',
    icon: <Sun className="w-4 h-4" />,
    label: 'Light'
  },
  dark: {
    bg: 'bg-[#1a1a2e]',
    text: 'text-[#e8e8e8]',
    accent: 'text-[#ffd700]',
    muted: 'text-[#888]',
    icon: <Moon className="w-4 h-4" />,
    label: 'Night'
  },
  sepia: {
    bg: 'bg-[#f4ecd8]',
    text: 'text-[#5b4636]',
    accent: 'text-[#8b6914]',
    muted: 'text-[#7a6b5a]',
    icon: <BookOpen className="w-4 h-4" />,
    label: 'Sepia'
  }
}

// Font configurations
type FontFamily = 'serif' | 'sans' | 'mono'

const FONTS: Record<FontFamily, { name: string; class: string }> = {
  serif: { name: 'Serif', class: 'font-serif' },
  sans: { name: 'Sans', class: 'font-sans' },
  mono: { name: 'Mono', class: 'font-mono' }
}

// Text alignment
type TextAlign = 'left' | 'center' | 'justify'

interface ReadingModeProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  wordCount: number
  authorName?: string
  chapterTitle?: string
}

// Calculate reading time (average 200-250 words per minute)
function calculateReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 225)
  if (minutes < 1) return 'Less than 1 min'
  if (minutes === 1) return '1 min read'
  return `${minutes} min read`
}

// Reading progress tracker
function useReadingProgress() {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement
      const scrollTop = target.scrollTop
      const scrollHeight = target.scrollHeight - target.clientHeight
      const newProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
      setProgress(Math.min(100, Math.max(0, newProgress)))
    }
    
    const container = document.getElementById('reading-mode-content')
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])
  
  return progress
}

export function ReadingMode({
  isOpen,
  onClose,
  title,
  content,
  wordCount,
  authorName,
  chapterTitle
}: ReadingModeProps) {
  // Settings state
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [font, setFont] = useState<FontFamily>('serif')
  const [fontSize, setFontSize] = useState(18)
  const [lineHeight, setLineHeight] = useState(1.8)
  const [textAlign, setTextAlign] = useState<TextAlign>('justify')
  const [showControls, setShowControls] = useState(true)
  
  const progress = useReadingProgress()
  const readingTime = calculateReadingTime(wordCount)
  const themeConfig = THEMES[theme]
  
  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === '+' || e.key === '=') {
        setFontSize(prev => Math.min(32, prev + 2))
      } else if (e.key === '-') {
        setFontSize(prev => Math.max(12, prev - 2))
      } else if (e.key === 'h') {
        setShowControls(prev => !prev)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])
  
  // Cycle through themes
  const cycleTheme = useCallback(() => {
    const themes: ThemeMode[] = ['light', 'sepia', 'dark']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }, [theme])
  
  if (!isOpen) return null
  
  return (
    <div className={cn(
      "fixed inset-0 z-50 transition-colors duration-300",
      themeConfig.bg
    )}>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50">
        <div 
          className="h-full bg-gradient-to-r from-gold to-gold/70 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Top Controls */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
        <div className={cn(
          "flex items-center justify-between px-6 py-4",
          "bg-gradient-to-b from-black/20 to-transparent"
        )}>
          {/* Left: Close & Title */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={cn("hover:bg-white/10", themeConfig.text)}
            >
              <X className="w-5 h-5" />
            </Button>
            <div>
              <h1 className={cn("font-serif text-lg", themeConfig.text)}>
                {title}
              </h1>
              {chapterTitle && (
                <p className={cn("text-sm", themeConfig.muted)}>
                  {chapterTitle}
                </p>
              )}
            </div>
          </div>
          
          {/* Right: Reading info */}
          <div className={cn("flex items-center gap-4 text-sm", themeConfig.muted)}>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{readingTime}</span>
            </div>
            <span>{wordCount.toLocaleString()} words</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div 
        id="reading-mode-content"
        className="h-full overflow-y-auto pt-16 pb-24"
      >
        <article 
          className={cn(
            "max-w-2xl mx-auto px-8 py-12",
            themeConfig.text,
            FONTS[font].class
          )}
          style={{ 
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            textAlign: textAlign
          }}
        >
          {/* Title block */}
          <header className="mb-12 text-center">
            <h1 
              className={cn("font-serif mb-4", themeConfig.accent)}
              style={{ fontSize: `${fontSize * 2}px`, lineHeight: 1.2 }}
            >
              {title}
            </h1>
            {chapterTitle && (
              <h2 
                className={cn("font-serif mb-4", themeConfig.muted)}
                style={{ fontSize: `${fontSize * 1.3}px` }}
              >
                {chapterTitle}
              </h2>
            )}
            {authorName && (
              <p className={cn("italic", themeConfig.muted)}>
                by {authorName}
              </p>
            )}
            <div className={cn(
              "w-24 h-px mx-auto mt-8",
              theme === 'dark' ? 'bg-gold/30' : 'bg-gold/50'
            )} />
          </header>
          
          {/* Story content */}
          <div 
            className="prose-content"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(content, themeConfig.accent) 
            }}
          />
        </article>
      </div>
      
      {/* Bottom Controls */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-40 transition-all duration-300",
        showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
      )}>
        <div className={cn(
          "flex items-center justify-center gap-2 px-6 py-4",
          "bg-gradient-to-t from-black/20 to-transparent"
        )}>
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={cycleTheme}
            className={cn("hover:bg-white/10", themeConfig.text)}
            title={`Theme: ${themeConfig.label}`}
          >
            {themeConfig.icon}
          </Button>
          
          <div className="w-px h-6 bg-current opacity-20" />
          
          {/* Font family */}
          <div className="flex gap-1">
            {(Object.keys(FONTS) as FontFamily[]).map((f) => (
              <Button
                key={f}
                variant="ghost"
                size="sm"
                onClick={() => setFont(f)}
                className={cn(
                  "hover:bg-white/10 text-xs px-2",
                  font === f ? themeConfig.accent : themeConfig.muted
                )}
              >
                {FONTS[f].name}
              </Button>
            ))}
          </div>
          
          <div className="w-px h-6 bg-current opacity-20" />
          
          {/* Font size */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
              className={cn("hover:bg-white/10", themeConfig.text)}
              disabled={fontSize <= 12}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className={cn("text-sm w-8 text-center", themeConfig.muted)}>
              {fontSize}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
              className={cn("hover:bg-white/10", themeConfig.text)}
              disabled={fontSize >= 32}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="w-px h-6 bg-current opacity-20" />
          
          {/* Line height */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLineHeight(prev => Math.max(1.2, prev - 0.2))}
              className={cn("hover:bg-white/10", themeConfig.text)}
              disabled={lineHeight <= 1.2}
              title="Decrease line spacing"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Type className={cn("w-4 h-4", themeConfig.muted)} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLineHeight(prev => Math.min(2.4, prev + 0.2))}
              className={cn("hover:bg-white/10", themeConfig.text)}
              disabled={lineHeight >= 2.4}
              title="Increase line spacing"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="w-px h-6 bg-current opacity-20" />
          
          {/* Text alignment */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTextAlign('left')}
              className={cn(
                "hover:bg-white/10",
                textAlign === 'left' ? themeConfig.accent : themeConfig.muted
              )}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTextAlign('center')}
              className={cn(
                "hover:bg-white/10",
                textAlign === 'center' ? themeConfig.accent : themeConfig.muted
              )}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTextAlign('justify')}
              className={cn(
                "hover:bg-white/10",
                textAlign === 'justify' ? themeConfig.accent : themeConfig.muted
              )}
            >
              <AlignJustify className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Toggle controls hint */}
      <button
        onClick={() => setShowControls(!showControls)}
        className={cn(
          "fixed bottom-4 right-4 z-50 p-2 rounded-full transition-all",
          "bg-black/10 hover:bg-black/20",
          themeConfig.text
        )}
        title="Press H to toggle controls"
      >
        {showControls ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronUp className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}

// Format plain text content with paragraph breaks
function formatContent(text: string, accentClass: string): string {
  if (!text) return ''
  
  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim())
  
  // Format each paragraph
  return paragraphs.map((p, i) => {
    let html = p.trim()
      .replace(/\n/g, '<br />')
      // Preserve emphasis if present
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
    
    // Add drop cap to first paragraph
    if (i === 0 && html.length > 0) {
      const firstChar = html.charAt(0)
      const rest = html.slice(1)
      return `<p class="first-paragraph"><span class="drop-cap ${accentClass}">${firstChar}</span>${rest}</p>`
    }
    
    return `<p>${html}</p>`
  }).join('')
}
