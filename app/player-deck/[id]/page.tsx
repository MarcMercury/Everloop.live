import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PlayerCharacter } from '@/types/player-character'
import { CharacterSheet } from './character-sheet'

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirected=true')
  }

  const { data, error } = await supabase
    .from('player_characters')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  
  if (error || !data) {
    notFound()
  }

  const character = data as unknown as PlayerCharacter

  return <CharacterSheet character={character} />
}
