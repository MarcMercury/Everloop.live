'use client'

import { Button } from '@/components/ui/button'
import { NewStoryModal } from '@/components/new-story-modal'
import { PenLine } from 'lucide-react'

export function WriteButton() {
  return (
    <NewStoryModal>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50"
      >
        <PenLine className="w-4 h-4" />
        <span className="hidden sm:inline">Write</span>
      </Button>
    </NewStoryModal>
  )
}
