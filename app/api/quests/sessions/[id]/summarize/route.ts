import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * POST /api/quests/sessions/[id]/summarize
 *
 * Generates an AI prose summary of all messages in a session and writes it
 * back to `quest_sessions.summary`. DM-only.
 */
export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: sess } = await supabase
    .from('quest_sessions')
    .select('id, quest_id, title, session_number')
    .eq('id', id)
    .single()
  const s = sess as { id: string; quest_id: string; title: string | null; session_number: number } | null
  if (!s) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const { data: quest } = await supabase
    .from('quests')
    .select('id, dm_id, title')
    .eq('id', s.quest_id)
    .single()
  if (!quest || (quest as { dm_id: string }).dm_id !== user.id) {
    return NextResponse.json({ error: 'Only the DM can summarize sessions' }, { status: 403 })
  }

  const { data: msgs } = await supabase
    .from('quest_messages')
    .select('message_type, content, character_name, roll_data')
    .eq('session_id', id)
    .order('created_at', { ascending: true })
    .limit(500)

  const lines = (msgs ?? []).map((m: { message_type: string; content: string; character_name: string | null; roll_data: { formula?: string; total?: number } | null }) => {
    const who = m.character_name || 'Narrator'
    if (m.message_type === 'roll' && m.roll_data) {
      return `[${who} rolls ${m.roll_data.formula ?? '?'} = ${m.roll_data.total ?? '?'}]`
    }
    return `${who}: ${m.content}`
  })

  if (lines.length === 0) {
    return NextResponse.json({ error: 'No messages to summarize' }, { status: 400 })
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
  }

  const transcript = lines.join('\n').slice(0, 16000)
  const prompt = `You are the Everloop's chronicler. Write a concise, evocative 2-4 paragraph prose summary of this D&D session for the campaign journal. Highlight key character actions, dramatic rolls, and any narrative consequences. Tone: contemplative, high-function, elegant. Do not invent events.\n\nSession: ${s.title ?? `#${s.session_number}`} of "${(quest as { title: string }).title}"\n\n--- TRANSCRIPT ---\n${transcript}\n--- END ---`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 600,
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `OpenAI ${res.status}: ${text.slice(0, 200)}` }, { status: 500 })
    }
    const json = await res.json()
    const summary = json.choices?.[0]?.message?.content?.trim()
    if (!summary) return NextResponse.json({ error: 'Empty summary' }, { status: 500 })

    await supabase.from('quest_sessions').update({ summary } as never).eq('id', id)
    return NextResponse.json({ summary })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Summarize failed' }, { status: 500 })
  }
}
