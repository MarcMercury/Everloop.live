'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Users, 
  X, 
  Plus, 
  Search, 
  Loader2, 
  UserPlus, 
  Crown,
  Eye,
  MessageSquare,
  Edit,
  UserCheck,
  Trash2,
  Check,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  getCollaborators,
  addCollaborator,
  updateCollaboratorRole,
  removeCollaborator,
  type StoryCollaborator,
  type CollaboratorRole,
} from '@/lib/actions/collaborators'
import { cn } from '@/lib/utils'

interface CollaboratorsModalProps {
  storyId: string
  storyTitle: string
  isOpen: boolean
  onClose: () => void
}

const ROLE_CONFIG: Record<CollaboratorRole | 'owner', {
  label: string
  description: string
  icon: typeof Eye
  color: string
}> = {
  owner: {
    label: 'Owner',
    description: 'Full control over the story',
    icon: Crown,
    color: 'text-gold',
  },
  co_author: {
    label: 'Co-Author',
    description: 'Can edit content and manage chapters',
    icon: UserCheck,
    color: 'text-green-400',
  },
  editor: {
    label: 'Editor',
    description: 'Can edit content',
    icon: Edit,
    color: 'text-blue-400',
  },
  commenter: {
    label: 'Commenter',
    description: 'Can add comments and suggestions',
    icon: MessageSquare,
    color: 'text-purple-400',
  },
  viewer: {
    label: 'Viewer',
    description: 'Can only read the story',
    icon: Eye,
    color: 'text-muted-foreground',
  },
}

const AVAILABLE_ROLES: CollaboratorRole[] = ['co_author', 'editor', 'commenter', 'viewer']

