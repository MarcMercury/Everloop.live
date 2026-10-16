'use client'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronRight, ChevronLeft, Check, Loader2, Flame } from 'lucide-react'
import { STEPS } from './constants'

export function ForgeProgressHeader({
  step, goToStep,
}: {
  step: number
  goToStep: (i: number) => void
}) {
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="sticky top-0 z-30 bg-charcoal/95 backdrop-blur-xs border-b border-gold-500/10 py-3 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-serif text-gold-500">
            Character Forge
          </h2>
          <span className="text-xs text-parchment-muted">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />

        {/* Step indicators */}
        <div className="flex items-center justify-between mt-3 overflow-x-auto gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = i === step
            const isCompleted = i < step
            const isClickable = i <= step
            return (
              <button
                key={s.id}
                onClick={() => goToStep(i)}
                disabled={!isClickable}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gold-500/20 text-gold-500 font-medium'
                    : isCompleted
                    ? 'text-emerald-400 cursor-pointer hover:bg-emerald-500/10'
                    : 'text-parchment-muted/40 cursor-default'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function ForgeBottomNav({
  step, name, race, charClass, canProceed, isPending,
  onBack, onNext, onCreate,
}: {
  step: number
  name: string
  race: string
  charClass: string
  canProceed: boolean
  isPending: boolean
  onBack: () => void
  onNext: () => void
  onCreate: () => void
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-charcoal/95 backdrop-blur-xs border-t border-gold-500/10 p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={step === 0}
          className="text-parchment-muted hover:text-parchment gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="text-xs text-parchment-muted hidden sm:block">
          {name ? (
            <span className="text-parchment font-serif">{name}</span>
          ) : (
            'Unnamed Adventurer'
          )}
          {race && charClass ? ` — ${race} ${charClass}` : ''}
        </div>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="btn-fantasy gap-1"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={onCreate}
            disabled={!canProceed || isPending}
            className="btn-fantasy gap-2"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Flame className="w-4 h-4" />
            )}
            Forge Character
          </Button>
        )}
      </div>
    </div>
  )
}
