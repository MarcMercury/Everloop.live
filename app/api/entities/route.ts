import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: entities, error } = await supabase
    .from('canon_entities')
    .select('id, name, type, description, status')
    .in('status', ['canonical', 'proposed'])
    .order('name')

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch entities' },
      { status: 500 }
    )
  }

  return NextResponse.json({ entities })
}
