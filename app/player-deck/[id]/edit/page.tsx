import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PlayerCharacter } from '@/types/player-character'
import { CharacterForm } from '@/components/player-deck/character-form'

export default async function EditCharacterPage({
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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-serif text-parchment mb-2">
          Edit <span className="canon-text">{character.name}</span>
        </h1>
        <p className="text-parchment-muted mb-8">
          Update your adventurer&apos;s details.
        </p>
        <CharacterForm character={character} />
      </div>
    </div>
  )
}
