'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

export type PanelType = 'lore' | 'stories' | 'notes' | 'drafts' | null

interface SplitViewContextValue {
  isPanelOpen: boolean
  panelType: PanelType
  panelWidth: number
  openPanel: (type: PanelType) => void
  closePanel: () => void
  togglePanel: (type?: PanelType) => void
  setPanelWidth: (width: number) => void
}

const SplitViewContext = createContext<SplitViewContextValue | null>(null)

const STORAGE_KEY = 'everloop-split-view'
const DEFAULT_WIDTH = 400
const MIN_WIDTH = 300
const MAX_WIDTH = 600

interface StoredState {
  panelWidth: number
  lastPanelType: PanelType
}

export function SplitViewProvider({ children }: { children: ReactNode }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [panelType, setPanelType] = useState<PanelType>(null)
  const [panelWidth, setPanelWidthState] = useState(DEFAULT_WIDTH)

  // Load persisted state
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const state: StoredState = JSON.parse(stored)
        if (state.panelWidth >= MIN_WIDTH && state.panelWidth <= MAX_WIDTH) {
          setPanelWidthState(state.panelWidth)
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Persist state changes
  const persistState = useCallback((width: number, type: PanelType) => {
    try {
      const state: StoredState = { panelWidth: width, lastPanelType: type }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  const openPanel = useCallback((type: PanelType) => {
    setPanelType(type)
    setIsPanelOpen(true)
    persistState(panelWidth, type)
  }, [panelWidth, persistState])

  const closePanel = useCallback(() => {
    setIsPanelOpen(false)
    setPanelType(null)
  }, [])

  const togglePanel = useCallback((type?: PanelType) => {
    if (isPanelOpen && (!type || type === panelType)) {
      closePanel()
    } else {
      openPanel(type || 'lore')
    }
  }, [isPanelOpen, panelType, openPanel, closePanel])

  const setPanelWidth = useCallback((width: number) => {
    const clampedWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width))
    setPanelWidthState(clampedWidth)
    persistState(clampedWidth, panelType)
  }, [panelType, persistState])

  // Keyboard shortcut: Cmd/Ctrl + \
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault()
        togglePanel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePanel])

  return (
    <SplitViewContext.Provider
      value={{
        isPanelOpen,
        panelType,
        panelWidth,
        openPanel,
        closePanel,
        togglePanel,
        setPanelWidth,
      }}
    >
      {children}
    </SplitViewContext.Provider>
  )
}

export function useSplitView() {
  const context = useContext(SplitViewContext)
  if (!context) {
    throw new Error('useSplitView must be used within a SplitViewProvider')
  }
  return context
}
