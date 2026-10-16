import type { StepId } from './types'

/** Number of Ability Score Improvement / feat opportunities a class has reached by a given level. */
export function asiOpportunities(cls: string, level: number): number {
  const base = [4, 8, 12, 16, 19].filter(l => l <= level).length
  let extra = 0
  if (cls === 'Fighter') extra = [6, 14].filter(l => l <= level).length
  if (cls === 'Rogue') extra = [10].filter(l => l <= level).length
  return base + extra
}

export function stepSubtitle(id: StepId): string {
  switch (id) {
    case 'race': return 'Your race defines your origin, innate traits, and base abilities.'
    case 'class': return 'Your class determines your combat style, skills, and progression.'
    case 'abilities': return 'Ability scores shape everything your character can do.'
    case 'description': return 'Name your character and define their personality and story.'
    case 'equipment': return 'Choose your starting weapons, armor, and gear.'
    case 'spells': return 'Select your cantrips and spells from your class list.'
    case 'review': return 'Review your character before forging them into existence.'
    default: return ''
  }
}
