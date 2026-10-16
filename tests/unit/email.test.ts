import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendEmail, storyReviewEmail } from '@/lib/email'

describe('storyReviewEmail', () => {
  it('escapes user-controlled title and feedback in HTML', () => {
    const email = storyReviewEmail({
      decision: 'reject',
      storyTitle: '<script>alert(1)</script>',
      storySlug: 'x',
      feedback: '<img src=x onerror=alert(1)>',
    })
    expect(email.html).not.toContain('<script>')
    expect(email.html).not.toContain('<img')
    expect(email.html).toContain('&lt;script&gt;')
    expect(email.text).toContain('<script>alert(1)</script>')
  })

  it('links approved stories to the library page', () => {
    const email = storyReviewEmail({ decision: 'approve', storyTitle: 'The Bell Tree', storySlug: 'the-bell-tree' })
    expect(email.subject).toMatch(/Canon/)
    expect(email.html).toContain('/stories/the-bell-tree')
  })
})

describe('sendEmail', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('no-ops without an API key', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    expect(await sendEmail({ to: 'a@b.c', subject: 's', html: 'h', text: 't' })).toEqual({ ok: false, error: 'Email not configured' })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('posts to Resend when configured', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test')
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
    expect(await sendEmail({ to: 'a@b.c', subject: 's', html: 'h', text: 't' })).toEqual({ ok: true })
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.resend.com/emails')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer re_test')
  })
})
