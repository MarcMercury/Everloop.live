// Art-style options shared by entity image generation (monsters, characters,
// locations, creatures). The id strings here MUST match the keys used by the
// `ENTITY_ART_STYLES` map inside `lib/actions/create.ts` — that file is a
// 'use server' module and cannot export non-async values, so the metadata
// lives here for client UIs to import.

export interface EntityArtStyle {
  id: string
  label: string
  description: string
  preview: string // short emoji glyph
}

export const ENTITY_ART_STYLE_OPTIONS: readonly EntityArtStyle[] = [
  {
    id: 'dark-fantasy',
    label: 'Dark Fantasy',
    description: 'Gothic, atmospheric, brooding',
    preview: '🌑',
  },
  {
    id: 'fantasy-oil',
    label: 'Fantasy Oil',
    description: 'Classic painted fantasy',
    preview: '🎨',
  },
  {
    id: 'realistic',
    label: 'Realistic',
    description: 'Photoreal cinematic detail',
    preview: '📷',
  },
  {
    id: 'watercolor',
    label: 'Watercolor',
    description: 'Soft, ethereal washes',
    preview: '🌊',
  },
  {
    id: 'ink-wash',
    label: 'Ink Wash',
    description: 'Black-and-white sumi-e style',
    preview: '🖋️',
  },
  {
    id: 'comic-book',
    label: 'Comic Book',
    description: 'Bold ink, cel-shaded color',
    preview: '💥',
  },
  {
    id: 'storybook',
    label: 'Storybook',
    description: 'Hand-painted, charming',
    preview: '📖',
  },
] as const

export type EntityArtStyleId = (typeof ENTITY_ART_STYLE_OPTIONS)[number]['id']
