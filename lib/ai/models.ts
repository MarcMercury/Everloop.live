/**
 * Central registry of AI model IDs. Override per environment (e.g. to trial a
 * newer model on a Vercel preview) without touching feature code.
 */
export const AI_MODELS = {
  /** Default chat/completion model for narration, analysis, and assistants. */
  text: process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini',
  /** Higher-quality model for long-form canon writing. */
  textPremium: process.env.OPENAI_PREMIUM_TEXT_MODEL || 'gpt-4o',
  /** OpenAI image model used by covers, portraits, maps, and scene art. */
  image: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
  /**
   * Embedding model. Deliberately NOT overridable: canon_entities.embedding is
   * a 1536-dim pgvector column, so changing models requires re-embedding.
   */
  embedding: 'text-embedding-3-small',
  /**
   * Gemini :generateContent image models, tried in order. Override with a
   * comma-separated GEMINI_IMAGE_MODELS. Check what a key can reach via
   * GET /api/admin/gemini-models.
   */
  geminiImage: listFromEnv('GEMINI_IMAGE_MODELS', [
    'gemini-3.1-flash-image',
    'gemini-3-pro-image',
    'gemini-2.5-flash-image',
  ]),
  /** Imagen :predict models (paid tier). Off by default; set GEMINI_IMAGEN_MODELS to enable. */
  imagen: listFromEnv('GEMINI_IMAGEN_MODELS', []),
} as const

function listFromEnv(name: string, fallback: string[]): readonly string[] {
  const raw = process.env[name]
  if (!raw) return fallback
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean)
  return list.length ? list : fallback
}
