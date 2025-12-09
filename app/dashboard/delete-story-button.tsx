'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { deleteStory } from '@/lib/actions/story'

interface DeleteStoryButtonProps {
  storyId: string
  storyTitle: string
}

export function DeleteStoryButton({ storyId, storyTitle }: DeleteStoryButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteStory(storyId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete story')
      }
      setShowConfirm(false)
    })
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <span className="text-sm text-parchment">Delete &quot;{storyTitle}&quot;?</span>
        <div className="flex gap-1 ml-2">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
          >
            No
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
      onClick={() => setShowConfirm(true)}
    >
      <Trash2 className="w-3 h-3" />
    </Button>
  )
}
