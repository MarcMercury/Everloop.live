/**
 * Seed Archive Locations — Populate canon_entities with ALL world map locations
 * and generate DALL-E images for each entry.
 *
 * Usage:
 *   node scripts/seed-archive-locations.mjs              # full run
 *   node scripts/seed-archive-locations.mjs --dry-run    # preview only
 *   node scripts/seed-archive-locations.mjs --skip-images # insert rows, skip image gen
 *   node scripts/seed-archive-locations.mjs --images-only # generate images for existing entities without images
 *
 * Requires: OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

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
const OPENAI_KEY = process.env.OPENAI_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const openai = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null

const DRY_RUN = process.argv.includes('--dry-run')
const SKIP_IMAGES = process.argv.includes('--skip-images')
const IMAGES_ONLY = process.argv.includes('--images-only')

// ── Region data (mirrors lib/data/regions.ts) ────────────────────
const REGIONS = [
  {
    id: 'bellroot',
    name: 'The Bellroot Vale',
    sub: 'Memory Nexus',
    description: 'A living, layered ecosystem of memory. Cliffs on one side give way to expansive forest systems — redwood clusters, rainforest zones, swamp regions, and mixed woodland transitions. Fragmented waterways weave through wetlands and marshes. Hidden villages lie embedded within the ancient canopy.',
    color: '#50c070',
    mapImage: '/Maps/bellroot-vale.png',
  },
  {
    id: 'luminous',
    name: 'The Luminous Fold',
    sub: 'Over-Stabilized Zone',
    description: 'A land of unnatural order and perfection. Geometric land patterns and structured landscapes stretch across evenly spaced settlements. Subtle glowing energy lines trace through the terrain. Beautiful — but unnerving in its precision.',
    color: '#e0d890',
    mapImage: '/Maps/luminous-expanse.png',
  },
  {
    id: 'ashen',
    name: 'The Ashen Spine',
    sub: 'Volcanic Chain',
    description: 'A broken backbone of the world. A long, continuous mountain range of jagged, spine-like ridges spans the entire region. Multiple volcanoes feed branching lava flows that meet river systems in hundreds of steam plumes. Small settlements cling to valleys and geothermal edges.',
    color: '#cc5533',
    mapImage: '/Maps/ashen-spine.png',
  },
  {
    id: 'drowned',
    name: 'The Drowned Reach',
    sub: 'Submerged Ruins',
    description: 'The past being erased. Partially submerged land and broken coastlines reveal flooded ruins and sunken cities. Scattered islands dot waters that rise without clear source, encroaching ever further inland.',
    color: '#509088',
    mapImage: '/Maps/drowned-reach.png',
  },
  {
    id: 'glass',
    name: 'The Glass Expanse',
    sub: 'Crystal Desert',
    description: 'Reality folding on itself. A crystalline desert of reflective surfaces and fractured dunes stretches endlessly. Mirrored terrain patterns and strange light behavior create "echo" formations. Rare, reflective pools shimmer beneath an alien sky.',
    color: '#c0c8d0',
    mapImage: '/Maps/glass-expanse.png',
  },
  {
    id: 'virelay',
    name: 'Virelay Coastlands',
    sub: 'Fractured Shore',
    description: 'Beauty with subtle wrongness. A fractured coastline of islands, coves, and peninsulas gives way to inland forests and hills. Multiple port towns dot the irregular waterways. Fog banks and shifting weather lend an uneasy atmosphere to this unstable shore.',
    color: '#8888aa',
    mapImage: '/Maps/virelay-coastlands.png',
  },
  {
    id: 'varnhalt',
    name: 'Varnhalt Frontier',
    sub: 'Rough Feudal Edge',
    description: 'Sprawl without control. A chaotic mix of plains, forests, rocky mesas, and dry patches hosts the densest — yet most decentralized — civilization in the Everloop. Roads crisscross everywhere between camps and trade routes.',
    color: '#a08050',
    mapImage: '/Maps/varnhalt-frontier.png',
  },
  {
    id: 'deyune',
    name: 'The Deyune Steps',
    sub: 'Nomadic Vastlands',
    description: 'Feels infinite and empty. Rolling grasslands and dry plains stretch beyond sight, crossed by sparse rivers and occasional rock formations. Faint migration paths and barely visible herds mark the wind-swept, open-sky expanse of endless movement.',
    color: '#d4a84b',
    mapImage: '/Maps/deyune-steps.png',
  },
]

// ── Location data (mirrors lib/data/region-locations.ts) ─────────
const WORLD_LOCATIONS = [
  {
    id: 'deyune', emoji: '🌾', name: 'The Deyune Steps', color: '#d4a84b',
    categories: [
      { heading: 'Settlements', items: ['Karak Camp', 'Tovin Encampment', 'Red Mile Camp', 'Sarn Flats Settlement', 'Khelt Crossing', 'Orun Field Camp'] },
      { heading: 'Towns', items: ['Ashfall Crossing', 'Nerin Post', 'Vask Hollow', 'Telmar Edge'] },
      { heading: 'Cities', items: ['Thorne Reach', 'Valen Spur'] },
      { heading: 'Outposts / Forts', items: ['Long Run Watch', 'East Wind Post', 'Step Gate Station'] },
      { heading: 'Ruins', items: ['Old Karak Stones', 'Broken Teeth Site', 'First Camp Remains'] },
      { heading: 'Taverns / Armories', items: ['The Long Fire', 'Step Barrow Forge'] },
      { heading: 'Key Features', items: ['The Long Run', 'The Standing Teeth', 'Whispering Expanse'] },
    ],
  },
  {
    id: 'ashen', emoji: '🌋', name: 'The Ashen Spine', color: '#cc5533',
    categories: [
      { heading: 'Villages', items: ['Emberfall Village', 'Korrin Hold', 'Blackridge Camp', 'Vesta Hollow'] },
      { heading: 'Towns', items: ['Cinder Vale', 'Rookforge', 'Taldrin Pass'] },
      { heading: 'Cities', items: ['Ironmark', 'Varr Keep'] },
      { heading: 'Outposts / Forts', items: ['Spine Watch', 'Furnace Post', 'High Ash Station'] },
      { heading: 'Ruins', items: ['Old Varr', 'Burnt Gate', 'Deep Core Site'] },
      { heading: 'Taverns / Armories', items: ['The Ash Line', 'Black Hammer Forge', 'Red Barrel House'] },
    ],
  },
  {
    id: 'virelay', emoji: '🌊', name: 'Virelay Coastlands', color: '#8888aa',
    categories: [
      { heading: 'Villages', items: ['Lowtide', 'Marrow Bay', 'East Dock', 'Halven Shore'] },
      { heading: 'Towns', items: ['Kelport', 'Darnis Bay', 'Coris Reach'] },
      { heading: 'Cities', items: ['Virelay'] },
      { heading: 'Outposts / Forts', items: ['Cliffwatch', 'Harbor Post 3', 'Tide Gate'] },
      { heading: 'Ruins / Anomalies', items: ['The Drowned City', 'Old Harbor'] },
      { heading: 'Taverns', items: ['The Salt House', 'Broken Mast', 'Low Lantern'] },
    ],
  },
  {
    id: 'varnhalt', emoji: '🏕️', name: 'Varnhalt Frontier', color: '#a08050',
    categories: [
      { heading: 'Villages', items: ['Dry Creek', 'Talon Ridge Camp', 'Brack Hollow', 'Pine Run'] },
      { heading: 'Towns', items: ['Varnhalt', 'West Varnhalt', 'Drellin Post', 'Korr Field'] },
      { heading: 'Cities', items: ['High Ridge Market', 'Farpoint'] },
      { heading: 'Outposts / Forts', items: ['North Watch', 'Timber Post', 'Ridge Line Station'] },
      { heading: 'Ruins', items: ['Old Varnhalt', 'Burn Camp Site', 'Stone Line Remains'] },
      { heading: 'Taverns', items: ['The Split Table', 'Red Knife Tavern', 'Last Light'] },
      { heading: 'Key Location', items: ['The Black Stone Tower'] },
    ],
  },
  {
    id: 'bellroot', emoji: '🌲', name: 'Bellroot Vale', color: '#50c070',
    categories: [
      { heading: 'Villages', items: ['Merrow Bend', 'Tallpine', 'Rootfall', 'Green Hollow'] },
      { heading: 'Towns', items: ['Drelmere', 'East Drelmere', "Halrick's Reach"] },
      { heading: 'Cities', items: ['Bellroot Crossing', 'South Vale Cluster'] },
      { heading: 'Outposts', items: ['Root Watch', 'Vale Station', 'North Path Post'] },
      { heading: 'Ruins', items: ['Old Bellroot Site', 'First Root Chamber', 'Lost Grove'] },
      { heading: 'Taverns', items: ['The Quiet Bell', 'Root & Stone', 'The Low Fire'] },
      { heading: 'Key Location', items: ['The Bell Tree'] },
    ],
  },
  {
    id: 'glass', emoji: '🪞', name: 'Glass Expanse', color: '#c0c8d0',
    categories: [
      { heading: 'Settlements', items: ['Shard Camp', 'Mirror Post', 'Drylight Camp'] },
      { heading: 'Towns', items: ['Glass Reach', 'Twinmark', 'Clearline'] },
      { heading: 'Cities', items: ['Prism City', 'Vell Glass'] },
      { heading: 'Outposts', items: ['Reflection Station', 'West Mirror Post'] },
      { heading: 'Ruins', items: ['Old Prism', 'Split Site', 'Echo Ruins'] },
      { heading: 'Taverns', items: ['The Second Face', 'Clear Glass House'] },
    ],
  },
  {
    id: 'luminous', emoji: '✨', name: 'Luminous Fold', color: '#e0d890',
    categories: [
      { heading: 'Settlements', items: ['Order Field', 'Line Camp'] },
      { heading: 'Towns', items: ['Symmetry', 'East Order', 'Venn'] },
      { heading: 'Cities', items: ['Lumina', 'Central Fold'] },
      { heading: 'Outposts', items: ['Grid Station 1', 'Grid Station 2', 'Grid Station 3', 'Grid Station 4', 'Grid Station 5', 'Grid Station 6', 'Axis Watch'] },
      { heading: 'Ruins', items: ['Broken Line', 'Old Fold Node'] },
      { heading: 'Taverns', items: ['The Even Table', 'The Quiet Line'] },
    ],
  },
  {
    id: 'drowned', emoji: '🌊', name: 'Drowned Reach', color: '#509088',
    categories: [
      { heading: 'Settlements', items: ['Lowwater', 'Drift Camp', 'Salt Edge'] },
      { heading: 'Towns', items: ['New Harbor', 'West Reach', 'Floodmark'] },
      { heading: 'Cities', items: ['Deep Reach', 'Sunken Port'] },
      { heading: 'Outposts', items: ['Tide Watch', 'Flood Station'] },
      { heading: 'Ruins', items: ['The Sunken City', 'Old Reach', 'Drowned Gate'] },
      { heading: 'Taverns', items: ['The Wet Lantern', 'Last Dock', 'Salt Line'] },
    ],
  },
]

// ── Slug helper ──────────────────────────────────────────────────
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Unique per-location descriptions ─────────────────────────────
// Loaded from lib/data/location-descriptions.ts (duplicated here for
// standalone script execution without TS compilation)
import { readFileSync } from 'fs'

// Parse the TS description map at runtime (simple extraction)
const _descRaw = readFileSync(
  path.join(process.cwd(), 'lib/data/location-descriptions.ts'),
  'utf-8'
)
const LOCATION_DESCRIPTIONS = {}
// Match single-quoted keys: 'Name':\n    'description',
const descRegex1 = /^\s*'([^']+)':\s*\n\s*'((?:[^'\\]|\\.)*)',?$/gm
let _m
while ((_m = descRegex1.exec(_descRaw)) !== null) {
  LOCATION_DESCRIPTIONS[_m[1]] = _m[2].replace(/\\'/g, "'")
}
// Match double-quoted keys: "Name":\n    'description',
const descRegex2 = /^\s*"([^"]+)":\s*\n\s*'((?:[^'\\]|\\.)*)',?$/gm
while ((_m = descRegex2.exec(_descRaw)) !== null) {
  LOCATION_DESCRIPTIONS[_m[1]] = _m[2].replace(/\\'/g, "'")
}
console.log(`📖 Loaded ${Object.keys(LOCATION_DESCRIPTIONS).length} unique location descriptions`)

function generateLocationFlavor(locationName, regionName, regionDesc, category) {
  if (LOCATION_DESCRIPTIONS[locationName]) {
    return LOCATION_DESCRIPTIONS[locationName]
  }
  // Fallback for any locations not yet in the description map
  return `A place in ${regionName}. ${regionDesc.split('.')[0]}.`
}

// ── Build the full location list ─────────────────────────────────
function buildLocationEntries() {
  const entries = []
  const seenSlugs = new Set()

  // 1) Region entries — these use their regional map images directly
  for (const region of REGIONS) {
    const slug = toSlug(region.name)
    if (seenSlugs.has(slug)) continue
    seenSlugs.add(slug)
    entries.push({
      name: region.name,
      slug,
      description: `${region.sub} — ${region.description}`,
      regionId: region.id,
      category: 'Region',
      tags: ['region', region.id, region.sub.toLowerCase()],
      stability: 0.90,
      // Regions reuse their map image
      staticImage: region.mapImage,
    })
  }

  // 2) Individual location entries from every region directory
  for (const regionDir of WORLD_LOCATIONS) {
    const region = REGIONS.find((r) => r.id === regionDir.id)
    if (!region) continue

    for (const cat of regionDir.categories) {
      for (const locationName of cat.items) {
        const slug = toSlug(locationName)
        if (seenSlugs.has(slug)) continue
        seenSlugs.add(slug)

        const catTag = cat.heading
          .toLowerCase()
          .replace(/\s*\/\s*/g, '-')
          .replace(/\s+/g, '-')

        entries.push({
          name: locationName,
          slug,
          description: generateLocationFlavor(locationName, region.name, region.description, cat.heading),
          regionId: region.id,
          category: cat.heading,
          tags: ['location', region.id, catTag],
          stability: catTag.includes('ruin') ? 0.45 : catTag.includes('city') || catTag.includes('cities') ? 0.85 : 0.70,
          staticImage: null, // will generate via DALL-E
        })
      }
    }
  }

  return entries
}

