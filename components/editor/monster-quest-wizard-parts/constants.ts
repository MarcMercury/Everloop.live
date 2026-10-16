import type { MonsterRole, MovementType } from '@/lib/dnd-rules/monsters'

export const ROLES: { value: MonsterRole; label: string; description: string }[] = [
  { value: 'brute', label: 'Brute', description: 'High HP, hits hard, simple and devastating' },
  { value: 'striker', label: 'Striker', description: 'Fast, high damage, low durability' },
  { value: 'tank', label: 'Tank', description: 'Hard to kill, controls space, high AC' },
  { value: 'controller', label: 'Controller', description: 'Status effects, battlefield manipulation' },
  { value: 'support', label: 'Support', description: 'Buffs/debuffs, summons, force multiplier' },
]

export const MOVEMENT_TYPES: { value: MovementType; label: string }[] = [
  { value: 'walk', label: 'Walk' },
  { value: 'fly', label: 'Fly' },
  { value: 'climb', label: 'Climb' },
  { value: 'swim', label: 'Swim' },
  { value: 'burrow', label: 'Burrow' },
]

export const STEPS = [
  'Identity & Role',
  'Combat Stats',
  'Abilities & Senses',
  'Defenses',
  'Actions & Traits',
  'Everloop Lore',
  'Art & Preview',
] as const
