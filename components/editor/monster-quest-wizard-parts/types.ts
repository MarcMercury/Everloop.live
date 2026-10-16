import type { useMonsterQuestWizard } from './use-monster-quest-wizard'

export interface StoryMonsterSummary {
  id: string
  name: string
  tagline: string
  description: string | null
  imageUrl: string | null
  createdAt: string
}

export type MonsterQuestWizardState = ReturnType<typeof useMonsterQuestWizard>

export interface WizardStepProps {
  wizard: MonsterQuestWizardState
}
