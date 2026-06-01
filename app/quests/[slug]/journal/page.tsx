import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { ScrollText, Dice1, MessageSquare, Sparkles, Bot, Crown } from 'lucide-react'
import type { Quest } from '@/types/quest'
import { JournalSummarizeButton } from './summarize-button'

interface Props { params: Promise<{ slug: string }> }

interface MessageRow {
  id: string
  session_id: string
  message_type: string
  content: string
  character_name: string | null
  created_at: string
  roll_data: { formula?: string; total?: number; isCriticalHit?: boolean; isCriticalFail?: boolean } | null
  sender: { display_name?: string; username?: string } | null
}

interface SessionRow {
  id: string
  session_number: number
  title: string | null
  started_at: string | null
  ended_at: string | null
  summary: string | null
  status: string
}

export default async function CampaignJournalPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: qrow } = await supabase
    .from('quests')
    .select('id, slug, title, dm_id')
    .eq('slug', slug)
    .single()
  const quest = qrow as unknown as Pick<Quest, 'id' | 'slug' | 'title' | 'dm_id'> | null
  if (!quest) notFound()

  const isDM = quest.dm_id === user.id
  let participant = isDM
  if (!participant) {
    const { data: p } = await supabase
      .from('quest_players')
      .select('id, status')
      .eq('quest_id', quest.id)
      .eq('user_id', user.id)
      .maybeSingle()
    participant = !!p && (p as { status?: string }).status !== 'declined'
  }
  if (!participant) redirect(`/quests/${slug}`)

  const [sessionsRes, messagesRes] = await Promise.all([
    supabase
      .from('quest_sessions')
      .select('id, session_number, title, started_at, ended_at, summary, status')
      .eq('quest_id', quest.id)
      .order('session_number', { ascending: true }),
    supabase
      .from('quest_messages')
      .select(`
        id, session_id, message_type, content, character_name, created_at, roll_data,
        sender:profiles!quest_messages_sender_id_fkey(display_name, username)
      `)
      .eq('quest_id', quest.id)
      .order('created_at', { ascending: true }),
  ])

  const sessions = (sessionsRes.data ?? []) as unknown as SessionRow[]
  const messages = (messagesRes.data ?? []) as unknown as MessageRow[]
  const bySession = new Map<string, MessageRow[]>()
  for (const m of messages) {
    if (!bySession.has(m.session_id)) bySession.set(m.session_id, [])
    bySession.get(m.session_id)!.push(m)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <Link href={`/quests/${slug}`} className="text-xs text-parchment-muted hover:text-gold">← Back to quest</Link>
        <h1 className="text-2xl md:text-3xl font-serif text-parchment mt-1 flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-gold" /> Campaign Journal
        </h1>
        <p className="text-sm text-parchment-muted">{quest.title}</p>
      </div>

      {sessions.length === 0 && (
        <p className="text-sm text-parchment-muted">No sessions logged yet.</p>
      )}

      {sessions.map((s) => {
        const msgs = bySession.get(s.id) ?? []
        return (
          <Card key={s.id} className="p-5 bg-charcoal-950/50 border-gold-500/10">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <h2 className="font-serif text-lg text-parchment">
                  Session {s.session_number}{s.title ? ` — ${s.title}` : ''}
                </h2>
                <p className="text-xs text-parchment-muted">
                  {s.started_at ? new Date(s.started_at).toLocaleDateString() : 'Not started'}
                  {' · '}
                  <span className="capitalize">{s.status}</span>
                  {' · '}
                  {msgs.length} entries
                </p>
              </div>
              {isDM && <JournalSummarizeButton sessionId={s.id} existingSummary={s.summary} />}
            </div>

            {s.summary && (
              <div className="mb-4 p-3 rounded-md bg-gold/5 border border-gold/15 text-sm text-parchment whitespace-pre-wrap">
                {s.summary}
              </div>
            )}

            <div className="space-y-1.5">
              {msgs.length === 0 && (
                <p className="text-xs text-parchment-muted italic">No messages logged for this session.</p>
              )}
              {msgs.map((m) => (
                <Entry key={m.id} m={m} />
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function Entry({ m }: { m: MessageRow }) {
  const author = m.character_name || m.sender?.display_name || m.sender?.username || 'Unknown'
  const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  let icon = <MessageSquare className="w-3 h-3" />
  let color = 'text-parchment'
  switch (m.message_type) {
    case 'roll': icon = <Dice1 className="w-3 h-3" />; color = 'text-amber-300'; break
    case 'narration': icon = <Crown className="w-3 h-3" />; color = 'text-gold'; break
    case 'ai_narration': icon = <Bot className="w-3 h-3" />; color = 'text-violet-300'; break
    case 'idol': icon = <Sparkles className="w-3 h-3" />; color = 'text-amber-200'; break
    case 'system': color = 'text-parchment-muted'; break
  }
  return (
    <div className="flex gap-2 text-sm py-1 border-b border-gold/5 last:border-0">
      <span className="text-[10px] text-parchment-muted/60 font-mono w-10 shrink-0 mt-0.5">{time}</span>
      <span className={`shrink-0 mt-0.5 ${color}`}>{icon}</span>
      <span className="text-xs font-medium text-parchment-muted shrink-0 w-24 truncate mt-0.5">{author}:</span>
      <span className={`text-sm ${color} break-words`}>
        {m.message_type === 'roll' && m.roll_data ? (
          <>
            {m.roll_data.formula} = <span className="font-mono font-bold">{m.roll_data.total}</span>
            {m.roll_data.isCriticalHit && <span className="ml-1 text-amber-300">CRIT!</span>}
            {m.roll_data.isCriticalFail && <span className="ml-1 text-rose-300">FAIL!</span>}
          </>
        ) : (
          m.content
        )}
      </span>
    </div>
  )
}
