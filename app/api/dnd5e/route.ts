// ═══════════════════════════════════════════════════════════
// D&D 5e SRD API Route - Class features, leveling, etc.
// GET /api/dnd5e?type=class&index=wizard
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import {
  getClass,
  listClasses,
  getClassLevels,
  getClassLevel,
  getClassFeatures,
  getClassSpells,
  getSubclass,
  getSpell,
  getMonster,
  listMonsters,
  getEquipment,
  listEquipmentByCategory,
  getMagicItem,
  getCondition,
  listConditions,
  getSkill,
  getFeature,
  getRule,
  getRuleSection,
  getTrait,
  getClassProficiencies,
} from '@/lib/dnd5e-api'

type QueryType =
  | 'classes' | 'class' | 'class-levels' | 'class-level'
  | 'class-features' | 'class-spells' | 'class-proficiencies'
  | 'subclass' | 'spell' | 'monster' | 'monsters'
  | 'equipment' | 'equipment-category'
  | 'magic-item' | 'condition' | 'conditions'
  | 'skill' | 'feature' | 'rule' | 'rule-section' | 'trait'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const type = searchParams.get('type') as QueryType | null
  const index = searchParams.get('index') ?? undefined
  const level = searchParams.get('level') ? Number(searchParams.get('level')) : undefined

  if (!type) {
    return NextResponse.json(
      { error: 'Missing required parameter: type' },
      { status: 400 }
    )
  }

  try {
    let data: unknown

    switch (type) {
      case 'classes':
        data = await listClasses()
        break
      case 'class':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await getClass(index)
        break
      case 'class-levels':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await getClassLevels(index)
        break
      case 'class-level':
        if (!index || level === undefined)
          return NextResponse.json({ error: 'index and level required' }, { status: 400 })
        data = await getClassLevel(index, level)
        break
      case 'class-features':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await getClassFeatures(index)
        break
      case 'class-spells':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await getClassSpells(index)
        break
      case 'class-proficiencies':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await getClassProficiencies(index)
        break
      case 'subclass':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await getSubclass(index)
        break
      case 'spell':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await getSpell(index)
        break
      case 'monster':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await getMonster(index)
        break
      case 'monsters': {
        const crParam = searchParams.get('cr')
        data = await listMonsters(
          crParam ? { challenge_rating: crParam.split(',').map(Number) } : undefined
        )
        break
      }
      case 'equipment':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await getEquipment(index)
        break
      case 'equipment-category':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await listEquipmentByCategory(index)
        break
      case 'magic-item':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await getMagicItem(index)
        break
      case 'condition':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await getCondition(index)
        break
      case 'conditions':
        data = await listConditions()
        break
      case 'skill':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await getSkill(index)
        break
      case 'feature':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await getFeature(index)
        break
      case 'rule':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await getRule(index)
        break
      case 'rule-section':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await getRuleSection(index)
        break
      case 'trait':
        if (!index) return NextResponse.json({ error: 'index required' }, { status: 400 })
        data = await getTrait(index)
        break
      default:
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
