// ═══════════════════════════════════════════════════════════
// Open5E API Route - Lookup D&D 5e SRD Data
// GET /api/open5e?type=spells&search=fireball
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import {
  searchSpells,
  getSpell,
  searchCreatures,
  getCreature,
  searchItems,
  searchMagicItems,
  searchWeapons,
  searchArmor,
  getConditions,
  searchBackgrounds,
  searchFeats,
  searchSpecies,
  searchRules,
  globalSearch,
} from '@/lib/open5e'

type ResourceType =
  | 'spells' | 'spell'
  | 'creatures' | 'creature'
  | 'items' | 'magic-items'
  | 'weapons' | 'armor'
  | 'conditions' | 'backgrounds'
  | 'feats' | 'species'
  | 'rules' | 'search'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const type = searchParams.get('type') as ResourceType | null
  const search = searchParams.get('search') ?? undefined
  const key = searchParams.get('key') ?? undefined
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined

  if (!type) {
    return NextResponse.json(
      { error: 'Missing required parameter: type' },
      { status: 400 }
    )
  }

  try {
    let data: unknown

    switch (type) {
      case 'spells':
        data = await searchSpells({
          search,
          level: searchParams.get('level') ? Number(searchParams.get('level')) : undefined,
          school: searchParams.get('school') ?? undefined,
          class_key: searchParams.get('class') ?? undefined,
          limit,
        })
        break
      case 'spell':
        if (!key) return NextResponse.json({ error: 'key required for spell lookup' }, { status: 400 })
        data = await getSpell(key)
        break
      case 'creatures':
        data = await searchCreatures({
          search,
          cr: searchParams.get('cr') ?? undefined,
          type: searchParams.get('creature_type') ?? undefined,
          ordering: searchParams.get('ordering') ?? undefined,
          limit,
        })
        break
      case 'creature':
        if (!key) return NextResponse.json({ error: 'key required for creature lookup' }, { status: 400 })
        data = await getCreature(key)
        break
      case 'items':
        data = await searchItems({
          search,
          category: searchParams.get('category') ?? undefined,
          limit,
        })
        break
      case 'magic-items':
        data = await searchMagicItems({
          search,
          rarity: searchParams.get('rarity') ?? undefined,
          limit,
        })
        break
      case 'weapons':
        data = await searchWeapons({ search, limit })
        break
      case 'armor':
        data = await searchArmor({ search, limit })
        break
      case 'conditions':
        data = await getConditions()
        break
      case 'backgrounds':
        data = await searchBackgrounds({ search, limit })
        break
      case 'feats':
        data = await searchFeats({ search, limit })
        break
      case 'species':
        data = await searchSpecies({ search, limit })
        break
      case 'rules':
        data = await searchRules({ search, limit })
        break
      case 'search':
        if (!search) return NextResponse.json({ error: 'search query required' }, { status: 400 })
        data = await globalSearch(search, limit)
        break
      default:
        return NextResponse.json({ error: `Unknown resource type: ${type}` }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
