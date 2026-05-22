/**
 * Quest Print Pipeline.
 *
 * Renders a printable HTML document for a quest, in the spirit of DDEX
 * modules and Homebrewery one-shots: cover page, table of contents, scene
 * cards with boxed read-aloud text, stat blocks, treasure, and a final
 * GM appendix. The HTML uses pure CSS (no external dependencies) and is
 * designed to be sent to the browser's print-to-PDF.
 *
 * Inputs come from the existing `campaigns`, `campaign_scenes`, `campaign_npcs`
 * and `narrative_idols` tables — the same data that the Quest Builder writes.
 */

import type { Campaign, CampaignScene, CampaignNpc, NarrativeIdol } from '@/types/campaign'

export interface QuestPrintInput {
  quest: Campaign
  scenes: CampaignScene[]
  npcs: CampaignNpc[]
  idols: NarrativeIdol[]
}

function escapeHtml(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function paragraphs(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
    .join('\n')
}

function renderSceneCard(scene: CampaignScene, npcs: CampaignNpc[]): string {
  const sceneNpcs = npcs.filter((n) => n.current_scene_id === scene.id)
  const atmosphere = scene.atmosphere
  return `
<section class="scene">
  <header class="scene-header">
    <div class="scene-order">Scene ${scene.scene_order}</div>
    <h2>${escapeHtml(scene.title)}</h2>
    <div class="scene-meta">
      <span class="badge type">${escapeHtml(scene.scene_type)}</span>
      <span class="badge mood">${escapeHtml(scene.mood)}</span>
      ${atmosphere?.lighting ? `<span class="badge">${escapeHtml(atmosphere.lighting)}</span>` : ''}
      ${atmosphere?.time_of_day ? `<span class="badge">${escapeHtml(atmosphere.time_of_day)}</span>` : ''}
    </div>
  </header>

  ${
    scene.narration
      ? `<div class="boxed-text">
          <div class="boxed-label">Read Aloud</div>
          ${paragraphs(scene.narration)}
        </div>`
      : ''
  }

  ${
    scene.description
      ? `<div class="gm-block">
          <h3>Setup &amp; Area</h3>
          ${paragraphs(scene.description)}
        </div>`
      : ''
  }

  ${
    scene.map_url
      ? `<figure class="scene-map">
          <img src="${escapeHtml(scene.map_url)}" alt="Map of ${escapeHtml(scene.title)}" />
          <figcaption>Map</figcaption>
        </figure>`
      : ''
  }

  ${
    sceneNpcs.length > 0
      ? `<div class="npc-block">
          <h3>Key NPCs &amp; Creatures</h3>
          ${sceneNpcs.map(renderNpc).join('\n')}
        </div>`
      : ''
  }

  ${
    scene.dm_notes
      ? `<div class="gm-notes">
          <h3>GM Notes</h3>
          ${paragraphs(scene.dm_notes)}
        </div>`
      : ''
  }
</section>
`
}

function renderNpc(npc: CampaignNpc): string {
  const stats = npc.stats
  return `
<article class="statblock">
  <header>
    <h4>${escapeHtml(npc.name)}</h4>
    <div class="statblock-meta">${escapeHtml(npc.npc_type)}${
    npc.is_alive ? '' : ' &middot; deceased'
  }</div>
  </header>
  ${npc.description ? `<p class="npc-desc">${escapeHtml(npc.description)}</p>` : ''}
  ${
    stats
      ? `<dl class="stats">
          <dt>HP</dt><dd>${stats.hp ?? '?'} / ${stats.max_hp ?? '?'}</dd>
          <dt>AC</dt><dd>${stats.ac ?? '?'}</dd>
          <dt>Attack</dt><dd>+${stats.attack_bonus ?? 0}</dd>
          <dt>Damage</dt><dd>${escapeHtml(stats.damage ?? '\u2014')}</dd>
        </dl>
        ${
          stats.abilities && stats.abilities.length
            ? `<div class="abilities"><strong>Abilities:</strong> ${stats.abilities
                .map(escapeHtml)
                .join(', ')}</div>`
            : ''
        }`
      : ''
  }
  ${npc.motivations ? `<p><strong>Motivations:</strong> ${escapeHtml(npc.motivations)}</p>` : ''}
  ${npc.secrets ? `<p><strong>Secrets (GM only):</strong> ${escapeHtml(npc.secrets)}</p>` : ''}
</article>
`
}

function renderIdol(idol: NarrativeIdol): string {
  return `
<li class="idol">
  <div class="idol-name">${escapeHtml(idol.name)} <span class="idol-type">(${escapeHtml(idol.idol_type)})</span></div>
  ${idol.description ? `<div class="idol-desc">${escapeHtml(idol.description)}</div>` : ''}
  <div class="idol-power"><strong>Power:</strong> ${escapeHtml(String(idol.power))}</div>
</li>
`
}

export function renderQuestPrintHtml(input: QuestPrintInput): string {
  const { quest, scenes, npcs, idols } = input
  const orderedScenes = [...scenes].sort((a, b) => a.scene_order - b.scene_order)
  const styles = `
:root {
  --ink: #2a1810;
  --parchment: #f6efdc;
  --gold: #b48c39;
  --teal: #1e524a;
  --rule: #c4a86f;
}
* { box-sizing: border-box; }
html, body {
  margin: 0;
  font-family: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
  color: var(--ink);
  background: var(--parchment);
}
.page {
  max-width: 7.5in;
  margin: 0 auto;
  padding: 0.6in 0.7in;
}
.cover {
  min-height: 9.5in;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  border: 6px double var(--gold);
  padding: 1in 0.5in;
  page-break-after: always;
}
.cover .eyebrow { letter-spacing: 0.3em; text-transform: uppercase; color: var(--teal); font-size: 12pt; }
.cover h1 { font-size: 36pt; margin: 0.4em 0 0.2em; }
.cover .subtitle { font-style: italic; color: #5a4632; max-width: 5.5in; margin: 0.5em auto; }
.cover .meta { margin-top: 1.5em; font-size: 11pt; color: var(--teal); }
.toc { page-break-after: always; }
.toc ol { padding-left: 1.2em; line-height: 1.8; }
.scene { page-break-after: always; }
.scene-header { border-bottom: 2px solid var(--rule); padding-bottom: 0.4em; margin-bottom: 0.8em; }
.scene-order { font-size: 9pt; letter-spacing: 0.2em; text-transform: uppercase; color: var(--teal); }
.scene h2 { margin: 0.1em 0 0.3em; font-size: 22pt; }
.scene-meta { display: flex; gap: 0.4em; flex-wrap: wrap; }
.badge { font-size: 9pt; padding: 0.15em 0.6em; border: 1px solid var(--rule); border-radius: 999px; background: rgba(180,140,57,0.08); }
.badge.type { background: var(--teal); color: var(--parchment); border-color: var(--teal); }
.boxed-text {
  border-left: 4px solid var(--gold);
  background: rgba(180,140,57,0.08);
  padding: 0.8em 1em;
  margin: 1em 0;
  font-size: 11.5pt;
  line-height: 1.45;
}
.boxed-label {
  font-size: 8.5pt; letter-spacing: 0.25em; text-transform: uppercase;
  color: var(--teal); margin-bottom: 0.4em;
}
.gm-block, .gm-notes, .npc-block { margin: 1em 0; }
.gm-notes { background: rgba(30,82,74,0.05); border-left: 3px solid var(--teal); padding: 0.6em 0.9em; }
h3 { font-size: 13pt; color: var(--teal); border-bottom: 1px solid var(--rule); padding-bottom: 0.15em; margin: 1em 0 0.4em; }
.statblock {
  border: 1.5px solid var(--rule);
  background: #fcf6e3;
  padding: 0.7em 0.9em;
  margin: 0.6em 0;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.05);
}
.statblock h4 { margin: 0; font-size: 14pt; color: #8a1c1c; }
.statblock-meta { font-size: 9pt; letter-spacing: 0.15em; text-transform: uppercase; color: var(--teal); }
.statblock dl.stats {
  display: grid;
  grid-template-columns: max-content 1fr max-content 1fr;
  gap: 0.2em 0.8em;
  margin: 0.5em 0;
  font-size: 10.5pt;
}
.statblock dt { font-weight: 600; color: var(--teal); }
.statblock dd { margin: 0; }
.abilities { font-size: 10.5pt; }
.scene-map { text-align: center; margin: 0.8em 0; }
.scene-map img { max-width: 100%; max-height: 5in; border: 1px solid var(--rule); }
.scene-map figcaption { font-size: 9pt; color: var(--teal); margin-top: 0.3em; }
.appendix h2 { font-size: 18pt; border-bottom: 2px solid var(--rule); padding-bottom: 0.2em; }
ul.idols { list-style: none; padding: 0; }
.idol { border: 1px solid var(--rule); padding: 0.6em 0.8em; margin-bottom: 0.5em; background: #fcf6e3; }
.idol-name { font-weight: 600; font-size: 12pt; }
.idol-type { color: var(--teal); font-size: 10pt; }
.idol-power { font-size: 10pt; margin-top: 0.2em; }
@media print {
  .page { padding: 0.4in 0.5in; }
  body { background: white; }
}
`

  const toc = orderedScenes
    .map((s) => `<li>${escapeHtml(s.title)} <span class="toc-type">(${escapeHtml(s.scene_type)})</span></li>`)
    .join('\n')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(quest.title)} — Quest</title>
<style>${styles}</style>
</head>
<body>
  <main class="page">
    <section class="cover">
      <div class="eyebrow">An Everloop Quest</div>
      <h1>${escapeHtml(quest.title)}</h1>
      ${quest.description ? `<div class="subtitle">${escapeHtml(quest.description)}</div>` : ''}
      <div class="meta">
        ${quest.campaign_length ? `<div>Length: ${escapeHtml(String(quest.campaign_length))}</div>` : ''}
        ${quest.tone ? `<div>Tone: ${escapeHtml(String(quest.tone))}</div>` : ''}
        ${quest.difficulty_preset ? `<div>Difficulty: ${escapeHtml(String(quest.difficulty_preset))}</div>` : ''}
        <div>Players: ${quest.max_players}</div>
        ${quest.tags && quest.tags.length ? `<div>Tags: ${quest.tags.map(escapeHtml).join(', ')}</div>` : ''}
      </div>
    </section>

    <section class="toc">
      <h2>Table of Contents</h2>
      <ol>${toc}</ol>
    </section>

    ${orderedScenes.map((s) => renderSceneCard(s, npcs)).join('\n')}

    ${
      idols.length
        ? `<section class="appendix">
            <h2>Narrative Idols</h2>
            <ul class="idols">${idols.map(renderIdol).join('\n')}</ul>
          </section>`
        : ''
    }
  </main>
  <script>
    // Auto-trigger the print dialog if ?print=1 is in the URL.
    if (typeof window !== 'undefined' && /[?&]print=1/.test(window.location.search)) {
      window.addEventListener('load', () => setTimeout(() => window.print(), 400))
    }
  </script>
</body>
</html>`
}
