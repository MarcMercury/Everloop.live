/**
 * Update Location Descriptions — Push unique descriptions from
 * lib/data/location-descriptions.ts into canon_entities.description
 *
 * Usage:
 *   node scripts/update-location-descriptions.mjs              # full run
 *   node scripts/update-location-descriptions.mjs --dry-run    # preview only
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// ── Load .env.local ──────────────────────────────────────────────
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx)
    const val = trimmed.slice(eqIdx + 1)
    if (!process.env[key]) process.env[key] = val
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const DRY_RUN = process.argv.includes('--dry-run')

// ── Parse location descriptions from TS file ─────────────────────
const raw = fs.readFileSync(
  path.join(process.cwd(), 'lib/data/location-descriptions.ts'),
  'utf-8'
)

const LOCATION_DESCRIPTIONS = {}
const r1 = /^\s*'([^']+)':\s*\n\s*'((?:[^'\\]|\\.)*)'\s*,?\s*$/gm
let m
while ((m = r1.exec(raw)) !== null) {
  LOCATION_DESCRIPTIONS[m[1]] = m[2].replace(/\\'/g, "'")
}
const r2 = /^\s*"([^"]+)":\s*\n\s*'((?:[^'\\]|\\.)*)'\s*,?\s*$/gm
while ((m = r2.exec(raw)) !== null) {
  LOCATION_DESCRIPTIONS[m[1]] = m[2].replace(/\\'/g, "'")
}
console.log(`📖 Loaded ${Object.keys(LOCATION_DESCRIPTIONS).length} unique descriptions from TS file`)

// ── Slug helper ──────────────────────────────────────────────────
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔄 Location Description Updater')
  console.log('═'.repeat(50))

  // Fetch all location entities
  const { data: locations, error } = await supabase
    .from('canon_entities')
    .select('id, name, slug, description')
    .eq('type', 'location')
    .eq('status', 'canonical')

  if (error) {
    console.error('❌ Failed to fetch locations:', error.message)
    process.exit(1)
  }

  console.log(`📋 Found ${locations.length} location entities in database`)

  // Build update list
  let updated = 0
  let skipped = 0
  let unchanged = 0
  let notFound = 0

  for (const loc of locations) {
    const desc = LOCATION_DESCRIPTIONS[loc.name]
    if (!desc) {
      console.log(`   ⚠️  No description in TS file for: ${loc.name}`)
      notFound++
      continue
    }

    if (loc.description === desc) {
      unchanged++
      continue
    }

    if (DRY_RUN) {
      const oldPreview = (loc.description || '').slice(0, 80)
      const newPreview = desc.slice(0, 80)
      console.log(`   📝 Would update: ${loc.name}`)
      console.log(`      OLD: ${oldPreview}...`)
      console.log(`      NEW: ${newPreview}...`)
      updated++
      continue
    }

    const { error: updateErr } = await supabase
      .from('canon_entities')
      .update({ description: desc })
      .eq('id', loc.id)

    if (updateErr) {
      console.error(`   ❌ Failed to update ${loc.name}: ${updateErr.message}`)
      skipped++
    } else {
      updated++
    }
  }

  console.log('\n📊 Results:')
  console.log(`   ✅ Updated: ${updated}`)
  console.log(`   ⏸️  Unchanged: ${unchanged}`)
  console.log(`   ⚠️  Not in TS file: ${notFound}`)
  console.log(`   ❌ Failed: ${skipped}`)
  if (DRY_RUN) console.log('\n   (DRY RUN — no changes made)')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
