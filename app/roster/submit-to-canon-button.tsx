'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Send, Loader2, Check } from 'lucide-react'
import { submitEntityForCanon } from '@/lib/actions/create'

interface SubmitToCanonButtonProps {
  entityId: string
  entityName: string
}

export function SubmitToCanonButton({ entityId, entityName }: SubmitToCanonButtonProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const result = await submitEntityForCanon(entityId)
      
      if (result.success) {
        setSubmitted(true)
        setTimeout(() => {
          router.refresh()
        }, 1000)
      } else {
        alert(result.error || 'Failed to submit entity')
        setShowConfirm(false)
      }
    } catch {
      alert('An error occurred')
      setShowConfirm(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="gap-1 text-green-500 border-green-500/30"
      >
        <Check className="w-3 h-3" />
        Submitted
      </Button>
    )
  }

  if (showConfirm) {
    return (
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isSubmitting}
          className="px-2 text-xs"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-2 bg-gold text-charcoal hover:bg-gold/90"
        >
          {isSubmitting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            'Confirm'
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
      className="gap-1 text-gold border-gold/30 hover:bg-gold/10"
      title={`Submit "${entityName}" for Canon review`}
    >
      <Send className="w-3 h-3" />
    </Button>
  )
}
