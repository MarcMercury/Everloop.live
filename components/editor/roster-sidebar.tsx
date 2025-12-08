'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { fetchRoster, type RosterCharacter } from '@/lib/actions/roster'
import { X, User, Users, Loader2, Search, ChevronRight, Globe, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface RosterSidebarProps {
  isOpen: boolean
  onClose: () => void
  onInsertCharacter: (name: string, description: string) => void
}

export function RosterSidebar({
  isOpen,
  onClose,
  onInsertCharacter,
}: RosterSidebarProps) {
  const [characters, setCharacters] = useState<RosterCharacter[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'global' | 'private'>('all')

  useEffect(() => {
    if (isOpen && characters.length === 0) {
      loadRoster()
    }
  }, [isOpen])

  const loadRoster = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await fetchRoster()
      if (result.success && result.characters) {
        setCharacters(result.characters)
      } else {
        setError(result.error || 'Failed to load roster')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roster')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCharacters = characters.filter(char => {
    const matchesSearch = char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (char.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesFilter = filter === 'all' || 
                         (filter === 'global' && char.isGlobal) ||
                         (filter === 'private' && !char.isGlobal)
    return matchesSearch && matchesFilter
  })

  const handleInsert = (char: RosterCharacter) => {
    const desc = char.description 
      ? char.description.slice(0, 150) + (char.description.length > 150 ? '...' : '')
      : ''
    onInsertCharacter(char.name, desc)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="relative ml-auto w-full max-w-md bg-charcoal border-l border-charcoal-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-charcoal-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <Users className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-foreground">Character Roster</h2>
              <p className="text-sm text-muted-foreground">Insert characters into your story</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-charcoal-700 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search & Filter */}
        <div className="p-4 border-b border-charcoal-700 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-navy/50 border border-charcoal-700
                         text-foreground placeholder:text-muted-foreground/50
                         focus:border-gold/50 focus:ring-1 focus:ring-gold/20 focus:outline-none"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-gold text-charcoal hover:bg-gold/90' : ''}
            >
              All
            </Button>
            <Button
              variant={filter === 'global' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('global')}
              className={filter === 'global' ? 'bg-gold text-charcoal hover:bg-gold/90' : ''}
            >
              <Globe className="w-3 h-3 mr-1" />
              Canon
            </Button>
            <Button
              variant={filter === 'private' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('private')}
              className={filter === 'private' ? 'bg-gold text-charcoal hover:bg-gold/90' : ''}
            >
              <Lock className="w-3 h-3 mr-1" />
              Private
            </Button>
          </div>
        </div>
        
        {/* Character List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            </div>
          ) : error ? (
            <div className="p-4">
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
              <Button onClick={loadRoster} variant="outline" size="sm" className="mt-3">
                Retry
              </Button>
            </div>
          ) : filteredCharacters.length === 0 ? (
            <div className="p-8 text-center">
              <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No characters match your search' : 'No characters available'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredCharacters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => handleInsert(char)}
                  className="w-full p-3 rounded-lg text-left hover:bg-navy/50 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground truncate">
                          {char.name}
                        </span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {char.isGlobal ? (
                            <><Globe className="w-3 h-3 mr-1" />Canon</>
                          ) : (
                            <><Lock className="w-3 h-3 mr-1" />Private</>
                          )}
                        </Badge>
                      </div>
                      {char.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {char.description}
                        </p>
                      )}
                      {char.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {char.tags.slice(0, 3).map((tag) => (
                            <span 
                              key={tag}
                              className="px-1.5 py-0.5 text-xs rounded bg-charcoal-700 text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-charcoal-700">
          <p className="text-xs text-muted-foreground text-center">
            Click a character to insert their name into your story
          </p>
        </div>
      </div>
    </div>
  )
}
