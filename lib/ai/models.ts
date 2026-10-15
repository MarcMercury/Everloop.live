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
} as const
