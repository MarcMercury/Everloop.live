import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CharacterForge } from '@/components/player-deck/character-forge'

export default async function CreateCharacterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirected=true')
  }

  return <CharacterForge />
}
