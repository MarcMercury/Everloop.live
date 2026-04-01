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
  const { characterId } = body

  if (!characterId) {
    return NextResponse.json({ error: 'Missing characterId' }, { status: 400 })
  }

  const { data: character, error } = await supabase
    .from('player_characters')
    .select('*')
    .eq('id', characterId)
    .eq('user_id', user.id)
    .single()

  if (error || !character) {
    return NextResponse.json({ error: 'Character not found' }, { status: 404 })
  }

  const char = character as Record<string, unknown>
  const notes = (char.session_notes || []) as { session: number; date: string; notes: string }[]
  if (notes.length === 0) {
    return NextResponse.json({ error: 'No session notes to recap' }, { status: 400 })
  }

  // Build session notes context
  const notesText = notes
    .map((n) => `Session ${n.session} (${n.date}): ${n.notes}`)
    .join('\n\n')

  const charSummary = `${char.name}, ${char.race} ${char.subclass ? char.subclass + ' ' : ''}${char.class} (Level ${char.level})`

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a fantasy chronicler writing a narrative recap of a D&D character's adventures. Write in third person, past tense, with evocative but concise prose. Highlight key events, battles, discoveries, and character moments. Keep it to 2-4 paragraphs. Make it feel like a journal entry that the character would treasure.`,
    messages: [{
      role: 'user',
      content: `Write a narrative recap for ${charSummary}.\n\nSession Notes:\n${notesText}`,
    }],
  })

  return result.toTextStreamResponse()
}
