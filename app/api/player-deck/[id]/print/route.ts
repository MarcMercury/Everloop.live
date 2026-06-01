import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PlayerCharacter } from '@/types/player-character'

export const runtime = 'nodejs'

/**
 * GET /api/player-deck/[id]/print
 *
 * Returns a print-optimized HTML document of a character sheet. Users trigger
 * Print-to-PDF from their browser to produce a real PDF — this avoids
 * shipping a heavyweight server-side PDF library.
 *
 * Access: character owner OR DM of any quest the character is in.
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase.from('player_characters').select('*').eq('id', id).single()
  const char = data as unknown as PlayerCharacter | null
  if (!char) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (char.user_id !== user.id) {
    // Allow DMs of any quest where this PC is rostered.
    const { data: link } = await supabase
      .from('quest_players')
      .select('quest:quests(dm_id)')
      .eq('character_id', id)
      .limit(20)
    const dmIds = (link ?? []).map((r) => (r as { quest?: { dm_id?: string } | null }).quest?.dm_id).filter(Boolean)
    if (!dmIds.includes(user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const mod = (s: number) => Math.floor((s - 10) / 2)
  const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`)

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(char.name)} — Character Sheet</title>
  <style>
    @media print {
      @page { size: letter; margin: 0.5in; }
      .no-print { display: none !important; }
    }
    body { font-family: Georgia, serif; color: #1a1a1a; max-width: 8in; margin: 0 auto; padding: 0.5in; line-height: 1.4; }
    h1 { font-size: 24pt; margin: 0 0 4pt; }
    h2 { font-size: 14pt; margin: 16pt 0 6pt; border-bottom: 1px solid #999; padding-bottom: 2pt; }
    h3 { font-size: 11pt; margin: 8pt 0 4pt; }
    .meta { color: #555; font-size: 10pt; margin-bottom: 16pt; }
    .grid { display: grid; gap: 8pt; }
    .cols-3 { grid-template-columns: repeat(3, 1fr); }
    .cols-6 { grid-template-columns: repeat(6, 1fr); }
    .stat-box { border: 1px solid #999; border-radius: 6pt; padding: 6pt; text-align: center; }
    .stat-box .label { font-size: 8pt; text-transform: uppercase; color: #555; }
    .stat-box .value { font-size: 18pt; font-weight: bold; font-family: 'Courier New', monospace; }
    .stat-box .mod { font-size: 9pt; color: #777; }
    table { width: 100%; border-collapse: collapse; font-size: 10pt; }
    th, td { border-bottom: 1px solid #ccc; padding: 4pt; text-align: left; }
    th { background: #f5f5f5; font-size: 9pt; text-transform: uppercase; }
    .toolbar { background: #eee; padding: 8pt; border-radius: 4pt; margin-bottom: 12pt; font-size: 10pt; }
    .feature, .spell-row { padding: 4pt 0; border-bottom: 1px dotted #ddd; }
    .feature-name { font-weight: bold; }
    .feature-desc { font-size: 9pt; color: #444; }
  </style>
</head>
<body>
  <div class="toolbar no-print">
    <strong>Tip:</strong> Use your browser's <em>Print → Save as PDF</em> to export this sheet. (Ctrl/Cmd+P)
  </div>

  <h1>${escapeHtml(char.name)}</h1>
  <div class="meta">
    Level ${char.level} ${escapeHtml(char.race)}${char.subrace ? ` (${escapeHtml(char.subrace)})` : ''}
    ${escapeHtml(char.class)}${char.subclass ? ` — ${escapeHtml(char.subclass)}` : ''}
    · ${escapeHtml(char.background ?? '')}${char.alignment ? ` · ${escapeHtml(char.alignment)}` : ''}
  </div>

  <div class="grid cols-3">
    <div class="stat-box"><div class="label">AC</div><div class="value">${char.armor_class}</div></div>
    <div class="stat-box"><div class="label">HP</div><div class="value">${char.current_hp}/${char.max_hp}</div></div>
    <div class="stat-box"><div class="label">Speed</div><div class="value">${char.speed}<span style="font-size:10pt">ft</span></div></div>
  </div>

  <h2>Ability Scores</h2>
  <div class="grid cols-6">
    ${(['strength','dexterity','constitution','intelligence','wisdom','charisma'] as const).map((k) => {
      const v = char[k] as number
      return `<div class="stat-box"><div class="label">${k.slice(0,3).toUpperCase()}</div><div class="value">${v}</div><div class="mod">${fmt(mod(v))}</div></div>`
    }).join('')}
  </div>

  <h2>Saving Throws & Skills</h2>
  <table>
    <thead><tr><th>Save / Skill</th><th>Bonus</th></tr></thead>
    <tbody>
      ${(['strength','dexterity','constitution','intelligence','wisdom','charisma'] as const).map((k) => {
        const prof = (char.proficiencies?.saving_throws ?? []).map((s: string) => s.toLowerCase()).includes(k)
        const bonus = mod(char[k] as number) + (prof ? char.proficiency_bonus : 0)
        return `<tr><td>${k} save${prof ? ' (prof)' : ''}</td><td>${fmt(bonus)}</td></tr>`
      }).join('')}
      ${Object.entries(char.proficiencies?.skills ?? {}).filter(([, v]) => v).map(([sk]) => `<tr><td>${escapeHtml(sk)}</td><td>(prof)</td></tr>`).join('')}
    </tbody>
  </table>

  ${char.features?.length ? `
    <h2>Features & Traits</h2>
    ${char.features.map((f: { name: string; uses_max?: number; uses_remaining?: number; recharge?: string; description?: string }) => `
      <div class="feature">
        <div class="feature-name">${escapeHtml(f.name)}${f.uses_max ? ` <span style="color:#777;font-size:9pt">(${f.uses_remaining ?? 0}/${f.uses_max} ${f.recharge ?? ''})</span>` : ''}</div>
        <div class="feature-desc">${escapeHtml(f.description ?? '')}</div>
      </div>
    `).join('')}
  ` : ''}

  ${char.feats?.length ? `
    <h2>Feats</h2>
    ${char.feats.map((f: { name: string; description?: string }) => `
      <div class="feature">
        <div class="feature-name">${escapeHtml(f.name)}</div>
        <div class="feature-desc">${escapeHtml(f.description ?? '')}</div>
      </div>
    `).join('')}
  ` : ''}

  ${char.spellcasting?.spells_known?.length ? `
    <h2>Spells</h2>
    <table>
      <thead><tr><th>Lv</th><th>Name</th><th>School</th><th>Notes</th></tr></thead>
      <tbody>
        ${char.spellcasting.spells_known.map((sp: { level: number; name: string; school?: string; prepared?: boolean; concentration?: boolean; ritual?: boolean; casting_time?: string }) => `
          <tr>
            <td>${sp.level}</td>
            <td>${escapeHtml(sp.name)}${sp.prepared ? ' ✓' : ''}</td>
            <td>${escapeHtml(sp.school ?? '')}</td>
            <td>${escapeHtml(sp.casting_time ?? '')}${sp.concentration ? ' · CONC' : ''}${sp.ritual ? ' · RIT' : ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}

  ${char.inventory?.weapons?.length ? `
    <h2>Weapons</h2>
    <table>
      <thead><tr><th>Name</th><th>Damage</th><th>Properties</th></tr></thead>
      <tbody>
        ${char.inventory.weapons.map((w: { name: string; equipped?: boolean; damage?: string; damage_type?: string; properties?: string[] }) => `
          <tr>
            <td>${escapeHtml(w.name)}${w.equipped ? ' ⚔' : ''}</td>
            <td>${escapeHtml(w.damage ?? '')} ${escapeHtml(w.damage_type ?? '')}</td>
            <td>${(w.properties ?? []).map(escapeHtml).join(', ')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}

  ${char.inventory?.items?.length ? `
    <h2>Inventory</h2>
    <table>
      <thead><tr><th>Item</th><th>Qty</th><th>Notes</th></tr></thead>
      <tbody>
        ${char.inventory.items.map((it: { name: string; quantity?: number; description?: string }) => `
          <tr>
            <td>${escapeHtml(it.name)}</td>
            <td>${it.quantity ?? 1}</td>
            <td>${escapeHtml(it.description ?? '')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}

  ${char.backstory ? `<h2>Backstory</h2><p style="font-size:10pt;white-space:pre-wrap">${escapeHtml(char.backstory)}</p>` : ''}

  <script>
    // Auto-trigger the print dialog when the page loads if ?print=1 is in the URL.
    if (window.location.search.includes('print=1')) {
      window.addEventListener('load', () => setTimeout(() => window.print(), 200))
    }
  </script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function escapeHtml(s: unknown): string {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