// ── DALL-E image generation ──────────────────────────────────────
const REGION_STYLES = {
  deyune: 'vast golden grasslands under open sky, nomadic encampments, wind-swept plains, warm amber tones',
  ashen: 'volcanic mountain ridges, lava flows, steam vents, jagged spine-like peaks, deep reds and charcoal',
  virelay: 'fractured coastline, misty harbors, fog-draped islands, grey-blue tones, uneasy beauty',
  varnhalt: 'rough frontier terrain, rocky mesas, dense forests, scattered camps, earthy brown tones',
  bellroot: 'ancient forest canopy, massive trees, winding waterways, lush green with golden light filtering through',
  glass: 'crystalline desert, reflective surfaces, mirrored dunes, pale silver and prismatic light',
  luminous: 'geometric terrain, glowing energy lines, perfectly ordered landscape, soft gold and white light',
  drowned: 'submerged ruins, rising waters, broken coastlines, scattered islands, teal and dark aquamarine',
}

async function generateImage(entry) {
  if (!openai) throw new Error('OPENAI_API_KEY not set')

  const regionStyle = REGION_STYLES[entry.regionId] || 'dark fantasy landscape'
  const catHint = entry.category.toLowerCase()

  let subjectHint = 'a settlement'
  if (catHint.includes('city') || catHint.includes('cities')) subjectHint = 'a grand fortified city'
  else if (catHint.includes('town')) subjectHint = 'a small but busy town'
  else if (catHint.includes('village') || catHint.includes('settlement') || catHint.includes('camp')) subjectHint = 'a modest village or camp'
  else if (catHint.includes('outpost') || catHint.includes('fort') || catHint.includes('station')) subjectHint = 'a military outpost or watchtower'
  else if (catHint.includes('ruin') || catHint.includes('anomal')) subjectHint = 'ancient crumbling ruins'
  else if (catHint.includes('tavern') || catHint.includes('forge') || catHint.includes('armori')) subjectHint = 'a tavern or forge interior'
  else if (catHint.includes('key') || catHint.includes('feature')) subjectHint = 'a dramatic natural landmark'
  else if (catHint.includes('region')) subjectHint = 'a sweeping panoramic view of the entire region'

  const prompt = `2D fantasy illustration of "${entry.name}", ${subjectHint} in a world called the Everloop. Environment: ${regionStyle}. Style: painterly concept art, atmospheric, mystical lighting, muted dark fantasy palette, no text, no watermarks, no UI elements. Mood: contemplative and ancient.`

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  })

  return response.data?.[0]?.url ?? null
}

