'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Save, ArrowLeft, ArrowRight } from 'lucide-react'
import type { MonsterRole, MovementType } from '@/lib/dnd-rules/monsters'
import { STEPS } from './monster-quest-wizard-parts/constants'
import { useMonsterQuestWizard } from './monster-quest-wizard-parts/use-monster-quest-wizard'
import { StepIdentity } from './monster-quest-wizard-parts/step-identity'
import { StepCombatStats } from './monster-quest-wizard-parts/step-combat-stats'
import { StepAbilitiesSenses } from './monster-quest-wizard-parts/step-abilities-senses'
import { StepDefenses } from './monster-quest-wizard-parts/step-defenses'
import { StepActionsTraits } from './monster-quest-wizard-parts/step-actions-traits'
import { StepEverloopLore } from './monster-quest-wizard-parts/step-everloop-lore'
import { StepArtPreview } from './monster-quest-wizard-parts/step-art-preview'
import { LoadStoryMonsterDialog } from './monster-quest-wizard-parts/load-story-monster-dialog'

export type { MonsterRole, MovementType }

/** Step components, indexed in the same order as {@link STEPS}. */
const STEP_COMPONENTS = [
  StepIdentity,
  StepCombatStats,
  StepAbilitiesSenses,
  StepDefenses,
  StepActionsTraits,
  StepEverloopLore,
  StepArtPreview,
] as const

export function MonsterQuestWizard() {
  const wizard = useMonsterQuestWizard()
  const { step, setStep, error, isSaving, name, tagline, description, canAdvance, handleSave } = wizard
  const StepComponent = STEP_COMPONENTS[step]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => i <= step && setStep(i)}
              className={`text-xs transition-colors ${
                i === step
                  ? 'text-red-400 font-medium'
                  : i < step
                    ? 'text-gold/60 cursor-pointer hover:text-gold'
                    : 'text-parchment-muted/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="h-1 bg-teal-deep/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-red-500 to-orange-500 transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <Card className="border-gold/20">
        <CardContent className="pt-6">
          <StepComponent wizard={wizard} />
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step === 0 ? (
          <Link href="/create/monster" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        ) : (
          <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
        )}

        {step < STEPS.length - 1 ? (
          <Button
            className="flex-1 gap-2"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            className="flex-1 gap-2"
            onClick={handleSave}
            disabled={isSaving || !name.trim() || !tagline.trim() || !description.trim()}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save to Roster
          </Button>
        )}
      </div>
      {/* Load Story Monster Modal */}
      <LoadStoryMonsterDialog wizard={wizard} />
    </div>
  )
}
