import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { CANON_STORY_STATUSES } from '@/lib/utils'

export const revalidate = 3600

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://everloop.live').replace(/\/$/, '')

const STATIC_ROUTES = [
  '',
  '/stories',
  '/stories/narrative-history',
  '/stories/four-loops-of-curiosities',
  '/stories/known-wonders-of-the-everloop',
  '/explore',
  '/explore/everloop-game',
  '/map',
  '/about',
  '/guide',
  '/guidelines',
  '/readers-guide',
  '/players-guide',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return entries

  // Cookie-less anon client: the sitemap only lists publicly readable canon.
  const supabase = createClient<Database>(url, anonKey, { auth: { persistSession: false } })

  const [stories, entities, authors] = await Promise.all([
    supabase
      .from('stories')
      .select('slug, updated_at')
      .in('canon_status', [...CANON_STORY_STATUSES])
      .limit(5000),
    supabase
      .from('canon_entities')
      .select('slug, updated_at')
      .eq('status', 'canonical')
      .limit(5000),
    supabase
      .from('profiles')
      .select('username, updated_at')
      .not('username', 'is', null)
      .limit(5000),
  ])

  for (const s of stories.data ?? []) {
    if (s.slug) entries.push({ url: `${SITE_URL}/stories/${s.slug}`, lastModified: s.updated_at ?? undefined, changeFrequency: 'monthly', priority: 0.8 })
  }
  for (const e of entities.data ?? []) {
    if (e.slug) entries.push({ url: `${SITE_URL}/explore/${e.slug}`, lastModified: e.updated_at ?? undefined, changeFrequency: 'monthly', priority: 0.6 })
  }
  for (const a of authors.data ?? []) {
    if (a.username) entries.push({ url: `${SITE_URL}/profile/${a.username}`, lastModified: a.updated_at ?? undefined, changeFrequency: 'monthly', priority: 0.4 })
  }

  return entries
}
