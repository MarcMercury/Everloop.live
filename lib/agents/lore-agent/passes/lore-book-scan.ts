/**
 * Pass 2 — Static lore-book scan.
 *
 * The three hand-authored lore books live as React pages, not rows in
 * `stories`. We scan their JSX source for canonical entity name mentions
 * and upsert into `lore_book_references` so the Archive's
 * "Appears In Stories" panel can surface them without a redeploy.
 *
 * Important: this pass reads files from disk, so it only runs in
 * environments where the source tree is available (Vercel server functions
 * include the bundled source). If file reads fail the pass returns ok=true
 * with notes — failing this should not block downstream passes.
 */

import fs from 'node:fs'
import path from 'node:path'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PassResult } from '../types'

const STOPWORDS = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'at'])

function escRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

interface LoreBookSource {
  slug: string
  title: string
  subtitle: string
  author: string
  file: string
}

const LORE_BOOKS: LoreBookSource[] = [
  {
    slug: 'narrative-history',
    title: 'The Everloop',
    subtitle: 'Narrative History',
    author: 'The Lore Codex',
    file: 'app/stories/narrative-history/page.tsx',
  },
  {
    slug: 'four-loops-of-curiosities',
    title: 'Four Loops',
    subtitle: 'of Curiosities',
    author: 'Archael Viremont',
    file: 'app/stories/four-loops-of-curiosities/page.tsx',
  },
  {
    slug: 'known-wonders-of-the-everloop',
    title: 'Known Wonders',
    subtitle: 'of the Everloop',
    author: 'Archael Viremont',
    file: 'app/stories/known-wonders-of-the-everloop/page.tsx',
  },
]

function extractText(filePath: string): string | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return raw
      .split('\n')
      .filter((line) => {
        const t = line.trim()
        if (t.startsWith('import ')) return false
        if (t.startsWith('//')) return false
        if (t.startsWith('export const metadata')) return false
        return true
      })
      .join('\n')
  } catch {
    return null
  }
}

interface EntityRow {
  id: string
  name: string
}

export async function runLoreBookScan(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: SupabaseClient<any, 'public', any>
): Promise<PassResult> {
  const counters: Record<string, number> = {
    books_scanned: 0,
    books_unreadable: 0,
    refs_upserted: 0,
    refs_removed: 0,
  }
  const notes: string[] = []

  try {
    const { data: entitiesRaw, error: eErr } = await admin
      .from('canon_entities')
      .select('id, name')
      .eq('status', 'canonical')
    if (eErr) throw eErr
    const entities = (entitiesRaw ?? []) as EntityRow[]

    const patterns = entities
      .filter((e) => e.name && e.name.length >= 3 && !STOPWORDS.has(e.name.toLowerCase()))
      .map((e) => ({ id: e.id, re: new RegExp(`\\b${escRegex(e.name)}\\b`, 'i') }))

    const root = process.cwd()
    for (const book of LORE_BOOKS) {
      const text = extractText(path.join(root, book.file))
      if (text === null) {
        counters.books_unreadable++
        notes.push(`could not read ${book.file}`)
        continue
      }
      counters.books_scanned++

      const matchedIds = patterns.filter((p) => p.re.test(text)).map((p) => p.id)

      // Read existing refs for this book to compute diff
      const { data: existingRaw } = await admin
        .from('lore_book_references')
        .select('entity_id')
        .eq('book_slug', book.slug)
      const existing = new Set(
        ((existingRaw ?? []) as { entity_id: string }[]).map((r) => r.entity_id)
      )
      const desired = new Set(matchedIds)

      // Insert net-new refs
      const toAdd = [...desired].filter((id) => !existing.has(id))
      if (toAdd.length) {
        const rows = toAdd.map((entity_id) => ({
          entity_id,
          book_slug: book.slug,
          book_title: book.title,
          book_subtitle: book.subtitle,
          book_author: book.author,
        }))
        const { error: insErr } = await admin
          .from('lore_book_references')
          .insert(rows)
        if (insErr) throw insErr
        counters.refs_upserted += toAdd.length
      }

      // Remove stale refs (entity no longer mentioned, or no longer canonical)
      const toRemove = [...existing].filter((id) => !desired.has(id))
      if (toRemove.length) {
        const { error: delErr } = await admin
          .from('lore_book_references')
          .delete()
          .eq('book_slug', book.slug)
          .in('entity_id', toRemove)
        if (delErr) throw delErr
        counters.refs_removed += toRemove.length
      }
    }

    return { pass: 'lore-book-scan', ok: true, counters, notes }
  } catch (e) {
    return {
      pass: 'lore-book-scan',
      ok: false,
      counters,
      notes,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}
