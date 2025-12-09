'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteEntity } from '@/lib/actions/create'

interface DeleteEntityButtonProps {
  entityId: string
  entityName: string
}

export function DeleteEntityButton({ entityId, entityName }: DeleteEntityButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const result = await deleteEntity(entityId)
      
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete entity')
      }
    } catch {
      alert('An error occurred')
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="px-2"
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Delete'
          )}
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowConfirm(true)}
      className="px-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
      title={`Delete ${entityName}`}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
