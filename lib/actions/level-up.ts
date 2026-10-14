'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { proficiencyBonusForLevel } from '@/lib/dnd-rules/level-up'

interface LevelUpInput {
  characterId: string
  hpGained: number
  /** Ability score adjustments (e.g. { strength: +1, dexterity: +1 } for an ASI). */
  asi?: Partial<Record<'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma', number>>
  /** New feat name if a feat was taken instead of an ASI. */
  newFeat?: { name: string; description?: string }
  /** New class features unlocked at the new level. */
  newFeatures?: Array<{ name: string; description: string; source?: string; uses_max?: number; recharge?: 'short_rest' | 'long_rest' | 'dawn' | null }>
}

/**
 * Apply a level-up to a player character.
 * Hard rule: only the character owner can call this; the character's `level`
 * must currently be < 20.
 */
export async function applyLevelUp(input: LevelUpInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: char } = await supabase
    .from('player_characters')
    .select('*')
    .eq('id', input.characterId)
    .single()
  if (!char) throw new Error('Character not found')
  const c = char as unknown as {
    user_id: string
    level: number
    max_hp: number
    current_hp: number
    hit_dice_total: number
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
    features: Array<Record<string, unknown>>
    feats: Array<Record<string, unknown>>
  }
  if (c.user_id !== user.id) throw new Error('Forbidden')
  if (c.level >= 20) throw new Error('Already max level')

  const newLevel = c.level + 1
  const hpGain = Math.max(1, Math.floor(input.hpGained))
  const newMaxHp = c.max_hp + hpGain
  const newProf = proficiencyBonusForLevel(newLevel)
  const features = [...(c.features ?? [])]
  for (const f of input.newFeatures ?? []) {
    features.push({
      name: f.name,
      description: f.description,
      source: f.source ?? 'class',
      uses_max: f.uses_max ?? null,
      uses_remaining: f.uses_max ?? null,
      recharge: f.recharge ?? null,
    })
  }

  const feats = [...(c.feats ?? [])]
  if (input.newFeat) {
    feats.push({ name: input.newFeat.name, description: input.newFeat.description ?? '' })
  }

  const abilityPatch: Record<string, number> = {}
  if (input.asi) {
    for (const [key, delta] of Object.entries(input.asi)) {
      if (!delta) continue
      const next = Math.min(20, (c as Record<string, unknown>)[key] as number + delta)
      abilityPatch[key] = next
    }
  }

  const { error } = await supabase
    .from('player_characters')
    .update({
      ...abilityPatch,
      level: newLevel,
      max_hp: newMaxHp,
      current_hp: c.current_hp + hpGain,
      hit_dice_total: c.hit_dice_total + 1,
      hit_dice_remaining: c.hit_dice_total + 1,
      proficiency_bonus: newProf,
      features,
      feats,
    })
    .eq('id', input.characterId)
  if (error) throw new Error(error.message)

  revalidatePath(`/player-deck/${input.characterId}`)
  return { newLevel, newMaxHp, newProf }
}