async function uploadImage(imageUrl, slug) {
  const res = await fetch(imageUrl)
  if (!res.ok) throw new Error(`Failed to download image for ${slug}`)
  const buffer = await res.arrayBuffer()

  const filePath = `archive/${slug}.png`
  const { error } = await supabase.storage
    .from('entity-images')
    .upload(filePath, buffer, { contentType: 'image/png', upsert: true })

  if (error) throw new Error(`Upload failed for ${slug}: ${error.message}`)

  const { data } = supabase.storage
    .from('entity-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log('\n🗺️  Everloop Archive Location Seeder')
  console.log('═'.repeat(50))

  // Get admin user
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_admin', true)
    .limit(1)
    .single()

  if (!adminProfile) {
    console.error('❌ No admin user found in profiles table')
    process.exit(1)
  }
  const adminId = adminProfile.id
  console.log(`✅ Admin ID: ${adminId}`)

  // Fetch existing canonical location slugs so we don't duplicate
  const { data: existingEntities } = await supabase
    .from('canon_entities')
    .select('slug, metadata')
    .eq('type', 'location')

  const existingSlugs = new Set((existingEntities || []).map((e) => e.slug))
  console.log(`📋 Existing location entities: ${existingSlugs.size}`)

  const entries = buildLocationEntries()
  console.log(`🌍 Total locations from maps: ${entries.length}`)

  // Partition into new vs existing
  const newEntries = entries.filter((e) => !existingSlugs.has(e.slug))
  const existingToUpdate = entries.filter((e) => existingSlugs.has(e.slug))

  console.log(`   ├─ New to insert: ${newEntries.length}`)
  console.log(`   └─ Already exist: ${existingToUpdate.length}`)

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN — would insert:')
    for (const e of newEntries) {
      console.log(`   ${e.category.padEnd(22)} │ ${e.name} (${e.slug})`)
    }
    console.log('\n🔍 DRY RUN — already exist (would update images if missing):')
    for (const e of existingToUpdate) {
      console.log(`   ${e.category.padEnd(22)} │ ${e.name} (${e.slug})`)
    }
    return
  }

  // ── Phase 1: Insert new entities ───────────────────────────────
  if (!IMAGES_ONLY && newEntries.length > 0) {
    console.log('\n📝 Phase 1: Inserting new entities...')
    let insertCount = 0

    // Batch insert (Supabase supports bulk)
    const rows = newEntries.map((e) => ({
      name: e.name,
      slug: e.slug,
      type: 'location',
      description: e.description,
      status: 'canonical',
      created_by: adminId,
      tags: e.tags,
      extended_lore: {
        tagline: `${e.category} in the ${REGIONS.find((r) => r.id === e.regionId)?.name || 'Everloop'}`,
        image_url: e.staticImage || null,
        region: e.regionId,
        category: e.category,
      },
      metadata: {
        created_via: 'archive_seeder',
        region: e.regionId,
        category: e.category,
        image_url: e.staticImage || null,
      },
    }))

    // Insert in chunks of 25 to avoid payload limits
    for (let i = 0; i < rows.length; i += 25) {
      const chunk = rows.slice(i, i + 25)
      const { error } = await supabase.from('canon_entities').insert(chunk)
      if (error) {
        console.error(`   ❌ Batch insert error (chunk ${i}):`, error.message)
        // Try individual inserts for this chunk
        for (const row of chunk) {
          const { error: singleErr } = await supabase.from('canon_entities').insert(row)
          if (singleErr) {
            if (singleErr.message.includes('duplicate') || singleErr.code === '23505') {
              console.log(`   ⏭️  Skipped (exists): ${row.name}`)
            } else {
              console.error(`   ❌ Failed: ${row.name} — ${singleErr.message}`)
            }
          } else {
            insertCount++
          }
        }
      } else {
        insertCount += chunk.length
        console.log(`   ✅ Inserted batch ${Math.floor(i / 25) + 1} (${chunk.length} entities)`)
      }
    }
    console.log(`   📊 Total inserted: ${insertCount}`)
  }

  // ── Phase 1b: Update descriptions for existing entities ────────
  if (!IMAGES_ONLY && existingToUpdate.length > 0) {
    console.log('\n📝 Phase 1b: Updating descriptions for existing entities...')
    let updateCount = 0
    for (const entry of existingToUpdate) {
      const { error: upErr } = await supabase
        .from('canon_entities')
        .update({ description: entry.description })
        .eq('slug', entry.slug)
        .eq('type', 'location')
      if (upErr) {
        console.error(`   ❌ Failed to update ${entry.name}: ${upErr.message}`)
      } else {
        updateCount++
      }
    }
    console.log(`   📊 Total descriptions updated: ${updateCount}`)
  }

  // ── Phase 2: Generate images ───────────────────────────────────
  if (SKIP_IMAGES) {
    console.log('\n⏭️  Skipping image generation (--skip-images)')
    return
  }

  if (!openai) {
    console.log('\n⚠️  OPENAI_API_KEY not set — skipping image generation')
    return
  }

  console.log('\n🎨 Phase 2: Generating images...')

  // Re-fetch all location entities to get IDs
  const { data: allLocations } = await supabase
    .from('canon_entities')
    .select('id, slug, metadata, extended_lore')
    .eq('type', 'location')
    .eq('status', 'canonical')

  if (!allLocations || allLocations.length === 0) {
    console.log('   No location entities found')
    return
  }

  // Build a lookup from our entries for style info
  const entryMap = new Map(entries.map((e) => [e.slug, e]))

  // Find entities that need images
  const needImages = allLocations.filter((loc) => {
    const meta = loc.metadata || {}
    const extLore = loc.extended_lore || {}
    // Already has an image that's not a local map path? Skip.
    const existingImg = meta.image_url || extLore.image_url
    if (existingImg && existingImg.startsWith('http')) return false
    // Static map images are OK — they're already set
    if (existingImg && existingImg.startsWith('/Maps/')) return false
    return true
  })

  console.log(`   🖼️  Entities needing images: ${needImages.length} / ${allLocations.length}`)

  let imageCount = 0
  let errorCount = 0

  for (let i = 0; i < needImages.length; i++) {
    const loc = needImages[i]
    const entry = entryMap.get(loc.slug)
    const progress = `[${i + 1}/${needImages.length}]`

    // For entries that have a static local image (region maps), upload that instead
    if (entry?.staticImage) {
      const localPath = path.join(process.cwd(), 'public', entry.staticImage)
      if (fs.existsSync(localPath)) {
        try {
          const buffer = fs.readFileSync(localPath)
          const filePath = `archive/${loc.slug}.png`
          await supabase.storage
            .from('entity-images')
            .upload(filePath, buffer, { contentType: 'image/png', upsert: true })

          const { data } = supabase.storage
            .from('entity-images')
            .getPublicUrl(filePath)

          const publicUrl = data.publicUrl

          await supabase
            .from('canon_entities')
            .update({
              metadata: { ...(loc.metadata || {}), image_url: publicUrl },
              extended_lore: { ...(loc.extended_lore || {}), image_url: publicUrl },
            })
            .eq('id', loc.id)

          console.log(`   ${progress} 📎 ${loc.slug} — uploaded region map`)
          imageCount++
          continue
        } catch (err) {
          console.error(`   ${progress} ❌ ${loc.slug} — map upload failed: ${err.message}`)
        }
      }
    }

    // Generate via DALL-E
    try {
      const entryInfo = entry || {
        name: loc.slug.replace(/-/g, ' '),
        regionId: (loc.metadata?.region) || 'unknown',
        category: (loc.metadata?.category) || 'Location',
      }

      console.log(`   ${progress} 🎨 Generating: ${loc.slug}...`)
      const tempUrl = await generateImage(entryInfo)
      if (!tempUrl) {
        console.error(`   ${progress} ❌ ${loc.slug} — no image returned`)
        errorCount++
        continue
      }

      const publicUrl = await uploadImage(tempUrl, loc.slug)

      await supabase
        .from('canon_entities')
        .update({
          metadata: { ...(loc.metadata || {}), image_url: publicUrl },
          extended_lore: { ...(loc.extended_lore || {}), image_url: publicUrl },
        })
        .eq('id', loc.id)

      console.log(`   ${progress} ✅ ${loc.slug}`)
      imageCount++

      // Rate limit: DALL-E 3 allows ~5 images/min on standard tier
      if (i < needImages.length - 1) {
        await new Promise((r) => setTimeout(r, 13000))
      }
    } catch (err) {
      console.error(`   ${progress} ❌ ${loc.slug} — ${err.message}`)
      errorCount++
      // If rate limited, wait longer
      if (err.message?.includes('rate') || err.status === 429) {
        console.log(`   ⏳ Rate limited, waiting 60s...`)
        await new Promise((r) => setTimeout(r, 60000))
      }
    }
  }

  console.log(`\n📊 Image generation complete:`)
  console.log(`   ✅ Success: ${imageCount}`)
  console.log(`   ❌ Failed: ${errorCount}`)

  // ── Phase 3: Summary ───────────────────────────────────────────
  const { data: finalCount } = await supabase
    .from('canon_entities')
    .select('id', { count: 'exact' })
    .eq('type', 'location')
    .eq('status', 'canonical')

  console.log(`\n🏁 Archive now has ${finalCount?.length || '?'} canonical location entities`)
  console.log('═'.repeat(50))
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
