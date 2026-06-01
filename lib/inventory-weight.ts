/**
 * Inventory weight & encumbrance computation.
 * PHB: carrying capacity = STR × 15 (lbs).
 * Variant rules:
 *   - Encumbered at STR × 5 (speed -10)
 *   - Heavily encumbered at STR × 10 (speed -20, disadv on STR/DEX/CON checks, attacks, saves)
 */

import type { InventoryData } from '@/types/player-character'

export interface CarryingCapacity {
  totalWeight: number
  capacity: number
  encumberedThreshold: number
  heavilyEncumberedThreshold: number
  status: 'fine' | 'encumbered' | 'heavily_encumbered' | 'overloaded'
}

export function calculateInventoryWeight(inventory: InventoryData): number {
  let total = 0
  for (const w of inventory.weapons ?? []) {
    // Weight isn't on WeaponEntry by default — DM may add via name lookup elsewhere.
    // Leave as 0 unless extended.
    total += 0
    void w
  }
  for (const item of inventory.items ?? []) {
    total += (item.weight ?? 0) * (item.quantity ?? 1)
  }
  // Currency: 50 coins = 1 lb (PHB).
  const c = inventory.currency
  if (c) {
    const coinTotal = (c.cp || 0) + (c.sp || 0) + (c.ep || 0) + (c.gp || 0) + (c.pp || 0)
    total += coinTotal / 50
  }
  return Math.round(total * 10) / 10
}

export function computeCarryingCapacity(strength: number, inventory: InventoryData, variant: boolean = true): CarryingCapacity {
  const capacity = strength * 15
  const encumberedThreshold = strength * 5
  const heavilyEncumberedThreshold = strength * 10
  const totalWeight = calculateInventoryWeight(inventory)

  let status: CarryingCapacity['status'] = 'fine'
  if (totalWeight > capacity) status = 'overloaded'
  else if (variant && totalWeight > heavilyEncumberedThreshold) status = 'heavily_encumbered'
  else if (variant && totalWeight > encumberedThreshold) status = 'encumbered'

  return { totalWeight, capacity, encumberedThreshold, heavilyEncumberedThreshold, status }
}
