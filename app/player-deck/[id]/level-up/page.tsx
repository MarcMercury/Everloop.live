import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LevelUpClient } from './level-up-client'
import type { PlayerCharacter } from '@/types/player-character'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LevelUpPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('player_characters')
    .select('*')
    .eq('id', id)
    .single()
  const char = data as unknown as PlayerCharacter | null
  if (!char) notFound()
  if (char.user_id !== user.id) redirect(`/player-deck/${id}`)
  if (char.level >= 20) redirect(`/player-deck/${id}`)

  return <LevelUpClient character={char} />
}
