import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { charClass, subclass, level, availableCantrips, availableSpells, maxCantrips, maxSpellsKnown, casterType } = body

  if (!charClass || !level) {
    return NextResponse.json({ error: 'Missing class or level' }, { status: 400 })
  }

  const cantripList = (availableCantrips || []).join(', ')
  const spellsByLevel = Object.entries(availableSpells || {})
    .map(([lvl, spells]) => `Level ${lvl}: ${(spells as string[]).join(', ')}`)
    .join('\n')

  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system: `You are a D&D 5e build optimizer. Recommend spells for a character based on their class, subclass, and level. Focus on versatility and in-combat effectiveness. Keep recommendations practical — these are for live table play.

Respond in EXACTLY this JSON format (no markdown, no code fences):
{"cantrips":["Name1","Name2"],"spells":{"1":["Spell1","Spell2"],"2":["Spell3"]},"reasoning":"One paragraph explaining the build strategy."}

Only recommend spells from the provided available lists. Recommend exactly the number of cantrips and spells allowed.`,
    messages: [{
      role: 'user',
      content: `Class: ${subclass ? `${subclass} ` : ''}${charClass}, Level: ${level}
Caster type: ${casterType || 'prepared'}
Max cantrips: ${maxCantrips || 0}
${maxSpellsKnown ? `Max spells known: ${maxSpellsKnown}` : 'Prepared caster (no limit on known)'}

Available cantrips: ${cantripList || 'None'}
Available spells by level:
${spellsByLevel || 'None'}

Recommend the optimal spell selection.`,
    }],
  })

  try {
    const parsed = JSON.parse(text)
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ cantrips: [], spells: {}, reasoning: text })
  }
}
