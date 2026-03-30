import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  const { characterId, question, context } = body
  
  if (!characterId || !question) {
    return NextResponse.json({ error: 'Missing characterId or question' }, { status: 400 })
  }
  
  // Fetch the character (RLS ensures ownership)
  const { data: character, error } = await supabase
    .from('player_characters')
    .select('*')
    .eq('id', characterId)
    .eq('user_id', user.id)
    .single()
  
  if (error || !character) {
    return NextResponse.json({ error: 'Character not found' }, { status: 404 })
  }
  
  // Build comprehensive character context for the AI
  const charContext = buildCharacterContext(character)
  
  const systemPrompt = `You are a **Celestial Advisor** — an ancient, wise being from the Upper Planes who has taken a keen interest in the mortal adventurer before you. You speak with warmth, gravitas, and occasional dry wit befitting an immortal guide.

Your role is to help a D&D 5e player make the best decisions for their character during live gameplay. You have deep knowledge of D&D 5e rules, tactics, spell interactions, class features, and roleplay.

## Character You Are Advising:
${charContext}

## Guidelines:
1. **Be concise and actionable** — the player is in a live session, so keep answers focused
2. **Reference the character's actual abilities** — suggest actions using their specific spells, features, and equipment
3. **Consider the character's personality** — roleplay suggestions should match their traits, ideals, bonds, and flaws
4. **Tactical advice** — when asked about combat, consider AC, HP, spell slots remaining, conditions, and positioning
5. **Rules accuracy** — cite D&D 5e rules correctly (advantage, cover, concentration, action economy, etc.)
6. **Suggest creative uses** — think outside the box with spell combos, environmental interactions, skill checks
7. **Track resources** — remind them of spell slots used, feature charges, and suggest resource management
8. **In-character suggestions** — when appropriate, suggest dialogue or actions that fit the character's personality
9. **Format for quick scanning** — use bullet points, bold key actions, and keep it tablet-readable

When suggesting spells or abilities, format them as: **Spell Name** (Level X, Slot Cost) — brief effect description.
When suggesting skill checks, format as: **Skill (Ability)** — DC estimate and what it might reveal.`

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages: [
      ...(context ? [{ role: 'user' as const, content: `Current situation context: ${context}` }] : []),
      { role: 'user', content: question },
    ],
  })
  
  return result.toTextStreamResponse()
}

function buildCharacterContext(char: Record<string, unknown>): string {
  const spellcasting = (char.spellcasting || {}) as Record<string, unknown>
  const proficiencies = (char.proficiencies || {}) as Record<string, unknown>
  const features = (char.features || []) as Record<string, unknown>[]
  const inventory = (char.inventory || {}) as Record<string, unknown>
  const status = (char.status || {}) as Record<string, unknown>
  const companions = (char.companions || []) as Record<string, unknown>[]
  
  const spellSlots = spellcasting.spell_slots as Record<string, { max: number; used: number }> | undefined
  const spellSlotsStr = spellSlots
    ? Object.entries(spellSlots)
        .map(([lvl, slot]) => `Level ${lvl}: ${slot.max - slot.used}/${slot.max}`)
        .join(', ')
    : 'None'
  
  const spellsKnown = spellcasting.spells_known as { name: string; level: number; prepared: boolean }[] | undefined
  const preparedSpells = spellsKnown
    ? spellsKnown
        .filter(s => s.prepared)
        .map(s => `${s.name} (Lvl ${s.level})`)
        .join(', ')
    : 'None'
    
  const cantrips = spellcasting.cantrips as { name: string }[] | undefined
  const cantripStr = cantrips ? cantrips.map(c => c.name).join(', ') : 'None'
  
  const weapons = inventory.weapons as { name: string; damage: string; equipped: boolean }[] | undefined
  const equippedWeapons = weapons
    ? weapons.filter(w => w.equipped).map(w => `${w.name} (${w.damage})`).join(', ')
    : 'None'
  
  const conditions = status.conditions as string[] | undefined
  const conditionStr = conditions?.length ? conditions.join(', ') : 'None'
  const concentrationSpell = status.concentration_spell as string | null
  
  const featureStr = features
    .map(f => {
      const uses = f.uses_max ? ` [${f.uses_remaining}/${f.uses_max}]` : ''
      return `• ${f.name}${uses} — ${f.description || ''}`
    })
    .join('\n')
  
  const companionStr = companions.length
    ? companions.map(c => `${c.name} (${c.type}, HP: ${c.hp}/${c.max_hp})`).join(', ')
    : 'None'

  return `**${char.name}** — Level ${char.level} ${char.race} ${char.class}${char.subclass ? ` (${char.subclass})` : ''}
Campaign: ${char.campaign_name || 'Unknown'} | Background: ${char.background || 'Unknown'} | Alignment: ${char.alignment}

**Current State:**
- HP: ${char.current_hp}/${char.max_hp}${Number(char.temp_hp) > 0 ? ` (+${char.temp_hp} temp)` : ''} | AC: ${char.armor_class} | Speed: ${char.speed} ft
- Conditions: ${conditionStr}
- Concentration: ${concentrationSpell || 'None'}
- Inspiration: ${(status.inspiration as boolean) ? 'Yes' : 'No'}
- Exhaustion: ${status.exhaustion_level || 0}

**Ability Scores:** STR ${char.strength} | DEX ${char.dexterity} | CON ${char.constitution} | INT ${char.intelligence} | WIS ${char.wisdom} | CHA ${char.charisma}
Proficiency Bonus: +${char.proficiency_bonus}

**Available Spell Slots:** ${spellSlotsStr}
**Prepared Spells:** ${preparedSpells}
**Cantrips:** ${cantripStr}

**Equipped Weapons:** ${equippedWeapons}

**Features & Traits:**
${featureStr || 'None listed'}

**Companions:** ${companionStr}

**Personality:** ${char.personality_traits || 'Not specified'}
**Ideals:** ${char.ideals || 'Not specified'}
**Bonds:** ${char.bonds || 'Not specified'}
**Flaws:** ${char.flaws || 'Not specified'}`
}
