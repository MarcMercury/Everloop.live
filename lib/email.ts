import 'server-only'

/**
 * Transactional email via the Resend REST API (domain everloop.live is already
 * verified — see .env.example). No-ops with a warning when RESEND_API_KEY is
 * unset so local/dev environments never fail on email.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://everloop.live').replace(/\/$/, '')
const FROM = process.env.EMAIL_FROM || 'Everloop <noreply@everloop.live>'

export interface SendEmailInput {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set; skipping email:', input.subject)
    return { ok: false, error: 'Email not configured' }
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [input.to], subject: input.subject, html: input.html, text: input.text }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error('[email] Resend error', res.status, body.slice(0, 300))
      return { ok: false, error: `Resend HTTP ${res.status}` }
    }
    return { ok: true }
  } catch (err) {
    console.error('[email] send failed:', err)
    return { ok: false, error: err instanceof Error ? err.message : 'send failed' }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export type StoryReviewDecision = 'approve' | 'request_revision' | 'reject'

const DECISION_COPY: Record<StoryReviewDecision, { subject: string; lead: string; cta: string; path: (slug: string) => string }> = {
  approve: {
    subject: 'Your story has entered the Canon',
    lead: 'has been woven into the Everloop. It is now part of the living Canon and readable in the Library.',
    cta: 'Read it in the Library',
    path: (slug) => `/stories/${slug}`,
  },
  request_revision: {
    subject: 'Revisions requested for your story',
    lead: 'was reviewed by the Lorekeepers, who have asked for a few revisions before it can join the Canon.',
    cta: 'Open your dashboard',
    path: () => '/dashboard',
  },
  reject: {
    subject: 'An update on your Canon submission',
    lead: 'was reviewed by the Lorekeepers and was not accepted into the Canon this time.',
    cta: 'Open your dashboard',
    path: () => '/dashboard',
  },
}

export function storyReviewEmail(input: {
  decision: StoryReviewDecision
  storyTitle: string
  storySlug: string
  feedback?: string | null
}): Omit<SendEmailInput, 'to'> {
  const copy = DECISION_COPY[input.decision]
  const url = `${SITE_URL}${copy.path(input.storySlug)}`
  const title = escapeHtml(input.storyTitle)
  const feedback = input.feedback?.trim()
  const html = `<!doctype html><html><body style="margin:0;background:#0d1a1a;font-family:Georgia,serif;color:#e8dcc4">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
  <p style="color:#d4a84b;letter-spacing:.2em;font-size:12px;text-transform:uppercase;margin:0 0 24px">Everloop</p>
  <h1 style="font-weight:normal;font-size:24px;margin:0 0 16px">${escapeHtml(copy.subject)}</h1>
  <p style="line-height:1.6;margin:0 0 16px"><em>${title}</em> ${copy.lead}</p>
  ${feedback ? `<blockquote style="border-left:2px solid #d4a84b;margin:0 0 24px;padding:8px 16px;color:#c8bca4;white-space:pre-wrap">${escapeHtml(feedback)}</blockquote>` : ''}
  <a href="${url}" style="display:inline-block;background:#d4a84b;color:#0d1a1a;text-decoration:none;padding:10px 20px;border-radius:6px;font-family:Arial,sans-serif;font-size:14px">${copy.cta}</a>
</div></body></html>`
  const text = `${copy.subject}\n\n"${input.storyTitle}" ${copy.lead}\n${feedback ? `\nFeedback:\n${feedback}\n` : ''}\n${copy.cta}: ${url}\n`
  return { subject: copy.subject, html, text }
}
