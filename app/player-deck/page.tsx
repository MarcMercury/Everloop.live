import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PlayerCharacter } from '@/types/player-character'
import { DeckClient } from '@/components/player-deck/deck-client'

export default async function PlayerDeckPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirected=true')
  }

  const { data } = await supabase
    .from('player_characters')
    .select('*')
    .eq('user_id', user.id)
    .order('is_active', { ascending: false })
    .order('updated_at', { ascending: false })
  
  const characters = (data ?? []) as unknown as PlayerCharacter[]

  return <DeckClient characters={characters} />
}
