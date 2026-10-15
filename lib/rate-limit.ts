import 'server-only'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Per-user rate limiting for paid third-party APIs (OpenAI, Gemini, Meshy,
 * ElevenLabs). Backed by the `consume_rate_limit` Postgres RPC so limits hold
 * across serverless instances and every paid call is logged to
 * `api_usage_events` for cost reporting. Falls back to a per-instance
 * in-memory window if the migration has not been applied.
 */
export const RATE_LIMITS = {
  'ai:text': { limit: 60, windowSeconds: 60 * 60 },
  'ai:image': { limit: 20, windowSeconds: 60 * 60 },
  'ai:3d': { limit: 10, windowSeconds: 24 * 60 * 60 },
  'ai:audio': { limit: 60, windowSeconds: 60 * 60 },
} as const

export type RateLimitBucket = keyof typeof RATE_LIMITS

export interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfterSeconds: number
}

type Client = SupabaseClient<Database>

const memoryWindows = new Map<string, number[]>()

function consumeInMemory(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now()
  const windowStart = now - windowSeconds * 1000
  const hits = (memoryWindows.get(key) ?? []).filter((t) => t > windowStart)
  if (hits.length >= limit) {
    memoryWindows.set(key, hits)
    return { ok: false, remaining: 0, retryAfterSeconds: Math.ceil((hits[0] + windowSeconds * 1000 - now) / 1000) }
  }
  hits.push(now)
  memoryWindows.set(key, hits)
  return { ok: true, remaining: limit - hits.length, retryAfterSeconds: 0 }
}

/**
 * Record one call against `bucket` for the signed-in user and report whether
 * it is allowed. `feature` is stored for usage reporting (e.g. 'portrait').
 */
export async function consumeRateLimit(
  supabase: Client,
  userId: string,
  bucket: RateLimitBucket,
  feature: string,
): Promise<RateLimitResult> {
  const { limit, windowSeconds } = RATE_LIMITS[bucket]
  const { data, error } = await supabase.rpc('consume_rate_limit', {
    p_bucket: bucket,
    p_feature: feature,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  })
  if (!error && data) {
    const row = data as { allowed: boolean; remaining: number; retry_after_seconds: number }
    return { ok: row.allowed, remaining: row.remaining, retryAfterSeconds: row.retry_after_seconds }
  }
  if (error) console.warn('[rate-limit] RPC unavailable, using in-memory window:', error.message)
  return consumeInMemory(`${userId}:${bucket}`, limit, windowSeconds)
}

/** Route-handler helper: returns a 429 response when the caller is over the limit. */
export async function rateLimitResponse(
  supabase: Client,
  userId: string,
  bucket: RateLimitBucket,
  feature: string,
): Promise<NextResponse | null> {
  const result = await consumeRateLimit(supabase, userId, bucket, feature)
  if (result.ok) return null
  return NextResponse.json(
    {
      error: 'Rate limit reached for this feature. Please try again later.',
      retryAfterSeconds: result.retryAfterSeconds,
    },
    { status: 429, headers: { 'Retry-After': String(result.retryAfterSeconds) } },
  )
}

/** Server-action helper: returns an error message when over the limit, otherwise null. */
export async function rateLimitError(
  supabase: Client,
  userId: string,
  bucket: RateLimitBucket,
  feature: string,
): Promise<string | null> {
  const result = await consumeRateLimit(supabase, userId, bucket, feature)
  if (result.ok) return null
  const minutes = Math.max(1, Math.ceil(result.retryAfterSeconds / 60))
  return `Rate limit reached. Please try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`
}
