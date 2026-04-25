import { NextResponse } from 'next/server'
import type { ZodType } from 'zod'

/**
 * Parse and validate a JSON request body against a Zod schema.
 *
 * Usage:
 *   const parsed = await parseBody(request, MySchema)
 *   if (!parsed.ok) return parsed.response
 *   const data = parsed.data
 */
export type ParseSuccess<T> = { ok: true; data: T }
export type ParseFailure = { ok: false; response: NextResponse }

export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>
): Promise<ParseSuccess<T> | ParseFailure> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Request body must be valid JSON' },
        { status: 400 }
      ),
    }
  }

  const result = schema.safeParse(raw)
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({
      path: i.path.join('.') || '(root)',
      message: i.message,
    }))
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Invalid request body', issues },
        { status: 400 }
      ),
    }
  }

  return { ok: true, data: result.data }
}
