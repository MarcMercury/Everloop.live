import type { WeaponEntry } from '@/types/player-character'
import type { STEPS } from './constants'

export type StepId = (typeof STEPS)[number]['id']

export type AbilityMethod = 'standard' | 'point-buy' | 'manual'

export type ForgeItem = { name: string; quantity: number }

/** Snapshot of every user choice in the forge, used to build the final character payload. */
export interface ForgeCharacterState {
  name: string
  race: string
  subrace: string
  charClass: string
  subclass: string
  level: number
  background: string
  alignment: string
  portraitUrl: string
  campaignName: string
  dmName: string
  finalAbilities: number[]
  personality: string
  ideals: string
  bonds: string
  flaws: string
  backstory: string
  appearance: string
  height: string
  weight: string
  age: string
  eyes: string
  hair: string
  skin: string
  faith: string
  weapons: WeaponEntry[]
  armorName: string
  armorAC: number
  shieldEquipped: boolean
  startingGold: number
  items: ForgeItem[]
  selectedCantrips: string[]
  selectedSpells: Record<number, string[]>
  fightingStyle: string
  pactBoon: string
  selectedInvocations: string[]
  tomeCantrips: string[]
  selectedManeuvers: string[]
  selectedSkills: string[]
  selectedFeats: string[]
}
