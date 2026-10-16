#!/usr/bin/env node
/**
 * Apply one or more SQL migration files via the Supabase Management API.
 *
 * Usage:
 *   node scripts/push-migration.mjs supabase/migrations/20261014_001_foo.sql [...more.sql]
 *
 * Reads SUPABASE_PROJECT_ID and SUPABASE_ACCESS_TOKEN from the environment or .env.local.
 * Stops at the first failing file so later migrations never run against a partial schema.
 */
import fs from 'node:fs'

function loadEnv() {
  const env = { ...process.env }
  if (fs.existsSync('.env.local')) {
    for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
      if (!line.includes('=') || line.trimStart().startsWith('#')) continue
      const [k, ...v] = line.split('=')
      env[k.trim()] ??= v.join('=').trim().replace(/^(['"])(.*)\1$/, '$2')
    }
  }
  return env
}

const env = loadEnv()
const projectRef = env.SUPABASE_PROJECT_ID
const token = env.SUPABASE_ACCESS_TOKEN
const files = process.argv.slice(2)

if (!projectRef || !token) {
  console.error('Missing SUPABASE_PROJECT_ID or SUPABASE_ACCESS_TOKEN (env or .env.local).')
  process.exit(1)
}
if (files.length === 0) {
  console.error('Usage: node scripts/push-migration.mjs <file.sql> [...]')
  process.exit(1)
}

async function executeSql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query }),
  })
  const body = await res.text()
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${body.slice(0, 500)}`)
  return body
}

for (const file of files) {
  const sql = fs.readFileSync(file, 'utf8')
  process.stdout.write(`Applying ${file} (${sql.length} chars)... `)
  try {
    await executeSql(sql)
    console.log('ok')
  } catch (err) {
    console.log('FAILED')
    console.error(err.message)
    process.exit(1)
  }
}
