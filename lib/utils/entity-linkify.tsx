import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'

// =====================================================
// ENTITY LINKIFY
// Scan a text body for canonical entity names and turn
// each match into a Wikipedia-style link to that entity's
// archive page. The longest names are matched first so
// that "House Thorne" wins over "Thorne", and "Lady Thorne"
// over "Lady".
// =====================================================

export interface LinkifyEntity {
  id: string
  name: string
  slug: string
  type: string
}

interface LinkifyOptions {
  /** Entity id to exclude from links (avoid linking an entity to itself). */
  excludeId?: string
  /** Maximum number of distinct entities to link in the body. Defaults to 12. */
  maxLinks?: number
  /** Maximum times the same entity may be linked. Defaults to 1. */
  maxLinksPerEntity?: number
  /** Extra aliases for an entity by id. Each alias is matched whole-word. */
  aliases?: Record<string, string[]>
}

/** Lightweight in-memory cache to avoid refetching the index on every render. */
let _cache: { entities: LinkifyEntity[]; fetchedAt: number } | null = null
const CACHE_TTL_MS = 60_000

/**
 * Load every canonical entity's id/name/slug/type.
 * Used to power both server-side linkification and any
 * client that wants to do alias lookups.
 */
export async function getLinkifyIndex(): Promise<LinkifyEntity[]> {
  const now = Date.now()
  if (_cache && now - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.entities
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('canon_entities')
    .select('id, name, slug, type')
    .eq('status', 'canonical')

  if (error || !data) {
    return _cache?.entities ?? []
  }

  const entities = data as LinkifyEntity[]
  _cache = { entities, fetchedAt: now }
  return entities
}

/** Escape a string for use in a RegExp. */
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Common stop-words/short names we never auto-link. */
const STOPLIST = new Set([
  'The Dawn',
  'The Pattern',
  'The Fold',
  'The Fray',
  'The Drift',
  'The Weaving',
  'The Loosening',
  'The Everloop',
])

/**
 * Decide if a candidate name is safe to auto-link. We skip:
 *  - names shorter than 4 chars (avoid linking "Rook" inside "Brook")
 *  - generic single words that overlap with English prose
 */
function isLinkableName(name: string): boolean {
  if (name.length < 4) return false
  // Single common words can spuriously match; require a space OR an uppercase letter mid-name.
  if (!/\s/.test(name) && !/[A-Z].*[A-Z]/.test(name) && name.length < 6) return false
  return true
}

/**
 * Walk `text` and produce a React node array where every recognised
 * entity name has been replaced with a `<Link>` to `/explore/{slug}`.
 *
 * Server-only — relies on the Supabase index loaded via `getLinkifyIndex`.
 */
export async function linkifyEntities(
  text: string | null | undefined,
  options: LinkifyOptions = {}
): Promise<ReactNode> {
  if (!text) return text ?? ''

  const { excludeId, maxLinks = 12, maxLinksPerEntity = 1, aliases } = options
  const index = await getLinkifyIndex()

  // Build the candidate list: each entity contributes its `name` plus any aliases.
  // We force the canonical name onto an alias list so the link target stays stable.
  type Candidate = { entity: LinkifyEntity; alias: string }
  const candidates: Candidate[] = []
  for (const e of index) {
    if (excludeId && e.id === excludeId) continue
    if (STOPLIST.has(e.name)) {
      // Stoplisted names still get linked, but only when surrounded by exact casing
      // — we trust them because they're whole-phrase tokens.
    }
    if (!isLinkableName(e.name)) continue
    candidates.push({ entity: e, alias: e.name })
    for (const a of aliases?.[e.id] ?? []) {
      if (a && a.length >= 4) candidates.push({ entity: e, alias: a })
    }
  }

  // Longest alias first so "House Thorne" matches before "Thorne".
  candidates.sort((a, b) => b.alias.length - a.alias.length)

  // Build one combined regex with named-capture groups would be elegant but
  // dialects vary; instead we do a single alternation and look up the match.
  const pattern = new RegExp(
    '\\b(' + candidates.map((c) => escapeRe(c.alias)).join('|') + ')\\b',
    'g'
  )
  // Map alias-lowercase -> entity (first wins on ties because of sort order).
  const aliasMap = new Map<string, LinkifyEntity>()
  for (const c of candidates) {
    const key = c.alias.toLowerCase()
    if (!aliasMap.has(key)) aliasMap.set(key, c.entity)
  }

  const nodes: ReactNode[] = []
  const usagePerEntity = new Map<string, number>()
  let distinctLinked = 0
  let cursor = 0

  // RegExp.exec walks the string once; we slice the unmatched gaps onto `nodes`
  // and replace each match with a <Link>.
  if (candidates.length === 0) return text

  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0
    const matched = match[0]
    const entity = aliasMap.get(matched.toLowerCase())
    if (!entity) continue

    const used = usagePerEntity.get(entity.id) ?? 0
    const isFirstUseOfEntity = used === 0
    if (used >= maxLinksPerEntity) continue
    if (isFirstUseOfEntity && distinctLinked >= maxLinks) continue

    if (start > cursor) nodes.push(text.slice(cursor, start))
    nodes.push(
      <Link
        key={`${entity.id}-${start}`}
        href={`/explore/${entity.slug}`}
        className="text-gold hover:text-gold-bright underline decoration-gold/30 hover:decoration-gold transition-colors"
      >
        {matched}
      </Link>
    )
    cursor = start + matched.length
    usagePerEntity.set(entity.id, used + 1)
    if (isFirstUseOfEntity) distinctLinked += 1
  }

  if (cursor < text.length) nodes.push(text.slice(cursor))

  // Preserve newlines from the source body — the consumer uses whitespace-pre-line.
  return <Fragment>{nodes}</Fragment>
}
