// ═══════════════════════════════════════════════════════════
// Combat Tracker API - Manage combat state
// POST /api/combat
// Actions: init, next-turn, damage, heal, condition, spell-slot,
//          use-feature, use-ammo, short-rest, long-rest,
//          add-npc, lock-token, concentration-save
// ═══════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import {
  rollGroupInitiative,
  sortByInitiative,
  nextTurn,
  applyDamage,
  applyHealing,
  addCondition,
  removeCondition,
  useSpellSlot,
  recoverSpellSlot,
  useFeature,
  useAmmo,
  recoverAmmo,
  shortRest,
  longRest,
  rollConcentrationSave,
  getHPStatus,
  getHPAuraColor,
  lockToken,
  unlockToken,
  isTokenLocked,
  toggleTokenLock,
  createNPCFromCreatureData,
  type CombatState,
  type Combatant,
  type PlayerCombatant,
} from '@/lib/combat-tracker'

export const runtime = 'nodejs'

type CombatAction =
  | 'roll-initiative'
  | 'next-turn'
  | 'damage'
  | 'heal'
  | 'add-condition'
  | 'remove-condition'
  | 'use-spell-slot'
  | 'recover-spell-slot'
  | 'use-feature'
  | 'use-ammo'
  | 'recover-ammo'
  | 'short-rest'
  | 'long-rest'
  | 'concentration-save'
  | 'add-npc'
  | 'lock-token'
  | 'unlock-token'
  | 'toggle-lock'
  | 'status'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action, combat_state, combatant_id, ...params } = body as {
    action: CombatAction
    combat_state: CombatState
    combatant_id?: string
    [key: string]: unknown
  }

  if (!action) {
    return NextResponse.json({ error: 'action is required' }, { status: 400 })
  }

  try {
    switch (action) {
      // ─── Initiative ───────────────────────────────────
      case 'roll-initiative': {
        if (!combat_state) return NextResponse.json({ error: 'combat_state required' }, { status: 400 })
        const rolled = rollGroupInitiative(combat_state.combatants)
        const sorted = sortByInitiative(rolled)
        return NextResponse.json({
          ...combat_state,
          combatants: sorted,
          turn_index: 0,
          round: 1,
          is_active: true,
        })
      }

      // ─── Turn Management ──────────────────────────────
      case 'next-turn': {
        if (!combat_state) return NextResponse.json({ error: 'combat_state required' }, { status: 400 })
        return NextResponse.json(nextTurn(combat_state))
      }

      // ─── HP Management ────────────────────────────────
      case 'damage': {
        if (!combat_state || !combatant_id) return NextResponse.json({ error: 'combat_state and combatant_id required' }, { status: 400 })
        const damage = params.amount as number
        if (!damage || damage < 0) return NextResponse.json({ error: 'positive amount required' }, { status: 400 })

        if (isTokenLocked(combatant_id)) {
          return NextResponse.json({ error: 'Token is locked' }, { status: 403 })
        }

        const combatants = combat_state.combatants.map((c: Combatant) =>
          c.id === combatant_id ? applyDamage(c, damage) : c
        )
        const target = combatants.find((c: Combatant) => c.id === combatant_id)!
        return NextResponse.json({
          combat_state: { ...combat_state, combatants },
          affected: {
            id: target.id,
            name: target.name,
            current_hp: target.current_hp,
            max_hp: target.max_hp,
            status: getHPStatus(target),
            aura_color: getHPAuraColor(getHPStatus(target)),
          },
        })
      }

      case 'heal': {
        if (!combat_state || !combatant_id) return NextResponse.json({ error: 'combat_state and combatant_id required' }, { status: 400 })
        const healing = params.amount as number
        if (!healing || healing < 0) return NextResponse.json({ error: 'positive amount required' }, { status: 400 })

        if (isTokenLocked(combatant_id)) {
          return NextResponse.json({ error: 'Token is locked' }, { status: 403 })
        }

        const combatants = combat_state.combatants.map((c: Combatant) =>
          c.id === combatant_id ? applyHealing(c, healing) : c
        )
        const target = combatants.find((c: Combatant) => c.id === combatant_id)!
        return NextResponse.json({
          combat_state: { ...combat_state, combatants },
          affected: {
            id: target.id,
            name: target.name,
            current_hp: target.current_hp,
            max_hp: target.max_hp,
            status: getHPStatus(target),
            aura_color: getHPAuraColor(getHPStatus(target)),
          },
        })
      }

      // ─── Conditions ───────────────────────────────────
      case 'add-condition': {
        if (!combat_state || !combatant_id) return NextResponse.json({ error: 'combat_state and combatant_id required' }, { status: 400 })
        const condition = params.condition as string
        if (!condition) return NextResponse.json({ error: 'condition required' }, { status: 400 })

        const combatants = combat_state.combatants.map((c: Combatant) =>
          c.id === combatant_id ? addCondition(c, condition as any) : c
        )
        return NextResponse.json({ ...combat_state, combatants })
      }

      case 'remove-condition': {
        if (!combat_state || !combatant_id) return NextResponse.json({ error: 'combat_state and combatant_id required' }, { status: 400 })
        const condition = params.condition as string
        if (!condition) return NextResponse.json({ error: 'condition required' }, { status: 400 })

        const combatants = combat_state.combatants.map((c: Combatant) =>
          c.id === combatant_id ? removeCondition(c, condition as any) : c
        )
        return NextResponse.json({ ...combat_state, combatants })
      }

      // ─── Spell Slots ─────────────────────────────────
      case 'use-spell-slot': {
        if (!combat_state || !combatant_id) return NextResponse.json({ error: 'combat_state and combatant_id required' }, { status: 400 })
        const level = params.level as string
        if (!level) return NextResponse.json({ error: 'level required' }, { status: 400 })

        const combatants = combat_state.combatants.map((c: Combatant) =>
          c.id === combatant_id && !c.is_npc ? useSpellSlot(c as PlayerCombatant, level) : c
        )
        return NextResponse.json({ ...combat_state, combatants })
      }

      case 'recover-spell-slot': {
        if (!combat_state || !combatant_id) return NextResponse.json({ error: 'combat_state and combatant_id required' }, { status: 400 })
        const level = params.level as string
        const count = (params.count as number) ?? 1
        if (!level) return NextResponse.json({ error: 'level required' }, { status: 400 })

        const combatants = combat_state.combatants.map((c: Combatant) =>
          c.id === combatant_id && !c.is_npc ? recoverSpellSlot(c as PlayerCombatant, level, count) : c
        )
        return NextResponse.json({ ...combat_state, combatants })
      }

      // ─── Feature Uses (Channel Divinity, etc.) ────────
      case 'use-feature': {
        if (!combat_state || !combatant_id) return NextResponse.json({ error: 'combat_state and combatant_id required' }, { status: 400 })
        const featureName = params.feature_name as string
        if (!featureName) return NextResponse.json({ error: 'feature_name required' }, { status: 400 })

        const combatants = combat_state.combatants.map((c: Combatant) =>
          c.id === combatant_id && !c.is_npc ? useFeature(c as PlayerCombatant, featureName) : c
        )
        return NextResponse.json({ ...combat_state, combatants })
      }

      // ─── Ammo Tracking ────────────────────────────────
      case 'use-ammo': {
        if (!combat_state || !combatant_id) return NextResponse.json({ error: 'combat_state and combatant_id required' }, { status: 400 })
        const ammoType = params.ammo_type as string
        const count = (params.count as number) ?? 1
        if (!ammoType) return NextResponse.json({ error: 'ammo_type required' }, { status: 400 })

        const combatants = combat_state.combatants.map((c: Combatant) =>
          c.id === combatant_id && !c.is_npc ? useAmmo(c as PlayerCombatant, ammoType, count) : c
        )
        return NextResponse.json({ ...combat_state, combatants })
      }

      case 'recover-ammo': {
        if (!combat_state || !combatant_id) return NextResponse.json({ error: 'combat_state and combatant_id required' }, { status: 400 })
        const ammoType = params.ammo_type as string
        const count = params.count as number
        if (!ammoType || !count) return NextResponse.json({ error: 'ammo_type and count required' }, { status: 400 })

        const combatants = combat_state.combatants.map((c: Combatant) =>
          c.id === combatant_id && !c.is_npc ? recoverAmmo(c as PlayerCombatant, ammoType, count) : c
        )
        return NextResponse.json({ ...combat_state, combatants })
      }

      // ─── Rests ────────────────────────────────────────
      case 'short-rest': {
        if (!combat_state || !combatant_id) return NextResponse.json({ error: 'combat_state and combatant_id required' }, { status: 400 })

        const combatants = combat_state.combatants.map((c: Combatant) =>
          c.id === combatant_id && !c.is_npc ? shortRest(c as PlayerCombatant) : c
        )
        return NextResponse.json({ ...combat_state, combatants })
      }

      case 'long-rest': {
        if (!combat_state || !combatant_id) return NextResponse.json({ error: 'combat_state and combatant_id required' }, { status: 400 })

        const combatants = combat_state.combatants.map((c: Combatant) =>
          c.id === combatant_id && !c.is_npc ? longRest(c as PlayerCombatant) : c
        )
        return NextResponse.json({ ...combat_state, combatants })
      }

      // ─── Concentration Save ───────────────────────────
      case 'concentration-save': {
        if (!combatant_id) return NextResponse.json({ error: 'combatant_id required' }, { status: 400 })
        const damageTaken = params.damage_taken as number
        const constitutionMod = params.constitution_mod as number
        const proficiencyBonus = params.proficiency_bonus as number ?? 0
        const proficientInCon = (params.proficient_in_con as boolean) ?? false

        if (damageTaken === undefined || constitutionMod === undefined) {
          return NextResponse.json({ error: 'damage_taken and constitution_mod required' }, { status: 400 })
        }

        const result = rollConcentrationSave(constitutionMod, proficiencyBonus, proficientInCon, damageTaken)
        return NextResponse.json(result)
      }

      // ─── NPC Token Autopopulate ───────────────────────
      case 'add-npc': {
        const creatureData = params.creature_data as {
          key?: string
          name: string
          armor_class: number
          hit_points: number
          hit_dice: string
          dexterity: number
          actions?: { name: string; attack_bonus?: number; damage_dice?: string }[]
          legendary_actions?: { name: string }[]
        }
        if (!creatureData) return NextResponse.json({ error: 'creature_data required' }, { status: 400 })

        const npc = createNPCFromCreatureData(creatureData)

        // Determine monster origin type based on campaign Fray intensity
        // Monsters are CONSEQUENCES of the Fray, not random encounters
        const frayIntensity = (params.fray_intensity as number) ?? 0.15
        let monsterOrigin: string
        let narrativeNote: string
        if (frayIntensity < 0.15) {
          monsterOrigin = 'mundane'
          narrativeNote = 'This creature exists naturally within the Everloop. The Pattern holds here.'
        } else if (frayIntensity < 0.3) {
          monsterOrigin = 'echo_construct'
          narrativeNote = 'Formed from memory and repetition — not fully alive, not fully gone. The Fray whispers here.'
        } else if (frayIntensity < 0.5) {
          monsterOrigin = 'corrupted_reality'
          narrativeNote = 'A living thing warped by sustained Drift contact. Part Everloop, part something else entirely.'
        } else {
          monsterOrigin = 'drift_intrusion'
          narrativeNote = 'A fragment of the Drift given form by the world\'s breaking. It should not exist — but the Fray made it real.'
        }

        if (combat_state) {
          return NextResponse.json({
            ...combat_state,
            combatants: [...combat_state.combatants, npc],
            monster_context: {
              origin: monsterOrigin,
              fray_intensity: frayIntensity,
              narrative_note: narrativeNote,
            },
          })
        }
        return NextResponse.json({
          npc,
          monster_context: {
            origin: monsterOrigin,
            fray_intensity: frayIntensity,
            narrative_note: narrativeNote,
          },
        })
      }

      // ─── Token Lock ───────────────────────────────────
      case 'lock-token':
        if (!combatant_id) return NextResponse.json({ error: 'combatant_id required' }, { status: 400 })
        lockToken(combatant_id)
        return NextResponse.json({ locked: true, combatant_id })

      case 'unlock-token':
        if (!combatant_id) return NextResponse.json({ error: 'combatant_id required' }, { status: 400 })
        unlockToken(combatant_id)
        return NextResponse.json({ locked: false, combatant_id })

      case 'toggle-lock':
        if (!combatant_id) return NextResponse.json({ error: 'combatant_id required' }, { status: 400 })
        return NextResponse.json({ locked: toggleTokenLock(combatant_id), combatant_id })

      // ─── Status Overview ──────────────────────────────
      case 'status': {
        if (!combat_state) return NextResponse.json({ error: 'combat_state required' }, { status: 400 })
        const overview = combat_state.combatants.map((c: Combatant) => {
          const status = getHPStatus(c)
          return {
            id: c.id,
            name: c.name,
            initiative: c.initiative,
            current_hp: c.current_hp,
            max_hp: c.max_hp,
            temp_hp: c.temp_hp,
            ac: c.armor_class,
            conditions: c.conditions,
            concentration: c.concentration_spell,
            status,
            aura_color: getHPAuraColor(status),
            is_npc: c.is_npc,
            is_current_turn: combat_state.combatants.indexOf(c) === combat_state.turn_index,
            locked: isTokenLocked(c.id),
          }
        })
        return NextResponse.json({
          round: combat_state.round,
          current_turn: combat_state.combatants[combat_state.turn_index]?.name,
          combatants: overview,
        })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Combat action failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
