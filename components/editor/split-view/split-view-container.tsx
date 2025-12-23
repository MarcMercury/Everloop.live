'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSplitView } from './split-view-context'
import { ResizablePanel } from './resizable-panel'
import { LoreBrowserPanel } from './panels/lore-browser-panel'
import { StoryReaderPanel } from './panels/story-reader-panel'
import { NotesPanel } from './panels/notes-panel'
import { VoiceTonePanel } from './panels/voice-tone-panel'
import { EntityLinkPanel } from './panels/entity-link-panel'
import { X, BookOpen, ScrollText, FileText, PanelRightClose, Sparkles, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Editor } from '@tiptap/react'

interface SplitViewContainerProps {
  children: React.ReactNode
  storyId?: string
  getText?: () => string
  getEditor?: () => Editor | null
}

const PANEL_TABS = [
  { type: 'lore' as const, label: 'Lore', icon: BookOpen },
  { type: 'stories' as const, label: 'Stories', icon: ScrollText },
  { type: 'notes' as const, label: 'Notes', icon: FileText },
  { type: 'voice' as const, label: 'Voice', icon: Sparkles },
  { type: 'entities' as const, label: 'Entities', icon: Link2 },
] as const

export function SplitViewContainer({ children, storyId, getText, getEditor }: SplitViewContainerProps) {
  const { isPanelOpen, panelType, openPanel, closePanel } = useSplitView()

  return (
    <div className="flex h-full w-full">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-auto">
        {children}
      </div>

      {/* Reference Panel */}
      {isPanelOpen && (
        <ResizablePanel>
          <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-3 border-b border-charcoal-700 bg-navy/30">
              {/* Tab Buttons */}
              <div className="flex gap-1">
                {PANEL_TABS.map((tab) => (
                  <button
                    key={tab.type}
                    onClick={() => openPanel(tab.type)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                      panelType === tab.type
                        ? 'bg-gold/20 text-gold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-charcoal-700'
                    )}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Close Button */}
              <button
                onClick={closePanel}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-charcoal-700 transition-colors"
                title="Close panel (Cmd/Ctrl + \)"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-auto">
              {panelType === 'lore' && <LoreBrowserPanel />}
              {panelType === 'stories' && <StoryReaderPanel />}
              {panelType === 'notes' && <NotesPanel storyId={storyId} />}
              {panelType === 'voice' && getText && <VoiceTonePanel getText={getText} />}
              {panelType === 'entities' && getText && getEditor && (
                <EntityLinkPanel getText={getText} getEditor={getEditor} />
              )}
            </div>
          </div>
        </ResizablePanel>
      )}
    </div>
  )
}

// Toggle button to show in the editor toolbar
export function SplitViewToggle() {
  const { isPanelOpen, togglePanel, panelType } = useSplitView()

  return (
    <button
      onClick={() => togglePanel('lore')}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
        isPanelOpen
          ? 'bg-gold/20 text-gold'
          : 'text-muted-foreground hover:text-foreground hover:bg-charcoal-700'
      )}
      title="Toggle reference panel (Cmd/Ctrl + \)"
    >
      <BookOpen className="w-4 h-4" />
      <span className="hidden sm:inline">Reference</span>
    </button>
  )
}