export function CollaboratorsModal({
  storyId,
  storyTitle,
  isOpen,
  onClose,
}: CollaboratorsModalProps) {
  const [collaborators, setCollaborators] = useState<StoryCollaborator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Add collaborator state
  const [showAddForm, setShowAddForm] = useState(false)
  const [username, setUsername] = useState('')
  const [selectedRole, setSelectedRole] = useState<CollaboratorRole>('viewer')
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  
  // Role dropdown state
  const [openRoleDropdown, setOpenRoleDropdown] = useState<string | null>(null)
  
  const loadCollaborators = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    const result = await getCollaborators(storyId)
    
    if (result.success && result.collaborators) {
      setCollaborators(result.collaborators)
    } else {
      setError(result.error || 'Failed to load collaborators')
    }
    
    setIsLoading(false)
  }, [storyId])
  
  useEffect(() => {
    if (isOpen) {
      loadCollaborators()
    }
  }, [isOpen, loadCollaborators])
  
  const handleAddCollaborator = async () => {
    if (!username.trim()) return
    
    setIsAdding(true)
    setAddError(null)
    
    const result = await addCollaborator(storyId, username.trim(), selectedRole)
    
    if (result.success && result.collaborator) {
      setCollaborators(prev => [...prev, result.collaborator!])
      setUsername('')
      setSelectedRole('viewer')
      setShowAddForm(false)
    } else {
      setAddError(result.error || 'Failed to add collaborator')
    }
    
    setIsAdding(false)
  }
  
  const handleUpdateRole = async (collaboratorId: string, newRole: CollaboratorRole) => {
    const result = await updateCollaboratorRole(collaboratorId, newRole)
    
    if (result.success && result.collaborator) {
      setCollaborators(prev => 
        prev.map(c => c.id === collaboratorId ? result.collaborator! : c)
      )
    }
    
    setOpenRoleDropdown(null)
  }
  
  const handleRemove = async (collaboratorId: string, userName: string) => {
    if (!confirm(`Remove ${userName} from this story?`)) return
    
    const result = await removeCollaborator(collaboratorId)
    
    if (result.success) {
      setCollaborators(prev => prev.filter(c => c.id !== collaboratorId))
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-charcoal border border-charcoal-700 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-charcoal-700">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gold" />
            <div>
              <h2 className="text-lg font-serif">Collaborators</h2>
              <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                {storyTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-charcoal-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Add Collaborator */}
          {!showAddForm ? (
            <Button
              variant="outline"
              onClick={() => setShowAddForm(true)}
              className="w-full mb-4 gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Collaborator
            </Button>
          ) : (
            <div className="mb-6 p-4 rounded-lg bg-navy/30 border border-charcoal-700">
              <h3 className="text-sm font-medium mb-3">Add Collaborator</h3>
              
              <div className="space-y-3">
                <Input
                  placeholder="Enter username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCollaborator()}
                />
                
                {/* Role Selection */}
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_ROLES.map(role => {
                    const config = ROLE_CONFIG[role]
                    const Icon = config.icon
                    return (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={cn(
                          'p-2 rounded-lg border text-left transition-colors',
                          selectedRole === role
                            ? 'border-gold bg-gold/10'
                            : 'border-charcoal-700 hover:border-charcoal-600'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={cn('w-3.5 h-3.5', config.color)} />
                          <span className="text-sm">{config.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                {addError && (
                  <p className="text-sm text-red-400">{addError}</p>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false)
                      setUsername('')
                      setAddError(null)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddCollaborator}
                    disabled={!username.trim() || isAdding}
                    className="flex-1 gap-2"
                  >
                    {isAdding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Collaborators List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-2">{error}</p>
              <Button variant="ghost" size="sm" onClick={loadCollaborators}>
                Try again
              </Button>
            </div>
          ) : collaborators.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No collaborators yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Add collaborators to work on this story together
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {collaborators.map(collab => {
                const roleConfig = ROLE_CONFIG[collab.role]
                const RoleIcon = roleConfig.icon
                const isPending = !collab.accepted_at
                
                return (
                  <div
                    key={collab.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      isPending 
                        ? 'border-gold/30 bg-gold/5' 
                        : 'border-charcoal-700 bg-charcoal-800/30'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-charcoal-700 flex items-center justify-center overflow-hidden">
                        {collab.user?.avatar_url ? (
                          <img 
                            src={collab.user.avatar_url} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-medium text-gold">
                            {collab.user?.username?.[0]?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium">
                          {collab.user?.display_name || collab.user?.username || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            @{collab.user?.username}
                          </span>
                          {isPending && (
                            <Badge variant="outline" className="text-[10px] border-gold/50 text-gold">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Role Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenRoleDropdown(
                            openRoleDropdown === collab.id ? null : collab.id
                          )}
                          className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm',
                            'hover:bg-charcoal-700 transition-colors',
                            roleConfig.color
                          )}
                        >
                          <RoleIcon className="w-3.5 h-3.5" />
                          <span>{roleConfig.label}</span>
                          <ChevronDown className="w-3 h-3 opacity-50" />
                        </button>
                        
                        {openRoleDropdown === collab.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-charcoal border border-charcoal-700 rounded-lg shadow-xl z-10 py-1">
                            {AVAILABLE_ROLES.map(role => {
                              const config = ROLE_CONFIG[role]
                              const Icon = config.icon
                              const isSelected = role === collab.role
                              
                              return (
                                <button
                                  key={role}
                                  onClick={() => handleUpdateRole(collab.id, role)}
                                  className={cn(
                                    'w-full flex items-center gap-2 px-3 py-2 text-left text-sm',
                                    'hover:bg-charcoal-700 transition-colors',
                                    isSelected && 'bg-charcoal-800'
                                  )}
                                >
                                  <Icon className={cn('w-4 h-4', config.color)} />
                                  <div className="flex-1">
                                    <p className={config.color}>{config.label}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {config.description}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-gold" />
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(
                          collab.id, 
                          collab.user?.display_name || collab.user?.username || 'this user'
                        )}
                        className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Remove collaborator"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-charcoal-700">
          <p className="text-xs text-muted-foreground text-center">
            Collaborators can access this story based on their role permissions
          </p>
        </div>
      </div>
    </div>
  )
}
