'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { updateCanonEntity, deleteCanonEntity, createCanonEntity, canonizeEntity, hydrateEntity } from '@/lib/actions/admin'
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Loader2,
  Check,
  Zap,
  AlertCircle,
  Crown,
  Sparkles
} from 'lucide-react'

interface CanonEntity {
  id: string
  name: string
  slug: string
  type: string
  description: string | null
  status: string
  stability_rating: number
  created_at: string
  updated_at: string
  embedding: number[] | null
  created_by: string | null
  extended_lore: {
    tagline?: string
    image_url?: string | null
    is_user_created?: boolean
  } | null
}

interface EntitiesClientProps {
  entities: CanonEntity[]
}

const entityTypes = ['character', 'location', 'artifact', 'event', 'faction', 'concept', 'creature']
const statusOptions = ['draft', 'proposed', 'canonical', 'deprecated', 'contested']

function EntityTypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    character: '👤',
    location: '🏛️',
    artifact: '✨',
    faction: '⚔️',
    creature: '🐉',
    event: '📜',
    concept: '💭',
  }
  return <span>{icons[type] || '◈'}</span>
}

export function EntitiesClient({ entities }: EntitiesClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'pending' | 'canon' | 'drafts'>('pending')
  const [editingEntity, setEditingEntity] = useState<CanonEntity | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydratingId, setHydratingId] = useState<string | null>(null)
  const [canonizingId, setCanonizingId] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'character',
    description: '',
    status: 'proposed',
    stability_rating: 50,
  })
  
  // Split entities into pending queue, approved canon, and user drafts
  const pendingEntities = entities.filter(e => e.status === 'proposed')
  const canonEntities = entities.filter(e => e.status === 'canonical')
  const userDrafts = entities.filter(e => e.status === 'draft' && e.extended_lore?.is_user_created)
  
  const currentEntities = activeTab === 'pending' ? pendingEntities : activeTab === 'canon' ? canonEntities : userDrafts
  
  const filteredEntities = currentEntities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entity.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || entity.type === typeFilter
    return matchesSearch && matchesType
  })
  
  const openEditModal = (entity: CanonEntity) => {
    setEditingEntity(entity)
    setFormData({
      name: entity.name,
      slug: entity.slug,
      type: entity.type,
      description: entity.description || '',
      status: entity.status,
      stability_rating: entity.stability_rating,
    })
    setError(null)
  }
  
  const openCreateModal = () => {
    setShowCreateModal(true)
    setFormData({
      name: '',
      slug: '',
      type: 'character',
      description: '',
      status: 'proposed',
      stability_rating: 50,
    })
    setError(null)
  }
  
  const closeModal = () => {
    setEditingEntity(null)
    setShowCreateModal(false)
    setError(null)
  }
  
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }
  
  const handleSave = () => {
    setError(null)
    
    startTransition(async () => {
      if (editingEntity) {
        const result = await updateCanonEntity(editingEntity.id, {
          name: formData.name,
          description: formData.description,
          type: formData.type,
          status: formData.status,
          stability_rating: formData.stability_rating,
        })
        
        if (!result.success) {
          setError(result.error || 'Failed to update')
        } else {
          closeModal()
          router.refresh()
        }
      } else {
        const result = await createCanonEntity({
          name: formData.name,
          slug: formData.slug || generateSlug(formData.name),
          type: formData.type,
          description: formData.description,
          status: formData.status,
          stability_rating: formData.stability_rating,
        })
        
        if (!result.success) {
          setError(result.error || 'Failed to create')
        } else {
          closeModal()
          router.refresh()
        }
      }
    })
  }
  
  const handleDelete = (entity: CanonEntity) => {
    if (!confirm(`Are you sure you want to delete "${entity.name}"? This cannot be undone.`)) {
      return
    }
    
    startTransition(async () => {
      const result = await deleteCanonEntity(entity.id)
      
      if (!result.success) {
        alert(result.error || 'Failed to delete')
      } else {
        router.refresh()
      }
    })
  }
  
  const handleCanonize = (entity: CanonEntity) => {
    if (!confirm(`Promote "${entity.name}" to official canon? This will make it publicly visible.`)) {
      return
    }
    
    setCanonizingId(entity.id)
    startTransition(async () => {
      const result = await canonizeEntity(entity.id)
      
      if (!result.success) {
        alert(result.error || 'Failed to canonize')
      } else {
        router.refresh()
      }
      setCanonizingId(null)
    })
  }
  
  const handleHydrate = (entity: CanonEntity) => {
    setHydratingId(entity.id)
    startTransition(async () => {
      const result = await hydrateEntity(entity.id)
      
      if (!result.success) {
        alert(result.error || 'Failed to hydrate')
      } else {
        router.refresh()
      }
      setHydratingId(null)
    })
  }
  
  const handleHydrateAll = async () => {
    const needsHydration = currentEntities.filter(e => !e.embedding)
    if (needsHydration.length === 0) {
      alert('All entities are already hydrated!')
      return
    }
    
    if (!confirm(`Hydrate ${needsHydration.length} entities? This may take a moment.`)) {
      return
    }
    
    // Call the hydrate API endpoint
    try {
      const response = await fetch('/api/admin/hydrate', { method: 'POST' })
      const data = await response.json()
      
      if (data.success) {
        alert(`Hydrated ${data.hydrated} entities!`)
        router.refresh()
      } else {
        alert(data.error || 'Failed to hydrate all')
      }
    } catch {
      alert('Failed to hydrate all entities')
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif mb-2">Entity Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage canon entities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleHydrateAll} 
            variant="outline"
            className="gap-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          >
            <Zap className="w-4 h-4" />
            Hydrate All
          </Button>
          <Button onClick={openCreateModal} className="bg-gold hover:bg-gold/90 text-charcoal">
            <Plus className="w-4 h-4 mr-2" />
            New Entity
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pending' | 'canon' | 'drafts')} className="mb-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <AlertCircle className="w-4 h-4" />
            Pending Approval ({pendingEntities.length})
          </TabsTrigger>
          <TabsTrigger value="canon" className="gap-2">
            <Crown className="w-4 h-4" />
            Approved Canon ({canonEntities.length})
          </TabsTrigger>
          <TabsTrigger value="drafts" className="gap-2">
            <Sparkles className="w-4 h-4" />
            User Drafts ({userDrafts.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
            className={typeFilter === 'all' ? 'bg-gold text-charcoal hover:bg-gold/90' : ''}
          >
            All ({currentEntities.length})
          </Button>
          {entityTypes.map((type) => {
            const count = currentEntities.filter(e => e.type === type).length
            return (
              <Button
                key={type}
                variant={typeFilter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter(type)}
                className={typeFilter === type ? 'bg-gold text-charcoal hover:bg-gold/90' : ''}
              >
                <EntityTypeIcon type={type} />
                <span className="ml-1 capitalize">{type}s</span>
                <span className="ml-1 text-xs opacity-70">({count})</span>
              </Button>
            )
          })}
        </div>
      </div>
      
      {/* Entity Table */}
      <div className="rounded-lg border border-charcoal-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy/30">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Stability</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Embedding</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-700">
            {filteredEntities.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No entities found
                </td>
              </tr>
            ) : (
              filteredEntities.map((entity) => (
                <tr key={entity.id} className="hover:bg-navy/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{entity.name}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                      {entity.description?.slice(0, 50) || 'No description'}
                      {(entity.description?.length || 0) > 50 && '...'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <EntityTypeIcon type={entity.type} />
                      <span className="capitalize text-sm">{entity.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge 
                      variant="outline"
                      className={
                        entity.status === 'canonical' 
                          ? 'border-green-500/30 text-green-400'
                          : entity.status === 'proposed'
                          ? 'border-yellow-500/30 text-yellow-400'
                          : 'border-charcoal-600'
                      }
                    >
                      {entity.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-charcoal-700 overflow-hidden">
                        <div 
                          className="h-full bg-gold"
                          style={{ width: `${entity.stability_rating}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{entity.stability_rating}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {entity.embedding ? (
                      <div className="flex items-center gap-1 text-green-500">
                        <Zap className="w-4 h-4" />
                        <span className="text-xs">Ready</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs">Needs hydration</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Hydrate button - show if no embedding */}
                      {!entity.embedding && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleHydrate(entity)}
                          disabled={isPending || hydratingId === entity.id}
                          className="h-8 px-2 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                          title="Hydrate AI Memory"
                        >
                          {hydratingId === entity.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      
                      {/* Canonize button - show for user drafts */}
                      {activeTab === 'drafts' && entity.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCanonize(entity)}
                          disabled={isPending || canonizingId === entity.id}
                          className="h-8 px-2 text-gold hover:text-gold/80 hover:bg-gold/10"
                          title="Promote to Canon"
                        >
                          {canonizingId === entity.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Crown className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(entity)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entity)}
                        disabled={isPending}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Edit/Create Modal */}
      {(editingEntity || showCreateModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          
          <div className="relative w-full max-w-lg mx-4 bg-charcoal border border-charcoal-700 rounded-lg shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-charcoal-700">
              <h2 className="text-lg font-serif">
                {editingEntity ? `Edit: ${editingEntity.name}` : 'Create New Entity'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-charcoal-700 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {error && (
                <div className="p-3 rounded bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Entity name"
                />
              </div>
              
              {showCreateModal && (
                <div>
                  <label className="block text-sm font-medium mb-1">Slug</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder={generateSlug(formData.name) || 'entity-slug'}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-navy/50 border border-charcoal-700 
                               text-foreground focus:border-gold/50 focus:outline-none"
                  >
                    {entityTypes.map((type) => (
                      <option key={type} value={type} className="bg-charcoal">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-navy/50 border border-charcoal-700 
                               text-foreground focus:border-gold/50 focus:outline-none"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status} className="bg-charcoal">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stability Rating: {formData.stability_rating}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.stability_rating}
                  onChange={(e) => setFormData({ ...formData, stability_rating: Number(e.target.value) })}
                  className="w-full accent-gold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Entity description..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-md bg-navy/50 border border-charcoal-700 
                             text-foreground placeholder:text-muted-foreground/50
                             focus:border-gold/50 focus:outline-none resize-none"
                />
                {editingEntity && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Note: Changing description will clear the embedding (needs re-hydration)
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t border-charcoal-700">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isPending || !formData.name.trim()}
                className="bg-gold hover:bg-gold/90 text-charcoal"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {editingEntity ? 'Save Changes' : 'Create Entity'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
