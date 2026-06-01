'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type HomebrewKind = 'creature' | 'artifact' | 'concept' | 'location' | 'character'

interface CreateInput {
  kind: HomebrewKind
  name: string
  description: string
  // Free-form structured data — schema varies by kind.
  data: Record<string, unknown>
  tags?: string[]
}

function slugify(s: string) {
  return (
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) +
    '-hb' + Math.random().toString(36).slice(2, 6)
  )
}

export async function createHomebrew(input: CreateInput): Promise<{ id?: string; slug?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  if (!input.name?.trim()) return { error: 'Name is required' }

  const slug = slugify(input.name)
  const { data, error } = await supabase
    .from('canon_entities')
    .insert({
      name: input.name.trim(),
      slug,
      type: input.kind,
      description: input.description ?? '',
      created_by: user.id,
      status: 'draft',
      tags: input.tags ?? [],
      extended_lore: input.data ?? {},
      metadata: { is_homebrew: true, kind: input.kind },
    })
    .select('id, slug')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/library/homebrew')
  return { id: (data as { id: string }).id, slug: (data as { slug: string }).slug }
}

export async function deleteHomebrew(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: row } = await supabase
    .from('canon_entities')
    .select('created_by, status')
    .eq('id', id)
    .single()
  const r = row as { created_by: string; status: string } | null
  if (!r) return { error: 'Not found' }
  if (r.created_by !== user.id || r.status !== 'draft') {
    return { error: 'You can only delete your own draft homebrew' }
  }
  const { error } = await supabase.from('canon_entities').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/library/homebrew')
  return {}
}
