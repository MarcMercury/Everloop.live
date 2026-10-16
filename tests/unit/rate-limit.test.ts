import { describe, expect, it, vi } from 'vitest'
import { consumeRateLimit, rateLimitError, RATE_LIMITS } from '@/lib/rate-limit'

type RpcResult = { data: unknown; error: { message: string } | null }

function fakeClient(rpc: () => RpcResult) {
  return { rpc: vi.fn(async () => rpc()) } as unknown as Parameters<typeof consumeRateLimit>[0]
}

describe('consumeRateLimit', () => {
  it('uses the database verdict when the RPC succeeds', async () => {
    const client = fakeClient(() => ({ data: { allowed: false, remaining: 0, retry_after_seconds: 42 }, error: null }))
    await expect(consumeRateLimit(client, 'u', 'ai:text', 'test')).resolves.toEqual({
      ok: false, remaining: 0, retryAfterSeconds: 42,
    })
  })

  it('falls back to an in-memory window when the RPC is missing', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const client = fakeClient(() => ({ data: null, error: { message: 'function does not exist' } }))
    const { limit } = RATE_LIMITS['ai:3d']
    for (let i = 0; i < limit; i++) {
      expect((await consumeRateLimit(client, 'mem-user', 'ai:3d', 'test')).ok).toBe(true)
    }
    const blocked = await consumeRateLimit(client, 'mem-user', 'ai:3d', 'test')
    expect(blocked.ok).toBe(false)
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
    // Other users are unaffected.
    expect((await consumeRateLimit(client, 'other-user', 'ai:3d', 'test')).ok).toBe(true)
  })
})

describe('rateLimitError', () => {
  it('returns a friendly message only when blocked', async () => {
    const allowed = fakeClient(() => ({ data: { allowed: true, remaining: 5, retry_after_seconds: 0 }, error: null }))
    const blocked = fakeClient(() => ({ data: { allowed: false, remaining: 0, retry_after_seconds: 125 }, error: null }))
    expect(await rateLimitError(allowed, 'u', 'ai:text', 'x')).toBeNull()
    expect(await rateLimitError(blocked, 'u', 'ai:text', 'x')).toMatch(/about 3 minutes/)
  })
})
