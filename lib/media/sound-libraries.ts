/**
 * Sound Libraries
 * ---------------
 * Curated free / CC-licensed audio sources for live sessions.
 *
 * IMPORTANT: only include URLs that are explicitly free for use under a
 * permissive license (CC0, CC-BY, Pixabay license). Do NOT add YouTube,
 * Spotify, or anything that requires a paid license.
 *
 * The big sources we integrate with:
 *  - **Pixabay** music & SFX (no-attribution license).
 *  - **Freesound.org** (most files CC0 / CC-BY) — via API in
 *    `app/api/media/freesound/search/route.ts`.
 *  - **Tabletop Audio** — CC-BY 4.0 (some tracks). Add curated URLs only.
 *  - **ElevenLabs SFX generation** (already in stack) for one-off custom SFX.
 */

export type SoundLicense = 'CC0' | 'CC-BY' | 'Pixabay' | 'CC-BY-NC' | 'ElevenLabs'

export interface CatalogSound {
  id: string
  title: string
  url: string
  durationSec?: number
  /** What mood/scene-type this fits. Used by the SessionMediaPanel to suggest tracks. */
  moods: string[]
  tags: string[]
  license: SoundLicense
  attribution?: string
}

/**
 * Curated starter catalog. Keep this short and high quality — the Freesound
 * search API covers the long tail. Authors can also paste raw URLs in the
 * Quest Builder.
 *
 * NOTE: the URLs below are placeholders pointing at the user's own /public/audio
 * folder. Drop CC0/Pixabay MP3 files in `public/audio/library/` and they'll
 * show up. We don't ship third-party audio in the repo.
 */
export const CATALOG_AMBIENCE: CatalogSound[] = [
  {
    id: 'tavern-warm',
    title: 'Warm Tavern',
    url: '/audio/library/tavern-warm.mp3',
    moods: ['social', 'rest', 'neutral'],
    tags: ['tavern', 'crowd', 'fireplace'],
    license: 'Pixabay',
  },
  {
    id: 'forest-night',
    title: 'Dark Forest at Night',
    url: '/audio/library/forest-night.mp3',
    moods: ['exploration', 'eerie', 'tense'],
    tags: ['forest', 'wind', 'crickets'],
    license: 'Pixabay',
  },
  {
    id: 'dungeon-drone',
    title: 'Deep Dungeon Drone',
    url: '/audio/library/dungeon-drone.mp3',
    moods: ['dark', 'tense', 'eerie'],
    tags: ['dungeon', 'low', 'drone'],
    license: 'Pixabay',
  },
  {
    id: 'combat-pulse',
    title: 'Combat Pulse',
    url: '/audio/library/combat-pulse.mp3',
    moods: ['combat', 'tense', 'epic'],
    tags: ['battle', 'drums', 'fast'],
    license: 'Pixabay',
  },
  {
    id: 'boss-doom',
    title: 'Boss — Looming Doom',
    url: '/audio/library/boss-doom.mp3',
    moods: ['boss', 'epic', 'dark'],
    tags: ['boss', 'orchestral', 'choir'],
    license: 'Pixabay',
  },
  {
    id: 'mystery-bell',
    title: 'Distant Bell Mystery',
    url: '/audio/library/mystery-bell.mp3',
    moods: ['eerie', 'puzzle', 'neutral'],
    tags: ['bell', 'sparse', 'mysterious'],
    license: 'Pixabay',
  },
]

export const CATALOG_SFX: CatalogSound[] = [
  { id: 'sfx-bell-single',   title: 'Single Bell Toll',   url: '/audio/library/sfx-bell.mp3',     moods: ['*'], tags: ['bell', 'one-shot'], license: 'Pixabay' },
  { id: 'sfx-bell-sequence', title: 'Bell Sequence (5)',  url: '/audio/library/sfx-bell-seq.mp3', moods: ['*'], tags: ['bell', 'puzzle'],   license: 'Pixabay' },
  { id: 'sfx-sword',         title: 'Sword Clash',        url: '/audio/library/sfx-sword.mp3',    moods: ['combat'], tags: ['weapon'],    license: 'Pixabay' },
  { id: 'sfx-spell',         title: 'Magic Burst',        url: '/audio/library/sfx-spell.mp3',    moods: ['combat'], tags: ['magic'],      license: 'Pixabay' },
  { id: 'sfx-door',          title: 'Heavy Door Creak',   url: '/audio/library/sfx-door.mp3',     moods: ['exploration'], tags: ['door'], license: 'Pixabay' },
  { id: 'sfx-roar',          title: 'Beast Roar',         url: '/audio/library/sfx-roar.mp3',     moods: ['boss', 'combat'], tags: ['monster'], license: 'Pixabay' },
  { id: 'sfx-fail',          title: 'Wrong Answer Tone',  url: '/audio/library/sfx-fail.mp3',     moods: ['puzzle'], tags: ['fail'],     license: 'Pixabay' },
  { id: 'sfx-success',       title: 'Reveal / Success',   url: '/audio/library/sfx-success.mp3',  moods: ['puzzle', 'social'], tags: ['success'], license: 'Pixabay' },
]

export function suggestAmbienceFor(mood: string | null | undefined): CatalogSound[] {
  if (!mood) return CATALOG_AMBIENCE
  return CATALOG_AMBIENCE.filter(s => s.moods.includes(mood) || s.moods.includes('*'))
}

export function suggestSfxFor(mood: string | null | undefined): CatalogSound[] {
  if (!mood) return CATALOG_SFX
  return CATALOG_SFX.filter(s => s.moods.includes(mood) || s.moods.includes('*'))
}
