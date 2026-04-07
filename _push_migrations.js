/**
 * Push SQL migrations to Supabase using the Management API (sbp_ token)
 * Reads credentials from .env.local: SUPABASE_PROJECT_ID and SUPABASE_ACCESS_TOKEN
 */
const fs = require('fs');
const https = require('https');

// Load from .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; })
);
const PROJECT_REF = env.SUPABASE_PROJECT_ID;
const SBP_TOKEN = env.SUPABASE_ACCESS_TOKEN;

if (!PROJECT_REF || !SBP_TOKEN) {
  console.error('Missing SUPABASE_PROJECT_ID or SUPABASE_ACCESS_TOKEN in .env.local');
  process.exit(1);
}

const migrations = [
  'supabase/migrations/20260404_001_add_last_sign_in_to_profiles.sql',
  'supabase/migrations/20260406_002_expand_shards_system.sql',
  'supabase/migrations/20260406_003_seed_88_shards.sql',
  'supabase/migrations/20260407_001_rearrange_virelay_map.sql',
  'supabase/migrations/20260407_001_remove_merra_dune_map_pin.sql',
  'supabase/migrations/20260407_002_glass_expanse_map_adjustments.sql',
  'supabase/migrations/20260407_003_luminous_fold_map_adjustments.sql',
  'supabase/migrations/20260407_003_varnhalt_map_cleanup.sql',
  'supabase/migrations/20260407_004_map_duplicate_cleanup.sql',
  'supabase/migrations/20260407_005_virelay_coast_position_moves.sql',
  'supabase/migrations/20260407_006_virelay_halven_shore_move.sql',
  'supabase/migrations/20260407_007_fix_overlapping_map_positions.sql',
  'supabase/migrations/20260407_008_fix_rookforge_position.sql',
  'supabase/migrations/20260407_009_fix_vell_glass_position.sql',
  'supabase/migrations/20260407_010_move_coris_reach_and_vell_glass.sql',
];

function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SBP_TOKEN}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body: data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 500)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  // Test connectivity first
  console.log('Testing API connectivity...');
  try {
    const test = await executeSql('SELECT current_database(), current_user');
    console.log('Connected:', test.body.substring(0, 200));
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }

  for (const file of migrations) {
    const sql = fs.readFileSync(file, 'utf8');
    console.log(`\nRunning: ${file} (${sql.length} chars)...`);
    try {
      const result = await executeSql(sql);
      console.log(`Success (HTTP ${result.status})`);
      const preview = result.body.substring(0, 300);
      if (preview) console.log('Response:', preview);
    } catch (err) {
      console.error(`Failed: ${err.message}`);
    }
  }
  console.log('\nDone.');
}

main().catch(console.error);
